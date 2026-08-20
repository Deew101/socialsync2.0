import { supabase, isSupabaseConfigured } from "./supabase";

// ─── LinkedIn ──────────────────────────────────────────────────────────────────

export function getLinkedInClientId(): string {
  return import.meta.env.VITE_LINKEDIN_CLIENT_ID ?? "";
}

/**
 * Begins the LinkedIn OAuth 2.0 flow.
 * The redirect URI points to the Supabase Edge Function which keeps the
 * client_secret server-side. The state encodes platform + nonce + userId
 * so the Edge Function knows which user to save the account against.
 */
export function initiateLinkedInOAuth(userId: string) {
  const clientId = getLinkedInClientId();
  if (!clientId) {
    throw new Error(
      "LinkedIn Client ID is not configured. Add VITE_LINKEDIN_CLIENT_ID to your GitHub Secrets."
    );
  }

  const nonce = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  const state = `linkedin:${nonce}:${userId}`;
  sessionStorage.setItem("oauth_state", state);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
  const redirectUri = `${supabaseUrl}/functions/v1/linkedin-callback`;

  const scope = encodeURIComponent("openid profile email w_member_social");
  const authUrl =
    `https://www.linkedin.com/oauth/v2/authorization` +
    `?response_type=code` +
    `&client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${encodeURIComponent(state)}` +
    `&scope=${scope}`;

  window.location.href = authUrl;
}

// ─── Instagram ─────────────────────────────────────────────────────────────────

export function getMetaAppId(): string {
  return import.meta.env.VITE_META_APP_ID ?? "";
}

/**
 * Begins the Meta/Instagram OAuth 2.0 flow.
 * Requires a Business or Creator Instagram account linked to a Facebook Page
 * for Content Publishing API access.
 */
export function initiateInstagramOAuth(userId: string) {
  const appId = getMetaAppId();
  if (!appId) {
    throw new Error(
      "Meta App ID is not configured. Add VITE_META_APP_ID to your GitHub Secrets."
    );
  }

  const nonce = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  const state = `instagram:${nonce}:${userId}`;
  sessionStorage.setItem("oauth_state", state);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
  const redirectUri = `${supabaseUrl}/functions/v1/instagram-callback`;

  const scope = [
    "instagram_basic",
    "instagram_content_publish",
    "pages_show_list",
    "pages_read_engagement",
  ].join(",");

  const authUrl =
    `https://www.facebook.com/v19.0/dialog/oauth` +
    `?client_id=${encodeURIComponent(appId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${encodeURIComponent(state)}` +
    `&scope=${encodeURIComponent(scope)}` +
    `&response_type=code`;

  window.location.href = authUrl;
}

// X/Twitter removed — posting requires a paid X API plan ($100/month minimum).
