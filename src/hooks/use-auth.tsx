import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

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
    // Only intercept hash-based auth errors (e.g. expired password-reset links).
    // OAuth errors (e.g. "Unable to exchange external code") should show a toast
    // and redirect to login — NOT to forgot-password.
    const rawHash = window.location.hash;
    if (
      rawHash.includes("error_code=") ||
      rawHash.includes("error_description=")
    ) {
      const match = rawHash.match(/error_description=([^&]+)/);
      const desc = match
        ? decodeURIComponent(match[1].replace(/\+/g, " "))
        : "Authentication failed";

      const isOAuthError =
        desc.toLowerCase().includes("exchange") ||
        desc.toLowerCase().includes("external code") ||
        rawHash.includes("error=server_error");

      if (isOAuthError) {
        toast.error(`Google sign-in failed: ${desc}. Please try again.`);
        // Clean URL and redirect to login
        window.history.replaceState(null, "", `${window.location.pathname}`);
        window.location.hash = "#/login";
      } else {
        toast.error(`Auth Notice: ${desc}. Please request a new link.`);
        window.history.replaceState(null, "", `${window.location.pathname}#/forgot-password`);
      }
    }

    if (!configured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (event === "PASSWORD_RECOVERY") {
          toast.info("Password recovery session active. Please enter your new password below.");
          window.location.hash = "#/settings";
        }

        // After Google/OAuth sign-in, navigate to dashboard
        if (event === "SIGNED_IN" && session?.user) {
          // Only redirect if we're on the root or a bare callback URL (not already on a route)
          const currentHash = window.location.hash;
          if (!currentHash || currentHash === "#" || currentHash === "#/") {
            window.location.hash = "#/dashboard";
          }
        }

        if (session?.user) {
          fetchProfile(session.user).finally(() => setLoading(false));
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

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
