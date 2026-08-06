import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, IndianRupee, Building2, Users, Award, Store } from "lucide-react";

// --- INCENTIVE DATA ---
const incentiveRules = [
  { id: "1", name: "Consultation Incentive", doctor: "All Doctors", type: "Per Consultation", basis: "Flat Amount", amount: "₹50/consultation", threshold: "After 10 consultations/day", frequency: "Monthly", taxDeducted: "TDS 10%", status: "active", createdBy: "Admin" },
  { id: "2", name: "Panchakarma Revenue Share", doctor: "PK Doctors Only", type: "Revenue %", basis: "% of Revenue", amount: "15% of PK billing", threshold: "No minimum", frequency: "Monthly", taxDeducted: "TDS 10%", status: "active", createdBy: "Admin" },
  { id: "3", name: "IP Admission Incentive", doctor: "All Doctors", type: "Per Admission", basis: "Flat Amount", amount: "₹500/admission", threshold: "All IP admissions", frequency: "Monthly", taxDeducted: "TDS 10%", status: "active", createdBy: "Admin" },
  { id: "4", name: "Surgery/Procedure Incentive", doctor: "Surgeons", type: "Per Procedure", basis: "% of Procedure Fee", amount: "30% of procedure charge", threshold: "All procedures", frequency: "Monthly", taxDeducted: "TDS 10%", status: "active", createdBy: "Admin" },
  { id: "5", name: "Referral Bonus", doctor: "All Doctors", type: "Per Referral", basis: "Flat Amount", amount: "₹200/patient referred", threshold: "External referrals only", frequency: "Monthly", taxDeducted: "TDS 10%", status: "active", createdBy: "Admin" },
  { id: "6", name: "Target Achievement Bonus", doctor: "All Doctors", type: "Monthly Target", basis: "Slab-based", amount: "₹5,000-₹25,000", threshold: "80% target = ₹5K, 100% = ₹15K, 120% = ₹25K", frequency: "Monthly", taxDeducted: "TDS 10%", status: "active", createdBy: "Admin" },
  { id: "7", name: "Therapist Session Incentive", doctor: "All Therapists", type: "Per Session", basis: "Flat Amount", amount: "₹100/extra session", threshold: "After 8 sessions/day", frequency: "Bi-weekly", taxDeducted: "None", status: "active", createdBy: "Admin" },
  { id: "8", name: "Online Consultation Bonus", doctor: "Tele Doctors", type: "Per Teleconsult", basis: "Flat Amount", amount: "₹100/teleconsult", threshold: "All teleconsultations", frequency: "Monthly", taxDeducted: "TDS 10%", status: "active", createdBy: "Admin" },
  { id: "9", name: "Lab Revenue Share (Pathologist)", doctor: "Pathologist", type: "Revenue %", basis: "% of Lab Revenue", amount: "5% of lab collections", threshold: "Monthly lab revenue", frequency: "Monthly", taxDeducted: "TDS 10%", status: "active", createdBy: "Admin" },
  { id: "10", name: "Night Duty Allowance", doctor: "All Doctors", type: "Per Night", basis: "Flat Amount", amount: "₹1,500/night", threshold: "IP duty nights only", frequency: "Monthly", taxDeducted: "TDS 10%", status: "inactive", createdBy: "Admin" },
];

