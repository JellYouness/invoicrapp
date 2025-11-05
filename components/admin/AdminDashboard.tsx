"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  DollarSign,
  FileText,
  TrendingUp,
  Activity,
  Shield,
  BarChart3,
  PieChart,
  Clock,
  CheckCircle,
  AlertTriangle,
  Crown,
  UserCheck,
  Calendar,
  Eye,
} from "lucide-react";
import { AdminAnalytics } from "./AdminAnalytics";
import { UserManagement } from "./UserManagement";
import {
  adminService,
  AdminAnalytics as AdminAnalyticsType,
} from "@/lib/admin-service";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/hooks/use-toast";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en-US").format(num);
};

export const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState<AdminAnalyticsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { isAdmin, isSuperAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description:
          "You do not have permission to access the admin dashboard.",
      });
      return;
    }

    if (isAdmin && !adminLoading) {
      loadAnalytics();
    }
  }, [isAdmin, adminLoading]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAdminAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error("Error loading admin analytics:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load admin analytics.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <div className="text-center">
            <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600">
              You do not have permission to access the admin dashboard.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Data Available
            </h2>
            <p className="text-gray-600 mb-4">
              Unable to load admin analytics data.
            </p>
            <Button onClick={loadAnalytics}>Try Again</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            {isSuperAdmin && (
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <Crown className="w-3 h-3 mr-1" />
                Super Admin
              </Badge>
            )}
            {isAdmin && !isSuperAdmin && (
              <Badge className="bg-blue-500 text-white">
                <UserCheck className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            )}
          </div>
          <p className="text-gray-600">
            Manage users, monitor app performance, and view detailed analytics
          </p>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatNumber(analytics.totalUsers)}
                  </p>
                  <p className="text-xs text-blue-600">
                    +{analytics.newUsersToday} today
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(analytics.totalRevenue)}
                  </p>
                  <p className="text-xs text-green-600">
                    +{formatCurrency(analytics.revenueToday)} today
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">
                    Total Invoices
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {formatNumber(analytics.totalInvoices)}
                  </p>
                  <p className="text-xs text-purple-600">
                    +{analytics.invoicesCreatedToday} today
                  </p>
                </div>
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">
                    Active Users (30d)
                  </p>
                  <p className="text-2xl font-bold text-orange-900">
                    {formatNumber(analytics.activeUsersLast30Days)}
                  </p>
                  <p className="text-xs text-orange-600">
                    {formatNumber(analytics.activeUsersLast7Days)} this week
                  </p>
                </div>
                <Activity className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  Subscription Plans
                </h3>
                <PieChart className="w-5 h-5 text-gray-600" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Free Users</span>
                  <span className="font-semibold">
                    {formatNumber(analytics.freeUsers)}
                  </span>
                </div>
                <Progress
                  value={
                    (analytics.freeUsers /
                      (analytics.freeUsers + analytics.proUsers)) *
                    100
                  }
                  className="h-2"
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pro Users</span>
                  <span className="font-semibold">
                    {formatNumber(analytics.proUsers)}
                  </span>
                </div>
                <Progress
                  value={
                    (analytics.proUsers /
                      (analytics.freeUsers + analytics.proUsers)) *
                    100
                  }
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  Weekly Performance
                </h3>
                <BarChart3 className="w-5 h-5 text-gray-600" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Invoices This Week
                  </span>
                  <span className="font-semibold">
                    {formatNumber(analytics.invoicesCreatedThisWeek)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Revenue This Week
                  </span>
                  <span className="font-semibold">
                    {formatCurrency(analytics.revenueThisWeek)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Avg Invoices/User
                  </span>
                  <span className="font-semibold">
                    {analytics.avgInvoicesPerUser.toFixed(1)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">System Health</h3>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Clients</span>
                  <span className="font-semibold">
                    {formatNumber(analytics.totalClients)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Monthly Invoices
                  </span>
                  <span className="font-semibold">
                    {formatNumber(analytics.invoicesCreatedThisMonth)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Monthly Revenue</span>
                  <span className="font-semibold">
                    {formatCurrency(analytics.revenueThisMonth)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full lg:w-auto grid-cols-2 lg:grid-cols-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              User Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  System Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Recent Activity</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <span className="text-sm">New users today</span>
                        <Badge variant="secondary">
                          {analytics.newUsersToday}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <span className="text-sm">Invoices created today</span>
                        <Badge variant="secondary">
                          {analytics.invoicesCreatedToday}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                        <span className="text-sm">Revenue generated today</span>
                        <Badge variant="secondary">
                          {formatCurrency(analytics.revenueToday)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">System Statistics</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">Last updated</span>
                        <span className="text-sm text-gray-600">
                          {new Date(analytics.updatedAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">Data collection date</span>
                        <span className="text-sm text-gray-600">
                          {new Date(analytics.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <AdminAnalytics />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};


