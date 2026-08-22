import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Target, Users, TrendingUp, Award, Star,
  Loader2, AlertTriangle, BarChart3, CheckCircle2,
} from "lucide-react";
import { useHrmsPerformance } from "@/hooks/hrms/useHrmsPerformance";

const categoryColors: Record<string, string> = {
  clinical: "bg-blue-100 text-blue-700",
  operational: "bg-green-100 text-green-700",
  financial: "bg-emerald-100 text-emerald-700",
  patient_care: "bg-purple-100 text-purple-700",
  compliance: "bg-amber-100 text-amber-700",
  attendance: "bg-cyan-100 text-cyan-700",
  teamwork: "bg-indigo-100 text-indigo-700",
  learning: "bg-pink-100 text-pink-700",
  general: "bg-gray-100 text-gray-700",
};

const gradeColors: Record<string, string> = {
  "A+": "bg-green-100 text-green-800 border-green-300",
  "A": "bg-green-50 text-green-700 border-green-200",
  "B+": "bg-blue-50 text-blue-700 border-blue-200",
  "B": "bg-blue-50 text-blue-600 border-blue-200",
  "C": "bg-amber-50 text-amber-700 border-amber-200",
  "D": "bg-red-50 text-red-700 border-red-200",
};

const reviewStatusStyles: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700" },
  self_review: { label: "Self Review", color: "bg-blue-100 text-blue-700" },
  manager_review: { label: "Manager Review", color: "bg-amber-100 text-amber-700" },
  hr_review: { label: "HR Review", color: "bg-purple-100 text-purple-700" },
  completed: { label: "Completed", color: "bg-green-100 text-green-700" },
  acknowledged: { label: "Acknowledged", color: "bg-green-100 text-green-800" },
};

