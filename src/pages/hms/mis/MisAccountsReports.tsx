import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IndianRupee, Download, Printer, FileSpreadsheet, Brain,
  TrendingUp, TrendingDown, AlertTriangle, Building2
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const incomeReports = [
  "Total Income", "Income By Month", "Income By Consultant", "Income By Patient",
  "Income By Patient Source", "Income By Nature of Visit (O/P)", "Income By Nature of Admission (I/P)",
  "Income By Dept/Group - Userwise", "Income By Dept/Group(Visitwise) - Userwise",
  "Income By Dept/Group(Billwise) - Userwise", "Income By Dept/Group(Token - IP No) - Userwise",
  "Income By Billwise - Userwise", "Income By Billwise Detailed - Userwise",
  "Income By Provider", "Income By Marketing Executive", "Income By Referral",
  "Income By Payment Type", "Form No: 3C"
];

const expenseReports = [
  "Total Expense", "Expense By Month", "Expense By Type", "Expense By Consultant",
  "Edited Expense", "Expense TDS", "PettyCash Vs Expense", "PettyCash"
];

const outstandingDueReports = ["By Date", "All", "Written Off"];
const opAdvanceReports = ["By Date", "All"];
const creditBillReports = ["Pending", "Pending - Cumulative", "Pending - Cumulative PatientWise", "Settled", "Settled - Receipt wise", "Cancelled"];
const settlementReports = ["Postpaid", "Due", "Settled", "Prepaid", "Usage", "IP", "Cancelled", "Cancelled Receipt"];
const incentiveReports = ["Bill Wise Doctor Incentives", "Bill Wise Marketing Incentives", "Doctor wise", "Marketing Executive wise", "Doctor Wise Incentive Group By - Marketing Executive", "Incentive Job Log"];
const consolidatedIncomeReports = ["Income + Credit Collection - Type Wise", "Income + Credit Collection - User Wise", "Income + Credit Collection + Sale Return - Type Wise", "Income + Credit Collection + Sale Return - User Wise", "By Type Wise", "By User Wise"];
const consolidatedTransactionReports = ["By Type Wise", "By User Wise", "By User Cash Wise"];
const taxReports = ["Tax - Billwise", "Tax - SAC Wise", "Tax - Item Wise"];
const dentalLabReports = ["Ordered", "Paid"];
const franchisorReports = ["Postpaid", "Due", "Settled", "Prepaid", "Usage"];
const franchiseReports = ["Postpaid", "Due", "Settled", "Prepaid", "Usage"];

const accountsCategories = [
  { label: "Income", items: incomeReports, color: "bg-green-600" },
  { label: "Net Collection", items: ["Split By User"], color: "bg-teal-600" },
  { label: "Expense", items: expenseReports, color: "bg-orange-600" },
  { label: "Outstanding Due", items: outstandingDueReports, color: "bg-amber-600" },
  { label: "OP Advance", items: opAdvanceReports, color: "bg-yellow-600" },
  { label: "Credit Bills", items: creditBillReports, color: "bg-blue-600" },
  { label: "Settlement", items: settlementReports, color: "bg-purple-600" },
  { label: "Edited Bills", items: ["All"], color: "bg-gray-600" },
  { label: "Cancelled Bills", items: ["All"], color: "bg-red-600" },
  { label: "Removed Counter Bills", items: ["All"], color: "bg-red-700" },
  { label: "Discounted Bills", items: ["Bills"], color: "bg-pink-600" },
  { label: "Refunded Bills", items: ["All"], color: "bg-rose-600" },
  { label: "Removed Expenses", items: ["All"], color: "bg-red-500" },
  { label: "Incentive", items: incentiveReports, color: "bg-indigo-600" },
  { label: "Consolidated Income", items: consolidatedIncomeReports, color: "bg-cyan-600" },
  { label: "Consolidated Transaction", items: consolidatedTransactionReports, color: "bg-sky-600" },
  { label: "Tax Report", items: taxReports, color: "bg-violet-600" },
  { label: "Dental Lab Orders", items: dentalLabReports, color: "bg-emerald-600" },
  { label: "Currency Rate", items: ["View"], color: "bg-lime-600" },
  { label: "Treatment Vs Issue", items: ["View"], color: "bg-teal-700" },
  { label: "Franchisor", items: franchisorReports, color: "bg-blue-700" },
  { label: "Franchise", items: franchiseReports, color: "bg-indigo-700" },
];

