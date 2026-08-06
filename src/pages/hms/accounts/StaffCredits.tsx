import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Users, CreditCard, IndianRupee, ShoppingCart, Percent, AlertTriangle,
  CheckCircle2, Plus, Calendar, Brain, Sparkles, Receipt
} from "lucide-react";

type StaffMember = {
  id: string;
  name: string;
  role: string;
  department: string;
  creditLimit: number;
  usedCredit: number;
  discountPercent: number;
  totalPurchases: number;
  monthlyLimit: number;
  monthlyUsed: number;
  lastPurchase?: string;
  purchases: { date: string; item: string; amount: number; discount: number; net: number }[];
};

const staffMembers: StaffMember[] = [
  {
    id: "1", name: "Kumar (Senior Cashier)", role: "Senior Cashier", department: "Front Office",
    creditLimit: 10000, usedCredit: 4500, discountPercent: 15, totalPurchases: 28500,
    monthlyLimit: 5000, monthlyUsed: 2800, lastPurchase: "Jul 20",
    purchases: [
      { date: "Jul 20", item: "Chyawanprash (500g)", amount: 750, discount: 112, net: 638 },
      { date: "Jul 15", item: "Triphala + Ashwagandha combo", amount: 1200, discount: 180, net: 1020 },
      { date: "Jul 10", item: "Kumkumadi Oil (30ml)", amount: 700, discount: 105, net: 595 },
    ]
  },
  {
    id: "2", name: "Priya (Pharmacist)", role: "Pharmacist", department: "Pharmacy",
    creditLimit: 8000, usedCredit: 2200, discountPercent: 20, totalPurchases: 18200,
    monthlyLimit: 4000, monthlyUsed: 1500, lastPurchase: "Jul 21",
    purchases: [
      { date: "Jul 21", item: "Himalaya Wellness Kit", amount: 1500, discount: 300, net: 1200 },
    ]
  },
  {
    id: "3", name: "Dr. Sivarama Krishnan", role: "Consultant", department: "Clinical",
    creditLimit: 25000, usedCredit: 12000, discountPercent: 25, totalPurchases: 65000,
    monthlyLimit: 10000, monthlyUsed: 5200, lastPurchase: "Jul 18",
    purchases: [
      { date: "Jul 18", item: "Panchakarma course (family)", amount: 8000, discount: 2000, net: 6000 },
      { date: "Jul 05", item: "Lab tests (annual check)", amount: 4000, discount: 1000, net: 3000 },
    ]
  },
  {
    id: "4", name: "Anitha (Lab Technician)", role: "Lab Technician", department: "Lab",
    creditLimit: 8000, usedCredit: 6800, discountPercent: 15, totalPurchases: 22000,
    monthlyLimit: 4000, monthlyUsed: 3800, lastPurchase: "Jul 22",
    purchases: [
      { date: "Jul 22", item: "Herbal immunity pack", amount: 2000, discount: 300, net: 1700 },
      { date: "Jul 19", item: "Consultation + medicines", amount: 2100, discount: 315, net: 1785 },
    ]
  },
  {
    id: "5", name: "Lakshmi (Therapist)", role: "Panchakarma Therapist", department: "Therapy",
    creditLimit: 10000, usedCredit: 3500, discountPercent: 20, totalPurchases: 15000,
    monthlyLimit: 5000, monthlyUsed: 2000, lastPurchase: "Jul 19",
    purchases: [
      { date: "Jul 19", item: "Dhanwantharam Oil (1L)", amount: 800, discount: 160, net: 640 },
    ]
  },
];

