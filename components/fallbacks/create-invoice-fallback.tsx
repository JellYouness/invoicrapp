import InvoiceGeneratorDesktopSteps from '../invoice-generator/invoice-generator-desktop-steps'
import InvoiceGeneratorMobileHorizontalSteps from '../invoice-generator/invoice-generator-mobile-horizontal-steps'
import { Card } from '../ui/card'

export default function InvoiceGeneratorFallback() {
	return (
		<div className="relative h-full">
			<div className="mx-auto h-full">
				<div
					className={`flex h-full flex-col gap-4 lg:flex-row lg:gap-8`}
				>
					<div className="w-full lg:h-full lg:w-80 lg:flex-shrink-0">
						<Card className="border-primary/30 bg-gradient-to-b from-card to-muted/20 px-1 pt-4 pb-1 shadow-lg lg:sticky lg:top-0 lg:flex lg:h-full lg:flex-col lg:justify-center lg:p-6">
							{/* Mobile: Horizontal Steps */}
							<InvoiceGeneratorMobileHorizontalSteps
								currentStep={1}
							/>

							{/* Desktop: Vertical Steps */}
							<InvoiceGeneratorDesktopSteps currentStep={1} />
						</Card>
					</div>

					{/* Right Content Area */}
					<div className="flex flex-1 flex-col overflow-y-auto lg:h-full">
						{/* Step Content */}
						<Card className="h-[85%] flex-1 border-primary/30 p-4 shadow-lg sm:p-6 lg:h-[90%] lg:p-8">
							{/* <RenderStepContent
								currentStep={currentStep}
								customFields={customFields}
								invoiceData={invoiceData}
								isSaved={isSaved}
								setInvoiceData={setInvoiceData}
								setIsNewClient={setIsNewClient}
								setIsSaved={setIsSaved}
							/> */}
						</Card>
					</div>
				</div>
			</div>
		</div>
	)
}
