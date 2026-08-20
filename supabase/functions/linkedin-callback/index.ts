/**
 * Supabase Edge Function: linkedin-callback
 *
 * This is the OAuth redirect URI registered with LinkedIn Developer App.
 * It runs server-side so LINKEDIN_CLIENT_SECRET never touches the browser.
 *
 * Flow:
 *   1. LinkedIn redirects here with ?code=...&state=...
 *   2. Exchange code for real access token (server-side)
 *   3. Call LinkedIn /v2/userinfo for real profile (name, email, picture)
 *   4. Upsert to social_accounts table with real data
 *   5. Redirect back to app with ?success=true&display_name=...
 *
 * Required Supabase Edge Function secrets (Dashboard → Edge Functions → Secrets):
 *   LINKEDIN_CLIENT_SECRET      — your LinkedIn app's client secret
 *   LINKEDIN_CLIENT_ID          — your LinkedIn app's client ID
 *   SUPABASE_URL                — auto-provided by Supabase
 *   SUPABASE_SERVICE_ROLE_KEY   — auto-provided by Supabase
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const APP_ORIGIN = "https://deew101.github.io/socialsync2.0";

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state") ?? "";
  const oauthError = url.searchParams.get("error");
  const oauthErrorDescription = url.searchParams.get("error_description");

  const FUNCTION_URL = `${Deno.env.get("SUPABASE_URL")}/functions/v1/linkedin-callback`;

  const redirectError = (msg: string) =>
    new Response(null, {
      status: 302,
      headers: {
        Location: `${APP_ORIGIN}/#/oauth-callback?platform=linkedin&error=${encodeURIComponent(msg)}`,
      },
    });

  // 1. Handle OAuth denial / error from LinkedIn
  if (oauthError) {
    return redirectError(oauthErrorDescription ?? oauthError);
  }

  if (!code) {
    return redirectError("No authorization code received from LinkedIn.");
  }

  // 2. Extract userId from state (format: "linkedin:{nonce}:{userId}")
  const stateParts = state.split(":");
  const userId = stateParts.length >= 3 ? stateParts.slice(2).join(":") : null;

  const clientId =
    Deno.env.get("LINKEDIN_CLIENT_ID") ?? Deno.env.get("VITE_LINKEDIN_CLIENT_ID") ?? "";
  const clientSecret = Deno.env.get("LINKEDIN_CLIENT_SECRET") ?? "";

  if (!clientId || !clientSecret) {
    return redirectError(
      "LinkedIn OAuth credentials not configured on the server. Add LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET to Edge Function secrets."
    );
  }

  // 3. Exchange authorization code for real access token (server-side)
  let accessToken: string;
  let expiresAt: string;
  try {
    const tokenRes = await fetch(
      "https://www.linkedin.com/oauth/v2/accessToken",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: FUNCTION_URL,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      }
    );

    if (!tokenRes.ok) {
      const body = await tokenRes.text();
      console.error("LinkedIn token exchange failed:", body);
      return redirectError(`Token exchange failed: ${body}`);
    }

    const tokenData = await tokenRes.json();
    accessToken = tokenData.access_token;
    const expiresIn: number = tokenData.expires_in ?? 5184000; // 60 days
    expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
  } catch (err) {
    return redirectError(`Token exchange error: ${String(err)}`);
  }

  // 4. Fetch real LinkedIn profile via OpenID Connect userinfo endpoint
  let profile: { sub: string; name: string; email?: string; picture?: string };
  try {
    const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileRes.ok) {
      const body = await profileRes.text();
      console.error("LinkedIn profile fetch failed:", body);
      return redirectError(`Failed to fetch LinkedIn profile: ${body}`);
    }

    profile = await profileRes.json();
  } catch (err) {
    return redirectError(`Profile fetch error: ${String(err)}`);
  }

  const displayName = profile.name ?? "LinkedIn User";
  const platformUserId = profile.sub;
  const profileImageUrl = profile.picture ?? null;
  const handle = profile.email
    ? profile.email.split("@")[0]
    : platformUserId;

  // 5. Save real profile to Supabase (service role bypasses RLS for server write)
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  if (userId) {
    const { error: dbError } = await supabase
      .from("social_accounts")
      .upsert(
        {
          user_id: userId,
          platform: "linkedin",
          platform_user_id: platformUserId,
          handle,
          display_name: displayName,
          profile_image_url: profileImageUrl,
          access_token: accessToken,
          expires_at: expiresAt,
          connected: true,
          can_publish: true,
          followers_count: 0, // LinkedIn basic OAuth doesn't provide follower count
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,platform" }
      );

    if (dbError) {
      console.error("DB upsert error:", dbError.message);
      // Non-fatal: redirect with success anyway so the user knows OAuth worked
    }
  }

  // 6. Redirect back to SocialSync app with real display name
  return new Response(null, {
    status: 302,
    headers: {
      Location:
        `${APP_ORIGIN}/#/oauth-callback` +
        `?success=true` +
        `&platform=linkedin` +
        `&display_name=${encodeURIComponent(displayName)}`,
    },
  });
});
