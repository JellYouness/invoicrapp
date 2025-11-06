import type { Metadata } from "next";
import DashboardPageClient from "./DashboardPageClient";

export const metadata: Metadata = {
  title: "Dashboard - Invoicr",
  description:
    "Access your Invoicr dashboard to manage invoices, clients, and analytics.",
};

export default function DashboardPage() {
  return <DashboardPageClient />;
}
