import { Suspense } from 'react'
import { ClientManagement } from '@/components/ClientManagement'
import ClientManagementFallback from '@/components/fallbacks/client-mnagement-fallback'
import { getUserClientsWithInvoiceCounts } from '@/lib/client-service-server'
import { getUserSettings } from '@/lib/settings-service-server'

export default function ClientsPage(props: PageProps<'/dashboard/clients'>) {
	const clientsPromise = props.searchParams.then((params) => {
		const search = Array.isArray(params.search)
			? params.search[0]
			: (params.search ?? '')
		return getUserClientsWithInvoiceCounts(search)
	})

	const userSettingsPromise = getUserSettings()

	const filterPromise = props.searchParams.then((params) => {
		const f = params.filter
		return f === 'with-invoices' || f === 'no-invoices' ? f : 'all'
	})

	const sortPromise = props.searchParams.then((params) => {
		const s = params.sort
		return s === 'name' ||
			s === 'email' ||
			s === 'invoiceCount' ||
			s === 'created_at'
			? s
			: 'name'
	})

	const orderPromise = props.searchParams.then((params) => {
		const o = params.order
		return o === 'asc' || o === 'desc' ? o : 'asc'
	})

	return (
		<Suspense fallback={<ClientManagementFallback />}>
			<ClientManagement
				clientsPromise={clientsPromise}
				filterPromise={filterPromise}
				orderPromise={orderPromise}
				sortPromise={sortPromise}
				userSettingsPromise={userSettingsPromise}
			/>
		</Suspense>
	)
}
