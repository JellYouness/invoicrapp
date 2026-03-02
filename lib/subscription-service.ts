import { supabase } from '@/integrations/supabase/old/client'

// Type casting for subscriptions table until Supabase types are regenerated
const subscriptionsTable = 'subscriptions' as any

export interface Subscription {
	id: string
	user_id: string
	plan_type: 'free' | 'pro'
	status: 'active' | 'cancelled' | 'expired'
	invoices_created_this_month: number
	invoice_limit: number
	usage_reset_date: string
	stripe_subscription_id?: string
	stripe_customer_id?: string
	current_period_start?: string
	current_period_end?: string
	created_at: string
	updated_at: string
}

export interface UsageInfo {
	current: number
	limit: number
	remaining: number
	percentage: number
	canCreate: boolean
	planType: 'free' | 'pro'
}

export class SubscriptionService {
	/**
	 * Get user's subscription information
	 */
	static async getUserSubscription(
		userId: string,
	): Promise<Subscription | null> {
		try {
			const { data, error } = await (supabase as any)
				.from(subscriptionsTable)
				.select('*')
				.eq('user_id', userId)
				.single()

			if (error && error.code !== 'PGRST116') {
				// PGRST116 = no rows returned
				// Check if it's a "relation does not exist" error (table missing)
				if (
					error.message?.includes(
						'relation "subscriptions" does not exist',
					)
				) {
					console.warn(
						'Subscriptions table does not exist. Please run the migration.',
					)
					return null
				}
				throw error
			}

			return data as Subscription
		} catch (error) {
			console.error('Error fetching subscription:', error)
			// Handle database connection or table missing errors gracefully
			if (
				error instanceof Error &&
				error.message?.includes(
					'relation "subscriptions" does not exist',
				)
			) {
				console.warn(
					'Subscriptions table does not exist. Please run the migration.',
				)
			}
			return null
		}
	}

	/**
	 * Get user's current usage information
	 * DISABLED: Returns unlimited access for all users
	 */
	static async getUserUsage(userId: string): Promise<UsageInfo> {
		// Return unlimited access - subscription system disabled
		return {
			current: 0,
			limit: Infinity,
			remaining: Infinity,
			percentage: 0,
			canCreate: true,
			planType: 'pro', // Treat everyone as pro user
		}
	}

	/**
	 * Check if user can create an invoice
	 * DISABLED: Always returns true - no limits
	 */
	static async canCreateInvoice(userId: string): Promise<boolean> {
		// Always allow invoice creation - subscription system disabled
		return true
	}

	/**
	 * Increment user's invoice usage
	 * DISABLED: Always returns true - no tracking
	 */
	static async incrementInvoiceUsage(userId: string): Promise<boolean> {
		// No usage tracking - subscription system disabled
		return true
	}

	/**
	 * Create a free subscription for new users
	 */
	static async createFreeSubscription(userId: string): Promise<Subscription> {
		try {
			const { data, error } = await (supabase as any)
				.from(subscriptionsTable)
				.insert({
					user_id: userId,
					plan_type: 'free',
					status: 'active',
					invoices_created_this_month: 0,
					invoice_limit: 8,
				})
				.select()
				.single()

			if (error) throw error
			return data as Subscription
		} catch (error) {
			console.error('Error creating free subscription:', error)
			// If subscriptions table doesn't exist, return a default subscription object
			if (
				error instanceof Error &&
				error.message?.includes(
					'relation "subscriptions" does not exist',
				)
			) {
				console.warn(
					'Subscriptions table does not exist. Returning default subscription.',
				)
				return {
					id: 'default',
					user_id: userId,
					plan_type: 'free',
					status: 'active',
					invoices_created_this_month: 0,
					invoice_limit: 8,
					usage_reset_date: new Date(
						Date.now() + 30 * 24 * 60 * 60 * 1000,
					)
						.toISOString()
						.split('T')[0],
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				}
			}
			throw error
		}
	}

	/**
	 * Update user's subscription plan
	 */
	static async updateSubscriptionPlan(
		userId: string,
		planType: 'free' | 'pro',
		stripeData?: {
			subscriptionId?: string
			customerId?: string
			currentPeriodStart?: string
			currentPeriodEnd?: string
		},
	): Promise<Subscription> {
		try {
			const updateData: any = {
				plan_type: planType,
				status: 'active',
				updated_at: new Date().toISOString(),
			}

			// Set limits based on plan
			if (planType === 'free') {
				updateData.invoice_limit = 8
				// Clear Stripe data for free plan
				updateData.stripe_subscription_id = null
				updateData.stripe_customer_id = null
				updateData.current_period_start = null
				updateData.current_period_end = null
			} else if (planType === 'pro') {
				updateData.invoice_limit = 999999 // Effectively unlimited
				// Add Stripe data for pro plan
				if (stripeData) {
					updateData.stripe_subscription_id =
						stripeData.subscriptionId
					updateData.stripe_customer_id = stripeData.customerId
					updateData.current_period_start =
						stripeData.currentPeriodStart
					updateData.current_period_end = stripeData.currentPeriodEnd
				}
			}

			const { data, error } = await (supabase as any)
				.from(subscriptionsTable)
				.upsert({
					user_id: userId,
					...updateData,
				})
				.select()
				.single()

			if (error) throw error
			return data as Subscription
		} catch (error) {
			console.error('Error updating subscription plan:', error)
			throw error
		}
	}

	/**
	 * Update invoice limit for free plan (admin function)
	 */
	static async updateInvoiceLimit(
		userId: string,
		newLimit: number,
	): Promise<boolean> {
		try {
			const { error } = await (supabase as any)
				.from(subscriptionsTable)
				.update({
					invoice_limit: newLimit,
					updated_at: new Date().toISOString(),
				})
				.eq('user_id', userId)
				.eq('plan_type', 'free')

			if (error) throw error
			return true
		} catch (error) {
			console.error('Error updating invoice limit:', error)
			return false
		}
	}

	/**
	 * Cancel user's subscription
	 */
	static async cancelSubscription(userId: string): Promise<boolean> {
		try {
			const { error } = await (supabase as any)
				.from(subscriptionsTable)
				.update({
					status: 'cancelled',
					updated_at: new Date().toISOString(),
				})
				.eq('user_id', userId)

			if (error) throw error
			return true
		} catch (error) {
			console.error('Error cancelling subscription:', error)
			return false
		}
	}

	/**
	 * Reset monthly usage (called automatically by database function)
	 */
	static async resetMonthlyUsage(): Promise<boolean> {
		try {
			const { error } = await (supabase as any).rpc('reset_monthly_usage')
			if (error) throw error
			return true
		} catch (error) {
			console.error('Error resetting monthly usage:', error)
			return false
		}
	}
}
