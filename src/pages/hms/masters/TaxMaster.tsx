import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Pencil, Plus, Sparkles, Percent, MapPin } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type TaxBreakUp = {
  id: string;
  name: string;
  salesTax: number;
  purchaseTax: number;
};

type LinkedTax = {
  id: string;
  name: string;
  collectionMethod: "base_price" | "primary_tax";
  salesTax: number;
  purchaseTax: number;
};

type TaxEntry = {
  id: string;
  name: string;
  calculateOn: number;
  salesTax: number;
  purchaseTax: number;
  locations: string[];
  description: string;
  notes: string;
  taxBreakUp: TaxBreakUp[];
  linkedTax: LinkedTax[];
  status: "active" | "inactive";
  createdBy: string;
  applicableTo: string[];
  hsnSac: string;
  effectiveFrom: string;
  autoApply: boolean;
};

// ─── Constants ───────────────────────────────────────────────────────────────
const LOCATIONS = [
  { id: "loc1", address: "#11, Main Road, Kadayanallur," },
  { id: "loc2", address: "195. LAKSHMI PURAM STREET, PACR SALAI, Rajapalayam" },
  { id: "loc3", address: "43, Miranda Lane, Old GH Road, Theni" },
  { id: "loc4", address: "No 47, Kulavanikar Puram Road, , Tirunelveli" },
  { id: "loc5", address: "4, Durai Samy Nagar, Keelkattalai, Chennai" },
  { id: "loc6", address: "62 B, Railway Road, , Tenkasi" },
];

const APPLICABLE_TO_OPTIONS = [
  "Consultation (Services)",
  "Panchakarma Treatments",
  "Medicines - Classical (5%)",
  "Medicines - Proprietary (12%)",
  "Lab Services",
  "Radiology Services",
  "Pharmacy Products",
  "Room Rent / Accommodation",
  "OT / Surgery",
  "Stock Purchase - Raw Materials",
  "Stock Purchase - Finished Goods",
  "Equipment Purchase",
  "Service Purchase (AMC, IT, etc.)",
  "Transport / Courier",
  "Professional Services",
];

const AI_TAX_RULES = [
  { id: "r1", label: "Auto-apply GST on Pharmacy sales (5% / 12% based on medicine type)", description: "Automatically selects 5% for classical Ayurveda and 12% for proprietary medicines" },
  { id: "r2", label: "Auto-apply GST on Consultation (Exempt / 18%)", description: "Exempts AYUSH consultation from GST, applies 18% for non-AYUSH services" },
  { id: "r3", label: "Auto-apply GST on Stock Purchase (based on HSN)", description: "Reads HSN code from product master and applies correct purchase tax" },
  { id: "r4", label: "Input Tax Credit (ITC) tracking on purchases", description: "Tracks purchase GST for ITC claim in monthly GSTR-3B filing" },
  { id: "r5", label: "Reverse Charge Mechanism (RCM) for unregistered vendors", description: "Auto-flags purchases from unregistered vendors for RCM liability" },
  { id: "r6", label: "TDS deduction on professional services (Section 194J)", description: "Auto-calculates 10% TDS on professional service payments above ₹30,000" },
  { id: "r7", label: "E-Way Bill trigger for inter-state stock transfers > ₹50,000", description: "Alerts when goods value exceeds threshold for E-Way Bill generation" },
];

