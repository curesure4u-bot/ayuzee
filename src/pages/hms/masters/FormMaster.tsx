import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil, Plus, Search, FileText, X, Sparkles, GripVertical, Trash2, Copy, Settings, Eye, Columns, Square, LayoutGrid } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type FormField = {
  id: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: string;
  aiAssist?: boolean;
};

type FormItem = {
  id: string;
  name: string;
  type: string;
  category: string;
  description: string;
  fields: FormField[];
  status: "active" | "inactive";
  createdBy: string;
  createdDate: string;
  lastModified: string;
  aiEnabled: boolean;
  gridLayout: "1" | "2" | "3";
};

// ─── Constants ───────────────────────────────────────────────────────────────
const FORM_TYPES = [
  "Questionnaire",
  "Chart",
  "Consent",
  "Intake",
  "Assessment",
  "Feedback",
  "Referral",
  "Checklist",
  "Screening",
  "Registration",
  "Custom",
];

const FORM_CATEGORIES = [
  "General",
  "Food",
  "Clinical",
  "Ayurveda",
  "Siddha",
  "Homeopathy",
  "Panchakarma",
  "Yoga",
  "Patient",
  "Insurance",
  "Administrative",
  "OT / Surgery",
  "Nursing",
  "Lab",
  "Pharmacy",
];

const FIELD_TYPES = [
  { id: "text", label: "Text input", icon: "Aa", group: "INPUT FIELDS" },
  { id: "textarea", label: "Text area", icon: "¶", group: "INPUT FIELDS" },
  { id: "number", label: "Number", icon: "#", group: "INPUT FIELDS" },
  { id: "email", label: "Email", icon: "@", group: "INPUT FIELDS" },
  { id: "phone", label: "Phone", icon: "📞", group: "INPUT FIELDS" },
  { id: "date", label: "Date", icon: "📅", group: "INPUT FIELDS" },
  { id: "time", label: "Time", icon: "🕐", group: "INPUT FIELDS" },
  { id: "rating", label: "Rating", icon: "⭐", group: "INPUT FIELDS" },
  { id: "file", label: "File Upload", icon: "📎", group: "INPUT FIELDS" },
  { id: "signature", label: "Signature", icon: "✍️", group: "INPUT FIELDS" },
  { id: "dropdown", label: "Dropdown", icon: "▾", group: "SELECTION" },
  { id: "radio", label: "Radio group", icon: "◉", group: "SELECTION" },
  { id: "checkbox", label: "Checkbox", icon: "☐", group: "SELECTION" },
  { id: "multi-select", label: "Multi Select", icon: "☑", group: "SELECTION" },
  { id: "yes-no", label: "Yes / No", icon: "✓✗", group: "SELECTION" },
  { id: "scale", label: "Scale (1-10)", icon: "📊", group: "SELECTION" },
  { id: "heading", label: "Heading", icon: "H", group: "LAYOUT" },
  { id: "paragraph", label: "Paragraph", icon: "P", group: "LAYOUT" },
  { id: "divider", label: "Divider", icon: "—", group: "LAYOUT" },
  { id: "section", label: "Section Break", icon: "§", group: "LAYOUT" },
  { id: "vitals", label: "Vitals Block", icon: "💓", group: "AI / CLINICAL" },
  { id: "dosha-select", label: "Dosha Selector", icon: "🔥", group: "AI / CLINICAL" },
  { id: "body-map", label: "Body Pain Map", icon: "🧍", group: "AI / CLINICAL" },
  { id: "medicine-search", label: "Medicine Search", icon: "💊", group: "AI / CLINICAL" },
  { id: "diagnosis-search", label: "Diagnosis Search", icon: "🩺", group: "AI / CLINICAL" },
  { id: "ai-summary", label: "AI Auto-Summary", icon: "🤖", group: "AI / CLINICAL" },
];

