import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil, Sparkles, Warehouse, Search } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type Store = {
  id: string;
  location: string;
  name: string;
  type: string;
  isMaster: boolean;
  masterStore: string;
  status: "active" | "inactive";
  gstin: string;
  drugLicense: string;
  totalProducts: number;
  totalValue: number;
  createdBy: string;
};

// ─── Constants ───────────────────────────────────────────────────────────────
const LOCATIONS = [
  "Tenaksi (location1)",
  "#11, Main Road, Kadayanallur (location2)",
  "195. LAKSHMI PURAM STREET, Rajapalayam (location3)",
  "43, Miranda Lane, Theni (location4)",
  "No 47, Kulavanikar Puram Road, Tirunelveli (location5)",
  "4, Durai Samy Nagar, Chennai (location6)",
];
const TRANSACTION_TYPES = ["Purchase", "Sales", "Transfer In", "Transfer Out", "Stock Adjustment", "Return Purchase", "Return Sales", "Manufacturing", "Indent", "Dispatch"];
const STORE_TYPES = ["Inventory", "Pharmacy", "Raw Material", "Finished Goods", "Consumables", "Equipment"];
const PRODUCT_TYPES = ["Ayurveda Classical", "Ayurveda Proprietary", "Siddha", "Homeopathy", "Unani", "Modern (Allopathy)", "Surgical", "Consumables", "Raw Materials", "Packing Materials", "Lab Reagents", "General"];
const MASTER_STORES = ["Spine Ayush - Tenaksi (central)", "Central Store", "Al Shifa Ayush Center Rajapalayam", "IP Pharmacy Store", "Herbz and Healz Pharmacy Store", "Al Shifa Ayush Center Tirunelveli"];
const PREFIX_FIELDS = [
  "Pharmacy Bill Prefix", "Pharmacy Estimate Prefix", "Pharmacy Return Bill Prefix",
  "Pharmacy Return Estimate Prefix", "Pharmacy Credit Settlement Prefix", "Issue Prefix",
  "PO Prefix", "GRN Prefix", "GRturn Prefix", "Indent Prefix", "Return Indent Prefix",
  "Dispatch Prefix", "GRN Credit Settlement Prefix", "GRturn Credit Settlement Prefix",
  "Advance Prefix", "Order No Prefix",
];

const AI_STORE_FEATURES = [
  { label: "Auto Reorder Point Alert", desc: "AI alerts when stock falls below reorder level based on consumption patterns" },
  { label: "Expiry Date Tracking", desc: "Auto-flags products expiring within 90/60/30 days for clearance" },
  { label: "Dead Stock Identification", desc: "AI identifies non-moving stock (no sales > 6 months) for transfer/return" },
  { label: "Demand Forecasting", desc: "Predicts weekly demand based on historical sales and seasonal trends" },
  { label: "Inter-store Transfer Suggestion", desc: "Suggests transfer from overstocked branch to understocked branch" },
  { label: "Purchase Order Auto-Generation", desc: "Creates PO drafts when stock reaches reorder level" },
  { label: "Batch & FIFO Management", desc: "Ensures first-expiry-first-out dispensing automatically" },
];

