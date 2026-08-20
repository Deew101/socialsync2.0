import { createFileRoute } from "@tanstack/react-router";
import { Bell, CheckCircle2, Clock, UserCog, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { notifications, type Notification } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({ meta: [{ title: "Notifications — SocialSync" }] }),
  component: Notifications,
});

function Notifications() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {notifications.filter((n) => !n.read).length} unread
          </p>
        </div>
        <Button variant="outline" size="sm">
          Mark all as read
        </Button>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {notifications.map((n) => (
              <NotificationRow key={n.id} n={n} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationRow({ n }: { n: Notification }) {
  const Icon =
    n.type === "publish"
      ? CheckCircle2
      : n.type === "failure"
      ? XCircle
      : n.type === "account"
      ? UserCog
      : n.type === "reminder"
      ? Clock
      : Bell;
  const tone =
    n.type === "failure"
      ? "text-destructive bg-destructive/10"
      : n.type === "publish"
      ? "text-emerald-400 bg-emerald-500/10"
      : "text-primary bg-primary/10";
  return (
    <div
      className={`flex items-start gap-4 p-5 transition-colors ${
        !n.read ? "bg-primary/5" : ""
      }`}
    >
      <div
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${tone}`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold">{n.title}</p>
          {!n.read && (
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          )}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
      </div>
      <p className="shrink-0 text-xs text-muted-foreground">{n.time}</p>
    </div>
  );
}