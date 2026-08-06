import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Building2, Truck, IndianRupee, Calendar, AlertTriangle, CheckCircle2,
  Clock, Plus, Brain, Sparkles, CreditCard, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type Supplier = {
  id: string;
  name: string;
  category: string;
  totalCredit: number;
  pendingPayment: number;
  lastPayment: string;
  lastPaymentAmount: number;
  creditDays: number;
  dueDate: string;
  overdue: boolean;
  contactPerson: string;
  phone: string;
};

type Franchise = {
  id: string;
  name: string;
  city: string;
  type: "franchise" | "branch";
  creditGiven: number;
  creditReceived: number;
  pendingFromThem: number;
  pendingToThem: number;
  lastSettlement: string;
  status: "active" | "overdue" | "settled";
};

const suppliers: Supplier[] = [
  { id: "1", name: "Himalaya Wellness Pvt Ltd", category: "AYUSH Medicines", totalCredit: 250000, pendingPayment: 85000, lastPayment: "Jul 10", lastPaymentAmount: 45000, creditDays: 30, dueDate: "Aug 10", overdue: false, contactPerson: "Rajesh", phone: "98xxx11111" },
  { id: "2", name: "Kerala Ayurveda Ltd", category: "Oils & Preparations", totalCredit: 180000, pendingPayment: 62000, lastPayment: "Jul 05", lastPaymentAmount: 38000, creditDays: 45, dueDate: "Aug 20", overdue: false, contactPerson: "Suresh", phone: "94xxx22222" },
  { id: "3", name: "Dabur India Ltd", category: "Health Supplements", totalCredit: 150000, pendingPayment: 45000, lastPayment: "Jun 28", lastPaymentAmount: 52000, creditDays: 30, dueDate: "Jul 28", overdue: false, contactPerson: "Mohan", phone: "90xxx33333" },
  { id: "4", name: "MedLab Supplies India", category: "Lab Reagents", totalCredit: 80000, pendingPayment: 28000, lastPayment: "Jul 01", lastPaymentAmount: 22000, creditDays: 15, dueDate: "Jul 16", overdue: true, contactPerson: "Anand", phone: "91xxx44444" },
  { id: "5", name: "Kottakkal Arya Vaidya Sala", category: "Classical Medicines", totalCredit: 200000, pendingPayment: 95000, lastPayment: "Jun 25", lastPaymentAmount: 60000, creditDays: 30, dueDate: "Jul 25", overdue: false, contactPerson: "Krishnan", phone: "97xxx55555" },
  { id: "6", name: "Sri Sri Tattva", category: "OTC Products", totalCredit: 120000, pendingPayment: 35000, lastPayment: "Jul 15", lastPaymentAmount: 40000, creditDays: 30, dueDate: "Aug 15", overdue: false, contactPerson: "Priya", phone: "96xxx66666" },
];

const franchises: Franchise[] = [
  { id: "f1", name: "Ayuzee Franchise - Salem", city: "Salem", type: "franchise", creditGiven: 150000, creditReceived: 80000, pendingFromThem: 45000, pendingToThem: 0, lastSettlement: "Jul 15", status: "active" },
  { id: "f2", name: "Ayuzee Franchise - Trichy", city: "Trichy", type: "franchise", creditGiven: 120000, creditReceived: 95000, pendingFromThem: 25000, pendingToThem: 0, lastSettlement: "Jul 18", status: "active" },
  { id: "f3", name: "Ayuzee Franchise - Erode", city: "Erode", type: "franchise", creditGiven: 80000, creditReceived: 45000, pendingFromThem: 55000, pendingToThem: 0, lastSettlement: "Jun 28", status: "overdue" },
  { id: "f4", name: "Rajapalayam Branch", city: "Rajapalayam", type: "branch", creditGiven: 0, creditReceived: 0, pendingFromThem: 0, pendingToThem: 12000, lastSettlement: "Jul 20", status: "active" },
  { id: "f5", name: "Theni Branch", city: "Theni", type: "branch", creditGiven: 0, creditReceived: 0, pendingFromThem: 0, pendingToThem: 8500, lastSettlement: "Jul 19", status: "active" },
  { id: "f6", name: "Ayuzee Franchise - Nagercoil", city: "Nagercoil", type: "franchise", creditGiven: 100000, creditReceived: 85000, pendingFromThem: 15000, pendingToThem: 0, lastSettlement: "Jul 12", status: "settled" },
];

const supplierPaymentHistory = [
  { month: "Jan", paid: 285000, pending: 120000 },
  { month: "Feb", paid: 310000, pending: 95000 },
  { month: "Mar", paid: 350000, pending: 145000 },
  { month: "Apr", paid: 295000, pending: 130000 },
  { month: "May", paid: 380000, pending: 110000 },
  { month: "Jun", paid: 340000, pending: 155000 },
  { month: "Jul", paid: 257000, pending: 350000 },
];

