import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download, Printer, Send, Eye, Maximize2 } from "lucide-react";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  calculateInvoiceTotals,
} from "@/lib/format-utils";
import { SettingsService } from "@/lib/settings-service";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useRef } from "react";
import type { InvoiceData } from "@/types/invoice";
import type { SettingsFormData } from "@/types/settings";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import {
  saveInvoice,
  convertInvoiceDataToSaveFormat,
} from "@/lib/invoice-service";
import { showSuccess, showError } from "@/hooks/use-toast";
// Theme styles are now included in the invoiceData.theme object
interface InvoicePreviewProps {
  invoiceData: InvoiceData;
  onInvoiceSaved?: () => void;
  isSaved?: boolean;
  onSaveStateChange?: (saved: boolean) => void;
}

export const InvoicePreview = ({
  invoiceData,
  onInvoiceSaved,
  isSaved = false,
  onSaveStateChange,
}: InvoicePreviewProps) => {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userSettings, setUserSettings] = useState<SettingsFormData | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [hasBeenSaved, setHasBeenSaved] = useState(isSaved);
  // Using enhanced toast helpers

  // Update local save state when prop changes
  useEffect(() => {
    setHasBeenSaved(isSaved);
  }, [isSaved]);

  // Load user settings for formatting
  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const settings = await SettingsService.getSettingsWithDefaults(
            user.id
          );
          setUserSettings(settings);
        }
      } catch (error) {
        console.error("Error loading user settings:", error);
      }
    };

    loadUserSettings();
  }, []);

  // Inject theme's custom CSS into the page
  useEffect(() => {
    const themeId = invoiceData.theme.id;
    const existingStyle = document.getElementById(`theme-${themeId}`);

    if (!existingStyle && invoiceData.theme.customCSS) {
      const styleElement = document.createElement("style");
      styleElement.id = `theme-${themeId}`;
      styleElement.textContent = invoiceData.theme.customCSS;
      document.head.appendChild(styleElement);
    }

    // Cleanup function to remove old theme styles
    return () => {
      const allThemeStyles = document.querySelectorAll('[id^="theme-"]');
      allThemeStyles.forEach((style) => {
        if (style.id !== `theme-${themeId}`) {
          style.remove();
        }
      });
    };
  }, [invoiceData.theme.id, invoiceData.theme.customCSS]);

  const saveInvoiceIfNeeded = async (): Promise<boolean> => {
    // If already saved, don't save again
    if (hasBeenSaved) {
      return true;
    }

    setIsSaving(true);
    try {
      const invoiceToSave = convertInvoiceDataToSaveFormat(invoiceData);
      const savedInvoice = await saveInvoice(invoiceToSave);

      if (savedInvoice) {
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

        setHasBeenSaved(true);
        onSaveStateChange?.(true);

        showSuccess(
          "Invoice Saved Successfully!",
          `Invoice ${invoiceData.invoiceNumber} has been saved to your history.`
        );

        onInvoiceSaved?.();
        return true;
      } else {
        showError(
          "Error Saving Invoice",
          "There was an error saving your invoice. Please try again."
        );
        return false;
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      showError(
        "Error Saving Invoice",
        "There was an error saving your invoice. Please try again."
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const DownloadInvoice = async () => {
    if (!pdfRef.current) return;

    // Save invoice first
    const saveSuccess = await saveInvoiceIfNeeded();
    if (!saveSuccess) return;

    try {
      // Capture the element as a canvas with high quality
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      // Create PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");

      // Calculate dimensions to fit the page
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Calculate scaling to fit the page while maintaining aspect ratio
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;

      // Center the image on the page
      const x = (pdfWidth - scaledWidth) / 2;
      const y = (pdfHeight - scaledHeight) / 2;

      pdf.addImage(imgData, "PNG", x, y, scaledWidth, scaledHeight);
      pdf.save("invoice.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const PrintInvoice = async () => {
    if (!pdfRef.current) return;

    // Save invoice first
    const saveSuccess = await saveInvoiceIfNeeded();
    if (!saveSuccess) return;

    try {
      // Use the same html2canvas approach as PDF generation for consistency
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      // Create a new window for printing
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      // Convert canvas to image
      const imgData = canvas.toDataURL("image/png");

      // Create print-optimized HTML with the captured image
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              @page {
                margin: 0;
                size: A4;
              }
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                margin: 0;
                padding: 0;
                background: white;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
              }
              .print-image {
                max-width: 100%;
                max-height: 100vh;
                width: auto;
                height: auto;
                object-fit: contain;
              }
              @media print {
                body {
                  margin: 0;
                  padding: 0;
                }
                .print-image {
                  max-width: 100%;
                  max-height: 100%;
                  width: auto;
                  height: auto;
                }
              }
            </style>
          </head>
          <body>
            <img src="${imgData}" alt="Invoice" class="print-image" />
          </body>
        </html>
      `);

      printWindow.document.close();

      // Wait for content to load, then print
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      };
    } catch (error) {
      console.error("Error generating print preview:", error);
    }
  };

  const calculateSubtotal = () => {
    return invoiceData.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return subtotal * ((invoiceData.taxRate || 0) / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  // Use theme styles directly from invoiceData
  const themeStyles = invoiceData.theme.styles;

  // Component for the full invoice content
  const FullInvoiceContent = () => (
    <Card
      ref={pdfRef}
      className="p-8 shadow-lg bg-white"
      style={{ width: "210mm", minHeight: "297mm", aspectRatio: "210/297" }}
    >
      {/* Header */}
      <div
        className={`invoice-header-${invoiceData.theme.id} -m-8 px-8 py-6 mb-6`}
      >
        <div className="flex justify-between items-start">
          {/* User/Company Information */}
          <div className="text-left text-white/90">
            <div className="space-y-1">
              <p className="font-bold text-2xl">
                {userSettings?.company_name || "Your Company Name"}
              </p>
              {userSettings?.company_email && (
                <p className="text-sm">{userSettings.company_email}</p>
              )}
              {userSettings?.company_phone && (
                <p className="text-sm">{userSettings.company_phone}</p>
              )}
              {userSettings?.company_address && (
                <p className="text-sm whitespace-pre-line">
                  {userSettings.company_address}
                </p>
              )}
              {userSettings?.company_website && (
                <p className="text-sm">{userSettings.company_website}</p>
              )}
            </div>
          </div>

          {/* Logo & Invoice Number */}
          <div className="text-right text-white/90">
            <div className="space-y-4 flex flex-col items-end">
              {userSettings?.company_logo && (
                <div className="flex-shrink-0">
                  <img
                    src={userSettings.company_logo}
                    alt="Company Logo"
                    className="w-16 h-16 object-contain"
                  />
                </div>
              )}
              <div className="text-right">
                <p className="text-sm text-white/70">Invoice Number</p>
                <p className="font-mono font-semibold text-lg">
                  {invoiceData.invoiceNumber}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
            Bill To
          </h3>
          <div className="space-y-1">
            <p className="font-semibold text-lg">{invoiceData.client.name}</p>
            {invoiceData.client.email && (
              <p className="text-muted-foreground">
                {invoiceData.client.email}
              </p>
            )}
            {invoiceData.client.phone && (
              <p className="text-muted-foreground">
                {invoiceData.client.phone}
              </p>
            )}
            <p className="text-muted-foreground whitespace-pre-line">
              {invoiceData.client.address}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Invoice Date</p>
            <p className="font-semibold">
              {userSettings
                ? formatDate(invoiceData.date, userSettings.date_format)
                : new Date(invoiceData.date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Due Date</p>
            <p className="font-semibold">
              {userSettings
                ? formatDate(invoiceData.dueDate, userSettings.date_format)
                : new Date(invoiceData.dueDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <Separator className="my-2" />

      {/* Items Table */}
      <div className="">
        <div className="overflow-x-auto rounded-sm border">
          <table className="w-full">
            <thead>
              <tr className={`invoice-table-${invoiceData.theme.id}`}>
                <th className="text-left p-3 font-semibold text-white">
                  Description
                </th>
                <th className="text-center p-3 font-semibold w-20 text-white">
                  Qty
                </th>
                <th className="text-right p-3 font-semibold w-24 text-white">
                  Price
                </th>
                <th className="text-right p-3 font-semibold w-24 text-white">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map((item, index) => (
                <tr
                  key={item.id}
                  className={`invoice-item-row-${invoiceData.theme.id} ${
                    index % 2 === 0 ? "bg-muted/60" : ""
                  }`}
                >
                  <td className="px-3 py-2.5 border-b">
                    <p className="whitespace-pre-line">{item.description}</p>
                  </td>
                  <td className="px-3 py-2.5 border-b text-center">
                    {userSettings
                      ? formatNumber(item.quantity, userSettings.number_format)
                      : item.quantity}
                  </td>
                  <td className="px-3 py-2.5 border-b text-right">
                    {userSettings
                      ? formatCurrency(
                          item.price,
                          userSettings.default_currency
                        )
                      : `$${item.price.toFixed(2)}`}
                  </td>
                  <td className="px-3 py-2.5 border-b text-right font-semibold">
                    {userSettings
                      ? formatCurrency(
                          item.quantity * item.price,
                          userSettings.default_currency
                        )
                      : `$${(item.quantity * item.price).toFixed(2)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Fields and Totals */}
      <div className="flex justify-between mt-8">
        {/* Custom Fields - Left Side */}
        <div className="w-64 space-y-3">
          {invoiceData.customFields &&
            invoiceData.customFields.length > 0 &&
            userSettings?.custom_fields && (
              <>
                <h4 className="font-semibold text-md text-muted-foreground uppercase tracking-wide">
                  Additional Information
                </h4>
                <div className="space-y-2">
                  {invoiceData.customFields.map((fieldValue) => {
                    const fieldDefinition = userSettings.custom_fields?.find(
                      (cf) => cf.id === fieldValue.fieldId
                    );
                    if (!fieldDefinition || !fieldValue.value) return null;

                    return (
                      <div
                        key={fieldValue.fieldId}
                        className="flex flex-row items-center gap-2"
                      >
                        <span className="text-sm text-muted-foreground font-semibold">
                          {fieldDefinition.label}:
                        </span>
                        <span className="text-md text-black font-semibold">
                          {fieldValue.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
        </div>

        {/* Totals - Right Side */}
        <div className="w-64 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="font-semibold">
              {userSettings
                ? formatCurrency(
                    calculateSubtotal(),
                    userSettings.default_currency
                  )
                : `$${calculateSubtotal().toFixed(2)}`}
            </span>
          </div>
          {invoiceData.taxRate && invoiceData.taxRate > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                Tax ({invoiceData.taxRate}%):
              </span>
              <span className="font-semibold">
                {userSettings
                  ? formatCurrency(
                      calculateTax(),
                      userSettings.default_currency
                    )
                  : `$${calculateTax().toFixed(2)}`}
              </span>
            </div>
          )}
          <Separator />
          <div
            className={`invoice-total-${invoiceData.theme.id} flex justify-between items-center py-3 px-4`}
          >
            <span className="font-bold text-lg">Total:</span>
            <span className="font-bold text-xl">
              {userSettings
                ? formatCurrency(
                    calculateTotal(),
                    userSettings.default_currency
                  )
                : `$${calculateTotal().toFixed(2)}`}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      {/* <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
        <p>Thank you for your business!</p>
        <p className="mt-2">
          This invoice was generated using Invoice Generator
        </p>
      </div> */}
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Eye className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Invoice Preview</h2>
      </div>
      {/* A4 Paper Preview */}
      <div className="flex justify-center bg-gray-100 rounded-lg h-[45vh] w-60 mx-auto relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 overflow-hidden">
          <div
            className="bg-white shadow-2xl border border-gray-200"
            style={{
              width: "210mm",
              // minHeight: "297mm",
              aspectRatio: "210/297",
              boxShadow:
                "0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.05)",
              borderRadius: "2px",
              transform: "scale(0.26)",
            }}
          >
            <div className="p-8">
              <div className="space-y-8">
                {/* Header */}
                <div
                  className={`invoice-header-${invoiceData.theme.id} -m-8 px-8 py-6 mb-6`}
                >
                  <div className="flex justify-between items-start">
                    {/* User/Company Information */}
                    <div className="text-left text-white/90">
                      <div className="space-y-1">
                        <p className="font-bold text-2xl">
                          {userSettings?.company_name || "Your Company Name"}
                        </p>
                        {userSettings?.company_email && (
                          <p className="text-sm">
                            {userSettings.company_email}
                          </p>
                        )}
                        {userSettings?.company_phone && (
                          <p className="text-sm">
                            {userSettings.company_phone}
                          </p>
                        )}
                        {userSettings?.company_address && (
                          <p className="text-sm whitespace-pre-line">
                            {userSettings.company_address}
                          </p>
                        )}
                        {userSettings?.company_website && (
                          <p className="text-sm">
                            {userSettings.company_website}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Logo & Invoice Number */}
                    <div className="text-right text-white/90">
                      <div className="space-y-4 flex flex-col items-end">
                        {userSettings?.company_logo && (
                          <div className="flex-shrink-0">
                            <img
                              src={userSettings.company_logo}
                              alt="Company Logo"
                              className="w-16 h-16 object-contain"
                            />
                          </div>
                        )}
                        <div className="text-right">
                          <p className="text-sm text-white/60">
                            Invoice Number
                          </p>
                          <p className="font-mono font-semibold text-lg">
                            {invoiceData.invoiceNumber}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invoice Details */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                      Bill To
                    </h3>
                    <div className="space-y-1">
                      <p className="font-semibold text-lg">
                        {invoiceData.client.name}
                      </p>
                      {invoiceData.client.email && (
                        <p className="text-muted-foreground">
                          {invoiceData.client.email}
                        </p>
                      )}
                      {invoiceData.client.phone && (
                        <p className="text-muted-foreground">
                          {invoiceData.client.phone}
                        </p>
                      )}
                      <p className="text-muted-foreground whitespace-pre-line">
                        {invoiceData.client.address}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Invoice Date
                      </p>
                      <p className="font-semibold">
                        {userSettings
                          ? formatDate(
                              invoiceData.date,
                              userSettings.date_format
                            )
                          : new Date(invoiceData.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Due Date</p>
                      <p className="font-semibold">
                        {userSettings
                          ? formatDate(
                              invoiceData.dueDate,
                              userSettings.date_format
                            )
                          : new Date(invoiceData.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="my-2" />

                {/* Items Table */}
                <div className="">
                  <div className="overflow-x-auto rounded-sm border">
                    <table className="w-full">
                      <thead>
                        <tr className={`invoice-table-${invoiceData.theme.id}`}>
                          <th className="text-left p-3 font-semibold text-white">
                            Description
                          </th>
                          <th className="text-center p-3 font-semibold w-20 text-white">
                            Qty
                          </th>
                          <th className="text-right p-3 font-semibold w-24 text-white">
                            Price
                          </th>
                          <th className="text-right p-3 font-semibold w-24 text-white">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoiceData.items.map((item, index) => (
                          <tr
                            key={item.id}
                            className={`invoice-item-row-${
                              invoiceData.theme.id
                            } ${index % 2 === 0 ? "bg-muted/60" : ""}`}
                          >
                            <td className="px-3 py-2.5 border-b">
                              <p className="whitespace-pre-line">
                                {item.description}
                              </p>
                            </td>
                            <td className="px-3 py-2.5 border-b text-center">
                              {userSettings
                                ? formatNumber(
                                    item.quantity,
                                    userSettings.number_format
                                  )
                                : item.quantity}
                            </td>
                            <td className="px-3 py-2.5 border-b text-right">
                              {userSettings
                                ? formatCurrency(
                                    item.price,
                                    userSettings.default_currency
                                  )
                                : `$${item.price.toFixed(2)}`}
                            </td>
                            <td className="px-3 py-2.5 border-b text-right font-semibold">
                              {userSettings
                                ? formatCurrency(
                                    item.quantity * item.price,
                                    userSettings.default_currency
                                  )
                                : `$${(item.quantity * item.price).toFixed(2)}`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Custom Fields and Totals */}
                <div className="flex justify-between mt-8">
                  {/* Custom Fields - Left Side */}
                  <div className="w-64 space-y-3">
                    {invoiceData.customFields &&
                      invoiceData.customFields.length > 0 &&
                      userSettings?.custom_fields && (
                        <>
                          <h4 className="font-semibold text-md text-muted-foreground uppercase tracking-wide">
                            Additional Information
                          </h4>
                          <div className="space-y-2">
                            {invoiceData.customFields.map((fieldValue) => {
                              const fieldDefinition =
                                userSettings.custom_fields?.find(
                                  (cf) => cf.id === fieldValue.fieldId
                                );
                              if (!fieldDefinition || !fieldValue.value)
                                return null;

                              return (
                                <div
                                  key={fieldValue.fieldId}
                                  className="flex flex-row items-center gap-2"
                                >
                                  <span className="text-sm text-muted-foreground font-semibold">
                                    {fieldDefinition.label}:
                                  </span>
                                  <span className="text-md text-black font-semibold">
                                    {fieldValue.value}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                  </div>

                  {/* Totals - Right Side */}
                  <div className="w-64 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-semibold">
                        {userSettings
                          ? formatCurrency(
                              calculateSubtotal(),
                              userSettings.default_currency
                            )
                          : `$${calculateSubtotal().toFixed(2)}`}
                      </span>
                    </div>
                    {invoiceData.taxRate && invoiceData.taxRate > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">
                          Tax ({invoiceData.taxRate}%):
                        </span>
                        <span className="font-semibold">
                          {userSettings
                            ? formatCurrency(
                                calculateTax(),
                                userSettings.default_currency
                              )
                            : `$${calculateTax().toFixed(2)}`}
                        </span>
                      </div>
                    )}
                    <Separator />
                    <div
                      className={`invoice-total-${invoiceData.theme.id} flex justify-between items-center py-3 px-4`}
                    >
                      <span className="font-bold text-lg">Total:</span>
                      <span className="font-bold text-xl">
                        {userSettings
                          ? formatCurrency(
                              calculateTotal(),
                              userSettings.default_currency
                            )
                          : `$${calculateTotal().toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                {/* <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
                  <p>Thank you for your business!</p>
                  <p className="mt-2">
                    This invoice was generated using Invoice Generator
                  </p>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-center mt-2">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <div className="flex flex-col items-center gap-2 z-[1]">
              <Button className="flex items-center gap-2 z-[1]">
                <Maximize2 className="w-4 h-4" />
                View Full Size
              </Button>
              <p className="text-xs text-muted-foreground">
                View Full size to print or download
              </p>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto z-[100]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Full Invoice Preview
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Action Buttons in Dialog */}
              <div className="flex justify-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={PrintInvoice}
                  disabled={isSaving}
                >
                  <Printer className="w-4 h-4" />
                  {isSaving
                    ? hasBeenSaved
                      ? "Printing..."
                      : "Saving..."
                    : "Print"}
                </Button>
                <Button
                  className="flex items-center gap-2"
                  onClick={DownloadInvoice}
                  disabled={isSaving}
                >
                  <Download className="w-4 h-4" />
                  {isSaving
                    ? hasBeenSaved
                      ? "Downloading..."
                      : "Saving..."
                    : "Download PDF"}
                </Button>
              </div>

              {/* Full Invoice Content */}
              <div className="flex justify-center">
                <FullInvoiceContent />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
