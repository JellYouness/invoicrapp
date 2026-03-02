'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function DashboardPageClient() {
	const { user, loading } = useAuth()
	const router = useRouter()
	//TODO: BOunce this out in proxy.ts instead of threw the ui
	useEffect(() => {
		if (!loading && !user) {
			router.replace('/auth')
		} else if (!loading && user) {
			// Redirect to invoices page as default dashboard view
			router.replace('/dashboard/invoices')
		}
	}, [user, loading, router])

	if (loading) {
		return (
			<div className="h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading...</p>
				</div>
			</div>
		)
	}

	return null // Will redirect via useEffect
}
