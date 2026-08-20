import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
  Loader2,
  Copy,
  Layers,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { createPostInDB, publishPostToLinkedIn } from "@/lib/posts-service";
import {
  generateAICaption,
  suggestAIHashtags,
  repurposeContent,
  AITone,
  RepurposedContent,
} from "@/lib/ai-service";
import type { Platform } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/compose")({
  head: () => ({ meta: [{ title: "Compose — SocialSync 2.0" }] }),
  component: Compose,
});

function Compose() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [content, setContent] = useState(
    "Excited to share what we've been working on this quarter… 🚀"
  );
  const [platforms, setPlatforms] = useState<Platform[]>([
    "linkedin",
    "instagram",
  ]);
  const [hashtags, setHashtags] = useState<string[]>(["#launch", "#product"]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([
    "#saas",
    "#marketing",
    "#growth",
    "#ai",
  ]);
  const [scheduledFor, setScheduledFor] = useState<string>(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );

  const [aiTone, setAiTone] = useState<AITone>("engaging");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);
  const [isRepurposing, setIsRepurposing] = useState(false);
  const [repurposed, setRepurposed] = useState<RepurposedContent | null>(null);
  const [activePlatformTab, setActivePlatformTab] = useState<Platform>("linkedin");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const togglePlatform = (p: Platform) =>
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    try {
      const result = await generateAICaption(content, aiTone);
      setContent(result);
      toast.success(`AI caption generated in ${aiTone} tone!`);
    } catch (err: any) {
      toast.error("Failed to generate AI caption.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSuggestHashtags = async () => {
    setIsSuggestingTags(true);
    try {
      const tags = await suggestAIHashtags(content);
      setSuggestedTags(tags);
      toast.success("AI suggested new hashtags!");
    } catch (err) {
      toast.error("Failed to suggest hashtags.");
    } finally {
      setIsSuggestingTags(false);
    }
  };

  const handleRepurpose = async () => {
    setIsRepurposing(true);
    try {
      const versions = await repurposeContent(content);
      setRepurposed(versions);
      toast.success("Content repurposed for LinkedIn, Instagram & X!");
    } catch (err) {
      toast.error("Failed to repurpose content.");
    } finally {
      setIsRepurposing(false);
    }
  };

  const handlePublishNow = async () => {
    if (!content.trim()) {
      toast.error("Post content cannot be empty.");
      return;
    }
    if (platforms.length === 0) {
      toast.error("Please select at least one platform to publish.");
      return;
    }

    setIsSubmitting(true);
    try {
      let linkedInResult = null;
      if (platforms.includes("linkedin")) {
        linkedInResult = await publishPostToLinkedIn(content);
      }

      if (user?.id) {
        await createPostInDB(user.id, {
          content,
          platforms,
          status: linkedInResult && !linkedInResult.success ? "failed" : "published",
          hashtags,
        });
      }

      if (linkedInResult && !linkedInResult.success) {
        toast.error(`LinkedIn: ${linkedInResult.message}`);
      } else {
        toast.success("Post published successfully!");
        navigate({ to: "/history" });
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to publish post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSchedulePost = async () => {
    if (!content.trim()) {
      toast.error("Post content cannot be empty.");
      return;
    }
    if (!scheduledFor) {
      toast.error("Please select a date and time to schedule.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (user?.id) {
        await createPostInDB(user.id, {
          content,
          platforms,
          status: "scheduled",
          scheduled_for: new Date(scheduledFor).toISOString(),
          hashtags,
        });
      }
      toast.success(`Post scheduled for ${scheduledFor.replace("T", " ")}`);
      navigate({ to: "/schedule" });
    } catch (err: any) {
      toast.error("Failed to schedule post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!content.trim()) {
      toast.error("Post content cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (user?.id) {
        await createPostInDB(user.id, {
          content,
          platforms,
          status: "draft",
          hashtags,
        });
      }
      toast.success("Post saved to drafts!");
      navigate({ to: "/drafts" });
    } catch (err) {
      toast.error("Failed to save draft.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create a post</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Compose once, tailor per network with AI, and publish securely.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Composer */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader className="flex flex-wrap items-center justify-between gap-2 space-y-0">
            <CardTitle className="text-base">Post content</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={aiTone}
                onChange={(e) => setAiTone(e.target.value as AITone)}
                className="h-8 rounded-md border border-border bg-secondary text-xs text-foreground px-2"
              >
                <option value="engaging">Engaging</option>
                <option value="professional">Professional</option>
                <option value="concise">Concise</option>
                <option value="bold">Bold</option>
                <option value="creative">Creative</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                disabled={isGeneratingAI}
                onClick={handleGenerateAI}
              >
                {isGeneratingAI ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Wand2 className="mr-1.5 h-3.5 w-3.5 text-primary" />
                )}
                AI caption
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={isSuggestingTags}
                onClick={handleSuggestHashtags}
              >
                {isSuggestingTags ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="mr-1.5 h-3.5 w-3.5 text-amber-400" />
                )}
                AI hashtags
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={isRepurposing}
                onClick={handleRepurpose}
              >
                {isRepurposing ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Layers className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                )}
                Repurpose
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="min-h-44 resize-none border-border bg-background/40 text-base"
            />

            {/* Repurposed Content Panel */}
            {repurposed && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> AI Platform-Adapted Versions
                  </span>
                  <button
                    onClick={() => setRepurposed(null)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Close
                  </button>
                </div>
                <div className="flex gap-2 border-b border-border pb-2">
                  {(["linkedin", "instagram", "twitter"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setActivePlatformTab(p)}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                        activePlatformTab === p
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {p.toUpperCase()}
                    </button>
                  ))}
                </div>
                <div className="relative rounded-lg bg-background/60 p-3 text-xs font-mono whitespace-pre-wrap">
                  {repurposed[activePlatformTab]}
                  <button
                    onClick={() => {
                      setContent(repurposed[activePlatformTab]);
                      toast.success(`Loaded ${activePlatformTab.toUpperCase()} version into editor!`);
                    }}
                    className="absolute top-2 right-2 flex items-center gap-1 bg-secondary px-2 py-1 rounded text-[10px] text-foreground hover:bg-primary/20"
                  >
                    <Copy className="h-3 w-3" /> Use this version
                  </button>
                </div>
              </div>
            )}

            {/* Upload */}
            <div className="rounded-xl border-2 border-dashed border-border bg-background/30 p-6 text-center transition-colors hover:border-primary/40">
              <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                <Upload className="h-4 w-4" />
              </div>
              <p className="text-sm font-medium">Upload images or video</p>
              <p className="mt-1 text-xs text-muted-foreground">
                PNG, JPG, MP4 up to 100 MB. Media files will be stored with user RLS protection.
              </p>
              <Button variant="outline" size="sm" className="mt-3">
                <ImageIcon className="mr-2 h-3.5 w-3.5" /> Choose files
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
                  Suggested Hashtags
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags
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

            {/* Target Networks */}
            <div>
              <p className="mb-3 text-sm font-medium">Publish to</p>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { p: "linkedin" as const, icon: Linkedin, label: "LinkedIn" },
                    { p: "instagram" as const, icon: Instagram, label: "Instagram" },
                    { p: "twitter" as const, icon: Twitter, label: "X" },
                  ]
                ).map(({ p, icon: Icon, label }) => {
                  const on = platforms.includes(p);
                  return (
                    <button
                      key={p}
                      onClick={() => togglePlatform(p)}
                      className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-all ${
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

        {/* Preview & publish actions */}
        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border bg-background/40 p-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-primary" />
                  <div>
                    <p className="text-sm font-medium">Your SocialSync Workspace</p>
                    <p className="text-xs text-muted-foreground">Draft preview</p>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm">
                  {content || (
                    <span className="text-muted-foreground">
                      Your post content will render here…
                    </span>
                  )}
                </p>
                {hashtags.length > 0 && (
                  <p className="mt-2 text-sm text-primary">
                    {hashtags.join(" ")}
                  </p>
                )}
                <div className="mt-3 aspect-video rounded-lg bg-gradient-to-br from-primary/30 to-accent-violet/30 flex items-center justify-center text-xs text-muted-foreground">
                  Media asset slot
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">Publish & Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Schedule Date & Time
                </label>
                <Input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="h-9 border-border text-xs"
                />
              </div>

              <Button
                disabled={isSubmitting}
                className="w-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95"
                onClick={handlePublishNow}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Publish now
              </Button>

              <Button
                variant="outline"
                disabled={isSubmitting}
                className="w-full"
                onClick={handleSchedulePost}
              >
                <Calendar className="mr-2 h-4 w-4" /> Schedule for later
              </Button>

              <Button
                variant="ghost"
                disabled={isSubmitting}
                className="w-full"
                onClick={handleSaveDraft}
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