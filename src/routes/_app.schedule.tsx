import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlatformBadge } from "@/lib/platform-icons";
import { upcomingPosts } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/schedule")({
  head: () => ({ meta: [{ title: "Scheduler — SocialSync" }] }),
  component: Schedule,
});

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Schedule() {
  // Build a 5-week grid starting from a fake month start
  const days = Array.from({ length: 35 }).map((_, i) => {
    const day = i - 2; // arbitrary offset
    const inMonth = day >= 1 && day <= 30;
    return { day: inMonth ? day : null, i };
  });

  const postByDay: Record<number, typeof upcomingPosts> = {
    24: [upcomingPosts[0]],
    25: [upcomingPosts[1]],
    26: [upcomingPosts[2]],
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content calendar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Drag and drop posts to reschedule. Click a day to add.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-32 text-center text-sm font-semibold">
            July 2026
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
              const posts = day ? postByDay[day] ?? [] : [];
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
                        {posts.map((p) => (
                          <div
                            key={p.id}
                            className="cursor-grab rounded-md bg-primary/15 p-1.5 text-[11px] leading-tight text-foreground ring-1 ring-primary/25"
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
          <CardTitle className="text-base">Upcoming queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingPosts.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-4 rounded-xl border border-border/60 bg-background/40 p-4"
            >
              <div className="h-10 w-10 shrink-0 rounded-lg bg-gradient-primary/30 ring-1 ring-primary/20" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.content}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {p.scheduledFor?.replace("T", " · ").slice(0, 16)}
                </p>
              </div>
              <div className="flex gap-1">
                {p.platforms.map((pl) => (
                  <PlatformBadge key={pl} platform={pl} />
                ))}
              </div>
              <Button variant="ghost" size="sm">
                Reschedule
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}