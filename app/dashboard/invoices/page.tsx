import { Suspense } from 'react'
import InvoiceHistory from '@/components/InvoiceHistory'
import { getUserInvoices } from '@/lib/invoice-service-server'

export default function InvoicesPage() {
	const invoicesPromise = getUserInvoices()
	return (
		<Suspense>
			<InvoiceHistory invoicesPromise={invoicesPromise} />
		</Suspense>
	)
}
