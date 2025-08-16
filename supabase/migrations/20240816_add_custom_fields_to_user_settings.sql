-- Add custom fields support to user_settings table
ALTER TABLE user_settings 
ADD COLUMN custom_fields JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN user_settings.custom_fields IS 'JSON array of custom fields with structure: [{"id": "uuid", "label": "Field Name", "type": "text|number|date", "required": false, "defaultValue": ""}]';
