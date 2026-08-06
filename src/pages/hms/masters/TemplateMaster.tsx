import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil, Plus, Search, FileText, X, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Table, Image, Link, Type } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type Template = {
  id: string;
  name: string;
  type: string;
  drName: string;
  gender: string;
  status: "active" | "inactive";
  content: string;
  keywords: string[];
  createdBy: string;
  createdDate: string;
  lastModified: string;
  pageSize: string;
};

// ─── Constants ───────────────────────────────────────────────────────────────
const TEMPLATE_TYPES = [
  "Discharge",
  "Prescription",
  "Consent Form",
  "Certificate",
  "Referral Letter",
  "Lab Report",
  "Case Sheet",
  "Admission Note",
  "Operative Note",
  "Panchakarma Note",
  "Follow-up Note",
  "Diet Chart",
  "Yoga Prescription",
  "Investigation Report",
  "Bill Format",
  "Receipt",
  "IP Summary",
  "Death Summary",
  "Medico-Legal",
  "Custom",
];

const DOCTOR_OPTIONS = [
  "All",
  "Dr Mohamad Saleem MD (Ayu)",
  "Dr Yeshu Priya BAMS",
  "Dr Anitha MS (Siddha)",
  "Dr Rajesh BHMS",
  "Dr Kavitha BNYS",
];

const GENDER_OPTIONS = ["Both", "Male", "Female"];

const PAGE_SIZES = ["A4 - 595 x 842", "A5 - 420 x 595", "Letter - 612 x 792", "Legal - 612 x 1008", "Custom"];

const KEYWORD_SUGGESTIONS = [
  "{{patient_name}}", "{{patient_id}}", "{{age}}", "{{gender}}", "{{phone}}",
  "{{doctor_name}}", "{{doctor_qualification}}", "{{doctor_reg_no}}",
  "{{date}}", "{{time}}", "{{admission_date}}", "{{discharge_date}}",
  "{{diagnosis}}", "{{complaints}}", "{{treatment_given}}", "{{medicines}}",
  "{{advice}}", "{{follow_up_date}}", "{{vitals}}", "{{investigations}}",
  "{{hospital_name}}", "{{branch}}", "{{address}}", "{{phone_hospital}}",
  "{{bill_no}}", "{{bill_amount}}", "{{discount}}", "{{net_amount}}",
  "{{dosha}}", "{{prakruti}}", "{{panchakarma_procedures}}",
  "{{diet_instructions}}", "{{pathya}}", "{{apathya}}",
];

