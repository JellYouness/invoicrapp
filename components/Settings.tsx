"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { SettingsService } from "@/lib/settings-service";
import { showSuccess, showError } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Building2,
  CreditCard,
  Bell,
  Globe,
  Hash,
  Upload,
  Save,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Plus,
  Type,
  Calendar,
  Minus,
} from "lucide-react";
import type { SettingsFormData, CustomField } from "@/types/settings";
import {
  DEFAULT_SETTINGS,
  CURRENCY_OPTIONS,
  DATE_FORMAT_OPTIONS,
  PAYMENT_TERMS_OPTIONS,
  TIMEZONE_OPTIONS,
} from "@/types/settings";
import { getThemes } from "@/lib/invoice-themes";

export const Settings = () => {
  const [settings, setSettings] = useState<SettingsFormData>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  // Using enhanced toast helpers
  const router = useRouter();

  useEffect(() => {
    const initializeSettings = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push("/auth");
          return;
        }

        setUser(user);
        const userSettings = await SettingsService.getSettingsWithDefaults(
          user.id
        );
        setSettings(userSettings);
      } catch (error) {
        console.error("Error loading settings:", error);
        showError(
          "Error loading settings",
          "Failed to load your settings. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    initializeSettings();
  }, [router]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await SettingsService.saveUserSettings(user.id, settings);
      showSuccess(
        "Settings saved",
        "Your settings have been updated successfully."
      );
    } catch (error) {
      console.error("Error saving settings:", error);
      showError(
        "Error saving settings",
        "Failed to save your settings. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showError(
        "File too large",
        "Please select an image smaller than 2MB."
      );
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showError(
        "Invalid file type",
        "Please select an image file."
      );
      return;
    }

    try {
      const base64 = await SettingsService.uploadCompanyLogo(user.id, file);
      setSettings((prev) => ({ ...prev, company_logo: base64 }));
      showSuccess(
        "Logo uploaded",
        "Your company logo has been updated."
      );
    } catch (error) {
      console.error("Error uploading logo:", error);
      showError(
        "Upload failed",
        "Failed to upload logo. Please try again."
      );
    }
  };

  const handleResetCounter = async () => {
    if (!user) return;

    try {
      await SettingsService.resetInvoiceCounter(user.id, 1);
      setSettings((prev) => ({ ...prev, invoice_counter: 1 }));
      showSuccess(
        "Counter reset",
        "Invoice counter has been reset to 1."
      );
    } catch (error) {
      console.error("Error resetting counter:", error);
      showError(
        "Reset failed",
        "Failed to reset invoice counter."
      );
    }
  };

  // Custom Fields Management
  const addCustomField = () => {
    const newField: CustomField = {
      id: `field_${Date.now()}`,
      label: "",
      type: "text",
      required: false,
      defaultValue: "",
    };
    setSettings((prev) => ({
      ...prev,
      custom_fields: [...(prev.custom_fields || []), newField],
    }));
  };

  const updateCustomField = (fieldId: string, updates: Partial<CustomField>) => {
    setSettings((prev) => ({
      ...prev,
      custom_fields: (prev.custom_fields || []).map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      ),
    }));
  };

  const removeCustomField = (fieldId: string) => {
    setSettings((prev) => ({
      ...prev,
      custom_fields: (prev.custom_fields || []).filter((field) => field.id !== fieldId),
    }));
  };

  const getFieldIcon = (type: string) => {
    switch (type) {
      case "text":
        return <Type className="h-4 w-4" />;
      case "number":
        return <Hash className="h-4 w-4" />;
      case "date":
        return <Calendar className="h-4 w-4" />;
      default:
        return <Type className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and invoice preferences
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="h-4 w-4" />
            Company
          </TabsTrigger>
          <TabsTrigger value="invoices" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Globe className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="numbering" className="gap-2">
            <Hash className="h-4 w-4" />
            Numbering
          </TabsTrigger>
          <TabsTrigger value="custom-fields" className="gap-2">
            <Plus className="h-4 w-4" />
            Custom Fields
          </TabsTrigger>
        </TabsList>

        {/* Company Information */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Update your business details that will appear on invoices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Logo</Label>
                  <div className="flex items-center gap-4">
                    {settings.company_logo && (
                      <div className="w-16 h-16 border rounded-lg overflow-hidden bg-muted">
                        <img
                          src={settings.company_logo}
                          alt="Company Logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Recommended: 200x200px, max 2MB (PNG, JPG, SVG)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    value={settings.company_name}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        company_name: e.target.value,
                      }))
                    }
                    placeholder="Your Company Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_email">Company Email</Label>
                  <Input
                    id="company_email"
                    type="email"
                    value={settings.company_email}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        company_email: e.target.value,
                      }))
                    }
                    placeholder="contact@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_phone">Phone Number</Label>
                  <Input
                    id="company_phone"
                    value={settings.company_phone}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        company_phone: e.target.value,
                      }))
                    }
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_website">Website</Label>
                  <Input
                    id="company_website"
                    value={settings.company_website}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        company_website: e.target.value,
                      }))
                    }
                    placeholder="https://www.company.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_address">Address</Label>
                  <Textarea
                    id="company_address"
                    value={settings.company_address}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        company_address: e.target.value,
                      }))
                    }
                    placeholder="123 Business St, City, State 12345"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoice Defaults */}
        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Defaults</CardTitle>
              <CardDescription>
                Set default values for new invoices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default_theme">Default Theme</Label>
                  <Select
                    value={settings.default_theme}
                    onValueChange={(value) =>
                      setSettings((prev) => ({ ...prev, default_theme: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getThemes().map((theme) => (
                        <SelectItem key={theme.id} value={theme.id}>
                          {theme.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default_currency">Default Currency</Label>
                  <Select
                    value={settings.default_currency}
                    onValueChange={(value) =>
                      setSettings((prev) => ({
                        ...prev,
                        default_currency: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default_tax_rate">Default Tax Rate (%)</Label>
                  <Input
                    id="default_tax_rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={settings.default_tax_rate}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        default_tax_rate: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default_payment_terms">
                    Default Payment Terms
                  </Label>
                  <Select
                    value={settings.default_payment_terms}
                    onValueChange={(value) =>
                      setSettings((prev) => ({
                        ...prev,
                        default_payment_terms: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_TERMS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default_notes">Default Notes</Label>
                <Textarea
                  id="default_notes"
                  value={settings.default_notes}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      default_notes: e.target.value,
                    }))
                  }
                  placeholder="Thank you for your business!"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose what notifications you'd like to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive general email notifications
                  </p>
                </div>
                <Switch
                  checked={settings.email_notifications}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      email_notifications: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Payment Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about overdue invoices
                  </p>
                </div>
                <Switch
                  checked={settings.payment_reminders}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      payment_reminders: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Invoice Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications when invoices are viewed or paid
                  </p>
                </div>
                <Switch
                  checked={settings.invoice_updates}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      invoice_updates: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about new features and tips
                  </p>
                </div>
                <Switch
                  checked={settings.marketing_emails}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      marketing_emails: checked,
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Display Preferences</CardTitle>
              <CardDescription>
                Customize how information is displayed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_format">Date Format</Label>
                  <Select
                    value={settings.date_format}
                    onValueChange={(value) =>
                      setSettings((prev) => ({ ...prev, date_format: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DATE_FORMAT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings.timezone}
                    onValueChange={(value) =>
                      setSettings((prev) => ({ ...prev, timezone: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="number_format">Number Format</Label>
                  <Select
                    value={settings.number_format}
                    onValueChange={(value) =>
                      setSettings((prev) => ({ ...prev, number_format: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">US (1,234.56)</SelectItem>
                      <SelectItem value="EU">EU (1.234,56)</SelectItem>
                      <SelectItem value="IN">IN (1,23,456.78)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={settings.language}
                    onValueChange={(value) =>
                      setSettings((prev) => ({ ...prev, language: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoice Numbering */}
        <TabsContent value="numbering" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Numbering</CardTitle>
              <CardDescription>
                Configure how invoice numbers are generated
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice_prefix">Invoice Prefix</Label>
                  <Input
                    id="invoice_prefix"
                    value={settings.invoice_prefix}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        invoice_prefix: e.target.value,
                      }))
                    }
                    placeholder="INV"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoice_counter">Next Invoice Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="invoice_counter"
                      type="number"
                      min="1"
                      value={settings.invoice_counter}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          invoice_counter: parseInt(e.target.value) || 1,
                        }))
                      }
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetCounter}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoice_number_format">Number Format</Label>
                <Select
                  value={settings.invoice_number_format}
                  onValueChange={(value) =>
                    setSettings((prev) => ({
                      ...prev,
                      invoice_number_format: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="{prefix}-{number}">INV-0001</SelectItem>
                    <SelectItem value="{prefix}{number}">INV0001</SelectItem>
                    <SelectItem value="{prefix}_{number}">INV_0001</SelectItem>
                    <SelectItem value="{number}">0001</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Preview</span>
                </div>
                <Badge variant="outline" className="text-sm">
                  {settings.invoice_number_format
                    .replace("{prefix}", settings.invoice_prefix)
                    .replace(
                      "{number}",
                      settings.invoice_counter.toString().padStart(4, "0")
                    )}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Fields */}
        <TabsContent value="custom-fields" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom Fields</CardTitle>
              <CardDescription>
                Add custom fields to collect additional information on your invoices. These fields will appear on the left side of the totals section.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!settings.custom_fields || settings.custom_fields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">
                    No custom fields configured. Add your first custom field to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {settings.custom_fields && settings.custom_fields.map((field, index) => (
                    <Card key={field.id} className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getFieldIcon(field.type)}
                            <span className="font-medium">Field {index + 1}</span>
                            <Badge variant="outline" className="text-xs">
                              {field.type}
                            </Badge>
                            {field.required && (
                              <Badge variant="destructive" className="text-xs">
                                Required
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCustomField(field.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Field Label</Label>
                            <Input
                              value={field.label}
                              onChange={(e) =>
                                updateCustomField(field.id, { label: e.target.value })
                              }
                              placeholder="Enter field label"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Field Type</Label>
                            <Select
                              value={field.type}
                              onValueChange={(value: "text" | "number" | "date") =>
                                updateCustomField(field.id, { type: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Default Value (Optional)</Label>
                            <Input
                              value={field.defaultValue}
                              onChange={(e) =>
                                updateCustomField(field.id, { defaultValue: e.target.value })
                              }
                              placeholder="Enter default value"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Required Field</Label>
                            <div className="flex items-center space-x-2 pt-2">
                              <Switch
                                checked={field.required}
                                onCheckedChange={(checked) =>
                                  updateCustomField(field.id, { required: checked })
                                }
                              />
                              <span className="text-sm text-muted-foreground">
                                {field.required ? "Required" : "Optional"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
              
              <div className="flex justify-center pt-4">
                <Button onClick={addCustomField} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Custom Field
                </Button>
              </div>
              
              {settings.custom_fields && settings.custom_fields.length > 0 && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium mb-1">Custom Fields Preview:</p>
                      <p>
                        These fields will appear on the left side of the totals section in your invoice preview. 
                        Required fields must be filled before proceeding to the final step.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
