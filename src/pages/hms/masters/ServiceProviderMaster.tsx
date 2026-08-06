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
import { Pencil, Sparkles, Search, Truck, Plus, Download } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type ServiceProvider = {
  id: string;
  code: string;
  name: string;
  displayName: string;
  type: string;
  category: string;
  gstin: string;
  panNo: string;
  drugLicense: string;
  fssaiNo: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  bankName: string;
  accountNo: string;
  ifsc: string;
  creditDays: number;
  creditLimit: number;
  tdsApplicable: boolean;
  tdsPercent: number;
  status: "active" | "inactive";
  createdBy: string;
  createdDate: string;
  lastOrderDate: string;
  totalOrders: number;
  outstandingAmount: number;
};

// ─── Constants ───────────────────────────────────────────────────────────────
const PROVIDER_TYPES = ["Medicine Supplier", "Equipment Supplier", "Lab Reagent Supplier", "Consumables Vendor", "Service Provider (AMC)", "IT Service Provider", "Packaging Supplier", "Raw Material Supplier", "Transport / Courier", "Printing / Stationery", "Food & Catering", "Housekeeping", "Laundry", "Security", "Construction / Maintenance", "Professional (CA/Lawyer)", "Other"];
const CATEGORIES = ["Ayurveda", "Siddha", "Homeopathy", "Modern Medicine", "Surgical", "Lab", "General", "IT", "Facility"];
const STATES = ["Tamil Nadu", "Kerala", "Karnataka", "Andhra Pradesh", "Telangana", "Maharashtra", "Delhi", "Gujarat", "Rajasthan", "Other"];
const PAYMENT_TERMS = ["Immediate", "7 Days", "15 Days", "30 Days", "45 Days", "60 Days", "90 Days"];

const AI_FEATURES = [
  { label: "Duplicate Detection", desc: "AI checks if supplier already exists by name/GSTIN/phone before adding" },
  { label: "Auto GSTIN Verification", desc: "Validates GSTIN against government portal and fetches business details" },
  { label: "Payment Due Alerts", desc: "Auto-alerts for pending payments based on credit days and due dates" },
  { label: "Vendor Performance Score", desc: "AI rates vendors on delivery time, quality, pricing, and compliance" },
  { label: "Smart Reorder Suggestion", desc: "Suggests which vendor to order from based on price history and stock levels" },
  { label: "Compliance Expiry Tracker", desc: "Tracks drug license, FSSAI, and GST registration expiry for vendors" },
  { label: "Price Comparison AI", desc: "Compares prices across vendors for same product to suggest best deal" },
];