// ─── Mock Data ───────────────────────────────────────────────────────────────
const mockActiveTemplates: Template[] = [
  { id: "1", name: "GENERAL", type: "Discharge", drName: "All", gender: "Both", status: "active", content: "<h2>Discharge Summary</h2><p>Patient: {{patient_name}}</p><p>Diagnosis: {{diagnosis}}</p><p>Treatment: {{treatment_given}}</p><p>Advice: {{advice}}</p>", keywords: ["{{patient_name}}", "{{diagnosis}}", "{{treatment_given}}", "{{advice}}"], createdBy: "Al Shifa Ayush Hospital", createdDate: "01/01/2025", lastModified: "15/03/2025", pageSize: "A4 - 595 x 842" },
  { id: "2", name: "MRS.JEENATH", type: "Discharge", drName: "All", gender: "Both", status: "active", content: "<h2>Discharge Summary - Special</h2><p>Patient: {{patient_name}}</p><p>Age/Gender: {{age}}/{{gender}}</p>", keywords: ["{{patient_name}}", "{{age}}", "{{gender}}"], createdBy: "Al Shifa Ayush Hospital", createdDate: "05/01/2025", lastModified: "10/02/2025", pageSize: "A4 - 595 x 842" },
  { id: "3", name: "MRS.RAJA LAKSHMI.V", type: "Discharge", drName: "All", gender: "Female", status: "active", content: "<h2>Discharge Summary - Female</h2><p>Patient: {{patient_name}}</p>", keywords: ["{{patient_name}}", "{{diagnosis}}"], createdBy: "Al Shifa Ayush Hospital", createdDate: "08/01/2025", lastModified: "08/01/2025", pageSize: "A4 - 595 x 842" },
  { id: "4", name: "Panchakarma Discharge", type: "Discharge", drName: "Dr Mohamad Saleem MD (Ayu)", gender: "Both", status: "active", content: "<h2>Panchakarma Discharge Summary</h2><p>Patient: {{patient_name}}</p><p>Procedures: {{panchakarma_procedures}}</p><p>Diet: {{diet_instructions}}</p>", keywords: ["{{patient_name}}", "{{panchakarma_procedures}}", "{{diet_instructions}}", "{{pathya}}", "{{apathya}}"], createdBy: "Dr Mohamad Saleem", createdDate: "10/01/2025", lastModified: "20/04/2025", pageSize: "A4 - 595 x 842" },
  { id: "5", name: "OPD Prescription", type: "Prescription", drName: "All", gender: "Both", status: "active", content: "<h3>Prescription</h3><p>Rx:</p><p>{{medicines}}</p><p>Advice: {{advice}}</p><p>Follow-up: {{follow_up_date}}</p>", keywords: ["{{patient_name}}", "{{medicines}}", "{{advice}}", "{{follow_up_date}}"], createdBy: "Al Shifa Ayush Hospital", createdDate: "01/01/2025", lastModified: "01/06/2025", pageSize: "A5 - 420 x 595" },
  { id: "6", name: "Consent - Panchakarma", type: "Consent Form", drName: "All", gender: "Both", status: "active", content: "<h3>Consent for Panchakarma Procedures</h3><p>I, {{patient_name}}, hereby consent to undergo the following Panchakarma procedures...</p>", keywords: ["{{patient_name}}", "{{panchakarma_procedures}}", "{{doctor_name}}"], createdBy: "Al Shifa Ayush Hospital", createdDate: "15/01/2025", lastModified: "15/01/2025", pageSize: "A4 - 595 x 842" },
  { id: "7", name: "Fitness Certificate", type: "Certificate", drName: "Dr Mohamad Saleem MD (Ayu)", gender: "Both", status: "active", content: "<h3>Fitness Certificate</h3><p>This is to certify that {{patient_name}}, Age: {{age}}, is medically fit...</p>", keywords: ["{{patient_name}}", "{{age}}", "{{doctor_name}}", "{{date}}"], createdBy: "Dr Mohamad Saleem", createdDate: "20/01/2025", lastModified: "20/01/2025", pageSize: "A4 - 595 x 842" },
  { id: "8", name: "Referral Letter", type: "Referral Letter", drName: "All", gender: "Both", status: "active", content: "<h3>Referral Letter</h3><p>Dear Doctor,</p><p>I am referring {{patient_name}} for further evaluation...</p><p>Diagnosis: {{diagnosis}}</p>", keywords: ["{{patient_name}}", "{{diagnosis}}", "{{doctor_name}}", "{{date}}"], createdBy: "Al Shifa Ayush Hospital", createdDate: "25/01/2025", lastModified: "25/01/2025", pageSize: "A4 - 595 x 842" },
  { id: "9", name: "IP Case Sheet", type: "Case Sheet", drName: "All", gender: "Both", status: "active", content: "<h3>IP Case Sheet</h3><p>Name: {{patient_name}}</p><p>Complaints: {{complaints}}</p><p>Vitals: {{vitals}}</p>", keywords: ["{{patient_name}}", "{{complaints}}", "{{vitals}}", "{{investigations}}"], createdBy: "Al Shifa Ayush Hospital", createdDate: "01/02/2025", lastModified: "15/05/2025", pageSize: "A4 - 595 x 842" },
  { id: "10", name: "Diet Chart - Vata", type: "Diet Chart", drName: "Dr Mohamad Saleem MD (Ayu)", gender: "Both", status: "active", content: "<h3>Diet Chart - Vata Shamana</h3><p>Morning: Warm water + ginger</p><p>Breakfast: Wheat porridge with ghee</p>", keywords: ["{{patient_name}}", "{{dosha}}", "{{diet_instructions}}"], createdBy: "Dr Mohamad Saleem", createdDate: "10/02/2025", lastModified: "10/02/2025", pageSize: "A4 - 595 x 842" },
];

