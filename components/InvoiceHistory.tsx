'use client'
import { format } from 'date-fns'
import {
	ArrowUpDown,
	Calendar,
	CircleCheck,
	DollarSign,
	Edit,
	Eye,
	FileText,
	Filter,
	MoreVertical,
	Search,
	Send,
	Trash2,
	User,
	X,
} from 'lucide-react'
import Link from 'next/link'
import { use, useState } from 'react'
import { deleteInvoice, updateInvoiceStatus } from '@/actions/invoices'
import { InvoicePreview } from '@/components/invoice/InvoicePreview'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
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
import { showError, showSuccess } from '@/hooks/use-toast'
import type { SavedInvoice } from '@/lib/invoice-service'
import { getDefaultTheme, getThemeById, getThemeMetadataSync } from '@/lib/invoice-themes'
import type { InvoiceData, InvoiceTheme } from '@/types/invoice'
import type { UserSettings } from '@/types/settings'

// interface InvoiceHistoryProps {
// 	onEditInvoice?: (invoice: SavedInvoice) => void
// 	onViewInvoice?: (invoice: SavedInvoice) => void
// }

const statusColors = {
	draft: 'bg-gray-100 text-gray-800 border-gray-200',
	sent: 'bg-blue-100 text-blue-800 border-blue-200',
	paid: 'bg-green-100 text-green-800 border-green-200',
	overdue: 'bg-red-100 text-red-800 border-red-200',
	cancelled: 'bg-orange-100 text-orange-800 border-orange-200',
}

const statusLabels = {
	draft: 'Draft',
	sent: 'Sent',
	paid: 'Paid',
	overdue: 'Overdue',
	cancelled: 'Cancelled',
}

