import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Bell,
  Calendar,
  FileText,
  Folder,
  Home,
  LayoutDashboard,
  LogOut,
  PenSquare,
  Search,
  Settings,
  Sparkles,
  Users2,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCurrentUser } from "@/hooks/use-current-user";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/compose", label: "Compose", icon: PenSquare },
  { to: "/schedule", label: "Scheduler", icon: Calendar },
  { to: "/drafts", label: "Drafts", icon: FileText },
  { to: "/history", label: "Post history", icon: Home },
  { to: "/media", label: "Media library", icon: Folder },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/accounts", label: "Accounts", icon: Users2 },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const currentUser = useCurrentUser();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
          <div className="flex h-16 items-center gap-2 px-6">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary shadow-glow">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Social<span className="text-primary">Sync</span>
            </span>
          </div>
          <Separator />
          <nav className="flex-1 overflow-y-auto p-3">
            <ul className="space-y-0.5">
              {navItems.map((item) => {
                const active = pathname.startsWith(item.to);
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        active
                          ? "bg-primary/10 text-primary ring-1 ring-inset ring-primary/20"
                          : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <Separator />
          <div className="p-3">
            <div className="flex items-center gap-3 rounded-lg p-2">
              <Avatar className="h-9 w-9 ring-1 ring-primary/30">
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  {currentUser.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {currentUser.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {currentUser.role}
                </p>
              </div>
              <Link
                to="/"
                aria-label="Sign out"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-8">
            <div className="relative flex flex-1 items-center">
              <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts, drafts, accounts…"
                className="h-10 border-border bg-secondary/40 pl-9 text-sm placeholder:text-muted-foreground/70 focus-visible:ring-primary/40"
              />
            </div>
            <Link to="/notifications">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
              </Button>
            </Link>
            <Link to="/compose">
              <Button className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95">
                <PenSquare className="mr-2 h-4 w-4" />
                New post
              </Button>
            </Link>
          </header>
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}