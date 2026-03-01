'use server'

import { supabase } from '@/integrations/supabase/old/client'
import { createClient } from '@/integrations/supabase/server/client'

export const deleteClient = async (
	id: string,
	hardDelete: boolean = false,
): Promise<boolean> => {
	try {
        const supabaseServer = await createClient()
		const {
			data: { user },
		} = await supabase.auth.getUser()

		if (!user) {
			return false
		}

		if (hardDelete) {
			const { error } = await (supabaseServer)
				.from('clients')
				.delete()
				.eq('id', id)
				.eq('user_id', user.id)

			if (error) {
				console.error('Error deleting client:', error)
				return false
			}
		} else {
			// Soft delete
			const { error } = await (supabaseServer)
				.from('clients')
				.update({ is_active: false })
				.eq('id', id)
				.eq('user_id', user.id)

			if (error) {
				console.error('Error deactivating client:', error)
				return false
			}
		}

		return true
	} catch (error) {
		console.error('Error deleting client:', error)
		return false
	}
}