export default function InvoiceHistory({
	invoicesPromise,
	userSettingsPromise,
}: {
	invoicesPromise: Promise<SavedInvoice[]>
	userSettingsPromise: Promise<UserSettings | null>
}) {
	// const [invoices, setInvoices] = useState<SavedInvoice[]>([])
	const invoices = use(invoicesPromise)
	const userSettings = use(userSettingsPromise)
	const [deletingId, setDeletingId] = useState<string | null>(null)
	const [previewInvoice, setPreviewInvoice] = useState<SavedInvoice | null>(
		null,
	)
	const [previewInvoiceData, setPreviewInvoiceData] = useState<InvoiceData | null>(
		null,
	)
	const [showPreviewDialog, setShowPreviewDialog] = useState(false)
	const [searchTerm, setSearchTerm] = useState('')
	const [sortBy, setSortBy] = useState<
		| 'invoice_number'
		| 'client_name'
		| 'invoice_date'
		| 'total_amount'
		| 'status'
	>('invoice_date')
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
	const [filterBy, setFilterBy] = useState<
		'all' | 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
	>('all')

	const handleDeleteInvoice = async (id: string) => {
		setDeletingId(id)
		try {
			const success = await deleteInvoice(id)
			if (success) {
				showSuccess(
					'Invoice Deleted',
					'Invoice has been successfully deleted.',
				)
			} else {
				showError(
					'Error Deleting Invoice',
					'Failed to delete the invoice. Please try again.',
				)
			}
		} catch (error) {
			console.error('Error deleting invoice:', error)
			showError(
				'Error Deleting Invoice',
				'Failed to delete the invoice. Please try again.',
			)
		} finally {
			setDeletingId(null)
		}
	}

	const handleStatusUpdate = async (
		id: string,
		newStatus: SavedInvoice['status'],
	) => {
		try {
			const success = await updateInvoiceStatus(id, newStatus)
			if (success) {
				showSuccess(
					'Status Updated',
					`Invoice status updated to ${statusLabels[newStatus]}.`,
				)
			} else {
				showError(
					'Error Updating Status',
					'Failed to update invoice status. Please try again.',
				)
			}
		} catch (error) {
			console.error('Error updating status:', error)
			showError(
				'Error Updating Status',
				'Failed to update invoice status. Please try again.',
			)
		}
	}

	// Convert SavedInvoice to InvoiceData format for preview
	const convertToInvoiceData = (savedInvoice: SavedInvoice, theme: InvoiceTheme): InvoiceData => {
		return {
			theme: theme,
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
			taxRate: (savedInvoice.subtotal > 0) 
				? (savedInvoice.tax_amount / savedInvoice.subtotal) * 100 
				: 0,
			customFields: savedInvoice.custom_fields || [],
		}
	}

	const handlePreviewInvoice = async (invoice: SavedInvoice) => {
		setPreviewInvoice(invoice)
		try {
			const theme = await getThemeById(invoice.theme_id) || await getDefaultTheme()
			const data = convertToInvoiceData(invoice, theme)
			setPreviewInvoiceData(data)
			setShowPreviewDialog(true)
		} catch (error) {
			console.error('Error loading theme for preview:', error)
			// Fallback if theme fails to load
			const themeMetadata = getThemeMetadataSync(invoice.theme_id)
			const fallbackTheme: InvoiceTheme = {
				id: invoice.theme_id,
				name: invoice.theme_name,
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
			const data = convertToInvoiceData(invoice, fallbackTheme)
			setPreviewInvoiceData(data)
			setShowPreviewDialog(true)
		}
	}

	const handleSort = (column: typeof sortBy) => {
		if (sortBy === column) {
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
		} else {
			setSortBy(column)
			setSortOrder('asc')
		}
	}

	const filteredAndSortedInvoices = invoices
		.filter((invoice) => {
			if (filterBy !== 'all' && invoice.status !== filterBy) return false
			if (searchTerm) {
				const searchLower = searchTerm.toLowerCase()
				return (
					invoice.invoice_number
						.toLowerCase()
						.includes(searchLower) ||
					invoice.client_name.toLowerCase().includes(searchLower) ||
					invoice.notes.toLowerCase().includes(searchLower)
				)
			}
			return true
		})
		.sort((a, b) => {
			let comparison = 0

			switch (sortBy) {
				case 'invoice_number':
					comparison = a.invoice_number.localeCompare(
						b.invoice_number,
					)
					break
				case 'client_name':
					comparison = a.client_name.localeCompare(b.client_name)
					break
				case 'invoice_date':
					comparison =
						new Date(a.invoice_date).getTime() -
						new Date(b.invoice_date).getTime()
					break
				case 'total_amount':
					comparison = a.total_amount - b.total_amount
					break
				case 'status':
					comparison = a.status.localeCompare(b.status)
					break
			}

			return sortOrder === 'asc' ? comparison : -comparison
		})

	return (
		<div className="space-y-6 w-full">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold text-gray-900">
						Invoices
					</h2>
					<p className="text-gray-600 mt-1">
						Manage and track all your invoices in one place
					</p>
				</div>
				{/* //TODO:maybe add something for a call back but with this set up we should need to revlidate here */}
				{/* <Button onClick={loadInvoices} size="sm" variant="outline">
					<RefreshCcw className="w-4 h-4 mr-2" />
					Refresh
				</Button> */}
			</div>

			{/* Search and Filters */}
			<div className="flex flex-col sm:flex-row gap-4">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
					<Input
						className="pl-10"
						onChange={(e) => setSearchTerm(e.target.value)}
						placeholder="Search invoices by number, client, or notes..."
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
							<SelectValue placeholder="Filter by status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Invoices</SelectItem>
							<SelectItem value="draft">Draft</SelectItem>
							<SelectItem value="sent">Sent</SelectItem>
							<SelectItem value="paid">Paid</SelectItem>
							<SelectItem value="overdue">Overdue</SelectItem>
							<SelectItem value="cancelled">Cancelled</SelectItem>
						</SelectContent>
					</Select>
					{(filterBy !== 'all' || searchTerm) && (
						<Button
							className="h-8 w-8 p-0"
							onClick={() => {
								setFilterBy('all')
								setSearchTerm('')
							}}
							size="sm"
							variant="ghost"
						>
							<X className="w-4 h-4" />
						</Button>
					)}
				</div>
			</div>

			{/* Invoices Table */}
			{filteredAndSortedInvoices.length === 0 ? (
				<div className="text-center py-16">
					<FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
					<h3 className="text-lg font-semibold text-gray-900 mb-2">
						No Invoices Found
					</h3>
					<p className="text-gray-600 mb-4">
						{searchTerm || filterBy !== 'all'
							? 'No invoices match your current filters.'
							: 'Start creating invoices to see them appear in your history.'}
					</p>
				</div>
			) : (
				<div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
					<Table>
						<TableHeader>
							<TableRow className="bg-gray-50">
								<TableHead className="w-8">
									{/* Status */}
								</TableHead>
								<TableHead>
									<Button
										className="h-auto p-0 font-semibold hover:bg-transparent hover:text-primary"
										onClick={() =>
											handleSort('invoice_number')
										}
										variant="ghost"
									>
										Invoice #
										<ArrowUpDown className="ml-1 h-4 w-4" />
									</Button>
								</TableHead>
								<TableHead>
									<Button
										className="h-auto p-0 font-semibold hover:bg-transparent hover:text-primary"
										onClick={() =>
											handleSort('client_name')
										}
										variant="ghost"
									>
										Client
										<ArrowUpDown className="ml-1 h-4 w-4" />
									</Button>
								</TableHead>
								<TableHead>
									<Button
										className="h-auto p-0 font-semibold hover:bg-transparent hover:text-primary"
										onClick={() =>
											handleSort('invoice_date')
										}
										variant="ghost"
									>
										Date
										<ArrowUpDown className="ml-1 h-4 w-4" />
									</Button>
								</TableHead>
								<TableHead>
									<Button
										className="h-auto p-0 font-semibold hover:bg-transparent hover:text-primary"
										onClick={() =>
											handleSort('total_amount')
										}
										variant="ghost"
									>
										Amount
										<ArrowUpDown className="ml-1 h-4 w-4" />
									</Button>
								</TableHead>
								<TableHead>
									<Button
										className="h-auto p-0 font-semibold hover:bg-transparent hover:text-primary"
										onClick={() => handleSort('status')}
										variant="ghost"
									>
										Status
										<ArrowUpDown className="ml-1 h-4 w-4" />
									</Button>
								</TableHead>
								<TableHead className="w-20">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredAndSortedInvoices.map((invoice) => (
								<TableRow
									className="cursor-pointer hover:bg-gray-50"
									key={invoice.id}
									onClick={() =>
										handlePreviewInvoice(invoice)
									}
								>
									<TableCell>
										<div
											className={`w-3 h-3 rounded-full ${
												invoice.status === 'paid'
													? 'bg-green-500'
													: invoice.status === 'sent'
														? 'bg-blue-500'
														: invoice.status ===
																'overdue'
															? 'bg-red-500'
															: invoice.status ===
																	'cancelled'
																? 'bg-orange-500'
																: 'bg-gray-500'
											}`}
										></div>
									</TableCell>
									<TableCell>
										<div className="font-semibold text-gray-900">
											{invoice.invoice_number}
										</div>
										<div className="text-sm text-gray-500">
											Created{' '}
											{format(
												new Date(invoice.created_at),
												'MMM dd, yyyy',
											)}
										</div>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											<User className="w-4 h-4 text-gray-400" />
											<span className="text-gray-900">
												{invoice.client_name}
											</span>
										</div>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											<Calendar className="w-4 h-4 text-gray-400" />
											<span className="text-gray-900">
												{format(
													new Date(
														invoice.invoice_date,
													),
													'MMM dd, yyyy',
												)}
											</span>
										</div>
										<div className="text-sm text-gray-500">
											Due:{' '}
											{format(
												new Date(invoice.due_date),
												'MMM dd, yyyy',
											)}
										</div>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											<DollarSign className="w-4 h-4 text-gray-400" />
											<span className="font-semibold text-gray-900">
												$
												{invoice.total_amount.toFixed(
													2,
												)}
											</span>
										</div>
									</TableCell>
									<TableCell>
										<Badge
											className={`${
												statusColors[
													invoice.status as keyof typeof statusColors
												]
											}`}
											variant="outline"
										>
											{
												statusLabels[
													invoice.status as keyof typeof statusLabels
												]
											}
										</Badge>
									</TableCell>
									<TableCell>
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
														handlePreviewInvoice(
															invoice,
														)
													}
												>
													<Eye className="w-4 h-4 mr-2" />
													View
												</DropdownMenuItem>
												<Link
													href={`/dashboard/create?editId=${invoice.id}`}
												>
													<DropdownMenuItem>
														<Edit className="w-4 h-4 mr-2" />
														Edit
													</DropdownMenuItem>
												</Link>
												<DropdownMenuItem
													onClick={() =>
														handleStatusUpdate(
															invoice.id,
															'sent',
														)
													}
												>
													<Send className="w-4 h-4 mr-2" />
													Mark as Sent
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() =>
														handleStatusUpdate(
															invoice.id,
															'paid',
														)
													}
												>
													<CircleCheck className="w-4 h-4 mr-2" />
													Mark as Paid
												</DropdownMenuItem>
												<DropdownMenuItem
													className="text-red-600"
													disabled={
														deletingId ===
														invoice.id
													}
													onClick={() =>
														handleDeleteInvoice(
															invoice.id,
														)
													}
												>
													<Trash2 className="w-4 h-4 mr-2" />
													{deletingId === invoice.id
														? 'Deleting...'
														: 'Delete'}
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}

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

					{previewInvoiceData && (
						<div className="mt-4">
							<InvoicePreview
								invoiceData={previewInvoiceData}
								userSettings={userSettings}
							/>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	)
}
