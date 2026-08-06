import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ShoppingBag, Plus, Search, Download, Pencil, Printer } from "lucide-react";

type Product = {
  id: string; pCode: string; hsn: string; name: string; shortCode: string;
  manufacturer: string; combination: string; type: string; category: string;
  subCategory: string; indication: string; unit: string; packUnit: string;
  scheduleCode: string; riskLevel: string; reorderLevel: number;
  tax: string; unitRate: number; unitMrp: number; status: "active" | "inactive";
  buyFromQuotation: boolean; createdBy: string; productType: string;
};

const TYPES = ["Drug", "Consumable", "Surgical", "AYUSH Classical", "AYUSH Proprietary", "Oil/Tailam", "Churnam", "Kashayam", "Arishtam", "Lehyam", "Guggulu", "Bhasma", "Equipment", "Cosmetic", "Supplement"];
const SCHEDULE_CODES = ["Schedule H", "Schedule H1", "Schedule X", "Schedule G", "OTC", "Not Applicable"];
const CATEGORIES = ["Ayurveda Internal", "Ayurveda External", "Siddha", "Homeopathy", "Unani", "Allopathic", "Surgical", "Consumable", "Equipment", "Lab Reagent", "Linen", "Kitchen/Diet", "Housekeeping"];
const SUB_CATEGORIES = ["Tablet", "Capsule", "Syrup", "Churnam", "Kashayam", "Tailam", "Ghritam", "Lehyam", "Guggulu", "Bhasma", "Arishtam", "Asavam", "Kwatham", "External Oil", "Cream/Ointment", "Drops", "Injection", "IV Fluid", "Dressing", "Suture", "Gloves", "Reagent", "Other"];
const UNITS = ["Nos", "Bottle", "Strip", "Box", "Kg", "Gm", "Ml", "Ltr", "Pack", "Tube", "Jar", "Pouch", "Roll", "Pair"];
const RISK_LEVELS = ["Low", "Medium", "High", "Critical"];
const PHARMACOLOGICAL = ["Analgesic", "Anti-inflammatory", "Antipyretic", "Digestive", "Laxative", "Nervine Tonic", "Rasayana", "Immunomodulator", "Hepatoprotective", "Cardiotonic", "Diuretic", "Expectorant", "Antispasmodic"];
const INDICATIONS = ["Vataja Disorders", "Pittaja Disorders", "Kaphaja Disorders", "Joint Pain", "Digestive Issues", "Skin Diseases", "Respiratory", "Metabolic", "Neurological", "General Wellness", "Panchakarma Therapy", "Post-surgical"];
const INSTRUCTIONS = ["Before Food", "After Food", "N/A", "With Warm Water", "With Honey", "With Ghee", "Empty Stomach", "Bedtime"];
const NEW_TYPES = ["Product", "Frame", "Lens", "Lab", "Kit", "Linen"];

