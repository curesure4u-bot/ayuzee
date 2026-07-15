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
import { Cpu, Plus, Search, Edit, Wrench, Calendar, AlertTriangle, CheckCircle, IndianRupee } from "lucide-react";

type Asset = {
  id: string; code: string; name: string; category: string; location: string;
  manufacturer: string; model: string; serialNo: string;
  purchaseDate: string; purchaseValue: number; amcExpiry: string;
  lastCalibration: string; nextCalibration: string;
  status: "working" | "under_maintenance" | "breakdown" | "decommissioned";
};

type MaintenanceLog = {
  id: string; assetCode: string; assetName: string; type: string;
  date: string; vendor: string; cost: number; notes: string; status: "completed" | "scheduled" | "overdue";
};

const mockAssets: Asset[] = [
  { id: "1", code: "AST-001", name: "Digital X-Ray Machine", category: "Radiology", location: "Radiology Dept", manufacturer: "Siemens", model: "Multix Select DR", serialNo: "SN-2024-XR001", purchaseDate: "2023-06-15", purchaseValue: 2500000, amcExpiry: "2027-06-14", lastCalibration: "2026-04-10", nextCalibration: "2026-10-10", status: "working" },
  { id: "2", code: "AST-002", name: "Ultrasound Scanner", category: "Radiology", location: "Radiology Dept", manufacturer: "GE Healthcare", model: "Voluson E10", serialNo: "SN-2024-US002", purchaseDate: "2024-01-20", purchaseValue: 3800000, amcExpiry: "2027-01-19", lastCalibration: "2026-05-15", nextCalibration: "2026-11-15", status: "working" },
  { id: "3", code: "AST-003", name: "Hematology Analyzer", category: "Laboratory", location: "Lab", manufacturer: "Sysmex", model: "XN-1000", serialNo: "SN-2023-HA003", purchaseDate: "2023-03-01", purchaseValue: 1800000, amcExpiry: "2026-02-28", lastCalibration: "2026-06-01", nextCalibration: "2026-12-01", status: "working" },
  { id: "4", code: "AST-004", name: "Shirodhara Machine (Automated)", category: "Panchakarma", location: "PK Room 2", manufacturer: "Ayur Equipments", model: "AE-SD-200", serialNo: "SN-2025-SD004", purchaseDate: "2025-02-10", purchaseValue: 85000, amcExpiry: "2027-02-09", lastCalibration: "N/A", nextCalibration: "N/A", status: "working" },
  { id: "5", code: "AST-005", name: "ECG Machine (12-Lead)", category: "Cardiology", location: "OPD", manufacturer: "BPL", model: "Cardiart 9108", serialNo: "SN-2024-ECG005", purchaseDate: "2024-08-01", purchaseValue: 120000, amcExpiry: "2026-07-31", lastCalibration: "2026-03-20", nextCalibration: "2026-09-20", status: "working" },
  { id: "6", code: "AST-006", name: "Autoclave (Vertical)", category: "CSSD", location: "Sterilization Room", manufacturer: "Labline", model: "LAB-AC-50", serialNo: "SN-2022-AC006", purchaseDate: "2022-05-15", purchaseValue: 150000, amcExpiry: "2025-05-14", lastCalibration: "2026-01-10", nextCalibration: "2026-07-10", status: "under_maintenance" },
  { id: "7", code: "AST-007", name: "Pulse Oximeter (Portable)", category: "Monitoring", location: "IPD Ward", manufacturer: "Nellcor", model: "N-65", serialNo: "SN-2024-PO007", purchaseDate: "2024-04-01", purchaseValue: 25000, amcExpiry: "N/A", lastCalibration: "2026-06-01", nextCalibration: "2026-12-01", status: "working" },
  { id: "8", code: "AST-008", name: "Vasti Yantra (Automated Enema)", category: "Panchakarma", location: "PK Room 3", manufacturer: "Ayur Equipments", model: "AE-VY-100", serialNo: "SN-2025-VY008", purchaseDate: "2025-06-01", purchaseValue: 65000, amcExpiry: "2027-05-31", lastCalibration: "N/A", nextCalibration: "N/A", status: "breakdown" },
];

