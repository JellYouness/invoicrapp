import { supabase } from '@/integrations/supabase/old/client'

export interface AdminAnalytics {
	date: string
	totalUsers: number
	newUsersToday: number
	activeUsersLast7Days: number
	activeUsersLast30Days: number
	totalInvoices: number
	invoicesCreatedToday: number
	invoicesCreatedThisWeek: number
	invoicesCreatedThisMonth: number
	totalRevenue: number
	revenueToday: number
	revenueThisWeek: number
	revenueThisMonth: number
	freeUsers: number
	proUsers: number
	totalClients: number
	avgInvoicesPerUser: number
	createdAt: string
	updatedAt: string
}

export interface UserManagementData {
	id: string
	email: string
	fullName: string | null
	companyName: string | null
	role: string
	createdAt: string
	lastSignIn: string | null
	emailVerified: boolean
	subscriptionPlan: string | null
	subscriptionStatus: string | null
	invoiceCount: number
	totalRevenue: number
}

export interface AdminDashboardStats {
	userGrowth: Array<{ date: string; users: number }>
	revenueGrowth: Array<{ date: string; revenue: number }>
	invoiceGrowth: Array<{ date: string; invoices: number }>
	subscriptionBreakdown: Array<{
		plan: string
		count: number
		percentage: number
	}>
	topUsers: Array<{
		id: string
		name: string
		email: string
		invoiceCount: number
		totalRevenue: number
	}>
}

class AdminService {
	/**
	 * Check if current user has admin privileges
	 */
	async isAdmin(): Promise<boolean> {
		try {
			const {
				data: { user },
				error,
			} = await supabase.auth.getUser()
			if (error || !user) return false

			const { data, error: profileError } = await supabase
				.from('profiles')
				.select('role')
				.eq('user_id', user.id)
				.single()

			if (profileError) {
				// If there's an error, it might be because the profile doesn't exist yet
				// or the user doesn't have admin privileges. Return false.
				console.debug(
					'Profile not found or not accessible:',
					profileError.message,
				)
				return false
			}
			return data?.role === 'admin' || data?.role === 'super_admin'
		} catch (error) {
			console.error('Error checking admin status:', error)
			return false
		}
	}

	/**
	 * Check if current user has super admin privileges
	 */
	async isSuperAdmin(): Promise<boolean> {
		try {
			const {
				data: { user },
				error,
			} = await supabase.auth.getUser()
			if (error || !user) return false

			const { data, error: profileError } = await supabase
				.from('profiles')
				.select('role')
				.eq('user_id', user.id)
				.single()

			if (profileError) {
				console.debug(
					'Profile not found or not accessible:',
					profileError.message,
				)
				return false
			}
			return data?.role === 'super_admin'
		} catch (error) {
			console.error('Error checking super admin status:', error)
			return false
		}
	}

	/**
	 * Get current admin analytics
	 */
	async getAdminAnalytics(): Promise<AdminAnalytics | null> {
		try {
			// First update the analytics
			await supabase.rpc('update_admin_analytics')

			// Then fetch the latest data
			const { data, error } = await supabase
				.from('admin_analytics')
				.select('*')
				.order('date', { ascending: false })
				.limit(1)
				.single()

			if (error) {
				console.error('Error fetching admin analytics:', error)
				return null
			}

			return {
				date: data.date,
				totalUsers: data.total_users,
				newUsersToday: data.new_users_today,
				activeUsersLast7Days: data.active_users_last_7_days,
				activeUsersLast30Days: data.active_users_last_30_days,
				totalInvoices: data.total_invoices,
				invoicesCreatedToday: data.invoices_created_today,
				invoicesCreatedThisWeek: data.invoices_created_this_week,
				invoicesCreatedThisMonth: data.invoices_created_this_month,
				totalRevenue: Number(data.total_revenue),
				revenueToday: Number(data.revenue_today),
				revenueThisWeek: Number(data.revenue_this_week),
				revenueThisMonth: Number(data.revenue_this_month),
				freeUsers: data.free_users,
				proUsers: data.pro_users,
				totalClients: data.total_clients,
				avgInvoicesPerUser: Number(data.avg_invoices_per_user),
				createdAt: data.created_at,
				updatedAt: data.updated_at,
			}
		} catch (error) {
			console.error('Error getting admin analytics:', error)
			return null
		}
	}

