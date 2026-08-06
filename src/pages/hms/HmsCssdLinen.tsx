import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Shield, Shirt, FlaskConical, Plus, Search,
  CheckCircle, Clock, AlertTriangle, Package,
  Thermometer, RotateCcw, Calendar,
} from "lucide-react";

type CssdItem = {
  id: string; itemName: string; department: string; quantity: number;
  sterilizationMethod: string; cycleNo: string; status: "Sterilized" | "In Process" | "Pending" | "Expired";
  sterilizedAt: string; expiresAt: string; operator: string;
};

type LinenItem = {
  id: string; itemName: string; department: string; issued: number; returned: number;
  damaged: number; status: "In Use" | "In Laundry" | "Available" | "Condemned";
  lastWashed: string; nextDue: string;
};

type DentalLabOrder = {
  id: string; patient: string; doctor: string; labName: string; workType: string;
  shade: string; sentDate: string; expectedDate: string; receivedDate: string;
  status: "Sent" | "In Progress" | "Ready" | "Received" | "Delivered";
  amount: number; notes: string;
};

const mockCssd: CssdItem[] = [
  { id: "1", itemName: "Surgical Instrument Set A", department: "OT", quantity: 5, sterilizationMethod: "Autoclave (121°C)", cycleNo: "CY-2026-0715-01", status: "Sterilized", sterilizedAt: "2026-07-22 06:00", expiresAt: "2026-07-29", operator: "Bhavani" },
  { id: "2", itemName: "Panchakarma Basti Kit", department: "Panchakarma", quantity: 8, sterilizationMethod: "Autoclave (134°C)", cycleNo: "CY-2026-0715-02", status: "Sterilized", sterilizedAt: "2026-07-22 06:30", expiresAt: "2026-07-29", operator: "Bhavani" },
  { id: "3", itemName: "Nasya Application Set", department: "Panchakarma", quantity: 10, sterilizationMethod: "Chemical (Cidex)", cycleNo: "CY-2026-0715-03", status: "In Process", sterilizedAt: "", expiresAt: "", operator: "Sankari" },
  { id: "4", itemName: "Dressing Drum (Large)", department: "IPD", quantity: 3, sterilizationMethod: "Autoclave (121°C)", cycleNo: "CY-2026-0714-05", status: "Expired", sterilizedAt: "2026-07-14 06:00", expiresAt: "2026-07-21", operator: "Bhavani" },
  { id: "5", itemName: "Raktamokshana (Leech Kit)", department: "Panchakarma", quantity: 2, sterilizationMethod: "ETO Gas", cycleNo: "CY-2026-0715-04", status: "Pending", sterilizedAt: "", expiresAt: "", operator: "" },
  { id: "6", itemName: "Suction Catheter Pack", department: "OT", quantity: 12, sterilizationMethod: "Autoclave (134°C)", cycleNo: "CY-2026-0715-05", status: "Sterilized", sterilizedAt: "2026-07-22 07:00", expiresAt: "2026-07-29", operator: "Bhavani" },
];

const mockLinen: LinenItem[] = [
  { id: "1", itemName: "Bed Sheet (White)", department: "IPD", issued: 25, returned: 22, damaged: 1, status: "In Use", lastWashed: "2026-07-21", nextDue: "2026-07-23" },
  { id: "2", itemName: "Pillow Cover", department: "IPD", issued: 30, returned: 28, damaged: 0, status: "Available", lastWashed: "2026-07-22", nextDue: "2026-07-24" },
  { id: "3", itemName: "Patient Gown (Green)", department: "OT", issued: 15, returned: 12, damaged: 2, status: "In Laundry", lastWashed: "2026-07-20", nextDue: "2026-07-22" },
  { id: "4", itemName: "Panchakarma Drape (Oil-resistant)", department: "Panchakarma", issued: 10, returned: 8, damaged: 1, status: "In Laundry", lastWashed: "2026-07-21", nextDue: "2026-07-22" },
  { id: "5", itemName: "Towel (Bath)", department: "IPD", issued: 20, returned: 18, damaged: 0, status: "In Use", lastWashed: "2026-07-21", nextDue: "2026-07-23" },
  { id: "6", itemName: "OT Gown (Surgeon)", department: "OT", issued: 8, returned: 8, damaged: 0, status: "Available", lastWashed: "2026-07-22", nextDue: "2026-07-24" },
  { id: "7", itemName: "Blanket (Woolen)", department: "IPD", issued: 12, returned: 10, damaged: 1, status: "Condemned", lastWashed: "2026-07-15", nextDue: "—" },
];

