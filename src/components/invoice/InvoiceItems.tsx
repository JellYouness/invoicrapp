import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Package, Calculator } from "lucide-react";
import { InvoiceItem } from "../InvoiceGenerator";

interface InvoiceItemsProps {
  items: InvoiceItem[];
  onItemsUpdate: (items: InvoiceItem[]) => void;
}

export const InvoiceItems = ({ items, onItemsUpdate }: InvoiceItemsProps) => {
  const [newItem, setNewItem] = useState<Omit<InvoiceItem, 'id'>>({
    description: '',
    quantity: 1,
    price: 0
  });

  const addItem = () => {
    if (newItem.description.trim()) {
      const item: InvoiceItem = {
        ...newItem,
        id: Date.now().toString()
      };
      onItemsUpdate([...items, item]);
      setNewItem({ description: '', quantity: 1, price: 0 });
    }
  };

  const removeItem = (id: string) => {
    onItemsUpdate(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof Omit<InvoiceItem, 'id'>, value: string | number) => {
    onItemsUpdate(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal(); // Can add tax calculation here later
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Package className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Invoice Items</h2>
        </div>
        <p className="text-muted-foreground">Add products or services to your invoice</p>
      </div>

      {/* Add New Item */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Item
        </h3>
        
        <div className="grid md:grid-cols-12 gap-4">
          <div className="md:col-span-6">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the product or service"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              className="mt-1 min-h-[80px]"
            />
          </div>
          
          <div className="md:col-span-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
              className="mt-1"
            />
          </div>
          
          <div className="md:col-span-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
              className="mt-1"
            />
          </div>
          
          <div className="md:col-span-2 flex items-end">
            <Button 
              onClick={addItem} 
              className="w-full"
              disabled={!newItem.description.trim()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </div>
      </Card>

      {/* Items List */}
      {items.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Invoice Items</h3>
          
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex-1">
                  <Textarea
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    className="min-h-[60px] bg-background"
                  />
                </div>
                
                <div className="w-20">
                  <Label className="text-xs">Qty</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                    className="bg-background"
                  />
                </div>
                
                <div className="w-24">
                  <Label className="text-xs">Price</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                    className="bg-background"
                  />
                </div>
                
                <div className="w-24 text-right">
                  <Label className="text-xs">Total</Label>
                  <p className="font-semibold text-lg">
                    ${(item.quantity * item.price).toFixed(2)}
                  </p>
                </div>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeItem(item.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-semibold">${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                  <span className="flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    Total:
                  </span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {items.length === 0 && (
        <Card className="p-8 text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No items added yet. Add your first item above to get started.</p>
        </Card>
      )}
    </div>
  );
};