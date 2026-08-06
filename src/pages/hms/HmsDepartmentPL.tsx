import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, TrendingDown } from "lucide-react";

const departments = [
  { name: "OPD (Consultations)", revenue: 485000, expenses: 180000, profit: 305000, margin: 63, trend: "up", patients: 620 },
  { name: "Panchakarma / OPT", revenue: 380000, expenses: 145000, profit: 235000, margin: 62, trend: "up", patients: 85 },
  { name: "Pharmacy", revenue: 320000, expenses: 240000, profit: 80000, margin: 25, trend: "down", patients: 480 },
  { name: "Lab & Diagnostics", revenue: 195000, expenses: 65000, profit: 130000, margin: 67, trend: "up", patients: 310 },
  { name: "IP / Wards", revenue: 280000, expenses: 120000, profit: 160000, margin: 57, trend: "up", patients: 22 },
  { name: "Yoga & Naturopathy", revenue: 85000, expenses: 35000, profit: 50000, margin: 59, trend: "up", patients: 45 },
  { name: "Swarnaprasanam", revenue: 42000, expenses: 12000, profit: 30000, margin: 71, trend: "down", patients: 180 },
  { name: "Spine AYUSH (Franchise)", revenue: 520000, expenses: 210000, profit: 310000, margin: 60, trend: "up", patients: 95 },
];

const HmsDepartmentPL = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div><h1 className="text-2xl font-bold">Department P&L</h1><p className="text-sm text-muted-foreground">Each department as a profit center — Revenue, Expenses, Profit, Margin</p></div>
      <Badge variant="outline">July 2026</Badge>
    </div>
    <div className="grid grid-cols-4 gap-3">
      <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-700">₹23.1L</p><p className="text-xs text-muted-foreground">Total Revenue</p></CardContent></Card>
      <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-600">₹10.1L</p><p className="text-xs text-muted-foreground">Total Expenses</p></CardContent></Card>
      <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-700">₹13.0L</p><p className="text-xs text-muted-foreground">Net Profit</p></CardContent></Card>
      <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">56%</p><p className="text-xs text-muted-foreground">Avg Margin</p></CardContent></Card>
    </div>
    <Card><CardContent className="p-0"><table className="w-full text-sm"><thead className="bg-muted/50"><tr><th className="p-3 text-left">Department</th><th className="p-3">Revenue</th><th className="p-3">Expenses</th><th className="p-3">Profit</th><th className="p-3">Margin</th><th className="p-3">Patients</th><th className="p-3">Trend</th></tr></thead>
      <tbody>{departments.map(d => (<tr key={d.name} className="border-t"><td className="p-3 font-medium">{d.name}</td><td className="p-3 text-center text-green-700">₹{(d.revenue/1000).toFixed(0)}K</td><td className="p-3 text-center text-red-600">₹{(d.expenses/1000).toFixed(0)}K</td><td className="p-3 text-center font-bold">₹{(d.profit/1000).toFixed(0)}K</td><td className="p-3 text-center"><Badge className={d.margin > 60 ? "bg-green-100 text-green-800" : d.margin > 40 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}>{d.margin}%</Badge></td><td className="p-3 text-center">{d.patients}</td><td className="p-3 text-center">{d.trend === "up" ? <TrendingUp className="h-4 w-4 text-green-600 mx-auto" /> : <TrendingDown className="h-4 w-4 text-red-600 mx-auto" />}</td></tr>))}</tbody></table></CardContent></Card>
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5" />AI Insights</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
      <p className="p-2 bg-green-50 rounded">🏆 Lab has highest margin (67%) — consider adding more test profiles to increase volume</p>
      <p className="p-2 bg-amber-50 rounded">⚠️ Pharmacy margin dropped to 25% — review purchase rates, check dead stock, negotiate with suppliers</p>
      <p className="p-2 bg-blue-50 rounded">💡 Spine AYUSH generates ₹3.1L profit — expanding to 2 more franchise locations could add ₹6L/month</p>
    </CardContent></Card>
  </div>
);
export default HmsDepartmentPL;
