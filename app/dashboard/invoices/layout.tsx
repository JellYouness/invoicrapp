import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Invoices',
	description:
		'Create, manage, and track your invoices with Invoicr. Generate professional invoices in minutes.',
	robots: {
		index: false,
		follow: false,
	},
}
export default function Layout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
