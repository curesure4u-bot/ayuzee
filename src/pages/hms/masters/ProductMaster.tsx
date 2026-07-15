import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ShoppingBag, Plus, Search, Edit, Download, Printer } from "lucide-react";

type Product = {
  id: string; pCode: string; hsn: string; name: string; shortCode: string;
  manufacturer: string; marketedBy: string; composition: string;
  type: string; category: string; subCategory: string;
  pharmacologicalName: string; indication: string;
  strength: string; strengthUnit: string;
  purchaseUnit: string; purchasePrice: number; mrp: number; margin: number;
  unit: string; packUnit: number; scheduleCode: string;
  riskLevel: string; reorderLevel: number;
  tax: number; temperature: string; ved: string;
  uom: string; prodShortCode: string;
  status: "active" | "inactive";
  // Prescription defaults
  rxType: string; rxDosage: string; rxDuration: string; rxRoute: string;
  rxMorn: string; rxNoon: string; rxEve: string; rxNight: string;
  rxUnit: string; rxInstruction: string; rxFoodTiming: string;
};

const CLASSIFICATIONS = ["Ayurveda Classical", "Ayurveda Proprietary", "Siddha Classical", "Siddha Proprietary", "Homeopathy", "Unani", "OTC", "Consumable", "Surgical", "Equipment", "Raw Material"];
const TYPES = ["Drug", "Container", "Consumable", "Equipment", "Oil/External", "Raw Material"];
const CATEGORIES = ["ARISHTAM", "KASHAYAM", "CHURNAM", "TAILAM", "GHRITAM", "LEHYAM", "GUGGULU", "VATI/GULIKA", "BHASMAM", "RASAYANAM", "DILUTION", "MOTHER TINCTURE", "N-MOVING", "CONSUMABLE"];
const SUB_CATEGORIES = ["Classical Internal", "Classical External", "Proprietary", "Patent", "Generic", "Fast Moving", "Slow Moving", "Non-Moving"];
const SCHEDULE_CODES = ["Scheduled", "Non-Scheduled", "C-Scheduled", "H-Scheduled", "X-Scheduled"];
const RISK_LEVELS = ["Low", "Medium", "High", "Critical"];
const VED = ["Vital", "Essential", "Desirable"];
const ROUTES = ["Oral", "External", "Nasal", "Rectal", "Sublingual", "Topical", "Inhalation"];
const RX_TYPES = ["Tablet", "Capsule", "Syrup", "Kashayam", "Churnam", "Tailam", "Ghritam", "Drops", "Ointment", "Injection"];
const INSTRUCTIONS = ["With warm water", "With honey", "With milk", "With ghee", "With cold water", "As directed", "Empty stomach", "With food"];

