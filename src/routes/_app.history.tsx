import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Clock, Search, XCircle } from "lucide-react";
import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlatformBadge } from "@/lib/platform-icons";
import { mockPosts, type PostStatus } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/history")({
  head: () => ({ meta: [{ title: "Post history — SocialSync" }] }),
  component: History,
});

function History() {
  const [tab, setTab] = useState<PostStatus | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = mockPosts.filter((p) => {
    if (tab !== "all" && p.status !== tab) return false;
    if (query && !p.content.toLowerCase().includes(query.toLowerCase()))
      return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Post history</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every post you've published, scheduled, failed, or cancelled.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as PostStatus | "all")}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative ml-auto min-w-64 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search posts…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select defaultValue="newest">
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="engagement">Most engaged</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {filtered.length === 0 && (
              <div className="py-16 text-center text-sm text-muted-foreground">
                No posts match your filters.
              </div>
            )}
            {filtered.map((p) => (
              <div key={p.id} className="flex items-center gap-4 p-4">
                <StatusIcon status={p.status} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.content}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    {p.platforms.map((pl) => (
                      <PlatformBadge key={pl} platform={pl} />
                    ))}
                    <span>
                      {p.publishedAt ?? p.scheduledFor
                        ? (p.publishedAt ?? p.scheduledFor)!
                            .replace("T", " · ")
                            .slice(0, 16)
                        : "—"}
                    </span>
                  </div>
                </div>
                {p.engagement && (
                  <div className="hidden text-right text-xs text-muted-foreground md:block">
                    <p className="font-semibold text-foreground">
                      {p.engagement.likes.toLocaleString()} likes
                    </p>
                    <p>
                      {p.engagement.reach.toLocaleString()} reach ·{" "}
                      {p.engagement.comments} comments
                    </p>
                  </div>
                )}
                <StatusBadge status={p.status} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusIcon({ status }: { status: PostStatus }) {
  if (status === "published")
    return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
  if (status === "failed")
    return <XCircle className="h-5 w-5 text-destructive" />;
  return <Clock className="h-5 w-5 text-primary" />;
}

function StatusBadge({ status }: { status: PostStatus }) {
  const map: Record<PostStatus, string> = {
    published: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30",
    scheduled: "bg-primary/10 text-primary ring-primary/30",
    draft: "bg-amber-500/10 text-amber-300 ring-amber-500/30",
    failed: "bg-destructive/10 text-destructive ring-destructive/30",
    cancelled: "bg-muted text-muted-foreground ring-border",
  };
  return (
    <span
      className={`rounded-md px-2 py-0.5 text-[11px] font-medium capitalize ring-1 ring-inset ${map[status]}`}
    >
      {status}
    </span>
  );
}