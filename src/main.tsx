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
