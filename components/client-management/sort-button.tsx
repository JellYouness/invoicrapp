'use client'

import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface SortButtonProps {
	column: string
	label: string
}

export function SortButton({ column, label }: SortButtonProps) {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

	// Get current state from URL
	const activeSort = searchParams.get('sort')
	const activeOrder = searchParams.get('order') || 'asc'
	const isActive = activeSort === column

	const handleSort = () => {
		const params = new URLSearchParams(searchParams.toString())

		if (isActive) {
			// If already active, toggle direction
			params.set('order', activeOrder === 'asc' ? 'desc' : 'asc')
		} else {
			// New column: set as active and default to asc
			params.set('sort', column)
			params.set('order', 'asc')
		}

		router.push(`${pathname}?${params.toString()}`, { scroll: false })
	}

	return (
		<Button
			className={`h-auto p-0 font-semibold hover:bg-transparent flex items-center gap-1 transition-colors ${
				isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
			}`}
			onClick={handleSort}
			variant="ghost"
		>
			{label}
			{isActive ? (
				activeOrder === 'asc' ? (
					<ArrowUp className="h-3.5 w-3.5" />
				) : (
					<ArrowDown className="h-3.5 w-3.5" />
				)
			) : (
				<ArrowUpDown className="h-3.5 w-3.5 opacity-30" />
			)}
		</Button>
	)
}
