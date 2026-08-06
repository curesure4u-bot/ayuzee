import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil, Sparkles, Mail, Search } from "lucide-react";

// ─── Types & Constants ───────────────────────────────────────────────────────
type EmailTemplate = { id: string; type: string; subject: string; body: string; variables: string[]; status: "active" | "inactive"; lastModified: string };

const EMAIL_TYPES = ["OP Bill", "IP Bill", "Sale/Prescription", "Purchase Order", "Invoice", "OP Prescription", "Discharge Summary", "Lab Report", "Appointment Confirmation", "Follow-up Reminder", "Payment Receipt", "Membership Welcome", "Birthday Wish", "Feedback Request"];

const AI_FEATURES = [
  { label: "AI Subject Line Optimizer", desc: "Generates high open-rate subject lines based on email type" },
  { label: "Smart Personalization", desc: "AI auto-inserts patient name, doctor, and relevant details" },
  { label: "Language Translation", desc: "Auto-translates email content to patient's preferred language" },
  { label: "Delivery Tracking", desc: "Tracks email delivery, open rates, and bounce rates" },
  { label: "Template Suggestion", desc: "AI suggests best template based on the transaction type" },
];

const mockTemplates: EmailTemplate[] = [
  { id: "1", type: "OP Bill", subject: "Your Bill from Al Shifa Ayush Hospital - {{bill_no}}", body: "Dear {{patient_name}},\n\nPlease find your OP bill attached.\n\nBill No: {{bill_no}}\nAmount: ₹{{amount}}\nDate: {{date}}\n\nThank you for choosing Al Shifa Ayush Hospital.\n\nRegards,\nAl Shifa Ayush Hospital", variables: ["patient_name", "bill_no", "amount", "date"], status: "active", lastModified: "15/03/2025" },
  { id: "2", type: "IP Bill", subject: "IP Discharge Bill - {{patient_name}} - {{bill_no}}", body: "Dear {{patient_name}},\n\nYour IP bill is generated.\n\nAdmission: {{admission_date}}\nDischarge: {{discharge_date}}\nTotal: ₹{{amount}}\n\nRegards,\nAl Shifa Ayush Hospital", variables: ["patient_name", "bill_no", "amount", "admission_date", "discharge_date"], status: "active", lastModified: "10/02/2025" },
  { id: "3", type: "Sale/Prescription", subject: "Your Prescription - Al Shifa Ayush Hospital", body: "Dear {{patient_name}},\n\nYour prescription from Dr. {{doctor_name}} is attached.\n\nPlease follow the instructions carefully.\n\nRegards,\nAl Shifa Ayush Hospital", variables: ["patient_name", "doctor_name"], status: "active", lastModified: "01/01/2025" },
  { id: "4", type: "Lab Report", subject: "Lab Report Ready - {{patient_name}}", body: "Dear {{patient_name}},\n\nYour lab report is ready. Please find it attached.\n\nTest: {{test_name}}\nDate: {{date}}\n\nPlease consult your doctor for interpretation.\n\nRegards,\nAl Shifa Ayush Hospital", variables: ["patient_name", "test_name", "date"], status: "active", lastModified: "20/04/2025" },
  { id: "5", type: "Appointment Confirmation", subject: "Appointment Confirmed - {{date}} at {{time}}", body: "Dear {{patient_name}},\n\nYour appointment is confirmed.\n\nDoctor: {{doctor_name}}\nDate: {{date}}\nTime: {{time}}\nBranch: {{branch}}\n\nPlease arrive 10 minutes early.\n\nRegards,\nAl Shifa Ayush Hospital", variables: ["patient_name", "doctor_name", "date", "time", "branch"], status: "active", lastModified: "05/05/2025" },
  { id: "6", type: "Follow-up Reminder", subject: "Follow-up Due - Al Shifa Ayush Hospital", body: "Dear {{patient_name}},\n\nThis is a reminder that your follow-up is due.\n\nLast Visit: {{last_visit}}\nDoctor: {{doctor_name}}\n\nBook now: {{booking_link}}\n\nRegards,\nAl Shifa Ayush Hospital", variables: ["patient_name", "last_visit", "doctor_name", "booking_link"], status: "active", lastModified: "10/06/2025" },
];

