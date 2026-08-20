import { useAuth } from "./use-auth";
import { currentUser as defaultUser } from "@/lib/mock-data";

export type CurrentUser = {
  name: string;
  initials: string;
  email: string;
  role: string;
};

export function initialsFromName(name: string) {
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

export function useCurrentUser(): CurrentUser {
  const { profile, user } = useAuth();

  if (profile) {
    return {
      name: profile.full_name,
      initials: profile.initials,
      email: profile.email,
      role: profile.role,
    };
  }

  if (user) {
    const name =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "User";
    return {
      name,
      initials: initialsFromName(name),
      email: user.email || "",
      role: "Content Manager",
    };
  }

  return defaultUser;
}