const mockDentalLab: DentalLabOrder[] = [
  { id: "1", patient: "Ramesh Kumar", doctor: "Dr. Dental", labName: "Excel Dental Lab", workType: "PFM Crown", shade: "A2", sentDate: "2026-07-18", expectedDate: "2026-07-25", receivedDate: "", status: "In Progress", amount: 3500, notes: "Upper right molar" },
  { id: "2", patient: "Priya Menon", doctor: "Dr. Dental", labName: "Excel Dental Lab", workType: "Zirconia Bridge (3 unit)", shade: "A1", sentDate: "2026-07-15", expectedDate: "2026-07-22", receivedDate: "2026-07-22", status: "Received", amount: 18000, notes: "Anterior bridge. Trial done." },
  { id: "3", patient: "Sunil Menon", doctor: "Dr. Dental", labName: "Star Dental Lab", workType: "Complete Denture (Upper)", shade: "—", sentDate: "2026-07-20", expectedDate: "2026-07-28", receivedDate: "", status: "Sent", amount: 8000, notes: "Impression stage" },
  { id: "4", patient: "Lakshmi Nair", doctor: "Dr. Dental", labName: "Excel Dental Lab", workType: "Removable Partial Denture", shade: "—", sentDate: "2026-07-10", expectedDate: "2026-07-18", receivedDate: "2026-07-17", status: "Delivered", amount: 6000, notes: "Delivered to patient" },
];

