import { ArrowLeft } from 'lucide-react'
import { use, useEffect, useState } from 'react'
import { BlockingUpgradeDialog } from '@/components/ui/BlockingUpgradeDialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SettingsRequiredDialog } from '@/components/ui/SettingsRequiredDialog'
import { useUsage } from '@/contexts/UsageContext'
import { showError } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { calculateDueDate } from '@/lib/format-utils'
import type { SavedInvoice } from '@/lib/invoice-service'
import { getDefaultTheme, getThemeById } from '@/lib/invoice-themes'
import { SettingsService } from '@/lib/settings-service'
import {
	checkUserSettingsConfigured,
	type SettingsValidationResult,
} from '@/lib/settings-validation'
import type { InvoiceData } from '@/types/invoice'
import type { CustomField } from '@/types/settings'
import ExitButton from './invoice/invoice-generator-button-exit'
import InvoiceGeneratorDesktopSteps from './invoice/invoice-generator-desktop-steps'
import LimitReached from './invoice/invoice-generator-limit-reached'
import InvoiceGeneratorMobileHorizontalSteps from './invoice/invoice-generator-mobile-horizontal-steps'
import RenderStepContent from './invoice/invoice-generator-render-step-content'
import SaveButton from './invoice/invoice-generator-save-button'

const steps = [
	{ id: 1, title: 'Choose Theme', description: 'Select your invoice design' },
	{ id: 2, title: 'Client Info', description: 'Add client details' },
	{ id: 3, title: 'Invoice Items', description: 'Add products/services' },
	{
		id: 4,
		title: 'Custom Fields',
		description: 'Add additional information',
	},
	{ id: 5, title: 'Preview', description: 'Review and generate' },
]

interface InvoiceGeneratorProps {
	editingInvoicePromise?: Promise<SavedInvoice>
}

