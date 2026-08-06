import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Building2, Users, Search, IndianRupee, FileText, Eye,
  Download, TrendingUp, Clock, CheckCircle2, Plus,
  Mail, Phone, Shield, Key, BarChart3,
} from "lucide-react";

interface B2BClient {
  id: string;
  organizationName: string;
  type: "Hospital" | "Clinic" | "Corporate" | "Insurance" | "PHC" | "Nursing Home";
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  gstNo?: string;
  ratePlan: string;
  creditLimit: number;
  currentBalance: number;
  totalBusiness: number;
  totalReferrals: number;
  loginCount: number;
  status: "Active" | "Inactive" | "Suspended";
  agreementExpiry: string;
  lastActivity?: string;
}

interface B2BOrder {
  id: string;
  clientId: string;
  clientName: string;
  patientName: string;
  patientId: string;
  testName: string;
  orderNo: string;
  orderDate: string;
  amount: number;
  reportStatus: "Pending" | "Ready" | "Viewed" | "Downloaded";
  paymentStatus: "Credit" | "Paid" | "Overdue";
}

interface B2BInvoice {
  id: string;
  invoiceNo: string;
  clientId: string;
  clientName: string;
  period: string;
  totalOrders: number;
  grossAmount: number;
  discount: number;
  netAmount: number;
  paidAmount: number;
  dueAmount: number;
  dueDate: string;
  status: "Paid" | "Partial" | "Overdue" | "Pending";
}

const mockClients: B2BClient[] = [
  { id: "b1", organizationName: "Saleem Hospital", type: "Hospital", contactPerson: "Dr. Mohamad Saleem", phone: "+91 98765 43210", email: "admin@saleemhospital.in", address: "Main Road, Kadayanallur", gstNo: "33AABCT1234F1Z5", ratePlan: "Hospital Premium", creditLimit: 500000, currentBalance: 45000, totalBusiness: 1250000, totalReferrals: 890, loginCount: 3, status: "Active", agreementExpiry: "2027-03-31", lastActivity: "2026-07-24 10:15 AM" },
  { id: "b2", organizationName: "Women's Care Clinic", type: "Clinic", contactPerson: "Dr. Anitha Kumari", phone: "+91 87654 32109", email: "info@womenscare.in", address: "PACR Salai, Rajapalayam", ratePlan: "Clinic Standard", creditLimit: 100000, currentBalance: 12000, totalBusiness: 380000, totalReferrals: 245, loginCount: 2, status: "Active", agreementExpiry: "2027-01-31", lastActivity: "2026-07-23 04:30 PM" },
  { id: "b3", organizationName: "TCS Corporate Wellness", type: "Corporate", contactPerson: "HR Manager - Priya", phone: "+91 76543 21098", email: "wellness@tcs.com", address: "IT Park, Chennai", ratePlan: "Corporate Bulk", creditLimit: 1000000, currentBalance: 185000, totalBusiness: 2100000, totalReferrals: 1250, loginCount: 5, status: "Active", agreementExpiry: "2027-06-30", lastActivity: "2026-07-24 09:00 AM" },
  { id: "b4", organizationName: "Star Health Insurance", type: "Insurance", contactPerson: "Claims Manager", phone: "+91 65432 10987", email: "claims@starhealth.in", address: "Nungambakkam, Chennai", ratePlan: "Insurance Panel", creditLimit: 2000000, currentBalance: 320000, totalBusiness: 4500000, totalReferrals: 3200, loginCount: 8, status: "Active", agreementExpiry: "2027-12-31" },
  { id: "b5", organizationName: "PHC Kadayanallur", type: "PHC", contactPerson: "Dr. Govt Medical Officer", phone: "+91 54321 09876", email: "phc.kdy@tn.gov.in", address: "Govt PHC, Kadayanallur", ratePlan: "Government", creditLimit: 50000, currentBalance: 8000, totalBusiness: 95000, totalReferrals: 120, loginCount: 1, status: "Active", agreementExpiry: "2027-03-31" },
];

