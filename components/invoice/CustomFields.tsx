import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CustomField } from '@/types/settings';
import { CustomFieldValue } from '@/types/invoice';
import { Calendar, Type, Hash, Plus } from 'lucide-react';

interface CustomFieldsProps {
  customFields: CustomField[];
  customFieldValues: CustomFieldValue[];
  onCustomFieldValuesChange: (values: CustomFieldValue[]) => void;
}

export function CustomFields({
  customFields,
  customFieldValues,
  onCustomFieldValuesChange,
}: CustomFieldsProps) {
  const updateFieldValue = (fieldId: string, value: string) => {
    const existingIndex = customFieldValues.findIndex(cfv => cfv.fieldId === fieldId);
    let newValues: CustomFieldValue[];
    
    if (existingIndex >= 0) {
      newValues = [...customFieldValues];
      newValues[existingIndex] = { fieldId, value };
    } else {
      newValues = [...customFieldValues, { fieldId, value }];
    }
    
    onCustomFieldValuesChange(newValues);
  };

  const getFieldValue = (fieldId: string): string => {
    const fieldValue = customFieldValues.find(cfv => cfv.fieldId === fieldId);
    if (fieldValue) return fieldValue.value;
    
    // Return default value if no value set
    const field = customFields.find(cf => cf.id === fieldId);
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

  const getFieldTypeLabel = (type: string) => {
    switch (type) {
      case 'text':
        return 'Text';
      case 'number':
        return 'Number';
      case 'date':
        return 'Date';
      default:
        return 'Text';
    }
  };

  if (customFields.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Custom Fields
          </CardTitle>
          <CardDescription>
            No custom fields configured. You can add custom fields in Settings to collect additional information for your invoices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">
              Configure custom fields in Settings to add additional information to your invoices.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Custom Fields
        </CardTitle>
        <CardDescription>
          Fill in additional information for this invoice. Fields marked with * are required.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {customFields.map((field) => (
          <div key={field.id} className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor={`custom-field-${field.id}`} className="flex items-center gap-2">
                {getFieldIcon(field.type)}
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </Label>
              <Badge variant="outline" className="text-xs">
                {getFieldTypeLabel(field.type)}
              </Badge>
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
        
        {customFields.length > 0 && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> These custom fields will appear on the left side of the totals section in your invoice preview.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
