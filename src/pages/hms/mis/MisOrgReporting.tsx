import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Users, Building2, Mail, Phone, MessageSquare, Clock, Calendar,
  Brain, Sparkles, Shield, ChevronRight, CheckCircle2, Bell,
  Send, Eye, Settings, Zap, Crown, UserCog, ArrowDown
} from "lucide-react";

type OrgMember = {
  id: string;
  name: string;
  role: string;
  department: string;
  reportsTo: string | null;
  email: string;
  phone: string;
  reportAccess: string[];
  level: number;
};

const orgChart: OrgMember[] = [
  { id: "1", name: "Dr. Mohamad Saleem", role: "Managing Director", department: "Management", reportsTo: null, email: "md@alshifa.com", phone: "98xxx00001", reportAccess: ["all"], level: 0 },
  { id: "2", name: "Dr. Sivarama Krishnan", role: "Chief Medical Officer", department: "Clinical", reportsTo: "1", email: "cmo@alshifa.com", phone: "98xxx00002", reportAccess: ["collection", "visits", "patients", "test-orders", "appointments", "income-consultant"], level: 1 },
  { id: "3", name: "Rajamani", role: "Operations Manager", department: "Operations", reportsTo: "1", email: "ops@alshifa.com", phone: "98xxx00003", reportAccess: ["all-accounts", "stocks", "expense", "attendance", "assets"], level: 1 },
  { id: "4", name: "Kumar", role: "Senior Cashier / Accounts", department: "Finance", reportsTo: "3", email: "accounts@alshifa.com", phone: "98xxx00004", reportAccess: ["collection", "income", "expense", "settlement", "credit-bills"], level: 2 },
  { id: "5", name: "Priya", role: "Pharmacist In-Charge", department: "Pharmacy", reportsTo: "3", email: "pharmacy@alshifa.com", phone: "98xxx00005", reportAccess: ["stocks", "sale", "purchase", "expiry", "current-stock"], level: 2 },
  { id: "6", name: "Anitha", role: "Lab In-Charge", department: "Laboratory", reportsTo: "2", email: "lab@alshifa.com", phone: "98xxx00006", reportAccess: ["test-orders", "lab-consumables", "tat"], level: 2 },
  { id: "7", name: "Lakshmi", role: "Therapy Head", department: "Panchakarma", reportsTo: "2", email: "therapy@alshifa.com", phone: "98xxx00007", reportAccess: ["therapy", "visits-therapy", "income-therapy"], level: 2 },
  { id: "8", name: "Front Desk Staff", role: "Receptionist", department: "Front Office", reportsTo: "3", email: "reception@alshifa.com", phone: "98xxx00008", reportAccess: ["appointments", "registration", "checked-in"], level: 2 },
];

type ScheduledReport = {
  id: string;
  name: string;
  reports: string[];
  frequency: "daily" | "weekly" | "monthly" | "quarterly";
  time: string;
  dayOfWeek?: string;
  dayOfMonth?: number;
  recipients: { name: string; method: "email" | "whatsapp" | "sms"; contact: string }[];
  includeAISummary: boolean;
  includeCharts: boolean;
  active: boolean;
  lastSent?: string;
  nextSend: string;
};

