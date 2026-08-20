import { supabase, isSupabaseConfigured } from "./supabase";
import { connectedAccounts as defaultMockAccounts } from "./mock-data";

export interface SocialAccountItem {
  id: string;
  user_id?: string;
  platform: "instagram" | "twitter" | "linkedin";
  handle: string;
  account_name?: string;
  followers_count: number;
  connected: boolean;
  created_at?: string;
}

export async function fetchUserSocialAccounts(userId?: string): Promise<SocialAccountItem[]> {
  if (!isSupabaseConfigured() || !userId) {
    return defaultMockAccounts.map((a) => ({
      id: a.id,
      platform: a.platform,
      handle: a.handle,
      followers_count: a.followers,
      connected: a.connected,
    }));
  }

  try {
    const { data, error } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      // Seed default user accounts if user has no accounts in DB yet
      return defaultMockAccounts.map((a) => ({
        id: a.id,
        platform: a.platform,
        handle: a.handle,
        followers_count: a.followers,
        connected: a.connected,
      }));
    }

    return data.map((d) => ({
      id: d.id,
      user_id: d.user_id,
      platform: d.platform as any,
      handle: d.handle,
      account_name: d.account_name,
      followers_count: d.followers_count || 0,
      connected: d.connected !== false,
      created_at: d.created_at,
    }));
  } catch (err) {
    console.error("Error fetching social accounts:", err);
    return defaultMockAccounts.map((a) => ({
      id: a.id,
      platform: a.platform,
      handle: a.handle,
      followers_count: a.followers,
      connected: a.connected,
    }));
  }
}

export async function disconnectSocialAccount(accountId: string, userId?: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !userId) {
    return true;
  }

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

export async function saveConnectedAccount(
  userId: string,
  platform: "linkedin" | "instagram" | "twitter",
  handle: string,
  followers: number = 500
): Promise<boolean> {
  if (!isSupabaseConfigured() || !userId) {
    return true;
  }

  try {
    const { error } = await supabase.from("social_accounts").insert({
      user_id: userId,
      platform,
      handle,
      connected: true,
      followers_count: followers,
    });
    return !error;
  } catch (err) {
    console.error("Error saving connected account:", err);
    return false;
  }
}
