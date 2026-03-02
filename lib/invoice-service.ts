import { supabase } from '@/integrations/supabase/old/client'
import type {
	CustomFieldValue,
	InvoiceData,
	InvoiceItem,
} from '@/types/invoice'
import { SubscriptionService } from './subscription-service'
import { createClient } from '@/integrations/supabase/client'

// Define the database row type for invoices
export type InvoiceRow = {
	id: string
	user_id: string
	client_id: string | null
	invoice_number: string
	client_name: string
	client_address: string
	client_email: string | null
	client_phone: string | null
	invoice_date: string
	due_date: string
	theme_id: string
	theme_name: string
	items: any // JSON type
	subtotal: number
	tax_amount: number
	total_amount: number
	status: string
	notes: string | null
	logo_url: string | null
	custom_fields: any // JSON type
	created_at: string
	updated_at: string
}

export interface SavedInvoice {
	id: string
	user_id: string
	client_id?: string
	invoice_number: string
	client_name: string
	client_address: string
	client_email?: string
	client_phone?: string
	invoice_date: string
	due_date: string
	theme_id: string
	theme_name: string
	items: InvoiceItem[]
	subtotal: number
	tax_amount: number
	total_amount: number
	status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
	notes?: string
	logo_url?: string
	custom_fields?: CustomFieldValue[]
	created_at: string
	updated_at: string
}

export interface CreateInvoiceData {
	client_id?: string
	invoice_number: string
	client_name: string
	client_address: string
	client_email?: string
	client_phone?: string
	invoice_date: string
	due_date: string
	theme_id: string
	theme_name: string
	items: InvoiceItem[]
	subtotal: number
	tax_amount?: number
	total_amount: number
	status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
	notes?: string
	logo_url?: string
	custom_fields?: CustomFieldValue[]
}

// Calculate totals from invoice items
export const calculateInvoiceTotals = (
	items: InvoiceItem[],
	taxRate: number = 0,
) => {
	const subtotal = items.reduce(
		(sum, item) => sum + item.quantity * item.price,
		0,
	)
	const tax_amount = subtotal * (taxRate / 100)
	const total_amount = subtotal + tax_amount

	return { subtotal, tax_amount, total_amount }
}

// Convert InvoiceData to CreateInvoiceData format
export const convertInvoiceDataToSaveFormat = (
	invoiceData: InvoiceData,
): CreateInvoiceData => {
	const { subtotal, tax_amount, total_amount } = calculateInvoiceTotals(
		invoiceData.items,
		invoiceData.taxRate || 0,
	)

	return {
		client_id: invoiceData.client.id,
		invoice_number: invoiceData.invoiceNumber,
		client_name: invoiceData.client.name,
		client_address: invoiceData.client.address,
		client_email: invoiceData.client.email,
		client_phone: invoiceData.client.phone,
		invoice_date: invoiceData.date,
		due_date: invoiceData.dueDate,
		theme_id: invoiceData.theme.id,
		theme_name: invoiceData.theme.name,
		items: invoiceData.items,
		subtotal,
		tax_amount,
		total_amount,
		status: 'draft',
		custom_fields: invoiceData.customFields,
	}
}


// Update an existing invoice
export const updateInvoice = async (
	id: string,
	updates: Partial<CreateInvoiceData>,
): Promise<SavedInvoice | null> => {
	try {
		const {
			data: { user },
		} = await supabase.auth.getUser()

		if (!user) {
			return null
		}

		const { data, error } = await (supabase as any)
			.from('invoices')
			.update(updates)
			.eq('id', id)
			.eq('user_id', user.id)
			.select()
			.single()

		if (error) {
			console.error('Error updating invoice:', error)
			return null
		}

		return data as SavedInvoice
	} catch (error) {
		console.error('Error updating invoice:', error)
		return null
	}
}

// Get invoices by client name
export const getInvoicesByClient = async (
	clientName: string,
): Promise<SavedInvoice[]> => {
	const supabaseClient = createClient()
	try {
		const {
			data: { user },
		} = await supabaseClient.auth.getUser()

		if (!user) {
			return []
		}

		const { data, error } = await (supabaseClient)
			.from('invoices')
			.select('*')
			.eq('user_id', user.id)
			.eq('client_name', clientName)
			.order('created_at', { ascending: false })

		if (error) {
			console.error('Error fetching invoices by client:', error)
			return []
		}

		return data as SavedInvoice[]
	} catch (error) {
		console.error('Error fetching invoices by client:', error)
		return []
	}
}

// Get invoice count by client name
export const getInvoiceCountByClient = async (
	clientName: string,
): Promise<number> => {
	try {
		const {
			data: { user },
		} = await supabase.auth.getUser()

		if (!user) {
			return 0
		}

		const { count, error } = await (supabase as any)
			.from('invoices')
			.select('*', { count: 'exact', head: true })
			.eq('user_id', user.id)
			.eq('client_name', clientName)

		if (error) {
			console.error('Error fetching invoice count by client:', error)
			return 0
		}

		return count || 0
	} catch (error) {
		console.error('Error fetching invoice count by client:', error)
		return 0
	}
}

// // Get invoice counts for all clients
// export const getInvoiceCountsForClients = async (
// 	clientNames: string[],
// ): Promise<Record<string, number>> => {
// 	try {
// 		const {
// 			data: { user },
// 		} = await supabase.auth.getUser()

// 		if (!user || clientNames.length === 0) {
// 			return {}
// 		}

// 		const { data, error } = await (supabase as any)
// 			.from('invoices')
// 			.select('client_name')
// 			.eq('user_id', user.id)
// 			.in('client_name', clientNames)