const mockProducts: Product[] = [
  { id: "1", pCode: "PRD_001", hsn: "30049011", name: "Triphala Churnam", shortCode: "TRP", manufacturer: "Kottakkal Arya Vaidya Sala", combination: "Haritaki + Vibhitaki + Amalaki", type: "AYUSH Classical", category: "Ayurveda Internal", subCategory: "Churnam", indication: "Digestive Issues", unit: "Gm", packUnit: "100gm Jar", scheduleCode: "Not Applicable", riskLevel: "Low", reorderLevel: 50, tax: "GST 12%", unitRate: 85, unitMrp: 120, status: "active", buyFromQuotation: false, createdBy: "Al Shifa Ayush Hospital", productType: "Product" },
  { id: "2", pCode: "PRD_002", hsn: "30049011", name: "Ashwagandha Churnam", shortCode: "ASH", manufacturer: "Kottakkal Arya Vaidya Sala", combination: "Withania somnifera", type: "AYUSH Classical", category: "Ayurveda Internal", subCategory: "Churnam", indication: "General Wellness", unit: "Gm", packUnit: "100gm Jar", scheduleCode: "Not Applicable", riskLevel: "Low", reorderLevel: 40, tax: "GST 12%", unitRate: 95, unitMrp: 140, status: "active", buyFromQuotation: false, createdBy: "Al Shifa Ayush Hospital", productType: "Product" },
  { id: "3", pCode: "PRD_003", hsn: "30049019", name: "Dhanwantharam Tailam", shortCode: "DHT", manufacturer: "Kottakkal Arya Vaidya Sala", combination: "Sesame oil base + 28 herbs", type: "AYUSH Classical", category: "Ayurveda External", subCategory: "External Oil", indication: "Joint Pain", unit: "Ml", packUnit: "200ml Bottle", scheduleCode: "Not Applicable", riskLevel: "Low", reorderLevel: 30, tax: "GST 12%", unitRate: 180, unitMrp: 250, status: "active", buyFromQuotation: false, createdBy: "Al Shifa Ayush Hospital", productType: "Product" },
  { id: "4", pCode: "PRD_004", hsn: "30049011", name: "Dasamoolarishtam", shortCode: "DSA", manufacturer: "Arya Vaidya Pharmacy", combination: "Dashamoola + Jaggery fermented", type: "AYUSH Classical", category: "Ayurveda Internal", subCategory: "Arishtam", indication: "Respiratory", unit: "Ml", packUnit: "450ml Bottle", scheduleCode: "Not Applicable", riskLevel: "Low", reorderLevel: 25, tax: "GST 12%", unitRate: 110, unitMrp: 165, status: "active", buyFromQuotation: false, createdBy: "Al Shifa Ayush Hospital", productType: "Product" },
  { id: "5", pCode: "PRD_005", hsn: "30049019", name: "Ksheerabala 101 Tailam", shortCode: "KB101", manufacturer: "Kottakkal Arya Vaidya Sala", combination: "Bala + Ksheera + Sesame oil (101 Avartana)", type: "AYUSH Classical", category: "Ayurveda External", subCategory: "Tailam", indication: "Neurological", unit: "Ml", packUnit: "200ml Bottle", scheduleCode: "Not Applicable", riskLevel: "Low", reorderLevel: 20, tax: "GST 12%", unitRate: 320, unitMrp: 450, status: "active", buyFromQuotation: false, createdBy: "ROSANA", productType: "Product" },
  { id: "6", pCode: "PRD_006", hsn: "30049011", name: "Gugguluthiktakam Kashayam", shortCode: "GTK", manufacturer: "Kottakkal Arya Vaidya Sala", combination: "Guggulu + Tikta dravyas", type: "AYUSH Classical", category: "Ayurveda Internal", subCategory: "Kashayam", indication: "Skin Diseases", unit: "Ml", packUnit: "200ml Bottle", scheduleCode: "Not Applicable", riskLevel: "Low", reorderLevel: 20, tax: "GST 12%", unitRate: 130, unitMrp: 185, status: "active", buyFromQuotation: false, createdBy: "admin", productType: "Product" },
  { id: "7", pCode: "KIT_001", hsn: "", name: "Panchakarma Starter Kit", shortCode: "PKS", manufacturer: "In-House", combination: "Abhyanga oil + Swedana herbs + Towels + Droni cover", type: "Consumable", category: "Consumable", subCategory: "Other", indication: "Panchakarma Therapy", unit: "Nos", packUnit: "1 Kit", scheduleCode: "Not Applicable", riskLevel: "Low", reorderLevel: 10, tax: "GST 18%", unitRate: 500, unitMrp: 0, status: "active", buyFromQuotation: false, createdBy: "admin", productType: "Kit" },
  { id: "8", pCode: "KIT_002", hsn: "", name: "Vasti Kit (Enema Set)", shortCode: "VKT", manufacturer: "In-House", combination: "Vasti Yantra + Catheter + Lubricant + Gloves", type: "Consumable", category: "Consumable", subCategory: "Other", indication: "Panchakarma Therapy", unit: "Nos", packUnit: "1 Kit", scheduleCode: "Not Applicable", riskLevel: "Medium", reorderLevel: 15, tax: "GST 18%", unitRate: 350, unitMrp: 0, status: "active", buyFromQuotation: false, createdBy: "admin", productType: "Kit" },
  { id: "9", pCode: "LAB_001", hsn: "", name: "CBC Reagent (Sysmex)", shortCode: "CBCR", manufacturer: "Sysmex", combination: "Cellpack + Stromatolyser", type: "Consumable", category: "Lab Reagent", subCategory: "Reagent", indication: "", unit: "Ltr", packUnit: "1 Ltr Pack", scheduleCode: "Not Applicable", riskLevel: "Medium", reorderLevel: 5, tax: "GST 18%", unitRate: 4500, unitMrp: 0, status: "active", buyFromQuotation: true, createdBy: "admin", productType: "Lab" },
  { id: "10", pCode: "LIN_001", hsn: "", name: "Therapy Bed Sheet (White)", shortCode: "TBS", manufacturer: "Local Vendor", combination: "", type: "Consumable", category: "Linen", subCategory: "Other", indication: "", unit: "Nos", packUnit: "1 Pc", scheduleCode: "Not Applicable", riskLevel: "Low", reorderLevel: 50, tax: "GST 5%", unitRate: 250, unitMrp: 0, status: "active", buyFromQuotation: false, createdBy: "admin", productType: "Linen" },
  { id: "11", pCode: "LIN_002", hsn: "", name: "Panchakarma Oil-Proof Sheet", shortCode: "POS", manufacturer: "Local Vendor", combination: "", type: "Consumable", category: "Linen", subCategory: "Other", indication: "", unit: "Nos", packUnit: "1 Pc", scheduleCode: "Not Applicable", riskLevel: "Low", reorderLevel: 30, tax: "GST 5%", unitRate: 450, unitMrp: 0, status: "active", buyFromQuotation: false, createdBy: "admin", productType: "Linen" },
  // Inactive
  { id: "50", pCode: "PRD_050", hsn: "30049011", name: "Old Triphala Brand (Discontinued)", shortCode: "OTB", manufacturer: "Local", combination: "", type: "AYUSH Classical", category: "Ayurveda Internal", subCategory: "Churnam", indication: "Digestive Issues", unit: "Gm", packUnit: "50gm", scheduleCode: "Not Applicable", riskLevel: "Low", reorderLevel: 0, tax: "GST 12%", unitRate: 40, unitMrp: 60, status: "inactive", buyFromQuotation: false, createdBy: "admin", productType: "Product" },
  { id: "51", pCode: "PRD_051", hsn: "", name: "Expired Batch Reagent", shortCode: "EBR", manufacturer: "Beckman", combination: "", type: "Consumable", category: "Lab Reagent", subCategory: "Reagent", indication: "", unit: "Ltr", packUnit: "500ml", scheduleCode: "Not Applicable", riskLevel: "High", reorderLevel: 0, tax: "GST 18%", unitRate: 3000, unitMrp: 0, status: "inactive", buyFromQuotation: false, createdBy: "admin", productType: "Lab" },
];

