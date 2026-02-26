"use client";
import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { InvoiceGenerator } from "./InvoiceGenerator";
import { InvoiceHistory } from "./InvoiceHistory";
import { ClientManagement } from "./ClientManagement";
import { Analytics } from "./Analytics";
import { Settings } from "./Settings";
import { HelpSupport } from "./HelpSupport";
import { Profile } from "./Profile";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";
import { useAuth } from "@/contexts/AuthContext";
import type { SavedInvoice } from "@/lib/invoice-service";

export const Dashboard = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("history");
  const [editingInvoice, setEditingInvoice] = useState<SavedInvoice | null>(
    null
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // This should be handled by middleware, but adding as backup
  if (!user) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Please sign in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  const handleEditInvoice = (invoice: SavedInvoice) => {
    setEditingInvoice(invoice);
    setActiveTab("create");
  };

  const handleViewInvoice = (invoice: SavedInvoice) => {
    // For now, we'll just switch to the create tab to view the invoice
    // In a full implementation, you might want a separate view mode
    setEditingInvoice(invoice);
    setActiveTab("create");
  };

  const handleNewInvoice = () => {
    setEditingInvoice(null);
    setActiveTab("create");
  };

  // const handleInvoiceSaved = () => {
  //   setEditingInvoice(null);
  //   setActiveTab("history");
  // };

  const renderContent = () => {
    switch (activeTab) {
      // case "create":
      //   return (
      //     <InvoiceGenerator
      //       editingInvoice={editingInvoice}
      //       onInvoiceSaved={handleInvoiceSaved}
      //     />
      //   );
      case "history":
        return (
          <InvoiceHistory
            onEditInvoice={handleEditInvoice}
            onViewInvoice={handleViewInvoice}
          />
        );
      case "clients":
        return <ClientManagement />;
      case "analytics":
        return <Analytics />;
      case "profile":
        return <Profile />;
      case "settings":
        return <Settings />;
      case "help":
        return <HelpSupport />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <DashboardHeader 
        onNewInvoice={handleNewInvoice} 
        onTabChange={setActiveTab}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex h-[90vh] lg:min-h-0">
        {/* Sidebar */}
        <DashboardSidebar 
          activeTab={activeTab} 
          onTabChange={(tab) => {
            setActiveTab(tab);
            setIsSidebarOpen(false); // Close sidebar on mobile after selection
          }}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        {/* Content */}
        <main className="flex-1 p-4 pb-safe lg:pb-4 overflow-y-auto bg-primary/5 lg:ml-0 h-full">
          <div className="max-w-7xl xl:max-w-full xl:px-4 mx-auto h-full">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};
