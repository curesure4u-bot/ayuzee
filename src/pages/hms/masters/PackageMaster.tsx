import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Package, Plus, Search, Edit, Trash2, Download, IndianRupee, Eye } from "lucide-react";

type PackageItem = {
  id: string;
  code: string;
  name: string;
  category: string;
  type: "health_checkup" | "panchakarma" | "wellness" | "disease_specific" | "corporate";
  duration: string;
  price: number;
  mrp: number;
  inclusions: { type: string; name: string }[];
  validity: string;
  maxPatients: number;
  status: "active" | "inactive" | "seasonal";
  description: string;
};

const TYPES = ["health_checkup", "panchakarma", "wellness", "disease_specific", "corporate"];
const TYPE_LABELS: Record<string, string> = { health_checkup: "Health Checkup", panchakarma: "Panchakarma", wellness: "Wellness", disease_specific: "Disease Specific", corporate: "Corporate" };

const mockPackages: PackageItem[] = [
  { id: "1", code: "PKG-PK14", name: "14-Day Full Panchakarma", category: "Panchakarma", type: "panchakarma", duration: "14 days", price: 85000, mrp: 105000, validity: "3 months", maxPatients: 0, status: "active", description: "Complete detox with all 5 Panchakarma procedures",
    inclusions: [
      { type: "Consultation", name: "Doctor consultation (daily)" },
      { type: "Treatment", name: "Snehapana (5 days)" },
      { type: "Treatment", name: "Abhyanga + Swedana (14 days)" },
      { type: "Treatment", name: "Vamana (1 session)" },
      { type: "Treatment", name: "Virechana (1 session)" },
      { type: "Treatment", name: "Vasti - Kashaya (8 sessions)" },
      { type: "Treatment", name: "Vasti - Sneha (6 sessions)" },
      { type: "Treatment", name: "Nasya (7 days)" },
      { type: "Investigation", name: "CBC + ESR + CRP (Pre & Post)" },
      { type: "Investigation", name: "Lipid Profile (Pre & Post)" },
      { type: "Accommodation", name: "Single AC room (14 nights)" },
      { type: "Diet", name: "Pathya ahara (3 meals/day)" },
    ]},
  { id: "2", code: "PKG-REJ7", name: "7-Day Rejuvenation", category: "Panchakarma", type: "wellness", duration: "7 days", price: 28000, mrp: 35000, validity: "6 months", maxPatients: 0, status: "active", description: "Stress relief and rejuvenation package",
    inclusions: [
      { type: "Consultation", name: "Doctor consultation (2)" },
      { type: "Treatment", name: "Abhyanga (7 sessions)" },
      { type: "Treatment", name: "Shirodhara (7 sessions)" },
      { type: "Treatment", name: "Steam Bath (7 sessions)" },
      { type: "Diet", name: "Herbal tea & supplements" },
    ]},
  { id: "3", code: "PKG-SPINE", name: "21-Day Spine Care Program", category: "Disease Specific", type: "disease_specific", duration: "21 days", price: 65000, mrp: 78000, validity: "6 months", maxPatients: 0, status: "active", description: "For disc problems, spondylosis, sciatica",
    inclusions: [
      { type: "Consultation", name: "Ortho + Ayurveda consultation" },
      { type: "Treatment", name: "Kati Basti (14 sessions)" },
      { type: "Treatment", name: "Pizhichil (7 sessions)" },
      { type: "Treatment", name: "Elakizhi (7 sessions)" },
      { type: "Treatment", name: "Yoga therapy (daily)" },
      { type: "Investigation", name: "X-Ray Spine" },
      { type: "Investigation", name: "MRI Lumbar (if needed)" },
    ]},
  { id: "4", code: "PKG-HC-B", name: "AYUSH Basic Health Checkup", category: "Health Checkup", type: "health_checkup", duration: "1 day", price: 2500, mrp: 3500, validity: "1 year", maxPatients: 0, status: "active", description: "Basic health screening with Prakruti assessment",
    inclusions: [
      { type: "Consultation", name: "Ayurveda doctor consultation" },
      { type: "Assessment", name: "Prakruti & Vikruti assessment" },
      { type: "Investigation", name: "CBC" },
      { type: "Investigation", name: "Blood Sugar (F/PP)" },
      { type: "Investigation", name: "Lipid Profile" },
      { type: "Investigation", name: "Liver Function Test" },
      { type: "Investigation", name: "Kidney Function Test" },
      { type: "Investigation", name: "Thyroid (TSH)" },
      { type: "Investigation", name: "Urine Routine" },
      { type: "Report", name: "Personalized Dosha report" },
    ]},
  { id: "5", code: "PKG-HC-E", name: "AYUSH Executive Health Checkup", category: "Health Checkup", type: "corporate", duration: "1 day", price: 5500, mrp: 7500, validity: "1 year", maxPatients: 0, status: "active", description: "Comprehensive screening for corporate executives",
    inclusions: [
      { type: "Consultation", name: "Senior Ayurveda consultant" },
      { type: "Assessment", name: "Full Ashtavidha + Prakruti" },
      { type: "Investigation", name: "CBC + ESR" },
      { type: "Investigation", name: "Complete Metabolic Panel" },
      { type: "Investigation", name: "Lipid Profile" },
      { type: "Investigation", name: "Thyroid Profile (T3/T4/TSH)" },
      { type: "Investigation", name: "Vitamin D3 + B12" },
      { type: "Investigation", name: "HbA1c" },
      { type: "Investigation", name: "ECG" },
      { type: "Investigation", name: "X-Ray Chest" },
      { type: "Investigation", name: "Ultrasound Abdomen" },
      { type: "Assessment", name: "Stress Assessment" },
      { type: "Diet", name: "Personalized diet chart" },
      { type: "Report", name: "Dosha + Wellness report" },
    ]},
  { id: "6", code: "PKG-WGT", name: "7-Day Weight Management", category: "Wellness", type: "wellness", duration: "7 days", price: 22000, mrp: 28000, validity: "3 months", maxPatients: 0, status: "active", description: "Ayurvedic weight loss with Udwarthanam and detox",
    inclusions: [
      { type: "Consultation", name: "Nutritionist + Ayurveda" },
      { type: "Treatment", name: "Udwarthanam (7 sessions)" },
      { type: "Treatment", name: "Steam Bath (7 sessions)" },
      { type: "Treatment", name: "Virechana (1 session)" },
      { type: "Treatment", name: "Lekhana Vasti (5 sessions)" },
      { type: "Diet", name: "Kapha-reducing diet plan" },
    ]},
  { id: "7", code: "PKG-MNSR", name: "Monsoon Immunity Booster", category: "Seasonal", type: "wellness", duration: "5 days", price: 15000, mrp: 20000, validity: "2 months", maxPatients: 50, status: "seasonal", description: "Seasonal wellness package for monsoon immunity",
    inclusions: [
      { type: "Consultation", name: "Ayurveda consultation" },
      { type: "Treatment", name: "Abhyanga (5 sessions)" },
      { type: "Treatment", name: "Swedana (5 sessions)" },
      { type: "Medicine", name: "Immunity kit (30 days)" },
      { type: "Diet", name: "Seasonal diet advisory" },
    ]},
];

