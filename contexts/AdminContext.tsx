"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { adminService } from "@/lib/admin-service";

interface AdminContextType {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  checkAdminStatus: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  isSuperAdmin: false,
  loading: true,
  checkAdminStatus: async () => {},
});

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  const checkAdminStatus = useCallback(async () => {
    if (!user || authLoading) {
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [adminStatus, superAdminStatus] = await Promise.all([
        adminService.isAdmin(),
        adminService.isSuperAdmin(),
      ]);

      setIsAdmin(adminStatus);
      setIsSuperAdmin(superAdminStatus);
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
      setIsSuperAdmin(false);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  const value = {
    isAdmin,
    isSuperAdmin,
    loading,
    checkAdminStatus,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};
