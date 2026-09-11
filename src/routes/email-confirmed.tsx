import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/email-confirmed")({
  head: () => ({ meta: [{ title: "Email confirmed — SocialSync" }] }),
  component: EmailConfirmed,
});

function EmailConfirmed() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(4);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Exchange the code that main.tsx stored from the ?code= query param
    const code = sessionStorage.getItem("email_confirm_code");
    if (code) {
      sessionStorage.removeItem("email_confirm_code");
      supabase.auth.exchangeCodeForSession(code).catch((err) => {
        console.error("Code exchange error:", err);
        setError("Confirmation failed. The link may have expired.");
      });
    }

    // Countdown and redirect to login
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          navigate({ to: "/login" });
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm text-center">
        {error ? (
          <>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
              <svg
                className="h-10 w-10 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 7.5h.008v.008H12v-.008z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Confirmation issue
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {error}
            </p>
            <button
              onClick={() => navigate({ to: "/login" })}
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Go to login
            </button>
          </>
        ) : (
          <>
            {/* Animated checkmark */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
              <svg
                className="h-10 w-10 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>

            {/* Heading */}
            <h1 className="text-2xl font-bold tracking-tight">
              Account confirmed! 🎉
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your SocialSync account is ready. Welcome aboard!
            </p>

            {/* Countdown bar */}
            <div className="mt-8 space-y-3">
              <p className="text-xs text-muted-foreground">
                Redirecting to login in{" "}
                <span className="font-semibold text-foreground">{countdown}s</span>
                …
              </p>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-green-500 transition-all duration-1000"
                  style={{ width: `${((4 - countdown) / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* Manual link */}
            <button
              onClick={() => navigate({ to: "/login" })}
              className="mt-6 text-sm font-medium text-primary hover:underline"
            >
              Go to login now →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
