/**
 * Google PKCE Auth — browser-side code exchange.
 *
 * Flow (no popups, no Supabase server-to-Google exchange):
 *   1. startGoogleSignIn()  → redirect to Google accounts.google.com
 *   2. Google redirects back to our site with ?code=...&state=google_signin
 *   3. handleGoogleCallback() exchanges the code with Google's token endpoint
 *      using PKCE (no client_secret needed in the browser)
 *   4. Google returns an id_token
 *   5. supabase.auth.signInWithIdToken() validates the id_token and creates session
 *
 * Works in Incognito/InPrivate: full-page redirect, no popup required.
 * No hash conflict: Google returns ?code= in query string, not hash.
 *
 * Requires: https://deew101.github.io/socialsync2.0/ added as an
 * "Authorized redirect URI" in Google Cloud Console OAuth client.
 */

import { supabase } from "./supabase";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

// Where Google redirects back after auth. Must be registered in Google Cloud Console.
const REDIRECT_URI = (() => {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/socialsync2.0/`;
})();

const STORAGE_KEY_VERIFIER = "gauth_pkce_verifier";
const STORAGE_KEY_STATE = "gauth_state";
const GOOGLE_STATE_VALUE = "google_signin";

// ─── PKCE helpers ────────────────────────────────────────────────────────────

function randomBase64url(len = 32): string {
  const buf = new Uint8Array(len);
  crypto.getRandomValues(buf);
  return btoa(String.fromCharCode(...buf))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

async function sha256Base64url(plain: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(plain);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Initiates Google sign-in via a full-page redirect to Google's OAuth server.
 * Call this when the user clicks "Sign in with Google".
 */
export async function startGoogleSignIn(): Promise<void> {
  if (!CLIENT_ID) {
    console.error("[google-pkce] VITE_GOOGLE_CLIENT_ID is not set.");
    throw new Error("Google Client ID not configured.");
  }

  const verifier = randomBase64url(48);
  const challenge = await sha256Base64url(verifier);
  const state = GOOGLE_STATE_VALUE;

  // Persist the verifier so we can use it after the redirect
  sessionStorage.setItem(STORAGE_KEY_VERIFIER, verifier);
  sessionStorage.setItem(STORAGE_KEY_STATE, state);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "openid profile email",
    code_challenge: challenge,
    code_challenge_method: "S256",
    state,
    prompt: "select_account",
    access_type: "online",
  });

  console.debug("[google-pkce] Redirecting to Google OAuth...");
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Call this on app load to check if we just returned from Google.
 * Returns true if we handled a callback (success or error), false if no callback detected.
 */
export async function handleGoogleCallbackIfPresent(): Promise<boolean> {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  const state = urlParams.get("state");
  const errorParam = urlParams.get("error");

  // Not a Google callback
  if (!code && !errorParam) return false;
  if (state !== GOOGLE_STATE_VALUE) return false;

  // Clean up the URL immediately (removes ?code=... from the address bar)
  window.history.replaceState({}, "", window.location.pathname);

  if (errorParam) {
    console.error("[google-pkce] Google returned error:", errorParam);
    return true; // caller should show error based on session state
  }

  const verifier = sessionStorage.getItem(STORAGE_KEY_VERIFIER);
  sessionStorage.removeItem(STORAGE_KEY_VERIFIER);
  sessionStorage.removeItem(STORAGE_KEY_STATE);

  if (!verifier) {
    console.error("[google-pkce] No PKCE verifier in sessionStorage — cannot exchange code.");
    return true;
  }

  console.debug("[google-pkce] Exchanging authorization code with Google token endpoint...");

  try {
    // Exchange the authorization code for tokens using PKCE (no client_secret needed)
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        code: code!,
        code_verifier: verifier,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();

    if (tokens.error) {
      const errMsg = tokens.error_description || tokens.error;
      console.error("[google-pkce] Token exchange error:", tokens.error, errMsg);
      throw new Error(`Google token exchange failed: ${errMsg}`);
    }

    const idToken: string | undefined = tokens.id_token;
    if (!idToken) {
      throw new Error("Google did not return an ID token. Please try again.");
    }

    console.debug("[google-pkce] Got id_token — calling supabase.auth.signInWithIdToken");
    const { error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken,
    });

    if (error) {
      console.error("[google-pkce] signInWithIdToken error:", error.message);
      throw new Error(error.message);
    }

    console.debug("[google-pkce] Sign-in successful!");
  } catch (err) {
    // Re-throw so use-auth.tsx init() can catch it and show a toast
    throw err;
  }

  return true;
}
