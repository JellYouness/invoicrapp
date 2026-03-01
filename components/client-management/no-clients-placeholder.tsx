import { Users } from 'lucide-react'

export default function NoClientsPlaceholder({
	filteredAndSortedClients,
}: {
	filteredAndSortedClients: {
		invoiceCount: number
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
	}[]
}) {
	if (filteredAndSortedClients.length === 0)
		return (
			<div className="text-center py-16">
				<Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
				<h3 className="text-lg font-semibold text-gray-900 mb-2">
					No Clients Found
				</h3>
				<p className="text-gray-600 mb-4">
					{filteredAndSortedClients.length === 0
						? 'No clients match your current filters.'
						: 'Start by adding your first client.'}
				</p>
			</div>
		)
}
