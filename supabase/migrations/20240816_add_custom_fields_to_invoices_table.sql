-- Add custom fields support to invoices table
ALTER TABLE invoices 
ADD COLUMN custom_fields JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN invoices.custom_fields IS 'JSON array of custom field values with structure: [{"fieldId": "uuid", "value": "string"}]';
