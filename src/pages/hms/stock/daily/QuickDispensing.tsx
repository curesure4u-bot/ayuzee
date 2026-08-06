import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ScanLine, Brain, Trash2, Printer, Plus, Search, User, CreditCard } from "lucide-react";

const cart = [
  { id: 1, medicine: "Rasnasaptakam Kashayam 200ml", batch: "RSK-0726-A", qty: 3, mrp: 210, discount: 0, total: 630, instruction: "15ml + 45ml WW | BD | Before food" },
  { id: 2, medicine: "Simhanada Guggulu 60t", batch: "SNG-0726-B", qty: 1, mrp: 150, discount: 0, total: 150, instruction: "2 tabs | BD | After food" },
  { id: 3, medicine: "Dasamoolarishtam 450ml", batch: "DMA-0726-E", qty: 2, mrp: 185, discount: 0, total: 370, instruction: "25ml + 25ml WW | BD | After food" },
  { id: 4, medicine: "Kottamchukkadi Taila 200ml", batch: "KCT-0726-C", qty: 1, mrp: 280, discount: 0, total: 280, instruction: "External | Night | Massage 10 min" },
];

export default function QuickDispensing() {
  const [scanInput, setScanInput] = useState("");
  const subtotal = cart.reduce((s, c) => s + c.total, 0);
  const gst = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + gst;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ScanLine className="h-6 w-6 text-green-600" /> Quick Dispensing (POS)
          </h1>
          <p className="text-muted-foreground mt-1">Scan → Add → Bill → Print. Fast pharmacy billing for high-footfall.</p>
        </div>
        <Badge className="bg-green-100 text-green-700 text-sm px-3 py-1">POS Mode</Badge>
      </div>

      {/* Patient & Doctor */}
      <Card>
        <CardContent className="p-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <User className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Patient name / ID / phone..." className="h-8 text-xs" defaultValue="Rajesh Kumar (P-1001)" />
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-[150px]">
            <Input placeholder="Doctor / Rx#" className="h-8 text-xs" defaultValue="Dr. Arun — Rx#4525" />
          </div>
          <Badge variant="outline" className="text-[10px]">15 days</Badge>
        </CardContent>
      </Card>

      {/* Scan Bar */}
      <Card className="border-green-200 bg-green-50/30">
        <CardContent className="p-3 flex gap-2">
          <ScanLine className="h-5 w-5 text-green-600 mt-1" />
          <Input
            placeholder="Scan barcode or type medicine name..."
            className="h-9 text-sm font-mono flex-1"
            value={scanInput}
            onChange={e => setScanInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { toast.success("Item added to cart"); setScanInput(""); } }}
            autoFocus
          />
          <Button size="sm" className="h-9" onClick={() => { toast.success("Item added"); setScanInput(""); }}><Plus className="h-4 w-4" /></Button>
          <Button size="sm" variant="outline" className="h-9"><Search className="h-4 w-4" /></Button>
        </CardContent>
      </Card>

      {/* Cart Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Medicine</th>
                  <th className="px-3 py-2 text-center">Batch</th>
                  <th className="px-3 py-2 text-center">Qty</th>
                  <th className="px-3 py-2 text-right">MRP</th>
                  <th className="px-3 py-2 text-right">Total</th>
                  <th className="px-3 py-2 text-left">Instruction</th>
                  <th className="px-3 py-2 text-center">×</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 text-xs text-muted-foreground">{item.id}</td>
                    <td className="px-3 py-2 text-xs font-medium">{item.medicine}</td>
                    <td className="px-3 py-2 text-center text-[10px] text-muted-foreground">{item.batch}</td>
                    <td className="px-3 py-2 text-center"><Input type="number" defaultValue={item.qty} className="h-7 w-12 text-center text-xs mx-auto" /></td>
                    <td className="px-3 py-2 text-right text-xs">₹{item.mrp}</td>
                    <td className="px-3 py-2 text-right text-xs font-bold">₹{item.total}</td>
                    <td className="px-3 py-2 text-[10px] text-blue-600">{item.instruction}</td>
                    <td className="px-3 py-2 text-center"><Button size="sm" variant="ghost" className="h-6 w-6 p-0"><Trash2 className="h-3 w-3 text-red-500" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Totals & Payment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between text-sm"><span>Subtotal ({cart.length} items)</span><span>₹{subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm"><span>GST (5%)</span><span>₹{gst}</span></div>
            <div className="flex justify-between text-sm"><span>Discount</span><span className="text-green-600">-₹0</span></div>
            <Separator />
            <div className="flex justify-between text-lg font-bold"><span>Grand Total</span><span>₹{grandTotal.toLocaleString()}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Payment Mode</p>
            <div className="grid grid-cols-3 gap-2">
              <Button size="sm" className="h-8 text-xs">Cash</Button>
              <Button size="sm" variant="outline" className="h-8 text-xs">UPI</Button>
              <Button size="sm" variant="outline" className="h-8 text-xs">Card</Button>
            </div>
            <Separator />
            <div className="flex gap-2">
              <Button className="flex-1 h-10" onClick={() => toast.success(`Bill generated: ₹${grandTotal} | Printing...`)}>
                <Printer className="h-4 w-4 mr-1" /> Bill & Print
              </Button>
              <Button variant="outline" className="h-10" onClick={() => toast.success("Bill saved as draft")}>Save Draft</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-3 flex items-start gap-2"><Brain className="h-4 w-4 text-purple-600 mt-0.5" /><div><p className="font-semibold text-xs text-purple-800">AI POS Intelligence</p><p className="text-[10px] text-purple-700">Auto-applied: Dose quantity alert (3 bottles for 15 days ✓). FEFO batch selected. Drug interaction: None detected. Dosage instructions auto-attached. Avg billing time: 45 seconds (vs 3 min in full form mode).</p></div></CardContent>
      </Card>
      <Card className="border-amber-200 bg-amber-50/30">
        <CardContent className="p-3 flex items-start gap-2"><AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" /><div><p className="font-semibold text-xs text-amber-800">Out-of-Stock → Ayuzee Platform Redirect</p><p className="text-[10px] text-amber-700">When any item shows 0 stock during billing, system auto-shows: "Not available at this branch. Available on Ayuzee Shop → ayuzee.com/shop/[medicine]. Patient can order for home delivery (billed by Agency, separate entity)." Pharmacist can send link to patient via WhatsApp with one click.</p></div></CardContent>
      </Card>
    </div>
  );
}
