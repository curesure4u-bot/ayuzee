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
import { Stethoscope, Plus, Search, Edit, Trash2, Download, IndianRupee } from "lucide-react";

type Treatment = {
  id: string;
  code: string;
  name: string;
  category: string;
  department: string;
  system: string;
  duration: string;
  price: number;
  gst: number;
  requiresTherapist: boolean;
  requiresRoom: boolean;
  consumables: string;
  description: string;
  status: "active" | "inactive";
};

const SYSTEMS = ["Ayurveda", "Siddha", "Homeopathy", "Unani", "Yoga & Naturopathy", "Modern (Supportive)", "Integrative"];
const CATEGORIES = ["Panchakarma - Pradhana Karma", "Panchakarma - Poorva Karma", "Panchakarma - Paschath Karma", "External Therapy", "Internal Procedure", "Para-Surgical", "Yoga Therapy", "Naturopathy", "Physiotherapy", "Consultation", "Minor Procedure", "Counseling"];
const DEPTS = ["Panchakarma", "Ayurveda OPD", "Siddha", "Homeopathy", "Unani", "Yoga", "Physiotherapy", "Surgery", "General"];

const mockTreatments: Treatment[] = [
  { id: "1", code: "PK-ABH", name: "Abhyanga (Full Body Oil Massage)", category: "External Therapy", department: "Panchakarma", system: "Ayurveda", duration: "45 min", price: 1500, gst: 18, requiresTherapist: true, requiresRoom: true, consumables: "Dhanwantharam Tailam 200ml", description: "Synchronized full body massage with warm medicated oil", status: "active" },
  { id: "2", code: "PK-SHD", name: "Shirodhara", category: "External Therapy", department: "Panchakarma", system: "Ayurveda", duration: "45 min", price: 2500, gst: 18, requiresTherapist: true, requiresRoom: true, consumables: "Ksheerabala Tailam 500ml, Shirodhara pot", description: "Continuous stream of warm oil on forehead for neurological and stress disorders", status: "active" },
  { id: "3", code: "PK-PIZ", name: "Pizhichil (Kayaseka)", category: "External Therapy", department: "Panchakarma", system: "Ayurveda", duration: "60 min", price: 3500, gst: 18, requiresTherapist: true, requiresRoom: true, consumables: "Dhanwantharam Tailam 1000ml", description: "Warm oil bath with simultaneous massage - king of Panchakarma", status: "active" },
  { id: "4", code: "PK-VRC", name: "Virechana (Therapeutic Purgation)", category: "Panchakarma - Pradhana Karma", department: "Panchakarma", system: "Ayurveda", duration: "1 day", price: 3000, gst: 18, requiresTherapist: false, requiresRoom: true, consumables: "Trivrut Lehyam / Avipathi Churnam", description: "Medicated purgation for Pitta dosha elimination", status: "active" },
  { id: "5", code: "PK-VAS", name: "Kashaya Vasti (Decoction Enema)", category: "Panchakarma - Pradhana Karma", department: "Panchakarma", system: "Ayurveda", duration: "30 min", price: 1800, gst: 18, requiresTherapist: true, requiresRoom: true, consumables: "Dashamoola Kashaya 400ml, Honey, Rock salt", description: "Medicated decoction enema for Vata disorders", status: "active" },
  { id: "6", code: "PK-NAS", name: "Nasya (Nasal Therapy)", category: "Panchakarma - Pradhana Karma", department: "Panchakarma", system: "Ayurveda", duration: "20 min", price: 800, gst: 18, requiresTherapist: true, requiresRoom: true, consumables: "Anu Tailam 10ml", description: "Medicated oil/powder instillation through nostrils", status: "active" },
  { id: "7", code: "PK-ELA", name: "Elakizhi (Herbal Bolus Fomentation)", category: "External Therapy", department: "Panchakarma", system: "Ayurveda", duration: "45 min", price: 2000, gst: 18, requiresTherapist: true, requiresRoom: true, consumables: "Fresh herbs, Lemon, Coconut, Oil", description: "Sudation with herbal leaf boluses for joint disorders", status: "active" },
  { id: "8", code: "PK-JBV", name: "Janu Basti (Knee Oil Pooling)", category: "External Therapy", department: "Panchakarma", system: "Ayurveda", duration: "30 min", price: 1200, gst: 18, requiresTherapist: true, requiresRoom: true, consumables: "Kottamchukkadi Tailam 150ml, Black gram flour", description: "Retention of warm oil over knee joint for OA Knee", status: "active" },
  { id: "9", code: "PK-UDW", name: "Udwarthanam (Dry Powder Massage)", category: "External Therapy", department: "Panchakarma", system: "Ayurveda", duration: "45 min", price: 1800, gst: 18, requiresTherapist: true, requiresRoom: true, consumables: "Triphala / Kolkulathadi Churnam 200g", description: "Upward dry herbal powder massage for obesity and Kapha disorders", status: "active" },
  { id: "10", code: "SD-VAR", name: "Varmam Therapy", category: "External Therapy", department: "Siddha", system: "Siddha", duration: "30 min", price: 1000, gst: 18, requiresTherapist: true, requiresRoom: true, consumables: "Varmam oil", description: "Siddha vital point pressure therapy for pain and neurological conditions", status: "active" },
  { id: "11", code: "UN-HIJ", name: "Hijama (Cupping Therapy)", category: "External Therapy", department: "Unani", system: "Unani", duration: "30 min", price: 1500, gst: 18, requiresTherapist: true, requiresRoom: true, consumables: "Cups, Lancets, Antiseptic", description: "Unani wet/dry cupping therapy for pain and detoxification", status: "active" },
  { id: "12", code: "YG-ASN", name: "Yoga Therapy Session (Individual)", category: "Yoga Therapy", department: "Yoga", system: "Yoga & Naturopathy", duration: "60 min", price: 500, gst: 18, requiresTherapist: true, requiresRoom: true, consumables: "Yoga mat", description: "Personalized yoga asana, pranayama and meditation session", status: "active" },
  { id: "13", code: "NT-HYD", name: "Hydrotherapy - Hip Bath", category: "Naturopathy", department: "Yoga", system: "Yoga & Naturopathy", duration: "20 min", price: 400, gst: 18, requiresTherapist: false, requiresRoom: true, consumables: "Neem leaves (optional)", description: "Cold/warm hip bath for digestive and pelvic disorders", status: "active" },
  { id: "14", code: "PS-AGN", name: "Agnikarma (Thermal Cautery)", category: "Para-Surgical", department: "Surgery", system: "Ayurveda", duration: "15 min", price: 2000, gst: 18, requiresTherapist: false, requiresRoom: true, consumables: "Panchadhatu Shalaka, Panchavalkala Kwath", description: "Therapeutic heat application for musculoskeletal pain and plantar fasciitis", status: "active" },
  { id: "15", code: "PS-KSH", name: "Ksharasutra (Medicated Thread)", category: "Para-Surgical", department: "Surgery", system: "Ayurveda", duration: "30 min", price: 5000, gst: 18, requiresTherapist: false, requiresRoom: true, consumables: "Ksharasutra, Probe, Antiseptic", description: "Medicated thread application for fistula-in-ano and piles", status: "active" },
];

