/**
 * Supabase Edge Function: instagram-callback
 *
 * OAuth redirect URI for Instagram.
 * Supports modern Instagram API with Instagram Login, with fallback to Facebook Graph API.
 * Keeps META_APP_SECRET server-side — never exposed to the browser.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const APP_ORIGIN = "https://deew101.github.io/socialsync2.0";

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const FUNCTION_URL = `${Deno.env.get("SUPABASE_URL")}/functions/v1/instagram-callback`;

  const rawCode = url.searchParams.get("code");
  // Instagram OAuth quirk: strip trailing #_ if present
  const code = rawCode ? rawCode.replace(/#_$/, "") : null;
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
  if (!code) return redirectError("No authorization code received from Instagram.");

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

  let accessToken = "";
  let expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();
  let igUserId = "";
  let igUsername = "";
  let igFollowers: number | null = null;
  let igProfilePic = "";
  let canPublish = true;
  let publishNote: string | null = null;

  // Step 1: Attempt code exchange via Instagram OAuth endpoint (modern Instagram API)
  let usedInstagramApi = false;
  try {
    const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: appId,
        client_secret: appSecret,
        grant_type: "authorization_code",
        redirect_uri: FUNCTION_URL,
        code,
      }),
    });

    if (tokenRes.ok) {
      const data = await tokenRes.json();
      const shortLivedToken = data.access_token;
      igUserId = String(data.user_id ?? "");
      usedInstagramApi = true;

      // Upgrade to 60-day long-lived token via graph.instagram.com
      try {
        const llRes = await fetch(
          `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${encodeURIComponent(appSecret)}&access_token=${encodeURIComponent(shortLivedToken)}`
        );
        if (llRes.ok) {
          const llData = await llRes.json();
          accessToken = llData.access_token ?? shortLivedToken;
          const expiresIn: number = llData.expires_in ?? 5184000;
          expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
        } else {
          accessToken = shortLivedToken;
        }
      } catch {
        accessToken = shortLivedToken;
      }

      // Fetch user profile from Instagram Graph API
      try {
        const meRes = await fetch(
          `https://graph.instagram.com/v21.0/me?fields=user_id,username,name,profile_picture_url,account_type&access_token=${encodeURIComponent(accessToken)}`
        );
        if (meRes.ok) {
          const meData = await meRes.json();
          igUserId = meData.id ?? meData.user_id ?? igUserId;
          igUsername = meData.username ?? meData.name ?? "Instagram User";
          igProfilePic = meData.profile_picture_url ?? "";
          if (meData.account_type && meData.account_type !== "BUSINESS" && meData.account_type !== "CREATOR") {
            canPublish = false;
            publishNote = "Personal account detected. Upgrade to Creator or Business in Instagram settings to enable publishing.";
          }
        }
      } catch (err) {
        console.warn("Instagram profile fetch error:", err);
      }
    }
  } catch (err) {
    console.warn("api.instagram.com error:", err);
  }

  // Step 2: Fallback to Facebook Graph API if Instagram direct exchange didn't succeed
  if (!usedInstagramApi) {
    try {
      const fbTokenRes = await fetch("https://graph.facebook.com/v19.0/oauth/access_token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: appId,
          client_secret: appSecret,
          redirect_uri: FUNCTION_URL,
          code,
        }),
      });

      if (!fbTokenRes.ok) {
        const body = await fbTokenRes.text();
        return redirectError(`Token exchange failed: ${body}`);
      }

      const fbData = await fbTokenRes.json();
      const shortLived = fbData.access_token;
      accessToken = shortLived;

      // Upgrade to long-lived
      try {
        const llRes = await fetch(
          `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLived}`
        );
        if (llRes.ok) {
          const llData = await llRes.json();
          accessToken = llData.access_token ?? shortLived;
          const expiresIn: number = llData.expires_in ?? 5184000;
          expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
        }
      } catch {
        // use short lived token
      }

      // Check linked IG business account
      const pagesRes = await fetch(
        `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,instagram_business_account&access_token=${accessToken}`
      );
      const pagesData = await pagesRes.json();
      const pages: any[] = pagesData.data ?? [];
      const pageWithIg = pages.find((p: any) => p.instagram_business_account);

      if (pageWithIg?.instagram_business_account?.id) {
        const igId = pageWithIg.instagram_business_account.id;
        const igRes = await fetch(
          `https://graph.facebook.com/v19.0/${igId}?fields=id,username,followers_count,profile_picture_url&access_token=${accessToken}`
        );
        const igData = await igRes.json();
        igUserId = igData.id ?? igId;
        igUsername = igData.username ?? "";
        igFollowers = igData.followers_count ?? null;
        igProfilePic = igData.profile_picture_url ?? "";
        canPublish = true;
      } else {
        const meRes = await fetch(
          `https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${accessToken}`
        );
        const meData = await meRes.json();
        igUserId = meData.id ?? "";
        igUsername = meData.name ?? "Instagram User";
        canPublish = false;
        publishNote = "No Business/Creator account found. Link Instagram to a Facebook Page to enable publishing.";
      }
    } catch (fbErr) {
      return redirectError(`Authentication failed: ${String(fbErr)}`);
    }
  }

  const displayName = igUsername || "Instagram User";

  // Step 3: Save to Supabase
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  if (!userId) {
    return redirectError(
      "User ID was missing from OAuth state. Please ensure you are logged into SocialSync before connecting."
    );
  }

  const { error: dbError } = await supabase.from("social_accounts").upsert(
    {
      user_id: userId,
      platform: "instagram",
      platform_user_id: igUserId || null,
      handle: igUsername || displayName,
      display_name: displayName,
      profile_image_url: igProfilePic || null,
      access_token: accessToken,
      expires_at: expiresAt,
      connected: true,
      can_publish: canPublish,
      publish_note: publishNote,
      followers_count: igFollowers,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,platform" }
  );

  if (dbError) {
    console.error("DB upsert error:", dbError.message);
    return redirectError(`Database error saving account: ${dbError.message}`);
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
