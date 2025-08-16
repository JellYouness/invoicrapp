'use client'
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Building, 
  Mail, 
  Phone,
  MapPin,
  Globe, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  FileText,
  Users,
  MoreVertical,
  Receipt,
  Eye
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  getUserClients, 
  saveClient, 
  updateClient, 
  deleteClient,
  searchClients,
  type Client,
  type CreateClientData 
} from "@/lib/client-service";
import {
  getInvoicesByClient,
  getInvoiceCountsForClients,
  type SavedInvoice
} from "@/lib/invoice-service";
import { InvoicePreview } from "@/components/invoice/InvoicePreview";
import { getThemeMetadataSync } from "@/lib/invoice-themes";
import type { InvoiceData } from "@/types/invoice";
import { showSuccess, showError } from "@/hooks/use-toast";

interface ClientManagementProps {
  onSelectClient?: (client: Client) => void;
  selectedClientId?: string;
  showSelectMode?: boolean;
}

interface ClientWithInvoices extends Client {
  invoiceCount?: number;
  invoices?: SavedInvoice[];
}

export const ClientManagement = ({ 
  onSelectClient, 
  selectedClientId, 
  showSelectMode = false 
}: ClientManagementProps) => {
  const [clients, setClients] = useState<ClientWithInvoices[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedClientInvoices, setSelectedClientInvoices] = useState<SavedInvoice[]>([]);
  const [showInvoicesDialog, setShowInvoicesDialog] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<SavedInvoice | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  // Using enhanced toast helpers

  interface ClientFormData {
    name: string;
    address: string;
    email: string;
    phone: string;
    tax_number: string;
    website: string;
  }

  const [formData, setFormData] = useState<ClientFormData>({
    name: "",
    address: "",
    email: "",
    phone: "",
    tax_number: "",
    website: ""
  });

  const loadClients = async () => {
    try {
      setLoading(true);
      const userClients = await getUserClients();
      
      // Get invoice counts for all clients
      const clientNames = userClients.map(client => client.name);
      const invoiceCounts = await getInvoiceCountsForClients(clientNames);
      
      // Add invoice counts to clients
      const clientsWithCounts = userClients.map(client => ({
        ...client,
        invoiceCount: invoiceCounts[client.name] || 0
      }));
      
      setClients(clientsWithCounts);
    } catch (error) {
      console.error('Error loading clients:', error);
      showError(
        "Error Loading Clients",
        "Failed to load your clients. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      try {
        const searchResults = await searchClients(term);
        
        // Get invoice counts for search results
        const clientNames = searchResults.map(client => client.name);
        const invoiceCounts = await getInvoiceCountsForClients(clientNames);
        
        const resultsWithCounts = searchResults.map(client => ({
          ...client,
          invoiceCount: invoiceCounts[client.name] || 0
        }));
        
        setClients(resultsWithCounts);
      } catch (error) {
        console.error('Error searching clients:', error);
      }
    } else {
      loadClients();
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      email: "",
      phone: "",
      tax_number: "",
      website: ""
    });
    setEditingClient(null);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      address: client.address || "",
      email: client.email || "",
      phone: client.phone || "",
      tax_number: client.tax_number || "",
      website: client.website || ""
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showError(
        "Validation Error",
        "Client name is required."
      );
      return;
    }

    setIsSaving(true);
    try {
      let result;
      if (editingClient) {
        result = await updateClient(editingClient.id, formData);
      } else {
        result = await saveClient(formData);
      }

      if (result) {
        showSuccess(
          editingClient ? "Client Updated" : "Client Created",
          `${formData.name} has been ${editingClient ? 'updated' : 'created'} successfully.`
        );
        setIsDialogOpen(false);
        resetForm();
        loadClients();
      } else {
        showError(
          "Error",
          `Failed to ${editingClient ? 'update' : 'create'} client. Please try again.`
        );
      }
    } catch (error) {
      console.error('Error saving client:', error);
      showError(
        "Error",
        `Failed to ${editingClient ? 'update' : 'create'} client. Please try again.`
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const success = await deleteClient(id);
      if (success) {
        showSuccess(
          "Client Deactivated",
          "Client has been deactivated successfully."
        );
        loadClients();
      } else {
        showError(
          "Error",
          "Failed to deactivate client. Please try again."
        );
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      showError(
        "Error",
        "Failed to deactivate client. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewInvoices = async (client: ClientWithInvoices) => {
    setLoadingInvoices(true);
    try {
      const invoices = await getInvoicesByClient(client.name);
      setSelectedClientInvoices(invoices);
      setShowInvoicesDialog(true);
    } catch (error) {
      console.error('Error loading client invoices:', error);
      showError(
        "Error Loading Invoices",
        "Failed to load invoices for this client."
      );
    } finally {
      setLoadingInvoices(false);
    }
  };

  // Convert SavedInvoice to InvoiceData format for preview
  const convertToInvoiceData = (savedInvoice: SavedInvoice): InvoiceData => {
    const themeMetadata = getThemeMetadataSync(savedInvoice.theme_id);
    
    // Create a minimal theme object for preview purposes
    const previewTheme = {
      id: savedInvoice.theme_id,
      name: savedInvoice.theme_name,
      color: themeMetadata?.id.split('-')[1] || 'blue',
      description: themeMetadata?.description || 'Professional theme',
      version: themeMetadata?.version || '1.0.0',
      author: themeMetadata?.author || 'Invoice Wiz Craft',
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
    loadClients();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Client Management</h2>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {showSelectMode ? "Select Client" : "Client Management"}
          </h2>
          <p className="text-gray-600 mt-1">
            {showSelectMode ? "Choose a client for your invoice" : "Manage your client database"}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingClient ? "Edit Client" : "Add New Client"}
              </DialogTitle>
              <DialogDescription>
                {editingClient ? "Update client information" : "Create a new client profile"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Client name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="client@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main Street\nSuite 100\nNew York, NY 10001\nUnited States"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tax_number">Tax Number</Label>
                  <Input
                    id="tax_number"
                    value={formData.tax_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, tax_number: e.target.value }))}
                    placeholder="Tax ID"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : editingClient ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search clients by name, company, or email..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Clients List */}
      {clients.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Clients Found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? "No clients match your search." : "Start by adding your first client."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {clients.map((client) => (
            <Card 
              key={client.id} 
              className={`hover:shadow-md transition-shadow cursor-pointer ${
                selectedClientId === client.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => showSelectMode && onSelectClient?.(client)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {client.name}
                      </h3>
                      {client.invoiceCount !== undefined && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Receipt className="w-3 h-3" />
                          {client.invoiceCount} invoice{client.invoiceCount !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      {client.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{client.email}</span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                      {client.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{client.address.split('\n')[0]}</span>
                        </div>
                      )}
                      {client.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          <span>{client.website}</span>
                        </div>
                      )}
                      {client.tax_number && (
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span>Tax: {client.tax_number}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {!showSelectMode && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewInvoices(client)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Invoices ({client.invoiceCount || 0})
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(client)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(client.id)}
                          className="text-red-600"
                          disabled={deletingId === client.id}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {deletingId === client.id ? 'Deactivating...' : 'Deactivate'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Client Invoices Dialog */}
      <Dialog open={showInvoicesDialog} onOpenChange={setShowInvoicesDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Invoices for {selectedClientInvoices.length > 0 ? selectedClientInvoices[0].client_name : 'Client'}
            </DialogTitle>
            <DialogDescription>
              View all invoices for this client
            </DialogDescription>
          </DialogHeader>
          
          {loadingInvoices ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : selectedClientInvoices.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Invoices Found
              </h3>
              <p className="text-gray-600">
                This client doesn't have any invoices yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedClientInvoices.map((invoice) => (
                <Card 
                  key={invoice.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handlePreviewInvoice(invoice)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            Invoice #{invoice.invoice_number}
                          </h4>
                          <Badge 
                            variant={
                              invoice.status === 'paid' ? 'default' :
                              invoice.status === 'sent' ? 'secondary' :
                              invoice.status === 'overdue' ? 'destructive' :
                              'outline'
                            }
                          >
                            {invoice.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Date:</span>
                            <br />
                            {new Date(invoice.invoice_date).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Due Date:</span>
                            <br />
                            {new Date(invoice.due_date).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Amount:</span>
                            <br />
                            ${invoice.total_amount.toFixed(2)}
                          </div>
                          <div>
                          <span className="font-medium">Created:</span>
                            <br />
                            {new Date(invoice.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        
                        {invoice.notes && (
                          <div className="mt-3 text-sm text-gray-600">
                            <span className="font-medium">Notes:</span> {invoice.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

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