const TreatmentMaster = () => {
  const [treatments] = useState<Treatment[]>(mockTreatments);
  const [search, setSearch] = useState("");
  const [filterSystem, setFilterSystem] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = treatments.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.code.toLowerCase().includes(search.toLowerCase());
    const matchSystem = filterSystem === "all" || t.system === filterSystem;
    const matchCat = filterCategory === "all" || t.category === filterCategory;
    return matchSearch && matchSystem && matchCat;
  });

  const totalRevenuePotential = treatments.reduce((s, t) => s + t.price, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-green-600" /> Treatment Master
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure treatments, procedures, therapies for EMR and billing
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="mr-1 h-4 w-4" /> Export</Button>
          <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="mr-1 h-4 w-4" /> Add Treatment</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{treatments.length}</p><p className="text-xs text-muted-foreground">Total Treatments</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{treatments.filter(t => t.category.includes("Panchakarma")).length}</p><p className="text-xs text-muted-foreground">Panchakarma</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{treatments.filter(t => t.category === "External Therapy").length}</p><p className="text-xs text-muted-foreground">External Therapy</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{treatments.filter(t => t.category === "Para-Surgical").length}</p><p className="text-xs text-muted-foreground">Para-Surgical</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{treatments.filter(t => t.requiresTherapist).length}</p><p className="text-xs text-muted-foreground">Need Therapist</p></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by name or code..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterSystem} onValueChange={setFilterSystem}>
          <SelectTrigger className="w-[170px]"><SelectValue placeholder="System" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Systems</SelectItem>
            {SYSTEMS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Treatment Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">#</th>
                  <th className="px-3 py-2 text-left font-medium">Code</th>
                  <th className="px-3 py-2 text-left font-medium">Treatment Name</th>
                  <th className="px-3 py-2 text-left font-medium">System</th>
                  <th className="px-3 py-2 text-left font-medium">Category</th>
                  <th className="px-3 py-2 text-left font-medium">Duration</th>
                  <th className="px-3 py-2 text-left font-medium">Price</th>
                  <th className="px-3 py-2 text-left font-medium">GST</th>
                  <th className="px-3 py-2 text-left font-medium">Requires</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                  <th className="px-3 py-2 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => (
                  <tr key={t.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-2 font-mono text-xs font-bold">{t.code}</td>
                    <td className="px-3 py-2">
                      <p className="font-medium">{t.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{t.consumables}</p>
                    </td>
                    <td className="px-3 py-2"><Badge variant="outline" className="text-[10px]">{t.system}</Badge></td>
                    <td className="px-3 py-2 text-xs">{t.category}</td>
                    <td className="px-3 py-2 text-xs">{t.duration}</td>
                    <td className="px-3 py-2 font-medium">₹{t.price.toLocaleString("en-IN")}</td>
                    <td className="px-3 py-2 text-xs">{t.gst}%</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        {t.requiresTherapist && <Badge variant="secondary" className="text-[9px]">Therapist</Badge>}
                        {t.requiresRoom && <Badge variant="secondary" className="text-[9px]">Room</Badge>}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant={t.status === "active" ? "outline" : "secondary"} className={`text-[10px] ${t.status === "active" ? "text-green-600" : ""}`}>{t.status}</Badge>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
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

      {/* Add Treatment Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Add New Treatment / Procedure</DialogTitle></DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Treatment Code *</Label><Input placeholder="e.g., PK-ABH" /></div>
              <div><Label>Treatment Name *</Label><Input placeholder="Full treatment name" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Medical System *</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{SYSTEMS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Category *</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Department</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{DEPTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Duration</Label><Input placeholder="e.g., 45 min, 1 hour" /></div>
              <div><Label>Price (₹) *</Label><Input type="number" placeholder="Amount" /></div>
              <div><Label>GST %</Label>
                <Select defaultValue="18">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0% (Exempt)</SelectItem>
                    <SelectItem value="5">5%</SelectItem>
                    <SelectItem value="12">12%</SelectItem>
                    <SelectItem value="18">18%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Consumables / Materials Required</Label><Input placeholder="e.g., Dhanwantharam Tailam 200ml, Cotton" /></div>
            <div><Label>Description</Label><Textarea placeholder="Treatment description, indications, procedure steps..." rows={3} /></div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2"><Switch /><Label>Requires Therapist</Label></div>
              <div className="flex items-center gap-2"><Switch /><Label>Requires Room</Label></div>
              <div className="flex items-center gap-2"><Switch defaultChecked /><Label>Active</Label></div>
            </div>
            <div className="border-t pt-3">
              <Label className="font-medium">Rate Plan Pricing (Optional)</Label>
              <p className="text-xs text-muted-foreground mb-2">Set different prices for different rate plans</p>
              <div className="grid grid-cols-3 gap-2">
                <div><Label className="text-xs">General</Label><Input className="h-7 text-xs" placeholder="₹ Amount" /></div>
                <div><Label className="text-xs">Corporate</Label><Input className="h-7 text-xs" placeholder="₹ Amount" /></div>
                <div><Label className="text-xs">Insurance</Label><Input className="h-7 text-xs" placeholder="₹ Amount" /></div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Treatment added successfully"); setAddOpen(false); }}>Save Treatment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TreatmentMaster;