const mockInactiveTemplates: Template[] = [
  { id: "101", name: "Old Discharge Format", type: "Discharge", drName: "All", gender: "Both", status: "inactive", content: "<p>Old format - replaced</p>", keywords: ["{{patient_name}}"], createdBy: "admin", createdDate: "01/06/2024", lastModified: "01/11/2024", pageSize: "A4 - 595 x 842" },
  { id: "102", name: "Test Prescription", type: "Prescription", drName: "All", gender: "Male", status: "inactive", content: "<p>Test template</p>", keywords: [], createdBy: "admin", createdDate: "15/07/2024", lastModified: "15/07/2024", pageSize: "A5 - 420 x 595" },
  { id: "103", name: "Draft Consent Form", type: "Consent Form", drName: "All", gender: "Both", status: "inactive", content: "<p>Draft - not finalized</p>", keywords: ["{{patient_name}}"], createdBy: "admin", createdDate: "20/08/2024", lastModified: "20/08/2024", pageSize: "A4 - 595 x 842" },
  { id: "104", name: "Duplicate Bill Format", type: "Bill Format", drName: "All", gender: "Both", status: "inactive", content: "<p>Duplicate - use new version</p>", keywords: ["{{bill_no}}"], createdBy: "admin", createdDate: "01/09/2024", lastModified: "01/09/2024", pageSize: "A4 - 595 x 842" },
];

