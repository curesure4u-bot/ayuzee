import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { LogOut, Users, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

const MOCK_RESIGNATIONS = [
  {
    id: "res1", employeeName: "Sample Employee X", employeeCode: "EMP-0015", department: "Front Office",
    resignationDate: "2026-08-01", lastWorkingDate: "2026-09-01", reason: "Better opportunity",
    status: "accepted", exitInterviewDone: false,
    clearance: [
      { dept: "HR", item: "Leave settlement", status: "cleared" },
      { dept: "Department", item: "Knowledge transfer", status: "cleared" },
      { dept: "IT", item: "Email/Login deactivation", status: "pending" },
      { dept: "Admin", item: "ID card returned", status: "pending" },
      { dept: "Accounts", item: "Salary dues", status: "cleared" },
      { dept: "Stores", item: "Assets returned", status: "pending" },
    ],
  },
];

const clearanceStatusColors: Record<string, string> = {
  cleared: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  pending_return: "bg-blue-100 text-blue-700",
  issues: "bg-red-100 text-red-700",
};

const HrmsExit = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><LogOut className="h-6 w-6 text-red-600" /> Exit Management</h1>
        <p className="text-sm text-muted-foreground">Resignation, clearance & full-and-final settlement</p>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-3">
      <Card><CardContent className="p-3 text-center"><Users className="h-4 w-4 mx-auto text-red-600" /><p className="text-xl font-bold mt-1">{MOCK_RESIGNATIONS.length}</p><p className="text-[9px] text-muted-foreground">In Notice Period</p></CardContent></Card>
      <Card className="border-amber-100"><CardContent className="p-3 text-center"><Clock className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold mt-1 text-amber-700">{MOCK_RESIGNATIONS.filter((r) => !r.exitInterviewDone).length}</p><p className="text-[9px] text-muted-foreground">Exit Interview Pending</p></CardContent></Card>
      <Card className="border-green-100"><CardContent className="p-3 text-center"><CheckCircle2 className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold mt-1 text-green-700">0</p><p className="text-[9px] text-muted-foreground">Relieved (Month)</p></CardContent></Card>
    </div>

    {/* Exit Cases */}
    {MOCK_RESIGNATIONS.map((res) => {
      const cleared = res.clearance.filter((c) => c.status === "cleared").length;
      const total = res.clearance.length;
      const pct = Math.round((cleared / total) * 100);
      return (
        <Card key={res.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm">{res.employeeName}</CardTitle>
                <p className="text-[10px] text-muted-foreground">{res.employeeCode} &middot; {res.department} &middot; LWD: {new Date(res.lastWorkingDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
              </div>
              <div className="text-right">
                <Badge className="text-[9px] bg-amber-100 text-amber-700 border-0">Notice Period</Badge>
                <p className="text-xs mt-1">Clearance: {pct}%</p>
              </div>
            </div>
            <Progress value={pct} className="h-2 mt-2" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">Reason: {res.reason}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {res.clearance.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="text-xs font-medium">{c.dept}</p>
                    <p className="text-[9px] text-muted-foreground">{c.item}</p>
                  </div>
                  <Badge className={`text-[8px] border-0 capitalize ${clearanceStatusColors[c.status]}`}>{c.status}</Badge>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              {!res.exitInterviewDone && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => toast.info("Schedule exit interview")}>Schedule Exit Interview</Button>}
              {pct === 100 && <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700" onClick={() => toast.success("F&F initiated")}>Initiate F&F Settlement</Button>}
              {pct < 100 && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => toast.info("Reminder sent")}>Send Clearance Reminder</Button>}
            </div>
          </CardContent>
        </Card>
      );
    })}
  </div>
);

export default HrmsExit;