const mockB2BOrders: B2BOrder[] = [
  { id: "o1", clientId: "b1", clientName: "Saleem Hospital", patientName: "Mr. Rajesh Kumar", patientId: "AL-12543", testName: "RFT + Electrolytes", orderNo: "ORD-2026-0047", orderDate: "2026-07-24", amount: 1000, reportStatus: "Ready", paymentStatus: "Credit" },
  { id: "o2", clientId: "b2", clientName: "Women's Care Clinic", patientName: "Mrs. Lakshmi Devi", patientId: "AL-14201", testName: "CBC + Iron Studies", orderNo: "ORD-2026-0048", orderDate: "2026-07-24", amount: 1200, reportStatus: "Ready", paymentStatus: "Credit" },
  { id: "o3", clientId: "b3", clientName: "TCS Corporate Wellness", patientName: "Mr. Suresh Babu", patientId: "AL-15320", testName: "Full Body Checkup", orderNo: "ORD-2026-0049", orderDate: "2026-07-24", amount: 2650, reportStatus: "Pending", paymentStatus: "Credit" },
  { id: "o4", clientId: "b1", clientName: "Saleem Hospital", patientName: "Mrs. Priya Sharma", patientId: "AL-13105", testName: "Thyroid Profile", orderNo: "ORD-2026-0045", orderDate: "2026-07-24", amount: 700, reportStatus: "Viewed", paymentStatus: "Credit" },
  { id: "o5", clientId: "b4", clientName: "Star Health Insurance", patientName: "Mr. Venkat Rao", patientId: "AL-16025", testName: "Pre-Policy Checkup", orderNo: "ORD-2026-0051", orderDate: "2026-07-24", amount: 3500, reportStatus: "Downloaded", paymentStatus: "Credit" },
];

const mockInvoices: B2BInvoice[] = [
  { id: "i1", invoiceNo: "INV-B2B-2026-07-001", clientId: "b1", clientName: "Saleem Hospital", period: "Jul 1-15, 2026", totalOrders: 45, grossAmount: 68000, discount: 10200, netAmount: 57800, paidAmount: 57800, dueAmount: 0, dueDate: "2026-07-30", status: "Paid" },
  { id: "i2", invoiceNo: "INV-B2B-2026-07-002", clientId: "b3", clientName: "TCS Corporate Wellness", period: "Jul 1-15, 2026", totalOrders: 120, grossAmount: 245000, discount: 49000, netAmount: 196000, paidAmount: 100000, dueAmount: 96000, dueDate: "2026-07-31", status: "Partial" },
  { id: "i3", invoiceNo: "INV-B2B-2026-06-003", clientId: "b4", clientName: "Star Health Insurance", period: "Jun 2026", totalOrders: 280, grossAmount: 520000, discount: 104000, netAmount: 416000, paidAmount: 0, dueAmount: 416000, dueDate: "2026-07-15", status: "Overdue" },
  { id: "i4", invoiceNo: "INV-B2B-2026-07-004", clientId: "b2", clientName: "Women's Care Clinic", period: "Jul 1-15, 2026", totalOrders: 18, grossAmount: 28000, discount: 3360, netAmount: 24640, paidAmount: 0, dueAmount: 24640, dueDate: "2026-08-05", status: "Pending" },
];

