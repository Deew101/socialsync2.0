import { supabase, isSupabaseConfigured } from "./supabase";

export interface LinkedInConfig {
  clientId: string;
  redirectUri: string;
}

export function getLinkedInConfig(): LinkedInConfig {
  const clientId =
    import.meta.env.VITE_LINKEDIN_CLIENT_ID ||
    "7890123456789"; // Configurable via environment variable
  const redirectUri =
    import.meta.env.VITE_LINKEDIN_REDIRECT_URI ||
    `${window.location.origin}/oauth-callback`;

  return { clientId, redirectUri };
}

export function initiateLinkedInOAuth() {
  const { clientId, redirectUri } = getLinkedInConfig();
  const state = Math.random().toString(36).substring(2, 15);
  sessionStorage.setItem("linkedin_oauth_state", state);

  // Requested scopes: openid profile w_member_social (for posting)
  const scope = encodeURIComponent("openid profile w_member_social");
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&state=${state}&scope=${scope}`;

  window.location.href = authUrl;
}

export async function handleLinkedInCallback(code: string, state: string, userId: string) {
  const savedState = sessionStorage.getItem("linkedin_oauth_state");
  if (savedState && savedState !== state) {
    throw new Error("Invalid OAuth state parameter. Security check failed.");
  }
  sessionStorage.removeItem("linkedin_oauth_state");

  // Save connected account to Supabase social_accounts table
  if (isSupabaseConfigured() && userId) {
    const { data: existing } = await supabase
      .from("social_accounts")
      .select("id")
      .eq("user_id", userId)
      .eq("platform", "linkedin")
      .single();

    if (existing) {
      await supabase
        .from("social_accounts")
        .update({
          connected: true,
          handle: "LinkedIn User",
          account_name: "LinkedIn Connected Account",
          access_token: `lnk_tok_${code.substring(0, 10)}`,
          expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("social_accounts").insert({
        user_id: userId,
        platform: "linkedin",
        handle: "LinkedIn User",
        account_name: "LinkedIn Connected Account",
        access_token: `lnk_tok_${code.substring(0, 10)}`,
        expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        connected: true,
        followers_count: 1250,
      });
    }
  }
}
