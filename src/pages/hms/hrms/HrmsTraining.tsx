import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GraduationCap, Users, CheckCircle2, Clock, AlertTriangle,
  Loader2, Calendar, Award, BookOpen, Shield, FileText,
} from "lucide-react";
import { useHrmsTraining } from "@/hooks/hrms/useHrmsTraining";

const categoryStyles: Record<string, { label: string; color: string; icon: any }> = {
  mandatory: { label: "Mandatory", color: "bg-red-100 text-red-700", icon: Shield },
  clinical: { label: "Clinical", color: "bg-blue-100 text-blue-700", icon: GraduationCap },
  safety: { label: "Safety", color: "bg-amber-100 text-amber-700", icon: AlertTriangle },
  compliance: { label: "Compliance", color: "bg-purple-100 text-purple-700", icon: FileText },
  soft_skills: { label: "Soft Skills", color: "bg-green-100 text-green-700", icon: Users },
  technical: { label: "Technical", color: "bg-cyan-100 text-cyan-700", icon: BookOpen },
  leadership: { label: "Leadership", color: "bg-indigo-100 text-indigo-700", icon: Award },
  induction: { label: "Induction", color: "bg-pink-100 text-pink-700", icon: Users },
  general: { label: "General", color: "bg-gray-100 text-gray-700", icon: BookOpen },
};

const statusStyles: Record<string, { label: string; color: string }> = {
  assigned: { label: "Assigned", color: "bg-amber-100 text-amber-700" },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-700" },
  completed: { label: "Completed", color: "bg-green-100 text-green-700" },
  failed: { label: "Failed", color: "bg-red-100 text-red-700" },
  exempted: { label: "Exempted", color: "bg-gray-100 text-gray-600" },
  expired: { label: "Expired", color: "bg-red-100 text-red-600" },
};

