import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Stethoscope, Plus, Search, Edit, Download, Pencil } from "lucide-react";

type Treatment = {
  id: string;
  code: string;
  sac: string;
  name: string;
  group: string;
  subGroup: string;
  accountHead: string;
  status: "active" | "inactive";
  cptCdt: string;
  externalId: string;
  billType: string;
  avoidCasesheetPrint: boolean;
  createdBy: string;
  price: number;
  applicableFor: string;
  category: string;
  nameOtherLang: string;
};

const GROUPS = ["Consultation", "PANCHAKARMA", "SPA", "LAB", "RADIOLOGY", "PROCEDURE", "PHYSIOTHERAPY", "YOGA", "SIDDHA", "HOMEOPATHY", "UNANI", "NATUROPATHY", "NURSING", "DIET", "OTHER"];
const SUB_GROUPS = ["Consultation", "LONG", "SHORT", "MEDIUM", "DHARA", "VASTI", "NASYA", "VAMANA", "VIRECHANA", "LEPA", "KATI BASTI", "SHIRO", "BASIC", "ADVANCED", "PROCEDURE"];
const ACCOUNT_HEADS = ["consultation", "OP TREATMENT", "IP TREATMENT", "PANCHAKARMA", "LAB", "RADIOLOGY", "PHARMACY", "PROCEDURE"];
const CATEGORIES = ["Ayurveda", "Siddha", "Homeopathy", "Unani", "Yoga & Naturopathy", "Modern", "Integrative", "Diagnostic", "Wellness"];
const APPLICABLE_FOR = ["OP", "IP", "Both OP & IP", "Panchakarma Only", "Lab Only"];

