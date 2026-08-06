import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  IndianRupee, Users, Search, FileText, Download,
  CheckCircle2, Clock, TrendingUp, Percent, Building2,
  User, Calendar, Printer, CreditCard,
} from "lucide-react";

interface ReferralDoctor {
  id: string;
  name: string;
  specialization: string;
  phone: string;
  clinicName?: string;
  commissionType: "Percentage" | "Fixed" | "Slab";
  commissionRate: number; // percentage or fixed amount
  totalReferrals: number;
  totalRevenue: number;
  totalCommission: number;
  pendingCommission: number;
  paidCommission: number;
  lastSettlementDate?: string;
  status: "Active" | "Inactive";
}

interface ReferralTransaction {
  id: string;
  doctorId: string;
  doctorName: string;
  patientName: string;
  patientId: string;
  orderNo: string;
  testNames: string;
  billAmount: number;
  commissionAmount: number;
  commissionRate: number;
  date: string;
  settlementStatus: "Pending" | "Settled" | "On Hold";
  settlementId?: string;
}

interface SettlementRecord {
  id: string;
  settlementNo: string;
  doctorId: string;
  doctorName: string;
  periodFrom: string;
  periodTo: string;
  totalReferrals: number;
  totalBillAmount: number;
  commissionAmount: number;
  tdsDeducted: number;
  netPayable: number;
  paidAmount: number;
  paymentMode: string;
  paymentDate: string;
  status: "Paid" | "Pending" | "Partially Paid";
}

const mockDoctors: ReferralDoctor[] = [
  { id: "d1", name: "Dr. Mohamad Saleem", specialization: "General Medicine", phone: "+91 98765 43210", clinicName: "Saleem Clinic", commissionType: "Percentage", commissionRate: 15, totalReferrals: 156, totalRevenue: 245000, totalCommission: 36750, pendingCommission: 8400, paidCommission: 28350, lastSettlementDate: "2026-06-30", status: "Active" },
  { id: "d2", name: "Dr. Anitha Kumari", specialization: "OBG", phone: "+91 87654 32109", clinicName: "Women's Care Clinic", commissionType: "Percentage", commissionRate: 12, totalReferrals: 89, totalRevenue: 178000, totalCommission: 21360, pendingCommission: 5200, paidCommission: 16160, lastSettlementDate: "2026-06-30", status: "Active" },
  { id: "d3", name: "Dr. Ramesh Babu", specialization: "Cardiology", phone: "+91 76543 21098", commissionType: "Percentage", commissionRate: 10, totalReferrals: 45, totalRevenue: 112000, totalCommission: 11200, pendingCommission: 3600, paidCommission: 7600, lastSettlementDate: "2026-05-31", status: "Active" },
  { id: "d4", name: "Dr. Priya Nair", specialization: "Dermatology", phone: "+91 65432 10987", clinicName: "Skin & Hair Clinic", commissionType: "Fixed", commissionRate: 100, totalReferrals: 32, totalRevenue: 48000, totalCommission: 3200, pendingCommission: 1200, paidCommission: 2000, lastSettlementDate: "2026-06-15", status: "Active" },
  { id: "d5", name: "Dr. Suresh Kumar", specialization: "Orthopedics", phone: "+91 54321 09876", commissionType: "Percentage", commissionRate: 12, totalReferrals: 28, totalRevenue: 85000, totalCommission: 10200, pendingCommission: 2400, paidCommission: 7800, lastSettlementDate: "2026-06-30", status: "Inactive" },
];

