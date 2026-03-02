import { Calendar, Hash, Plus, Type, X } from 'lucide-react'
import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import type { CustomFieldValue } from '@/types/invoice'
import type { CustomField } from '@/types/settings'

interface CustomFieldsProps {
	customFields: CustomField[]
	customFieldValues: CustomFieldValue[]
	onCustomFieldValuesChange: (values: CustomFieldValue[]) => void
	dynamicFields: CustomField[]
	onDynamicFieldsChange: (fields: CustomField[]) => void
}

interface DynamicCustomField extends CustomField {
	isDynamic?: boolean
}

export function CustomFields({
	customFields,
	customFieldValues,
	onCustomFieldValuesChange,
	dynamicFields,
	onDynamicFieldsChange,
}: CustomFieldsProps) {
	const [isAddingField, setIsAddingField] = useState(false)
	const [newField, setNewField] = useState({
		label: '',
		type: 'text' as 'text' | 'number' | 'date',
		required: false,
		defaultValue: '',
	})

	// Combine pre-configured and dynamic fields
	const allFields: DynamicCustomField[] = [
		...(customFields || []).map((field) => ({ ...field, isDynamic: false })),
		...(dynamicFields || []).map((field) => ({ ...field, isDynamic: true })),
	]

	// Initialize all fields in customFieldValues when fields change
	React.useEffect(() => {
		const existingFieldIds = customFieldValues.map((cfv) => cfv.fieldId)
		const missingFields = allFields.filter(
			(field) => !existingFieldIds.includes(field.id),
		)

		if (missingFields.length > 0) {
			const newFieldValues: CustomFieldValue[] = missingFields.map(
				(field) => ({
					fieldId: field.id,
					value: field.defaultValue || '',
					label: field.label,
				}),
			)

			onCustomFieldValuesChange([...customFieldValues, ...newFieldValues])
		}
	}, [allFields, customFieldValues, onCustomFieldValuesChange])

	const updateFieldValue = (fieldId: string, value: string) => {
		const existingIndex = customFieldValues.findIndex(
			(cfv) => cfv.fieldId === fieldId,
		)
		let newValues: CustomFieldValue[]

		// Find the field definition to get the label
		const field = allFields.find((f) => f.id === fieldId)
		const fieldValue: CustomFieldValue = {
			fieldId,
			value,
			label: field?.label, // Include label for dynamic fields
		}

		if (existingIndex >= 0) {
			newValues = [...customFieldValues]
			newValues[existingIndex] = fieldValue
		} else {
			newValues = [...customFieldValues, fieldValue]
		}

		onCustomFieldValuesChange(newValues)
	}

	const getFieldValue = (fieldId: string): string => {
		const fieldValue = customFieldValues.find(
			(cfv) => cfv.fieldId === fieldId,
		)
		if (fieldValue) return fieldValue.value

		// Return default value if no value set
		const field = allFields.find((cf) => cf.id === fieldId)
		return field?.defaultValue || ''
	}

	const getFieldIcon = (type: string) => {
		switch (type) {
			case 'text':
				return <Type className="h-4 w-4" />
			case 'number':
				return <Hash className="h-4 w-4" />
			case 'date':
				return <Calendar className="h-4 w-4" />
			default:
				return <Type className="h-4 w-4" />
		}
	}

	const handleAddField = () => {
		if (!newField.label.trim()) return

		const dynamicField: CustomField = {
			id: `dynamic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			label: newField.label.trim(),
			type: newField.type,
			required: newField.required,
			defaultValue: newField.defaultValue,
		}

		onDynamicFieldsChange([...dynamicFields, dynamicField])

		// Reset form
		setNewField({
			label: '',
			type: 'text',
			required: false,
			defaultValue: '',
		})
		setIsAddingField(false)
	}

	const handleRemoveField = (fieldId: string) => {
		// Remove from dynamic fields
		const updatedDynamicFields = dynamicFields.filter(
			(field) => field.id !== fieldId,
		)
		onDynamicFieldsChange(updatedDynamicFields)

		// Remove any values for this field
		const updatedValues = customFieldValues.filter(
			(cfv) => cfv.fieldId !== fieldId,
		)
		onCustomFieldValuesChange(updatedValues)
	}

	const handleCancelAdd = () => {
		setNewField({
			label: '',
			type: 'text',
			required: false,
			defaultValue: '',
		})
		setIsAddingField(false)
	}

	return (
		<Card className="bg-muted/70 h-full">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Plus className="h-5 w-5" />
					Custom Fields
				</CardTitle>
				<CardDescription>
					You can add additioanl information from the settings.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4 h-[65%] lg:h-[75%] overflow-y-auto">
				{/* Existing fields */}
				{allFields.map((field) => (
					<div className="space-y-2" key={field.id}>
						<div className="flex items-center justify-between">
							<Label
								className="flex items-center gap-2"
								htmlFor={`custom-field-${field.id}`}
							>
								{getFieldIcon(field.type)}
								{field.label}
								{field.required && (
									<span className="text-red-500">*</span>
								)}
							</Label>
							<div className="flex items-center gap-2">
								<Badge className="text-xs" variant="outline">
									{field.type}
								</Badge>
								{field.isDynamic && (
									<Button
										className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
										onClick={() =>
											handleRemoveField(field.id)
										}
										size="sm"
										type="button"
										variant="ghost"
									>
										<X className="h-3 w-3" />
									</Button>
								)}
							</div>
						</div>
						<Input
							className="w-full"
							id={`custom-field-${field.id}`}
							onChange={(e) =>
								updateFieldValue(field.id, e.target.value)
							}
							placeholder={
								field.defaultValue ||
								`Enter ${field.label.toLowerCase()}`
							}
							required={field.required}
							type={
								field.type === 'number'
									? 'number'
									: field.type === 'date'
										? 'date'
										: 'text'
							}
							value={getFieldValue(field.id)}
						/>
					</div>
				))}

				{/* Add new field form */}
				{isAddingField && (
					<div className="space-y-4 p-4 border rounded-lg bg-muted/20">
						<div className="flex items-center justify-between">
							<h4 className="font-medium text-sm">
								Add New Field
							</h4>
							<Button
								className="h-6 w-6 p-0"
								onClick={handleCancelAdd}
								size="sm"
								type="button"
								variant="ghost"
							>
								<X className="h-3 w-3" />
							</Button>
						</div>

						<div className="space-y-3">
							<div>
								<Label
									className="text-sm"
									htmlFor="new-field-label"
								>
									Field Label
								</Label>
								<Input
									className="mt-1"
									id="new-field-label"
									onChange={(e) =>
										setNewField((prev) => ({
											...prev,
											label: e.target.value,
										}))
									}
									placeholder="e.g., Project Code"
									value={newField.label}
								/>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div>
									<Label
										className="text-sm"
										htmlFor="new-field-type"
									>
										Type
									</Label>
									<Select
										onValueChange={(
											value: 'text' | 'number' | 'date',
										) =>
											setNewField((prev) => ({
												...prev,
												type: value,
											}))
										}
										value={newField.type}
									>
										<SelectTrigger className="mt-1">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="text">
												Text
											</SelectItem>
											<SelectItem value="number">
												Number
											</SelectItem>
											<SelectItem value="date">
												Date
											</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label
										className="text-sm"
										htmlFor="new-field-default"
									>
										Value
									</Label>
									<Input
										className="mt-1"
										id="new-field-default"
										onChange={(e) =>
											setNewField((prev) => ({
												...prev,
												defaultValue: e.target.value,
											}))
										}
										placeholder="Optional"
										value={newField.defaultValue}
									/>
								</div>
							</div>

							<div className="flex items-center justify-end">
								<Button
									disabled={!newField.label.trim()}
									onClick={handleAddField}
									size="sm"
									type="button"
								>
									Add Field
								</Button>
							</div>
						</div>
					</div>
				)}

				{/* Empty state */}
				{allFields.length === 0 && !isAddingField && (
					<div className="flex flex-col items-center py-6 text-muted-foreground">
						<Plus className="h-8 w-8 mx-auto mb-3 opacity-50" />
						<p className="text-sm mb-3">No custom fields yet</p>
						<Button
							className="flex items-center gap-2"
							onClick={() => setIsAddingField(true)}
							type="button"
							variant="outline"
						>
							<Plus className="h-4 w-4" />
							Add Your First Field
						</Button>
					</div>
				)}

				{/* Add field button when fields exist */}
				{allFields.length > 0 && !isAddingField && (
					<Button
						className="w-full flex items-center gap-2"
						onClick={() => setIsAddingField(true)}
						type="button"
						variant="outline"
					>
						<Plus className="h-4 w-4" />
						Add Another Field
					</Button>
				)}

				{/* Info tip */}
				{allFields.length > 0 && (
					<div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded">
						Custom fields will appear in your invoice preview
					</div>
				)}
			</CardContent>
		</Card>
	)
}
