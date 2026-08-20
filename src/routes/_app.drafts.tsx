import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Copy, Send, Trash2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PlatformBadge } from "@/lib/platform-icons";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchUserPosts,
  deletePostFromDB,
  updatePostInDB,
  DBPost,
} from "@/lib/posts-service";

export const Route = createFileRoute("/_app/drafts")({
  head: () => ({ meta: [{ title: "Drafts — SocialSync 2.0" }] }),
  component: Drafts,
});

function Drafts() {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState<DBPost[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDrafts = async () => {
    setLoading(true);
    try {
      const data = await fetchUserPosts(user?.id);
      setDrafts(data.filter((p) => p.status === "draft"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrafts();
  }, [user]);

  const handleDelete = async (postId: string) => {
    if (user?.id) {
      const ok = await deletePostFromDB(postId, user.id);
      if (ok) {
        toast.success("Draft deleted");
        setDrafts((prev) => prev.filter((d) => d.id !== postId));
      } else {
        toast.error("Failed to delete draft.");
      }
    } else {
      toast.success("Draft removed");
      setDrafts((prev) => prev.filter((d) => d.id !== postId));
    }
  };

  const handlePublishDraft = async (post: DBPost) => {
    if (user?.id) {
      await updatePostInDB(post.id, user.id, {
        status: "published",
        published_at: new Date().toISOString(),
      });
      toast.success("Draft published successfully!");
      await loadDrafts();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Drafts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {drafts.length} draft{drafts.length !== 1 && "s"} saved in your SocialSync 2.0 workspace.
          </p>
        </div>
        <Link to="/compose">
          <Button variant="outline">New draft</Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
          Loading saved drafts from database…
        </div>
      ) : drafts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {drafts.map((p) => (
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
                    onClick={() => handlePublishDraft(p)}
                  >
                    <Send className="mr-2 h-3.5 w-3.5" /> Publish
                  </Button>
                  <Link to="/compose">
                    <Button size="sm" variant="outline">
                      <Calendar className="mr-2 h-3.5 w-3.5" /> Edit / Schedule
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toast.success("Draft content copied to clipboard")}
                  >
                    <Copy className="mr-2 h-3.5 w-3.5" /> Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(p.id)}
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