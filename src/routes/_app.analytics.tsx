import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { analyticsData } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({ meta: [{ title: "Analytics — SocialSync" }] }),
  component: Analytics,
});

function Analytics() {
  const { totals, weekly, best } = analyticsData;
  const kpis = [
    { label: "Total posts", value: totals.posts.toString(), delta: "+12" },
    {
      label: "Engagement",
      value: `${totals.engagement}%`,
      delta: "+0.3%",
    },
    {
      label: "Reach",
      value: (totals.reach / 1000).toFixed(1) + "k",
      delta: "+8.2%",
    },
    {
      label: "Likes",
      value: totals.likes.toLocaleString(),
      delta: "+4.7%",
    },
    {
      label: "Comments",
      value: totals.comments.toString(),
      delta: "+2.1%",
    },
    {
      label: "Followers",
      value: `+${totals.followerGrowth}%`,
      delta: "this month",
    },
  ];

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Compare performance across Instagram, X, and LinkedIn.
          </p>
        </div>
        <Select defaultValue="30d">
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {kpis.map((k) => (
          <Card key={k.label} className="border-border bg-card">
            <CardContent className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {k.label}
              </p>
              <p className="mt-1 text-2xl font-bold">{k.value}</p>
              <p className="mt-0.5 text-xs text-emerald-400">{k.delta}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Performance trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-end gap-3">
              {weekly.map((h, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div className="relative w-full flex-1">
                    <div
                      className="absolute inset-x-0 bottom-0 rounded-t bg-gradient-to-t from-primary/40 to-primary transition-all hover:opacity-90"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {days[i]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Best performing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {best.map((b) => (
              <div key={b.title}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{b.title}</span>
                  <span className="font-semibold">{b.metric}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-gradient-primary"
                    style={{ width: `${b.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Follower growth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">+2,412 followers</p>
              <p className="text-xs text-muted-foreground">
                across all platforms this month
              </p>
            </div>
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300 ring-1 ring-inset ring-emerald-500/30">
              <ArrowUpRight className="h-3 w-3" /> +8.2%
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}