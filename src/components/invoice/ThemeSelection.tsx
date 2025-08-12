import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Palette } from "lucide-react";
import { InvoiceTheme } from "../InvoiceGenerator";

interface ThemeSelectionProps {
  selectedTheme: InvoiceTheme;
  onThemeSelect: (theme: InvoiceTheme) => void;
}

const themes: InvoiceTheme[] = [
  {
    id: "professional-blue",
    name: "Professional Blue",
    color: "blue",
    description: "Clean and modern with blue accents"
  },
  {
    id: "elegant-green",
    name: "Elegant Green",
    color: "green",
    description: "Sophisticated with green highlights"
  },
  {
    id: "creative-purple",
    name: "Creative Purple",
    color: "purple",
    description: "Bold and creative with purple theme"
  }
];

export const ThemeSelection = ({ selectedTheme, onThemeSelect }: ThemeSelectionProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Palette className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Choose Your Invoice Theme</h2>
        </div>
        <p className="text-muted-foreground">Select a professional design for your invoices</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {themes.map((theme) => (
          <Card
            key={theme.id}
            className={`relative p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
              selectedTheme.id === theme.id
                ? 'ring-2 ring-primary shadow-lg scale-105'
                : 'hover:shadow-md'
            }`}
            onClick={() => onThemeSelect(theme)}
          >
            {selectedTheme.id === theme.id && (
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
            
            <div className="text-center space-y-4">
              <div className={`w-16 h-16 mx-auto rounded-lg flex items-center justify-center ${
                theme.color === 'blue' ? 'bg-invoice-blue-light' :
                theme.color === 'green' ? 'bg-invoice-green-light' :
                'bg-invoice-purple-light'
              }`}>
                <div className={`w-8 h-8 rounded ${
                  theme.color === 'blue' ? 'bg-invoice-blue' :
                  theme.color === 'green' ? 'bg-invoice-green' :
                  'bg-invoice-purple'
                }`} />
              </div>
              
              <div>
                <h3 className="font-semibold text-lg">{theme.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{theme.description}</p>
              </div>
              
              <div className="space-y-2">
                <div className={`h-3 rounded ${
                  theme.color === 'blue' ? 'bg-invoice-blue-light' :
                  theme.color === 'green' ? 'bg-invoice-green-light' :
                  'bg-invoice-purple-light'
                }`} />
                <div className="flex gap-1">
                  <div className="h-2 bg-muted rounded flex-1" />
                  <div className="h-2 bg-muted rounded flex-1" />
                  <div className="h-2 bg-muted rounded flex-1" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};