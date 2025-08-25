import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Save,
  CheckCircle,
  Lock,
  LogOut,
} from "lucide-react";
import { ThemeSelection } from "./invoice/ThemeSelection";
import { ClientInformation } from "./invoice/ClientInformation";
import { InvoiceItems } from "./invoice/InvoiceItems";
import { CustomFields } from "./invoice/CustomFields";
import { InvoicePreview } from "./invoice/InvoicePreview";
import { getDefaultTheme } from "@/lib/invoice-themes";
import {
  saveInvoice,
  convertInvoiceDataToSaveFormat,
  type SavedInvoice,
} from "@/lib/invoice-service";
import { saveClient, CreateClientData } from "@/lib/client-service";
import { showSuccess, showError } from "@/hooks/use-toast";
import { BlockingUpgradeDialog } from "@/components/ui/BlockingUpgradeDialog";
import { useUsage } from "@/contexts/UsageContext";
import { getThemeById } from "@/lib/invoice-themes";
import { getEditingLogo } from "@/lib/logo-utils";
import { supabase } from "@/integrations/supabase/client";
import { calculateDueDate } from "@/lib/format-utils";
import { checkUserSettingsConfigured, type SettingsValidationResult } from "@/lib/settings-validation";
import type {
  InvoiceTheme,
  ClientInfo,
  InvoiceItem,
  InvoiceData,
  CustomFieldValue,
} from "@/types/invoice";
import type { CustomField } from "@/types/settings";
import { useRouter } from "next/navigation";
import { SettingsService } from "@/lib/settings-service";
import { SettingsRequiredDialog } from "@/components/ui/SettingsRequiredDialog";

const steps = [
  { id: 1, title: "Choose Theme", description: "Select your invoice design" },
  { id: 2, title: "Client Info", description: "Add client details" },
  { id: 3, title: "Invoice Items", description: "Add products/services" },
  { id: 4, title: "Custom Fields", description: "Add additional information" },
  { id: 5, title: "Preview", description: "Review and generate" },
];

interface InvoiceGeneratorProps {
  editingInvoice?: SavedInvoice;
  onInvoiceSaved?: () => void;
}

