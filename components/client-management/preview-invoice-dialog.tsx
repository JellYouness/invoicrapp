import { Eye } from 'lucide-react'
import type { SavedInvoice } from '@/lib/invoice-service'
import { getThemeMetadataSync } from '@/lib/invoice-themes'
import type { InvoiceData } from '@/types/invoice'
import { InvoicePreview } from '../invoice/InvoicePreview'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'

export default function PreviewInvoiceDialog({
	setShowPreviewDialog,
	showPreviewDialog,
	previewInvoice,
	isSaved,
	setIsSaved,
	userSettings,
}) {
	const convertToInvoiceData = (
		savedInvoice: SavedInvoice | null,
	): InvoiceData | null => {
		const themeMetadata = getThemeMetadataSync(savedInvoice?.theme_id)

		const themeColor = themeMetadata?.id?.split('-')[1] || 'blue'

		if (!savedInvoice) {
			return null
		}

		const previewTheme = {
			id: savedInvoice?.theme_id || 'default-blue',
			name: savedInvoice?.theme_name || 'Default Theme',
			color: themeColor,
			description: themeMetadata?.description || 'Professional theme',
			version: themeMetadata?.version || '1.0.0',
			author: themeMetadata?.author || 'Invoicr',
			preview: themeMetadata?.preview || {
				primary: '#3b82f6',
				secondary: '#dbeafe',
				accent: '#1e40af',
			},
			styles: {
				primary: `text-invoice-${themeColor}`,
				primaryLight: `bg-invoice-${themeColor}-light`,
				text: `text-invoice-${themeColor}`,
				background: `bg-invoice-${themeColor}-light`,
				border: `border-invoice-${themeColor}`,
			},
			layout: {
				headerStyle: 'classic' as const,
				footerStyle: 'minimal' as const,
				spacing: 'comfortable' as const,
				typography: {
					headerFont: 'font-semibold',
					bodyFont: 'font-normal',
					accentFont: 'font-medium',
				},
			},
			customCSS: '',
		}

		// 3. Return the mapped data with fallbacks for required fields
		return {
			theme: previewTheme,
			client: {
				name: savedInvoice.client_name || 'Unknown Client',
				address: savedInvoice.client_address || '',
				email: savedInvoice.client_email || undefined,
				phone: savedInvoice.client_phone || undefined,
			},
			items: savedInvoice.items || [],
			invoiceNumber: savedInvoice.invoice_number || 'INV-000',
			date: savedInvoice.invoice_date || new Date().toISOString(),
			dueDate: savedInvoice.due_date || new Date().toISOString(),
			notes: savedInvoice.notes || undefined,
			currency: 'USD',
			paymentTerms: 'Net 30',
			taxRate: 0,
		}
	}

	return (
		<Dialog onOpenChange={setShowPreviewDialog} open={showPreviewDialog}>
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
							invoiceData={convertToInvoiceData(previewInvoice)}
							isSaved={isSaved}
							setIsSaved={setIsSaved}
							userSettings={userSettings}
						/>
					</div>
				)}
			</DialogContent>
		</Dialog>
	)
}
