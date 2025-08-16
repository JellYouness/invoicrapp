'use client'
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Bell, Settings, User, LogOut, CreditCard, FileText, Zap } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/hooks/use-toast";
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface DashboardHeaderProps {
  onNewInvoice: () => void;
  onTabChange?: (tab: string) => void;
}

export const DashboardHeader = ({ onNewInvoice, onTabChange }: DashboardHeaderProps) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const router = useRouter();
  // Using enhanced toast helpers

  useEffect(() => {
    // Get current user session
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    getCurrentUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        showError(
          "Error signing out",
          error.message
        );
      } else {
        showSuccess(
          "Signed out successfully",
          "You have been signed out of your account."
        );
        router.push("/");
      }
    } catch (error) {
      showError(
        "An error occurred",
        "Please try again later."
      );
    }
  };

  const getUserInitials = (text?: string) => {
    // if fullname is provided, use it
    if (text?.includes(" ")) {
      const parts = text.split(" ");
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    if (!text) return "U";
    const parts = text.split("@")[0].split(".");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return text[0].toUpperCase();
  };

  return (
    <header className="bg-card/95 backdrop-blur-sm border-b border-border px-6 py-3 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        {/* Left side - Logo and title */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            {/* Logo using project theme */}
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Invoice Wiz Craft
              </h1>
              <p className="text-sm text-muted-foreground font-medium">Professional Dashboard</p>
            </div>
          </div>
        </div>

        {/* Right side - Actions and user menu */}
        <div className="flex items-center space-x-3">
          {/* New Invoice Button */}
          <Button 
            onClick={onNewInvoice} 
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Invoice
          </Button>

          {/* Upgrade to Pro Button */}
          <Button 
            variant="outline" 
            size="sm"
            className="border-border text-accent hover:bg-accent/10 hover:border-accent transition-all duration-200 flex items-center gap-1"
          >
            <Zap className="w-3 h-3" />
            Upgrade
          </Button>

          {/* Settings */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-accent/10 transition-colors"
            onClick={() => onTabChange && onTabChange('settings')}
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-accent/10 transition-colors">
                <Avatar className="h-10 w-10 ring-2 ring-border">
                  <AvatarImage src="/avatars/01.png" alt="User" />
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                    {getUserInitials(user?.user_metadata?.full_name || user?.email)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || "user@example.com"}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      Free Plan
                    </Badge>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => onTabChange?.('profile')}>
                <User className="w-4 h-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => onTabChange?.('settings')}
              >
                <Settings className="w-4 h-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                <CreditCard className="w-4 h-4" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