	/**
	 * Get admin dashboard statistics with historical data
	 */
	async getAdminDashboardStats(
		days: number = 30,
	): Promise<AdminDashboardStats | null> {
		try {
			const startDate = new Date()
			startDate.setDate(startDate.getDate() - days)

			// Get historical analytics
			const { data: analytics, error: analyticsError } = await supabase
				.from('admin_analytics')
				.select('*')
				.gte('date', startDate.toISOString().split('T')[0])
				.order('date', { ascending: true })

			if (analyticsError) {
				console.error(
					'Error fetching analytics history:',
					analyticsError,
				)
				return null
			}

			// Get top users by revenue - simplified approach
			const { data: topUsersData, error: topUsersError } = await supabase
				.from('invoices')
				.select('user_id, total_amount')
				.eq('status', 'paid')

			// Aggregate by user
			const userRevenueMap = new Map<
				string,
				{ totalRevenue: number; invoiceCount: number }
			>()

			topUsersData?.forEach((invoice) => {
				const existing = userRevenueMap.get(invoice.user_id) || {
					totalRevenue: 0,
					invoiceCount: 0,
				}
				userRevenueMap.set(invoice.user_id, {
					totalRevenue:
						existing.totalRevenue + Number(invoice.total_amount),
					invoiceCount: existing.invoiceCount + 1,
				})
			})

			// Get top 10 users by revenue
			const sortedUsers = Array.from(userRevenueMap.entries())
				.sort(([, a], [, b]) => b.totalRevenue - a.totalRevenue)
				.slice(0, 10)

			// Get user details for top users
			const topUserIds = sortedUsers.map(([userId]) => userId)
			const { data: topUsersProfiles } = await supabase
				.from('profiles')
				.select('user_id, full_name')
				.in('user_id', topUserIds)

			const { data: userEmails } = await supabase.auth.admin.listUsers()

			const topUsersWithEmails = sortedUsers.map(([userId, stats]) => {
				const profile = topUsersProfiles?.find(
					(p) => p.user_id === userId,
				)
				const authUser = userEmails.users.find((u) => u.id === userId)
				return {
					id: userId,
					name: profile?.full_name || 'Unknown',
					email: authUser?.email || 'Unknown',
					invoiceCount: stats.invoiceCount,
					totalRevenue: stats.totalRevenue,
				}
			})

			// Get subscription breakdown
			const { data: subscriptions, error: subsError } = await supabase
				.from('subscriptions')
				.select('plan_type')

			const subscriptionBreakdown = subscriptions
				? [
						{
							plan: 'Free',
							count: subscriptions.filter(
								(s) => s.plan_type === 'free',
							).length,
							percentage: 0,
						},
						{
							plan: 'Pro',
							count: subscriptions.filter(
								(s) => s.plan_type === 'pro',
							).length,
							percentage: 0,
						},
					]
				: []

			// Calculate percentages
			const totalSubs = subscriptionBreakdown.reduce(
				(sum, s) => sum + s.count,
				0,
			)
			subscriptionBreakdown.forEach((s) => {
				s.percentage = totalSubs > 0 ? (s.count / totalSubs) * 100 : 0
			})

			return {
				userGrowth:
					analytics?.map((a) => ({
						date: a.date,
						users: a.total_users,
					})) || [],
				revenueGrowth:
					analytics?.map((a) => ({
						date: a.date,
						revenue: Number(a.total_revenue),
					})) || [],
				invoiceGrowth:
					analytics?.map((a) => ({
						date: a.date,
						invoices: a.total_invoices,
					})) || [],
				subscriptionBreakdown,
				topUsers: topUsersWithEmails,
			}
		} catch (error) {
			console.error('Error getting admin dashboard stats:', error)
			return null
		}
	}

	/**
	 * Get all users for user management
	 */
	async getAllUsers(
		page: number = 1,
		limit: number = 50,
	): Promise<{
		users: UserManagementData[]
		total: number
		page: number
		totalPages: number
	}> {
		try {
			const offset = (page - 1) * limit

			// Get profiles
			const {
				data: profiles,
				error: profilesError,
				count,
			} = await supabase
				.from('profiles')
				.select('*', { count: 'exact' })
				.range(offset, offset + limit - 1)
				.order('created_at', { ascending: false })

			if (profilesError) {
				console.error('Error fetching users:', profilesError)
				return { users: [], total: 0, page, totalPages: 0 }
			}

			// Get auth data for these users
			const userIds = profiles?.map((p) => p.user_id) || []
			const { data: authUsers } = await supabase.auth.admin.listUsers()

			// Get subscriptions for these users
			const { data: subscriptions } = await supabase
				.from('subscriptions')
				.select('*')
				.in('user_id', userIds)

			// Get invoice counts and revenue for these users
			const { data: invoiceStats } = await supabase
				.from('invoices')
				.select('user_id, total_amount, status')
				.in('user_id', userIds)

			// Calculate invoice stats per user
			const userStatsMap = new Map<
				string,
				{ count: number; revenue: number }
			>()
			invoiceStats?.forEach((invoice) => {
				const existing = userStatsMap.get(invoice.user_id) || {
					count: 0,
					revenue: 0,
				}
				userStatsMap.set(invoice.user_id, {
					count: existing.count + 1,
					revenue:
						existing.revenue +
						(invoice.status === 'paid'
							? Number(invoice.total_amount)
							: 0),
				})
			})

			const users: UserManagementData[] =
				profiles?.map((profile) => {
					const authUser = authUsers.users.find(
						(u) => u.id === profile.user_id,
					)
					const subscription = subscriptions?.find(
						(s) => s.user_id === profile.user_id,
					)
					const stats = userStatsMap.get(profile.user_id) || {
						count: 0,
						revenue: 0,
					}

					return {
						id: profile.user_id,
						email: authUser?.email || 'Unknown',
						fullName: profile.full_name,
						companyName: profile.company_name,
						role: profile.role || 'user',
						createdAt: profile.created_at,
						lastSignIn: authUser?.last_sign_in_at || null,
						emailVerified: authUser?.email_confirmed_at
							? true
							: false,
						subscriptionPlan: subscription?.plan_type || 'free',
						subscriptionStatus: subscription?.status || 'active',
						invoiceCount: stats.count,
						totalRevenue: stats.revenue,
					}
				}) || []

			const totalPages = Math.ceil((count || 0) / limit)

			return {
				users,
				total: count || 0,
				page,
				totalPages,
			}
		} catch (error) {
			console.error('Error getting all users:', error)
			return { users: [], total: 0, page, totalPages: 0 }
		}
	}

