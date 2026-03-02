import { type Dispatch, type SetStateAction, Suspense } from 'react'
import type { Client } from '@/lib/client-service'
import type { InvoiceData } from '@/types/invoice'
import type { CustomField, UserSettings } from '@/types/settings'
import { ClientInformation } from '../invoice/ClientInformation'
import { CustomFields } from '../invoice/CustomFields'
import { InvoiceItems } from '../invoice/InvoiceItems'
import { InvoicePreview } from '../invoice/InvoicePreview'
import { ThemeSelection } from '../invoice/ThemeSelection'

export default function RenderStepContent({
	setInvoiceData,
	setIsNewClient,
	invoiceData,
	isSaved,
	setIsSaved,
	currentStep,
	customFields,
	clientsPromise,
	userSettings,
}: {
	setInvoiceData: Dispatch<SetStateAction<InvoiceData>>
	setIsNewClient: Dispatch<SetStateAction<boolean>>
	invoiceData: InvoiceData
	isSaved: boolean
	setIsSaved: Dispatch<SetStateAction<boolean>>
	currentStep: number
	customFields: CustomField[]
	clientsPromise: Promise<Client[]>
	userSettings: UserSettings | null
}) {
	const updateInvoiceData = (field: keyof InvoiceData, value: any) => {
		setInvoiceData((prev) => (prev ? { ...prev, [field]: value } : null))
	}

	switch (currentStep) {
		case 1:
			return (
				<ThemeSelection
					onThemeSelect={(theme) => updateInvoiceData('theme', theme)}
					selectedTheme={invoiceData.theme}
				/>
			)
		case 2:
			return (
				<Suspense>
					<ClientInformation
						clientInfo={invoiceData.client}
						clientsPromise={clientsPromise}
						onClientModeChange={setIsNewClient}
						onClientUpdate={(client) =>
							updateInvoiceData('client', client)
						}
					/>
				</Suspense>
			)
		case 3:
			return (
				<InvoiceItems
					items={invoiceData.items}
					onItemsUpdate={(items) => updateInvoiceData('items', items)}
					onTaxRateUpdate={(taxRate) =>
						updateInvoiceData('taxRate', taxRate)
					}
					taxRate={invoiceData.taxRate}
				/>
			)
		case 4:
			return (
				<CustomFields
					customFields={customFields}
					customFieldValues={invoiceData.customFields || []}
					dynamicFields={invoiceData.dynamicFields || []}
					onCustomFieldValuesChange={(values) =>
						updateInvoiceData('customFields', values)
					}
					onDynamicFieldsChange={(fields) =>
						updateInvoiceData('dynamicFields', fields)
					}
				/>
			)
		case 5:
			return (
				<InvoicePreview
					invoiceData={invoiceData}
					isSaved={isSaved}
					setIsSaved={setIsSaved}
					userSettings={userSettings}
				/>
			)
		default:
			return null
	}
}
