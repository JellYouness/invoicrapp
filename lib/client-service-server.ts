import { createClient } from '@/integrations/supabase/server/client'
import type { Client, ClientWithInvoiceCount } from './client-service'

// Get all clients for the current user
export const getUserClients = async (): Promise<Client[]> => {
	try {
		const supabaseServer = await createClient()
		const {
			data: { user },
		} = await supabaseServer.auth.getUser()

		if (!user) {
			return []
		}

		const query = supabaseServer
			.from('clients')
			.select('*')
			.eq('user_id', user.id)
			.order('name', { ascending: true })

		const { data, error } = await query

		if (error) {
			console.error('Error fetching clients:', error)
			return []
		}

		return data as Client[]
	} catch (error) {
		console.error('Error fetching clients:', error)
		return []
	}
}

// Get all clients for the current user with invoice counts
export const getUserClientsWithInvoiceCounts = async (
	searchTerm?: string,
): Promise<ClientWithInvoiceCount[]> => {
	try {
		const supabaseServer = await createClient()
		const {
			data: { user },
		} = await supabaseServer.auth.getUser()

		if (!user) return []

		let query = supabaseServer
			.from('clients')
			.select('*')
			.eq('user_id', user.id)

		// Add search logic if a term is provided
		if (searchTerm && searchTerm.trim() !== '') {
			const ilikeTerm = `%${searchTerm}%`
			query = query.or(
				`name.ilike.${ilikeTerm},email.ilike.${ilikeTerm},tax_number.ilike.${ilikeTerm},phone.ilike.${ilikeTerm}`,
			)
		}

		const { data: clients, error } = await query.order('name', { ascending: true })

		if (error) {
			console.error('Error fetching clients:', error)
			return []
		}

		if (!clients || clients.length === 0) return []

		// Get counts separately using the existing function that uses client_name
		const clientNames = clients.map(c => c.name)
		const counts = await getInvoiceCountsForClients(clientNames)

		return (clients as Client[]).map((client) => ({
			...client,
			invoiceCount: counts[client.name] || 0,
		})) as ClientWithInvoiceCount[]
	} catch (error) {
		console.error('Unexpected error in getUserClientsWithInvoiceCounts:', error)
		return []
	}
}

// Get invoice counts for all clients
export const getInvoiceCountsForClients = async (
	clientNames: string[],
): Promise<Record<string, number>> => {
	try {
		const supabaseServer = await createClient()
		const {
			data: { user },
		} = await supabaseServer.auth.getUser()

		if (!user || clientNames.length === 0) {
			return {}
		}

		const { data, error } = await supabaseServer
			.from('invoices')
			.select('client_name')
			.eq('user_id', user.id)
			.in('client_name', clientNames)

		if (error) {
			console.error('Error fetching invoice counts for clients:', error)
			return {}
		}

		// Count invoices per client
		const counts: Record<string, number> = Object.fromEntries(
			clientNames.map((name) => [name, 0]),
		)

		data.forEach((invoice: { client_name: string }) => {
			counts[invoice.client_name] = (counts[invoice.client_name] || 0) + 1
		})

		return counts
	} catch (error) {
		console.error('Error fetching invoice counts for clients:', error)
		return {}
	}
}
