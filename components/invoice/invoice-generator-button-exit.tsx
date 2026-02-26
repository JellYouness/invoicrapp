import { LogOut } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../ui/button'

export default function ExitButton({ isSaved }: { isSaved: boolean }) {
	if (isSaved)
		return (
			<Link href={'/dashboard/invoices'}>
				<Button
					className="flex items-center gap-2"
					size="sm"
					variant="outline"
				>
					<LogOut className="h-4 w-4" />
					Exit
				</Button>
			</Link>
		)
}