const B2BClientPortal = () => {
  const [clients] = useState<B2BClient[]>(mockClients);
  const [orders] = useState<B2BOrder[]>(mockB2BOrders);
  const [invoices] = useState<B2BInvoice[]>(mockInvoices);
  const [activeTab, setActiveTab] = useState("clients");
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<B2BClient | null>(null);

  const totalBusiness = clients.reduce((s, c) => s + c.totalBusiness, 0);
  const totalOutstanding = clients.reduce((s, c) => s + c.currentBalance, 0);
  const activeClients = clients.filter(c => c.status === "Active").length;

  const getStatusColor = (s: string) => {
    switch (s) { case "Active": case "Paid": case "Ready": case "Viewed": return "bg-green-100 text-green-700"; case "Partial": case "Pending": case "Credit": return "bg-amber-100 text-amber-700"; case "Overdue": case "Suspended": return "bg-red-100 text-red-700"; case "Downloaded": return "bg-blue-100 text-blue-700"; default: return "bg-gray-100 text-gray-700"; }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2">
          <Building2 className="h-5 w-5" /> B2B Client Portal & Organization Management
        </h2>
        <Button size="sm" className="bg-green-600 hover:bg-green-700"><Plus className="mr-1 h-3 w-3" /> Add Client</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-blue-200"><CardContent className="p-3 text-center"><Building2 className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold text-blue-600 mt-1">{activeClients}</p><p className="text-[10px] text-muted-foreground">Active Clients</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><TrendingUp className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600 mt-1">₹{(totalBusiness / 100000).toFixed(1)}L</p><p className="text-[10px] text-muted-foreground">Total Business</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><IndianRupee className="h-4 w-4 mx-auto text-red-600" /><p className="text-xl font-bold text-red-600 mt-1">₹{(totalOutstanding / 1000).toFixed(0)}K</p><p className="text-[10px] text-muted-foreground">Outstanding</p></CardContent></Card>
        <Card className="border-purple-200"><CardContent className="p-3 text-center"><Users className="h-4 w-4 mx-auto text-purple-600" /><p className="text-xl font-bold text-purple-600 mt-1">{clients.reduce((s, c) => s + c.loginCount, 0)}</p><p className="text-[10px] text-muted-foreground">Portal Logins</p></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="orders">B2B Orders</TabsTrigger>
          <TabsTrigger value="invoices">Invoices & Billing</TabsTrigger>
          <TabsTrigger value="access">Access Management</TabsTrigger>
        </TabsList>

        {/* Clients Tab */}
        <TabsContent value="clients" className="space-y-3">
          <div className="relative max-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9 h-8 text-sm" placeholder="Search organization..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {clients.filter(c => c.organizationName.toLowerCase().includes(search.toLowerCase())).map((client) => (
              <Card key={client.id} className="cursor-pointer hover:border-orange-300 transition" onClick={() => setSelectedClient(client)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center"><Building2 className="h-4 w-4 text-blue-600" /></div>
                      <div>
                        <p className="text-sm font-medium">{client.organizationName}</p>
                        <p className="text-[10px] text-muted-foreground">{client.type} | {client.contactPerson}</p>
                      </div>
                    </div>
                    <Badge className={`text-[9px] ${getStatusColor(client.status)}`}>{client.status}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t text-xs text-center">
                    <div><p className="font-bold text-green-600">₹{(client.totalBusiness / 1000).toFixed(0)}K</p><p className="text-[9px] text-muted-foreground">Business</p></div>
                    <div><p className="font-bold text-blue-600">{client.totalReferrals}</p><p className="text-[9px] text-muted-foreground">Referrals</p></div>
                    <div><p className="font-bold text-red-600">₹{(client.currentBalance / 1000).toFixed(0)}K</p><p className="text-[9px] text-muted-foreground">Balance</p></div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">Rate Plan: {client.ratePlan} | Expires: {client.agreementExpiry}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          {selectedClient && (
            <Card className="border-blue-200">
              <CardHeader className="pb-2"><div className="flex justify-between"><CardTitle className="text-sm">{selectedClient.organizationName} — Details</CardTitle><Button size="sm" variant="ghost" onClick={() => setSelectedClient(null)}>×</Button></div></CardHeader>
              <CardContent className="space-y-2">
                <div className="grid sm:grid-cols-3 gap-3 text-xs">
                  <div><span className="text-muted-foreground">Contact:</span> {selectedClient.contactPerson}</div>
                  <div><span className="text-muted-foreground">Phone:</span> {selectedClient.phone}</div>
                  <div><span className="text-muted-foreground">Email:</span> {selectedClient.email}</div>
                  <div><span className="text-muted-foreground">GST:</span> {selectedClient.gstNo || "N/A"}</div>
                  <div><span className="text-muted-foreground">Credit Limit:</span> ₹{selectedClient.creditLimit.toLocaleString()}</div>
                  <div><span className="text-muted-foreground">Last Activity:</span> {selectedClient.lastActivity || "Never"}</div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => toast.info("Client portal link sent")}><Key className="mr-1 h-3 w-3" /> Send Login</Button>
                  <Button size="sm" variant="outline" className="text-xs"><FileText className="mr-1 h-3 w-3" /> Statement</Button>
                  <Button size="sm" variant="outline" className="text-xs"><BarChart3 className="mr-1 h-3 w-3" /> Analytics</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* B2B Orders Tab */}
        <TabsContent value="orders" className="space-y-3">
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-3 py-2 text-left">Client</th>
                  <th className="px-3 py-2 text-left">Patient</th>
                  <th className="px-3 py-2 text-left">Test</th>
                  <th className="px-3 py-2 text-left">Order</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  <th className="px-3 py-2 text-center">Report</th>
                  <th className="px-3 py-2 text-center">Payment</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b">
                    <td className="px-3 py-2 font-medium">{o.clientName}</td>
                    <td className="px-3 py-2">{o.patientName}<br /><span className="text-[10px] text-muted-foreground">{o.patientId}</span></td>
                    <td className="px-3 py-2">{o.testName}</td>
                    <td className="px-3 py-2 text-muted-foreground">{o.orderNo}<br />{o.orderDate}</td>
                    <td className="px-3 py-2 text-right font-bold">₹{o.amount}</td>
                    <td className="px-3 py-2 text-center"><Badge className={`text-[9px] ${getStatusColor(o.reportStatus)}`}>{o.reportStatus}</Badge></td>
                    <td className="px-3 py-2 text-center"><Badge className={`text-[9px] ${getStatusColor(o.paymentStatus)}`}>{o.paymentStatus}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-3">
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-3 py-2 text-left">Invoice</th>
                  <th className="px-3 py-2 text-left">Client</th>
                  <th className="px-3 py-2 text-left">Period</th>
                  <th className="px-3 py-2 text-right">Orders</th>
                  <th className="px-3 py-2 text-right">Net Amount</th>
                  <th className="px-3 py-2 text-right">Paid</th>
                  <th className="px-3 py-2 text-right">Due</th>
                  <th className="px-3 py-2 text-center">Status</th>
                  <th className="px-3 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className={`border-b ${inv.status === "Overdue" ? "bg-red-50" : ""}`}>
                    <td className="px-3 py-2 font-medium">{inv.invoiceNo}</td>
                    <td className="px-3 py-2">{inv.clientName}</td>
                    <td className="px-3 py-2">{inv.period}</td>
                    <td className="px-3 py-2 text-right">{inv.totalOrders}</td>
                    <td className="px-3 py-2 text-right">₹{inv.netAmount.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-green-600">₹{inv.paidAmount.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-red-600 font-bold">₹{inv.dueAmount.toLocaleString()}</td>
                    <td className="px-3 py-2 text-center"><Badge className={`text-[9px] ${getStatusColor(inv.status)}`}>{inv.status}</Badge></td>
                    <td className="px-3 py-2 text-center"><Button size="sm" variant="outline" className="h-5 text-[9px]"><Download className="h-3 w-3" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        {/* Access Management Tab */}
        <TabsContent value="access" className="space-y-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-purple-600" /> Client Portal Access</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">Manage login credentials and permissions for B2B clients to view their patients' reports.</p>
              <table className="w-full text-xs border">
                <thead className="bg-muted/50">
                  <tr><th className="px-3 py-2 text-left">Organization</th><th className="px-3 py-2 text-left">Login Email</th><th className="px-3 py-2 text-center">Logins</th><th className="px-3 py-2 text-center">Can Download</th><th className="px-3 py-2 text-center">Can Print</th><th className="px-3 py-2 text-center">Action</th></tr>
                </thead>
                <tbody>
                  {clients.filter(c => c.status === "Active").map((c) => (
                    <tr key={c.id} className="border-b">
                      <td className="px-3 py-2 font-medium">{c.organizationName}</td>
                      <td className="px-3 py-2">{c.email}</td>
                      <td className="px-3 py-2 text-center">{c.loginCount}</td>
                      <td className="px-3 py-2 text-center"><CheckCircle2 className="h-3 w-3 text-green-600 mx-auto" /></td>
                      <td className="px-3 py-2 text-center"><CheckCircle2 className="h-3 w-3 text-green-600 mx-auto" /></td>
                      <td className="px-3 py-2 text-center"><Button size="sm" variant="outline" className="h-5 text-[9px]" onClick={() => toast.success("Password reset link sent")}>Reset PW</Button></td>
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

export default B2BClientPortal;