const mockTreatments: Treatment[] = [
  { id: "1", code: "TMT_220", sac: "", name: "Dr Mohamad Saleem MD Ayu - Consultation Rajapalayam", group: "Consultation", subGroup: "Consultation", accountHead: "consultation", status: "active", cptCdt: "", externalId: "", billType: "", avoidCasesheetPrint: false, createdBy: "Al Shifa Ayush Hospital", price: 300, applicableFor: "OP", category: "Ayurveda", nameOtherLang: "Consultation" },
  { id: "2", code: "TMT_221", sac: "", name: "Dr Mohamad Saleem - Consultation Theni", group: "Consultation", subGroup: "Consultation", accountHead: "consultation", status: "active", cptCdt: "", externalId: "", billType: "", avoidCasesheetPrint: false, createdBy: "Al Shifa Ayush Hospital", price: 300, applicableFor: "OP", category: "Ayurveda", nameOtherLang: "Consultation" },
  { id: "3", code: "TMT_222", sac: "", name: "Consultation Theni", group: "Consultation", subGroup: "Consultation", accountHead: "consultation", status: "active", cptCdt: "", externalId: "", billType: "", avoidCasesheetPrint: false, createdBy: "Al Shifa Ayush Hospital", price: 200, applicableFor: "OP", category: "Ayurveda", nameOtherLang: "Consultation" },
  { id: "4", code: "TMT_223", sac: "", name: "Dr Mohamad Saleem MD Consultation Tirunelveli", group: "Consultation", subGroup: "Consultation", accountHead: "consultation", status: "active", cptCdt: "", externalId: "", billType: "", avoidCasesheetPrint: false, createdBy: "Al Shifa Ayush Hospital", price: 300, applicableFor: "OP", category: "Ayurveda", nameOtherLang: "Consultation" },
  { id: "5", code: "TMT_224", sac: "", name: "Dr Yeshu Priya Consultation - TVL", group: "Consultation", subGroup: "Consultation", accountHead: "consultation", status: "active", cptCdt: "", externalId: "", billType: "", avoidCasesheetPrint: false, createdBy: "Al Shifa Ayush Hospital", price: 200, applicableFor: "OP", category: "Ayurveda", nameOtherLang: "Consultation" },
  { id: "6", code: "TMT_225", sac: "", name: "ABHYANGAM FULL BODY ORDINARY", group: "PANCHAKARMA", subGroup: "LONG", accountHead: "OP TREATMENT", status: "active", cptCdt: "", externalId: "", billType: "", avoidCasesheetPrint: false, createdBy: "ROSANA", price: 1500, applicableFor: "Both OP & IP", category: "Ayurveda", nameOtherLang: "" },
  { id: "7", code: "TMT_226", sac: "", name: "JAMBIRA PINDA SVEDANAM FULL", group: "PANCHAKARMA", subGroup: "LONG", accountHead: "", status: "active", cptCdt: "", externalId: "", billType: "", avoidCasesheetPrint: false, createdBy: "ROSANA", price: 2000, applicableFor: "Both OP & IP", category: "Ayurveda", nameOtherLang: "" },
  { id: "8", code: "TMT_227", sac: "", name: "ABHYANGAM & STEAM BATH", group: "PANCHAKARMA", subGroup: "SHORT", accountHead: "", status: "active", cptCdt: "", externalId: "", billType: "", avoidCasesheetPrint: false, createdBy: "ROSANA", price: 1200, applicableFor: "Both OP & IP", category: "Ayurveda", nameOtherLang: "" },
  { id: "9", code: "TMT_228", sac: "", name: "KATI BASTI", group: "PANCHAKARMA", subGroup: "KATI BASTI", accountHead: "OP TREATMENT", status: "active", cptCdt: "", externalId: "", billType: "", avoidCasesheetPrint: false, createdBy: "ROSANA", price: 800, applicableFor: "Both OP & IP", category: "Ayurveda", nameOtherLang: "" },
  { id: "10", code: "TMT_229", sac: "", name: "SHIRODHARA", group: "PANCHAKARMA", subGroup: "SHIRO", accountHead: "OP TREATMENT", status: "active", cptCdt: "", externalId: "", billType: "", avoidCasesheetPrint: false, createdBy: "ROSANA", price: 1800, applicableFor: "Both OP & IP", category: "Ayurveda", nameOtherLang: "" },
  { id: "11", code: "TMT_230", sac: "", name: "NASYAM", group: "PANCHAKARMA", subGroup: "NASYA", accountHead: "OP TREATMENT", status: "active", cptCdt: "", externalId: "", billType: "", avoidCasesheetPrint: false, createdBy: "admin", price: 500, applicableFor: "Both OP & IP", category: "Ayurveda", nameOtherLang: "" },
  { id: "12", code: "TMT_231", sac: "", name: "VIRECHANA KARMA", group: "PANCHAKARMA", subGroup: "VIRECHANA", accountHead: "IP TREATMENT", status: "active", cptCdt: "", externalId: "", billType: "", avoidCasesheetPrint: false, createdBy: "admin", price: 3500, applicableFor: "IP", category: "Ayurveda", nameOtherLang: "" },
  { id: "13", code: "TMT_232", sac: "", name: "VAMANA KARMA", group: "PANCHAKARMA", subGroup: "VAMANA", accountHead: "IP TREATMENT", status: "active", cptCdt: "", externalId: "", billType: "", avoidCasesheetPrint: false, createdBy: "admin", price: 4000, applicableFor: "IP", category: "Ayurveda", nameOtherLang: "" },
  { id: "14", code: "TMT_233", sac: "", name: "KSHARASUTRA", group: "PROCEDURE", subGroup: "PROCEDURE", accountHead: "PROCEDURE", status: "active", cptCdt: "", externalId: "", billType: "", avoidCasesheetPrint: false, createdBy: "admin", price: 5000, applicableFor: "Both OP & IP", category: "Ayurveda", nameOtherLang: "" },
  { id: "15", code: "TMT_234", sac: "", name: "AGNIKARMA", group: "PROCEDURE", subGroup: "PROCEDURE", accountHead: "PROCEDURE", status: "active", cptCdt: "", externalId: "", billType: "", avoidCasesheetPrint: false, createdBy: "admin", price: 1000, applicableFor: "OP", category: "Ayurveda", nameOtherLang: "" },
  // Inactive treatments
  { id: "100", code: "TMT_100", sac: "", name: "DHANYAMILA DHARA WHOLE BODY", group: "PANCHAKARMA", subGroup: "DHARA", accountHead: "PANCHAKARMA", status: "inactive", cptCdt: "", externalId: "", billType: "", avoidCasesheetPrint: false, createdBy: "", price: 2500, applicableFor: "Both OP & IP", category: "Ayurveda", nameOtherLang: "" },
  { id: "101", code: "TMT_101", sac: "", name: "DHANYAMILA DHARA SPECIFIC AREA - KNEE OR ANKLE OR LOWER BACK OR", group: "PANCHAKARMA", subGroup: "DHARA", accountHead: "PANCHAKARMA", status: "inactive", cptCdt: "", externalId: "", billType: "", avoidCasesheetPrint: false, createdBy: "", price: 1500, applicableFor: "Both OP & IP", category: "Ayurveda", nameOtherLang: "" },
  { id: "102", code: "TMT_102", sac: "", name: "ELAKIZHI ONE PART", group: "PANCHAKARMA", subGroup: "", accountHead: "", status: "inactive", cptCdt: "", externalId: "", billType: "", avoidCasesheetPrint: false, createdBy: "", price: 1200, applicableFor: "Both OP & IP", category: "Ayurveda", nameOtherLang: "" },
  { id: "103", code: "TMT_103", sac: "", name: "ELAKIZHI WHOLE BODY", group: "PANCHAKARMA", subGroup: "", accountHead: "", status: "inactive", cptCdt: "", externalId: "", billType: "", avoidCasesheetPrint: false, createdBy: "", price: 2000, applicableFor: "Both OP & IP", category: "Ayurveda", nameOtherLang: "" },
  { id: "104", code: "TMT_104", sac: "", name: "EXERCISE", group: "SPA", subGroup: "", accountHead: "", status: "inactive", cptCdt: "", externalId: "", billType: "", avoidCasesheetPrint: false, createdBy: "", price: 500, applicableFor: "OP", category: "Yoga & Naturopathy", nameOtherLang: "" },
  { id: "105", code: "TMT_105", sac: "", name: "FACE MASSAGE", group: "PANCHAKARMA", subGroup: "", accountHead: "", status: "inactive", cptCdt: "", externalId: "", billType: "", avoidCasesheetPrint: false, createdBy: "", price: 800, applicableFor: "OP", category: "Ayurveda", nameOtherLang: "" },
  { id: "106", code: "TMT_106", sac: "", name: "GREEVA VASTHI", group: "PANCHAKARMA", subGroup: "", accountHead: "", status: "inactive", cptCdt: "", externalId: "", billType: "", avoidCasesheetPrint: false, createdBy: "", price: 900, applicableFor: "Both OP & IP", category: "Ayurveda", nameOtherLang: "" },
  { id: "107", code: "TMT_107", sac: "", name: "GODHUMA PINDA SWEDANA", group: "PANCHAKARMA", subGroup: "", accountHead: "", status: "inactive", cptCdt: "", externalId: "", billType: "", avoidCasesheetPrint: false, createdBy: "", price: 1800, applicableFor: "Both OP & IP", category: "Ayurveda", nameOtherLang: "" },
];

