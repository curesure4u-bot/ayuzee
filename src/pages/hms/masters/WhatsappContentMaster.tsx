import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Search, Pencil, MessageCircle, Send, Eye, Copy, Trash2 } from "lucide-react";

type Template = {
  id: string; name: string; category: string; content: string;
  variables: string; language: string; status: "active" | "inactive" | "pending";
  triggerEvent: string; createdBy: string;
};

const templates: Template[] = [
  { id: "1", name: "Appointment Confirmation", category: "Appointment", content: "🙏 Namaste {{patient_name}},\n\nYour appointment is confirmed!\n\n🏥 Hospital: {{hospital_name}}\n👨‍⚕️ Doctor: {{doctor_name}}\n📅 Date: {{date}}\n⏰ Time: {{time}}\n🔢 Token: {{token_no}}\n\nPlease arrive 15 mins early. Bring previous records.\n\n🌿 Ayuzee - Your AYUSH Health Partner", variables: "patient_name, hospital_name, doctor_name, date, time, token_no", language: "English", status: "active", triggerEvent: "On Appointment Create", createdBy: "System" },
  { id: "2", name: "Appointment Reminder", category: "Appointment", content: "🔔 Reminder: {{patient_name}},\n\nYour appointment is tomorrow!\n\n👨‍⚕️ {{doctor_name}}\n📅 {{date}} at {{time}}\n🏥 {{hospital_name}}\n\nReply CONFIRM to confirm or CANCEL to reschedule.\n\n🌿 Ayuzee", variables: "patient_name, doctor_name, date, time, hospital_name", language: "English", status: "active", triggerEvent: "1 Day Before Appointment", createdBy: "System" },
  { id: "3", name: "Prescription Sent", category: "Prescription", content: "💊 {{patient_name}},\n\nYour prescription from {{doctor_name}} is ready.\n\n📋 View: {{prescription_link}}\n\n💡 Medicines:\n{{medicine_list}}\n\n⏰ Next follow-up: {{followup_date}}\n\nOrder medicines from Ayuzee Pharmacy: {{pharmacy_link}}\n\n🌿 Get well soon!", variables: "patient_name, doctor_name, prescription_link, medicine_list, followup_date, pharmacy_link", language: "English", status: "active", triggerEvent: "On Prescription Save", createdBy: "System" },
  { id: "4", name: "Lab Report Ready", category: "Lab", content: "🧪 {{patient_name}},\n\nYour lab report is ready!\n\n📋 Test: {{test_name}}\n📊 View Report: {{report_link}}\n\n{{critical_alert}}\n\nConsult your doctor for interpretation.\n\n🌿 Ayuzee Health", variables: "patient_name, test_name, report_link, critical_alert", language: "English", status: "active", triggerEvent: "On Lab Report Approve", createdBy: "System" },
  { id: "5", name: "Billing Receipt", category: "Billing", content: "🧾 Payment Received!\n\nDear {{patient_name}},\n\n💰 Amount: ₹{{amount}}\n📋 Bill No: {{bill_no}}\n💳 Mode: {{payment_mode}}\n🏥 {{hospital_name}}\n\n📄 Receipt: {{receipt_link}}\n\nThank you! 🙏\n🌿 Ayuzee", variables: "patient_name, amount, bill_no, payment_mode, hospital_name, receipt_link", language: "English", status: "active", triggerEvent: "On Payment Receive", createdBy: "System" },
  { id: "6", name: "Follow-up Reminder", category: "Follow-up", content: "🌿 {{patient_name}},\n\nIt's time for your follow-up visit!\n\n👨‍⚕️ Doctor: {{doctor_name}}\n📅 Due: {{followup_date}}\n\nBook now: {{booking_link}}\n\nOr reply BOOK to schedule.\n\n🌿 Ayuzee - Continuous Care", variables: "patient_name, doctor_name, followup_date, booking_link", language: "English", status: "active", triggerEvent: "On Follow-up Due Date", createdBy: "System" },
  { id: "7", name: "Panchakarma Schedule", category: "Panchakarma", content: "🪷 {{patient_name}},\n\nYour Panchakarma schedule for tomorrow:\n\n🧖 Therapy: {{therapy_name}}\n⏰ Time: {{time}}\n👨‍⚕️ Therapist: {{therapist_name}}\n🏥 Room: {{room_no}}\n\n📋 Pre-therapy instructions:\n{{instructions}}\n\n🌿 Ayuzee Panchakarma", variables: "patient_name, therapy_name, time, therapist_name, room_no, instructions", language: "English", status: "active", triggerEvent: "1 Day Before PK Session", createdBy: "Admin" },
  { id: "8", name: "Medicine Reminder", category: "Medicine", content: "💊 Medicine Reminder!\n\nDear {{patient_name}},\n\n⏰ Time to take:\n{{medicine_list}}\n\n📋 Instructions: {{instructions}}\n\nStay healthy! 🌿\nAyuzee Health", variables: "patient_name, medicine_list, instructions", language: "English", status: "active", triggerEvent: "Scheduled (Morning/Night)", createdBy: "Admin" },
  { id: "9", name: "Discharge Summary", category: "IPD", content: "🏥 {{patient_name}},\n\nYou've been discharged from {{hospital_name}}.\n\n📋 Summary: {{summary_link}}\n💊 Medicines: {{medicine_list}}\n🥗 Diet Plan: {{diet_link}}\n📅 Follow-up: {{followup_date}}\n\n⚠️ Emergency: {{emergency_no}}\n\nWishing speedy recovery! 🌿\nAyuzee", variables: "patient_name, hospital_name, summary_link, medicine_list, diet_link, followup_date, emergency_no", language: "English", status: "active", triggerEvent: "On IP Discharge", createdBy: "System" },
  { id: "10", name: "Birthday Wish", category: "Marketing", content: "🎂 Happy Birthday {{patient_name}}! 🎉\n\nWishing you excellent health and happiness!\n\n🎁 Special offer: 20% off on your next consultation this month.\n\nBook now: {{booking_link}}\n\n🌿 With love, Team Ayuzee", variables: "patient_name, booking_link", language: "English", status: "active", triggerEvent: "On Patient Birthday", createdBy: "Admin" },
  { id: "11", name: "Feedback Request", category: "Feedback", content: "🙏 {{patient_name}},\n\nHow was your visit to {{hospital_name}}?\n\n⭐ Rate us: {{feedback_link}}\n\nYour feedback helps us serve you better!\n\n🌿 Ayuzee", variables: "patient_name, hospital_name, feedback_link", language: "English", status: "active", triggerEvent: "24 Hours After Visit", createdBy: "System" },
  { id: "12", name: "Appointment Cancelled", category: "Appointment", content: "❌ {{patient_name}},\n\nYour appointment with {{doctor_name}} on {{date}} has been cancelled.\n\nReason: {{reason}}\n\n📅 Reschedule: {{booking_link}}\n\nSorry for the inconvenience.\n🌿 Ayuzee", variables: "patient_name, doctor_name, date, reason, booking_link", language: "English", status: "active", triggerEvent: "On Appointment Cancel", createdBy: "System" },
  { id: "13", name: "Tamil - Appointment Confirmation", category: "Appointment", content: "🙏 வணக்கம் {{patient_name}},\n\nஉங்கள் சந்திப்பு உறுதி செய்யப்பட்டது!\n\n🏥 மருத்துவமனை: {{hospital_name}}\n👨‍⚕️ மருத்துவர்: {{doctor_name}}\n📅 தேதி: {{date}}\n⏰ நேரம்: {{time}}\n\n15 நிமிடம் முன்னதாக வரவும்.\n\n🌿 ஆயுஸீ", variables: "patient_name, hospital_name, doctor_name, date, time", language: "Tamil", status: "active", triggerEvent: "On Appointment Create", createdBy: "Admin" },
  { id: "14", name: "Wellness Tips (Weekly)", category: "Marketing", content: "🌿 Weekly Wellness Tip!\n\nDear {{patient_name}},\n\n{{tip_content}}\n\n📚 Read more: {{article_link}}\n\nStay healthy with Ayurveda! 🪷\nAyuzee", variables: "patient_name, tip_content, article_link", language: "English", status: "inactive", triggerEvent: "Every Monday 9 AM", createdBy: "Admin" },
];

