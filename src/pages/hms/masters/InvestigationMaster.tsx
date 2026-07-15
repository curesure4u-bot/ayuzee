import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  FlaskConical, Plus, Search, Edit, Trash2, Download,
  CheckCircle, Copy, Printer,
} from "lucide-react";

type Investigation = {
  id: string;
  code: string;
  name: string;
  department: string;
  category: string;
  sampleType: string;
  method: string;
  reportingTime: string;
  price: number;
  parameters: Parameter[];
  status: "active" | "inactive";
  outsourced: boolean;
};

type Parameter = {
  id: string;
  name: string;
  unit: string;
  normalRange: string;
  maleRange: string;
  femaleRange: string;
  childRange: string;
  method: string;
  criticalLow: string;
  criticalHigh: string;
};

const DEPARTMENTS = ["Biochemistry", "Haematology", "Clinical Pathology", "Microbiology", "Serology", "Immunology", "Radiology", "Ultrasonography", "AYUSH Diagnostics"];
const CATEGORIES = ["Routine", "Special", "Advanced", "Profile", "Panel", "Radiology", "AYUSH Specific"];
const SAMPLE_TYPES = ["Blood (EDTA)", "Blood (Plain)", "Blood (Citrate)", "Urine (Random)", "Urine (24hr)", "Stool", "Sputum", "Swab", "CSF", "Synovial Fluid", "N/A (Imaging)"];

const mockInvestigations: Investigation[] = [
  { id: "1", code: "CBC", name: "Complete Blood Count", department: "Haematology", category: "Routine", sampleType: "Blood (EDTA)", method: "Automated Analyzer", reportingTime: "2 hours", price: 350, outsourced: false, status: "active", parameters: [
    { id: "1", name: "Hemoglobin", unit: "g/dL", normalRange: "12-16", maleRange: "13-17", femaleRange: "12-16", childRange: "11-14", method: "Cyanmethemoglobin", criticalLow: "7", criticalHigh: "20" },
    { id: "2", name: "WBC Count", unit: "cells/cumm", normalRange: "4000-11000", maleRange: "4000-11000", femaleRange: "4000-11000", childRange: "5000-13000", method: "Automated", criticalLow: "2000", criticalHigh: "30000" },
    { id: "3", name: "Platelet Count", unit: "lakhs/cumm", normalRange: "1.5-4.0", maleRange: "1.5-4.0", femaleRange: "1.5-4.0", childRange: "1.5-4.0", method: "Automated", criticalLow: "0.5", criticalHigh: "10" },
    { id: "4", name: "RBC Count", unit: "millions/cumm", normalRange: "4.5-5.5", maleRange: "4.5-5.5", femaleRange: "3.8-4.8", childRange: "4.0-5.0", method: "Automated", criticalLow: "2.5", criticalHigh: "7" },
    { id: "5", name: "PCV/HCT", unit: "%", normalRange: "36-46", maleRange: "40-50", femaleRange: "36-44", childRange: "35-45", method: "Automated", criticalLow: "20", criticalHigh: "60" },
  ]},
  { id: "2", code: "ESR", name: "Erythrocyte Sedimentation Rate", department: "Haematology", category: "Routine", sampleType: "Blood (Citrate)", method: "Westergren", reportingTime: "1 hour", price: 100, outsourced: false, status: "active", parameters: [
    { id: "1", name: "ESR", unit: "mm/hr", normalRange: "0-20", maleRange: "0-15", femaleRange: "0-20", childRange: "0-10", method: "Westergren", criticalLow: "", criticalHigh: "100" },
  ]},
  { id: "3", code: "LFT", name: "Liver Function Test", department: "Biochemistry", category: "Profile", sampleType: "Blood (Plain)", method: "Enzymatic", reportingTime: "4 hours", price: 650, outsourced: false, status: "active", parameters: [
    { id: "1", name: "Total Bilirubin", unit: "mg/dL", normalRange: "0.2-1.2", maleRange: "0.2-1.2", femaleRange: "0.2-1.2", childRange: "0.2-1.0", method: "Diazo", criticalLow: "", criticalHigh: "15" },
    { id: "2", name: "SGPT (ALT)", unit: "U/L", normalRange: "7-56", maleRange: "7-56", femaleRange: "7-45", childRange: "7-40", method: "IFCC", criticalLow: "", criticalHigh: "1000" },
    { id: "3", name: "SGOT (AST)", unit: "U/L", normalRange: "5-40", maleRange: "5-40", femaleRange: "5-35", childRange: "5-35", method: "IFCC", criticalLow: "", criticalHigh: "1000" },
    { id: "4", name: "Alkaline Phosphatase", unit: "U/L", normalRange: "44-147", maleRange: "44-147", femaleRange: "44-147", childRange: "100-350", method: "pNPP", criticalLow: "", criticalHigh: "1000" },
    { id: "5", name: "Total Protein", unit: "g/dL", normalRange: "6.0-8.3", maleRange: "6.0-8.3", femaleRange: "6.0-8.3", childRange: "6.0-8.0", method: "Biuret", criticalLow: "3", criticalHigh: "12" },
  ]},
  { id: "4", code: "CRP", name: "C-Reactive Protein (Quantitative)", department: "Immunology", category: "Special", sampleType: "Blood (Plain)", method: "Immunoturbidimetry", reportingTime: "2 hours", price: 450, outsourced: false, status: "active", parameters: [
    { id: "1", name: "CRP", unit: "mg/L", normalRange: "<5", maleRange: "<5", femaleRange: "<5", childRange: "<5", method: "Turbidimetry", criticalLow: "", criticalHigh: "200" },
  ]},
  { id: "5", code: "XRAY-KNEE", name: "X-Ray Knee (AP & Lateral)", department: "Radiology", category: "Radiology", sampleType: "N/A (Imaging)", method: "Digital X-Ray", reportingTime: "30 min", price: 600, outsourced: false, status: "active", parameters: [] },
  { id: "6", code: "USG-ABD", name: "Ultrasound Abdomen & Pelvis", department: "Ultrasonography", category: "Radiology", sampleType: "N/A (Imaging)", method: "Ultrasound", reportingTime: "1 hour", price: 1200, outsourced: false, status: "active", parameters: [] },
  { id: "7", code: "VITD3", name: "Vitamin D3 (25-OH)", department: "Biochemistry", category: "Special", sampleType: "Blood (Plain)", method: "CLIA", reportingTime: "24 hours", price: 1200, outsourced: true, status: "active", parameters: [
    { id: "1", name: "25-OH Vitamin D", unit: "ng/mL", normalRange: "30-100", maleRange: "30-100", femaleRange: "30-100", childRange: "30-100", method: "CLIA", criticalLow: "5", criticalHigh: "150" },
  ]},
  { id: "8", code: "PRAKRUTI-LAB", name: "Prakruti Bio-marker Panel (AYUSH)", department: "AYUSH Diagnostics", category: "AYUSH Specific", sampleType: "Blood (EDTA)", method: "Genomic + Biochemical", reportingTime: "7 days", price: 3500, outsourced: true, status: "active", parameters: [
    { id: "1", name: "Vata Marker Index", unit: "score", normalRange: "20-40", maleRange: "20-40", femaleRange: "20-40", childRange: "—", method: "Proprietary", criticalLow: "", criticalHigh: "" },
    { id: "2", name: "Pitta Marker Index", unit: "score", normalRange: "20-40", maleRange: "20-40", femaleRange: "20-40", childRange: "—", method: "Proprietary", criticalLow: "", criticalHigh: "" },
    { id: "3", name: "Kapha Marker Index", unit: "score", normalRange: "20-40", maleRange: "20-40", femaleRange: "20-40", childRange: "—", method: "Proprietary", criticalLow: "", criticalHigh: "" },
  ]},
];

