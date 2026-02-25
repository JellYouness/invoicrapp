import { Suspense } from 'react'
import { InvoiceGenerator } from '@/components/InvoiceGenerator'
import { getInvoiceById } from '@/lib/invoice-service'

export default function CreateInvoicePage(
	props: PageProps<'/dashboard/create'>,
) {
	const invoicePromise = props.searchParams.then(({ editId, viewId }) => {
		// Use .flat() or simple check to ensure you get a string
		const targetId = [editId, viewId].flat().filter(Boolean)[0]

		return getInvoiceById(targetId)
	})

	return (
		<Suspense
			fallback={
				<div className="flex h-64 items-center justify-center">
					<div className="text-center">
						<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-primary border-b-2"></div>
						<p className="text-muted-foreground">
							Loading invoice...
						</p>
					</div>
				</div>
			}
		>
			<InvoiceGenerator editingInvoicePromise={invoicePromise} />
		</Suspense>
	)
}
