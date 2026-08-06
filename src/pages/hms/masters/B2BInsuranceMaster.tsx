import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil, Sparkles, Shield, Search, Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Types ───────────────────────────────────────────────────────────────────
type CreditProvider = {
  id: string;
  code: string;
  name: string;
  uniqueId: string;
  userId: string;
  type: string;
  subType: string;
  marketingExec: string;
  ratePlan: string;
  paymentType: string;
  contactNo: string;
  email: string;
  status: "active" | "inactive";
  address: string;
  coPayment: number;
  pharmacyCoPayment: number;
  pharmacyCoPaymentAmt: number;
  opticalCoPayment: number;
  opticalCoPaymentAmt: number;
  displayName: string;
  externalId: string;
  createdBy: string;
};

type Plan = {
  id: string;
  name: string;
  creditProvider: string;
  ratePlan: string;
  status: "active" | "inactive";
};

// ─── Constants ───────────────────────────────────────────────────────────────
const CREDIT_TYPES = ["Insurance", "Corporate", "Government", "TPA", "Franchise"];
const SUB_TYPES = ["Cashless", "Reimbursement", "Both", "Credit", "Prepaid"];
const MARKETING_AGENTS = ["Direct", "Agent 1", "Agent 2", "Online", "Referral"];
const RATE_PLANS = ["alshifa-ayush-hospital Default Rate Plan", "Corporate Rate Plan", "Insurance Rate Plan", "Government Rate Plan", "Staff Rate Plan"];
const LOCATIONS = [
  "location1 - #11, Main Road, Kadayanallur,",
  "location2 - 195, LAKSHMI PURAM STREET, PACR SALAI, Rajapalayam",
  "location3 - 43, Miranda Lane, Old GH Road, Theni",
  "location4 - No 47, Kulavanikar Puram Road, , Tirunelveli",
  "location5 - 4, Durai Samy Nagar, Keelkattalai, Chennai",
];
const ROOM_TYPES = ["SINGLE COT ROOM", "GENRAL WARD", "DOUBLE COT ROOM", "OT"];

const AI_FEATURES = [
  { label: "Auto Eligibility Check", desc: "AI verifies patient insurance eligibility in real-time before billing" },
  { label: "Claim Auto-Submission", desc: "Automatically prepares and submits claims to TPA/insurer portal" },
  { label: "Pre-Authorization Tracker", desc: "Tracks pre-auth status and alerts for pending approvals" },
  { label: "Document Completeness Check", desc: "AI flags missing documents before claim submission" },
  { label: "Co-Payment Calculator", desc: "Auto-calculates patient share based on policy terms" },
  { label: "Denial Prediction", desc: "AI predicts likely claim denials and suggests corrections" },
  { label: "Settlement Tracking", desc: "Tracks outstanding amounts and auto-sends payment reminders" },
];

