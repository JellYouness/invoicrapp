'use client'
import { ArrowLeft } from 'lucide-react'
import { use, useEffect, useState } from 'react'
import { BlockingUpgradeDialog } from '@/components/ui/BlockingUpgradeDialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SettingsRequiredDialog } from '@/components/ui/SettingsRequiredDialog'
import { useUsage } from '@/contexts/UsageContext'
import { calculateDueDate } from '@/lib/format-utils'
import type { SavedInvoice } from '@/lib/invoice-service'
import type { SettingsValidationResult } from '@/lib/settings-validation'
import type { InvoiceData, InvoiceTheme } from '@/types/invoice'
import type { SettingsFormData } from '@/types/settings'
import ExitButton from './invoice-generator/invoice-generator-button-exit'
import InvoiceGeneratorDesktopSteps from './invoice-generator/invoice-generator-desktop-steps'
import LimitReached from './invoice-generator/invoice-generator-limit-reached'
import InvoiceGeneratorMobileHorizontalSteps from './invoice-generator/invoice-generator-mobile-horizontal-steps'
import RenderStepContent from './invoice-generator/invoice-generator-render-step-content'
import SaveButton from './invoice-generator/invoice-generator-save-button'

interface InvoiceGeneratorProps {
	editingInvoicePromise?: Promise<SavedInvoice>
	settingsValidationPromise: Promise<SettingsValidationResult>
	settingsUserPromise: Promise<SettingsFormData>
	defaultThemePromise: Promise<InvoiceTheme>
}