const scheduledReports: ScheduledReport[] = [
  {
    id: "1", name: "Daily Collection Summary", reports: ["Daily Summary", "Net Collection", "Expense"],
    frequency: "daily", time: "09:00 PM", recipients: [
      { name: "Dr. Mohamad Saleem", method: "whatsapp", contact: "98xxx00001" },
      { name: "Rajamani", method: "email", contact: "ops@alshifa.com" },
    ], includeAISummary: true, includeCharts: true, active: true, lastSent: "Jul 21, 9:00 PM", nextSend: "Jul 22, 9:00 PM"
  },
  {
    id: "2", name: "Weekly Performance Report", reports: ["Income By Consultant", "Visits per Dr", "Target vs Achieved", "Expense By Type"],
    frequency: "weekly", time: "08:00 AM", dayOfWeek: "Monday", recipients: [
      { name: "Dr. Mohamad Saleem", method: "email", contact: "md@alshifa.com" },
      { name: "Dr. Sivarama Krishnan", method: "whatsapp", contact: "98xxx00002" },
      { name: "Rajamani", method: "whatsapp", contact: "98xxx00003" },
    ], includeAISummary: true, includeCharts: true, active: true, lastSent: "Jul 21, 8:00 AM", nextSend: "Jul 28, 8:00 AM"
  },
  {
    id: "3", name: "Monthly P&L + MIS Package", reports: ["Total Income", "Total Expense", "Outstanding Due", "Credit Bills", "Settlement", "Stock Value", "Franchise"],
    frequency: "monthly", time: "10:00 AM", dayOfMonth: 1, recipients: [
      { name: "Dr. Mohamad Saleem", method: "email", contact: "md@alshifa.com" },
      { name: "CA/Accountant", method: "email", contact: "ca@alshifa.com" },
    ], includeAISummary: true, includeCharts: true, active: true, lastSent: "Jul 01, 10:00 AM", nextSend: "Aug 01, 10:00 AM"
  },
  {
    id: "4", name: "Stock & Expiry Alert", reports: ["Expiry List", "Reorder List", "Slow Moving"],
    frequency: "weekly", time: "09:00 AM", dayOfWeek: "Wednesday", recipients: [
      { name: "Priya (Pharmacy)", method: "whatsapp", contact: "98xxx00005" },
      { name: "Rajamani", method: "sms", contact: "98xxx00003" },
    ], includeAISummary: true, includeCharts: false, active: true, lastSent: "Jul 16, 9:00 AM", nextSend: "Jul 23, 9:00 AM"
  },
  {
    id: "5", name: "Quarterly Board Report", reports: ["Full MIS Package", "Branch Comparison", "Incentive Summary", "Franchise P&L"],
    frequency: "quarterly", time: "10:00 AM", recipients: [
      { name: "Dr. Mohamad Saleem", method: "email", contact: "md@alshifa.com" },
      { name: "Board Members", method: "email", contact: "board@alshifa.com" },
    ], includeAISummary: true, includeCharts: true, active: true, lastSent: "Apr 01, 10:00 AM", nextSend: "Oct 01, 10:00 AM"
  },
  {
    id: "6", name: "Lab TAT Alert", reports: ["TAT By Test", "Delayed Orders", "Abnormal Results"],
    frequency: "daily", time: "06:00 PM", recipients: [
      { name: "Dr. Sivarama Krishnan", method: "whatsapp", contact: "98xxx00002" },
      { name: "Anitha (Lab)", method: "sms", contact: "98xxx00006" },
    ], includeAISummary: true, includeCharts: false, active: true, lastSent: "Jul 21, 6:00 PM", nextSend: "Jul 22, 6:00 PM"
  },
];

const deliveryLog = [
  { time: "Jul 22, 6:00 PM", report: "Lab TAT Alert", recipient: "Dr. Sivarama (WhatsApp)", status: "delivered", aiSummary: "All TAT within SLA. 1 pending order." },
  { time: "Jul 21, 9:00 PM", report: "Daily Collection Summary", recipient: "Dr. Saleem (WhatsApp)", status: "delivered", aiSummary: "₹60,700 collected. +18% vs avg. GPay dominant." },
  { time: "Jul 21, 9:00 PM", report: "Daily Collection Summary", recipient: "Rajamani (Email)", status: "delivered", aiSummary: "Full report with charts attached as PDF." },
  { time: "Jul 21, 8:00 AM", report: "Weekly Performance", recipient: "All 3 recipients", status: "delivered", aiSummary: "Revenue on track. Dr.Sivarama at 89% target." },
  { time: "Jul 16, 9:00 AM", report: "Stock & Expiry Alert", recipient: "Priya (WhatsApp)", status: "delivered", aiSummary: "5 items near expiry. 3 items need reorder." },
  { time: "Jul 01, 10:00 AM", report: "Monthly P&L Package", recipient: "MD + CA (Email)", status: "delivered", aiSummary: "Jun revenue ₹7.25L, profit margin 28.4%." },
];

