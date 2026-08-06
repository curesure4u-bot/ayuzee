import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Stethoscope, Users, Search, FileText, Eye, Download,
  Bell, CheckCircle2, Clock, AlertTriangle, TrendingUp,
  IndianRupee, Phone, MessageSquare, Brain, FlaskConical,
} from "lucide-react";

interface ReferredPatient {
  id: string;
  patientName: string;
  patientId: string;
  age: number;
  gender: string;
  testName: string;
  orderNo: string;
  orderDate: string;
  reportStatus: "Ordered" | "In Progress" | "Ready" | "Critical";
  reportDate?: string;
  criticalAlert?: string;
}

interface DoctorNotification {
  id: string;
  type: "Report Ready" | "Critical Alert" | "Commission Paid" | "New Referral" | "Reminder";
  message: string;
  timestamp: string;
  isRead: boolean;
  patientName?: string;
  orderNo?: string;
}

interface DoctorStats {
  totalReferrals: number;
  thisMonthReferrals: number;
  reportsReady: number;
  criticalAlerts: number;
  pendingReports: number;
  commissionEarned: number;
  commissionPending: number;
}

const mockStats: DoctorStats = {
  totalReferrals: 156, thisMonthReferrals: 24, reportsReady: 18,
  criticalAlerts: 2, pendingReports: 6, commissionEarned: 28350, commissionPending: 8400,
};

const mockPatients: ReferredPatient[] = [
  { id: "1", patientName: "Mr. Rajesh Kumar", patientId: "AL-12543", age: 52, gender: "M", testName: "RFT + Electrolytes", orderNo: "ORD-2026-0047", orderDate: "2026-07-24", reportStatus: "Critical", reportDate: "2026-07-24", criticalAlert: "Potassium 7.2 mEq/L - Life threatening" },
  { id: "2", patientName: "Mr. Suresh Babu", patientId: "AL-15320", age: 38, gender: "M", testName: "Lipid Profile + LFT + HbA1c + Thyroid", orderNo: "ORD-2026-0049", orderDate: "2026-07-24", reportStatus: "In Progress" },
  { id: "3", patientName: "Mrs. Priya Sharma", patientId: "AL-13105", age: 30, gender: "F", testName: "Thyroid Profile", orderNo: "ORD-2026-0045", orderDate: "2026-07-24", reportStatus: "Ready", reportDate: "2026-07-24" },
  { id: "4", patientName: "Mr. Venkat Rao", patientId: "AL-16025", age: 55, gender: "M", testName: "Culture & Sensitivity", orderNo: "ORD-2026-0051", orderDate: "2026-07-24", reportStatus: "In Progress" },
  { id: "5", patientName: "Mrs. Saraswathi", patientId: "AL-16050", age: 60, gender: "F", testName: "X-Ray Knee + CBC", orderNo: "ORD-2026-0052", orderDate: "2026-07-24", reportStatus: "Ready", reportDate: "2026-07-24" },
  { id: "6", patientName: "Mr. Arun Prasad", patientId: "AL-12980", age: 42, gender: "M", testName: "HbA1c", orderNo: "ORD-2026-0046", orderDate: "2026-07-24", reportStatus: "Ready", reportDate: "2026-07-24" },
  { id: "7", patientName: "Ms. Kavitha R", patientId: "AL-16001", age: 28, gender: "F", testName: "Urine Routine", orderNo: "ORD-2026-0050", orderDate: "2026-07-24", reportStatus: "Ordered" },
];

const mockNotifications: DoctorNotification[] = [
  { id: "n1", type: "Critical Alert", message: "CRITICAL: Potassium 7.2 mEq/L for Mr. Rajesh Kumar. Immediate action needed.", timestamp: "2026-07-24 10:45 AM", isRead: false, patientName: "Mr. Rajesh Kumar", orderNo: "ORD-2026-0047" },
  { id: "n2", type: "Report Ready", message: "Thyroid Profile report ready for Mrs. Priya Sharma.", timestamp: "2026-07-24 10:30 AM", isRead: false, patientName: "Mrs. Priya Sharma", orderNo: "ORD-2026-0045" },
  { id: "n3", type: "Report Ready", message: "X-Ray Knee + CBC report ready for Mrs. Saraswathi.", timestamp: "2026-07-24 10:15 AM", isRead: true, patientName: "Mrs. Saraswathi", orderNo: "ORD-2026-0052" },
  { id: "n4", type: "Report Ready", message: "HbA1c report ready for Mr. Arun Prasad. Value: 11.2% (High).", timestamp: "2026-07-24 09:45 AM", isRead: true, patientName: "Mr. Arun Prasad", orderNo: "ORD-2026-0046" },
  { id: "n5", type: "Commission Paid", message: "Commission of ₹9,180 settled via bank transfer for June 2026.", timestamp: "2026-07-05 10:00 AM", isRead: true },
  { id: "n6", type: "New Referral", message: "New patient Ms. Kavitha R registered via your referral.", timestamp: "2026-07-24 09:30 AM", isRead: true, patientName: "Ms. Kavitha R" },
];

