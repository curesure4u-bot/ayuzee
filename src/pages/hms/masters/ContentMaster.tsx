import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil, Plus, Search, X, FileText } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type ContentItem = {
  id: string;
  type: string;
  field: string;
  value: string;
  system: string;
  status: "active" | "inactive";
  createdBy: string;
  createdDate: string;
};

// ─── Content Type & Field Definitions ────────────────────────────────────────
const CONTENT_TYPES = [
  "Discharge Summary",
  "Prescription",
  "Chief Complaints",
  "Diagnosis",
  "Examination",
  "Advice / Pathya",
  "Diet Plan",
  "Treatment Notes",
  "Follow-up Notes",
  "Consent Form",
  "Operative Notes",
  "Panchakarma Notes",
  "Yoga Prescription",
  "Investigation Remarks",
  "History Taking",
];

const FIELDS_BY_TYPE: Record<string, string[]> = {
  "Discharge Summary": ["Diagnosis at Discharge", "Treatment Given", "Condition at Discharge", "Advice on Discharge", "Follow-up Plan", "Diet Instruction", "Medication at Discharge", "Activity Restriction"],
  "Prescription": ["Medication", "Dosage Instruction", "Duration", "Special Instruction", "Anupana (Vehicle)", "Pathya (Do's)", "Apathya (Don'ts)"],
  "Chief Complaints": ["Musculoskeletal", "Gastrointestinal", "Neurological", "Respiratory", "Skin / Twak", "Metabolic", "Urogenital", "Psychological", "ENT", "Eye / Netra", "General / Systemic"],
  "Diagnosis": ["Ayurveda Diagnosis", "Siddha Diagnosis", "Homeopathy Diagnosis", "ICD-10 Code", "Dosha Involvement", "Dushya Involvement", "Srotas Involved"],
  "Examination": ["Nadi (Pulse)", "Jihva (Tongue)", "Mutra (Urine)", "Mala (Stool)", "Shabda (Sound)", "Sparsha (Touch)", "Druk (Eyes)", "Akruti (Body Build)", "Neikuri (Oil Test)", "Naadi (Siddha)"],
  "Advice / Pathya": ["Diet Advice", "Lifestyle Advice", "Exercise / Yoga", "Do's (Pathya)", "Don'ts (Apathya)", "Seasonal Advice (Ritucharya)", "Daily Routine (Dinacharya)"],
  "Diet Plan": ["Morning Routine", "Breakfast", "Mid-morning", "Lunch", "Evening Snack", "Dinner", "Bedtime", "Fluids / Drinks", "Supplements", "Foods to Avoid"],
  "Treatment Notes": ["Procedure Done", "Duration", "Medicine Used", "Patient Response", "Observations", "Complications (if any)", "Next Session Plan"],
  "Follow-up Notes": ["Current Status", "Improvement Noted", "Complaints Persisting", "Medication Change", "Investigation Advised", "Next Follow-up"],
  "Consent Form": ["Procedure Consent", "Anesthesia Consent", "Panchakarma Consent", "Surgery Consent", "Investigation Consent", "Blood Transfusion Consent"],
  "Operative Notes": ["Pre-operative Diagnosis", "Post-operative Diagnosis", "Procedure Performed", "Findings", "Surgeon Notes", "Post-op Instructions"],
  "Panchakarma Notes": ["Poorvakarma (Pre-procedure)", "Pradhanakarma (Main procedure)", "Paschatkarma (Post-procedure)", "Snehana Details", "Swedana Details", "Vamana Notes", "Virechana Notes", "Vasti Notes", "Nasya Notes", "Raktamokshana Notes"],
  "Yoga Prescription": ["Asana", "Pranayama", "Meditation", "Bandha / Mudra", "Shatkarma", "Lifestyle Modification", "Duration / Frequency"],
  "Investigation Remarks": ["Lab Normal Template", "Abnormal Finding", "Critical Value Alert", "Interpretation Note", "Recommendation"],
  "History Taking": ["Present Illness", "Past History", "Family History", "Personal History", "Menstrual History", "Obstetric History", "Surgical History", "Drug History", "Allergy History", "Social History"],
};

