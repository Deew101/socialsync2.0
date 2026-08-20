import { useEffect, useState } from "react";
import { currentUser as defaultUser } from "@/lib/mock-data";

const STORAGE_KEY = "socialsync.currentUser";

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

export function saveCurrentUser(user: Partial<CurrentUser> & { name: string; email: string }) {
  const full: CurrentUser = {
    name: user.name,
    email: user.email,
    initials: user.initials ?? initialsFromName(user.name),
    role: user.role ?? defaultUser.role,
  };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
    window.dispatchEvent(new Event("socialsync:user"));
  }
  return full;
}

function readUser(): CurrentUser {
  if (typeof window === "undefined") return defaultUser;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultUser;
    const parsed = JSON.parse(raw) as CurrentUser;
    return { ...defaultUser, ...parsed };
  } catch {
    return defaultUser;
  }
}

export function useCurrentUser(): CurrentUser {
  const [user, setUser] = useState<CurrentUser>(defaultUser);
  useEffect(() => {
    setUser(readUser());
    const onChange = () => setUser(readUser());
    window.addEventListener("socialsync:user", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("socialsync:user", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  return user;
}