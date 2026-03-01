'use client'

import { ArrowUpDown, Filter, Search, X } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Badge } from '../ui/badge'

export default function ClientFilters() {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

	
	const query = searchParams.get('search') || ''
	const filter = searchParams.get('filter') || 'all'
	const sort = searchParams.get('sort') || 'name'
	
	const updateParams = (updates: Record<string, string | null>) => {
		const params = new URLSearchParams(searchParams.toString())

		Object.entries(updates).forEach(([key, value]) => {
			if (value && value !== 'all' && value !== 'name') {
				params.set(key, value)
			} else {
				params.delete(key)
			}
		})

		router.push(`${pathname}?${params.toString()}`, { scroll: false })
	}

	const clearFilters = () => router.push(pathname)

	const hasActiveFilters = query || filter !== 'all' || sort !== 'name'

	return (
		<div className="flex flex-col gap-4 bg-white p-4 rounded-xl border shadow-sm">
			<div className="flex flex-col lg:flex-row gap-3">
				{/* Search Input */}
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
					<Input
						className="pl-9 bg-gray-50/50 border-gray-200 focus-visible:ring-blue-500"
						defaultValue={query}
						onChange={(e) =>
							updateParams({ search: e.target.value })
						}
						placeholder="Search by name, email, or tax ID..."
					/>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					{/* Status Filter Selector */}
					<div className="flex items-center gap-2">
						<Select
							onValueChange={(v) => updateParams({ filter: v })}
							value={filter}
						>
							<SelectTrigger className="w-[140px] bg-white">
								<Filter className="w-3.5 h-3.5 mr-2 text-gray-500" />
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Clients</SelectItem>
								<SelectItem value="with-invoices">
									With Invoices
								</SelectItem>
								<SelectItem value="no-invoices">
									No Invoices
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Sort Order Selector */}
					<div className="flex items-center gap-2">
						<Select
							onValueChange={(v) => updateParams({ sort: v })}
							value={sort}
						>
							<SelectTrigger className="w-[140px] bg-white">
								<ArrowUpDown className="w-3.5 h-3.5 mr-2 text-gray-500" />
								<SelectValue placeholder="Sort By" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="name">Name (A-Z)</SelectItem>
								<SelectItem value="invoiceCount">
									Most Invoices
								</SelectItem>
								<SelectItem value="created_at">
									Newest First
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Clear Button (Only shows when filters are active) */}
					{hasActiveFilters && (
						<Button
							className="text-xs h-9 px-2 text-gray-500 hover:text-red-600"
							onClick={clearFilters}
							variant="ghost"
						>
							<X className="w-3.5 h-3.5 mr-1" />
							Clear
						</Button>
					)}
				</div>
			</div>

			{/* Optional: Active Filter Badges */}
			{hasActiveFilters && (
				<div className="flex items-center gap-2 pt-2 border-t border-gray-100">
					<span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
						Active Filters:
					</span>
					{query && (
						<Badge className="text-[10px]" variant="secondary">
							Search: {query}
						</Badge>
					)}
					{filter !== 'all' && (
						<Badge className="text-[10px]" variant="secondary">
							Status: {filter.replace('-', ' ')}
						</Badge>
					)}
				</div>
			)}
		</div>
	)
}
