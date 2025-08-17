import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomField } from '@/types/settings';
import { CustomFieldValue } from '@/types/invoice';
import { Calendar, Type, Hash, Plus, X } from 'lucide-react';

interface CustomFieldsProps {
  customFields: CustomField[];
  customFieldValues: CustomFieldValue[];
  onCustomFieldValuesChange: (values: CustomFieldValue[]) => void;
  dynamicFields: CustomField[];
  onDynamicFieldsChange: (fields: CustomField[]) => void;
}

interface DynamicCustomField extends CustomField {
  isDynamic?: boolean;
}

export function CustomFields({
  customFields,
  customFieldValues,
  onCustomFieldValuesChange,
  dynamicFields,
  onDynamicFieldsChange,
}: CustomFieldsProps) {
  const [isAddingField, setIsAddingField] = useState(false);
  const [newField, setNewField] = useState({
    label: '',
    type: 'text' as 'text' | 'number' | 'date',
    required: false,
    defaultValue: ''
  });

  // Combine pre-configured and dynamic fields
  const allFields: DynamicCustomField[] = [
    ...customFields.map(field => ({ ...field, isDynamic: false })),
    ...dynamicFields.map(field => ({ ...field, isDynamic: true }))
  ];

  // Initialize all fields in customFieldValues when fields change
  React.useEffect(() => {
    const existingFieldIds = customFieldValues.map(cfv => cfv.fieldId);
    const missingFields = allFields.filter(field => !existingFieldIds.includes(field.id));
    
    if (missingFields.length > 0) {
      const newFieldValues: CustomFieldValue[] = missingFields.map(field => ({
        fieldId: field.id,
        value: field.defaultValue || '',
        label: field.label
      }));
      
      onCustomFieldValuesChange([...customFieldValues, ...newFieldValues]);
    }
  }, [allFields, customFieldValues, onCustomFieldValuesChange]);

  const updateFieldValue = (fieldId: string, value: string) => {
    const existingIndex = customFieldValues.findIndex(cfv => cfv.fieldId === fieldId);
    let newValues: CustomFieldValue[];
    
    // Find the field definition to get the label
    const field = allFields.find(f => f.id === fieldId);
    const fieldValue: CustomFieldValue = { 
      fieldId, 
      value,
      label: field?.label // Include label for dynamic fields
    };
    
    if (existingIndex >= 0) {
      newValues = [...customFieldValues];
      newValues[existingIndex] = fieldValue;
    } else {
      newValues = [...customFieldValues, fieldValue];
    }
    
    onCustomFieldValuesChange(newValues);
  };

  const getFieldValue = (fieldId: string): string => {
    const fieldValue = customFieldValues.find(cfv => cfv.fieldId === fieldId);
    if (fieldValue) return fieldValue.value;
    
    // Return default value if no value set
    const field = allFields.find(cf => cf.id === fieldId);
    return field?.defaultValue || '';
  };

  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <Type className="h-4 w-4" />;
      case 'number':
        return <Hash className="h-4 w-4" />;
      case 'date':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Type className="h-4 w-4" />;
    }
  };

  const handleAddField = () => {
    if (!newField.label.trim()) return;

    const dynamicField: CustomField = {
      id: `dynamic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      label: newField.label.trim(),
      type: newField.type,
      required: newField.required,
      defaultValue: newField.defaultValue
    };

    onDynamicFieldsChange([...dynamicFields, dynamicField]);
    
    // Reset form
    setNewField({
      label: '',
      type: 'text',
      required: false,
      defaultValue: ''
    });
    setIsAddingField(false);
  };

  const handleRemoveField = (fieldId: string) => {
    // Remove from dynamic fields
    const updatedDynamicFields = dynamicFields.filter(field => field.id !== fieldId);
    onDynamicFieldsChange(updatedDynamicFields);
    
    // Remove any values for this field
    const updatedValues = customFieldValues.filter(cfv => cfv.fieldId !== fieldId);
    onCustomFieldValuesChange(updatedValues);
  };

  const handleCancelAdd = () => {
    setNewField({
      label: '',
      type: 'text',
      required: false,
      defaultValue: ''
    });
    setIsAddingField(false);
  };

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
          <div key={field.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={`custom-field-${field.id}`} className="flex items-center gap-2">
                {getFieldIcon(field.type)}
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {field.type}
                </Badge>
                {field.isDynamic && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveField(field.id)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            <Input
              id={`custom-field-${field.id}`}
              type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
              value={getFieldValue(field.id)}
              onChange={(e) => updateFieldValue(field.id, e.target.value)}
              placeholder={field.defaultValue || `Enter ${field.label.toLowerCase()}`}
              required={field.required}
              className="w-full"
            />
          </div>
        ))}

        {/* Add new field form */}
        {isAddingField && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Add New Field</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancelAdd}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="new-field-label" className="text-sm">Field Label</Label>
                <Input
                  id="new-field-label"
                  value={newField.label}
                  onChange={(e) => setNewField(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="e.g., Project Code"
                  className="mt-1"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="new-field-type" className="text-sm">Type</Label>
                  <Select
                    value={newField.type}
                    onValueChange={(value: 'text' | 'number' | 'date') => 
                      setNewField(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="new-field-default" className="text-sm">Value</Label>
                  <Input
                    id="new-field-default"
                    value={newField.defaultValue}
                    onChange={(e) => setNewField(prev => ({ ...prev, defaultValue: e.target.value }))}
                    placeholder="Optional"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end">                
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddField}
                  disabled={!newField.label.trim()}
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
              type="button"
              variant="outline"
              onClick={() => setIsAddingField(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Your First Field
            </Button>
          </div>
        )}

        {/* Add field button when fields exist */}
        {allFields.length > 0 && !isAddingField && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsAddingField(true)}
            className="w-full flex items-center gap-2"
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
  );
}