const AI_FORM_TEMPLATES = [
  { id: "consent-pk", label: "Panchakarma Consent Form", description: "Auto-generates consent with procedure risks, patient info, signatures" },
  { id: "prakruti", label: "Prakruti Assessment", description: "30-question Dosha assessment with auto-scoring" },
  { id: "feedback", label: "Patient Feedback", description: "Post-treatment satisfaction survey with ratings" },
  { id: "intake-ayur", label: "Ayurveda Intake Form", description: "Complete case taking - complaints, history, Ashtavidha Pareeksha" },
  { id: "diet-chart", label: "Diet Preference Chart", description: "Food preferences, allergies, meal timing for diet planning" },
  { id: "pain-assess", label: "Pain Assessment", description: "VAS scale, body map, aggravating/relieving factors" },
  { id: "ip-checklist", label: "IP Admission Checklist", description: "Pre-admission tests, consent, insurance, room allocation" },
  { id: "discharge-ck", label: "Discharge Checklist", description: "Medication review, follow-up, diet advice, emergency signs" },
];

// ─── Mock Data ───────────────────────────────────────────────────────────────
const mockActiveForms: FormItem[] = [
  {
    id: "1", name: "PATIENT FEEDBACK", type: "Questionnaire", category: "General",
    description: "Post-treatment patient satisfaction feedback form",
    fields: [
      { id: "f1", type: "rating", label: "Overall Experience", required: true },
      { id: "f2", type: "rating", label: "Doctor Communication", required: true },
      { id: "f3", type: "rating", label: "Staff Behaviour", required: true },
      { id: "f4", type: "dropdown", label: "Would you recommend us?", required: true, options: ["Definitely Yes", "Probably Yes", "Not Sure", "No"] },
      { id: "f5", type: "textarea", label: "Suggestions for improvement", required: false },
    ],
    status: "active", createdBy: "Al Shifa Ayush Hospital", createdDate: "10/01/2025", lastModified: "15/03/2025", aiEnabled: false, gridLayout: "1"
  },
  {
    id: "2", name: "Prakruti Assessment Form", type: "Assessment", category: "Ayurveda",
    description: "AI-powered 30-question Dosha assessment with auto-scoring",
    fields: [
      { id: "f1", type: "dosha-select", label: "Body Frame", required: true, options: ["Thin/Light (Vata)", "Medium/Athletic (Pitta)", "Heavy/Solid (Kapha)"], aiAssist: true },
      { id: "f2", type: "dosha-select", label: "Skin Type", required: true, options: ["Dry/Rough (Vata)", "Warm/Oily (Pitta)", "Cool/Moist (Kapha)"], aiAssist: true },
      { id: "f3", type: "dosha-select", label: "Appetite", required: true, options: ["Variable (Vata)", "Strong/Sharp (Pitta)", "Steady/Slow (Kapha)"], aiAssist: true },
      { id: "f4", type: "dosha-select", label: "Sleep Pattern", required: true, options: ["Light/Disturbed (Vata)", "Moderate (Pitta)", "Deep/Heavy (Kapha)"], aiAssist: true },
      { id: "f5", type: "ai-summary", label: "AI Dosha Analysis", required: false, aiAssist: true },
    ],
    status: "active", createdBy: "Dr Mohamad Saleem", createdDate: "15/01/2025", lastModified: "20/05/2025", aiEnabled: true, gridLayout: "1"
  },
  {
    id: "3", name: "Panchakarma Consent", type: "Consent", category: "Panchakarma",
    description: "Digital consent form for Panchakarma procedures with e-signature",
    fields: [
      { id: "f1", type: "heading", label: "Consent for Panchakarma Treatment", required: false },
      { id: "f2", type: "paragraph", label: "I understand that Panchakarma involves Vamana, Virechana, Vasti, Nasya, Raktamokshana procedures...", required: false },
      { id: "f3", type: "checkbox", label: "I have been explained the procedure, benefits, and risks", required: true },
      { id: "f4", type: "checkbox", label: "I consent to the prescribed Panchakarma procedures", required: true },
      { id: "f5", type: "signature", label: "Patient Signature", required: true },
      { id: "f6", type: "date", label: "Date", required: true },
    ],
    status: "active", createdBy: "Al Shifa Ayush Hospital", createdDate: "20/01/2025", lastModified: "20/01/2025", aiEnabled: false, gridLayout: "1"
  },
  {
    id: "4", name: "Ayurveda Intake Form", type: "Intake", category: "Ayurveda",
    description: "Complete initial assessment - complaints, history, Ashtavidha Pareeksha, Dosha",
    fields: [
      { id: "f1", type: "text", label: "Chief Complaint", required: true, aiAssist: true },
      { id: "f2", type: "textarea", label: "History of Present Illness", required: true, aiAssist: true },
      { id: "f3", type: "vitals", label: "Vitals", required: true },
      { id: "f4", type: "dosha-select", label: "Nadi Pareeksha", required: true, options: ["Vata (Snake)", "Pitta (Frog)", "Kapha (Swan)"] },
      { id: "f5", type: "body-map", label: "Pain Location", required: false },
      { id: "f6", type: "ai-summary", label: "AI Clinical Summary", required: false, aiAssist: true },
    ],
    status: "active", createdBy: "Dr Mohamad Saleem", createdDate: "01/02/2025", lastModified: "10/06/2025", aiEnabled: true, gridLayout: "2"
  },
  {
    id: "5", name: "Diet Preference Chart", type: "Chart", category: "Food",
    description: "Patient food preferences, allergies, and timing for personalized diet planning",
    fields: [
      { id: "f1", type: "multi-select", label: "Food Allergies", required: false, options: ["Dairy", "Gluten", "Nuts", "Soy", "Eggs", "Seafood", "None"] },
      { id: "f2", type: "radio", label: "Diet Type", required: true, options: ["Vegetarian", "Non-Vegetarian", "Vegan", "Eggetarian"] },
      { id: "f3", type: "checkbox", label: "Meal Preferences", required: false, options: ["Warm food preferred", "Spicy food OK", "Prefers light meals", "No raw food"] },
      { id: "f4", type: "time", label: "Usual breakfast time", required: false },
      { id: "f5", type: "time", label: "Usual dinner time", required: false },
    ],
    status: "active", createdBy: "Al Shifa Ayush Hospital", createdDate: "05/02/2025", lastModified: "05/02/2025", aiEnabled: false, gridLayout: "2"
  },
  {
    id: "6", name: "Pain Assessment Form", type: "Assessment", category: "Clinical",
    description: "VAS pain scale, body map, aggravating/relieving factors with AI analysis",
    fields: [
      { id: "f1", type: "scale", label: "Pain Intensity (0-10)", required: true },
      { id: "f2", type: "body-map", label: "Mark pain locations", required: true },
      { id: "f3", type: "radio", label: "Pain Type", required: true, options: ["Sharp", "Dull/Aching", "Burning", "Throbbing", "Shooting", "Stiffness"] },
      { id: "f4", type: "multi-select", label: "Aggravating Factors", required: false, options: ["Morning", "Night", "Cold weather", "Movement", "Rest", "Stress"] },
      { id: "f5", type: "ai-summary", label: "AI Pain Analysis", required: false, aiAssist: true },
    ],
    status: "active", createdBy: "Dr Mohamad Saleem", createdDate: "10/02/2025", lastModified: "15/04/2025", aiEnabled: true, gridLayout: "1"
  },
];

