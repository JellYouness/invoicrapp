'use client'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'

export default function ExitButton({ isSaved }: { isSaved: boolean }) {
	const router = useRouter()
	if (isSaved)
		return (
			<Button
				className="flex items-center gap-2"
				onClick={() => router.push('/dashboard/invoices')}
				size="sm"
				variant="outline"
			>
				<LogOut className="h-4 w-4" />
				Exit
			</Button>
		)
}