const HrmsPerformance = () => {
  const now = new Date();
  const [selMonth, setSelMonth] = useState(now.getMonth() + 1);
  const [selYear, setSelYear] = useState(now.getFullYear());

  const { templates, scorecards, reviews, loading, error } = useHrmsPerformance(selMonth, selYear);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Summary
  const avgScore = scorecards.length > 0 ? Math.round(scorecards.reduce((s, c) => s + c.overallScore, 0) / scorecards.length * 10) / 10 : 0;
  const topPerformers = scorecards.filter((s) => s.overallScore >= 20);
  const needsImprovement = scorecards.filter((s) => s.overallScore < 15);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-indigo-600" /> Performance & KPI
          </h1>
          <p className="text-sm text-muted-foreground">Employee scorecards, KPI tracking & performance reviews</p>
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

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-indigo-100">
          <CardContent className="p-3 text-center">
            <BarChart3 className="h-4 w-4 mx-auto text-indigo-600" />
            <p className="text-xl font-bold mt-1 text-indigo-700">{avgScore}</p>
            <p className="text-[9px] text-muted-foreground">Avg Score</p>
          </CardContent>
        </Card>
        <Card className="border-green-100">
          <CardContent className="p-3 text-center">
            <TrendingUp className="h-4 w-4 mx-auto text-green-600" />
            <p className="text-xl font-bold mt-1 text-green-700">{topPerformers.length}</p>
            <p className="text-[9px] text-muted-foreground">Top Performers</p>
          </CardContent>
        </Card>
        <Card className="border-amber-100">
          <CardContent className="p-3 text-center">
            <AlertTriangle className="h-4 w-4 mx-auto text-amber-600" />
            <p className="text-xl font-bold mt-1 text-amber-700">{needsImprovement.length}</p>
            <p className="text-[9px] text-muted-foreground">Needs Improvement</p>
          </CardContent>
        </Card>
        <Card className="border-blue-100">
          <CardContent className="p-3 text-center">
            <Users className="h-4 w-4 mx-auto text-blue-600" />
            <p className="text-xl font-bold mt-1">{scorecards.length}</p>
            <p className="text-[9px] text-muted-foreground">Employees Scored</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="scorecards">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="scorecards">Scorecards</TabsTrigger>
          <TabsTrigger value="kpi-templates">KPI Templates ({templates.length})</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
        </TabsList>

        {/* ─── Scorecards ──────────────────────────────────────────────────── */}
        <TabsContent value="scorecards" className="space-y-3">
          {scorecards.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No KPI scores for this period</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {scorecards.map((card) => (
                <Card key={card.employeeId}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 grid place-items-center text-sm font-bold text-indigo-700">
                          {card.employeeName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{card.employeeName}</p>
                          <p className="text-[10px] text-muted-foreground">{card.employeeCode} &middot; {card.department}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-indigo-700">{card.overallScore}</p>
                        <p className="text-[9px] text-muted-foreground">Overall Score</p>
                      </div>
                    </div>

                    {/* KPI Breakdown */}
                    <div className="space-y-2">
                      {card.kpis.map((kpi) => (
                        <div key={kpi.id} className="flex items-center gap-3">
                          <Badge className={`text-[8px] border-0 w-16 justify-center ${categoryColors[kpi.category] || categoryColors.general}`}>
                            {kpi.category.slice(0, 6)}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between text-xs">
                              <span className="truncate">{kpi.kpiName}</span>
                              <span className="font-medium shrink-0 ml-2">
                                {kpi.actualValue.toLocaleString("en-IN")}{kpi.targetValue > 100 ? "" : kpi.kpiCode.includes("FB") ? "/5" : "%"}
                              </span>
                            </div>
                            <Progress value={Math.min(100, kpi.achievementPct)} className="h-1.5 mt-0.5" />
                          </div>
                          <span className={`text-xs font-bold w-10 text-right ${kpi.achievementPct >= 100 ? "text-green-700" : kpi.achievementPct >= 80 ? "text-amber-700" : "text-red-600"}`}>
                            {kpi.achievementPct}%
                          </span>
                          {kpi.rating && (
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: kpi.rating }).map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── KPI Templates ───────────────────────────────────────────────── */}
        <TabsContent value="kpi-templates" className="space-y-3">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="border-b bg-muted/40">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">KPI</th>
                      <th className="px-3 py-2 text-left font-medium">Category</th>
                      <th className="px-3 py-2 text-left font-medium">Roles</th>
                      <th className="px-3 py-2 text-center font-medium">Target</th>
                      <th className="px-3 py-2 text-center font-medium">Weight</th>
                      <th className="px-3 py-2 text-center font-medium">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templates.map((t) => (
                      <tr key={t.id} className="border-b hover:bg-muted/20">
                        <td className="px-3 py-2">
                          <p className="font-medium">{t.name}</p>
                          <p className="text-[9px] text-muted-foreground">{t.code}</p>
                        </td>
                        <td className="px-3 py-2">
                          <Badge className={`text-[9px] border-0 capitalize ${categoryColors[t.category] || categoryColors.general}`}>
                            {t.category.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-0.5">
                            {t.applicableRoles.length > 0
                              ? t.applicableRoles.map((r) => <Badge key={r} variant="outline" className="text-[8px] capitalize">{r}</Badge>)
                              : <span className="text-muted-foreground">All</span>
                            }
                          </div>
                        </td>
                        <td className="px-3 py-2 text-center font-medium">
                          {t.metricType === "currency" ? `₹${(t.targetValue / 1000).toFixed(0)}K` : `${t.targetValue}${t.unit || ""}`}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <Badge variant="outline" className="text-[9px]">{t.weightage}%</Badge>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <Badge variant="outline" className={`text-[8px] ${t.dataSource === "hms_auto" ? "text-green-600" : "text-gray-600"}`}>
                            {t.dataSource === "hms_auto" ? "Auto" : t.dataSource === "attendance_auto" ? "Auto" : "Manual"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Performance Reviews ─────────────────────────────────────────── */}
        <TabsContent value="reviews" className="space-y-3">
          {reviews.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No performance reviews found</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {reviews.map((rev) => {
                const st = reviewStatusStyles[rev.status];
                return (
                  <Card key={rev.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 grid place-items-center text-sm font-bold text-green-700">
                            {rev.employeeName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{rev.employeeName}</p>
                            <p className="text-[10px] text-muted-foreground">{rev.employeeCode} &middot; {rev.department}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {rev.grade && (
                            <Badge className={`text-xs font-bold ${gradeColors[rev.grade] || "bg-gray-100 text-gray-700"}`}>
                              {rev.grade}
                            </Badge>
                          )}
                          <Badge className={`text-[9px] border-0 ${st?.color}`}>{st?.label}</Badge>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                        <div>
                          <p className="text-muted-foreground">Type</p>
                          <p className="font-medium capitalize">{rev.reviewType.replace("_", " ")}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Period</p>
                          <p className="font-medium">
                            {new Date(rev.periodFrom).toLocaleDateString("en-IN", { month: "short", year: "2-digit" })} – {new Date(rev.periodTo).toLocaleDateString("en-IN", { month: "short", year: "2-digit" })}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">KPI Score</p>
                          <p className="font-bold text-indigo-700">{rev.kpiScore}/100</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Final Rating</p>
                          <div className="flex items-center gap-0.5">
                            {rev.finalRating ? Array.from({ length: rev.finalRating }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                            )) : <span className="text-muted-foreground">—</span>}
                          </div>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Recommendation</p>
                          <p className="font-medium capitalize">{rev.recommendation?.replace("_", " ") || "—"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HrmsPerformance;