// --- FRANCHISE DATA ---
const franchiseRules = [
  { id: "1", name: "Ayuzee Franchise - Gold Plan", partner: "Gold Franchise Partners", type: "Revenue Share", royalty: "15%", fixedFee: "₹50,000/month", setupFee: "₹10,00,000", agreementYears: 5, territory: "Exclusive (District)", services: "Full HMS + Branding + Training + Marketing", paymentTerms: "Monthly by 10th", penalty: "2% per day delay", status: "active", branches: 8 },
  { id: "2", name: "Ayuzee Franchise - Silver Plan", partner: "Silver Franchise Partners", type: "Revenue Share", royalty: "12%", fixedFee: "₹30,000/month", setupFee: "₹5,00,000", agreementYears: 3, territory: "Exclusive (Taluk)", services: "HMS + Branding + Training", paymentTerms: "Monthly by 10th", penalty: "2% per day delay", status: "active", branches: 12 },
  { id: "3", name: "Ayuzee Franchise - Platinum Plan", partner: "Platinum Franchise Partners", type: "Fixed + Revenue", royalty: "10%", fixedFee: "₹1,00,000/month", setupFee: "₹25,00,000", agreementYears: 10, territory: "Exclusive (City)", services: "Full HMS + Branding + Training + Marketing + Doctors + Medicine Supply", paymentTerms: "Monthly by 5th", penalty: "3% per day delay", status: "active", branches: 3 },
  { id: "4", name: "Ayuzee Clinic Partner", partner: "Clinic Partners", type: "Fixed Monthly", royalty: "0%", fixedFee: "₹10,000/month", setupFee: "₹1,00,000", agreementYears: 2, territory: "Non-exclusive", services: "HMS Software + Brand Name + Patient Referrals", paymentTerms: "Monthly by 15th", penalty: "1% per day delay", status: "active", branches: 25 },
  { id: "5", name: "Ayuzee Hospital Partner", partner: "Hospital Partners (Existing)", type: "Revenue Share", royalty: "8%", fixedFee: "₹0", setupFee: "₹2,00,000", agreementYears: 3, territory: "Non-exclusive", services: "HMS + Patient Referrals + Ayuzee Branding", paymentTerms: "Monthly by 10th", penalty: "1.5% per day delay", status: "active", branches: 15 },
  { id: "6", name: "Ayuzee Wellness Resort", partner: "Resort Partners", type: "Revenue Share", royalty: "20%", fixedFee: "₹75,000/month", setupFee: "₹15,00,000", agreementYears: 7, territory: "Exclusive (District)", services: "Full HMS + PK Training + Therapists + Medicine + International Marketing", paymentTerms: "Monthly by 5th", penalty: "2.5% per day delay", status: "active", branches: 4 },
];

// --- GENERAL SETTLEMENT DATA ---
const settlements = [
  { id: "1", name: "Doctor Consultation Share", type: "Revenue Share", entity: "Doctors", percentage: "70%", fixedAmt: "—", frequency: "Monthly", creditDays: 15, taxDeducted: "TDS 10%", minPayout: "₹5,000", status: "active" },
  { id: "2", name: "Therapist Payment", type: "Per Session", entity: "Therapists", percentage: "—", fixedAmt: "₹300/session", frequency: "Bi-weekly", creditDays: 7, taxDeducted: "None", minPayout: "₹2,000", status: "active" },
  { id: "3", name: "Franchise Royalty", type: "Revenue Share", entity: "Franchise Partners", percentage: "15%", fixedAmt: "—", frequency: "Monthly", creditDays: 30, taxDeducted: "TDS 2%", minPayout: "₹10,000", status: "active" },
  { id: "4", name: "Lab Partner Settlement", type: "Revenue Share", entity: "SRM Diagnostics", percentage: "60%", fixedAmt: "—", frequency: "Monthly", creditDays: 30, taxDeducted: "GST + TDS", minPayout: "₹25,000", status: "active" },
  { id: "5", name: "Insurance Claim Settlement", type: "Full Amount", entity: "Insurance/TPA", percentage: "100%", fixedAmt: "—", frequency: "Per Claim", creditDays: 45, taxDeducted: "None", minPayout: "—", status: "active" },
  { id: "6", name: "Corporate Credit Settlement", type: "Full Amount", entity: "Corporate B2B", percentage: "100%", fixedAmt: "—", frequency: "Monthly", creditDays: 60, taxDeducted: "None", minPayout: "—", status: "active" },
  { id: "7", name: "Medicine Supplier Payment", type: "Invoice Based", entity: "Suppliers", percentage: "—", fixedAmt: "As per invoice", frequency: "Monthly", creditDays: 30, taxDeducted: "GST Input", minPayout: "—", status: "active" },
  { id: "8", name: "Referral Doctor Commission", type: "Per Patient", entity: "Referring Doctors", percentage: "—", fixedAmt: "₹200/patient", frequency: "Monthly", creditDays: 15, taxDeducted: "TDS 10%", minPayout: "₹1,000", status: "active" },
];