// ─── Mock Data ───────────────────────────────────────────────────────────────
const mockActiveContent: ContentItem[] = [
  // Discharge Summary
  { id: "1", type: "Discharge Summary", field: "Diagnosis at Discharge", value: "Sandhigata Vata (Osteoarthritis of Knee) - Improved with Panchakarma", system: "Ayurveda", status: "active", createdBy: "Dr Mohamad Saleem", createdDate: "10/01/2025" },
  { id: "2", type: "Discharge Summary", field: "Condition at Discharge", value: "Patient is symptomatically better. Pain reduced from 8/10 to 3/10. ROM improved.", system: "Ayurveda", status: "active", createdBy: "Dr Mohamad Saleem", createdDate: "10/01/2025" },
  { id: "3", type: "Discharge Summary", field: "Advice on Discharge", value: "Continue medicines for 1 month. Avoid cold foods. Do knee exercises daily. Review after 15 days.", system: "Ayurveda", status: "active", createdBy: "Dr Mohamad Saleem", createdDate: "10/01/2025" },
  // Chief Complaints
  { id: "4", type: "Chief Complaints", field: "Musculoskeletal", value: "Joint pain - bilateral knee, worse in morning and cold weather", system: "Ayurveda", status: "active", createdBy: "Al Shifa Hospital", createdDate: "05/01/2025" },
  { id: "5", type: "Chief Complaints", field: "Musculoskeletal", value: "Low back pain radiating to left leg since 2 months", system: "Ayurveda", status: "active", createdBy: "Al Shifa Hospital", createdDate: "05/01/2025" },
  { id: "6", type: "Chief Complaints", field: "Gastrointestinal", value: "Indigestion, bloating after food, loss of appetite since 3 weeks", system: "Ayurveda", status: "active", createdBy: "Al Shifa Hospital", createdDate: "06/01/2025" },
  { id: "7", type: "Chief Complaints", field: "Neurological", value: "Headache - throbbing, frontal region, aggravated by sun exposure", system: "Ayurveda", status: "active", createdBy: "Al Shifa Hospital", createdDate: "06/01/2025" },
  { id: "8", type: "Chief Complaints", field: "Skin / Twak", value: "Itchy scaly patches on elbows and knees since 6 months - recurrent", system: "Ayurveda", status: "active", createdBy: "Al Shifa Hospital", createdDate: "07/01/2025" },
  { id: "9", type: "Chief Complaints", field: "Respiratory", value: "Cough with whitish sputum, worse at night and early morning", system: "Siddha", status: "active", createdBy: "Al Shifa Hospital", createdDate: "07/01/2025" },
  { id: "10", type: "Chief Complaints", field: "Metabolic", value: "Excessive thirst, frequent urination, weight loss - known diabetic", system: "Ayurveda", status: "active", createdBy: "Al Shifa Hospital", createdDate: "08/01/2025" },
  // Diagnosis
  { id: "11", type: "Diagnosis", field: "Ayurveda Diagnosis", value: "Sandhigata Vata (M17 - Osteoarthritis of Knee)", system: "Ayurveda", status: "active", createdBy: "Dr Mohamad Saleem", createdDate: "05/01/2025" },
  { id: "12", type: "Diagnosis", field: "Ayurveda Diagnosis", value: "Gridhrasi (M54.3 - Sciatica)", system: "Ayurveda", status: "active", createdBy: "Dr Mohamad Saleem", createdDate: "05/01/2025" },
  { id: "13", type: "Diagnosis", field: "Ayurveda Diagnosis", value: "Amavata (M06.9 - Rheumatoid Arthritis)", system: "Ayurveda", status: "active", createdBy: "Dr Mohamad Saleem", createdDate: "06/01/2025" },
  { id: "14", type: "Diagnosis", field: "Siddha Diagnosis", value: "Vali Azhal Keelu Vaayu (Osteoarthritis)", system: "Siddha", status: "active", createdBy: "Al Shifa Hospital", createdDate: "06/01/2025" },
  { id: "15", type: "Diagnosis", field: "Dosha Involvement", value: "Vata Pradhana - Apana & Vyana Vayu dushti", system: "Ayurveda", status: "active", createdBy: "Dr Mohamad Saleem", createdDate: "07/01/2025" },
  // Examination
  { id: "16", type: "Examination", field: "Nadi (Pulse)", value: "Vata Nadi - Sarpa Gati (snake-like movement), 72/min, irregular", system: "Ayurveda", status: "active", createdBy: "Al Shifa Hospital", createdDate: "05/01/2025" },
  { id: "17", type: "Examination", field: "Jihva (Tongue)", value: "Coated - whitish (Ama lakshana), Dry edges (Vata)", system: "Ayurveda", status: "active", createdBy: "Al Shifa Hospital", createdDate: "05/01/2025" },
  { id: "18", type: "Examination", field: "Neikuri (Oil Test)", value: "Oil spreads like snake (Vata), slowly - indicates chronic condition", system: "Siddha", status: "active", createdBy: "Al Shifa Hospital", createdDate: "06/01/2025" },
  // Advice
  { id: "19", type: "Advice / Pathya", field: "Diet Advice", value: "Avoid cold food and drinks. Take warm water. Include ghee in diet. Avoid curd at night.", system: "Ayurveda", status: "active", createdBy: "Dr Mohamad Saleem", createdDate: "08/01/2025" },
  { id: "20", type: "Advice / Pathya", field: "Lifestyle Advice", value: "Sleep before 10 PM. Avoid day sleep. Apply warm oil before bath. Gentle exercises.", system: "Ayurveda", status: "active", createdBy: "Dr Mohamad Saleem", createdDate: "08/01/2025" },
  { id: "21", type: "Advice / Pathya", field: "Exercise / Yoga", value: "Surya Namaskar (5 rounds), Pawanmuktasana series, Pranayama 15 min daily", system: "Ayurveda", status: "active", createdBy: "Al Shifa Hospital", createdDate: "09/01/2025" },
  // Panchakarma Notes
  { id: "22", type: "Panchakarma Notes", field: "Snehana Details", value: "Sarvanga Abhyanga with Dhanwantharam Thailam, 45 min, medium pressure", system: "Ayurveda", status: "active", createdBy: "ROSANA", createdDate: "10/01/2025" },
  { id: "23", type: "Panchakarma Notes", field: "Swedana Details", value: "Bashpa Sweda (Steam Bath) - 15 min post Abhyanga. Sweating well achieved.", system: "Ayurveda", status: "active", createdBy: "ROSANA", createdDate: "10/01/2025" },
  { id: "24", type: "Panchakarma Notes", field: "Vasti Notes", value: "Kashaya Vasti - Erandamuladi Kashayam 480ml + Honey 120ml + Saindhava 5g. Retained 45 min.", system: "Ayurveda", status: "active", createdBy: "Dr Mohamad Saleem", createdDate: "12/01/2025" },
  // Prescription content
  { id: "25", type: "Prescription", field: "Medication", value: "Yogaraja Guggulu 2 tab BD after food with warm water", system: "Ayurveda", status: "active", createdBy: "Dr Mohamad Saleem", createdDate: "05/01/2025" },
  { id: "26", type: "Prescription", field: "Anupana (Vehicle)", value: "Warm water / Warm milk / Ghee / Honey (as per Dosha)", system: "Ayurveda", status: "active", createdBy: "Al Shifa Hospital", createdDate: "05/01/2025" },
  // Diet Plan
  { id: "27", type: "Diet Plan", field: "Morning Routine", value: "Wake up 5:30 AM. Drink warm water with lemon. Oil pulling (Gandusha) 5 min.", system: "Ayurveda", status: "active", createdBy: "Dr Mohamad Saleem", createdDate: "15/01/2025" },
  { id: "28", type: "Diet Plan", field: "Foods to Avoid", value: "Curd at night, cold drinks, raw salads, fermented food, excess salt, bakery items", system: "Ayurveda", status: "active", createdBy: "Dr Mohamad Saleem", createdDate: "15/01/2025" },
];

