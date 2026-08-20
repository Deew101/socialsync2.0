import { createFileRoute } from "@tanstack/react-router";
import { Film, Search, Upload } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { mediaLibrary } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/media")({
  head: () => ({ meta: [{ title: "Media library — SocialSync" }] }),
  component: Media,
});

function Media() {
  const [query, setQuery] = useState("");
  const filtered = mediaLibrary.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Media library</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mediaLibrary.length} assets · reuse anywhere across your posts.
          </p>
        </div>
        <Button className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95">
          <Upload className="mr-2 h-4 w-4" /> Bulk upload
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search media…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        {filtered.map((m) => (
          <Card
            key={m.id}
            className="group cursor-pointer overflow-hidden border-border bg-card transition-all hover:border-primary/40 hover:shadow-glow"
          >
            <div
              className="aspect-square"
              style={{
                background: `linear-gradient(135deg, hsl(${m.hue} 60% 50%), hsl(${(m.hue + 40) % 360} 60% 30%))`,
              }}
            >
              <div className="flex h-full items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                {m.type === "video" && (
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-black/40 backdrop-blur">
                    <Film className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            </div>
            <CardContent className="p-3">
              <p className="truncate text-xs font-medium">{m.name}</p>
              <p className="text-[10px] text-muted-foreground">
                {m.size} · {m.uploaded}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}