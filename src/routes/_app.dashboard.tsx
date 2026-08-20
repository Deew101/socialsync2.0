import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  FileText,
  Instagram,
  Linkedin,
  MessageSquare,
  PenSquare,
  Twitter,
  Users2,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlatformBadge } from "@/lib/platform-icons";
import {
  connectedAccounts,
  draftPosts,
  publishedPosts,
  recentActivity,
  upcomingPosts,
} from "@/lib/mock-data";
import { useCurrentUser } from "@/hooks/use-current-user";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — SocialSync" }] }),
  component: Dashboard,
});

const stats = [
  {
    label: "Scheduled",
    icon: Calendar,
    getValue: () => upcomingPosts.length.toString(),
    delta: "Next: Today, 4:00 PM",
    tone: "text-primary",
  },
  {
    label: "Published",
    icon: CheckCircle2,
    getValue: () => publishedPosts.length + 180 + "",
    delta: "+8.2% this week",
    tone: "text-emerald-400",
  },
  {
    label: "Drafts",
    icon: FileText,
    getValue: () => draftPosts.length.toString(),
    delta: "2 need review",
    tone: "text-amber-400",
  },
  {
    label: "Accounts",
    icon: Users2,
    getValue: () => connectedAccounts.length.toString(),
    delta: "All healthy",
    tone: "text-muted-foreground",
  },
];

function Dashboard() {
  const currentUser = useCurrentUser();
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {currentUser.name.split(" ")[0]}.
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your social presence is growing 12% faster than last month.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/schedule">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" /> View calendar
            </Button>
          </Link>
          <Link to="/compose">
            <Button className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95">
              <PenSquare className="mr-2 h-4 w-4" /> Compose
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card
              key={s.label}
              className="border-border bg-card transition-colors hover:border-primary/40"
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </p>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="mt-2 text-3xl font-bold tracking-tight">
                  {s.getValue()}
                </p>
                <p className={`mt-1 text-xs ${s.tone}`}>{s.delta}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Upcoming schedule</CardTitle>
            <Link
              to="/schedule"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingPosts.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-4 rounded-xl border border-border/60 bg-background/40 p-4 transition-colors hover:border-primary/30"
              >
                <div className="h-12 w-12 shrink-0 rounded-lg bg-gradient-primary/30 ring-1 ring-primary/20" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.content}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    {p.platforms.map((pl) => (
                      <PlatformBadge key={pl} platform={pl} />
                    ))}
                    <span className="text-xs text-muted-foreground">
                      {p.scheduledFor?.replace("T", " · ").slice(5, 16)}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((a) => {
              const Icon =
                a.type === "published"
                  ? CheckCircle2
                  : a.type === "failed"
                  ? XCircle
                  : a.type === "scheduled"
                  ? Calendar
                  : a.type === "comment"
                  ? MessageSquare
                  : ArrowUpRight;
              const tone =
                a.type === "failed"
                  ? "text-destructive"
                  : a.type === "published"
                  ? "text-emerald-400"
                  : "text-primary";
              return (
                <div key={a.id} className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary ${tone}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-sm leading-tight">{a.message}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {a.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Connected accounts */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Connected accounts</CardTitle>
            <Link
              to="/accounts"
              className="text-xs font-medium text-primary hover:underline"
            >
              Manage
            </Link>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
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
                  className="rounded-xl border border-border bg-background/40 p-4"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{a.handle}</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {a.followers.toLocaleString()} followers
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link to="/compose">
              <Button variant="outline" className="w-full justify-start">
                <PenSquare className="mr-2 h-4 w-4" /> Create new post
              </Button>
            </Link>
            <Link to="/schedule">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" /> Open scheduler
              </Button>
            </Link>
            <Link to="/drafts">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" /> Review drafts
              </Button>
            </Link>
            <Link to="/accounts">
              <Button variant="outline" className="w-full justify-start">
                <Users2 className="mr-2 h-4 w-4" /> Connect account
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}