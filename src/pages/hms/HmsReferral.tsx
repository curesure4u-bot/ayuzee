import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Users, Plus, TrendingUp, IndianRupee, ArrowRight, CheckCircle, Clock } from "lucide-react";

type Referral = {
  id: string; patient: string; referredBy: string; referrerType: string;
  referredTo: string; department: string; date: string;
  status: "pending" | "consulted" | "converted" | "lost";
  commission: number; notes: string;
};

const mockReferrals: Referral[] = [
  { id: "1", patient: "Priya Menon", referredBy: "Dr. Ravi (Apollo Hospital)", referrerType: "External Doctor", referredTo: "Dr. Arun Sharma", department: "Panchakarma", date: "2026-07-15", status: "consulted", commission: 500, notes: "Referred for Janu Basti - OA Knee" },
  { id: "2", patient: "Rahul Kumar", referredBy: "Patient: Ramesh Kumar", referrerType: "Patient Referral", referredTo: "Dr. Meena Patel", department: "Panchakarma", date: "2026-07-14", status: "converted", commission: 300, notes: "Friend referral. Booked 14-day package." },
  { id: "3", patient: "Ananya S.", referredBy: "Dr. Priya Das", referrerType: "Internal Doctor", referredTo: "Dr. Arun Sharma", department: "Ayurveda", date: "2026-07-13", status: "consulted", commission: 0, notes: "Homeopathy to Ayurveda referral for Panchakarma" },
  { id: "4", patient: "Mohammed F.", referredBy: "Google Search", referrerType: "Digital", referredTo: "Dr. Arun Sharma", department: "Ayurveda", date: "2026-07-12", status: "converted", commission: 0, notes: "Organic Google search lead" },
  { id: "5", patient: "Lakshmi Nair", referredBy: "Partner: Kerala Tourism", referrerType: "Corporate/Partner", referredTo: "Dr. Meena Patel", department: "Panchakarma", date: "2026-07-11", status: "converted", commission: 2000, notes: "Wellness tourism package referral" },
  { id: "6", patient: "Suresh T.", referredBy: "Dr. Mohan (PHC Attingal)", referrerType: "External Doctor", referredTo: "Dr. Arun Sharma", department: "Ayurveda", date: "2026-07-10", status: "pending", commission: 500, notes: "Referred for chronic back pain. Awaiting appointment." },
  { id: "7", patient: "David Thomas", referredBy: "Website: ayuzee.com", referrerType: "Digital", referredTo: "Dr. Arun Sharma", department: "Teleconsult", date: "2026-07-09", status: "lost", commission: 0, notes: "International lead. No-show at teleconsult." },
];

