import { Plus } from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'
import { Label } from 'recharts'
import { Button } from '../ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '../ui/dialog'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
export interface ClientFormData {
	name: string
	address: string
	email: string
	phone: string
	tax_number: string
	website: string
}

interface AddEditClientFormButtonProps {
	isDialogOpen: {
		isDialogOpen: boolean
		isEditing: boolean
	}
	setIsDialogOpen: Dispatch<
		SetStateAction<{
			isDialogOpen: boolean
			isEditing: boolean
		}>
	>
	formData: ClientFormData
	setFormData: React.Dispatch<React.SetStateAction<ClientFormData>>
	isSaving: boolean
	handleSave: () => Promise<void>
	resetForm: () => void
}
export default function AddEditClientFormButton({
	isDialogOpen,
	setIsDialogOpen,
	formData,
	setFormData,
	isSaving,
	handleSave,
	resetForm,
}: AddEditClientFormButtonProps) {
	return (
		<Dialog
			onOpenChange={() =>
				setIsDialogOpen({
					isDialogOpen: !isDialogOpen.isDialogOpen,
					isEditing: false,
				})
			}
			open={isDialogOpen.isDialogOpen}
		>
			<DialogTrigger asChild>
				<Button className="flex items-center gap-2" onClick={resetForm}>
					<Plus className="w-4 h-4" />
					Add Client
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{isDialogOpen.isEditing
							? 'Edit Client'
							: 'Add New Client'}
					</DialogTitle>
					<DialogDescription>
						{isDialogOpen.isEditing
							? 'Update client information'
							: 'Create a new client profile'}
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-4">
					<div>
						<Label htmlFor="name">Name *</Label>
						<Input
							id="name"
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									name: e.target.value,
								}))
							}
							placeholder="Client name"
							value={formData.name}
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										email: e.target.value,
									}))
								}
								placeholder="client@example.com"
								type="email"
								value={formData.email}
							/>
						</div>
						<div>
							<Label htmlFor="phone">Phone</Label>
							<Input
								id="phone"
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										phone: e.target.value,
									}))
								}
								placeholder="+1 (555) 123-4567"
								value={formData.phone}
							/>
						</div>
					</div>

					<div>
						<Label htmlFor="address">Address</Label>
						<Textarea
							id="address"
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									address: e.target.value,
								}))
							}
							placeholder="123 Main Street\nSuite 100\nNew York, NY 10001\nUnited States"
							rows={3}
							value={formData.address}
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label htmlFor="tax_number">Tax Number</Label>
							<Input
								id="tax_number"
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										tax_number: e.target.value,
									}))
								}
								placeholder="Tax ID"
								value={formData.tax_number}
							/>
						</div>
						<div>
							<Label htmlFor="website">Website</Label>
							<Input
								id="website"
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										website: e.target.value,
									}))
								}
								placeholder="https://example.com"
								value={formData.website}
							/>
						</div>
					</div>
				</div>

				<DialogFooter className="gap-2">
					<Button
						onClick={() =>
							setIsDialogOpen({
								isDialogOpen: false,
								isEditing: false,
							})
						}
						variant="outline"
					>
						Cancel
					</Button>
					<Button disabled={isSaving} onClick={handleSave}>
						{isSaving
							? 'Saving...'
							: isDialogOpen.isEditing
								? 'Update'
								: 'Create'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
