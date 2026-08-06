import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  BarChart3, IndianRupee, TrendingUp, TrendingDown, Download,
  FileText, Calendar, ArrowUpRight, ArrowDownRight, Printer,
} from "lucide-react";

interface PLItem {
  category: string;
  items: { label: string; amount: number }[];
  total: number;
}

const revenue: PLItem = {
  category: "Revenue",
  items: [
    { label: "OPD Consultation Fees", amount: 385000 },
    { label: "Lab & Diagnostics", amount: 345000 },
    { label: "Pharmacy Sales", amount: 265000 },
    { label: "Panchakarma & Therapy", amount: 155000 },
    { label: "Radiology & Imaging", amount: 95000 },
    { label: "Health Packages", amount: 48000 },
    { label: "Home Collection Charges", amount: 12000 },
  ],
  total: 1305000,
};

const expenses: PLItem = {
  category: "Expenses",
  items: [
    { label: "Staff Salaries & Wages", amount: 285000 },
    { label: "Lab Reagents & Consumables", amount: 68000 },
    { label: "Pharmacy Stock (COGS)", amount: 145000 },
    { label: "Rent & Utilities", amount: 42000 },
    { label: "Equipment Maintenance", amount: 18500 },
    { label: "Marketing & Advertising", amount: 12000 },
    { label: "Professional Fees (CA, Legal)", amount: 35000 },
    { label: "Insurance Premiums", amount: 8500 },
    { label: "Transport & Fuel", amount: 8500 },
    { label: "Office & Misc", amount: 6200 },
    { label: "Depreciation", amount: 22000 },
  ],
  total: 650700,
};

const cashFlowData = {
  operatingInflows: [
    { label: "Patient Collections (Cash)", amount: 312000 },
    { label: "Patient Collections (Digital)", amount: 535000 },
    { label: "Insurance Settlements", amount: 135000 },
    { label: "B2B Client Payments", amount: 126500 },
  ],
  operatingOutflows: [
    { label: "Salaries Paid", amount: 285000 },
    { label: "Vendor Payments (Reagents, Stock)", amount: 213000 },
    { label: "Rent & Utilities Paid", amount: 42000 },
    { label: "Other Operating Expenses", amount: 89200 },
  ],
  investingOutflows: [
    { label: "Equipment Purchase (Sysmex parts)", amount: 45000 },
  ],
  financingInflows: [
    { label: "Advance Deposits from Patients", amount: 20000 },
  ],
};

const monthlyTrend = [
  { month: "Jan", revenue: 980000, expense: 520000, profit: 460000 },
  { month: "Feb", revenue: 1020000, expense: 540000, profit: 480000 },
  { month: "Mar", revenue: 1100000, expense: 560000, profit: 540000 },
  { month: "Apr", revenue: 1050000, expense: 545000, profit: 505000 },
  { month: "May", revenue: 1150000, expense: 580000, profit: 570000 },
  { month: "Jun", revenue: 1220000, expense: 610000, profit: 610000 },
  { month: "Jul", revenue: 1305000, expense: 650700, profit: 654300 },
];

