import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil, Plus, Sparkles, Users, X, Search } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type PatientSource = { id: string; name: string; sourceInfo: string[]; status: "active" | "inactive" };
type Membership = { id: string; cardName: string; validity: string; validityDays: number; discountPct: number; cardBillingLabel: string; cardFee: number; expiryDate: string; cardType: string; status: "active" | "inactive"; discountAppliedTo: string[]; additionalInfo: string; loyaltyPoint: number; createdBy: string; createdDate: string };
type Vaccination = { id: string; name: string; ageGroup: string; doses: string; interval: string; type: string; status: "active" | "inactive" };
type IdProof = { id: string; name: string; code: string; mandatory: boolean; status: "active" | "inactive" };
type PatientTag = { id: string; name: string; color: string; count: number; status: "active" | "inactive" };

// ─── Mock Data ───────────────────────────────────────────────────────────────
const mockSources: PatientSource[] = [
  { id: "1", name: "BNI", sourceInfo: ["BNI"], status: "active" },
  { id: "2", name: "BUS", sourceInfo: [], status: "inactive" },
  { id: "3", name: "BUS ADVERTISEMENT", sourceInfo: ["BUS ADVERTISEMENT"], status: "active" },
  { id: "4", name: "camp", sourceInfo: ["camp"], status: "active" },
  { id: "5", name: "facebook", sourceInfo: ["digital marketing"], status: "active" },
  { id: "6", name: "Google", sourceInfo: ["SEO", "Google Ads", "Google Maps"], status: "active" },
  { id: "7", name: "WhatsApp", sourceInfo: ["WhatsApp Marketing", "WhatsApp Referral"], status: "active" },
  { id: "8", name: "Doctor Referral", sourceInfo: ["Internal Referral", "External Doctor"], status: "active" },
  { id: "9", name: "Walk-in", sourceInfo: ["Direct Walk-in"], status: "active" },
  { id: "10", name: "Instagram", sourceInfo: ["Reels", "Stories", "Posts"], status: "active" },
  { id: "11", name: "YouTube", sourceInfo: ["YouTube Videos"], status: "active" },
  { id: "12", name: "Patient Referral", sourceInfo: ["Existing Patient"], status: "active" },
];

const mockMemberships: Membership[] = [
  { id: "1", cardName: "Ayuzee Wellness Basic", validity: "Unlimited", validityDays: 365, discountPct: 10, cardBillingLabel: "Registration Charges", cardFee: 999, expiryDate: "", cardType: "Membership", status: "active", discountAppliedTo: ["OP", "Pharmacy"], additionalInfo: "Free follow-ups x3", loyaltyPoint: 1, createdBy: "Al Shifa Ayush Hospital", createdDate: "01/01/2025" },
  { id: "2", cardName: "Ayuzee Gold", validity: "Days", validityDays: 365, discountPct: 20, cardBillingLabel: "Gold Membership", cardFee: 2999, expiryDate: "", cardType: "Membership", status: "active", discountAppliedTo: ["OP", "IP", "Pharmacy", "All"], additionalInfo: "Priority booking, Free PK consult", loyaltyPoint: 2, createdBy: "Al Shifa Ayush Hospital", createdDate: "01/01/2025" },
  { id: "3", cardName: "Family Plan", validity: "Days", validityDays: 365, discountPct: 25, cardBillingLabel: "Family Plan Charges", cardFee: 4999, expiryDate: "", cardType: "Membership", status: "active", discountAppliedTo: ["OP", "IP", "Pharmacy", "Optical", "All"], additionalInfo: "Family of 4, Free checkup x2/year", loyaltyPoint: 3, createdBy: "Al Shifa Ayush Hospital", createdDate: "15/01/2025" },
  { id: "4", cardName: "Panchakarma Package", validity: "Days", validityDays: 180, discountPct: 50, cardBillingLabel: "PK Package", cardFee: 9999, expiryDate: "", cardType: "Membership", status: "active", discountAppliedTo: ["OP", "IP"], additionalInfo: "50% on PK therapies, Dedicated therapist", loyaltyPoint: 5, createdBy: "Dr Mohamad Saleem", createdDate: "01/02/2025" },
];