export const InvoiceGenerator = ({
	editingInvoicePromise,
}: InvoiceGeneratorProps) => {
	const editingInvoice = use(editingInvoicePromise)
	const [currentStep, setCurrentStep] = useState(1)

	const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null)
	const [customFields, setCustomFields] = useState<CustomField[]>([])
	const [isSaved, setIsSaved] = useState(false)
	const [isNewClient, setIsNewClient] = useState(false)
	const [showBlockingDialog, setShowBlockingDialog] = useState(false)
	const [showSettingsDialog, setShowSettingsDialog] = useState(false)
	const [settingsValidation, setSettingsValidation] =
		useState<SettingsValidationResult | null>(null)

	const isLimitReached = false // SUBSCRIPTION SYSTEM DISABLED - Never show limit reached

	const { usage, refreshUsage } = useUsage()

	useEffect(() => {
		// if user reached the limit show the dialog
		if (isLimitReached) {
			setShowBlockingDialog(true)
		}
	}, [])

	// Initialize default invoice data with user settings
	useEffect(() => {
		const initializeInvoiceData = async () => {
			try {
				console.log('Starting invoice initialization...')
				// Get current user
				const {
					data: { user },
				} = await supabase.auth.getUser()
				console.log('User:', user?.id)

				// Check user settings first (only for new invoices, not when editing)
				if (user && !editingInvoice) {
					console.log('Checking user settings for user:', user.id)
					const validation = await checkUserSettingsConfigured(
						user.id,
					)
					console.log('Settings validation result:', validation)
					setSettingsValidation(validation)

					// Show settings dialog if critical fields are missing
					if (!validation.isValid) {
						console.log('Settings invalid, showing dialog')
						setShowSettingsDialog(true)
					}
				}

				console.log('Proceeding with invoice initialization...')

				let defaultTheme = await getDefaultTheme()
				let invoiceNumber = `INV-${Date.now()}`
				let defaultNotes = ''

				// Load user settings if user is authenticated
				if (user) {
					const userSettings =
						await SettingsService.getSettingsWithDefaults(user.id)

					// Load custom fields
					setCustomFields(userSettings.custom_fields || [])

					// Use user's default theme if available
					if (userSettings.default_theme) {
						const userTheme = await getThemeById(
							userSettings.default_theme,
						)
						if (userTheme) {
							defaultTheme = userTheme
						}
					}

					// Generate invoice number based on user settings
					if (
						userSettings.invoice_prefix &&
						userSettings.invoice_counter &&
						userSettings.invoice_number_format
					) {
						invoiceNumber = userSettings.invoice_number_format
							.replace('{prefix}', userSettings.invoice_prefix)
							.replace(
								'{number}',
								userSettings.invoice_counter
									.toString()
									.padStart(4, '0'),
							)
					}

					// Use default notes from settings
					defaultNotes = userSettings.default_notes || ''
				}

				const defaultData: InvoiceData = {
					theme: defaultTheme,
					client: { name: '', address: '', email: '', phone: '' },
					items: [
						{ id: '1', description: '', quantity: 1, price: 0 },
					],
					invoiceNumber,
					date: new Date().toISOString().split('T')[0],
					dueDate: calculateDueDate(
						new Date().toISOString().split('T')[0],
						user
							? (
									await SettingsService.getSettingsWithDefaults(
										user.id,
									)
								).default_payment_terms
							: 'Net 30',
					),
					notes: defaultNotes,
					currency: user
						? (
								await SettingsService.getSettingsWithDefaults(
									user.id,
								)
							).default_currency
						: 'USD',
					paymentTerms: user
						? (
								await SettingsService.getSettingsWithDefaults(
									user.id,
								)
							).default_payment_terms
						: 'Net 30',
					taxRate: user
						? (
								await SettingsService.getSettingsWithDefaults(
									user.id,
								)
							).default_tax_rate
						: 0,
					customFields: [],
					dynamicFields: [],
				}
				setInvoiceData(defaultData)
			} catch (error) {
				console.error('Error initializing invoice data:', error)
				// Fallback to basic defaults
				const defaultTheme = await getDefaultTheme()
				const defaultData: InvoiceData = {
					theme: defaultTheme,
					client: { name: '', address: '', email: '', phone: '' },
					items: [
						{ id: '1', description: '', quantity: 1, price: 0 },
					],
					invoiceNumber: `INV-${Date.now()}`,
					date: new Date().toISOString().split('T')[0],
					dueDate: calculateDueDate(
						new Date().toISOString().split('T')[0],
						'Net 30',
					),
					currency: 'USD',
					paymentTerms: 'Net 30',
					taxRate: 0,
					customFields: [],
					dynamicFields: [],
				}
				setInvoiceData(defaultData)
			}
		}

		initializeInvoiceData()
	}, [editingInvoice])

	// Effect to load editing invoice data
	useEffect(() => {
		if (editingInvoice && invoiceData) {
			const loadEditingInvoice = async () => {
				const theme = await getThemeById(editingInvoice.theme_id)
				if (theme) {
					setInvoiceData({
						theme,
						client: {
							name: editingInvoice.client_name,
							address: editingInvoice.client_address,
							email: editingInvoice.client_email || undefined,
							phone: editingInvoice.client_phone || undefined,
						},
						items: editingInvoice.items,
						invoiceNumber: editingInvoice.invoice_number,
						date: editingInvoice.invoice_date,
						dueDate: editingInvoice.due_date,
						currency: 'USD',
						paymentTerms: 'Net 30',
						notes: editingInvoice.notes || undefined,
						taxRate:
							editingInvoice.tax_amount &&
							editingInvoice.subtotal > 0
								? (editingInvoice.tax_amount /
										editingInvoice.subtotal) *
									100
								: 0,
						customFields: editingInvoice.custom_fields || [],
					})
					setCurrentStep(5) // Go to preview step when editing
				}
			}

			loadEditingInvoice()
		}
	}, [editingInvoice, invoiceData])

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

	const handleContinueWithoutSettings = async () => {
		setShowSettingsDialog(false)

		// Initialize invoice data even without complete settings
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser()

			let defaultTheme = await getDefaultTheme()
			let invoiceNumber = `INV-${Date.now()}`
			let defaultNotes = ''

			if (user) {
				const userSettings =
					await SettingsService.getSettingsWithDefaults(user.id)
				setCustomFields(userSettings.custom_fields || [])

				if (userSettings.default_theme) {
					const userTheme = await getThemeById(
						userSettings.default_theme,
					)
					if (userTheme) {
						defaultTheme = userTheme
					}
				}

				if (
					userSettings.invoice_prefix &&
					userSettings.invoice_counter &&
					userSettings.invoice_number_format
				) {
					invoiceNumber = userSettings.invoice_number_format
						.replace('{prefix}', userSettings.invoice_prefix)
						.replace(
							'{number}',
							userSettings.invoice_counter
								.toString()
								.padStart(4, '0'),
						)
				}

				defaultNotes = userSettings.default_notes || ''
			}

			const defaultData: InvoiceData = {
				theme: defaultTheme,
				client: { name: '', address: '', email: '', phone: '' },
				items: [{ id: '1', description: '', quantity: 1, price: 0 }],
				invoiceNumber,
				date: new Date().toISOString().split('T')[0],
				dueDate: calculateDueDate(
					new Date().toISOString().split('T')[0],
					user
						? (
								await SettingsService.getSettingsWithDefaults(
									user.id,
								)
							).default_payment_terms
						: 'Net 30',
				),
				notes: defaultNotes,
				currency: user
					? (await SettingsService.getSettingsWithDefaults(user.id))
							.default_currency
					: 'USD',
				paymentTerms: user
					? (await SettingsService.getSettingsWithDefaults(user.id))
							.default_payment_terms
					: 'Net 30',
				taxRate: user
					? (await SettingsService.getSettingsWithDefaults(user.id))
							.default_tax_rate
					: 0,
				customFields: [],
				dynamicFields: [],
			}

			setInvoiceData(defaultData)
		} catch (error) {
			console.error('Error initializing invoice data:', error)
			showError('Failed to initialize invoice data')
		}
	}

	return (
		<div className="relative h-full">
			<div className="mx-auto h-full">
				<div
					className={`flex h-full flex-col gap-4 lg:flex-row lg:gap-8 ${
						isLimitReached ? 'pointer-events-none blur-sm' : ''
					}`}
				>
					{/* Left Sidebar - Vertical Steps Progress */}
					<div className="w-full lg:h-full lg:w-80 lg:flex-shrink-0">
						<Card className="border-primary/30 bg-gradient-to-b from-card to-muted/20 px-1 pt-4 pb-1 shadow-lg lg:sticky lg:top-0 lg:flex lg:h-full lg:flex-col lg:justify-center lg:p-6">
							{/* Mobile: Horizontal Steps */}
							<InvoiceGeneratorMobileHorizontalSteps
								currentStep={currentStep}
								steps={steps}
							/>

							{/* Desktop: Vertical Steps */}
							<InvoiceGeneratorDesktopSteps
								currentStep={currentStep}
								steps={steps}
							/>
						</Card>
					</div>

					{/* Right Content Area */}
					<div className="flex flex-1 flex-col overflow-y-auto lg:h-full">
						{/* Step Content */}
						<Card className="h-[85%] flex-1 border-primary/30 p-4 shadow-lg sm:p-6 lg:h-[90%] lg:p-8">
							<RenderStepContent
								currentStep={currentStep}
								customFields={customFields}
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
											customFields={customFields}
											invoiceData={invoiceData}
											isNewClient={isNewClient}
											isSaved={isSaved}
											refreshUsage={refreshUsage}
											setCurrentStep={setCurrentStep}
											setIsSaved={setIsSaved}
											steps={steps}
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
				onContinueAnyway={
					settingsValidation &&
					settingsValidation.criticalMissing.length === 0
						? handleContinueWithoutSettings
						: undefined
				}
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
