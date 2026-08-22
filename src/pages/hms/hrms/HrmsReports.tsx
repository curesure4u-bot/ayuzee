import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { BarChart3, Download, Users, CalendarClock, IndianRupee, TrendingUp, Award, Clock } from "lucide-react";

const reportCategories = [
  { title: "Employee Reports", icon: Users, color: "text-blue-600", reports: [
    { id: "emp-master", name: "Employee Master List", description: "Complete employee directory", format: "Excel" },
    { id: "emp-department", name: "Department-wise Workforce", description: "Headcount by department", format: "Excel" },
    { id: "emp-branch", name: "Branch-wise Workforce", description: "Staff across branches", format: "Excel" },
    { id: "emp-joiners", name: "New Joiners Report", description: "Joined in selected period", format: "Excel" },
    { id: "emp-probation", name: "Probation Report", description: "On probation with end dates", format: "Excel" },
  ]},
  { title: "Attendance Reports", icon: CalendarClock, color: "text-green-600", reports: [
    { id: "att-monthly", name: "Monthly Attendance Register", description: "Day-by-day for all employees", format: "Excel" },
    { id: "att-absent", name: "Absenteeism Report", description: "Absent with frequency", format: "Excel" },
    { id: "att-late", name: "Late Coming Report", description: "Late arrivals breakdown", format: "Excel" },
    { id: "att-overtime", name: "Overtime Report", description: "Extra hours worked", format: "Excel" },
  ]},
  { title: "Leave Reports", icon: Clock, color: "text-purple-600", reports: [
    { id: "leave-bal", name: "Leave Balance Report", description: "Current balances all staff", format: "Excel" },
    { id: "leave-util", name: "Leave Utilization", description: "Taken vs available by type", format: "Excel" },
    { id: "leave-hist", name: "Leave History", description: "All transactions for period", format: "Excel" },
  ]},
  { title: "Payroll Reports", icon: IndianRupee, color: "text-emerald-600", reports: [
    { id: "pay-reg", name: "Salary Register", description: "Monthly with all components", format: "Excel" },
    { id: "pay-bank", name: "Bank Transfer Statement", description: "Net salary for disbursement", format: "Excel" },
    { id: "pay-pf", name: "PF Statement", description: "Employee + employer PF", format: "Excel" },
    { id: "pay-esi", name: "ESI Statement", description: "ESI contributions", format: "Excel" },
    { id: "pay-pt", name: "Professional Tax Report", description: "PT for state filing", format: "Excel" },
    { id: "pay-tds", name: "TDS Summary", description: "Tax deducted at source", format: "Excel" },
  ]},
  { title: "Performance & Training", icon: Award, color: "text-amber-600", reports: [
    { id: "kpi-score", name: "KPI Scorecard", description: "Employee scores for period", format: "PDF" },
    { id: "incentive", name: "Incentive Summary", description: "Calculated and approved", format: "Excel" },
    { id: "training", name: "Training Compliance", description: "Mandatory completion status", format: "Excel" },
  ]},
  { title: "Attrition", icon: TrendingUp, color: "text-red-600", reports: [
    { id: "attrition", name: "Attrition Report", description: "Exits by reason, department", format: "Excel" },
    { id: "turnover", name: "Turnover Rate", description: "Monthly/quarterly %", format: "PDF" },
  ]},
];

const HrmsReports = () => {
  const [period, setPeriod] = useState("2026-08");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="h-6 w-6 text-slate-600" /> Reports</h1>
          <p className="text-sm text-muted-foreground">Generate and export HR reports</p>
        </div>
        <input type="month" className="h-8 rounded-md border border-input bg-background px-3 text-xs" value={period} onChange={(e) => setPeriod(e.target.value)} />
      </div>

      {reportCategories.map((cat) => (
        <Card key={cat.title}>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><cat.icon className={`h-4 w-4 ${cat.color}`} />{cat.title}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {cat.reports.map((r) => (
                <div key={r.id} className="border rounded-lg p-3 hover:bg-muted/30 transition cursor-pointer group" onClick={() => toast.success(`Generating ${r.name}...`)}>
                  <div className="flex items-start justify-between">
                    <div><p className="text-xs font-medium">{r.name}</p><p className="text-[9px] text-muted-foreground mt-0.5">{r.description}</p></div>
                    <Badge variant="outline" className="text-[8px] shrink-0 ml-2">{r.format}</Badge>
                  </div>
                  <Button size="sm" variant="ghost" className="h-6 text-[10px] mt-2 w-full opacity-0 group-hover:opacity-100 transition"><Download className="h-3 w-3 mr-1" /> Generate</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default HrmsReports;
