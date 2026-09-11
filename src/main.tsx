import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import "./styles.css";

// ── Google implicit-flow callback extraction ────────────────────────────────
// Must run BEFORE the hash router mounts, otherwise #id_token=… is treated as
// a route. Google redirects back with the token in the URL hash:
//   https://deew101.github.io/socialsync2.0/#id_token=XXX&state=google_signin
(function extractGoogleIdToken() {
  const raw = window.location.hash; // e.g. "#id_token=xxx&state=google_signin"
  if (!raw.includes("id_token=") || !raw.includes("state=google_signin")) return;

  const params = new URLSearchParams(raw.replace(/^#/, ""));
  const idToken = params.get("id_token");
  if (!idToken) return;

  // Stash the token for use-auth.tsx to consume
  sessionStorage.setItem("gauth_id_token_pending", idToken);

  // Clear the hash so the router sees a clean URL (navigates to #/)
  window.history.replaceState(null, "", window.location.pathname);
})();

// ── Supabase email confirmation / recovery hash extraction ───────────────────
// Supabase email confirmation redirects to:
//   https://deew101.github.io/socialsync2.0/#access_token=...&refresh_token=...&type=signup
// Because we use TanStack hash router, #access_token=… is treated as an unknown route (404).
// We intercept it before the router mounts, save the tokens, and route to #/email-confirmed.
(function extractSupabaseAuthHash() {
  const raw = window.location.hash;
  if (!raw.includes("access_token=")) return;

  const params = new URLSearchParams(raw.replace(/^#/, ""));
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  const type = params.get("type");

  if (accessToken && refreshToken) {
    sessionStorage.setItem(
      "supabase_auth_tokens_pending",
      JSON.stringify({ accessToken, refreshToken, type })
    );

    const basePath = window.location.pathname.endsWith("/")
      ? window.location.pathname
      : window.location.pathname + "/";

    const targetRoute =
      type === "recovery" ? "#/settings" : "#/email-confirmed";

    window.history.replaceState(null, "", basePath + targetRoute);
  }
})();

// ── Email confirmation code redirect (?code=...) ─────────────────────────────
// When Supabase sends confirmation links using PKCE (?code=XXX)
// We intercept the ?code= here and redirect to #/email-confirmed
(function handleEmailConfirmCode() {
  const search = window.location.search;
  if (!search.includes("code=")) return;
  // Don't steal Google's ?code= (which has state=google_signin in query)
  if (search.includes("state=google_signin")) return;

  const params = new URLSearchParams(search);
  const code = params.get("code");
  if (!code) return;

  // Store the code and redirect into the SPA
  sessionStorage.setItem("email_confirm_code", code);
  const basePath = window.location.pathname.endsWith("/")
    ? window.location.pathname
    : window.location.pathname + "/";

  // Rewrite URL to the email-confirmed hash route
  window.history.replaceState(null, "", basePath + "#/email-confirmed");
})();

const router = getRouter();

const rootElement = document.getElementById("root");
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}
