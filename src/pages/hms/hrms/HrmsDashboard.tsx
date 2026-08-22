import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import {
  Users, UserCheck, UserPlus, Clock, CalendarOff, AlertTriangle,
  CheckCircle2, TrendingUp, Building2, Loader2, RefreshCw,
  ArrowRight, Info, XCircle,
} from "lucide-react";
import { useHrmsDashboard } from "@/hooks/hrms/useHrmsDashboard";
import { useHrmsPermissions } from "@/hooks/hrms/useHrmsPermissions";

const HrmsDashboard = () => {
  const navigate = useNavigate();
  const { workforce, attendance, departments, alerts, recentJoiners, loading, error, refetch } = useHrmsDashboard();
  const permissions = useHrmsPermissions();

  const alertIcon = (type: string) => {
    if (type === "critical") return <XCircle className="h-4 w-4 text-red-500" />;
    if (type === "warning") return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    return <Info className="h-4 w-4 text-blue-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-600" />
            HR Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Workforce overview &middot; {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs capitalize">{permissions.role.replace("_", " ")}</Badge>
          <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" /><span>Loading dashboard data...</span>
        </div>
      )}
      {error && !loading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-3 text-xs text-amber-700 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Could not load live data (showing demo). {error}
          </CardContent>
        </Card>
      )}

      {/* ─── Workforce Summary ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="border-blue-100">
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 mx-auto text-blue-600" />
            <p className="text-2xl font-bold mt-2 text-blue-700">{workforce.totalEmployees}</p>
            <p className="text-[11px] text-muted-foreground">Total Employees</p>
          </CardContent>
        </Card>
        <Card className="border-green-100">
          <CardContent className="p-4 text-center">
            <UserCheck className="h-5 w-5 mx-auto text-green-600" />
            <p className="text-2xl font-bold mt-2 text-green-700">{workforce.activeEmployees}</p>
            <p className="text-[11px] text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card className="border-purple-100">
          <CardContent className="p-4 text-center">
            <UserPlus className="h-5 w-5 mx-auto text-purple-600" />
            <p className="text-2xl font-bold mt-2 text-purple-700">{workforce.newJoiners}</p>
            <p className="text-[11px] text-muted-foreground">New (30 days)</p>
          </CardContent>
        </Card>
        <Card className="border-amber-100">
          <CardContent className="p-4 text-center">
            <Clock className="h-5 w-5 mx-auto text-amber-600" />
            <p className="text-2xl font-bold mt-2 text-amber-700">{workforce.onProbation}</p>
            <p className="text-[11px] text-muted-foreground">Probation</p>
          </CardContent>
        </Card>
        <Card className="border-red-100">
          <CardContent className="p-4 text-center">
            <CalendarOff className="h-5 w-5 mx-auto text-red-600" />
            <p className="text-2xl font-bold mt-2 text-red-700">{workforce.onNoticePeriod}</p>
            <p className="text-[11px] text-muted-foreground">Notice Period</p>
          </CardContent>
        </Card>
        <Card className="border-slate-100">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto text-slate-600" />
            <p className="text-2xl font-bold mt-2 text-slate-700">{workforce.relievedThisMonth}</p>
            <p className="text-[11px] text-muted-foreground">Relieved (Month)</p>
          </CardContent>
        </Card>
      </div>

      {/* ─── Today's Attendance + Alerts ───────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Attendance Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" /> Today's Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Attendance Percentage */}
            <div className="text-center">
              <p className="text-3xl font-bold text-green-700">{attendance.attendancePercentage}%</p>
              <Progress value={attendance.attendancePercentage} className="h-2 mt-2" />
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center justify-between p-2 rounded bg-green-50">
                <span className="text-green-700">Present</span>
                <span className="font-bold text-green-800">{attendance.present}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-red-50">
                <span className="text-red-700">Absent</span>
                <span className="font-bold text-red-800">{attendance.absent}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-amber-50">
                <span className="text-amber-700">On Leave</span>
                <span className="font-bold text-amber-800">{attendance.onLeave}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-blue-50">
                <span className="text-blue-700">Half Day</span>
                <span className="font-bold text-blue-800">{attendance.halfDay}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-gray-50 col-span-2">
                <span className="text-gray-700">Weekly Off / Holiday</span>
                <span className="font-bold text-gray-800">{attendance.weeklyOff}</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => navigate("/hms/hrms/attendance")}
            >
              View Full Attendance <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>

        {/* HR Alerts */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> HR Alerts
              </CardTitle>
              <Badge variant="secondary" className="text-[10px]">{alerts.length} active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    alert.type === "critical" ? "border-red-200 bg-red-50/50" :
                    alert.type === "warning" ? "border-amber-200 bg-amber-50/50" :
                    "border-blue-200 bg-blue-50/50"
                  }`}
                >
                  <div className="mt-0.5">{alertIcon(alert.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{alert.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
                  </div>
                  <Badge variant="outline" className="text-[9px] shrink-0 capitalize">{alert.module}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Department Breakdown + Recent Joiners ─────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Department Distribution */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-indigo-600" /> Department Workforce
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {departments.map((dept) => (
                <div key={dept.department} className="flex items-center justify-between">
                  <span className="text-sm">{dept.department}</span>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={(dept.count / workforce.totalEmployees) * 100}
                      className="w-24 h-2"
                    />
                    <span className="text-xs font-medium w-6 text-right">{dept.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Joiners */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-purple-600" /> Recent Joiners
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => navigate("/hms/hrms/employees")}>
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentJoiners.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No recent joiners</p>
            ) : (
              <div className="space-y-3">
                {recentJoiners.map((joiner) => (
                  <div key={joiner.id} className="flex items-center justify-between p-2 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">{joiner.name}</p>
                      <p className="text-xs text-muted-foreground">{joiner.role} &middot; {joiner.department}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-[10px]">
                        {new Date(joiner.joinDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── Quick Actions ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button variant="outline" size="sm" className="h-auto py-3 flex-col gap-1" onClick={() => navigate("/hms/hrms/employees")}>
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-xs">View Employees</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto py-3 flex-col gap-1" onClick={() => navigate("/hms/hrms/attendance")}>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-xs">Mark Attendance</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto py-3 flex-col gap-1" onClick={() => navigate("/hms/hrms/leave")}>
              <CalendarOff className="h-4 w-4 text-amber-600" />
              <span className="text-xs">Approve Leave</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto py-3 flex-col gap-1" onClick={() => navigate("/hms/hrms/payroll")}>
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-xs">Run Payroll</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HrmsDashboard;
