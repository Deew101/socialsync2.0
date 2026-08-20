import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveCurrentUser } from "@/hooks/use-current-user";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — SocialSync" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      let displayName = email.split("@")[0] || "User";

      if (isSupabaseConfigured()) {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Supabase connection timed out")), 5000)
        );

        try {
          const res = (await Promise.race([
            supabase.auth.signInWithPassword({ email, password }),
            timeoutPromise,
          ])) as any;

          if (res?.error) {
            console.warn("Supabase auth error:", res.error.message);
            toast.error(`Login failed: ${res.error.message}`);
            setLoading(false);
            return;
          } else if (res?.data?.user) {
            displayName =
              res.data.user.user_metadata?.name ||
              res.data.user.user_metadata?.full_name ||
              displayName;
          }
        } catch (err: any) {
          console.warn("Supabase auth connection issue:", err);
          toast.info("Offline mode login");
        }
      }

      const user = saveCurrentUser({ name: displayName, email });
      toast.success(`Welcome back, ${user.name}!`);
      await navigate({ to: "/dashboard" });
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to keep your social calendar in motion."
      footer={
        <>
          New to SocialSync?{" "}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/forgot-password"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95"
        >
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
}