// 		if (error) {
// 			console.error('Error fetching invoice counts for clients:', error)
// 			return {}
// 		}

// 		// Count invoices per client
// 		const counts: Record<string, number> = {}
// 		clientNames.forEach((name) => (counts[name] = 0))

// 		data.forEach((invoice: { client_name: string }) => {
// 			counts[invoice.client_name] = (counts[invoice.client_name] || 0) + 1
// 		})

// 		return counts
// 	} catch (error) {
// 		console.error('Error fetching invoice counts for clients:', error)
// 		return {}
// 	}
// }

// Analytics interfaces
export interface InvoiceAnalytics {
	totalInvoices: number
	totalRevenue: number
	paidInvoices: number
	pendingInvoices: number
	overdueInvoices: number
	averageInvoiceValue: number
	monthlyRevenue: Array<{ month: string; revenue: number; count: number }>
	statusBreakdown: Array<{
		status: string
		count: number
		percentage: number
	}>
	topClients: Array<{
		name: string
		totalRevenue: number
		invoiceCount: number
	}>
	recentActivity: Array<{
		date: string
		action: string
		invoice: string
		amount: number
	}>
}

// Get comprehensive analytics data
export const getInvoiceAnalytics = async (
	period: '30days' | '6months' | '1year' = '6months',
): Promise<InvoiceAnalytics | null> => {
	try {
		const {
			data: { user },
		} = await supabase.auth.getUser()

		if (!user) {
			return null
		}

		// Calculate date filter based on period
		const now = new Date()
		let dateFilter: string

		switch (period) {
			case '30days':
				dateFilter = new Date(
					now.getTime() - 30 * 24 * 60 * 60 * 1000,
				).toISOString()
				break
			case '6months':
				dateFilter = new Date(
					now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000,
				).toISOString()
				break
			case '1year':
				dateFilter = new Date(
					now.getTime() - 365 * 24 * 60 * 60 * 1000,
				).toISOString()
				break
			default:
				dateFilter = new Date(
					now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000,
				).toISOString()
		}

		const { data: invoices, error } = await (supabase as any)
			.from('invoices')
			.select('*')
			.eq('user_id', user.id)
			.gte('created_at', dateFilter)
			.order('created_at', { ascending: false })

		if (error) {
			console.error('Error fetching analytics data:', error)
			return null
		}

		const totalInvoices = invoices.length
		const totalRevenue = invoices.reduce(
			(sum: number, inv: SavedInvoice) =>
				inv.status === 'paid' ? sum + inv.total_amount : sum,
			0,
		)

		const paidInvoices = invoices.filter(
			(inv: SavedInvoice) => inv.status === 'paid',
		).length
		const pendingInvoices = invoices.filter(
			(inv: SavedInvoice) =>
				inv.status === 'draft' || inv.status === 'sent',
		).length
		const overdueInvoices = invoices.filter(
			(inv: SavedInvoice) => inv.status === 'overdue',
		).length

		const averageInvoiceValue =
			totalInvoices > 0
				? invoices.reduce(
						(sum: number, inv: SavedInvoice) =>
							sum + inv.total_amount,
						0,
					) / totalInvoices
				: 0

		// Monthly revenue calculation
		const monthlyData: Record<string, { revenue: number; count: number }> =
			{}
		invoices.forEach((inv: SavedInvoice) => {
			const month = new Date(inv.created_at).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
			})
			if (!monthlyData[month]) {
				monthlyData[month] = { revenue: 0, count: 0 }
			}
			if (inv.status === 'paid') {
				monthlyData[month].revenue += inv.total_amount
			}
			monthlyData[month].count += 1
		})

		const monthlyRevenue = Object.entries(monthlyData)
			.map(([month, data]) => ({ month, ...data }))
			.slice(0, 6)

		// Status breakdown
		const statusCounts: Record<string, number> = {}
		invoices.forEach((inv: SavedInvoice) => {
			statusCounts[inv.status] = (statusCounts[inv.status] || 0) + 1
		})

		const statusBreakdown = Object.entries(statusCounts).map(
			([status, count]) => ({
				status,
				count,
				percentage:
					totalInvoices > 0 ? (count / totalInvoices) * 100 : 0,
			}),
		)

		// Top clients
		const clientData: Record<
			string,
			{ totalRevenue: number; invoiceCount: number }
		> = {}
		invoices.forEach((inv: SavedInvoice) => {
			if (!clientData[inv.client_name]) {
				clientData[inv.client_name] = {
					totalRevenue: 0,
					invoiceCount: 0,
				}
			}
			if (inv.status === 'paid') {
				clientData[inv.client_name].totalRevenue += inv.total_amount
			}
			clientData[inv.client_name].invoiceCount += 1
		})

		const topClients = Object.entries(clientData)
			.map(([name, data]) => ({ name, ...data }))
			.sort((a, b) => b.totalRevenue - a.totalRevenue)
			.slice(0, 5)

		// Recent activity
		const recentActivity = invoices
			.slice(0, 10)
			.map((inv: SavedInvoice) => ({
				date: inv.updated_at,
				action: `Invoice ${inv.status}`,
				invoice: inv.invoice_number,
				amount: inv.total_amount,
			}))

		return {
			totalInvoices,
			totalRevenue,
			paidInvoices,
			pendingInvoices,
			overdueInvoices,
			averageInvoiceValue,
			monthlyRevenue,
			statusBreakdown,
			topClients,
			recentActivity,
		}
	} catch (error) {
		console.error('Error fetching analytics:', error)
		return null
	}
}
