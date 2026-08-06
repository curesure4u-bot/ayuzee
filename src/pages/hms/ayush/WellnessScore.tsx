import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Heart, TrendingUp, Activity, Brain, Moon, Droplets,
  Flame, Shield, RefreshCw,
} from "lucide-react";

// Reference: Sushruta Samhita - Sutra Sthana Ch.15 (Dosha-Dhatu-Mala Vigyaniya)

interface ParameterScore {
  name: string;
  score: number;
  max: number;
  icon: typeof Heart;
  color: string;
  trend: "up" | "down" | "stable";
  description: string;
}

interface VisitRecord {
  date: string;
  overallScore: number;
  agni: number;
  ojas: number;
  bala: number;
  manas: number;
  nidra: number;
  mala: number;
}

const mockParameters: ParameterScore[] = [
  { name: "Agni (Digestive Fire)", score: 72, max: 100, icon: Flame, color: "text-orange-600", trend: "up", description: "Sama Agni trending. Improved from Vishama." },
  { name: "Ojas (Vitality)", score: 65, max: 100, icon: Shield, color: "text-yellow-600", trend: "up", description: "Moderate Ojas. Improving with Rasayana therapy." },
  { name: "Bala (Strength)", score: 58, max: 100, icon: Activity, color: "text-blue-600", trend: "stable", description: "Sahaja Bala adequate. Yuktikrita improving." },
  { name: "Manas (Mind)", score: 78, max: 100, icon: Brain, color: "text-purple-600", trend: "up", description: "Sattvic qualities increasing. Less Rajas." },
  { name: "Nidra (Sleep)", score: 82, max: 100, icon: Moon, color: "text-indigo-600", trend: "up", description: "Sound sleep 6-7 hrs. Timely onset." },
  { name: "Mala (Elimination)", score: 70, max: 100, icon: Droplets, color: "text-green-600", trend: "stable", description: "Regular. Slightly dry. Needs hydration." },
];

const mockVisitHistory: VisitRecord[] = [
  { date: "2026-07-20", overallScore: 71, agni: 72, ojas: 65, bala: 58, manas: 78, nidra: 82, mala: 70 },
  { date: "2026-06-20", overallScore: 64, agni: 62, ojas: 58, bala: 55, manas: 70, nidra: 75, mala: 65 },
  { date: "2026-05-18", overallScore: 55, agni: 50, ojas: 48, bala: 52, manas: 60, nidra: 68, mala: 58 },
  { date: "2026-04-15", overallScore: 45, agni: 40, ojas: 38, bala: 48, manas: 50, nidra: 55, mala: 50 },
  { date: "2026-03-10", overallScore: 38, agni: 32, ojas: 30, bala: 42, manas: 42, nidra: 48, mala: 45 },
];

const doshaBalance = {
  current: { vata: 45, pitta: 30, kapha: 25 },
  ideal: { vata: 35, pitta: 35, kapha: 30 },
};

const WellnessScore = () => {
  const [parameters] = useState<ParameterScore[]>(mockParameters);
  const overallScore = Math.round(parameters.reduce((sum, p) => sum + p.score, 0) / parameters.length);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return "↑";
    if (trend === "down") return "↓";
    return "→";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-rose-600 flex items-center gap-2">
          <Heart className="h-5 w-5" /> Wellness Score Tracker
        </h2>
        <Button size="sm" variant="outline" onClick={() => toast.info("Reassessment scheduled")}>
          <RefreshCw className="mr-1 h-3 w-3" /> Reassess
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground italic">
        Ref: Sushruta Samhita - Sutra Sthana Ch.15 (Dosha-Dhatu-Mala Vigyaniya)
      </p>

      {/* Overall Score */}
      <Card className="border-rose-200 bg-gradient-to-r from-rose-50 to-amber-50">
        <CardContent className="p-4 flex items-center gap-6">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="#f43f5e" strokeWidth="8"
                strokeDasharray={`${(overallScore / 100) * 264} 264`}
                strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>{overallScore}</span>
              <span className="text-[9px] text-muted-foreground">/100</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Overall Wellness Score</p>
            <p className="text-xs text-muted-foreground mt-1">Patient: Mr. Rajesh Kumar (AL-12543)</p>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600 font-medium">+26 points improvement over 4 months</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Last assessed: July 20, 2026</p>
          </div>
        </CardContent>
      </Card>

      {/* Parameter Scores */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {parameters.map((param) => {
          const Icon = param.icon;
          return (
            <Card key={param.name} className="hover:shadow-sm transition">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${param.color}`} />
                    <span className="text-xs font-medium">{param.name}</span>
                  </div>
                  <span className={`text-xs font-medium ${param.trend === "up" ? "text-green-600" : param.trend === "down" ? "text-red-600" : "text-gray-500"}`}>
                    {getTrendIcon(param.trend)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${param.score >= 70 ? "bg-green-500" : param.score >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                      style={{ width: `${param.score}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold">{param.score}</span>
                </div>
                <p className="text-[9px] text-muted-foreground mt-1">{param.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dosha Balance & History */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Dosha Balance Meter */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Dosha Balance (Current vs Prakriti)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(["vata", "pitta", "kapha"] as const).map((dosha) => (
              <div key={dosha} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="capitalize font-medium">{dosha}</span>
                  <span className="text-muted-foreground">
                    Current: {doshaBalance.current[dosha]}% | Ideal: {doshaBalance.ideal[dosha]}%
                  </span>
                </div>
                <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`absolute h-full rounded-full opacity-40 ${dosha === "vata" ? "bg-blue-400" : dosha === "pitta" ? "bg-red-400" : "bg-green-400"}`}
                    style={{ width: `${doshaBalance.ideal[dosha]}%` }}
                  />
                  <div
                    className={`absolute h-full rounded-full ${dosha === "vata" ? "bg-blue-600" : dosha === "pitta" ? "bg-red-600" : "bg-green-600"}`}
                    style={{ width: `${doshaBalance.current[dosha]}%`, opacity: 0.8 }}
                  />
                </div>
                {doshaBalance.current[dosha] > doshaBalance.ideal[dosha] + 5 && (
                  <p className="text-[9px] text-amber-600">⚠️ {dosha} elevated — needs pacification</p>
                )}
              </div>
            ))}
            <p className="text-[9px] text-muted-foreground mt-2">Prakriti: Vata-Pitta | Vikruti: Vata↑</p>
          </CardContent>
        </Card>

        {/* Visit History */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Score Trend Over Visits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockVisitHistory.map((visit, idx) => (
                <div key={visit.date} className="flex items-center gap-3 text-xs">
                  <span className="text-muted-foreground min-w-[80px]">{visit.date}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${visit.overallScore >= 70 ? "bg-green-500" : visit.overallScore >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                      style={{ width: `${visit.overallScore}%` }}
                    />
                  </div>
                  <span className="font-bold min-w-[24px]">{visit.overallScore}</span>
                  {idx < mockVisitHistory.length - 1 && (
                    <Badge
                      variant="outline"
                      className={`text-[8px] ${visit.overallScore > mockVisitHistory[idx + 1].overallScore ? "text-green-600" : "text-red-600"}`}
                    >
                      {visit.overallScore > mockVisitHistory[idx + 1].overallScore ? "+" : ""}
                      {visit.overallScore - mockVisitHistory[idx + 1].overallScore}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 p-2 bg-green-50 rounded text-[10px] text-green-700">
              <strong>Treatment Response:</strong> Consistent improvement since Panchakarma + Rasayana protocol initiated in March 2026.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WellnessScore;
