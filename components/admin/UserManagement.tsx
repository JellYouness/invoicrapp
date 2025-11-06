"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Users,
  Search,
  Eye,
  Edit,
  Trash2,
  Crown,
  Shield,
  User,
  Mail,
  Calendar,
  DollarSign,
  FileText,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { adminService, UserManagementData } from "@/lib/admin-service";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/hooks/use-toast";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getRoleBadge = (role: string) => {
  switch (role) {
    case "super_admin":
      return (
        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <Crown className="w-3 h-3 mr-1" />
          Super Admin
        </Badge>
      );
    case "admin":
      return (
        <Badge className="bg-blue-500 text-white">
          <Shield className="w-3 h-3 mr-1" />
          Admin
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary">
          <User className="w-3 h-3 mr-1" />
          User
        </Badge>
      );
  }
};

const getSubscriptionBadge = (plan: string | null, status: string | null) => {
  if (plan === "pro") {
    return <Badge className="bg-green-500 text-white">Pro</Badge>;
  }
  return <Badge variant="outline">Free</Badge>;
};

export const UserManagement = () => {
  const [users, setUsers] = useState<UserManagementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedPlan, setSelectedPlan] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Dialogs
  const [editUserDialog, setEditUserDialog] = useState<{
    open: boolean;
    user: UserManagementData | null;
  }>({ open: false, user: null });

  const [deleteUserDialog, setDeleteUserDialog] = useState<{
    open: boolean;
    user: UserManagementData | null;
  }>({ open: false, user: null });

  const [userDetailsDialog, setUserDetailsDialog] = useState<{
    open: boolean;
    user:
      | (UserManagementData & {
          invoices: any[];
          clients: any[];
          settings: any;
        })
      | null;
  }>({ open: false, user: null });

  const { isSuperAdmin } = useAdmin();
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm, selectedRole, selectedPlan]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllUsers(currentPage, 20);

      let filteredUsers = response.users;

      // Apply filters
      if (searchTerm) {
        filteredUsers = filteredUsers.filter(
          (user) =>
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (selectedRole !== "all") {
        filteredUsers = filteredUsers.filter(
          (user) => user.role === selectedRole
        );
      }

      if (selectedPlan !== "all") {
        filteredUsers = filteredUsers.filter(
          (user) => user.subscriptionPlan === selectedPlan
        );
      }

      setUsers(filteredUsers);
      setTotalUsers(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (
    user: UserManagementData,
    newRole: string,
    newPlan: string
  ) => {
    try {
      // Update role if changed
      if (newRole !== user.role) {
        const roleSuccess = await adminService.updateUserRole(
          user.id,
          newRole as "user" | "admin" | "super_admin"
        );
        if (!roleSuccess) {
          throw new Error("Failed to update user role");
        }
      }

      // Update subscription if changed
      if (newPlan !== user.subscriptionPlan) {
        const subSuccess = await adminService.updateUserSubscription(
          user.id,
          newPlan as "free" | "pro"
        );
        if (!subSuccess) {
          throw new Error("Failed to update user subscription");
        }
      }

      toast({
        title: "Success",
        description: "User updated successfully.",
      });

      setEditUserDialog({ open: false, user: null });
      loadUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user.",
      });
    }
  };

  const handleDeleteUser = async (user: UserManagementData) => {
    try {
      const success = await adminService.deleteUser(user.id);
      if (!success) {
        throw new Error("Failed to delete user");
      }

      toast({
        title: "Success",
        description: "User deleted successfully.",
      });

      setDeleteUserDialog({ open: false, user: null });
      loadUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user.",
      });
    }
  };

  const handleViewUserDetails = async (user: UserManagementData) => {
    try {
      const details = await adminService.getUserDetails(user.id);
      if (details) {
        setUserDetailsDialog({ open: true, user: details });
      }
    } catch (error) {
      console.error("Error loading user details:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load user details.",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">User Management</h2>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">
            Manage users, roles, and subscriptions ({totalUsers} total users)
          </p>
        </div>
        <Button onClick={loadUsers} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users by email, name, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Invoices</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {user.fullName || "Unknown"}
                      </div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                      {user.companyName && (
                        <div className="text-xs text-gray-500">
                          {user.companyName}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>
                    {getSubscriptionBadge(
                      user.subscriptionPlan,
                      user.subscriptionStatus
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4 text-gray-400" />
                      {user.invoiceCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      {formatCurrency(user.totalRevenue)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(user.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {user.emailVerified ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      {user.lastSignIn ? (
                        <span className="text-sm text-gray-600">Active</span>
                      ) : (
                        <span className="text-sm text-gray-400">Inactive</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewUserDetails(user)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {isSuperAdmin && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setEditUserDialog({ open: true, user })
                            }
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setDeleteUserDialog({ open: true, user })
                            }
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {users.length} of {totalUsers} users
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog
        open={editUserDialog.open}
        onOpenChange={(open) => setEditUserDialog({ open, user: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user role and subscription plan.
            </DialogDescription>
          </DialogHeader>
          {editUserDialog.user && (
            <EditUserForm
              user={editUserDialog.user}
              onSave={handleEditUser}
              onCancel={() => setEditUserDialog({ open: false, user: null })}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <AlertDialog
        open={deleteUserDialog.open}
        onOpenChange={(open) => setDeleteUserDialog({ open, user: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be
              undone. All user data including invoices, clients, and settings
              will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteUserDialog.user && handleDeleteUser(deleteUserDialog.user)
              }
              className="bg-red-600 hover:bg-red-700"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Details Dialog */}
      <Dialog
        open={userDetailsDialog.open}
        onOpenChange={(open) => setUserDetailsDialog({ open, user: null })}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {userDetailsDialog.user && (
            <UserDetailsView user={userDetailsDialog.user} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Edit User Form Component
const EditUserForm = ({
  user,
  onSave,
  onCancel,
}: {
  user: UserManagementData;
  onSave: (user: UserManagementData, role: string, plan: string) => void;
  onCancel: () => void;
}) => {
  const [role, setRole] = useState(user.role);
  const [plan, setPlan] = useState(user.subscriptionPlan || "free");

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">User Email</label>
        <Input value={user.email} disabled />
      </div>
      <div>
        <label className="text-sm font-medium">Role</label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium">Subscription Plan</label>
        <Select value={plan} onValueChange={setPlan}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(user, role, plan)}>Save Changes</Button>
      </DialogFooter>
    </div>
  );
};

// User Details View Component
const UserDetailsView = ({
  user,
}: {
  user: UserManagementData & { invoices: any[]; clients: any[]; settings: any };
}) => {
  return (
    <div className="space-y-6">
      {/* User Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span>{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Full Name:</span>
              <span>{user.fullName || "Not set"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Company:</span>
              <span>{user.companyName || "Not set"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Role:</span>
              <span>{getRoleBadge(user.role)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Joined:</span>
              <span>{formatDate(user.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Sign In:</span>
              <span>
                {user.lastSignIn ? formatDate(user.lastSignIn) : "Never"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Subscription & Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Plan:</span>
              <span>
                {getSubscriptionBadge(
                  user.subscriptionPlan,
                  user.subscriptionStatus
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="capitalize">{user.subscriptionStatus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Invoices:</span>
              <span>{user.invoiceCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Revenue:</span>
              <span>{formatCurrency(user.totalRevenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Clients:</span>
              <span>{user.clients.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {user.invoices.length > 0 ? (
            <div className="space-y-2">
              {user.invoices.slice(0, 5).map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <div>
                    <span className="font-medium">
                      {invoice.invoice_number}
                    </span>
                    <span className="text-sm text-gray-600 ml-2">
                      {invoice.client_name}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(invoice.total_amount)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDate(invoice.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No invoices created yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};