const mockVaccinations: Vaccination[] = [
  { id: "1", name: "BCG", ageGroup: "At Birth", doses: "1", interval: "—", type: "Standard", status: "active" },
  { id: "2", name: "Hepatitis B", ageGroup: "At Birth, 6w, 14w", doses: "3", interval: "6-8 weeks", type: "Standard", status: "active" },
  { id: "3", name: "OPV", ageGroup: "6w, 10w, 14w", doses: "3", interval: "4 weeks", type: "Standard", status: "active" },
  { id: "4", name: "DPT", ageGroup: "6w, 10w, 14w, 16-24m", doses: "4", interval: "4 weeks", type: "Standard", status: "active" },
  { id: "5", name: "COVID-19 (Covaxin)", ageGroup: "12+ years", doses: "2", interval: "28 days", type: "Optional", status: "active" },
  { id: "6", name: "Flu (Influenza)", ageGroup: "All ages", doses: "Annual", interval: "Yearly", type: "Optional", status: "active" },
  { id: "7", name: "Pneumococcal", ageGroup: "65+ / High risk", doses: "1-2", interval: "—", type: "Optional", status: "active" },
];

const mockIdProofs: IdProof[] = [
  { id: "1", name: "Aadhaar Card", code: "AADHAAR", mandatory: true, status: "active" },
  { id: "2", name: "PAN Card", code: "PAN", mandatory: false, status: "active" },
  { id: "3", name: "Voter ID", code: "VOTER", mandatory: false, status: "active" },
  { id: "4", name: "Passport", code: "PASSPORT", mandatory: false, status: "active" },
  { id: "5", name: "Driving License", code: "DL", mandatory: false, status: "active" },
  { id: "6", name: "ABHA ID (Ayushman Bharat)", code: "ABHA", mandatory: false, status: "active" },
  { id: "7", name: "CGHS Card", code: "CGHS", mandatory: false, status: "active" },
  { id: "8", name: "BPL Card", code: "BPL", mandatory: false, status: "active" },
];

const mockTags: PatientTag[] = [
  { id: "1", name: "VIP", color: "bg-purple-100 text-purple-700", count: 25, status: "active" },
  { id: "2", name: "Chronic Patient", color: "bg-blue-100 text-blue-700", count: 80, status: "active" },
  { id: "3", name: "Panchakarma Regular", color: "bg-emerald-100 text-emerald-700", count: 45, status: "active" },
  { id: "4", name: "Diabetic", color: "bg-orange-100 text-orange-700", count: 60, status: "active" },
  { id: "5", name: "Senior Citizen", color: "bg-amber-100 text-amber-700", count: 90, status: "active" },
  { id: "6", name: "Allergy Alert", color: "bg-red-100 text-red-700", count: 35, status: "active" },
];

const AI_FEATURES = [
  { label: "Auto Patient Deduplication", desc: "AI detects duplicate registrations by name+phone+DOB matching" },
  { label: "Smart Source Attribution", desc: "Auto-assigns patient source based on booking channel and referral data" },
  { label: "Membership Renewal Reminder", desc: "AI sends WhatsApp/SMS reminders 15 days before membership expires" },
  { label: "Patient Risk Scoring", desc: "AI assigns health risk score based on age, conditions, and visit history" },
  { label: "Follow-up Compliance Tracking", desc: "Tracks missed follow-ups and triggers automated recall messages" },
  { label: "Loyalty Point Auto-Calculation", desc: "Automatically calculates and credits loyalty points on every transaction" },
  { label: "ABHA Auto-Linking", desc: "AI fetches and links Ayushman Bharat Health Account from ABDM registry" },
];

