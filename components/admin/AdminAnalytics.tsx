"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  FileText,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { adminService, AdminDashboardStats } from "@/lib/admin-service";
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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export const AdminAnalytics = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, [selectedPeriod]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAdminDashboardStats(
        parseInt(selectedPeriod)
      );
      setStats(data);
    } catch (error) {
      console.error("Error loading admin stats:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load analytics data.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Detailed Analytics</h2>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Analytics Data Available
          </h2>
          <p className="text-gray-600 mb-4">
            Unable to load detailed analytics.
          </p>
          <Button onClick={loadStats}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  // Calculate growth rates
  const userGrowthRate =
    stats.userGrowth.length > 1
      ? (((stats.userGrowth[stats.userGrowth.length - 1]?.users || 0) -
          (stats.userGrowth[0]?.users || 0)) /
          (stats.userGrowth[0]?.users || 1)) *
        100
      : 0;

  const revenueGrowthRate =
    stats.revenueGrowth.length > 1
      ? (((stats.revenueGrowth[stats.revenueGrowth.length - 1]?.revenue || 0) -
          (stats.revenueGrowth[0]?.revenue || 0)) /
          (stats.revenueGrowth[0]?.revenue || 1)) *
        100
      : 0;

  const invoiceGrowthRate =
    stats.invoiceGrowth.length > 1
      ? (((stats.invoiceGrowth[stats.invoiceGrowth.length - 1]?.invoices || 0) -
          (stats.invoiceGrowth[0]?.invoices || 0)) /
          (stats.invoiceGrowth[0]?.invoices || 1)) *
        100
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Detailed Analytics
          </h2>
          <p className="text-gray-600">
            Comprehensive insights and trends for the last {selectedPeriod} days
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadStats} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          className={`border-l-4 ${
            userGrowthRate >= 0
              ? "border-l-green-500 bg-green-50"
              : "border-l-red-500 bg-red-50"
          }`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">User Growth</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userGrowthRate >= 0 ? "+" : ""}
                  {userGrowthRate.toFixed(1)}%
                </p>
              </div>
              <div className="flex items-center">
                {userGrowthRate >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-green-600" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`border-l-4 ${
            revenueGrowthRate >= 0
              ? "border-l-green-500 bg-green-50"
              : "border-l-red-500 bg-red-50"
          }`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Revenue Growth
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {revenueGrowthRate >= 0 ? "+" : ""}
                  {revenueGrowthRate.toFixed(1)}%
                </p>
              </div>
              <div className="flex items-center">
                {revenueGrowthRate >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-green-600" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`border-l-4 ${
            invoiceGrowthRate >= 0
              ? "border-l-green-500 bg-green-50"
              : "border-l-red-500 bg-red-50"
          }`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Invoice Growth
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {invoiceGrowthRate >= 0 ? "+" : ""}
                  {invoiceGrowthRate.toFixed(1)}%
                </p>
              </div>
              <div className="flex items-center">
                {invoiceGrowthRate >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-green-600" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Growth Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.userGrowth.slice(-7).map((day, index) => {
                const maxUsers = Math.max(
                  ...stats.userGrowth.map((d) => d.users)
                );
                const percentage =
                  maxUsers > 0 ? (day.users / maxUsers) * 100 : 0;

                return (
                  <div key={day.date} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {formatDate(day.date)}
                      </span>
                      <span className="text-sm text-gray-600">
                        {formatNumber(day.users)} users
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Revenue Growth Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.revenueGrowth.slice(-7).map((day, index) => {
                const maxRevenue = Math.max(
                  ...stats.revenueGrowth.map((d) => d.revenue)
                );
                const percentage =
                  maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;

                return (
                  <div key={day.date} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {formatDate(day.date)}
                      </span>
                      <span className="text-sm text-gray-600">
                        {formatCurrency(day.revenue)}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Subscription Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Subscription Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.subscriptionBreakdown.map((sub) => (
                <div key={sub.plan} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{sub.plan}</span>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatNumber(sub.count)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {sub.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <Progress value={sub.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Top Users by Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topUsers.slice(0, 5).map((user, index) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-purple-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(user.totalRevenue)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {user.invoiceCount} invoice
                      {user.invoiceCount !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              ))}
              {stats.topUsers.length === 0 && (
                <p className="text-gray-600 text-center py-4">
                  No user revenue data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Invoice Creation Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            {stats.invoiceGrowth.slice(-7).map((day, index) => {
              const maxInvoices = Math.max(
                ...stats.invoiceGrowth.map((d) => d.invoices)
              );
              const percentage =
                maxInvoices > 0 ? (day.invoices / maxInvoices) * 100 : 0;

              return (
                <div key={day.date} className="text-center">
                  <div className="text-sm font-medium mb-2">
                    {formatDate(day.date)}
                  </div>
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {formatNumber(day.invoices)}
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};