// ─── Mock Data ───────────────────────────────────────────────────────────────
const mockActiveProviders: CreditProvider[] = [
  { id: "1", code: "CP_1", name: "Insurance", uniqueId: "insurance", userId: "", type: "Insurance", subType: "", marketingExec: "", ratePlan: "alshifa-ayush-hospital Default Rate Plan", paymentType: "", contactNo: "", email: "", status: "active", address: "", coPayment: 0, pharmacyCoPayment: 0, pharmacyCoPaymentAmt: 0, opticalCoPayment: 0, opticalCoPaymentAmt: 0, displayName: "Insurance", externalId: "", createdBy: "Al Shifa Ayush Hospital" },
  { id: "2", code: "CP_2", name: "Star Health Insurance", uniqueId: "star-health", userId: "SH001", type: "Insurance", subType: "Cashless", marketingExec: "Agent 1", ratePlan: "Insurance Rate Plan", paymentType: "Credit", contactNo: "044-66661234", email: "claims@starhealth.in", status: "active", address: "Chennai, Tamil Nadu", coPayment: 10, pharmacyCoPayment: 15, pharmacyCoPaymentAmt: 0, opticalCoPayment: 20, opticalCoPaymentAmt: 0, displayName: "Star Health", externalId: "EXT-SH-001", createdBy: "Al Shifa Ayush Hospital" },
  { id: "3", code: "CP_3", name: "CGHS", uniqueId: "cghs-govt", userId: "CGHS01", type: "Government", subType: "Reimbursement", marketingExec: "Direct", ratePlan: "Government Rate Plan", paymentType: "Credit", contactNo: "011-23456789", email: "cghs@gov.in", status: "active", address: "New Delhi", coPayment: 0, pharmacyCoPayment: 0, pharmacyCoPaymentAmt: 0, opticalCoPayment: 0, opticalCoPaymentAmt: 0, displayName: "CGHS", externalId: "CGHS-2024", createdBy: "Al Shifa Ayush Hospital" },
  { id: "4", code: "CP_4", name: "TCS Corporate", uniqueId: "tcs-corp", userId: "TCS01", type: "Corporate", subType: "Credit", marketingExec: "Direct", ratePlan: "Corporate Rate Plan", paymentType: "Credit", contactNo: "044-55551234", email: "hr@tcs.com", status: "active", address: "Chennai", coPayment: 5, pharmacyCoPayment: 10, pharmacyCoPaymentAmt: 0, opticalCoPayment: 0, opticalCoPaymentAmt: 0, displayName: "TCS", externalId: "TCS-AYU-2024", createdBy: "Al Shifa Ayush Hospital" },
];

const mockCamps: CreditProvider[] = [
  { id: "10", code: "CMP_1", name: "Ayurveda Health Camp - Kadayanallur", uniqueId: "camp-kdn-2025", userId: "", type: "Camp", subType: "", marketingExec: "Agent 1", ratePlan: "alshifa-ayush-hospital Default Rate Plan", paymentType: "", contactNo: "", email: "", status: "active", address: "Kadayanallur", coPayment: 0, pharmacyCoPayment: 0, pharmacyCoPaymentAmt: 0, opticalCoPayment: 0, opticalCoPaymentAmt: 0, displayName: "Camp KDN 2025", externalId: "", createdBy: "Al Shifa Ayush Hospital" },
  { id: "11", code: "CMP_2", name: "Free Spine Screening Camp - Theni", uniqueId: "camp-thn-spine", userId: "", type: "Camp", subType: "", marketingExec: "Direct", ratePlan: "alshifa-ayush-hospital Default Rate Plan", paymentType: "", contactNo: "", email: "", status: "active", address: "Theni", coPayment: 0, pharmacyCoPayment: 0, pharmacyCoPaymentAmt: 0, opticalCoPayment: 0, opticalCoPaymentAmt: 0, displayName: "Spine Camp Theni", externalId: "", createdBy: "Dr Mohamad Saleem" },
];

const mockPlans: Plan[] = [
  { id: "p1", name: "Star Health - Gold Plan", creditProvider: "Star Health Insurance", ratePlan: "Insurance Rate Plan", status: "active" },
  { id: "p2", name: "CGHS - Pensioner Plan", creditProvider: "CGHS", ratePlan: "Government Rate Plan", status: "active" },
  { id: "p3", name: "TCS Employee Plan", creditProvider: "TCS Corporate", ratePlan: "Corporate Rate Plan", status: "active" },
  { id: "p4", name: "Ayushman Bharat PMJAY", creditProvider: "Insurance", ratePlan: "Government Rate Plan", status: "active" },
];

const mockInactiveProviders: CreditProvider[] = [
  { id: "101", code: "CP_OLD", name: "Old Insurance Partner", uniqueId: "old-ins", userId: "", type: "Insurance", subType: "", marketingExec: "", ratePlan: "", paymentType: "", contactNo: "", email: "", status: "inactive", address: "", coPayment: 0, pharmacyCoPayment: 0, pharmacyCoPaymentAmt: 0, opticalCoPayment: 0, opticalCoPaymentAmt: 0, displayName: "", externalId: "", createdBy: "admin" },
];

