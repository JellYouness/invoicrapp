import { InvoiceTheme } from "../types/invoice";

export const classicWhiteTheme: InvoiceTheme = {
  id: "classic-white",
  name: "Classic White",
  color: "gray",
  description: "Clean and timeless with subtle gray accents",
  version: "1.0.0",
  author: "Invoicr",
  preview: {
    primary: "#f9fafb",
    secondary: "#f9fafb",
    accent: "#6b7280",
    headerText: "#6b7280",
  },
  styles: {
    primary: "text-invoice-gray",
    primaryLight: "bg-invoice-gray-light",
    text: "text-invoice-gray",
    background: "bg-invoice-gray-light",
    border: "border-invoice-gray",
  },
  layout: {
    headerStyle: "classic",
    footerStyle: "minimal",
    spacing: "comfortable",
    typography: {
      headerFont: "font-semibold",
      bodyFont: "font-normal",
      accentFont: "font-medium",
    },
  },
  customCSS: `
    .invoice-header-classic-white {
      background: #ffffff;
      color: #111827;
      border-bottom: 2px solid #e5e7eb;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .invoice-section-classic-white {
      border-left: 3px solid #d1d5db;
      padding: 1.5rem;
      margin: 1.5rem 0;
      background: #ffffff;
      border-radius: 0 0.375rem 0.375rem 0;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    
    .invoice-total-classic-white {
      background: #f9fafb;
      border: 2px solid #d1d5db;
      border-radius: 0.5rem;
      padding: 1.5rem;
      color: #111827;
      position: relative;
    }
    
    .invoice-total-classic-white::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #6b7280, #9ca3af, #6b7280);
      border-radius: 0.5rem 0.5rem 0 0;
    }
    
    .invoice-divider-classic-white {
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, #d1d5db 50%, transparent 100%);
      margin: 1.5rem 0;
    }
    
    /* Theme Preview Styles */
    .theme-preview-header-classic-white {
      background: linear-gradient(135deg, #6b7280, #4b5563);
    }
    
    .theme-preview-icon-classic-white {
      background: rgba(255, 255, 255, 0.95);
    }
    
    .theme-preview-bar-classic-white {
      background: linear-gradient(90deg, #6b7280, #9ca3af);
    }
    
    .theme-preview-accent-classic-white {
      background: #6b7280;
    }
    
    .theme-preview-color1-classic-white {
      background: #6b7280;
    }
    
    .theme-preview-color2-classic-white {
      background: #9ca3af;
    }
    
    .theme-preview-color3-classic-white {
      background: #4b5563;
    }
    
    .invoice-table-classic-white {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-collapse: separate;
      border-spacing: 0;
      border-radius: 0.375rem;
      overflow: hidden;
    }
    
    .invoice-table-classic-white th {
      background: #f9fafb;
      color: #374151;
      padding: 0.75rem;
      border-bottom: 1px solid #e5e7eb;
      font-weight: 600;
    }
    
    .invoice-table-classic-white td {
      padding: 0.75rem;
      border-bottom: 1px solid #f3f4f6;
      color: #374151;
    }
    
    .invoice-table-classic-white tr:last-child td {
      border-bottom: none;
    }
    
    .invoice-table-classic-white tr:hover td {
      background: #f9fafb;
    }
    
    .invoice-header-classic-white h1 {
      color: #111827;
      font-weight: 700;
      letter-spacing: -0.025em;
    }
    
    .invoice-header-classic-white h2 {
      color: #374151;
      font-weight: 600;
    }
    
    .invoice-section-classic-white h3 {
      color: #374151;
      font-weight: 600;
      margin-bottom: 0.75rem;
    }
    
    .invoice-total-classic-white .total-amount {
      font-size: 1.25rem;
      font-weight: 700;
      color: #111827;
    }
    
    .invoice-total-classic-white .total-label {
      color: #6b7280;
      font-weight: 500;
    }
  `,
};

export default classicWhiteTheme;
