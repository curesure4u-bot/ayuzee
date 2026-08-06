import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Brain, BookOpen, ShoppingCart, CheckCircle, Clock, Users } from "lucide-react";

const shortBookEntries = [
  { id: "SB-401", item: "Mahanarayan Taila 200ml", patient: "Rajesh Kumar", doctor: "Dr. Arun", date: "22 Jul 2026", qty: 2, reason: "Out of stock at dispensing", status: "pending", demand: 8 },
  { id: "SB-400", item: "Bala Taila 200ml", patient: "Meera Nair", doctor: "Dr. Priya", date: "22 Jul 2026", qty: 1, reason: "Zero stock - PK room needs", status: "pending", demand: 5 },
  { id: "SB-399", item: "Ksheerabala 101 Aavartan", patient: "Suresh Menon", doctor: "Dr. Arun", date: "21 Jul 2026", qty: 3, reason: "Special preparation not in regular stock", status: "ordered", demand: 3 },
  { id: "SB-398", item: "Guggulutiktam Kashayam 450ml", patient: "Priya Sharma", doctor: "Dr. Arun", date: "21 Jul 2026", qty: 2, reason: "Exhausted during monsoon spike", status: "ordered", demand: 12 },
  { id: "SB-397", item: "Dhanwantharam Kuzhambu", patient: "Anand Patel", doctor: "Dr. Priya", date: "20 Jul 2026", qty: 1, reason: "Not in formulary - special request", status: "fulfilled", demand: 2 },
  { id: "SB-396", item: "Manasamitram Gulika", patient: "Lakshmi R.", doctor: "Dr. Arun", date: "20 Jul 2026", qty: 2, reason: "Stock finished - high demand", status: "fulfilled", demand: 6 },
  { id: "SB-395", item: "Sahacharadi Kashayam 450ml", patient: "Mohan K.", doctor: "Dr. Priya", date: "19 Jul 2026", qty: 1, reason: "Out of stock", status: "fulfilled", demand: 4 },
];

export default function ShortBook() {
  const pending = shortBookEntries.filter(e => e.status === "pending");
  const ordered = shortBookEntries.filter(e => e.status === "ordered");
  const fulfilled = shortBookEntries.filter(e => e.status === "fulfilled");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-amber-600" /> Short-Book / Demand Register
          </h1>
          <p className="text-muted-foreground mt-1">Log patient demand when out-of-stock — auto-include in next Purchase Order</p>
        </div>
        <Button onClick={() => toast.success("Auto-PO generated from 2 pending short-book items")}>
          <ShoppingCart className="h-4 w-4 mr-1" /> Generate PO from Pending
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><Clock className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold text-amber-600">{pending.length}</p><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card>
        <Card className="border-blue-200"><CardContent className="p-3 text-center"><ShoppingCart className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold text-blue-600">{ordered.length}</p><p className="text-xs text-muted-foreground">Ordered</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><CheckCircle className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600">{fulfilled.length}</p><p className="text-xs text-muted-foreground">Fulfilled</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Users className="h-4 w-4 mx-auto text-purple-600" /><p className="text-xl font-bold">{shortBookEntries.reduce((s, e) => s + e.demand, 0)}</p><p className="text-xs text-muted-foreground">Total Demand (units)</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Demand Register</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">ID</th>
                  <th className="px-3 py-2 text-left">Item</th>
                  <th className="px-3 py-2 text-left">Patient</th>
                  <th className="px-3 py-2 text-left">Doctor</th>
                  <th className="px-3 py-2 text-center">Date</th>
                  <th className="px-3 py-2 text-center">Qty</th>
                  <th className="px-3 py-2 text-center">Total Demand</th>
                  <th className="px-3 py-2 text-left">Reason</th>
                  <th className="px-3 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {shortBookEntries.map((entry) => (
                  <tr key={entry.id} className={`border-b ${entry.status === "pending" ? "bg-amber-50/50" : ""}`}>
                    <td className="px-3 py-2 text-xs font-mono">{entry.id}</td>
                    <td className="px-3 py-2 text-xs font-medium">{entry.item}</td>
                    <td className="px-3 py-2 text-xs">{entry.patient}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{entry.doctor}</td>
                    <td className="px-3 py-2 text-center text-xs">{entry.date}</td>
                    <td className="px-3 py-2 text-center text-xs font-bold">{entry.qty}</td>
                    <td className="px-3 py-2 text-center text-xs"><Badge variant="outline" className="text-[10px]">{entry.demand} requests</Badge></td>
                    <td className="px-3 py-2 text-[10px] text-muted-foreground max-w-[150px]">{entry.reason}</td>
                    <td className="px-3 py-2 text-center">
                      <Badge variant={entry.status === "pending" ? "destructive" : entry.status === "ordered" ? "default" : "outline"} className={`text-[10px] ${entry.status === "fulfilled" ? "text-green-600" : ""}`}>
                        {entry.status}
                      </Badge>
                    </td>
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
            <p className="font-semibold text-purple-800">AI Short-Book Intelligence</p>
            <p className="text-sm text-purple-700">
              Guggulutiktam Kashayam shows 12 demand requests this week — highest unfulfilled demand. AI recommends
              adding to regular formulary (currently "on-demand"). Mahanarayan Taila short 3 times this month — ROL needs
              increase from 25 to 40 units. Patient callback: 4 patients waiting for items — auto-notify when stock arrives.
              <strong> Zero-stock events cause 15% patient drop-off</strong> — fulfilling short-book within 48 hours retains 92%.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
