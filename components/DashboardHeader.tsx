'use client'
import {
	CreditCard,
	Crown,
	LogOut,
	Menu,
	Plus,
	Settings,
	User,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { InvoiceUsageBar } from '@/components/ui/InvoiceUsageBar'
import { Logo } from '@/components/ui/Logo'
import { UpgradePrompt } from '@/components/ui/UpgradePrompt'
import { useAuth } from '@/contexts/AuthContext'
import { useUsage } from '@/contexts/UsageContext'

interface DashboardHeaderProps {
	// onNewInvoice: () => void
		onMenuToggle?: () => void
}

export const DashboardHeader = ({
	// onNewInvoice,	
	onMenuToggle,
}: DashboardHeaderProps) => {
	const { user, signOut } = useAuth()
	const { usage } = useUsage()

	const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
	const [upgradePromptType, _setUpgradePromptType] = useState<
		'warning' | 'limit-reached'
	>('warning')

	const handleSignOut = async () => {
		await signOut()
	}

	const getUserInitials = (text?: string) => {
		// if fullname is provided, use it
		if (text?.includes(' ')) {
			const parts = text.split(' ')
			return (parts[0][0] + parts[1][0]).toUpperCase()
		}
		if (!text) return 'U'
		const parts = text.split('@')[0].split('.')
		if (parts.length >= 2) {
			return (parts[0][0] + parts[1][0]).toUpperCase()
		}
		return text[0].toUpperCase()
	}

	return (
		<header className="bg-card/95 backdrop-blur-sm border-b border-border px-4 sm:px-6 py-3 sticky top-0 z-50">
			<div className="flex flex-col gap-3">
				<div className="flex items-center justify-between">
					{/* Left side - Menu button and Logo */}
					<div className="flex items-center space-x-2 sm:space-x-4">
						{/* Mobile Menu Button */}
						{onMenuToggle && (
							<Button
								className="lg:hidden"
								onClick={onMenuToggle}
								size="sm"
								variant="ghost"
							>
								<Menu className="h-5 w-5" />
							</Button>
						)}

						<Logo className="text-lg sm:text-xl" size="md" />
					</div>

					{/* Right side - Actions and user menu */}
					<div className="flex items-center space-x-2 sm:space-x-3">
						{/* Usage Bar - Show to the left of New Invoice button */}
						{usage && (
							<div className="hidden md:block">
								<InvoiceUsageBar
									className="scale-90 origin-right"
									current={usage.current}
									limit={
										usage.limit === Infinity
											? 999
											: usage.limit
									}
									planType={usage.planType}
								/>
							</div>
						)}

						{/* New Invoice Button */}
						<Link href={'/dashboard/create'}>
							<Button
								className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-200 flex items-center gap-1 sm:gap-2"
								size="sm"
							>
								<Plus className="w-4 h-4" />
								<span className="hidden lg:inline">
									New Invoice
								</span>
								<span className="lg:hidden">New</span>
							</Button>
						</Link>

						{/* Upgrade to Pro Button - Hidden on mobile, only show for free users */}
						{/* {usage && usage.planType === 'free' && (
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex border-border text-accent hover:bg-accent/10 hover:border-accent transition-all duration-200 items-center gap-1"
              onClick={() => {
                setUpgradePromptType('warning');
                setShowUpgradePrompt(true);
              }}
            >
              <Zap className="w-3 h-3" />
              Upgrade
            </Button>
          )} */}

						{/* Settings - Hidden on mobile, accessible via user menu */}
						<Link href={`/dashboard/settings}`}>
							<Button
								className="hidden sm:flex hover:bg-accent/10 transition-colors"
								size="icon"
								variant="ghost"
							>
								<Settings className="w-5 h-5 text-muted-foreground" />
							</Button>
						</Link>

						{/* User Menu */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									className="relative h-10 w-10 rounded-full hover:bg-accent/10 transition-colors"
									variant="ghost"
								>
									<Avatar className="h-10 w-10">
										<AvatarImage alt="User" src="/" />
										<AvatarFallback className="bg-primary text-primary-foreground font-semibold">
											{getUserInitials(
												user?.user_metadata
													?.full_name || user?.email,
											)}
										</AvatarFallback>
									</Avatar>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align="end"
								className="w-64"
								forceMount
							>
								<DropdownMenuLabel className="font-normal">
									<div className="flex flex-col space-y-1">
										<p className="text-sm font-medium leading-none">
											{user?.user_metadata?.full_name ||
												user?.email?.split('@')[0] ||
												'User'}
										</p>
										<p className="text-xs leading-none text-muted-foreground">
											{user?.email || 'user@example.com'}
										</p>
										<div className="flex items-center gap-2 mt-2">
											{usage && (
												<Badge
													className={`text-xs ${
														usage.planType === 'pro'
															? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0'
															: ''
													}`}
													variant="secondary"
												>
													{usage.planType ===
													'pro' ? (
														<>
															<Crown className="w-3 h-3 mr-1" />
															Pro Plan
														</>
													) : (
														'Free Plan'
													)}
												</Badge>
											)}
										</div>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<Link href={'/dashboard//profile'}>
									<DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
										<User className="w-4 h-4" />
										Profile
									</DropdownMenuItem>
								</Link>
								<Link href={'/dashboard//settings'}>
									<DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
										<Settings className="w-4 h-4" />
										Settings
									</DropdownMenuItem>
								</Link>
								<DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
									<CreditCard className="w-4 h-4" />
									Billing
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
									onClick={handleSignOut}
								>
									<LogOut className="w-4 h-4" />
									Log out
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>

				{/* Upgrade Prompt - DISABLED (subscription system disabled) */}
				{false && usage && (
					<UpgradePrompt
						currentUsage={usage.current}
						description={
							upgradePromptType === 'limit-reached'
								? 'You have reached your monthly limit of 8 invoices. Upgrade to Pro for unlimited invoices and more features.'
								: `You have used ${usage.current} of your ${usage.limit} monthly invoices. Upgrade to Pro for unlimited invoices.`
						}
						isOpen={showUpgradePrompt}
						limit={usage.limit === Infinity ? 999 : usage.limit}
						onClose={() => setShowUpgradePrompt(false)}
						onUpgrade={() => {
							setShowUpgradePrompt(false)
							// TODO: Implement actual upgrade flow
							console.log('Upgrade to Pro clicked')
						}}
						title={
							upgradePromptType === 'limit-reached'
								? 'Invoice Limit Reached'
								: 'Approaching Invoice Limit'
						}
						type={upgradePromptType}
					/>
				)}
			</div>
		</header>
	)
}
