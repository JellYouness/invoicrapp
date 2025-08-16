"use client";
import { useState } from "react";
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
import type { SavedInvoice } from "@/lib/invoice-service";

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("history");
  const [editingInvoice, setEditingInvoice] = useState<SavedInvoice | null>(
    null
  );

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

  const renderContent = () => {
    switch (activeTab) {
      case "create":
        return (
          <InvoiceGenerator
            editingInvoice={editingInvoice}
            onInvoiceSaved={() => {
              setEditingInvoice(null);
              setActiveTab("history");
            }}
          />
        );
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
      <DashboardHeader onNewInvoice={handleNewInvoice} onTabChange={setActiveTab}/>

      {/* Main Content Area */}
      <div className="flex-1 flex h-[90vh]">
        {/* Sidebar */}
        <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        {/* Content */}
        <main className="flex-1 p-4 overflow-y-auto bg-primary/5">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};
