import { CustomField } from './settings';

export interface InvoiceTheme {
  id: string;
  name: string;
  color: string;
  description: string;
  version: string;
  author: string;
  preview: {
    primary: string;
    secondary: string;
    accent: string;
    headerText?: string;
  };
  styles: {
    primary: string;
    primaryLight: string;
    text: string;
    background: string;
    border: string;
  };
  layout: {
    headerStyle: string;
    footerStyle: string;
    spacing: string;
    typography: {
      headerFont: string;
      bodyFont: string;
      accentFont: string;
    };
  };
  customCSS: string;
}

export interface ClientInfo {
  id?: string;
  name: string;
  address: string;
  email?: string;
  phone?: string;
  tax_number?: string;
  website?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface CustomFieldValue {
  fieldId: string;
  value: string;
  label?: string; // For dynamic fields that don't exist in user settings
}

export interface InvoiceData {
  theme: InvoiceTheme;
  client: ClientInfo;
  items: InvoiceItem[];
  invoiceNumber: string;
  date: string;
  dueDate: string;
  notes?: string;
  currency: string;
  paymentTerms: string;
  taxRate?: number;
  customFields?: CustomFieldValue[];
  dynamicFields?: CustomField[];
}
