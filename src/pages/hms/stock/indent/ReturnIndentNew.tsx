import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const mockStockItems = [
  { sNo: 1, store: "ALSHIFA PHARMACY", name: "AAVARAI KUDINEER 50GM", pharmName: "ALSHIFA", mfr: "", category: "OTC", batch: "3078", expiry: "08/26", purchasePrice: 45.50, mrp: 65.00, qty: 0.5, qtyPerUnit: 0.50 },
  { sNo: 2, store: "ALSHIFA PHARMACY", name: "FIVE PHOS 6X TAB 450GM", pharmName: "", mfr: "", category: "HOMEO TABLET", batch: "", expiry: "", purchasePrice: 30.00, mrp: 40.00, qty: 0.5, qtyPerUnit: 0.50 },
  { sNo: 3, store: "ALSHIFA PHARMACY", name: "KORAI KIZHANGU 50GM", pharmName: "ALSHIFA", mfr: "", category: "KASHAYA POWDER", batch: "3925", expiry: "01/27", purchasePrice: 35.00, mrp: 50.00, qty: 0.5, qtyPerUnit: 0.50 },
  { sNo: 4, store: "ALSHIFA PHARMACY", name: "PONKURANDU 100GM", pharmName: "ALSHIFA", mfr: "", category: "N-MOVING", batch: "", expiry: "", purchasePrice: 90.00, mrp: 100.00, qty: 0.5, qtyPerUnit: 0.50 },
  { sNo: 5, store: "ALSHIFA PHARMACY", name: "777 SOAP", pharmName: "SANJEEVI", mfr: "", category: "OTC", batch: "49", expiry: "01/28", purchasePrice: 63.84, mrp: 79.00, qty: 1.0, qtyPerUnit: 1.00 },
  { sNo: 6, store: "ALSHIFA PHARMACY", name: "AACTARIL SOAP 75G", pharmName: "ALSHIFA", mfr: "", category: "SOAP", batch: "2724005", expiry: "09/27", purchasePrice: 75.36, mrp: 110.00, qty: 1.0, qtyPerUnit: 1.00 },
];

const ReturnIndentNew = () => {
  const [location, setLocation] = useState("loc1");
  const [fromStore, setFromStore] = useState("alshifa");
  const [toStore, setToStore] = useState("theni");
  const [returnDate, setReturnDate] = useState("2026-07-21");
  const [returnTime, setReturnTime] = useState("22:50");
  const [status, setStatus] = useState("Ordered");
  const [additionalNote, setAdditionalNote] = useState("");

  return (
    <div className="space-y-4">
      {/* Sub Nav */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">New</Button>
        <Link to="/hms/stock/indent/return/empty-store">
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Empty Store</Button>
        </Link>
        <Link to="/hms/stock/indent/return/manage">
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Manage Return Indent</Button>
        </Link>
      </div>

      <div className="text-center"><h2 className="text-xl font-semibold text-orange-600">Return Indent</h2></div>

      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Product Table */}
          <div>
            <h3 className="font-semibold text-sm mb-2">Add Products</h3>
            <div className="overflow-x-auto border rounded">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-2 py-2 text-left font-semibold text-orange-600">Product Name</th>
                    <th className="px-2 py-2 text-left font-semibold text-orange-600">Stock</th>
                    <th className="px-2 py-2 text-left font-semibold text-orange-600">Batch</th>
                    <th className="px-2 py-2 text-left font-semibold text-orange-600">Expiry</th>
                    <th className="px-2 py-2 text-left font-semibold text-orange-600">Return Qty</th>
                    <th className="px-2 py-2 text-left font-semibold text-orange-600">MRP</th>
                    <th className="px-2 py-2 text-left font-semibold text-orange-600">GST(%)</th>
                    <th className="px-2 py-2 text-left font-semibold text-orange-600">Total</th>
                    <th className="px-2 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gray-50">
                    <td className="px-1 py-1"><Input className="h-7 text-xs" placeholder="Product Name" /></td>
                    <td className="px-1 py-1"><Input className="h-7 text-xs w-20" placeholder="Current Stock" readOnly /></td>
                    <td className="px-1 py-1"><Select><SelectTrigger className="h-7 text-xs w-16"><SelectValue /></SelectTrigger><SelectContent></SelectContent></Select></td>
                    <td className="px-1 py-1"><Input className="h-7 text-xs w-20" placeholder="Expiry Date" readOnly /></td>
                    <td className="px-1 py-1"><Input className="h-7 text-xs w-16" placeholder="Quantity" /></td>
                    <td className="px-1 py-1"><Input className="h-7 text-xs w-14" placeholder="MRP" /></td>
                    <td className="px-1 py-1"><Select><SelectTrigger className="h-7 text-xs w-12"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="0">0</SelectItem><SelectItem value="5">5</SelectItem><SelectItem value="12">12</SelectItem><SelectItem value="18">18</SelectItem></SelectContent></Select></td>
                    <td className="px-1 py-1"><Input className="h-7 text-xs w-14" placeholder="Total" readOnly /></td>
                    <td className="px-1 py-1"><Button size="sm" className="h-7 bg-blue-600 text-xs">Add</Button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Location/Store/Status/Date */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t pt-4">
            <div>
              <Label className="text-xs font-semibold">Location * :</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold">Status * :</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ordered">Ordered</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold">Return Date * :</Label>
              <div className="flex gap-1">
                <Input type="date" className="h-8 text-xs" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
                <span className="text-xs self-center">Time</span>
                <Input type="time" className="h-8 text-xs w-20" value={returnTime} onChange={(e) => setReturnTime(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold">From * :</Label>
              <Select value={fromStore} onValueChange={setFromStore}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="alshifa">ALSHIFA PHARMACY</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold">To * :</Label>
              <Select value={toStore} onValueChange={setToStore}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="theni">Al Shifa Ayush Center Theni</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs font-semibold">Additional Note :</Label>
            <Textarea value={additionalNote} onChange={(e) => setAdditionalNote(e.target.value)} rows={2} />
          </div>
          <div className="text-center">
            <Button className="bg-orange-600 hover:bg-orange-700 px-8" onClick={() => toast.success("Return Indent saved")}>Save</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReturnIndentNew;
