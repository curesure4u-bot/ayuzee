import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Brain } from "lucide-react";
import AIInvoiceScanner, { type ExtractedInvoiceData } from "../ai/AIInvoiceScanner";

interface QuotationLineItem {
  id: string;
  productName: string;
  qty: string;
  punit: string;
  rate: string;
  taxPercent: string;
  taxValue: string;
  discPercent: string;
  mrp: string;
  total: string;
}

const QuotationNew = () => {
  const [items, setItems] = useState<QuotationLineItem[]>([]);
  const [currentItem, setCurrentItem] = useState<QuotationLineItem>({
    id: "", productName: "", qty: "", punit: "", rate: "", taxPercent: "", taxValue: "", discPercent: "", mrp: "", total: "",
  });
  const [supplier, setSupplier] = useState("");
  const [quotationDate, setQuotationDate] = useState("");
  const [quotationValidity, setQuotationValidity] = useState("");
  const [additionalNote, setAdditionalNote] = useState("");
  const [showAIScanner, setShowAIScanner] = useState(false);

  const handleAddItem = () => {
    if (!currentItem.productName) {
      toast.error("Please enter product name");
      return;
    }
    const newItem = { ...currentItem, id: Date.now().toString() };
    setItems([...items, newItem]);
    setCurrentItem({ id: "", productName: "", qty: "", punit: "", rate: "", taxPercent: "", taxValue: "", discPercent: "", mrp: "", total: "" });
    toast.success("Product added to quotation");
  };

  const handleSave = () => {
    if (!supplier) { toast.error("Supplier is required"); return; }
    if (!quotationDate) { toast.error("Quotation date is required"); return; }
    if (items.length === 0) { toast.error("Please add at least one product"); return; }
    toast.success("Quotation saved successfully");
  };

  const handleAIExtracted = (data: ExtractedInvoiceData) => {
    // Auto-fill items from AI scan
    const newItems: QuotationLineItem[] = data.products.map((p, idx) => ({
      id: `ai-${Date.now()}-${idx}`,
      productName: p.name,
      qty: p.qty.toString(),
      punit: "",
      rate: p.rate.toString(),
      taxPercent: p.taxPercent.toString(),
      taxValue: ((p.rate * p.qty * p.taxPercent) / 100).toFixed(2),
      discPercent: p.discPercent.toString(),
      mrp: p.mrp.toString(),
      total: p.total.toString(),
    }));
    setItems([...items, ...newItems]);
    if (data.supplier.invoiceDate) setQuotationDate(data.supplier.invoiceDate);
    toast.success(`AI added ${data.products.length} products from scanned invoice`);
    setShowAIScanner(false);
  };

  return (
    <div className="space-y-4">
      {/* Sub Navigation */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">New</Button>
        <Link to="/hms/stock/purchase/quotation/manage">
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Manage Quotation</Button>
        </Link>
        <Link to="/hms/stock/purchase/quotation/inactive">
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Manage Inactive Quotation</Button>
        </Link>
        <Link to="/hms/stock/purchase/quotation/find">
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Find Quotation By Product</Button>
        </Link>
        <Button size="sm" variant="outline" className="ml-auto bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100" onClick={() => setShowAIScanner(!showAIScanner)}>
          <Brain className="mr-1 h-4 w-4" /> {showAIScanner ? "Hide Scanner" : "AI Scan Quotation"}
        </Button>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600">Quotation</h2>
      </div>

      {/* AI Invoice Scanner */}
      {showAIScanner && (
        <AIInvoiceScanner onExtracted={handleAIExtracted} context="quotation" />
      )}

      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Add Products Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Add Products</h3>
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs">
                <Plus className="mr-1 h-3 w-3" /> Add New Product
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-2 py-2 text-left font-semibold text-orange-600">Product Name</th>
                    <th className="px-2 py-2 text-left font-semibold text-orange-600">Qty</th>
                    <th className="px-2 py-2 text-left font-semibold text-orange-600">Punit</th>
                    <th className="px-2 py-2 text-left font-semibold text-orange-600">Rate</th>
                    <th className="px-2 py-2 text-left font-semibold text-orange-600">Tax (%)</th>
                    <th className="px-2 py-2 text-left font-semibold text-orange-600">Tax</th>
                    <th className="px-2 py-2 text-left font-semibold text-orange-600">Disc (%)</th>
                    <th className="px-2 py-2 text-left font-semibold text-orange-600">MRP</th>
                    <th className="px-2 py-2 text-left font-semibold text-orange-600">Total</th>
                    <th className="px-2 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="px-2 py-1">{item.productName}</td>
                      <td className="px-2 py-1">{item.qty}</td>
                      <td className="px-2 py-1">{item.punit}</td>
                      <td className="px-2 py-1">{item.rate}</td>
                      <td className="px-2 py-1">{item.taxPercent}</td>
                      <td className="px-2 py-1">{item.taxValue}</td>
                      <td className="px-2 py-1">{item.discPercent}</td>
                      <td className="px-2 py-1">{item.mrp}</td>
                      <td className="px-2 py-1">{item.total}</td>
                      <td className="px-2 py-1">
                        <Button variant="ghost" size="sm" className="text-red-500 h-6 text-xs" onClick={() => setItems(items.filter(i => i.id !== item.id))}>x</Button>
                      </td>
                    </tr>
                  ))}
                  {/* Input row */}
                  <tr className="border-b bg-gray-50">
                    <td className="px-1 py-1"><Input className="h-7 text-xs" placeholder="Product Name" value={currentItem.productName} onChange={(e) => setCurrentItem({...currentItem, productName: e.target.value})} /></td>
                    <td className="px-1 py-1"><Input className="h-7 text-xs w-14" placeholder="Qty" value={currentItem.qty} onChange={(e) => setCurrentItem({...currentItem, qty: e.target.value})} /></td>
                    <td className="px-1 py-1"><Input className="h-7 text-xs w-14" placeholder="Punit" value={currentItem.punit} onChange={(e) => setCurrentItem({...currentItem, punit: e.target.value})} /></td>
                    <td className="px-1 py-1"><Input className="h-7 text-xs w-20" placeholder="Purchase Price" value={currentItem.rate} onChange={(e) => setCurrentItem({...currentItem, rate: e.target.value})} /></td>
                    <td className="px-1 py-1">
                      <Select value={currentItem.taxPercent} onValueChange={(v) => setCurrentItem({...currentItem, taxPercent: v})}>
                        <SelectTrigger className="h-7 text-xs w-16"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0%</SelectItem>
                          <SelectItem value="5">5%</SelectItem>
                          <SelectItem value="12">12%</SelectItem>
                          <SelectItem value="18">18%</SelectItem>
                          <SelectItem value="28">28%</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-1 py-1"><Input className="h-7 text-xs w-16" placeholder="Tax Value" value={currentItem.taxValue} readOnly /></td>
                    <td className="px-1 py-1"><Input className="h-7 text-xs w-16" placeholder="Discount" value={currentItem.discPercent} onChange={(e) => setCurrentItem({...currentItem, discPercent: e.target.value})} /></td>
                    <td className="px-1 py-1"><Input className="h-7 text-xs w-16" placeholder="MRP" value={currentItem.mrp} onChange={(e) => setCurrentItem({...currentItem, mrp: e.target.value})} /></td>
                    <td className="px-1 py-1"><Input className="h-7 text-xs w-16" placeholder="Total" value={currentItem.total} readOnly /></td>
                    <td className="px-1 py-1">
                      <Button size="sm" className="h-7 bg-blue-600 hover:bg-blue-700 text-xs" onClick={handleAddItem}>Add</Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Supplier, Date, Validity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <Label className="text-sm font-semibold">Supplier <span className="text-red-500">*</span></Label>
              <Select value={supplier} onValueChange={setSupplier}>
                <SelectTrigger><SelectValue placeholder="" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="skm">skm siddha and ayrvedha;erode;lk;Erode;0</SelectItem>
                  <SelectItem value="rajah">RAJAH HEALTHY ACRES P LTD</SelectItem>
                  <SelectItem value="avm">AVM HOMOEO AGENCIES</SelectItem>
                  <SelectItem value="rich">RICH HERBALS</SelectItem>
                  <SelectItem value="siddhasramam">SIDDHASRAMAM SIVANANANDA VIJAYAM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold">Quotation Date <span className="text-red-500">*</span></Label>
              <Input type="date" value={quotationDate} onChange={(e) => setQuotationDate(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-semibold">Quotation Validity</Label>
              <Input type="date" value={quotationValidity} onChange={(e) => setQuotationValidity(e.target.value)} />
            </div>
          </div>

          {/* Additional Note */}
          <div>
            <Label className="text-sm font-semibold">Additional Note:</Label>
            <Textarea value={additionalNote} onChange={(e) => setAdditionalNote(e.target.value)} rows={3} />
          </div>

          {/* Save */}
          <div className="text-center">
            <Button onClick={handleSave} className="bg-orange-600 hover:bg-orange-700 px-8">Save</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuotationNew;
