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
  Warehouse, Brain, Package, Truck, CheckCircle, Clock,
  ArrowRight, Building2, Users, Receipt, BarChart3, AlertTriangle,
  FileText, ShoppingCart, Globe,
} from "lucide-react";

// ─── TAB 1: SUPPLIER MANAGEMENT ───
function SuppliersTab() {
  const suppliers = [
    { name: "X Ayush Agency", type: "Internal", gst: "29XXXXX1234A1Z5", contact: "X Person", credit: "N/A (same owner)", items: 145, status: "active" },
    { name: "X Pharmaceuticals", type: "Internal", gst: "29XXXXX5678B1Z3", contact: "X Person", credit: "N/A (same owner)", items: 62, status: "active" },
    { name: "AVN Kottakkal", type: "External", gst: "32AABCV1234C1ZP", contact: "Sales Dept", credit: "30 days", items: 210, status: "active" },
    { name: "Arya Vaidya Pharmacy", type: "External", gst: "32AABCA5678D1ZQ", contact: "Mr. Rajan", credit: "45 days", items: 180, status: "active" },
    { name: "Dabur Ayurvedics", type: "External", gst: "07AABCD1234E1ZR", contact: "Regional Mgr", credit: "30 days", items: 95, status: "active" },
    { name: "SNA Oushadhasala", type: "External", gst: "32AABCS1234F1ZS", contact: "Mr. Suresh", credit: "21 days", items: 120, status: "active" },
    { name: "Nagarjuna Herbal", type: "External", gst: "32AABCN1234G1ZT", contact: "Sales Team", credit: "30 days", items: 88, status: "active" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Manage internal & external suppliers to central store</p>
        <Button size="sm" onClick={() => toast.success("Add supplier form opened")}>+ Add Supplier</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left">Supplier</th>
              <th className="px-3 py-2 text-center">Type</th>
              <th className="px-3 py-2 text-left">GSTIN</th>
              <th className="px-3 py-2 text-left">Contact</th>
              <th className="px-3 py-2 text-center">Credit Terms</th>
              <th className="px-3 py-2 text-center">Items</th>
              <th className="px-3 py-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s, i) => (
              <tr key={i} className="border-b hover:bg-muted/30">
                <td className="px-3 py-2 font-medium text-xs">{s.name}</td>
                <td className="px-3 py-2 text-center">
                  <Badge variant={s.type === "Internal" ? "default" : "secondary"} className="text-[10px]">{s.type}</Badge>
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{s.gst}</td>
                <td className="px-3 py-2 text-xs">{s.contact}</td>
                <td className="px-3 py-2 text-center text-xs">{s.credit}</td>
                <td className="px-3 py-2 text-center font-bold text-xs">{s.items}</td>
                <td className="px-3 py-2 text-center"><Badge variant="outline" className="text-[10px] text-green-600">Active</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="p-3 text-xs text-blue-700">
          <strong>Internal Suppliers</strong> (X Ayush Agency, X Pharmaceuticals) are owned by the same proprietor (X Person).
          Stock transfers from these don't attract GST within same state — only delivery challan required.
          External suppliers follow regular PO → GRN → Payment cycle.
        </CardContent>
      </Card>
    </div>
  );
}

// ─── TAB 2: CENTRAL INVENTORY ───
function InventoryTab() {
  const inventory = [
    { item: "Rasnasaptakam Kashayam 450ml", supplier: "AVN Kottakkal", stock: 320, batch: "RSK-0726-A", expiry: "Jun 2028", grn: "GRN-4521", cost: 145 },
    { item: "Simhanada Guggulu 60t", supplier: "X Pharmaceuticals", stock: 580, batch: "SNG-0726-B", expiry: "Mar 2028", grn: "GRN-4520", cost: 85 },
    { item: "Kottamchukkadi Taila 200ml", supplier: "X Ayush Agency", stock: 210, batch: "KCT-0726-C", expiry: "Dec 2027", grn: "GRN-4519", cost: 165 },
    { item: "Ashwagandha Churna 100g", supplier: "Nagarjuna Herbal", stock: 450, batch: "ASC-0726-D", expiry: "Sep 2027", grn: "GRN-4518", cost: 95 },
    { item: "Dashamoolarishtam 450ml", supplier: "Arya Vaidya Pharmacy", stock: 280, batch: "DMA-0726-E", expiry: "Jan 2028", grn: "GRN-4517", cost: 135 },
    { item: "Triphala Churna 100g", supplier: "Dabur Ayurvedics", stock: 620, batch: "TPC-0726-F", expiry: "Nov 2027", grn: "GRN-4516", cost: 55 },
    { item: "Chandraprabha Vati 60t", supplier: "SNA Oushadhasala", stock: 340, batch: "CPV-0726-G", expiry: "Aug 2027", grn: "GRN-4515", cost: 110 },
    { item: "Mahanarayan Taila 200ml", supplier: "X Ayush Agency", stock: 175, batch: "MNT-0726-H", expiry: "Feb 2028", grn: "GRN-4514", cost: 180 },
  ];
  const totalValue = inventory.reduce((s, i) => s + i.stock * i.cost, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{inventory.length}</p><p className="text-xs text-muted-foreground">SKUs in Central</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{inventory.reduce((s, i) => s + i.stock, 0).toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Units</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">₹{(totalValue / 100000).toFixed(1)}L</p><p className="text-xs text-muted-foreground">Inventory Value</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">7</p><p className="text-xs text-muted-foreground">Suppliers</p></CardContent></Card>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left">Item</th>
              <th className="px-3 py-2 text-left">Supplier</th>
              <th className="px-3 py-2 text-center">Stock</th>
              <th className="px-3 py-2 text-center">Batch</th>
              <th className="px-3 py-2 text-center">Expiry</th>
              <th className="px-3 py-2 text-right">Cost/Unit</th>
              <th className="px-3 py-2 text-center">GRN</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item, i) => (
              <tr key={i} className="border-b hover:bg-muted/30">
                <td className="px-3 py-2 font-medium text-xs">{item.item}</td>
                <td className="px-3 py-2 text-xs"><Badge variant={item.supplier.includes("X ") ? "default" : "secondary"} className="text-[10px]">{item.supplier}</Badge></td>
                <td className="px-3 py-2 text-center font-bold text-xs">{item.stock}</td>
                <td className="px-3 py-2 text-center text-xs text-muted-foreground">{item.batch}</td>
                <td className="px-3 py-2 text-center text-xs">{item.expiry}</td>
                <td className="px-3 py-2 text-right text-xs">₹{item.cost}</td>
                <td className="px-3 py-2 text-center text-xs text-blue-600">{item.grn}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── TAB 3: BRANCH INDENT ───
function IndentTab() {
  const indents = [
    { id: "IND-1087", branch: "Branch - Koramangala", items: 12, value: 18500, date: "22 Jul", status: "pending", priority: "normal" },
    { id: "IND-1086", branch: "Branch - HSR Layout", items: 8, value: 12200, date: "21 Jul", status: "approved", priority: "urgent" },
    { id: "IND-1085", branch: "Franchise - Chennai", items: 15, value: 32000, date: "20 Jul", status: "dispatched", priority: "normal" },
    { id: "IND-1084", branch: "Branch - Indiranagar", items: 6, value: 9800, date: "19 Jul", status: "received", priority: "normal" },
    { id: "IND-1083", branch: "Franchise - Hyderabad", items: 20, value: 45000, date: "18 Jul", status: "received", priority: "normal" },
  ];

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-blue-100 text-blue-700",
    dispatched: "bg-purple-100 text-purple-700",
    received: "bg-green-100 text-green-700",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Branch/franchise raise indent → Central approves → Dispatch</p>
        <Button size="sm" onClick={() => toast.success("New indent form opened")}>+ Raise Indent</Button>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><Clock className="h-4 w-4 mx-auto text-amber-600" /><p className="text-lg font-bold text-amber-600">{indents.filter(i => i.status === "pending").length}</p><p className="text-[10px] text-muted-foreground">Pending</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><CheckCircle className="h-4 w-4 mx-auto text-blue-600" /><p className="text-lg font-bold text-blue-600">{indents.filter(i => i.status === "approved").length}</p><p className="text-[10px] text-muted-foreground">Approved</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Truck className="h-4 w-4 mx-auto text-purple-600" /><p className="text-lg font-bold text-purple-600">{indents.filter(i => i.status === "dispatched").length}</p><p className="text-[10px] text-muted-foreground">Dispatched</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><CheckCircle className="h-4 w-4 mx-auto text-green-600" /><p className="text-lg font-bold text-green-600">{indents.filter(i => i.status === "received").length}</p><p className="text-[10px] text-muted-foreground">Received</p></CardContent></Card>
      </div>
      <div className="space-y-2">
        {indents.map((ind) => (
          <Card key={ind.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{ind.id}</p>
                    <Badge className={`text-[10px] ${statusColors[ind.status]}`}>{ind.status}</Badge>
                    {ind.priority === "urgent" && <Badge variant="destructive" className="text-[10px]">Urgent</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{ind.branch} • {ind.items} items • {ind.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm">₹{ind.value.toLocaleString()}</p>
                {ind.status === "pending" && <Button size="sm" className="h-7 text-xs" onClick={() => toast.success(`${ind.id} approved`)}>Approve</Button>}
                {ind.status === "approved" && <Button size="sm" className="h-7 text-xs" onClick={() => toast.success(`${ind.id} dispatched`)}>Dispatch</Button>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── TAB 4: TRANSFER PRICING ───
function TransferPricingTab() {
  const rules = [
    { entityType: "Own Branch (same state)", example: "Branch Koramangala, HSR", pricing: "At Cost (₹0 margin)", document: "Delivery Challan", gst: "No GST (stock transfer)", reason: "Same owner, same state — no sale" },
    { entityType: "Own Branch (different state)", example: "Branch Chennai, Hyderabad", pricing: "At Cost + 5% handling", document: "Tax Invoice (IGST)", gst: "IGST applicable", reason: "Inter-state supply even to own branch requires GST" },
    { entityType: "Franchise (same state)", example: "Franchise Bangalore", pricing: "MRP - 30% discount", document: "Tax Invoice (CGST+SGST)", gst: "CGST + SGST", reason: "Different entity — regular sale with margin" },
    { entityType: "Franchise (different state)", example: "Franchise Delhi, Mumbai", pricing: "MRP - 25% discount", document: "Tax Invoice (IGST)", gst: "IGST applicable", reason: "Inter-state sale to different entity" },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Pricing rules for stock transfers — auto-applied based on branch/franchise type</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left">Entity Type</th>
              <th className="px-3 py-2 text-left">Example</th>
              <th className="px-3 py-2 text-left">Pricing Rule</th>
              <th className="px-3 py-2 text-left">Document</th>
              <th className="px-3 py-2 text-left">GST Treatment</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r, i) => (
              <tr key={i} className="border-b hover:bg-muted/30">
                <td className="px-3 py-2 font-medium text-xs">{r.entityType}</td>
                <td className="px-3 py-2 text-[10px] text-muted-foreground">{r.example}</td>
                <td className="px-3 py-2 text-xs font-bold">{r.pricing}</td>
                <td className="px-3 py-2 text-xs">{r.document}</td>
                <td className="px-3 py-2 text-xs">{r.gst}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Card className="border-green-200 bg-green-50/30">
        <CardContent className="p-3 text-xs text-green-700 space-y-1">
          <p><strong>Ownership Structure:</strong></p>
          <p>• X Ayush Healthcare Pvt Ltd (Central Store + Own Branches) — Company</p>
          <p>• X Ayush Agency (Supplier) — Sole Proprietorship (X Person)</p>
          <p>• X Pharmaceuticals (Manufacturer) — Sole Proprietorship (X Person)</p>
          <p className="mt-2"><strong>Note:</strong> Transfers between Pvt Ltd and Proprietorship entities are treated as sales (different legal entities) even though same person owns both. GST invoice required.</p>
        </CardContent>
      </Card>
      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-3 flex items-start gap-2"><Brain className="h-4 w-4 text-purple-600 mt-0.5" /><div><p className="font-semibold text-xs text-purple-800">AI Pricing Engine</p><p className="text-[10px] text-purple-700">System auto-selects document type and GST treatment based on recipient branch/franchise registration. For franchisees, AI suggests optimal discount slab based on their monthly volume to maximize retention.</p></div></CardContent>
      </Card>
    </div>
  );
}

// ─── TAB 5: DISPATCH & TRACKING ───
function DispatchTab() {
  const dispatches = [
    { id: "DSP-3021", indent: "IND-1085", branch: "Franchise - Chennai", items: 15, boxes: 3, courier: "DTDC", tracking: "D12345678", dispatched: "20 Jul", eta: "23 Jul", status: "in_transit" },
    { id: "DSP-3020", indent: "IND-1086", branch: "Branch - HSR Layout", items: 8, boxes: 1, courier: "Self (driver)", tracking: "—", dispatched: "21 Jul", eta: "21 Jul", status: "delivered" },
    { id: "DSP-3019", indent: "IND-1083", branch: "Franchise - Hyderabad", items: 20, boxes: 4, courier: "BlueDart", tracking: "B98765432", dispatched: "18 Jul", eta: "21 Jul", status: "delivered" },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Track dispatches from central store to branches/franchisees</p>
      <div className="space-y-3">
        {dispatches.map((d) => (
          <Card key={d.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{d.id}</p>
                    <ArrowRight className="h-3 w-3" />
                    <p className="text-sm">{d.branch}</p>
                    <Badge variant={d.status === "delivered" ? "outline" : "default"} className={`text-[10px] ${d.status === "delivered" ? "text-green-600" : ""}`}>
                      {d.status === "in_transit" ? "In Transit" : "Delivered"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Indent: {d.indent} • {d.items} items • {d.boxes} boxes • {d.courier}
                  </p>
                  {d.tracking !== "—" && <p className="text-xs mt-1">Tracking: <span className="font-mono text-blue-600">{d.tracking}</span></p>}
                </div>
                <div className="text-right text-xs">
                  <p>Dispatched: {d.dispatched}</p>
                  <p className="text-muted-foreground">ETA: {d.eta}</p>
                  {d.status === "in_transit" && <Button size="sm" variant="outline" className="h-6 text-[10px] mt-1" onClick={() => toast.success("Tracking page opened")}>Track</Button>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── TAB 6: FRANCHISE SUPPLY ───
function FranchiseSupplyTab() {
  const franchisees = [
    { name: "Spine Ayush - Chennai", owner: "Dr. Partner A", joined: "Jan 2026", monthlyAvg: 85000, credit: 45000, creditLimit: 100000, lastOrder: "20 Jul", discount: "30%", status: "active" },
    { name: "Spine Ayush - Hyderabad", owner: "Dr. Partner B", joined: "Mar 2026", monthlyAvg: 62000, credit: 22000, creditLimit: 75000, lastOrder: "18 Jul", discount: "28%", status: "active" },
    { name: "Spine Ayush - Mumbai", owner: "Dr. Partner C", joined: "Jun 2026", monthlyAvg: 35000, credit: 0, creditLimit: 50000, lastOrder: "15 Jul", discount: "25%", status: "active" },
    { name: "Spine Ayush - Delhi", owner: "Dr. Partner D", joined: "Jul 2026", monthlyAvg: 0, credit: 0, creditLimit: 30000, lastOrder: "—", discount: "25%", status: "new" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Franchise medicine supply — credit management, discount tiers</p>
        <Button size="sm" variant="outline" onClick={() => toast.success("Franchise onboarding form opened")}>+ Add Franchise</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left">Franchise</th>
              <th className="px-3 py-2 text-left">Owner</th>
              <th className="px-3 py-2 text-center">Monthly Avg</th>
              <th className="px-3 py-2 text-center">Credit Used</th>
              <th className="px-3 py-2 text-center">Discount</th>
              <th className="px-3 py-2 text-center">Last Order</th>
              <th className="px-3 py-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {franchisees.map((f, i) => (
              <tr key={i} className="border-b hover:bg-muted/30">
                <td className="px-3 py-2 font-medium text-xs">{f.name}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{f.owner}</td>
                <td className="px-3 py-2 text-center text-xs">₹{f.monthlyAvg.toLocaleString()}</td>
                <td className="px-3 py-2 text-center text-xs">
                  <span className={f.credit > f.creditLimit * 0.8 ? "text-red-600 font-bold" : ""}>₹{f.credit.toLocaleString()}</span>
                  <span className="text-muted-foreground"> / ₹{f.creditLimit.toLocaleString()}</span>
                </td>
                <td className="px-3 py-2 text-center font-bold text-xs text-green-600">{f.discount}</td>
                <td className="px-3 py-2 text-center text-xs">{f.lastOrder}</td>
                <td className="px-3 py-2 text-center"><Badge variant={f.status === "new" ? "secondary" : "outline"} className={`text-[10px] ${f.status === "active" ? "text-green-600" : ""}`}>{f.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Card className="border-amber-200 bg-amber-50/30">
        <CardContent className="p-3 text-xs text-amber-700">
          <strong>Discount Tier Logic:</strong> Base 25% for new franchisees → 28% after ₹50K/month avg → 30% after ₹75K/month avg → 32% after ₹1L/month (loyalty tier). Credit limit auto-adjusts based on payment history.
        </CardContent>
      </Card>
    </div>
  );
}

// ─── TAB 7: RECONCILIATION ───
function ReconciliationTab() {
  const reconciliation = [
    { branch: "Branch - Koramangala", centralDispatched: 156, branchReceived: 156, difference: 0, value: 0, status: "matched" },
    { branch: "Branch - HSR Layout", centralDispatched: 89, branchReceived: 87, difference: -2, value: -290, status: "shortage" },
    { branch: "Franchise - Chennai", centralDispatched: 210, branchReceived: 210, difference: 0, value: 0, status: "matched" },
    { branch: "Franchise - Hyderabad", centralDispatched: 145, branchReceived: 143, difference: -2, value: -380, status: "shortage" },
    { branch: "Branch - Indiranagar", centralDispatched: 72, branchReceived: 72, difference: 0, value: 0, status: "matched" },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Reconcile central dispatches vs branch receipts — find transit losses</p>
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold text-green-600">{reconciliation.filter(r => r.status === "matched").length}</p><p className="text-xs text-muted-foreground">Matched</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-red-600">{reconciliation.filter(r => r.status === "shortage").length}</p><p className="text-xs text-muted-foreground">Shortage</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">₹{Math.abs(reconciliation.reduce((s, r) => s + r.value, 0))}</p><p className="text-xs text-muted-foreground">Total Discrepancy</p></CardContent></Card>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left">Branch</th>
              <th className="px-3 py-2 text-center">Dispatched</th>
              <th className="px-3 py-2 text-center">Received</th>
              <th className="px-3 py-2 text-center">Difference</th>
              <th className="px-3 py-2 text-center">Value</th>
              <th className="px-3 py-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {reconciliation.map((r, i) => (
              <tr key={i} className={`border-b ${r.status !== "matched" ? "bg-red-50/50" : ""}`}>
                <td className="px-3 py-2 font-medium text-xs">{r.branch}</td>
                <td className="px-3 py-2 text-center text-xs">{r.centralDispatched}</td>
                <td className="px-3 py-2 text-center text-xs">{r.branchReceived}</td>
                <td className="px-3 py-2 text-center font-bold text-xs"><span className={r.difference < 0 ? "text-red-600" : "text-green-600"}>{r.difference}</span></td>
                <td className="px-3 py-2 text-center text-xs">{r.value !== 0 ? <span className="text-red-600">₹{Math.abs(r.value)}</span> : "—"}</td>
                <td className="px-3 py-2 text-center"><Badge variant={r.status === "matched" ? "outline" : "destructive"} className={`text-[10px] ${r.status === "matched" ? "text-green-600" : ""}`}>{r.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-3 flex items-start gap-2"><Brain className="h-4 w-4 text-purple-600 mt-0.5" /><div><p className="font-semibold text-xs text-purple-800">AI Reconciliation</p><p className="text-[10px] text-purple-700">2 shortages in July — both courier-shipped orders. Self-delivered (own driver) has 100% match rate. AI recommends: Use own logistics for orders over ₹15K. For couriers, add tamper-seal + photo verification at receipt. Insurance claim raised for HSR shortage (₹290).</p></div></CardContent>
      </Card>
    </div>
  );
}

// ─── TAB 8: AI DEMAND PLANNING ───
function AiDemandTab() {
  const forecast = [
    { branch: "Branch - Koramangala", nextMonth: 82000, trend: "+12%", topItems: "Rasnasaptakam, Simhanada Guggulu, Kottamchukkadi Taila", season: "Varsha boost", confidence: 87 },
    { branch: "Branch - HSR Layout", nextMonth: 58000, trend: "+8%", topItems: "Kottamchukkadi Taila, Mahanarayan Taila, Dashmool", season: "Normal", confidence: 82 },
    { branch: "Franchise - Chennai", nextMonth: 95000, trend: "+22%", topItems: "Rasnasaptakam, Chandraprabha Vati, Ashwagandha", season: "Post-monsoon prep", confidence: 79 },
    { branch: "Franchise - Hyderabad", nextMonth: 68000, trend: "+15%", topItems: "Simhanada Guggulu, Triphala, Chitrakadi Vati", season: "Monsoon peak", confidence: 84 },
    { branch: "Branch - Indiranagar", nextMonth: 44000, trend: "+5%", topItems: "Ashwagandha, Triphala, Chandraprabha Vati", season: "Normal", confidence: 91 },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">AI predicts next month's demand per branch — plan central store procurement accordingly</p>
      <div className="space-y-3">
        {forecast.map((f, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-sm">{f.branch}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{f.topItems}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">₹{f.nextMonth.toLocaleString()}</p>
                  <p className="text-xs text-green-600">{f.trend} vs last month</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px]">{f.season}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-[10px]">AI Confidence</span>
                  <Progress value={f.confidence} className="w-20 h-1.5" />
                  <span className="font-bold text-[10px]">{f.confidence}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3">
          <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-purple-800">AI Central Store Planning</p>
            <p className="text-sm text-purple-700">
              Total projected demand next month: <strong>₹3.47L</strong> across all branches.
              Top 3 items to pre-stock: Rasnasaptakam (600 units), Kottamchukkadi Taila (180 units), Simhanada Guggulu (350 units).
              <br/>Recommend: Place PO with AVN Kottakkal & X Ayush Agency by <strong>28 Jul</strong> to ensure 5-day buffer before August peak.
              Seasonal alert: Chennai franchise showing 22% spike — likely new patient inflow post-monsoon.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── MAIN COMPONENT ───
export default function CentralStore() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Warehouse className="h-6 w-6 text-indigo-600" /> Central Store Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Hub-and-spoke supply chain — Central store → Own branches + Franchise partners
        </p>
      </div>

      <Card className="border-indigo-200 bg-indigo-50/30">
        <CardContent className="p-3 text-xs text-indigo-700">
          <strong>Structure:</strong> X Ayush Healthcare Pvt Ltd (Central Store + Branches) receives stock from X Ayush Agency + X Pharmaceuticals (internal, same proprietor) and external suppliers (AVN, Arya Vaidya, etc.). Central store supplies to own branches (stock transfer) and franchise partners (sale with discount).
        </CardContent>
      </Card>

      <Tabs defaultValue="suppliers" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="suppliers" className="text-xs">Suppliers</TabsTrigger>
          <TabsTrigger value="inventory" className="text-xs">Central Inventory</TabsTrigger>
          <TabsTrigger value="indent" className="text-xs">Branch Indent</TabsTrigger>
          <TabsTrigger value="pricing" className="text-xs">Transfer Pricing</TabsTrigger>
          <TabsTrigger value="dispatch" className="text-xs">Dispatch</TabsTrigger>
          <TabsTrigger value="franchise" className="text-xs">Franchise Supply</TabsTrigger>
          <TabsTrigger value="reconciliation" className="text-xs">Reconciliation</TabsTrigger>
          <TabsTrigger value="ai-demand" className="text-xs">AI Demand</TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers"><SuppliersTab /></TabsContent>
        <TabsContent value="inventory"><InventoryTab /></TabsContent>
        <TabsContent value="indent"><IndentTab /></TabsContent>
        <TabsContent value="pricing"><TransferPricingTab /></TabsContent>
        <TabsContent value="dispatch"><DispatchTab /></TabsContent>
        <TabsContent value="franchise"><FranchiseSupplyTab /></TabsContent>
        <TabsContent value="reconciliation"><ReconciliationTab /></TabsContent>
        <TabsContent value="ai-demand"><AiDemandTab /></TabsContent>
      </Tabs>
    </div>
  );
}
