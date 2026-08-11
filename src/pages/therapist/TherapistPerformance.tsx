import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import type { TherapistContext } from "./TherapistLayout";

interface PerformanceScore {
  therapist_id: string;
  period_month: number;
  period_year: number;
  ontime_arrival_score: number;
  session_completion_score: number;
  doctor_satisfaction_score: number;
  patient_feedback_score: number;
  protocol_adherence_score: number;
  overall_score: number;
  total_sessions: number;
  sessions_on_time: number;
  sessions_completed: number;
  checklists_completed: number;
  doctor_approvals_received: number;
  calculated_at: string;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-amber-600";
  return "text-red-600";
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return "bg-green-100 border-green-300";
  if (score >= 60) return "bg-amber-100 border-amber-300";
  return "bg-red-100 border-red-300";
}

function getProgressColor(score: number): string {
  if (score >= 80) return "[&>div]:bg-green-500";
  if (score >= 60) return "[&>div]:bg-amber-500";
  return "[&>div]:bg-red-500";
}

function getMonthName(month: number): string {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return months[month - 1] || "";
}

export default function TherapistPerformance() {
  const { therapist } = useOutletContext<TherapistContext>();
  const [currentScore, setCurrentScore] = useState<PerformanceScore | null>(null);
  const [history, setHistory] = useState<PerformanceScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (therapist?.id) {
      fetchPerformanceData();
    }
  }, [therapist?.id]);

  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      // Fetch current month score
      const { data: current } = await (supabase as any)
        .from("therapist_performance_scores")
        .select("*")
        .eq("therapist_id", therapist.id)
        .eq("period_month", currentMonth)
        .eq("period_year", currentYear)
        .maybeSingle();

      setCurrentScore(current);

      // Fetch last 3 months history (excluding current)
      const { data: historyData } = await (supabase as any)
        .from("therapist_performance_scores")
        .select("*")
        .eq("therapist_id", therapist.id)
        .order("period_year", { ascending: false })
        .order("period_month", { ascending: false })
        .limit(4);

      // Filter out current month from history
      const pastScores = (historyData || []).filter(
        (s: PerformanceScore) =>
          !(s.period_month === currentMonth && s.period_year === currentYear)
      );
      setHistory(pastScores.slice(0, 3));
    } catch (error) {
      console.error("Error fetching performance data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">My Performance</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading performance data...</p>
        </div>
      </div>
    );
  }

  if (!currentScore && history.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">My Performance</h1>
        </div>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground text-center">
              Performance scores are calculated monthly based on your sessions
            </p>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Complete sessions and maintain good practices to see your scores here.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const categories = currentScore
    ? [
        { label: "On-time Arrival", value: currentScore.ontime_arrival_score },
        { label: "Session Completion", value: currentScore.session_completion_score },
        { label: "Doctor Satisfaction", value: currentScore.doctor_satisfaction_score },
        { label: "Patient Feedback", value: currentScore.patient_feedback_score },
        { label: "Protocol Adherence", value: currentScore.protocol_adherence_score },
      ]
    : [];

  const ontimePercent = currentScore && currentScore.total_sessions > 0
    ? Math.round((currentScore.sessions_on_time / currentScore.total_sessions) * 100)
    : 0;

  const completionPercent = currentScore && currentScore.total_sessions > 0
    ? Math.round((currentScore.sessions_completed / currentScore.total_sessions) * 100)
    : 0;

  const checklistPercent = currentScore && currentScore.sessions_completed > 0
    ? Math.round((currentScore.checklists_completed / currentScore.sessions_completed) * 100)
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">My Performance</h1>
      </div>

      {/* Current Month Overall Score */}
      {currentScore && (
        <Card className={`border-2 ${getScoreBgColor(currentScore.overall_score)}`}>
          <CardContent className="flex flex-col items-center py-8">
            <p className="text-sm text-muted-foreground mb-1">
              {getMonthName(currentScore.period_month)} {currentScore.period_year} — Overall Score
            </p>
            <p className={`text-6xl font-bold ${getScoreColor(currentScore.overall_score)}`}>
              {currentScore.overall_score}
            </p>
            <p className="text-sm text-muted-foreground mt-1">out of 100</p>
          </CardContent>
        </Card>
      )}

      {/* Individual Category Scores */}
      {currentScore && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categories.map((cat) => (
              <div key={cat.label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{cat.label}</span>
                  <span className={`font-medium ${getScoreColor(cat.value)}`}>
                    {cat.value}%
                  </span>
                </div>
                <Progress
                  value={cat.value}
                  className={`h-2 ${getProgressColor(cat.value)}`}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Stats Row */}
      {currentScore && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{currentScore.total_sessions}</p>
              <p className="text-xs text-muted-foreground">Total Sessions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{ontimePercent}%</p>
              <p className="text-xs text-muted-foreground">On-time</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{completionPercent}%</p>
              <p className="text-xs text-muted-foreground">Completion</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{checklistPercent}%</p>
              <p className="text-xs text-muted-foreground">Checklist Compliance</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Months</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {history.map((score) => (
                <div
                  key={`${score.period_year}-${score.period_month}`}
                  className={`rounded-lg border p-4 text-center ${getScoreBgColor(score.overall_score)}`}
                >
                  <p className="text-sm text-muted-foreground">
                    {getMonthName(score.period_month)} {score.period_year}
                  </p>
                  <p className={`text-3xl font-bold mt-1 ${getScoreColor(score.overall_score)}`}>
                    {score.overall_score}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {score.total_sessions} sessions
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