const HmsReferral = () => {
  const [referrals] = useState<Referral[]>(mockReferrals);
  const [addOpen, setAddOpen] = useState(false);

  const converted = referrals.filter(r => r.status === "converted").length;
  const totalCommission = referrals.filter(r => r.status === "converted" || r.status === "consulted").reduce((s, r) => s + r.commission, 0);
  const conversionRate = Math.round((converted / referrals.length) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-purple-600" /> Referral Management
          </h1>
          <p className="text-sm text-muted-foreground">Doctor-to-doctor referrals, patient referrals, partner tracking & commission analytics</p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="mr-1 h-4 w-4" /> Add Referral</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{referrals.length}</p><p className="text-xs text-muted-foreground">Total Referrals</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-green-600">{converted}</p><p className="text-xs text-muted-foreground">Converted</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><TrendingUp className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">{conversionRate}%</p><p className="text-xs text-muted-foreground">Conversion Rate</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><IndianRupee className="h-5 w-5 mx-auto text-green-600" /><p className="text-lg font-bold mt-1">₹{totalCommission.toLocaleString("en-IN")}</p><p className="text-xs text-muted-foreground">Commission Due</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{referrals.filter(r => r.referrerType === "External Doctor").length}</p><p className="text-xs text-muted-foreground">Doctor Referrals</p></CardContent></Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 w-full">
          <TabsTrigger value="all">All Referrals</TabsTrigger>
          <TabsTrigger value="sources">Source Analysis</TabsTrigger>
          <TabsTrigger value="commission">Commission Tracker</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card><CardContent className="p-0"><div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50"><tr>
                <th className="px-3 py-2 text-left font-medium">Patient</th>
                <th className="px-3 py-2 text-left font-medium">Referred By</th>
                <th className="px-3 py-2 text-left font-medium">Source Type</th>
                <th className="px-3 py-2 text-left font-medium">To Doctor</th>
                <th className="px-3 py-2 text-left font-medium">Date</th>
                <th className="px-3 py-2 text-left font-medium">Commission</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
              </tr></thead>
              <tbody>
                {referrals.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 font-medium">{r.patient}</td>
                    <td className="px-3 py-2 text-xs">{r.referredBy}</td>
                    <td className="px-3 py-2"><Badge variant="outline" className="text-[10px]">{r.referrerType}</Badge></td>
                    <td className="px-3 py-2 text-xs">{r.referredTo} · {r.department}</td>
                    <td className="px-3 py-2 text-xs">{r.date}</td>
                    <td className="px-3 py-2 text-xs">{r.commission > 0 ? `₹${r.commission}` : "—"}</td>
                    <td className="px-3 py-2"><Badge variant={r.status === "converted" ? "outline" : r.status === "lost" ? "destructive" : r.status === "consulted" ? "default" : "secondary"} className={`text-[10px] capitalize ${r.status === "converted" ? "text-green-600" : ""}`}>{r.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div></CardContent></Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-base">Referral Sources</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { source: "External Doctors", count: 3, converted: 2, revenue: "₹85,000" },
                  { source: "Patient Referrals", count: 1, converted: 1, revenue: "₹28,000" },
                  { source: "Corporate / Partners", count: 1, converted: 1, revenue: "₹65,000" },
                  { source: "Digital (Google/Website)", count: 2, converted: 1, revenue: "₹12,000" },
                ].map(s => (
                  <div key={s.source} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">{s.source}</p>
                      <p className="text-xs text-muted-foreground">{s.count} referrals · {s.converted} converted</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">{s.revenue}</p>
                      <p className="text-[10px] text-muted-foreground">Revenue generated</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commission" className="space-y-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-base">Commission / Incentive Tracker</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {referrals.filter(r => r.commission > 0).map(r => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">{r.referredBy}</p>
                      <p className="text-xs text-muted-foreground">Patient: {r.patient} · {r.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold">₹{r.commission}</p>
                      <Badge variant={r.status === "converted" ? "outline" : "secondary"} className={`text-[10px] ${r.status === "converted" ? "text-green-600" : ""}`}>{r.status === "converted" ? "Payable" : "Pending"}</Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200 flex items-center justify-between">
                <p className="text-sm font-medium text-green-700">Total Commission Payable</p>
                <p className="text-xl font-bold text-green-700">₹{totalCommission.toLocaleString("en-IN")}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Referral</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Patient Name *</Label><Input placeholder="Patient name" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Referred By *</Label><Input placeholder="Doctor/Patient/Partner name" /></div>
              <div><Label>Source Type</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="ext_doctor">External Doctor</SelectItem><SelectItem value="patient">Patient Referral</SelectItem><SelectItem value="internal">Internal Doctor</SelectItem><SelectItem value="corporate">Corporate/Partner</SelectItem><SelectItem value="digital">Digital (Online)</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Referred To Doctor</Label><Input placeholder="Doctor name" /></div>
              <div><Label>Department</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="ayu">Ayurveda</SelectItem><SelectItem value="pk">Panchakarma</SelectItem><SelectItem value="hom">Homeopathy</SelectItem><SelectItem value="tele">Teleconsult</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Commission (₹)</Label><Input type="number" placeholder="0" /></div>
              <div><Label>Notes</Label><Input placeholder="Reason for referral" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Referral added"); setAddOpen(false); }}>Save Referral</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsReferral;
