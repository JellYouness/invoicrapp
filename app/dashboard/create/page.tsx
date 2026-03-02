import { Suspense } from 'react'
import InvoiceGeneratorFallback from '@/components/fallbacks/create-invoice-fallback'
import { InvoiceGenerator } from '@/components/InvoiceGenerator'
import { getUserClients } from '@/lib/client-service-server'
import { getInvoiceById } from '@/lib/invoice-service-server'
import { getDefaultTheme, getThemeById } from '@/lib/invoice-themes'
import { getUserSettings } from '@/lib/settings-service-server'

export default function CreateInvoicePage(
	props: PageProps<'/dashboard/create'>,
) {
	const invoicePromise = props.searchParams.then(({ editId, viewId }) => {
		const targetId = [editId, viewId].flat().filter(Boolean)[0]		
		return getInvoiceById(targetId)
	})

	const clientsPromise = getUserClients()
	const userSettingsPromise = getUserSettings()

	const defaultThemePromise = userSettingsPromise.then(async (data) => {
		if (!data?.default_theme || data.default_theme === undefined) {
			return getDefaultTheme()
		}
		return getThemeById(data.default_theme)
	})

	return (
		<Suspense fallback={<InvoiceGeneratorFallback />}>
			<InvoiceGenerator
				clientsPromise={clientsPromise}
				defaultThemePromise={defaultThemePromise}
				editingInvoicePromise={invoicePromise}
				userSettingsPromise={userSettingsPromise}				
			/>
		</Suspense>
	)
}