// ─── Mock Data ───────────────────────────────────────────────────────────────
const mockActive: Store[] = [
  { id: "1", location: "Tenaksi (location1)", name: "Spine Ayush - Tenaksi", type: "Pharmacy", isMaster: true, masterStore: "", status: "active", gstin: "33AABCS1429B1ZS", drugLicense: "TN/MFG/2023/001245", totalProducts: 485, totalValue: 1250000, createdBy: "Al Shifa Ayush Hospital" },
  { id: "2", location: "#11, Main Road, Kadayanallur (location2)", name: "Central Store", type: "Inventory", isMaster: true, masterStore: "", status: "active", gstin: "33AABCS1429B2ZR", drugLicense: "TN/MFG/2023/001246", totalProducts: 320, totalValue: 850000, createdBy: "Al Shifa Ayush Hospital" },
  { id: "3", location: "195. LAKSHMI PURAM STREET, Rajapalayam (location3)", name: "Al Shifa Ayush Center Rajapalayam", type: "Pharmacy", isMaster: false, masterStore: "Spine Ayush - Tenaksi (central)", status: "active", gstin: "33AABCS1429B3ZQ", drugLicense: "TN/RET/2023/005678", totalProducts: 280, totalValue: 680000, createdBy: "Al Shifa Ayush Hospital" },
  { id: "4", location: "No 47, Kulavanikar Puram Road, Tirunelveli (location5)", name: "Al Shifa Ayush Center Tirunelveli", type: "Pharmacy", isMaster: false, masterStore: "Spine Ayush - Tenaksi (central)", status: "active", gstin: "33AABCS1429B4ZP", drugLicense: "TN/RET/2024/008901", totalProducts: 195, totalValue: 420000, createdBy: "Al Shifa Ayush Hospital" },
  { id: "5", location: "#11, Main Road, Kadayanallur (location2)", name: "IP Pharmacy Store", type: "Pharmacy", isMaster: false, masterStore: "Central Store", status: "active", gstin: "33AABCS1429B2ZR", drugLicense: "TN/RET/2023/001247", totalProducts: 150, totalValue: 380000, createdBy: "Al Shifa Ayush Hospital" },
  { id: "6", location: "4, Durai Samy Nagar, Chennai (location6)", name: "Herbz and Healz Pharmacy Store", type: "Pharmacy", isMaster: false, masterStore: "Central Store", status: "active", gstin: "33AABCS1429B5ZN", drugLicense: "TN/RET/2024/012345", totalProducts: 410, totalValue: 920000, createdBy: "Al Shifa Ayush Hospital" },
];
const mockInactive: Store[] = [
  { id: "101", location: "Tenaksi (location1)", name: "Old Dispensary (Closed)", type: "Pharmacy", isMaster: false, masterStore: "", status: "inactive", gstin: "", drugLicense: "", totalProducts: 0, totalValue: 0, createdBy: "admin" },
];

