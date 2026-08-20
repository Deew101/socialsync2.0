export type Platform = "instagram" | "twitter" | "linkedin";

export const platformLabel: Record<Platform, string> = {
  instagram: "Instagram",
  twitter: "X",
  linkedin: "LinkedIn",
};

export const platformColor: Record<Platform, string> = {
  instagram: "from-pink-500 to-orange-400",
  twitter: "from-sky-400 to-sky-600",
  linkedin: "from-blue-500 to-blue-700",
};

export type PostStatus =
  | "scheduled"
  | "published"
  | "draft"
  | "failed"
  | "cancelled";

export interface Post {
  id: string;
  content: string;
  platforms: Platform[];
  status: PostStatus;
  scheduledFor?: string;
  publishedAt?: string;
  media?: string;
  engagement?: { likes: number; comments: number; reach: number };
  hashtags?: string[];
}

export const mockPosts: Post[] = [
  {
    id: "p1",
    content:
      "Excited to announce our new API integration features rolling out next week. Built with love for developers who care about DX. 🚀",
    platforms: ["linkedin", "twitter"],
    status: "scheduled",
    scheduledFor: "2026-07-24T10:00:00",
    hashtags: ["#saas", "#api", "#developers"],
  },
  {
    id: "p2",
    content:
      "Weekly roundup: Top 5 productivity hacks for remote teams that actually work. Save this for later.",
    platforms: ["instagram"],
    status: "scheduled",
    scheduledFor: "2026-07-25T14:00:00",
    hashtags: ["#productivity", "#remotework"],
  },
  {
    id: "p3",
    content:
      "Behind the scenes of our redesign — the tiny details nobody notices but everybody feels.",
    platforms: ["instagram", "linkedin"],
    status: "scheduled",
    scheduledFor: "2026-07-26T09:30:00",
    hashtags: ["#design", "#craft"],
  },
  {
    id: "p4",
    content:
      "The future of sustainable design in modern workspaces — a thread 🧵",
    platforms: ["twitter"],
    status: "published",
    publishedAt: "2026-07-20T09:00:00",
    engagement: { likes: 2415, comments: 82, reach: 42800 },
  },
  {
    id: "p5",
    content: "Just shipped 2.0 — here's what changed and why it matters.",
    platforms: ["linkedin"],
    status: "published",
    publishedAt: "2026-07-19T15:20:00",
    engagement: { likes: 1120, comments: 47, reach: 18200 },
  },
  {
    id: "p6",
    content: "Rough draft — need to polish the CTA…",
    platforms: ["instagram"],
    status: "draft",
    hashtags: ["#draft"],
  },
  {
    id: "p7",
    content: "Thinking about a Q3 campaign around micro-communities.",
    platforms: ["linkedin", "twitter"],
    status: "draft",
  },
  {
    id: "p8",
    content: "Announcing our summer sale — 30% off annual plans.",
    platforms: ["instagram", "twitter", "linkedin"],
    status: "failed",
    scheduledFor: "2026-07-18T12:00:00",
  },
  {
    id: "p9",
    content: "Old campaign that got pulled last minute.",
    platforms: ["instagram"],
    status: "cancelled",
  },
];

export const upcomingPosts = mockPosts.filter((p) => p.status === "scheduled");
export const draftPosts = mockPosts.filter((p) => p.status === "draft");
export const publishedPosts = mockPosts.filter((p) => p.status === "published");

export const connectedAccounts = [
  {
    id: "a1",
    platform: "instagram" as Platform,
    handle: "@socialsync.hq",
    followers: 24800,
    connected: true,
  },
  {
    id: "a2",
    platform: "twitter" as Platform,
    handle: "@socialsync",
    followers: 18200,
    connected: true,
  },
  {
    id: "a3",
    platform: "linkedin" as Platform,
    handle: "SocialSync Inc.",
    followers: 9450,
    connected: true,
  },
];

export interface Activity {
  id: string;
  type: "published" | "scheduled" | "failed" | "connected" | "comment";
  message: string;
  time: string;
}

export const recentActivity: Activity[] = [
  {
    id: "1",
    type: "published",
    message: "Post published to LinkedIn — 'Just shipped 2.0'",
    time: "2h ago",
  },
  {
    id: "2",
    type: "scheduled",
    message: "3 posts scheduled for this week",
    time: "4h ago",
  },
  {
    id: "3",
    type: "comment",
    message: "New comment on your Instagram post from @maya.designs",
    time: "6h ago",
  },
  {
    id: "4",
    type: "failed",
    message: "Failed to publish to Instagram — media size exceeded",
    time: "yesterday",
  },
  {
    id: "5",
    type: "connected",
    message: "LinkedIn account reconnected successfully",
    time: "2 days ago",
  },
];

export interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  type: "publish" | "reminder" | "failure" | "account";
  read: boolean;
}

export const notifications: Notification[] = [
  {
    id: "n1",
    title: "Post published successfully",
    body: "Your post 'Just shipped 2.0' went live on LinkedIn.",
    time: "2h ago",
    type: "publish",
    read: false,
  },
  {
    id: "n2",
    title: "Scheduled post reminder",
    body: "3 posts are scheduled for tomorrow. Review them before they go live.",
    time: "5h ago",
    type: "reminder",
    read: false,
  },
  {
    id: "n3",
    title: "Failed to publish",
    body: "Instagram post failed — media file exceeded the 100MB limit.",
    time: "yesterday",
    type: "failure",
    read: true,
  },
  {
    id: "n4",
    title: "Account reconnected",
    body: "Your LinkedIn access token was refreshed automatically.",
    time: "2 days ago",
    type: "account",
    read: true,
  },
  {
    id: "n5",
    title: "Weekly report ready",
    body: "Engagement is up 12.4% vs last week. Take a look.",
    time: "3 days ago",
    type: "reminder",
    read: true,
  },
];

export const mediaLibrary = Array.from({ length: 12 }).map((_, i) => ({
  id: `m${i + 1}`,
  name: `asset-${(i + 1).toString().padStart(3, "0")}.jpg`,
  type: i % 5 === 0 ? "video" : "image",
  size: `${(Math.random() * 4 + 0.5).toFixed(1)} MB`,
  uploaded: `${i + 1}d ago`,
  hue: (i * 47) % 360,
}));

export const analyticsData = {
  totals: {
    posts: 182,
    engagement: 4.1,
    reach: 142800,
    likes: 12480,
    comments: 842,
    followerGrowth: 8.2,
  },
  weekly: [40, 65, 50, 85, 70, 95, 60],
  best: [
    { title: "Post #441 (Instagram)", metric: "2.4k likes", pct: 82 },
    { title: "Post #438 (LinkedIn)", metric: "1.1k reach", pct: 45 },
    { title: "Post #430 (X)", metric: "820 reposts", pct: 32 },
  ],
};

export const currentUser = {
  name: "James Doe",
  initials: "JD",
  email: "james@socialsync.io",
  role: "Content Manager",
};