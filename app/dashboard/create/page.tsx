import { Suspense } from 'react'
import InvoiceGeneratorFallback from '@/components/fallbacks/create-invoice-fallback'
import { InvoiceGenerator } from '@/components/InvoiceGenerator'
import { supabase } from '@/integrations/supabase/client'
import { getInvoiceById } from '@/lib/invoice-service'
import { getDefaultTheme, getThemeById } from '@/lib/invoice-themes'
import { SettingsService } from '@/lib/settings-service'
import { checkUserSettingsConfigured } from '@/lib/settings-validation'

export default function CreateInvoicePage(
	props: PageProps<'/dashboard/create'>,
) {
	const invoicePromise = props.searchParams.then(({ editId, viewId }) => {
		const targetId = [editId, viewId].flat().filter(Boolean)[0]
		return getInvoiceById(targetId)
	})

	const userPromise = supabase.auth.getUser()

	const settingsValidationPromise = userPromise.then(async (data) => {
		if (!data.data.user?.id) return

		return checkUserSettingsConfigured(data.data.user?.id)
	})

	const settingsUserPromise = userPromise.then(async (data) => {
		if (!data.data.user?.id) return

		return SettingsService.getSettingsWithDefaults(data.data.user?.id)
	})

	const defaultThemePromise = settingsUserPromise.then(async (data) => {
		if (!data?.default_theme || data.default_theme === undefined) {
			return getDefaultTheme()
		}
		return getThemeById(data.default_theme)
	})

	return (
		<Suspense fallback={<InvoiceGeneratorFallback />}>
			<InvoiceGenerator
				defaultThemePromise={defaultThemePromise}
				editingInvoicePromise={invoicePromise}
				settingsUserPromise={settingsUserPromise}
				settingsValidationPromise={settingsValidationPromise}
			/>
		</Suspense>
	)
}
