import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { FileText, Plus, Search, Edit, Trash2, Copy, MessageCircle, Mail } from "lucide-react";

const TemplateMaster = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-violet-600" /> Template & Content Master
          </h1>
          <p className="text-sm text-muted-foreground">EMR templates, clinical content, WhatsApp/Email/SMS templates</p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="mr-1 h-4 w-4" /> Create Template</Button>
      </div>

      <Tabs defaultValue="clinical">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
          <TabsTrigger value="clinical">Clinical Content</TabsTrigger>
          <TabsTrigger value="emr">EMR Templates</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp Templates</TabsTrigger>
          <TabsTrigger value="email">Email Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="clinical" className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search content..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Chief Complaints (Predefined)</CardTitle></CardHeader>
              <CardContent className="space-y-1 max-h-60 overflow-y-auto">
                {["Joint pain - bilateral knee", "Low back pain", "Neck stiffness", "Headache - chronic", "Indigestion / Agnimandya", "Skin rashes / Kushtha", "Insomnia / Anidra", "Obesity / Sthoulya", "Constipation / Vibandha", "Anxiety / Chittodvega", "Cough / Kasa", "Diabetes - uncontrolled", "Hair fall / Khalitya", "Menstrual irregularity", "Allergy - recurrent", "Fatigue / Klama"].map((c) => (
                  <div key={c} className="flex items-center justify-between p-2 rounded border text-xs hover:bg-muted/30">
                    <span>{c}</span>
                    <Button size="sm" variant="ghost" className="h-5 w-5 p-0"><Edit className="h-3 w-3" /></Button>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Diagnoses (AYUSH + ICD)</CardTitle></CardHeader>
              <CardContent className="space-y-1 max-h-60 overflow-y-auto">
                {["Sandhivata (M17 - Osteoarthritis Knee)", "Gridhrasi (M54.3 - Sciatica)", "Amavata (M06 - Rheumatoid Arthritis)", "Pandu (D50 - Iron Deficiency Anaemia)", "Madhumeha (E11 - Type 2 DM)", "Kushtha (L40 - Psoriasis)", "Tamaka Shwasa (J45 - Bronchial Asthma)", "Sthoulya (E66 - Obesity)", "Arsha (K64 - Hemorrhoids)", "Vatakantaka (M72 - Plantar Fasciitis)", "Avabahuka (M75 - Frozen Shoulder)", "Unmada (F41 - Anxiety Disorder)"].map((d) => (
                  <div key={d} className="flex items-center justify-between p-2 rounded border text-xs hover:bg-muted/30">
                    <span>{d}</span>
                    <Button size="sm" variant="ghost" className="h-5 w-5 p-0"><Edit className="h-3 w-3" /></Button>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Advice / Pathya Suggestions</CardTitle></CardHeader>
              <CardContent className="space-y-1 max-h-60 overflow-y-auto">
                {["Avoid cold food and drinks", "Take warm water throughout the day", "Avoid curd at night", "Apply warm oil to joints before bath", "Gentle knee exercises daily", "Avoid heavy/fried food", "Take food on time - 3 meals/day", "Sleep before 10 PM", "Yoga/Pranayama 30 min daily", "Avoid excessive salt/sour", "Avoid sitting cross-legged", "Use Indian toilet if possible", "Walk 20 min after meals"].map((a) => (
                  <div key={a} className="flex items-center justify-between p-2 rounded border text-xs hover:bg-muted/30">
                    <span>{a}</span>
                    <Button size="sm" variant="ghost" className="h-5 w-5 p-0"><Copy className="h-3 w-3" /></Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="emr" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">EMR Documentation Templates</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { name: "Sandhivata (OA Knee) - First Visit", category: "Ayurveda", fields: "SOAP + Dosha + Treatment plan", uses: 45 },
                  { name: "Panchakarma Admission Note", category: "Panchakarma", fields: "Assessment + Procedure plan + Diet", uses: 28 },
                  { name: "Gridhrasi (Sciatica) Template", category: "Ayurveda", fields: "SOAP + SLR + Spine exam", uses: 22 },
                  { name: "Homeopathy Case Taking", category: "Homeopathy", fields: "Mental + Physical generals + Modalities", uses: 18 },
                  { name: "Discharge Summary - Panchakarma", category: "Panchakarma", fields: "Diagnosis + Treatment + Outcome + Advice", uses: 35 },
                  { name: "Follow-up Note (Short)", category: "General", fields: "Progress + Changes + Next plan", uses: 120 },
                  { name: "Prakruti Assessment Report", category: "AYUSH", fields: "8-fold exam + Dosha scores + Recommendation", uses: 60 },
                  { name: "Yoga Therapy Prescription", category: "Yoga", fields: "Assessment + Asana plan + Pranayama + Diet", uses: 15 },
                ].map((t) => (
                  <div key={t.name} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30">
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.fields}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{t.category}</Badge>
                      <span className="text-xs text-muted-foreground">{t.uses} uses</span>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Edit className="h-3 w-3" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><MessageCircle className="h-4 w-4 text-green-600" /> WhatsApp Message Templates</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { name: "Prescription Sent", preview: "Your prescription from Dr. {{doctor}} is ready. Medicines: {{list}}. Follow-up: {{date}}", approved: true },
                  { name: "Appointment Reminder", preview: "Reminder: Appointment with {{doctor}} on {{date}} at {{time}}. {{hospital}}", approved: true },
                  { name: "Medicine Reminder", preview: "Time for your medicine: {{medicine}} {{dose}}. Take {{instruction}}", approved: true },
                  { name: "Follow-up Nudge", preview: "Hi {{name}}, your follow-up is due. Last visit was {{days}} days ago. Book: {{link}}", approved: true },
                  { name: "Panchakarma Day Update", preview: "Day {{day}} of {{package}}: Today's therapy: {{therapy}} at {{time}}. Room: {{room}}", approved: true },
                  { name: "Lab Report Ready", preview: "Your lab report is ready. View: {{link}}. Consult Dr. {{doctor}} for review.", approved: false },
                  { name: "Birthday Wishes", preview: "Happy Birthday {{name}}! Wishing you good health. Special offer: {{offer}}", approved: true },
                ].map((t) => (
                  <div key={t.name} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{t.name}</p>
                      <Badge variant={t.approved ? "outline" : "secondary"} className={`text-[10px] ${t.approved ? "text-green-600" : "text-amber-600"}`}>{t.approved ? "Approved" : "Pending"}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono bg-muted/50 p-2 rounded">{t.preview}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Mail className="h-4 w-4 text-blue-600" /> Email Templates</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { name: "Appointment Confirmation", subject: "Appointment Confirmed - {{hospital}}", active: true },
                  { name: "Lab Report", subject: "Your Lab Report is Ready - {{patient}}", active: true },
                  { name: "Discharge Summary", subject: "Discharge Summary - {{patient}} - {{date}}", active: true },
                  { name: "Invoice/Receipt", subject: "Payment Receipt #{{bill_no}} - {{hospital}}", active: true },
                  { name: "EOD Report (Admin)", subject: "Daily MIS Report - {{date}} - {{branch}}", active: true },
                  { name: "Follow-up Reminder", subject: "Your follow-up is due - {{hospital}}", active: true },
                  { name: "Welcome (New Patient)", subject: "Welcome to {{hospital}} - Your Health Partner", active: false },
                ].map((t) => (
                  <div key={t.name} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30">
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">Subject: {t.subject}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={t.active ? "outline" : "secondary"} className={`text-[10px] ${t.active ? "text-green-600" : ""}`}>{t.active ? "Active" : "Draft"}</Badge>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Edit className="h-3 w-3" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Template</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Template Name *</Label><Input placeholder="Template name" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Type</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="clinical">Clinical Content</SelectItem><SelectItem value="emr">EMR Template</SelectItem><SelectItem value="whatsapp">WhatsApp</SelectItem><SelectItem value="email">Email</SelectItem><SelectItem value="sms">SMS</SelectItem></SelectContent></Select></div>
              <div><Label>Category</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="Ayurveda">Ayurveda</SelectItem><SelectItem value="Panchakarma">Panchakarma</SelectItem><SelectItem value="Homeopathy">Homeopathy</SelectItem><SelectItem value="General">General</SelectItem></SelectContent></Select></div>
            </div>
            <div><Label>Content / Body</Label><Textarea placeholder="Template content with {{variables}}..." rows={5} /></div>
            <p className="text-xs text-muted-foreground">Available variables: {"{{patient}}, {{doctor}}, {{date}}, {{time}}, {{hospital}}, {{medicine}}, {{dose}}, {{link}}"}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Template created"); setAddOpen(false); }}>Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplateMaster;
