import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { handleGoogleCallbackIfPresent } from "@/lib/google-pkce-auth";

export type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  initials: string;
};

export function getInitials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U"
  );
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  isConfigured: false,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isSupabaseConfigured();

  const fetchProfile = async (currentUser: User) => {
    if (!configured) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      const metaName =
        currentUser.user_metadata?.full_name ||
        currentUser.user_metadata?.name ||
        currentUser.email?.split("@")[0] ||
        "User";

      if (error || !data) {
        setProfile({
          id: currentUser.id,
          email: currentUser.email || "",
          full_name: metaName,
          role: "Content Manager",
          initials: getInitials(metaName),
        });
      } else {
        const name = data.full_name || metaName;
        setProfile({
          id: data.id,
          email: data.email || currentUser.email || "",
          full_name: name,
          avatar_url: data.avatar_url,
          role: data.role || "Content Manager",
          initials: getInitials(name),
        });
      }
    } catch {
      const metaName = currentUser.email?.split("@")[0] || "User";
      setProfile({
        id: currentUser.id,
        email: currentUser.email || "",
        full_name: metaName,
        role: "Content Manager",
        initials: getInitials(metaName),
      });
    }
  };

  useEffect(() => {
    // Handle hash-based auth errors ONLY for email magic links / password reset links.
    const rawHash = window.location.hash;
    if (rawHash.includes("error_description=") && !rawHash.includes("error=server_error")) {
      const match = rawHash.match(/error_description=([^&]+)/);
      const desc = match
        ? decodeURIComponent(match[1].replace(/\+/g, " "))
        : "Email link is invalid or has expired";
      toast.error(`Auth Notice: ${desc}. Please request a new link.`);
      window.history.replaceState(null, "", `${window.location.pathname}#/forgot-password`);
    }

    if (!configured) {
      setLoading(false);
      return;
    }

    const init = async () => {
      // ── Google PKCE callback ──────────────────────────────────────────────
      // MUST be awaited before getSession() so signInWithIdToken completes
      // and Supabase persists the session BEFORE we read it.
      try {
        const wasCallback = await handleGoogleCallbackIfPresent();
        if (wasCallback) {
          // Brief pause to let Supabase flush the session to storage
          await new Promise<void>((r) => setTimeout(r, 150));
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Google sign-in failed";
        console.error("[use-auth] Google callback error:", msg);
        toast.error(`${msg}. Please try again.`);
        window.location.hash = "#/login";
      }

      // ── Read session (now includes any session from the callback above) ──
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    };

    init().catch((err) => {
      console.error("[use-auth] init error:", err);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (event === "PASSWORD_RECOVERY") {
        toast.info("Password recovery session active. Please enter your new password below.");
        window.location.hash = "#/settings";
      }

      // After Google PKCE sign-in, navigate to dashboard.
      if (event === "SIGNED_IN" && session?.user) {
        const currentHash = window.location.hash;
        if (
          !currentHash ||
          currentHash === "#" ||
          currentHash === "#/" ||
          currentHash === "#/login" ||
          currentHash === "#/signup"
        ) {
          window.location.hash = "#/dashboard";
        }
      }

      if (session?.user) {
        fetchProfile(session.user).finally(() => setLoading(false));
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [configured]);

  const signOut = async () => {
    if (configured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isConfigured: configured,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
