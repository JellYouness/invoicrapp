import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  Calendar,
  User,
  DollarSign,
  FileText,
  Clock,
  MoreVertical,
  Send,
  CircleCheck,
  RefreshCcw
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  getUserInvoices, 
  deleteInvoice, 
  updateInvoiceStatus,
  type SavedInvoice 
} from "@/lib/invoice-service";
import { showSuccess, showError } from "@/hooks/use-toast";
import { format } from "date-fns";
import { InvoicePreview } from "@/components/invoice/InvoicePreview";
import { getThemeMetadataSync } from "@/lib/invoice-themes";
import { getDisplayLogoUrl } from "@/lib/logo-utils";
import type { InvoiceData, InvoiceItem, ClientInfo, InvoiceTheme } from "@/types/invoice";

interface InvoiceHistoryProps {
  onEditInvoice?: (invoice: SavedInvoice) => void;
  onViewInvoice?: (invoice: SavedInvoice) => void;
}

const statusColors = {
  draft: "bg-gray-100 text-gray-800 border-gray-200",
  sent: "bg-blue-100 text-blue-800 border-blue-200", 
  paid: "bg-green-100 text-green-800 border-green-200",
  overdue: "bg-red-100 text-red-800 border-red-200",
  cancelled: "bg-orange-100 text-orange-800 border-orange-200"
};

const statusLabels = {
  draft: "Draft",
  sent: "Sent", 
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled"
};

export const InvoiceHistory = ({ onEditInvoice, onViewInvoice }: InvoiceHistoryProps) => {
  const [invoices, setInvoices] = useState<SavedInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<SavedInvoice | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  // Using enhanced toast helpers

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const userInvoices = await getUserInvoices();
      setInvoices(userInvoices);
    } catch (error) {
      console.error('Error loading invoices:', error);
      showError(
        "Error Loading Invoices",
        "Failed to load your invoice history. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    setDeletingId(id);
    try {
      const success = await deleteInvoice(id);
      if (success) {
        setInvoices(prev => prev.filter(inv => inv.id !== id));
        showSuccess(
          "Invoice Deleted",
          "Invoice has been successfully deleted."
        );
      } else {
        showError(
          "Error Deleting Invoice",
          "Failed to delete the invoice. Please try again."
        );
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      showError(
        "Error Deleting Invoice",
        "Failed to delete the invoice. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: SavedInvoice['status']) => {
    try {
      const success = await updateInvoiceStatus(id, newStatus);
      if (success) {
        setInvoices(prev => 
          prev.map(inv => 
            inv.id === id ? { ...inv, status: newStatus } : inv
          )
        );
        showSuccess(
          "Status Updated",
          `Invoice status updated to ${statusLabels[newStatus]}.`
        );
      } else {
        showError(
          "Error Updating Status",
          "Failed to update invoice status. Please try again."
        );
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showError(
        "Error Updating Status",
        "Failed to update invoice status. Please try again."
      );
    }
  };

  // Convert SavedInvoice to InvoiceData format for preview
  const convertToInvoiceData = (savedInvoice: SavedInvoice): InvoiceData => {
    const themeMetadata = getThemeMetadataSync(savedInvoice.theme_id);
    
    // Create a complete theme object for preview purposes
    const previewTheme = {
      id: savedInvoice.theme_id,
      name: savedInvoice.theme_name,
      color: themeMetadata?.id.split('-')[1] || 'blue',
      description: themeMetadata?.description || 'Professional theme',
      version: themeMetadata?.version || '1.0.0',
      author: themeMetadata?.author || 'Invoicr',
      preview: themeMetadata?.preview || {
        primary: '#3b82f6',
        secondary: '#dbeafe',
        accent: '#1e40af'
      },
      styles: {
        primary: `text-invoice-${themeMetadata?.id.split('-')[1] || 'blue'}`,
        primaryLight: `bg-invoice-${themeMetadata?.id.split('-')[1] || 'blue'}-light`,
        text: `text-invoice-${themeMetadata?.id.split('-')[1] || 'blue'}`,
        background: `bg-invoice-${themeMetadata?.id.split('-')[1] || 'blue'}-light`,
        border: `border-invoice-${themeMetadata?.id.split('-')[1] || 'blue'}`
      },
      layout: {
        headerStyle: 'classic',
        footerStyle: 'minimal',
        spacing: 'comfortable',
        typography: {
          headerFont: 'font-semibold',
          bodyFont: 'font-normal',
          accentFont: 'font-medium'
        }
      },
      customCSS: ''
    };
    
    return {
      theme: previewTheme,
      client: {
        name: savedInvoice.client_name,
        address: savedInvoice.client_address,
        email: savedInvoice.client_email || undefined,
        phone: savedInvoice.client_phone || undefined
      },
      items: savedInvoice.items,
      invoiceNumber: savedInvoice.invoice_number,
      date: savedInvoice.invoice_date,
      dueDate: savedInvoice.due_date,
      notes: savedInvoice.notes || undefined,
      currency: "USD",
      paymentTerms: "Net 30",
      taxRate: 0,
    };
  };

  const handlePreviewInvoice = (invoice: SavedInvoice) => {
    setPreviewInvoice(invoice);
    setShowPreviewDialog(true);
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Invoices</h2>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Invoices</h2>
          <p className="text-gray-600 mt-1">
            Manage and track all your invoices in one place
          </p>
        </div>
        <Button onClick={loadInvoices} variant="outline" size="sm">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {invoices.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Invoices Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start creating invoices to see them appear in your history.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 w-full">
          {invoices.map((invoice) => (
            <Card 
              key={invoice.id} 
              className="hover:shadow-md transition-shadow cursor-pointer w-full overflow-hidden"
              onClick={() => handlePreviewInvoice(invoice)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {invoice.invoice_number}
                      </h3>
                      <Badge 
                        variant="outline" 
                        className={statusColors[invoice.status as keyof typeof statusColors]}
                      >
                        {statusLabels[invoice.status as keyof typeof statusLabels]}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{invoice.client_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(invoice.invoice_date), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold text-gray-900">
                          ${invoice.total_amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-500">
                      Created {format(new Date(invoice.created_at), 'MMM dd, yyyy • h:mm a')}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreviewInvoice(invoice);
                      }}
                      className="flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditInvoice?.(invoice)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate(invoice.id, 'sent')}>
                          <Send className="w-4 h-4 mr-2" />
                          Mark as Sent
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate(invoice.id, 'paid')}>
                          <CircleCheck
                            className="w-4 h-4 mr-2"
                          />
                          Mark as Paid
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteInvoice(invoice.id)}
                          className="text-red-600"
                          disabled={deletingId === invoice.id}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {deletingId === invoice.id ? 'Deleting...' : 'Delete'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Invoice Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Invoice Preview - {previewInvoice?.invoice_number}
            </DialogTitle>
          </DialogHeader>
          
          {previewInvoice && (
            <div className="mt-4">
              <InvoicePreview invoiceData={convertToInvoiceData(previewInvoice)} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
