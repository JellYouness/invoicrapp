"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { SubscriptionService, UsageInfo } from "@/lib/subscription-service";
import { useAuth } from "./AuthContext";

interface UsageContextType {
  usage: UsageInfo | null;
  isLoading: boolean;
  refreshUsage: () => Promise<void>;
}

const UsageContext = createContext<UsageContextType | undefined>(undefined);

export const useUsage = () => {
  const context = useContext(UsageContext);
  if (context === undefined) {
    throw new Error("useUsage must be used within a UsageProvider");
  }
  return context;
};

interface UsageProviderProps {
  children: ReactNode;
}

export const UsageProvider: React.FC<UsageProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUsage = async () => {
    if (!user?.id) {
      setUsage(null);
      setIsLoading(false);
      return;
    }

    // SUBSCRIPTION SYSTEM DISABLED - Always provide unlimited access
    setIsLoading(true);
    setUsage({
      current: 0,
      limit: Infinity,
      remaining: Infinity,
      percentage: 0,
      canCreate: true,
      planType: "pro", // Treat everyone as pro user
    });
    setIsLoading(false);
  };

  const refreshUsage = async () => {
    await loadUsage();
  };

  useEffect(() => {
    loadUsage();
  }, [user?.id]);

  const value: UsageContextType = {
    usage,
    isLoading,
    refreshUsage,
  };

  return (
    <UsageContext.Provider value={value}>{children}</UsageContext.Provider>
  );
};
