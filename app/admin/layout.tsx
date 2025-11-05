import { AdminProvider } from "@/contexts/AdminContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      <div className="min-h-screen bg-gray-50">{children}</div>
    </AdminProvider>
  );
}

export const metadata = {
  title: "Admin Dashboard",
  description: "Administrative interface for Invoice Wiz Craft",
};


