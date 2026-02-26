'use client'
import {
	ArrowUpDown,
	Building,
	Calendar,
	Clock,
	DollarSign,
	Edit,
	Eye,
	Filter,
	Globe,
	Mail,
	MapPin,
	MoreVertical,
	Phone,
	Plus,
	Receipt,
	Search,
	Trash2,
	Users,
	X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { InvoicePreview } from '@/components/invoice/InvoicePreview'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { showError, showSuccess } from '@/hooks/use-toast'
import {
	type Client,
	deleteClient,
	getUserClients,
	saveClient,
	searchClients,
	updateClient,
} from '@/lib/client-service'
import {
	getInvoiceCountsForClients,
	getInvoicesByClient,
	type SavedInvoice,
} from '@/lib/invoice-service'
import { getThemeMetadataSync } from '@/lib/invoice-themes'
import type { InvoiceData } from '@/types/invoice'

interface ClientManagementProps {
	onSelectClient?: (client: Client) => void
	selectedClientId?: string
	showSelectMode?: boolean
}

interface ClientWithInvoices extends Client {
	invoiceCount?: number
	invoices?: SavedInvoice[]
}

export const ClientManagement = ({
	onSelectClient,
	selectedClientId,
	showSelectMode = false,
}: ClientManagementProps) => {
	const [clients, setClients] = useState<ClientWithInvoices[]>([])
	const [loading, setLoading] = useState(true)
	const [searchTerm, setSearchTerm] = useState('')
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [editingClient, setEditingClient] = useState<Client | null>(null)
	const [isSaving, setIsSaving] = useState(false)
	const [deletingId, setDeletingId] = useState<string | null>(null)
	const [selectedClientInvoices, setSelectedClientInvoices] = useState<
		SavedInvoice[]
	>([])
	const [showInvoicesDialog, setShowInvoicesDialog] = useState(false)
	const [loadingInvoices, setLoadingInvoices] = useState(false)
	const [previewInvoice, setPreviewInvoice] = useState<SavedInvoice | null>(
		null,
	)
	const [showPreviewDialog, setShowPreviewDialog] = useState(false)
	const [isSaved, setIsSaved] = useState(false)
	const [sortBy, setSortBy] = useState<
		'name' | 'email' | 'invoiceCount' | 'created_at'
	>('name')
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
	const [filterBy, setFilterBy] = useState<
		'all' | 'with-invoices' | 'no-invoices'
	>('all')
	// Using enhanced toast helpers

	interface ClientFormData {
		name: string
		address: string
		email: string
		phone: string
		tax_number: string
		website: string
	}

	const [formData, setFormData] = useState<ClientFormData>({
		name: '',
		address: '',
		email: '',
		phone: '',
		tax_number: '',
		website: '',
	})

	const loadClients = async () => {
		try {
			setLoading(true)
			const userClients = await getUserClients()

			// Get invoice counts for all clients
			const clientNames = userClients.map((client) => client.name)
			const invoiceCounts = await getInvoiceCountsForClients(clientNames)

			// Add invoice counts to clients
			const clientsWithCounts = userClients.map((client) => ({
				...client,
				invoiceCount: invoiceCounts[client.name] || 0,
			}))

			setClients(clientsWithCounts)
		} catch (error) {
			console.error('Error loading clients:', error)
			showError(
				'Error Loading Clients',
				'Failed to load your clients. Please try again.',
			)
		} finally {
			setLoading(false)
		}
	}

	const handleSearch = async (term: string) => {
		setSearchTerm(term)
		if (term.trim()) {
			try {
				const searchResults = await searchClients(term)

				// Get invoice counts for search results
				const clientNames = searchResults.map((client) => client.name)
				const invoiceCounts =
					await getInvoiceCountsForClients(clientNames)

				const resultsWithCounts = searchResults.map((client) => ({
					...client,
					invoiceCount: invoiceCounts[client.name] || 0,
				}))

				setClients(resultsWithCounts)
			} catch (error) {
				console.error('Error searching clients:', error)
			}
		} else {
			loadClients()
		}
	}

	const resetForm = () => {
		setFormData({
			name: '',
			address: '',
			email: '',
			phone: '',
			tax_number: '',
			website: '',
		})
		setEditingClient(null)
	}

	const handleEdit = (client: Client) => {
		setEditingClient(client)
		setFormData({
			name: client.name,
			address: client.address || '',
			email: client.email || '',
			phone: client.phone || '',
			tax_number: client.tax_number || '',
			website: client.website || '',
		})
		setIsDialogOpen(true)
	}

	const handleSave = async () => {
		if (!formData.name.trim()) {
			showError('Validation Error', 'Client name is required.')
			return
		}

		setIsSaving(true)
		try {
			let result
			if (editingClient) {
				result = await updateClient(editingClient.id, formData)
			} else {
				result = await saveClient(formData)
			}

			if (result) {
				showSuccess(
					editingClient ? 'Client Updated' : 'Client Created',
					`${formData.name} has been ${
						editingClient ? 'updated' : 'created'
					} successfully.`,
				)
				setIsDialogOpen(false)
				resetForm()
				loadClients()
			} else {
				showError(
					'Error',
					`Failed to ${
						editingClient ? 'update' : 'create'
					} client. Please try again.`,
				)
			}
		} catch (error) {
			console.error('Error saving client:', error)
			showError(
				'Error',
				`Failed to ${
					editingClient ? 'update' : 'create'
				} client. Please try again.`,
			)
		} finally {
			setIsSaving(false)
		}
	}

	const handleDelete = async (id: string) => {
		setDeletingId(id)
		try {
			const success = await deleteClient(id)
			if (success) {
				showSuccess(
					'Client Deactivated',
					'Client has been deactivated successfully.',
				)
				loadClients()
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
			setDeletingId(null)
		}
	}

	const handleViewInvoices = async (client: ClientWithInvoices) => {
		setLoadingInvoices(true)
		try {
			const invoices = await getInvoicesByClient(client.name)
			setSelectedClientInvoices(invoices)
			setShowInvoicesDialog(true)
		} catch (error) {
			console.error('Error loading client invoices:', error)
			showError(
				'Error Loading Invoices',
				'Failed to load invoices for this client.',
			)
		} finally {
			setLoadingInvoices(false)
		}
	}

	// Convert SavedInvoice to InvoiceData format for preview
	const convertToInvoiceData = (savedInvoice: SavedInvoice): InvoiceData => {
		const themeMetadata = getThemeMetadataSync(savedInvoice.theme_id)

		// Create a minimal theme object for preview purposes
		const previewTheme = {
			id: savedInvoice.theme_id,
			name: savedInvoice.theme_name,
			color: themeMetadata?.id.split('-')[1] || 'blue',
			description: themeMetadata?.description || 'Professional theme',
			version: themeMetadata?.version || '1.0.0',
			author: themeMetadata?.author || 'Invoicr',
			preview: themeMetadata?.preview || {
				primary: '#3b82f6',
				secondary: '#dbeafe',
				accent: '#1e40af',
			},
			styles: {
				primary: `text-invoice-${themeMetadata?.id.split('-')[1] || 'blue'}`,
				primaryLight: `bg-invoice-${
					themeMetadata?.id.split('-')[1] || 'blue'
				}-light`,
				text: `text-invoice-${themeMetadata?.id.split('-')[1] || 'blue'}`,
				background: `bg-invoice-${
					themeMetadata?.id.split('-')[1] || 'blue'
				}-light`,
				border: `border-invoice-${themeMetadata?.id.split('-')[1] || 'blue'}`,
			},
			layout: {
				headerStyle: 'classic',
				footerStyle: 'minimal',
				spacing: 'comfortable',
				typography: {
					headerFont: 'font-semibold',
					bodyFont: 'font-normal',
					accentFont: 'font-medium',
				},
			},
			customCSS: '',
		}

		return {
			theme: previewTheme,
			client: {
				name: savedInvoice.client_name,
				address: savedInvoice.client_address,
				email: savedInvoice.client_email || undefined,
				phone: savedInvoice.client_phone || undefined,
			},
			items: savedInvoice.items,
			invoiceNumber: savedInvoice.invoice_number,
			date: savedInvoice.invoice_date,
			dueDate: savedInvoice.due_date,
			notes: savedInvoice.notes || undefined,
			currency: 'USD',
			paymentTerms: 'Net 30',
			taxRate: 0,
		}
	}

	const handlePreviewInvoice = (invoice: SavedInvoice) => {
		setPreviewInvoice(invoice)
		setShowPreviewDialog(true)
	}

	const handleSort = (column: typeof sortBy) => {
		if (sortBy === column) {
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
		} else {
			setSortBy(column)
			setSortOrder('asc')
		}
	}

	const filteredAndSortedClients = clients
		.filter((client) => {
			if (filterBy === 'with-invoices')
				return (client.invoiceCount || 0) > 0
			if (filterBy === 'no-invoices')
				return (client.invoiceCount || 0) === 0
			return true
		})
		.sort((a, b) => {
			let comparison = 0

			switch (sortBy) {
				case 'name':
					comparison = a.name.localeCompare(b.name)
					break
				case 'email':
					comparison = (a.email || '').localeCompare(b.email || '')
					break
				case 'invoiceCount':
					comparison = (a.invoiceCount || 0) - (b.invoiceCount || 0)
					break
				case 'created_at':
					comparison =
						new Date(a.created_at).getTime() -
						new Date(b.created_at).getTime()
					break
			}

			return sortOrder === 'asc' ? comparison : -comparison
		})

	useEffect(() => {
		loadClients()
	}, [])

	if (loading) {
		return (
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-lg md:text-2xl font-bold">
						Client Management
					</h2>
				</div>
				<div className="grid gap-4">
					{[1, 2, 3].map((i) => (
						<Card className="animate-pulse" key={i}>
							<CardContent className="p-6">
								<div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
								<div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl md:text-2xl font-bold text-gray-900">
						{showSelectMode ? 'Select Client' : 'Client Management'}
					</h2>
					<p className="text-sm md:text-base text-gray-600 mt-1">
						{showSelectMode
							? 'Choose a client for your invoice'
							: 'Manage your client database'}
					</p>
				</div>
				<Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
					<DialogTrigger asChild>
						<Button
							className="flex items-center gap-2"
							onClick={resetForm}
						>
							<Plus className="w-4 h-4" />
							Add Client
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>
								{editingClient
									? 'Edit Client'
									: 'Add New Client'}
							</DialogTitle>
							<DialogDescription>
								{editingClient
									? 'Update client information'
									: 'Create a new client profile'}
							</DialogDescription>
						</DialogHeader>

						<div className="grid gap-4 py-4">
							<div>
								<Label htmlFor="name">Name *</Label>
								<Input
									id="name"
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											name: e.target.value,
										}))
									}
									placeholder="Client name"
									value={formData.name}
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												email: e.target.value,
											}))
										}
										placeholder="client@example.com"
										type="email"
										value={formData.email}
									/>
								</div>
								<div>
									<Label htmlFor="phone">Phone</Label>
									<Input
										id="phone"
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												phone: e.target.value,
											}))
										}
										placeholder="+1 (555) 123-4567"
										value={formData.phone}
									/>
								</div>
							</div>

							<div>
								<Label htmlFor="address">Address</Label>
								<Textarea
									id="address"
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											address: e.target.value,
										}))
									}
									placeholder="123 Main Street\nSuite 100\nNew York, NY 10001\nUnited States"
									rows={3}
									value={formData.address}
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label htmlFor="tax_number">
										Tax Number
									</Label>
									<Input
										id="tax_number"
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												tax_number: e.target.value,
											}))
										}
										placeholder="Tax ID"
										value={formData.tax_number}
									/>
								</div>
								<div>
									<Label htmlFor="website">Website</Label>
									<Input
										id="website"
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												website: e.target.value,
											}))
										}
										placeholder="https://example.com"
										value={formData.website}
									/>
								</div>
							</div>
						</div>

						<DialogFooter className="gap-2">
							<Button
								onClick={() => setIsDialogOpen(false)}
								variant="outline"
							>
								Cancel
							</Button>
							<Button disabled={isSaving} onClick={handleSave}>
								{isSaving
									? 'Saving...'
									: editingClient
										? 'Update'
										: 'Create'}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			{/* Search and Filters */}
			<div className="flex flex-col sm:flex-row gap-4">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
					<Input
						className="pl-10"
						onChange={(e) => handleSearch(e.target.value)}
						placeholder="Search clients by name, company, or email..."
						value={searchTerm}
					/>
				</div>
				<div className="flex gap-2 items-center">
					<Filter className="w-4 h-4 text-gray-500" />
					<Select
						onValueChange={(value: typeof filterBy) =>
							setFilterBy(value)
						}
						value={filterBy}
					>
						<SelectTrigger className="w-48">
							<SelectValue placeholder="Filter clients" />
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
					{(filterBy !== 'all' || searchTerm) && (
						<Button
							className="h-8 w-8 p-0"
							onClick={() => {
								setFilterBy('all')
								setSearchTerm('')
								loadClients()
							}}
							size="sm"
							variant="ghost"
						>
							<X className="w-4 h-4" />
						</Button>
					)}
				</div>
			</div>

			{/* Clients Table */}
			{filteredAndSortedClients.length === 0 ? (
				<div className="text-center py-16">
					<Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
					<h3 className="text-lg font-semibold text-gray-900 mb-2">
						No Clients Found
					</h3>
					<p className="text-gray-600 mb-4">
						{searchTerm || filterBy !== 'all'
							? 'No clients match your current filters.'
							: 'Start by adding your first client.'}
					</p>
				</div>
			) : (
				<div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
					<Table>
						<TableHeader>
							<TableRow className="bg-gray-50">
								<TableHead className="w-8">
									{/* Avatar */}
								</TableHead>
								<TableHead>
									<Button
										className="h-auto p-0 font-semibold hover:bg-transparent hover:text-primary"
										onClick={() => handleSort('name')}
										variant="ghost"
									>
										Name
										<ArrowUpDown className="ml-1 h-4 w-4" />
									</Button>
								</TableHead>
								<TableHead>
									<Button
										className="h-auto p-0 font-semibold hover:bg-transparent hover:text-primary"
										onClick={() => handleSort('email')}
										variant="ghost"
									>
										Email
										<ArrowUpDown className="ml-1 h-4 w-4" />
									</Button>
								</TableHead>
								<TableHead>Phone</TableHead>
								<TableHead>Location</TableHead>
								<TableHead>
									<Button
										className="h-auto p-0 font-semibold hover:bg-transparent hover:text-primary"
										onClick={() =>
											handleSort('invoiceCount')
										}
										variant="ghost"
									>
										Invoices
										<ArrowUpDown className="ml-1 h-4 w-4" />
									</Button>
								</TableHead>
								<TableHead className="w-20">Actions</TableHead>
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
										showSelectMode &&
										onSelectClient?.(client)
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
											<span className="text-gray-400">
												—
											</span>
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
											<span className="text-gray-400">
												—
											</span>
										)}
									</TableCell>
									<TableCell>
										{client.address ? (
											<div className="flex items-center gap-2">
												<MapPin className="w-4 h-4 text-gray-400" />
												<span className="text-gray-900 truncate max-w-32">
													{
														client.address.split(
															'\n',
														)[0]
													}
												</span>
											</div>
										) : (
											<span className="text-gray-400">
												—
											</span>
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
														{client.invoiceCount ||
															0}
														)
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
															deletingId ===
															client.id
														}
														onClick={() =>
															handleDelete(
																client.id,
															)
														}
													>
														<Trash2 className="w-4 h-4 mr-2" />
														{deletingId ===
														client.id
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
			)}

			{/* Client Invoices Dialog */}
			<Dialog
				onOpenChange={setShowInvoicesDialog}
				open={showInvoicesDialog}
			>
				<DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							Invoices for{' '}
							{selectedClientInvoices.length > 0
								? selectedClientInvoices[0].client_name
								: 'Client'}
						</DialogTitle>
						<DialogDescription>
							View all invoices for this client
						</DialogDescription>
					</DialogHeader>

					{loadingInvoices ? (
						<div className="space-y-4">
							{[1, 2, 3].map((i) => (
								<div
									className="animate-pulse bg-gray-100 h-16 rounded"
									key={i}
								></div>
							))}
						</div>
					) : selectedClientInvoices.length === 0 ? (
						<div className="text-center py-8">
							<Receipt className="w-16 h-16 mx-auto text-gray-400 mb-4" />
							<h3 className="text-lg font-semibold text-gray-900 mb-2">
								No Invoices Found
							</h3>
							<p className="text-gray-600">
								This client doesn't have any invoices yet.
							</p>
						</div>
					) : (
						<div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
							<div className="divide-y divide-gray-200">
								{selectedClientInvoices.map((invoice) => (
									<div
										className="group relative flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer"
										key={invoice.id}
										onClick={() =>
											handlePreviewInvoice(invoice)
										}
									>
										<div className="flex items-center space-x-4 flex-1">
											<div className="flex-shrink-0">
												<div
													className={`w-10 h-10 rounded-full flex items-center justify-center ${
														invoice.status ===
														'paid'
															? 'bg-gradient-to-r from-green-500 to-green-600'
															: invoice.status ===
																	'sent'
																? 'bg-gradient-to-r from-blue-500 to-blue-600'
																: invoice.status ===
																		'overdue'
																	? 'bg-gradient-to-r from-red-500 to-red-600'
																	: invoice.status ===
																			'cancelled'
																		? 'bg-gradient-to-r from-orange-500 to-orange-600'
																		: 'bg-gradient-to-r from-gray-500 to-gray-600'
													}`}
												>
													<Receipt className="w-5 h-5 text-white" />
												</div>
											</div>

											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-3 mb-1">
													<h4 className="text-base font-semibold text-gray-900">
														{invoice.invoice_number}
													</h4>
													<Badge
														className="text-xs"
														variant={
															invoice.status ===
															'paid'
																? 'default'
																: invoice.status ===
																		'sent'
																	? 'secondary'
																	: invoice.status ===
																			'overdue'
																		? 'destructive'
																		: 'outline'
														}
													>
														{invoice.status}
													</Badge>
												</div>

												<div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
													<div className="flex items-center gap-1">
														<Calendar className="w-4 h-4" />
														<span>
															{new Date(
																invoice.invoice_date,
															).toLocaleDateString()}
														</span>
													</div>
													<div className="flex items-center gap-1">
														<DollarSign className="w-4 h-4" />
														<span className="font-semibold text-gray-900">
															$
															{invoice.total_amount.toFixed(
																2,
															)}
														</span>
													</div>
													<div className="flex items-center gap-1 text-xs">
														<Clock className="w-4 h-4" />
														<span>
															Due{' '}
															{new Date(
																invoice.due_date,
															).toLocaleDateString()}
														</span>
													</div>
												</div>

												{invoice.notes && (
													<div className="mt-2 text-sm text-gray-600 truncate">
														<span className="font-medium">
															Notes:
														</span>{' '}
														{invoice.notes}
													</div>
												)}
											</div>
										</div>

										<div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
											<Button
												className="h-8 w-8 p-0"
												onClick={(e) => {
													e.stopPropagation()
													handlePreviewInvoice(
														invoice,
													)
												}}
												size="sm"
												variant="ghost"
											>
												<Eye className="w-4 h-4" />
											</Button>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Invoice Preview Dialog */}
			<Dialog
				onOpenChange={setShowPreviewDialog}
				open={showPreviewDialog}
			>
				<DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Eye className="w-5 h-5" />
							Invoice Preview - {previewInvoice?.invoice_number}
						</DialogTitle>
					</DialogHeader>

					{previewInvoice && (
						<div className="mt-4">
							<InvoicePreview
								invoiceData={convertToInvoiceData(
									previewInvoice,
								)}
								isSaved={isSaved}
								setIsSaved={setIsSaved}
							/>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	)
}