const HmsCssdLinen = () => {
  const [activeModule, setActiveModule] = useState("cssd");
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Tabs value={activeModule} onValueChange={setActiveModule}>
        <TabsList className="grid grid-cols-3 w-full sm:w-[500px]">
          <TabsTrigger value="cssd"><Shield className="mr-1 h-4 w-4" /> CSSD</TabsTrigger>
          <TabsTrigger value="linen"><Shirt className="mr-1 h-4 w-4" /> Linen</TabsTrigger>
          <TabsTrigger value="dental"><FlaskConical className="mr-1 h-4 w-4" /> Dental Lab Order</TabsTrigger>
        </TabsList>

        {/* CSSD Tab */}
        <TabsContent value="cssd" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2"><Shield className="h-5 w-5 text-orange-600" /> CSSD — Central Sterile Services</h2>
              <p className="text-xs text-muted-foreground">Sterilization tracking, cycle logs, expiry alerts</p>
            </div>
            <Button size="sm" onClick={() => { setAddOpen(true); }}><Plus className="mr-1 h-4 w-4" /> New Cycle</Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card><CardContent className="p-3 text-center"><CheckCircle className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold mt-1">{mockCssd.filter(c => c.status === "Sterilized").length}</p><p className="text-xs text-muted-foreground">Sterilized</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><Clock className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">{mockCssd.filter(c => c.status === "In Process").length}</p><p className="text-xs text-muted-foreground">In Process</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><Package className="h-5 w-5 mx-auto text-amber-600" /><p className="text-xl font-bold mt-1">{mockCssd.filter(c => c.status === "Pending").length}</p><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card>
            <Card className="border-red-200"><CardContent className="p-3 text-center"><AlertTriangle className="h-5 w-5 mx-auto text-red-600" /><p className="text-xl font-bold mt-1 text-red-600">{mockCssd.filter(c => c.status === "Expired").length}</p><p className="text-xs text-muted-foreground">Expired</p></CardContent></Card>
          </div>
          <Card><CardContent className="p-0"><div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50"><tr>
                <th className="px-3 py-2 text-left font-medium text-orange-700">Item</th>
                <th className="px-3 py-2 text-left font-medium text-orange-700">Department</th>
                <th className="px-3 py-2 text-left font-medium text-orange-700">Qty</th>
                <th className="px-3 py-2 text-left font-medium text-orange-700">Method</th>
                <th className="px-3 py-2 text-left font-medium text-orange-700">Cycle No</th>
                <th className="px-3 py-2 text-left font-medium text-orange-700">Sterilized</th>
                <th className="px-3 py-2 text-left font-medium text-orange-700">Expires</th>
                <th className="px-3 py-2 text-left font-medium text-orange-700">Operator</th>
                <th className="px-3 py-2 text-left font-medium text-orange-700">Status</th>
              </tr></thead>
              <tbody>
                {mockCssd.map(c => (
                  <tr key={c.id} className={`border-b hover:bg-muted/30 ${c.status === "Expired" ? "bg-red-50/30" : ""}`}>
                    <td className="px-3 py-2 font-medium text-xs">{c.itemName}</td>
                    <td className="px-3 py-2 text-xs">{c.department}</td>
                    <td className="px-3 py-2 text-xs">{c.quantity}</td>
                    <td className="px-3 py-2 text-xs">{c.sterilizationMethod}</td>
                    <td className="px-3 py-2 text-xs font-mono">{c.cycleNo}</td>
                    <td className="px-3 py-2 text-xs">{c.sterilizedAt || "—"}</td>
                    <td className="px-3 py-2 text-xs">{c.expiresAt || "—"}</td>
                    <td className="px-3 py-2 text-xs">{c.operator || "—"}</td>
                    <td className="px-3 py-2"><Badge variant={c.status === "Sterilized" ? "outline" : c.status === "Expired" ? "destructive" : c.status === "In Process" ? "default" : "secondary"} className={`text-[10px] ${c.status === "Sterilized" ? "text-green-600" : ""}`}>{c.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div></CardContent></Card>
        </TabsContent>

        {/* Linen Tab */}
        <TabsContent value="linen" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2"><Shirt className="h-5 w-5 text-orange-600" /> Linen Management</h2>
              <p className="text-xs text-muted-foreground">Issue, return, laundry tracking, damage/condemnation</p>
            </div>
            <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Issue Linen</Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{mockLinen.filter(l => l.status === "In Use").length}</p><p className="text-xs text-muted-foreground">In Use</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><RotateCcw className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">{mockLinen.filter(l => l.status === "In Laundry").length}</p><p className="text-xs text-muted-foreground">In Laundry</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><CheckCircle className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold mt-1">{mockLinen.filter(l => l.status === "Available").length}</p><p className="text-xs text-muted-foreground">Available</p></CardContent></Card>
            <Card className="border-red-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-red-600">{mockLinen.reduce((s, l) => s + l.damaged, 0)}</p><p className="text-xs text-muted-foreground">Damaged/Condemned</p></CardContent></Card>
          </div>
          <Card><CardContent className="p-0"><div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50"><tr>
                <th className="px-3 py-2 text-left font-medium text-orange-700">Item</th>
                <th className="px-3 py-2 text-left font-medium text-orange-700">Department</th>
                <th className="px-3 py-2 text-left font-medium text-orange-700">Issued</th>
                <th className="px-3 py-2 text-left font-medium text-orange-700">Returned</th>
                <th className="px-3 py-2 text-left font-medium text-orange-700">Damaged</th>
                <th className="px-3 py-2 text-left font-medium text-orange-700">Last Washed</th>
                <th className="px-3 py-2 text-left font-medium text-orange-700">Next Due</th>
                <th className="px-3 py-2 text-left font-medium text-orange-700">Status</th>
              </tr></thead>
              <tbody>
                {mockLinen.map(l => (
                  <tr key={l.id} className={`border-b hover:bg-muted/30 ${l.status === "Condemned" ? "bg-red-50/30" : ""}`}>
                    <td className="px-3 py-2 font-medium text-xs">{l.itemName}</td>
                    <td className="px-3 py-2 text-xs">{l.department}</td>
                    <td className="px-3 py-2 text-xs">{l.issued}</td>
                    <td className="px-3 py-2 text-xs">{l.returned}</td>
                    <td className="px-3 py-2 text-xs text-red-600">{l.damaged}</td>
                    <td className="px-3 py-2 text-xs">{l.lastWashed}</td>
                    <td className="px-3 py-2 text-xs">{l.nextDue}</td>
                    <td className="px-3 py-2"><Badge variant={l.status === "Available" ? "outline" : l.status === "Condemned" ? "destructive" : l.status === "In Laundry" ? "default" : "secondary"} className={`text-[10px] ${l.status === "Available" ? "text-green-600" : ""}`}>{l.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div></CardContent></Card>
        </TabsContent>

        {/* Dental Lab Order Tab */}
        <TabsContent value="dental" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2"><FlaskConical className="h-5 w-5 text-orange-600" /> Dental Lab Order</h2>
              <p className="text-xs text-muted-foreground">Track crowns, bridges, dentures sent to external labs</p>
            </div>
            <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Order</Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{mockDentalLab.filter(d => d.status === "Sent" || d.status === "In Progress").length}</p><p className="text-xs text-muted-foreground">Pending at Lab</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><CheckCircle className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold mt-1">{mockDentalLab.filter(d => d.status === "Received").length}</p><p className="text-xs text-muted-foreground">Received</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{mockDentalLab.filter(d => d.status === "Delivered").length}</p><p className="text-xs text-muted-foreground">Delivered to Patient</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold">₹{mockDentalLab.reduce((s, d) => s + d.amount, 0).toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Value</p></CardContent></Card>
          </div>
          <Card><CardContent className="p-0"><div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50"><tr>
                <th className="px-3 py-2 text-left font-medium text-orange-700">Patient</th>
                <th className="px-3 py-2 text-left font-medium text-orange-700">Doctor</th>
                <th className="px-3 py-2 text-left font-medium text-orange-700">Lab</th>
                <th className="px-3 py-2 text-left font-medium text-orange-700">Work Type</th>
                <th className="px-3 py-2 text-left font-medium text-orange-700">Shade</th>
                <th className="px-3 py-2 text-left font-medium text-orange-700">Sent</th>
                <th className="px-3 py-2 text-left font-medium text-orange-700">Expected</th>
                <th className="px-3 py-2 text-left font-medium text-orange-700">Amount</th>
                <th className="px-3 py-2 text-left font-medium text-orange-700">Status</th>
              </tr></thead>
              <tbody>
                {mockDentalLab.map(d => (
                  <tr key={d.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 font-medium text-xs">{d.patient}</td>
                    <td className="px-3 py-2 text-xs">{d.doctor}</td>
                    <td className="px-3 py-2 text-xs">{d.labName}</td>
                    <td className="px-3 py-2 text-xs">{d.workType}</td>
                    <td className="px-3 py-2 text-xs">{d.shade}</td>
                    <td className="px-3 py-2 text-xs">{d.sentDate}</td>
                    <td className="px-3 py-2 text-xs">{d.expectedDate}</td>
                    <td className="px-3 py-2 text-xs font-bold">₹{d.amount.toLocaleString()}</td>
                    <td className="px-3 py-2"><Badge variant={d.status === "Delivered" ? "outline" : d.status === "Received" ? "default" : d.status === "In Progress" ? "secondary" : "secondary"} className={`text-[10px] ${d.status === "Delivered" ? "text-green-600" : d.status === "Received" ? "text-blue-600" : ""}`}>{d.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div></CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Sterilization Cycle</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Item Name *</Label><Input placeholder="e.g., Surgical Instrument Set" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Department</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="ot">OT</SelectItem><SelectItem value="pk">Panchakarma</SelectItem><SelectItem value="ipd">IPD</SelectItem><SelectItem value="opd">OPD</SelectItem></SelectContent></Select></div>
              <div><Label>Quantity</Label><Input type="number" placeholder="1" /></div>
            </div>
            <div><Label>Sterilization Method</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="autoclave121">Autoclave (121°C / 15min)</SelectItem><SelectItem value="autoclave134">Autoclave (134°C / 3min)</SelectItem><SelectItem value="eto">ETO Gas</SelectItem><SelectItem value="chemical">Chemical (Cidex/Glutaraldehyde)</SelectItem></SelectContent></Select></div>
            <div><Label>Operator</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="bhavani">Bhavani</SelectItem><SelectItem value="sankari">Sankari</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => { toast.success("Sterilization cycle started"); setAddOpen(false); }}>Start Cycle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsCssdLinen;