const MisOrgReporting = () => {
  const [activeTab, setActiveTab] = useState("org-chart");

  const renderOrgNode = (member: OrgMember, indent: number) => (
    <div key={member.id} className={`ml-${indent * 6} ${indent > 0 ? "border-l-2 border-primary/20 pl-4" : ""}`}>
      <div className="flex items-center justify-between p-3 rounded border hover:border-primary/30 transition-colors mb-2">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            member.level === 0 ? "bg-primary text-white" :
            member.level === 1 ? "bg-primary/20 text-primary" :
            "bg-muted text-muted-foreground"
          }`}>
            {member.level === 0 ? <Crown className="h-4 w-4" /> : member.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-sm">{member.name}</p>
            <p className="text-xs text-muted-foreground">{member.role} · {member.department}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">{member.reportAccess.length === 1 && member.reportAccess[0] === "all" ? "Full Access" : `${member.reportAccess.length} reports`}</Badge>
          <div className="flex gap-1">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <Phone className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 mt-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="org-chart"><Users className="mr-1 h-3.5 w-3.5" /> Org & Reporting</TabsTrigger>
          <TabsTrigger value="schedules"><Clock className="mr-1 h-3.5 w-3.5" /> Auto Schedules</TabsTrigger>
          <TabsTrigger value="delivery-log"><Send className="mr-1 h-3.5 w-3.5" /> Delivery Log</TabsTrigger>
          <TabsTrigger value="create-schedule"><Bell className="mr-1 h-3.5 w-3.5" /> New Schedule</TabsTrigger>
          <TabsTrigger value="access-control"><Shield className="mr-1 h-3.5 w-3.5" /> Access Control</TabsTrigger>
        </TabsList>

        {/* ORG CHART */}
        <TabsContent value="org-chart" className="space-y-4 mt-4">
          <Card className="border-primary/20">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <Brain className="h-4 w-4 text-primary mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-primary">Reporting Hierarchy: </span>
                  Reports auto-flow up the chain. Each role sees only their permitted reports.
                  AI generates role-appropriate summaries for each level.
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Organization Reporting Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {/* Level 0 - MD */}
                {orgChart.filter(m => m.level === 0).map(m => renderOrgNode(m, 0))}
                {/* Level 1 */}
                <div className="ml-6 border-l-2 border-primary/20 pl-4 space-y-1">
                  {orgChart.filter(m => m.level === 1).map(m => (
                    <div key={m.id}>
                      {renderOrgNode(m, 0)}
                      {/* Level 2 under this person */}
                      <div className="ml-6 border-l-2 border-muted pl-4 space-y-1">
                        {orgChart.filter(sub => sub.reportsTo === m.id).map(sub => renderOrgNode(sub, 0))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AUTO SCHEDULES */}
        <TabsContent value="schedules" className="space-y-3 mt-4">
          {scheduledReports.map((sr) => (
            <Card key={sr.id} className={sr.active ? "border-green-200" : "opacity-60"}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{sr.name}</p>
                      <Badge className={
                        sr.frequency === "daily" ? "bg-blue-100 text-blue-700" :
                        sr.frequency === "weekly" ? "bg-green-100 text-green-700" :
                        sr.frequency === "monthly" ? "bg-purple-100 text-purple-700" :
                        "bg-amber-100 text-amber-700"
                      }>
                        {sr.frequency}
                      </Badge>
                      {sr.includeAISummary && <Badge variant="outline" className="text-[10px]"><Brain className="mr-0.5 h-2.5 w-2.5" /> AI Summary</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {sr.time} {sr.dayOfWeek ? `(${sr.dayOfWeek})` : sr.dayOfMonth ? `(Day ${sr.dayOfMonth})` : "(Daily)"}</span>
                      <span>Next: {sr.nextSend}</span>
                      {sr.lastSent && <span>Last: {sr.lastSent}</span>}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {sr.reports.map((r, i) => <Badge key={i} variant="outline" className="text-[10px]">{r}</Badge>)}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {sr.recipients.map((rec, i) => (
                        <Badge key={i} className="text-[10px] bg-muted text-foreground">
                          {rec.method === "email" && <Mail className="mr-0.5 h-2.5 w-2.5" />}
                          {rec.method === "whatsapp" && <MessageSquare className="mr-0.5 h-2.5 w-2.5" />}
                          {rec.method === "sms" && <Phone className="mr-0.5 h-2.5 w-2.5" />}
                          {rec.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked={sr.active} />
                    <Button size="sm" variant="ghost" className="h-7 text-xs"><Settings className="h-3 w-3" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* DELIVERY LOG */}
        <TabsContent value="delivery-log" className="space-y-3 mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Time</th>
                      <th className="px-3 py-2 text-left font-medium">Report</th>
                      <th className="px-3 py-2 text-left font-medium">Recipient</th>
                      <th className="px-3 py-2 text-center font-medium">Status</th>
                      <th className="px-3 py-2 text-left font-medium">AI Summary Sent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveryLog.map((log, i) => (
                      <tr key={i} className="border-b hover:bg-muted/30">
                        <td className="px-3 py-2">{log.time}</td>
                        <td className="px-3 py-2 font-medium">{log.report}</td>
                        <td className="px-3 py-2">{log.recipient}</td>
                        <td className="px-3 py-2 text-center">
                          <Badge className="bg-green-100 text-green-700 text-[10px]">
                            <CheckCircle2 className="mr-0.5 h-2.5 w-2.5" /> {log.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground italic">"{log.aiSummary}"</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CREATE NEW SCHEDULE */}
        <TabsContent value="create-schedule" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Create Auto Report Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-xs">Schedule Name *</Label>
                  <Input placeholder="e.g., Daily Revenue to MD" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Frequency *</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Send Time *</Label>
                  <Input type="time" defaultValue="21:00" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Day (for weekly/monthly)</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select day" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monday">Monday</SelectItem>
                      <SelectItem value="tuesday">Tuesday</SelectItem>
                      <SelectItem value="wednesday">Wednesday</SelectItem>
                      <SelectItem value="thursday">Thursday</SelectItem>
                      <SelectItem value="friday">Friday</SelectItem>
                      <SelectItem value="saturday">Saturday</SelectItem>
                      <SelectItem value="sunday">Sunday</SelectItem>
                      <SelectItem value="1">1st of Month</SelectItem>
                      <SelectItem value="15">15th of Month</SelectItem>
                      <SelectItem value="last">Last Day of Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-xs">Select Reports to Include *</Label>
                  <div className="flex flex-wrap gap-2 p-2 border rounded max-h-32 overflow-y-auto">
                    {["Daily Summary", "Net Collection", "Total Income", "Total Expense", "Income By Consultant",
                      "Outstanding Due", "Credit Bills", "Settlement", "Stock Value", "Expiry Alert",
                      "Visits per Dr", "Target vs Achieved", "Franchise Report", "Incentive Report"
                    ].map((r, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <Checkbox id={`rep-${i}`} defaultChecked={i < 3} />
                        <label htmlFor={`rep-${i}`} className="text-[10px]">{r}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recipients */}
              <div className="mt-4 space-y-3">
                <Label className="text-xs font-medium">Recipients & Delivery Method</Label>
                <div className="space-y-2">
                  {[1, 2].map((_, i) => (
                    <div key={i} className="grid grid-cols-4 gap-2 items-end">
                      <Select>
                        <SelectTrigger><SelectValue placeholder="Select person" /></SelectTrigger>
                        <SelectContent>
                          {orgChart.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select defaultValue={i === 0 ? "whatsapp" : "email"}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input placeholder="Contact (auto-filled)" />
                      <Button variant="ghost" size="sm" className="text-xs text-red-500">Remove</Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="text-xs">+ Add Recipient</Button>
                </div>
              </div>

              {/* AI Options */}
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-2 p-3 rounded border">
                  <Switch defaultChecked />
                  <div>
                    <p className="text-xs font-medium">Include AI Summary</p>
                    <p className="text-[10px] text-muted-foreground">Auto narrative interpretation</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded border">
                  <Switch defaultChecked />
                  <div>
                    <p className="text-xs font-medium">Include Charts</p>
                    <p className="text-[10px] text-muted-foreground">Visual graphs in report</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded border">
                  <Switch />
                  <div>
                    <p className="text-xs font-medium">Alert on Anomaly</p>
                    <p className="text-[10px] text-muted-foreground">Instant alert if unusual</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline">Preview</Button>
                <Button><Bell className="mr-1 h-4 w-4" /> Create Schedule</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ACCESS CONTROL */}
        <TabsContent value="access-control" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" /> Role-Based Report Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Person</th>
                      <th className="px-3 py-2 text-left font-medium">Role</th>
                      <th className="px-3 py-2 text-left font-medium">Reports To</th>
                      <th className="px-3 py-2 text-left font-medium">Report Access</th>
                      <th className="px-3 py-2 text-center font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orgChart.map((m) => (
                      <tr key={m.id} className="border-b hover:bg-muted/30">
                        <td className="px-3 py-2 font-medium">{m.name}</td>
                        <td className="px-3 py-2">{m.role}</td>
                        <td className="px-3 py-2">{m.reportsTo ? orgChart.find(o => o.id === m.reportsTo)?.name : "—"}</td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-1">
                            {m.reportAccess.slice(0, 3).map((r, i) => (
                              <Badge key={i} variant="outline" className="text-[9px]">{r}</Badge>
                            ))}
                            {m.reportAccess.length > 3 && <Badge variant="outline" className="text-[9px]">+{m.reportAccess.length - 3}</Badge>}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <Button size="sm" variant="ghost" className="h-6 text-[10px]"><UserCog className="h-3 w-3" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-primary mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-primary">AI Access Policy: </span>
                  Reports auto-filter based on role. Cashier sees only collection data. Lab head sees only lab reports. 
                  MD sees everything. AI generates appropriate detail level per recipient — 
                  MD gets executive summary, department heads get detailed operational data.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MisOrgReporting;
