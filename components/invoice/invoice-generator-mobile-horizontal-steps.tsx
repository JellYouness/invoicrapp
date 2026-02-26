import { steps } from '@/lib/invoice-utils'

export default function InvoiceGeneratorMobileHorizontalSteps({
	currentStep,
}: {
	currentStep: number
}) {
	return (
		<div className="lg:hidden">
			<div className="flex items-center justify-between">
				{steps.map((step, index) => (
					<div
						className="relative flex h-20 flex-1 items-center"
						key={step.id}
					>
						<div className="flex h-20 flex-1 flex-col items-center">
							<div
								className={`flex h-8 w-8 items-center justify-center rounded-full font-semibold text-sm transition-all duration-300 ${
									currentStep >= step.id
										? 'bg-primary text-primary-foreground shadow-lg'
										: 'bg-muted text-muted-foreground'
								}`}
							>
								{step.id}
							</div>
							<p
								className={`mt-1 text-center text-xs ${
									currentStep >= step.id
										? 'text-foreground'
										: 'text-muted-foreground'
								}`}
							>
								{step.title}
							</p>
						</div>
						{index < steps.length - 1 && (
							<div className="absolute top-4 -right-1 z-10 h-0.5 w-3 bg-border sm:-right-5 sm:w-10 md:-right-8 md:w-16" />
						)}
					</div>
				))}
			</div>
		</div>
	)
}
