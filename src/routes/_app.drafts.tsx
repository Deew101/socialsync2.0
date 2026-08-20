import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Copy, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlatformBadge } from "@/lib/platform-icons";
import { draftPosts } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/drafts")({
  head: () => ({ meta: [{ title: "Drafts — SocialSync" }] }),
  component: Drafts,
});

function Drafts() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Drafts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {draftPosts.length} draft{draftPosts.length !== 1 && "s"} — finish
            what you started.
          </p>
        </div>
        <Link to="/compose">
          <Button variant="outline">New draft</Button>
        </Link>
      </div>

      {draftPosts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {draftPosts.map((p) => (
            <Card key={p.id} className="border-border bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  {p.platforms.map((pl) => (
                    <PlatformBadge key={pl} platform={pl} />
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed">{p.content}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    size="sm"
                    className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95"
                    onClick={() => toast.success("Published")}
                  >
                    <Send className="mr-2 h-3.5 w-3.5" /> Publish
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.success("Scheduled")}
                  >
                    <Calendar className="mr-2 h-3.5 w-3.5" /> Schedule
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toast.success("Duplicated")}
                  >
                    <Copy className="mr-2 h-3.5 w-3.5" /> Duplicate
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => toast.success("Deleted")}
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="border-dashed border-border bg-card">
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
          <Send className="h-5 w-5" />
        </div>
        <p className="text-lg font-semibold">No drafts yet</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Start writing a post and save it as a draft to come back to it later.
        </p>
        <Link to="/compose">
          <Button className="mt-2 bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95">
            Start a draft
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}