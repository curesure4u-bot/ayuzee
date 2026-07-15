import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Settings, Users, FlaskConical, Cpu, Stethoscope, Package,
  Warehouse, ShoppingBag, IndianRupee, Building2, CreditCard,
  MapPin, FileText, BedDouble, ClipboardList, Printer, Globe,
  Mail, MessageCircle, Tag, Hash, Pill, Shield, Plus,
  Search, Edit, Trash2, CheckCircle,
} from "lucide-react";

type MasterCategory = {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  itemCount: number;
};

const masterCategories: MasterCategory[] = [
  { id: "user", name: "User Master", description: "Manage users, roles, and access permissions", icon: Users, color: "text-blue-600 bg-blue-50", itemCount: 12 },
  { id: "investigation", name: "Investigation Master", description: "Configure diagnostic and reporting parameters", icon: FlaskConical, color: "text-purple-600 bg-purple-50", itemCount: 45 },
  { id: "machine", name: "Machine Master", description: "Create and configure laboratory analyzers for integration", icon: Cpu, color: "text-slate-600 bg-slate-50", itemCount: 5 },
  { id: "treatment", name: "Treatment Master", description: "Configure predefined treatment plans and procedures for EMR and billing", icon: Stethoscope, color: "text-green-600 bg-green-50", itemCount: 68 },
  { id: "package", name: "Package Master", description: "Define and organize health check-up & Panchakarma packages", icon: Package, color: "text-amber-600 bg-amber-50", itemCount: 15 },
  { id: "store", name: "Store Master", description: "Manage inventory storage locations and tracking", icon: Warehouse, color: "text-teal-600 bg-teal-50", itemCount: 4 },
  { id: "product", name: "Product Master", description: "Maintain the complete list of all products and consumables", icon: ShoppingBag, color: "text-pink-600 bg-pink-50", itemCount: 320 },
  { id: "rateplan", name: "Rate Plan Master", description: "Manage rate plans for standard, corporate, and insurance billing", icon: IndianRupee, color: "text-green-600 bg-green-50", itemCount: 8 },
  { id: "insurance", name: "B2B/Insurance Master", description: "Configure corporate and insurance partner details", icon: Building2, color: "text-indigo-600 bg-indigo-50", itemCount: 12 },
  { id: "settlement", name: "Settlement Master", description: "Define financial settlement rules and terms", icon: CreditCard, color: "text-orange-600 bg-orange-50", itemCount: 5 },
  { id: "billing", name: "Billing Master", description: "Create payment types, discount categories, and expense categories", icon: IndianRupee, color: "text-emerald-600 bg-emerald-50", itemCount: 18 },
  { id: "patient", name: "Patient Master", description: "Create patient sources, vaccination master, membership, ID proofs, and tags", icon: Users, color: "text-rose-600 bg-rose-50", itemCount: 22 },
  { id: "area", name: "Area Master", description: "Maintain a list of service areas, cities, and zones", icon: MapPin, color: "text-cyan-600 bg-cyan-50", itemCount: 35 },
  { id: "content", name: "Content Master", description: "Add predefined complaints, diagnoses, and examination content for EMR", icon: FileText, color: "text-violet-600 bg-violet-50", itemCount: 150 },
  { id: "ward", name: "Ward Master", description: "Define wards, room types, and associated rates", icon: BedDouble, color: "text-blue-600 bg-blue-50", itemCount: 8 },
  { id: "ipadmission", name: "IP Admission Master", description: "Create and manage different IP admission types", icon: ClipboardList, color: "text-red-600 bg-red-50", itemCount: 6 },
  { id: "template", name: "Template Master", description: "Create reusable templates for notes, reports, and prescriptions", icon: FileText, color: "text-amber-600 bg-amber-50", itemCount: 25 },
  { id: "report", name: "Report Master", description: "Set up EOD email reports with defined recipient IDs", icon: Mail, color: "text-sky-600 bg-sky-50", itemCount: 8 },
  { id: "trustedip", name: "Trusted IP Master", description: "Restrict access to approved IP addresses", icon: Shield, color: "text-red-600 bg-red-50", itemCount: 3 },
  { id: "form", name: "Form Master", description: "Design and manage digital patient forms", icon: ClipboardList, color: "text-fuchsia-600 bg-fuchsia-50", itemCount: 12 },
  { id: "tokendisplay", name: "Token Display Master", description: "Customize token screen display content", icon: Hash, color: "text-orange-600 bg-orange-50", itemCount: 4 },
  { id: "department", name: "Department Master", description: "Create and organize hospital departments", icon: Building2, color: "text-indigo-600 bg-indigo-50", itemCount: 10 },
  { id: "counter", name: "Counter Master", description: "Define counter reset periods per financial year and control reset-enabled transactions", icon: Hash, color: "text-slate-600 bg-slate-50", itemCount: 6 },
  { id: "email", name: "Email Content Master", description: "Manage standard email templates", icon: Mail, color: "text-blue-600 bg-blue-50", itemCount: 8 },
  { id: "whatsapp", name: "WhatsApp Content Master", description: "Manage standard WhatsApp message templates", icon: MessageCircle, color: "text-green-600 bg-green-50", itemCount: 10 },
  { id: "tax", name: "Tax Master", description: "Define and update applicable tax rates (GST, etc.)", icon: IndianRupee, color: "text-amber-600 bg-amber-50", itemCount: 5 },
  { id: "label", name: "Label Master", description: "Configure and manage label access permissions", icon: Tag, color: "text-purple-600 bg-purple-50", itemCount: 15 },
  { id: "currency", name: "Currency Master", description: "Manage supported currencies, exchange rates, and default settings", icon: Globe, color: "text-teal-600 bg-teal-50", itemCount: 3 },
  { id: "suggestion", name: "Suggestion Master", description: "Define standard suggestions for EMR, prescriptions, and patient advice", icon: Pill, color: "text-emerald-600 bg-emerald-50", itemCount: 200 },
];

