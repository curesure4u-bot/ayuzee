import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Truck, Brain, Package, CheckCircle, Clock, MapPin,
  Phone, Calendar, CreditCard, Users, RefreshCw, Send,
} from "lucide-react";

// ─── TAB 1: DISPATCH QUEUE ───
function DispatchQueueTab() {
  const queue = [
    { id: "CD-5021", patient: "Ramesh Iyer", city: "Mumbai", state: "MH", rx: "Rx#4525 (Dr. Arun)", items: 4, value: 1850, payment: "Prepaid (UPI)", source: "Teleconsult", status: "pending_pick", date: "22 Jul 2026" },
    { id: "CD-5020", patient: "Sunita Devi", city: "Patna", state: "BR", rx: "Rx#4524 (Dr. Arun)", items: 3, value: 1200, payment: "COD", source: "Camp - Patna", status: "picking", date: "22 Jul 2026" },
    { id: "CD-5019", patient: "Anil Sharma", city: "Delhi", state: "DL", rx: "Rx#4523 (Dr. Priya)", items: 5, value: 2400, payment: "Prepaid (Card)", source: "Teleconsult", status: "packed", date: "22 Jul 2026" },
    { id: "CD-5018", patient: "Kavitha R.", city: "Coimbatore", state: "TN", rx: "Rx#4522 (Dr. Arun)", items: 3, value: 1650, payment: "Prepaid (UPI)", source: "Camp - Chennai", status: "shipped", date: "21 Jul 2026" },
    { id: "CD-5017", patient: "Mahesh Gupta", city: "Lucknow", state: "UP", rx: "Rx#4521 (Dr. Priya)", items: 4, value: 1900, payment: "COD", source: "Teleconsult", status: "shipped", date: "21 Jul 2026" },
    { id: "CD-5016", patient: "Lakshmi Nair", city: "Kochi", state: "KL", rx: "Rx#4520 (Dr. Arun)", items: 3, value: 1350, payment: "Prepaid (UPI)", source: "Branch - Walk-in", status: "delivered", date: "20 Jul 2026" },
  ];

  const statusColors: Record<string, string> = {
    pending_pick: "bg-amber-100 text-amber-700", picking: "bg-blue-100 text-blue-700",
    packed: "bg-indigo-100 text-indigo-700", shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <Card><CardContent className="p-2 text-center"><Clock className="h-3.5 w-3.5 mx-auto text-amber-600" /><p className="text-lg font-bold text-amber-600">{queue.filter(q => q.status === "pending_pick").length}</p><p className="text-[10px] text-muted-foreground">Pending Pick</p></CardContent></Card>
        <Card><CardContent className="p-2 text-center"><Package className="h-3.5 w-3.5 mx-auto text-blue-600" /><p className="text-lg font-bold text-blue-600">{queue.filter(q => q.status === "picking" || q.status === "packed").length}</p><p className="text-[10px] text-muted-foreground">Packing</p></CardContent></Card>
        <Card><CardContent className="p-2 text-center"><Truck className="h-3.5 w-3.5 mx-auto text-purple-600" /><p className="text-lg font-bold text-purple-600">{queue.filter(q => q.status === "shipped").length}</p><p className="text-[10px] text-muted-foreground">In Transit</p></CardContent></Card>
        <Card><CardContent className="p-2 text-center"><CheckCircle className="h-3.5 w-3.5 mx-auto text-green-600" /><p className="text-lg font-bold text-green-600">{queue.filter(q => q.status === "delivered").length}</p><p className="text-[10px] text-muted-foreground">Delivered</p></CardContent></Card>
        <Card><CardContent className="p-2 text-center"><p className="text-lg font-bold">{queue.length}</p><p className="text-[10px] text-muted-foreground">Total Today</p></CardContent></Card>
      </div>
      <div className="space-y-2">
        {queue.map((order) => (
          <Card key={order.id} className={order.status === "pending_pick" ? "border-amber-200" : ""}>
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{order.id}</p>
                  <Badge className={`text-[10px] ${statusColors[order.status]}`}>{order.status.replace("_", " ")}</Badge>
                  <Badge variant="outline" className="text-[10px]">{order.source}</Badge>
                  <Badge variant={order.payment.includes("COD") ? "destructive" : "secondary"} className="text-[10px]">{order.payment}</Badge>
                </div>
                <p className="text-xs mt-0.5">{order.patient} • <MapPin className="h-2.5 w-2.5 inline" /> {order.city}, {order.state} • {order.items} items</p>
                <p className="text-[10px] text-muted-foreground">{order.rx} • {order.date}</p>
              </div>
              <div className="text-right flex items-center gap-2">
                <p className="font-bold text-sm">₹{order.value.toLocaleString()}</p>
                {order.status === "pending_pick" && <Button size="sm" className="h-7 text-xs" onClick={() => toast.success(`${order.id} picking started`)}>Pick</Button>}
                {order.status === "packed" && <Button size="sm" className="h-7 text-xs" onClick={() => toast.success(`${order.id} handed to courier`)}>Ship</Button>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


// ─── TAB 2: COURIER TRACKING ───
function CourierTrackingTab() {
  const shipments = [
    { id: "CD-5018", patient: "Kavitha R.", courier: "Delhivery", awb: "DL1234567890", shipped: "21 Jul", eta: "24 Jul", city: "Coimbatore", status: "in_transit", lastUpdate: "Reached Chennai hub - 22 Jul 8:30 AM" },
    { id: "CD-5017", patient: "Mahesh Gupta", courier: "DTDC", awb: "D987654321", shipped: "21 Jul", eta: "24 Jul", city: "Lucknow", status: "in_transit", lastUpdate: "Departed Bangalore - 21 Jul 11 PM" },
    { id: "CD-5016", patient: "Lakshmi Nair", courier: "Speed Post", awb: "EE123456789IN", shipped: "19 Jul", eta: "22 Jul", city: "Kochi", status: "delivered", lastUpdate: "Delivered to recipient - 20 Jul 2:30 PM" },
    { id: "CD-5015", patient: "Rajan P.", courier: "India Post", awb: "RR987654321IN", shipped: "18 Jul", eta: "25 Jul", city: "Guwahati", status: "in_transit", lastUpdate: "In transit - Kolkata sorting - 21 Jul" },
    { id: "CD-5014", patient: "Fatima B.", courier: "BlueDart", awb: "BD5544332211", shipped: "18 Jul", eta: "21 Jul", city: "Hyderabad", status: "delivered", lastUpdate: "Delivered - 20 Jul 11 AM" },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Live courier tracking — auto-updated from courier API</p>
      <div className="space-y-2">
        {shipments.map((s) => (
          <Card key={s.id} className={s.status === "delivered" ? "border-green-200" : ""}>
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{s.patient}</p>
                    <Badge variant="outline" className="text-[10px]">{s.courier}</Badge>
                    <Badge variant={s.status === "delivered" ? "outline" : "default"} className={`text-[10px] ${s.status === "delivered" ? "text-green-600" : ""}`}>{s.status === "in_transit" ? "In Transit" : "Delivered"}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">AWB: <span className="font-mono">{s.awb}</span> • {s.city}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Shipped: {s.shipped} • ETA: {s.eta}</p>
                  <p className="text-[10px] mt-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded inline-block">{s.lastUpdate}</p>
                </div>
                {s.status === "in_transit" && <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => toast.success("Tracking page opened")}>Track</Button>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


// ─── TAB 3: MONTHLY REFILL ───
function MonthlyRefillTab() {
  const refills = [
    { patient: "Ramesh Iyer", city: "Mumbai", lastDispatch: "22 Jun 2026", nextDue: "22 Jul 2026", medicines: "Rasnasaptakam x2, Simhanada x1, Kottamchukkadi x1", value: 1850, status: "due_today", months: 3 },
    { patient: "Kavitha R.", city: "Coimbatore", lastDispatch: "05 Jul 2026", nextDue: "05 Aug 2026", medicines: "Dashamoolarishtam x1, Ashwagandha x1, Chandraprabha x1", value: 1200, status: "upcoming", months: 5 },
    { patient: "Mahesh Gupta", city: "Lucknow", lastDispatch: "10 Jul 2026", nextDue: "10 Aug 2026", medicines: "Simhanada x2, Rasnasaptakam x2, Mahanarayan x1", value: 2100, status: "upcoming", months: 4 },
    { patient: "Lakshmi Nair", city: "Kochi", lastDispatch: "20 Jul 2026", nextDue: "20 Aug 2026", medicines: "Kottamchukkadi x2, Triphala x1", value: 980, status: "upcoming", months: 6 },
    { patient: "Sunita Devi", city: "Patna", lastDispatch: "15 Jun 2026", nextDue: "15 Jul 2026", medicines: "Rasnasaptakam x2, Chandraprabha x2", value: 1450, status: "overdue", months: 2 },
    { patient: "Anil Sharma", city: "Delhi", lastDispatch: "01 Jul 2026", nextDue: "01 Aug 2026", medicines: "Ashwagandha x2, Dashamool x1, Simhanada x1, Triphala x1", value: 1680, status: "upcoming", months: 3 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Auto-schedule monthly medicine courier for ongoing patients</p>
        <Button size="sm" onClick={() => toast.success("Bulk refill orders generated for 2 due patients")}>Generate Due Refills</Button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-red-200"><CardContent className="p-2 text-center"><p className="text-lg font-bold text-red-600">{refills.filter(r => r.status === "overdue").length}</p><p className="text-[10px] text-muted-foreground">Overdue</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-2 text-center"><p className="text-lg font-bold text-amber-600">{refills.filter(r => r.status === "due_today").length}</p><p className="text-[10px] text-muted-foreground">Due Today</p></CardContent></Card>
        <Card><CardContent className="p-2 text-center"><p className="text-lg font-bold">{refills.filter(r => r.status === "upcoming").length}</p><p className="text-[10px] text-muted-foreground">Upcoming</p></CardContent></Card>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Patient</th><th className="px-3 py-2 text-left">City</th><th className="px-3 py-2 text-left">Medicines</th><th className="px-3 py-2 text-center">Last</th><th className="px-3 py-2 text-center">Next Due</th><th className="px-3 py-2 text-center">Months</th><th className="px-3 py-2 text-right">Value</th><th className="px-3 py-2 text-center">Status</th></tr></thead><tbody>
          {refills.map((r, i) => (
            <tr key={i} className={`border-b ${r.status === "overdue" ? "bg-red-50/50" : r.status === "due_today" ? "bg-amber-50/50" : ""}`}>
              <td className="px-3 py-2 text-xs font-medium">{r.patient}</td>
              <td className="px-3 py-2 text-xs">{r.city}</td>
              <td className="px-3 py-2 text-[10px] text-muted-foreground max-w-[200px]">{r.medicines}</td>
              <td className="px-3 py-2 text-center text-xs">{r.lastDispatch}</td>
              <td className="px-3 py-2 text-center text-xs font-bold">{r.nextDue}</td>
              <td className="px-3 py-2 text-center text-xs">{r.months}th</td>
              <td className="px-3 py-2 text-right text-xs font-bold">₹{r.value.toLocaleString()}</td>
              <td className="px-3 py-2 text-center"><Badge variant={r.status === "overdue" ? "destructive" : r.status === "due_today" ? "default" : "secondary"} className="text-[10px]">{r.status.replace("_", " ")}</Badge></td>
            </tr>
          ))}
        </tbody></table>
      </div>
    </div>
  );
}


// ─── TAB 4: CAMP ORDERS ───
function CampOrdersTab() {
  const camps = [
    { camp: "Health Camp - Patna (Bihar)", date: "20 Jul 2026", doctor: "Dr. Arun", patients: 45, ordersCollected: 32, totalValue: 48000, dispatched: 28, pending: 4, paymentMode: "Cash + UPI" },
    { camp: "Health Camp - Lucknow (UP)", date: "15 Jul 2026", doctor: "Dr. Priya", patients: 38, ordersCollected: 25, totalValue: 35000, dispatched: 25, pending: 0, paymentMode: "UPI + Card" },
    { camp: "Health Camp - Chennai (TN)", date: "10 Jul 2026", doctor: "Dr. Arun", patients: 52, ordersCollected: 40, totalValue: 62000, dispatched: 40, pending: 0, paymentMode: "Cash + UPI" },
    { camp: "Health Camp - Kolkata (WB)", date: "05 Jul 2026", doctor: "Dr. Priya", patients: 30, ordersCollected: 22, totalValue: 28000, dispatched: 22, pending: 0, paymentMode: "Cash + UPI" },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Camp consultations → Collect payment → Dispatch medicine from central store via courier</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{camps.length}</p><p className="text-xs text-muted-foreground">Camps (Jul)</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{camps.reduce((s, c) => s + c.patients, 0)}</p><p className="text-xs text-muted-foreground">Patients Seen</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">₹{(camps.reduce((s, c) => s + c.totalValue, 0) / 1000).toFixed(0)}K</p><p className="text-xs text-muted-foreground">Orders Value</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-amber-600">{camps.reduce((s, c) => s + c.pending, 0)}</p><p className="text-xs text-muted-foreground">Pending Dispatch</p></CardContent></Card>
      </div>
      <div className="space-y-2">
        {camps.map((camp, i) => (
          <Card key={i} className={camp.pending > 0 ? "border-amber-200" : ""}>
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">{camp.camp}</p>
                <p className="text-xs text-muted-foreground">{camp.date} • {camp.doctor} • {camp.paymentMode}</p>
                <p className="text-[10px] mt-0.5">Patients: {camp.patients} | Orders: {camp.ordersCollected} | Dispatched: {camp.dispatched}/{camp.ordersCollected}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">₹{camp.totalValue.toLocaleString()}</p>
                {camp.pending > 0 && <Badge variant="destructive" className="text-[10px] mt-1">{camp.pending} pending</Badge>}
                {camp.pending === 0 && <Badge variant="outline" className="text-[10px] text-green-600 mt-1">All dispatched</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


// ─── TAB 5: COD RECONCILIATION ───
function CodReconciliationTab() {
  const codOrders = [
    { courier: "Delhivery", orders: 12, codCollected: 18500, remitted: 15200, pending: 3300, remitDate: "25 Jul 2026", cycle: "T+3 days" },
    { courier: "DTDC", orders: 8, codCollected: 12000, remitted: 12000, pending: 0, remitDate: "20 Jul 2026", cycle: "T+5 days" },
    { courier: "India Post", orders: 5, codCollected: 7500, remitted: 0, pending: 7500, remitDate: "28 Jul 2026", cycle: "T+7 days" },
    { courier: "BlueDart", orders: 3, codCollected: 5200, remitted: 5200, pending: 0, remitDate: "21 Jul 2026", cycle: "T+2 days" },
  ];
  const totalPending = codOrders.reduce((s, c) => s + c.pending, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Track COD collections from courier partners — remittance reconciliation</p>
        <Badge className="bg-amber-100 text-amber-700 text-xs">₹{totalPending.toLocaleString()} pending remittance</Badge>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Courier Partner</th><th className="px-3 py-2 text-center">COD Orders</th><th className="px-3 py-2 text-right">Collected</th><th className="px-3 py-2 text-right">Remitted</th><th className="px-3 py-2 text-right">Pending</th><th className="px-3 py-2 text-center">Next Remit</th><th className="px-3 py-2 text-center">Cycle</th></tr></thead><tbody>
          {codOrders.map((c, i) => (
            <tr key={i} className={`border-b ${c.pending > 0 ? "bg-amber-50/50" : ""}`}>
              <td className="px-3 py-2 text-xs font-medium">{c.courier}</td>
              <td className="px-3 py-2 text-center text-xs">{c.orders}</td>
              <td className="px-3 py-2 text-right text-xs">₹{c.codCollected.toLocaleString()}</td>
              <td className="px-3 py-2 text-right text-xs text-green-600">₹{c.remitted.toLocaleString()}</td>
              <td className="px-3 py-2 text-right text-xs font-bold">{c.pending > 0 ? <span className="text-amber-600">₹{c.pending.toLocaleString()}</span> : <span className="text-green-600">₹0</span>}</td>
              <td className="px-3 py-2 text-center text-xs">{c.remitDate}</td>
              <td className="px-3 py-2 text-center text-xs text-muted-foreground">{c.cycle}</td>
            </tr>
          ))}
        </tbody></table>
      </div>
    </div>
  );
}

// ─── TAB 6: PATIENT COMMUNICATION ───
function PatientCommTab() {
  const messages = [
    { patient: "Ramesh Iyer", type: "Order Confirmed", channel: "WhatsApp", time: "22 Jul, 10:45 AM", message: "Your medicines have been packed. Courier pickup scheduled today. Tracking link will follow.", status: "sent" },
    { patient: "Kavitha R.", type: "Shipped", channel: "SMS + WhatsApp", time: "21 Jul, 3:00 PM", message: "Your order CD-5018 shipped via Delhivery. Track: https://track.delhivery.com/DL123... ETA: 24 Jul", status: "sent" },
    { patient: "Lakshmi Nair", type: "Delivered", channel: "WhatsApp", time: "20 Jul, 2:35 PM", message: "Your medicines delivered! How to take: [Dosage card attached]. Next refill: 20 Aug. Dr. Arun available for queries.", status: "sent" },
    { patient: "Sunita Devi", type: "Refill Reminder", channel: "WhatsApp", time: "22 Jul, 9:00 AM", message: "Your monthly medicine refill was due on 15 Jul. Shall we dispatch? Reply YES to confirm. Same medicines as last month.", status: "awaiting_reply" },
    { patient: "Mahesh Gupta", type: "COD Reminder", channel: "SMS", time: "21 Jul, 11:00 AM", message: "Your order CD-5017 is out for delivery. Please keep ₹1,900 ready for COD payment.", status: "sent" },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Automated WhatsApp/SMS notifications at every stage — order, ship, deliver, refill reminder</p>
      <div className="space-y-2">
        {messages.map((m, i) => (
          <Card key={i}>
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{m.patient}</p>
                    <Badge variant="outline" className="text-[10px]">{m.type}</Badge>
                    <Badge variant="secondary" className="text-[10px]">{m.channel}</Badge>
                    {m.status === "awaiting_reply" && <Badge className="text-[10px] bg-amber-100 text-amber-700">Awaiting Reply</Badge>}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{m.time}</p>
                  <p className="text-xs mt-1 p-2 bg-muted/30 rounded">{m.message}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


// ─── TAB 7: AI ROUTE OPTIMIZER ───
function AiRouteTab() {
  const batches = [
    { zone: "South India (TN, KL, KA)", orders: 8, courier: "Delhivery", cost: 1200, weight: "4.2 kg", avgDays: 2, recommendation: "Batch ship at 4 PM cutoff — next-day delivery for KL/KA, 2-day for TN" },
    { zone: "North India (DL, UP, HR)", orders: 5, courier: "DTDC", cost: 950, weight: "3.1 kg", avgDays: 3, recommendation: "Use DTDC surface for non-urgent, BlueDart express for urgent cases" },
    { zone: "East India (WB, BR, JH)", orders: 4, courier: "India Post", cost: 600, weight: "2.8 kg", avgDays: 5, recommendation: "India Post cheapest but slow (5-7 days). Use Speed Post for first-time patients (₹150 extra, 3 days faster)" },
    { zone: "West India (MH, GJ, RJ)", orders: 6, courier: "Delhivery", cost: 1080, weight: "3.6 kg", avgDays: 3, recommendation: "Mumbai/Pune: Same courier batch. Rajasthan: Add 1 day buffer" },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">AI batches orders by pincode zone, suggests cheapest/fastest courier per route</p>
      <div className="space-y-3">
        {batches.map((batch, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm">{batch.zone}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{batch.orders} orders • {batch.weight} • {batch.avgDays} days avg delivery</p>
                  <p className="text-[10px] mt-2 text-purple-700 bg-purple-50 p-2 rounded">{batch.recommendation}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-[10px]">{batch.courier}</Badge>
                  <p className="text-sm font-bold mt-1">₹{batch.cost}</p>
                  <p className="text-[10px] text-muted-foreground">shipping cost</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-green-200 bg-green-50/30">
        <CardContent className="p-3 text-xs text-green-700">
          <strong>Today's optimization:</strong> Batching 23 orders into 4 zone-wise shipments saves ₹1,850 vs individual dispatch.
          Monthly courier cost: ₹28,000 (avg 180 shipments). Recommended: Negotiate volume discount with Delhivery (current 45% of volume).
        </CardContent>
      </Card>
    </div>
  );
}


// ─── MAIN COMPONENT ───
export default function CourierDispatch() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Truck className="h-6 w-6 text-purple-600" /> Courier Medicine Dispatch
        </h1>
        <p className="text-muted-foreground mt-1">
          Central pharmacy → Pack → Courier → Patient doorstep. For camps, teleconsult, and remote patients.
        </p>
      </div>

      <Card className="border-indigo-200 bg-indigo-50/30">
        <CardContent className="p-3 text-xs text-indigo-700">
          <strong>Flow:</strong> Doctor writes Rx (at branch / camp / teleconsult) → Patient pays (UPI/Card/COD) →
          Central store picks &amp; packs → Courier dispatches → Patient receives at home (2-5 days) →
          Monthly auto-refill cycle continues via courier. No pharmacy needed at branch.
        </CardContent>
      </Card>

      <Tabs defaultValue="queue" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="queue" className="text-xs">Dispatch Queue</TabsTrigger>
          <TabsTrigger value="tracking" className="text-xs">Courier Tracking</TabsTrigger>
          <TabsTrigger value="refill" className="text-xs">Monthly Refill</TabsTrigger>
          <TabsTrigger value="camps" className="text-xs">Camp Orders</TabsTrigger>
          <TabsTrigger value="cod" className="text-xs">COD Reconciliation</TabsTrigger>
          <TabsTrigger value="comm" className="text-xs">Communication</TabsTrigger>
          <TabsTrigger value="ai-route" className="text-xs">AI Route</TabsTrigger>
        </TabsList>

        <TabsContent value="queue"><DispatchQueueTab /></TabsContent>
        <TabsContent value="tracking"><CourierTrackingTab /></TabsContent>
        <TabsContent value="refill"><MonthlyRefillTab /></TabsContent>
        <TabsContent value="camps"><CampOrdersTab /></TabsContent>
        <TabsContent value="cod"><CodReconciliationTab /></TabsContent>
        <TabsContent value="comm"><PatientCommTab /></TabsContent>
        <TabsContent value="ai-route"><AiRouteTab /></TabsContent>
      </Tabs>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3">
          <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-purple-800">AI Courier Intelligence</p>
            <p className="text-sm text-purple-700">
              <strong>This month:</strong> 180 shipments dispatched pan-India. Avg delivery: 3.2 days.
              Delivery success rate: 94% first attempt (6% RTO — mostly wrong address from camp registrations).
              <br/><strong>Revenue from courier model:</strong> ₹1.73L this month (zero pharmacy infrastructure at branches).
              <br/><strong>Patient retention:</strong> Monthly auto-refill patients have 88% adherence vs 62% for walk-in-only.
              <br/><strong>Suggestion:</strong> Offer ₹50 discount on prepaid orders to reduce COD (COD has 4% RTO + delayed remittance).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