const SupplierFranchise = () => {
  const [activeTab, setActiveTab] = useState("suppliers");

  const totalSupplierPending = suppliers.reduce((s, sup) => s + sup.pendingPayment, 0);
  const overdueSuppliers = suppliers.filter(s => s.overdue).length;
  const totalFranchisePending = franchises.reduce((s, f) => s + f.pendingFromThem, 0);
  const totalBranchPending = franchises.filter(f => f.type === "branch").reduce((s, f) => s + f.pendingToThem, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Supplier & Franchise Payments
          </h2>
          <p className="text-sm text-muted-foreground">Manage supplier credits, franchise receivables & branch transfers</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline"><Calendar className="mr-1 h-4 w-4" /> Payment Schedule</Button>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Record Payment</Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Truck className="h-4 w-4 text-red-500" />
              <p className="text-xs text-muted-foreground">Supplier Payables</p>
            </div>
            <p className="font-display text-xl font-bold text-red-600">₹{totalSupplierPending.toLocaleString("en-IN")}</p>
            <p className="text-xs text-red-600">{overdueSuppliers} overdue</p>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-4 w-4 text-green-500" />
              <p className="text-xs text-muted-foreground">Franchise Receivables</p>
            </div>
            <p className="font-display text-xl font-bold text-green-600">₹{totalFranchisePending.toLocaleString("en-IN")}</p>
            <p className="text-xs text-green-600">{franchises.filter(f => f.type === "franchise" && f.pendingFromThem > 0).length} pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDownRight className="h-4 w-4 text-amber-500" />
              <p className="text-xs text-muted-foreground">Branch Transfers Due</p>
            </div>
            <p className="font-display text-xl font-bold text-amber-600">₹{totalBranchPending.toLocaleString("en-IN")}</p>
            <p className="text-xs text-muted-foreground">Inter-branch settlements</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="h-4 w-4 text-blue-500" />
              <p className="text-xs text-muted-foreground">This Month Paid</p>
            </div>
            <p className="font-display text-xl font-bold text-blue-600">₹2,57,000</p>
            <p className="text-xs text-muted-foreground">To suppliers</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="suppliers">Supplier Payments</TabsTrigger>
          <TabsTrigger value="franchise">Franchise & Branch</TabsTrigger>
          <TabsTrigger value="schedule">Payment Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Supplier Payment Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={supplierPaymentHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                  <Bar dataKey="paid" fill="#10b981" name="Paid" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" fill="#ef4444" name="Pending" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Supplier</th>
                      <th className="px-4 py-2 text-left font-medium">Category</th>
                      <th className="px-4 py-2 text-right font-medium">Credit Limit</th>
                      <th className="px-4 py-2 text-right font-medium">Pending</th>
                      <th className="px-4 py-2 text-left font-medium">Due Date</th>
                      <th className="px-4 py-2 text-left font-medium">Last Payment</th>
                      <th className="px-4 py-2 text-center font-medium">Status</th>
                      <th className="px-4 py-2 text-center font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.map((sup) => (
                      <tr key={sup.id} className={`border-b hover:bg-muted/30 ${sup.overdue ? "bg-red-50/50" : ""}`}>
                        <td className="px-4 py-2">
                          <p className="font-medium text-xs">{sup.name}</p>
                          <p className="text-[10px] text-muted-foreground">{sup.contactPerson} · {sup.phone}</p>
                        </td>
                        <td className="px-4 py-2 text-xs">{sup.category}</td>
                        <td className="px-4 py-2 text-right text-xs">₹{sup.totalCredit.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-2 text-right font-semibold text-red-600">₹{sup.pendingPayment.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-2 text-xs">{sup.dueDate}</td>
                        <td className="px-4 py-2 text-xs">{sup.lastPayment} (₹{sup.lastPaymentAmount.toLocaleString("en-IN")})</td>
                        <td className="px-4 py-2 text-center">
                          <Badge className={sup.overdue ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}>
                            {sup.overdue ? "Overdue" : "On Time"}
                          </Badge>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <Button size="sm" variant="outline" className="h-7 text-xs">Pay</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="franchise" className="space-y-4 mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {franchises.map((f) => (
              <Card key={f.id} className={f.status === "overdue" ? "border-red-200" : f.status === "settled" ? "border-green-200" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{f.city} · {f.type}</p>
                    </div>
                    <Badge className={
                      f.status === "overdue" ? "bg-red-100 text-red-700" :
                      f.status === "settled" ? "bg-green-100 text-green-700" :
                      "bg-blue-100 text-blue-700"
                    }>
                      {f.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-xs">
                    {f.type === "franchise" && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Credit Given</span>
                          <span>₹{f.creditGiven.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Received Back</span>
                          <span className="text-green-600">₹{f.creditReceived.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span>Pending from them</span>
                          <span className="text-amber-600">₹{f.pendingFromThem.toLocaleString("en-IN")}</span>
                        </div>
                      </>
                    )}
                    {f.type === "branch" && (
                      <div className="flex justify-between font-semibold">
                        <span>Transfer pending</span>
                        <span className="text-amber-600">₹{f.pendingToThem.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-muted-foreground">
                      <span>Last Settlement</span>
                      <span>{f.lastSettlement}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 h-7 text-xs">View Details</Button>
                    <Button size="sm" className="flex-1 h-7 text-xs">Settle</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" /> AI Payment Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {suppliers.sort((a, b) => new Date(a.dueDate + " 2026").getTime() - new Date(b.dueDate + " 2026").getTime()).map((sup) => (
                  <div key={sup.id} className={`flex items-center justify-between p-3 rounded border ${sup.overdue ? "border-red-200 bg-red-50/30" : ""}`}>
                    <div className="flex items-center gap-3">
                      <Calendar className={`h-4 w-4 ${sup.overdue ? "text-red-500" : "text-muted-foreground"}`} />
                      <div>
                        <p className="font-medium text-sm">{sup.name}</p>
                        <p className="text-xs text-muted-foreground">Due: {sup.dueDate} ({sup.creditDays} day credit)</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">₹{sup.pendingPayment.toLocaleString("en-IN")}</p>
                      {sup.overdue && <Badge className="bg-red-100 text-red-700 text-[10px]">OVERDUE</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-primary">AI Cash Flow Suggestion</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on expected collections this week (₹2,15,000), you can clear MedLab (overdue ₹28,000) and 
                    Kottakkal (₹95,000 due Jul 25) without impacting operating cash. Schedule payments for Jul 23.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupplierFranchise;