const mockMaintenance: MaintenanceLog[] = [
  { id: "1", assetCode: "AST-006", assetName: "Autoclave", type: "Preventive", date: "2026-07-15", vendor: "Labline Service", cost: 8500, notes: "Gasket replacement + pressure test", status: "scheduled" },
  { id: "2", assetCode: "AST-001", assetName: "Digital X-Ray", type: "Calibration", date: "2026-04-10", vendor: "Siemens Service", cost: 15000, notes: "Annual calibration - passed", status: "completed" },
  { id: "3", assetCode: "AST-003", assetName: "Hematology Analyzer", type: "AMC Service", date: "2026-06-01", vendor: "Sysmex India", cost: 0, notes: "Quarterly AMC service visit", status: "completed" },
  { id: "4", assetCode: "AST-008", assetName: "Vasti Yantra", type: "Breakdown", date: "2026-07-12", vendor: "Ayur Equipments", cost: 12000, notes: "Motor replacement needed - parts ordered", status: "overdue" },
  { id: "5", assetCode: "AST-005", assetName: "ECG Machine", type: "Calibration", date: "2026-09-20", vendor: "BPL Service", cost: 5000, notes: "Next scheduled calibration", status: "scheduled" },
];

const HmsAssets = () => {
  const [assets] = useState<Asset[]>(mockAssets);
  const [maintenance] = useState<MaintenanceLog[]>(mockMaintenance);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = assets.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.code.toLowerCase().includes(search.toLowerCase()));
  const totalValue = assets.reduce((s, a) => s + a.purchaseValue, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Cpu className="h-6 w-6 text-slate-600" /> Asset & Biomedical Equipment
          </h1>
          <p className="text-sm text-muted-foreground">Lifecycle tracking, calibration, maintenance, AMC & breakdown management</p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="mr-1 h-4 w-4" /> Add Asset</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{assets.length}</p><p className="text-xs text-muted-foreground">Total Assets</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold text-green-600">{assets.filter(a => a.status === "working").length}</p><p className="text-xs text-muted-foreground">Working</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-amber-600">{assets.filter(a => a.status === "under_maintenance").length}</p><p className="text-xs text-muted-foreground">Maintenance</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-red-600">{assets.filter(a => a.status === "breakdown").length}</p><p className="text-xs text-muted-foreground">Breakdown</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold">₹{(totalValue / 100000).toFixed(1)}L</p><p className="text-xs text-muted-foreground">Total Value</p></CardContent></Card>
      </div>

      <Tabs defaultValue="assets">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 w-full">
          <TabsTrigger value="assets">Asset Register</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance Log</TabsTrigger>
          <TabsTrigger value="calibration">Calibration Due</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search asset..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Card><CardContent className="p-0"><div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50"><tr>
                <th className="px-2 py-2 text-left font-medium">Code</th>
                <th className="px-2 py-2 text-left font-medium">Asset Name</th>
                <th className="px-2 py-2 text-left font-medium">Category</th>
                <th className="px-2 py-2 text-left font-medium">Location</th>
                <th className="px-2 py-2 text-left font-medium">Manufacturer</th>
                <th className="px-2 py-2 text-left font-medium">AMC Expiry</th>
                <th className="px-2 py-2 text-left font-medium">Next Calib.</th>
                <th className="px-2 py-2 text-left font-medium">Value</th>
                <th className="px-2 py-2 text-left font-medium">Status</th>
              </tr></thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-b hover:bg-muted/30">
                    <td className="px-2 py-2 font-mono text-xs">{a.code}</td>
                    <td className="px-2 py-2"><p className="font-medium text-xs">{a.name}</p><p className="text-[10px] text-muted-foreground">{a.model} · {a.serialNo}</p></td>
                    <td className="px-2 py-2"><Badge variant="outline" className="text-[9px]">{a.category}</Badge></td>
                    <td className="px-2 py-2 text-xs">{a.location}</td>
                    <td className="px-2 py-2 text-xs">{a.manufacturer}</td>
                    <td className="px-2 py-2 text-xs">{a.amcExpiry}</td>
                    <td className="px-2 py-2 text-xs">{a.nextCalibration}</td>
                    <td className="px-2 py-2 text-xs">₹{(a.purchaseValue/1000).toFixed(0)}K</td>
                    <td className="px-2 py-2"><Badge variant={a.status === "working" ? "outline" : a.status === "breakdown" ? "destructive" : "secondary"} className={`text-[9px] capitalize ${a.status === "working" ? "text-green-600" : ""}`}>{a.status.replace("_", " ")}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div></CardContent></Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card><CardContent className="p-0"><div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50"><tr>
                <th className="px-3 py-2 text-left font-medium">Asset</th>
                <th className="px-3 py-2 text-left font-medium">Type</th>
                <th className="px-3 py-2 text-left font-medium">Date</th>
                <th className="px-3 py-2 text-left font-medium">Vendor</th>
                <th className="px-3 py-2 text-left font-medium">Cost</th>
                <th className="px-3 py-2 text-left font-medium">Notes</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
              </tr></thead>
              <tbody>
                {maintenance.map((m) => (
                  <tr key={m.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2"><p className="font-medium text-xs">{m.assetName}</p><p className="text-[10px] text-muted-foreground">{m.assetCode}</p></td>
                    <td className="px-3 py-2"><Badge variant="outline" className="text-[10px]">{m.type}</Badge></td>
                    <td className="px-3 py-2 text-xs">{m.date}</td>
                    <td className="px-3 py-2 text-xs">{m.vendor}</td>
                    <td className="px-3 py-2 text-xs">{m.cost > 0 ? `₹${m.cost.toLocaleString("en-IN")}` : "AMC"}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{m.notes}</td>
                    <td className="px-3 py-2"><Badge variant={m.status === "completed" ? "outline" : m.status === "overdue" ? "destructive" : "secondary"} className={`text-[10px] capitalize ${m.status === "completed" ? "text-green-600" : ""}`}>{m.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div></CardContent></Card>
        </TabsContent>

        <TabsContent value="calibration" className="space-y-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4" /> Upcoming Calibrations</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {assets.filter(a => a.nextCalibration !== "N/A").map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div><p className="text-sm font-medium">{a.name}</p><p className="text-xs text-muted-foreground">{a.code} · {a.location}</p></div>
                    <div className="text-right"><p className="text-sm font-medium">{a.nextCalibration}</p><p className="text-[10px] text-muted-foreground">Last: {a.lastCalibration}</p></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Asset</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Asset Code *</Label><Input placeholder="AST-XXX" /></div>
              <div><Label>Asset Name *</Label><Input placeholder="Equipment name" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Category</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="Radiology">Radiology</SelectItem><SelectItem value="Laboratory">Laboratory</SelectItem><SelectItem value="Panchakarma">Panchakarma</SelectItem><SelectItem value="Cardiology">Cardiology</SelectItem><SelectItem value="CSSD">CSSD</SelectItem><SelectItem value="Monitoring">Monitoring</SelectItem><SelectItem value="General">General</SelectItem></SelectContent></Select></div>
              <div><Label>Manufacturer</Label><Input placeholder="Brand" /></div>
              <div><Label>Model</Label><Input placeholder="Model no" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Serial No</Label><Input placeholder="S/N" /></div>
              <div><Label>Purchase Date</Label><Input type="date" /></div>
              <div><Label>Value (₹)</Label><Input type="number" placeholder="Cost" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Location</Label><Input placeholder="Department/Room" /></div>
              <div><Label>AMC Expiry</Label><Input type="date" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Asset added"); setAddOpen(false); }}>Save Asset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsAssets;