const StaffCredits = () => {
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const totalCredit = staffMembers.reduce((s, m) => s + m.usedCredit, 0);
  const totalLimit = staffMembers.reduce((s, m) => s + m.creditLimit, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Staff Credits & Purchases
          </h2>
          <p className="text-sm text-muted-foreground">Manage staff purchase credits, special discounts & limits</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline"><Receipt className="mr-1 h-4 w-4" /> Settlement Report</Button>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add Staff Credit</Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Outstanding Credit</p>
            <p className="font-display text-xl font-bold text-amber-600">₹{totalCredit.toLocaleString("en-IN")}</p>
            <p className="text-xs text-muted-foreground">of ₹{totalLimit.toLocaleString("en-IN")} limit</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Staff Members with Credit</p>
            <p className="font-display text-xl font-bold">{staffMembers.length}</p>
            <p className="text-xs text-muted-foreground">Active accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Discounts Given</p>
            <p className="font-display text-xl font-bold text-purple-600">₹8,472</p>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Near Limit (80%+)</p>
            <p className="font-display text-xl font-bold text-red-600">{staffMembers.filter(s => (s.usedCredit / s.creditLimit) >= 0.8).length}</p>
            <p className="text-xs text-red-600">Need settlement</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">All Staff</TabsTrigger>
          <TabsTrigger value="limits">Credit Limits</TabsTrigger>
          <TabsTrigger value="history">Purchase History</TabsTrigger>
          <TabsTrigger value="settlement">Settlement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-3 mt-4">
          {staffMembers.map((staff) => {
            const creditPct = Math.round((staff.usedCredit / staff.creditLimit) * 100);
            const monthlyPct = Math.round((staff.monthlyUsed / staff.monthlyLimit) * 100);
            return (
              <Card key={staff.id} className={creditPct >= 80 ? "border-red-200" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-sm">{staff.name}</p>
                      <p className="text-xs text-muted-foreground">{staff.role} · {staff.department}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Percent className="mr-1 h-3 w-3" />{staff.discountPercent}% discount
                      </Badge>
                      {creditPct >= 80 && (
                        <Badge className="bg-red-100 text-red-700 text-xs">
                          <AlertTriangle className="mr-1 h-3 w-3" /> Near Limit
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Credit Used: ₹{staff.usedCredit.toLocaleString("en-IN")} / ₹{staff.creditLimit.toLocaleString("en-IN")}</span>
                        <span>{creditPct}%</span>
                      </div>
                      <Progress value={creditPct} className={`h-2 ${creditPct >= 80 ? "[&>div]:bg-red-500" : ""}`} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Monthly: ₹{staff.monthlyUsed.toLocaleString("en-IN")} / ₹{staff.monthlyLimit.toLocaleString("en-IN")}</span>
                        <span>{monthlyPct}%</span>
                      </div>
                      <Progress value={monthlyPct} className={`h-2 ${monthlyPct >= 80 ? "[&>div]:bg-amber-500" : ""}`} />
                    </div>
                  </div>

                  {staff.purchases.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-1">Recent Purchases:</p>
                      <div className="flex flex-wrap gap-2">
                        {staff.purchases.slice(0, 2).map((p, i) => (
                          <Badge key={i} variant="outline" className="text-[10px]">
                            {p.date}: {p.item} (₹{p.net})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="limits" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Credit Limit Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Staff</th>
                      <th className="px-4 py-2 text-left font-medium">Role</th>
                      <th className="px-4 py-2 text-right font-medium">Total Credit Limit</th>
                      <th className="px-4 py-2 text-right font-medium">Monthly Limit</th>
                      <th className="px-4 py-2 text-center font-medium">Discount %</th>
                      <th className="px-4 py-2 text-center font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffMembers.map((s) => (
                      <tr key={s.id} className="border-b hover:bg-muted/30">
                        <td className="px-4 py-2 font-medium">{s.name}</td>
                        <td className="px-4 py-2 text-xs text-muted-foreground">{s.role}</td>
                        <td className="px-4 py-2 text-right">
                          <Input type="number" defaultValue={s.creditLimit} className="w-24 ml-auto text-right h-8 text-xs" />
                        </td>
                        <td className="px-4 py-2 text-right">
                          <Input type="number" defaultValue={s.monthlyLimit} className="w-24 ml-auto text-right h-8 text-xs" />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <Input type="number" defaultValue={s.discountPercent} className="w-16 mx-auto text-center h-8 text-xs" />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <Button size="sm" variant="ghost" className="h-7 text-xs">Save</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendation */}
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Brain className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-primary">AI Credit Recommendations</p>
                  <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                    <p>• Anitha (Lab Tech) is at 85% credit limit. Consider salary deduction for settlement or increase limit.</p>
                    <p>• Dr. Sivarama's 25% discount is highest. His total benefit this month: ₹3,000 - within policy.</p>
                    <p>• Suggest auto-deduction from salary for staff with credit &gt; 50% to avoid accumulation.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Date</th>
                      <th className="px-4 py-2 text-left font-medium">Staff</th>
                      <th className="px-4 py-2 text-left font-medium">Item</th>
                      <th className="px-4 py-2 text-right font-medium">MRP</th>
                      <th className="px-4 py-2 text-right font-medium">Discount</th>
                      <th className="px-4 py-2 text-right font-medium">Net Amount</th>
                      <th className="px-4 py-2 text-center font-medium">Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffMembers.flatMap(s => s.purchases.map(p => ({ ...p, staffName: s.name, discPct: s.discountPercent }))).sort((a, b) => b.date.localeCompare(a.date)).map((p, i) => (
                      <tr key={i} className="border-b hover:bg-muted/30">
                        <td className="px-4 py-2 text-xs">{p.date}</td>
                        <td className="px-4 py-2 font-medium text-xs">{p.staffName}</td>
                        <td className="px-4 py-2 text-xs">{p.item}</td>
                        <td className="px-4 py-2 text-right">₹{p.amount.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-2 text-right text-green-600">-₹{p.discount}</td>
                        <td className="px-4 py-2 text-right font-semibold">₹{p.net.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-2 text-center">
                          <Badge variant="outline" className="text-[10px]">Credit</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settlement" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Settlements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {staffMembers.filter(s => s.usedCredit > 0).map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded border">
                    <div>
                      <p className="font-medium text-sm">{s.name}</p>
                      <p className="text-xs text-muted-foreground">Outstanding: ₹{s.usedCredit.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="text-xs">Deduct from Salary</Button>
                      <Button size="sm" className="text-xs">Settle Cash</Button>
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

export default StaffCredits;
