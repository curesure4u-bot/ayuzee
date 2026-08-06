import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ScanLine, Brain, Printer, QrCode, Package, Search } from "lucide-react";

const barcodeItems = [
  { item: "Rasnasaptakam Kashayam 450ml", barcode: "8901234567890", rack: "A-03-02", batch: "RSK-0726-A", qr: true, printed: true },
  { item: "Simhanada Guggulu 60t", barcode: "8901234567891", rack: "B-01-05", batch: "SNG-0726-B", qr: true, printed: true },
  { item: "Kottamchukkadi Taila 200ml", barcode: "8901234567892", rack: "A-05-01", batch: "KCT-0726-C", qr: true, printed: true },
  { item: "Ashwagandha Churna 100g", barcode: "8901234567893", rack: "C-02-03", batch: "ASC-0726-D", qr: false, printed: false },
  { item: "Dashamoolarishtam 450ml", barcode: "8901234567894", rack: "A-03-04", batch: "DMA-0726-E", qr: true, printed: true },
  { item: "Triphala Churna 100g", barcode: "8901234567895", rack: "C-02-01", batch: "TPC-0726-F", qr: false, printed: false },
  { item: "Chandraprabha Vati 60t", barcode: "8901234567896", rack: "B-02-02", batch: "CPV-0726-G", qr: true, printed: true },
  { item: "Mahanarayan Taila 200ml", barcode: "8901234567897", rack: "A-05-03", batch: "MNT-0726-H", qr: true, printed: false },
];

const scanLog = [
  { time: "10:42 AM", action: "Dispensing", item: "Rasnasaptakam 450ml", patient: "Rajesh K.", scannedBy: "Pharmacist A", verified: true },
  { time: "10:38 AM", action: "GRN Receipt", item: "Simhanada Guggulu 60t x50", patient: "—", scannedBy: "Store Keeper", verified: true },
  { time: "10:25 AM", action: "Rack Placement", item: "Kottamchukkadi Taila 200ml", patient: "—", scannedBy: "Store Keeper", verified: true },
  { time: "09:55 AM", action: "Dispensing", item: "Chandraprabha Vati 60t", patient: "Meera N.", scannedBy: "Pharmacist B", verified: true },
  { time: "09:30 AM", action: "Physical Count", item: "Ashwagandha Churna 100g", patient: "—", scannedBy: "Auditor", verified: false },
];

export default function BarcodeManager() {
  const [scanInput, setScanInput] = useState("");
  const totalItems = barcodeItems.length;
  const withQR = barcodeItems.filter(b => b.qr).length;
  const printed = barcodeItems.filter(b => b.printed).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ScanLine className="h-6 w-6 text-indigo-600" /> Barcode & QR Management
          </h1>
          <p className="text-muted-foreground mt-1">Generate, print, scan — for dispensing verification, rack location, and stock audit</p>
        </div>
        <Button onClick={() => toast.success("Batch print initiated for 8 labels")}><Printer className="h-4 w-4 mr-1" /> Print Labels</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><Package className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold">{totalItems}</p><p className="text-xs text-muted-foreground">Total SKUs</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><ScanLine className="h-4 w-4 mx-auto text-indigo-600" /><p className="text-xl font-bold">{totalItems}</p><p className="text-xs text-muted-foreground">Barcoded</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><QrCode className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold">{withQR}</p><p className="text-xs text-muted-foreground">QR Enabled</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Printer className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold">{printed}</p><p className="text-xs text-muted-foreground">Labels Printed</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Search className="h-4 w-4" /> Scan / Search</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2 max-w-md">
            <Input
              placeholder="Scan barcode or type item name..."
              value={scanInput}
              onChange={e => setScanInput(e.target.value)}
              className="font-mono"
            />
            <Button size="sm" onClick={() => {
              if (scanInput) toast.success(`Found: ${barcodeItems[0].item} at Rack ${barcodeItems[0].rack}`);
            }}>Lookup</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Barcode Registry</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Item</th>
                  <th className="px-3 py-2 text-center">Barcode</th>
                  <th className="px-3 py-2 text-center">Rack</th>
                  <th className="px-3 py-2 text-center">Batch</th>
                  <th className="px-3 py-2 text-center">QR</th>
                  <th className="px-3 py-2 text-center">Printed</th>
                  <th className="px-3 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {barcodeItems.map((item, i) => (
                  <tr key={i} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 text-xs font-medium">{item.item}</td>
                    <td className="px-3 py-2 text-center font-mono text-[10px]">{item.barcode}</td>
                    <td className="px-3 py-2 text-center text-xs"><Badge variant="outline" className="text-[10px]">{item.rack}</Badge></td>
                    <td className="px-3 py-2 text-center text-xs text-muted-foreground">{item.batch}</td>
                    <td className="px-3 py-2 text-center">{item.qr ? <Badge className="text-[10px] bg-green-100 text-green-700">Yes</Badge> : <Badge variant="secondary" className="text-[10px]">No</Badge>}</td>
                    <td className="px-3 py-2 text-center">{item.printed ? "✓" : "—"}</td>
                    <td className="px-3 py-2 text-center"><Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => toast.success(`Label printed for ${item.item}`)}><Printer className="h-3 w-3" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Recent Scan Activity</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Time</th>
                  <th className="px-3 py-2 text-left">Action</th>
                  <th className="px-3 py-2 text-left">Item</th>
                  <th className="px-3 py-2 text-left">Patient</th>
                  <th className="px-3 py-2 text-left">Scanned By</th>
                  <th className="px-3 py-2 text-center">Verified</th>
                </tr>
              </thead>
              <tbody>
                {scanLog.map((log, i) => (
                  <tr key={i} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 text-xs text-muted-foreground">{log.time}</td>
                    <td className="px-3 py-2 text-xs"><Badge variant="outline" className="text-[10px]">{log.action}</Badge></td>
                    <td className="px-3 py-2 text-xs font-medium">{log.item}</td>
                    <td className="px-3 py-2 text-xs">{log.patient}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{log.scannedBy}</td>
                    <td className="px-3 py-2 text-center">{log.verified ? <Badge className="text-[10px] bg-green-100 text-green-700">✓</Badge> : <Badge variant="destructive" className="text-[10px]">✗</Badge>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3">
          <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-purple-800">AI Barcode Intelligence</p>
            <p className="text-sm text-purple-700">
              QR codes contain: Item name, batch, expiry, rack location, MRP, and patient dosage instructions (for dispensing).
              Scan-at-dispensing prevents wrong-medicine errors (verified 100% in today's 4 scans).
              2 items without QR (Ashwagandha Churna, Triphala Churna) — AI recommends generating labels before next stock audit.
              Patient QR on pharmacy bag: Scan to see dosage instructions in regional language.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