// ─── Mock Data ───────────────────────────────────────────────────────────────
const mockActiveProviders: ServiceProvider[] = [
  { id: "1", code: "SUP-001", name: "Kottakkal Arya Vaidya Sala", displayName: "Kottakkal AVS", type: "Medicine Supplier", category: "Ayurveda", gstin: "32AABCK1234A1ZS", panNo: "AABCK1234A", drugLicense: "KL/MFG/2020/000123", fssaiNo: "10720066000123", contactPerson: "Mr. Rajesh Kumar", phone: "0483-2742216", email: "sales@aryavaidyasala.com", address: "Kottakkal, Malappuram", city: "Kottakkal", state: "Kerala", pincode: "676503", bankName: "SBI Kottakkal", accountNo: "38012345678", ifsc: "SBIN0001234", creditDays: 30, creditLimit: 500000, tdsApplicable: true, tdsPercent: 2, status: "active", createdBy: "Al Shifa Ayush Hospital", createdDate: "01/01/2024", lastOrderDate: "10/07/2026", totalOrders: 156, outstandingAmount: 85000 },
  { id: "2", code: "SUP-002", name: "Nagarjuna Herbal Concentrates", displayName: "Nagarjuna", type: "Medicine Supplier", category: "Ayurveda", gstin: "32AABCN5678B2ZQ", panNo: "AABCN5678B", drugLicense: "KL/MFG/2019/000456", fssaiNo: "10720066000456", contactPerson: "Mr. Suresh Nair", phone: "0487-2320952", email: "orders@nagarjuna.com", address: "Thodupuzha, Idukki", city: "Thodupuzha", state: "Kerala", pincode: "685584", bankName: "Federal Bank", accountNo: "14501234567890", ifsc: "FDRL0001450", creditDays: 45, creditLimit: 300000, tdsApplicable: true, tdsPercent: 2, status: "active", createdBy: "Al Shifa Ayush Hospital", createdDate: "15/02/2024", lastOrderDate: "05/07/2026", totalOrders: 98, outstandingAmount: 42000 },
  { id: "3", code: "SUP-003", name: "SDP Pharmacy Pvt Ltd", displayName: "SDP Pharmacy", type: "Medicine Supplier", category: "Siddha", gstin: "33AABCS9012C3ZR", panNo: "AABCS9012C", drugLicense: "TN/MFG/2021/001234", fssaiNo: "12420066001234", contactPerson: "Mr. Murugan", phone: "044-28151234", email: "supply@sdppharmacy.com", address: "Tambaram, Chennai", city: "Chennai", state: "Tamil Nadu", pincode: "600045", bankName: "Indian Bank", accountNo: "6001234567", ifsc: "IDIB0001234", creditDays: 30, creditLimit: 200000, tdsApplicable: false, tdsPercent: 0, status: "active", createdBy: "Al Shifa Ayush Hospital", createdDate: "01/03/2024", lastOrderDate: "12/07/2026", totalOrders: 72, outstandingAmount: 28000 },
  { id: "4", code: "SUP-004", name: "Medline India Pvt Ltd", displayName: "Medline", type: "Consumables Vendor", category: "Surgical", gstin: "33AABCM3456D4ZP", panNo: "AABCM3456D", drugLicense: "", fssaiNo: "", contactPerson: "Ms. Priya Sharma", phone: "044-42001234", email: "sales@medlineindia.com", address: "Guindy, Chennai", city: "Chennai", state: "Tamil Nadu", pincode: "600032", bankName: "HDFC Bank", accountNo: "50201234567890", ifsc: "HDFC0001234", creditDays: 15, creditLimit: 100000, tdsApplicable: false, tdsPercent: 0, status: "active", createdBy: "Al Shifa Ayush Hospital", createdDate: "10/04/2024", lastOrderDate: "01/07/2026", totalOrders: 45, outstandingAmount: 12000 },
  { id: "5", code: "SUP-005", name: "Sysmex India Pvt Ltd", displayName: "Sysmex Service", type: "Service Provider (AMC)", category: "Lab", gstin: "27AABCS7890E5ZN", panNo: "AABCS7890E", drugLicense: "", fssaiNo: "", contactPerson: "Mr. Anand Patel", phone: "022-67891234", email: "service@sysmex.co.in", address: "Andheri East, Mumbai", city: "Mumbai", state: "Maharashtra", pincode: "400069", bankName: "ICICI Bank", accountNo: "02001234567", ifsc: "ICIC0000200", creditDays: 30, creditLimit: 200000, tdsApplicable: true, tdsPercent: 10, status: "active", createdBy: "Al Shifa Ayush Hospital", createdDate: "01/05/2024", lastOrderDate: "15/04/2026", totalOrders: 12, outstandingAmount: 0 },
  { id: "6", code: "SUP-006", name: "Vaidyaratnam Oushadhasala", displayName: "Vaidyaratnam", type: "Medicine Supplier", category: "Ayurveda", gstin: "32AABCV2345F6ZM", panNo: "AABCV2345F", drugLicense: "KL/MFG/2018/000789", fssaiNo: "10720066000789", contactPerson: "Mr. Krishnan", phone: "0487-2352510", email: "orders@vaidyaratnam.com", address: "Ollur, Thrissur", city: "Thrissur", state: "Kerala", pincode: "680306", bankName: "Canara Bank", accountNo: "0987654321012", ifsc: "CNRB0001234", creditDays: 30, creditLimit: 400000, tdsApplicable: true, tdsPercent: 2, status: "active", createdBy: "Al Shifa Ayush Hospital", createdDate: "20/01/2024", lastOrderDate: "08/07/2026", totalOrders: 134, outstandingAmount: 65000 },
  { id: "7", code: "SUP-007", name: "Bio-Rad Laboratories", displayName: "Bio-Rad", type: "Lab Reagent Supplier", category: "Lab", gstin: "29AABCB6789G7ZL", panNo: "AABCB6789G", drugLicense: "", fssaiNo: "", contactPerson: "Dr. Meena R", phone: "080-41234567", email: "india@bio-rad.com", address: "Whitefield, Bangalore", city: "Bangalore", state: "Karnataka", pincode: "560066", bankName: "Citibank", accountNo: "1234567890", ifsc: "CITI0000001", creditDays: 60, creditLimit: 150000, tdsApplicable: true, tdsPercent: 2, status: "active", createdBy: "Al Shifa Ayush Hospital", createdDate: "01/06/2024", lastOrderDate: "20/06/2026", totalOrders: 24, outstandingAmount: 35000 },
  { id: "8", code: "SUP-008", name: "Quick Transport Services", displayName: "Quick Transport", type: "Transport / Courier", category: "General", gstin: "33AABCQ1234H8ZK", panNo: "AABCQ1234H", drugLicense: "", fssaiNo: "", contactPerson: "Mr. Ravi", phone: "04634-567890", email: "quicktrans@gmail.com", address: "Kadayanallur", city: "Kadayanallur", state: "Tamil Nadu", pincode: "627751", bankName: "Indian Overseas Bank", accountNo: "1234567890123", ifsc: "IOBA0001234", creditDays: 7, creditLimit: 50000, tdsApplicable: false, tdsPercent: 0, status: "active", createdBy: "Al Shifa Ayush Hospital", createdDate: "01/07/2024", lastOrderDate: "15/07/2026", totalOrders: 210, outstandingAmount: 8500 },
];

