import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Clients',
	description:
		'Manage your client database with Invoicr. Store client information and streamline your invoicing process.',
	robots: {
		index: false,
		follow: false,
	},
}

export default function Layout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
