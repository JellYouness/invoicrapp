import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, FileText } from "lucide-react";
import { ThemeSelection } from "./invoice/ThemeSelection";
import { ClientInformation } from "./invoice/ClientInformation";
import { InvoiceItems } from "./invoice/InvoiceItems";
import { InvoicePreview } from "./invoice/InvoicePreview";

export interface InvoiceTheme {
  id: string;
  name: string;
  color: string;
  description: string;
}

export interface ClientInfo {
  name: string;
  address: string;
  email?: string;
  phone?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface InvoiceData {
  theme: InvoiceTheme;
  client: ClientInfo;
  items: InvoiceItem[];
  invoiceNumber: string;
  date: string;
  dueDate: string;
}

const steps = [
  { id: 1, title: "Choose Theme", description: "Select your invoice design" },
  { id: 2, title: "Client Info", description: "Add client details" },
  { id: 3, title: "Invoice Items", description: "Add products/services" },
  { id: 4, title: "Preview", description: "Review and generate" }
];

export const InvoiceGenerator = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    theme: { id: "", name: "", color: "", description: "" },
    client: { name: "", address: "" },
    items: [],
    invoiceNumber: `INV-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const updateInvoiceData = (field: keyof InvoiceData, value: any) => {
    setInvoiceData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return invoiceData.theme.id !== "";
      case 2:
        return invoiceData.client.name && invoiceData.client.address;
      case 3:
        return invoiceData.items.length > 0;
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ThemeSelection
            selectedTheme={invoiceData.theme}
            onThemeSelect={(theme) => updateInvoiceData('theme', theme)}
          />
        );
      case 2:
        return (
          <ClientInformation
            clientInfo={invoiceData.client}
            onClientUpdate={(client) => updateInvoiceData('client', client)}
          />
        );
      case 3:
        return (
          <InvoiceItems
            items={invoiceData.items}
            onItemsUpdate={(items) => updateInvoiceData('items', items)}
          />
        );
      case 4:
        return <InvoicePreview invoiceData={invoiceData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Invoice Generator</h1>
          </div>
          <p className="text-muted-foreground">Create professional invoices in minutes</p>
        </div>

        {/* Progress Bar */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-card to-muted/20">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                    currentStep >= step.id
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step.id}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`font-medium ${currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-4 h-0.5 bg-border hidden sm:block" />
                )}
              </div>
            ))}
          </div>
          <Progress value={(currentStep / steps.length) * 100} className="h-2" />
        </Card>

        {/* Step Content */}
        <Card className="p-8 mb-8 shadow-lg">
          {renderStepContent()}
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>
          
          {currentStep < steps.length ? (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="flex items-center gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Generate Invoice
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};