// ─── Mock Data ───────────────────────────────────────────────────────────────
const mockActiveTaxes: TaxEntry[] = [
  {
    id: "1", name: "GST", calculateOn: 100, salesTax: 0, purchaseTax: 0,
    locations: ["loc1", "loc2", "loc3", "loc4", "loc5", "loc6"],
    description: "GST Exempt - Ayurveda Consultation", notes: "No GST on AYUSH consultation services as per notification",
    taxBreakUp: [{ id: "b1", name: "CGST", salesTax: 0, purchaseTax: 0 }, { id: "b2", name: "SGST", salesTax: 0, purchaseTax: 0 }],
    linkedTax: [], status: "active", createdBy: "Al Shifa Ayush Hospital",
    applicableTo: ["Consultation (Services)"], hsnSac: "998312", effectiveFrom: "01/07/2017", autoApply: true,
  },
  {
    id: "2", name: "GST", calculateOn: 100, salesTax: 12, purchaseTax: 12,
    locations: ["loc1", "loc2", "loc3", "loc4", "loc5", "loc6"],
    description: "GST 12% - Proprietary Medicines & Lab", notes: "Applicable to patent/proprietary Ayurveda medicines and lab services",
    taxBreakUp: [{ id: "b3", name: "CGST", salesTax: 6, purchaseTax: 6 }, { id: "b4", name: "SGST", salesTax: 6, purchaseTax: 6 }],
    linkedTax: [], status: "active", createdBy: "Al Shifa Ayush Hospital",
    applicableTo: ["Medicines - Proprietary (12%)", "Lab Services"], hsnSac: "3003/3004", effectiveFrom: "01/07/2017", autoApply: true,
  },
  {
    id: "3", name: "GST", calculateOn: 100, salesTax: 18, purchaseTax: 18,
    locations: ["loc1", "loc2", "loc3", "loc4", "loc5", "loc6"],
    description: "GST 18% - Therapy Services & Room Rent", notes: "Panchakarma, physiotherapy services with room charge > ₹1000/day",
    taxBreakUp: [{ id: "b5", name: "CGST", salesTax: 9, purchaseTax: 9 }, { id: "b6", name: "SGST", salesTax: 9, purchaseTax: 9 }],
    linkedTax: [], status: "active", createdBy: "Al Shifa Ayush Hospital",
    applicableTo: ["Panchakarma Treatments", "Room Rent / Accommodation"], hsnSac: "999312", effectiveFrom: "01/07/2017", autoApply: true,
  },
  {
    id: "4", name: "GST", calculateOn: 100, salesTax: 28, purchaseTax: 28,
    locations: ["loc1", "loc2", "loc3", "loc4", "loc5", "loc6"],
    description: "GST 28% - Equipment & Luxury Items", notes: "High-value medical equipment purchases",
    taxBreakUp: [{ id: "b7", name: "CGST", salesTax: 14, purchaseTax: 14 }, { id: "b8", name: "SGST", salesTax: 14, purchaseTax: 14 }],
    linkedTax: [], status: "active", createdBy: "Al Shifa Ayush Hospital",
    applicableTo: ["Equipment Purchase"], hsnSac: "9018", effectiveFrom: "01/07/2017", autoApply: false,
  },
  {
    id: "5", name: "GST", calculateOn: 100, salesTax: 5, purchaseTax: 5,
    locations: ["loc1", "loc2", "loc3", "loc4", "loc5", "loc6"],
    description: "GST 5% - Classical Ayurveda Medicines", notes: "Applicable to classical/traditional Ayurveda formulations listed in Schedule-I of Drugs & Cosmetics Act",
    taxBreakUp: [{ id: "b9", name: "CGST", salesTax: 2.5, purchaseTax: 2.5 }, { id: "b10", name: "SGST", salesTax: 2.5, purchaseTax: 2.5 }],
    linkedTax: [], status: "active", createdBy: "Al Shifa Ayush Hospital",
    applicableTo: ["Medicines - Classical (5%)", "Pharmacy Products"], hsnSac: "3003", effectiveFrom: "01/07/2017", autoApply: true,
  },
];

const mockInactiveTaxes: TaxEntry[] = [
  {
    id: "101", name: "VAT", calculateOn: 100, salesTax: 5, purchaseTax: 5,
    locations: ["loc1"], description: "Old VAT - Replaced by GST", notes: "Pre-GST regime",
    taxBreakUp: [], linkedTax: [], status: "inactive", createdBy: "admin",
    applicableTo: [], hsnSac: "", effectiveFrom: "01/01/2015", autoApply: false,
  },
  {
    id: "102", name: "Service Tax", calculateOn: 100, salesTax: 15, purchaseTax: 0,
    locations: ["loc1"], description: "Old Service Tax - Replaced by GST", notes: "Pre-GST regime",
    taxBreakUp: [], linkedTax: [], status: "inactive", createdBy: "admin",
    applicableTo: [], hsnSac: "", effectiveFrom: "01/06/2015", autoApply: false,
  },
];

