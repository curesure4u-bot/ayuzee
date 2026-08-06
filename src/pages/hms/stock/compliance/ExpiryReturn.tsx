import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { RotateCcw, Brain, AlertTriangle, CheckCircle, FileText, IndianRupee } from "lucide-react";

const expiryItems = [
  { item: "Kumaryasava 450ml", batch: "KMA-0124", expiry: "Jan 2026", qty: 12, cost: 135, supplier: "AVN Kottakkal", status: "claim_raised", claimId: "CR-2026-045" },
  { item: "Punarnavadi Mandoor 60t", batch: "PNM-0224", expiry: "Feb 2026", qty: 25, cost: 85, supplier: "Nagarjuna Herbal", status: "credit_received", claimId: "CR-2026-038" },
  { item: "Brahmi Vati 60t", batch: "BRV-0324", expiry: "Mar 2026", qty: 8, cost: 110, supplier: "Dabur Ayurvedics", status: "pending", claimId: "—" },
  { item: "Saptamrit Lauh 60t", batch: "SML-0424", expiry: "Apr 2026", qty: 15, cost: 95, supplier: "X Pharmaceuticals", status: "returned", claimId: "CR-2026-041" },
  { item: "Arogyavardhini Vati 60t", batch: "ARV-0524", expiry: "May 2026", qty: 20, cost: 75, supplier: "SNA Oushadhasala", status: "claim_raised", claimId: "CR-2026-048" },
  { item: "Chitrakadi Vati 60t", batch: "CTV-0624", expiry: "Jun 2026", qty: 30, cost: 65, supplier: "X Ayush Agency", status: "pending", claimId: "—" },
];

const nearExpiry = [
  { item: "Dashamoolarishtam 450ml (batch DMA-0126)", expiry: "Aug 2026", daysLeft: 38, qty: 8, action: "Push sales / discount" },
  { item: "Ashwagandha Churna 100g (batch ASC-1225)", expiry: "Sep 2026", daysLeft: 68, qty: 15, action: "Transfer to high-demand branch" },
  { item: "Chandraprabha Vati 60t (batch CPV-0126)", expiry: "Oct 2026", daysLeft: 99, qty: 22, action: "Normal dispensing" },
];

const creditNotes = [
  { id: "CN-2026-012", supplier: "Nagarjuna Herbal", date: "15 Jun 2026", items: 25, amount: 2125, against: "CR-2026-038", status: "adjusted" },
  { id: "CN-2026-010", supplier: "AVN Kottakkal", date: "28 May 2026", items: 18, amount: 3240, against: "CR-2026-032", status: "adjusted" },
  { id: "CN-2026-008", supplier: "X Pharmaceuticals", date: "10 May 2026", items: 15, amount: 1425, against: "CR-2026-041", status: "pending_adjustment" },
];

