import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, BedDouble, Search } from "lucide-react";

const admissionTypes = [
  { id: "1", name: "General Admission", code: "GA", dept: "General Ward", avgDays: 3, deposit: "₹5,000", docs: "ID Proof, Consent", status: "active" },
  { id: "2", name: "Panchakarma Package (7 Days)", code: "PK7", dept: "Panchakarma Wing", avgDays: 7, deposit: "₹15,000", docs: "ID, Medical History, Consent, PK Assessment", status: "active" },
  { id: "3", name: "Panchakarma Package (14 Days)", code: "PK14", dept: "Panchakarma Wing", avgDays: 14, deposit: "₹25,000", docs: "ID, Medical History, Consent, PK Assessment", status: "active" },
  { id: "4", name: "Panchakarma Package (21 Days)", code: "PK21", dept: "Panchakarma Wing", avgDays: 21, deposit: "₹40,000", docs: "ID, Medical History, Consent, PK Assessment, Lab Reports", status: "active" },
  { id: "5", name: "Ksharasutra Procedure", code: "KS", dept: "Minor OT", avgDays: 1, deposit: "₹10,000", docs: "ID, Consent, Pre-op Labs", status: "active" },
  { id: "6", name: "Maternity - Normal", code: "MAT-N", dept: "Maternity Ward", avgDays: 3, deposit: "₹20,000", docs: "ID, ANC Records, Consent", status: "active" },
  { id: "7", name: "Maternity - LSCS", code: "MAT-C", dept: "OT + ICU", avgDays: 5, deposit: "₹50,000", docs: "ID, ANC Records, Consent, Blood Group", status: "active" },
  { id: "8", name: "Emergency Admission", code: "EMRG", dept: "Emergency Ward", avgDays: 2, deposit: "₹10,000", docs: "ID (if available), MLC (if needed)", status: "active" },
  { id: "9", name: "Day Care / Observation", code: "DC", dept: "Day Care", avgDays: 1, deposit: "₹3,000", docs: "ID, Consent", status: "active" },
  { id: "10", name: "ICU Admission", code: "ICU", dept: "ICU", avgDays: 5, deposit: "₹50,000", docs: "ID, Consent, Critical Care Protocol", status: "active" },
  { id: "11", name: "Wellness Retreat (Resort)", code: "WR", dept: "Wellness Wing", avgDays: 7, deposit: "₹30,000", docs: "ID, Health Declaration, Package Selection", status: "active" },
  { id: "12", name: "Insurance Cashless IP", code: "INS-IP", dept: "Any", avgDays: 3, deposit: "Co-pay only", docs: "ID, Insurance Card, Pre-auth Letter", status: "active" },
];

const dischargeTypes = [
  { id: "1", name: "Normal Discharge", code: "ND", requires: "Doctor clearance, Final bill settled" },
  { id: "2", name: "Discharge Against Medical Advice (DAMA)", code: "DAMA", requires: "DAMA form signed, Risk explanation documented" },
  { id: "3", name: "Absconded", code: "ABS", requires: "Police report if needed, Outstanding bill noted" },
  { id: "4", name: "Death", code: "DTH", requires: "Death certificate, Body release form, Police intimation (if MLC)" },
  { id: "5", name: "Transfer to Higher Center", code: "TRANS", requires: "Referral letter, Ambulance arranged, Records shared" },
  { id: "6", name: "Panchakarma Completion", code: "PK-COMP", requires: "PK completion summary, Follow-up diet plan, Post-PK instructions" },
];

