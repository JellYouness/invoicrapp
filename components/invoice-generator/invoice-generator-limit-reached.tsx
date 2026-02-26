'use client'
import { Lock } from 'lucide-react'
import type { UsageInfo } from '@/lib/subscription-service'
import { Button } from '../ui/button'

// Assuming these types/states come from your hooks or props
// I've added placeholders for usage and setShowBlockingDialog so the code compiles
export default function LimitReached({
	isLimitReached,
	usage,
	setShowBlockingDialog,
}: {
	isLimitReached: boolean
	usage?: UsageInfo
	setShowBlockingDialog: (val: boolean) => void
}) {
	if (!isLimitReached) return null

	return (
		<div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
			<div className="mx-4 max-w-md rounded-lg border border-primary/20 bg-card p-8 text-center shadow-lg">
				<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
					<Lock className="h-8 w-8 text-primary" />
				</div>
				<h3 className="mb-2 font-semibold text-foreground text-xl">
					Invoice Limit Reached
				</h3>
				<p className="mb-4 text-muted-foreground">
					You've used {usage?.current || 0}/{usage?.limit || 0}{' '}
					invoices this month. Upgrade to Pro to continue creating
					invoices.
				</p>
				<Button
					className="bg-primary text-primary-foreground hover:bg-primary/90"
					onClick={() => setShowBlockingDialog(true)}
				>
					<Lock className="mr-2 h-4 w-4" />
					Upgrade to Pro
				</Button>
			</div>
		</div>
	)
}
