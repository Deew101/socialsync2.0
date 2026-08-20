import { createFileRoute } from "@tanstack/react-router";
import { Instagram, Linkedin, Plus, Twitter } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { connectedAccounts } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/accounts")({
  head: () => ({ meta: [{ title: "Connected accounts — SocialSync" }] }),
  component: Accounts,
});

const available = [
  { platform: "instagram", label: "Instagram", icon: Instagram },
  { platform: "twitter", label: "X (Twitter)", icon: Twitter },
  { platform: "linkedin", label: "LinkedIn", icon: Linkedin },
] as const;

function Accounts() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Connected accounts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage which social profiles SocialSync can publish to on your behalf.
        </p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Your accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {connectedAccounts.map((a) => {
            const Icon =
              a.platform === "instagram"
                ? Instagram
                : a.platform === "twitter"
                ? Twitter
                : Linkedin;
            return (
              <div
                key={a.id}
                className="flex items-center gap-4 rounded-xl border border-border bg-background/40 p-4"
              >
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{a.handle}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.followers.toLocaleString()} followers · connected
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300 ring-1 ring-inset ring-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Active
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => toast.success("Account disconnected")}
                >
                  Disconnect
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Connect a new account</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {available.map(({ platform, label, icon: Icon }) => (
            <button
              key={platform}
              onClick={() => toast.success(`Redirecting to ${label} OAuth…`)}
              className="flex flex-col items-start gap-3 rounded-xl border border-border bg-background/40 p-5 text-left transition-all hover:border-primary/40 hover:shadow-glow"
            >
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Connect a personal or business profile.
                </p>
              </div>
              <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-primary">
                <Plus className="h-3.5 w-3.5" /> Connect
              </span>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}