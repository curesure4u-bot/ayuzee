import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Award, Users, IndianRupee, Target, CheckCircle2,
  XCircle, Loader2, AlertTriangle, TrendingUp, Clock,
} from "lucide-react";
import { useHrmsIncentives } from "@/hooks/hrms/useHrmsIncentives";

const statusStyles: Record<string, { label: string; color: string }> = {
  calculated: { label: "Pending", color: "bg-amber-100 text-amber-700" },
  approved: { label: "Approved", color: "bg-green-100 text-green-700" },
  paid: { label: "Paid", color: "bg-blue-100 text-blue-700" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700" },
  on_hold: { label: "On Hold", color: "bg-gray-100 text-gray-700" },
};

const metricLabels: Record<string, string> = {
  revenue: "Revenue",
  procedures: "Procedures",
  attendance: "Attendance",
  patients: "Patients",
  target_achievement: "Target %",
  custom: "Custom",
};

const HrmsIncentives = () => {
  const now = new Date();
  const [selMonth, setSelMonth] = useState(now.getMonth() + 1);
  const [selYear, setSelYear] = useState(now.getFullYear());

  const {
    rules, incentives, pendingIncentives, approvedIncentives,
    summary, loading, error, approveIncentive, rejectIncentive,
  } = useHrmsIncentives(selMonth, selYear);

  const handleApprove = async (id: string) => {
    const ok = await approveIncentive(id);
    if (ok) toast.success("Incentive approved");
    else toast.error("Failed to approve");
  };

  const handleReject = async (id: string) => {
    const ok = await rejectIncentive(id, "Not meeting criteria");
    if (ok) toast.success("Incentive rejected");
    else toast.error("Failed to reject");
  };

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Award className="h-6 w-6 text-amber-600" /> Incentives
          </h1>
          <p className="text-sm text-muted-foreground">Performance-based incentive calculation & approval</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selMonth.toString()} onValueChange={(v) => setSelMonth(Number(v))}>
            <SelectTrigger className="h-8 w-[90px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {months.map((m, i) => <SelectItem key={i} value={(i + 1).toString()}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selYear.toString()} onValueChange={(v) => setSelYear(Number(v))}>
            <SelectTrigger className="h-8 w-[80px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Loading...</span>
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
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="border-amber-100">
          <CardContent className="p-3 text-center">
            <IndianRupee className="h-4 w-4 mx-auto text-amber-600" />
            <p className="text-xl font-bold mt-1 text-amber-700">₹{(summary.totalCalculated / 1000).toFixed(0)}K</p>
            <p className="text-[9px] text-muted-foreground">Calculated</p>
          </CardContent>
        </Card>
        <Card className="border-green-100">
          <CardContent className="p-3 text-center">
            <CheckCircle2 className="h-4 w-4 mx-auto text-green-600" />
            <p className="text-xl font-bold mt-1 text-green-700">₹{(summary.totalApproved / 1000).toFixed(0)}K</p>
            <p className="text-[9px] text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card className="border-blue-100">
          <CardContent className="p-3 text-center">
            <IndianRupee className="h-4 w-4 mx-auto text-blue-600" />
            <p className="text-xl font-bold mt-1 text-blue-700">₹{(summary.totalPaid / 1000).toFixed(0)}K</p>
            <p className="text-[9px] text-muted-foreground">Paid</p>
          </CardContent>
        </Card>
        <Card className="border-purple-100">
          <CardContent className="p-3 text-center">
            <Clock className="h-4 w-4 mx-auto text-purple-600" />
            <p className="text-xl font-bold mt-1 text-purple-700">{summary.pendingApproval}</p>
            <p className="text-[9px] text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="border-slate-100">
          <CardContent className="p-3 text-center">
            <Users className="h-4 w-4 mx-auto text-slate-600" />
            <p className="text-xl font-bold mt-1">{summary.employeesEligible}</p>
            <p className="text-[9px] text-muted-foreground">Eligible</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="incentives">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="incentives">Employee Incentives</TabsTrigger>
          <TabsTrigger value="rules">Rules ({rules.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingIncentives.length})</TabsTrigger>
        </TabsList>

        {/* ─── Employee Incentives ─────────────────────────────────────────── */}
        <TabsContent value="incentives" className="space-y-3">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[800px]">
                  <thead className="border-b bg-muted/40">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Employee</th>
                      <th className="px-3 py-2 text-left font-medium">Incentive</th>
                      <th className="px-3 py-2 text-center font-medium">Metric</th>
                      <th className="px-3 py-2 text-center font-medium">Target</th>
                      <th className="px-3 py-2 text-center font-medium">Achievement</th>
                      <th className="px-3 py-2 text-right font-medium">Calculated</th>
                      <th className="px-3 py-2 text-right font-medium">Approved</th>
                      <th className="px-3 py-2 text-center font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incentives.map((inc) => {
                      const st = statusStyles[inc.status];
                      return (
                        <tr key={inc.id} className="border-b hover:bg-muted/20">
                          <td className="px-3 py-2">
                            <p className="font-medium">{inc.employeeName}</p>
                            <p className="text-[9px] text-muted-foreground">{inc.employeeCode} &middot; {inc.department}</p>
                          </td>
                          <td className="px-3 py-2">
                            <p className="font-medium">{inc.ruleName}</p>
                            <p className="text-[9px] text-muted-foreground">{inc.ruleCode}</p>
                          </td>
                          <td className="px-3 py-2 text-center font-medium">
                            {inc.metricValue.toLocaleString("en-IN")}
                          </td>
                          <td className="px-3 py-2 text-center text-muted-foreground">
                            {inc.targetValue.toLocaleString("en-IN")}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <div className="flex items-center gap-1 justify-center">
                              <Progress value={Math.min(100, inc.achievementPct)} className="w-12 h-1.5" />
                              <span className={`font-medium ${inc.achievementPct >= 100 ? "text-green-700" : "text-amber-700"}`}>
                                {inc.achievementPct}%
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right font-medium">₹{inc.calculatedAmount.toLocaleString("en-IN")}</td>
                          <td className="px-3 py-2 text-right font-bold text-green-700">
                            {inc.approvedAmount > 0 ? `₹${inc.approvedAmount.toLocaleString("en-IN")}` : "—"}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <Badge className={`text-[9px] border-0 ${st?.color}`}>{st?.label}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                    {incentives.length === 0 && (
                      <tr><td colSpan={8} className="py-8 text-center text-muted-foreground text-sm">No incentives for this period</td></tr>
                    )}
                  </tbody>
                  {incentives.length > 0 && (
                    <tfoot className="bg-muted/30 border-t-2">
                      <tr>
                        <td className="px-3 py-2 font-bold" colSpan={5}>Total</td>
                        <td className="px-3 py-2 text-right font-bold">₹{summary.totalCalculated.toLocaleString("en-IN")}</td>
                        <td className="px-3 py-2 text-right font-bold text-green-700">₹{summary.totalApproved.toLocaleString("en-IN")}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Rules ───────────────────────────────────────────────────────── */}
        <TabsContent value="rules" className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            {rules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm">{rule.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{rule.description}</p>
                    </div>
                    <Badge variant="outline" className="text-[9px] shrink-0">{rule.code}</Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Metric:</span>
                      <span className="font-medium">{metricLabels[rule.metric] || rule.metric}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium capitalize">{rule.calcType}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Value:</span>
                      <span className="font-medium">
                        {rule.calcType === "fixed" ? `₹${rule.fixedAmount}` :
                         rule.calcType === "percentage" ? `${rule.percentage}%` :
                         `Slab (${rule.slabs.length} tiers)`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Freq:</span>
                      <span className="font-medium capitalize">{rule.frequency}</span>
                    </div>
                  </div>
                  {rule.applicableRoles.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {rule.applicableRoles.map((r) => (
                        <Badge key={r} variant="outline" className="text-[9px] capitalize">{r}</Badge>
                      ))}
                    </div>
                  )}
                  {rule.slabs.length > 0 && (
                    <div className="mt-2 p-2 rounded bg-muted/30 text-[10px]">
                      {rule.slabs.map((slab, i) => (
                        <div key={i} className="flex justify-between">
                          <span>{slab.from} – {slab.to}</span>
                          <span className="font-medium">₹{slab.amount.toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ─── Pending Approval ────────────────────────────────────────────── */}
        <TabsContent value="pending" className="space-y-3">
          {pendingIncentives.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">No incentives pending approval</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {pendingIncentives.map((inc) => (
                <Card key={inc.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{inc.employeeName}</p>
                          <Badge variant="outline" className="text-[9px]">{inc.ruleCode}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {inc.employeeCode} &middot; {inc.department} &middot; {inc.role}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-xs">Metric: <strong>{inc.metricValue.toLocaleString("en-IN")}</strong></span>
                          <span className="text-xs">Target: <strong>{inc.targetValue.toLocaleString("en-IN")}</strong></span>
                          <span className="text-xs">Achievement: <strong className={inc.achievementPct >= 100 ? "text-green-700" : "text-amber-700"}>{inc.achievementPct}%</strong></span>
                        </div>
                        <p className="text-sm font-bold mt-2 text-amber-700">
                          Calculated: ₹{inc.calculatedAmount.toLocaleString("en-IN")}
                        </p>
                        {inc.remarks && <p className="text-xs text-muted-foreground mt-1 italic">{inc.remarks}</p>}
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700" onClick={() => handleApprove(inc.id)}>
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => handleReject(inc.id)}>
                          <XCircle className="h-3 w-3 mr-1" /> Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HrmsIncentives;
