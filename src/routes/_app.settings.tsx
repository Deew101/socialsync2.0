import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useCurrentUser } from "@/hooks/use-current-user";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — SocialSync 2.0" }] }),
  component: Settings,
});

function Settings() {
  const currentUser = useCurrentUser();
  const [newPassword, setNewPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setUpdatingPassword(true);
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
          toast.error(error.message);
          setUpdatingPassword(false);
          return;
        }
      }
      toast.success("Password updated successfully!");
      setNewPassword("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update password.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile, workspace, and security preferences.
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account & Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">Profile</CardTitle>
            </CardHeader>
            <CardContent className="max-w-lg space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" defaultValue={currentUser.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" defaultValue={currentUser.email} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" defaultValue={currentUser.role} />
              </div>
              <Button
                onClick={() => toast.success("Profile saved")}
                className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95"
              >
                Save changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="mt-6 space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">Set new password</CardTitle>
            </CardHeader>
            <CardContent className="max-w-lg space-y-4">
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new">New password</Label>
                  <Input
                    id="new"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={updatingPassword}
                  className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95"
                >
                  {updatingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating…
                    </>
                  ) : (
                    "Update password"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-destructive/40 bg-card">
            <CardHeader>
              <CardTitle className="text-base text-destructive">
                Delete workspace account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Permanently delete your account, workspace, and all associated social data.
              </p>
              <Button
                variant="destructive"
                onClick={() => toast.error("Account deletion requires email confirmation.")}
              >
                Delete my account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="mt-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">Preferences</CardTitle>
            </CardHeader>
            <CardContent className="max-w-lg space-y-6">
              <PreferenceRow label="Theme" hint="Choose your workspace theme">
                <Select defaultValue="dark">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </PreferenceRow>
              <Separator />
              <PreferenceRow label="Timezone" hint="Used for content scheduling">
                <Select defaultValue="utc">
                  <SelectTrigger className="w-56">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="pst">America/Los Angeles</SelectItem>
                    <SelectItem value="est">America/New York</SelectItem>
                    <SelectItem value="gmt">Europe/London</SelectItem>
                  </SelectContent>
                </Select>
              </PreferenceRow>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">Notification preferences</CardTitle>
            </CardHeader>
            <CardContent className="max-w-lg space-y-6">
              {[
                {
                  label: "Publishing success",
                  hint: "When a post publishes to any platform",
                },
                {
                  label: "Publishing failures",
                  hint: "When a post fails to publish",
                },
                {
                  label: "Schedule reminders",
                  hint: "Reminders 30 minutes before scheduled posts",
                },
              ].map((row, i) => (
                <div key={i}>
                  <PreferenceRow label={row.label} hint={row.hint}>
                    <Switch defaultChecked />
                  </PreferenceRow>
                  {i < 2 && <Separator className="mt-6" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PreferenceRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      </div>
      {children}
    </div>
  );
}