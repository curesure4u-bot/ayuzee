import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowRight, Brain, Truck, Package, Printer } from "lucide-react";

const transfers = [
  { item: "Rasnasaptakam Kashayam 450ml", batch: "B001", available: 45, qty: 20, status: "In Transit" },
  { item: "Simhanada Guggulu 60 tabs", batch: "B012", available: 120, qty: 50, status: "Pending" },
  { item: "Kottamchukkadi Taila 200ml", batch: "B005", available: 30, qty: 10, status: "Received" },
  { item: "Ashwagandha Churna 100g", batch: "B008", available: 80, qty: 30, status: "Pending" },
];

const history = [
  { id: "TRF-001", from: "Kadayanallur", to: "Tirunelveli", items: 5, date: "20/07/2026", value: "₹12,500", status: "Completed" },
  { id: "TRF-002", from: "Kadayanallur", to: "Rajapalayam", items: 3, date: "18/07/2026", value: "₹8,200", status: "Completed" },
  { id: "TRF-003", from: "Chennai", to: "Theni", items: 8, date: "15/07/2026", value: "₹22,000", status: "Completed" },
  { id: "TRF-004", from: "Kadayanallur", to: "Chennai", items: 2, date: "12/07/2026", value: "₹5,600", status: "Completed" },
  { id: "TRF-005", from: "Rajapalayam", to: "Tenkasi", items: 4, date: "10/07/2026", value: "₹9,800", status: "Completed" },
];

const InterBranchTransfer = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold flex items-center gap-2"><Truck className="h-6 w-6 text-blue-600" /> Inter-Branch Stock Transfer</h1><p className="text-muted-foreground mt-1">Transfer stock between branches when one runs out — AI detects and suggests</p></div>
      </div>
      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3"><Brain className="h-5 w-5 text-purple-600 mt-0.5" /><div><p className="font-semibold text-purple-800">AI Transfer Suggestion</p><p className="text-sm text-purple-700">Tirunelveli has 0 stock of Rasnasaptakam but 8 patients prescribed this week. Kadayanallur has 45 units. Suggest transfer of 20 units immediately.</p></div><Button size="sm" onClick={() => toast.success("Transfer created from AI suggestion")}>Accept</Button></CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">New Transfer</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Select defaultValue="kdnl"><SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="kdnl">Kadayanallur</SelectItem><SelectItem value="tvli">Tirunelveli</SelectItem><SelectItem value="rjpm">Rajapalayam</SelectItem><SelectItem value="theni">Theni</SelectItem><SelectItem value="cni">Chennai</SelectItem><SelectItem value="tnks">Tenkasi</SelectItem></SelectContent></Select>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            <Select defaultValue="tvli"><SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="kdnl">Kadayanallur</SelectItem><SelectItem value="tvli">Tirunelveli</SelectItem><SelectItem value="rjpm">Rajapalayam</SelectItem><SelectItem value="theni">Theni</SelectItem><SelectItem value="cni">Chennai</SelectItem><SelectItem value="tnks">Tenkasi</SelectItem></SelectContent></Select>
          </div>
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Item</th><th className="px-3 py-2 text-left">Batch</th><th className="px-3 py-2 text-center">Available</th><th className="px-3 py-2 text-center">Transfer Qty</th><th className="px-3 py-2 text-center">Status</th></tr></thead><tbody>
            {transfers.map((t, i) => (<tr key={i} className="border-b hover:bg-muted/30"><td className="px-3 py-2 font-medium">{t.item}</td><td className="px-3 py-2 text-xs">{t.batch}</td><td className="px-3 py-2 text-center">{t.available}</td><td className="px-3 py-2 text-center"><Input type="number" defaultValue={t.qty} className="h-7 w-16 text-center mx-auto" /></td><td className="px-3 py-2 text-center"><Badge variant={t.status === "Received" ? "outline" : t.status === "In Transit" ? "default" : "secondary"} className={`text-[10px] ${t.status === "Received" ? "text-green-600" : ""}`}>{t.status}</Badge></td></tr>))}
          </tbody></table></div>
          <div className="flex gap-2"><Button onClick={() => toast.success("Transfer created")}><Package className="h-4 w-4 mr-1" /> Create Transfer</Button><Button variant="outline" onClick={() => toast.success("Challan printed")}><Printer className="h-4 w-4 mr-1" /> Print Challan</Button></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Transfer History</CardTitle></CardHeader>
        <CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">ID</th><th className="px-3 py-2 text-left">From</th><th className="px-3 py-2 text-left">To</th><th className="px-3 py-2 text-center">Items</th><th className="px-3 py-2 text-right">Value</th><th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-center">Status</th></tr></thead><tbody>
          {history.map((h, i) => (<tr key={i} className="border-b"><td className="px-3 py-2 font-mono text-xs">{h.id}</td><td className="px-3 py-2">{h.from}</td><td className="px-3 py-2">{h.to}</td><td className="px-3 py-2 text-center">{h.items}</td><td className="px-3 py-2 text-right font-bold">{h.value}</td><td className="px-3 py-2 text-xs">{h.date}</td><td className="px-3 py-2 text-center"><Badge variant="outline" className="text-green-600 text-[10px]">{h.status}</Badge></td></tr>))}
        </tbody></table></div></CardContent>
      </Card>
    </div>
  );
};

export default InterBranchTransfer;
