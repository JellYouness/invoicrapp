import { createClient } from '@/integrations/supabase/server/client'
import type { UserSettings } from '@/types/settings'

export async function getUserSettings(): Promise<UserSettings | null> {
	try {
		const supabaseServer = await createClient()

		const {
			data: { user },
		} = await supabaseServer.auth.getUser()

		if (!user) {
			return null
		}
		const { data, error } = await supabaseServer
			.from('user_settings')
			.select('*')
			.eq('user_id', user.id)
			.single()

		// console.log('User Settings: ', data)
		if (error) {
			if (error.code === 'PGRST116') {
				// No settings found, return null
				return null
			}
			// throw error
		}

		return data
	} catch (error) {
		console.error('Error fetching user settings:', error)
		throw error
	}
}
