import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Code, Download, Eye, Mail, Maximize2, Printer } from 'lucide-react'
import {
	type Dispatch,
	type SetStateAction,
	useEffect,
	useRef,
	useState,
} from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { showError, showSuccess } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { formatCurrency, formatDate, formatNumber } from '@/lib/format-utils'
import {
	convertInvoiceDataToSaveFormat,
	saveInvoice,
} from '@/lib/invoice-service'
import { SettingsService } from '@/lib/settings-service'
import type { InvoiceData } from '@/types/invoice'
import type { SettingsFormData } from '@/types/settings'

// Theme styles are now included in the invoiceData.theme object
interface InvoicePreviewProps {
	invoiceData: InvoiceData
	isSaved?: boolean
	setIsSaved?: Dispatch<SetStateAction<boolean>>
}

export const InvoicePreview = ({
	invoiceData,
	isSaved = false,
	setIsSaved,	
}: InvoicePreviewProps) => {
	const pdfRef = useRef<HTMLDivElement>(null)
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [userSettings, setUserSettings] = useState<SettingsFormData | null>(
		null,
	)
	const [isSaving, setIsSaving] = useState(false)
	const [isHtmlDialogOpen, setIsHtmlDialogOpen] = useState(false)
	const [htmlContent, setHtmlContent] = useState('')
	//TODO: start this on the client and pass it down so we can just have the value and not have to worry about state or this useeffect on mount
	// Load user settings for formatting
	useEffect(() => {
		const loadUserSettings = async () => {
			try {
				const {
					data: { user },
				} = await supabase.auth.getUser()
				if (user) {
					const settings =
						await SettingsService.getSettingsWithDefaults(user.id)
					setUserSettings(settings)
				}
			} catch (error) {
				console.error('Error loading user settings:', error)
			}
		}

		loadUserSettings()
	}, [])

	// Inject theme's custom CSS into the page
	useEffect(() => {
		const themeId = invoiceData.theme.id
		const existingStyle = document.getElementById(`theme-${themeId}`)

		if (!existingStyle && invoiceData.theme.customCSS) {
			const styleElement = document.createElement('style')
			styleElement.id = `theme-${themeId}`
			styleElement.textContent = invoiceData.theme.customCSS
			document.head.appendChild(styleElement)
		}

		// Cleanup function to remove old theme styles
		return () => {
			const allThemeStyles = document.querySelectorAll('[id^="theme-"]')
			allThemeStyles.forEach((style) => {
				if (style.id !== `theme-${themeId}`) {
					style.remove()
				}
			})
		}
	}, [invoiceData.theme.id, invoiceData.theme.customCSS])

	const saveInvoiceIfNeeded = async (): Promise<boolean> => {
		// If already saved, don't save again
		if (isSaved) {
			return true
		}

		setIsSaving(true)
		try {
			const invoiceToSave = convertInvoiceDataToSaveFormat(invoiceData)
			const savedInvoice = await saveInvoice(invoiceToSave)

			if (savedInvoice) {
				// Increment invoice counter in user settings after successful save
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

				return true
			} else {
				showError(
					'Error Saving Invoice',
					'There was an error saving your invoice. Please try again.',
				)
				return false
			}
		} catch (error) {
			console.error('Error saving invoice:', error)
			showError(
				'Error Saving Invoice',
				'There was an error saving your invoice. Please try again.',
			)
			return false
		} finally {
			setIsSaving(false)
		}
	}

	const DownloadInvoice = async () => {
		if (!pdfRef.current) return

		// Save invoice first
		const saveSuccess = await saveInvoiceIfNeeded()
		if (!saveSuccess) return

		try {
			// Capture the element as a canvas with high quality
			const canvas = await html2canvas(pdfRef.current, {
				scale: 2, // Higher resolution
				useCORS: true,
				allowTaint: true,
				backgroundColor: '#ffffff',
			})

			// Create PDF
			const pdf = new jsPDF('p', 'mm', 'a4')
			const imgData = canvas.toDataURL('image/png')

			// Calculate dimensions to fit the page
			const pdfWidth = pdf.internal.pageSize.getWidth()
			const pdfHeight = pdf.internal.pageSize.getHeight()
			const imgWidth = canvas.width
			const imgHeight = canvas.height

			// Calculate scaling to fit the page while maintaining aspect ratio
			const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
			const scaledWidth = imgWidth * ratio
			const scaledHeight = imgHeight * ratio

			// Center the image on the page
			const x = (pdfWidth - scaledWidth) / 2
			const y = (pdfHeight - scaledHeight) / 2

			pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight)
			pdf.save('invoice.pdf')

			showSuccess(
				'Invoice Downloaded!',
				`Invoice ${invoiceData.invoiceNumber} has been downloaded successfully.`,
			)
		} catch (error) {
			console.error('Error generating PDF:', error)
			showError(
				'Download Failed',
				'There was an error downloading your invoice. Please try again.',
			)
		}
	}

	const PrintInvoice = async () => {
		if (!pdfRef.current) return

		// Save invoice first
		const saveSuccess = await saveInvoiceIfNeeded()
		if (!saveSuccess) return

		try {
			// Use the same html2canvas approach as PDF generation for consistency
			const canvas = await html2canvas(pdfRef.current, {
				scale: 2,
				useCORS: true,
				allowTaint: true,
				backgroundColor: '#ffffff',
			})

			// Create a new window for printing
			const printWindow = window.open('', '_blank')
			if (!printWindow) return

			// Convert canvas to image
			const imgData = canvas.toDataURL('image/png')

			// Create print-optimized HTML with the captured image
			printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              @page {
                margin: 0;
                size: A4;
              }
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                margin: 0;
                padding: 0;
                background: white;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100dvh;
              }
              .print-image {
                max-width: 100%;
                max-height: 100dvh;
                width: auto;
                height: auto;
                object-fit: contain;
              }
              @media print {
                body {
                  margin: 0;
                  padding: 0;
                }
                .print-image {
                  max-width: 100%;
                  max-height: 100%;
                  width: auto;
                  height: auto;
                }
              }
            </style>
          </head>
          <body>
            <img src="${imgData}" alt="Invoice" class="print-image" />
          </body>
        </html>
      `)

			printWindow.document.close()

			// Wait for content to load, then print
			printWindow.onload = () => {
				printWindow.focus()
				printWindow.print()
				printWindow.close()
			}
		} catch (error) {
			console.error('Error generating print preview:', error)
		}
	}

	const downloadedInvoiceNoDialog = async () => {
		// Create a temporary hidden div with the full invoice content
		const tempDiv = document.createElement('div')
		tempDiv.style.position = 'absolute'
		tempDiv.style.left = '-9999px'
		tempDiv.style.top = '-9999px'
		tempDiv.style.width = '210mm'
		tempDiv.style.minHeight = '297mm'
		tempDiv.style.backgroundColor = 'white'
		document.body.appendChild(tempDiv)

		// Render the full invoice content into the temp div
		const { createRoot } = await import('react-dom/client')
		const root = createRoot(tempDiv)

		await new Promise((resolve) => {
			root.render(<FullInvoiceContent />)
			setTimeout(resolve, 100) // Give it time to render
		})

		// Save invoice first
		const saveSuccess = await saveInvoiceIfNeeded()
		if (!saveSuccess) {
			document.body.removeChild(tempDiv)
			return
		}

		try {
			// Capture the element as a canvas with high quality
			const canvas = await html2canvas(tempDiv, {
				scale: 2, // Higher resolution
				useCORS: true,
				allowTaint: true,
				backgroundColor: '#ffffff',
			})

			// Create PDF
			const pdf = new jsPDF('p', 'mm', 'a4')
			const imgData = canvas.toDataURL('image/png')

			// Calculate dimensions to fit the page
			const pdfWidth = pdf.internal.pageSize.getWidth()
			const pdfHeight = pdf.internal.pageSize.getHeight()
			const imgWidth = canvas.width
			const imgHeight = canvas.height

			// Calculate scaling to fit the page while maintaining aspect ratio
			const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
			const scaledWidth = imgWidth * ratio
			const scaledHeight = imgHeight * ratio

			// Center the image on the page
			const x = (pdfWidth - scaledWidth) / 2
			const y = (pdfHeight - scaledHeight) / 2

			pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight)
			pdf.save('invoice.pdf')

			showSuccess(
				'Invoice Downloaded!',
				`Invoice ${invoiceData.invoiceNumber} has been downloaded successfully.`,
			)
		} catch (error) {
			console.error('Error generating PDF:', error)
			showError(
				'Download Failed',
				'There was an error downloading your invoice. Please try again.',
			)
		} finally {
			// Clean up
			root.unmount()
			document.body.removeChild(tempDiv)
		}
	}

	const printInvoiceNoDialog = async () => {
		// Create a temporary hidden div with the full invoice content
		const tempDiv = document.createElement('div')
		tempDiv.style.position = 'absolute'
		tempDiv.style.left = '-9999px'
		tempDiv.style.top = '-9999px'
		tempDiv.style.width = '210mm'
		tempDiv.style.minHeight = '297mm'
		tempDiv.style.backgroundColor = 'white'
		document.body.appendChild(tempDiv)

		// Render the full invoice content into the temp div
		const { createRoot } = await import('react-dom/client')
		const root = createRoot(tempDiv)

		await new Promise((resolve) => {
			root.render(<FullInvoiceContent />)
			setTimeout(resolve, 100) // Give it time to render
		})

		// Save invoice first
		const saveSuccess = await saveInvoiceIfNeeded()
		if (!saveSuccess) {
			document.body.removeChild(tempDiv)
			return
		}

		try {
			// Use html2canvas on the temp div
			const canvas = await html2canvas(tempDiv, {
				scale: 2,
				useCORS: true,
				allowTaint: true,
				backgroundColor: '#ffffff',
			})

			// Create a new window for printing
			const printWindow = window.open('', '_blank')
			if (!printWindow) return

			// Convert canvas to image
			const imgData = canvas.toDataURL('image/png')

			// Create print-optimized HTML with the captured image
			printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              @page {
                margin: 0;
                size: A4;
              }
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                margin: 0;
                padding: 0;
                background: white;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100dvh;
              }
              .print-image {
                max-width: 100%;
                max-height: 100dvh;
                width: auto;
                height: auto;
                object-fit: contain;
              }
              @media print {
                body {
                  margin: 0;
                  padding: 0;
                }
                .print-image {
                  max-width: 100%;
                  max-height: 100%;
                  width: auto;
                  height: auto;
                }
              }
            </style>
          </head>
          <body>
            <img src="${imgData}" alt="Invoice" class="print-image" />
          </body>
        </html>
      `)

			printWindow.document.close()

			// Wait for content to load, then print
			printWindow.onload = () => {
				printWindow.focus()
				printWindow.print()
				printWindow.close()
			}
		} catch (error) {
			console.error('Error generating print preview:', error)
		} finally {
			// Clean up
			root.unmount()
			document.body.removeChild(tempDiv)
		}
	}

	const exportInvoiceAsHTML = async () => {
		// Save invoice first
		const saveSuccess = await saveInvoiceIfNeeded()
		if (!saveSuccess) return

		try {
			// Generate HTML content for email
			const generatedHtml = generateEmailHTML()
			setHtmlContent(generatedHtml)
			setIsHtmlDialogOpen(true)

			// Commented out file download functionality
			// const blob = new Blob([generatedHtml], { type: 'text/html' });
			// const url = URL.createObjectURL(blob);
			// const link = document.createElement('a');
			// link.href = url;
			// link.download = `invoice-${invoiceData.invoiceNumber}.html`;
			// document.body.appendChild(link);
			// link.click();
			// document.body.removeChild(link);
			// URL.revokeObjectURL(url);

			showSuccess(
				'HTML Code Generated!',
				`Invoice ${invoiceData.invoiceNumber} HTML code is ready to copy.`,
			)
		} catch (error) {
			console.error('Error generating HTML:', error)
			showError(
				'Generation Failed',
				'There was an error generating your invoice HTML. Please try again.',
			)
		}
	}

	const copyHtmlToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(htmlContent)
			showSuccess(
				'HTML Copied!',
				'Invoice HTML code has been copied to your clipboard.',
			)
		} catch (error) {
			console.error('Error copying to clipboard:', error)
			showError(
				'Copy Failed',
				'Could not copy to clipboard. Please select and copy manually.',
			)
		}
	}

	const downloadHtmlFile = () => {
		try {
			const blob = new Blob([htmlContent], { type: 'text/html' })
			const url = URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url
			link.download = `invoice-${invoiceData.invoiceNumber}.html`
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
			URL.revokeObjectURL(url)

			showSuccess(
				'HTML Downloaded!',
				`Invoice ${invoiceData.invoiceNumber}.html has been downloaded.`,
			)
		} catch (error) {
			console.error('Error downloading HTML file:', error)
			showError(
				'Download Failed',
				'There was an error downloading the HTML file. Please try again.',
			)
		}
	}

	const generateEmailHTML = () => {
		const themeColors = {
			'professional-blue': { primary: '#2563eb', light: '#dbeafe' },
			'elegant-green': { primary: '#10b981', light: '#d1fae5' },
			'creative-purple': { primary: '#7c3aed', light: '#e9d5ff' },
			'vibrant-orange': { primary: '#f59e0b', light: '#fef3c7' },
			'modern-teal': { primary: '#14b8a6', light: '#ccfbf1' },
			'elegant-rose': { primary: '#f43f5e', light: '#fce7f3' },
		}

		const theme =
			themeColors[invoiceData.theme.id as keyof typeof themeColors] ||
			themeColors['professional-blue']

		return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${invoiceData.invoiceNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
            padding: 20px;
        }
        
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .invoice-header {
            background: ${theme.primary};
            color: white;
            padding: 30px;
        }
        
        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            flex-wrap: wrap;
            gap: 20px;
        }
        
        .company-info h1 {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 8px;
        }
        
        .company-info p {
            margin: 4px 0;
            opacity: 0.9;
        }
        
        .invoice-meta {
            text-align: right;
        }
        
        .invoice-meta .logo {
            width: 60px;
            height: 60px;
            object-fit: contain;
            margin-bottom: 10px;
        }
        
        .invoice-number {
            font-family: monospace;
            font-size: 18px;
            font-weight: bold;
        }
        
        .invoice-body {
            padding: 30px;
        }
        
        .invoice-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }
        
        .bill-to h3 {
            color: #6b7280;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
        }
        
        .client-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .date-info p {
            margin: 8px 0;
        }
        
        .date-label {
            color: #6b7280;
            font-size: 14px;
        }
        
        .date-value {
            font-weight: 600;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #e5e7eb;
        }
        
        .items-table thead {
            background: ${theme.primary};
            color: white;
        }
        
        .items-table th,
        .items-table td {
            padding: 12px;
            text-align: left;
        }
        
        .items-table th:nth-child(2),
        .items-table td:nth-child(2) {
            text-align: center;
        }
        
        .items-table th:nth-child(3),
        .items-table td:nth-child(3),
        .items-table th:nth-child(4),
        .items-table td:nth-child(4) {
            text-align: right;
        }
        
        .items-table tbody tr:nth-child(even) {
            background: #f9fafb;
        }
        
        .items-table tbody tr {
            border-bottom: 1px solid #e5e7eb;
        }
        
        .invoice-footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 30px;
            margin-top: 30px;
        }
        
        .custom-fields h4 {
            color: #6b7280;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
        }
        
        .custom-field {
            display: flex;
            margin: 8px 0;
        }
        
        .field-label {
            color: #6b7280;
            font-weight: 600;
            margin-right: 8px;
        }
        
        .field-value {
            font-weight: 600;
        }
        
        .totals {
            min-width: 250px;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
        }
        
        .total-row.subtotal {
            border-bottom: 1px solid #e5e7eb;
            margin-bottom: 8px;
        }
        
        .total-row.final {
            background: ${theme.light};
            padding: 15px;
            border-radius: 8px;
            font-size: 18px;
            font-weight: bold;
            color: ${theme.primary};
        }
        
        @media (max-width: 600px) {
            .header-content {
                flex-direction: column;
            }
            
            .invoice-meta {
                text-align: left;
            }
            
            .invoice-details {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            
            .invoice-footer {
                flex-direction: column;
            }
            
            .items-table {
                font-size: 14px;
            }
            
            .items-table th,
            .items-table td {
                padding: 8px;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="invoice-header">
            <div class="header-content">
                <div class="company-info">
                    <h1>${userSettings?.company_name || 'Your Company Name'}</h1>
                    ${userSettings?.company_email ? `<p>${userSettings.company_email}</p>` : ''}
                    ${userSettings?.company_phone ? `<p>${userSettings.company_phone}</p>` : ''}
                    ${userSettings?.company_address ? `<p>${userSettings.company_address.replace(/\n/g, '<br>')}</p>` : ''}
                    ${userSettings?.company_website ? `<p>${userSettings.company_website}</p>` : ''}
                </div>
                <div class="invoice-meta">
                    ${userSettings?.company_logo ? `<img src="${userSettings.company_logo}" alt="Company Logo" class="logo">` : ''}
                    <div>
                        <p style="opacity: 0.7; font-size: 12px;">Invoice Number</p>
                        <p class="invoice-number">${invoiceData.invoiceNumber}</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="invoice-body">
            <div class="invoice-details">
                <div class="bill-to">
                    <h3>Bill To</h3>
                    <p class="client-name">${invoiceData.client.name}</p>
                    ${invoiceData.client.email ? `<p style="color: #6b7280;">${invoiceData.client.email}</p>` : ''}
                    ${invoiceData.client.phone ? `<p style="color: #6b7280;">${invoiceData.client.phone}</p>` : ''}
                    <p style="color: #6b7280;">${invoiceData.client.address.replace(/\n/g, '<br>')}</p>
                </div>
                
                <div class="date-info">
                    <p>
                        <span class="date-label">Invoice Date</span><br>
                        <span class="date-value">${userSettings ? formatDate(invoiceData.date, userSettings.date_format) : new Date(invoiceData.date).toLocaleDateString()}</span>
                    </p>
                    <p>
                        <span class="date-label">Due Date</span><br>
                        <span class="date-value">${userSettings ? formatDate(invoiceData.dueDate, userSettings.date_format) : new Date(invoiceData.dueDate).toLocaleDateString()}</span>
                    </p>
                </div>
            </div>
            
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoiceData.items
						.map(
							(item) => `
                        <tr>
                            <td>${item.description.replace(/\n/g, '<br>')}</td>
                            <td>${userSettings ? formatNumber(item.quantity, userSettings.number_format) : item.quantity}</td>
                            <td>${userSettings ? formatCurrency(item.price, userSettings.default_currency) : `$${item.price.toFixed(2)}`}</td>
                            <td style="font-weight: 600;">${userSettings ? formatCurrency(item.quantity * item.price, userSettings.default_currency) : `$${(item.quantity * item.price).toFixed(2)}`}</td>
                        </tr>
                    `,
						)
						.join('')}
                </tbody>
            </table>
            
            <div class="invoice-footer">
                <div class="custom-fields">
                    ${
						invoiceData.customFields &&
						invoiceData.customFields.length > 0
							? `
                        <h4>Additional Information</h4>
                        ${invoiceData.customFields
							.map((fieldValue) => {
								if (!fieldValue.value) return ''
								let fieldLabel = fieldValue.label
								if (
									!fieldLabel &&
									userSettings?.custom_fields
								) {
									const fieldDefinition =
										userSettings.custom_fields.find(
											(cf) =>
												cf.id === fieldValue.fieldId,
										)
									fieldLabel = fieldDefinition?.label
								}
								if (!fieldLabel) return ''
								return `
                            <div class="custom-field">
                                <span class="field-label">${fieldLabel}:</span>
                                <span class="field-value">${fieldValue.value}</span>
                            </div>
                          `
							})
							.join('')}
                    `
							: ''
					}
                </div>
                
                <div class="totals">
                    <div class="total-row subtotal">
                        <span>Subtotal:</span>
                        <span>${userSettings ? formatCurrency(calculateSubtotal(), userSettings.default_currency) : `$${calculateSubtotal().toFixed(2)}`}</span>
                    </div>
                    ${
						invoiceData.taxRate && invoiceData.taxRate > 0
							? `
                        <div class="total-row">
                            <span>Tax (${invoiceData.taxRate}%):</span>
                            <span>${userSettings ? formatCurrency(calculateTax(), userSettings.default_currency) : `$${calculateTax().toFixed(2)}`}</span>
                        </div>
                    `
							: ''
					}
                    <div class="total-row final">
                        <span>Total:</span>
                        <span>${userSettings ? formatCurrency(calculateTotal(), userSettings.default_currency) : `$${calculateTotal().toFixed(2)}`}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`
	}

	const calculateSubtotal = () => {
		return invoiceData.items.reduce(
			(sum, item) => sum + item.quantity * item.price,
			0,
		)
	}

	const calculateTax = () => {
		const subtotal = calculateSubtotal()
		return subtotal * ((invoiceData.taxRate || 0) / 100)
	}

	const calculateTotal = () => {
		return calculateSubtotal() + calculateTax()
	}

	// Use theme styles directly from invoiceData
	const themeStyles = invoiceData.theme.styles

	// Component for the full invoice content
	const FullInvoiceContent = () => (
		<Card
			className="p-4 sm:p-6 lg:p-8 shadow-lg bg-white w-full max-w-4xl mx-auto"
			ref={pdfRef}
			style={{
				minHeight: '297mm',
				aspectRatio: '210/297',
				maxWidth: '210mm',
			}}
		>
			{/* Header */}
			<div
				className={`invoice-header-${invoiceData.theme.id} -m-4 sm:-m-6 lg:-m-8 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 mb-4 sm:mb-5 lg:mb-6`}
			>
				<div className="flex flex-col sm:flex-row justify-between items-start gap-4">
					{/* User/Company Information */}
					<div className="text-left flex-1">
						<div className="space-y-1">
							<p className="font-bold text-lg sm:text-xl lg:text-2xl">
								{userSettings?.company_name ||
									'Your Company Name'}
							</p>
							{userSettings?.company_email && (
								<p className="text-sm">
									{userSettings.company_email}
								</p>
							)}
							{userSettings?.company_phone && (
								<p className="text-sm">
									{userSettings.company_phone}
								</p>
							)}
							{userSettings?.company_address && (
								<p className="text-sm whitespace-pre-line">
									{userSettings.company_address}
								</p>
							)}
							{userSettings?.company_website && (
								<p className="text-sm">
									{userSettings.company_website}
								</p>
							)}
						</div>
					</div>

					{/* Logo & Invoice Number */}
					<div className="text-right text-white/90 flex-shrink-0">
						<div className="space-y-2 sm:space-y-4 flex flex-col items-end">
							{userSettings?.company_logo && (
								<div className="flex-shrink-0">
									<img
										alt="Company Logo"
										className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 object-contain"
										src={userSettings.company_logo}
									/>
								</div>
							)}
							<div className="text-right">
								<p className="text-xs sm:text-sm text-white/70">
									Invoice Number
								</p>
								<p className="font-mono font-semibold text-base sm:text-lg">
									{invoiceData.invoiceNumber}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Invoice Details */}
			<div className="grid sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-6 lg:mb-8">
				<div>
					<h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
						Bill To
					</h3>
					<div className="space-y-1">
						<p className="font-semibold text-base sm:text-lg">
							{invoiceData.client.name}
						</p>
						{invoiceData.client.email && (
							<p className="text-muted-foreground">
								{invoiceData.client.email}
							</p>
						)}
						{invoiceData.client.phone && (
							<p className="text-muted-foreground">
								{invoiceData.client.phone}
							</p>
						)}
						<p className="text-muted-foreground whitespace-pre-line">
							{invoiceData.client.address}
						</p>
					</div>
				</div>

				<div className="space-y-4">
					<div>
						<p className="text-sm text-muted-foreground">
							Invoice Date
						</p>
						<p className="font-semibold">
							{userSettings
								? formatDate(
										invoiceData.date,
										userSettings.date_format,
									)
								: new Date(
										invoiceData.date,
									).toLocaleDateString()}
						</p>
					</div>
					<div>
						<p className="text-sm text-muted-foreground">
							Due Date
						</p>
						<p className="font-semibold">
							{userSettings
								? formatDate(
										invoiceData.dueDate,
										userSettings.date_format,
									)
								: new Date(
										invoiceData.dueDate,
									).toLocaleDateString()}
						</p>
					</div>
				</div>
			</div>

			<Separator className="my-2" />

			{/* Items Table */}
			<div className="">
				<div className="overflow-x-auto rounded-sm border">
					<table className="w-full min-w-[500px]">
						<thead>
							<tr
								className={`invoice-table-${invoiceData.theme.id}`}
							>
								<th className="text-left p-2 sm:p-3 font-semibold text-white text-sm sm:text-base">
									Description
								</th>
								<th className="text-center p-2 sm:p-3 font-semibold w-16 sm:w-20 text-white text-sm sm:text-base">
									Qty
								</th>
								<th className="text-right p-2 sm:p-3 font-semibold w-20 sm:w-24 text-white text-sm sm:text-base">
									Price
								</th>
								<th className="text-right p-2 sm:p-3 font-semibold w-20 sm:w-24 text-white text-sm sm:text-base">
									Total
								</th>
							</tr>
						</thead>
						<tbody>
							{invoiceData.items.map((item, index) => (
								<tr
									className={`invoice-item-row-${invoiceData.theme.id} ${
										index % 2 === 0 ? 'bg-muted/60' : ''
									}`}
									key={item.id}
								>
									<td className="px-2 sm:px-3 py-2 sm:py-2.5 border-b">
										<p className="whitespace-pre-line text-sm sm:text-base">
											{item.description}
										</p>
									</td>
									<td className="px-2 sm:px-3 py-2 sm:py-2.5 border-b text-center text-sm sm:text-base">
										{userSettings
											? formatNumber(
													item.quantity,
													userSettings.number_format,
												)
											: item.quantity}
									</td>
									<td className="px-2 sm:px-3 py-2 sm:py-2.5 border-b text-right text-sm sm:text-base">
										{userSettings
											? formatCurrency(
													item.price,
													userSettings.default_currency,
												)
											: `$${item.price.toFixed(2)}`}
									</td>
									<td className="px-2 sm:px-3 py-2 sm:py-2.5 border-b text-right font-semibold text-sm sm:text-base">
										{userSettings
											? formatCurrency(
													item.quantity * item.price,
													userSettings.default_currency,
												)
											: `$${(item.quantity * item.price).toFixed(2)}`}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Custom Fields and Totals */}
			<div className="flex flex-col lg:flex-row justify-between gap-4 lg:gap-8 mt-4 sm:mt-6 lg:mt-8">
				{/* Custom Fields - Left Side */}
				<div className="w-full lg:w-64 space-y-3">
					{invoiceData.customFields &&
						invoiceData.customFields.length > 0 && (
							<>
								<h4 className="font-semibold text-md text-muted-foreground uppercase tracking-wide">
									Additional Information
								</h4>
								<div className="space-y-2">
									{invoiceData.customFields.map(
										(fieldValue) => {
											if (!fieldValue.value) return null

											// First try to find in user settings (pre-configured fields)
											let fieldLabel = fieldValue.label
											if (
												!fieldLabel &&
												userSettings?.custom_fields
											) {
												const fieldDefinition =
													userSettings.custom_fields.find(
														(cf) =>
															cf.id ===
															fieldValue.fieldId,
													)
												fieldLabel =
													fieldDefinition?.label
											}

											if (!fieldLabel) return null

											return (
												<div
													className="flex flex-row items-center gap-2"
													key={fieldValue.fieldId}
												>
													<span className="text-sm text-muted-foreground font-semibold">
														{fieldLabel}:
													</span>
													<span className="text-md text-black font-semibold">
														{fieldValue.value}
													</span>
												</div>
											)
										},
									)}
								</div>
							</>
						)}
				</div>

				{/* Totals - Right Side */}
				<div className="w-full lg:w-64 space-y-2 sm:space-y-3">
					<div className="flex justify-between items-center">
						<span className="text-muted-foreground">Subtotal:</span>
						<span className="font-semibold">
							{userSettings
								? formatCurrency(
										calculateSubtotal(),
										userSettings.default_currency,
									)
								: `$${calculateSubtotal().toFixed(2)}`}
						</span>
					</div>
					{invoiceData.taxRate && invoiceData.taxRate > 0 && (
						<div className="flex justify-between items-center">
							<span className="text-muted-foreground">
								Tax ({invoiceData.taxRate}%):
							</span>
							<span className="font-semibold">
								{userSettings
									? formatCurrency(
											calculateTax(),
											userSettings.default_currency,
										)
									: `$${calculateTax().toFixed(2)}`}
							</span>
						</div>
					)}
					<Separator />
					<div
						className={`invoice-total-${invoiceData.theme.id} flex justify-between items-center py-3 px-4`}
					>
						<span className="font-bold text-lg">Total:</span>
						<span className="font-bold text-xl">
							{userSettings
								? formatCurrency(
										calculateTotal(),
										userSettings.default_currency,
									)
								: `$${calculateTotal().toFixed(2)}`}
						</span>
					</div>
				</div>
			</div>

			{/* Footer */}
			{/* <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
        <p>Thank you for your business!</p>
        <p className="mt-2">
          This invoice was generated using Invoice Generator
        </p>
      </div> */}
		</Card>
	)

	return (
		<div className="space-y-4 overflow-y-scroll md:overflow-y-auto h-full md:h-auto">
			<div className="flex items-center justify-center gap-2 mb-2">
				<Eye className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
				<h2 className="text-lg sm:text-xl lg:text-2xl font-bold">
					Invoice Preview
				</h2>
			</div>

			<div className="flex justify-center gap-2 flex-wrap text-xs sm:text-sm">
				<Button
					className="hidden sm:flex items-center gap-2 justify-center"
					disabled={isSaving}
					onClick={printInvoiceNoDialog}
					size="sm"
					variant="outline"
				>
					<Printer className="w-4 h-4" />
					Print
					{isSaving && (isSaved ? ' (Printing...)' : ' (Saving...)')}
				</Button>
				<Button
					className="flex items-center gap-2 justify-center text-xs sm:text-sm"
					disabled={isSaving}
					onClick={downloadedInvoiceNoDialog}
					size="sm"
				>
					<Download className="w-4 h-4" />
					Download PDF
					{isSaving &&
						(isSaved ? ' (Downloading...)' : ' (Saving...)')}
				</Button>
				<Button
					className="flex items-center gap-2 justify-center text-xs sm:text-sm"
					disabled={isSaving}
					onClick={exportInvoiceAsHTML}
					size="sm"
					variant="outline"
				>
					<Mail className="w-4 h-4" />
					Export HTML
					{isSaving && (isSaved ? ' (Exporting...)' : ' (Saving...)')}
				</Button>
			</div>
			{/* A4 Paper Preview */}
			<div className="flex justify-center bg-gray-100 rounded-lg h-[70%] w-full max-w-52 md:max-w-56 lg:max-w-60 mx-auto relative overflow-hidden aspect-[3/4]">
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 overflow-hidden">
					<div
						className="bg-white shadow-2xl border border-gray-200 scale-[0.2] sm:scale-[0.205] md:scale-[0.21] lg:scale-[0.25]"
						style={{
							width: '210mm',
							aspectRatio: '210/297',
							boxShadow:
								'0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.05)',
							borderRadius: '2px',
						}}
					>
						<div className="p-8">
							<div className="space-y-8">
								{/* Header */}
								<div
									className={`invoice-header-${invoiceData.theme.id} -m-8 px-8 py-6 mb-6`}
								>
									<div className="flex justify-between items-start">
										{/* User/Company Information */}
										<div className="text-left">
											<div className="space-y-1">
												<p className="font-bold text-2xl">
													{userSettings?.company_name ||
														'Your Company Name'}
												</p>
												{userSettings?.company_email && (
													<p className="text-sm">
														{
															userSettings.company_email
														}
													</p>
												)}
												{userSettings?.company_phone && (
													<p className="text-sm">
														{
															userSettings.company_phone
														}
													</p>
												)}
												{userSettings?.company_address && (
													<p className="text-sm whitespace-pre-line">
														{
															userSettings.company_address
														}
													</p>
												)}
												{userSettings?.company_website && (
													<p className="text-sm">
														{
															userSettings.company_website
														}
													</p>
												)}
											</div>
										</div>

										{/* Logo & Invoice Number */}
										<div className="text-right text-white/90">
											<div className="space-y-4 flex flex-col items-end">
												{userSettings?.company_logo && (
													<div className="flex-shrink-0">
														<img
															alt="Company Logo"
															className="w-16 h-16 object-contain"
															src={
																userSettings.company_logo
															}
														/>
													</div>
												)}
												<div className="text-right">
													<p className="text-sm text-white/60">
														Invoice Number
													</p>
													<p className="font-mono font-semibold text-lg">
														{
															invoiceData.invoiceNumber
														}
													</p>
												</div>
											</div>
										</div>
									</div>
								</div>

								{/* Invoice Details */}
								<div className="grid md:grid-cols-2 gap-8 mb-8">
									<div>
										<h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
											Bill To
										</h3>
										<div className="space-y-1">
											<p className="font-semibold text-lg">
												{invoiceData.client.name}
											</p>
											{invoiceData.client.email && (
												<p className="text-muted-foreground">
													{invoiceData.client.email}
												</p>
											)}
											{invoiceData.client.phone && (
												<p className="text-muted-foreground">
													{invoiceData.client.phone}
												</p>
											)}
											<p className="text-muted-foreground whitespace-pre-line">
												{invoiceData.client.address}
											</p>
										</div>
									</div>

									<div className="space-y-4">
										<div>
											<p className="text-sm text-muted-foreground">
												Invoice Date
											</p>
											<p className="font-semibold">
												{userSettings
													? formatDate(
															invoiceData.date,
															userSettings.date_format,
														)
													: new Date(
															invoiceData.date,
														).toLocaleDateString()}
											</p>
										</div>
										<div>
											<p className="text-sm text-muted-foreground">
												Due Date
											</p>
											<p className="font-semibold">
												{userSettings
													? formatDate(
															invoiceData.dueDate,
															userSettings.date_format,
														)
													: new Date(
															invoiceData.dueDate,
														).toLocaleDateString()}
											</p>
										</div>
									</div>
								</div>

								<Separator className="my-2" />

								{/* Items Table */}
								<div className="">
									<div className="overflow-x-auto rounded-sm border">
										<table className="w-full">
											<thead>
												<tr
													className={`invoice-table-${invoiceData.theme.id}`}
												>
													<th className="text-left p-3 font-semibold text-white">
														Description
													</th>
													<th className="text-center p-3 font-semibold w-20 text-white">
														Qty
													</th>
													<th className="text-right p-3 font-semibold w-24 text-white">
														Price
													</th>
													<th className="text-right p-3 font-semibold w-24 text-white">
														Total
													</th>
												</tr>
											</thead>
											<tbody>
												{invoiceData.items.map(
													(item, index) => (
														<tr
															className={`invoice-item-row-${
																invoiceData
																	.theme.id
															} ${index % 2 === 0 ? 'bg-muted/60' : ''}`}
															key={item.id}
														>
															<td className="px-3 py-2.5 border-b">
																<p className="whitespace-pre-line">
																	{
																		item.description
																	}
																</p>
															</td>
															<td className="px-3 py-2.5 border-b text-center">
																{userSettings
																	? formatNumber(
																			item.quantity,
																			userSettings.number_format,
																		)
																	: item.quantity}
															</td>
															<td className="px-3 py-2.5 border-b text-right">
																{userSettings
																	? formatCurrency(
																			item.price,
																			userSettings.default_currency,
																		)
																	: `$${item.price.toFixed(2)}`}
															</td>
															<td className="px-3 py-2.5 border-b text-right font-semibold">
																{userSettings
																	? formatCurrency(
																			item.quantity *
																				item.price,
																			userSettings.default_currency,
																		)
																	: `$${(item.quantity * item.price).toFixed(2)}`}
															</td>
														</tr>
													),
												)}
											</tbody>
										</table>
									</div>
								</div>

								{/* Custom Fields and Totals */}
								<div className="flex justify-between mt-8">
									{/* Custom Fields - Left Side */}
									<div className="w-64 space-y-3">
										{invoiceData.customFields &&
											invoiceData.customFields.length >
												0 && (
												<>
													<h4 className="font-semibold text-md text-muted-foreground uppercase tracking-wide">
														Additional Information
													</h4>
													<div className="space-y-2">
														{invoiceData.customFields.map(
															(fieldValue) => {
																if (
																	!fieldValue.value
																)
																	return null

																// First try to find in user settings (pre-configured fields)
																let fieldLabel =
																	fieldValue.label
																if (
																	!fieldLabel &&
																	userSettings?.custom_fields
																) {
																	const fieldDefinition =
																		userSettings.custom_fields.find(
																			(
																				cf,
																			) =>
																				cf.id ===
																				fieldValue.fieldId,
																		)
																	fieldLabel =
																		fieldDefinition?.label
																}

																if (!fieldLabel)
																	return null

																return (
																	<div
																		className="flex flex-row items-center gap-2"
																		key={
																			fieldValue.fieldId
																		}
																	>
																		<span className="text-sm text-muted-foreground font-semibold">
																			{
																				fieldLabel
																			}
																			:
																		</span>
																		<span className="text-md text-black font-semibold">
																			{
																				fieldValue.value
																			}
																		</span>
																	</div>
																)
															},
														)}
													</div>
												</>
											)}
									</div>

									{/* Totals - Right Side */}
									<div className="w-64 space-y-3">
										<div className="flex justify-between items-center">
											<span className="text-muted-foreground">
												Subtotal:
											</span>
											<span className="font-semibold">
												{userSettings
													? formatCurrency(
															calculateSubtotal(),
															userSettings.default_currency,
														)
													: `$${calculateSubtotal().toFixed(2)}`}
											</span>
										</div>
										{invoiceData.taxRate &&
											invoiceData.taxRate > 0 && (
												<div className="flex justify-between items-center">
													<span className="text-muted-foreground">
														Tax (
														{invoiceData.taxRate}%):
													</span>
													<span className="font-semibold">
														{userSettings
															? formatCurrency(
																	calculateTax(),
																	userSettings.default_currency,
																)
															: `$${calculateTax().toFixed(2)}`}
													</span>
												</div>
											)}
										<Separator />
										<div
											className={`invoice-total-${invoiceData.theme.id} flex justify-between items-center py-3 px-4`}
										>
											<span className="font-bold text-lg">
												Total:
											</span>
											<span className="font-bold text-xl">
												{userSettings
													? formatCurrency(
															calculateTotal(),
															userSettings.default_currency,
														)
													: `$${calculateTotal().toFixed(2)}`}
											</span>
										</div>
									</div>
								</div>

								{/* Footer */}
								{/* <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
                  <p>Thank you for your business!</p>
                  <p className="mt-2">
                    This invoice was generated using Invoice Generator
                  </p>
                </div> */}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="hidden lg:flex flex-col sm:flex-row flex-wrap gap-2 justify-center mt-4">
				<Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
					<DialogTrigger asChild>
						<Button
							className="flex items-center gap-2 w-full sm:w-auto justify-center"
							onClick={() => setIsDialogOpen(true)}
							size="sm"
							variant="outline"
						>
							<Maximize2 className="w-4 h-4" />
							Full Preview
						</Button>
					</DialogTrigger>
					<DialogContent
						className={`max-w-[95vw] sm:max-w-4xl lg:max-w-5xl max-h-[90dvh] overflow-y-auto px-2 py-6 sm:p-6 z-[100]`}
					>
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
								<Eye className="w-4 h-4 sm:w-5 sm:h-5" />
								Full Invoice Preview
							</DialogTitle>
						</DialogHeader>
						<div className="space-y-2 sm:space-y-4">
							{/* Action Buttons in Dialog */}
							<div className="flex justify-center gap-2 flex-wrap w-1/4 md:w-full">
								<Button
									className="flex items-center gap-2 w-full sm:w-auto justify-center"
									disabled={isSaving}
									onClick={PrintInvoice}
									size="sm"
									variant="outline"
								>
									<Printer className="w-4 h-4" />
									Print
									{isSaving &&
										(isSaved
											? ' (Printing...)'
											: ' (Saving...)')}
								</Button>
								<Button
									className="flex items-center gap-2 w-full sm:w-auto justify-center"
									disabled={isSaving}
									onClick={DownloadInvoice}
									size="sm"
								>
									<Download className="w-4 h-4" />
									Download PDF
									{isSaving &&
										(isSaved
											? ' (Downloading...)'
											: ' (Saving...)')}
								</Button>
								<Button
									className="flex items-center gap-2 w-full sm:w-auto justify-center"
									disabled={isSaving}
									onClick={exportInvoiceAsHTML}
									size="sm"
									variant="outline"
								>
									<Mail className="w-4 h-4" />
									Export HTML
									{isSaving &&
										(isSaved
											? ' (Exporting...)'
											: ' (Saving...)')}
								</Button>
							</div>

							{/* Full Invoice Content */}
							<div className="flex justify-center overflow-x-auto">
								<div className="min-w-fit">
									<FullInvoiceContent />
								</div>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			{/* HTML Export Dialog */}
			<Dialog onOpenChange={setIsHtmlDialogOpen} open={isHtmlDialogOpen}>
				<DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Code className="w-5 h-5" />
							Invoice HTML Code for Email
						</DialogTitle>
					</DialogHeader>
					<div className="flex-1 flex flex-col gap-4 min-h-0">
						<div className="flex items-center justify-between">
							<p className="text-sm text-muted-foreground">
								Copy this HTML code to embed the invoice in your
								email or website.
							</p>
							<div className="flex gap-2">
								<Button
									onClick={copyHtmlToClipboard}
									size="sm"
									variant="outline"
								>
									<Code className="w-4 h-4 mr-2" />
									Copy to Clipboard
								</Button>
								<Button onClick={downloadHtmlFile} size="sm">
									<Download className="w-4 h-4 mr-2" />
									Download HTML
								</Button>
							</div>
						</div>
						<Textarea
							className="flex-1 min-h-[400px] font-mono text-xs resize-none"
							placeholder="HTML code will appear here..."
							readOnly
							value={htmlContent}
						/>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}
