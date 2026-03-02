import { Card, CardContent } from '../ui/card'

export default function InvoicesFallback() {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold">Invoices</h2>
			</div>
			<div className="grid gap-4">
				{[1, 2, 3].map((i) => (
					<Card className="animate-pulse" key={i}>
						<CardContent className="p-6">
							<div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
							<div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
							<div className="flex gap-2">
								<div className="h-6 bg-gray-200 rounded w-16"></div>
								<div className="h-6 bg-gray-200 rounded w-20"></div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	)
}
