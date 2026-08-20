/**
 * Supabase Edge Function: instagram-callback
 *
 * OAuth redirect URI for Meta/Instagram.
 * Keeps META_APP_SECRET server-side — never exposed to the browser.
 *
 * Flow:
 *   1. Meta redirects here with ?code=...&state=...
 *   2. Exchange code for short-lived Facebook user access token
 *   3. Exchange for long-lived token (valid 60 days)
 *   4. Get linked Instagram Business/Creator account via Graph API
 *   5. Save real account data to social_accounts table
 *   6. Redirect back to SocialSync app with result
 *
 * Required Edge Function secrets:
 *   META_APP_ID               — your Meta app ID (same as VITE_META_APP_ID)
 *   META_APP_SECRET           — your Meta app's secret
 *   SUPABASE_URL              — auto-provided
 *   SUPABASE_SERVICE_ROLE_KEY — auto-provided
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const APP_ORIGIN = "https://deew101.github.io/socialsync2.0";

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const FUNCTION_URL = `${Deno.env.get("SUPABASE_URL")}/functions/v1/instagram-callback`;

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state") ?? "";
  const oauthError = url.searchParams.get("error");
  const oauthErrorDescription = url.searchParams.get("error_description");

  const redirectError = (msg: string) =>
    new Response(null, {
      status: 302,
      headers: {
        Location: `${APP_ORIGIN}/#/oauth-callback?platform=instagram&error=${encodeURIComponent(msg)}`,
      },
    });

  if (oauthError) return redirectError(oauthErrorDescription ?? oauthError);
  if (!code) return redirectError("No authorization code received from Meta.");

  const stateParts = state.split(":");
  const userId = stateParts.length >= 3 ? stateParts.slice(2).join(":") : null;

  const appId =
    Deno.env.get("META_APP_ID") ?? Deno.env.get("VITE_META_APP_ID") ?? "";
  const appSecret = Deno.env.get("META_APP_SECRET") ?? "";

  if (!appId || !appSecret) {
    return redirectError(
      "Instagram OAuth credentials not configured. Add META_APP_ID and META_APP_SECRET to Edge Function secrets."
    );
  }

  // Step 1: Exchange code for short-lived Facebook user access token
  let shortLivedToken: string;
  try {
    const tokenRes = await fetch(
      "https://graph.facebook.com/v19.0/oauth/access_token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: appId,
          client_secret: appSecret,
          redirect_uri: FUNCTION_URL,
          code,
        }),
      }
    );

    if (!tokenRes.ok) {
      const body = await tokenRes.text();
      return redirectError(`Token exchange failed: ${body}`);
    }
    const data = await tokenRes.json();
    shortLivedToken = data.access_token;
  } catch (err) {
    return redirectError(`Token exchange error: ${String(err)}`);
  }

  // Step 2: Upgrade to long-lived token (valid 60 days)
  let longLivedToken = shortLivedToken;
  let expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  try {
    const llRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token` +
        `?grant_type=fb_exchange_token` +
        `&client_id=${appId}` +
        `&client_secret=${appSecret}` +
        `&fb_exchange_token=${shortLivedToken}`
    );
    if (llRes.ok) {
      const data = await llRes.json();
      longLivedToken = data.access_token ?? shortLivedToken;
      const expiresIn: number = data.expires_in ?? 5184000;
      expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
    }
  } catch {
    // Non-fatal: use short-lived token as fallback
  }

  // Step 3: Find linked Instagram Business/Creator account
  let igUserId = "";
  let igUsername = "";
  let igFollowers = 0;
  let igProfilePic = "";
  let canPublish = false;
  let publishNote: string | null = null;

  try {
    // Get Facebook pages linked to this account
    const pagesRes = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts` +
        `?fields=id,name,instagram_business_account` +
        `&access_token=${longLivedToken}`
    );
    const pagesData = await pagesRes.json();
    const pages: any[] = pagesData.data ?? [];

    // Find a page with a linked Instagram Business account
    const pageWithIg = pages.find((p: any) => p.instagram_business_account);

    if (pageWithIg?.instagram_business_account?.id) {
      const igId = pageWithIg.instagram_business_account.id;
      const igRes = await fetch(
        `https://graph.facebook.com/v19.0/${igId}` +
          `?fields=id,username,followers_count,profile_picture_url` +
          `&access_token=${longLivedToken}`
      );
      const igData = await igRes.json();
      igUserId = igData.id ?? igId;
      igUsername = igData.username ?? "";
      igFollowers = igData.followers_count ?? 0;
      igProfilePic = igData.profile_picture_url ?? "";
      canPublish = true;
    } else {
      // No Business/Creator account linked to a Facebook page
      // Get basic info for display only
      const meRes = await fetch(
        `https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${longLivedToken}`
      );
      const meData = await meRes.json();
      igUserId = meData.id ?? "";
      igUsername = meData.name ?? "Instagram User";
      canPublish = false;
      publishNote =
        "No Business/Creator account found. Connect your Instagram to a Facebook Page to enable publishing.";
    }
  } catch (err) {
    return redirectError(`Failed to fetch Instagram profile: ${String(err)}`);
  }

  const displayName = igUsername || "Instagram User";

  // Step 4: Save to Supabase
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  if (userId) {
    await supabase.from("social_accounts").upsert(
      {
        user_id: userId,
        platform: "instagram",
        platform_user_id: igUserId,
        handle: igUsername,
        display_name: displayName,
        profile_image_url: igProfilePic || null,
        access_token: longLivedToken,
        expires_at: expiresAt,
        connected: true,
        can_publish: canPublish,
        publish_note: publishNote,
        followers_count: igFollowers,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,platform" }
    );
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location:
        `${APP_ORIGIN}/#/oauth-callback` +
        `?success=true` +
        `&platform=instagram` +
        `&display_name=${encodeURIComponent(displayName)}`,
    },
  });
});
