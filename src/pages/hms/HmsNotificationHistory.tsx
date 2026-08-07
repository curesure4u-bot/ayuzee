import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare, Mail, Bell, Smartphone, Phone, Search,
  CheckCircle, XCircle, Clock, Send, Filter, Calendar,
  RefreshCw, Download, User, Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type NotificationEntry = {
  id: string;
  patient_name: string;
  patient_phone: string;
  channel: "whatsapp" | "sms" | "email" | "app" | "call";
  type: string;
  subject: string;
  content_preview: string;
  status: "delivered" | "sent" | "failed" | "pending" | "read";
  sent_at: string;
  delivered_at?: string;
  read_at?: string;
  triggered_by: string;
};

const channelConfig = {
  whatsapp: { icon: MessageSquare, color: "text-green-600 bg-green-50", label: "WhatsApp" },
  sms: { icon: Phone, color: "text-blue-600 bg-blue-50", label: "SMS" },
  email: { icon: Mail, color: "text-purple-600 bg-purple-50", label: "Email" },
  app: { icon: Smartphone, color: "text-orange-600 bg-orange-50", label: "App Push" },
  call: { icon: Phone, color: "text-red-600 bg-red-50", label: "Auto Call" },
};

const statusConfig = {
  delivered: { icon: CheckCircle, color: "text-green-600", label: "Delivered" },
  sent: { icon: Send, color: "text-blue-600", label: "Sent" },
  failed: { icon: XCircle, color: "text-red-600", label: "Failed" },
  pending: { icon: Clock, color: "text-amber-600", label: "Pending" },
  read: { icon: CheckCircle, color: "text-emerald-600", label: "Read" },
};

const mockNotifications: NotificationEntry[] = [
  { id: "1", patient_name: "Rajesh Kumar", patient_phone: "98765 43210", channel: "whatsapp", type: "Appointment Reminder", subject: "Tomorrow's appointment reminder", content_preview: "Dear Rajesh, your appointment with Dr. Saleem is tomorrow at 10:30 AM...", status: "read", sent_at: "10:00 AM", delivered_at: "10:00 AM", read_at: "10:15 AM", triggered_by: "Auto (24hr before)" },
  { id: "2", patient_name: "Rajesh Kumar", patient_phone: "98765 43210", channel: "sms", type: "Appointment Reminder", subject: "Appointment reminder SMS", content_preview: "Reminder: Apt with Dr.Saleem, Jul 30, 10:30AM. Reply C to cancel.", status: "delivered", sent_at: "10:00 AM", delivered_at: "10:01 AM", triggered_by: "Auto (24hr before)" },
  { id: "3", patient_name: "Priya Sharma", patient_phone: "87654 32100", channel: "whatsapp", type: "Lab Report Ready", subject: "Your lab reports are ready", content_preview: "Hi Priya, your CBC and Lipid Profile reports are ready. View: https://...", status: "delivered", sent_at: "11:30 AM", delivered_at: "11:30 AM", triggered_by: "Lab Module" },
  { id: "4", patient_name: "Amit Patel", patient_phone: "76543 21000", channel: "email", type: "Discharge Summary", subject: "Discharge Summary - Amit Patel", content_preview: "Dear Amit, please find your discharge summary attached. Follow-up on...", status: "delivered", sent_at: "09:45 AM", delivered_at: "09:46 AM", triggered_by: "Doctor (Dr. Meena)" },
  { id: "5", patient_name: "Sunita Devi", patient_phone: "65432 10900", channel: "app", type: "Medicine Reminder", subject: "Time to take your medicine", content_preview: "It's time for your evening dose: Ashwagandha Churna, Triphala...", status: "sent", sent_at: "06:00 PM", triggered_by: "Auto (Schedule)" },
  { id: "6", patient_name: "Vikram Singh", patient_phone: "54321 09800", channel: "whatsapp", type: "Feedback Request", subject: "How was your visit?", content_preview: "Hi Vikram, how was your visit today? Rate us: ⭐⭐⭐⭐⭐ Click here...", status: "read", sent_at: "04:30 PM", delivered_at: "04:30 PM", read_at: "05:12 PM", triggered_by: "Auto (2hr post-checkout)" },
  { id: "7", patient_name: "Meera Devi", patient_phone: "43210 98700", channel: "sms", type: "Follow-up Reminder", subject: "Follow-up due", content_preview: "Dear Meera, your follow-up with Dr.Saleem is due. Book: ayuzee.com/book", status: "failed", sent_at: "08:00 AM", triggered_by: "Auto (7-day follow-up)" },
  { id: "8", patient_name: "Rajesh Kumar", patient_phone: "98765 43210", channel: "whatsapp", type: "Prescription Shared", subject: "Your prescription", content_preview: "Hi Rajesh, your prescription from today's visit. Medicines: 1) Dashamool...", status: "delivered", sent_at: "11:00 AM", delivered_at: "11:00 AM", triggered_by: "Doctor (Dr. Saleem)" },
  { id: "9", patient_name: "Priya Sharma", patient_phone: "87654 32100", channel: "app", type: "Ayuzee Order Update", subject: "Order shipped!", content_preview: "Your order #AYU-2026-4521 has been shipped. Track: ...", status: "delivered", sent_at: "02:00 PM", delivered_at: "02:00 PM", triggered_by: "Ayuzee Shop" },
  { id: "10", patient_name: "Amit Patel", patient_phone: "76543 21000", channel: "whatsapp", type: "Panchakarma Schedule", subject: "Tomorrow's PK session", content_preview: "Hi Amit, your Abhyanga + Swedana session is tomorrow at 9AM. Room: PK-2...", status: "delivered", sent_at: "06:00 PM", delivered_at: "06:00 PM", triggered_by: "Auto (PK day-before)" },
];

