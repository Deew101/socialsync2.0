import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

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

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — SocialSync" }] }),
  component: Settings,
});

function Settings() {
  const currentUser = useCurrentUser();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile, workspace, and preferences.
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
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
                <Input id="email" defaultValue={currentUser.email} />
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
              <CardTitle className="text-base">Change password</CardTitle>
            </CardHeader>
            <CardContent className="max-w-lg space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current">Current password</Label>
                <Input id="current" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new">New password</Label>
                <Input id="new" type="password" />
              </div>
              <Button
                onClick={() => toast.success("Password updated")}
                className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95"
              >
                Update password
              </Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/40 bg-card">
            <CardHeader>
              <CardTitle className="text-base text-destructive">
                Delete account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Permanently delete your account, workspace, and all associated
                data. This action cannot be undone.
              </p>
              <Button
                variant="destructive"
                onClick={() => toast.error("Deletion requires email confirmation")}
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
              <PreferenceRow label="Language" hint="Interface language">
                <Select defaultValue="en">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </PreferenceRow>
              <Separator />
              <PreferenceRow label="Timezone" hint="Used for scheduling">
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
                { label: "Weekly reports", hint: "Analytics digest every Monday" },
              ].map((row, i) => (
                <div key={i}>
                  <PreferenceRow label={row.label} hint={row.hint}>
                    <Switch defaultChecked={i < 3} />
                  </PreferenceRow>
                  {i < 3 && <Separator className="mt-6" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="mt-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">Privacy</CardTitle>
            </CardHeader>
            <CardContent className="max-w-lg space-y-6">
              <PreferenceRow
                label="Analytics sharing"
                hint="Help us improve SocialSync with anonymous usage data"
              >
                <Switch defaultChecked />
              </PreferenceRow>
              <Separator />
              <PreferenceRow
                label="Two-factor authentication"
                hint="Extra security on every sign-in"
              >
                <Switch />
              </PreferenceRow>
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