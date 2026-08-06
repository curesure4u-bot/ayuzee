import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Wallet, TrendingDown, Receipt, Building2, Calendar, Plus,
  FileText, IndianRupee, BarChart3, Lock, Unlock, Brain, Sparkles,
  AlertTriangle, Camera, Upload
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#ef4444", "#f97316", "#eab308", "#10b981", "#6366f1", "#ec4899"];

type Expense = {
  id: string;
  date: string;
  type: "fixed" | "variable";
  category: string;
  description: string;
  amount: number;
  paymentMode: string;
  receipt: boolean;
  approvedBy?: string;
  tds?: number;
  vendor?: string;
};

const expenses: Expense[] = [
  { id: "1", date: "Jul 22", type: "fixed", category: "Salary - Staff", description: "Dr. Sivarama Krishnan - July", amount: 75000, paymentMode: "Net Banking", receipt: true, tds: 7500 },
  { id: "2", date: "Jul 22", type: "fixed", category: "Rent", description: "Clinic rent - Main Road, Kadayanallur", amount: 25000, paymentMode: "Net Banking", receipt: true },
  { id: "3", date: "Jul 22", type: "fixed", category: "Electricity", description: "EB Bill - July", amount: 8500, paymentMode: "UPI", receipt: true },
  { id: "4", date: "Jul 21", type: "variable", category: "Medicine Purchase", description: "Himalaya bulk order", amount: 45000, paymentMode: "Net Banking", receipt: true, vendor: "Himalaya Wellness" },
  { id: "5", date: "Jul 21", type: "variable", category: "Lab Reagents", description: "Reagent refill - Biochemistry", amount: 12000, paymentMode: "Cash", receipt: true, vendor: "MedLab Supplies" },
  { id: "6", date: "Jul 20", type: "variable", category: "Maintenance", description: "AC repair - OPD room", amount: 3500, paymentMode: "Cash", receipt: false },
  { id: "7", date: "Jul 20", type: "fixed", category: "Software", description: "HMS subscription - Monthly", amount: 5000, paymentMode: "Card", receipt: true },
  { id: "8", date: "Jul 19", type: "variable", category: "Marketing", description: "Local newspaper ad - Half page", amount: 8000, paymentMode: "Cash", receipt: true },
  { id: "9", date: "Jul 19", type: "variable", category: "Petty Cash", description: "Tea/snacks, courier, misc", amount: 1200, paymentMode: "Cash", receipt: false },
  { id: "10", date: "Jul 18", type: "fixed", category: "Insurance", description: "Professional liability premium", amount: 15000, paymentMode: "Net Banking", receipt: true },
];

const fixedExpenses = [
  { category: "Staff Salaries", monthly: 250000 },
  { category: "Rent", monthly: 25000 },
  { category: "Electricity", monthly: 8500 },
  { category: "Internet/Phone", monthly: 3000 },
  { category: "Software Subscriptions", monthly: 8000 },
  { category: "Insurance", monthly: 15000 },
  { category: "Loan EMI", monthly: 35000 },
];

const variableExpenseCategories = [
  { name: "Medicine Purchase", value: 145000 },
  { name: "Lab Reagents", value: 35000 },
  { name: "Marketing", value: 22000 },
  { name: "Maintenance", value: 18000 },
  { name: "Petty Cash", value: 8000 },
  { name: "Miscellaneous", value: 12000 },
];

const monthlyExpenseData = [
  { month: "Jan", fixed: 320000, variable: 145000 },
  { month: "Feb", fixed: 320000, variable: 128000 },
  { month: "Mar", fixed: 325000, variable: 168000 },
  { month: "Apr", fixed: 330000, variable: 152000 },
  { month: "May", fixed: 330000, variable: 175000 },
  { month: "Jun", fixed: 335000, variable: 185000 },
  { month: "Jul", fixed: 335000, variable: 162000 },
];

