import { supabase } from '@/integrations/supabase/old/client'
import type { SettingsFormData, UserSettings } from '@/types/settings'
import { DEFAULT_SETTINGS } from '@/types/settings'

export class SettingsService {
	/**
	 * Get user settings from database
	 */
	static async getUserSettings(userId: string): Promise<UserSettings | null> {
		try {
			const { data, error } = await supabase
				.from('user_settings')
				.select('*')
				.eq('user_id', userId)
				.single()

			if (error) {
				if (error.code === 'PGRST116') {
					// No settings found, return null
					return null
				}
				throw error
			}

			return data
		} catch (error) {
			console.error('Error fetching user settings:', error)
			throw error
		}
	}

	/**
	 * Create or update user settings
	 */
	static async saveUserSettings(
		userId: string,
		settings: Partial<SettingsFormData>,
	): Promise<UserSettings> {
		try {
			// First check if settings exist
			const existingSettings =
				await SettingsService.getUserSettings(userId)

			if (existingSettings) {
				// Update existing settings
				const { data, error } = await supabase
					.from('user_settings')
					.update({
						...settings,
						updated_at: new Date().toISOString(),
					})
					.eq('user_id', userId)
					.select()
					.single()

				if (error) throw error
				return data
			} else {
				// Create new settings
				const { data, error } = await supabase
					.from('user_settings')
					.insert({
						user_id: userId,
						...settings,
					})
					.select()
					.single()

				if (error) throw error
				return data
			}
		} catch (error) {
			console.error('Error saving user settings:', error)
			throw error
		}
	}

	/**
	 * Get settings with defaults applied
	 */
	static async getSettingsWithDefaults(
		userId: string,
	): Promise<SettingsFormData> {
		try {
			const userSettings = await SettingsService.getUserSettings(userId)

			if (!userSettings) {
				return { ...DEFAULT_SETTINGS }
			}

			// Merge user settings with defaults
			return {
				company_name:
					userSettings.company_name || DEFAULT_SETTINGS.company_name,
				company_email:
					userSettings.company_email ||
					DEFAULT_SETTINGS.company_email,
				company_phone:
					userSettings.company_phone ||
					DEFAULT_SETTINGS.company_phone,
				company_address:
					userSettings.company_address ||
					DEFAULT_SETTINGS.company_address,
				company_website:
					userSettings.company_website ||
					DEFAULT_SETTINGS.company_website,
				company_logo:
					userSettings.company_logo || DEFAULT_SETTINGS.company_logo,

				default_theme:
					userSettings.default_theme ||
					DEFAULT_SETTINGS.default_theme,
				default_currency:
					userSettings.default_currency ||
					DEFAULT_SETTINGS.default_currency,
				default_tax_rate:
					userSettings.default_tax_rate ??
					DEFAULT_SETTINGS.default_tax_rate,
				default_payment_terms:
					userSettings.default_payment_terms ||
					DEFAULT_SETTINGS.default_payment_terms,
				default_notes:
					userSettings.default_notes ||
					DEFAULT_SETTINGS.default_notes,

				email_notifications:
					userSettings.email_notifications ??
					DEFAULT_SETTINGS.email_notifications,
				payment_reminders:
					userSettings.payment_reminders ??
					DEFAULT_SETTINGS.payment_reminders,
				invoice_updates:
					userSettings.invoice_updates ??
					DEFAULT_SETTINGS.invoice_updates,
				marketing_emails:
					userSettings.marketing_emails ??
					DEFAULT_SETTINGS.marketing_emails,

				date_format:
					userSettings.date_format || DEFAULT_SETTINGS.date_format,
				number_format:
					userSettings.number_format ||
					DEFAULT_SETTINGS.number_format,
				timezone: userSettings.timezone || DEFAULT_SETTINGS.timezone,
				language: userSettings.language || DEFAULT_SETTINGS.language,

				invoice_prefix:
					userSettings.invoice_prefix ||
					DEFAULT_SETTINGS.invoice_prefix,
				invoice_counter:
					userSettings.invoice_counter ??
					DEFAULT_SETTINGS.invoice_counter,
				invoice_number_format:
					userSettings.invoice_number_format ||
					DEFAULT_SETTINGS.invoice_number_format,

				custom_fields:
					userSettings.custom_fields ||
					DEFAULT_SETTINGS.custom_fields,
			}
		} catch (error) {
			console.error('Error getting settings with defaults:', error)
			return { ...DEFAULT_SETTINGS }
		}
	}

	/**
	 * Delete user settings
	 */
	static async deleteUserSettings(userId: string): Promise<void> {
		try {
			const { error } = await supabase
				.from('user_settings')
				.delete()
				.eq('user_id', userId)

			if (error) throw error
		} catch (error) {
			console.error('Error deleting user settings:', error)
			throw error
		}
	}

	/**
	 * Generate next invoice number based on user settings
	 */
	static async getNextInvoiceNumber(userId: string): Promise<string> {
		try {
			const settings =
				await SettingsService.getSettingsWithDefaults(userId)
			const { invoice_prefix, invoice_counter, invoice_number_format } =
				settings

			// Generate invoice number based on format
			const invoiceNumber = invoice_number_format
				.replace('{prefix}', invoice_prefix)
				.replace(
					'{number}',
					invoice_counter.toString().padStart(4, '0'),
				)

			// Increment counter for next invoice
			await SettingsService.saveUserSettings(userId, {
				invoice_counter: invoice_counter + 1,
			})

			return invoiceNumber
		} catch (error) {
			console.error('Error generating invoice number:', error)
			// Fallback to simple format
			return `INV-${Date.now()}`
		}
	}

	/**
	 * Reset invoice counter
	 */
	static async resetInvoiceCounter(
		userId: string,
		newCounter: number = 1,
	): Promise<void> {
		try {
			await SettingsService.saveUserSettings(userId, {
				invoice_counter: newCounter,
			})
		} catch (error) {
			console.error('Error resetting invoice counter:', error)
			throw error
		}
	}

	/**
	 * Upload and save company logo
	 */
	static async uploadCompanyLogo(
		userId: string,
		file: File,
	): Promise<string> {
		try {
			// Convert file to base64
			const base64 = await SettingsService.fileToBase64(file)

			// Save logo to settings
			await SettingsService.saveUserSettings(userId, {
				company_logo: base64,
			})

			return base64
		} catch (error) {
			console.error('Error uploading company logo:', error)
			throw error
		}
	}

	/**
	 * Convert file to base64
	 */
	private static fileToBase64(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader()
			reader.readAsDataURL(file)
			reader.onload = () => resolve(reader.result as string)
			reader.onerror = (error) => reject(error)
		})
	}
}