const CATEGORIES = ["All", "Appointment", "Prescription", "Lab", "Billing", "Follow-up", "Panchakarma", "Medicine", "IPD", "Marketing", "Feedback"];

const WhatsappContentMaster = () => {
  const [tab, setTab] = useState("manage");
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const filtered = templates.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.content.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "All" || t.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><MessageCircle className="h-6 w-6 text-green-600" /> WhatsApp Content Master</h1>
          <p className="text-sm text-muted-foreground">Manage standard WhatsApp message templates for patient communication, reminders & marketing</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary">{templates.length} templates</Badge>
          <Badge className="bg-emerald-100 text-emerald-700">{templates.filter(t => t.status === "active").length} active</Badge>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="manage">📋 Manage Templates</TabsTrigger>
          <TabsTrigger value="new">➕ Create New</TabsTrigger>
          <TabsTrigger value="config">⚙️ WhatsApp Config</TabsTrigger>
        </TabsList>

        {/* MANAGE TEMPLATES */}
        <TabsContent value="manage" className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search templates..." value={search} onChange={e => setSearch(e.target.value)} /></div>
            <Select value={filterCat} onValueChange={setFilterCat}><SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
          </div>
          <Card><CardContent className="p-0 overflow-x-auto">
            <Table><TableHeader><TableRow>
              <TableHead className="text-orange-600">Template Name</TableHead>
              <TableHead className="text-orange-600">Category</TableHead>
              <TableHead className="text-orange-600">Trigger Event</TableHead>
              <TableHead className="text-orange-600">Language</TableHead>
              <TableHead className="text-orange-600">Variables</TableHead>
              <TableHead className="text-orange-600">Status</TableHead>
              <TableHead className="text-orange-600">Created By</TableHead>
              <TableHead className="text-orange-600">Actions</TableHead>
            </TableRow></TableHeader><TableBody>
              {filtered.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{t.category}</Badge></TableCell>
                  <TableCell className="text-xs">{t.triggerEvent}</TableCell>
                  <TableCell className="text-xs">{t.language}</TableCell>
                  <TableCell className="text-xs max-w-[150px] truncate">{t.variables}</TableCell>
                  <TableCell><Badge className={t.status === "active" ? "bg-emerald-100 text-emerald-700 text-xs" : t.status === "inactive" ? "bg-gray-100 text-gray-600 text-xs" : "bg-amber-100 text-amber-700 text-xs"}>{t.status}</Badge></TableCell>
                  <TableCell className="text-xs">{t.createdBy}</TableCell>
                  <TableCell><div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setPreviewTemplate(t); setPreviewOpen(true); }}><Eye className="h-3 w-3" /></Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Pencil className="h-3 w-3" /></Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Copy className="h-3 w-3" /></Button>
                  </div></TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </CardContent></Card>
        </TabsContent>

        {/* CREATE NEW TEMPLATE */}
        <TabsContent value="new" className="space-y-4">
          <Card>
            <CardHeader className="pb-2 border-b bg-green-50/50"><CardTitle className="text-base text-center text-green-700">Create WhatsApp Template</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div><Label>Template Name *</Label><Input placeholder="e.g., Appointment Confirmation" /></div>
                <div><Label>Category *</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{CATEGORIES.filter(c => c !== "All").map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Language</Label><Select defaultValue="English"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="English">English</SelectItem><SelectItem value="Tamil">Tamil</SelectItem><SelectItem value="Hindi">Hindi</SelectItem><SelectItem value="Malayalam">Malayalam</SelectItem><SelectItem value="Kannada">Kannada</SelectItem><SelectItem value="Telugu">Telugu</SelectItem></SelectContent></Select></div>
              </div>
              <div><Label>Message Content *</Label><Textarea rows={8} placeholder="Type your message here. Use {{variable_name}} for dynamic content.\n\nExample:\n🙏 Namaste {{patient_name}},\nYour appointment is confirmed for {{date}} at {{time}}." /><p className="text-xs text-muted-foreground mt-1">Use {"{{variable}}"} syntax for dynamic values. Emojis encouraged for better engagement.</p></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Variables (comma separated)</Label><Input placeholder="patient_name, doctor_name, date, time" /></div>
                <div><Label>Trigger Event</Label><Select><SelectTrigger><SelectValue placeholder="When to send?" /></SelectTrigger><SelectContent>
                  <SelectItem value="on_appointment">On Appointment Create</SelectItem>
                  <SelectItem value="1_day_before">1 Day Before Appointment</SelectItem>
                  <SelectItem value="on_prescription">On Prescription Save</SelectItem>
                  <SelectItem value="on_lab_report">On Lab Report Approve</SelectItem>
                  <SelectItem value="on_payment">On Payment Receive</SelectItem>
                  <SelectItem value="on_discharge">On IP Discharge</SelectItem>
                  <SelectItem value="on_followup_due">On Follow-up Due Date</SelectItem>
                  <SelectItem value="1_day_before_pk">1 Day Before PK Session</SelectItem>
                  <SelectItem value="on_cancel">On Appointment Cancel</SelectItem>
                  <SelectItem value="24h_after_visit">24 Hours After Visit</SelectItem>
                  <SelectItem value="on_birthday">On Patient Birthday</SelectItem>
                  <SelectItem value="manual">Manual Send Only</SelectItem>
                  <SelectItem value="scheduled">Scheduled (Custom)</SelectItem>
                </SelectContent></Select></div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2"><Switch defaultChecked /><Label>Active</Label></div>
                <div className="flex items-center gap-2"><Switch /><Label>Include Hospital Logo</Label></div>
                <div className="flex items-center gap-2"><Switch /><Label>Attach PDF (if applicable)</Label></div>
              </div>
              <div className="flex justify-center pt-2"><Button className="bg-green-600 hover:bg-green-700 px-8" onClick={() => toast.success("Template created!")}>Save Template</Button></div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WHATSAPP CONFIG */}
        <TabsContent value="config" className="space-y-4">
          <Card><CardHeader><CardTitle className="text-base">⚙️ WhatsApp Business API Configuration</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>WhatsApp Business Number</Label><Input defaultValue="+91 9876543210" /></div>
              <div><Label>Business Account ID</Label><Input defaultValue="WABA_XXXXXX" /></div>
              <div><Label>API Provider</Label><Select defaultValue="official"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="official">Official WhatsApp Business API</SelectItem><SelectItem value="twilio">Twilio</SelectItem><SelectItem value="gupshup">Gupshup</SelectItem><SelectItem value="wati">WATI</SelectItem><SelectItem value="interakt">Interakt</SelectItem></SelectContent></Select></div>
              <div><Label>API Key / Token</Label><Input type="password" defaultValue="••••••••••••" /></div>
              <div><Label>Webhook URL</Label><Input defaultValue="https://ayuzee.com/api/whatsapp/webhook" /></div>
              <div><Label>Default Language</Label><Select defaultValue="English"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="English">English</SelectItem><SelectItem value="Tamil">Tamil</SelectItem><SelectItem value="Hindi">Hindi</SelectItem></SelectContent></Select></div>
              <div className="flex items-center gap-3"><Switch defaultChecked /><Label>Auto-send Appointment Confirmations</Label></div>
              <div className="flex items-center gap-3"><Switch defaultChecked /><Label>Auto-send Prescription</Label></div>
              <div className="flex items-center gap-3"><Switch defaultChecked /><Label>Auto-send Lab Reports</Label></div>
              <div className="flex items-center gap-3"><Switch defaultChecked /><Label>Auto-send Billing Receipts</Label></div>
              <div className="flex items-center gap-3"><Switch defaultChecked /><Label>Send Follow-up Reminders</Label></div>
              <div className="flex items-center gap-3"><Switch /><Label>Marketing Messages (Opt-in only)</Label></div>
            </CardContent>
          </Card>
          <Button onClick={() => toast.success("WhatsApp config saved!")}>💾 Save Configuration</Button>
        </TabsContent>
      </Tabs>

      {/* PREVIEW DIALOG */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>📱 Template Preview</DialogTitle></DialogHeader>
          {previewTemplate && (
            <div className="space-y-3">
              <Badge variant="outline">{previewTemplate.category}</Badge>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap">{previewTemplate.content}</div>
              <div className="text-xs text-muted-foreground"><strong>Variables:</strong> {previewTemplate.variables}</div>
              <div className="text-xs text-muted-foreground"><strong>Trigger:</strong> {previewTemplate.triggerEvent}</div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setPreviewOpen(false)}>Close</Button><Button className="bg-green-600"><Send className="h-4 w-4 mr-1" /> Send Test</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WhatsappContentMaster;