// ─── Component ───────────────────────────────────────────────────────────────
const StoreMasterHms = () => {
  const [masterSection, setMasterSection] = useState<"manage-store" | "store-mapping">("manage-store");
  const [storeTab, setStoreTab] = useState<"new" | "manage" | "inactive">("new");
  const [search, setSearch] = useState("");

  // Form
  const [fLocation, setFLocation] = useState("");
  const [fName, setFName] = useState("");
  const [fTransactions, setFTransactions] = useState<string[]>([]);
  const [fType, setFType] = useState("Inventory");
  const [fIsMaster, setFIsMaster] = useState(false);
  const [fSelectMaster, setFSelectMaster] = useState("");
  const [fStatus, setFStatus] = useState("active");
  const [fProductTypes, setFProductTypes] = useState<string[]>([]);
  const [fTin, setFTin] = useState("");
  const [fCst, setFCst] = useState("");
  const [fCin, setFCin] = useState("");
  const [fGstin, setFGstin] = useState("");
  const [fDrugLicense, setFDrugLicense] = useState("");
  const [fDisplayName, setFDisplayName] = useState(false);
  const [fCounter, setFCounter] = useState(false);
  const [fPrefixes, setFPrefixes] = useState<Record<string, string>>({});
  const [enabledAi, setEnabledAi] = useState<string[]>(["Auto Reorder Point Alert", "Expiry Date Tracking", "Batch & FIFO Management"]);

  // Mapping
  const [mappingStore, setMappingStore] = useState("");
  const [mappingLoaded, setMappingLoaded] = useState(false);

  const toggleTx = (t: string) => setFTransactions(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  const togglePt = (t: string) => setFProductTypes(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  const toggleAi = (l: string) => setEnabledAi(p => p.includes(l) ? p.filter(x => x !== l) : [...p, l]);

  const handleSave = () => {
    if (!fName.trim()) return toast.error("Store Name is required");
    if (!fLocation) return toast.error("Select a Location");
    toast.success(`Store "${fName}" created!`);
  };

  const handleLoadMapping = () => {
    if (!mappingStore) return toast.error("Select a store");
    setMappingLoaded(true);
    toast.success("Mapping loaded");
  };

  const filtered = (data: Store[]) => data.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.type.toLowerCase().includes(search.toLowerCase()));

  // ─── Render New Store Form ─────────────────────────────────────────────────
  const renderNewForm = () => (
    <div className="space-y-4">
      {/* AI Features */}
      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <Label className="font-semibold text-purple-700">AI Store Intelligence</Label>
            <Badge className="bg-purple-100 text-purple-700 text-[9px]">{enabledAi.length} Active</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {AI_STORE_FEATURES.map(f => (
              <label key={f.label} className="flex items-start gap-2 p-2 rounded border border-purple-100 bg-white cursor-pointer hover:bg-purple-50/50">
                <input type="checkbox" checked={enabledAi.includes(f.label)} onChange={() => toggleAi(f.label)} className="accent-purple-500 mt-0.5" />
                <div><p className="text-xs font-medium">{f.label}</p><p className="text-[10px] text-muted-foreground">{f.desc}</p></div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 border-b bg-primary/5">
          <CardTitle className="text-base text-center text-primary">Store</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">Location <span className="text-red-500">*</span></Label>
              <Select value={fLocation} onValueChange={setFLocation}><SelectTrigger className="mt-1"><SelectValue placeholder="Select Location" /></SelectTrigger><SelectContent>{LOCATIONS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select>
            </div>
            <div>
              <Label className="font-semibold">Name <span className="text-red-500">*</span></Label>
              <Input value={fName} onChange={e => setFName(e.target.value)} placeholder="Store Name" className="mt-1" />
            </div>
          </div>

          <div>
            <Label className="font-semibold">Allowed Transactions <span className="text-red-500">*</span></Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {TRANSACTION_TYPES.map(t => (
                <label key={t} className="flex items-center gap-1 text-xs cursor-pointer">
                  <input type="checkbox" checked={fTransactions.includes(t)} onChange={() => toggleTx(t)} className="accent-orange-500" />{t}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="font-semibold">Type <span className="text-red-500">*</span></Label>
              <Select value={fType} onValueChange={setFType}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{STORE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Checkbox checked={fIsMaster} onCheckedChange={c => setFIsMaster(!!c)} />
              <Label className="text-sm">Is Master</Label>
            </div>
            <div>
              <Label className="font-semibold">Select Master <span className="text-red-500">*</span></Label>
              <Select value={fSelectMaster} onValueChange={setFSelectMaster}><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{MASTER_STORES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select>
            </div>
            <div>
              <Label className="font-semibold">Status <span className="text-red-500">*</span></Label>
              <Select value={fStatus} onValueChange={setFStatus}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select>
            </div>
          </div>

          <div>
            <Label className="font-semibold">Allowed Product Type</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {PRODUCT_TYPES.map(p => (
                <label key={p} className="flex items-center gap-1 text-xs cursor-pointer">
                  <input type="checkbox" checked={fProductTypes.includes(p)} onChange={() => togglePt(p)} className="accent-orange-500" />{p}
                </label>
              ))}
            </div>
          </div>

          {/* Compliance */}
          <div className="border-t pt-4 space-y-3">
            <h3 className="font-semibold text-sm">Store Compliance & Registration</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><Label className="text-xs">Store TIN</Label><Input value={fTin} onChange={e => setFTin(e.target.value)} className="mt-0.5 h-8 text-sm" /></div>
              <div><Label className="text-xs">Store CST</Label><Input value={fCst} onChange={e => setFCst(e.target.value)} className="mt-0.5 h-8 text-sm" /></div>
              <div><Label className="text-xs">Store CIN</Label><Input value={fCin} onChange={e => setFCin(e.target.value)} className="mt-0.5 h-8 text-sm" /></div>
              <div><Label className="text-xs">Store GSTIN</Label><Input value={fGstin} onChange={e => setFGstin(e.target.value)} className="mt-0.5 h-8 text-sm" /></div>
              <div className="sm:col-span-2"><Label className="text-xs">Store Drug License No</Label><Input value={fDrugLicense} onChange={e => setFDrugLicense(e.target.value)} className="mt-0.5 h-8 text-sm" /></div>
            </div>
          </div>

          {/* Options */}
          <div className="border-t pt-4 flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer"><Checkbox checked={fDisplayName} onCheckedChange={c => setFDisplayName(!!c)} /><span className="text-xs">Use Display Name</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><Checkbox checked={fCounter} onCheckedChange={c => setFCounter(!!c)} /><span className="text-xs">Enable Save for counter in bill</span></label>
          </div>

          {/* Prefixes */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-sm mb-3">Prefix</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PREFIX_FIELDS.map(pf => (
                <div key={pf}>
                  <Label className="text-[10px] text-muted-foreground">{pf}</Label>
                  <Input value={fPrefixes[pf] || ""} onChange={e => setFPrefixes({ ...fPrefixes, [pf]: e.target.value })} placeholder={pf} className="h-7 text-xs mt-0.5" />
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-center pt-4">
            <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600 text-white px-10">Submit</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ─── Render Manage Table ───────────────────────────────────────────────────
  const renderTable = (data: Store[], type: "active" | "inactive") => (
    <Card>
      <CardHeader className={`pb-2 border-b ${type === "inactive" ? "bg-red-50/50" : ""}`}>
        <CardTitle className={`text-base text-center ${type === "inactive" ? "text-red-600" : "text-primary"}`}>
          {type === "active" ? "Manage Store" : "Manage Inactive Store"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">Show <select className="border rounded px-2 py-1 text-xs"><option>100</option></select> entries</div>
          <div className="flex items-center gap-2"><span className="text-xs">Search:</span><Input className="h-7 text-xs w-48" value={search} onChange={e => setSearch(e.target.value)} /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Store Name</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Type</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Location</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">GSTIN</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Products</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Value (₹)</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Master</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Status</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Created By</th>
              </tr>
            </thead>
            <tbody>
              {filtered(data).length === 0 ? (
                <tr><td colSpan={9} className="px-3 py-4 text-center text-muted-foreground">No stores found</td></tr>
              ) : (
                filtered(data).map(s => (
                  <tr key={s.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 font-medium text-xs text-primary">{s.name}</td>
                    <td className="px-3 py-2"><Badge variant="outline" className="text-[9px]">{s.type}</Badge></td>
                    <td className="px-3 py-2 text-[10px] max-w-[150px] truncate">{s.location}</td>
                    <td className="px-3 py-2 font-mono text-[10px]">{s.gstin || "-"}</td>
                    <td className="px-3 py-2 text-xs">{s.totalProducts}</td>
                    <td className="px-3 py-2 text-xs">₹{s.totalValue.toLocaleString("en-IN")}</td>
                    <td className="px-3 py-2">{s.isMaster ? <Badge className="bg-amber-100 text-amber-700 text-[9px]">Master</Badge> : <span className="text-[10px] text-muted-foreground">{s.masterStore.split("(")[0]}</span>}</td>
                    <td className="px-3 py-2"><span className={type === "active" ? "text-emerald-600 text-xs" : "text-red-500 text-xs"}>{s.status}</span><Pencil className="h-2.5 w-2.5 inline text-orange-500 ml-0.5" /></td>
                    <td className="px-3 py-2 text-[10px]">{s.createdBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="text-xs text-muted-foreground">Showing 1 to {filtered(data).length} of {filtered(data).length} entries</div>
      </CardContent>
    </Card>
  );

  // ─── Render Store Mapping ──────────────────────────────────────────────────
  const renderMapping = () => (
    <Card>
      <CardHeader className="pb-2 border-b bg-primary/5">
        <CardTitle className="text-base text-center text-primary">Manage Store Mapping</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-end gap-4">
          <div className="min-w-[300px]">
            <Label className="font-semibold">Store :</Label>
            <Select value={mappingStore} onValueChange={setMappingStore}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select Store" /></SelectTrigger>
              <SelectContent>{MASTER_STORES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button onClick={handleLoadMapping} className="bg-orange-500 hover:bg-orange-600 text-white">Load</Button>
        </div>
        {mappingLoaded && (
          <div className="space-y-3 pt-3 border-t">
            <p className="text-sm font-medium">Product mapping for: <span className="text-primary">{mappingStore}</span></p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Product Name</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Category</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Reorder Level</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Current Stock</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Mapped</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Yogaraja Guggulu", cat: "Ayurveda Classical", reorder: 50, stock: 120, mapped: true },
                    { name: "Dhanwantharam Thailam 200ml", cat: "Ayurveda Classical", reorder: 30, stock: 45, mapped: true },
                    { name: "Rasnadi Kashayam", cat: "Ayurveda Classical", reorder: 25, stock: 8, mapped: true },
                    { name: "Kottamchukkadi Thailam", cat: "Ayurveda Classical", reorder: 20, stock: 35, mapped: true },
                    { name: "Triphala Churna 100g", cat: "Ayurveda Classical", reorder: 40, stock: 72, mapped: false },
                  ].map((p, i) => (
                    <tr key={i} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2 text-xs font-medium">{p.name}</td>
                      <td className="px-3 py-2 text-[10px]">{p.cat}</td>
                      <td className="px-3 py-2 text-xs">{p.reorder}</td>
                      <td className="px-3 py-2 text-xs">
                        <span className={p.stock < p.reorder ? "text-red-600 font-bold" : ""}>{p.stock}</span>
                        {p.stock < p.reorder && <Badge className="bg-red-100 text-red-600 text-[8px] ml-1">LOW</Badge>}
                      </td>
                      <td className="px-3 py-2">{p.mapped ? <Badge className="bg-emerald-100 text-emerald-700 text-[9px]">Yes</Badge> : <Badge variant="outline" className="text-[9px] text-amber-600">No</Badge>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // ─── Main Render ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Warehouse className="h-6 w-6 text-orange-600" /> Store Master</h1>
          <p className="text-sm text-muted-foreground">Manage inventory storage locations, product mapping, and AI-powered stock intelligence.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-purple-100 text-purple-700 border-purple-200"><Sparkles className="h-3 w-3 mr-1" /> AI Inventory</Badge>
          <Badge variant="secondary">Stores: {mockActive.length}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
        {/* Sidebar */}
        <div>
          <Card className="p-0">
            <CardHeader className="pb-2 pt-3 px-3"><CardTitle className="text-sm font-semibold">Store Master</CardTitle></CardHeader>
            <CardContent className="p-1 space-y-0.5">
              <Button variant="ghost" size="sm" className={`w-full justify-start text-xs h-8 ${masterSection === "manage-store" ? "bg-orange-50 text-orange-700 border border-orange-200" : ""}`} onClick={() => setMasterSection("manage-store")}>
                <span className="mr-2">🏪</span> Manage Store
              </Button>
              <Button variant="ghost" size="sm" className={`w-full justify-start text-xs h-8 ${masterSection === "store-mapping" ? "bg-orange-50 text-orange-700 border border-orange-200" : ""}`} onClick={() => setMasterSection("store-mapping")}>
                <span className="mr-2">🔗</span> Store Mapping
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-3 p-3">
            <p className="text-xs font-semibold mb-2">Store Summary</p>
            <div className="space-y-1 text-xs">
              {mockActive.map(s => (
                <div key={s.id} className="flex justify-between">
                  <span className="text-muted-foreground truncate max-w-[120px]">{s.name.split(" ").slice(0, 2).join(" ")}</span>
                  <Badge variant="secondary" className="text-[10px] h-4">{s.totalProducts}</Badge>
                </div>
              ))}
              <div className="flex justify-between pt-1 border-t mt-1 font-medium">
                <span>Total Value</span>
                <span className="text-xs">₹{mockActive.reduce((sum, s) => sum + s.totalValue, 0).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {masterSection === "manage-store" && (
            <>
              <div className="flex gap-2 border-b pb-0">
                <Button variant="ghost" size="sm" className={`rounded-b-none text-xs ${storeTab === "new" ? "text-orange-700 border-b-2 border-orange-500 font-semibold bg-orange-50" : "text-muted-foreground"}`} onClick={() => setStoreTab("new")}>New</Button>
                <Button variant="ghost" size="sm" className={`rounded-b-none text-xs ${storeTab === "manage" ? "text-teal-700 border-b-2 border-teal-600 font-semibold bg-teal-50" : "text-muted-foreground"}`} onClick={() => setStoreTab("manage")}>Manage Store</Button>
                <Button variant="ghost" size="sm" className={`rounded-b-none text-xs ${storeTab === "inactive" ? "text-red-600 border-b-2 border-red-500 font-semibold bg-red-50" : "text-muted-foreground"}`} onClick={() => setStoreTab("inactive")}>Manage Inactive Store</Button>
              </div>
              {storeTab === "new" && renderNewForm()}
              {storeTab === "manage" && renderTable(mockActive, "active")}
              {storeTab === "inactive" && renderTable(mockInactive, "inactive")}
            </>
          )}
          {masterSection === "store-mapping" && renderMapping()}
        </div>
      </div>
    </div>
  );
};

export default StoreMasterHms;
