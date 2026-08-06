import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  FileBarChart, Clock, Mail, MessageSquare, Send, Settings,
  TrendingUp, Users, IndianRupee, AlertTriangle, Calendar,
  CheckCircle, Plus
} from "lucide-react";

type ReportSchedule = {
  id: string;
  name: string;
  type: string;
  channel: string;
  time: string;
  days: string[];
  recipient: string;
  include_ayuzee: boolean;
  is_active: boolean;
  last_sent: string;
};

type ReportHistory = {
  id: string;
  date: string;
  revenue: number;
  patients: number;
  new_patients: number;
  pending_bills: number;
  no_shows: number;
  ayuzee_bookings: number;
  stock_alerts: number;
  status: "delivered" | "failed";
};

const mockSchedules: ReportSchedule[] = [
  { id: "1", name: "Daily Revenue Summary", type: "daily_summary", channel: "whatsapp", time: "20:00", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], recipient: "Dr. Saleem (Owner)", include_ayuzee: true, is_active: true, last_sent: "Yesterday 8:00 PM" },
  { id: "2", name: "Stock Alert Report", type: "stock_alert", channel: "email", time: "08:00", days: ["Mon", "Wed", "Fri"], recipient: "Pharmacist Ravi", include_ayuzee: false, is_active: true, last_sent: "Today 8:00 AM" },
  { id: "3", name: "No-Show Weekly Digest", type: "no_show_report", channel: "email", time: "09:00", days: ["Mon"], recipient: "Front Desk Manager", include_ayuzee: true, is_active: false, last_sent: "Last Monday" },
];

const mockHistory: ReportHistory[] = [
  { id: "1", date: "Today", revenue: 45600, patients: 32, new_patients: 5, pending_bills: 3, no_shows: 2, ayuzee_bookings: 8, stock_alerts: 4, status: "delivered" },
  { id: "2", date: "Yesterday", revenue: 52300, patients: 38, new_patients: 7, pending_bills: 1, no_shows: 1, ayuzee_bookings: 12, stock_alerts: 2, status: "delivered" },
  { id: "3", date: "2 days ago", revenue: 38900, patients: 28, new_patients: 3, pending_bills: 5, no_shows: 4, ayuzee_bookings: 6, stock_alerts: 6, status: "delivered" },
  { id: "4", date: "3 days ago", revenue: 41200, patients: 30, new_patients: 4, pending_bills: 2, no_shows: 0, ayuzee_bookings: 9, stock_alerts: 1, status: "failed" },
];

const channelIcons: Record<string, typeof Mail> = {
  email: Mail,
  whatsapp: MessageSquare,
  sms: Send,
};

const HmsEodReports = () => {
  const [schedules] = useState<ReportSchedule[]>(mockSchedules);
  const [history] = useState<ReportHistory[]>(mockHistory);

  const handleSendNow = () => {
    toast.success("EOD report generated and sent via WhatsApp!");
  };

  const todayReport = history[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <FileBarChart className="h-6 w-6 text-primary" /> End-of-Day Reports
          </h1>
          <p className="text-sm text-muted-foreground">
            Automated daily summaries via WhatsApp, Email & SMS
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => window.location.href = "/hms/accounts"}>Accounts</Button>
          <Button size="sm" variant="outline" onClick={() => window.location.href = "/hms/mis"}>MIS Reports</Button>
          <Button size="sm" variant="outline" onClick={handleSendNow}>
            <Send className="mr-1 h-4 w-4" /> Send Now
          </Button>
          <Button size="sm">
            <Plus className="mr-1 h-4 w-4" /> New Schedule
          </Button>
        </div>
      </div>

      {/* Today's Snapshot */}
      {todayReport && (
        <Card className="bg-gradient-to-r from-primary/5 to-blue-50/50 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Today's Snapshot</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              <div className="text-center">
                <p className="text-xl font-bold text-green-600">₹{todayReport.revenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Revenue</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">{todayReport.patients}</p>
                <p className="text-xs text-muted-foreground">Patients</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-blue-600">{todayReport.new_patients}</p>
                <p className="text-xs text-muted-foreground">New Patients</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-amber-600">{todayReport.pending_bills}</p>
                <p className="text-xs text-muted-foreground">Pending Bills</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-red-600">{todayReport.no_shows}</p>
                <p className="text-xs text-muted-foreground">No-Shows</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-purple-600">{todayReport.ayuzee_bookings}</p>
                <p className="text-xs text-muted-foreground">Ayuzee Bookings</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-orange-600">{todayReport.stock_alerts}</p>
                <p className="text-xs text-muted-foreground">Stock Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="schedules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedules">Report Schedules</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
        </TabsList>

        <TabsContent value="schedules">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" /> Configured Schedules ({schedules.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {schedules.map((schedule) => {
                const ChannelIcon = channelIcons[schedule.channel] || Mail;
                return (
                  <div key={schedule.id} className={`flex items-center justify-between rounded-lg border p-4 ${!schedule.is_active ? "opacity-50" : ""}`}>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 grid place-items-center">
                        <ChannelIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{schedule.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {schedule.recipient} · {schedule.time} · {schedule.days.join(", ")}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-xs">{schedule.channel}</Badge>
                          {schedule.include_ayuzee && <Badge variant="secondary" className="text-xs">+ Ayuzee Stats</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">Last: {schedule.last_sent}</span>
                      <Switch checked={schedule.is_active} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Report History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {history.map((report) => (
                  <div key={report.id} className="flex items-center justify-between rounded border p-3">
                    <div className="flex items-center gap-3">
                      {report.status === "delivered" ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{report.date}</p>
                        <p className="text-xs text-muted-foreground">
                          ₹{report.revenue.toLocaleString()} · {report.patients} patients · {report.ayuzee_bookings} Ayuzee bookings
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={report.status === "delivered" ? "outline" : "destructive"}>
                        {report.status}
                      </Badge>
                      <Button size="sm" variant="ghost">View</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsEodReports;
