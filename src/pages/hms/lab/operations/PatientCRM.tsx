import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Users, Search, Heart, Calendar, Bell, Phone,
  MessageSquare, TrendingUp, AlertTriangle, Clock,
  CheckCircle2, UserPlus, Activity, Star, Gift,
  RefreshCw, Mail, Filter,
} from "lucide-react";

interface CRMPatient {
  id: string;
  patientId: string;
  name: string;
  phone: string;
  age: number;
  gender: string;
  dob?: string;
  email?: string;
  firstVisit: string;
  lastVisit: string;
  totalVisits: number;
  totalSpent: number;
  lifetimeValue: number;
  segment: "VIP" | "Regular" | "Inactive" | "New" | "At Risk";
  dueTests: string[];
  nextRecallDate?: string;
  recallStatus: "Due" | "Overdue" | "Contacted" | "Booked" | "Not Due";
  lastTestNames: string;
  abnormalHistory: boolean;
  birthday?: string;
  preferences: string[];
}

interface RecallAlert {
  id: string;
  patientName: string;
  patientId: string;
  phone: string;
  dueTest: string;
  lastDoneDate: string;
  daysSinceLast: number;
  recommendedFrequency: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "Contacted" | "Booked" | "Declined";
  reason: string;
}

const mockPatients: CRMPatient[] = [
  { id: "1", patientId: "AL-12543", name: "Mr. Rajesh Kumar", phone: "+91 98765 43210", age: 52, gender: "Male", dob: "1974-03-15", email: "rajesh@email.com", firstVisit: "2024-08-10", lastVisit: "2026-07-24", totalVisits: 18, totalSpent: 32500, lifetimeValue: 32500, segment: "VIP", dueTests: ["HbA1c (quarterly)", "RFT (monthly)"], nextRecallDate: "2026-08-24", recallStatus: "Not Due", lastTestNames: "RFT + Electrolytes", abnormalHistory: true, birthday: "Mar 15", preferences: ["Morning slots", "WhatsApp reports"] },
  { id: "2", patientId: "AL-14201", name: "Mrs. Lakshmi Devi", phone: "+91 87654 32109", age: 45, gender: "Female", firstVisit: "2025-01-15", lastVisit: "2026-07-24", totalVisits: 8, totalSpent: 12800, lifetimeValue: 12800, segment: "Regular", dueTests: ["CBC (monthly)", "Iron Studies (3 months)"], nextRecallDate: "2026-08-24", recallStatus: "Not Due", lastTestNames: "CBC + Iron Studies", abnormalHistory: true, birthday: "Sep 22", preferences: ["Home collection"] },
  { id: "3", patientId: "AL-15320", name: "Mr. Suresh Babu", phone: "+91 76543 21098", age: 38, gender: "Male", email: "suresh.b@email.com", firstVisit: "2025-06-10", lastVisit: "2026-07-24", totalVisits: 5, totalSpent: 8500, lifetimeValue: 8500, segment: "Regular", dueTests: ["Lipid Profile (6 months)", "HbA1c (3 months)"], nextRecallDate: "2026-10-24", recallStatus: "Not Due", lastTestNames: "Lipid + LFT + HbA1c + Thyroid", abnormalHistory: true, preferences: ["Online payment"] },
  { id: "4", patientId: "AL-13105", name: "Mrs. Priya Sharma", phone: "+91 65432 10987", age: 30, gender: "Female", firstVisit: "2025-03-20", lastVisit: "2026-07-24", totalVisits: 12, totalSpent: 15600, lifetimeValue: 15600, segment: "VIP", dueTests: ["Thyroid (3 months)"], nextRecallDate: "2026-10-24", recallStatus: "Not Due", lastTestNames: "Thyroid Profile", abnormalHistory: false, birthday: "Dec 05", preferences: ["Email reports", "Evening slots"] },
  { id: "5", patientId: "AL-11200", name: "Mr. Kannan S", phone: "+91 98765 11200", age: 60, gender: "Male", firstVisit: "2024-02-15", lastVisit: "2025-12-10", totalVisits: 10, totalSpent: 18200, lifetimeValue: 18200, segment: "At Risk", dueTests: ["Full Body Checkup (annual)", "PSA"], nextRecallDate: "2026-06-10", recallStatus: "Overdue", lastTestNames: "Full Body Checkup", abnormalHistory: true, preferences: [] },
  { id: "6", patientId: "AL-10850", name: "Mrs. Sumathi R", phone: "+91 87654 10850", age: 55, gender: "Female", firstVisit: "2024-05-01", lastVisit: "2025-10-15", totalVisits: 6, totalSpent: 9400, lifetimeValue: 9400, segment: "Inactive", dueTests: ["Thyroid (6 months)", "Vitamin D (annual)"], nextRecallDate: "2026-04-15", recallStatus: "Overdue", lastTestNames: "Thyroid + Vit D", abnormalHistory: false, preferences: [] },
  { id: "7", patientId: "AL-19500", name: "Mr. Arjun P", phone: "+91 99887 76655", age: 25, gender: "Male", firstVisit: "2026-07-25", lastVisit: "2026-07-25", totalVisits: 0, totalSpent: 0, lifetimeValue: 0, segment: "New", dueTests: [], recallStatus: "Not Due", lastTestNames: "Upcoming: Full Body Checkup", abnormalHistory: false, preferences: ["Online booking"] },
];