export const InvoiceGenerator = ({
  editingInvoice,
  onInvoiceSaved,
}: InvoiceGeneratorProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isNewClient, setIsNewClient] = useState(false);
  const [showBlockingDialog, setShowBlockingDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [settingsValidation, setSettingsValidation] = useState<SettingsValidationResult | null>(null);
  const { usage, refreshUsage } = useUsage();
  const isLimitReached = usage ? usage.current >= usage.limit : false;
  const router = useRouter();

  useEffect(() => {
    // if user reached the limit show the dialog
    if (isLimitReached) {
      setShowBlockingDialog(true);
    }
  }, [isLimitReached]);


  // Initialize default invoice data with user settings
  useEffect(() => {
    const initializeInvoiceData = async () => {
      try {
        console.log('Starting invoice initialization...');
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        console.log('User:', user?.id);

        // Check user settings first (only for new invoices, not when editing)
        if (user && !editingInvoice) {
          console.log('Checking user settings for user:', user.id);
          const validation = await checkUserSettingsConfigured(user.id);
          console.log('Settings validation result:', validation);
          setSettingsValidation(validation);
          
          // Show settings dialog if critical fields are missing
          if (!validation.isValid) {
            console.log('Settings invalid, showing dialog');
            setShowSettingsDialog(true);
          }
        }

        console.log('Proceeding with invoice initialization...');

        let defaultTheme = await getDefaultTheme();
        let invoiceNumber = `INV-${Date.now()}`;
        let defaultNotes = "";

        // Load user settings if user is authenticated
        if (user) {
          const userSettings = await SettingsService.getSettingsWithDefaults(
            user.id
          );

          // Load custom fields
          setCustomFields(userSettings.custom_fields || []);

          // Use user's default theme if available
          if (userSettings.default_theme) {
            const userTheme = await getThemeById(userSettings.default_theme);
            if (userTheme) {
              defaultTheme = userTheme;
            }
          }

          // Generate invoice number based on user settings
          if (
            userSettings.invoice_prefix &&
            userSettings.invoice_counter &&
            userSettings.invoice_number_format
          ) {
            invoiceNumber = userSettings.invoice_number_format
              .replace("{prefix}", userSettings.invoice_prefix)
              .replace(
                "{number}",
                userSettings.invoice_counter.toString().padStart(4, "0")
              );
          }

          // Use default notes from settings
          defaultNotes = userSettings.default_notes || "";
        }

        const defaultData: InvoiceData = {
          theme: defaultTheme,
          client: { name: "", address: "", email: "", phone: "" },
          items: [{ id: "1", description: "", quantity: 1, price: 0 }],
          invoiceNumber,
          date: new Date().toISOString().split("T")[0],
          dueDate: calculateDueDate(
            new Date().toISOString().split("T")[0],
            user
              ? (await SettingsService.getSettingsWithDefaults(user.id))
                  .default_payment_terms
              : "Net 30"
          ),
          notes: defaultNotes,
          currency: user
            ? (await SettingsService.getSettingsWithDefaults(user.id))
                .default_currency
            : "USD",
          paymentTerms: user
            ? (await SettingsService.getSettingsWithDefaults(user.id))
                .default_payment_terms
            : "Net 30",
          taxRate: user
            ? (await SettingsService.getSettingsWithDefaults(user.id))
                .default_tax_rate
            : 0,
          customFields: [],
          dynamicFields: [],
        };
        setInvoiceData(defaultData);
      } catch (error) {
        console.error("Error initializing invoice data:", error);
        // Fallback to basic defaults
        const defaultTheme = await getDefaultTheme();
        const defaultData: InvoiceData = {
          theme: defaultTheme,
          client: { name: "", address: "", email: "", phone: "" },
          items: [{ id: "1", description: "", quantity: 1, price: 0 }],
          invoiceNumber: `INV-${Date.now()}`,
          date: new Date().toISOString().split("T")[0],
          dueDate: calculateDueDate(
            new Date().toISOString().split("T")[0],
            "Net 30"
          ),
          currency: "USD",
          paymentTerms: "Net 30",
          taxRate: 0,
          customFields: [],
          dynamicFields: [],
        };
        setInvoiceData(defaultData);
      }
    };

    initializeInvoiceData();
  }, []);

  // Effect to load editing invoice data
  useEffect(() => {
    if (editingInvoice && invoiceData) {
      const loadEditingInvoice = async () => {
        const theme = await getThemeById(editingInvoice.theme_id);
        if (theme) {
          setInvoiceData({
            theme,
            client: {
              name: editingInvoice.client_name,
              address: editingInvoice.client_address,
              email: editingInvoice.client_email || undefined,
              phone: editingInvoice.client_phone || undefined,
            },
            items: editingInvoice.items,
            invoiceNumber: editingInvoice.invoice_number,
            date: editingInvoice.invoice_date,
            dueDate: editingInvoice.due_date,
            currency: "USD",
            paymentTerms: "Net 30",
            notes: editingInvoice.notes || undefined,
            taxRate:
              editingInvoice.tax_amount && editingInvoice.subtotal > 0
                ? (editingInvoice.tax_amount / editingInvoice.subtotal) * 100
                : 0,
            customFields: editingInvoice.custom_fields || [],
          });
          setCurrentStep(5); // Go to preview step when editing
        }
      };

      loadEditingInvoice();
    }
  }, [editingInvoice, invoiceData]);

  const updateInvoiceData = (field: keyof InvoiceData, value: any) => {
    setInvoiceData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const nextStep = async () => {
    // If on step 2 (client info) and it's a new client, save the client first
    if (currentStep === 2 && isNewClient && invoiceData?.client) {
      const clientData: CreateClientData = {
        name: invoiceData.client.name.trim(),
        address: invoiceData.client.address.trim(),
        email: invoiceData.client.email?.trim() || undefined,
        phone: invoiceData.client.phone?.trim() || undefined,
        tax_number: invoiceData.client.tax_number?.trim() || undefined,
        website: invoiceData.client.website?.trim() || undefined,
      };

      const savedClient = await saveClient(clientData);
      
      if (savedClient) {
        showSuccess(
          "Client Saved!",
          `${savedClient.name} has been saved to your client list.`
        );
      } else {
        showError(
          "Save Failed",
          "There was an error saving the client. Please try again."
        );
        return; // Don't proceed to next step if save failed
      }
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    if (!invoiceData) return false;

    switch (currentStep) {
      case 1:
        return invoiceData.theme?.id !== "";
      case 2:
        return invoiceData.client?.name && invoiceData.client?.address;
      case 3:
        return invoiceData.items?.length > 0;
      case 4:
        // Check if all required custom fields are filled
        const requiredFields = customFields.filter((field) => field.required);
        const customFieldValues = invoiceData.customFields || [];
        return requiredFields.every((field) => {
          const fieldValue = customFieldValues.find(
            (cfv) => cfv.fieldId === field.id
          );
          return fieldValue && fieldValue.value.trim() !== "";
        });
      default:
        return true;
    }
  };

  const handleSaveInvoice = async () => {
    setIsSaving(true);
    try {
      const invoiceToSave = convertInvoiceDataToSaveFormat(invoiceData);
      const result = await saveInvoice(invoiceToSave);

      if (result.success && result.invoice) {
        // Increment invoice counter in user settings after successful save
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          try {
            const userSettings = await SettingsService.getSettingsWithDefaults(
              user.id
            );
            await SettingsService.saveUserSettings(user.id, {
              invoice_counter: userSettings.invoice_counter + 1,
            });
          } catch (error) {
            console.error("Error updating invoice counter:", error);
          }
        }

        setIsSaved(true);
        showSuccess(
          "Invoice Saved Successfully!",
          `Invoice ${invoiceData.invoiceNumber} has been saved to your history.`
        );

        // Call the callback if provided
        onInvoiceSaved?.();

        // Refresh usage data after successful save
        await refreshUsage();
        router.push(`/dashboard/invoices`);
      } else {
        showError(
          "Error Saving Invoice",
          result.error ||
            "There was an error saving your invoice. Please try again."
        );
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      showError(
        "Error Saving Invoice",
        "There was an error saving your invoice. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const renderStepContent = () => {
    if (!invoiceData) {
      return (
        <div className="flex items-center justify-center h-64">Loading...</div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <ThemeSelection
            selectedTheme={invoiceData.theme}
            onThemeSelect={(theme) => updateInvoiceData("theme", theme)}
          />
        );
      case 2:
        return (
          <ClientInformation
            clientInfo={invoiceData.client}
            onClientUpdate={(client) => updateInvoiceData("client", client)}
            onClientModeChange={setIsNewClient}
          />
        );
      case 3:
        return (
          <InvoiceItems
            items={invoiceData.items}
            onItemsUpdate={(items) => updateInvoiceData("items", items)}
            taxRate={invoiceData.taxRate}
            onTaxRateUpdate={(taxRate) => updateInvoiceData("taxRate", taxRate)}
          />
        );
      case 4:
        return (
          <CustomFields
            customFields={customFields}
            customFieldValues={invoiceData.customFields || []}
            onCustomFieldValuesChange={(values) =>
              updateInvoiceData("customFields", values)
            }
            dynamicFields={invoiceData.dynamicFields || []}
            onDynamicFieldsChange={(fields) =>
              updateInvoiceData("dynamicFields", fields)
            }
          />
        );
      case 5:
        return (
          <InvoicePreview
            invoiceData={invoiceData}
            isSaved={isSaved}
            onSaveStateChange={setIsSaved}
            onInvoiceSaved={onInvoiceSaved}
          />
        );
      default:
        return null;
    }
  };

  if (!invoiceData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading invoice generator...</p>
        </div>
      </div>
    );
  }

  const handleGoToSettings = () => {
    setShowSettingsDialog(false);
    router.push("/dashboard/settings");
  };

  const handleContinueWithoutSettings = async () => {
    setShowSettingsDialog(false);
    
    // Initialize invoice data even without complete settings
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let defaultTheme = await getDefaultTheme();
      let invoiceNumber = `INV-${Date.now()}`;
      let defaultNotes = "";

      if (user) {
        const userSettings = await SettingsService.getSettingsWithDefaults(user.id);
        setCustomFields(userSettings.custom_fields || []);

        if (userSettings.default_theme) {
          const userTheme = await getThemeById(userSettings.default_theme);
          if (userTheme) {
            defaultTheme = userTheme;
          }
        }

        if (
          userSettings.invoice_prefix &&
          userSettings.invoice_counter &&
          userSettings.invoice_number_format
        ) {
          invoiceNumber = userSettings.invoice_number_format
            .replace("{prefix}", userSettings.invoice_prefix)
            .replace(
              "{number}",
              userSettings.invoice_counter.toString().padStart(4, "0")
            );
        }

        defaultNotes = userSettings.default_notes || "";
      }

      const defaultData: InvoiceData = {
        theme: defaultTheme,
        client: { name: "", address: "", email: "", phone: "" },
        items: [{ id: "1", description: "", quantity: 1, price: 0 }],
        invoiceNumber,
        date: new Date().toISOString().split("T")[0],
        dueDate: calculateDueDate(
          new Date().toISOString().split("T")[0],
          user
            ? (await SettingsService.getSettingsWithDefaults(user.id))
                .default_payment_terms
            : "Net 30"
        ),
        notes: defaultNotes,
        currency: user
          ? (await SettingsService.getSettingsWithDefaults(user.id))
              .default_currency
          : "USD",
        paymentTerms: user
          ? (await SettingsService.getSettingsWithDefaults(user.id))
              .default_payment_terms
          : "Net 30",
        taxRate: user
          ? (await SettingsService.getSettingsWithDefaults(user.id))
              .default_tax_rate
          : 0,
        customFields: [],
        dynamicFields: [],
      };

      setInvoiceData(defaultData);
    } catch (error) {
      console.error("Error initializing invoice data:", error);
      showError("Failed to initialize invoice data");
    }
  };

  return (
    <div className="h-full relative">
      <div className="mx-auto h-full">
        <div
          className={`flex flex-col lg:flex-row gap-4 lg:gap-8 h-full ${
            isLimitReached ? "blur-sm pointer-events-none" : ""
          }`}
        >
          {/* Left Sidebar - Vertical Steps Progress */}
          <div className="w-full lg:w-80 lg:flex-shrink-0 lg:h-full">
            <Card className="pt-4 pb-1 px-1 lg:p-6 bg-gradient-to-b from-card to-muted/20 lg:sticky lg:top-0 shadow-lg lg:h-full border-primary/30 lg:flex lg:flex-col lg:justify-center">
              {/* <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold text-foreground">
                  Invoice Generator
                </h2>
              </div> */}

              {/* Mobile: Horizontal Steps */}
              <div className="lg:hidden">
                <div className="flex justify-between items-center">
                  {steps.map((step, index) => (
                    <div
                      key={step.id}
                      className="flex items-center flex-1 h-20 relative"
                    >
                      <div className="flex flex-col items-center flex-1 h-20">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                            currentStep >= step.id
                              ? "bg-primary text-primary-foreground shadow-lg"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {step.id}
                        </div>
                        <p
                          className={`text-xs mt-1 text-center ${
                            currentStep >= step.id
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {step.title}
                        </p>
                      </div>
                      {index < steps.length - 1 && (
                        <div className="absolute top-4 -right-1 sm:-right-5 md:-right-8 w-3 sm:w-10 md:w-16 h-0.5 bg-border z-10" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop: Vertical Steps */}
              <div className="hidden lg:block space-y-16">
                {steps.map((step, index) => (
                  <div key={step.id} className="relative">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 flex-shrink-0 ${
                          currentStep >= step.id
                            ? "bg-primary text-primary-foreground shadow-lg"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {step.id}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium ${
                            currentStep >= step.id
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {step.title}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {/* Vertical connector line */}
                    {index < steps.length - 1 && (
                      <div className="absolute left-5 top-[48px] w-0.5 h-14 bg-border" />
                    )}
                  </div>
                ))}
              </div>

              {/* <div className="mt-6">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span>Progress</span>
                  <span>{Math.round((currentStep / steps.length) * 100)}%</span>
                </div>
                <Progress value={(currentStep / steps.length) * 100} className="h-2" />
              </div> */}
            </Card>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 flex flex-col lg:h-full overflow-y-auto">
            {/* Step Content */}
            <Card className="p-4 sm:p-6 lg:p-8 shadow-lg flex-1 h-[85%] lg:h-[90%] border-primary/30">
              {renderStepContent()}
            </Card>

            {/* Navigation */}
            <div className="flex justify-between mt-4 lg:mt-6 pb-safe lg:pb-0 z-[2]">
              <>
                {!isLimitReached && (
                  <>
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                      className="flex items-center gap-2"
                      size="sm"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Prev</span>
                    </Button>

                    <div className="flex items-center gap-2">
                      {isSaved && (
                        <Button
                          variant="outline"
                          onClick={() => router.push("/dashboard/invoices")}
                          className="flex items-center gap-2"
                          size="sm"
                        >
                          <LogOut className="w-4 h-4" />
                          Exit
                        </Button>
                      )}
                      {currentStep < steps.length ? (
                        <Button
                          onClick={nextStep}
                          disabled={
                            !invoiceData || (invoiceData && !canProceed())
                          }
                          className="flex items-center gap-2"
                          size="sm"
                        >
                          <span className="hidden sm:inline">
                            {currentStep === 2 && isNewClient
                              ? "Save Client & Next"
                              : "Next"}
                          </span>
                          <span className="sm:hidden">Next</span>
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          onClick={handleSaveInvoice}
                          disabled={isSaving || isSaved}
                          className="flex items-center gap-2"
                          size="sm"
                        >
                          {isSaving ? (
                            <>
                              <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              Saving...
                            </>
                          ) : isSaved ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Saved!
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              <span className="hidden sm:inline">
                                Save Invoice
                              </span>
                              <span className="sm:hidden">Save</span>
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </>
            </div>
          </div>
        </div>
      </div>

      {/* Lock Overlay when limit reached */}
      {isLimitReached && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/80 backdrop-blur-sm">
          <div className="text-center p-8 bg-card rounded-lg shadow-lg border border-primary/20 max-w-md mx-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Invoice Limit Reached
            </h3>
            <p className="text-muted-foreground mb-4">
              You've used {usage?.current || 0}/{usage?.limit || 0} invoices
              this month. Upgrade to Pro to continue creating invoices.
            </p>
            <Button
              onClick={() => setShowBlockingDialog(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Lock className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
          </div>
        </div>
      )}

      {/* Blocking Upgrade Dialog */}
      <BlockingUpgradeDialog
        isOpen={showBlockingDialog}
        onUpgrade={() => {
          // TODO: Implement actual upgrade flow
          console.log("Upgrade to Pro clicked from blocking dialog");
          setShowBlockingDialog(false);
        }}
        currentUsage={usage?.current || 0}
        onClose={() => setShowBlockingDialog(false)}
        limit={usage?.limit || 0}
      />

      {/* Settings Dialog */}
      <SettingsRequiredDialog
        open={showSettingsDialog && settingsValidation !== null}
        onOpenChange={setShowSettingsDialog}
        validationResult={settingsValidation || { isValid: true, missingFields: [], criticalMissing: [] }}
        onGoToSettings={handleGoToSettings}
        onContinueAnyway={settingsValidation && settingsValidation.criticalMissing.length === 0 ? handleContinueWithoutSettings : undefined}
      />
    </div>
  );
};
