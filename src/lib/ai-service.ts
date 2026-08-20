export type AITone = "professional" | "engaging" | "concise" | "creative" | "bold";

export interface RepurposedContent {
  linkedin: string;
  instagram: string;
  twitter: string;
}

export interface AnalyticsMetrics {
  totalPosts: number;
  engagementRate: number;
  totalReach: number;
  totalLikes: number;
  totalComments: number;
  followerGrowth: number;
}

export async function generateAICaption(promptText: string, tone: AITone = "engaging"): Promise<string> {
  const apiKey = import.meta.env.VITE_AI_API_KEY;

  if (apiKey) {
    try {
      // Call Google Gemini API if key is present in environment
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Write a social media post caption based on this topic: "${promptText}". Tone should be ${tone}. Keep it concise and high impact. Do not include quotes around the post.`,
                  },
                ],
              },
            ],
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        const generated = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (generated) return generated.trim();
      }
    } catch (err) {
      console.warn("AI API call error fallback:", err);
    }
  }

  // Smart fallback generator based on tone & input
  const cleanInput = promptText.trim() || "Exciting updates coming to our platform!";
  
  if (tone === "professional") {
    return `We're thrilled to highlight our latest progress: ${cleanInput}. Our team remains focused on delivering quality, efficiency, and value for all stakeholders. What are your thoughts on this direction?`;
  } else if (tone === "concise") {
    return `${cleanInput} 🚀 Shipped and live today. Let us know what you think below!`;
  } else if (tone === "bold") {
    return `Game changer alert: ${cleanInput}. We're pushing boundaries and setting new benchmarks. Don't get left behind! 🔥`;
  } else if (tone === "creative") {
    return `✨ Behind every great milestone is a story. Here's ours: ${cleanInput}. Crafting tomorrow's workflow today. 🎨`;
  }

  return `Excited to share this update with our community! 🌟 ${cleanInput}. We've been working hard on this and can't wait to see how it impacts your workflow. Drop your feedback below! 👇`;
}

export async function suggestAIHashtags(content: string): Promise<string[]> {
  const apiKey = import.meta.env.VITE_AI_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Generate 6 trending relevant social media hashtags for this post: "${content}". Return only hashtags separated by spaces e.g. #saas #marketing`,
                  },
                ],
              },
            ],
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const tags = text.match(/#[a-zA-Z0-9_]+/g);
        if (tags && tags.length > 0) return tags.slice(0, 6);
      }
    } catch (err) {
      console.warn("AI hashtag fallback:", err);
    }
  }

  // Fallback keyword-matching hashtag engine
  const lower = content.toLowerCase();
  const baseTags = ["#socialsync", "#growth", "#productivity"];

  if (lower.includes("ai") || lower.includes("tech") || lower.includes("api")) {
    baseTags.push("#ai", "#tech", "#innovation");
  } else if (lower.includes("design") || lower.includes("ui") || lower.includes("ux")) {
    baseTags.push("#design", "#uidesign", "#craft");
  } else if (lower.includes("launch") || lower.includes("ship") || lower.includes("feature")) {
    baseTags.push("#productlaunch", "#buildinpublic", "#saas");
  } else {
    baseTags.push("#contentstrategy", "#digitalmarketing", "#workinspo");
  }

  return Array.from(new Set(baseTags)).slice(0, 6);
}

export async function repurposeContent(originalText: string): Promise<RepurposedContent> {
  const text = originalText.trim() || "Launching our new AI productivity application to streamline social management.";

  const apiKey = import.meta.env.VITE_AI_API_KEY;
  if (apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Repurpose this content for 3 platforms. Return valid JSON only with keys "linkedin", "instagram", and "twitter". Content: "${text}"`,
                  },
                ],
              },
            ],
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const jsonMatch = rawJson.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.linkedin && parsed.instagram && parsed.twitter) {
            return parsed;
          }
        }
      }
    } catch (err) {
      console.warn("AI Repurpose fallback:", err);
    }
  }

  // Tailored platform conversion engine
  return {
    linkedin: `👔 **Professional Update**\n\n${text}\n\nKey takeaways:\n• Streamlined workflow integration\n• Enhanced performance & reliability\n• Built for scaling teams\n\nWhat strategies are you using to optimize your workspace this quarter? Let's connect in the comments.`,
    instagram: `📸 ✨ ${text}\n\nBehind the scenes, simplicity meets speed. Swipe to see how it works! ➡️\n\nSave this post for your content planning workspace! 💾\n\n#socialsync #growth #creativetools #workflow`,
    twitter: `🚀 ${text.length > 220 ? text.slice(0, 220) + "…" : text}\n\n1/3 Quick thread on why this matters for modern teams 🧵👇`,
  };
}

export async function generateAIAnalyticsInsights(metrics: AnalyticsMetrics): Promise<{
  summary: string;
  recommendation: string;
  topTrend: string;
}> {
  const { totalPosts, engagementRate, totalReach, followerGrowth } = metrics;

  // Real numerical interpretation generated deterministically from calculated metrics
  let summary = `Across your ${totalPosts} total posts, your current engagement rate is ${engagementRate}% with ${totalReach.toLocaleString()} total reach.`;
  let topTrend = "Consistent scheduling is driving steady audience exposure.";
  let recommendation = "Maintain active posting during peak hours (10:00 AM - 2:00 PM).";

  if (followerGrowth > 5) {
    topTrend = `Follower growth is up ${followerGrowth}% this period, outperforming typical industry averages.`;
    recommendation = "Capitalize on high growth by introducing interactive Q&A posts and carousel breakdowns.";
  } else if (engagementRate > 3.5) {
    topTrend = `Your ${engagementRate}% engagement rate indicates high audience resonance with published content.`;
    recommendation = "Double down on high-performing post structures and test multi-platform repurposing.";
  } else {
    topTrend = "Audience reach is stable, but comment engagement presents opportunity for growth.";
    recommendation = "Include clear call-to-action questions at the end of LinkedIn and Instagram posts.";
  }

  return { summary, recommendation, topTrend };
}
