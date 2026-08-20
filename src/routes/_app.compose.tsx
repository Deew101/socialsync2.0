import { createFileRoute } from "@tanstack/react-router";
import {
  Calendar,
  Hash,
  Image as ImageIcon,
  Instagram,
  Linkedin,
  Save,
  Send,
  Sparkles,
  Twitter,
  Upload,
  Wand2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { Platform } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/compose")({
  head: () => ({ meta: [{ title: "Compose — SocialSync" }] }),
  component: Compose,
});

const suggestedHashtags = [
  "#saas",
  "#marketing",
  "#socialmedia",
  "#growth",
  "#branding",
  "#content",
];

function Compose() {
  const [content, setContent] = useState(
    "Excited to share what we've been working on this quarter…",
  );
  const [platforms, setPlatforms] = useState<Platform[]>([
    "instagram",
    "linkedin",
  ]);
  const [hashtags, setHashtags] = useState<string[]>(["#launch", "#product"]);

  const togglePlatform = (p: Platform) =>
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create a post</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Compose once, tailor per network, publish anywhere.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Composer */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Post content</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success("AI caption generated")}
              >
                <Wand2 className="mr-2 h-4 w-4" /> AI caption
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success("Suggested 8 hashtags")}
              >
                <Sparkles className="mr-2 h-4 w-4" /> Suggest hashtags
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="min-h-40 resize-none border-border bg-background/40 text-base"
            />

            {/* Upload */}
            <div className="rounded-xl border-2 border-dashed border-border bg-background/30 p-8 text-center transition-colors hover:border-primary/40">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                <Upload className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium">Upload images or video</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Drag and drop, or click to browse. PNG, JPG, MP4 up to 100 MB.
              </p>
              <Button variant="outline" size="sm" className="mt-4">
                <ImageIcon className="mr-2 h-4 w-4" /> Choose files
              </Button>
            </div>

            {/* Hashtags */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Hashtags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {hashtags.map((h) => (
                  <Badge
                    key={h}
                    variant="outline"
                    className="border-primary/30 bg-primary/10 text-primary"
                  >
                    {h}
                    <button
                      onClick={() =>
                        setHashtags(hashtags.filter((x) => x !== h))
                      }
                      className="ml-1.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="mt-3">
                <p className="mb-2 text-xs text-muted-foreground">
                  Suggested by AI
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedHashtags
                    .filter((h) => !hashtags.includes(h))
                    .map((h) => (
                      <button
                        key={h}
                        onClick={() => setHashtags([...hashtags, h])}
                        className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                      >
                        + {h}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Platforms */}
            <div>
              <p className="mb-3 text-sm font-medium">Publish to</p>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { p: "instagram" as const, icon: Instagram, label: "Instagram" },
                    { p: "twitter" as const, icon: Twitter, label: "X" },
                    { p: "linkedin" as const, icon: Linkedin, label: "LinkedIn" },
                  ]
                ).map(({ p, icon: Icon, label }) => {
                  const on = platforms.includes(p);
                  return (
                    <button
                      key={p}
                      onClick={() => togglePlatform(p)}
                      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                        on
                          ? "border-primary/50 bg-primary/10 text-primary shadow-glow"
                          : "border-border bg-background/40 text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview & actions */}
        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border bg-background/40 p-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-primary" />
                  <div>
                    <p className="text-sm font-medium">SocialSync HQ</p>
                    <p className="text-xs text-muted-foreground">just now</p>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm">
                  {content || (
                    <span className="text-muted-foreground">
                      Your caption will appear here…
                    </span>
                  )}
                </p>
                <p className="mt-2 text-sm text-primary">
                  {hashtags.join(" ")}
                </p>
                <div className="mt-3 aspect-square rounded-lg bg-gradient-to-br from-primary/40 to-accent-violet/40" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">Publish options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95"
                onClick={() => toast.success("Post published")}
              >
                <Send className="mr-2 h-4 w-4" /> Publish now
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => toast.success("Scheduled for tomorrow, 9:00 AM")}
              >
                <Calendar className="mr-2 h-4 w-4" /> Schedule for later
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => toast.success("Saved to drafts")}
              >
                <Save className="mr-2 h-4 w-4" /> Save as draft
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}