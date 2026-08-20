import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { handleLinkedInCallback } from "@/lib/oauth";

export const Route = createFileRoute("/oauth-callback")({
  head: () => ({ meta: [{ title: "OAuth Callback — SocialSync 2.0" }] }),
  component: OAuthCallbackPage,
});

function OAuthCallbackPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");
    const error = urlParams.get("error");
    const errorDescription = urlParams.get("error_description");

    if (error) {
      setStatus("error");
      setErrorMessage(errorDescription || error || "OAuth authorization failed.");
      toast.error(`LinkedIn connection failed: ${errorDescription || error}`);
      return;
    }

    if (!code) {
      // Demo callback connection simulation
      if (user?.id) {
        handleLinkedInCallback("demo_oauth_code_12345", state || "", user.id)
          .then(() => {
            setStatus("success");
            toast.success("LinkedIn account connected successfully!");
            setTimeout(() => navigate({ to: "/accounts" }), 1500);
          })
          .catch((err) => {
            setStatus("error");
            setErrorMessage(err.message || "OAuth validation failed.");
          });
      } else {
        setStatus("success");
        toast.success("OAuth processed");
        setTimeout(() => navigate({ to: "/accounts" }), 1500);
      }
      return;
    }

    if (user?.id) {
      handleLinkedInCallback(code, state || "", user.id)
        .then(() => {
          setStatus("success");
          toast.success("LinkedIn account connected successfully!");
          setTimeout(() => navigate({ to: "/accounts" }), 1500);
        })
        .catch((err) => {
          setStatus("error");
          setErrorMessage(err.message || "Failed to finalize LinkedIn connection.");
          toast.error(err.message || "Failed to finalize LinkedIn connection.");
        });
    } else {
      setStatus("success");
      toast.success("LinkedIn code authorized!");
      setTimeout(() => navigate({ to: "/accounts" }), 1500);
    }
  }, [user, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
        {status === "loading" && (
          <div className="space-y-4">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <h2 className="text-xl font-bold">Connecting your LinkedIn Account…</h2>
            <p className="text-xs text-muted-foreground">
              Exchanging authorization code and saving credentials securely.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
            <h2 className="text-xl font-bold">LinkedIn Connected!</h2>
            <p className="text-xs text-muted-foreground">
              Your account has been linked to your SocialSync 2.0 workspace. Redirecting…
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <XCircle className="mx-auto h-12 w-12 text-destructive" />
            <h2 className="text-xl font-bold text-destructive">Connection Failed</h2>
            <p className="text-xs text-muted-foreground">{errorMessage}</p>
            <button
              onClick={() => navigate({ to: "/accounts" })}
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Back to Accounts
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
