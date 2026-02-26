import { ArrowRight, CheckCircle, Save } from 'lucide-react'
import router from 'next/router'
import { type Dispatch, type SetStateAction, useState } from 'react'
import { showError, showSuccess } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { type CreateClientData, saveClient } from '@/lib/client-service'
import {
	convertInvoiceDataToSaveFormat,
	saveInvoice,
} from '@/lib/invoice-service'
import { steps } from '@/lib/invoice-utils'
import { SettingsService } from '@/lib/settings-service'
import type { InvoiceData } from '@/types/invoice'
import type { CustomField } from '@/types/settings'
import { Button } from '../ui/button'

export default function SaveButton({
	refreshUsage,
	currentStep,
	setCurrentStep,
	invoiceData,
	setIsSaved,
	isSaved,
	isNewClient,
	customFields,
}: {
	refreshUsage: () => Promise<void>
	currentStep: number
	setCurrentStep: Dispatch<SetStateAction<number>>
	invoiceData: InvoiceData
	setIsSaved: Dispatch<SetStateAction<boolean>>
	isSaved: boolean
	isNewClient: boolean
	customFields: CustomField[]
}) {
	const [isSaving, setIsSaving] = useState(false)
	const handleSaveInvoice = async () => {
		setIsSaving(true)
		try {
			const invoiceToSave = convertInvoiceDataToSaveFormat(invoiceData)
			const result = await saveInvoice(invoiceToSave)

			if (result.success && result.invoice) {
				const {
					data: { user },
				} = await supabase.auth.getUser()
				if (user) {
					try {
						const userSettings =
							await SettingsService.getSettingsWithDefaults(
								user.id,
							)
						await SettingsService.saveUserSettings(user.id, {
							invoice_counter: userSettings.invoice_counter + 1,
						})
					} catch (error) {
						console.error('Error updating invoice counter:', error)
					}
				}

				setIsSaved(true)
				showSuccess(
					'Invoice Saved Successfully!',
					`Invoice ${invoiceData.invoiceNumber} has been saved to your history.`,
				)

				await refreshUsage()
				router.push(`/dashboard/invoices`)
			} else {
				showError(
					'Error Saving Invoice',
					result.error ||
						'There was an error saving your invoice. Please try again.',
				)
			}
		} catch (error) {
			console.error('Error saving invoice:', error)
			showError(
				'Error Saving Invoice',
				'There was an error saving your invoice. Please try again.',
			)
		} finally {
			setIsSaving(false)
		}
	}

	const nextStep = async () => {
		// If on step 2 (client info) and it's a new client, save the client first
		if (currentStep === 2 && isNewClient && invoiceData?.client) {
			const clientData: CreateClientData = {
				name: invoiceData.client.name.trim(),
				address: invoiceData.client.address.trim(),
				email: invoiceData.client.email?.trim() || undefined,
				phone: invoiceData.client.phone?.trim() || undefined,
				tax_number: invoiceData.client.tax_number?.trim() || undefined,
				website: invoiceData.client.website?.trim() || undefined,
			}

			const savedClient = await saveClient(clientData)

			if (savedClient) {
				showSuccess(
					'Client Saved!',
					`${savedClient.name} has been saved to your client list.`,
				)
			} else {
				showError(
					'Save Failed',
					'There was an error saving the client. Please try again.',
				)
				return // Don't proceed to next step if save failed
			}
		}

		if (currentStep < steps.length) {
			setCurrentStep(currentStep + 1)
		}
	}

	const canProceed = () => {
		if (!invoiceData) return false

		switch (currentStep) {
			case 1:
				return invoiceData.theme?.id !== ''
			case 2:
				return invoiceData.client?.name && invoiceData.client?.address
			case 3:
				return invoiceData.items?.length > 0
			case 4: {
				// Check if all required custom fields are filled
				const requiredFields = customFields.filter(
					(field) => field.required,
				)
				const customFieldValues = invoiceData.customFields || []
				return requiredFields.every((field) => {
					const fieldValue = customFieldValues.find(
						(cfv) => cfv.fieldId === field.id,
					)
					return fieldValue && fieldValue.value.trim() !== ''
				})
			}
			default:
				return true
		}
	}

	return (
		<>
			{currentStep < steps.length ? (
				<Button
					className="flex items-center gap-2"
					disabled={!invoiceData || !canProceed()}
					onClick={nextStep}
					size="sm"
				>
					<span className="hidden sm:inline">
						{currentStep === 2 && isNewClient
							? 'Save Client & Next'
							: 'Next'}
					</span>
					<span className="sm:hidden">Next</span>
					<ArrowRight className="h-4 w-4" />
				</Button>
			) : (
				<Button
					className="flex items-center gap-2"
					disabled={isSaving || isSaved}
					onClick={handleSaveInvoice}
					size="sm"
				>
					{isSaving ? (
						<>
							<div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
							Saving...
						</>
					) : isSaved ? (
						<>
							<CheckCircle className="h-4 w-4" />
							Saved!
						</>
					) : (
						<>
							<Save className="h-4 w-4" />
							<span className="hidden sm:inline">
								Save Invoice
							</span>
							<span className="sm:hidden">Save</span>
						</>
					)}
				</Button>
			)}
		</>
	)
}
