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
import {
  MessageCircle, Send, Bell, Calendar, Pill, Clock,
  Users, CheckCircle, XCircle, BarChart3, Plus, FileText,
} from "lucide-react";

type MessageLog = {
  id: string;
  patient: string;
  phone: string;
  type: "prescription" | "reminder" | "followup" | "broadcast" | "appointment";
  status: "delivered" | "read" | "failed" | "pending";
  sentAt: string;
  content: string;
};

type Template = {
  id: string;
  name: string;
  category: string;
  language: string;
  preview: string;
  approved: boolean;
};

const mockMessages: MessageLog[] = [
  { id: "1", patient: "Ramesh Kumar", phone: "+91-98765xxxxx", type: "prescription", status: "read", sentAt: "2026-07-15 09:30", content: "Your Ayurveda prescription from Dr. Sharma is ready. Tap to view." },
  { id: "2", patient: "Lakshmi Devi", phone: "+91-87654xxxxx", type: "reminder", status: "delivered", sentAt: "2026-07-15 08:00", content: "Reminder: Take Rasnasaptakam Kashayam 15ml before breakfast." },
  { id: "3", patient: "Sunil Menon", phone: "+91-76543xxxxx", type: "followup", status: "delivered", sentAt: "2026-07-15 10:00", content: "Your follow-up with Dr. Sharma is tomorrow at 10:00 AM. Ayuzee Hospital." },
  { id: "4", patient: "Meera Nair", phone: "+91-65432xxxxx", type: "appointment", status: "read", sentAt: "2026-07-14 17:00", content: "Appointment confirmed: Jul 16, 11:00 AM with Dr. Meena Patel. Panchakarma review." },
  { id: "5", patient: "Anand Sharma", phone: "+91-54321xxxxx", type: "broadcast", status: "failed", sentAt: "2026-07-14 12:00", content: "Monsoon immunity package now available! 20% off on 7-day Panchakarma." },
];

const mockTemplates: Template[] = [
  { id: "1", name: "Prescription Sent", category: "Clinical", language: "English + Hindi", preview: "Your prescription from Dr. {{doctor_name}} is ready. Medicines: {{medicines}}. Next visit: {{follow_up_date}}", approved: true },
  { id: "2", name: "Appointment Reminder", category: "Scheduling", language: "English", preview: "Reminder: Your appointment with {{doctor_name}} is on {{date}} at {{time}}. Location: {{hospital_name}}.", approved: true },
  { id: "3", name: "Medicine Reminder", category: "Clinical", language: "Hindi + English", preview: "Dawai yaad dilana: {{medicine_name}} {{dose}} lena hai {{time}} baje. - Ayuzee", approved: true },
  { id: "4", name: "Follow-up Nudge", category: "Engagement", language: "English", preview: "Hi {{patient_name}}, it's been {{days}} days since your last visit. Your follow-up is due. Book now: {{link}}", approved: true },
  { id: "5", name: "Panchakarma Day Update", category: "Clinical", language: "English", preview: "Day {{day_number}} of your {{package_name}}: Today's therapy is {{therapy_name}} at {{time}}. Room: {{room}}", approved: true },
  { id: "6", name: "Lab Report Ready", category: "Clinical", language: "English", preview: "Your lab report is ready. View: {{link}}. Consult Dr. {{doctor_name}} for review.", approved: false },
  { id: "7", name: "Promotional - Seasonal Offer", category: "Marketing", language: "English + Hindi", preview: "This monsoon, boost immunity with Ayurveda! Special Panchakarma packages starting ₹{{price}}. Book: {{link}}", approved: true },
];

