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

// ── Email confirmation code redirect ─────────────────────────────────────────
// Supabase sends confirmation links to {site_url}?code=XXX
// We intercept the ?code= here and redirect to #/email-confirmed so the
// SPA can handle it (exchange code → confirm session → show success screen).
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
  // Rewrite URL to the email-confirmed hash route (keeps the code in storage)
  window.history.replaceState(null, "", window.location.pathname + "#/email-confirmed");
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
