import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  MessageSquare, Mail, Phone, Bell, Clock, Send,
  CheckCircle2, AlertTriangle, Plus, Settings, Calendar,
  Users, TrendingUp, Eye, Edit2, Trash2, Play, Pause,
} from "lucide-react";

interface CommTemplate {
  id: string;
  name: string;
  trigger: "Booking Confirmed" | "Sample Collected" | "Report Ready" | "Payment Reminder" | "Birthday Wish" | "Health Check Reminder" | "Critical Alert" | "Appointment Reminder" | "Follow-up" | "Custom";
  channel: "WhatsApp" | "SMS" | "Email" | "Push" | "All";
  message: string;
  variables: string[];
  isActive: boolean;
  sentCount: number;
  lastSentAt?: string;
}

interface CommLog {
  id: string;
  patientName: string;
  patientId: string;
  phone: string;
  channel: "WhatsApp" | "SMS" | "Email" | "Push";
  trigger: string;
  message: string;
  sentAt: string;
  status: "Delivered" | "Sent" | "Failed" | "Pending" | "Read";
}

interface ScheduledCampaign {
  id: string;
  name: string;
  type: "Health Checkup Reminder" | "Birthday" | "Follow-up" | "Promotion" | "Festival Greeting";
  audience: string;
  audienceCount: number;
  channel: string;
  scheduledAt: string;
  status: "Scheduled" | "Sent" | "Draft" | "Paused";
  sentCount?: number;
  deliveredCount?: number;
}

const mockTemplates: CommTemplate[] = [
  { id: "t1", name: "Booking Confirmation", trigger: "Booking Confirmed", channel: "WhatsApp", message: "Dear {{patient_name}}, your appointment at Ayuzee Diagnostics is confirmed for {{date}} at {{time}}. Please carry your ID proof. Arrive 10 min early. Reply CANCEL to cancel.", variables: ["patient_name", "date", "time"], isActive: true, sentCount: 1250, lastSentAt: "2026-07-24 10:30 AM" },
  { id: "t2", name: "Sample Collected Notification", trigger: "Sample Collected", channel: "WhatsApp", message: "Hi {{patient_name}}, your sample has been collected successfully. Your report will be ready by {{expected_time}}. Track: {{tracking_link}}", variables: ["patient_name", "expected_time", "tracking_link"], isActive: true, sentCount: 890, lastSentAt: "2026-07-24 09:45 AM" },
  { id: "t3", name: "Report Ready Alert", trigger: "Report Ready", channel: "All", message: "Good news, {{patient_name}}! Your {{test_name}} report is ready. View: {{report_link}}. For queries, call us at 04634-123456.", variables: ["patient_name", "test_name", "report_link"], isActive: true, sentCount: 2340, lastSentAt: "2026-07-24 02:15 PM" },
  { id: "t4", name: "Payment Reminder", trigger: "Payment Reminder", channel: "SMS", message: "Dear {{patient_name}}, your pending amount of ₹{{amount}} at Ayuzee Diagnostics is due. Pay online: {{payment_link}}. Ignore if paid.", variables: ["patient_name", "amount", "payment_link"], isActive: true, sentCount: 456, lastSentAt: "2026-07-23 06:00 PM" },
  { id: "t5", name: "Birthday Greeting", trigger: "Birthday Wish", channel: "WhatsApp", message: "🎂 Happy Birthday, {{patient_name}}! Wishing you good health. Enjoy 15% off on any health checkup this week. Book now: {{booking_link}}", variables: ["patient_name", "booking_link"], isActive: true, sentCount: 180, lastSentAt: "2026-07-24 08:00 AM" },
  { id: "t6", name: "Annual Health Check Reminder", trigger: "Health Check Reminder", channel: "WhatsApp", message: "Hi {{patient_name}}, it's been {{months}} months since your last checkup. Regular testing helps early detection. Book your checkup: {{booking_link}}", variables: ["patient_name", "months", "booking_link"], isActive: true, sentCount: 320, lastSentAt: "2026-07-22 09:00 AM" },
  { id: "t7", name: "Critical Value Alert (Doctor)", trigger: "Critical Alert", channel: "All", message: "URGENT: Critical value detected for patient {{patient_name}} ({{patient_id}}). {{test_name}}: {{value}} {{unit}}. Immediate action needed.", variables: ["patient_name", "patient_id", "test_name", "value", "unit"], isActive: true, sentCount: 15, lastSentAt: "2026-07-24 10:45 AM" },
  { id: "t8", name: "Appointment Reminder (1hr before)", trigger: "Appointment Reminder", channel: "WhatsApp", message: "Reminder: {{patient_name}}, your appointment at Ayuzee Diagnostics is in 1 hour ({{time}}). Location: {{location}}. See you soon!", variables: ["patient_name", "time", "location"], isActive: true, sentCount: 670, lastSentAt: "2026-07-24 07:30 AM" },
];