const HmsNotificationHistory = () => {
  const [notifications, setNotifications] = useState<NotificationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("hms_notification_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      if (data && data.length > 0) {
        setNotifications(data.map((n: any) => ({
          id: n.id,
          patient_name: n.patient_name || "Patient",
          patient_phone: "",
          channel: n.channel || "whatsapp",
          type: n.notification_type || "general",
          subject: n.subject || "—",
          content_preview: n.content || "—",
          status: n.status || "sent",
          sent_at: n.created_at ? new Date(n.created_at).toLocaleString() : "—",
          triggered_by: "System",
        })));
      } else {
        setNotifications(mockNotifications);
      }
    } catch (err: any) {
      console.error("Notification load error:", err);
      setNotifications(mockNotifications);
    }
    setLoading(false);
  };

  const filtered = notifications.filter((n) => {
    const matchSearch = n.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.patient_phone.includes(searchTerm) ||
      n.content_preview.toLowerCase().includes(searchTerm.toLowerCase());
    const matchChannel = channelFilter === "all" || n.channel === channelFilter;
    const matchStatus = statusFilter === "all" || n.status === statusFilter;
    const matchType = typeFilter === "all" || n.type === typeFilter;
    return matchSearch && matchChannel && matchStatus && matchType;
  });

  const stats = {
    total: notifications.length,
    delivered: notifications.filter(n => n.status === "delivered" || n.status === "read").length,
    failed: notifications.filter(n => n.status === "failed").length,
    read: notifications.filter(n => n.status === "read").length,
  };

  const uniqueTypes = [...new Set(notifications.map(n => n.type))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" /> Notification History
          </h1>
          <p className="text-sm text-muted-foreground">
            Unified view of all SMS, WhatsApp, Email & App notifications sent to patients
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => window.location.href = "/hms/whatsapp"}>WhatsApp</Button>
          <Button size="sm" variant="outline" onClick={() => window.location.href = "/hms/feedback"}>Feedback</Button>
          <Button size="sm" variant="outline"><Download className="mr-1 h-4 w-4" /> Export</Button>
          <Button size="sm" variant="outline"><RefreshCw className="mr-1 h-4 w-4" /> Refresh</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total Sent Today</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-green-600">{stats.delivered}</p><p className="text-xs text-muted-foreground">Delivered</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-red-600">{stats.failed}</p><p className="text-xs text-muted-foreground">Failed</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-blue-600">{stats.read}</p><p className="text-xs text-muted-foreground">Read/Opened</p></CardContent></Card>
      </div>

      {/* Channel breakdown */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(channelConfig).map(([key, config]) => {
          const count = notifications.filter(n => n.channel === key).length;
          const Icon = config.icon;
          return (
            <Badge key={key} variant="outline" className={`${config.color} px-3 py-1.5 gap-1.5 cursor-pointer ${channelFilter === key ? "ring-2 ring-primary" : ""}`}
              onClick={() => setChannelFilter(channelFilter === key ? "all" : key)}>
              <Icon className="h-3.5 w-3.5" /> {config.label}: {count}
            </Badge>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search patient, phone or content..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {uniqueTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Notification List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Send className="h-4 w-4" /> Messages ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filtered.map((notif) => {
              const channel = channelConfig[notif.channel];
              const status = statusConfig[notif.status];
              const ChannelIcon = channel.icon;
              const StatusIcon = status.icon;
              return (
                <div key={notif.id} className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/20 transition">
                  {/* Channel Icon */}
                  <div className={`h-9 w-9 rounded-full grid place-items-center shrink-0 ${channel.color}`}>
                    <ChannelIcon className="h-4 w-4" />
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{notif.patient_name}</span>
                      <span className="text-xs text-muted-foreground">({notif.patient_phone})</span>
                      <Badge variant="outline" className="text-xs ml-auto shrink-0">{notif.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 truncate">{notif.content_preview}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><StatusIcon className={`h-3 w-3 ${status.color}`} /> {status.label}</span>
                      <span>Sent: {notif.sent_at}</span>
                      {notif.read_at && <span className="text-emerald-600">Read: {notif.read_at}</span>}
                      <span className="ml-auto">Via: {notif.triggered_by}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No notifications match your filters.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HmsNotificationHistory;