const mockInactiveProviders: ServiceProvider[] = [
  { id: "101", code: "SUP-OLD1", name: "Old Medicine Supplier", displayName: "Old Supplier", type: "Medicine Supplier", category: "Ayurveda", gstin: "", panNo: "", drugLicense: "", fssaiNo: "", contactPerson: "", phone: "", email: "", address: "", city: "", state: "Tamil Nadu", pincode: "", bankName: "", accountNo: "", ifsc: "", creditDays: 30, creditLimit: 0, tdsApplicable: false, tdsPercent: 0, status: "inactive", createdBy: "admin", createdDate: "01/01/2022", lastOrderDate: "15/06/2023", totalOrders: 5, outstandingAmount: 0 },
  { id: "102", code: "SUP-OLD2", name: "Discontinued Lab Vendor", displayName: "Old Lab", type: "Lab Reagent Supplier", category: "Lab", gstin: "", panNo: "", drugLicense: "", fssaiNo: "", contactPerson: "", phone: "", email: "", address: "", city: "", state: "Kerala", pincode: "", bankName: "", accountNo: "", ifsc: "", creditDays: 30, creditLimit: 0, tdsApplicable: false, tdsPercent: 0, status: "inactive", createdBy: "admin", createdDate: "01/03/2022", lastOrderDate: "01/12/2023", totalOrders: 8, outstandingAmount: 0 },
];

