export interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date';
  required: boolean;
  defaultValue: string;
}

export interface UserSettings {
  id?: string;
  user_id?: string;
  
  // Company/Business Information
  company_name?: string;
  company_email?: string;
  company_phone?: string;
  company_address?: string;
  company_website?: string;
  company_logo?: string;
  
  // Invoice Defaults
  default_theme?: string;
  default_currency?: string;
  default_tax_rate?: number;
  default_payment_terms?: string;
  default_notes?: string;
  
  // Notification Preferences
  email_notifications?: boolean;
  payment_reminders?: boolean;
  invoice_updates?: boolean;
  marketing_emails?: boolean;
  
  // Display Preferences
  date_format?: string;
  number_format?: string;
  timezone?: string;
  language?: string;
  
  // Invoice Numbering
  invoice_prefix?: string;
  invoice_counter?: number;
  invoice_number_format?: string;
  
  // Custom Fields
  custom_fields?: CustomField[];
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
}

export interface SettingsFormData {
  // Company/Business Information
  company_name: string;
  company_email: string;
  company_phone: string;
  company_address: string;
  company_website: string;
  company_logo: string;
  
  // Invoice Defaults
  default_theme: string;
  default_currency: string;
  default_tax_rate: number;
  default_payment_terms: string;
  default_notes: string;
  
  // Notification Preferences
  email_notifications: boolean;
  payment_reminders: boolean;
  invoice_updates: boolean;
  marketing_emails: boolean;
  
  // Display Preferences
  date_format: string;
  number_format: string;
  timezone: string;
  language: string;
  
  // Invoice Numbering
  invoice_prefix: string;
  invoice_counter: number;
  invoice_number_format: string;
  
  // Custom Fields
  custom_fields: CustomField[];
}

export const DEFAULT_SETTINGS: SettingsFormData = {
  // Company/Business Information
  company_name: '',
  company_email: '',
  company_phone: '',
  company_address: '',
  company_website: '',
  company_logo: '',
  
  // Invoice Defaults
  default_theme: 'professional-blue',
  default_currency: 'USD',
  default_tax_rate: 0,
  default_payment_terms: 'Net 30',
  default_notes: '',
  
  // Notification Preferences
  email_notifications: true,
  payment_reminders: true,
  invoice_updates: true,
  marketing_emails: false,
  
  // Display Preferences
  date_format: 'MM/DD/YYYY',
  number_format: 'US',
  timezone: 'UTC',
  language: 'en',
  
  // Invoice Numbering
  invoice_prefix: 'INV',
  invoice_counter: 1,
  invoice_number_format: '{prefix}-{number}',
  
  // Custom Fields
  custom_fields: [],
};

export const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'CAD', label: 'Canadian Dollar (C$)' },
  { value: 'AUD', label: 'Australian Dollar (A$)' },
  { value: 'JPY', label: 'Japanese Yen (¥)' },
];

export const DATE_FORMAT_OPTIONS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (UK)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
  { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY (German)' },
];

export const PAYMENT_TERMS_OPTIONS = [
  { value: 'Due on receipt', label: 'Due on receipt' },
  { value: 'Net 15', label: 'Net 15 days' },
  { value: 'Net 30', label: 'Net 30 days' },
  { value: 'Net 45', label: 'Net 45 days' },
  { value: 'Net 60', label: 'Net 60 days' },
];

export const TIMEZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (US)' },
  { value: 'America/Chicago', label: 'Central Time (US)' },
  { value: 'America/Denver', label: 'Mountain Time (US)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
];