// ─── Component ───────────────────────────────────────────────────────────────
const TemplateMaster = () => {
  // Tab: "new", "manage", "inactive"
  const [tab, setTab] = useState<"new" | "manage" | "inactive">("new");

  // Form state for New template
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("");
  const [formDr, setFormDr] = useState("All");
  const [formGender, setFormGender] = useState("Both");
  const [formPageSize, setFormPageSize] = useState("A4 - 595 x 842");
  const [formContent, setFormContent] = useState("");
  const [formKeywords, setFormKeywords] = useState<string[]>([]);
  const [formKeywordInput, setFormKeywordInput] = useState("");

  // Template data
  const [activeTemplates, setActiveTemplates] = useState<Template[]>(mockActiveTemplates);
  const [inactiveTemplates, setInactiveTemplates] = useState<Template[]>(mockInactiveTemplates);

  // Search
  const [search, setSearch] = useState("");

  // Handlers
  const handleAddKeyword = () => {
    if (!formKeywordInput.trim()) return;
    if (formKeywords.includes(formKeywordInput.trim())) return toast.error("Keyword already added");
    setFormKeywords([...formKeywords, formKeywordInput.trim()]);
    setFormKeywordInput("");
  };

  const handleRemoveKeyword = (kw: string) => {
    setFormKeywords(formKeywords.filter(k => k !== kw));
  };

  const handleInsertKeyword = (kw: string) => {
    setFormContent(prev => prev + " " + kw);
    if (!formKeywords.includes(kw)) {
      setFormKeywords([...formKeywords, kw]);
    }
  };

  const handleSubmitTemplate = () => {
    if (!formName.trim()) return toast.error("Template Name is required");
    if (!formType) return toast.error("Please select a Type");
    const newTemplate: Template = {
      id: Date.now().toString(),
      name: formName.trim(),
      type: formType,
      drName: formDr,
      gender: formGender,
      status: "active",
      content: formContent,
      keywords: formKeywords,
      createdBy: "Current User",
      createdDate: new Date().toLocaleDateString("en-GB"),
      lastModified: new Date().toLocaleDateString("en-GB"),
      pageSize: formPageSize,
    };
    setActiveTemplates([newTemplate, ...activeTemplates]);
    toast.success(`Template "${formName}" created successfully!`);
    setFormName(""); setFormType(""); setFormDr("All"); setFormGender("Both");
    setFormContent(""); setFormKeywords([]); setFormKeywordInput("");
    setFormPageSize("A4 - 595 x 842");
  };

  const handleDeactivate = (id: string) => {
    const item = activeTemplates.find(t => t.id === id);
    if (!item) return;
    setActiveTemplates(activeTemplates.filter(t => t.id !== id));
    setInactiveTemplates([{ ...item, status: "inactive" }, ...inactiveTemplates]);
    toast.success("Template deactivated");
  };

  const handleReactivate = (id: string) => {
    const item = inactiveTemplates.find(t => t.id === id);
    if (!item) return;
    setInactiveTemplates(inactiveTemplates.filter(t => t.id !== id));
    setActiveTemplates([{ ...item, status: "active" }, ...activeTemplates]);
    toast.success("Template reactivated");
  };

  const filteredActive = activeTemplates.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.type.toLowerCase().includes(search.toLowerCase()) ||
    t.drName.toLowerCase().includes(search.toLowerCase())
  );

  const filteredInactive = inactiveTemplates.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.type.toLowerCase().includes(search.toLowerCase())
  );

  // ─── Render New Template Form ──────────────────────────────────────────────
  const renderNewForm = () => (
    <Card>
      <CardHeader className="pb-2 border-b bg-primary/5">
        <CardTitle className="text-base text-center text-primary">Template</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-5">
        {/* Name */}
        <div>
          <Label className="font-semibold">Name <span className="text-red-500">*</span></Label>
          <Input
            value={formName}
            onChange={e => setFormName(e.target.value)}
            placeholder="Template name"
            className="mt-1"
          />
        </div>

        {/* Type & Doctor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label className="font-semibold">Type <span className="text-red-500">*</span></Label>
            <Select value={formType} onValueChange={setFormType}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select Type" /></SelectTrigger>
              <SelectContent>
                {TEMPLATE_TYPES.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="font-semibold">Dr</Label>
            <Select value={formDr} onValueChange={setFormDr}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {DOCTOR_OPTIONS.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="font-semibold">Gender</Label>
            <Select value={formGender} onValueChange={setFormGender}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {GENDER_OPTIONS.map(g => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="font-semibold">Page Size</Label>
            <Select value={formPageSize} onValueChange={setFormPageSize}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Rich Text Editor Toolbar */}
        <div>
          <Label className="font-semibold mb-2 block">Template Content</Label>
          <div className="border rounded-t-md bg-muted/50 p-1.5 flex flex-wrap gap-0.5">
            <Select defaultValue="normal">
              <SelectTrigger className="h-7 w-24 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="h1">Heading 1</SelectItem>
                <SelectItem value="h2">Heading 2</SelectItem>
                <SelectItem value="h3">Heading 3</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-0.5 ml-1">
              <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0"><Bold className="h-3.5 w-3.5" /></Button>
              <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0"><Italic className="h-3.5 w-3.5" /></Button>
              <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0"><Underline className="h-3.5 w-3.5" /></Button>
            </div>
            <div className="w-px bg-border mx-1"></div>
            <div className="flex gap-0.5">
              <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0"><AlignLeft className="h-3.5 w-3.5" /></Button>
              <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0"><AlignCenter className="h-3.5 w-3.5" /></Button>
              <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0"><AlignRight className="h-3.5 w-3.5" /></Button>
            </div>
            <div className="w-px bg-border mx-1"></div>
            <div className="flex gap-0.5">
              <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0"><List className="h-3.5 w-3.5" /></Button>
              <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0"><ListOrdered className="h-3.5 w-3.5" /></Button>
            </div>
            <div className="w-px bg-border mx-1"></div>
            <div className="flex gap-0.5">
              <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0"><Table className="h-3.5 w-3.5" /></Button>
              <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0"><Image className="h-3.5 w-3.5" /></Button>
              <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0"><Link className="h-3.5 w-3.5" /></Button>
            </div>
            <div className="w-px bg-border mx-1"></div>
            <Button type="button" size="sm" variant="ghost" className="h-7 px-2 text-xs"><Type className="h-3 w-3 mr-1" />Font</Button>
          </div>
          {/* Page size indicator */}
          <div className="border-x border-b rounded-b-md">
            <div className="bg-muted/30 px-3 py-1 text-xs text-muted-foreground border-b">
              {formPageSize}
            </div>
            <Textarea
              value={formContent}
              onChange={e => setFormContent(e.target.value)}
              placeholder="Enter template content here... Use {{variables}} for dynamic fields."
              className="min-h-[300px] border-0 rounded-none focus-visible:ring-0 text-sm font-mono"
            />
          </div>
        </div>

        {/* Insert Variable Shortcuts */}
        <div>
          <Label className="font-semibold text-sm mb-2 block">Quick Insert Variables</Label>
          <div className="flex flex-wrap gap-1.5">
            {KEYWORD_SUGGESTIONS.slice(0, 18).map(kw => (
              <Button
                key={kw}
                type="button"
                size="sm"
                variant="outline"
                className="h-6 text-[10px] px-2 font-mono hover:bg-primary/10"
                onClick={() => handleInsertKeyword(kw)}
              >
                {kw}
              </Button>
            ))}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-6 text-[10px] px-2 text-primary"
              onClick={() => toast.info("All variables: " + KEYWORD_SUGGESTIONS.join(", "))}
            >
              +{KEYWORD_SUGGESTIONS.length - 18} more...
            </Button>
          </div>
        </div>

        {/* Keywords */}
        <div>
          <Label className="font-semibold">Keywords</Label>
          <div className="flex items-center gap-2 mt-1">
            <Input
              value={formKeywordInput}
              onChange={e => setFormKeywordInput(e.target.value)}
              placeholder="Keywords"
              className="flex-1"
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddKeyword(); } }}
            />
          </div>
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={handleAddKeyword} className="bg-orange-500 hover:bg-orange-600 text-white">
              Add
            </Button>
            <Button size="sm" onClick={handleSubmitTemplate} className="bg-teal-600 hover:bg-teal-700 text-white">
              Submit
            </Button>
          </div>
          {formKeywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {formKeywords.map(kw => (
                <Badge key={kw} variant="secondary" className="text-xs font-mono flex items-center gap-1">
                  {kw}
                  <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => handleRemoveKeyword(kw)} />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // ─── Render Manage Template Table ──────────────────────────────────────────
  const renderManageTable = (data: Template[], type: "active" | "inactive") => (
    <Card>
      <CardHeader className={`pb-2 border-b ${type === "inactive" ? "bg-red-50/50" : ""}`}>
        <CardTitle className={`text-base text-center ${type === "inactive" ? "text-red-600" : "text-primary"}`}>
          {type === "active" ? "Manage Template" : "Manage Inactive Template"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {type === "inactive" && (
          <p className="text-xs text-orange-600 italic">
            Note: Inactive templates will not appear in document generation. You can reactivate them from here.
          </p>
        )}

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
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Dr Name</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Gender</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Status</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Created By</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600 w-16"></th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={8} className="px-3 py-4 text-center text-muted-foreground">No templates found</td></tr>
              ) : (
                data.map(tmpl => (
                  <tr key={tmpl.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2">
                      <span className="text-primary font-medium cursor-pointer hover:underline">{tmpl.name}</span>
                    </td>
                    <td className="px-3 py-2 text-xs">{tmpl.type}</td>
                    <td className="px-3 py-2 text-xs">{tmpl.drName}</td>
                    <td className="px-3 py-2 text-xs">{tmpl.gender === "Both" ? "Both" : tmpl.gender === "Male" ? "M" : "F"}</td>
                    <td className="px-3 py-2">
                      <span className={type === "active" ? "text-emerald-600 text-xs" : "text-red-600 text-xs"}>
                        {tmpl.status === "active" ? "Active" : "Inactive"}
                      </span>
                      <Pencil className="h-2.5 w-2.5 inline text-orange-500 ml-1 cursor-pointer" />
                    </td>
                    <td className="px-3 py-2 text-xs">{tmpl.createdBy}</td>
                    <td className="px-3 py-2">
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 bg-teal-500 hover:bg-teal-600 text-white rounded">
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </td>
                    <td className="px-3 py-2">
                      {type === "active" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded"
                          onClick={() => handleDeactivate(tmpl.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs text-emerald-600 border-emerald-300"
                          onClick={() => handleReactivate(tmpl.id)}
                        >
                          Activate
                        </Button>
                      )}
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
            <FileText className="h-6 w-6 text-violet-600" /> Template Master
          </h1>
          <p className="text-sm text-muted-foreground">
            Create reusable templates for notes and reports.
          </p>
        </div>
        <Badge variant="secondary">
          Active: {activeTemplates.length} | Inactive: {inactiveTemplates.length}
        </Badge>
      </div>

      {/* Master Setting Layout: Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
        {/* Sidebar */}
        <div>
          <Card className="p-0">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm font-semibold">Template Master</CardTitle>
            </CardHeader>
            <CardContent className="p-1 space-y-0.5">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs h-8 bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200"
              >
                <span className="mr-2">📄</span> Manage Template
              </Button>
            </CardContent>
          </Card>

          {/* Template Stats */}
          <Card className="mt-3 p-3">
            <p className="text-xs font-semibold mb-2">Templates by Type</p>
            <div className="space-y-1.5 text-xs">
              {["Discharge", "Prescription", "Consent Form", "Certificate", "Case Sheet", "Diet Chart"].map(t => (
                <div key={t} className="flex justify-between">
                  <span className="text-muted-foreground">{t}</span>
                  <Badge variant="secondary" className="text-[10px] h-4">
                    {activeTemplates.filter(tmpl => tmpl.type === t).length}
                  </Badge>
                </div>
              ))}
              <div className="flex justify-between pt-1 border-t mt-1">
                <span className="text-muted-foreground">Others</span>
                <Badge variant="secondary" className="text-[10px] h-4">
                  {activeTemplates.filter(tmpl => !["Discharge", "Prescription", "Consent Form", "Certificate", "Case Sheet", "Diet Chart"].includes(tmpl.type)).length}
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Content Area */}
        <div className="space-y-4">
          {/* Tabs: New | Manage Template | Manage Inactive Template */}
          <div className="flex gap-2 border-b pb-0">
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-b-none text-xs ${tab === "new" ? "text-orange-700 border-b-2 border-orange-500 font-semibold bg-orange-50" : "text-muted-foreground"}`}
              onClick={() => setTab("new")}
            >
              New
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-b-none text-xs ${tab === "manage" ? "text-teal-700 border-b-2 border-teal-600 font-semibold bg-teal-50" : "text-muted-foreground"}`}
              onClick={() => setTab("manage")}
            >
              Manage Template
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-b-none text-xs ${tab === "inactive" ? "text-red-600 border-b-2 border-red-500 font-semibold bg-red-50" : "text-muted-foreground"}`}
              onClick={() => setTab("inactive")}
            >
              Manage Inactive Template
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

export default TemplateMaster;
