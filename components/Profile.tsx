"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/hooks/use-toast";
import { SettingsService } from "@/lib/settings-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  User,
  Mail,
  Shield,
  Key,
  Bell,
  Trash2,
  Save,
  Camera,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";

interface UserProfile {
  id: string;
  user_id: string;
  email?: string;
  full_name: string | null;
  company_name: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  bio?: string | null;
  created_at: string;
  updated_at: string;
}

interface ProfileFormData {
  full_name: string;
  phone: string;
}

interface NotificationSettings {
  email_notifications: boolean;
  marketing_emails: boolean;
}

export const Profile = () => {
  const router = useRouter();
  // Using enhanced toast helpers
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isSocialLogin, setIsSocialLogin] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    full_name: "",
    phone: "",
  });
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email_notifications: true,
    marketing_emails: false,
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        router.push("/auth");
        return;
      }

      setUser(user);

      // Check if user signed up with social provider
      const isSocial = user.app_metadata?.providers?.some((provider: string) => 
        provider !== 'email'
      ) || false;
      setIsSocialLogin(isSocial);

      // Load user profile from profiles table (if it exists)
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!profileError && profileData) {
        setProfile({
          ...profileData,
          email: user.email || "",
        });
        setProfileForm({
          full_name: profileData.full_name || "",
          phone: (profileData as any).phone || "",
        });
      } else {
        // Create basic profile if it doesn't exist
        setProfileForm({
          full_name: user.user_metadata?.full_name || "",
          phone: "",
        });
      }

      // Load notification settings from user_settings table
      try {
        const userSettings = await SettingsService.getUserSettings(user.id);
        if (userSettings) {
          setNotificationSettings({
            email_notifications: userSettings.email_notifications ?? true,
            marketing_emails: userSettings.marketing_emails ?? false,
          });
        }
      } catch (error) {
        console.error("Error loading notification settings:", error);
        // Use defaults if loading fails
        setNotificationSettings({
          email_notifications: true,
          marketing_emails: false,
        });
      }

    } catch (error) {
      console.error("Error loading user data:", error);
      showError(
        "Error",
        "Failed to load profile data"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Update or insert profile with proper conflict resolution
      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          full_name: profileForm.full_name,
          phone: profileForm.phone,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      showSuccess(
        "Success",
        "Profile updated successfully"
      );

      // Reload data
      await loadUserData();
    } catch (error) {
      console.error("Error saving profile:", error);
      showError(
        "Error",
        "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Get current user settings
      const currentSettings = await SettingsService.getUserSettings(user.id);
      
      // Update notification settings
      const updatedSettings = {
        ...currentSettings,
        email_notifications: notificationSettings.email_notifications,
        marketing_emails: notificationSettings.marketing_emails,
      };

      await SettingsService.saveUserSettings(user.id, updatedSettings);

      showSuccess(
        "Success",
        "Notification preferences updated successfully"
      );
    } catch (error) {
      console.error("Error saving notification settings:", error);
      showError(
        "Error",
        "Failed to update notification preferences"
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showError(
        "Error",
        "New passwords don't match"
      );
      return;
    }

    if (passwordForm.new_password.length < 6) {
      showError(
        "Error",
        "Password must be at least 6 characters"
      );
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.new_password,
      });

      if (error) throw error;

      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });

      showSuccess(
        "Success",
        "Password updated successfully"
      );
    } catch (error) {
      console.error("Error updating password:", error);
      showError(
        "Error",
        "Failed to update password"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      // In a real app, you'd want to handle this server-side
      // For now, we'll just sign out the user
      await supabase.auth.signOut();
      router.push("/");
      
      showSuccess(
        "Account Deleted",
        "Your account has been deleted successfully"
      );
    } catch (error) {
      console.error("Error deleting account:", error);
      showError(
        "Error",
        "Failed to delete account"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed from this page
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profileForm.full_name}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, full_name: e.target.value })
                    }
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profileForm.phone}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, phone: e.target.value })
                  }
                  placeholder="Enter your phone number"
                />
              </div>


              <div className="flex justify-end">
                <Button onClick={handleProfileSave} disabled={saving}>
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                View your account details and status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Account Created</Label>
                  <p className="text-sm text-muted-foreground">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Account Status</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          {!isSocialLogin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current_password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current_password"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordForm.current_password}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, current_password: e.target.value })
                    }
                    placeholder="Enter current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() =>
                      setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                    }
                  >
                    {showPasswords.current ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordForm.new_password}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, new_password: e.target.value })
                      }
                      placeholder="Enter new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() =>
                        setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                      }
                    >
                      {showPasswords.new ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm_password"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordForm.confirm_password}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirm_password: e.target.value })
                      }
                      placeholder="Confirm new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() =>
                        setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                      }
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handlePasswordChange} disabled={saving}>
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4 mr-2" />
                      Update Password
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
          )}

          {isSocialLogin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Social Login Account
                </CardTitle>
                <CardDescription>
                  Your account is connected via social login
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">Password management is handled by your social provider</p>
                    <p className="text-sm text-muted-foreground">
                      To change your password, please visit your social provider's settings
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Danger Zone */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
                <div>
                  <h4 className="font-medium">Delete Account</h4>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and remove all your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications for important updates
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.email_notifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, email_notifications: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive emails about new features and promotions
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.marketing_emails}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, marketing_emails: checked })
                    }
                  />
                </div>

              </div>

              <div className="flex justify-end">
                <Button onClick={handleNotificationSave} disabled={saving}>
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