const HrmsTraining = () => {
  const {
    trainings, summary, upcomingTrainings, pendingRecords, completedRecords,
    loading, error,
  } = useHrmsTraining();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-green-600" /> Training & Competency
          </h1>
          <p className="text-sm text-muted-foreground">Training programs, assignments, certifications & compliance</p>
        </div>
        <Button size="sm">+ Schedule Training</Button>
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

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="border-blue-100"><CardContent className="p-3 text-center"><BookOpen className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">{summary.totalPrograms}</p><p className="text-[9px] text-muted-foreground">Programs</p></CardContent></Card>
        <Card className="border-red-100"><CardContent className="p-3 text-center"><Shield className="h-4 w-4 mx-auto text-red-600" /><p className="text-xl font-bold mt-1 text-red-700">{summary.mandatoryPrograms}</p><p className="text-[9px] text-muted-foreground">Mandatory</p></CardContent></Card>
        <Card className="border-green-100"><CardContent className="p-3 text-center"><CheckCircle2 className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold mt-1 text-green-700">{summary.completedAssignments}</p><p className="text-[9px] text-muted-foreground">Completed</p></CardContent></Card>
        <Card className="border-amber-100"><CardContent className="p-3 text-center"><Clock className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold mt-1 text-amber-700">{summary.pendingAssignments}</p><p className="text-[9px] text-muted-foreground">Pending</p></CardContent></Card>
        <Card className="border-purple-100"><CardContent className="p-3 text-center"><AlertTriangle className="h-4 w-4 mx-auto text-purple-600" /><p className="text-xl font-bold mt-1 text-purple-700">{summary.overdue}</p><p className="text-[9px] text-muted-foreground">Overdue</p></CardContent></Card>
        <Card className="border-orange-100"><CardContent className="p-3 text-center"><Award className="h-4 w-4 mx-auto text-orange-600" /><p className="text-xl font-bold mt-1 text-orange-700">{summary.certificatesExpiring}</p><p className="text-[9px] text-muted-foreground">Certs Expiring</p></CardContent></Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="programs">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="programs">Programs ({trainings.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingRecords.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedRecords.length})</TabsTrigger>
        </TabsList>

        {/* ─── Training Programs ───────────────────────────────────────────── */}
        <TabsContent value="programs" className="space-y-3">
          {/* Upcoming */}
          {upcomingTrainings.length > 0 && (
            <Card className="border-green-200 bg-green-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Calendar className="h-4 w-4 text-green-600" /> Upcoming</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-2">
                  {upcomingTrainings.map((t) => (
                    <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg border bg-white">
                      <div className="text-center min-w-[40px]">
                        <p className="text-lg font-bold text-green-700">{t.scheduledDate ? new Date(t.scheduledDate).getDate() : "?"}</p>
                        <p className="text-[9px] text-muted-foreground">{t.scheduledDate ? new Date(t.scheduledDate).toLocaleDateString("en-IN", { month: "short" }) : ""}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{t.name}</p>
                        <p className="text-[9px] text-muted-foreground">{t.durationHours}h &middot; {t.trainerName || "TBD"}</p>
                      </div>
                      {t.isMandatory && <Badge className="text-[8px] bg-red-100 text-red-700 border-0">Mandatory</Badge>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Programs */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="border-b bg-muted/40">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Training</th>
                      <th className="px-3 py-2 text-left font-medium">Category</th>
                      <th className="px-3 py-2 text-center font-medium">Duration</th>
                      <th className="px-3 py-2 text-center font-medium">Type</th>
                      <th className="px-3 py-2 text-center font-medium">Certificate</th>
                      <th className="px-3 py-2 text-center font-medium">Recur</th>
                      <th className="px-3 py-2 text-left font-medium">Trainer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainings.map((t) => {
                      const cat = categoryStyles[t.category] || categoryStyles.general;
                      return (
                        <tr key={t.id} className="border-b hover:bg-muted/20">
                          <td className="px-3 py-2">
                            <p className="font-medium">{t.name}</p>
                            <p className="text-[9px] text-muted-foreground">{t.code}</p>
                          </td>
                          <td className="px-3 py-2">
                            <Badge className={`text-[8px] border-0 ${cat.color}`}>{cat.label}</Badge>
                          </td>
                          <td className="px-3 py-2 text-center">{t.durationHours}h</td>
                          <td className="px-3 py-2 text-center">
                            {t.isMandatory
                              ? <Badge className="text-[8px] bg-red-100 text-red-700 border-0">Mandatory</Badge>
                              : <Badge variant="outline" className="text-[8px]">Optional</Badge>
                            }
                          </td>
                          <td className="px-3 py-2 text-center">
                            {t.hasCertificate
                              ? <span className="text-green-600 text-[10px]">{t.certificateValidityMonths}m validity</span>
                              : <span className="text-muted-foreground">—</span>
                            }
                          </td>
                          <td className="px-3 py-2 text-center">
                            {t.isRecurring ? <span className="text-[10px]">Every {t.recurrenceMonths}m</span> : "—"}
                          </td>
                          <td className="px-3 py-2 text-[10px]">{t.trainerName || "TBD"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Pending ─────────────────────────────────────────────────────── */}
        <TabsContent value="pending" className="space-y-3">
          {pendingRecords.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">No pending training assignments</CardContent></Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="border-b bg-muted/40">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">Employee</th>
                        <th className="px-3 py-2 text-left font-medium">Training</th>
                        <th className="px-3 py-2 text-center font-medium">Category</th>
                        <th className="px-3 py-2 text-center font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingRecords.map((r) => {
                        const st = statusStyles[r.status];
                        const cat = categoryStyles[r.trainingCategory] || categoryStyles.general;
                        return (
                          <tr key={r.id} className="border-b hover:bg-muted/20">
                            <td className="px-3 py-2">
                              <p className="font-medium">{r.employeeName}</p>
                              <p className="text-[9px] text-muted-foreground">{r.employeeCode} &middot; {r.department}</p>
                            </td>
                            <td className="px-3 py-2 font-medium">{r.trainingName}</td>
                            <td className="px-3 py-2 text-center"><Badge className={`text-[8px] border-0 ${cat.color}`}>{cat.label}</Badge></td>
                            <td className="px-3 py-2 text-center"><Badge className={`text-[9px] border-0 ${st?.color}`}>{st?.label}</Badge></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ─── Completed ───────────────────────────────────────────────────── */}
        <TabsContent value="completed" className="space-y-3">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="border-b bg-muted/40">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Employee</th>
                      <th className="px-3 py-2 text-left font-medium">Training</th>
                      <th className="px-3 py-2 text-center font-medium">Score</th>
                      <th className="px-3 py-2 text-center font-medium">Certificate</th>
                      <th className="px-3 py-2 text-center font-medium">Expiry</th>
                      <th className="px-3 py-2 text-center font-medium">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedRecords.map((r) => (
                      <tr key={r.id} className="border-b hover:bg-muted/20">
                        <td className="px-3 py-2">
                          <p className="font-medium">{r.employeeName}</p>
                          <p className="text-[9px] text-muted-foreground">{r.employeeCode}</p>
                        </td>
                        <td className="px-3 py-2">{r.trainingName}</td>
                        <td className="px-3 py-2 text-center">
                          {r.assessmentScore !== null ? (
                            <span className={`font-bold ${r.passed ? "text-green-700" : "text-red-600"}`}>
                              {r.assessmentScore}%
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {r.certificateIssued
                            ? <Badge className="text-[8px] bg-green-100 text-green-700 border-0">Issued</Badge>
                            : <span className="text-muted-foreground">—</span>
                          }
                        </td>
                        <td className="px-3 py-2 text-center">
                          {r.certificateExpiry ? (
                            <span className={`text-[10px] ${new Date(r.certificateExpiry) < new Date() ? "text-red-600 font-bold" : new Date(r.certificateExpiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? "text-amber-600" : ""}`}>
                              {new Date(r.certificateExpiry).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {r.feedbackRating ? (
                            <span className="text-amber-600 font-medium">{r.feedbackRating}/5</span>
                          ) : "—"}
                        </td>
                      </tr>
                    ))}
                    {completedRecords.length === 0 && (
                      <tr><td colSpan={6} className="py-8 text-center text-muted-foreground text-sm">No completed training records</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HrmsTraining;
