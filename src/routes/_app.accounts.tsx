import { createFileRoute } from "@tanstack/react-router";
import {
  Instagram,
  Linkedin,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Settings,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import {
  initiateLinkedInOAuth,
  initiateInstagramOAuth,
  getLinkedInClientId,
  getMetaAppId,
} from "@/lib/oauth";
import {
  fetchUserSocialAccounts,
  disconnectSocialAccount,
  SocialAccountItem,
} from "@/lib/social-accounts-service";

export const Route = createFileRoute("/_app/accounts")({
  head: () => ({ meta: [{ title: "Connected accounts — SocialSync 2.0" }] }),
  component: Accounts,
});

const PLATFORMS = [
  {
    platform: "linkedin" as const,
    label: "LinkedIn",
    icon: Linkedin,
    description: "Publish posts to your LinkedIn profile.",
    isConfigured: () => !!getLinkedInClientId(),
    unconfiguredNote:
      "Set VITE_LINKEDIN_CLIENT_ID in GitHub Secrets to enable.",
  },
  {
    platform: "instagram" as const,
    label: "Instagram",
    icon: Instagram,
    description:
      "Publish images to Instagram. Requires a Business or Creator account.",
    isConfigured: () => !!getMetaAppId(),
    unconfiguredNote: "Set VITE_META_APP_ID in GitHub Secrets to enable.",
  },
] as const;

function Accounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<SocialAccountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(
    null
  );
  const [disconnectTarget, setDisconnectTarget] =
    useState<SocialAccountItem | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await fetchUserSocialAccounts(user?.id);
      setAccounts(data);
    } catch (err) {
      console.error("Error loading accounts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, [user?.id]);

  const handleConnect = (platform: "linkedin" | "instagram") => {
    if (!user?.id) {
      toast.error("You must be logged in to connect an account.");
      return;
    }
    setConnectingPlatform(platform);
    try {
      if (platform === "linkedin") {
        toast.info("Redirecting to LinkedIn…");
        initiateLinkedInOAuth(user.id);
      } else {
        toast.info("Redirecting to Instagram / Meta…");
        initiateInstagramOAuth(user.id);
      }
    } catch (err: any) {
      toast.error(err?.message ?? `Failed to start ${platform} connection.`);
      setConnectingPlatform(null);
    }
  };

  const confirmDisconnect = async () => {
    if (!disconnectTarget || !user?.id) return;
    setIsDisconnecting(true);
    const ok = await disconnectSocialAccount(disconnectTarget.id, user.id);
    if (ok) {
      toast.success(
        `${disconnectTarget.display_name ?? disconnectTarget.handle} disconnected.`
      );
      setAccounts((prev) => prev.filter((a) => a.id !== disconnectTarget.id));
    } else {
      toast.error("Failed to disconnect account. Please try again.");
    }
    setIsDisconnecting(false);
    setDisconnectTarget(null);
  };

  const connectedPlatforms = new Set(accounts.map((a) => a.platform));

  return (
    <div className="space-y-6">
      {/* Disconnect confirmation modal */}
      {disconnectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h2 className="text-base font-semibold">Disconnect account?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This will remove your{" "}
              <span className="font-medium">
                {disconnectTarget.display_name ?? disconnectTarget.handle}
              </span>{" "}
              connection from SocialSync. You can reconnect at any time.
            </p>
            <div className="mt-6 flex gap-3">
              <Button
                variant="destructive"
                className="flex-1"
                disabled={isDisconnecting}
                onClick={confirmDisconnect}
              >
                {isDisconnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Disconnect"
                )}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDisconnectTarget(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Connected accounts
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage social profiles linked to your SocialSync 2.0 workspace.
        </p>
      </div>

      {/* Active connections */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Your connected accounts</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadAccounts}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Refresh
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
              Loading connected accounts…
            </div>
          ) : accounts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No accounts connected yet. Connect LinkedIn or Instagram below.
            </div>
          ) : (
            accounts.map((acc) => {
              const Icon =
                acc.platform === "instagram" ? Instagram : Linkedin;
              const platformLabel =
                acc.platform === "instagram" ? "Instagram" : "LinkedIn";
              return (
                <div
                  key={acc.id}
                  className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-background/40 p-4 transition-colors hover:border-primary/30"
                >
                  {/* Real profile image or fallback icon */}
                  {acc.profile_image_url ? (
                    <img
                      src={acc.profile_image_url}
                      alt={acc.display_name ?? acc.handle}
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {acc.display_name ?? acc.handle}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {platformLabel}
                      {acc.handle &&
                        acc.handle !== acc.display_name &&
                        ` · @${acc.handle.replace("@", "")}`}
                      {/* Follower count only shown if it actually came from the platform API */}
                      {acc.followers_count !== null &&
                        ` · ${acc.followers_count.toLocaleString()} followers`}
                    </p>
                    {/* Publishing limitation note (e.g. personal Instagram) */}
                    {acc.publish_note && (
                      <p className="mt-0.5 flex items-center gap-1 text-[10px] text-amber-400">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        {acc.publish_note}
                      </p>
                    )}
                  </div>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300 ring-1 ring-inset ring-emerald-500/30">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    Connected
                  </span>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setDisconnectTarget(acc)}
                  >
                    Disconnect
                  </Button>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Connect new account */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Connect a new account</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {PLATFORMS.map(
            ({
              platform,
              label,
              icon: Icon,
              description,
              isConfigured,
              unconfiguredNote,
            }) => {
              const connected = connectedPlatforms.has(platform);
              const configured = isConfigured();
              const connecting = connectingPlatform === platform;

              return (
                <div
                  key={platform}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-background/40 p-5"
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    {connected ? (
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-300">
                        Connected
                      </span>
                    ) : !configured ? (
                      <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-medium text-amber-300">
                        Setup required
                      </span>
                    ) : (
                      <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        Not connected
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {description}
                    </p>
                    {!configured && (
                      <p className="mt-1.5 flex items-center gap-1 text-[10px] text-amber-400">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        {unconfiguredNote}
                      </p>
                    )}
                  </div>

                  {connected ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-auto"
                      onClick={() => {
                        const acc = accounts.find(
                          (a) => a.platform === platform
                        );
                        if (acc) setDisconnectTarget(acc);
                      }}
                    >
                      Manage / Disconnect
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      disabled={connecting || !configured}
                      className="mt-auto bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95 disabled:opacity-50"
                      onClick={() => handleConnect(platform)}
                    >
                      {connecting ? (
                        <>
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          Connecting…
                        </>
                      ) : !configured ? (
                        <>
                          <Settings className="mr-1.5 h-3.5 w-3.5" />
                          Awaiting Setup
                        </>
                      ) : (
                        `Connect ${label}`
                      )}
                    </Button>
                  )}
                </div>
              );
            }
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        ⚠️ X (Twitter) is not available — posting via the X API requires a paid
        plan ($100/month minimum).
      </p>
    </div>
  );
}