const mockInactiveContent: ContentItem[] = [
  { id: "101", type: "Chief Complaints", field: "General / Systemic", value: "Fatigue and body ache since 1 week (old format)", system: "Ayurveda", status: "inactive", createdBy: "admin", createdDate: "01/12/2024" },
  { id: "102", type: "Diagnosis", field: "Ayurveda Diagnosis", value: "Jwara (R50.9 - Fever) - deprecated entry", system: "Ayurveda", status: "inactive", createdBy: "admin", createdDate: "01/12/2024" },
  { id: "103", type: "Examination", field: "Sparsha (Touch)", value: "Skin warm to touch - duplicate entry", system: "Ayurveda", status: "inactive", createdBy: "admin", createdDate: "15/11/2024" },
  { id: "104", type: "Advice / Pathya", field: "Don'ts (Apathya)", value: "Avoid non-veg - outdated generic advice", system: "Ayurveda", status: "inactive", createdBy: "admin", createdDate: "10/11/2024" },
  { id: "105", type: "Prescription", field: "Medication", value: "Triphala Churna 1 tsp HS - old format", system: "Ayurveda", status: "inactive", createdBy: "admin", createdDate: "05/11/2024" },
];

// ─── Component ───────────────────────────────────────────────────────────────
const ContentMaster = () => {
  // Master setting sidebar
  const [section] = useState<"manage-content">("manage-content");

  // Tabs: "new" or "inactive"
  const [tab, setTab] = useState<"new" | "inactive">("new");

  // New content form
  const [formType, setFormType] = useState("");
  const [formField, setFormField] = useState("");
  const [formValue, setFormValue] = useState("");
  const [formSystem, setFormSystem] = useState("Ayurveda");

  // Content state
  const [activeContent, setActiveContent] = useState<ContentItem[]>(mockActiveContent);
  const [inactiveContent, setInactiveContent] = useState<ContentItem[]>(mockInactiveContent);

  // Search & filters
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterField, setFilterField] = useState("all");

  // Available fields based on selected type
  const availableFields = formType ? (FIELDS_BY_TYPE[formType] || []) : [];

  // Content loaded after "Go"
  const [contentLoaded, setContentLoaded] = useState(false);
  const [loadedType, setLoadedType] = useState("");
  const [loadedField, setLoadedField] = useState("");

  const handleGo = () => {
    if (!formType) return toast.error("Please select a Type");
    setContentLoaded(true);
    setLoadedType(formType);
    setLoadedField(formField);
    setFilterType(formType);
    setFilterField(formField || "all");
  };

  const handleAddContent = () => {
    if (!formValue.trim()) return toast.error("Content value is required");
    if (!formType) return toast.error("Please select a Type");
    const newItem: ContentItem = {
      id: Date.now().toString(),
      type: formType,
      field: formField || availableFields[0] || "General",
      value: formValue.trim(),
      system: formSystem,
      status: "active",
      createdBy: "Current User",
      createdDate: new Date().toLocaleDateString("en-GB"),
    };
    setActiveContent([newItem, ...activeContent]);
    toast.success("Content added successfully!");
    setFormValue("");
  };

  const handleDeactivate = (id: string) => {
    const item = activeContent.find(c => c.id === id);
    if (!item) return;
    setActiveContent(activeContent.filter(c => c.id !== id));
    setInactiveContent([{ ...item, status: "inactive" }, ...inactiveContent]);
    toast.success("Content deactivated");
  };

  const handleReactivate = (id: string) => {
    const item = inactiveContent.find(c => c.id === id);
    if (!item) return;
    setInactiveContent(inactiveContent.filter(c => c.id !== id));
    setActiveContent([{ ...item, status: "active" }, ...activeContent]);
    toast.success("Content reactivated");
  };

  // Filtered content
  const getFilteredActive = () => {
    let data = activeContent;
    if (filterType !== "all") data = data.filter(c => c.type === filterType);
    if (filterField !== "all") data = data.filter(c => c.field === filterField);
    if (search) data = data.filter(c =>
      c.value.toLowerCase().includes(search.toLowerCase()) ||
      c.field.toLowerCase().includes(search.toLowerCase()) ||
      c.type.toLowerCase().includes(search.toLowerCase())
    );
    return data;
  };

  const getFilteredInactive = () => {
    let data = inactiveContent;
    if (search) data = data.filter(c =>
      c.value.toLowerCase().includes(search.toLowerCase()) ||
      c.field.toLowerCase().includes(search.toLowerCase()) ||
      c.type.toLowerCase().includes(search.toLowerCase())
    );
    return data;
  };

  // ─── Render New Tab ────────────────────────────────────────────────────────
  const renderNewTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2 border-b bg-primary/5">
          <CardTitle className="text-base text-center text-primary">Content Master</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Type & Field Selection */}
          <div className="flex items-end gap-4 flex-wrap">
            <div className="min-w-[250px]">
              <Label className="font-semibold">Type :</Label>
              <Select value={formType} onValueChange={(v) => { setFormType(v); setFormField(""); setContentLoaded(false); }}>
                <SelectTrigger className="mt-1 border-primary/50">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[250px]">
              <Label className="font-semibold">Field :</Label>
              <Select value={formField} onValueChange={setFormField} disabled={!formType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={formType ? "Select Field" : "Select Type first"} />
                </SelectTrigger>
                <SelectContent>
                  {availableFields.map(f => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGo} className="bg-orange-500 hover:bg-orange-600 text-white">
              Go
            </Button>
          </div>

          {/* Content Entry Area (shows after Go) */}
          {contentLoaded && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm">
                <Badge className="bg-primary/10 text-primary">{loadedType}</Badge>
                {loadedField && <Badge variant="outline">{loadedField}</Badge>}
              </div>

              {/* Add new content */}
              <div className="space-y-3 bg-muted/30 rounded-lg p-4 border">
                <Label className="font-semibold text-sm">Add New Content</Label>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                  <div className="lg:col-span-2">
                    <Textarea
                      value={formValue}
                      onChange={e => setFormValue(e.target.value)}
                      placeholder="Enter predefined content text..."
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">System</Label>
                    <Select value={formSystem} onValueChange={setFormSystem}>
                      <SelectTrigger className="mt-1 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ayurveda">Ayurveda</SelectItem>
                        <SelectItem value="Siddha">Siddha</SelectItem>
                        <SelectItem value="Homeopathy">Homeopathy</SelectItem>
                        <SelectItem value="Unani">Unani</SelectItem>
                        <SelectItem value="Yoga">Yoga & Naturopathy</SelectItem>
                        <SelectItem value="Modern">Modern Medicine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddContent} className="bg-teal-600 hover:bg-teal-700 text-white w-full">
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add
                    </Button>
                  </div>
                </div>
              </div>

              {/* Content Table */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  Show <select className="border rounded px-2 py-1 text-xs"><option>100</option><option>50</option><option>25</option></select> entries
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
                      <th className="px-3 py-2 text-left font-semibold text-orange-600 w-8">#</th>
                      <th className="px-3 py-2 text-left font-semibold text-orange-600">Type</th>
                      <th className="px-3 py-2 text-left font-semibold text-orange-600">Field</th>
                      <th className="px-3 py-2 text-left font-semibold text-orange-600">Content</th>
                      <th className="px-3 py-2 text-left font-semibold text-orange-600">System</th>
                      <th className="px-3 py-2 text-left font-semibold text-orange-600">Created By</th>
                      <th className="px-3 py-2 text-left font-semibold text-orange-600">Status</th>
                      <th className="px-3 py-2 text-left font-semibold text-orange-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredActive().length === 0 ? (
                      <tr><td colSpan={8} className="px-3 py-4 text-center text-muted-foreground">No content available for this selection</td></tr>
                    ) : (
                      getFilteredActive().map((item, i) => (
                        <tr key={item.id} className="border-b hover:bg-muted/30">
                          <td className="px-3 py-2 text-xs">{i + 1}</td>
                          <td className="px-3 py-2 text-xs">{item.type}</td>
                          <td className="px-3 py-2 text-xs font-medium">{item.field}</td>
                          <td className="px-3 py-2 text-xs max-w-xs">
                            <span className="line-clamp-2">{item.value}</span>
                            <Pencil className="h-3 w-3 inline text-orange-500 ml-1 cursor-pointer" />
                          </td>
                          <td className="px-3 py-2">
                            <Badge variant="outline" className="text-[10px]">{item.system}</Badge>
                          </td>
                          <td className="px-3 py-2 text-xs">{item.createdBy}</td>
                          <td className="px-3 py-2">
                            <span className="text-emerald-600 text-xs">active</span>
                            <Pencil className="h-2.5 w-2.5 inline text-orange-500 ml-1 cursor-pointer" />
                          </td>
                          <td className="px-3 py-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              onClick={() => handleDeactivate(item.id)}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Showing 1 to {getFilteredActive().length} of {getFilteredActive().length} entries</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="h-6 text-xs" disabled>Previous</Button>
                  <Badge variant="outline" className="text-xs">1</Badge>
                  <Button size="sm" variant="outline" className="h-6 text-xs" disabled>Next</Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // ─── Render Inactive Tab ───────────────────────────────────────────────────
  const renderInactiveTab = () => (
    <Card>
      <CardHeader className="pb-2 border-b bg-red-50/50">
        <CardTitle className="text-base text-center text-red-600">Manage Inactive Content</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <p className="text-xs text-orange-600 italic">
          Note: Inactive content will not appear in EMR dropdowns. You can reactivate content from here.
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            Show <select className="border rounded px-2 py-1 text-xs"><option>100</option><option>50</option><option>25</option></select> entries
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
                <th className="px-3 py-2 text-left font-semibold text-orange-600 w-8">#</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Type</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Field</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Content</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">System</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Created</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredInactive().length === 0 ? (
                <tr><td colSpan={7} className="px-3 py-4 text-center text-muted-foreground">No inactive content</td></tr>
              ) : (
                getFilteredInactive().map((item, i) => (
                  <tr key={item.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 text-xs">{i + 1}</td>
                    <td className="px-3 py-2 text-xs">{item.type}</td>
                    <td className="px-3 py-2 text-xs font-medium">{item.field}</td>
                    <td className="px-3 py-2 text-xs max-w-xs">
                      <span className="line-clamp-2">{item.value}</span>
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className="text-[10px]">{item.system}</Badge>
                    </td>
                    <td className="px-3 py-2 text-xs">{item.createdDate}</td>
                    <td className="px-3 py-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 text-xs text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                        onClick={() => handleReactivate(item.id)}
                      >
                        Reactivate
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing 1 to {getFilteredInactive().length} of {getFilteredInactive().length} entries</span>
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
            <FileText className="h-6 w-6 text-violet-600" /> Content Master
          </h1>
          <p className="text-sm text-muted-foreground">
            Add predefined complaints, diagnoses, and examination content used in EMR.
          </p>
        </div>
        <Badge variant="secondary">
          Active: {activeContent.length} | Types: {CONTENT_TYPES.length}
        </Badge>
      </div>

      {/* Master Setting Layout: Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
        {/* Sidebar */}
        <div>
          <Card className="p-0">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm font-semibold">Content Master</CardTitle>
            </CardHeader>
            <CardContent className="p-1 space-y-0.5">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs h-8 bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200"
              >
                <span className="mr-2">📄</span> Manage Content
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-3 p-3">
            <p className="text-xs font-semibold mb-2">Content Summary</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discharge Summary</span>
                <Badge variant="secondary" className="text-[10px] h-4">{activeContent.filter(c => c.type === "Discharge Summary").length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Chief Complaints</span>
                <Badge variant="secondary" className="text-[10px] h-4">{activeContent.filter(c => c.type === "Chief Complaints").length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Diagnosis</span>
                <Badge variant="secondary" className="text-[10px] h-4">{activeContent.filter(c => c.type === "Diagnosis").length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Examination</span>
                <Badge variant="secondary" className="text-[10px] h-4">{activeContent.filter(c => c.type === "Examination").length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Advice / Pathya</span>
                <Badge variant="secondary" className="text-[10px] h-4">{activeContent.filter(c => c.type === "Advice / Pathya").length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Panchakarma Notes</span>
                <Badge variant="secondary" className="text-[10px] h-4">{activeContent.filter(c => c.type === "Panchakarma Notes").length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prescription</span>
                <Badge variant="secondary" className="text-[10px] h-4">{activeContent.filter(c => c.type === "Prescription").length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Diet Plan</span>
                <Badge variant="secondary" className="text-[10px] h-4">{activeContent.filter(c => c.type === "Diet Plan").length}</Badge>
              </div>
              <div className="flex justify-between pt-1 border-t mt-1">
                <span className="font-medium">Inactive</span>
                <Badge variant="outline" className="text-[10px] h-4 text-red-600">{inactiveContent.length}</Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Content Area */}
        <div className="space-y-4">
          {/* Sub-tabs: New | Manage Inactive */}
          <div className="flex gap-2 border-b pb-0">
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-b-none text-xs ${tab === "new" ? "text-teal-700 border-b-2 border-teal-600 font-semibold" : "text-muted-foreground"}`}
              onClick={() => setTab("new")}
            >
              New
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-b-none text-xs ${tab === "inactive" ? "text-red-600 border-b-2 border-red-500 font-semibold" : "text-muted-foreground"}`}
              onClick={() => setTab("inactive")}
            >
              Manage Inactive
            </Button>
          </div>

          {tab === "new" && renderNewTab()}
          {tab === "inactive" && renderInactiveTab()}
        </div>
      </div>
    </div>
  );
};

export default ContentMaster;
