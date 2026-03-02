'use server'

import { createClient } from '@/integrations/supabase/server/client'

export async function login(email: string, password: string) {
	const supabase = await createClient()

	return await supabase.auth.signInWithPassword({ email, password })
}
