import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Package, Plus, Search, Download, MoreHorizontal, Pencil, Copy } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Types ───────────────────────────────────────────────────────────────────
type TreatmentPackageItem = {
  id: string;
  particulars: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

type TreatmentPackage = {
  id: string;
  code: string;
  name: string;
  externalId: string;
  expiryDate: string;
  status: "active" | "inactive";
  creditProvider: string;
  creditProviderOnly: boolean;
  expandBillItems: boolean;
  mentionInBill: boolean;
  surgeryPackageOT: boolean;
  items: TreatmentPackageItem[];
  actualPrice: number;
  packagePrice: number;
  createdDate: string;
  createdBy: string;
};

type StockPackageItem = {
  id: string;
  particulars: string;
  quantity: number;
};

type StockPackage = {
  id: string;
  name: string;
  status: "active" | "inactive";
  items: StockPackageItem[];
  products: string;
  createdDate: string;
  createdBy: string;
};

// ─── Mock Data ───────────────────────────────────────────────────────────────
const mockTreatmentPackages: TreatmentPackage[] = [
  {
    id: "1", code: "TPKG-001", name: "Panchakarma Detox 7 Days", externalId: "EXT-PK7",
    expiryDate: "2026-12-31", status: "active", creditProvider: "Star Health Insurance",
    creditProviderOnly: false, expandBillItems: true, mentionInBill: true, surgeryPackageOT: false,
    items: [
      { id: "1", particulars: "Abhyangam Full Body", quantity: 7, unitPrice: 1500, total: 10500 },
      { id: "2", particulars: "Shirodhara", quantity: 7, unitPrice: 1800, total: 12600 },
      { id: "3", particulars: "Steam Bath", quantity: 7, unitPrice: 500, total: 3500 },
      { id: "4", particulars: "Doctor Consultation", quantity: 3, unitPrice: 300, total: 900 },
    ],
    actualPrice: 27500, packagePrice: 22000, createdDate: "15/01/2025 10:30 AM", createdBy: "Al Shifa Ayush Hospital"
  },
  {
    id: "2", code: "TPKG-002", name: "Spine Care 14 Days", externalId: "EXT-SP14",
    expiryDate: "2026-06-30", status: "active", creditProvider: "",
    creditProviderOnly: false, expandBillItems: false, mentionInBill: true, surgeryPackageOT: false,
    items: [
      { id: "1", particulars: "Kati Basti", quantity: 14, unitPrice: 800, total: 11200 },
      { id: "2", particulars: "Pizhichil", quantity: 7, unitPrice: 2500, total: 17500 },
      { id: "3", particulars: "Elakizhi", quantity: 7, unitPrice: 2000, total: 14000 },
    ],
    actualPrice: 42700, packagePrice: 35000, createdDate: "20/02/2025 02:15 PM", createdBy: "Al Shifa Ayush Hospital"
  },
  {
    id: "3", code: "TPKG-003", name: "Weight Management 7 Days", externalId: "",
    expiryDate: "2025-12-31", status: "inactive", creditProvider: "",
    creditProviderOnly: false, expandBillItems: false, mentionInBill: false, surgeryPackageOT: false,
    items: [
      { id: "1", particulars: "Udwarthanam", quantity: 7, unitPrice: 1200, total: 8400 },
      { id: "2", particulars: "Steam Bath", quantity: 7, unitPrice: 500, total: 3500 },
    ],
    actualPrice: 11900, packagePrice: 9500, createdDate: "10/03/2025 09:00 AM", createdBy: "Al Shifa Ayush Hospital"
  },
  {
    id: "4", code: "TPKG-004", name: "Rejuvenation Basic", externalId: "",
    expiryDate: "2025-06-30", status: "inactive", creditProvider: "",
    creditProviderOnly: false, expandBillItems: false, mentionInBill: false, surgeryPackageOT: false,
    items: [
      { id: "1", particulars: "Abhyangam", quantity: 5, unitPrice: 1500, total: 7500 },
      { id: "2", particulars: "Nasyam", quantity: 5, unitPrice: 500, total: 2500 },
    ],
    actualPrice: 10000, packagePrice: 8000, createdDate: "05/01/2025 11:00 AM", createdBy: "Al Shifa Ayush Hospital"
  },
];

const mockStockPackages: StockPackage[] = [
  {
    id: "1", name: "LBA", status: "active",
    items: [
      { id: "1", particulars: "KATI 450 ML-2", quantity: 2 },
      { id: "2", particulars: "LUMBATONE CAP-60", quantity: 60 },
      { id: "3", particulars: "SAHACHARATHI THAILAM 200ML-1", quantity: 1 },
      { id: "4", particulars: "VEDHANAMRUTH CAP-30", quantity: 30 },
      { id: "5", particulars: "VATHAMRUTH CAP-60", quantity: 60 },
      { id: "6", particulars: "GANDHARVAHASTHA ERANDA THAILAM CAPSULE-30", quantity: 30 },
    ],
    products: "KATI 450 ML-2, LUMBATONE CAP-60, SAHACHARATHI THAILAM 200ML-1, VEDHANAMRUTH CAP-30, VATHAMRUTH CAP-60, GANDHARVAHASTHA ERANDA THAILAM CAPSULE-30",
    createdDate: "16/04/2025 01:13 PM", createdBy: "Al Shifa Ayush Hospital"
  },
  {
    id: "2", name: "Arthritis Kit", status: "active",
    items: [
      { id: "1", particulars: "YOGARAJA GUGGULU-60", quantity: 60 },
      { id: "2", particulars: "RASNA SAPTHAKA KASHAYAM-200ML", quantity: 1 },
      { id: "3", particulars: "DHANWANTHARAM THAILAM-200ML", quantity: 1 },
    ],
    products: "YOGARAJA GUGGULU-60, RASNA SAPTHAKA KASHAYAM-200ML, DHANWANTHARAM THAILAM-200ML",
    createdDate: "20/04/2025 03:45 PM", createdBy: "Al Shifa Ayush Hospital"
  },
  {
    id: "3", name: "Skin Care Kit", status: "inactive",
    items: [
      { id: "1", particulars: "KUMKUMADI THAILAM-30ML", quantity: 1 },
      { id: "2", particulars: "MANJISHTADI KASHAYAM-200ML", quantity: 1 },
    ],
    products: "KUMKUMADI THAILAM-30ML, MANJISHTADI KASHAYAM-200ML",
    createdDate: "01/03/2025 10:00 AM", createdBy: "Al Shifa Ayush Hospital"
  },
];

// ─── Component ───────────────────────────────────────────────────────────────
const PackageMaster = () => {
  // Main tab: "treatment" or "stock"
  const [mainTab, setMainTab] = useState<"treatment" | "stock">("treatment");
  // Sub view: "new", "manage", "inactive"
  const [treatmentView, setTreatmentView] = useState<"new" | "manage" | "inactive">("new");
  const [stockView, setStockView] = useState<"new" | "manage" | "inactive">("new");

  const [search, setSearch] = useState("");

  // Treatment Package form state
  const [tpName, setTpName] = useState("");
  const [tpExternalId, setTpExternalId] = useState("");
  const [tpExpiryDate, setTpExpiryDate] = useState("");
  const [tpStatus, setTpStatus] = useState<"active" | "inactive">("active");
  const [tpCreditProvider, setTpCreditProvider] = useState("");
  const [tpCreditOnly, setTpCreditOnly] = useState(false);
  const [tpExpandBill, setTpExpandBill] = useState(false);
  const [tpMentionBill, setTpMentionBill] = useState(false);
  const [tpSurgeryOT, setTpSurgeryOT] = useState(false);
  const [tpItems, setTpItems] = useState<TreatmentPackageItem[]>([
    { id: "1", particulars: "", quantity: 1, unitPrice: 0, total: 0 },
  ]);
  const [tpActualPrice, setTpActualPrice] = useState("");
  const [tpPackagePrice, setTpPackagePrice] = useState("");

  // Stock Package form state
  const [spName, setSpName] = useState("");
  const [spStatus, setSpStatus] = useState<"active" | "inactive">("active");
  const [spItems, setSpItems] = useState<StockPackageItem[]>([
    { id: "1", particulars: "", quantity: 1 },
  ]);

  // Treatment Packages data
  const [treatmentPackages] = useState<TreatmentPackage[]>(mockTreatmentPackages);
  const [stockPackages] = useState<StockPackage[]>(mockStockPackages);

  const activeTreatmentPkgs = treatmentPackages.filter(p => p.status === "active");
  const inactiveTreatmentPkgs = treatmentPackages.filter(p => p.status === "inactive");
  const activeStockPkgs = stockPackages.filter(p => p.status === "active");
  const inactiveStockPkgs = stockPackages.filter(p => p.status === "inactive");

  const filteredActiveTreatment = activeTreatmentPkgs.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  );
  const filteredInactiveTreatment = inactiveTreatmentPkgs.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  );
  const filteredActiveStock = activeStockPkgs.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredInactiveStock = inactiveStockPkgs.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // Treatment Package item handlers
  const addTpItem = () => {
    setTpItems([...tpItems, { id: Date.now().toString(), particulars: "", quantity: 1, unitPrice: 0, total: 0 }]);
  };
  const updateTpItem = (index: number, field: keyof TreatmentPackageItem, value: string | number) => {
    const updated = [...tpItems];
    (updated[index] as any)[field] = value;
    if (field === "quantity" || field === "unitPrice") {
      updated[index].total = Number(updated[index].quantity) * Number(updated[index].unitPrice);
    }
    setTpItems(updated);
  };
  const removeTpItem = (index: number) => {
    setTpItems(tpItems.filter((_, i) => i !== index));
  };

  // Stock Package item handlers
  const addSpItem = () => {
    setSpItems([...spItems, { id: Date.now().toString(), particulars: "", quantity: 1 }]);
  };
  const updateSpItem = (index: number, field: keyof StockPackageItem, value: string | number) => {
    const updated = [...spItems];
    (updated[index] as any)[field] = value;
    setSpItems(updated);
  };

  const handleSaveTreatmentPackage = () => {
    if (!tpName.trim()) return toast.error("Package Name is required");
    toast.success("Treatment Package saved successfully!");
    setTpName(""); setTpExternalId(""); setTpExpiryDate(""); setTpStatus("active");
    setTpCreditProvider(""); setTpCreditOnly(false); setTpExpandBill(false);
    setTpMentionBill(false); setTpSurgeryOT(false);
    setTpItems([{ id: "1", particulars: "", quantity: 1, unitPrice: 0, total: 0 }]);
    setTpActualPrice(""); setTpPackagePrice("");
  };

  const handleSaveStockPackage = () => {
    if (!spName.trim()) return toast.error("Package Name is required");
    toast.success("Stock Package saved successfully!");
    setSpName(""); setSpStatus("active");
    setSpItems([{ id: "1", particulars: "", quantity: 1 }]);
  };

  // ─── Render Treatment Package New Form ─────────────────────────────────────
  const renderTreatmentNewForm = () => (
    <Card>
      <CardHeader className="pb-2 border-b bg-primary/5">
        <CardTitle className="text-base text-center text-primary">Treatment Package</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        {/* Row 1: Name, External ID, Expiry, Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label>Package Name <span className="text-red-500">*</span></Label>
            <Input value={tpName} onChange={e => setTpName(e.target.value)} placeholder="Package Name" />
          </div>
          <div>
            <Label>External ID</Label>
            <Input value={tpExternalId} onChange={e => setTpExternalId(e.target.value)} placeholder="External ID" />
          </div>
          <div>
            <Label>Expiry Date</Label>
            <Input type="date" value={tpExpiryDate} onChange={e => setTpExpiryDate(e.target.value)} placeholder="Expiry Date" />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={tpStatus} onValueChange={(v: "active" | "inactive") => setTpStatus(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Credit Provider */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Select Credit Provider</Label>
            <Input value={tpCreditProvider} onChange={e => setTpCreditProvider(e.target.value)} placeholder="Select Credit Provider" />
          </div>
        </div>

        {/* Checkboxes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Checkbox checked={tpCreditOnly} onCheckedChange={c => setTpCreditOnly(!!c)} />
            <Label className="text-xs">Add package only for credit provider</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={tpExpandBill} onCheckedChange={c => setTpExpandBill(!!c)} />
            <Label className="text-xs">Expand as bill items</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={tpMentionBill} onCheckedChange={c => setTpMentionBill(!!c)} />
            <Label className="text-xs">Mention details in bill</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={tpSurgeryOT} onCheckedChange={c => setTpSurgeryOT(!!c)} />
            <Label className="text-xs">Mark as Surgery Package (OT Only)</Label>
          </div>
        </div>

        {/* Copy from existing */}
        <div className="flex justify-end">
          <Button variant="outline" size="sm" className="bg-teal-600 text-white hover:bg-teal-700">
            <Copy className="h-3.5 w-3.5 mr-1" /> Copy from Existing Package
          </Button>
        </div>

        {/* Line Items Table */}
        <div>
          <div className="grid grid-cols-12 gap-2 mb-2">
            <div className="col-span-1"><Label className="text-xs font-semibold text-orange-600">S.No</Label></div>
            <div className="col-span-4"><Label className="text-xs font-semibold text-orange-600">Particulars</Label></div>
            <div className="col-span-2"><Label className="text-xs font-semibold text-orange-600">Quantity</Label></div>
            <div className="col-span-2"><Label className="text-xs font-semibold text-orange-600">Unit Price</Label></div>
            <div className="col-span-2"><Label className="text-xs font-semibold text-orange-600">Total</Label></div>
            <div className="col-span-1"></div>
          </div>

          {tpItems.map((item, idx) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 mb-2 items-center">
              <div className="col-span-1 text-sm text-center">{idx + 1}</div>
              <div className="col-span-4">
                <Input
                  value={item.particulars}
                  onChange={e => updateTpItem(idx, "particulars", e.target.value)}
                  placeholder="Particulars"
                  className="h-8 text-sm"
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={e => updateTpItem(idx, "quantity", Number(e.target.value))}
                  className="h-8 text-sm"
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  value={item.unitPrice || ""}
                  onChange={e => updateTpItem(idx, "unitPrice", Number(e.target.value))}
                  placeholder="Unit Price"
                  className="h-8 text-sm"
                />
              </div>
              <div className="col-span-2">
                <Input
                  value={item.total || ""}
                  readOnly
                  placeholder="Total"
                  className="h-8 text-sm bg-muted/50"
                />
              </div>
              <div className="col-span-1">
                <Button size="sm" className="h-8 bg-red-500 hover:bg-red-600 text-white" onClick={() => addTpItem()}>
                  Add
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Price Warning */}
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-xs text-red-600 italic">
            Price Details are for reference purpose only. Actual price may differ while billing based on rate plan
          </p>
        </div>

        {/* Price Fields */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-4">
            <Label className="font-semibold w-40 text-right">Actual Package Price :</Label>
            <Input
              value={tpActualPrice}
              onChange={e => setTpActualPrice(e.target.value)}
              className="w-48"
              type="number"
            />
          </div>
          <div className="flex items-center justify-center gap-4">
            <Label className="font-semibold w-40 text-right">Package Price :</Label>
            <Input
              value={tpPackagePrice}
              onChange={e => setTpPackagePrice(e.target.value)}
              className="w-48"
              type="number"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center pt-4">
          <Button onClick={handleSaveTreatmentPackage} className="bg-orange-500 hover:bg-orange-600 px-10">
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // ─── Render Treatment Package Table ────────────────────────────────────────
  const renderTreatmentTable = (data: TreatmentPackage[], type: "active" | "inactive") => (
    <Card>
      <CardHeader className={`pb-2 border-b ${type === "inactive" ? "bg-red-50/50" : ""}`}>
        <CardTitle className={`text-base text-center ${type === "inactive" ? "text-red-600" : "text-primary"}`}>
          {type === "active" ? "Manage Treatment Package" : "Manage Inactive Treatment Package"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2 text-sm">
            Show <select className="border rounded px-2 py-1 text-xs"><option>100</option><option>50</option><option>25</option></select> entries
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="bg-teal-600 text-white hover:bg-teal-700 text-xs"
              onClick={() => toast.success("Exported as CSV")}>
              <Download className="h-3.5 w-3.5 mr-1" /> Export As CSV
            </Button>
            <div className="relative w-52">
              <span className="text-xs mr-1">Search:</span>
              <Input className="h-7 text-xs inline-block w-40" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-orange-600">SINo</th>
                <th className="px-3 py-2 text-left font-medium text-orange-600">Code</th>
                <th className="px-3 py-2 text-left font-medium text-orange-600">Name</th>
                <th className="px-3 py-2 text-left font-medium text-orange-600">Provider</th>
                <th className="px-3 py-2 text-left font-medium text-orange-600">Created Date</th>
                <th className="px-3 py-2 text-left font-medium text-orange-600">Status</th>
                <th className="px-3 py-2 text-left font-medium text-orange-600">Created By</th>
                <th className="px-3 py-2 text-left font-medium text-orange-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={8} className="px-3 py-4 text-center text-muted-foreground">No data available in table</td></tr>
              ) : (
                data.map((pkg, i) => (
                  <tr key={pkg.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2">{i + 1}</td>
                    <td className="px-3 py-2 font-mono text-xs">{pkg.code}</td>
                    <td className="px-3 py-2 font-medium">{pkg.name}</td>
                    <td className="px-3 py-2 text-xs">{pkg.creditProvider || "-"}</td>
                    <td className="px-3 py-2 text-xs">{pkg.createdDate}</td>
                    <td className="px-3 py-2">
                      <Badge className={type === "active"
                        ? "bg-emerald-100 text-emerald-700 text-[10px]"
                        : "bg-orange-100 text-orange-700 text-[10px]"}>
                        {pkg.status} <Pencil className="h-2.5 w-2.5 inline ml-1" />
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-xs">{pkg.createdBy}</td>
                    <td className="px-3 py-2">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 text-xs text-muted-foreground border-t flex items-center justify-between">
          <span>Showing {data.length > 0 ? 1 : 0} to {data.length} of {data.length} entries</span>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" className="h-6 text-xs" disabled>Previous</Button>
            <Button size="sm" variant="outline" className="h-6 text-xs" disabled>Next</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // ─── Render Stock Package New Form ─────────────────────────────────────────
  const renderStockNewForm = () => (
    <Card>
      <CardHeader className="pb-2 border-b bg-primary/5">
        <CardTitle className="text-base text-center text-primary">Stock Package</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        {/* Name and Status */}
        <div className="space-y-4 max-w-md mx-auto">
          <div className="flex items-center gap-4">
            <Label className="font-semibold w-32 text-right">Package Name :</Label>
            <Input value={spName} onChange={e => setSpName(e.target.value)} className="flex-1" />
          </div>
          <div className="flex items-center gap-4">
            <Label className="font-semibold w-32 text-right">Status :</Label>
            <Select value={spStatus} onValueChange={(v: "active" | "inactive") => setSpStatus(v)}>
              <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Copy from existing */}
        <div className="flex justify-end">
          <Button variant="outline" size="sm" className="bg-teal-600 text-white hover:bg-teal-700">
            <Copy className="h-3.5 w-3.5 mr-1" /> Copy from Existing Package
          </Button>
        </div>

        {/* Line Items */}
        <div>
          <div className="grid grid-cols-12 gap-2 mb-2">
            <div className="col-span-1"><Label className="text-xs font-semibold text-orange-600">S.No</Label></div>
            <div className="col-span-8"><Label className="text-xs font-semibold text-orange-600">Particulars</Label></div>
            <div className="col-span-2"><Label className="text-xs font-semibold text-orange-600">Quantity</Label></div>
            <div className="col-span-1"></div>
          </div>
          {spItems.map((item, idx) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 mb-2 items-center">
              <div className="col-span-1 text-sm text-center">{idx + 1}</div>
              <div className="col-span-8">
                <Input
                  value={item.particulars}
                  onChange={e => updateSpItem(idx, "particulars", e.target.value)}
                  placeholder="Particulars"
                  className="h-8 text-sm"
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={e => updateSpItem(idx, "quantity", Number(e.target.value))}
                  className="h-8 text-sm"
                />
              </div>
              <div className="col-span-1">
                <Button size="sm" className="h-8 bg-red-500 hover:bg-red-600 text-white" onClick={addSpItem}>
                  Add
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="flex justify-center pt-4">
          <Button onClick={handleSaveStockPackage} className="bg-orange-500 hover:bg-orange-600 px-10">
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // ─── Render Stock Package Table ────────────────────────────────────────────
  const renderStockTable = (data: StockPackage[], type: "active" | "inactive") => (
    <Card>
      <CardHeader className={`pb-2 border-b ${type === "inactive" ? "bg-red-50/50" : ""}`}>
        <CardTitle className={`text-base text-center ${type === "inactive" ? "text-red-600" : "text-primary"}`}>
          {type === "active" ? "Manage Stock Package" : "Manage Inactive Stock Package"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2 text-sm">
            Show <select className="border rounded px-2 py-1 text-xs"><option>100</option><option>50</option><option>25</option></select> entries
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs">Search:</span>
            <Input className="h-7 text-xs w-40" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-orange-600">SINo</th>
                <th className="px-3 py-2 text-left font-medium text-orange-600">Name</th>
                <th className="px-3 py-2 text-left font-medium text-orange-600">Created Date</th>
                <th className="px-3 py-2 text-left font-medium text-orange-600">Products</th>
                <th className="px-3 py-2 text-left font-medium text-orange-600">Status</th>
                <th className="px-3 py-2 text-left font-medium text-orange-600">Created By</th>
                <th className="px-3 py-2 text-left font-medium text-orange-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={7} className="px-3 py-4 text-center text-muted-foreground">No data available in table</td></tr>
              ) : (
                data.map((pkg, i) => (
                  <tr key={pkg.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2">{i + 1}</td>
                    <td className="px-3 py-2 font-medium">{pkg.name} <Pencil className="h-3 w-3 inline text-orange-500" /></td>
                    <td className="px-3 py-2 text-xs">{pkg.createdDate}</td>
                    <td className="px-3 py-2 text-xs max-w-xs">
                      <div className="line-clamp-3">{pkg.products}</div>
                    </td>
                    <td className="px-3 py-2">
                      <Badge className={type === "active"
                        ? "bg-emerald-100 text-emerald-700 text-[10px]"
                        : "bg-orange-100 text-orange-700 text-[10px]"}>
                        {pkg.status} <Pencil className="h-2.5 w-2.5 inline ml-1" />
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-xs">{pkg.createdBy}</td>
                    <td className="px-3 py-2">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 text-xs text-muted-foreground border-t flex items-center justify-between">
          <span>Showing {data.length > 0 ? 1 : 0} to {data.length} of {data.length} entries</span>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" className="h-6 text-xs" disabled>Previous</Button>
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
            <Package className="h-6 w-6 text-amber-600" /> Package Master
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage Treatment and Stock packages — New, Active, Inactive
          </p>
        </div>
        <Badge variant="secondary">
          Treatment: {treatmentPackages.length} | Stock: {stockPackages.length}
        </Badge>
      </div>

      {/* Tab Navigation - Treatment Package | Stock Package */}
      <div className="flex items-center gap-2 border-b pb-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={mainTab === "treatment" ? "default" : "ghost"}
              size="sm"
              className={mainTab === "treatment"
                ? "bg-orange-500 hover:bg-orange-600 text-white rounded-b-none"
                : "text-orange-600 hover:text-orange-700 rounded-b-none"}
              onClick={() => setMainTab("treatment")}
            >
              Treatment Package ▾
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => { setMainTab("treatment"); setTreatmentView("new"); }}>
              New
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setMainTab("treatment"); setTreatmentView("manage"); }}>
              Manage Treatment Package
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setMainTab("treatment"); setTreatmentView("inactive"); }}>
              Manage Inactive Treatment Package
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={mainTab === "stock" ? "default" : "ghost"}
              size="sm"
              className={mainTab === "stock"
                ? "bg-orange-500 hover:bg-orange-600 text-white rounded-b-none"
                : "text-orange-600 hover:text-orange-700 rounded-b-none"}
              onClick={() => setMainTab("stock")}
            >
              Stock Package ▾
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => { setMainTab("stock"); setStockView("new"); }}>
              New
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setMainTab("stock"); setStockView("manage"); }}>
              Manage Stock Package
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setMainTab("stock"); setStockView("inactive"); }}>
              Manage Inactive Stock Package
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      {mainTab === "treatment" && (
        <>
          {treatmentView === "new" && renderTreatmentNewForm()}
          {treatmentView === "manage" && renderTreatmentTable(filteredActiveTreatment, "active")}
          {treatmentView === "inactive" && renderTreatmentTable(filteredInactiveTreatment, "inactive")}
        </>
      )}

      {mainTab === "stock" && (
        <>
          {stockView === "new" && renderStockNewForm()}
          {stockView === "manage" && renderStockTable(filteredActiveStock, "active")}
          {stockView === "inactive" && renderStockTable(filteredInactiveStock, "inactive")}
        </>
      )}
    </div>
  );
};

export default PackageMaster;
