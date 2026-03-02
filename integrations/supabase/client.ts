
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function createClient() {
	if (client) return client

	client = createBrowserClient(
		String(process.env.NEXT_PUBLIC_SUPABASE_URL),
		String(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
	)

	return client
}