const PackageMaster = () => {
  const [packages] = useState<PackageItem[]>(mockPackages);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [viewPkg, setViewPkg] = useState<PackageItem | null>(null);

  const filtered = packages.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || p.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-amber-600" /> Package Master
          </h1>
          <p className="text-sm text-muted-foreground">
            Health checkup, Panchakarma, Wellness & Corporate packages with inclusions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="mr-1 h-4 w-4" /> Export</Button>
          <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="mr-1 h-4 w-4" /> Create Package</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{packages.length}</p><p className="text-xs text-muted-foreground">Total Packages</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{packages.filter(p => p.type === "panchakarma").length}</p><p className="text-xs text-muted-foreground">Panchakarma</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{packages.filter(p => p.type === "health_checkup" || p.type === "corporate").length}</p><p className="text-xs text-muted-foreground">Health Checkup</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{packages.filter(p => p.type === "wellness").length}</p><p className="text-xs text-muted-foreground">Wellness</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{packages.filter(p => p.status === "seasonal").length}</p><p className="text-xs text-muted-foreground">Seasonal</p></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by name or code..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {TYPES.map((t) => <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Package Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">#</th>
                  <th className="px-3 py-2 text-left font-medium">Code</th>
                  <th className="px-3 py-2 text-left font-medium">Package Name</th>
                  <th className="px-3 py-2 text-left font-medium">Type</th>
                  <th className="px-3 py-2 text-left font-medium">Duration</th>
                  <th className="px-3 py-2 text-left font-medium">MRP</th>
                  <th className="px-3 py-2 text-left font-medium">Offer Price</th>
                  <th className="px-3 py-2 text-left font-medium">Inclusions</th>
                  <th className="px-3 py-2 text-left font-medium">Validity</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                  <th className="px-3 py-2 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((pkg, i) => (
                  <tr key={pkg.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-2 font-mono text-xs font-bold">{pkg.code}</td>
                    <td className="px-3 py-2 font-medium">{pkg.name}</td>
                    <td className="px-3 py-2"><Badge variant="outline" className="text-[10px] capitalize">{TYPE_LABELS[pkg.type]}</Badge></td>
                    <td className="px-3 py-2 text-xs">{pkg.duration}</td>
                    <td className="px-3 py-2 text-xs line-through text-muted-foreground">₹{pkg.mrp.toLocaleString("en-IN")}</td>
                    <td className="px-3 py-2 font-bold text-green-700">₹{pkg.price.toLocaleString("en-IN")}</td>
                    <td className="px-3 py-2">
                      <Button size="sm" variant="ghost" className="text-xs h-6" onClick={() => setViewPkg(pkg)}>
                        {pkg.inclusions.length} items
                      </Button>
                    </td>
                    <td className="px-3 py-2 text-xs">{pkg.validity}</td>
                    <td className="px-3 py-2">
                      <Badge variant={pkg.status === "active" ? "outline" : pkg.status === "seasonal" ? "default" : "secondary"} className={`text-[10px] ${pkg.status === "active" ? "text-green-600" : ""}`}>{pkg.status}</Badge>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setViewPkg(pkg)}><Eye className="h-3 w-3" /></Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Edit className="h-3 w-3" /></Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500"><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View Package Inclusions Dialog */}
      <Dialog open={!!viewPkg} onOpenChange={() => setViewPkg(null)}>
        <DialogContent className="max-w-lg">
          {viewPkg && (
            <>
              <DialogHeader>
                <DialogTitle>{viewPkg.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                  <div>
                    <p className="text-xs text-muted-foreground">Package Price</p>
                    <p className="text-xl font-bold text-green-700">₹{viewPkg.price.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">MRP</p>
                    <p className="text-sm line-through text-muted-foreground">₹{viewPkg.mrp.toLocaleString("en-IN")}</p>
                    <Badge className="bg-green-600 text-white text-xs mt-0.5">Save {Math.round(((viewPkg.mrp - viewPkg.price) / viewPkg.mrp) * 100)}%</Badge>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{viewPkg.description}</p>
                  <div className="flex gap-2 text-xs">
                    <Badge variant="outline">{viewPkg.duration}</Badge>
                    <Badge variant="outline">Valid: {viewPkg.validity}</Badge>
                  </div>
                </div>
                <div className="border-t pt-3">
                  <p className="font-medium text-sm mb-2">Inclusions ({viewPkg.inclusions.length} items)</p>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {viewPkg.inclusions.map((inc, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                        <Badge variant="secondary" className="text-[9px] w-24 justify-center">{inc.type}</Badge>
                        <span className="text-xs">{inc.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Package Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Create New Package</DialogTitle></DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Package Code *</Label><Input placeholder="e.g., PKG-PK14" /></div>
              <div><Label>Package Name *</Label><Input placeholder="Full package name" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Type *</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Duration *</Label><Input placeholder="e.g., 7 days, 14 days" /></div>
              <div><Label>Validity</Label><Input placeholder="e.g., 3 months" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>MRP (₹)</Label><Input type="number" placeholder="Original price" /></div>
              <div><Label>Offer Price (₹) *</Label><Input type="number" placeholder="Package price" /></div>
              <div><Label>Max Patients (0=unlimited)</Label><Input type="number" placeholder="0" /></div>
            </div>
            <div><Label>Description</Label><Textarea placeholder="Package description, target audience, benefits..." rows={2} /></div>
            <div className="border-t pt-3">
              <div className="flex items-center justify-between mb-2">
                <Label className="font-medium">Inclusions</Label>
                <Button size="sm" variant="outline"><Plus className="mr-1 h-3 w-3" /> Add Item</Button>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2">
                  <Select><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Consultation">Consultation</SelectItem>
                      <SelectItem value="Treatment">Treatment</SelectItem>
                      <SelectItem value="Investigation">Investigation</SelectItem>
                      <SelectItem value="Medicine">Medicine</SelectItem>
                      <SelectItem value="Accommodation">Accommodation</SelectItem>
                      <SelectItem value="Diet">Diet</SelectItem>
                      <SelectItem value="Assessment">Assessment</SelectItem>
                      <SelectItem value="Report">Report</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input className="h-8 text-xs col-span-2" placeholder="Item name / description" />
                  <Input className="h-8 text-xs" placeholder="Qty / sessions" />
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2"><Switch defaultChecked /><Label>Active</Label></div>
              <div className="flex items-center gap-2"><Switch /><Label>Seasonal</Label></div>
              <div className="flex items-center gap-2"><Switch /><Label>Show on Website</Label></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Package created"); setAddOpen(false); }}>Save Package</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PackageMaster;
