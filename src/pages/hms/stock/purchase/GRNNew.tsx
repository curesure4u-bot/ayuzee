import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Brain, ScanLine } from "lucide-react";
import AIInvoiceScanner, { type ExtractedInvoiceData } from "../ai/AIInvoiceScanner";

const GRNNew = () => {
  const [location, setLocation] = useState("loc1");
  const [supplier, setSupplier] = useState("");
  const [store, setStore] = useState("");
  const [showAIScanner, setShowAIScanner] = useState(false);
  const [invoiceData, setInvoiceData] = useState<ExtractedInvoiceData | null>(null);

  const handleSave = () => {
    if (!supplier) { toast.error("Supplier is required"); return; }
    if (!store) { toast.error("Store is required"); return; }
    toast.success("GRN created - add products in next screen");
  };

  const handleAIExtracted = (data: ExtractedInvoiceData) => {
    setInvoiceData(data);
    // Auto-fill supplier from AI extraction
    if (data.supplier.name.includes("KOTTAKKAL")) setSupplier("kottakkal");
    else if (data.supplier.name.includes("RAJAH")) setSupplier("rajah");
    else if (data.supplier.name.includes("AVM")) setSupplier("avm");
    else setSupplier("skm");

    // Auto-select store
    if (!store) setStore("alshifa");

    toast.success(`AI auto-filled: ${data.supplier.name} | ${data.products.length} products | Invoice: ${data.supplier.invoiceNo}`);
    setShowAIScanner(false);
  };

  return (
    <div className="space-y-4">
      {/* Sub Navigation */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">New</Button>
        <Link to="/hms/stock/purchase/grn/manage">
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Manage GRN</Button>
        </Link>
        <Link to="/hms/stock/purchase/grn/drafts">
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Manage GRN Drafts</Button>
        </Link>
        <Button size="sm" variant="outline" className="ml-auto bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100" onClick={() => setShowAIScanner(!showAIScanner)}>
          <Brain className="mr-1 h-4 w-4" /> {showAIScanner ? "Hide AI Scanner" : "AI Scan Invoice"}
        </Button>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600">GRN</h2>
      </div>

      {/* AI Invoice Scanner */}
      {showAIScanner && (
        <AIInvoiceScanner onExtracted={handleAIExtracted} context="grn" />
      )}

      {/* AI Auto-filled notice */}
      {invoiceData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700 flex items-center gap-2">
          <ScanLine className="h-4 w-4" />
          AI auto-filled from invoice <strong>{invoiceData.supplier.invoiceNo}</strong>: {invoiceData.products.length} products, Total: ₹{invoiceData.totals.grandTotal.toLocaleString()}
        </div>
      )}

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="max-w-lg mx-auto space-y-4">
            <div>
              <Label className="text-sm font-semibold">Location * :</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem>
                  <SelectItem value="loc2">PACR SALAI, Rajapalayam</SelectItem>
                  <SelectItem value="loc3">Old GH Road, Theni</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold">Supplier * :</Label>
              <Select value={supplier} onValueChange={setSupplier}>
                <SelectTrigger><SelectValue placeholder="" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="skm">skm siddha and ayrvedha ,erode ,lk ,Erode ,0</SelectItem>
                  <SelectItem value="rajah">RAJAH HEALTHY ACRES P LTD</SelectItem>
                  <SelectItem value="avm">AVM HOMOEO AGENCIES</SelectItem>
                  <SelectItem value="rich">RICH HERBALS</SelectItem>
                  <SelectItem value="kottakkal">KOTTAKKAL ARYA VAIDYA SALA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold">Store * :</Label>
              <Select value={store} onValueChange={setStore}>
                <SelectTrigger><SelectValue placeholder="" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="alshifa">ALSHIFA PHARMACY</SelectItem>
                  <SelectItem value="ip">IP Pharmacy Store</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-center pt-4">
              <Button onClick={handleSave} className="bg-orange-600 hover:bg-orange-700 px-8">Save</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GRNNew;
