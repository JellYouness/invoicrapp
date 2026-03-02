'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/integrations/supabase/server/client'
import type { CreateInvoiceData, SavedInvoice } from '@/lib/invoice-service'
import { SubscriptionService } from '@/lib/subscription-service'

// Save a new invoice with usage tracking
export const saveInvoice = async (
	invoiceData: CreateInvoiceData,
): Promise<{ success: boolean; invoice?: SavedInvoice; error?: string }> => {
	try {
		const supabaseServer = await createClient()
		const {
			data: { user },
		} = await supabaseServer.auth.getUser()

		if (!user) return { success: false, error: 'User not authenticated' }

		const usageIncremented =
			await SubscriptionService.incrementInvoiceUsage(user.id)
		if (!usageIncremented) {
			return { success: false, error: 'Failed to update usage tracking.' }
		}

		const { data: invoice, error: invoiceError } = await supabaseServer
			.from('invoices')
			.insert({
				user_id: user.id,
				...invoiceData,
			})
			.select()
			.single()

		if (invoiceError) throw invoiceError

		const { data: currentSettings } = await supabaseServer
			.from('user_settings')
			.select('invoice_counter')
			.eq('user_id', user.id)
			.single()

		await supabaseServer
			.from('user_settings')
			.update({
				invoice_counter: (currentSettings?.invoice_counter || 0) + 1,
			})
			.eq('user_id', user.id)

		return { success: true, invoice: invoice as SavedInvoice }
	} catch (error) {
		console.error('Error in saveInvoice flow:', error)
		return { success: false, error: 'An unexpected error occurred.' }
	}
}

// Update invoice status
export const updateInvoiceStatus = async (
	id: string,
	status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled',
): Promise<boolean> => {
	try {
		const supabaseServer = await createClient()
		const {
			data: { user },
		} = await supabaseServer.auth.getUser()

		if (!user) {
			return false
		}

		const { error } = await supabaseServer
			.from('invoices')
			.update({ status })
			.eq('id', id)
			.eq('user_id', user.id)

		if (error) {
			console.error('Error updating invoice status:', error)
			return false
		}
		revalidatePath('/dashboard/invoices')
		return true
	} catch (error) {
		console.error('Error updating invoice status:', error)
		return false
	}
}

// Delete an invoice
export const deleteInvoice = async (id: string): Promise<boolean> => {
	try {
		const supabaseServer = await createClient()
		const {
			data: { user },
		} = await supabaseServer.auth.getUser()

		if (!user) {
			return false
		}

		const { error } = await supabaseServer
			.from('invoices')
			.delete()
			.eq('id', id)
			.eq('user_id', user.id)

		if (error) {
			console.error('Error deleting invoice:', error)
			return false
		}
		revalidatePath('/dashboard/invoices')
		return true
	} catch (error) {
		console.error('Error deleting invoice:', error)
		return false
	}
}