const InvestigationMaster = () => {
  const [investigations] = useState<Investigation[]>(mockInvestigations);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [viewParams, setViewParams] = useState<Investigation | null>(null);

  const filtered = investigations.filter((inv) => {
    const matchSearch = inv.name.toLowerCase().includes(search.toLowerCase()) || inv.code.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept === "all" || inv.department === filterDept;
    const matchCat = filterCat === "all" || inv.category === filterCat;
    return matchSearch && matchDept && matchCat;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-purple-600" /> Investigation Master
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure diagnostic tests, parameters, normal values, pricing & report templates
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="mr-1 h-4 w-4" /> Export</Button>
          <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="mr-1 h-4 w-4" /> Add Investigation</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{investigations.length}</p><p className="text-xs text-muted-foreground">Total Tests</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{investigations.filter(i => i.category === "Profile").length}</p><p className="text-xs text-muted-foreground">Profiles</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{investigations.filter(i => i.department === "Radiology" || i.department === "Ultrasonography").length}</p><p className="text-xs text-muted-foreground">Radiology</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{investigations.filter(i => i.outsourced).length}</p><p className="text-xs text-muted-foreground">Outsourced</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{investigations.filter(i => i.category === "AYUSH Specific").length}</p><p className="text-xs text-muted-foreground">AYUSH Specific</p></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by name or code..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterDept} onValueChange={setFilterDept}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Department" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Investigation Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">#</th>
                  <th className="px-3 py-2 text-left font-medium">Code</th>
                  <th className="px-3 py-2 text-left font-medium">Investigation Name</th>
                  <th className="px-3 py-2 text-left font-medium">Department</th>
                  <th className="px-3 py-2 text-left font-medium">Category</th>
                  <th className="px-3 py-2 text-left font-medium">Sample</th>
                  <th className="px-3 py-2 text-left font-medium">TAT</th>
                  <th className="px-3 py-2 text-left font-medium">Price (₹)</th>
                  <th className="px-3 py-2 text-left font-medium">Params</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                  <th className="px-3 py-2 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv, i) => (
                  <tr key={inv.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-2 font-mono text-xs font-bold">{inv.code}</td>
                    <td className="px-3 py-2">
                      <p className="font-medium">{inv.name}</p>
                      {inv.outsourced && <Badge variant="secondary" className="text-[10px] mt-0.5">Outsourced</Badge>}
                    </td>
                    <td className="px-3 py-2 text-xs">{inv.department}</td>
                    <td className="px-3 py-2"><Badge variant="outline" className="text-[10px]">{inv.category}</Badge></td>
                    <td className="px-3 py-2 text-xs">{inv.sampleType}</td>
                    <td className="px-3 py-2 text-xs">{inv.reportingTime}</td>
                    <td className="px-3 py-2 font-medium">₹{inv.price}</td>
                    <td className="px-3 py-2">
                      {inv.parameters.length > 0 ? (
                        <Button size="sm" variant="ghost" className="text-xs h-6" onClick={() => setViewParams(inv)}>
                          {inv.parameters.length} params
                        </Button>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant={inv.status === "active" ? "outline" : "secondary"} className={`text-[10px] ${inv.status === "active" ? "text-green-600" : ""}`}>
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Edit className="h-3 w-3" /></Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Copy className="h-3 w-3" /></Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500"><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View Parameters Dialog */}
      <Dialog open={!!viewParams} onOpenChange={() => setViewParams(null)}>
        <DialogContent className="max-w-3xl">
          {viewParams && (
            <>
              <DialogHeader>
                <DialogTitle>{viewParams.name} - Parameters & Normal Values</DialogTitle>
              </DialogHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-2 py-2 text-left font-medium">Parameter</th>
                      <th className="px-2 py-2 text-left font-medium">Unit</th>
                      <th className="px-2 py-2 text-left font-medium">Normal Range</th>
                      <th className="px-2 py-2 text-left font-medium">Male</th>
                      <th className="px-2 py-2 text-left font-medium">Female</th>
                      <th className="px-2 py-2 text-left font-medium">Child</th>
                      <th className="px-2 py-2 text-left font-medium">Method</th>
                      <th className="px-2 py-2 text-left font-medium">Critical Low</th>
                      <th className="px-2 py-2 text-left font-medium">Critical High</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewParams.parameters.map((p) => (
                      <tr key={p.id} className="border-b">
                        <td className="px-2 py-2 font-medium">{p.name}</td>
                        <td className="px-2 py-2">{p.unit}</td>
                        <td className="px-2 py-2">{p.normalRange}</td>
                        <td className="px-2 py-2">{p.maleRange}</td>
                        <td className="px-2 py-2">{p.femaleRange}</td>
                        <td className="px-2 py-2">{p.childRange}</td>
                        <td className="px-2 py-2">{p.method}</td>
                        <td className="px-2 py-2 text-red-600">{p.criticalLow || "—"}</td>
                        <td className="px-2 py-2 text-red-600">{p.criticalHigh || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Investigation Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Add New Investigation</DialogTitle></DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Investigation Code *</Label><Input placeholder="e.g., CBC, LFT, XRAY-KNEE" /></div>
              <div><Label>Investigation Name *</Label><Input placeholder="Full test name" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Department *</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Category</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Sample Type</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{SAMPLE_TYPES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Method</Label><Input placeholder="e.g., Automated, ELISA" /></div>
              <div><Label>Reporting Time (TAT)</Label><Input placeholder="e.g., 2 hours, 24 hours" /></div>
              <div><Label>Price (₹)</Label><Input type="number" placeholder="Amount" /></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2"><Switch /><Label>Outsourced</Label></div>
              <div className="flex items-center gap-2"><Switch defaultChecked /><Label>Active</Label></div>
            </div>
            <div>
              <Label>Report Template Notes</Label>
              <Textarea placeholder="Standard reporting notes, interpretation guidelines..." rows={2} />
            </div>
            <div className="border-t pt-3">
              <div className="flex items-center justify-between mb-2">
                <Label className="font-medium">Parameters (for lab tests)</Label>
                <Button size="sm" variant="outline"><Plus className="mr-1 h-3 w-3" /> Add Parameter</Button>
              </div>
              <div className="rounded border p-3 bg-muted/30">
                <div className="grid grid-cols-5 gap-2 text-xs font-medium text-muted-foreground mb-2">
                  <span>Parameter Name</span><span>Unit</span><span>Normal Range</span><span>Critical Low</span><span>Critical High</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  <Input className="h-7 text-xs" placeholder="e.g., Hemoglobin" />
                  <Input className="h-7 text-xs" placeholder="g/dL" />
                  <Input className="h-7 text-xs" placeholder="12-16" />
                  <Input className="h-7 text-xs" placeholder="7" />
                  <Input className="h-7 text-xs" placeholder="20" />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Investigation added"); setAddOpen(false); }}>Save Investigation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvestigationMaster;
