import { supabase } from '@/integrations/supabase/old/client'

export interface Client {
	id: string
	user_id: string
	name: string
	address?: string
	email?: string
	phone?: string
	tax_number?: string
	website?: string
	created_at: string
	updated_at: string
}

export interface ClientWithInvoiceCount extends Client {
	invoiceCount: number
}

export interface CreateClientData {
	name: string
	address?: string
	email?: string
	phone?: string
	tax_number?: string
	website?: string
}

// Get formatted address from client data
export const getClientAddress = (client: Client | CreateClientData): string => {
	return client.address || ''
}

// Convert legacy client info to new client format
export const convertLegacyClientInfo = (clientInfo: {
	name: string
	address: string
	email?: string
	phone?: string
}): CreateClientData => {
	return {
		name: clientInfo.name,
		address: clientInfo.address,
		email: clientInfo.email,
		phone: clientInfo.phone,
	}
}


// Get a specific client by ID
export const getClientById = async (id: string): Promise<Client | null> => {
	try {
		const {
			data: { user },
		} = await supabase.auth.getUser()

		if (!user) {
			return null
		}

		const { data, error } = await (supabase as any)
			.from('clients')
			.select('*')
			.eq('id', id)
			.eq('user_id', user.id)
			.single()

		if (error) {
			console.error('Error fetching client:', error)
			return null
		}

		return data as Client
	} catch (error) {
		console.error('Error fetching client:', error)
		return null
	}
}

// // Update an existing client
// export const updateClient = async (
// 	id: string,
// 	updates: Partial<CreateClientData>,
// ): Promise<Client | null> => {
// 	try {
// 		const {
// 			data: { user },
// 		} = await supabase.auth.getUser()

// 		if (!user) {
// 			return null
// 		}

// 		const { data, error } = await (supabase as any)
// 			.from('clients')
// 			.update(updates)
// 			.eq('id', id)
// 			.eq('user_id', user.id)
// 			.select()
// 			.single()

// 		if (error) {
// 			console.error('Error updating client:', error)
// 			return null
// 		}

// 		return data as Client
// 	} catch (error) {
// 		console.error('Error updating client:', error)
// 		return null
// 	}
// }

// Delete a client (soft delete by setting is_active to false)
// export const deleteClient = async (
// 	id: string,
// 	hardDelete: boolean = false,
// ): Promise<boolean> => {
// 	try {
// 		const {
// 			data: { user },
// 		} = await supabase.auth.getUser()

// 		if (!user) {
// 			return false
// 		}

// 		if (hardDelete) {
// 			const { error } = await (supabase as any)
// 				.from('clients')
// 				.delete()
// 				.eq('id', id)
// 				.eq('user_id', user.id)

// 			if (error) {
// 				console.error('Error deleting client:', error)
// 				return false
// 			}
// 		} else {
// 			// Soft delete
// 			const { error } = await (supabase as any)
// 				.from('clients')
// 				.update({ is_active: false })
// 				.eq('id', id)
// 				.eq('user_id', user.id)

// 			if (error) {
// 				console.error('Error deactivating client:', error)
// 				return false
// 			}
// 		}

// 		return true
// 	} catch (error) {
// 		console.error('Error deleting client:', error)
// 		return false
// 	}
// }

// Reactivate a client
export const reactivateClient = async (id: string): Promise<boolean> => {
	try {
		const {
			data: { user },
		} = await supabase.auth.getUser()

		if (!user) {
			return false
		}

		const { error } = await (supabase as any)
			.from('clients')
			.update({ is_active: true })
			.eq('id', id)
			.eq('user_id', user.id)

		if (error) {
			console.error('Error reactivating client:', error)
			return false
		}

		return true
	} catch (error) {
		console.error('Error reactivating client:', error)
		return false
	}
}

// Search clients by name or company
export const searchClients = async (searchTerm: string): Promise<Client[]> => {
	try {
		const {
			data: { user },
		} = await supabase.auth.getUser()

		if (!user) {
			return []
		}

		const { data, error } = await (supabase as any)
			.from('clients')
			.select('*')
			.eq('user_id', user.id)
			.eq('is_active', true)
			.or(
				`name.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`,
			)
			.order('name', { ascending: true })
			.limit(10)

		if (error) {
			console.error('Error searching clients:', error)
			return []
		}

		return data as Client[]
	} catch (error) {
		console.error('Error searching clients:', error)
		return []
	}
}
