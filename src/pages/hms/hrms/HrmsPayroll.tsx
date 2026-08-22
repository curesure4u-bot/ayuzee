import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  IndianRupee, Users, CheckCircle2, Lock, Play, Download,
  Loader2, AlertTriangle, FileText, CreditCard, Clock,
  ArrowRight, BarChart3, Printer,
} from "lucide-react";
import { useHrmsPayroll } from "@/hooks/hrms/useHrmsPayroll";

const statusStyles: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700", icon: Clock },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-700", icon: Play },
  hr_review: { label: "HR Review", color: "bg-amber-100 text-amber-700", icon: FileText },
  approved: { label: "Approved", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  locked: { label: "Locked", color: "bg-purple-100 text-purple-700", icon: Lock },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700", icon: AlertTriangle },
};

const HrmsPayroll = () => {
  const navigate = useNavigate();
  const now = new Date();
  const [selMonth, setSelMonth] = useState(now.getMonth() + 1);
  const [selYear, setSelYear] = useState(now.getFullYear());

  const {
    payrollRuns, currentRun, payrollItems, salaryRegister,
    loading, error, totalPayroll, totalGross, totalDeductions, totalPF, totalESI,
    processPayroll, approvePayroll, lockPayroll,
  } = useHrmsPayroll(selMonth, selYear);

  const handleProcess = async () => {
    const ok = await processPayroll(selMonth, selYear);
    if (ok) toast.success("Payroll processing started");
    else toast.error("Failed to start payroll");
  };

  const handleApprove = async () => {
    if (!currentRun) return;
    const ok = await approvePayroll(currentRun.id);
    if (ok) toast.success("Payroll approved");
    else toast.error("Failed to approve");
  };

  const handleLock = async () => {
    if (!currentRun) return;
    const ok = await lockPayroll(currentRun.id);
    if (ok) toast.success("Payroll locked. Payslips generated.");
    else toast.error("Failed to lock payroll");
  };

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <IndianRupee className="h-6 w-6 text-green-600" /> Payroll & Salary
          </h1>
          <p className="text-sm text-muted-foreground">Monthly payroll processing, salary register & payslips</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selMonth.toString()} onValueChange={(v) => setSelMonth(Number(v))}>
            <SelectTrigger className="h-8 w-[100px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {months.map((m, i) => <SelectItem key={i} value={(i + 1).toString()}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selYear.toString()} onValueChange={(v) => setSelYear(Number(v))}>
            <SelectTrigger className="h-8 w-[80px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2027">2027</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Loading payroll...</span>
        </div>
      )}
      {error && !loading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-2 text-xs text-amber-700 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5" /> Showing demo data. {error}
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="border-blue-100">
          <CardContent className="p-3 text-center">
            <Users className="h-4 w-4 mx-auto text-blue-600" />
            <p className="text-xl font-bold mt-1">{payrollItems.length}</p>
            <p className="text-[9px] text-muted-foreground">Employees</p>
          </CardContent>
        </Card>
        <Card className="border-green-100">
          <CardContent className="p-3 text-center">
            <IndianRupee className="h-4 w-4 mx-auto text-green-600" />
            <p className="text-xl font-bold mt-1 text-green-700">₹{(totalGross / 1000).toFixed(0)}K</p>
            <p className="text-[9px] text-muted-foreground">Gross Payroll</p>
          </CardContent>
        </Card>
        <Card className="border-red-100">
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold mt-1 text-red-600">₹{(totalDeductions / 1000).toFixed(0)}K</p>
            <p className="text-[9px] text-muted-foreground">Deductions</p>
          </CardContent>
        </Card>
        <Card className="border-purple-100">
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold mt-1 text-purple-700">₹{(totalPayroll / 1000).toFixed(0)}K</p>
            <p className="text-[9px] text-muted-foreground">Net Payout</p>
          </CardContent>
        </Card>
        <Card className="border-indigo-100">
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold mt-1 text-indigo-700">₹{(totalPF / 1000).toFixed(1)}K</p>
            <p className="text-[9px] text-muted-foreground">PF Total</p>
          </CardContent>
        </Card>
        <Card className="border-cyan-100">
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold mt-1 text-cyan-700">₹{totalESI.toLocaleString("en-IN")}</p>
            <p className="text-[9px] text-muted-foreground">ESI Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Run Status & Actions */}
      {currentRun && (
        <Card className="border-l-4 border-l-indigo-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-semibold">{currentRun.periodLabel}</p>
                  <p className="text-xs text-muted-foreground">Payroll Run Status</p>
                </div>
                <Badge className={`text-xs border-0 ${statusStyles[currentRun.status]?.color}`}>
                  {statusStyles[currentRun.status]?.label}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {currentRun.status === "draft" && (
                  <Button size="sm" onClick={handleProcess}>
                    <Play className="h-3.5 w-3.5 mr-1" /> Process Payroll
                  </Button>
                )}
                {(currentRun.status === "processing" || currentRun.status === "hr_review") && (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleApprove}>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                  </Button>
                )}
                {currentRun.status === "approved" && (
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={handleLock}>
                    <Lock className="h-3.5 w-3.5 mr-1" /> Lock & Generate Payslips
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  <Download className="h-3.5 w-3.5 mr-1" /> Export
                </Button>
              </div>
            </div>
            {/* Workflow Steps */}
            <div className="flex items-center gap-1 mt-3 text-[10px]">
              {["draft", "processing", "hr_review", "approved", "locked"].map((step, i, arr) => {
                const isActive = step === currentRun.status;
                const isPast = arr.indexOf(currentRun.status) > i;
                return (
                  <div key={step} className="flex items-center gap-1">
                    <span className={`px-2 py-0.5 rounded ${isPast ? "bg-green-100 text-green-700" : isActive ? "bg-blue-100 text-blue-700 font-bold" : "bg-gray-100 text-gray-500"}`}>
                      {step.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                    {i < arr.length - 1 && <ArrowRight className="h-3 w-3 text-gray-300" />}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="paysheet">
        <TabsList className="grid grid-cols-3 w-full max-w-lg">
          <TabsTrigger value="paysheet">Payroll Sheet</TabsTrigger>
          <TabsTrigger value="register">Salary Register</TabsTrigger>
          <TabsTrigger value="history">Run History</TabsTrigger>
        </TabsList>

        {/* ─── Payroll Sheet ───────────────────────────────────────────────── */}
        <TabsContent value="paysheet" className="space-y-3">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[1000px]">
                  <thead className="border-b bg-muted/40">
                    <tr>
                      <th className="px-2 py-2 text-left font-medium">Employee</th>
                      <th className="px-2 py-2 text-center font-medium">Days</th>
                      <th className="px-2 py-2 text-right font-medium">Basic</th>
                      <th className="px-2 py-2 text-right font-medium">HRA</th>
                      <th className="px-2 py-2 text-right font-medium">Sp.Allow</th>
                      <th className="px-2 py-2 text-right font-medium">Incentive</th>
                      <th className="px-2 py-2 text-right font-medium text-green-700">Gross</th>
                      <th className="px-2 py-2 text-right font-medium">PF</th>
                      <th className="px-2 py-2 text-right font-medium">ESI</th>
                      <th className="px-2 py-2 text-right font-medium">PT</th>
                      <th className="px-2 py-2 text-right font-medium">TDS</th>
                      <th className="px-2 py-2 text-right font-medium">LOP</th>
                      <th className="px-2 py-2 text-right font-medium text-red-600">Deduct</th>
                      <th className="px-2 py-2 text-right font-medium text-green-700">Net</th>
                      <th className="px-2 py-2 text-center font-medium">Payslip</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollItems.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/20">
                        <td className="px-2 py-2">
                          <p className="font-medium">{item.employeeName}</p>
                          <p className="text-[9px] text-muted-foreground">{item.employeeCode} &middot; {item.department}</p>
                        </td>
                        <td className="px-2 py-2 text-center">
                          <span className="font-medium">{item.paidDays}</span>
                          <span className="text-muted-foreground">/{item.workingDays}</span>
                          {item.lopDays > 0 && <span className="text-red-500 text-[9px] block">LOP:{item.lopDays}</span>}
                        </td>
                        <td className="px-2 py-2 text-right">₹{item.basic.toLocaleString("en-IN")}</td>
                        <td className="px-2 py-2 text-right">₹{item.hra.toLocaleString("en-IN")}</td>
                        <td className="px-2 py-2 text-right">₹{item.specialAllowance.toLocaleString("en-IN")}</td>
                        <td className="px-2 py-2 text-right">{item.incentive > 0 ? `₹${item.incentive.toLocaleString("en-IN")}` : "—"}</td>
                        <td className="px-2 py-2 text-right font-bold text-green-700">₹{item.grossSalary.toLocaleString("en-IN")}</td>
                        <td className="px-2 py-2 text-right text-red-600">₹{item.pfEmployee.toLocaleString("en-IN")}</td>
                        <td className="px-2 py-2 text-right text-red-600">{item.esiEmployee > 0 ? `₹${item.esiEmployee}` : "—"}</td>
                        <td className="px-2 py-2 text-right text-red-600">{item.professionalTax > 0 ? `₹${item.professionalTax}` : "—"}</td>
                        <td className="px-2 py-2 text-right text-red-600">{item.tds > 0 ? `₹${item.tds.toLocaleString("en-IN")}` : "—"}</td>
                        <td className="px-2 py-2 text-right text-red-600">{item.lopDeduction > 0 ? `₹${item.lopDeduction.toLocaleString("en-IN")}` : "—"}</td>
                        <td className="px-2 py-2 text-right font-bold text-red-600">₹{item.totalDeductions.toLocaleString("en-IN")}</td>
                        <td className="px-2 py-2 text-right font-bold text-green-700">₹{item.netSalary.toLocaleString("en-IN")}</td>
                        <td className="px-2 py-2 text-center">
                          <Button
                            variant="ghost" size="sm" className="h-6 w-6 p-0"
                            onClick={() => navigate(`/hms/hrms/payroll/payslip/${item.employeeId}?month=${selMonth}&year=${selYear}`)}
                          >
                            <FileText className="h-3.5 w-3.5 text-blue-600" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/30 border-t-2">
                    <tr>
                      <td className="px-2 py-2 font-bold" colSpan={2}>Total ({payrollItems.length} employees)</td>
                      <td className="px-2 py-2 text-right font-bold">₹{payrollItems.reduce((s, i) => s + i.basic, 0).toLocaleString("en-IN")}</td>
                      <td className="px-2 py-2 text-right font-bold">₹{payrollItems.reduce((s, i) => s + i.hra, 0).toLocaleString("en-IN")}</td>
                      <td className="px-2 py-2 text-right font-bold">₹{payrollItems.reduce((s, i) => s + i.specialAllowance, 0).toLocaleString("en-IN")}</td>
                      <td className="px-2 py-2 text-right font-bold">₹{payrollItems.reduce((s, i) => s + i.incentive, 0).toLocaleString("en-IN")}</td>
                      <td className="px-2 py-2 text-right font-bold text-green-700">₹{totalGross.toLocaleString("en-IN")}</td>
                      <td className="px-2 py-2 text-right font-bold text-red-600">₹{totalPF.toLocaleString("en-IN")}</td>
                      <td className="px-2 py-2 text-right font-bold text-red-600">₹{totalESI.toLocaleString("en-IN")}</td>
                      <td className="px-2 py-2 text-right font-bold text-red-600">₹{payrollItems.reduce((s, i) => s + i.professionalTax, 0).toLocaleString("en-IN")}</td>
                      <td className="px-2 py-2 text-right font-bold text-red-600">₹{payrollItems.reduce((s, i) => s + i.tds, 0).toLocaleString("en-IN")}</td>
                      <td className="px-2 py-2 text-right font-bold text-red-600">₹{payrollItems.reduce((s, i) => s + i.lopDeduction, 0).toLocaleString("en-IN")}</td>
                      <td className="px-2 py-2 text-right font-bold text-red-600">₹{totalDeductions.toLocaleString("en-IN")}</td>
                      <td className="px-2 py-2 text-right font-bold text-green-700">₹{totalPayroll.toLocaleString("en-IN")}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Salary Register ─────────────────────────────────────────────── */}
        <TabsContent value="register" className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2"><CreditCard className="h-4 w-4" /> Salary Register</CardTitle>
                <Button variant="outline" size="sm" className="h-7 text-xs"><Download className="h-3 w-3 mr-1" /> Export</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="border-b bg-muted/40">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Employee</th>
                      <th className="px-3 py-2 text-left font-medium">Designation</th>
                      <th className="px-3 py-2 text-right font-medium">Annual CTC</th>
                      <th className="px-3 py-2 text-right font-medium">Monthly</th>
                      <th className="px-3 py-2 text-right font-medium">Basic</th>
                      <th className="px-3 py-2 text-right font-medium">HRA</th>
                      <th className="px-3 py-2 text-right font-medium">Gross</th>
                      <th className="px-3 py-2 text-right font-medium">Net</th>
                      <th className="px-3 py-2 text-left font-medium">Bank</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaryRegister.map((s) => (
                      <tr key={s.employeeId} className="border-b hover:bg-muted/20">
                        <td className="px-3 py-2">
                          <p className="font-medium">{s.employeeName}</p>
                          <p className="text-[9px] text-muted-foreground">{s.employeeCode} &middot; {s.department}</p>
                        </td>
                        <td className="px-3 py-2">{s.designation}</td>
                        <td className="px-3 py-2 text-right">₹{s.annualCtc.toLocaleString("en-IN")}</td>
                        <td className="px-3 py-2 text-right font-medium">₹{s.monthlyCtc.toLocaleString("en-IN")}</td>
                        <td className="px-3 py-2 text-right">₹{s.basic.toLocaleString("en-IN")}</td>
                        <td className="px-3 py-2 text-right">₹{s.hra.toLocaleString("en-IN")}</td>
                        <td className="px-3 py-2 text-right text-green-700 font-medium">₹{s.grossSalary.toLocaleString("en-IN")}</td>
                        <td className="px-3 py-2 text-right text-green-700 font-bold">₹{s.netSalary.toLocaleString("en-IN")}</td>
                        <td className="px-3 py-2 text-[10px]">{s.bankName} {s.bankAccount}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/30 border-t-2">
                    <tr>
                      <td className="px-3 py-2 font-bold" colSpan={2}>Total ({salaryRegister.length})</td>
                      <td className="px-3 py-2 text-right font-bold">₹{salaryRegister.reduce((s, e) => s + e.annualCtc, 0).toLocaleString("en-IN")}</td>
                      <td className="px-3 py-2 text-right font-bold">₹{salaryRegister.reduce((s, e) => s + e.monthlyCtc, 0).toLocaleString("en-IN")}</td>
                      <td colSpan={2}></td>
                      <td className="px-3 py-2 text-right font-bold text-green-700">₹{salaryRegister.reduce((s, e) => s + e.grossSalary, 0).toLocaleString("en-IN")}</td>
                      <td className="px-3 py-2 text-right font-bold text-green-700">₹{salaryRegister.reduce((s, e) => s + e.netSalary, 0).toLocaleString("en-IN")}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── History ─────────────────────────────────────────────────────── */}
        <TabsContent value="history" className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Payroll Run History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {payrollRuns.map((run) => {
                  const st = statusStyles[run.status];
                  return (
                    <div key={run.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/20">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 grid place-items-center">
                          <IndianRupee className="h-5 w-5 text-green-700" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{run.periodLabel}</p>
                          <p className="text-[10px] text-muted-foreground">{run.totalEmployees} employees &middot; Net: ₹{(run.totalNet / 1000).toFixed(0)}K</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-[10px] border-0 ${st?.color}`}>{st?.label}</Badge>
                        {run.lockedAt && (
                          <span className="text-[9px] text-muted-foreground">
                            Locked {new Date(run.lockedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HrmsPayroll;