const FinancialReports = () => {
  const [activeTab, setActiveTab] = useState("pl");
  const [period, setPeriod] = useState("this-month");

  const netProfit = revenue.total - expenses.total;
  const profitMargin = ((netProfit / revenue.total) * 100).toFixed(1);
  const operatingCashIn = cashFlowData.operatingInflows.reduce((s, i) => s + i.amount, 0);
  const operatingCashOut = cashFlowData.operatingOutflows.reduce((s, i) => s + i.amount, 0);
  const netCashFlow = operatingCashIn - operatingCashOut - cashFlowData.investingOutflows.reduce((s, i) => s + i.amount, 0) + cashFlowData.financingInflows.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Financial Reports</h2>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}><SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="this-month">July 2026</SelectItem><SelectItem value="last-month">June 2026</SelectItem><SelectItem value="quarter">Q1 FY27</SelectItem><SelectItem value="year">FY 2026-27</SelectItem></SelectContent></Select>
          <Button size="sm" variant="outline" className="h-8 text-xs"><Download className="mr-1 h-3 w-3" /> Export PDF</Button>
          <Button size="sm" variant="outline" className="h-8 text-xs"><Printer className="mr-1 h-3 w-3" /> Print</Button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-green-200"><CardContent className="p-3 text-center"><TrendingUp className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600 mt-1">₹{(revenue.total / 100000).toFixed(1)}L</p><p className="text-[10px] text-muted-foreground">Total Revenue</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><TrendingDown className="h-4 w-4 mx-auto text-red-600" /><p className="text-xl font-bold text-red-600 mt-1">₹{(expenses.total / 100000).toFixed(1)}L</p><p className="text-[10px] text-muted-foreground">Total Expenses</p></CardContent></Card>
        <Card className="border-emerald-200"><CardContent className="p-3 text-center"><IndianRupee className="h-4 w-4 mx-auto text-emerald-600" /><p className="text-xl font-bold text-emerald-600 mt-1">₹{(netProfit / 100000).toFixed(1)}L</p><p className="text-[10px] text-muted-foreground">Net Profit</p></CardContent></Card>
        <Card className="border-blue-200"><CardContent className="p-3 text-center"><BarChart3 className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold text-blue-600 mt-1">{profitMargin}%</p><p className="text-[10px] text-muted-foreground">Profit Margin</p></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="pl">Profit & Loss</TabsTrigger><TabsTrigger value="cashflow">Cash Flow</TabsTrigger><TabsTrigger value="trend">Monthly Trend</TabsTrigger></TabsList>

        {/* P&L */}
        <TabsContent value="pl" className="space-y-3">
          <Card>
            <CardHeader className="pb-2 border-b"><CardTitle className="text-sm">Profit & Loss Statement — July 2026</CardTitle></CardHeader>
            <CardContent className="p-0">
              {/* Revenue */}
              <div className="border-b">
                <div className="px-4 py-2 bg-green-50 flex justify-between items-center"><span className="text-xs font-bold text-green-800">REVENUE</span><span className="text-xs font-bold text-green-800">₹{(revenue.total / 100000).toFixed(2)}L</span></div>
                {revenue.items.map((item) => (
                  <div key={item.label} className="px-6 py-1.5 flex justify-between text-xs border-b border-dashed border-gray-100"><span>{item.label}</span><span className="text-green-700">₹{item.amount.toLocaleString()}</span></div>
                ))}
              </div>
              {/* Expenses */}
              <div className="border-b">
                <div className="px-4 py-2 bg-red-50 flex justify-between items-center"><span className="text-xs font-bold text-red-800">EXPENSES</span><span className="text-xs font-bold text-red-800">₹{(expenses.total / 100000).toFixed(2)}L</span></div>
                {expenses.items.map((item) => (
                  <div key={item.label} className="px-6 py-1.5 flex justify-between text-xs border-b border-dashed border-gray-100"><span>{item.label}</span><span className="text-red-700">₹{item.amount.toLocaleString()}</span></div>
                ))}
              </div>
              {/* Net Profit */}
              <div className="px-4 py-3 bg-emerald-50 flex justify-between items-center">
                <span className="text-sm font-bold text-emerald-800">NET PROFIT</span>
                <span className="text-lg font-bold text-emerald-800">₹{netProfit.toLocaleString()} ({profitMargin}%)</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cash Flow */}
        <TabsContent value="cashflow" className="space-y-3">
          <Card>
            <CardHeader className="pb-2 border-b"><CardTitle className="text-sm">Cash Flow Statement — July 2026</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="border-b">
                <div className="px-4 py-2 bg-green-50 font-bold text-xs text-green-800">A. Operating Activities — Inflows</div>
                {cashFlowData.operatingInflows.map(i => <div key={i.label} className="px-6 py-1.5 flex justify-between text-xs border-b border-dashed border-gray-100"><span>{i.label}</span><span className="text-green-600">+₹{i.amount.toLocaleString()}</span></div>)}
                <div className="px-6 py-1.5 flex justify-between text-xs font-medium bg-green-50/50"><span>Total Inflows</span><span className="text-green-700">₹{operatingCashIn.toLocaleString()}</span></div>
              </div>
              <div className="border-b">
                <div className="px-4 py-2 bg-red-50 font-bold text-xs text-red-800">A. Operating Activities — Outflows</div>
                {cashFlowData.operatingOutflows.map(i => <div key={i.label} className="px-6 py-1.5 flex justify-between text-xs border-b border-dashed border-gray-100"><span>{i.label}</span><span className="text-red-600">-₹{i.amount.toLocaleString()}</span></div>)}
                <div className="px-6 py-1.5 flex justify-between text-xs font-medium bg-red-50/50"><span>Total Outflows</span><span className="text-red-700">₹{operatingCashOut.toLocaleString()}</span></div>
              </div>
              <div className="border-b">
                <div className="px-4 py-2 bg-amber-50 font-bold text-xs text-amber-800">B. Investing Activities</div>
                {cashFlowData.investingOutflows.map(i => <div key={i.label} className="px-6 py-1.5 flex justify-between text-xs"><span>{i.label}</span><span className="text-red-600">-₹{i.amount.toLocaleString()}</span></div>)}
              </div>
              <div className="border-b">
                <div className="px-4 py-2 bg-blue-50 font-bold text-xs text-blue-800">C. Financing Activities</div>
                {cashFlowData.financingInflows.map(i => <div key={i.label} className="px-6 py-1.5 flex justify-between text-xs"><span>{i.label}</span><span className="text-green-600">+₹{i.amount.toLocaleString()}</span></div>)}
              </div>
              <div className="px-4 py-3 bg-emerald-50 flex justify-between items-center">
                <span className="text-sm font-bold text-emerald-800">NET CASH FLOW</span>
                <span className="text-lg font-bold text-emerald-800">₹{netCashFlow.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly Trend */}
        <TabsContent value="trend" className="space-y-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Monthly Financial Trend — FY 2026-27</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-xs">
                <thead className="bg-muted/50 border-b"><tr><th className="px-3 py-2 text-left">Month</th><th className="px-3 py-2 text-right">Revenue</th><th className="px-3 py-2 text-right">Expenses</th><th className="px-3 py-2 text-right">Profit</th><th className="px-3 py-2 text-right">Margin</th><th className="px-3 py-2 text-left w-[120px]">Trend</th></tr></thead>
                <tbody>
                  {monthlyTrend.map((m, idx) => {
                    const margin = ((m.profit / m.revenue) * 100).toFixed(0);
                    const prevProfit = idx > 0 ? monthlyTrend[idx - 1].profit : m.profit;
                    const change = ((m.profit - prevProfit) / prevProfit * 100).toFixed(1);
                    return (
                      <tr key={m.month} className="border-b">
                        <td className="px-3 py-2 font-medium">{m.month} 2026</td>
                        <td className="px-3 py-2 text-right text-green-600">₹{(m.revenue / 100000).toFixed(1)}L</td>
                        <td className="px-3 py-2 text-right text-red-600">₹{(m.expense / 100000).toFixed(1)}L</td>
                        <td className="px-3 py-2 text-right font-bold text-emerald-700">₹{(m.profit / 100000).toFixed(1)}L</td>
                        <td className="px-3 py-2 text-right">{margin}%</td>
                        <td className="px-3 py-2">
                          <div className="h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(m.profit / 700000) * 100}%` }} /></div>
                          {idx > 0 && <span className={`text-[9px] ${parseFloat(change) >= 0 ? "text-green-600" : "text-red-600"}`}>{parseFloat(change) >= 0 ? "↑" : "↓"}{Math.abs(parseFloat(change))}%</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialReports;
