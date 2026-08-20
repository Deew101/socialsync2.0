import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      !supabaseUrl.includes("placeholder") &&
      !supabaseUrl.includes("your-project-id") &&
      supabaseAnonKey !== "placeholder-key"
  );
};

if (!isSupabaseConfigured()) {
  console.warn(
    "Supabase credentials missing or unconfigured. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in environment variables or GitHub Secrets."
  );
}

export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : "https://placeholder.supabase.co",
  isSupabaseConfigured() ? supabaseAnonKey : "placeholder-key",
  {
    auth: {
      detectSessionInUrl: false,
      persistSession: true,
      autoRefreshToken: isSupabaseConfigured(),
    },
  }
);

