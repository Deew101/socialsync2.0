import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Plus, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlatformBadge } from "@/lib/platform-icons";
import { useAuth } from "@/hooks/use-auth";
import { fetchUserPosts, DBPost } from "@/lib/posts-service";

export const Route = createFileRoute("/_app/schedule")({
  head: () => ({ meta: [{ title: "Scheduler — SocialSync 2.0" }] }),
  component: Schedule,
});

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Schedule() {
  const { user } = useAuth();
  const [scheduledPosts, setScheduledPosts] = useState<DBPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchUserPosts(user?.id)
      .then((data) => {
        setScheduledPosts(data.filter((p) => p.status === "scheduled"));
      })
      .finally(() => setLoading(false));
  }, [user]);

  const days = Array.from({ length: 35 }).map((_, i) => {
    const day = i - 2;
    const inMonth = day >= 1 && day <= 30;
    return { day: inMonth ? day : null, i };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content calendar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your scheduled multi-platform posts in real-time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-32 text-center text-sm font-semibold">
            August 2026
          </div>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Link to="/compose">
            <Button className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95">
              <Plus className="mr-2 h-4 w-4" /> New post
            </Button>
          </Link>
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-2 border-b border-border pb-2">
            {weekdays.map((d) => (
              <div
                key={d}
                className="text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-2">
            {days.map(({ day, i }) => {
              const postsForDay = day ? scheduledPosts.slice(0, 2) : [];
              return (
                <div
                  key={i}
                  className={`min-h-24 rounded-lg border p-2 text-left transition-colors ${
                    day
                      ? "border-border bg-background/40 hover:border-primary/40"
                      : "border-transparent bg-transparent"
                  }`}
                >
                  {day && (
                    <>
                      <div className="mb-1 text-xs font-medium text-muted-foreground">
                        {day}
                      </div>
                      <div className="space-y-1">
                        {postsForDay.map((p) => (
                          <div
                            key={p.id}
                            className="rounded-md bg-primary/15 p-1.5 text-[11px] leading-tight text-foreground ring-1 ring-primary/25"
                          >
                            <p className="line-clamp-2">{p.content}</p>
                            <div className="mt-1 flex gap-1">
                              {p.platforms.map((pl) => (
                                <PlatformBadge key={pl} platform={pl} />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Scheduled queue ({scheduledPosts.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
              Loading scheduled queue from Supabase DB…
            </div>
          ) : scheduledPosts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No scheduled posts. Click "New post" to schedule your first post.
            </div>
          ) : (
            scheduledPosts.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-4 rounded-xl border border-border/60 bg-background/40 p-4"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.content}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Scheduled for: {p.scheduled_for ? p.scheduled_for.replace("T", " · ").slice(0, 16) : "Tomorrow, 10:00 AM"}
                  </p>
                </div>
                <div className="flex gap-1">
                  {p.platforms.map((pl) => (
                    <PlatformBadge key={pl} platform={pl} />
                  ))}
                </div>
                <Link to="/compose">
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </Link>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}