const mockLogs: CommLog[] = [
  { id: "l1", patientName: "Mr. Rajesh Kumar", patientId: "AL-12543", phone: "+91 98765 43210", channel: "WhatsApp", trigger: "Report Ready", message: "Your RFT report is ready. View: https://reports.ayuzee.com/r/xK9mP2", sentAt: "2026-07-24 02:15 PM", status: "Read" },
  { id: "l2", patientName: "Mrs. Lakshmi Devi", patientId: "AL-14201", phone: "+91 87654 32109", channel: "WhatsApp", trigger: "Sample Collected", message: "Your sample has been collected. Report ready by 12:00 PM.", sentAt: "2026-07-24 09:20 AM", status: "Delivered" },
  { id: "l3", patientName: "Mr. Suresh Babu", patientId: "AL-15320", phone: "+91 76543 21098", channel: "SMS", trigger: "Booking Confirmed", message: "Appointment confirmed for Jul 24 at 9:45 AM.", sentAt: "2026-07-24 08:00 AM", status: "Delivered" },
  { id: "l4", patientName: "Dr. Mohamad Saleem", patientId: "DOC-001", phone: "+91 98765 43210", channel: "WhatsApp", trigger: "Critical Alert", message: "URGENT: Potassium 7.2 mEq/L for Mr. Rajesh Kumar.", sentAt: "2026-07-24 10:45 AM", status: "Read" },
  { id: "l5", patientName: "Mrs. Priya Sharma", patientId: "AL-13105", phone: "+91 65432 10987", channel: "Email", trigger: "Report Ready", message: "Your Thyroid Profile report is attached.", sentAt: "2026-07-24 10:30 AM", status: "Sent" },
  { id: "l6", patientName: "Mr. Gopal K", patientId: "AL-18045", phone: "+91 94567 12345", channel: "SMS", trigger: "Payment Reminder", message: "Pending ₹1,200 due. Pay online: pay.ayuzee.com/p/18045", sentAt: "2026-07-23 06:00 PM", status: "Failed" },
];

const mockCampaigns: ScheduledCampaign[] = [
  { id: "c1", name: "Monthly Health Check Reminder - July", type: "Health Checkup Reminder", audience: "Patients not tested in 6+ months", audienceCount: 245, channel: "WhatsApp", scheduledAt: "2026-07-25 09:00 AM", status: "Scheduled" },
  { id: "c2", name: "Birthday Wishes - July 25", type: "Birthday", audience: "Patients with DOB Jul 25", audienceCount: 8, channel: "WhatsApp", scheduledAt: "2026-07-25 08:00 AM", status: "Scheduled" },
  { id: "c3", name: "Diabetes Awareness Week Promo", type: "Promotion", audience: "Previous HbA1c patients", audienceCount: 120, channel: "WhatsApp + SMS", scheduledAt: "2026-07-22 10:00 AM", status: "Sent", sentCount: 120, deliveredCount: 108 },
  { id: "c4", name: "Follow-up: Abnormal Results", type: "Follow-up", audience: "Patients with abnormal results (7 days ago)", audienceCount: 18, channel: "WhatsApp", scheduledAt: "2026-07-26 10:00 AM", status: "Draft" },
];