// ─── Component ───────────────────────────────────────────────────────────────
const TaxMaster = () => {
  // Tabs: "new", "manage", "inactive"
  const [tab, setTab] = useState<"new" | "manage" | "inactive">("new");

  // New Tax form state
  const [fName, setFName] = useState("");
  const [fCalcOn, setFCalcOn] = useState("100");
  const [fSalesTax, setFSalesTax] = useState("");
  const [fPurchaseTax, setFPurchaseTax] = useState("");
  const [fDescription, setFDescription] = useState("");
  const [fNotes, setFNotes] = useState("");
  const [fLocations, setFLocations] = useState<string[]>([]);
  const [fHsnSac, setFHsnSac] = useState("");
  const [fApplicableTo, setFApplicableTo] = useState<string[]>([]);
  const [fAutoApply, setFAutoApply] = useState(true);

  // Tax Break Up
  const [breakUps, setBreakUps] = useState<TaxBreakUp[]>([]);
  const [buName, setBuName] = useState("");
  const [buSalesTax, setBuSalesTax] = useState("");
  const [buPurchaseTax, setBuPurchaseTax] = useState("");

  // Linked Tax
  const [linkedTaxes, setLinkedTaxes] = useState<LinkedTax[]>([]);
  const [ltName, setLtName] = useState("");
  const [ltMethod, setLtMethod] = useState<"base_price" | "primary_tax">("base_price");
  const [ltSalesTax, setLtSalesTax] = useState("");
  const [ltPurchaseTax, setLtPurchaseTax] = useState("");

  // AI rules
  const [enabledAiRules, setEnabledAiRules] = useState<string[]>(["r1", "r2", "r3", "r4"]);

  // Data
  const [activeTaxes] = useState<TaxEntry[]>(mockActiveTaxes);
  const [inactiveTaxes] = useState<TaxEntry[]>(mockInactiveTaxes);
  const [search, setSearch] = useState("");

  // Handlers
  const handleSelectAllLocations = () => {
    setFLocations(LOCATIONS.map(l => l.id));
  };

  const toggleLocation = (locId: string) => {
    setFLocations(prev => prev.includes(locId) ? prev.filter(l => l !== locId) : [...prev, locId]);
  };

  const toggleApplicable = (item: string) => {
    setFApplicableTo(prev => prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]);
  };

  const handleAddBreakUp = () => {
    if (!buName.trim()) return toast.error("Break Up name required");
    setBreakUps([...breakUps, { id: Date.now().toString(), name: buName.trim(), salesTax: Number(buSalesTax) || 0, purchaseTax: Number(buPurchaseTax) || 0 }]);
    setBuName(""); setBuSalesTax(""); setBuPurchaseTax("");
  };

  const handleAddLinkedTax = () => {
    if (!ltName.trim()) return toast.error("Linked Tax name required");
    setLinkedTaxes([...linkedTaxes, { id: Date.now().toString(), name: ltName.trim(), collectionMethod: ltMethod, salesTax: Number(ltSalesTax) || 0, purchaseTax: Number(ltPurchaseTax) || 0 }]);
    setLtName(""); setLtSalesTax(""); setLtPurchaseTax("");
  };

  const handleSaveTax = () => {
    if (!fName.trim()) return toast.error("Tax Name is required");
    if (!fSalesTax && !fPurchaseTax) return toast.error("Enter Sales Tax or Purchase Tax");
    if (fLocations.length === 0) return toast.error("Select at least one location");
    toast.success(`Tax "${fName}" saved successfully with ${breakUps.length} break-ups!`);
    // Reset form
    setFName(""); setFCalcOn("100"); setFSalesTax(""); setFPurchaseTax("");
    setFDescription(""); setFNotes(""); setFLocations([]); setFHsnSac("");
    setFApplicableTo([]); setBreakUps([]); setLinkedTaxes([]);
  };

  const toggleAiRule = (ruleId: string) => {
    setEnabledAiRules(prev => prev.includes(ruleId) ? prev.filter(r => r !== ruleId) : [...prev, ruleId]);
  };

  const filteredActive = activeTaxes.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase()));
  const filteredInactive = inactiveTaxes.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase()));

  // ─── Render New Tax Form ───────────────────────────────────────────────────
  const renderNewForm = () => (
    <div className="space-y-4">
      {/* AI Tax Automation Rules */}
      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <Label className="font-semibold text-purple-700">AI Tax Automation Rules</Label>
            <Badge className="bg-purple-100 text-purple-700 text-[9px]">{enabledAiRules.length} Active</Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-2">AI automatically applies the correct tax when billing, purchasing stock, or processing services.</p>
          <div className="space-y-1.5">
            {AI_TAX_RULES.map(rule => (
              <div key={rule.id} className="flex items-start gap-2 p-2 rounded border border-purple-100 bg-white hover:bg-purple-50/50">
                <Checkbox
                  checked={enabledAiRules.includes(rule.id)}
                  onCheckedChange={() => toggleAiRule(rule.id)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <p className="text-xs font-medium">{rule.label}</p>
                  <p className="text-[10px] text-muted-foreground">{rule.description}</p>
                </div>
                {enabledAiRules.includes(rule.id) && <Badge className="bg-emerald-100 text-emerald-700 text-[8px]">ON</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tax Form */}
      <Card>
        <CardHeader className="pb-2 border-b bg-primary/5">
          <CardTitle className="text-base text-center text-primary">Tax</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-5">
          {/* Row 1: Name, Calculate On, Sales Tax, Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="font-semibold">Name <span className="text-red-500">*</span></Label>
              <Input value={fName} onChange={e => setFName(e.target.value)} placeholder="Name" className="mt-1" />
            </div>
            <div>
              <Label className="font-semibold">Calculate On(%) <span className="text-red-500">*</span></Label>
              <Input value={fCalcOn} onChange={e => setFCalcOn(e.target.value)} placeholder="100" type="number" className="mt-1" />
            </div>
            <div>
              <Label className="font-semibold">Sales Tax(%) <span className="text-red-500">*</span></Label>
              <Input value={fSalesTax} onChange={e => setFSalesTax(e.target.value)} placeholder="Sales Tax" type="number" className="mt-1" />
            </div>
            <div>
              <Label className="font-semibold">Location <span className="text-red-500">*</span></Label>
              <div className="mt-1 border rounded p-2 max-h-28 overflow-y-auto text-xs space-y-1">
                <div className="flex justify-end mb-1">
                  <Button type="button" size="sm" variant="outline" className="h-5 text-[9px] px-1.5 bg-orange-50 text-orange-600" onClick={handleSelectAllLocations}>Select All</Button>
                </div>
                {LOCATIONS.map(loc => (
                  <label key={loc.id} className={`flex items-start gap-1.5 cursor-pointer p-0.5 rounded ${fLocations.includes(loc.id) ? "bg-primary/5" : ""}`}>
                    <input type="checkbox" checked={fLocations.includes(loc.id)} onChange={() => toggleLocation(loc.id)} className="accent-orange-500 mt-0.5" />
                    <span className="text-[10px] leading-tight">{loc.address}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Purchase Tax, Description, Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="font-semibold">Purchase Tax(%) <span className="text-red-500">*</span></Label>
              <Input value={fPurchaseTax} onChange={e => setFPurchaseTax(e.target.value)} placeholder="Purchase Tax" type="number" className="mt-1" />
            </div>
            <div>
              <Label className="font-semibold">Description <span className="text-red-500">*</span></Label>
              <Input value={fDescription} onChange={e => setFDescription(e.target.value)} placeholder="Description" className="mt-1" />
            </div>
            <div>
              <Label className="font-semibold">Notes</Label>
              <Textarea value={fNotes} onChange={e => setFNotes(e.target.value)} placeholder="Provide notes about the Tax" className="mt-1 h-20 text-sm" />
            </div>
          </div>

          {/* Row 3: HSN/SAC, Applicable To, Auto Apply */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="font-semibold">HSN / SAC Code</Label>
              <Input value={fHsnSac} onChange={e => setFHsnSac(e.target.value)} placeholder="e.g., 3003, 998312" className="mt-1" />
            </div>
            <div>
              <Label className="font-semibold">Applicable To (Auto-apply on)</Label>
              <div className="mt-1 border rounded p-2 max-h-28 overflow-y-auto text-xs space-y-0.5">
                {APPLICABLE_TO_OPTIONS.map(opt => (
                  <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={fApplicableTo.includes(opt)} onChange={() => toggleApplicable(opt)} className="accent-orange-500" />
                    <span className="text-[10px]">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Checkbox checked={fAutoApply} onCheckedChange={c => setFAutoApply(!!c)} />
              <div>
                <Label className="text-sm font-medium">AI Auto-Apply</Label>
                <p className="text-[10px] text-muted-foreground">Automatically apply this tax when matching items are billed or purchased</p>
              </div>
            </div>
          </div>

          {/* Tax Break Up */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-sm mb-2">Tax Break Up</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600 w-8">S.No</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Name</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Sales Tax (%)</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Purchase Tax (%)</th>
                    <th className="px-3 py-2 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {breakUps.map((bu, i) => (
                    <tr key={bu.id} className="border-b">
                      <td className="px-3 py-2 text-xs">{i + 1}</td>
                      <td className="px-3 py-2 text-xs">{bu.name}</td>
                      <td className="px-3 py-2 text-xs">{bu.salesTax}</td>
                      <td className="px-3 py-2 text-xs">{bu.purchaseTax}</td>
                      <td className="px-3 py-2"><Button size="sm" variant="ghost" className="h-5 w-5 p-0 text-red-500" onClick={() => setBreakUps(breakUps.filter(b => b.id !== bu.id))}>×</Button></td>
                    </tr>
                  ))}
                  <tr>
                    <td className="px-3 py-2 text-xs">→</td>
                    <td className="px-3 py-2"><Input value={buName} onChange={e => setBuName(e.target.value)} placeholder="Name" className="h-7 text-xs" /></td>
                    <td className="px-3 py-2"><Input value={buSalesTax} onChange={e => setBuSalesTax(e.target.value)} placeholder="Sales Tax" type="number" className="h-7 text-xs" /></td>
                    <td className="px-3 py-2"><Input value={buPurchaseTax} onChange={e => setBuPurchaseTax(e.target.value)} placeholder="Purchase Tax" type="number" className="h-7 text-xs" /></td>
                    <td className="px-3 py-2"><Button size="sm" onClick={handleAddBreakUp} className="h-7 bg-teal-600 hover:bg-teal-700 text-white text-xs">Add</Button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Linked Tax */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-sm mb-2">Linked Tax</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600 w-8">S.No</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Name</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Collection Method</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Sales Tax (%)</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Purchase Tax (%)</th>
                    <th className="px-3 py-2 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {linkedTaxes.map((lt, i) => (
                    <tr key={lt.id} className="border-b">
                      <td className="px-3 py-2 text-xs">{i + 1}</td>
                      <td className="px-3 py-2 text-xs">{lt.name}</td>
                      <td className="px-3 py-2 text-xs">{lt.collectionMethod === "base_price" ? "On Base Price" : "On Primary Tax"}</td>
                      <td className="px-3 py-2 text-xs">{lt.salesTax}</td>
                      <td className="px-3 py-2 text-xs">{lt.purchaseTax}</td>
                      <td className="px-3 py-2"><Button size="sm" variant="ghost" className="h-5 w-5 p-0 text-red-500" onClick={() => setLinkedTaxes(linkedTaxes.filter(l => l.id !== lt.id))}>×</Button></td>
                    </tr>
                  ))}
                  <tr>
                    <td className="px-3 py-2 text-xs">→</td>
                    <td className="px-3 py-2"><Input value={ltName} onChange={e => setLtName(e.target.value)} placeholder="Name" className="h-7 text-xs" /></td>
                    <td className="px-3 py-2">
                      <div className="flex gap-3 text-xs">
                        <label className="flex items-center gap-1"><input type="radio" name="ltMethod" checked={ltMethod === "base_price"} onChange={() => setLtMethod("base_price")} className="accent-orange-500" />On Base Price</label>
                        <label className="flex items-center gap-1"><input type="radio" name="ltMethod" checked={ltMethod === "primary_tax"} onChange={() => setLtMethod("primary_tax")} className="accent-orange-500" />On Primary Tax</label>
                      </div>
                    </td>
                    <td className="px-3 py-2"><Input value={ltSalesTax} onChange={e => setLtSalesTax(e.target.value)} placeholder="Sales Tax" type="number" className="h-7 text-xs" /></td>
                    <td className="px-3 py-2"><Input value={ltPurchaseTax} onChange={e => setLtPurchaseTax(e.target.value)} placeholder="Purchase Tax" type="number" className="h-7 text-xs" /></td>
                    <td className="px-3 py-2"><Button size="sm" onClick={handleAddLinkedTax} className="h-7 bg-teal-600 hover:bg-teal-700 text-white text-xs">Add</Button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-center pt-4">
            <Button onClick={handleSaveTax} className="bg-orange-500 hover:bg-orange-600 text-white px-10">Save</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ─── Render Manage Tax Table ───────────────────────────────────────────────
  const renderManageTable = (data: TaxEntry[], type: "active" | "inactive") => (
    <Card>
      <CardHeader className={`pb-2 border-b ${type === "inactive" ? "bg-red-50/50" : ""}`}>
        <CardTitle className={`text-base text-center ${type === "inactive" ? "text-red-600" : "text-primary"}`}>
          {type === "active" ? "Manage Tax" : "Manage Inactive Tax"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            Show <select className="border rounded px-2 py-1 text-xs"><option>100</option><option>50</option></select> entries
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs">Search:</span>
            <Input className="h-7 text-xs w-48" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-2 py-2 text-left font-semibold text-orange-600 w-10">S.No</th>
                <th className="px-2 py-2 text-left font-semibold text-orange-600">Name</th>
                <th className="px-2 py-2 text-left font-semibold text-orange-600">Location</th>
                <th className="px-2 py-2 text-left font-semibold text-orange-600">Calculate On (%)</th>
                <th className="px-2 py-2 text-left font-semibold text-orange-600">Sales Tax (%)</th>
                <th className="px-2 py-2 text-left font-semibold text-orange-600">Purchase Tax (%)</th>
                <th className="px-2 py-2 text-left font-semibold text-orange-600">Tax Break Up</th>
                <th className="px-2 py-2 text-left font-semibold text-orange-600">Linked Tax</th>
                <th className="px-2 py-2 text-left font-semibold text-orange-600">Status</th>
                <th className="px-2 py-2 text-left font-semibold text-orange-600">Created By</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={10} className="px-3 py-4 text-center text-muted-foreground">No taxes found</td></tr>
              ) : (
                data.map((tax, i) => (
                  <tr key={tax.id} className="border-b hover:bg-muted/30 align-top">
                    <td className="px-2 py-2 text-xs">{i + 1}</td>
                    <td className="px-2 py-2 text-xs font-medium">{tax.name}</td>
                    <td className="px-2 py-2 text-[10px] max-w-[120px]">
                      {tax.locations.map(locId => {
                        const loc = LOCATIONS.find(l => l.id === locId);
                        return loc ? loc.address.split(",")[0] : "";
                      }).filter(Boolean).join(", ")}
                      {tax.locations.length > 2 && ".."}
                    </td>
                    <td className="px-2 py-2 text-xs text-center">{tax.calculateOn}</td>
                    <td className="px-2 py-2 text-xs text-center">{tax.salesTax.toFixed(2)}</td>
                    <td className="px-2 py-2 text-xs text-center">{tax.purchaseTax.toFixed(2)}</td>
                    <td className="px-2 py-2">
                      {tax.taxBreakUp.length > 0 ? (
                        <table className="text-[10px] border w-full">
                          <thead><tr className="bg-orange-50"><th className="px-1 py-0.5 font-semibold text-orange-600">Name</th><th className="px-1 py-0.5 font-semibold text-orange-600">Sales (%)</th><th className="px-1 py-0.5 font-semibold text-orange-600">Purchase (%)</th></tr></thead>
                          <tbody>
                            {tax.taxBreakUp.map(bu => (
                              <tr key={bu.id} className="border-t"><td className="px-1 py-0.5">{bu.name}</td><td className="px-1 py-0.5 text-center">{bu.salesTax.toFixed(2)}</td><td className="px-1 py-0.5 text-center">{bu.purchaseTax.toFixed(2)}</td></tr>
                            ))}
                          </tbody>
                        </table>
                      ) : <span className="text-[10px] text-muted-foreground">-</span>}
                    </td>
                    <td className="px-2 py-2 text-[10px] text-muted-foreground">{tax.linkedTax.length > 0 ? `${tax.linkedTax.length} linked` : "-"}</td>
                    <td className="px-2 py-2">
                      <span className={`text-xs ${type === "active" ? "text-emerald-600" : "text-red-500"}`}>
                        {tax.status}
                      </span>
                      <Pencil className="h-2.5 w-2.5 inline text-orange-500 ml-0.5 cursor-pointer" />
                    </td>
                    <td className="px-2 py-2 text-[10px]">{tax.createdBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing 1 to {data.length} of {data.length} entries</span>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" className="h-6 text-xs" disabled>Previous</Button>
            <Badge variant="outline" className="text-xs">1</Badge>
            <Button size="sm" variant="outline" className="h-6 text-xs" disabled>Next</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // ─── Main Render ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Percent className="h-6 w-6 text-orange-600" /> Tax Master
          </h1>
          <p className="text-sm text-muted-foreground">
            Define and update applicable tax rates. AI auto-applies GST on sales, purchases, and services.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-purple-100 text-purple-700 border-purple-200">
            <Sparkles className="h-3 w-3 mr-1" /> AI Tax Automation
          </Badge>
          <Badge variant="secondary">
            Active: {activeTaxes.length} | Rules: {enabledAiRules.length}
          </Badge>
        </div>
      </div>

      {/* Master Setting Layout: Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
        {/* Sidebar */}
        <div>
          <Card className="p-0">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm font-semibold">Tax Master</CardTitle>
            </CardHeader>
            <CardContent className="p-1 space-y-0.5">
              <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-8 bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200">
                <span className="mr-2">📋</span> Manage Tax
              </Button>
            </CardContent>
          </Card>

          {/* GST Quick Reference */}
          <Card className="mt-3 p-3">
            <p className="text-xs font-semibold mb-2">GST Slab Reference</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">0% Exempt</span>
                <Badge className="bg-gray-100 text-gray-600 text-[9px]">Consultation</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">5% GST</span>
                <Badge className="bg-emerald-100 text-emerald-600 text-[9px]">Classical Med</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">12% GST</span>
                <Badge className="bg-blue-100 text-blue-600 text-[9px]">Patent Med</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">18% GST</span>
                <Badge className="bg-amber-100 text-amber-600 text-[9px]">Services</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">28% GST</span>
                <Badge className="bg-red-100 text-red-600 text-[9px]">Equipment</Badge>
              </div>
            </div>
          </Card>

          {/* AI Responsibility Guide */}
          <Card className="mt-3 p-3">
            <p className="text-xs font-semibold mb-2 flex items-center gap-1"><Sparkles className="h-3 w-3 text-purple-500" /> Who is Responsible?</p>
            <div className="space-y-1.5 text-[10px]">
              <div className="p-1.5 rounded bg-muted/50">
                <span className="font-medium">Sales Tax →</span> Collected from patient, remitted to Govt
              </div>
              <div className="p-1.5 rounded bg-muted/50">
                <span className="font-medium">Purchase Tax →</span> Paid to vendor, claimed as ITC
              </div>
              <div className="p-1.5 rounded bg-muted/50">
                <span className="font-medium">GSTR-1 →</span> AI prepares outward supply data
              </div>
              <div className="p-1.5 rounded bg-muted/50">
                <span className="font-medium">GSTR-3B →</span> AI summarizes for monthly filing
              </div>
              <div className="p-1.5 rounded bg-muted/50">
                <span className="font-medium">E-Way Bill →</span> Auto-trigger for transfers {">"} ₹50K
              </div>
            </div>
          </Card>
        </div>

        {/* Content Area */}
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 border-b pb-0">
            <Button variant="ghost" size="sm" className={`rounded-b-none text-xs ${tab === "new" ? "text-orange-700 border-b-2 border-orange-500 font-semibold bg-orange-50" : "text-muted-foreground"}`} onClick={() => setTab("new")}>
              New
            </Button>
            <Button variant="ghost" size="sm" className={`rounded-b-none text-xs ${tab === "manage" ? "text-teal-700 border-b-2 border-teal-600 font-semibold bg-teal-50" : "text-muted-foreground"}`} onClick={() => setTab("manage")}>
              Manage Tax
            </Button>
            <Button variant="ghost" size="sm" className={`rounded-b-none text-xs ${tab === "inactive" ? "text-red-600 border-b-2 border-red-500 font-semibold bg-red-50" : "text-muted-foreground"}`} onClick={() => setTab("inactive")}>
              Manage Inactive Tax
            </Button>
          </div>

          {tab === "new" && renderNewForm()}
          {tab === "manage" && renderManageTable(filteredActive, "active")}
          {tab === "inactive" && renderManageTable(filteredInactive, "inactive")}
        </div>
      </div>
    </div>
  );
};

export default TaxMaster;
