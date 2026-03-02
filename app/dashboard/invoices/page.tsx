import { Suspense } from 'react'
import InvoicesFallback from '@/components/fallbacks/invoice-fallback'
import InvoiceHistory from '@/components/InvoiceHistory'
import { getUserInvoices } from '@/lib/invoice-service-server'
import { getUserSettings } from '@/lib/settings-service-server'

export default function InvoicesPage() {
	const invoicesPromise = getUserInvoices()
	const userSettingsPromise = getUserSettings()
	return (
		<Suspense fallback={<InvoicesFallback />}>
			<InvoiceHistory
				invoicesPromise={invoicesPromise}
				userSettingsPromise={userSettingsPromise}
			/>
		</Suspense>
	)
}