	/**
	 * Update user role (super admin only)
	 */
	async updateUserRole(
		userId: string,
		role: 'user' | 'admin' | 'super_admin',
	): Promise<boolean> {
		try {
			const isSuperAdmin = await this.isSuperAdmin()
			if (!isSuperAdmin) {
				throw new Error('Only super admins can update user roles')
			}

			const { error } = await supabase
				.from('profiles')
				.update({ role })
				.eq('user_id', userId)

			if (error) {
				console.error('Error updating user role:', error)
				return false
			}

			return true
		} catch (error) {
			console.error('Error updating user role:', error)
			return false
		}
	}

	/**
	 * Update user subscription (admin only)
	 */
	async updateUserSubscription(
		userId: string,
		planType: 'free' | 'pro',
		status: 'active' | 'cancelled' | 'expired' = 'active',
	): Promise<boolean> {
		try {
			const isAdmin = await this.isAdmin()
			if (!isAdmin) {
				throw new Error('Only admins can update subscriptions')
			}

			const { error } = await supabase.from('subscriptions').upsert({
				user_id: userId,
				plan_type: planType,
				status,
				updated_at: new Date().toISOString(),
			})

			if (error) {
				console.error('Error updating subscription:', error)
				return false
			}

			return true
		} catch (error) {
			console.error('Error updating subscription:', error)
			return false
		}
	}

	/**
	 * Delete user account (super admin only)
	 */
	async deleteUser(userId: string): Promise<boolean> {
		try {
			const isSuperAdmin = await this.isSuperAdmin()
			if (!isSuperAdmin) {
				throw new Error('Only super admins can delete users')
			}

			// Delete user from auth.users (this will cascade to other tables)
			const { error } = await supabase.auth.admin.deleteUser(userId)

			if (error) {
				console.error('Error deleting user:', error)
				return false
			}

			return true
		} catch (error) {
			console.error('Error deleting user:', error)
			return false
		}
	}

	/**
	 * Get user details including all related data
	 */
	async getUserDetails(userId: string): Promise<
		| (UserManagementData & {
				invoices: any[]
				clients: any[]
				settings: any
		  })
		| null
	> {
		try {
			// Get profile data
			const { data: profile, error: profileError } = await supabase
				.from('profiles')
				.select('*')
				.eq('user_id', userId)
				.single()

			if (profileError) {
				console.error('Error fetching user profile:', profileError)
				return null
			}

			// Get auth data
			const { data: authUser, error: authError } =
				await supabase.auth.admin.getUserById(userId)
			if (authError) {
				console.error('Error fetching auth user:', authError)
				return null
			}

			// Get subscription
			const { data: subscription } = await supabase
				.from('subscriptions')
				.select('*')
				.eq('user_id', userId)
				.single()

			// Get invoices
			const { data: invoices } = await supabase
				.from('invoices')
				.select('*')
				.eq('user_id', userId)
				.order('created_at', { ascending: false })

			// Get clients
			const { data: clients } = await supabase
				.from('clients')
				.select('*')
				.eq('user_id', userId)
				.order('created_at', { ascending: false })

			// Get settings
			const { data: settings } = await supabase
				.from('user_settings')
				.select('*')
				.eq('user_id', userId)
				.single()

			const totalRevenue =
				invoices?.reduce(
					(sum, inv) => sum + Number(inv.total_amount),
					0,
				) || 0

			return {
				id: userId,
				email: authUser.user?.email || 'Unknown',
				fullName: profile.full_name,
				companyName: profile.company_name,
				role: profile.role || 'user',
				createdAt: profile.created_at,
				lastSignIn: authUser.user?.last_sign_in_at || null,
				emailVerified: authUser.user?.email_confirmed_at ? true : false,
				subscriptionPlan: subscription?.plan_type || 'free',
				subscriptionStatus: subscription?.status || 'active',
				invoiceCount: invoices?.length || 0,
				totalRevenue,
				invoices: invoices || [],
				clients: clients || [],
				settings: settings,
			}
		} catch (error) {
			console.error('Error getting user details:', error)
			return null
		}
	}
}

export const adminService = new AdminService()
