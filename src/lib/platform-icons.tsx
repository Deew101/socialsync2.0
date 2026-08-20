import { Instagram, Linkedin, Twitter } from "lucide-react";
import type { Platform } from "./mock-data";

export function PlatformIcon({
  platform,
  className,
}: {
  platform: Platform;
  className?: string;
}) {
  const cls = className ?? "h-4 w-4";
  if (platform === "instagram") return <Instagram className={cls} />;
  if (platform === "twitter") return <Twitter className={cls} />;
  return <Linkedin className={cls} />;
}

export function PlatformBadge({ platform }: { platform: Platform }) {
  const tone: Record<Platform, string> = {
    instagram: "bg-pink-500/10 text-pink-300 ring-pink-500/30",
    twitter: "bg-sky-500/10 text-sky-300 ring-sky-500/30",
    linkedin: "bg-blue-500/10 text-blue-300 ring-blue-500/30",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset ${tone[platform]}`}
    >
      <PlatformIcon platform={platform} className="h-3 w-3" />
      {platform === "instagram" ? "IG" : platform === "twitter" ? "X" : "LI"}
    </span>
  );
}