const DoctorPortal = () => {
  const [patients] = useState<ReferredPatient[]>(mockPatients);
  const [notifications] = useState<DoctorNotification[]>(mockNotifications);
  const [stats] = useState<DoctorStats>(mockStats);
  const [activeTab, setActiveTab] = useState("patients");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredPatients = patients.filter((p) => {
    const matchSearch = p.patientName.toLowerCase().includes(search.toLowerCase()) || p.orderNo.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || p.reportStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusColor = (s: string) => {
    switch (s) { case "Ready": return "bg-green-100 text-green-700"; case "In Progress": return "bg-amber-100 text-amber-700"; case "Ordered": return "bg-blue-100 text-blue-700"; case "Critical": return "bg-red-100 text-red-700"; default: return "bg-gray-100 text-gray-700"; }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2">
          <Stethoscope className="h-5 w-5" /> Doctor / Referring Portal
        </h2>
        <Badge variant="outline" className="text-blue-600 border-blue-300">
          <Stethoscope className="h-3 w-3 mr-1" /> Dr. Mohamad Saleem
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card><CardContent className="p-3 text-center"><Users className="h-4 w-4 mx-auto text-blue-600" /><p className="text-lg font-bold text-blue-600 mt-1">{stats.thisMonthReferrals}</p><p className="text-[9px] text-muted-foreground">This Month</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><CheckCircle2 className="h-4 w-4 mx-auto text-green-600" /><p className="text-lg font-bold text-green-600 mt-1">{stats.reportsReady}</p><p className="text-[9px] text-muted-foreground">Reports Ready</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><Clock className="h-4 w-4 mx-auto text-amber-600" /><p className="text-lg font-bold text-amber-600 mt-1">{stats.pendingReports}</p><p className="text-[9px] text-muted-foreground">Pending</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><AlertTriangle className="h-4 w-4 mx-auto text-red-600" /><p className="text-lg font-bold text-red-600 mt-1">{stats.criticalAlerts}</p><p className="text-[9px] text-muted-foreground">Critical</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><TrendingUp className="h-4 w-4 mx-auto text-purple-600" /><p className="text-lg font-bold text-purple-600 mt-1">{stats.totalReferrals}</p><p className="text-[9px] text-muted-foreground">Total Referrals</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><IndianRupee className="h-4 w-4 mx-auto text-green-600" /><p className="text-lg font-bold text-green-600 mt-1">₹{(stats.commissionEarned / 1000).toFixed(0)}K</p><p className="text-[9px] text-muted-foreground">Earned</p></CardContent></Card>
        <Card className="border-orange-200"><CardContent className="p-3 text-center"><IndianRupee className="h-4 w-4 mx-auto text-orange-600" /><p className="text-lg font-bold text-orange-600 mt-1">₹{(stats.commissionPending / 1000).toFixed(1)}K</p><p className="text-[9px] text-muted-foreground">Pending</p></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="patients">My Patients</TabsTrigger>
          <TabsTrigger value="notifications">Notifications <Badge className="ml-1 h-4 text-[9px] bg-red-600 text-white">{notifications.filter(n => !n.isRead).length}</Badge></TabsTrigger>
          <TabsTrigger value="order">Quick Order</TabsTrigger>
        </TabsList>

        {/* My Patients Tab */}
        <TabsContent value="patients" className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input className="pl-8 h-8 text-xs" placeholder="Search patient, order..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="Ready">Ready</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="Ordered">Ordered</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-3 py-2 text-left">Patient</th>
                  <th className="px-3 py-2 text-left">Tests</th>
                  <th className="px-3 py-2 text-left">Order</th>
                  <th className="px-3 py-2 text-center">Status</th>
                  <th className="px-3 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((pt) => (
                  <tr key={pt.id} className={`border-b ${pt.reportStatus === "Critical" ? "bg-red-50" : ""}`}>
                    <td className="px-3 py-2">
                      <p className="font-medium">{pt.patientName}</p>
                      <p className="text-[10px] text-muted-foreground">{pt.patientId} | {pt.age}y/{pt.gender}</p>
                    </td>
                    <td className="px-3 py-2">{pt.testName}</td>
                    <td className="px-3 py-2 text-muted-foreground">{pt.orderNo}<br /><span className="text-[10px]">{pt.orderDate}</span></td>
                    <td className="px-3 py-2 text-center">
                      <Badge className={`text-[9px] ${getStatusColor(pt.reportStatus)}`}>{pt.reportStatus}</Badge>
                      {pt.criticalAlert && <p className="text-[9px] text-red-600 mt-0.5 font-medium">{pt.criticalAlert}</p>}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex gap-1 justify-center">
                        {(pt.reportStatus === "Ready" || pt.reportStatus === "Critical") && (
                          <>
                            <Button size="sm" variant="outline" className="h-5 text-[9px]" onClick={() => toast.info("Report opened")}><Eye className="h-3 w-3" /></Button>
                            <Button size="sm" variant="outline" className="h-5 text-[9px]" onClick={() => toast.info("PDF downloaded")}><Download className="h-3 w-3" /></Button>
                          </>
                        )}
                        {pt.reportStatus === "Critical" && (
                          <Button size="sm" className="h-5 text-[9px] bg-red-600" onClick={() => toast.success("Alert acknowledged")}><AlertTriangle className="h-3 w-3" /></Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-3">
          <Card><CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto">
              {notifications.map((notif) => (
                <div key={notif.id} className={`flex items-start gap-3 px-4 py-3 border-b ${!notif.isRead ? "bg-blue-50" : ""} ${notif.type === "Critical Alert" ? "bg-red-50" : ""}`}>
                  <div className="mt-0.5">
                    {notif.type === "Critical Alert" && <AlertTriangle className="h-4 w-4 text-red-600" />}
                    {notif.type === "Report Ready" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                    {notif.type === "Commission Paid" && <IndianRupee className="h-4 w-4 text-green-600" />}
                    {notif.type === "New Referral" && <Users className="h-4 w-4 text-blue-600" />}
                    {notif.type === "Reminder" && <Bell className="h-4 w-4 text-amber-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[9px]">{notif.type}</Badge>
                      {!notif.isRead && <div className="h-2 w-2 rounded-full bg-blue-600" />}
                    </div>
                    <p className="text-xs mt-0.5">{notif.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{notif.timestamp}</p>
                  </div>
                  {notif.orderNo && (
                    <Button size="sm" variant="outline" className="h-6 text-[9px] shrink-0" onClick={() => toast.info("Report opened")}><Eye className="h-3 w-3 mr-0.5" /> View</Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent></Card>
        </TabsContent>

        {/* Quick Order Tab */}
        <TabsContent value="order" className="space-y-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><FlaskConical className="h-4 w-4 text-green-600" /> Quick Lab Order</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">Order tests directly for your patients. They'll be notified to visit the lab.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium">Patient Name</label>
                  <Input className="h-8 text-xs" placeholder="Enter patient name" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Phone Number</label>
                  <Input className="h-8 text-xs" placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Age / Gender</label>
                  <div className="flex gap-2">
                    <Input className="h-8 text-xs w-[60px]" placeholder="Age" type="number" />
                    <Select defaultValue="Male"><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Priority</label>
                  <Select defaultValue="Routine"><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Routine">Routine</SelectItem><SelectItem value="Urgent">Urgent</SelectItem><SelectItem value="STAT">STAT</SelectItem></SelectContent></Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Tests / Packages</label>
                <Input className="h-8 text-xs" placeholder="Type to search tests... (e.g., CBC, RFT, Lipid Profile)" />
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">CBC ×</Badge>
                  <Badge variant="outline" className="text-xs">RFT ×</Badge>
                  <Badge variant="outline" className="text-xs">Lipid Profile ×</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Clinical Notes (Optional)</label>
                <Input className="h-8 text-xs" placeholder="Symptoms, suspected diagnosis, special instructions..." />
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => toast.success("Lab order placed! Patient will be notified.")}>
                  <FlaskConical className="mr-1 h-3 w-3" /> Place Order
                </Button>
                <Button size="sm" variant="outline" onClick={() => toast.info("Order + appointment booked")}>
                  <FlaskConical className="mr-1 h-3 w-3" /> Order + Book Slot
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorPortal;