const productTypes = [
  { name: "CONTAINER", status: "active" },
  { name: "leham", status: "active" },
  { name: "Tailam/Oil", status: "active" },
  { name: "Churnam/Powder", status: "active" },
  { name: "Kashayam/Decoction", status: "active" },
  { name: "Tablet/Vati", status: "active" },
  { name: "Capsule", status: "active" },
  { name: "Arishtam", status: "active" },
  { name: "Ghritam/Ghee", status: "active" },
  { name: "Guggulu", status: "active" },
  { name: "Bhasma/Rasa", status: "active" },
  { name: "External Application", status: "active" },
  { name: "Surgical Item", status: "active" },
  { name: "Lab Consumable", status: "active" },
  { name: "Linen Item", status: "active" },
];

const ProductMaster = () => {
  const [tab, setTab] = useState("new");
  const [newType, setNewType] = useState("Product");
  const [search, setSearch] = useState("");
  const [products] = useState<Product[]>(mockProducts);
  const [ptName, setPtName] = useState("");

  const active = products.filter(p => p.status === "active");
  const inactive = products.filter(p => p.status === "inactive");
  const filteredActive = active.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.pCode.toLowerCase().includes(search.toLowerCase()) || p.productType.toLowerCase().includes(search.toLowerCase()));
  const filteredInactive = inactive.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.pCode.toLowerCase().includes(search.toLowerCase()));

  const renderProductTable = (data: Product[], type: "active" | "inactive") => (
    <Card>
      <CardHeader className={`pb-2 border-b ${type === "inactive" ? "bg-red-50/50" : ""}`}>
        <div className="flex items-center justify-between">
          <CardTitle className={`text-base text-center flex-1 ${type === "inactive" ? "text-red-600" : "text-primary"}`}>
            {type === "active" ? "Manage Product" : "Manage Inactive Product"}
          </CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => toast.success("Exported")}><Download className="h-3.5 w-3.5 mr-1" /> Export As CSV</Button>
            <Button size="sm" variant="outline"><Printer className="h-3.5 w-3.5 mr-1" /> Print</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="text-sm">Show <select className="border rounded px-2 py-1 text-xs"><option>100</option></select> entries</div>
          <div className="relative w-64"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9 h-8" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b bg-muted/50">
              <tr>
                {["PCode","HSN","Name","Short Code","Mfr","Combination","Type","Category","Sub Category","Indication","Unit","Pack Unit","Schedule Code","Risk Level","ReOrder Level","Tax","Unit Rate","Unit MRP","Status","Buy from Quotation","Created By"].map(h => (
                  <th key={h} className="px-2 py-2 text-left font-medium text-orange-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map(p => (
                <tr key={p.id} className="border-b hover:bg-muted/30">
                  <td className="px-2 py-2 font-mono">{p.pCode}</td>
                  <td className="px-2 py-2">{p.hsn || "—"}</td>
                  <td className="px-2 py-2 font-medium text-primary max-w-[150px] truncate">{p.name}</td>
                  <td className="px-2 py-2">{p.shortCode}</td>
                  <td className="px-2 py-2 max-w-[100px] truncate">{p.manufacturer}</td>
                  <td className="px-2 py-2 max-w-[120px] truncate">{p.combination || "—"}</td>
                  <td className="px-2 py-2">{p.type}</td>
                  <td className="px-2 py-2">{p.category}</td>
                  <td className="px-2 py-2">{p.subCategory}</td>
                  <td className="px-2 py-2">{p.indication || "—"}</td>
                  <td className="px-2 py-2">{p.unit}</td>
                  <td className="px-2 py-2">{p.packUnit}</td>
                  <td className="px-2 py-2">{p.scheduleCode}</td>
                  <td className="px-2 py-2"><Badge variant={p.riskLevel === "High" ? "destructive" : "secondary"} className="text-[9px]">{p.riskLevel}</Badge></td>
                  <td className="px-2 py-2">{p.reorderLevel}</td>
                  <td className="px-2 py-2">{p.tax}</td>
                  <td className="px-2 py-2">₹{p.unitRate}</td>
                  <td className="px-2 py-2">{p.unitMrp ? `₹${p.unitMrp}` : "—"}</td>
                  <td className="px-2 py-2"><Badge className={type === "active" ? "bg-emerald-100 text-emerald-700 text-[9px]" : "bg-red-100 text-red-700 text-[9px]"}>{p.status}</Badge></td>
                  <td className="px-2 py-2">{p.buyFromQuotation ? "Yes" : "No"}</td>
                  <td className="px-2 py-2">{p.createdBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 text-xs text-muted-foreground border-t">Showing 1 to {data.length} of {data.length} entries</div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><ShoppingBag className="h-6 w-6 text-pink-600" /> Product Master</h1>
          <p className="text-sm text-muted-foreground">Maintain all products, kits, lab reagents, linen & consumables</p>
        </div>
        <Badge variant="secondary">Total: {products.length} ({active.length} active, {inactive.length} inactive)</Badge>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="new" className="text-emerald-600 font-semibold">New ▾</TabsTrigger>
          <TabsTrigger value="manage" className="text-orange-600 font-semibold">Manage ▾</TabsTrigger>
          <TabsTrigger value="inactive" className="text-red-600 font-semibold">Manage Inactive ▾</TabsTrigger>
          <TabsTrigger value="product-type" className="font-semibold">Product Type</TabsTrigger>
        </TabsList>

        {/* NEW PRODUCT */}
        <TabsContent value="new">
          {/* New Type Selector */}
          <div className="flex gap-2 mb-4">
            {NEW_TYPES.map(t => (
              <Button key={t} size="sm" variant={newType === t ? "default" : "outline"} onClick={() => setNewType(t)}>{t}</Button>
            ))}
          </div>
          <Card>
            <CardHeader className="pb-2 border-b bg-primary/5">
              <CardTitle className="text-base text-center text-primary">{newType}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Product Constitution dropdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div><Label>Product Constitution</Label><Select><SelectTrigger><SelectValue placeholder="Select constitution" /></SelectTrigger><SelectContent><SelectItem value="single">Single</SelectItem><SelectItem value="compound">Compound</SelectItem><SelectItem value="combination">Combination</SelectItem></SelectContent></Select></div>
              </div>
              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div><Label>Name *</Label><Input placeholder="Product Name" /></div>
                <div><Label>Manufacturer</Label><Select><SelectTrigger><SelectValue placeholder="Select Manufacturer" /></SelectTrigger><SelectContent><SelectItem value="kottakkal">Kottakkal Arya Vaidya Sala</SelectItem><SelectItem value="avp">Arya Vaidya Pharmacy</SelectItem><SelectItem value="himalaya">Himalaya</SelectItem><SelectItem value="dabur">Dabur</SelectItem><SelectItem value="baidyanath">Baidyanath</SelectItem><SelectItem value="sbl">SBL Homeopathy</SelectItem><SelectItem value="inhouse">In-House</SelectItem><SelectItem value="local">Local Vendor</SelectItem></SelectContent></Select><button className="text-xs text-orange-600 mt-1">Add New Manufacturer</button></div>
                <div><Label>Marketed By</Label><Select><SelectTrigger><SelectValue placeholder="Select Marketed By" /></SelectTrigger><SelectContent><SelectItem value="same">Same as Manufacturer</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select><button className="text-xs text-orange-600 mt-1">Add New Marketed By</button></div>
                <div><Label>Type *</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              </div>
              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div><Label>Schedule Code *</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{SCHEDULE_CODES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Composition</Label><Input placeholder="Single / Compound ingredients" /></div>
                <div><Label>Pharmacological Name</Label><Select><SelectTrigger><SelectValue placeholder="Select Pharmacological name" /></SelectTrigger><SelectContent>{PHARMACOLOGICAL.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>VED</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="V">V - Vital</SelectItem><SelectItem value="E">E - Essential</SelectItem><SelectItem value="D">D - Desirable</SelectItem></SelectContent></Select></div>
              </div>
              {/* Row 3 - Strength */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div><Label>Strength</Label><div className="flex gap-2"><Input placeholder="Strength" className="flex-1" /><Select><SelectTrigger className="w-20"><SelectValue placeholder="Unit" /></SelectTrigger><SelectContent><SelectItem value="mg">mg</SelectItem><SelectItem value="gm">gm</SelectItem><SelectItem value="ml">ml</SelectItem><SelectItem value="IU">IU</SelectItem></SelectContent></Select></div></div>
                <div><Label>Category</Label><Select><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><button className="text-xs text-orange-600 mt-1">Add New Category</button></div>
                <div><Label>Sub-Category</Label><Select><SelectTrigger><SelectValue placeholder="Select Sub-Category" /></SelectTrigger><SelectContent>{SUB_CATEGORIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><button className="text-xs text-orange-600 mt-1">Add New Sub-Category</button></div>
                <div><Label>ReOrder Level</Label><Input type="number" placeholder="Minimum stock" /></div>
              </div>
              {/* Row 4 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div><Label>Indication</Label><Select><SelectTrigger><SelectValue placeholder="Select Indication" /></SelectTrigger><SelectContent>{INDICATIONS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Purchase Unit *</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Purchase Price *</Label><Input type="number" placeholder="Purchase Price" /></div>
                <div><Label>MRP *</Label><Input type="number" placeholder="MRP" /></div>
              </div>
              {/* Row 5 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div><Label>Margin (%) *</Label><Input type="number" placeholder="Margin" /></div>
                <div><Label>Temperature</Label><Input placeholder="Storage temperature" /></div>
                <div><Label>UOM</Label><Input placeholder="Product Unit" /></div>
                <div><Label>HSN</Label><Input placeholder="HSN Code" /></div>
              </div>
              {/* Row 6 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div><Label>Prod Short Code</Label><Input placeholder="It's only for search for sales" /></div>
                <div><Label>Tax</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="gst5">GST 5%</SelectItem><SelectItem value="gst12">GST 12%</SelectItem><SelectItem value="gst18">GST 18%</SelectItem><SelectItem value="gst28">GST 28%</SelectItem><SelectItem value="exempt">Exempt</SelectItem></SelectContent></Select></div>
                <div><Label>Risk Level</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{RISK_LEVELS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Status *</Label><Select defaultValue="active"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></div>
              </div>
              {/* Checkboxes */}
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2"><Checkbox /><Label className="text-sm">Allow Sale Rate</Label></div>
                <div className="flex items-center gap-2"><Checkbox /><Label className="text-sm">MRP is not mandatory in GRN</Label></div>
                <div className="flex items-center gap-2"><Checkbox /><Label className="text-sm">Buy From Quotation</Label></div>
              </div>
              {/* Prescription Params */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-sm mb-3">Prescription Params</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div><Label>Type</Label><Select><SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger><SelectContent><SelectItem value="internal">Internal</SelectItem><SelectItem value="external">External</SelectItem><SelectItem value="both">Both</SelectItem></SelectContent></Select></div>
                  <div><Label>Dosage</Label><Input placeholder="e.g., 1-0-1" /></div>
                  <div><Label>Duration</Label><Input placeholder="Duration(Days)" /></div>
                  <div><Label>Route</Label><Input placeholder="Route" /></div>
                  <div><Label>Unit</Label><Input placeholder="Unit" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                  <div><Label>Instructions</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{INSTRUCTIONS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label>Timing</Label><div className="flex gap-3 mt-1 text-xs"><label className="flex items-center gap-1"><input type="radio" name="timing" /> Before Food</label><label className="flex items-center gap-1"><input type="radio" name="timing" defaultChecked /> After Food</label><label className="flex items-center gap-1"><input type="radio" name="timing" /> N/A</label></div></div>
                </div>
                <div className="grid grid-cols-5 gap-2 mt-3 text-center text-xs">
                  <div><Label className="text-xs">Morn</Label><Input className="h-7 text-xs" /></div>
                  <div><Label className="text-xs">Noon</Label><Input className="h-7 text-xs" /></div>
                  <div><Label className="text-xs">Eve</Label><Input className="h-7 text-xs" /></div>
                  <div><Label className="text-xs">Night</Label><Input className="h-7 text-xs" /></div>
                  <div><Label className="text-xs">(or)</Label><Input className="h-7 text-xs" /></div>
                </div>
              </div>
              <div className="flex justify-center pt-4">
                <Button onClick={() => toast.success(`${newType} added successfully!`)} className="bg-red-600 hover:bg-red-700 px-8">Submit</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MANAGE ACTIVE */}
        <TabsContent value="manage">{renderProductTable(filteredActive, "active")}</TabsContent>

        {/* MANAGE INACTIVE */}
        <TabsContent value="inactive">{renderProductTable(filteredInactive, "inactive")}</TabsContent>

        {/* PRODUCT TYPE */}
        <TabsContent value="product-type">
          <Card>
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-base text-center text-primary">Manage Product Type</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <Label className="font-semibold whitespace-nowrap">Product Type Name :</Label>
                <Input value={ptName} onChange={e => setPtName(e.target.value)} placeholder="Enter product type name" className="max-w-sm" />
                <Button className="bg-red-600 hover:bg-red-700" onClick={() => { if (!ptName.trim()) return toast.error("Enter name"); toast.success("Product type created!"); setPtName(""); }}>Create</Button>
              </div>
              <div className="flex items-center justify-between text-sm"><span>Show 100 entries</span><div className="relative w-48"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9 h-8" placeholder="Search..." /></div></div>
              <Table>
                <TableHeader><TableRow><TableHead className="text-orange-600">Product Type</TableHead><TableHead className="text-orange-600">Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {productTypes.map((pt, i) => (
                    <TableRow key={i}><TableCell className="font-medium">{pt.name}</TableCell><TableCell><Badge className="bg-emerald-100 text-emerald-700 text-xs">{pt.status} <Pencil className="h-2.5 w-2.5 inline ml-1" /></Badge></TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="text-xs text-muted-foreground">Showing 1 to {productTypes.length} of {productTypes.length} entries</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductMaster;