// ─── Component ───────────────────────────────────────────────────────────────
const ServiceProviderMaster = () => {
  const [tab, setTab] = useState<"new" | "manage" | "inactive">("new");
  const [search, setSearch] = useState("");
  const [searchDuplicate, setSearchDuplicate] = useState("");
  const [enabledAi, setEnabledAi] = useState<string[]>(["Duplicate Detection", "Auto GSTIN Verification", "Payment Due Alerts", "Vendor Performance Score"]);

  // Form state
  const [fName, setFName] = useState("");
  const [fDisplayName, setFDisplayName] = useState("");
  const [fType, setFType] = useState("");
  const [fCategory, setFCategory] = useState("");
  const [fGstin, setFGstin] = useState("");
  const [fPan, setFPan] = useState("");
  const [fDrugLicense, setFDrugLicense] = useState("");
  const [fFssai, setFFssai] = useState("");
  const [fContactPerson, setFContactPerson] = useState("");
  const [fPhone, setFPhone] = useState("");
  const [fEmail, setFEmail] = useState("");
  const [fAddress, setFAddress] = useState("");
  const [fCity, setFCity] = useState("");
  const [fState, setFState] = useState("");
  const [fPincode, setFPincode] = useState("");
  const [fBankName, setFBankName] = useState("");
  const [fAccountNo, setFAccountNo] = useState("");
  const [fIfsc, setFIfsc] = useState("");
  const [fCreditDays, setFCreditDays] = useState("30");
  const [fCreditLimit, setFCreditLimit] = useState("");
  const [fTdsApplicable, setFTdsApplicable] = useState(false);
  const [fTdsPercent, setFTdsPercent] = useState("");

  const toggleAi = (l: string) => setEnabledAi(p => p.includes(l) ? p.filter(x => x !== l) : [...p, l]);

  const handleSearch = () => {
    if (!searchDuplicate.trim()) return toast.error("Enter name or GSTIN to search");
    const found = mockActiveProviders.find(p => p.name.toLowerCase().includes(searchDuplicate.toLowerCase()) || p.gstin.includes(searchDuplicate));
    if (found) toast.error(`Service Provider "${found.name}" already exists! (Code: ${found.code})`);
    else toast.success("No duplicate found. You can proceed to add.");
  };

  const handleSave = () => {
    if (!fName.trim()) return toast.error("Provider Name is required");
    if (!fType) return toast.error("Select a Provider Type");
    if (!fPhone.trim()) return toast.error("Phone number is required");
    toast.success(`Service Provider "${fName}" registered successfully!`);
    // Reset
    setFName(""); setFDisplayName(""); setFType(""); setFCategory(""); setFGstin(""); setFPan("");
    setFDrugLicense(""); setFFssai(""); setFContactPerson(""); setFPhone(""); setFEmail("");
    setFAddress(""); setFCity(""); setFState(""); setFPincode(""); setFBankName(""); setFAccountNo("");
    setFIfsc(""); setFCreditDays("30"); setFCreditLimit(""); setFTdsApplicable(false); setFTdsPercent("");
  };

  const getFiltered = (data: ServiceProvider[]) => data.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase()) ||
    p.type.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase())
  );

  const totalOutstanding = mockActiveProviders.reduce((s, p) => s + p.outstandingAmount, 0);

  // ─── Render New Form ───────────────────────────────────────────────────────
  const renderNewForm = () => (
    <div className="space-y-4">
      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="p-3">
          <p className="text-xs text-blue-700 font-medium">Your Service Provider may already exist. Please use the "Search" button to check if one exists.</p>
          <p className="text-xs text-blue-600">Please don't add multiple entries of the same service provider.</p>
          <div className="flex gap-2 mt-2">
            <Input value={searchDuplicate} onChange={e => setSearchDuplicate(e.target.value)} placeholder="Search by name or GSTIN..." className="h-8 text-sm max-w-sm" />
            <Button size="sm" onClick={handleSearch} className="bg-red-600 hover:bg-red-700 text-white h-8"><Search className="h-3 w-3 mr-1" />Search</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 border-b bg-primary/5"><CardTitle className="text-base text-center text-primary">Registered Service Providers</CardTitle></CardHeader>
        <CardContent className="p-4 space-y-5">
          {/* Basic Details */}
          <h3 className="font-semibold text-sm border-b pb-1">Basic Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div><Label className="font-semibold">Provider Name <span className="text-red-500">*</span></Label><Input value={fName} onChange={e => setFName(e.target.value)} placeholder="Full legal name" className="mt-1" /></div>
            <div><Label className="font-semibold">Display Name</Label><Input value={fDisplayName} onChange={e => setFDisplayName(e.target.value)} placeholder="Short display name" className="mt-1" /></div>
            <div><Label className="font-semibold">Type <span className="text-red-500">*</span></Label><Select value={fType} onValueChange={setFType}><SelectTrigger className="mt-1"><SelectValue placeholder="Select Type" /></SelectTrigger><SelectContent>{PROVIDER_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="font-semibold">Category</Label><Select value={fCategory} onValueChange={setFCategory}><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="font-semibold">Contact Person</Label><Input value={fContactPerson} onChange={e => setFContactPerson(e.target.value)} placeholder="Name" className="mt-1" /></div>
            <div><Label className="font-semibold">Phone <span className="text-red-500">*</span></Label><Input value={fPhone} onChange={e => setFPhone(e.target.value)} placeholder="Phone / Mobile" className="mt-1" /></div>
            <div><Label className="font-semibold">Email</Label><Input value={fEmail} onChange={e => setFEmail(e.target.value)} placeholder="Email" className="mt-1" /></div>
          </div>

          {/* Compliance */}
          <h3 className="font-semibold text-sm border-b pb-1 pt-2">Compliance & Registration</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div><Label className="font-semibold">GSTIN</Label><Input value={fGstin} onChange={e => setFGstin(e.target.value)} placeholder="GST Number" className="mt-1" /></div>
            <div><Label className="font-semibold">PAN No</Label><Input value={fPan} onChange={e => setFPan(e.target.value)} placeholder="PAN" className="mt-1" /></div>
            <div><Label className="font-semibold">Drug License No</Label><Input value={fDrugLicense} onChange={e => setFDrugLicense(e.target.value)} placeholder="Drug License" className="mt-1" /></div>
            <div><Label className="font-semibold">FSSAI No</Label><Input value={fFssai} onChange={e => setFFssai(e.target.value)} placeholder="FSSAI" className="mt-1" /></div>
          </div>

          {/* Address */}
          <h3 className="font-semibold text-sm border-b pb-1 pt-2">Address</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2"><Label className="font-semibold">Address</Label><Input value={fAddress} onChange={e => setFAddress(e.target.value)} placeholder="Street / Area" className="mt-1" /></div>
            <div><Label className="font-semibold">City</Label><Input value={fCity} onChange={e => setFCity(e.target.value)} placeholder="City" className="mt-1" /></div>
            <div><Label className="font-semibold">State</Label><Select value={fState} onValueChange={setFState}><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="font-semibold">Pincode</Label><Input value={fPincode} onChange={e => setFPincode(e.target.value)} placeholder="Pincode" className="mt-1" /></div>
          </div>

          {/* Bank Details */}
          <h3 className="font-semibold text-sm border-b pb-1 pt-2">Bank & Payment Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div><Label className="font-semibold">Bank Name</Label><Input value={fBankName} onChange={e => setFBankName(e.target.value)} placeholder="Bank" className="mt-1" /></div>
            <div><Label className="font-semibold">Account No</Label><Input value={fAccountNo} onChange={e => setFAccountNo(e.target.value)} placeholder="Account Number" className="mt-1" /></div>
            <div><Label className="font-semibold">IFSC Code</Label><Input value={fIfsc} onChange={e => setFIfsc(e.target.value)} placeholder="IFSC" className="mt-1" /></div>
            <div><Label className="font-semibold">Credit Days</Label><Select value={fCreditDays} onValueChange={setFCreditDays}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{PAYMENT_TERMS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="font-semibold">Credit Limit (₹)</Label><Input value={fCreditLimit} onChange={e => setFCreditLimit(e.target.value)} type="number" placeholder="Limit" className="mt-1" /></div>
            <div className="flex items-center gap-3 pt-6">
              <Checkbox checked={fTdsApplicable} onCheckedChange={c => setFTdsApplicable(!!c)} />
              <Label className="text-sm">TDS Applicable</Label>
              {fTdsApplicable && <Input value={fTdsPercent} onChange={e => setFTdsPercent(e.target.value)} type="number" placeholder="%" className="h-8 w-16 text-sm" />}
            </div>
          </div>

          <div className="flex justify-center pt-4"><Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600 text-white px-10">Register Provider</Button></div>
        </CardContent>
      </Card>
    </div>
  );

  // ─── Render Manage Table ───────────────────────────────────────────────────
  const renderTable = (data: ServiceProvider[], type: "active" | "inactive") => (
    <Card>
      <CardHeader className={`pb-2 border-b ${type === "inactive" ? "bg-red-50/50" : ""}`}><CardTitle className={`text-base text-center ${type === "inactive" ? "text-red-600" : "text-primary"}`}>{type === "active" ? "Manage Service Provider" : "Manage Inactive Service Provider"}</CardTitle></CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm">Show <select className="border rounded px-2 py-1 text-xs"><option>100</option></select> entries</div>
          <div className="flex items-center gap-2"><Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => toast.success("Exported")}><Download className="h-3 w-3 mr-1" />Export</Button><span className="text-xs">Search:</span><Input className="h-7 text-xs w-48" value={search} onChange={e => setSearch(e.target.value)} /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-muted/50 border-b"><tr>
              <th className="px-2 py-2 text-left font-semibold text-orange-600">Code</th>
              <th className="px-2 py-2 text-left font-semibold text-orange-600">Name</th>
              <th className="px-2 py-2 text-left font-semibold text-orange-600">Type</th>
              <th className="px-2 py-2 text-left font-semibold text-orange-600">GSTIN</th>
              <th className="px-2 py-2 text-left font-semibold text-orange-600">City</th>
              <th className="px-2 py-2 text-left font-semibold text-orange-600">Phone</th>
              <th className="px-2 py-2 text-left font-semibold text-orange-600">Credit Days</th>
              <th className="px-2 py-2 text-left font-semibold text-orange-600">Outstanding</th>
              <th className="px-2 py-2 text-left font-semibold text-orange-600">Orders</th>
              <th className="px-2 py-2 text-left font-semibold text-orange-600">Status</th>
            </tr></thead>
            <tbody>{getFiltered(data).length === 0 ? (<tr><td colSpan={10} className="px-3 py-4 text-center text-muted-foreground">No data available</td></tr>) : getFiltered(data).map(p => (
              <tr key={p.id} className="border-b hover:bg-muted/30">
                <td className="px-2 py-2 font-mono text-xs">{p.code}</td>
                <td className="px-2 py-2 text-xs font-medium">{p.name}</td>
                <td className="px-2 py-2"><Badge variant="outline" className="text-[9px]">{p.type.split(" ")[0]}</Badge></td>
                <td className="px-2 py-2 font-mono text-[10px]">{p.gstin || "-"}</td>
                <td className="px-2 py-2 text-xs">{p.city}</td>
                <td className="px-2 py-2 text-xs">{p.phone}</td>
                <td className="px-2 py-2 text-xs text-center">{p.creditDays}</td>
                <td className="px-2 py-2 text-xs">{p.outstandingAmount > 0 ? <span className="text-red-600 font-medium">₹{p.outstandingAmount.toLocaleString("en-IN")}</span> : <span className="text-emerald-600">₹0</span>}</td>
                <td className="px-2 py-2 text-xs text-center">{p.totalOrders}</td>
                <td className="px-2 py-2"><span className={type === "active" ? "text-emerald-600 text-xs" : "text-red-500 text-xs"}>{p.status}</span><Pencil className="h-2.5 w-2.5 inline text-orange-500 ml-0.5" /></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <div className="text-xs text-muted-foreground">Showing 1 to {getFiltered(data).length} of {getFiltered(data).length} entries</div>
      </CardContent>
    </Card>
  );

  // ─── Main Render ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold flex items-center gap-2"><Truck className="h-6 w-6 text-orange-600" /> Service Provider / Supplier</h1><p className="text-sm text-muted-foreground">Register and manage all service providers, medicine suppliers, and vendors for procurement.</p></div>
        <div className="flex gap-2"><Badge className="bg-purple-100 text-purple-700 border-purple-200"><Sparkles className="h-3 w-3 mr-1" /> AI Vendor</Badge><Badge variant="secondary">Active: {mockActiveProviders.length} | Outstanding: ₹{totalOutstanding.toLocaleString("en-IN")}</Badge></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
        <div>
          <Card className="p-0"><CardHeader className="pb-2 pt-3 px-3"><CardTitle className="text-sm font-semibold">Service Provider</CardTitle></CardHeader>
            <CardContent className="p-1"><Button variant="ghost" size="sm" className="w-full justify-start text-xs h-8 bg-orange-50 text-orange-700 border border-orange-200"><span className="mr-2">🚚</span> Manage Provider</Button></CardContent></Card>
          <Card className="mt-3 p-3"><p className="text-xs font-semibold mb-2 flex items-center gap-1"><Sparkles className="h-3 w-3 text-purple-500" /> AI Features</p>
            <div className="space-y-1 text-[10px]">{AI_FEATURES.map(f => (<label key={f.label} className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={enabledAi.includes(f.label)} onChange={() => toggleAi(f.label)} className="accent-purple-500" /><span className={enabledAi.includes(f.label) ? "font-medium" : "text-muted-foreground"}>{f.label}</span></label>))}</div></Card>
          <Card className="mt-3 p-3"><p className="text-xs font-semibold mb-2">By Type</p><div className="space-y-1 text-xs">
            {["Medicine Supplier", "Service Provider (AMC)", "Lab Reagent Supplier", "Consumables Vendor", "Transport / Courier"].map(t => { const c = mockActiveProviders.filter(p => p.type === t).length; return c > 0 ? <div key={t} className="flex justify-between"><span className="text-muted-foreground truncate max-w-[120px]">{t.split(" ")[0]}</span><Badge variant="secondary" className="text-[10px] h-4">{c}</Badge></div> : null; })}
          </div></Card>
        </div>
        <div className="space-y-4">
          <div className="flex gap-2 border-b pb-0">
            <Button variant="ghost" size="sm" className={`rounded-b-none text-xs ${tab === "new" ? "text-orange-700 border-b-2 border-orange-500 font-semibold bg-orange-50" : "text-muted-foreground"}`} onClick={() => setTab("new")}>New</Button>
            <Button variant="ghost" size="sm" className={`rounded-b-none text-xs ${tab === "manage" ? "text-teal-700 border-b-2 border-teal-600 font-semibold bg-teal-50" : "text-muted-foreground"}`} onClick={() => setTab("manage")}>Manage Service Provider</Button>
            <Button variant="ghost" size="sm" className={`rounded-b-none text-xs ${tab === "inactive" ? "text-red-600 border-b-2 border-red-500 font-semibold bg-red-50" : "text-muted-foreground"}`} onClick={() => setTab("inactive")}>Manage Inactive Service Provider</Button>
          </div>
          {tab === "new" && renderNewForm()}
          {tab === "manage" && renderTable(mockActiveProviders, "active")}
          {tab === "inactive" && renderTable(mockInactiveProviders, "inactive")}
        </div>
      </div>
    </div>
  );
};

export default ServiceProviderMaster;
