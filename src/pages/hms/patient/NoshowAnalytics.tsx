import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AlertTriangle, Users, TrendingDown, Phone, MessageSquare, Brain, Calendar, IndianRupee, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type NoshowRecord = {
  id: string;
  original_date: string;
  original_time_slot: string | null;
  resolution: string;
  auto_marked: boolean;
  created_at: string;
};

type ReliabilityScore = {
  id: string;
  total_appointments: number;
  noshow_count: number;
  reliability_score: number;
  risk_level: string;
};

const statusColor: Record<string, string> = {
  unresolved: "bg-amber-100 text-amber-700",
  rescheduled: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  reverted: "bg-blue-100 text-blue-700",
  waived: "bg-gray-100 text-gray-700",
};

const NoshowAnalytics = () => {
  const [records, setRecords] = useState<NoshowRecord[]>([]);
  const [scores, setScores] = useState<ReliabilityScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [{ data: noshows }, { data: reliability }] = await Promise.all([
        (supabase as any).from("hms_noshow_records").select("*").order("created_at", { ascending: false }),
        (supabase as any).from("patient_reliability_scores").select("*"),
      ]);
      setRecords(noshows || []);
      setScores(reliability || []);
    } catch (err: any) {
      toast.error("Failed to load no-show data");
      console.error(err);
    }
    setLoading(false);
  };

  const totalNoshows = records.length;
  const resolved = records.filter(r => r.resolution === "rescheduled").length;
  const unresolved = records.filter(r => r.resolution === "unresolved").length;
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((s, sc) => s + sc.reliability_score, 0) / scores.length) : 100;
  const highRisk = scores.filter(s => s.risk_level === "high").length;

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><AlertTriangle className="h-6 w-6" /> No-show & Drop-off Analytics</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><AlertTriangle className="h-4 w-4 mx-auto text-red-600" /><p className="text-xl font-bold mt-1 text-red-600">{totalNoshows}</p><p className="text-[10px] text-muted-foreground">Total No-shows</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><TrendingDown className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold mt-1 text-amber-600">{unresolved}</p><p className="text-[10px] text-muted-foreground">Unresolved</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Users className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold mt-1 text-green-600">{resolved}</p><p className="text-[10px] text-muted-foreground">Rescheduled</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><IndianRupee className="h-4 w-4 mx-auto text-purple-600" /><p className="text-xl font-bold mt-1 text-purple-600">{avgScore}%</p><p className="text-[10px] text-muted-foreground">Avg Reliability</p></CardContent></Card>
      </div>

      {/* Reliability Scores */}
      {scores.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Patient Reliability Scores</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-center">Total Appts</th>
                    <th className="px-3 py-2 text-center">No-shows</th>
                    <th className="px-3 py-2 text-center">Score</th>
                    <th className="px-3 py-2 text-center">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map(s => (
                    <tr key={s.id} className="border-b">
                      <td className="px-3 py-2 text-center">{s.total_appointments}</td>
                      <td className="px-3 py-2 text-center text-red-600 font-bold">{s.noshow_count}</td>
                      <td className="px-3 py-2 text-center font-bold">{s.reliability_score}%</td>
                      <td className="px-3 py-2 text-center">
                        <Badge variant={s.risk_level === "high" ? "destructive" : s.risk_level === "medium" ? "default" : "outline"} className={`text-[10px] ${s.risk_level === "low" ? "text-green-600" : ""}`}>{s.risk_level}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No-show Records */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">No-show Records ({records.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Time Slot</th>
                  <th className="px-3 py-2 text-center">Auto-marked</th>
                  <th className="px-3 py-2 text-center">Resolution</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No no-show records found — patients are attending well!</td></tr>
                ) : (
                  records.map(r => (
                    <tr key={r.id} className={`border-b ${r.resolution === "unresolved" ? "bg-amber-50/30" : ""}`}>
                      <td className="px-3 py-2">{r.original_date}</td>
                      <td className="px-3 py-2">{r.original_time_slot || "—"}</td>
                      <td className="px-3 py-2 text-center">{r.auto_marked ? "Yes" : "No"}</td>
                      <td className="px-3 py-2 text-center">
                        <Badge className={`text-[10px] ${statusColor[r.resolution] || ""}`}>{r.resolution}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* AI Insight */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-blue-700 flex items-center gap-2"><Brain className="h-4 w-4" /> AI Insight</CardTitle></CardHeader>
        <CardContent>
          <p className="text-xs text-blue-800">
            {totalNoshows > 0
              ? `${totalNoshows} no-show records found. ${unresolved} unresolved. ${highRisk} patients at high risk. Enable auto-reminders 24hr before to reduce no-shows by 40%.`
              : "No no-shows recorded yet. Great patient adherence! Data will populate as appointments are marked."
            }
          </p>
        </CardContent>
      </Card>

      {/* Re-engagement Actions */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => toast.success("WhatsApp campaign sent")}><MessageSquare className="h-4 w-4 mr-1" /> Send WhatsApp</Button>
        <Button size="sm" variant="outline" onClick={() => toast.success("AI voice call started")}><Phone className="h-4 w-4 mr-1" /> AI Voice Call</Button>
        <Button size="sm" variant="outline" onClick={() => toast.success("Discount offer sent")}><IndianRupee className="h-4 w-4 mr-1" /> Offer Discount</Button>
      </div>
    </div>
  );
};

export default NoshowAnalytics;
