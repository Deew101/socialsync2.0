import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/email-confirmed")({
  head: () => ({ meta: [{ title: "Email confirmed — SocialSync" }] }),
  component: EmailConfirmedPage,
});

function EmailConfirmedPage() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(4);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Exchange the code that main.tsx stored from the ?code= query param
    const code = sessionStorage.getItem("email_confirm_code");
    if (code) {
      sessionStorage.removeItem("email_confirm_code");
      supabase.auth
        .exchangeCodeForSession(code)
        .then(({ error: exchangeErr }) => {
          if (exchangeErr) {
            supabase.auth.getSession().then(({ data: { session } }) => {
              if (!session) {
                setError("Verification link is invalid or has expired.");
              }
            });
          }
        })
        .catch(() => {
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
              setError("Verification link is invalid or has expired.");
            }
          });
        });
    }

    // Auto-redirect to login after countdown
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

  if (error) {
    return (
      <AuthShell
        title="Verification issue"
        subtitle="We couldn't verify this email address."
        footer={
          <>
            Need help?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Return to sign in
            </Link>
          </>
        }
      >
        <div className="space-y-6">
          <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>

          <Button
            type="button"
            className="w-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95"
            onClick={() => navigate({ to: "/login" })}
          >
            Go to login
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Email confirmed!"
      subtitle="Your email address has been successfully verified."
      footer={
        <>
          Ready to publish?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in to your account
          </Link>
        </>
      }
    >
      <div className="space-y-6">
        {/* Success confirmation card */}
        <div className="rounded-2xl border border-border bg-card/60 p-6 text-center shadow-lg backdrop-blur">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30">
            <CheckCircle2 className="h-7 w-7" />
          </div>

          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Workspace activated
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your SocialSync 2.0 workspace is ready. You can now log in and manage all your social channels.
          </p>

          {/* Countdown progress */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Redirecting to sign in</span>
              <span className="font-medium text-foreground">{countdown}s</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-1000"
                style={{ width: `${((4 - countdown) / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          type="button"
          className="w-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95"
          onClick={() => navigate({ to: "/login" })}
        >
          Sign in to your workspace <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </AuthShell>
  );
}
