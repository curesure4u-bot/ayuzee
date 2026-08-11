import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const doshaScores = { Vata: 35, Pitta: 40, Kapha: 25 };

const dailyRoutine = [
  { time: "5:30 AM", activity: "Wake up — Pitta types benefit from early rising before heat builds" },
  { time: "7:00 AM", activity: "Breakfast — Cooling foods: oats with coconut, mint tea" },
  { time: "8:00 AM", activity: "Exercise — Swimming or moderate yoga (avoid intense heat)" },
  { time: "12:30 PM", activity: "Lunch — Largest meal: bitter greens, basmati rice, ghee" },
  { time: "5:00 PM", activity: "Meditation — Sheetali pranayama for 15 minutes" },
  { time: "10:00 PM", activity: "Sleep — Cool room, lavender oil on temples" },
];

const seasonalTips = [
  { season: "Summer (Grishma)", tip: "Increase cooling foods, avoid fermented items, rose water spritz" },
  { season: "Monsoon (Varsha)", tip: "Light diet, ginger tea, avoid raw salads" },
  { season: "Winter (Hemanta)", tip: "Nourishing soups, warm oil massage, moderate spices OK" },
];

const risks = [
  { condition: "Acid Reflux", level: "Moderate", note: "Pitta dominance increases gastric fire" },
  { condition: "Skin Inflammation", level: "Moderate", note: "Pitta-related dermatitis tendency" },
  { condition: "Anxiety Episodes", level: "Low-Moderate", note: "Vata sub-dosha involvement" },
];

export default function PrakritiLifelongTwin() {
  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      <h1 className="text-3xl font-bold">Prakriti Lifelong Digital Twin</h1>
      <p className="text-muted-foreground">Your personalized Ayurvedic constitution profile, tracked for life.</p>

      <Card>
        <CardHeader><CardTitle>Dosha Constitution</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(doshaScores).map(([dosha, score]) => (
            <div key={dosha} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{dosha}</span>
                <span>{score}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${dosha === "Vata" ? "bg-blue-500" : dosha === "Pitta" ? "bg-orange-500" : "bg-green-500"}`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          ))}
          <p className="text-sm mt-3 text-muted-foreground">
            <strong>Pitta-Vata</strong> constitution — sharp intellect, medium build, tendency toward heat and dryness. 
            Primary care focus: cooling, grounding, and routine.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Daily Recommendations</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {dailyRoutine.map((item) => (
            <div key={item.time} className="flex gap-3 text-sm border-b pb-2 last:border-0">
              <Badge variant="outline" className="shrink-0">{item.time}</Badge>
              <span>{item.activity}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Seasonal Adjustments</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {seasonalTips.map((s) => (
            <div key={s.season} className="border-b pb-2 last:border-0">
              <p className="font-medium text-sm">{s.season}</p>
              <p className="text-sm text-muted-foreground">{s.tip}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Lifetime Risk Insights</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {risks.map((r) => (
            <div key={r.condition} className="flex justify-between items-center border-b pb-2 last:border-0">
              <div>
                <p className="font-medium text-sm">{r.condition}</p>
                <p className="text-xs text-muted-foreground">{r.note}</p>
              </div>
              <Badge variant="secondary">{r.level}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