const ExpenseManager = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [expenseType, setExpenseType] = useState("all");

  const totalFixed = fixedExpenses.reduce((s, e) => s + e.monthly, 0);
  const totalVariable = variableExpenseCategories.reduce((s, e) => s + e.value, 0);

  const filteredExpenses = expenses.filter(e => {
    if (expenseType === "fixed") return e.type === "fixed";
    if (expenseType === "variable") return e.type === "variable";
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Expense Management
          </h2>
          <p className="text-sm text-muted-foreground">Fixed & Variable expenses with TDS, approvals, and AI optimization</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline"><FileText className="mr-1 h-4 w-4" /> Export</Button>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Expense</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="h-4 w-4 text-red-500" />
              <p className="text-xs text-muted-foreground">Fixed Expenses</p>
            </div>
            <p className="font-display text-xl font-bold text-red-600">₹{totalFixed.toLocaleString("en-IN")}</p>
            <p className="text-xs text-muted-foreground">Monthly committed</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Unlock className="h-4 w-4 text-amber-500" />
              <p className="text-xs text-muted-foreground">Variable Expenses</p>
            </div>
            <p className="font-display text-xl font-bold text-amber-600">₹{totalVariable.toLocaleString("en-IN")}</p>
            <p className="text-xs text-muted-foreground">This month (optimizable)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <IndianRupee className="h-4 w-4 text-purple-500" />
              <p className="text-xs text-muted-foreground">TDS Deducted</p>
            </div>
            <p className="font-display text-xl font-bold text-purple-600">₹12,500</p>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Receipt className="h-4 w-4 text-green-500" />
              <p className="text-xs text-muted-foreground">Petty Cash Balance</p>
            </div>
            <p className="font-display text-xl font-bold text-green-600">₹3,800</p>
            <p className="text-xs text-muted-foreground">of ₹5,000 allocated</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Optimization */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Brain className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-primary">AI Expense Optimization</p>
              <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                <p>• Combine lab reagent orders with Rajapalayam branch - save ₹2,400/month on shipping</p>
                <p>• Marketing spend yielding 3.2x ROI on newspaper ads vs 1.1x on pamphlets</p>
                <p>• Variable expenses are 8% over budget. Suggest reducing maintenance frequency to quarterly</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">All Expenses</TabsTrigger>
          <TabsTrigger value="fixed">Fixed Expenses</TabsTrigger>
          <TabsTrigger value="variable">Variable Expenses</TabsTrigger>
          <TabsTrigger value="add">Add Expense</TabsTrigger>
          <TabsTrigger value="pettycash">Petty Cash</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Fixed vs Variable Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={monthlyExpenseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                    <Bar dataKey="fixed" fill="#ef4444" name="Fixed" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="variable" fill="#f97316" name="Variable" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Variable Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={variableExpenseCategories} cx="50%" cy="50%" outerRadius={70} dataKey="value">
                      {variableExpenseCategories.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Expense List */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Recent Expenses</CardTitle>
                <Select value={expenseType} onValueChange={setExpenseType}>
                  <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="fixed">Fixed Only</SelectItem>
                    <SelectItem value="variable">Variable Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Date</th>
                      <th className="px-4 py-2 text-left font-medium">Category</th>
                      <th className="px-4 py-2 text-left font-medium">Description</th>
                      <th className="px-4 py-2 text-center font-medium">Type</th>
                      <th className="px-4 py-2 text-right font-medium">Amount</th>
                      <th className="px-4 py-2 text-right font-medium">TDS</th>
                      <th className="px-4 py-2 text-left font-medium">Payment</th>
                      <th className="px-4 py-2 text-center font-medium">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.map((exp) => (
                      <tr key={exp.id} className="border-b hover:bg-muted/30">
                        <td className="px-4 py-2 text-xs">{exp.date}</td>
                        <td className="px-4 py-2 font-medium text-xs">{exp.category}</td>
                        <td className="px-4 py-2 text-xs text-muted-foreground">{exp.description}</td>
                        <td className="px-4 py-2 text-center">
                          <Badge variant="outline" className={`text-[10px] ${exp.type === "fixed" ? "border-red-200 text-red-700" : "border-amber-200 text-amber-700"}`}>
                            {exp.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-2 text-right font-semibold">₹{exp.amount.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-2 text-right text-xs">{exp.tds ? `₹${exp.tds.toLocaleString("en-IN")}` : "—"}</td>
                        <td className="px-4 py-2 text-xs">{exp.paymentMode}</td>
                        <td className="px-4 py-2 text-center">
                          {exp.receipt ? <FileText className="h-3.5 w-3.5 text-green-500 mx-auto" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mx-auto" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fixed" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Monthly Fixed Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {fixedExpenses.map((exp, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded border">
                    <div className="flex items-center gap-3">
                      <Lock className="h-4 w-4 text-red-400" />
                      <div>
                        <p className="font-medium text-sm">{exp.category}</p>
                        <p className="text-xs text-muted-foreground">Monthly recurring</p>
                      </div>
                    </div>
                    <p className="font-semibold text-red-600">₹{exp.monthly.toLocaleString("en-IN")}</p>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 rounded bg-red-50 font-semibold">
                  <span>Total Fixed Monthly</span>
                  <span className="text-red-700">₹{totalFixed.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variable" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                {variableExpenseCategories.map((exp, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded border">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                      <span className="font-medium text-sm">{exp.name}</span>
                    </div>
                    <p className="font-semibold">₹{exp.value.toLocaleString("en-IN")}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Add New Expense</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label>Expense Type *</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salary">Salary - Consultants</SelectItem>
                      <SelectItem value="salary-staff">Salary - Staff</SelectItem>
                      <SelectItem value="rent">Rent</SelectItem>
                      <SelectItem value="electricity">Electricity</SelectItem>
                      <SelectItem value="medicine">Medicine Purchase</SelectItem>
                      <SelectItem value="lab">Lab Reagents</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="petty">Petty Cash</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount (before TDS) *</Label>
                  <Input type="number" placeholder="Amount" />
                </div>
                <div className="space-y-2">
                  <Label>TDS (%)</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input type="date" defaultValue="2026-07-22" />
                </div>
                <div className="space-y-2">
                  <Label>Payment Mode *</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select mode" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="upi">UPI / GPay</SelectItem>
                      <SelectItem value="netbanking">Net Banking</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Vendor/Payee</Label>
                  <Input placeholder="Vendor name (optional)" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Comments</Label>
                  <Textarea placeholder="Notes about this expense..." />
                </div>
                <div className="space-y-2">
                  <Label>Upload Receipt</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm"><Upload className="mr-1 h-4 w-4" /> Upload</Button>
                    <Button variant="outline" size="sm"><Camera className="mr-1 h-4 w-4" /> Camera</Button>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button><Plus className="mr-1 h-4 w-4" /> Add Expense</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pettycash" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium">Petty Cash Register</p>
                  <p className="text-xs text-muted-foreground">Track small daily expenses</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Balance</p>
                  <p className="font-display text-xl font-bold text-green-600">₹3,800</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { item: "Tea & snacks for staff", amount: 250, date: "Jul 22" },
                  { item: "Courier charges", amount: 150, date: "Jul 22" },
                  { item: "Auto fare (sample pickup)", amount: 200, date: "Jul 21" },
                  { item: "Stationery - A4 papers", amount: 350, date: "Jul 21" },
                  { item: "Water cans (3)", amount: 250, date: "Jul 20" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded border text-sm">
                    <div>
                      <span className="font-medium">{item.item}</span>
                      <span className="text-xs text-muted-foreground ml-2">{item.date}</span>
                    </div>
                    <span className="font-semibold text-red-600">-₹{item.amount}</span>
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

export default ExpenseManager;