export default function ExpiryReturn() {
  const totalClaimValue = expiryItems.reduce((s, i) => s + i.qty * i.cost, 0);
  const recovered = creditNotes.filter(c => c.status === "adjusted").reduce((s, c) => s + c.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <RotateCcw className="h-6 w-6 text-amber-600" /> Expiry Return & Claims
        </h1>
        <p className="text-muted-foreground mt-1">Track expired stock, raise claims to suppliers, manage credit/debit notes</p>
      </div>

      <Tabs defaultValue="expired">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="expired" className="text-xs">Expired Stock</TabsTrigger>
          <TabsTrigger value="near-expiry" className="text-xs">Near Expiry (90 days)</TabsTrigger>
          <TabsTrigger value="credit-notes" className="text-xs">Credit Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="expired" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{expiryItems.length}</p><p className="text-xs text-muted-foreground">Expired Items</p></CardContent></Card>
            <Card className="border-red-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-red-600">₹{totalClaimValue.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Claim Value</p></CardContent></Card>
            <Card className="border-green-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-green-600">₹{recovered.toLocaleString()}</p><p className="text-xs text-muted-foreground">Recovered</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{expiryItems.filter(i => i.status === "pending").length}</p><p className="text-xs text-muted-foreground">Pending Claims</p></CardContent></Card>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Item</th>
                  <th className="px-3 py-2 text-center">Batch</th>
                  <th className="px-3 py-2 text-center">Expiry</th>
                  <th className="px-3 py-2 text-center">Qty</th>
                  <th className="px-3 py-2 text-right">Value</th>
                  <th className="px-3 py-2 text-left">Supplier</th>
                  <th className="px-3 py-2 text-center">Status</th>
                  <th className="px-3 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {expiryItems.map((item, i) => (
                  <tr key={i} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 text-xs font-medium">{item.item}</td>
                    <td className="px-3 py-2 text-center text-xs text-muted-foreground">{item.batch}</td>
                    <td className="px-3 py-2 text-center text-xs text-red-600">{item.expiry}</td>
                    <td className="px-3 py-2 text-center text-xs font-bold">{item.qty}</td>
                    <td className="px-3 py-2 text-right text-xs">₹{(item.qty * item.cost).toLocaleString()}</td>
                    <td className="px-3 py-2 text-xs">{item.supplier}</td>
                    <td className="px-3 py-2 text-center">
                      <Badge variant={item.status === "credit_received" ? "outline" : item.status === "pending" ? "destructive" : "default"} className={`text-[10px] ${item.status === "credit_received" ? "text-green-600" : ""}`}>
                        {item.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-center">
                      {item.status === "pending" && <Button size="sm" className="h-6 text-[10px]" onClick={() => toast.success(`Claim raised for ${item.item}`)}>Raise Claim</Button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="near-expiry" className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">Items expiring within 90 days — take action before they become dead stock</p>
          <div className="space-y-2">
            {nearExpiry.map((item, i) => (
              <Card key={i} className={item.daysLeft < 45 ? "border-red-200" : item.daysLeft < 75 ? "border-amber-200" : ""}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.item}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.qty} • Expiry: {item.expiry}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${item.daysLeft < 45 ? "text-red-600" : item.daysLeft < 75 ? "text-amber-600" : "text-green-600"}`}>{item.daysLeft} days</p>
                    <p className="text-[10px] text-muted-foreground">{item.action}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="credit-notes" className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">Credit notes received from suppliers against expiry claims</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">CN #</th>
                  <th className="px-3 py-2 text-left">Supplier</th>
                  <th className="px-3 py-2 text-center">Date</th>
                  <th className="px-3 py-2 text-center">Items</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  <th className="px-3 py-2 text-center">Against</th>
                  <th className="px-3 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {creditNotes.map((cn, i) => (
                  <tr key={i} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 text-xs font-medium">{cn.id}</td>
                    <td className="px-3 py-2 text-xs">{cn.supplier}</td>
                    <td className="px-3 py-2 text-center text-xs">{cn.date}</td>
                    <td className="px-3 py-2 text-center text-xs">{cn.items}</td>
                    <td className="px-3 py-2 text-right text-xs font-bold">₹{cn.amount.toLocaleString()}</td>
                    <td className="px-3 py-2 text-center text-xs text-blue-600">{cn.against}</td>
                    <td className="px-3 py-2 text-center"><Badge variant={cn.status === "adjusted" ? "outline" : "default"} className={`text-[10px] ${cn.status === "adjusted" ? "text-green-600" : ""}`}>{cn.status.replace("_", " ")}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3">
          <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-purple-800">AI Expiry Intelligence</p>
            <p className="text-sm text-purple-700">
              FEFO (First Expiry First Out) enforced in dispensing. 3 items hitting 90-day window — AI auto-pushes them to
              prescription suggestions when indicated. Dashamoolarishtam (38 days left) routed to high-footfall branch.
              Annual expiry loss reduced from ₹1.8L to ₹42K after AI optimization (77% reduction).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
