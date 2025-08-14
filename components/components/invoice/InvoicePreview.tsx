import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Eye, Download, Printer, Send } from "lucide-react";
import { InvoiceData } from "../InvoiceGenerator";

interface InvoicePreviewProps {
  invoiceData: InvoiceData;
}

export const InvoicePreview = ({ invoiceData }: InvoicePreviewProps) => {
  const calculateSubtotal = () => {
    return invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal();
  };

  const getThemeColors = () => {
    switch (invoiceData.theme.color) {
      case 'blue':
        return {
          primary: 'text-invoice-blue',
          bg: 'bg-invoice-blue-light',
          border: 'border-invoice-blue'
        };
      case 'green':
        return {
          primary: 'text-invoice-green',
          bg: 'bg-invoice-green-light',
          border: 'border-invoice-green'
        };
      case 'purple':
        return {
          primary: 'text-invoice-purple',
          bg: 'bg-invoice-purple-light',
          border: 'border-invoice-purple'
        };
      default:
        return {
          primary: 'text-primary',
          bg: 'bg-primary/10',
          border: 'border-primary'
        };
    }
  };

  const themeColors = getThemeColors();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Eye className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Invoice Preview</h2>
        </div>
        <p className="text-muted-foreground">Review your invoice before generating</p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-2 flex-wrap">
        <Button variant="outline" className="flex items-center gap-2">
          <Printer className="w-4 h-4" />
          Print
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
        <Button className="flex items-center gap-2">
          <Send className="w-4 h-4" />
          Send Invoice
        </Button>
      </div>

      {/* Invoice Preview */}
      <Card className="p-8 max-w-4xl mx-auto shadow-lg bg-white">
        {/* Header */}
        <div className={`${themeColors.bg} -m-8 p-8 mb-8 rounded-t-lg`}>
          <div className="flex justify-between items-start">
            <div>
              <h1 className={`text-4xl font-bold ${themeColors.primary} mb-2`}>INVOICE</h1>
              <p className="text-muted-foreground">Professional Invoice Template</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Invoice Number</p>
              <p className="font-mono font-semibold text-lg">{invoiceData.invoiceNumber}</p>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Bill To</h3>
            <div className="space-y-1">
              <p className="font-semibold text-lg">{invoiceData.client.name}</p>
              {invoiceData.client.email && <p className="text-muted-foreground">{invoiceData.client.email}</p>}
              {invoiceData.client.phone && <p className="text-muted-foreground">{invoiceData.client.phone}</p>}
              <p className="text-muted-foreground whitespace-pre-line">{invoiceData.client.address}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Invoice Date</p>
              <p className="font-semibold">{new Date(invoiceData.date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Due Date</p>
              <p className="font-semibold">{new Date(invoiceData.dueDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Theme</p>
              <p className="font-semibold">{invoiceData.theme.name}</p>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Items Table */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Items</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`${themeColors.bg} border-l-4 ${themeColors.border}`}>
                  <th className="text-left p-3 font-semibold">Description</th>
                  <th className="text-center p-3 font-semibold w-20">Qty</th>
                  <th className="text-right p-3 font-semibold w-24">Price</th>
                  <th className="text-right p-3 font-semibold w-24">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-muted/20' : ''}>
                    <td className="p-3 border-b">
                      <p className="whitespace-pre-line">{item.description}</p>
                    </td>
                    <td className="p-3 border-b text-center">{item.quantity}</td>
                    <td className="p-3 border-b text-right">${item.price.toFixed(2)}</td>
                    <td className="p-3 border-b text-right font-semibold">
                      ${(item.quantity * item.price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end mt-8">
          <div className="w-64 space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-semibold">${calculateSubtotal().toFixed(2)}</span>
            </div>
            <Separator />
            <div className={`flex justify-between items-center py-3 px-4 ${themeColors.bg} rounded-lg`}>
              <span className={`font-bold text-lg ${themeColors.primary}`}>Total:</span>
              <span className={`font-bold text-xl ${themeColors.primary}`}>
                ${calculateTotal().toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>Thank you for your business!</p>
          <p className="mt-2">This invoice was generated using Invoice Generator</p>
        </div>
      </Card>
    </div>
  );
};