const HmsMasters = () => {
  const [search, setSearch] = useState("");
  const [selectedMaster, setSelectedMaster] = useState<MasterCategory | null>(null);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");

  const filteredMasters = masterCategories.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.description.toLowerCase().includes(search.toLowerCase())
  );

  const categoryGroups = {
    "Users & Access": ["user", "trustedip", "label"],
    "Clinical": ["investigation", "machine", "treatment", "content", "suggestion", "form"],
    "Packages & Billing": ["package", "rateplan", "insurance", "settlement", "billing", "tax", "counter"],
    "Patient & Facility": ["patient", "area", "ward", "ipadmission", "department", "store", "product"],
    "Communication & Display": ["template", "report", "email", "whatsapp", "tokendisplay", "currency"],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6 text-slate-600" /> Master Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure all hospital masters - users, investigations, treatments, billing, templates & more
          </p>
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Users & Access">Users & Access</SelectItem>
            <SelectItem value="Clinical">Clinical</SelectItem>
            <SelectItem value="Packages & Billing">Packages & Billing</SelectItem>
            <SelectItem value="Patient & Facility">Patient & Facility</SelectItem>
            <SelectItem value="Communication & Display">Communication</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search masters..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Master Grid - Grouped */}
      {Object.entries(categoryGroups).map(([groupName, ids]) => {
        if (filterCategory !== "all" && filterCategory !== groupName) return null;
        const groupMasters = filteredMasters.filter((m) => ids.includes(m.id));
        if (groupMasters.length === 0) return null;

        const masterRoutes: Record<string, string> = {
          user: "/hms/masters/users",
          investigation: "/hms/masters/investigations",
          treatment: "/hms/masters/treatments",
          package: "/hms/masters/packages",
          department: "/hms/masters/departments",
          store: "/hms/masters/stores",
          product: "/hms/masters/products",
          ward: "/hms/masters/wards",
          billing: "/hms/masters/billing-tax",
          settlement: "/hms/masters/billing-tax",
          tax: "/hms/masters/billing-tax",
          template: "/hms/masters/templates",
          email: "/hms/masters/templates",
          whatsapp: "/hms/masters/templates",
          content: "/hms/masters/templates",
          suggestion: "/hms/masters/templates",
          label: "/hms/masters/roles",
          trustedip: "/hms/masters/users",
        };

        return (
          <div key={groupName}>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{groupName}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {groupMasters.map((master) => {
                const route = masterRoutes[master.id];
                const cardContent = (
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`h-10 w-10 rounded-lg grid place-items-center ${master.color}`}>
                        <master.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{master.name}</p>
                          <Badge variant="secondary" className="text-[10px]">{master.itemCount}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{master.description}</p>
                      </div>
                    </div>
                  </CardContent>
                );

                return (
                  <Card
                    key={master.id}
                    className="cursor-pointer hover:shadow-md hover:border-primary/30 transition"
                    onClick={() => !route ? setSelectedMaster(master) : undefined}
                  >
                    {route ? <Link to={route}>{cardContent}</Link> : cardContent}
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Master Detail Dialog */}
      <Dialog open={!!selectedMaster} onOpenChange={() => setSelectedMaster(null)}>
        <DialogContent className="max-w-2xl">
          {selectedMaster && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className={`h-8 w-8 rounded-lg grid place-items-center ${selectedMaster.color}`}>
                    <selectedMaster.icon className="h-4 w-4" />
                  </div>
                  {selectedMaster.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{selectedMaster.description}</p>

                {/* Action Bar */}
                <div className="flex items-center justify-between">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <Input className="pl-8 h-8 text-xs" placeholder={`Search in ${selectedMaster.name}...`} />
                  </div>
                  <Button size="sm" onClick={() => setAddItemOpen(true)}>
                    <Plus className="mr-1 h-3 w-3" /> Add New
                  </Button>
                </div>

                {/* Sample Data Table */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">#</th>
                        <th className="px-3 py-2 text-left font-medium">Name</th>
                        <th className="px-3 py-2 text-left font-medium">Status</th>
                        <th className="px-3 py-2 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <tr key={i} className="border-b hover:bg-muted/30">
                          <td className="px-3 py-2 text-muted-foreground">{i}</td>
                          <td className="px-3 py-2 font-medium">
                            {selectedMaster.id === "department" && ["Ayurveda", "Panchakarma", "Siddha", "Homeopathy", "Yoga"][i - 1]}
                            {selectedMaster.id === "user" && ["Dr. Arun Sharma", "Dr. Meena Patel", "Rajesh K", "Vikram R", "Kavita S"][i - 1]}
                            {selectedMaster.id === "investigation" && ["CBC", "ESR", "CRP", "Lipid Profile", "Liver Function"][i - 1]}
                            {selectedMaster.id === "treatment" && ["Abhyanga", "Shirodhara", "Janu Basti", "Virechana", "Nasya"][i - 1]}
                            {selectedMaster.id === "package" && ["7-day Rejuvenation", "14-day Panchakarma", "Spine Care", "Weight Management", "Skin Care"][i - 1]}
                            {selectedMaster.id === "ward" && ["General Ward", "Panchakarma Suite", "Private Room", "Semi-Private", "ICU"][i - 1]}
                            {selectedMaster.id === "tax" && ["GST 5%", "GST 12%", "GST 18%", "Exempt", "Cess"][i - 1]}
                            {!["department", "user", "investigation", "treatment", "package", "ward", "tax"].includes(selectedMaster.id) && `Item ${i}`}
                          </td>
                          <td className="px-3 py-2">
                            <Badge variant="outline" className="text-xs text-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />Active
                            </Badge>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Showing 5 of {selectedMaster.itemCount} items
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={addItemOpen} onOpenChange={setAddItemOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Name *</Label><Input placeholder="Enter name" /></div>
            <div><Label>Code / Short Name</Label><Input placeholder="e.g., DEPT-AYU" /></div>
            <div><Label>Description</Label><Textarea placeholder="Description..." rows={2} /></div>
            <div className="flex items-center gap-2">
              <Switch defaultChecked />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddItemOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Item added successfully"); setAddItemOpen(false); }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsMasters;
