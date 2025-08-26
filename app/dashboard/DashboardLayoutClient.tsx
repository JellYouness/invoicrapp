"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [user, loading, router]);

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

  if (!user) {
    return null;
  }

  // Extract the active tab from pathname
  const getActiveTab = () => {
    if (pathname === "/dashboard" || pathname === "/dashboard/")
      return "invoices";
    const segments = pathname.split("/");
    return segments[2] || "invoices"; // /dashboard/[tab]
  };

  const activeTab = getActiveTab();

  return (
    <div className="h-[100dvh] bg-gray-50 flex flex-col">
      <DashboardHeader
        onNewInvoice={() => router.push("/dashboard/create")}
        onTabChange={(tab) => router.push(`/dashboard/${tab}`)}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex h-[90dvh] lg:min-h-0">
        <DashboardSidebar
          activeTab={activeTab}
          onTabChange={(tab) => router.push(`/dashboard/${tab}`)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 p-4 pb-safe lg:pb-4 overflow-y-auto bg-primary/5 lg:ml-0 h-full">
          <div className="max-w-7xl xl:max-w-full xl:px-4 mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
