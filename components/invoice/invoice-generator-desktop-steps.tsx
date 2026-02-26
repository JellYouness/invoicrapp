import { steps } from '@/lib/invoice-utils'

export default function InvoiceGeneratorDesktopSteps({
	currentStep,
}: {
	currentStep: number
}) {
	return (
		<div className="hidden space-y-16 lg:block">
			{steps.map((step, index) => (
				<div className="relative" key={step.id}>
					<div className="flex items-start gap-4">
						<div
							className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-semibold transition-all duration-300 ${
								currentStep >= step.id
									? 'bg-primary text-primary-foreground shadow-lg'
									: 'bg-muted text-muted-foreground'
							}`}
						>
							{step.id}
						</div>
						<div className="min-w-0 flex-1">
							<p
								className={`font-medium ${
									currentStep >= step.id
										? 'text-foreground'
										: 'text-muted-foreground'
								}`}
							>
								{step.title}
							</p>
							<p className="mt-1 text-muted-foreground text-sm">
								{step.description}
							</p>
						</div>
					</div>

					{/* Vertical connector line */}
					{index < steps.length - 1 && (
						<div className="absolute top-[48px] left-5 h-14 w-0.5 bg-border" />
					)}
				</div>
			))}
		</div>
	)
}