const mockProducts: Product[] = [
  { id: "1", pCode: "2002", hsn: "30049011", name: "ABHAYARISHTAM AVN 450ML", shortCode: "A", manufacturer: "AVN", marketedBy: "AVN Ayurveda", composition: "Single", type: "Drug", category: "ARISHTAM", subCategory: "Classical Internal", pharmacologicalName: "Abhayarishta", indication: "Constipation, Piles", strength: "450", strengthUnit: "ml", purchaseUnit: "Bottle", purchasePrice: 79, mrp: 99, margin: 5, unit: "450 ml", packUnit: 1, scheduleCode: "Non-Scheduled", riskLevel: "Low", reorderLevel: 5, tax: 5, temperature: "Room", ved: "Essential", uom: "Bottle", prodShortCode: "ABHY-AVN", status: "active", rxType: "Syrup", rxDosage: "15ml", rxDuration: "30", rxRoute: "Oral", rxMorn: "1", rxNoon: "", rxEve: "1", rxNight: "", rxUnit: "Days", rxInstruction: "With warm water", rxFoodTiming: "After food" },
  { id: "2", pCode: "2003", hsn: "30049011", name: "ABHAYARISHTAM AVP", shortCode: "ABAR", manufacturer: "AVP", marketedBy: "Arya Vaidya Pharmacy", composition: "Single", type: "Drug", category: "ARISHTAM", subCategory: "Classical Internal", pharmacologicalName: "Abhayarishta", indication: "Constipation, Haemorrhoids", strength: "", strengthUnit: "", purchaseUnit: "Bottle", purchasePrice: 65, mrp: 86, margin: 5, unit: "", packUnit: 1, scheduleCode: "Scheduled", riskLevel: "Low", reorderLevel: 5, tax: 5, temperature: "Room", ved: "Essential", uom: "Bottle", prodShortCode: "ABHY-AVP", status: "active", rxType: "Syrup", rxDosage: "15ml", rxDuration: "30", rxRoute: "Oral", rxMorn: "1", rxNoon: "", rxEve: "1", rxNight: "", rxUnit: "Days", rxInstruction: "With equal water", rxFoodTiming: "After food" },
  { id: "3", pCode: "2005", hsn: "30049011", name: "AMRUTHARISHTAM", shortCode: "", manufacturer: "ARYA VAIDYA PHARMACY COIMBATORE", marketedBy: "AVP", composition: "Single", type: "Drug", category: "ARISHTAM", subCategory: "Classical Internal", pharmacologicalName: "Amritarishta", indication: "Fever, Immunity", strength: "", strengthUnit: "", purchaseUnit: "Bottle", purchasePrice: 72, mrp: 90, margin: 5, unit: "", packUnit: 1, scheduleCode: "Scheduled", riskLevel: "Low", reorderLevel: 10, tax: 5, temperature: "Room", ved: "Essential", uom: "Bottle", prodShortCode: "AMRT", status: "active", rxType: "Syrup", rxDosage: "15ml", rxDuration: "14", rxRoute: "Oral", rxMorn: "1", rxNoon: "", rxEve: "1", rxNight: "", rxUnit: "Days", rxInstruction: "With warm water", rxFoodTiming: "Before food" },
  { id: "4", pCode: "2007", hsn: "30049011", name: "ARAGWADHARISHTAM", shortCode: "", manufacturer: "KOTTAKKAL ARYA VAIDYA SALA", marketedBy: "Kottakkal", composition: "Single", type: "Drug", category: "ARISHTAM", subCategory: "Classical Internal", pharmacologicalName: "Aragwadharishta", indication: "Skin diseases, Kushtha", strength: "450ml", strengthUnit: "ml", purchaseUnit: "Bottle", purchasePrice: 70, mrp: 90, margin: 5, unit: "450ml", packUnit: 1, scheduleCode: "Non-Scheduled", riskLevel: "Low", reorderLevel: 5, tax: 5, temperature: "Room", ved: "Desirable", uom: "Bottle", prodShortCode: "ARAG", status: "active", rxType: "Syrup", rxDosage: "15ml", rxDuration: "30", rxRoute: "Oral", rxMorn: "1", rxNoon: "", rxEve: "1", rxNight: "", rxUnit: "Days", rxInstruction: "With equal water", rxFoodTiming: "After food" },
  { id: "5", pCode: "2008", hsn: "30049011", name: "ARAVINDHASAVAM", shortCode: "", manufacturer: "ARYA VAIDYA PHARMACY COIMBATORE", marketedBy: "AVP", composition: "Single", type: "Drug", category: "ARISHTAM", subCategory: "Classical Internal", pharmacologicalName: "Aravindasava", indication: "Pediatric tonic, Immunity", strength: "", strengthUnit: "", purchaseUnit: "Bottle", purchasePrice: 60, mrp: 80, margin: 5, unit: "", packUnit: 1, scheduleCode: "Scheduled", riskLevel: "Low", reorderLevel: 5, tax: 5, temperature: "Room", ved: "Desirable", uom: "Bottle", prodShortCode: "ARVI", status: "active", rxType: "Syrup", rxDosage: "10ml", rxDuration: "30", rxRoute: "Oral", rxMorn: "1", rxNoon: "", rxEve: "1", rxNight: "", rxUnit: "Days", rxInstruction: "With warm water", rxFoodTiming: "After food" },
  { id: "6", pCode: "2019", hsn: "30049011", name: "AYASKRITI", shortCode: "", manufacturer: "KOTTAKKAL", marketedBy: "Kottakkal", composition: "Single", type: "Container", category: "N-MOVING", subCategory: "Classical Internal", pharmacologicalName: "Ayaskriti", indication: "Anemia, Pandu", strength: "450ML", strengthUnit: "ml", purchaseUnit: "Bottle", purchasePrice: 100, mrp: 100, margin: 5, unit: "450ML", packUnit: 1, scheduleCode: "C-Scheduled", riskLevel: "Low", reorderLevel: 5, tax: 5, temperature: "Room", ved: "Desirable", uom: "Bottle", prodShortCode: "AYSK", status: "active", rxType: "Syrup", rxDosage: "15ml", rxDuration: "30", rxRoute: "Oral", rxMorn: "1", rxNoon: "", rxEve: "1", rxNight: "", rxUnit: "Days", rxInstruction: "With honey", rxFoodTiming: "Before food" },
];

