import { createClient } from '@/integrations/supabase/server/client'
import type { SavedInvoice } from './invoice-service'

// Get a specific invoice by ID - Server Side
export const getInvoiceById = async (
	id: string,
): Promise<SavedInvoice | null> => {
	try {
		console.log("id: ", id)
		const supabaseServer = await createClient()
		const {
			data: { user },
			error: userError,
		} = await supabaseServer.auth.getUser()

		if (!user) {
			console.log('User not authenticated in getInvoiceById:', userError)
			return null
		}
		console.log(user)

		const { data, error } = await supabaseServer
			.from('invoices')
			.select('*')
			.eq('id', id)
			.eq('user_id', user.id)
			.single()

		if (error) {
			// console.error('Error fetching invoice:', error)
			return null
		}

		return data as SavedInvoice
	} catch (error) {
		console.error('Error fetching invoice:', error)
		return null
	}
}



// Get all invoices for the current user
export const getUserInvoices = async (): Promise<SavedInvoice[]> => {
	try {
		const supabaseServer = await createClient()
		const {
			data: { user },
		} = await supabaseServer.auth.getUser()

		if (!user) {
			return []
		}

		const { data, error } = await (supabaseServer)
			.from('invoices')
			.select('*')
			.eq('user_id', user.id)
			.order('created_at', { ascending: false })

		if (error) {
			// console.error('Error fetching invoices:', error)
			return []
		}

		return data as SavedInvoice[]
	} catch (error) {
		console.error('Error fetching invoices:', error)
		return []
	}
}