const mockTransactions: ReferralTransaction[] = [
  { id: "t1", doctorId: "d1", doctorName: "Dr. Mohamad Saleem", patientName: "Mr. Rajesh Kumar", patientId: "AL-12543", orderNo: "ORD-2026-0047", testNames: "RFT, Urine Routine", billAmount: 1000, commissionAmount: 150, commissionRate: 15, date: "2026-07-24", settlementStatus: "Pending" },
  { id: "t2", doctorId: "d1", doctorName: "Dr. Mohamad Saleem", patientName: "Mrs. Priya Sharma", patientId: "AL-13105", orderNo: "ORD-2026-0045", testNames: "Thyroid Profile", billAmount: 700, commissionAmount: 105, commissionRate: 15, date: "2026-07-24", settlementStatus: "Pending" },
  { id: "t3", doctorId: "d2", doctorName: "Dr. Anitha Kumari", patientName: "Mrs. Lakshmi Devi", patientId: "AL-14201", orderNo: "ORD-2026-0048", testNames: "CBC, Iron Studies, PS", billAmount: 1200, commissionAmount: 144, commissionRate: 12, date: "2026-07-24", settlementStatus: "Pending" },
  { id: "t4", doctorId: "d1", doctorName: "Dr. Mohamad Saleem", patientName: "Mr. Suresh Babu", patientId: "AL-15320", orderNo: "ORD-2026-0049", testNames: "Lipid, LFT, HbA1c, Thyroid", billAmount: 2650, commissionAmount: 397, commissionRate: 15, date: "2026-07-24", settlementStatus: "Pending" },
  { id: "t5", doctorId: "d3", doctorName: "Dr. Ramesh Babu", patientName: "Mr. Venkat Rao", patientId: "AL-16025", orderNo: "ORD-2026-0051", testNames: "Culture & Sensitivity", billAmount: 1500, commissionAmount: 150, commissionRate: 10, date: "2026-07-24", settlementStatus: "Pending" },
];

const mockSettlements: SettlementRecord[] = [
  { id: "s1", settlementNo: "SET-2026-06-001", doctorId: "d1", doctorName: "Dr. Mohamad Saleem", periodFrom: "2026-06-01", periodTo: "2026-06-30", totalReferrals: 42, totalBillAmount: 68000, commissionAmount: 10200, tdsDeducted: 1020, netPayable: 9180, paidAmount: 9180, paymentMode: "Bank Transfer", paymentDate: "2026-07-05", status: "Paid" },
  { id: "s2", settlementNo: "SET-2026-06-002", doctorId: "d2", doctorName: "Dr. Anitha Kumari", periodFrom: "2026-06-01", periodTo: "2026-06-30", totalReferrals: 25, totalBillAmount: 52000, commissionAmount: 6240, tdsDeducted: 624, netPayable: 5616, paidAmount: 5616, paymentMode: "Cheque", paymentDate: "2026-07-05", status: "Paid" },
  { id: "s3", settlementNo: "SET-2026-06-003", doctorId: "d3", doctorName: "Dr. Ramesh Babu", periodFrom: "2026-06-01", periodTo: "2026-06-30", totalReferrals: 12, totalBillAmount: 35000, commissionAmount: 3500, tdsDeducted: 350, netPayable: 3150, paidAmount: 0, paymentMode: "", paymentDate: "", status: "Pending" },
];