// ─── Component ───────────────────────────────────────────────────────────────
const B2BInsuranceMaster = () => {
  // Sidebar section
  const [section, setSection] = useState<"credit-patient" | "plan">("credit-patient");
  // Credit tabs
  const [newType, setNewType] = useState<"insurance" | "camp" | "other" | "plan">("insurance");
  const [viewMode, setViewMode] = useState<"new" | "manage" | "inactive" | "study-code">("new");
  const [manageType, setManageType] = useState<"insurance" | "camp" | "other">("insurance");
  // Plan tabs
  const [planTab, setPlanTab] = useState<"new" | "manage" | "inactive" | "credit-master">("manage");

  const [search, setSearch] = useState("");
  const [enabledAi, setEnabledAi] = useState<string[]>(["Auto Eligibility Check", "Co-Payment Calculator", "Document Completeness Check"]);

  // New form state
  const [fType, setFType] = useState("Insurance");
  const [fSubType, setFSubType] = useState("");
  const [fName, setFName] = useState("");
  const [fDisplayName, setFDisplayName] = useState("");
  const [fUniqueCode, setFUniqueCode] = useState("");
  const [fAgent, setFAgent] = useState("");
  const [fExternalId, setFExternalId] = useState("");
  const [fCoPay, setFCoPay] = useState("");
  const [fPharmCoPay, setFPharmCoPay] = useState("");
  const [fPharmCoPayAmt, setFPharmCoPayAmt] = useState("");
  const [fOptCoPay, setFOptCoPay] = useState("");
  const [fOptCoPayAmt, setFOptCoPayAmt] = useState("");
  const [fBillingCenters, setFBillingCenters] = useState<string[]>([]);
  const [fCollectionCenters, setFCollectionCenters] = useState<string[]>([]);

  // Study code mapping
  const [studyProvider, setStudyProvider] = useState("");
  const [studyLoaded, setStudyLoaded] = useState(false);

  const toggleAi = (l: string) => setEnabledAi(p => p.includes(l) ? p.filter(x => x !== l) : [...p, l]);
  const toggleBilling = (loc: string) => setFBillingCenters(p => p.includes(loc) ? p.filter(x => x !== loc) : [...p, loc]);
  const toggleCollection = (loc: string) => setFCollectionCenters(p => p.includes(loc) ? p.filter(x => x !== loc) : [...p, loc]);

  const handleSave = () => {
    if (!fName.trim()) return toast.error("Name is required");
    if (!fUniqueCode.trim()) return toast.error("Unique Code is required");
    toast.success(`Credit Provider "${fName}" created!`);
    setFName(""); setFDisplayName(""); setFUniqueCode(""); setFExternalId("");
  };

  // ─── Render New Insurance/Corporate Form ───────────────────────────────────
  const renderNewForm = () => (
    <div className="space-y-4">
      {/* AI Panel */}
      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2"><Sparkles className="h-4 w-4 text-purple-600" /><Label className="font-semibold text-purple-700 text-sm">AI Insurance Intelligence</Label><Badge className="bg-purple-100 text-purple-700 text-[9px]">{enabledAi.length} Active</Badge></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {AI_FEATURES.map(f => (
              <label key={f.label} className="flex items-start gap-2 p-1.5 rounded border border-purple-100 bg-white cursor-pointer hover:bg-purple-50/50">
                <input type="checkbox" checked={enabledAi.includes(f.label)} onChange={() => toggleAi(f.label)} className="accent-purple-500 mt-0.5" />
                <div><p className="text-[10px] font-medium">{f.label}</p><p className="text-[9px] text-muted-foreground">{f.desc}</p></div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 border-b bg-primary/5">
          <CardTitle className="text-base text-center text-primary">
            {newType === "insurance" ? "Insurance/Corporate" : newType === "camp" ? "Camp" : "Patient Type"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <p className="text-xs text-red-500">* (mandatory fields)</p>

          {/* Basic Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {newType === "insurance" && (
              <div><Label className="font-semibold">Type <span className="text-red-500">*</span></Label>
                <Select value={fType} onValueChange={setFType}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{CREDIT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
              </div>
            )}
            {newType === "insurance" && (
              <div><Label className="font-semibold">SubType</Label>
                <Select value={fSubType} onValueChange={setFSubType}><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{SUB_TYPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
              </div>
            )}
            <div><Label className="font-semibold">Name <span className="text-red-500">*</span></Label><Input value={fName} onChange={e => setFName(e.target.value)} placeholder="Name of the credit provider" className="mt-1" /></div>
            <div><Label className="font-semibold">Display Name</Label><Input value={fDisplayName} onChange={e => setFDisplayName(e.target.value)} placeholder="Display Name of the credit provider" className="mt-1" /></div>
            <div><Label className="font-semibold">Unique Code <span className="text-red-500">*</span></Label><Input value={fUniqueCode} onChange={e => setFUniqueCode(e.target.value)} placeholder="Unique short name with lowercase letters and numbers" className="mt-1" /></div>
            <div><Label className="font-semibold">Marketing Agent</Label>
              <Select value={fAgent} onValueChange={setFAgent}><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{MARKETING_AGENTS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent></Select>
            </div>
            <div><Label className="font-semibold">External ID</Label><Input value={fExternalId} onChange={e => setFExternalId(e.target.value)} placeholder="External ID of the credit provider" className="mt-1" /></div>
          </div>

          {/* Co Payment Details */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-sm mb-3">Co Payment Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div><Label className="text-xs">Co-Payment (%)</Label><Input value={fCoPay} onChange={e => setFCoPay(e.target.value)} placeholder="Co payment percentage" className="mt-0.5 h-8 text-sm" /></div>
              <div><Label className="text-xs">Pharmacy Co-Payment (%)</Label><Input value={fPharmCoPay} onChange={e => setFPharmCoPay(e.target.value)} placeholder="Pharmacy Co payment percentage" className="mt-0.5 h-8 text-sm" /></div>
              <div><Label className="text-xs">Pharmacy Co-Payment Amount</Label><Input value={fPharmCoPayAmt} onChange={e => setFPharmCoPayAmt(e.target.value)} placeholder="Pharmacy Co payment Amount" className="mt-0.5 h-8 text-sm" /></div>
              <div><Label className="text-xs">Optical Co-Payment (%)</Label><Input value={fOptCoPay} onChange={e => setFOptCoPay(e.target.value)} placeholder="Optical Co payment percentage" className="mt-0.5 h-8 text-sm" /></div>
              <div><Label className="text-xs">Optical Co-Payment Amount</Label><Input value={fOptCoPayAmt} onChange={e => setFOptCoPayAmt(e.target.value)} placeholder="Optical Co payment Amount" className="mt-0.5 h-8 text-sm" /></div>
            </div>
          </div>

          {/* Billing & Collection Centers */}
          <div className="border-t pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">Billing Center <span className="text-red-500">*</span></Label>
              <div className="mt-1 border rounded p-2 max-h-28 overflow-y-auto text-xs space-y-1">
                {LOCATIONS.map(loc => (
                  <label key={loc} className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={fBillingCenters.includes(loc)} onChange={() => toggleBilling(loc)} className="accent-orange-500" /><span className="text-[10px]">{loc}</span></label>
                ))}
                <div className="flex gap-1 pt-1"><Button type="button" size="sm" variant="outline" className="h-5 text-[9px] px-1.5 bg-emerald-50 text-emerald-600" onClick={() => setFBillingCenters(LOCATIONS)}>Select All</Button><Button type="button" size="sm" variant="outline" className="h-5 text-[9px] px-1.5 bg-red-50 text-red-600" onClick={() => setFBillingCenters([])}>Deselect All</Button></div>
              </div>
            </div>
            <div>
              <Label className="font-semibold">Collection Center <span className="text-red-500">*</span></Label>
              <div className="mt-1 border rounded p-2 max-h-28 overflow-y-auto text-xs space-y-1">
                {LOCATIONS.map(loc => (
                  <label key={loc} className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={fCollectionCenters.includes(loc)} onChange={() => toggleCollection(loc)} className="accent-orange-500" /><span className="text-[10px]">{loc}</span></label>
                ))}
                <div className="flex gap-1 pt-1"><Button type="button" size="sm" variant="outline" className="h-5 text-[9px] px-1.5 bg-emerald-50 text-emerald-600" onClick={() => setFCollectionCenters(LOCATIONS)}>Select All</Button><Button type="button" size="sm" variant="outline" className="h-5 text-[9px] px-1.5 bg-red-50 text-red-600" onClick={() => setFCollectionCenters([])}>Deselect All</Button></div>
              </div>
            </div>
          </div>

          {/* Room Rate Plan Assignment */}
          <div className="border-t pt-4">
            <p className="text-xs text-muted-foreground mb-2">Assign RatePlan to Each Location - Billing Engine will use it to find the right charges</p>
            <p className="text-xs text-muted-foreground mb-3">Assign RatePlan to Each Location Of Room Types - Billing Engine will use it to find the right charges</p>
            {ROOM_TYPES.map(room => (
              <div key={room} className="mb-2"><p className="font-semibold text-xs mb-1">{room}</p><Button size="sm" variant="outline" className="h-6 text-[10px] bg-teal-50 text-teal-700 border-teal-200">New</Button></div>
            ))}
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600 text-white px-8">Next</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ─── Render Manage Table ───────────────────────────────────────────────────
  const renderManageTable = (data: CreditProvider[], type: "active" | "inactive") => (
    <Card>
      <CardHeader className={`pb-2 border-b ${type === "inactive" ? "bg-red-50/50" : ""}`}>
        <CardTitle className={`text-base text-center ${type === "inactive" ? "text-red-600" : "text-primary"}`}>
          {type === "active" ? `Manage ${manageType === "insurance" ? "Insurance/Corporate" : manageType === "camp" ? "Camp" : "Other Patient Types"}` : "Manage Inactive"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">Show <select className="border rounded px-2 py-1 text-xs"><option>100</option></select> entries</div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-7 text-xs bg-teal-50 text-teal-700" onClick={() => toast.success("Exported")}><Download className="h-3 w-3 mr-1" />Export As CSV</Button>
            <span className="text-xs">Search:</span>
            <Input className="h-7 text-xs w-40" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-2 py-2 text-left font-semibold text-orange-600">Code</th>
                <th className="px-2 py-2 text-left font-semibold text-orange-600">Name</th>
                <th className="px-2 py-2 text-left font-semibold text-orange-600">Unique ID</th>
                <th className="px-2 py-2 text-left font-semibold text-orange-600">Type</th>
                <th className="px-2 py-2 text-left font-semibold text-orange-600">SubType</th>
                <th className="px-2 py-2 text-left font-semibold text-orange-600">Marketing Exec</th>
                <th className="px-2 py-2 text-left font-semibold text-orange-600">Rate Plan</th>
                <th className="px-2 py-2 text-left font-semibold text-orange-600">Contact No</th>
                <th className="px-2 py-2 text-left font-semibold text-orange-600">Email</th>
                <th className="px-2 py-2 text-left font-semibold text-orange-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.filter(d => d.name.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
                <tr><td colSpan={10} className="px-3 py-4 text-center text-muted-foreground">No records found</td></tr>
              ) : (
                data.filter(d => d.name.toLowerCase().includes(search.toLowerCase())).map(p => (
                  <tr key={p.id} className="border-b hover:bg-muted/30">
                    <td className="px-2 py-2 font-mono text-xs">{p.code} <Pencil className="h-2.5 w-2.5 inline text-orange-500" /></td>
                    <td className="px-2 py-2 text-xs text-primary font-medium">{p.name} <Pencil className="h-2.5 w-2.5 inline text-orange-500" /></td>
                    <td className="px-2 py-2 text-xs">{p.uniqueId}</td>
                    <td className="px-2 py-2 text-xs">{p.type} <Pencil className="h-2.5 w-2.5 inline text-orange-500" /></td>
                    <td className="px-2 py-2 text-xs">{p.subType || "-"}</td>
                    <td className="px-2 py-2 text-xs">{p.marketingExec || "-"}</td>
                    <td className="px-2 py-2 text-[10px]">• {p.ratePlan || "-"}</td>
                    <td className="px-2 py-2 text-xs"><Pencil className="h-2.5 w-2.5 inline text-orange-500" /></td>
                    <td className="px-2 py-2 text-xs"><Pencil className="h-2.5 w-2.5 inline text-orange-500" /></td>
                    <td className="px-2 py-2"><span className="text-emerald-600 text-xs">{p.status}</span> <Pencil className="h-2.5 w-2.5 inline text-orange-500" /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  // ─── Render Plan Section ───────────────────────────────────────────────────
  const renderPlanSection = () => (
    <Card>
      <CardHeader className="pb-2 border-b"><CardTitle className="text-base text-center text-primary">Manage Plan</CardTitle></CardHeader>
      <CardContent className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Name</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Credit Provider</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Rate Plan</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockPlans.map(p => (
                <tr key={p.id} className="border-b hover:bg-muted/30">
                  <td className="px-3 py-2 text-xs font-medium">{p.name}</td>
                  <td className="px-3 py-2 text-xs">{p.creditProvider}</td>
                  <td className="px-3 py-2 text-xs">{p.ratePlan}</td>
                  <td className="px-3 py-2"><Badge className="bg-emerald-100 text-emerald-700 text-[9px]">{p.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  // ─── Render Study Code Mapping ─────────────────────────────────────────────
  const renderStudyCode = () => (
    <Card>
      <CardHeader className="pb-2 border-b"><CardTitle className="text-base text-center text-primary">Manage Credit Study Code</CardTitle></CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-end gap-4">
          <div className="min-w-[300px]"><Label className="font-semibold">Credit Provider :</Label>
            <Select value={studyProvider} onValueChange={setStudyProvider}><SelectTrigger className="mt-1"><SelectValue placeholder="Please select a provider" /></SelectTrigger><SelectContent>{mockActiveProviders.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent></Select>
          </div>
          <Button onClick={() => { if (!studyProvider) return toast.error("Select provider"); setStudyLoaded(true); toast.success("Loaded"); }} className="bg-orange-500 hover:bg-orange-600 text-white">Load</Button>
        </div>
        {studyLoaded && <p className="text-sm text-muted-foreground">Study codes for <span className="font-medium text-primary">{studyProvider}</span> - configure treatment/investigation code mappings here.</p>}
      </CardContent>
    </Card>
  );

  // ─── Main Render ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6 text-orange-600" /> B2B/Insurance Master</h1>
          <p className="text-sm text-muted-foreground">Configure corporate and insurance partner details with AI-powered claim management.</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-purple-100 text-purple-700 border-purple-200"><Sparkles className="h-3 w-3 mr-1" /> AI Claims</Badge>
          <Badge variant="secondary">Providers: {mockActiveProviders.length + mockCamps.length}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
        {/* Sidebar */}
        <div>
          <Card className="p-0">
            <CardHeader className="pb-2 pt-3 px-3"><CardTitle className="text-sm font-semibold">B2B/Insurance Master</CardTitle></CardHeader>
            <CardContent className="p-1 space-y-0.5">
              <Button variant="ghost" size="sm" className={`w-full justify-start text-xs h-8 ${section === "credit-patient" ? "bg-orange-50 text-orange-700 border border-orange-200" : ""}`} onClick={() => setSection("credit-patient")}>
                <span className="mr-2">🏥</span> Credit/Patient Type
              </Button>
              <Button variant="ghost" size="sm" className={`w-full justify-start text-xs h-8 ${section === "plan" ? "bg-orange-50 text-orange-700 border border-orange-200" : ""}`} onClick={() => setSection("plan")}>
                <span className="mr-2">📋</span> Plan
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-3 p-3">
            <p className="text-xs font-semibold mb-2">Provider Summary</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Insurance</span><Badge variant="secondary" className="text-[10px] h-4">{mockActiveProviders.filter(p => p.type === "Insurance").length}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Corporate</span><Badge variant="secondary" className="text-[10px] h-4">{mockActiveProviders.filter(p => p.type === "Corporate").length}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Government</span><Badge variant="secondary" className="text-[10px] h-4">{mockActiveProviders.filter(p => p.type === "Government").length}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Camps</span><Badge variant="secondary" className="text-[10px] h-4">{mockCamps.length}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Plans</span><Badge variant="secondary" className="text-[10px] h-4">{mockPlans.length}</Badge></div>
            </div>
          </Card>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {section === "credit-patient" && (
            <>
              {/* Top Tabs */}
              <div className="flex gap-1 border-b pb-0 flex-wrap">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className={`rounded-b-none text-xs ${viewMode === "new" ? "text-orange-700 border-b-2 border-orange-500 font-semibold bg-orange-50" : "text-muted-foreground"}`}>New ▾</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => { setViewMode("new"); setNewType("insurance"); }}>Insurance/Corporate</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setViewMode("new"); setNewType("camp"); }}>Camp</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setViewMode("new"); setNewType("other"); }}>Other Patient Types</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setViewMode("new"); setNewType("plan"); }}>Plan</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className={`rounded-b-none text-xs ${viewMode === "manage" ? "text-teal-700 border-b-2 border-teal-600 font-semibold bg-teal-50" : "text-muted-foreground"}`}>Manage ▾</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => { setViewMode("manage"); setManageType("insurance"); }}>Insurance/Corporate</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setViewMode("manage"); setManageType("camp"); }}>Camp</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setViewMode("manage"); setManageType("other"); }}>Other Patient Types</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className={`rounded-b-none text-xs ${viewMode === "inactive" ? "text-red-600 border-b-2 border-red-500 font-semibold bg-red-50" : "text-muted-foreground"}`}>Manage Inactive ▾</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => { setViewMode("inactive"); setManageType("insurance"); }}>Insurance/Corporate</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setViewMode("inactive"); setManageType("camp"); }}>Camp</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setViewMode("inactive"); setManageType("other"); }}>Other Patient Types</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="ghost" size="sm" className={`rounded-b-none text-xs ${viewMode === "study-code" ? "text-violet-700 border-b-2 border-violet-500 font-semibold bg-violet-50" : "text-muted-foreground"}`} onClick={() => setViewMode("study-code")}>
                  Manage Study Code Mapping
                </Button>
              </div>

              {viewMode === "new" && renderNewForm()}
              {viewMode === "manage" && renderManageTable(manageType === "camp" ? mockCamps : mockActiveProviders, "active")}
              {viewMode === "inactive" && renderManageTable(mockInactiveProviders, "inactive")}
              {viewMode === "study-code" && renderStudyCode()}
            </>
          )}

          {section === "plan" && (
            <>
              <div className="flex gap-2 border-b pb-0">
                <Button variant="ghost" size="sm" className={`rounded-b-none text-xs ${planTab === "manage" ? "text-teal-700 border-b-2 border-teal-600 font-semibold" : "text-muted-foreground"}`} onClick={() => setPlanTab("manage")}>Manage Plan</Button>
                <Button variant="ghost" size="sm" className={`rounded-b-none text-xs ${planTab === "inactive" ? "text-red-600 border-b-2 border-red-500 font-semibold" : "text-muted-foreground"}`} onClick={() => setPlanTab("inactive")}>Manage Inactive Plan</Button>
                <Button variant="ghost" size="sm" className={`rounded-b-none text-xs ${planTab === "credit-master" ? "text-violet-700 border-b-2 border-violet-500 font-semibold" : "text-muted-foreground"}`} onClick={() => setPlanTab("credit-master")}>Manage Credit Master</Button>
              </div>
              {planTab === "manage" && renderPlanSection()}
              {planTab === "inactive" && <Card><CardContent className="p-6 text-center text-muted-foreground text-sm">No inactive plans</CardContent></Card>}
              {planTab === "credit-master" && <Card><CardContent className="p-6 text-center text-muted-foreground text-sm">Credit Master configuration</CardContent></Card>}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default B2BInsuranceMaster;
