import { supabase, isSupabaseConfigured } from "./supabase";

/**
 * Represents a real social account stored in the database.
 * No mock/fake data — if the DB is empty, the list is empty.
 */
export interface SocialAccountItem {
  id: string;
  user_id?: string;
  platform: "instagram" | "linkedin";
  handle: string;
  display_name?: string;
  platform_user_id?: string;
  profile_image_url?: string;
  /** null = follower count was not retrieved from the platform */
  followers_count: number | null;
  can_publish: boolean;
  /** Shown in the UI when publishing is limited (e.g. personal Instagram account) */
  publish_note?: string;
  connected: boolean;
  created_at?: string;
}

/**
 * Fetches the authenticated user's real connected social accounts from the database.
 * Returns an empty array if none are connected — never returns mock/demo data.
 */
export async function fetchUserSocialAccounts(
  userId?: string
): Promise<SocialAccountItem[]> {
  if (!isSupabaseConfigured() || !userId) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("social_accounts")
      .select(
        "id, user_id, platform, handle, display_name, platform_user_id, profile_image_url, followers_count, can_publish, publish_note, connected, created_at"
      )
      .eq("user_id", userId)
      .eq("connected", true)
      .in("platform", ["linkedin", "instagram"])
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching social accounts:", error.message);
      return [];
    }

    return (data ?? []).map((d) => ({
      id: d.id,
      user_id: d.user_id,
      platform: d.platform as "instagram" | "linkedin",
      handle: d.handle,
      display_name: d.display_name ?? undefined,
      platform_user_id: d.platform_user_id ?? undefined,
      profile_image_url: d.profile_image_url ?? undefined,
      // Only expose follower count if it's a real positive number from the platform
      followers_count:
        typeof d.followers_count === "number" && d.followers_count > 0
          ? d.followers_count
          : null,
      can_publish: d.can_publish !== false,
      publish_note: d.publish_note ?? undefined,
      connected: d.connected !== false,
      created_at: d.created_at,
    }));
  } catch (err) {
    console.error("Unexpected error fetching social accounts:", err);
    return [];
  }
}

/**
 * Disconnects a social account by deleting it from the database.
 * RLS ensures a user can only delete their own records.
 */
export async function disconnectSocialAccount(
  accountId: string,
  userId?: string
): Promise<boolean> {
  if (!isSupabaseConfigured() || !userId) return false;

  try {
    const { error } = await supabase
      .from("social_accounts")
      .delete()
      .eq("id", accountId)
      .eq("user_id", userId);

    return !error;
  } catch (err) {
    console.error("Error disconnecting account:", err);
    return false;
  }
}

/**
 * Returns only platforms where the user has a connected account that can publish.
 * Used by the Compose page to filter the platform selector.
 */
export function getPublishablePlatforms(
  accounts: SocialAccountItem[]
): ("instagram" | "linkedin")[] {
  return accounts
    .filter((a) => a.connected && a.can_publish)
    .map((a) => a.platform);
}
