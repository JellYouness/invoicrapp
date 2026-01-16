"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import {
  FileText,
  Menu,
  X,
  Settings,
  User,
  LogOut,
  LayoutDashboard,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import GitHubStarsBadge from "@/components/ui/GitHubStarsBadge";

const Header = () => {
  const router = useRouter();
  const { user, signOut, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getUserInitials = (text?: string) => {
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

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-transparent sticky top-0 z-50 pt-5">
      <div className="w-auto max-w-xs sm:max-w-lg md:max-w-2xl mx-auto bg-background backdrop-blur-lg border-b border-border shadow-2xl rounded-full px-4 sm:px-6 py-2 sm:py-4 relative">
        <div className="flex justify-between items-center">
          <Logo size="md" className="text-lg sm:text-xl" />

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center space-x-3">
            {/* GitHub Stars Badge */}
            <GitHubStarsBadge className="hidden md:flex" />
            {/* Navigation Links */}
            <nav className="hidden sm:flex items-center space-x-8">
              <button
                className="text-muted-foreground hover:text-primary font-medium text-sm transition-colors"
                onClick={() =>
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Features
              </button>
              {/* <button
                className="text-muted-foreground hover:text-primary font-medium transition-colors"
                onClick={() =>
                  document
                    .querySelector('[data-section="pricing"]')
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Pricing
              </button> */}
              {/* <button className="text-muted-foreground hover:text-primary font-medium transition-colors">
                Templates
              </button>
              <button className="text-muted-foreground hover:text-primary font-medium transition-colors">
                Help
              </button> */}
            </nav>
            {loading ? (
              <div className="flex items-center justify-center space-x-2 w-52">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : user ? (
              <>
                {/* Dashboard Button */}
                <Button
                  variant="ghost"
                  className="font-medium text-primary transition-all text-sm"
                  onClick={() => router.push("/dashboard")}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full hover:bg-primary/5 transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/" alt="User" />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold">
                          {getUserInitials(
                            user?.user_metadata?.full_name || user?.email
                          )}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.user_metadata?.full_name ||
                            user?.email?.split("@")[0] ||
                            "User"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email || "user@example.com"}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => router.push("/dashboard")}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
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
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="font-semibold text-sm text-primary hover:text-primary hover:bg-primary/5 transition-all"
                  onClick={() => router.push("/auth")}
                >
                  Sign In
                </Button>
                <Button
                  className="font-semibold !text-sm !px-3 !py-1 bg-gradient-to-r from-primary rounded-full to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => router.push("/auth")}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="sm:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Enhanced Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="sm:hidden mt-6 pb-6 space-y-4 pt-6 absolute top-16 left-0 right-0 bg-background backdrop-blur-lg border-b border-border shadow-sm rounded-3xl px-4">
            {/* GitHub Stars Badge - Mobile */}
            <div className="flex justify-center mb-2">
              <GitHubStarsBadge />
            </div>
            {/* Mobile Navigation Links */}
            <div className="space-y-4 mb-2">
              <button
                className="w-full text-left text-muted-foreground hover:text-primary font-medium transition-colors rounded-lg hover:bg-primary/5"
                onClick={() => {
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" });
                  setIsMobileMenuOpen(false);
                }}
              >
                Features
              </button>
              <button
                className="w-full text-left text-muted-foreground hover:text-primary font-medium transition-colors rounded-lg hover:bg-primary/5"
                onClick={() => {
                  document
                    .querySelector('[data-section="pricing"]')
                    ?.scrollIntoView({ behavior: "smooth" });
                  setIsMobileMenuOpen(false);
                }}
              >
                Pricing
              </button>
            </div>

            {user ? (
              <>
                <Button
                  variant="outline"
                  className="w-full justify-start font-medium border-primary/30 text-primary hover:bg-primary/5"
                  onClick={() => {
                    router.push("/dashboard");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start font-medium text-destructive hover:text-destructive hover:bg-red-50"
                  onClick={() => {
                    handleSignOut();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="w-full font-medium border border-black/30 rounded-full"
                  onClick={() => {
                    router.push("/auth");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Sign In
                </Button>
                <Button
                  className="w-full font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg rounded-full"
                  onClick={() => {
                    router.push("/auth");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Get Started Free
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