const mockRecalls: RecallAlert[] = [
  { id: "rc1", patientName: "Mr. Kannan S", patientId: "AL-11200", phone: "+91 98765 11200", dueTest: "Full Body Checkup", lastDoneDate: "2025-12-10", daysSinceLast: 226, recommendedFrequency: "Annual", priority: "High", status: "Pending", reason: "Annual checkup overdue. Previous abnormals in sugar and lipid." },
  { id: "rc2", patientName: "Mrs. Sumathi R", patientId: "AL-10850", phone: "+91 87654 10850", dueTest: "Thyroid Profile", lastDoneDate: "2025-10-15", daysSinceLast: 282, recommendedFrequency: "6 Monthly", priority: "High", status: "Contacted", reason: "Hypothyroid patient. Thyroid check overdue by 3 months." },
  { id: "rc3", patientName: "Mr. Rajesh Kumar", patientId: "AL-12543", phone: "+91 98765 43210", dueTest: "HbA1c", lastDoneDate: "2026-04-24", daysSinceLast: 91, recommendedFrequency: "Quarterly", priority: "Medium", status: "Pending", reason: "Diabetic monitoring. Due for quarterly HbA1c." },
  { id: "rc4", patientName: "Mrs. Lakshmi Devi", patientId: "AL-14201", phone: "+91 87654 32109", dueTest: "CBC + Iron Studies", lastDoneDate: "2026-07-24", daysSinceLast: 0, recommendedFrequency: "Monthly", priority: "Low", status: "Booked", reason: "Severe anemia. Monthly monitoring needed." },
  { id: "rc5", patientName: "Mr. Suresh Babu", patientId: "AL-15320", phone: "+91 76543 21098", dueTest: "HbA1c", lastDoneDate: "2026-07-24", daysSinceLast: 0, recommendedFrequency: "3 Monthly", priority: "Low", status: "Booked", reason: "Diabetic screening. Next due Oct 2026." },
];

