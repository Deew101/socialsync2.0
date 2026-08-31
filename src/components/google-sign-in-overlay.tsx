/**
 * GoogleSignInOverlay
 *
 * Renders a Google Identity Services (GIS) sign-in button inside an invisible
 * overlay div positioned on top of our styled button. The user sees our design,
 * but actual clicks hit the GIS button underneath — which opens a proper OAuth
 * popup that works in all browsers including Incognito / InPrivate.
 *
 * This replaces the `google.accounts.id.prompt()` approach, which is blocked
 * by third-party cookie restrictions in private browsing windows.
 */

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GoogleAPI = any;

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

interface GoogleSignInOverlayProps {
  onLoadingChange?: (loading: boolean) => void;
}

function loadGIS(): Promise<void> {
  const win = window as unknown as { google?: GoogleAPI };
  if (win.google?.accounts?.id) return Promise.resolve();

  return new Promise((resolve) => {
    const existing = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    ) as HTMLScriptElement | null;

    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }

    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => resolve(); // resolve anyway; renderButton will fail gracefully
    document.head.appendChild(s);
  });
}

export function GoogleSignInOverlay({ onLoadingChange }: GoogleSignInOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!CLIENT_ID) {
      console.warn("[GoogleSignInOverlay] VITE_GOOGLE_CLIENT_ID is not set.");
      return;
    }

    loadGIS().then(() => {
      const google = (window as unknown as { google?: GoogleAPI }).google;
      if (!google?.accounts?.id || !containerRef.current) return;

      const buttonWidth =
        containerRef.current.parentElement?.offsetWidth ||
        containerRef.current.offsetWidth ||
        360;

      google.accounts.id.initialize({
        client_id: CLIENT_ID,
        auto_select: false,
        cancel_on_tap_outside: false,

        callback: async (response: { credential: string }) => {
          console.debug("[GoogleSignInOverlay] ID token received — calling signInWithIdToken");
          onLoadingChange?.(true);

          const { error } = await supabase.auth.signInWithIdToken({
            provider: "google",
            token: response.credential,
          });

          if (error) {
            console.error("[GoogleSignInOverlay] signInWithIdToken error:", error.message);
            toast.error(error.message || "Google sign-in failed. Please try again.");
          } else {
            console.debug("[GoogleSignInOverlay] sign-in success");
          }

          onLoadingChange?.(false);
        },
      });

      // renderButton creates a proper OAuth popup button — works in Incognito.
      // opacity: 0.001 makes it invisible yet still receives pointer events.
      google.accounts.id.renderButton(containerRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "signin_with",
        width: buttonWidth,
        logo_alignment: "left",
      });
    });
  }, [onLoadingChange]);

  if (!CLIENT_ID) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        opacity: 0.001,        // invisible but still receives pointer events (unlike opacity:0)
        overflow: "hidden",
        cursor: "pointer",
        zIndex: 10,
      }}
    />
  );
}
