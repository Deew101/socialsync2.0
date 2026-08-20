import { createFileRoute } from "@tanstack/react-router";
import { Instagram, Linkedin, Plus, Twitter, Loader2, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { initiateLinkedInOAuth } from "@/lib/oauth";
import {
  fetchUserSocialAccounts,
  disconnectSocialAccount,
  saveConnectedAccount,
  SocialAccountItem,
} from "@/lib/social-accounts-service";

export const Route = createFileRoute("/_app/accounts")({
  head: () => ({ meta: [{ title: "Connected accounts — SocialSync 2.0" }] }),
  component: Accounts,
});

const available = [
  {
    platform: "linkedin" as const,
    label: "LinkedIn",
    icon: Linkedin,
    description: "OAuth 2.0 integration for personal & company pages.",
    badge: "OAuth Supported",
  },
  {
    platform: "instagram" as const,
    label: "Instagram",
    icon: Instagram,
    description: "Connect Instagram Business & Creator accounts.",
    badge: "Direct API",
  },
  {
    platform: "twitter" as const,
    label: "X (Twitter)",
    icon: Twitter,
    description: "Publish tweets and thread updates.",
    badge: "v2 API",
  },
] as const;

function Accounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<SocialAccountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);

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
  }, [user]);

  const handleConnect = async (platform: "linkedin" | "instagram" | "twitter") => {
    setConnectingPlatform(platform);

    if (platform === "linkedin") {
      toast.info("Redirecting to LinkedIn OAuth authorization portal…");
      try {
        initiateLinkedInOAuth();
      } catch (err: any) {
        toast.error(`LinkedIn OAuth initialization failed: ${err?.message}`);
        setConnectingPlatform(null);
      }
      return;
    }

    // Connect Instagram / X
    const handlePrompt = prompt(`Enter your ${platform} handle (e.g. @workspace):`, `@user_${platform}`);
    if (handlePrompt && user?.id) {
      const ok = await saveConnectedAccount(user.id, platform, handlePrompt, 850);
      if (ok) {
        toast.success(`${platform.toUpperCase()} account connected successfully!`);
        await loadAccounts();
      } else {
        toast.error(`Failed to connect ${platform} account.`);
      }
    }
    setConnectingPlatform(null);
  };

  const handleDisconnect = async (acc: SocialAccountItem) => {
    if (confirm(`Are you sure you want to disconnect ${acc.handle}?`)) {
      const ok = await disconnectSocialAccount(acc.id, user?.id);
      if (ok) {
        toast.success(`${acc.handle} disconnected`);
        setAccounts((prev) => prev.filter((a) => a.id !== acc.id));
      } else {
        toast.error("Failed to disconnect account.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Connected accounts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage social profiles linked to your SocialSync 2.0 workspace with Row-Level Security.
        </p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Your active accounts</CardTitle>
          <Button variant="ghost" size="sm" onClick={loadAccounts} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
              Loading connected social accounts from database…
            </div>
          ) : accounts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No connected social accounts found. Click below to connect LinkedIn, Instagram, or X.
            </div>
          ) : (
            accounts.map((a) => {
              const Icon =
                a.platform === "instagram"
                  ? Instagram
                  : a.platform === "twitter"
                  ? Twitter
                  : Linkedin;
              return (
                <div
                  key={a.id}
                  className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-background/40 p-4 transition-colors hover:border-primary/30"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{a.handle}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.followers_count.toLocaleString()} followers · Database connected
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300 ring-1 ring-inset ring-emerald-500/30">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    Active
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleDisconnect(a)}
                  >
                    Disconnect
                  </Button>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Connect a new account</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {available.map(({ platform, label, icon: Icon, description, badge }) => (
            <button
              key={platform}
              disabled={connectingPlatform === platform}
              onClick={() => handleConnect(platform)}
              className="group flex flex-col items-start gap-3 rounded-xl border border-border bg-background/40 p-5 text-left transition-all hover:border-primary/50 hover:shadow-glow"
            >
              <div className="flex w-full items-center justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {badge}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{description}</p>
              </div>
              <span className="mt-auto inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                {connectingPlatform === platform ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Connecting…
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" /> Connect {label}
                  </>
                )}
              </span>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}