// ─── Component ───────────────────────────────────────────────────────────────
const EmailContentMaster = () => {
  const [tab, setTab] = useState<"manage" | "new">("manage");
  const [selectedType, setSelectedType] = useState("OP Bill");
  const [contentLoaded, setContentLoaded] = useState(false);
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");
  const [search, setSearch] = useState("");
  const [enabledAi, setEnabledAi] = useState<string[]>(["Smart Personalization", "Delivery Tracking"]);

  const toggleAi = (l: string) => setEnabledAi(p => p.includes(l) ? p.filter(x => x !== l) : [...p, l]);

  const handleGo = () => {
    const tmpl = mockTemplates.find(t => t.type === selectedType);
    if (tmpl) { setEditSubject(tmpl.subject); setEditBody(tmpl.body); }
    else { setEditSubject(""); setEditBody(""); }
    setContentLoaded(true);
  };

  const handleSave = () => { toast.success(`Email template for "${selectedType}" saved!`); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold flex items-center gap-2"><Mail className="h-6 w-6 text-orange-600" /> Email Content Master</h1><p className="text-sm text-muted-foreground">Manage standard email templates for all transaction types.</p></div>
        <Badge className="bg-purple-100 text-purple-700 border-purple-200"><Sparkles className="h-3 w-3 mr-1" /> AI Email</Badge>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
        <div>
          <Card className="p-0"><CardHeader className="pb-2 pt-3 px-3"><CardTitle className="text-sm font-semibold">Email Content Master</CardTitle></CardHeader>
            <CardContent className="p-1"><Button variant="ghost" size="sm" className="w-full justify-start text-xs h-8 bg-orange-50 text-orange-700 border border-orange-200"><span className="mr-2">✉️</span> Manage Email Content</Button></CardContent></Card>
          <Card className="mt-3 p-3"><p className="text-xs font-semibold mb-2 flex items-center gap-1"><Sparkles className="h-3 w-3 text-purple-500" /> AI Features</p>
            <div className="space-y-1 text-[10px]">{AI_FEATURES.map(f => (<label key={f.label} className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={enabledAi.includes(f.label)} onChange={() => toggleAi(f.label)} className="accent-purple-500" /><span className={enabledAi.includes(f.label) ? "font-medium" : "text-muted-foreground"}>{f.label}</span></label>))}</div></Card>
          <Card className="mt-3 p-3"><p className="text-xs font-semibold mb-2">Templates</p><div className="space-y-1 text-xs">{mockTemplates.map(t => (<div key={t.id} className="flex justify-between"><span className="text-muted-foreground truncate max-w-[130px]">{t.type}</span><Badge className="bg-emerald-100 text-emerald-700 text-[8px] h-3.5">✓</Badge></div>))}</div></Card>
        </div>
        <div className="space-y-4">
          <div className="flex gap-2 border-b pb-0">
            <Button variant="ghost" size="sm" className={`rounded-b-none text-xs ${tab === "manage" ? "text-orange-700 border-b-2 border-orange-500 font-semibold bg-orange-50" : "text-muted-foreground"}`} onClick={() => setTab("manage")}>Manage Content</Button>
            <Button variant="ghost" size="sm" className={`rounded-b-none text-xs ${tab === "new" ? "text-teal-700 border-b-2 border-teal-600 font-semibold bg-teal-50" : "text-muted-foreground"}`} onClick={() => setTab("new")}>All Templates</Button>
          </div>
          {tab === "manage" && (
            <Card><CardHeader className="pb-2 border-b bg-primary/5"><CardTitle className="text-base text-center text-primary">Email Content Master</CardTitle></CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-end gap-4">
                  <div className="min-w-[200px]"><Label className="font-semibold">Select Type <span className="text-red-500">*</span> :</Label>
                    <Select value={selectedType} onValueChange={setSelectedType}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{EMAIL_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                  <Button onClick={handleGo} className="bg-orange-500 hover:bg-orange-600 text-white">Go</Button>
                </div>
                {contentLoaded && (
                  <div className="space-y-3 pt-3 border-t">
                    <div><Label className="font-semibold">Subject Line</Label><Input value={editSubject} onChange={e => setEditSubject(e.target.value)} className="mt-1 font-mono text-sm" /></div>
                    <div><Label className="font-semibold">Email Body</Label><Textarea value={editBody} onChange={e => setEditBody(e.target.value)} className="mt-1 font-mono text-sm min-h-[200px]" /></div>
                    <div><p className="text-xs text-muted-foreground">Available variables: {`{{patient_name}}, {{doctor_name}}, {{date}}, {{time}}, {{bill_no}}, {{amount}}, {{branch}}, {{booking_link}}`}</p></div>
                    <div className="flex justify-center"><Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600 text-white px-8">Save</Button></div>
                  </div>
                )}
              </CardContent></Card>
          )}
          {tab === "new" && (
            <Card><CardHeader className="pb-2 border-b"><CardTitle className="text-base text-center text-primary">All Email Templates</CardTitle></CardHeader>
              <CardContent className="p-4">
                <table className="w-full text-sm border"><thead className="bg-muted/50 border-b"><tr><th className="px-3 py-2 text-left font-semibold text-orange-600">Type</th><th className="px-3 py-2 text-left font-semibold text-orange-600">Subject</th><th className="px-3 py-2 text-left font-semibold text-orange-600">Variables</th><th className="px-3 py-2 text-left font-semibold text-orange-600">Last Modified</th><th className="px-3 py-2 text-left font-semibold text-orange-600">Status</th></tr></thead>
                <tbody>{mockTemplates.map(t => (<tr key={t.id} className="border-b hover:bg-muted/30"><td className="px-3 py-2 text-xs font-medium">{t.type}</td><td className="px-3 py-2 text-xs font-mono">{t.subject}</td><td className="px-3 py-2 text-[10px]">{t.variables.length} vars</td><td className="px-3 py-2 text-xs">{t.lastModified}</td><td className="px-3 py-2"><Badge className="bg-emerald-100 text-emerald-700 text-[9px]">{t.status}</Badge></td></tr>))}</tbody></table>
              </CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailContentMaster;