const incomeMonthlyData = [
  { month: "Jan", income: 485000, expense: 320000 },
  { month: "Feb", income: 520000, expense: 310000 },
  { month: "Mar", income: 610000, expense: 340000 },
  { month: "Apr", income: 575000, expense: 355000 },
  { month: "May", income: 690000, expense: 380000 },
  { month: "Jun", income: 725000, expense: 395000 },
  { month: "Jul", income: 680000, expense: 370000 },
];

const MisAccountsReports = () => {
  const [selectedCategory, setSelectedCategory] = useState("Income");
  const [selectedReport, setSelectedReport] = useState("Total Income");

  return (
    <div className="space-y-4 mt-4">
      {/* AI Insight */}
      <Card className="border-primary/20">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <Brain className="h-4 w-4 text-primary mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-primary">AI Accounts Analysis: </span>
              Revenue ₹6.8L this month (85% of target). Expense ratio: 54% (healthy). 
              ₹68K outstanding dues &gt;30 days from 15 patients. 3 franchise settlements overdue.
              TDS liability this quarter: ₹37,500. Incentive payout pending: ₹63,000.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Buttons - Row 1 (Primary) */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-2 mb-2">
            {accountsCategories.slice(0, 10).map((cat) => (
              <Button key={cat.label} size="sm"
                variant={selectedCategory === cat.label ? "default" : "outline"}
                className={`text-xs h-7 ${selectedCategory === cat.label ? cat.color + " text-white border-0" : ""}`}
                onClick={() => { setSelectedCategory(cat.label); setSelectedReport(cat.items[0]); }}>
                {cat.label} {cat.items.length > 1 && "▾"}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {accountsCategories.slice(10).map((cat) => (
              <Button key={cat.label} size="sm"
                variant={selectedCategory === cat.label ? "default" : "outline"}
                className={`text-xs h-7 ${selectedCategory === cat.label ? cat.color + " text-white border-0" : ""}`}
                onClick={() => { setSelectedCategory(cat.label); setSelectedReport(cat.items[0]); }}>
                {cat.label} {cat.items.length > 1 && "▾"}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sub-report Buttons */}
      {accountsCategories.find(c => c.label === selectedCategory)?.items && (
        <Card>
          <CardContent className="p-3">
            <p className="text-xs font-semibold text-muted-foreground mb-2">{selectedCategory} Reports:</p>
            <div className="flex flex-wrap gap-2">
              {accountsCategories.find(c => c.label === selectedCategory)?.items.map((r) => (
                <Button key={r} size="sm" variant={selectedReport === r ? "default" : "secondary"} className="text-xs h-6"
                  onClick={() => setSelectedReport(r)}>
                  {r}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Buttons */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">{selectedCategory} - {selectedReport}</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="text-xs h-7 bg-green-50 text-green-700 border-green-200">
            <FileSpreadsheet className="mr-1 h-3 w-3" /> Export CSV
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-7 bg-green-50 text-green-700 border-green-200">
            <FileSpreadsheet className="mr-1 h-3 w-3" /> Export Excel
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-7 bg-red-50 text-red-700 border-red-200">
            <Printer className="mr-1 h-3 w-3" /> Print
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-7">
            <Printer className="mr-1 h-3 w-3" /> Dot Matrix
          </Button>
        </div>
      </div>

      {/* Income vs Expense Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium">Monthly Income vs Expense (AI Trend)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={incomeMonthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
              <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
              <Bar dataKey="income" fill="#10b981" name="Income" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#ef4444" name="Expense" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sample Data Table */}
      <Card>
        <CardContent className="p-3">
          <p className="text-xs text-muted-foreground mb-2">Showing: {selectedReport}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-primary">S.No</th>
                  <th className="px-3 py-2 text-left font-medium text-primary">Description</th>
                  <th className="px-3 py-2 text-right font-medium text-primary">Cash</th>
                  <th className="px-3 py-2 text-right font-medium text-primary">Card</th>
                  <th className="px-3 py-2 text-right font-medium text-primary">Cheque</th>
                  <th className="px-3 py-2 text-right font-medium text-primary">DD</th>
                  <th className="px-3 py-2 text-right font-medium text-primary">Neft</th>
                  <th className="px-3 py-2 text-right font-medium text-primary">Credit</th>
                  <th className="px-3 py-2 text-right font-medium text-primary">GooglePay</th>
                  <th className="px-3 py-2 text-right font-medium text-primary">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-muted/30">
                  <td className="px-3 py-2">1</td>
                  <td className="px-3 py-2 font-medium">Consultation</td>
                  <td className="px-3 py-2 text-right">12,500.00</td>
                  <td className="px-3 py-2 text-right">2,000.00</td>
                  <td className="px-3 py-2 text-right">0.00</td>
                  <td className="px-3 py-2 text-right">0.00</td>
                  <td className="px-3 py-2 text-right">0.00</td>
                  <td className="px-3 py-2 text-right">3,500.00</td>
                  <td className="px-3 py-2 text-right text-green-600">8,500.00</td>
                  <td className="px-3 py-2 text-right font-bold">26,500.00</td>
                </tr>
                <tr className="border-b hover:bg-muted/30">
                  <td className="px-3 py-2">2</td>
                  <td className="px-3 py-2 font-medium">Pharmacy</td>
                  <td className="px-3 py-2 text-right">8,200.00</td>
                  <td className="px-3 py-2 text-right">1,500.00</td>
                  <td className="px-3 py-2 text-right">0.00</td>
                  <td className="px-3 py-2 text-right">0.00</td>
                  <td className="px-3 py-2 text-right">0.00</td>
                  <td className="px-3 py-2 text-right">2,000.00</td>
                  <td className="px-3 py-2 text-right text-green-600">6,800.00</td>
                  <td className="px-3 py-2 text-right font-bold">18,500.00</td>
                </tr>
                <tr className="border-b hover:bg-muted/30">
                  <td className="px-3 py-2">3</td>
                  <td className="px-3 py-2 font-medium">Lab & Diagnostics</td>
                  <td className="px-3 py-2 text-right">4,800.00</td>
                  <td className="px-3 py-2 text-right">800.00</td>
                  <td className="px-3 py-2 text-right">0.00</td>
                  <td className="px-3 py-2 text-right">0.00</td>
                  <td className="px-3 py-2 text-right">1,200.00</td>
                  <td className="px-3 py-2 text-right">1,500.00</td>
                  <td className="px-3 py-2 text-right text-green-600">4,400.00</td>
                  <td className="px-3 py-2 text-right font-bold">12,700.00</td>
                </tr>
                <tr className="bg-muted/50 font-bold">
                  <td className="px-3 py-2" colSpan={2}>Total</td>
                  <td className="px-3 py-2 text-right">25,500.00</td>
                  <td className="px-3 py-2 text-right">4,300.00</td>
                  <td className="px-3 py-2 text-right">0.00</td>
                  <td className="px-3 py-2 text-right">0.00</td>
                  <td className="px-3 py-2 text-right">1,200.00</td>
                  <td className="px-3 py-2 text-right">7,000.00</td>
                  <td className="px-3 py-2 text-right text-green-600">19,700.00</td>
                  <td className="px-3 py-2 text-right font-bold text-primary">57,700.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MisAccountsReports;
