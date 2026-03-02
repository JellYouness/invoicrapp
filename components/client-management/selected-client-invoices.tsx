import { Calendar, Clock, DollarSign, Eye, Receipt } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { SavedInvoice } from '@/lib/invoice-service'

interface SelectedClientInvoicesProps {
	invoices: SavedInvoice[]
	handlePreviewInvoice: (invoice: SavedInvoice) => void
}

export default function SelectedClientInvoices({
	invoices,
	handlePreviewInvoice,
}: SelectedClientInvoicesProps) {
	if (!invoices || invoices.length === 0) {
		return (
			<div className="text-center py-12 bg-white border border-dashed border-gray-300 rounded-lg">
				<Receipt className="w-16 h-16 mx-auto text-gray-300 mb-4" />
				<h3 className="text-lg font-semibold text-gray-900 mb-2">
					No Invoices Found
				</h3>
				<p className="text-gray-500 max-w-xs mx-auto">
					This client doesn't have any invoices associated with their
					account yet.
				</p>
			</div>
		)
	}

	return (
		<div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
			<div className="divide-y divide-gray-200" role="list">
				{invoices.map((invoice) => (
					<button
						className="w-full text-left group relative flex items-center justify-between p-5 hover:bg-blue-50/50 transition-all focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
						key={invoice.id}
						onClick={() => handlePreviewInvoice(invoice)}
						type="button"
					>
						<div className="flex items-center space-x-4 flex-1 min-w-0">
							{/* Status Icon */}
							<div className="flex-shrink-0">
								<div
									className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${
										invoice.status === 'paid'
											? 'bg-gradient-to-br from-green-500 to-green-600'
											: invoice.status === 'overdue'
												? 'bg-gradient-to-br from-red-500 to-red-600'
												: 'bg-gradient-to-br from-slate-500 to-slate-600'
									}`}
								>
									<Receipt className="w-6 h-6 text-white" />
								</div>
							</div>

							{/* Invoice Details */}
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-3 mb-1.5">
									<span className="text-base font-bold text-gray-900">
										{invoice.invoice_number}
									</span>
									<Badge
										className="text-[10px] px-2 py-0 uppercase tracking-wider"
										variant={
											invoice.status === 'paid'
												? 'default'
												: invoice.status === 'overdue'
													? 'destructive'
													: 'secondary'
										}
									>
										{invoice.status}
									</Badge>
								</div>

								<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
									<div className="flex items-center gap-1.5">
										<Calendar className="w-3.5 h-3.5" />
										<span>
											{new Date(
												invoice.invoice_date,
											).toLocaleDateString()}
										</span>
									</div>
									<div className="flex items-center gap-1.5">
										<DollarSign className="w-3.5 h-3.5 text-emerald-600" />
										<span className="font-bold text-gray-900">
											{invoice.total_amount.toLocaleString(
												undefined,
												{
													minimumFractionDigits: 2,
													maximumFractionDigits: 2,
												},
											)}
										</span>
									</div>
									<div className="flex items-center gap-1.5 text-xs bg-gray-100 px-2 py-0.5 rounded">
										<Clock className="w-3 h-3" />
										<span>
											Due{' '}
											{new Date(
												invoice.due_date,
											).toLocaleDateString()}
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Action Icon (Visual Only) */}
						<div className="ml-4 flex-shrink-0 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">
							<div className="bg-white border border-gray-200 p-2 rounded-full shadow-sm text-gray-400 group-hover:text-blue-600">
								<Eye className="w-5 h-5" />
							</div>
						</div>
					</button>
				))}
			</div>
		</div>
	)
}
