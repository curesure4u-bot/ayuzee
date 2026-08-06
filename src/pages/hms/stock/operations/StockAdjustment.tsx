import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ScanLine } from "lucide-react";
import QRBarcodeScanner, { type ScannedProductResult } from "../ai/QRBarcodeScanner";

const StockAdjustment = () => {
  const [location, setLocation] = useState("loc1");
  const [store, setStore] = useState("alshifa");
  const [productName, setProductName] = useState("");
  const [currentStock, setCurrentStock] = useState("");
  const [batch, setBatch] = useState("");
  const [expiry, setExpiry] = useState("");
  const [punit, setPunit] = useState("");
  const [qty, setQty] = useState("");
  const [rate, setRate] = useState("");
  const [mrp, setMrp] = useState("");
  const [maxSalesDisc, setMaxSalesDisc] = useState("");
  const [taxPercent, setTaxPercent] = useState("");
  const [reason, setReason] = useState("");
  const [showQRScanner, setShowQRScanner] = useState(false);

  const handleQRScanned = (result: ScannedProductResult) => {
    setProductName(result.name);
    setBatch(result.batch);
    setExpiry(result.expiry);
    setMrp(result.mrp.toString());
    setShowQRScanner(false);
    toast.success(`QR scanned: ${result.name}`);
  };

  const handleSave = () => {
    if (!productName) { toast.error("Product name is required"); return; }
    if (!qty) { toast.error("Quantity is required"); return; }
    if (!reason) { toast.error("Reason is required"); return; }
    toast.success("Stock adjustment saved successfully");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">Stock Adjustment</Button>
        <Button size="sm" variant="outline" className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100" onClick={() => setShowQRScanner(!showQRScanner)}>
          <ScanLine className="mr-1 h-4 w-4" /> {showQRScanner ? "Hide Scanner" : "QR/Barcode Scan"}
        </Button>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600">Stock Adjustment</h2>
      </div>

      {/* QR Scanner */}
      {showQRScanner && (
        <QRBarcodeScanner onScanned={handleQRScanned} context="adjustment" />
      )}

      <Card>
        <CardContent className="p-6 space-y-4">
          {/* Location & Store */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-semibold">Location</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold">Store</Label>
              <Select value={store} onValueChange={setStore}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="alshifa">ALSHIFA PHARMACY</SelectItem>
                  <SelectItem value="ip">IP Pharmacy Store</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold">Name</Label>
              <Input placeholder="Product Name" value={productName} onChange={(e) => setProductName(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-semibold">Stock</Label>
              <Input placeholder="Current Stock" value={currentStock} readOnly className="bg-gray-50" />
            </div>
          </div>

          {/* Batch, Expiry, Punit, Qty */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-semibold">Batch</Label>
              <Input placeholder="Batch" value={batch} onChange={(e) => setBatch(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-semibold">Expiry</Label>
              <Input placeholder="Expiry" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-semibold">Punit</Label>
              <Input placeholder="Punit" value={punit} onChange={(e) => setPunit(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-semibold">Qty</Label>
              <Input placeholder="Qty" value={qty} onChange={(e) => setQty(e.target.value)} />
            </div>
          </div>

          {/* Rate, MRP, Max Sales Disc, Tax */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-semibold">Rate</Label>
              <Input placeholder="Rate" value={rate} onChange={(e) => setRate(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-semibold">MRP</Label>
              <Input placeholder="MRP" value={mrp} onChange={(e) => setMrp(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-semibold">Max Sales Dis(%)</Label>
              <Input placeholder="" value={maxSalesDisc} onChange={(e) => setMaxSalesDisc(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-semibold">Tax(%)</Label>
              <Select value={taxPercent} onValueChange={setTaxPercent}>
                <SelectTrigger><SelectValue placeholder="" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0%</SelectItem>
                  <SelectItem value="5">5%</SelectItem>
                  <SelectItem value="12">12%</SelectItem>
                  <SelectItem value="18">18%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reason */}
          <div>
            <Label className="text-sm font-semibold">Reason</Label>
            <Input placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>

          <div className="text-center pt-2">
            <Button onClick={handleSave} className="bg-orange-600 hover:bg-orange-700 px-8">Save</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockAdjustment;
