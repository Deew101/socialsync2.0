import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/oauth-callback")({
  head: () => ({ meta: [{ title: "Connecting account — SocialSync 2.0" }] }),
  component: OAuthCallbackPage,
});

function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [platform, setPlatform] = useState("");

  useEffect(() => {
    // Parse the URL — Edge Functions redirect here with query params
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    const errorDescription = params.get("error_description");
    const success = params.get("success");
    const displayName = params.get("display_name");
    const detectedPlatform = params.get("platform") ?? "";

    setPlatform(detectedPlatform);

    if (error || errorDescription) {
      const errMsg = errorDescription ?? error ?? "OAuth authorization failed.";
      setStatus("error");
      setMessage(errMsg);
      toast.error(`Connection failed: ${errMsg}`);
      return;
    }

    if (success === "true") {
      const name = displayName ? ` as ${displayName}` : "";
      const label =
        detectedPlatform === "linkedin"
          ? "LinkedIn"
          : detectedPlatform === "instagram"
          ? "Instagram"
          : "Account";
      setStatus("success");
      setMessage(`${label} connected successfully${name}!`);
      toast.success(`${label} connected${name}!`);
      setTimeout(() => navigate({ to: "/accounts" }), 2000);
      return;
    }

    // No success or error param — unexpected state
    setStatus("error");
    setMessage(
      "Unexpected callback response. The connection may not have completed. Please try again."
    );
  }, [navigate]);

  const platformLabel =
    platform === "linkedin"
      ? "LinkedIn"
      : platform === "instagram"
      ? "Instagram"
      : "Social account";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
        {status === "loading" && (
          <div className="space-y-4">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <h2 className="text-xl font-bold">
              Connecting your {platformLabel} account…
            </h2>
            <p className="text-xs text-muted-foreground">
              Finalising your connection. Please wait.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
            <h2 className="text-xl font-bold">{platformLabel} Connected!</h2>
            <p className="text-sm text-muted-foreground">{message}</p>
            <p className="text-xs text-muted-foreground">
              Redirecting to your accounts…
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <XCircle className="mx-auto h-12 w-12 text-destructive" />
            <h2 className="text-xl font-bold text-destructive">
              Connection Failed
            </h2>
            <p className="text-sm text-muted-foreground">{message}</p>
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
