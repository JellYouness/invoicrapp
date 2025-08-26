"use client";

import { useRouter } from "next/navigation";
import { InvoiceHistory } from "@/components/InvoiceHistory";
import type { SavedInvoice } from "@/lib/invoice-service";

export default function InvoicesPageClient() {
  const router = useRouter();

  const handleEditInvoice = (invoice: SavedInvoice) => {
    router.push(`/dashboard/create?edit=${invoice.id}`);
  };

  const handleViewInvoice = (invoice: SavedInvoice) => {
    router.push(`/dashboard/create?view=${invoice.id}`);
  };

  return (
    <InvoiceHistory
      onEditInvoice={handleEditInvoice}
      onViewInvoice={handleViewInvoice}
    />
  );
}