const TreatmentMaster = () => {
  const [tab, setTab] = useState("new");
  const [search, setSearch] = useState("");
  const [treatments] = useState<Treatment[]>(mockTreatments);
  // Form state
  const [formName, setFormName] = useState("");
  const [formNameOther, setFormNameOther] = useState("");
  const [formGroup, setFormGroup] = useState("");
  const [formSubGroup, setFormSubGroup] = useState("");
  const [formApplicableFor, setFormApplicableFor] = useState("");
  const [formSac, setFormSac] = useState("");
  const [formCptCdt, setFormCptCdt] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formExternalId, setFormExternalId] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formAvoidPrint, setFormAvoidPrint] = useState(false);

  const activeTreatments = treatments.filter(t => t.status === "active");
  const inactiveTreatments = treatments.filter(t => t.status === "inactive");

  const filteredActive = activeTreatments.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.code.toLowerCase().includes(search.toLowerCase()) ||
    t.group.toLowerCase().includes(search.toLowerCase())
  );
  const filteredInactive = inactiveTreatments.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.code.toLowerCase().includes(search.toLowerCase()) ||
    t.group.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!formName.trim()) return toast.error("Treatment name is required");
    if (!formPrice) return toast.error("Price is required");
    toast.success("Treatment/Service added successfully!");
    setFormName(""); setFormNameOther(""); setFormGroup(""); setFormSubGroup("");
    setFormApplicableFor(""); setFormSac(""); setFormCptCdt(""); setFormPrice("");
    setFormExternalId(""); setFormCategory(""); setFormAvoidPrint(false);
  };

  const renderTable = (data: Treatment[], type: "active" | "inactive") => (
    <Card>
      <CardHeader className={`pb-2 border-b ${type === "inactive" ? "bg-red-50/50" : ""}`}>
        <div className="flex items-center justify-between">
          <CardTitle className={`text-base text-center flex-1 ${type === "inactive" ? "text-red-600" : "text-primary"}`}>
            {type === "active" ? "Manage Treatment/Service" : "Manage Inactive Treatment/Service"}
          </CardTitle>
          <Button size="sm" variant="outline" onClick={() => toast.success("Exported as CSV")}>
            <Download className="h-3.5 w-3.5 mr-1" /> Export As CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2 text-sm">Show <select className="border rounded px-2 py-1 text-xs"><option>100</option><option>50</option><option>25</option></select> entries</div>
          <div className="relative w-64"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9 h-8" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-orange-600">Code</th>
                <th className="px-3 py-2 text-left font-medium text-orange-600">SAC</th>
                <th className="px-3 py-2 text-left font-medium text-orange-600">Name</th>
                <th className="px-3 py-2 text-left font-medium text-orange-600">Group</th>
                <th className="px-3 py-2 text-left font-medium text-orange-600">Sub Group</th>
                <th className="px-3 py-2 text-left font-medium text-orange-600">Account Head</th>
                <th className="px-3 py-2 text-left font-medium text-orange-600">Status</th>
                <th className="px-3 py-2 text-left font-medium text-orange-600">CPT/CDT</th>
                <th className="px-3 py-2 text-left font-medium text-orange-600">External TreatmentId</th>
                <th className="px-3 py-2 text-left font-medium text-orange-600">Bill Type</th>
                <th className="px-3 py-2 text-left font-medium text-orange-600">Avoid in Casesheet Print</th>
                <th className="px-3 py-2 text-left font-medium text-orange-600">Created by</th>
                <th className="px-3 py-2 text-left font-medium text-orange-600"></th>
              </tr>
            </thead>
            <tbody>
              {data.map(t => (
                <tr key={t.id} className="border-b hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-xs">{t.code}</td>
                  <td className="px-3 py-2 text-xs"><Pencil className="h-3 w-3 inline text-orange-500" /></td>
                  <td className="px-3 py-2"><span className="text-primary font-medium text-xs">{t.name}</span><br/><Pencil className="h-3 w-3 inline text-orange-500" /></td>
                  <td className="px-3 py-2 text-xs">{t.group}<Pencil className="h-3 w-3 inline ml-1 text-orange-500" /></td>
                  <td className="px-3 py-2 text-xs">{t.subGroup}<Pencil className="h-3 w-3 inline ml-1 text-orange-500" /></td>
                  <td className="px-3 py-2 text-xs">{t.accountHead}</td>
                  <td className="px-3 py-2"><Badge className={type === "active" ? "bg-emerald-100 text-emerald-700 text-[10px]" : "bg-orange-100 text-orange-700 text-[10px]"}>{t.status}<Pencil className="h-2.5 w-2.5 inline ml-1" /></Badge></td>
                  <td className="px-3 py-2"><Pencil className="h-3 w-3 text-orange-500" /></td>
                  <td className="px-3 py-2"><Pencil className="h-3 w-3 text-orange-500" /></td>
                  <td className="px-3 py-2"><Pencil className="h-3 w-3 text-orange-500" /></td>
                  <td className="px-3 py-2 text-xs">{t.avoidCasesheetPrint ? "true" : "false"}<Pencil className="h-3 w-3 inline ml-1 text-orange-500" /></td>
                  <td className="px-3 py-2 text-xs">{t.createdBy}</td>
                  <td className="px-3 py-2"><Badge className="bg-emerald-500 text-white text-xs cursor-pointer">✓</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 text-xs text-muted-foreground border-t">
          Showing 1 to {data.length} of {data.length} entries
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Stethoscope className="h-6 w-6 text-green-600" /> Treatment Master</h1>
          <p className="text-sm text-muted-foreground">Configure predefined treatment plans, procedures & services for EMR and billing</p>
        </div>
        <Badge variant="secondary">Total: {treatments.length} treatments ({activeTreatments.length} active, {inactiveTreatments.length} inactive)</Badge>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="new" className="text-emerald-600 font-semibold">New</TabsTrigger>
          <TabsTrigger value="manage" className="text-orange-600 font-semibold">Manage Treatment/Service</TabsTrigger>
          <TabsTrigger value="inactive" className="text-red-600 font-semibold">Manage Inactive Treatment/Service</TabsTrigger>
        </TabsList>

        {/* NEW TREATMENT FORM */}
        <TabsContent value="new">
          <Card>
            <CardHeader className="pb-2 border-b bg-primary/5">
              <CardTitle className="text-base text-center text-primary">Treatment/Service</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div><Label>Name <span className="text-red-500">*</span></Label><Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Treatment/Service" /></div>
                <div><Label>Name (Other Languages)</Label><Input value={formNameOther} onChange={e => setFormNameOther(e.target.value)} placeholder="Treatment/Service" /></div>
                <div><Label>Group Name</Label><Select value={formGroup} onValueChange={setFormGroup}><SelectTrigger><SelectValue placeholder="Type Group Name" /></SelectTrigger><SelectContent>{GROUPS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Sub Group Name</Label><Select value={formSubGroup} onValueChange={setFormSubGroup}><SelectTrigger><SelectValue placeholder="Type Sub Group Name" /></SelectTrigger><SelectContent>{SUB_GROUPS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div><Label>Treatment Applicable For</Label><Select value={formApplicableFor} onValueChange={setFormApplicableFor}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{APPLICABLE_FOR.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>SAC</Label><Input value={formSac} onChange={e => setFormSac(e.target.value)} placeholder="SAC" /></div>
                <div><Label>CPT/CDT Code</Label><Input value={formCptCdt} onChange={e => setFormCptCdt(e.target.value)} placeholder="CPT/CDT Code" /></div>
                <div><Label>Price <span className="text-red-500">*</span></Label><Input value={formPrice} onChange={e => setFormPrice(e.target.value)} placeholder="Price" type="number" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div><Label>External ID</Label><Input value={formExternalId} onChange={e => setFormExternalId(e.target.value)} placeholder="External TreatmentID" /></div>
                <div><Label>Category</Label><Select value={formCategory} onValueChange={setFormCategory}><SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger><SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                <div className="flex items-center gap-3 pt-6"><Checkbox checked={formAvoidPrint} onCheckedChange={c => setFormAvoidPrint(!!c)} /><Label>Avoid in casesheet print</Label></div>
              </div>
              <div className="flex justify-center pt-4">
                <Button onClick={handleAdd} className="bg-purple-700 hover:bg-purple-800 px-8">Add</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MANAGE ACTIVE TREATMENTS */}
        <TabsContent value="manage">{renderTable(filteredActive, "active")}</TabsContent>

        {/* MANAGE INACTIVE TREATMENTS */}
        <TabsContent value="inactive">{renderTable(filteredInactive, "inactive")}</TabsContent>
      </Tabs>
    </div>
  );
};

export default TreatmentMaster;
