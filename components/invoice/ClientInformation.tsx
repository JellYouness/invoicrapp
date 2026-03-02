'use client'
import {
	FileText,
	Globe,
	Mail,
	MapPin,
	Phone,
	User,
	UserPlus,
	Users,
} from 'lucide-react'
import { use, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { Client } from '@/lib/client-service'
import type { ClientInfo } from '@/types/invoice'

interface ClientInformationProps {
	clientInfo: ClientInfo
	onClientUpdate: (client: ClientInfo) => void
	clientsPromise: Promise<Client[]>
	onClientModeChange?: (isNewClient: boolean) => void
}

export const ClientInformation = ({
	clientInfo,
	onClientUpdate,
	onClientModeChange,
	clientsPromise,
}: ClientInformationProps) => {
	const existingClients = use(clientsPromise)
	const [isNewClient, setIsNewClient] = useState(false)
	const [selectedClientId, setSelectedClientId] = useState<string>('')
	

	const updateField = (field: keyof ClientInfo, value: string) => {
		onClientUpdate({ ...clientInfo, [field]: value })
	}

	const handleClientModeChange = (newClient: boolean) => {
		setIsNewClient(newClient)
		onClientModeChange?.(newClient)
		if (newClient) {
			setSelectedClientId('')
			// Clear current client info when switching to new client
			onClientUpdate({
				name: '',
				address: '',
				email: '',
				phone: '',
				tax_number: '',
				website: '',
			})
		}
	}

	const handleExistingClientSelect = (clientId: string) => {
		setSelectedClientId(clientId)
		const selectedClient = existingClients.find((c) => c.id === clientId)
		if (selectedClient) {
			onClientUpdate({
				id: selectedClient.id,
				name: selectedClient.name,
				address: selectedClient.address || '',
				email: selectedClient.email || '',
				phone: selectedClient.phone || '',
				tax_number: selectedClient.tax_number || '',
				website: selectedClient.website || '',
			})
		}
	}

	return (
		<div className="space-y-4 md:space-y-6 h-full">
			<div className="text-center">
				<div className="flex items-center justify-center gap-2">
					<User className="w-6 h-6 text-primary" />
					<h2 className="text-lg md:text-xl lg:text-2xl font-bold">
						Client Information
					</h2>
				</div>
			</div>

			{/* Client Selection Mode */}
			<div className="flex justify-center gap-4 mb-3">
				<Button
					className="flex items-center gap-2"
					disabled={existingClients.length === 0}
					onClick={() => handleClientModeChange(false)}
					variant={!isNewClient ? 'default' : 'outline'}
				>
					<Users className="w-4 h-4" />
					Existing Client{' '}
					{existingClients.length > 0 &&
						`(${existingClients.length})`}
				</Button>
				<Button
					className="flex items-center gap-2"
					onClick={() => handleClientModeChange(true)}
					variant={isNewClient ? 'default' : 'outline'}
				>
					<UserPlus className="w-4 h-4" />
					New Client
				</Button>
			</div>

			<Card className="p-6 bg-muted/90 max-h-[40vh] overflow-y-auto">
				{/* Existing Client Selection */}
				{!isNewClient && (
					<div className="mb-6">
						<Label
							className="flex items-center gap-2 mb-2"
							htmlFor="clientSelect"
						>
							<Users className="w-4 h-4" />
							Select Client *
						</Label>
						<Select
							onValueChange={handleExistingClientSelect}
							value={selectedClientId}
						>
							<SelectTrigger className="transition-all duration-200 focus:scale-[1.02]">
								<SelectValue placeholder="Choose an existing client" />
							</SelectTrigger>
							<SelectContent>
								{existingClients.map((client) => (
									<SelectItem
										key={client.id}
										value={client.id}
									>
										<div className="flex items-center gap-2">
											<User className="w-4 h-4" />
											<span className="font-medium">
												{client.name}
											</span>
											{/* {client.email && (
                        <span className="text-sm text-muted-foreground">
                          {client.email}
                        </span>
                      )} */}
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}

				{/* New Client Form */}
				{isNewClient && (
					<div className="grid md:grid-cols-2 gap-6">
						<div className="space-y-4">
							<div className="space-y-2">
								<Label
									className="flex items-center gap-2"
									htmlFor="clientName"
								>
									<User className="w-4 h-4" />
									Client Name *
								</Label>
								<Input
									className="transition-all duration-200 focus:scale-[1.02]"
									id="clientName"
									onChange={(e) =>
										updateField('name', e.target.value)
									}
									placeholder="Enter client or company name"
									value={clientInfo.name}
								/>
							</div>

							<div className="space-y-2">
								<Label
									className="flex items-center gap-2"
									htmlFor="clientEmail"
								>
									<Mail className="w-4 h-4" />
									Email Address
								</Label>
								<Input
									className="transition-all duration-200 focus:scale-[1.02]"
									id="clientEmail"
									onChange={(e) =>
										updateField('email', e.target.value)
									}
									placeholder="client@example.com"
									type="email"
									value={clientInfo.email || ''}
								/>
							</div>

							<div className="space-y-2">
								<Label
									className="flex items-center gap-2"
									htmlFor="clientPhone"
								>
									<Phone className="w-4 h-4" />
									Phone Number
								</Label>
								<Input
									className="transition-all duration-200 focus:scale-[1.02]"
									id="clientPhone"
									onChange={(e) =>
										updateField('phone', e.target.value)
									}
									placeholder="+1 (555) 123-4567"
									value={clientInfo.phone || ''}
								/>
							</div>

							<div className="space-y-2">
								<Label
									className="flex items-center gap-2"
									htmlFor="clientTax"
								>
									<FileText className="w-4 h-4" />
									Tax Number
								</Label>
								<Input
									className="transition-all duration-200 focus:scale-[1.02]"
									id="clientTax"
									onChange={(e) =>
										updateField(
											'tax_number',
											e.target.value,
										)
									}
									placeholder="Enter tax/VAT number"
									value={clientInfo.tax_number || ''}
								/>
							</div>
						</div>

						<div className="space-y-4">
							<div className="space-y-2">
								<Label
									className="flex items-center gap-2"
									htmlFor="clientAddress"
								>
									<MapPin className="w-4 h-4" />
									Address *
								</Label>
								<Textarea
									className="min-h-[120px] transition-all duration-200 focus:scale-[1.02]"
									id="clientAddress"
									onChange={(e) =>
										updateField('address', e.target.value)
									}
									placeholder="Enter complete address including street, city, state, and zip code"
									value={clientInfo.address}
								/>
							</div>

							<div className="space-y-2">
								<Label
									className="flex items-center gap-2"
									htmlFor="clientWebsite"
								>
									<Globe className="w-4 h-4" />
									Website
								</Label>
								<Input
									className="transition-all duration-200 focus:scale-[1.02]"
									id="clientWebsite"
									onChange={(e) =>
										updateField('website', e.target.value)
									}
									placeholder="https://example.com"
									value={clientInfo.website || ''}
								/>
							</div>
						</div>
					</div>
				)}

				{/* Existing Client Information Display */}
				{!isNewClient && selectedClientId && (
					<div className="space-y-6">
						<div className="grid md:grid-cols-2 gap-6">
							<div className="space-y-4">
								<div className="p-2 px-4 bg-background rounded-lg border">
									<div className="flex items-center gap-2">
										<User className="w-4 h-4 text-primary" />
										{/* <span className="text-sm font-medium text-muted-foreground">
                      Client Name
                    </span> */}
										<p className="font-semibold">
											{clientInfo.name}
										</p>
									</div>
								</div>

								{clientInfo.email && (
									<div className="p-2 px-4 bg-background rounded-lg border">
										<div className="flex items-center gap-2">
											<Mail className="w-4 h-4 text-primary" />
											{/* <span className="text-sm font-medium text-muted-foreground">Email Address</span> */}
											<p className="font-medium">
												{clientInfo.email}
											</p>
										</div>
									</div>
								)}

								{clientInfo.phone && (
									<div className="p-2 px-4 bg-background rounded-lg border">
										<div className="flex items-center gap-2">
											<Phone className="w-4 h-4 text-primary" />
											{/* <span className="text-sm font-medium text-muted-foreground">Phone Number</span> */}
											<p className="font-medium">
												{clientInfo.phone}
											</p>
										</div>
									</div>
								)}
							</div>

							<div className="space-y-4">
								{clientInfo.address && (
									<div className="p-2 px-4 bg-background rounded-lg border">
										<div className="flex items-center gap-2">
											<MapPin className="w-4 h-4 text-primary" />
											{/* <span className="text-sm font-medium text-muted-foreground">
                        Address
                      </span> */}
											<p className="font-medium whitespace-pre-line">
												{clientInfo.address}
											</p>
										</div>
									</div>
								)}

								{clientInfo.website && (
									<div className="p-2 px-4 bg-background rounded-lg border">
										<div className="flex items-center gap-2">
											<Globe className="w-4 h-4 text-primary" />
											{/* <span className="text-sm font-medium text-muted-foreground">
                        Website
                      </span> */}
											<p className="font-medium">
												<a
													className="text-primary hover:underline"
													href={
														clientInfo.website.startsWith(
															'http',
														)
															? clientInfo.website
															: `https://${clientInfo.website}`
													}
													rel="noopener noreferrer"
													target="_blank"
												>
													{clientInfo.website}
												</a>
											</p>
										</div>
									</div>
								)}

								{clientInfo.tax_number && (
									<div className="p-2 px-4 bg-background rounded-lg border">
										<div className="flex items-center gap-2">
											<FileText className="w-4 h-4 text-primary" />
											{/* <span className="text-sm font-medium text-muted-foreground">
                        Tax Number
                      </span> */}
											<p className="font-medium">
												{clientInfo.tax_number}
											</p>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				)}

				<div className="mt-2 bg-muted/50 rounded-lg">
					<div>
						{!selectedClientId &&  (
							<p className="text-sm text-muted-foreground">
								Please select a client from the dropdown above
								to continue.
							</p>
						)}
						{existingClients.length === 0 &&  (
							<p className="text-sm text-amber-600 mt-2">
								No existing clients found. Please create a new
								client or add clients in the Client Management
								section.
							</p>
						)}
					</div>
				</div>
			</Card>
		</div>
	)
}
