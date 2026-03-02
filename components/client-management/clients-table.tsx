'use client'
import {
	Building,
	Edit,
	Eye,
	Globe,
	Mail,
	MapPin,
	MoreVertical,
	Phone,
	Receipt,
	Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { deleteClient } from '@/actions/clients'
import { showError, showSuccess } from '@/hooks/use-toast'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '../ui/table'
import { SortButton } from './sort-button'

interface Client {
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
}

interface ClientsTableProps {
	filteredAndSortedClients: Client[]
	selectedClientId?: string
	showSelectMode?: boolean
	onSelectClient?: (client: Client) => void
	handleEdit: (client: Client) => void
	handleViewInvoices: (client: Client) => void
}

export default function ClientsTable({
	filteredAndSortedClients,
	selectedClientId,
	showSelectMode,
	onSelectClient,
	handleEdit,
	handleViewInvoices,
}: ClientsTableProps) {
	const [isDeleting, setIsDeleting] = useState(false)
	const handleDelete = async (id: string) => {
		setIsDeleting(true)
		try {
			const success = await deleteClient(id)
			if (success) {
				showSuccess(
					'Client Deactivated',
					'Client has been deactivated successfully.',
				)
				// loadClients()
			} else {
				showError(
					'Error',
					'Failed to deactivate client. Please try again.',
				)
			}
		} catch (error) {
			console.error('Error deleting client:', error)
			showError('Error', 'Failed to deactivate client. Please try again.')
		} finally {
			setIsDeleting(false)
		}
	}

	if (filteredAndSortedClients.length > 0)
		return (
			<div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
				<Table>
					<TableHeader>
						<TableRow className="bg-gray-50/50">
							<TableHead className="w-10"></TableHead>

							<TableHead>
								<SortButton column="name" label="Name" />
							</TableHead>

							<TableHead>
								<SortButton column="email" label="Email" />
							</TableHead>

							<TableHead className="text-gray-500 font-semibold">
								Phone
							</TableHead>
							<TableHead>Location</TableHead>
							<TableHead>
								<SortButton
									column="invoiceCount"
									label="Invoices"
								/>
							</TableHead>

							<TableHead className="w-16 text-right pr-6">
								Actions
							</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{filteredAndSortedClients.map((client) => (
							<TableRow
								className={`cursor-pointer hover:bg-gray-50 ${
									selectedClientId === client.id
										? 'bg-blue-50'
										: ''
								}`}
								key={client.id}
								onClick={() =>
									showSelectMode && onSelectClient?.(client)
								}
							>
								<TableCell>
									<div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
										<Building className="w-4 h-4 text-white" />
									</div>
								</TableCell>
								<TableCell>
									<div className="font-semibold text-gray-900">
										{client.name}
									</div>
									{client.website && (
										<div className="text-sm text-gray-500 flex items-center gap-1">
											<Globe className="w-3 h-3" />
											{client.website.replace(
												/^https?:\/\//,
												'',
											)}
										</div>
									)}
								</TableCell>
								<TableCell>
									{client.email ? (
										<div className="flex items-center gap-2">
											<Mail className="w-4 h-4 text-gray-400" />
											<span className="text-gray-900">
												{client.email}
											</span>
										</div>
									) : (
										<span className="text-gray-400">—</span>
									)}
								</TableCell>
								<TableCell>
									{client.phone ? (
										<div className="flex items-center gap-2">
											<Phone className="w-4 h-4 text-gray-400" />
											<span className="text-gray-900">
												{client.phone}
											</span>
										</div>
									) : (
										<span className="text-gray-400">—</span>
									)}
								</TableCell>
								<TableCell>
									{client.address ? (
										<div className="flex items-center gap-2">
											<MapPin className="w-4 h-4 text-gray-400" />
											<span className="text-gray-900 truncate max-w-32">
												{client.address.split('\n')[0]}
											</span>
										</div>
									) : (
										<span className="text-gray-400">—</span>
									)}
								</TableCell>
								<TableCell>
									<Badge
										className="flex items-center gap-1 w-fit"
										variant="secondary"
									>
										<Receipt className="w-3 h-3" />
										{client.invoiceCount || 0}
									</Badge>
								</TableCell>
								<TableCell>
									{!showSelectMode && (
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													className="h-8 w-8 p-0"
													onClick={(e) =>
														e.stopPropagation()
													}
													size="sm"
													variant="ghost"
												>
													<MoreVertical className="w-4 h-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem
													onClick={() =>
														handleViewInvoices(
															client,
														)
													}
												>
													<Eye className="w-4 h-4 mr-2" />
													View Invoices (
													{client.invoiceCount || 0})
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() =>
														handleEdit(client)
													}
												>
													<Edit className="w-4 h-4 mr-2" />
													Edit
												</DropdownMenuItem>
												<DropdownMenuItem
													className="text-red-600"
													disabled={
														isDeleting === true
													}
													onClick={() =>
														handleDelete(client.id)
													}
												>
													<Trash2 className="w-4 h-4 mr-2" />
													{isDeleting === true
														? 'Deactivating...'
														: 'Deactivate'}
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		)
}