const ProductMaster = () => {
  const [products] = useState<Product[]>(mockProducts);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("manage");
  const [filterCat, setFilterCat] = useState("all");

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.pCode.includes(search) || p.shortCode.toLowerCase().includes(search.toLowerCase()) || p.manufacturer.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || p.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-pink-600" /> Product Master
          </h1>
          <p className="text-sm text-muted-foreground">Complete medicine catalog with classification, composition, pricing, prescription defaults & scheduling</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="mr-1 h-4 w-4" /> Export CSV</Button>
          <Button variant="outline" size="sm"><Printer className="mr-1 h-4 w-4" /> Print</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="new" className="text-green-600">+ New</TabsTrigger>
          <TabsTrigger value="manage" className="text-orange-600 font-bold">Manage</TabsTrigger>
          <TabsTrigger value="inactive">Manage Inactive</TabsTrigger>
        </TabsList>

        {/* NEW PRODUCT FORM */}
        <TabsContent value="new" className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Product Classification */}
              <div>
                <Label className="font-medium">Product Classification</Label>
                <Select><SelectTrigger className="w-64 mt-1"><SelectValue placeholder="Select Classification" /></SelectTrigger>
                  <SelectContent>{CLASSIFICATIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {/* Row 1: Name, Manufacturer, Marketed By, Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div><Label>Name <span className="text-red-500">*</span></Label><Input placeholder="Product Name" /></div>
                <div>
                  <div className="flex items-center justify-between"><Label>Manufacturer</Label><Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">Add New Manufacturer</Button></div>
                  <Select><SelectTrigger><SelectValue placeholder="Select Manufacturer" /></SelectTrigger><SelectContent><SelectItem value="kottakkal">KOTTAKKAL ARYA VAIDYA SALA</SelectItem><SelectItem value="avp">ARYA VAIDYA PHARMACY</SelectItem><SelectItem value="avn">AVN AYURVEDA</SelectItem><SelectItem value="sbl">SBL HOMEOPATHY</SelectItem><SelectItem value="dhathri">DHATHRI</SelectItem></SelectContent></Select>
                </div>
                <div>
                  <div className="flex items-center justify-between"><Label>Marketed By</Label><Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">Add New Marketed By</Button></div>
                  <Select><SelectTrigger><SelectValue placeholder="Select Marketed By" /></SelectTrigger><SelectContent><SelectItem value="kottakkal">Kottakkal</SelectItem><SelectItem value="avp">AVP</SelectItem><SelectItem value="avn">AVN</SelectItem></SelectContent></Select>
                </div>
                <div><Label>Type <span className="text-red-500">*</span></Label><Select><SelectTrigger><SelectValue placeholder="Drug" /></SelectTrigger><SelectContent>{TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              </div>

              {/* Row 2: Schedule Code, Composition, Pharmacological Name, VED */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div><Label>Schedule Code <span className="text-red-500">*</span></Label><Select><SelectTrigger><SelectValue placeholder="Scheduled" /></SelectTrigger><SelectContent>{SCHEDULE_CODES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Composition</Label><Select defaultValue="Single"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Single">Single</SelectItem><SelectItem value="Combination">Combination</SelectItem></SelectContent></Select></div>
                <div><Label>Pharmacological Name</Label><Select><SelectTrigger><SelectValue placeholder="Select Pharmacological name" /></SelectTrigger><SelectContent><SelectItem value="abhayarishta">Abhayarishta</SelectItem><SelectItem value="amritarishta">Amritarishta</SelectItem><SelectItem value="dasamoolarishta">Dasamoolarishta</SelectItem></SelectContent></Select></div>
                <div><Label>VED</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{VED.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div>
              </div>

              {/* Row 3: Strength, Category, Sub-Category, ReOrder Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div><Label>Strength</Label><div className="flex gap-1"><Input placeholder="Strength" className="flex-1" /><Select defaultValue="ml"><SelectTrigger className="w-20"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ml">ml</SelectItem><SelectItem value="mg">mg</SelectItem><SelectItem value="gm">gm</SelectItem><SelectItem value="L">L</SelectItem></SelectContent></Select></div></div>
                <div>
                  <div className="flex items-center justify-between"><Label>Category</Label><Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">Add New Category</Button></div>
                  <Select><SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger><SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                </div>
                <div>
                  <div className="flex items-center justify-between"><Label>Sub-Category</Label><Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">Add New Sub-Category</Button></div>
                  <Select><SelectTrigger><SelectValue placeholder="Select Sub-Category" /></SelectTrigger><SelectContent>{SUB_CATEGORIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
                </div>
                <div><Label>ReOrder Level</Label><Input type="number" placeholder="0" defaultValue="0" /></div>
              </div>

              {/* Row 4: Indication, Purchase Unit, Purchase Price, MRP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div><Label>Indication</Label><Select><SelectTrigger><SelectValue placeholder="Select Indication" /></SelectTrigger><SelectContent><SelectItem value="constipation">Constipation</SelectItem><SelectItem value="piles">Piles/Arsha</SelectItem><SelectItem value="fever">Fever</SelectItem><SelectItem value="joint_pain">Joint Pain</SelectItem><SelectItem value="skin">Skin Diseases</SelectItem><SelectItem value="immunity">Immunity</SelectItem><SelectItem value="anemia">Anemia/Pandu</SelectItem></SelectContent></Select></div>
                <div><Label>Purchase Unit <span className="text-red-500">*</span></Label><Input placeholder="1" type="number" defaultValue="1" /></div>
                <div><Label>Purchase Price <span className="text-red-500">*</span> <Badge variant="outline" className="text-[9px] text-green-600 ml-1">—</Badge></Label><Input placeholder="Purchase Price" type="number" /></div>
                <div><Label>MRP <span className="text-red-500">*</span> <Badge variant="outline" className="text-[9px] text-blue-600 ml-1">MRP</Badge></Label><Input placeholder="MRP" type="number" /></div>
              </div>

              {/* Row 5: Margin, Temperature, UOM, HSN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div><Label>Margin(%) <span className="text-red-500">*</span></Label><div className="flex gap-1"><Input placeholder="" className="flex-1" /><Button variant="outline" size="sm">Margin</Button></div></div>
                <div><Label>Temperature</Label><Input placeholder="Temperature" /></div>
                <div><Label>UOM</Label><Input placeholder="Product Unit" /></div>
                <div><Label>HSN</Label><Input placeholder="HSN Code" /></div>
              </div>

              {/* Row 6: Prod Short Code, Tax, Risk Level, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div><Label>Prod Short Code</Label><Input placeholder="It's used for search in sales" /></div>
                <div><Label>Tax</Label><Select><SelectTrigger><SelectValue placeholder="Select Tax" /></SelectTrigger><SelectContent><SelectItem value="0">0% (Exempt)</SelectItem><SelectItem value="5">5% GST</SelectItem><SelectItem value="12">12% GST</SelectItem><SelectItem value="18">18% GST</SelectItem></SelectContent></Select></div>
                <div><Label>Risk Level</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{RISK_LEVELS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Status <span className="text-red-500">*</span></Label><Select defaultValue="active"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></div>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2"><Checkbox /><span className="text-sm">Allow Sale Rate</span></label>
                <label className="flex items-center gap-2"><Checkbox /><span className="text-sm">MRP is not mandatory in GRN</span></label>
                <label className="flex items-center gap-2"><Checkbox /><span className="text-sm">Buy from Quotation</span></label>
              </div>

              {/* Prescription Params Section */}
              <div className="border-t pt-4">
                <h3 className="font-display text-lg font-semibold mb-4">Prescription Params</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div><Label>Type</Label><Select><SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger><SelectContent>{RX_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label>Dosage</Label><Input placeholder="Dosage" /></div>
                  <div><Label>Duration (Days)</Label><Input placeholder="Duration(Days)" type="number" /></div>
                  <div><Label>Route</Label><Select><SelectTrigger><SelectValue placeholder="Route" /></SelectTrigger><SelectContent>{ROUTES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                  <div>
                    <div className="grid grid-cols-4 gap-2">
                      <div><Label className="text-xs font-medium text-center block">Morn</Label><Input placeholder="" className="text-center" /></div>
                      <div><Label className="text-xs font-medium text-center block">Noon</Label><Input placeholder="" className="text-center" /></div>
                      <div><Label className="text-xs font-medium text-center block">Eve</Label><Input placeholder="" className="text-center" /></div>
                      <div><Label className="text-xs font-medium text-center block">Night</Label><Input placeholder="" className="text-center" /></div>
                    </div>
                    <p className="text-center text-xs text-muted-foreground mt-1">(or)</p>
                    <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select frequency pattern" /></SelectTrigger><SelectContent><SelectItem value="od">OD (Once daily)</SelectItem><SelectItem value="bd">BD (Twice daily)</SelectItem><SelectItem value="tds">TDS (Thrice daily)</SelectItem><SelectItem value="qid">QID (Four times)</SelectItem><SelectItem value="hs">HS (At bedtime)</SelectItem><SelectItem value="sos">SOS (As needed)</SelectItem></SelectContent></Select>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Unit</Label><Select defaultValue="Days"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Days">Days</SelectItem><SelectItem value="Weeks">Weeks</SelectItem><SelectItem value="Months">Months</SelectItem></SelectContent></Select></div>
                      <div><Label>Instruction</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{INSTRUCTIONS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent></Select></div>
                    </div>
                    <div>
                      <Label>Food Timing</Label>
                      <div className="flex gap-4 mt-1">
                        <label className="flex items-center gap-1 text-sm"><input type="radio" name="food" /> Before Food</label>
                        <label className="flex items-center gap-1 text-sm"><input type="radio" name="food" /> After Food</label>
                        <label className="flex items-center gap-1 text-sm"><input type="radio" name="food" defaultChecked /> N/A</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={() => { toast.success("Product created successfully"); setActiveTab("manage"); }}>Submit</Button>
                <Button variant="outline" onClick={() => setActiveTab("manage")}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MANAGE PRODUCTS TABLE */}
        <TabsContent value="manage" className="space-y-4">
          <Card className="border-orange-200 bg-orange-50/10">
            <CardContent className="p-3">
              <p className="text-sm text-center font-medium text-orange-700">Manage Product</p>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <span>Show</span>
              <Select defaultValue="100"><SelectTrigger className="w-20 h-8"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="25">25</SelectItem><SelectItem value="50">50</SelectItem><SelectItem value="100">100</SelectItem></SelectContent></Select>
              <span>entries</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="bg-green-600 text-white hover:bg-green-700"><Download className="mr-1 h-3 w-3" /> Export As CSV</Button>
              <Button variant="outline" size="sm" className="bg-orange-500 text-white hover:bg-orange-600"><Printer className="mr-1 h-3 w-3" /> Print</Button>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input className="pl-7 h-8 w-48 text-xs" placeholder="Search:" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-2 py-2 text-left font-medium">PCode</th>
                      <th className="px-2 py-2 text-left font-medium">HSN</th>
                      <th className="px-2 py-2 text-left font-medium">Name</th>
                      <th className="px-2 py-2 text-left font-medium">Short Code</th>
                      <th className="px-2 py-2 text-left font-medium">Mfr</th>
                      <th className="px-2 py-2 text-left font-medium">Type</th>
                      <th className="px-2 py-2 text-left font-medium">Category</th>
                      <th className="px-2 py-2 text-left font-medium">Sub Cat</th>
                      <th className="px-2 py-2 text-left font-medium">Unit</th>
                      <th className="px-2 py-2 text-left font-medium">Pack</th>
                      <th className="px-2 py-2 text-left font-medium">Schedule</th>
                      <th className="px-2 py-2 text-left font-medium">Risk</th>
                      <th className="px-2 py-2 text-left font-medium">ReOrder</th>
                      <th className="px-2 py-2 text-left font-medium">Tax</th>
                      <th className="px-2 py-2 text-left font-medium">Rate</th>
                      <th className="px-2 py-2 text-left font-medium">MRP</th>
                      <th className="px-2 py-2 text-left font-medium">Status</th>
                      <th className="px-2 py-2 text-left font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-muted/30">
                        <td className="px-2 py-2 font-mono">{p.pCode}</td>
                        <td className="px-2 py-2 font-mono">{p.hsn}</td>
                        <td className="px-2 py-2">
                          <p className="font-medium text-primary">{p.name}</p>
                          <Button variant="link" size="sm" className="h-auto p-0 text-[9px]"><Edit className="h-2 w-2 mr-0.5" /></Button>
                        </td>
                        <td className="px-2 py-2">{p.shortCode}<Edit className="inline h-2 w-2 text-muted-foreground ml-0.5" /></td>
                        <td className="px-2 py-2">{p.manufacturer}</td>
                        <td className="px-2 py-2">{p.type}</td>
                        <td className="px-2 py-2">{p.category}<Edit className="inline h-2 w-2 text-muted-foreground ml-0.5" /></td>
                        <td className="px-2 py-2">{p.subCategory.split(" ")[0]}<Edit className="inline h-2 w-2 text-muted-foreground ml-0.5" /></td>
                        <td className="px-2 py-2">{p.unit}</td>
                        <td className="px-2 py-2">{p.packUnit}</td>
                        <td className="px-2 py-2">{p.scheduleCode.replace("Scheduled", "Sched.")}<Edit className="inline h-2 w-2 text-muted-foreground ml-0.5" /></td>
                        <td className="px-2 py-2">{p.riskLevel}</td>
                        <td className="px-2 py-2">{p.reorderLevel}<Edit className="inline h-2 w-2 text-muted-foreground ml-0.5" /></td>
                        <td className="px-2 py-2">{p.tax}%</td>
                        <td className="px-2 py-2">{p.purchasePrice.toFixed(2)}</td>
                        <td className="px-2 py-2">{p.mrp.toFixed(2)}</td>
                        <td className="px-2 py-2"><Badge variant="outline" className="text-[8px] text-green-600">{p.status}</Badge></td>
                        <td className="px-2 py-2"><Button variant="ghost" size="sm" className="h-6 w-6 p-0 bg-green-500 text-white rounded"><Edit className="h-3 w-3" /></Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* INACTIVE TAB */}
        <TabsContent value="inactive" className="space-y-4">
          <Card><CardContent className="p-8 text-center text-muted-foreground">
            <p>No inactive products. All products are currently active.</p>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductMaster;