const HmsWhatsapp = () => {
  const [messages] = useState<MessageLog[]>(mockMessages);
  const [templates] = useState<Template[]>(mockTemplates);
  const [broadcastOpen, setBroadcastOpen] = useState(false);

  const delivered = messages.filter((m) => m.status === "delivered" || m.status === "read").length;
  const readRate = messages.filter((m) => m.status === "read").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-green-600" /> WhatsApp Patient Engagement
          </h1>
          <p className="text-sm text-muted-foreground">
            Automated prescriptions, reminders, follow-ups & broadcast messaging via WhatsApp Business API
          </p>
        </div>
        <Button onClick={() => setBroadcastOpen(true)}>
          <Send className="mr-1 h-4 w-4" /> Broadcast
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center"><Send className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">{messages.length}</p><p className="text-xs text-muted-foreground">Sent Today</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><CheckCircle className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold mt-1">{delivered}</p><p className="text-xs text-muted-foreground">Delivered</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><BarChart3 className="h-5 w-5 mx-auto text-purple-600" /><p className="text-xl font-bold mt-1">{Math.round((readRate / messages.length) * 100)}%</p><p className="text-xs text-muted-foreground">Read Rate</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><XCircle className="h-5 w-5 mx-auto text-red-600" /><p className="text-xl font-bold mt-1">{messages.filter(m => m.status === "failed").length}</p><p className="text-xs text-muted-foreground">Failed</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Users className="h-5 w-5 mx-auto text-amber-600" /><p className="text-xl font-bold mt-1">1,245</p><p className="text-xs text-muted-foreground">Total Contacts</p></CardContent></Card>
      </div>

      <Tabs defaultValue="log">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
          <TabsTrigger value="log">Message Log</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="automation">Automation Rules</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="log" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Recent Messages</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {messages.map((msg) => (
                  <div key={msg.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-green-100 grid place-items-center">
                        <MessageCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{msg.patient}</p>
                        <p className="text-xs text-muted-foreground">{msg.content.slice(0, 60)}...</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={msg.status === "read" ? "outline" : msg.status === "failed" ? "destructive" : "secondary"} className={`text-xs capitalize ${msg.status === "read" ? "text-green-600" : ""}`}>
                        {msg.status}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground mt-1">{msg.sentAt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Message Templates</CardTitle>
                <Button size="sm" variant="outline"><Plus className="mr-1 h-3 w-3" /> New Template</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {templates.map((t) => (
                  <div key={t.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{t.name}</p>
                        <Badge variant="outline" className="text-[10px]">{t.category}</Badge>
                        <Badge variant="secondary" className="text-[10px]">{t.language}</Badge>
                      </div>
                      <Badge variant={t.approved ? "outline" : "secondary"} className={`text-xs ${t.approved ? "text-green-600" : "text-amber-600"}`}>
                        {t.approved ? "Approved" : "Pending Review"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-mono bg-muted/50 p-2 rounded">{t.preview}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Automation Rules</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { trigger: "After prescription generated", action: "Send prescription PDF via WhatsApp", enabled: true, sent: 245 },
                  { trigger: "1 day before appointment", action: "Send appointment reminder", enabled: true, sent: 189 },
                  { trigger: "Medicine time (3x daily)", action: "Send medicine reminder", enabled: true, sent: 1250 },
                  { trigger: "Follow-up date due", action: "Send follow-up nudge", enabled: true, sent: 67 },
                  { trigger: "Panchakarma day start", action: "Send daily therapy schedule", enabled: true, sent: 42 },
                  { trigger: "Lab report ready", action: "Notify patient with download link", enabled: true, sent: 88 },
                  { trigger: "Bill generated", action: "Send payment link + receipt", enabled: false, sent: 0 },
                  { trigger: "Birthday", action: "Send birthday wishes + health tip", enabled: true, sent: 12 },
                ].map((rule) => (
                  <div key={rule.trigger} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">{rule.trigger}</p>
                      <p className="text-xs text-muted-foreground">{rule.action}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{rule.sent} sent</span>
                      <Badge variant={rule.enabled ? "outline" : "secondary"} className={`text-xs ${rule.enabled ? "text-green-600" : ""}`}>
                        {rule.enabled ? "Active" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Engagement Analytics (This Month)</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <p className="text-sm font-medium">Messages by Type</p>
                  {[
                    { type: "Prescription", count: 245, color: "bg-emerald-500" },
                    { type: "Reminders", count: 1250, color: "bg-blue-500" },
                    { type: "Follow-ups", count: 67, color: "bg-purple-500" },
                    { type: "Appointments", count: 189, color: "bg-amber-500" },
                    { type: "Broadcasts", count: 15, color: "bg-pink-500" },
                  ].map((item) => (
                    <div key={item.type} className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${item.color}`} />
                      <span className="text-sm flex-1">{item.type}</span>
                      <span className="text-sm font-medium">{item.count}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-medium">Performance</p>
                  <div className="space-y-2">
                    <div className="p-3 rounded bg-green-50 border border-green-200"><p className="text-xs text-muted-foreground">Delivery Rate</p><p className="text-xl font-bold text-green-700">98.2%</p></div>
                    <div className="p-3 rounded bg-blue-50 border border-blue-200"><p className="text-xs text-muted-foreground">Read Rate</p><p className="text-xl font-bold text-blue-700">76.5%</p></div>
                    <div className="p-3 rounded bg-purple-50 border border-purple-200"><p className="text-xs text-muted-foreground">Response Rate</p><p className="text-xl font-bold text-purple-700">32.1%</p></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Broadcast Dialog */}
      <Dialog open={broadcastOpen} onOpenChange={setBroadcastOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Send Broadcast Message</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Audience</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select audience" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Patients (1,245)</SelectItem>
                  <SelectItem value="active">Active Patients (342)</SelectItem>
                  <SelectItem value="followup">Pending Follow-ups (67)</SelectItem>
                  <SelectItem value="panchakarma">Panchakarma Patients (89)</SelectItem>
                  <SelectItem value="inactive">{"Inactive > 3 months (456)"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Template</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select template" /></SelectTrigger>
                <SelectContent>
                  {templates.filter(t => t.approved).map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Custom Message (optional)</Label><Textarea placeholder="Add personalization..." rows={3} /></div>
            <div><Label>Schedule</Label>
              <Select><SelectTrigger><SelectValue placeholder="Send now" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="now">Send Now</SelectItem>
                  <SelectItem value="9am">Tomorrow 9:00 AM</SelectItem>
                  <SelectItem value="custom">Custom Schedule</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBroadcastOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Broadcast scheduled"); setBroadcastOpen(false); }}>Send Broadcast</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsWhatsapp;
