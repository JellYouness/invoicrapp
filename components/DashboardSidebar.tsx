"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { useUsage } from "@/contexts/UsageContext";
import { useAdmin } from "@/contexts/AdminContext";
import {
  FileText,
  Users,
  History,
  BarChart3,
  Settings,
  HelpCircle,
  User,
  Plus,
  X,
  Shield,
} from "lucide-react";
import { InvoiceUsageBar } from "./ui/InvoiceUsageBar";
import Link from "next/link";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
}

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const DashboardSidebar = ({
  activeTab,
  onTabChange,
  isOpen = true,
  onClose,
}: DashboardSidebarProps) => {
  const { usage } = useUsage();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const mainItems: SidebarItem[] = [
    {
      id: "invoices",
      label: "Invoices",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      id: "create",
      label: "Create Invoice",
      icon: <Plus className="w-5 h-5" />,
    },
    {
      id: "clients",
      label: "Clients",
      icon: <Users className="w-5 h-5" />,
    },
  ];

  const secondaryItems: SidebarItem[] = [
    {
      id: "analytics",
      label: "Analytics",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="w-5 h-5" />,
    },
    {
      id: "help",
      label: "Help & Support",
      icon: <HelpCircle className="w-5 h-5" />,
    },
  ];

  const renderSidebarItem = (item: SidebarItem, isActive: boolean) => (
    <Button
      key={item.id}
      variant={isActive ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start gap-3 h-11 px-3",
        isActive
          ? "bg-primary/10 text-primary border-r-2 border-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
      onClick={() => onTabChange(item.id)}
    >
      {item.icon}
      <span className="font-medium">{item.label}</span>
      {item.count && (
        <span className="ml-auto bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
          {item.count}
        </span>
      )}
    </Button>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 lg:w-48 bg-card border-r border-primary/30 flex flex-col transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Mobile Close Button */}
        {onClose && (
          <div className="lg:hidden flex justify-between p-4">
            <Logo size="md" />

            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="px-4 py-6 space-y-2 flex-1">
          <div className="md:hidden mb-6">
            <InvoiceUsageBar
              current={usage?.current || 0}
              limit={usage?.limit || 0}
              planType={usage?.planType || "free"}
            />
          </div>

          <div className="mb-6">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Main
            </h2>
            <div className="space-y-1">
              {mainItems.map((item) =>
                renderSidebarItem(item, activeTab === item.id)
              )}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Tools
            </h2>
            <div className="space-y-1">
              {secondaryItems.map((item) =>
                renderSidebarItem(item, activeTab === item.id)
              )}
            </div>
          </div>
        </nav>

        {/* Admin Section - Only show for admin users */}
        {!adminLoading && isAdmin && (
          <div className="px-4 py-2 border-t border-border">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Admin
            </h2>
            <Link href="/dashboard/admin">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-11 px-3 text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <Shield className="w-5 h-5" />
                <span className="font-medium">Admin Dashboard</span>
              </Button>
            </Link>
          </div>
        )}

        {/* Bottom Section - Only show upgrade prompt for free plan users */}
        {usage?.planType === "free" && (
          <div className="p-4 border-t border-border">
            <div className="bg-gradient-to-r from-primary to-accent rounded-lg p-4 text-white">
              <h3 className="font-semibold text-sm mb-1">Upgrade to Pro</h3>
              <p className="text-xs text-primary-foreground/80 mb-3">
                Unlock advanced features and unlimited invoices
              </p>
              <Button
                size="sm"
                className="w-full bg-white text-primary hover:bg-muted"
              >
                Upgrade Now
              </Button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
