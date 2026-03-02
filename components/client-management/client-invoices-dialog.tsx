import type { Dispatch, SetStateAction } from 'react'
import type { SavedInvoice } from '@/lib/invoice-service'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '../ui/dialog'
import SelectedClientInvoices from './selected-client-invoices'

export default function ClientsInvoicesDialog({
	showInvoicesDialog,
	setShowInvoicesDialog,
	handlePreviewInvoice,
	selectedClientInvoices,
}: {
	showInvoicesDialog: boolean
	setShowInvoicesDialog: Dispatch<SetStateAction<boolean>>
	selectedClientInvoices
	handlePreviewInvoice: (invoice: SavedInvoice) => void
}) {
	return (
		<Dialog onOpenChange={setShowInvoicesDialog} open={showInvoicesDialog}>
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

				<div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
					<div className="divide-y divide-gray-200">
						<SelectedClientInvoices
							handlePreviewInvoice={handlePreviewInvoice}
							invoices={selectedClientInvoices}
						/>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
