/**
 * Google Identity Services (GIS) — popup-based sign-in.
 *
 * Uses supabase.auth.signInWithIdToken() instead of the redirect OAuth flow.
 * This avoids the server-side code exchange ("Unable to exchange external code")
 * and the hash-router conflict (#access_token= overwriting hash routes).
 *
 * The user sees a standard Google account picker popup.
 * On success, Supabase creates or retrieves the user session directly.
 *
 * Requires VITE_GOOGLE_CLIENT_ID in .env.
 * Requires https://deew101.github.io in "Authorized JavaScript origins"
 * in the Google Cloud Console OAuth client settings.
 */

import { supabase } from "./supabase";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GoogleAccounts = any;

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

/** Lazily load the Google Identity Services script (idempotent). */
function loadGIS(): Promise<void> {
  const win = window as unknown as { google?: { accounts?: GoogleAccounts } };
  if (win.google?.accounts?.id) return Promise.resolve();

  return new Promise((resolve, reject) => {
    // Avoid adding the script twice
    if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
      // Script is already in DOM but not yet loaded — wait for it
      const existing = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      ) as HTMLScriptElement;
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("GIS load error")));
      return;
    }

    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(s);
  });
}

export interface GoogleSignInResult {
  error?: string;
}

/**
 * Opens the Google account picker popup.
 * On success, creates or retrieves the Supabase user session via signInWithIdToken.
 * Returns {} on success, { error: string } on failure.
 *
 * NOTE: onAuthStateChange in use-auth.tsx handles navigation after success.
 */
export async function googleSignIn(): Promise<GoogleSignInResult> {
  if (!CLIENT_ID) {
    console.error("[google-auth] VITE_GOOGLE_CLIENT_ID is not set.");
    return { error: "Google Client ID not configured. Add VITE_GOOGLE_CLIENT_ID to .env." };
  }

  try {
    await loadGIS();
  } catch {
    return { error: "Failed to load Google sign-in. Check your internet connection." };
  }

  const google = (window as unknown as { google: { accounts: GoogleAccounts } }).google;

  return new Promise<GoogleSignInResult>((resolve) => {
    let settled = false;

    const settle = (result: GoogleSignInResult) => {
      if (!settled) {
        settled = true;
        resolve(result);
      }
    };

    google.accounts.id.initialize({
      client_id: CLIENT_ID,
      ux_mode: "popup",
      auto_select: false,

      callback: async (response: { credential: string }) => {
        console.debug("[google-auth] GIS callback received — exchanging ID token with Supabase");

        const { error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: response.credential,
        });

        if (error) {
          console.error("[google-auth] signInWithIdToken error:", error.message);
          settle({ error: error.message });
        } else {
          console.debug("[google-auth] signInWithIdToken success");
          settle({});
        }
      },
    });

    google.accounts.id.prompt((notification: GoogleAccounts) => {
      // moment types: display, skipped, dismissed
      if (typeof notification?.getMomentType === "function") {
        const type = notification.getMomentType();
        console.debug("[google-auth] GIS prompt moment:", type);
        if (type === "dismissed") {
          settle({ error: "Sign-in dismissed. Please try again." });
        }
        if (type === "skipped") {
          // One Tap was skipped (e.g. user closed it) — not a hard error
          settle({ error: "Google sign-in was skipped. Please try again." });
        }
      }
      if (typeof notification?.isNotDisplayed === "function" && notification.isNotDisplayed()) {
        console.warn("[google-auth] GIS One Tap not displayed:", notification.getNotDisplayedReason?.());
        settle({ error: "Google sign-in could not be displayed. Try disabling browser cookie blocks." });
      }
    });
  });
}
