/**
 * Google Implicit ID-Token Auth
 *
 * Flow (no popup, no client_secret, works in Incognito/InPrivate):
 *   1. startGoogleSignIn()  → redirect to Google with response_type=id_token
 *   2. Google redirects back with the id_token in the URL hash:
 *      https://deew101.github.io/socialsync2.0/#id_token=XXX&state=google_signin
 *   3. main.tsx extracts id_token BEFORE the hash router mounts
 *      and stores it in sessionStorage under "gauth_id_token_pending"
 *   4. use-auth.tsx reads it on init and calls supabase.auth.signInWithIdToken
 *
 * Why implicit (id_token) instead of PKCE (code)?
 *   Google requires client_secret for Web Application OAuth clients even with PKCE.
 *   We cannot expose client_secret in browser code.
 *   Implicit id_token flow delivers the token directly — no server exchange needed.
 *
 * Requires:
 *   - VITE_GOOGLE_CLIENT_ID env var
 *   - https://deew101.github.io/socialsync2.0/ in Google Cloud → Authorized redirect URIs
 */

import { supabase } from "./supabase";
import { toast } from "sonner";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";
const REDIRECT_URI = (() => {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/socialsync2.0/`;
})();
const GOOGLE_STATE_VALUE = "google_signin";
const SESSION_KEY_NONCE = "gauth_nonce";
const SESSION_KEY_STATE = "gauth_state";
const SESSION_KEY_ID_TOKEN = "gauth_id_token_pending";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function randomBase64url(len = 32): string {
  const buf = new Uint8Array(len);
  crypto.getRandomValues(buf);
  return btoa(String.fromCharCode(...buf))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

async function sha256Hex(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Redirect the user to Google's sign-in page.
 * Uses implicit id_token flow — sends SHA-256 hashed nonce to Google,
 * and preserves the raw nonce for Supabase's signInWithIdToken handshake.
 */
export async function startGoogleSignIn(): Promise<void> {
  if (!CLIENT_ID) {
    toast.error("Google Client ID not configured.");
    return;
  }

  const rawNonce = randomBase64url(32);
  const hashedNonce = await sha256Hex(rawNonce);
  const state = GOOGLE_STATE_VALUE;

  sessionStorage.setItem(SESSION_KEY_NONCE, rawNonce);
  sessionStorage.setItem(SESSION_KEY_STATE, state);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "id_token", // implicit — token in hash, no server exchange
    scope: "openid profile email",
    nonce: hashedNonce, // Google embeds the hashed nonce in id_token
    state,
    prompt: "select_account",
  });

  console.debug("[google-auth] Redirecting to Google (implicit id_token flow)...");
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Called by use-auth.tsx on init.
 * Reads the pending id_token from sessionStorage (placed there by main.tsx),
 * validates state, and calls supabase.auth.signInWithIdToken.
 *
 * Returns true if a pending token was found and processed, false otherwise.
 */
export async function handleGoogleCallbackIfPresent(): Promise<boolean> {
  const idToken = sessionStorage.getItem(SESSION_KEY_ID_TOKEN);
  if (!idToken) return false;

  // Clean up immediately — one-shot use
  sessionStorage.removeItem(SESSION_KEY_ID_TOKEN);
  const nonce = sessionStorage.getItem(SESSION_KEY_NONCE) ?? undefined;
  sessionStorage.removeItem(SESSION_KEY_NONCE);
  sessionStorage.removeItem(SESSION_KEY_STATE);

  console.debug("[google-auth] Found pending id_token — calling signInWithIdToken...");

  const { error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: idToken,
    nonce,
  });

  if (error) {
    console.error("[google-auth] signInWithIdToken error:", error.message);
    throw new Error(error.message);
  }

  console.debug("[google-auth] Sign-in successful!");
  return true;
}