export const InvoiceGenerator = ({
	editingInvoicePromise,
	settingsValidationPromise,
	settingsUserPromise,
	defaultThemePromise,
}: InvoiceGeneratorProps) => {
	const editingInvoice = use(editingInvoicePromise)
	const settingsValidation = use(settingsValidationPromise)
	const settingsUser = use(settingsUserPromise)
	const defaultTheme = use(defaultThemePromise)

	const getInitialInvoiceData = (): InvoiceData => {
		const today = new Date().toISOString().split('T')[0]

		// 1. Safely handle the generated number
		let generatedNumber = `INV-${Date.now()}` // Default fallback

		if (settingsUser && settingsUser.invoice_number_format !== undefined) {
			generatedNumber = settingsUser.invoice_number_format
				.replace('{prefix}', settingsUser.invoice_prefix || '')
				.replace(
					'{number}',
					(settingsUser.invoice_counter || 0)
						.toString()
						.padStart(4, '0'),
				)
		}

		return {
			theme: defaultTheme,
			client: {
				name: editingInvoice?.client_name || '',
				address: editingInvoice?.client_address || '',
				email: editingInvoice?.client_email || undefined,
				phone: editingInvoice?.client_phone || undefined,
			},
			items: editingInvoice?.items || [
				{ id: '1', description: '', quantity: 1, price: 0 },
			],
			invoiceNumber: editingInvoice?.invoice_number || generatedNumber,
			date: editingInvoice?.invoice_date || today,
			dueDate:
				editingInvoice?.due_date ||
				calculateDueDate(
					today,
					settingsUser?.default_payment_terms ?? 'Net 30',
				),
			notes: editingInvoice?.notes || settingsUser?.default_notes || '',
			currency: settingsUser?.default_currency || 'USD',
			paymentTerms: settingsUser?.default_payment_terms || 'Net 30',
			// 2. Fixed the crash on taxRate by adding optional chaining to editingInvoice
			taxRate:
				editingInvoice?.tax_amount !== undefined
					? editingInvoice?.subtotal > 0
						? (editingInvoice.tax_amount /
								editingInvoice.subtotal) *
							100
						: 0
					: (settingsUser?.default_tax_rate ?? 0),
			customFields: editingInvoice?.custom_fields || [],
			dynamicFields: [],
		}
	}

	const [invoiceData, setInvoiceData] = useState<InvoiceData>(
		getInitialInvoiceData,
	)
	const [currentStep, setCurrentStep] = useState(editingInvoice ? 5 : 1)
	const [isSaved, setIsSaved] = useState(false)
	const [isNewClient, setIsNewClient] = useState(false)
	const [showBlockingDialog, setShowBlockingDialog] = useState(false)
	const [showSettingsDialog, setShowSettingsDialog] = useState(false)

	const { usage, refreshUsage } = useUsage()

	const isLimitReached = false

	useEffect(() => {
		// if user reached the limit show the dialog
		if (isLimitReached) {
			setShowBlockingDialog(true)
		}
	}, [])

	if (!invoiceData) {
		return (
			<div className="flex h-full items-center justify-center">
				<div className="text-center">
					<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
					<p className="text-muted-foreground">
						Loading invoice generator...
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className="relative h-full">
			<div className="mx-auto h-full">
				<div
					className={`flex h-full flex-col gap-4 lg:flex-row lg:gap-8 $isLimitReached ? 'pointer-events-none blur-sm' : ''`}
				>
					<div className="w-full lg:h-full lg:w-80 lg:flex-shrink-0">
						<Card className="border-primary/30 bg-gradient-to-b from-card to-muted/20 px-1 pt-4 pb-1 shadow-lg lg:sticky lg:top-0 lg:flex lg:h-full lg:flex-col lg:justify-center lg:p-6">
							{/* Mobile: Horizontal Steps */}
							<InvoiceGeneratorMobileHorizontalSteps
								currentStep={currentStep}
							/>

							{/* Desktop: Vertical Steps */}
							<InvoiceGeneratorDesktopSteps
								currentStep={currentStep}
							/>
						</Card>
					</div>

					{/* Right Content Area */}
					<div className="flex flex-1 flex-col overflow-y-auto lg:h-full">
						{/* Step Content */}
						<Card className="h-[85%] flex-1 border-primary/30 p-4 shadow-lg sm:p-6 lg:h-[90%] lg:p-8">
							<RenderStepContent
								currentStep={currentStep}
								customFields={settingsUser?.custom_fields}
								invoiceData={invoiceData}
								isSaved={isSaved}
								setInvoiceData={setInvoiceData}
								setIsNewClient={setIsNewClient}
								setIsSaved={setIsSaved}
							/>
						</Card>

						{/* Navigation */}
						<div className="z-[2] mt-4 flex justify-between pb-safe lg:mt-6 lg:pb-0">
							{!isLimitReached && (
								<>
									<Button
										className="flex items-center gap-2"
										disabled={currentStep === 1}
										onClick={() =>
											setCurrentStep(currentStep - 1)
										}
										size="sm"
										variant="outline"
									>
										<ArrowLeft className="h-4 w-4" />
										<span className="hidden sm:inline">
											Previous
										</span>
										<span className="sm:hidden">Prev</span>
									</Button>

									<div className="flex items-center gap-2">
										<ExitButton isSaved={isSaved} />
										<SaveButton
											currentStep={currentStep}
											customFields={
												settingsUser?.custom_fields
											}
											invoiceData={invoiceData}
											isNewClient={isNewClient}
											isSaved={isSaved}
											refreshUsage={refreshUsage}
											setCurrentStep={setCurrentStep}
											setIsSaved={setIsSaved}
										/>
									</div>
								</>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Lock Overlay when limit reached */}
			<LimitReached
				isLimitReached={isLimitReached}
				setShowBlockingDialog={(val: boolean): void => {
					setShowBlockingDialog(val)
				}}
			/>

			{/* Blocking Upgrade Dialog */}
			<BlockingUpgradeDialog
				currentUsage={usage?.current || 0}
				isOpen={showBlockingDialog}
				limit={usage?.limit || 0}
				onClose={() => setShowBlockingDialog(false)}
				onUpgrade={() => {
					// TODO: Implement actual upgrade flow
					console.log('Upgrade to Pro clicked from blocking dialog')
					setShowBlockingDialog(false)
				}}
			/>

			{/* Settings Dialog */}
			<SettingsRequiredDialog
				onContinueAnyway={() => setShowSettingsDialog(false)}
				onOpenChange={setShowSettingsDialog}
				open={showSettingsDialog && settingsValidation !== null}
				validationResult={
					settingsValidation || {
						isValid: true,
						missingFields: [],
						criticalMissing: [],
					}
				}
			/>
		</div>
	)
}