const ReferralCommission = () => {
  const [doctors] = useState<ReferralDoctor[]>(mockDoctors);
  const [transactions] = useState<ReferralTransaction[]>(mockTransactions);
  const [settlements] = useState<SettlementRecord[]>(mockSettlements);
  const [activeTab, setActiveTab] = useState("doctors");
  const [selectedDoctor, setSelectedDoctor] = useState<ReferralDoctor | null>(null);
  const [search, setSearch] = useState("");

  const totalPendingCommission = doctors.reduce((sum, d) => sum + d.pendingCommission, 0);
  const totalPaidThisMonth = mockTransactions.reduce((sum, t) => sum + t.commissionAmount, 0);
  const totalReferralsThisMonth = mockTransactions.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2">
          <Users className="h-5 w-5" /> Referral Doctor Commission & Settlement
        </h2>
        <Button size="sm" className="bg-green-600 hover:bg-green-700">
          <CreditCard className="mr-1 h-3 w-3" /> New Settlement
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-green-200">
          <CardContent className="p-3 text-center">
            <TrendingUp className="h-4 w-4 mx-auto text-green-600" />
            <p className="text-xl font-bold text-green-600 mt-1">{totalReferralsThisMonth}</p>
            <p className="text-[10px] text-muted-foreground">Referrals Today</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardContent className="p-3 text-center">
            <IndianRupee className="h-4 w-4 mx-auto text-blue-600" />
            <p className="text-xl font-bold text-blue-600 mt-1">₹{totalPaidThisMonth.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Commission Today</p>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="p-3 text-center">
            <Clock className="h-4 w-4 mx-auto text-red-600" />
            <p className="text-xl font-bold text-red-600 mt-1">₹{totalPendingCommission.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Total Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Users className="h-4 w-4 mx-auto text-purple-600" />
            <p className="text-xl font-bold text-purple-600 mt-1">{doctors.filter(d => d.status === "Active").length}</p>
            <p className="text-[10px] text-muted-foreground">Active Doctors</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="doctors">Referral Doctors</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="settlements">Settlements</TabsTrigger>
        </TabsList>

        {/* Doctors Tab */}
        <TabsContent value="doctors" className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9 h-8 text-sm" placeholder="Search doctor..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {doctors.filter(d => d.name.toLowerCase().includes(search.toLowerCase())).map((doc) => (
              <Card key={doc.id} className={`cursor-pointer transition hover:border-orange-300 ${doc.status === "Inactive" ? "opacity-60" : ""}`} onClick={() => setSelectedDoctor(doc)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-[10px] text-muted-foreground">{doc.specialization} {doc.clinicName && `| ${doc.clinicName}`}</p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${doc.status === "Active" ? "text-green-600 border-green-300" : "text-gray-500"}`}>{doc.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mt-2 pt-2 border-t">
                    <div><span className="text-muted-foreground">Rate:</span> <span className="font-medium">{doc.commissionType === "Percentage" ? `${doc.commissionRate}%` : `₹${doc.commissionRate}/test`}</span></div>
                    <div><span className="text-muted-foreground">Referrals:</span> <span className="font-medium">{doc.totalReferrals}</span></div>
                    <div><span className="text-muted-foreground">Revenue:</span> <span className="font-medium text-green-600">₹{(doc.totalRevenue / 1000).toFixed(0)}K</span></div>
                    <div><span className="text-muted-foreground">Pending:</span> <span className="font-medium text-red-600">₹{doc.pendingCommission.toLocaleString()}</span></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Doctor Detail */}
          {selectedDoctor && (
            <Card className="border-blue-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{selectedDoctor.name} - Commission Summary</CardTitle>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedDoctor(null)}>×</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-4 gap-3 text-xs">
                  <div className="border rounded p-2 text-center"><p className="text-muted-foreground">Total Commission</p><p className="text-lg font-bold text-blue-600">₹{selectedDoctor.totalCommission.toLocaleString()}</p></div>
                  <div className="border rounded p-2 text-center"><p className="text-muted-foreground">Paid</p><p className="text-lg font-bold text-green-600">₹{selectedDoctor.paidCommission.toLocaleString()}</p></div>
                  <div className="border rounded p-2 text-center"><p className="text-muted-foreground">Pending</p><p className="text-lg font-bold text-red-600">₹{selectedDoctor.pendingCommission.toLocaleString()}</p></div>
                  <div className="border rounded p-2 text-center"><p className="text-muted-foreground">Last Settlement</p><p className="text-lg font-bold">{selectedDoctor.lastSettlementDate || "Never"}</p></div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs" onClick={() => toast.success("Settlement initiated")}><CreditCard className="mr-1 h-3 w-3" /> Settle Now</Button>
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => toast.info("Statement generated")}><FileText className="mr-1 h-3 w-3" /> Statement</Button>
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => toast.info("Ledger opened")}><Download className="mr-1 h-3 w-3" /> Export</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-3">
          <div className="flex items-center gap-2">
            <Select defaultValue="ALL">
              <SelectTrigger className="w-[180px] h-8 text-xs"><SelectValue placeholder="Doctor" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Doctors</SelectItem>
                {doctors.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="date" className="h-8 text-xs w-[130px]" defaultValue="2026-07-24" />
            <Input type="date" className="h-8 text-xs w-[130px]" defaultValue="2026-07-24" />
            <Button size="sm" variant="outline" className="h-8 text-xs"><Download className="mr-1 h-3 w-3" /> Export</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-left">Doctor</th>
                    <th className="px-3 py-2 text-left">Patient</th>
                    <th className="px-3 py-2 text-left">Tests</th>
                    <th className="px-3 py-2 text-right">Bill Amt</th>
                    <th className="px-3 py-2 text-right">Rate</th>
                    <th className="px-3 py-2 text-right">Commission</th>
                    <th className="px-3 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="border-b">
                      <td className="px-3 py-2">{txn.date}</td>
                      <td className="px-3 py-2 font-medium">{txn.doctorName}</td>
                      <td className="px-3 py-2">{txn.patientName}<br /><span className="text-[10px] text-muted-foreground">{txn.orderNo}</span></td>
                      <td className="px-3 py-2 max-w-[150px] truncate" title={txn.testNames}>{txn.testNames}</td>
                      <td className="px-3 py-2 text-right">₹{txn.billAmount.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right">{txn.commissionRate}%</td>
                      <td className="px-3 py-2 text-right font-bold text-green-600">₹{txn.commissionAmount}</td>
                      <td className="px-3 py-2 text-center"><Badge className={`text-[10px] ${txn.settlementStatus === "Settled" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{txn.settlementStatus}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-3 py-2 border-t bg-gray-50 text-xs text-right">
                <span className="font-bold">Total Commission: ₹{transactions.reduce((s, t) => s + t.commissionAmount, 0).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settlements Tab */}
        <TabsContent value="settlements" className="space-y-3">
          <div className="flex items-center gap-2">
            <Select defaultValue="ALL">
              <SelectTrigger className="w-[180px] h-8 text-xs"><SelectValue placeholder="Doctor" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Doctors</SelectItem>
                {doctors.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select defaultValue="ALL">
              <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left">Settlement No</th>
                    <th className="px-3 py-2 text-left">Doctor</th>
                    <th className="px-3 py-2 text-left">Period</th>
                    <th className="px-3 py-2 text-right">Referrals</th>
                    <th className="px-3 py-2 text-right">Commission</th>
                    <th className="px-3 py-2 text-right">TDS (10%)</th>
                    <th className="px-3 py-2 text-right">Net Payable</th>
                    <th className="px-3 py-2 text-center">Status</th>
                    <th className="px-3 py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {settlements.map((set) => (
                    <tr key={set.id} className="border-b">
                      <td className="px-3 py-2 font-medium">{set.settlementNo}</td>
                      <td className="px-3 py-2">{set.doctorName}</td>
                      <td className="px-3 py-2">{set.periodFrom} to {set.periodTo}</td>
                      <td className="px-3 py-2 text-right">{set.totalReferrals}</td>
                      <td className="px-3 py-2 text-right">₹{set.commissionAmount.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right text-red-600">₹{set.tdsDeducted.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right font-bold">₹{set.netPayable.toLocaleString()}</td>
                      <td className="px-3 py-2 text-center"><Badge className={`text-[10px] ${set.status === "Paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{set.status}</Badge></td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex gap-1 justify-center">
                          {set.status === "Pending" && <Button size="sm" className="h-5 text-[9px] bg-green-600 hover:bg-green-700" onClick={() => toast.success("Payment processed")}>Pay</Button>}
                          <Button size="sm" variant="outline" className="h-5 text-[9px]" onClick={() => toast.info("Statement printed")}><Printer className="h-3 w-3" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReferralCommission;
