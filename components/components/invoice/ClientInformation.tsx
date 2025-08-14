import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, Phone, MapPin } from "lucide-react";
import { ClientInfo } from "../InvoiceGenerator";

interface ClientInformationProps {
  clientInfo: ClientInfo;
  onClientUpdate: (client: ClientInfo) => void;
}

export const ClientInformation = ({ clientInfo, onClientUpdate }: ClientInformationProps) => {
  const updateField = (field: keyof ClientInfo, value: string) => {
    onClientUpdate({ ...clientInfo, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <User className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Client Information</h2>
        </div>
        <p className="text-muted-foreground">Enter your client's details for the invoice</p>
      </div>

      <Card className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Client Name *
              </Label>
              <Input
                id="clientName"
                placeholder="Enter client or company name"
                value={clientInfo.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="transition-all duration-200 focus:scale-[1.02]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientEmail" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              <Input
                id="clientEmail"
                type="email"
                placeholder="client@example.com"
                value={clientInfo.email || ''}
                onChange={(e) => updateField('email', e.target.value)}
                className="transition-all duration-200 focus:scale-[1.02]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientPhone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </Label>
              <Input
                id="clientPhone"
                placeholder="+1 (555) 123-4567"
                value={clientInfo.phone || ''}
                onChange={(e) => updateField('phone', e.target.value)}
                className="transition-all duration-200 focus:scale-[1.02]"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientAddress" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Address *
              </Label>
              <Textarea
                id="clientAddress"
                placeholder="Enter complete address including street, city, state, and zip code"
                value={clientInfo.address}
                onChange={(e) => updateField('address', e.target.value)}
                className="min-h-[120px] transition-all duration-200 focus:scale-[1.02]"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <span className="text-destructive">*</span> Required fields. Additional contact information helps create more professional invoices.
          </p>
        </div>
      </Card>
    </div>
  );
};