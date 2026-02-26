import { AlertTriangle, ArrowRight, Settings } from 'lucide-react'
import Link from 'next/link'
import type { SetStateAction } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import type { SettingsValidationResult } from '@/lib/settings-validation'

interface SettingsRequiredDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	validationResult: SettingsValidationResult
	onContinueAnyway?: (value: SetStateAction<boolean>) => void
}

export function SettingsRequiredDialog({
	open,
	onOpenChange,
	validationResult,
	onContinueAnyway,
}: SettingsRequiredDialogProps) {
	const hasCriticalMissing = validationResult.criticalMissing.length > 0

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
							<AlertTriangle className="h-5 w-5" />
						</div>
						<div>
							<DialogTitle className="text-left">
								Complete Your Settings First
							</DialogTitle>
							<DialogDescription className="text-left mt-1">
								{hasCriticalMissing
									? 'Some required company information is missing for invoice creation.'
									: 'We recommend completing your settings for better invoices.'}
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="space-y-4">
					{validationResult.criticalMissing.length > 0 && (
						<div>
							<h4 className="text-sm font-medium text-red-900 mb-2 flex items-center gap-2">
								<span className="h-2 w-2 bg-red-500 rounded-full"></span>
								Required Fields
							</h4>
							<div className="flex flex-wrap gap-2">
								{validationResult.criticalMissing.map(
									(field) => (
										<Badge
											className="text-xs"
											key={field}
											variant="destructive"
										>
											{field}
										</Badge>
									),
								)}
							</div>
						</div>
					)}

					{validationResult.missingFields.length >
						validationResult.criticalMissing.length && (
						<div>
							<h4 className="text-sm font-medium text-amber-900 mb-2 flex items-center gap-2">
								<span className="h-2 w-2 bg-amber-500 rounded-full"></span>
								Recommended Fields
							</h4>
							<div className="flex flex-wrap gap-2">
								{validationResult.missingFields
									.filter(
										(field) =>
											!validationResult.criticalMissing.includes(
												field,
											),
									)
									.map((field) => (
										<Badge
											className="text-xs"
											key={field}
											variant="secondary"
										>
											{field}
										</Badge>
									))}
							</div>
						</div>
					)}

					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
						<div className="flex items-start gap-3">
							<Settings className="h-5 w-5 text-blue-600 mt-0.5" />
							<div className="text-sm">
								<p className="font-medium text-blue-900 mb-1">
									Why complete your settings?
								</p>
								<ul className="text-blue-700 space-y-1 text-xs">
									<li>
										• Your company info appears on all
										invoices
									</li>
									<li>
										• Set default currency and payment terms
									</li>
									<li>• Professional invoice numbering</li>
									<li>• Upload your company logo</li>
								</ul>
							</div>
						</div>
					</div>
				</div>

				<DialogFooter className="gap-2">
					{!hasCriticalMissing && onContinueAnyway && (
						<Button
							className="text-sm"
							// onClick={onContinueAnyway}
							variant="outline"
						>
							Continue Anyway
						</Button>
					)}
					<Link href={'/dashboard/settings'}>
						<Button className="text-sm">
							Go to Settings
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</Link>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