const SettlementMaster = () => {
  const [tab, setTab] = useState("incentive");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [addType, setAddType] = useState<"incentive" | "franchise" | "settlement">("incentive");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">🏦 Settlement Master</h1>
          <p className="text-sm text-muted-foreground">Define incentive rules, franchise settlements & financial terms for all stakeholders</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="incentive" className="font-semibold">🏆 Incentive</TabsTrigger>
          <TabsTrigger value="franchise" className="font-semibold">🏪 Franchise</TabsTrigger>
          <TabsTrigger value="general" className="font-semibold">💰 General Settlements</TabsTrigger>
        </TabsList>

        {/* INCENTIVE TAB */}
        <TabsContent value="incentive" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-3"><div className="relative w-64"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search incentive rules..." value={search} onChange={e => setSearch(e.target.value)} /></div><Badge variant="secondary">{incentiveRules.length} rules</Badge><Badge className="bg-emerald-100 text-emerald-700">{incentiveRules.filter(r => r.status === "active").length} active</Badge></div>
            <Button onClick={() => { setAddType("incentive"); setAddOpen(true); }}><Plus className="h-4 w-4 mr-1" /> Add Incentive Rule</Button>
          </div>
          <Card><CardContent className="p-0 overflow-x-auto">
            <Table><TableHeader><TableRow>
              <TableHead>Rule Name</TableHead><TableHead>Applicable To</TableHead><TableHead>Type</TableHead><TableHead>Basis</TableHead><TableHead>Amount/Rate</TableHead><TableHead>Threshold/Condition</TableHead><TableHead>Frequency</TableHead><TableHead>Tax</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
            </TableRow></TableHeader><TableBody>
              {incentiveRules.filter(r => r.name.toLowerCase().includes(search.toLowerCase())).map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{r.doctor}</Badge></TableCell>
                  <TableCell className="text-xs">{r.type}</TableCell>
                  <TableCell className="text-xs">{r.basis}</TableCell>
                  <TableCell className="font-semibold text-sm text-emerald-700">{r.amount}</TableCell>
                  <TableCell className="text-xs max-w-[200px]">{r.threshold}</TableCell>
                  <TableCell className="text-xs">{r.frequency}</TableCell>
                  <TableCell className="text-xs">{r.taxDeducted}</TableCell>
                  <TableCell><Badge className={r.status === "active" ? "bg-emerald-100 text-emerald-700 text-xs" : "bg-red-100 text-red-700 text-xs"}>{r.status}</Badge></TableCell>
                  <TableCell><Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Pencil className="h-3 w-3" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </CardContent></Card>

          {/* Incentive Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="p-3 text-center border-l-4 border-l-emerald-500"><p className="text-xs text-muted-foreground">Consultation Incentives</p><p className="text-lg font-bold">₹50/consult</p><p className="text-xs">After 10/day threshold</p></Card>
            <Card className="p-3 text-center border-l-4 border-l-blue-500"><p className="text-xs text-muted-foreground">PK Revenue Share</p><p className="text-lg font-bold">15%</p><p className="text-xs">All Panchakarma billing</p></Card>
            <Card className="p-3 text-center border-l-4 border-l-purple-500"><p className="text-xs text-muted-foreground">Target Bonus Range</p><p className="text-lg font-bold">₹5K-₹25K</p><p className="text-xs">80%-120% achievement</p></Card>
            <Card className="p-3 text-center border-l-4 border-l-orange-500"><p className="text-xs text-muted-foreground">Referral Bonus</p><p className="text-lg font-bold">₹200/patient</p><p className="text-xs">External referrals</p></Card>
          </div>
        </TabsContent>

        {/* FRANCHISE TAB */}
        <TabsContent value="franchise" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-3"><Badge variant="secondary">{franchiseRules.length} franchise plans</Badge><Badge className="bg-blue-100 text-blue-700">{franchiseRules.reduce((a, f) => a + f.branches, 0)} total branches</Badge></div>
            <Button onClick={() => { setAddType("franchise"); setAddOpen(true); }}><Plus className="h-4 w-4 mr-1" /> Add Franchise Plan</Button>
          </div>
          <Card><CardContent className="p-0 overflow-x-auto">
            <Table><TableHeader><TableRow>
              <TableHead>Plan Name</TableHead><TableHead>Partner Type</TableHead><TableHead>Settlement Type</TableHead><TableHead>Royalty %</TableHead><TableHead>Fixed Fee</TableHead><TableHead>Setup Fee</TableHead><TableHead>Agreement</TableHead><TableHead>Territory</TableHead><TableHead>Branches</TableHead><TableHead>Payment Terms</TableHead><TableHead>Penalty</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
            </TableRow></TableHeader><TableBody>
              {franchiseRules.map(f => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">{f.name}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{f.partner}</Badge></TableCell>
                  <TableCell className="text-xs">{f.type}</TableCell>
                  <TableCell className="font-semibold text-orange-600">{f.royalty}</TableCell>
                  <TableCell className="text-xs font-semibold">{f.fixedFee}</TableCell>
                  <TableCell className="text-xs">{f.setupFee}</TableCell>
                  <TableCell className="text-xs">{f.agreementYears} years</TableCell>
                  <TableCell className="text-xs">{f.territory}</TableCell>
                  <TableCell><Badge variant="secondary">{f.branches}</Badge></TableCell>
                  <TableCell className="text-xs">{f.paymentTerms}</TableCell>
                  <TableCell className="text-xs text-red-600">{f.penalty}</TableCell>
                  <TableCell><Badge className="bg-emerald-100 text-emerald-700 text-xs">{f.status}</Badge></TableCell>
                  <TableCell><Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Pencil className="h-3 w-3" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </CardContent></Card>

          {/* Franchise Summary */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {franchiseRules.map(f => (
              <Card key={f.id} className="p-3 text-center">
                <Badge className="bg-orange-100 text-orange-700 text-[10px] mb-1">{f.name.replace("Ayuzee ", "")}</Badge>
                <p className="text-lg font-bold">{f.branches}</p>
                <p className="text-[10px] text-muted-foreground">branches</p>
                <p className="text-xs font-semibold text-orange-600 mt-1">{f.royalty} royalty</p>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* GENERAL SETTLEMENTS TAB */}
        <TabsContent value="general" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-3"><Badge variant="secondary">{settlements.length} rules</Badge></div>
            <Button onClick={() => { setAddType("settlement"); setAddOpen(true); }}><Plus className="h-4 w-4 mr-1" /> Add Settlement Rule</Button>
          </div>
          <Card><CardContent className="p-0 overflow-x-auto">
            <Table><TableHeader><TableRow>
              <TableHead>Settlement Name</TableHead><TableHead>Type</TableHead><TableHead>Entity</TableHead><TableHead>%/Amount</TableHead><TableHead>Frequency</TableHead><TableHead>Credit Days</TableHead><TableHead>Tax Deducted</TableHead><TableHead>Min Payout</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
            </TableRow></TableHeader><TableBody>
              {settlements.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{s.type}</Badge></TableCell>
                  <TableCell className="text-xs">{s.entity}</TableCell>
                  <TableCell className="font-semibold text-sm">{s.percentage !== "—" ? s.percentage : s.fixedAmt}</TableCell>
                  <TableCell className="text-xs">{s.frequency}</TableCell>
                  <TableCell>{s.creditDays} days</TableCell>
                  <TableCell className="text-xs">{s.taxDeducted}</TableCell>
                  <TableCell className="text-xs">{s.minPayout}</TableCell>
                  <TableCell><Badge className="bg-emerald-100 text-emerald-700 text-xs">{s.status}</Badge></TableCell>
                  <TableCell><Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Pencil className="h-3 w-3" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* ADD DIALOG */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{addType === "incentive" ? "Add Incentive Rule" : addType === "franchise" ? "Add Franchise Plan" : "Add Settlement Rule"}</DialogTitle></DialogHeader>
          {addType === "incentive" && (
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Rule Name *</Label><Input placeholder="e.g., Consultation Incentive" /></div>
              <div><Label>Applicable To</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="all_doctors">All Doctors</SelectItem><SelectItem value="pk_doctors">PK Doctors Only</SelectItem><SelectItem value="surgeons">Surgeons</SelectItem><SelectItem value="therapists">All Therapists</SelectItem><SelectItem value="specific">Specific Doctor</SelectItem></SelectContent></Select></div>
              <div><Label>Incentive Type</Label><Select><SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger><SelectContent><SelectItem value="per_consult">Per Consultation</SelectItem><SelectItem value="revenue_pct">Revenue %</SelectItem><SelectItem value="per_admission">Per Admission</SelectItem><SelectItem value="per_procedure">Per Procedure</SelectItem><SelectItem value="per_referral">Per Referral</SelectItem><SelectItem value="target">Monthly Target</SelectItem><SelectItem value="per_session">Per Session</SelectItem><SelectItem value="per_night">Per Night Duty</SelectItem></SelectContent></Select></div>
              <div><Label>Basis</Label><Select><SelectTrigger><SelectValue placeholder="Basis" /></SelectTrigger><SelectContent><SelectItem value="flat">Flat Amount</SelectItem><SelectItem value="percentage">% of Revenue</SelectItem><SelectItem value="slab">Slab-based</SelectItem><SelectItem value="per_unit">Per Unit</SelectItem></SelectContent></Select></div>
              <div><Label>Amount/Rate</Label><Input placeholder="₹ or %" /></div>
              <div><Label>Threshold/Condition</Label><Input placeholder="When does it apply?" /></div>
              <div><Label>Frequency</Label><Select><SelectTrigger><SelectValue placeholder="Frequency" /></SelectTrigger><SelectContent><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="biweekly">Bi-weekly</SelectItem><SelectItem value="quarterly">Quarterly</SelectItem></SelectContent></Select></div>
              <div><Label>Tax Deduction</Label><Select><SelectTrigger><SelectValue placeholder="Tax" /></SelectTrigger><SelectContent><SelectItem value="tds10">TDS 10%</SelectItem><SelectItem value="tds5">TDS 5%</SelectItem><SelectItem value="none">None</SelectItem></SelectContent></Select></div>
            </div>
          )}
          {addType === "franchise" && (
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Plan Name *</Label><Input placeholder="e.g., Ayuzee Franchise - Gold" /></div>
              <div><Label>Partner Type</Label><Select><SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger><SelectContent><SelectItem value="gold">Gold Franchise</SelectItem><SelectItem value="silver">Silver Franchise</SelectItem><SelectItem value="platinum">Platinum Franchise</SelectItem><SelectItem value="clinic">Clinic Partner</SelectItem><SelectItem value="hospital">Hospital Partner</SelectItem><SelectItem value="resort">Wellness Resort</SelectItem></SelectContent></Select></div>
              <div><Label>Royalty %</Label><Input placeholder="e.g., 15%" /></div>
              <div><Label>Fixed Monthly Fee</Label><Input placeholder="₹50,000" /></div>
              <div><Label>Setup/Onboarding Fee</Label><Input placeholder="₹10,00,000" /></div>
              <div><Label>Agreement Period (Years)</Label><Input type="number" placeholder="5" /></div>
              <div><Label>Territory Type</Label><Select><SelectTrigger><SelectValue placeholder="Territory" /></SelectTrigger><SelectContent><SelectItem value="exclusive_district">Exclusive (District)</SelectItem><SelectItem value="exclusive_city">Exclusive (City)</SelectItem><SelectItem value="exclusive_taluk">Exclusive (Taluk)</SelectItem><SelectItem value="non_exclusive">Non-exclusive</SelectItem></SelectContent></Select></div>
              <div><Label>Payment Due Date</Label><Input placeholder="Monthly by 10th" /></div>
              <div className="col-span-2"><Label>Services Included</Label><Input placeholder="HMS + Branding + Training + ..." /></div>
              <div><Label>Late Payment Penalty</Label><Input placeholder="2% per day" /></div>
            </div>
          )}
          {addType === "settlement" && (
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Rule Name *</Label><Input placeholder="e.g., Doctor Revenue Share" /></div>
              <div><Label>Type</Label><Select><SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger><SelectContent><SelectItem value="revenue_share">Revenue Share (%)</SelectItem><SelectItem value="per_session">Per Session (Fixed)</SelectItem><SelectItem value="per_patient">Per Patient</SelectItem><SelectItem value="invoice">Invoice Based</SelectItem><SelectItem value="full">Full Amount</SelectItem></SelectContent></Select></div>
              <div><Label>Entity</Label><Input placeholder="Who gets paid?" /></div>
              <div><Label>Percentage / Amount</Label><Input placeholder="% or ₹" /></div>
              <div><Label>Frequency</Label><Select><SelectTrigger><SelectValue placeholder="Frequency" /></SelectTrigger><SelectContent><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="biweekly">Bi-weekly</SelectItem><SelectItem value="per_claim">Per Claim</SelectItem></SelectContent></Select></div>
              <div><Label>Credit Days</Label><Input type="number" placeholder="30" /></div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button onClick={() => { toast.success("Added successfully!"); setAddOpen(false); }}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettlementMaster;