// ─── Component ───────────────────────────────────────────────────────────────
const PatientMaster = () => {
  // Sidebar section
  const [section, setSection] = useState<"source" | "membership" | "vaccination" | "idproof" | "tags">("source");
  const [search, setSearch] = useState("");
  const [enabledAi, setEnabledAi] = useState<string[]>(["Auto Patient Deduplication", "Membership Renewal Reminder", "Follow-up Compliance Tracking", "Loyalty Point Auto-Calculation"]);

  // Source form
  const [srcName, setSrcName] = useState("");
  const [srcInfo, setSrcInfo] = useState("");

  // Membership form
  const [memTab, setMemTab] = useState<"new" | "manage" | "inactive">("new");
  const [mCardName, setMCardName] = useState("");
  const [mValidity, setMValidity] = useState("Unlimited");
  const [mValidityDays, setMValidityDays] = useState("");
  const [mDiscount, setMDiscount] = useState("");
  const [mBillingLabel, setMBillingLabel] = useState("Registration Charges");
  const [mFee, setMFee] = useState("");
  const [mExpiry, setMExpiry] = useState("");
  const [mCardType, setMCardType] = useState("Membership");
  const [mStatus, setMStatus] = useState("Active");
  const [mDiscountTo, setMDiscountTo] = useState<string[]>([]);
  const [mInfo, setMInfo] = useState("");
  const [mLoyalty, setMLoyalty] = useState("1");

  const toggleAi = (l: string) => setEnabledAi(p => p.includes(l) ? p.filter(x => x !== l) : [...p, l]);
  const toggleDiscountTo = (d: string) => setMDiscountTo(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d]);

  const handleAddSource = () => {
    if (!srcName.trim()) return toast.error("Source Name required");
    toast.success(`Source "${srcName}" created!`);
    setSrcName(""); setSrcInfo("");
  };

  const handleCreateMembership = () => {
    if (!mCardName.trim()) return toast.error("Card Name required");
    if (!mDiscount) return toast.error("Discount % required");
    if (!mFee) return toast.error("Card Fee required");
    toast.success(`Membership "${mCardName}" created!`);
    setMCardName(""); setMDiscount(""); setMFee(""); setMInfo("");
  };

  // ─── Render Patient Source ─────────────────────────────────────────────────
  const renderSource = () => (
    <Card>
      <CardHeader className="pb-2 border-b bg-primary/5"><CardTitle className="text-base text-center text-primary">Manage Patient Source</CardTitle></CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-end gap-4">
          <div><Label className="font-semibold">Name :</Label><Input value={srcName} onChange={e => setSrcName(e.target.value)} className="w-56 mt-1" /></div>
          <div><Label className="font-semibold">Source Info :</Label><Input value={srcInfo} onChange={e => setSrcInfo(e.target.value)} className="w-48 mt-1" /></div>
          <Button onClick={handleAddSource} className="bg-teal-600 hover:bg-teal-700 text-white">Create</Button>
        </div>
        <div className="flex items-center justify-between border-t pt-3">
          <div className="text-sm">Show <select className="border rounded px-2 py-1 text-xs"><option>100</option></select> entries</div>
          <div className="flex items-center gap-2"><span className="text-xs">Search:</span><Input className="h-7 text-xs w-40" value={search} onChange={e => setSearch(e.target.value)} /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-muted/50 border-b"><tr><th className="px-3 py-2 text-left font-semibold text-orange-600">Source</th><th className="px-3 py-2 text-left font-semibold text-orange-600">Source Info</th><th className="px-3 py-2 text-left font-semibold text-orange-600">Status</th></tr></thead>
            <tbody>
              {mockSources.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).map(src => (
                <tr key={src.id} className="border-b hover:bg-muted/30">
                  <td className="px-3 py-3 font-medium text-xs">{src.name}</td>
                  <td className="px-3 py-2">
                    <table className="text-xs border w-full max-w-sm">
                      <thead><tr className="bg-muted/30"><th className="px-2 py-1 text-left">S.No</th><th className="px-2 py-1 text-left">Source Name</th><th className="px-2 py-1">Remove</th></tr></thead>
                      <tbody>
                        {src.sourceInfo.map((info, i) => (
                          <tr key={i} className="border-t"><td className="px-2 py-1">{i+1}.</td><td className="px-2 py-1">{info} <Pencil className="h-2.5 w-2.5 inline text-orange-500" /></td><td className="px-2 py-1 text-center"><span className="text-red-500 cursor-pointer font-bold">✗</span></td></tr>
                        ))}
                        <tr className="border-t"><td className="px-2 py-1"><Button size="sm" className="h-5 w-5 p-0 bg-emerald-500 text-white text-[10px]">+</Button></td><td className="px-2 py-1"></td><td></td></tr>
                      </tbody>
                    </table>
                  </td>
                  <td className="px-3 py-2"><span className={src.status === "active" ? "text-emerald-600 text-xs" : "text-red-500 text-xs"}>{src.status}</span> <Pencil className="h-2.5 w-2.5 inline text-orange-500" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  // ─── Render Membership ─────────────────────────────────────────────────────
  const renderMembership = () => (
    <div className="space-y-4">
      <div className="flex gap-2 border-b pb-0">
        <Button variant="ghost" size="sm" className={`rounded-b-none text-xs ${memTab === "new" ? "text-orange-700 border-b-2 border-orange-500 font-semibold bg-orange-50" : "text-muted-foreground"}`} onClick={() => setMemTab("new")}>New</Button>
        <Button variant="ghost" size="sm" className={`rounded-b-none text-xs ${memTab === "manage" ? "text-teal-700 border-b-2 border-teal-600 font-semibold bg-teal-50" : "text-muted-foreground"}`} onClick={() => setMemTab("manage")}>Manage Membership</Button>
        <Button variant="ghost" size="sm" className={`rounded-b-none text-xs ${memTab === "inactive" ? "text-red-600 border-b-2 border-red-500 font-semibold bg-red-50" : "text-muted-foreground"}`} onClick={() => setMemTab("inactive")}>Manage Inactive Membership</Button>
      </div>

      {memTab === "new" && (
        <Card>
          <CardHeader className="pb-2 border-b bg-primary/5"><CardTitle className="text-base text-center text-primary">Membership</CardTitle></CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div><Label className="font-semibold">Card Name <span className="text-red-500">*</span></Label><Input value={mCardName} onChange={e => setMCardName(e.target.value)} placeholder="Card Name" className="mt-1" /></div>
              <div><Label className="font-semibold">Validity <span className="text-red-500">*</span></Label>
                <div className="flex gap-1 mt-1">
                  <Select value={mValidity} onValueChange={setMValidity}><SelectTrigger className="w-28"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Unlimited">Unlimited</SelectItem><SelectItem value="Days">Days</SelectItem></SelectContent></Select>
                  <Input value={mValidityDays} onChange={e => setMValidityDays(e.target.value)} placeholder="Days" className="w-20" type="number" />
                </div>
              </div>
              <div><Label className="font-semibold">Discount Percentage <span className="text-red-500">*</span></Label><div className="flex items-center gap-1 mt-1"><Input value={mDiscount} onChange={e => setMDiscount(e.target.value)} placeholder="10" type="number" /><span className="text-sm">%</span></div></div>
              <div><Label className="font-semibold">Card Billing Label <span className="text-red-500">*</span></Label><Input value={mBillingLabel} onChange={e => setMBillingLabel(e.target.value)} placeholder="Registration Charges" className="mt-1" /><p className="text-[9px] text-muted-foreground mt-0.5">Specify Label for Card fees that would appear in the billing</p></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div><Label className="font-semibold">Card Fee <span className="text-red-500">*</span></Label><Input value={mFee} onChange={e => setMFee(e.target.value)} placeholder="Card Fee" type="number" className="mt-1" /><p className="text-[9px] text-muted-foreground mt-0.5">Specify fee for card</p></div>
              <div><Label className="font-semibold">Expiry Date</Label><Input type="date" value={mExpiry} onChange={e => setMExpiry(e.target.value)} className="mt-1" /><p className="text-[9px] text-muted-foreground mt-0.5">Card will be expired after the date</p></div>
              <div><Label className="font-semibold">Card Type <span className="text-red-500">*</span></Label><Select value={mCardType} onValueChange={setMCardType}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Membership">Membership</SelectItem><SelectItem value="Loyalty">Loyalty</SelectItem><SelectItem value="Package">Package</SelectItem></SelectContent></Select></div>
              <div><Label className="font-semibold">Status <span className="text-red-500">*</span></Label><Select value={mStatus} onValueChange={setMStatus}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent></Select></div>
            </div>
            <div><Label className="font-semibold">Discount Applied to <span className="text-red-500">*</span> :</Label>
              <div className="flex gap-4 mt-1">{["OP", "IP", "Pharmacy", "Optical", "All"].map(d => (<label key={d} className="flex items-center gap-1.5 text-sm cursor-pointer"><Checkbox checked={mDiscountTo.includes(d)} onCheckedChange={() => toggleDiscountTo(d)} />{d}</label>))}</div>
            </div>
            <div><Label className="font-semibold">Additional Info :</Label><Input value={mInfo} onChange={e => setMInfo(e.target.value)} placeholder="Add any additional information" className="mt-1" /></div>
            <div><Label className="font-semibold">Loyalty Point <span className="text-red-500">*</span> :</Label><Input value={mLoyalty} onChange={e => setMLoyalty(e.target.value)} placeholder="1" type="number" className="mt-1 w-32" /><p className="text-[9px] text-muted-foreground mt-0.5">How many Points per One rupee spent</p></div>
            <div className="flex justify-center pt-2"><Button onClick={handleCreateMembership} className="bg-orange-500 hover:bg-orange-600 text-white px-8">Create</Button></div>
          </CardContent>
        </Card>
      )}

      {memTab === "manage" && (
        <Card>
          <CardHeader className="pb-2 border-b"><CardTitle className="text-base text-center text-primary">Manage Membership</CardTitle></CardHeader>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3"><div className="text-sm">Show <select className="border rounded px-2 py-1 text-xs"><option>100</option></select> entries</div><div className="flex items-center gap-2"><span className="text-xs">Search:</span><Input className="h-7 text-xs w-40" /></div></div>
            <table className="w-full text-sm border"><thead className="bg-muted/50 border-b"><tr><th className="px-2 py-2 text-left font-semibold text-orange-600">#</th><th className="px-2 py-2 text-left font-semibold text-orange-600">Name</th><th className="px-2 py-2 text-left font-semibold text-orange-600">Validity</th><th className="px-2 py-2 text-left font-semibold text-orange-600">Discount %</th><th className="px-2 py-2 text-left font-semibold text-orange-600">Created Date</th><th className="px-2 py-2 text-left font-semibold text-orange-600">Info</th><th className="px-2 py-2 text-left font-semibold text-orange-600">Status</th><th className="px-2 py-2 text-left font-semibold text-orange-600">Created By</th><th className="px-2 py-2 text-left font-semibold text-orange-600">Action</th></tr></thead>
            <tbody>{mockMemberships.map((m, i) => (<tr key={m.id} className="border-b hover:bg-muted/30"><td className="px-2 py-2 text-xs">{i+1}</td><td className="px-2 py-2 text-xs font-medium">{m.cardName}</td><td className="px-2 py-2 text-xs">{m.validity === "Unlimited" ? "Unlimited" : `${m.validityDays} days`}</td><td className="px-2 py-2 text-xs">{m.discountPct}%</td><td className="px-2 py-2 text-xs">{m.createdDate}</td><td className="px-2 py-2 text-[10px]">{m.additionalInfo}</td><td className="px-2 py-2"><span className="text-emerald-600 text-xs">{m.status}</span></td><td className="px-2 py-2 text-xs">{m.createdBy}</td><td className="px-2 py-2"><Button size="sm" variant="ghost" className="h-6 w-6 p-0"><Pencil className="h-3 w-3 text-orange-500" /></Button></td></tr>))}</tbody></table>
          </CardContent>
        </Card>
      )}
      {memTab === "inactive" && <Card><CardContent className="p-6 text-center text-muted-foreground text-sm">No inactive memberships</CardContent></Card>}
    </div>
  );

  // ─── Render Vaccination / ID Proof / Tags ──────────────────────────────────
  const renderVaccination = () => (
    <Card><CardHeader className="pb-2 border-b bg-primary/5"><CardTitle className="text-base text-center text-primary">Vaccination Master</CardTitle></CardHeader>
    <CardContent className="p-4"><table className="w-full text-sm border"><thead className="bg-muted/50 border-b"><tr><th className="px-3 py-2 text-left font-semibold text-orange-600">Vaccine</th><th className="px-3 py-2 text-left font-semibold text-orange-600">Age Group</th><th className="px-3 py-2 text-left font-semibold text-orange-600">Doses</th><th className="px-3 py-2 text-left font-semibold text-orange-600">Interval</th><th className="px-3 py-2 text-left font-semibold text-orange-600">Type</th><th className="px-3 py-2 text-left font-semibold text-orange-600">Status</th></tr></thead>
    <tbody>{mockVaccinations.map(v => (<tr key={v.id} className="border-b hover:bg-muted/30"><td className="px-3 py-2 text-xs font-medium">{v.name}</td><td className="px-3 py-2 text-xs">{v.ageGroup}</td><td className="px-3 py-2 text-xs">{v.doses}</td><td className="px-3 py-2 text-xs">{v.interval}</td><td className="px-3 py-2"><Badge variant={v.type === "Standard" ? "default" : "secondary"} className="text-[9px]">{v.type}</Badge></td><td className="px-3 py-2"><span className="text-emerald-600 text-xs">{v.status}</span></td></tr>))}</tbody></table></CardContent></Card>
  );

  const renderIdProof = () => (
    <Card><CardHeader className="pb-2 border-b bg-primary/5"><CardTitle className="text-base text-center text-primary">ID Proof Master</CardTitle></CardHeader>
    <CardContent className="p-4"><table className="w-full text-sm border"><thead className="bg-muted/50 border-b"><tr><th className="px-3 py-2 text-left font-semibold text-orange-600">#</th><th className="px-3 py-2 text-left font-semibold text-orange-600">ID Proof Type</th><th className="px-3 py-2 text-left font-semibold text-orange-600">Code</th><th className="px-3 py-2 text-left font-semibold text-orange-600">Mandatory</th><th className="px-3 py-2 text-left font-semibold text-orange-600">Status</th></tr></thead>
    <tbody>{mockIdProofs.map((p, i) => (<tr key={p.id} className="border-b hover:bg-muted/30"><td className="px-3 py-2 text-xs">{i+1}</td><td className="px-3 py-2 text-xs font-medium">{p.name}</td><td className="px-3 py-2"><Badge variant="outline" className="font-mono text-[10px]">{p.code}</Badge></td><td className="px-3 py-2">{p.mandatory ? <Badge className="bg-red-100 text-red-700 text-[9px]">Required</Badge> : <Badge variant="secondary" className="text-[9px]">Optional</Badge>}</td><td className="px-3 py-2"><span className="text-emerald-600 text-xs">{p.status}</span> <Pencil className="h-2.5 w-2.5 inline text-orange-500" /></td></tr>))}</tbody></table></CardContent></Card>
  );

  const renderTags = () => (
    <Card><CardHeader className="pb-2 border-b bg-primary/5"><CardTitle className="text-base text-center text-primary">Patient Tags</CardTitle></CardHeader>
    <CardContent className="p-4"><div className="grid grid-cols-2 md:grid-cols-3 gap-3">{mockTags.map(t => (<Card key={t.id} className="p-3 text-center"><Badge className={`${t.color} text-xs px-2 py-0.5`}>{t.name}</Badge><p className="text-lg font-bold mt-2">{t.count}</p><p className="text-[10px] text-muted-foreground">patients</p></Card>))}</div></CardContent></Card>
  );

  // ─── Main Render ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6 text-orange-600" /> Patient Master</h1>
          <p className="text-sm text-muted-foreground">Create patient sources, manage vaccination master, membership care, ID proofs, and patient tags.</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-purple-100 text-purple-700 border-purple-200"><Sparkles className="h-3 w-3 mr-1" /> AI Patient</Badge>
          <Badge variant="secondary">Sources: {mockSources.length} | Members: {mockMemberships.length}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
        {/* Sidebar */}
        <div>
          <Card className="p-0">
            <CardHeader className="pb-2 pt-3 px-3"><CardTitle className="text-sm font-semibold">Patient Master</CardTitle></CardHeader>
            <CardContent className="p-1 space-y-0.5">
              <Button variant="ghost" size="sm" className={`w-full justify-start text-xs h-8 ${section === "source" ? "bg-orange-50 text-orange-700 border border-orange-200" : ""}`} onClick={() => setSection("source")}><span className="mr-2">➕</span> Patient Source</Button>
              <Button variant="ghost" size="sm" className={`w-full justify-start text-xs h-8 ${section === "membership" ? "bg-orange-50 text-orange-700 border border-orange-200" : ""}`} onClick={() => setSection("membership")}><span className="mr-2">💳</span> Membership</Button>
              <Button variant="ghost" size="sm" className={`w-full justify-start text-xs h-8 ${section === "vaccination" ? "bg-orange-50 text-orange-700 border border-orange-200" : ""}`} onClick={() => setSection("vaccination")}><span className="mr-2">💉</span> Vaccination</Button>
              <Button variant="ghost" size="sm" className={`w-full justify-start text-xs h-8 ${section === "idproof" ? "bg-orange-50 text-orange-700 border border-orange-200" : ""}`} onClick={() => setSection("idproof")}><span className="mr-2">🪪</span> ID Proof</Button>
              <Button variant="ghost" size="sm" className={`w-full justify-start text-xs h-8 ${section === "tags" ? "bg-orange-50 text-orange-700 border border-orange-200" : ""}`} onClick={() => setSection("tags")}><span className="mr-2">🏷️</span> Patient Tags</Button>
            </CardContent>
          </Card>

          {/* AI Features */}
          <Card className="mt-3 p-3">
            <p className="text-xs font-semibold mb-2 flex items-center gap-1"><Sparkles className="h-3 w-3 text-purple-500" /> AI Features</p>
            <div className="space-y-1 text-[10px]">
              {AI_FEATURES.slice(0, 5).map(f => (
                <label key={f.label} className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={enabledAi.includes(f.label)} onChange={() => toggleAi(f.label)} className="accent-purple-500" />
                  <span className={enabledAi.includes(f.label) ? "font-medium" : "text-muted-foreground"}>{f.label}</span>
                </label>
              ))}
            </div>
          </Card>
        </div>

        {/* Content */}
        <div>
          {section === "source" && renderSource()}
          {section === "membership" && renderMembership()}
          {section === "vaccination" && renderVaccination()}
          {section === "idproof" && renderIdProof()}
          {section === "tags" && renderTags()}
        </div>
      </div>
    </div>
  );
};

export default PatientMaster;
