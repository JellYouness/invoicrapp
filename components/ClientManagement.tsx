'use client'
import { use, useState } from 'react'
import { showError, showSuccess } from '@/hooks/use-toast'
import { type Client, saveClient, updateClient } from '@/lib/client-service'
import { getInvoicesByClient, type SavedInvoice } from '@/lib/invoice-service'
import type { UserSettings } from '@/types/settings'
import AddEditClientFormButton from './client-management/add-edit-client-form-button'
import ClientsInvoicesDialog from './client-management/client-invoices-dialog'
import ClientsTable from './client-management/clients-table'
import NoClientsPlaceholder from './client-management/no-clients-placeholder'
import PreviewInvoiceDialog from './client-management/preview-invoice-dialog'
import ClientFilters from './client-management/search-form'

interface ClientManagementProps {
	showSelectMode?: boolean
	clientsPromise: Promise<Client[] | null>
	clientsInvoiceCountPromise: Promise<Record<string, number>>
	userSettingsPromise: Promise<UserSettings>
}

interface ClientWithInvoices extends Client {
	invoiceCount?: number
	invoices?: SavedInvoice[]
}

export const ClientManagement = ({
	clientsInvoiceCountPromise,
	clientsPromise,
	showSelectMode = false,
	userSettingsPromise,
}: ClientManagementProps) => {
	// const [clients, setClients] = useState<ClientWithInvoices[]>([])

	const clientsWithOutCount = use(clientsPromise)
	const clientsInvoiceCount = use(clientsInvoiceCountPromise)
	const userSettings = use(userSettingsPromise)

	const clients =
		clientsWithOutCount?.map((client) => ({
			...client,
			invoiceCount: clientsInvoiceCount?.[client.name] || 0,
		})) || []

	const [isDialogOpen, setIsDialogOpen] = useState<{
		isDialogOpen: boolean
		isEditing: boolean
	}>({ isDialogOpen: false, isEditing: false })
	const [editingClient, setEditingClient] = useState<Client | null>(null)
	const [isSaving, setIsSaving] = useState(false)
	const [selectedClientInvoices, setSelectedClientInvoices] = useState<
		SavedInvoice[]
	>([])
	const [showInvoicesDialog, setShowInvoicesDialog] = useState(false)
	// const [loadingInvoices, setLoadingInvoices] = useState(false)
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
		setIsDialogOpen({ isDialogOpen: true, isEditing: true })
	}

	const handleSave = async () => {
		if (!formData.name.trim()) {
			showError('Validation Error', 'Client name is required.')
			return
		}

		setIsSaving(true)
		try {
			let result: any
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
				setIsDialogOpen({ isDialogOpen: false, isEditing: false })
				resetForm()
				// loadClients()
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

	const handleViewInvoices = async (client: ClientWithInvoices) => {
		// setLoadingInvoices(true)
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
			// setLoadingInvoices(false)
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

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl md:text-2xl font-bold text-gray-900">
						{showSelectMode ? 'Select Client' : 'Client Management'}
					</h2>
					<p className="text-sm md:text-base text-gray-600 mt-1">
						{!showSelectMode
							? 'Choose a client for your invoice'
							: 'Manage your client database'}
					</p>
				</div>
				<AddEditClientFormButton
					formData={formData}
					handleSave={handleSave}
					isDialogOpen={isDialogOpen}
					isSaving={isSaving}
					resetForm={resetForm}
					setFormData={setFormData}
					setIsDialogOpen={setIsDialogOpen}
				/>
			</div>
			{/* Search and Filters */}
			<ClientFilters />
			{/* Clients Table */}
			<NoClientsPlaceholder
				filteredAndSortedClients={filteredAndSortedClients}
			/>

			<ClientsTable
				filteredAndSortedClients={filteredAndSortedClients}
				handleEdit={handleEdit}
				handleSort={handleSort}
				handleViewInvoices={handleViewInvoices}
			/>

			{/* Client Invoices Dialog */}
			<ClientsInvoicesDialog
				handlePreviewInvoice={handlePreviewInvoice}
				selectedClientInvoices={selectedClientInvoices}
				setShowInvoicesDialog={setShowInvoicesDialog}
				showInvoicesDialog={showInvoicesDialog}
			/>
			{/* Invoice Preview Dialog */}
			<PreviewInvoiceDialog
				isSaved={isSaved}
				previewInvoice={previewInvoice}
				setIsSaved={setIsSaved}
				setShowPreviewDialog={setShowPreviewDialog}
				showPreviewDialog={showPreviewDialog}
				userSettings={userSettings}
			/>
		</div>
	)
}
