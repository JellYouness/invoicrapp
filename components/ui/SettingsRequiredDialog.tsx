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
import type { UserSettings } from '@/types/settings'

interface SettingsRequiredDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	validationResult: UserSettings | null
	onContinueAnyway?: (value: SetStateAction<boolean>) => void
}
export function SettingsRequiredDialog({
    open,
    onOpenChange,
    validationResult,
    onContinueAnyway,
}: SettingsRequiredDialogProps) {
    
    // 1. Define all fields you consider "Critical" here
    function getCriticalMissingFields(settings: UserSettings | null): (keyof UserSettings)[] {
        const criticalFields: (keyof UserSettings)[] = [
            'company_name',
            'company_email',
            'company_address',
            'company_phone',
            'default_currency',
            'invoice_prefix',
        ]

        if (!settings) return criticalFields
        return criticalFields.filter((field) => !settings[field])
    }

    const criticalMissing = getCriticalMissingFields(validationResult)
    const hasCriticalMissing = criticalMissing.length > 0

    // Helper to make "company_name" look like "Company Name"
    const formatLabel = (key: string) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return (
        <Dialog onOpenChange={onOpenChange} open={open}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-left">
                                Required Settings Missing
                            </DialogTitle>
                            <DialogDescription className="text-left mt-1">
                                The following details are required to generate valid invoices.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {hasCriticalMissing && (
                        <div>
                            <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                <span className="h-2 w-2 bg-red-500 rounded-full"></span>
                                Required Fields
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {criticalMissing.map((field) => (
                                    <Badge
                                        className="text-xs px-3 py-1"
                                        key={field}
                                        variant="destructive"
                                    >
                                        {formatLabel(field)}
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
                                    Why is this required?
                                </p>
                                <p className="text-blue-700 text-xs leading-relaxed">
                                    To comply with tax regulations, your company name, address, and contact info must appear on every invoice generated.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    {/* Only show "Continue Anyway" if you actually want them to bypass requirements */}
                    {onContinueAnyway && (
                        <Button
                            className="text-sm"
                            onClick={() => onContinueAnyway(false)}
                            variant="ghost"
                        >
                            Skip for now
                        </Button>
                    )}
                    <Link href={'/dashboard/settings'} className="w-full sm:w-auto">
                        <Button className="text-sm w-full">
                            Go to Settings
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}