const mockInactiveForms: FormItem[] = [
  { id: "101", name: "Old Feedback Form", type: "Questionnaire", category: "General", description: "Replaced by new version", fields: [], status: "inactive", createdBy: "admin", createdDate: "01/06/2024", lastModified: "01/11/2024", aiEnabled: false, gridLayout: "1" },
  { id: "102", name: "Draft Consent", type: "Consent", category: "General", description: "Draft - never published", fields: [], status: "inactive", createdBy: "admin", createdDate: "15/07/2024", lastModified: "15/07/2024", aiEnabled: false, gridLayout: "1" },
  { id: "103", name: "Test Registration", type: "Registration", category: "Administrative", description: "Testing only", fields: [], status: "inactive", createdBy: "admin", createdDate: "20/08/2024", lastModified: "20/08/2024", aiEnabled: false, gridLayout: "1" },
];

// ─── Component ───────────────────────────────────────────────────────────────
const FormMaster = () => {
  // Tab: "new", "manage", "inactive"
  const [tab, setTab] = useState<"new" | "manage" | "inactive">("new");

  // Form builder state
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formGridLayout, setFormGridLayout] = useState<"1" | "2" | "3">("1");
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [selectedFieldIdx, setSelectedFieldIdx] = useState<number | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");

  // Data
  const [activeForms, setActiveForms] = useState<FormItem[]>(mockActiveForms);
  const [inactiveForms, setInactiveForms] = useState<FormItem[]>(mockInactiveForms);
  const [search, setSearch] = useState("");

  // Add field to canvas
  const addField = (fieldType: string) => {
    const fieldDef = FIELD_TYPES.find(f => f.id === fieldType);
    const newField: FormField = {
      id: Date.now().toString(),
      type: fieldType,
      label: fieldDef?.label || fieldType,
      required: false,
      placeholder: "",
      options: ["dropdown", "radio", "checkbox", "multi-select", "dosha-select", "yes-no"].includes(fieldType) ? ["Option 1", "Option 2"] : undefined,
      aiAssist: ["ai-summary", "diagnosis-search", "medicine-search", "vitals", "dosha-select", "body-map"].includes(fieldType),
    };
    setFormFields([...formFields, newField]);
    setSelectedFieldIdx(formFields.length);
  };

  // Remove field
  const removeField = (idx: number) => {
    setFormFields(formFields.filter((_, i) => i !== idx));
    setSelectedFieldIdx(null);
  };

  // Update field property
  const updateField = (idx: number, key: keyof FormField, value: any) => {
    const updated = [...formFields];
    (updated[idx] as any)[key] = value;
    setFormFields(updated);
  };

  // Move field
  const moveField = (idx: number, direction: "up" | "down") => {
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === formFields.length - 1) return;
    const updated = [...formFields];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
    setFormFields(updated);
    setSelectedFieldIdx(swapIdx);
  };

  // AI Generate form
  const handleAiGenerate = () => {
    if (!aiPrompt.trim()) return toast.error("Describe the form you want AI to create");
    toast.success("AI is generating your form...");
    // Simulate AI generation
    setTimeout(() => {
      const generated: FormField[] = [
        { id: "ai1", type: "heading", label: `AI Generated: ${aiPrompt}`, required: false },
        { id: "ai2", type: "text", label: "Patient Name", required: true, placeholder: "Full name" },
        { id: "ai3", type: "date", label: "Date", required: true },
        { id: "ai4", type: "textarea", label: "Chief Complaint", required: true, aiAssist: true },
        { id: "ai5", type: "scale", label: "Severity (1-10)", required: true },
        { id: "ai6", type: "ai-summary", label: "AI Analysis", required: false, aiAssist: true },
      ];
      setFormFields(generated);
      setFormName(aiPrompt.slice(0, 40));
      toast.success("Form generated! Customize fields as needed.");
    }, 1000);
    setAiPrompt("");
  };

  // Use AI Template
  const handleUseAiTemplate = (templateId: string) => {
    const tmpl = AI_FORM_TEMPLATES.find(t => t.id === templateId);
    if (!tmpl) return;
    toast.success(`Loading "${tmpl.label}" template...`);
    setFormName(tmpl.label);
    setFormDescription(tmpl.description);
    // Simple field generation based on template
    const generated: FormField[] = [
      { id: "t1", type: "heading", label: tmpl.label, required: false },
      { id: "t2", type: "text", label: "Patient Name", required: true },
      { id: "t3", type: "date", label: "Date", required: true },
      { id: "t4", type: "textarea", label: "Notes", required: false, aiAssist: true },
      { id: "t5", type: "ai-summary", label: "AI Summary", required: false, aiAssist: true },
    ];
    setFormFields(generated);
  };

  // Clear form
  const clearForm = () => {
    setFormFields([]);
    setSelectedFieldIdx(null);
    setFormName(""); setFormType(""); setFormCategory(""); setFormDescription("");
  };

  // Save form
  const handleSaveForm = () => {
    if (!formName.trim()) return toast.error("Form Name is required");
    if (!formType) return toast.error("Select a Form Type");
    if (!formCategory) return toast.error("Select a Category");
    if (formFields.length === 0) return toast.error("Add at least one field to the form");
    const newForm: FormItem = {
      id: Date.now().toString(),
      name: formName.trim(),
      type: formType,
      category: formCategory,
      description: formDescription,
      fields: formFields,
      status: "active",
      createdBy: "Current User",
      createdDate: new Date().toLocaleDateString("en-GB"),
      lastModified: new Date().toLocaleDateString("en-GB"),
      aiEnabled: formFields.some(f => f.aiAssist),
      gridLayout: formGridLayout,
    };
    setActiveForms([newForm, ...activeForms]);
    toast.success(`Form "${formName}" saved successfully!`);
    clearForm();
  };

  const handleDeactivate = (id: string) => {
    const item = activeForms.find(f => f.id === id);
    if (!item) return;
    setActiveForms(activeForms.filter(f => f.id !== id));
    setInactiveForms([{ ...item, status: "inactive" }, ...inactiveForms]);
    toast.success("Form deactivated");
  };

  const handleReactivate = (id: string) => {
    const item = inactiveForms.find(f => f.id === id);
    if (!item) return;
    setInactiveForms(inactiveForms.filter(f => f.id !== id));
    setActiveForms([{ ...item, status: "active" }, ...activeForms]);
    toast.success("Form reactivated");
  };

  const filteredActive = activeForms.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.type.toLowerCase().includes(search.toLowerCase()) ||
    f.category.toLowerCase().includes(search.toLowerCase())
  );
  const filteredInactive = inactiveForms.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  // ─── Render New Form Builder ───────────────────────────────────────────────
  const renderNewForm = () => (
    <div className="space-y-4">
      {/* AI Generate Section */}
      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <Label className="font-semibold text-purple-700">AI Form Generator</Label>
          </div>
          <div className="flex gap-2">
            <Input
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              placeholder="Describe the form you need... e.g., 'Patient intake form for knee pain assessment with pain scale and body map'"
              className="flex-1 text-sm"
              onKeyDown={e => { if (e.key === "Enter") handleAiGenerate(); }}
            />
            <Button onClick={handleAiGenerate} className="bg-purple-600 hover:bg-purple-700 text-white">
              <Sparkles className="h-3.5 w-3.5 mr-1" /> Generate
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {AI_FORM_TEMPLATES.slice(0, 4).map(t => (
              <Button key={t.id} size="sm" variant="outline" className="h-6 text-[10px] border-purple-200 text-purple-600 hover:bg-purple-100" onClick={() => handleUseAiTemplate(t.id)}>
                {t.label}
              </Button>
            ))}
            <Button size="sm" variant="ghost" className="h-6 text-[10px] text-purple-500">+{AI_FORM_TEMPLATES.length - 4} more templates</Button>
          </div>
        </CardContent>
      </Card>

      {/* Form Builder Header */}
      <Card>
        <CardHeader className="pb-2 border-b bg-primary/5">
          <CardTitle className="text-base text-center text-primary">Form Master</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {/* Grid & Actions */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Grid</span>
              <div className="flex border rounded overflow-hidden">
                <Button type="button" size="sm" variant={formGridLayout === "1" ? "default" : "ghost"} className={`h-7 w-7 p-0 rounded-none ${formGridLayout === "1" ? "bg-orange-500" : ""}`} onClick={() => setFormGridLayout("1")}><Square className="h-3 w-3" /></Button>
                <Button type="button" size="sm" variant={formGridLayout === "2" ? "default" : "ghost"} className={`h-7 w-7 p-0 rounded-none ${formGridLayout === "2" ? "bg-orange-500" : ""}`} onClick={() => setFormGridLayout("2")}><Columns className="h-3 w-3" /></Button>
                <Button type="button" size="sm" variant={formGridLayout === "3" ? "default" : "ghost"} className={`h-7 w-7 p-0 rounded-none ${formGridLayout === "3" ? "bg-orange-500" : ""}`} onClick={() => setFormGridLayout("3")}><LayoutGrid className="h-3 w-3" /></Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={clearForm}><X className="h-3 w-3 mr-1" /> Clear</Button>
              <Button size="sm" onClick={handleSaveForm} className="bg-orange-500 hover:bg-orange-600 text-white">💾 Save</Button>
            </div>
          </div>

          {/* 3-Column Layout: Fields | Canvas | Properties */}
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_240px] gap-4">
            {/* Left: Field Palette */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto border rounded p-2">
              {["INPUT FIELDS", "SELECTION", "LAYOUT", "AI / CLINICAL"].map(group => (
                <div key={group}>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{group}</p>
                  <div className="space-y-0.5">
                    {FIELD_TYPES.filter(f => f.group === group).map(ft => (
                      <Button
                        key={ft.id}
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="w-full justify-start text-xs h-7 hover:bg-orange-50 hover:text-orange-700"
                        onClick={() => addField(ft.id)}
                      >
                        <span className="w-5 text-center mr-1.5">{ft.icon}</span> {ft.label}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Center: Canvas */}
            <div className="border-2 border-dashed rounded-lg p-4 min-h-[500px] bg-white">
              {formFields.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <FileText className="h-10 w-10 mb-3 opacity-30" />
                  <p className="font-medium">Drag fields here</p>
                  <p className="text-xs mt-1">Pick a field from the left panel and drop it onto the canvas</p>
                  <p className="text-xs mt-3 text-purple-500">Or use AI Generator above to auto-create your form</p>
                </div>
              ) : (
                <div className={`space-y-2 ${formGridLayout === "2" ? "grid grid-cols-2 gap-2 space-y-0" : formGridLayout === "3" ? "grid grid-cols-3 gap-2 space-y-0" : ""}`}>
                  {formFields.map((field, idx) => (
                    <div
                      key={field.id}
                      className={`p-2.5 rounded border cursor-pointer transition-all ${selectedFieldIdx === idx ? "border-orange-400 bg-orange-50 shadow-sm" : "border-gray-200 hover:border-orange-200 hover:bg-orange-50/30"} ${field.type === "heading" || field.type === "divider" || field.type === "section" ? "col-span-full" : ""}`}
                      onClick={() => setSelectedFieldIdx(idx)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <GripVertical className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-medium">{field.label}</span>
                          {field.required && <span className="text-red-500 text-xs">*</span>}
                          {field.aiAssist && <Sparkles className="h-3 w-3 text-purple-500" />}
                        </div>
                        <div className="flex gap-0.5">
                          <Button type="button" size="sm" variant="ghost" className="h-5 w-5 p-0" onClick={(e) => { e.stopPropagation(); moveField(idx, "up"); }}>↑</Button>
                          <Button type="button" size="sm" variant="ghost" className="h-5 w-5 p-0" onClick={(e) => { e.stopPropagation(); moveField(idx, "down"); }}>↓</Button>
                          <Button type="button" size="sm" variant="ghost" className="h-5 w-5 p-0 text-red-400" onClick={(e) => { e.stopPropagation(); removeField(idx); }}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-1">
                        <Badge variant="outline" className="text-[9px] h-4">{field.type}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Properties Panel */}
            <div className="border rounded p-3 space-y-3 max-h-[600px] overflow-y-auto">
              {/* Form Meta */}
              <div className="space-y-2">
                <div>
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Name *</Label>
                  <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Name" className="h-8 text-sm mt-0.5" />
                </div>
                <div>
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Type *</Label>
                  <Select value={formType} onValueChange={setFormType}>
                    <SelectTrigger className="h-8 text-sm mt-0.5"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{FORM_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Category *</Label>
                  <Select value={formCategory} onValueChange={setFormCategory}>
                    <SelectTrigger className="h-8 text-sm mt-0.5"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{FORM_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Description</Label>
                  <Input value={formDescription} onChange={e => setFormDescription(e.target.value)} placeholder="Desc" className="h-8 text-sm mt-0.5" />
                </div>
              </div>

              {/* Selected Field Properties */}
              {selectedFieldIdx !== null && formFields[selectedFieldIdx] && (
                <div className="border-t pt-3 space-y-2">
                  <p className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1"><Settings className="h-3 w-3" /> Field Properties</p>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Label</Label>
                    <Input value={formFields[selectedFieldIdx].label} onChange={e => updateField(selectedFieldIdx, "label", e.target.value)} className="h-7 text-xs" />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Placeholder</Label>
                    <Input value={formFields[selectedFieldIdx].placeholder || ""} onChange={e => updateField(selectedFieldIdx, "placeholder", e.target.value)} className="h-7 text-xs" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={formFields[selectedFieldIdx].required} onChange={e => updateField(selectedFieldIdx, "required", e.target.checked)} className="accent-orange-500" />
                    <Label className="text-xs">Required</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={formFields[selectedFieldIdx].aiAssist || false} onChange={e => updateField(selectedFieldIdx, "aiAssist", e.target.checked)} className="accent-purple-500" />
                    <Label className="text-xs flex items-center gap-1"><Sparkles className="h-3 w-3 text-purple-500" /> AI Assist</Label>
                  </div>
                  {formFields[selectedFieldIdx].options && (
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Options (comma separated)</Label>
                      <Input value={(formFields[selectedFieldIdx].options || []).join(", ")} onChange={e => updateField(selectedFieldIdx, "options", e.target.value.split(",").map(s => s.trim()))} className="h-7 text-xs" />
                    </div>
                  )}
                </div>
              )}

              {selectedFieldIdx === null && (
                <div className="border-t pt-3 text-center text-xs text-muted-foreground">
                  <Settings className="h-6 w-6 mx-auto mb-1 opacity-30" />
                  Select a field on the canvas to configure it
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ─── Render Manage Table ───────────────────────────────────────────────────
  const renderManageTable = (data: FormItem[], type: "active" | "inactive") => (
    <Card>
      <CardHeader className={`pb-2 border-b ${type === "inactive" ? "bg-red-50/50" : ""}`}>
        <CardTitle className={`text-base text-center ${type === "inactive" ? "text-red-600" : "text-primary"}`}>
          {type === "active" ? "Manage Form Master" : "Manage Inactive Forms"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
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
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Name</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Type</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Category</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Desc</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Fields</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">AI</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Created By</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={8} className="px-3 py-4 text-center text-muted-foreground">No forms found</td></tr>
              ) : (
                data.map(form => (
                  <tr key={form.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2">
                      <span className="text-primary font-medium cursor-pointer hover:underline">{form.name}</span>
                    </td>
                    <td className="px-3 py-2 text-xs">{form.type}</td>
                    <td className="px-3 py-2 text-xs">{form.category}</td>
                    <td className="px-3 py-2 text-xs max-w-[150px] truncate">{form.description}</td>
                    <td className="px-3 py-2">
                      <Badge variant="secondary" className="text-[10px]">{form.fields.length} fields</Badge>
                    </td>
                    <td className="px-3 py-2">
                      {form.aiEnabled && <Sparkles className="h-3.5 w-3.5 text-purple-500" />}
                    </td>
                    <td className="px-3 py-2 text-xs">{form.createdBy}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 bg-teal-500 hover:bg-teal-600 text-white rounded">
                          <Pencil className="h-3 w-3" />
                        </Button>
                        {type === "active" ? (
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded" onClick={() => handleDeactivate(form.id)}>
                            <X className="h-3 w-3" />
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="h-6 text-[10px] text-emerald-600 border-emerald-300" onClick={() => handleReactivate(form.id)}>
                            Activate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing 1 to {data.length} of {data.length} entries</span>
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
            <FileText className="h-6 w-6 text-orange-600" /> Form Master
          </h1>
          <p className="text-sm text-muted-foreground">
            Design and manage digital patient forms with AI-powered field suggestions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-purple-100 text-purple-700 border-purple-200">
            <Sparkles className="h-3 w-3 mr-1" /> AI Integrated
          </Badge>
          <Badge variant="secondary">
            Active: {activeForms.length} | Inactive: {inactiveForms.length}
          </Badge>
        </div>
      </div>

      {/* Master Setting Layout: Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
        {/* Sidebar */}
        <div>
          <Card className="p-0">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm font-semibold">Form Master</CardTitle>
            </CardHeader>
            <CardContent className="p-1 space-y-0.5">
              <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-8 bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200">
                <span className="mr-2">📋</span> Manage Form
              </Button>
            </CardContent>
          </Card>

          {/* AI Templates Quick Access */}
          <Card className="mt-3 p-3">
            <p className="text-xs font-semibold mb-2 flex items-center gap-1"><Sparkles className="h-3 w-3 text-purple-500" /> AI Templates</p>
            <div className="space-y-1 text-xs">
              {AI_FORM_TEMPLATES.map(t => (
                <Button key={t.id} variant="ghost" size="sm" className="w-full justify-start text-[10px] h-6 hover:bg-purple-50 hover:text-purple-700 px-1.5" onClick={() => { setTab("new"); handleUseAiTemplate(t.id); }}>
                  {t.label}
                </Button>
              ))}
            </div>
          </Card>

          {/* Stats */}
          <Card className="mt-3 p-3">
            <p className="text-xs font-semibold mb-2">Forms by Category</p>
            <div className="space-y-1 text-xs">
              {["General", "Ayurveda", "Clinical", "Panchakarma", "Food"].map(cat => (
                <div key={cat} className="flex justify-between">
                  <span className="text-muted-foreground">{cat}</span>
                  <Badge variant="secondary" className="text-[10px] h-4">{activeForms.filter(f => f.category === cat).length}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Content Area */}
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 border-b pb-0">
            <Button variant="ghost" size="sm" className={`rounded-b-none text-xs ${tab === "new" ? "text-orange-700 border-b-2 border-orange-500 font-semibold bg-orange-50" : "text-muted-foreground"}`} onClick={() => setTab("new")}>
              New
            </Button>
            <Button variant="ghost" size="sm" className={`rounded-b-none text-xs ${tab === "manage" ? "text-teal-700 border-b-2 border-teal-600 font-semibold bg-teal-50" : "text-muted-foreground"}`} onClick={() => setTab("manage")}>
              Manage Form Master
            </Button>
            <Button variant="ghost" size="sm" className={`rounded-b-none text-xs ${tab === "inactive" ? "text-red-600 border-b-2 border-red-500 font-semibold bg-red-50" : "text-muted-foreground"}`} onClick={() => setTab("inactive")}>
              Manage Inactive Forms
            </Button>
          </div>

          {tab === "new" && renderNewForm()}
          {tab === "manage" && renderManageTable(filteredActive, "active")}
          {tab === "inactive" && renderManageTable(filteredInactive, "inactive")}
        </div>
      </div>
    </div>
  );
};

export default FormMaster;
