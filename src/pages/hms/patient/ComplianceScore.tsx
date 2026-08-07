import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Pill, Apple, Dumbbell, Calendar, Award, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePatientCompliance } from "@/hooks/usePatientCompliance";

const categoryIcons = [Pill, Apple, Dumbbell, Calendar, Target];

function ScoreCircle({ score }: { score: number }) {
  const color = score >= 80 ? "text-green-600" : score >= 60 ? "text-yellow-600" : "text-red-600";
  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8"
          strokeDasharray={`${(score / 100) * 339.3} 339.3`}
          className={color} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold ${color}`}>{score}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

export default function ComplianceScore() {
  const { patientId } = useParams();
  const { overallScore, categories, badges, weeklyCheckins, streakDays, loading, error, submitCheckin } = usePatientCompliance(patientId);

  const handleCheckin = async () => {
    // In a real app, this would open a form — for now submit based on current scores
    const success = await submitCheckin({
      medication: 85,
      diet: 70,
      yoga: 65,
      followup: 100,
      lifestyle: 60,
      note: "Weekly check-in submitted",
    });
    if (success) toast.success("Weekly check-in submitted!");
    else toast.error("Could not submit check-in");
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-indigo-600" /> Compliance Score
          </h1>
          <p className="text-muted-foreground">Patient Adherence Tracker • {streakDays}-day streak</p>
        </div>
        <Button size="sm" onClick={handleCheckin}>Weekly Check-in</Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading compliance data...</span>
        </div>
      )}

      {error && !loading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-3 text-xs text-amber-700">
            ⚠ Could not load live data (showing demo). {error}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <CardHeader className="pb-2"><CardTitle className="text-base text-center">Overall Score</CardTitle></CardHeader>
          <CardContent>
            <ScoreCircle score={overallScore} />
            <p className="text-center text-sm mt-2 text-muted-foreground">
              {overallScore >= 80 ? "Excellent compliance" :
               overallScore >= 60 ? "Good – room for improvement" : "Needs attention"}
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-base">Category Breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {categories.map((cat, i) => {
              const Icon = categoryIcons[i] || Target;
              return (
                <div key={cat.label} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{cat.label}</span>
                    </div>
                    <span className="text-sm font-bold">{cat.score}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${
                      cat.score >= 80 ? "bg-green-500" : cat.score >= 60 ? "bg-yellow-500" : "bg-red-500"
                    }`} style={{ width: `${cat.score}%` }} />
                  </div>
                  {cat.detail && <p className="text-xs text-muted-foreground">{cat.detail}</p>}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><Award className="h-4 w-4" /> Gamification Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {badges.map((badge) => (
                <div key={badge.id} className={`p-3 rounded-lg border text-center ${badge.earned ? "bg-yellow-50 border-yellow-200" : "bg-muted/30 opacity-50"}`}>
                  <Award className={`h-6 w-6 mx-auto mb-1 ${badge.earned ? "text-yellow-600" : "text-muted-foreground"}`} />
                  <p className="text-xs font-medium">{badge.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{badge.description}</p>
                  {badge.earned && <Badge className="mt-1 text-xs">Earned</Badge>}
                  {!badge.earned && badge.progressTarget > 1 && (
                    <p className="text-[10px] text-muted-foreground mt-1">{badge.progressCurrent}/{badge.progressTarget}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Weekly Check-ins</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weeklyCheckins.map((w) => (
                <div key={w.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{w.week}</span>
                    <Badge variant={w.score >= 80 ? "default" : "secondary"}>{w.score}/100</Badge>
                  </div>
                  {w.note && <p className="text-xs text-muted-foreground mt-1">{w.note}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