const PatientCRM = () => {
  const [patients] = useState<CRMPatient[]>(mockPatients);
  const [recalls] = useState<RecallAlert[]>(mockRecalls);
  const [activeTab, setActiveTab] = useState("patients");
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("ALL");

  const filtered = patients.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.patientId.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search);
    const matchSegment = segmentFilter === "ALL" || p.segment === segmentFilter;
    return matchSearch && matchSegment;
  });

  const getSegmentColor = (seg: string) => {
    switch (seg) { case "VIP": return "bg-purple-100 text-purple-700"; case "Regular": return "bg-blue-100 text-blue-700"; case "New": return "bg-green-100 text-green-700"; case "At Risk": return "bg-amber-100 text-amber-700"; case "Inactive": return "bg-red-100 text-red-700"; default: return "bg-gray-100 text-gray-700"; }
  };

  const getRecallColor = (status: string) => {
    switch (status) { case "Overdue": return "bg-red-100 text-red-700"; case "Due": return "bg-amber-100 text-amber-700"; case "Contacted": return "bg-blue-100 text-blue-700"; case "Booked": return "bg-green-100 text-green-700"; default: return "bg-gray-100 text-gray-700"; }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2"><Heart className="h-5 w-5" /> Patient CRM & Recall System</h2>
        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => toast.success("Recall campaign sent to 3 overdue patients")}><Bell className="mr-1 h-3 w-3" /> Send Recall Campaign</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="border-purple-200"><CardContent className="p-3 text-center"><Star className="h-4 w-4 mx-auto text-purple-600" /><p className="text-xl font-bold text-purple-600 mt-1">{patients.filter(p => p.segment === "VIP").length}</p><p className="text-[10px] text-muted-foreground">VIP</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><UserPlus className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600 mt-1">{patients.filter(p => p.segment === "New").length}</p><p className="text-[10px] text-muted-foreground">New</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><AlertTriangle className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold text-amber-600 mt-1">{patients.filter(p => p.segment === "At Risk").length}</p><p className="text-[10px] text-muted-foreground">At Risk</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><Clock className="h-4 w-4 mx-auto text-red-600" /><p className="text-xl font-bold text-red-600 mt-1">{recalls.filter(r => r.status === "Pending" && r.priority === "High").length}</p><p className="text-[10px] text-muted-foreground">Overdue Recalls</p></CardContent></Card>
        <Card className="border-blue-200"><CardContent className="p-3 text-center"><Users className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold text-blue-600 mt-1">{patients.length}</p><p className="text-[10px] text-muted-foreground">Total Patients</p></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="patients">Patient Directory</TabsTrigger><TabsTrigger value="recalls">Recall Alerts</TabsTrigger><TabsTrigger value="segments">Segments</TabsTrigger></TabsList>

        {/* Patient Directory */}
        <TabsContent value="patients" className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-[280px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" /><Input className="pl-8 h-8 text-xs" placeholder="Search patient, ID, phone..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <Select value={segmentFilter} onValueChange={setSegmentFilter}><SelectTrigger className="w-[110px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">All</SelectItem><SelectItem value="VIP">VIP</SelectItem><SelectItem value="Regular">Regular</SelectItem><SelectItem value="New">New</SelectItem><SelectItem value="At Risk">At Risk</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent></Select>
          </div>
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-b"><tr><th className="px-3 py-2 text-left">Patient</th><th className="px-3 py-2 text-center">Segment</th><th className="px-3 py-2 text-right">Visits</th><th className="px-3 py-2 text-right">LTV</th><th className="px-3 py-2 text-left">Last Visit</th><th className="px-3 py-2 text-left">Due Tests</th><th className="px-3 py-2 text-center">Recall</th><th className="px-3 py-2 text-center">Actions</th></tr></thead>
              <tbody>
                {filtered.map((pt) => (
                  <tr key={pt.id} className={`border-b ${pt.segment === "At Risk" || pt.segment === "Inactive" ? "bg-amber-50" : ""}`}>
                    <td className="px-3 py-2"><p className="font-medium">{pt.name}</p><p className="text-[10px] text-muted-foreground">{pt.patientId} | {pt.phone}</p>{pt.birthday && <p className="text-[9px] text-pink-600">🎂 {pt.birthday}</p>}</td>
                    <td className="px-3 py-2 text-center"><Badge className={`text-[9px] ${getSegmentColor(pt.segment)}`}>{pt.segment}</Badge></td>
                    <td className="px-3 py-2 text-right font-bold">{pt.totalVisits}</td>
                    <td className="px-3 py-2 text-right text-green-600 font-medium">₹{(pt.lifetimeValue / 1000).toFixed(1)}K</td>
                    <td className="px-3 py-2 text-muted-foreground">{pt.lastVisit}</td>
                    <td className="px-3 py-2">{pt.dueTests.length > 0 ? pt.dueTests.slice(0, 2).map((t, i) => <Badge key={i} variant="outline" className="text-[8px] mr-0.5 mb-0.5">{t}</Badge>) : <span className="text-muted-foreground">-</span>}</td>
                    <td className="px-3 py-2 text-center"><Badge className={`text-[9px] ${getRecallColor(pt.recallStatus)}`}>{pt.recallStatus}</Badge></td>
                    <td className="px-3 py-2 text-center"><div className="flex gap-1 justify-center">
                      <Button size="sm" variant="outline" className="h-5 text-[9px]" onClick={() => toast.success("Recall sent")}><MessageSquare className="h-3 w-3" /></Button>
                      <Button size="sm" variant="outline" className="h-5 text-[9px]" onClick={() => toast.info("Call initiated")}><Phone className="h-3 w-3" /></Button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        {/* Recall Alerts */}
        <TabsContent value="recalls" className="space-y-3">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Bell className="h-4 w-4 text-amber-600" /> Active Recall Alerts</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {recalls.map((recall) => (
                <div key={recall.id} className={`border rounded p-3 ${recall.priority === "High" ? "border-red-200 bg-red-50" : recall.priority === "Medium" ? "border-amber-200 bg-amber-50" : ""}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{recall.patientName}</span>
                        <Badge className={`text-[9px] ${recall.priority === "High" ? "bg-red-600 text-white" : recall.priority === "Medium" ? "bg-amber-500 text-white" : "bg-gray-200 text-gray-700"}`}>{recall.priority}</Badge>
                        <Badge className={`text-[9px] ${getRecallColor(recall.status)}`}>{recall.status}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{recall.patientId} | {recall.phone}</p>
                      <p className="text-[10px] mt-1"><strong>Due:</strong> {recall.dueTest} | <strong>Last:</strong> {recall.lastDoneDate} ({recall.daysSinceLast} days ago) | <strong>Freq:</strong> {recall.recommendedFrequency}</p>
                      <p className="text-[10px] text-muted-foreground italic">{recall.reason}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {recall.status === "Pending" && <>
                        <Button size="sm" variant="outline" className="h-6 text-[9px] text-green-600" onClick={() => toast.success("WhatsApp recall sent")}><MessageSquare className="h-3 w-3" /></Button>
                        <Button size="sm" variant="outline" className="h-6 text-[9px]" onClick={() => toast.info("Calling patient...")}><Phone className="h-3 w-3" /></Button>
                        <Button size="sm" className="h-6 text-[9px] bg-green-600" onClick={() => toast.success("Appointment booked")}>Book</Button>
                      </>}
                      {recall.status === "Contacted" && <Button size="sm" className="h-6 text-[9px] bg-green-600" onClick={() => toast.success("Booked")}>Book</Button>}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segments */}
        <TabsContent value="segments" className="space-y-3">
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {[
              { name: "VIP", desc: "10+ visits OR ₹20K+ spent", count: patients.filter(p => p.segment === "VIP").length, color: "border-purple-300 bg-purple-50", icon: <Star className="h-5 w-5 text-purple-600" />, criteria: "High frequency, high value patients. Priority service." },
              { name: "Regular", desc: "3-9 visits, active in last 6 months", count: patients.filter(p => p.segment === "Regular").length, color: "border-blue-300 bg-blue-50", icon: <Users className="h-5 w-5 text-blue-600" />, criteria: "Consistent patients. Nurture for upgrades to VIP." },
              { name: "New", desc: "First visit or registered recently", count: patients.filter(p => p.segment === "New").length, color: "border-green-300 bg-green-50", icon: <UserPlus className="h-5 w-5 text-green-600" />, criteria: "Recently acquired. Send welcome offers, packages." },
              { name: "At Risk", desc: "No visit in 3-6 months, was regular", count: patients.filter(p => p.segment === "At Risk").length, color: "border-amber-300 bg-amber-50", icon: <AlertTriangle className="h-5 w-5 text-amber-600" />, criteria: "Dropping off. Urgent recall and re-engagement." },
              { name: "Inactive", desc: "No visit in 6+ months", count: patients.filter(p => p.segment === "Inactive").length, color: "border-red-300 bg-red-50", icon: <Clock className="h-5 w-5 text-red-600" />, criteria: "Lost patients. Win-back campaigns with offers." },
            ].map((seg) => (
              <Card key={seg.name} className={seg.color}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    {seg.icon}
                    <div>
                      <p className="text-sm font-bold">{seg.name}</p>
                      <p className="text-[10px] text-muted-foreground">{seg.desc}</p>
                    </div>
                    <Badge className="ml-auto text-lg font-bold bg-white/80">{seg.count}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{seg.criteria}</p>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" className="h-6 text-[9px]" onClick={() => { setSegmentFilter(seg.name); setActiveTab("patients"); }}>View</Button>
                    <Button size="sm" variant="outline" className="h-6 text-[9px]" onClick={() => toast.info(`Campaign sent to ${seg.name} segment`)}><MessageSquare className="h-3 w-3 mr-0.5" /> Campaign</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientCRM;