const IpAdmissionMaster = () => {
  const [tab, setTab] = useState("ip-type");
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">🛏️ IP Admission Master</h1>
          <p className="text-sm text-muted-foreground">Manage admission types, deposit rules, required documents & discharge categories</p>
        </div>
        <Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add Type</Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="ip-type">🏷️ IP Type</TabsTrigger>
          <TabsTrigger value="admission">🏥 Admission Types</TabsTrigger>
          <TabsTrigger value="discharge">📤 Discharge Types</TabsTrigger>
          <TabsTrigger value="config">⚙️ IP Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="admission" className="space-y-3">
          <div className="flex gap-3"><div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} /></div><Badge variant="secondary">{admissionTypes.length} types</Badge></div>
          <Card><CardContent className="p-0 overflow-x-auto">
            <Table><TableHeader><TableRow>
              <TableHead>Admission Type</TableHead><TableHead>Code</TableHead><TableHead>Department</TableHead><TableHead>Avg Stay</TableHead><TableHead>Deposit</TableHead><TableHead>Required Docs</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
            </TableRow></TableHeader><TableBody>
              {admissionTypes.filter(a => a.name.toLowerCase().includes(search.toLowerCase())).map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell><Badge variant="outline" className="font-mono text-xs">{a.code}</Badge></TableCell>
                  <TableCell className="text-xs">{a.dept}</TableCell>
                  <TableCell>{a.avgDays} days</TableCell>
                  <TableCell className="font-semibold text-sm">{a.deposit}</TableCell>
                  <TableCell className="text-xs max-w-[200px] truncate">{a.docs}</TableCell>
                  <TableCell><Badge className="bg-emerald-100 text-emerald-700 text-xs">{a.status}</Badge></TableCell>
                  <TableCell><div className="flex gap-1"><Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Pencil className="h-3 w-3" /></Button></div></TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="discharge" className="space-y-3">
          <Card><CardContent className="p-0">
            <Table><TableHeader><TableRow><TableHead>Discharge Type</TableHead><TableHead>Code</TableHead><TableHead>Requirements</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>{dischargeTypes.map(d => (
              <TableRow key={d.id}><TableCell className="font-medium">{d.name}</TableCell><TableCell><Badge variant="outline" className="font-mono text-xs">{d.code}</Badge></TableCell><TableCell className="text-xs">{d.requires}</TableCell><TableCell><Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Pencil className="h-3 w-3" /></Button></TableCell></TableRow>
            ))}</TableBody></Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-3">
          <Card><CardHeader><CardTitle className="text-base">⚙️ IP Configuration</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Default Deposit Amount</Label><Input defaultValue="5000" /></div>
              <div><Label>Auto-generate IP Number</Label><div className="flex items-center gap-3 mt-1"><Switch defaultChecked /><span className="text-sm">IP-YYYY-XXXX format</span></div></div>
              <div><Label>Bed Allocation</Label><Select defaultValue="manual"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="manual">Manual Selection</SelectItem><SelectItem value="auto">Auto (Next Available)</SelectItem><SelectItem value="preference">Patient Preference</SelectItem></SelectContent></Select></div>
              <div><Label>Discharge Summary Template</Label><Select defaultValue="ayurveda"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ayurveda">Ayurveda Format</SelectItem><SelectItem value="siddha">Siddha Format</SelectItem><SelectItem value="general">General Format</SelectItem><SelectItem value="panchakarma">Panchakarma Completion</SelectItem></SelectContent></Select></div>
              <div><Label>Advance Payment Required</Label><div className="flex items-center gap-3 mt-1"><Switch defaultChecked /><span className="text-sm">Before admission</span></div></div>
              <div><Label>Digital Consent Required</Label><div className="flex items-center gap-3 mt-1"><Switch defaultChecked /><span className="text-sm">E-consent on tablet/phone</span></div></div>
              <div><Label>Daily Nursing Assessment</Label><div className="flex items-center gap-3 mt-1"><Switch defaultChecked /><span className="text-sm">Auto-schedule daily checks</span></div></div>
              <div><Label>Auto-notify on Discharge</Label><div className="flex items-center gap-3 mt-1"><Switch defaultChecked /><span className="text-sm">WhatsApp + SMS to patient</span></div></div>
            </CardContent>
          </Card>
          <Button onClick={() => toast.success("IP settings saved!")}>💾 Save Settings</Button>
        </TabsContent>
      </Tabs>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent><DialogHeader><DialogTitle>Add Admission/Discharge Type</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name *</Label><Input placeholder="e.g., Panchakarma 14-Day Package" /></div>
            <div><Label>Code</Label><Input placeholder="PK14" /></div>
            <div><Label>Department</Label><Input placeholder="Panchakarma Wing" /></div>
            <div className="grid grid-cols-2 gap-3"><div><Label>Avg Stay (Days)</Label><Input type="number" placeholder="7" /></div><div><Label>Deposit</Label><Input placeholder="₹15,000" /></div></div>
            <div><Label>Required Documents</Label><Input placeholder="ID, Consent, etc." /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button onClick={() => { toast.success("Added!"); setAddOpen(false); }}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IpAdmissionMaster;
