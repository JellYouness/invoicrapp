'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DashboardHeader } from '@/components/DashboardHeader'
import { DashboardSidebar } from '@/components/DashboardSidebar'
import { AdminProvider } from '@/contexts/AdminContext'
import { useAuth } from '@/contexts/AuthContext'
import { Sidebar } from 'lucide-react'

export default function DashboardLayoutClient({
	children,
}: {
	children: React.ReactNode
}) {
	// const { user, loading } = useAuth()
	const router = useRouter()
	const pathname = usePathname()
	const [isSidebarOpen, setIsSidebarOpen] = useState(false)

	// useEffect(() => {
	// 	if (!loading && !user) {
	// 		router.replace('/auth')
	// 	}
	// }, [user, loading, router])

	// Extract the active tab from pathname
	const getActiveTab = () => {
		if (pathname === '/dashboard' || pathname === '/dashboard/')
			return 'invoices'
		const segments = pathname.split('/')
		return segments[2] || 'invoices' // /dashboard/[tab]
	}

	const activeTab = getActiveTab()

	return (
		<AdminProvider>
			<div className="h-[100dvh] bg-gray-50 flex flex-col">
				<DashboardHeader
					onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
				/>

				<div className="flex-1 flex h-[90dvh] lg:min-h-0">
					<DashboardSidebar
						activeTab={activeTab}
						isOpen={isSidebarOpen}
						onClose={() => setIsSidebarOpen(!isSidebarOpen)}
						// onTabChange={(tab) => router.push(`/dashboard/${tab}`)}
					/>

					<main className="flex-1 p-4 pb-safe lg:pb-4 overflow-y-auto bg-primary/5 lg:ml-0 h-full">
						<div className="max-w-7xl xl:max-w-full xl:px-4 mx-auto h-full">
							{children}
						</div>
					</main>
				</div>
			</div>
		</AdminProvider>
	)
}
