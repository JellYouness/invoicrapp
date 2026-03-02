import { ArrowLeft, ArrowRight, Palette } from 'lucide-react'
import InvoiceGeneratorDesktopSteps from '../invoice-generator/invoice-generator-desktop-steps'
import InvoiceGeneratorMobileHorizontalSteps from '../invoice-generator/invoice-generator-mobile-horizontal-steps'
import { Button } from '../ui/button'
import { Card } from '../ui/card'

export default function InvoiceGeneratorFallback() {
	return (
		<div className="relative h-full">
			<div className="mx-auto h-full">
				<div className="flex h-full flex-col gap-4 lg:flex-row lg:gap-8">
					<div className="w-full lg:h-full lg:w-80 lg:flex-shrink-0">
						<Card className="border-primary/30 bg-gradient-to-b from-card to-muted/20 px-1 pt-4 pb-1 shadow-lg lg:sticky lg:top-0 lg:flex lg:h-full lg:flex-col lg:justify-center lg:p-6">
							<InvoiceGeneratorMobileHorizontalSteps
								currentStep={1}
							/>
							<InvoiceGeneratorDesktopSteps currentStep={1} />
						</Card>
					</div>

					{/* Right Content Area */}
					<div className="flex flex-1 flex-col overflow-y-auto lg:h-full">
						{/* Step Content */}
						<Card className="flex flex-col h-[85%] flex-1 border-primary/30 p-4 shadow-lg sm:p-6 lg:h-[90%] lg:p-8">
							<div className="flex flex-col h-full space-y-4 md:space-y-6">
								<div className="text-center">
									<div className="flex items-center justify-center gap-2 lg:mb-2">
										<Palette className="w-6 h-6 text-primary" />
										<h2 className="text-lg md:text-xl lg:text-2xl font-bold">
											Choose Your Invoice Theme
										</h2>
									</div>
								</div>
								
								<Card className="flex flex-1 items-center justify-center bg-muted/90 rounded-lg">
									<div className="text-center">
										<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
										<p className="text-muted-foreground font-medium">
											Loading invoice generator...
										</p>
									</div>
								</Card>
							</div>
						</Card>
						<div className="z-[2] mt-4 flex justify-between pb-safe lg:mt-6 lg:pb-0">
							<Button
								className="flex items-center gap-2"
								disabled={true}
								size="sm"
								variant="outline"
							>
								<ArrowLeft className="h-4 w-4" />
								<span className="hidden sm:inline">
									Previous
								</span>
								<span className="sm:hidden">Prev</span>
							</Button>
							<Button
								className="flex items-center gap-2"
								size="sm"
							>
								<span className="hidden sm:inline">Next</span>
								<span className="sm:hidden">Next</span>
								<ArrowRight className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