const AutomatedComms = () => {
  const [templates] = useState<CommTemplate[]>(mockTemplates);
  const [logs] = useState<CommLog[]>(mockLogs);
  const [campaigns] = useState<ScheduledCampaign[]>(mockCampaigns);
  const [activeTab, setActiveTab] = useState("templates");

  const totalSent = templates.reduce((s, t) => s + t.sentCount, 0);
  const activeTemplates = templates.filter(t => t.isActive).length;

  const getChannelIcon = (ch: string) => {
    switch (ch) { case "WhatsApp": return <MessageSquare className="h-3 w-3 text-green-600" />; case "SMS": return <Phone className="h-3 w-3 text-blue-600" />; case "Email": return <Mail className="h-3 w-3 text-red-500" />; case "Push": return <Bell className="h-3 w-3 text-purple-600" />; default: return <Send className="h-3 w-3 text-gray-500" />; }
  };

  const getStatusColor = (s: string) => {
    switch (s) { case "Delivered": case "Read": case "Sent": return "bg-green-100 text-green-700"; case "Failed": return "bg-red-100 text-red-700"; case "Pending": case "Scheduled": case "Draft": return "bg-amber-100 text-amber-700"; case "Paused": return "bg-gray-100 text-gray-700"; default: return "bg-gray-100 text-gray-700"; }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" /> Automated Communication Engine
        </h2>
        <Button size="sm" className="bg-green-600 hover:bg-green-700"><Plus className="mr-1 h-3 w-3" /> New Template</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-green-200"><CardContent className="p-3 text-center"><Send className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600 mt-1">{totalSent.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Total Sent</p></CardContent></Card>
        <Card className="border-blue-200"><CardContent className="p-3 text-center"><CheckCircle2 className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold text-blue-600 mt-1">{activeTemplates}</p><p className="text-[10px] text-muted-foreground">Active Templates</p></CardContent></Card>
        <Card className="border-purple-200"><CardContent className="p-3 text-center"><Calendar className="h-4 w-4 mx-auto text-purple-600" /><p className="text-xl font-bold text-purple-600 mt-1">{campaigns.filter(c => c.status === "Scheduled").length}</p><p className="text-[10px] text-muted-foreground">Scheduled</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><AlertTriangle className="h-4 w-4 mx-auto text-red-600" /><p className="text-xl font-bold text-red-600 mt-1">{logs.filter(l => l.status === "Failed").length}</p><p className="text-[10px] text-muted-foreground">Failed</p></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="templates">Message Templates</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="logs">Delivery Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            {templates.map((tpl) => (
              <Card key={tpl.id} className={`${!tpl.isActive ? "opacity-60" : ""}`}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getChannelIcon(tpl.channel)}
                      <span className="text-sm font-medium">{tpl.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[9px]">{tpl.trigger}</Badge>
                      <Switch checked={tpl.isActive} />
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground bg-gray-50 rounded p-2 line-clamp-2">{tpl.message}</p>
                  <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                    <span>Sent: {tpl.sentCount.toLocaleString()}</span>
                    <span>Last: {tpl.lastSentAt || "Never"}</span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    <Button size="sm" variant="outline" className="h-5 text-[9px]"><Edit2 className="h-3 w-3" /></Button>
                    <Button size="sm" variant="outline" className="h-5 text-[9px]"><Eye className="h-3 w-3" /></Button>
                    <Button size="sm" variant="outline" className="h-5 text-[9px]" onClick={() => toast.info("Test message sent to your number")}><Send className="h-3 w-3" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-3">
          <div className="flex justify-end"><Button size="sm" className="bg-purple-600 hover:bg-purple-700"><Plus className="mr-1 h-3 w-3" /> New Campaign</Button></div>
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-b">
                <tr><th className="px-3 py-2 text-left">Campaign</th><th className="px-3 py-2 text-left">Audience</th><th className="px-3 py-2 text-center">Count</th><th className="px-3 py-2 text-left">Channel</th><th className="px-3 py-2 text-left">Scheduled</th><th className="px-3 py-2 text-center">Status</th><th className="px-3 py-2 text-center">Action</th></tr>
              </thead>
              <tbody>
                {campaigns.map((camp) => (
                  <tr key={camp.id} className="border-b">
                    <td className="px-3 py-2"><p className="font-medium">{camp.name}</p><p className="text-[10px] text-muted-foreground">{camp.type}</p></td>
                    <td className="px-3 py-2 text-muted-foreground max-w-[150px] truncate">{camp.audience}</td>
                    <td className="px-3 py-2 text-center font-bold">{camp.audienceCount}</td>
                    <td className="px-3 py-2">{camp.channel}</td>
                    <td className="px-3 py-2">{camp.scheduledAt}</td>
                    <td className="px-3 py-2 text-center"><Badge className={`text-[9px] ${getStatusColor(camp.status)}`}>{camp.status}</Badge></td>
                    <td className="px-3 py-2 text-center">
                      {camp.status === "Scheduled" && <Button size="sm" variant="outline" className="h-5 text-[9px] text-red-600" onClick={() => toast.warning("Campaign paused")}><Pause className="h-3 w-3" /></Button>}
                      {camp.status === "Draft" && <Button size="sm" className="h-5 text-[9px] bg-green-600" onClick={() => toast.success("Campaign scheduled")}><Play className="h-3 w-3" /></Button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        {/* Delivery Logs */}
        <TabsContent value="logs" className="space-y-3">
          <div className="flex items-center gap-2">
            <Select defaultValue="ALL"><SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">All Channels</SelectItem><SelectItem value="WhatsApp">WhatsApp</SelectItem><SelectItem value="SMS">SMS</SelectItem><SelectItem value="Email">Email</SelectItem></SelectContent></Select>
            <Select defaultValue="ALL"><SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">All Status</SelectItem><SelectItem value="Delivered">Delivered</SelectItem><SelectItem value="Failed">Failed</SelectItem><SelectItem value="Read">Read</SelectItem></SelectContent></Select>
            <Input type="date" className="h-8 text-xs w-[130px]" defaultValue="2026-07-24" />
          </div>
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-b">
                <tr><th className="px-3 py-2 text-left">Patient</th><th className="px-3 py-2 text-left">Channel</th><th className="px-3 py-2 text-left">Trigger</th><th className="px-3 py-2 text-left">Message</th><th className="px-3 py-2 text-left">Sent At</th><th className="px-3 py-2 text-center">Status</th></tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className={`border-b ${log.status === "Failed" ? "bg-red-50" : ""}`}>
                    <td className="px-3 py-2"><p className="font-medium">{log.patientName}</p><p className="text-[10px] text-muted-foreground">{log.phone}</p></td>
                    <td className="px-3 py-2"><div className="flex items-center gap-1">{getChannelIcon(log.channel)}<span>{log.channel}</span></div></td>
                    <td className="px-3 py-2"><Badge variant="outline" className="text-[9px]">{log.trigger}</Badge></td>
                    <td className="px-3 py-2 max-w-[200px] truncate text-muted-foreground" title={log.message}>{log.message}</td>
                    <td className="px-3 py-2 text-muted-foreground">{log.sentAt}</td>
                    <td className="px-3 py-2 text-center"><Badge className={`text-[9px] ${getStatusColor(log.status)}`}>{log.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Communication Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-xs font-medium">WhatsApp API Provider</label><Select defaultValue="wati"><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="wati">WATI</SelectItem><SelectItem value="twilio">Twilio</SelectItem><SelectItem value="gupshup">Gupshup</SelectItem><SelectItem value="interakt">Interakt</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><label className="text-xs font-medium">SMS Gateway</label><Select defaultValue="msg91"><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="msg91">MSG91</SelectItem><SelectItem value="textlocal">TextLocal</SelectItem><SelectItem value="twilio">Twilio</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><label className="text-xs font-medium">SMS Credits Remaining</label><Input className="h-8 text-xs" defaultValue="4,250" readOnly /></div>
                <div className="space-y-2"><label className="text-xs font-medium">WhatsApp Business Number</label><Input className="h-8 text-xs" defaultValue="+91 4634 123456" /></div>
              </div>
              <div className="space-y-3 pt-3 border-t">
                <p className="text-xs font-medium">Auto-Trigger Rules</p>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2"><Switch defaultChecked /><span>Send on booking confirmation</span></div>
                  <div className="flex items-center gap-2"><Switch defaultChecked /><span>Send on sample collection</span></div>
                  <div className="flex items-center gap-2"><Switch defaultChecked /><span>Send on report ready</span></div>
                  <div className="flex items-center gap-2"><Switch defaultChecked /><span>Critical value alert to doctor</span></div>
                  <div className="flex items-center gap-2"><Switch defaultChecked /><span>Birthday wishes (8:00 AM)</span></div>
                  <div className="flex items-center gap-2"><Switch defaultChecked /><span>Payment reminder (after 3 days)</span></div>
                  <div className="flex items-center gap-2"><Switch /><span>Health check reminder (6 months)</span></div>
                  <div className="flex items-center gap-2"><Switch /><span>Festival greetings</span></div>
                </div>
              </div>
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={() => toast.success("Communication settings saved")}>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomatedComms;
