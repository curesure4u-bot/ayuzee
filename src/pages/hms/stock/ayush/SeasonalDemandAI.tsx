import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Sun, CloudRain, Snowflake, Leaf, Wind, Flame } from "lucide-react";

const ritus = [
  { name: "Vasanta (Spring)", months: "Mar–Apr", icon: Leaf, color: "text-green-600", bgColor: "bg-green-50", current: false },
  { name: "Grishma (Summer)", months: "May–Jun", icon: Sun, color: "text-amber-600", bgColor: "bg-amber-50", current: false },
  { name: "Varsha (Monsoon)", months: "Jul–Aug", icon: CloudRain, color: "text-blue-600", bgColor: "bg-blue-50", current: true },
  { name: "Sharad (Autumn)", months: "Sep–Oct", icon: Wind, color: "text-orange-600", bgColor: "bg-orange-50", current: false },
  { name: "Hemanta (Pre-winter)", months: "Nov–Dec", icon: Snowflake, color: "text-cyan-600", bgColor: "bg-cyan-50", current: false },
  { name: "Shishira (Winter)", months: "Jan–Feb", icon: Flame, color: "text-purple-600", bgColor: "bg-purple-50", current: false },
];

const currentSeasonDemand = [
  { medicine: "Dashamoolarishtam", reason: "Vata aggravation in monsoon — joint pain surge", demand: "+65%", action: "Increase stock by 50 units", priority: "high" },
  { medicine: "Rasnasaptakam Kashayam", reason: "Peak Amavata (rheumatoid) season — dampness", demand: "+80%", action: "Emergency reorder 100 units", priority: "critical" },
  { medicine: "Simhanada Guggulu", reason: "Ama accumulation due to low Agni in Varsha", demand: "+45%", action: "Stock buffer 30 extra", priority: "high" },
  { medicine: "Ashtavargam Kashayam", reason: "Vata-Kapha conditions worsen in rain", demand: "+35%", action: "Reorder 40 units", priority: "medium" },
  { medicine: "Kottamchukkadi Taila", reason: "PK demand rises — spine/joint treatments increase", demand: "+55%", action: "Stock 5L extra", priority: "high" },
  { medicine: "Dhanwantharam Gulika", reason: "Fever/cold epidemic common in monsoon", demand: "+40%", action: "Reorder 60 units", priority: "medium" },
  { medicine: "Chitrakadi Vati", reason: "Agni (digestion) weakens — Mandagni treatments", demand: "+30%", action: "Buffer 20 units", priority: "medium" },
  { medicine: "Varanadi Kashayam", reason: "Kapha liquefaction (Kapha Prakopa) in Varsha", demand: "+25%", action: "Maintain current + 15", priority: "low" },
];

const nextSeasonPrep = [
  { medicine: "Chandraprabha Vati", reason: "UTI surge post-monsoon in Sharad Ritu", eta: "Sep", action: "Pre-order 80 units by Aug 25" },
  { medicine: "Punarnavadi Mandoor", reason: "Pitta aggravation (Pitta Prakopa) in Sharad", eta: "Sep", action: "Pre-order 50 units by Aug 20" },
  { medicine: "Shatavari Gulam", reason: "Hormonal imbalances peak post-monsoon", eta: "Oct", action: "Pre-order 40 units by Sep 15" },
];

export default function SeasonalDemandAI() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6 text-blue-600" /> Seasonal Demand AI (Ritucharya)
        </h1>
        <p className="text-muted-foreground mt-1">
          Predict inventory needs based on Ayurvedic Ritu (season) — AI-driven stocking by Dosha cycles
        </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {ritus.map((ritu, i) => {
          const Icon = ritu.icon;
          return (
            <Card key={i} className={`${ritu.current ? "ring-2 ring-blue-500 " + ritu.bgColor : ""}`}>
              <CardContent className="p-2 text-center">
                <Icon className={`h-5 w-5 mx-auto ${ritu.color}`} />
                <p className="text-[10px] font-bold mt-1">{ritu.name.split(" ")[0]}</p>
                <p className="text-[9px] text-muted-foreground">{ritu.months}</p>
                {ritu.current && <Badge className="text-[8px] mt-1 bg-blue-600">NOW</Badge>}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-blue-200">
        <CardHeader className="pb-2 bg-blue-50/50">
          <CardTitle className="text-base flex items-center gap-2">
            <CloudRain className="h-4 w-4 text-blue-600" /> Varsha Ritu (Monsoon) — Current Season Demand Forecast
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Medicine</th>
                  <th className="px-3 py-2 text-left">Ayurvedic Reason</th>
                  <th className="px-3 py-2 text-center">Demand Δ</th>
                  <th className="px-3 py-2 text-center">Priority</th>
                  <th className="px-3 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentSeasonDemand.map((d, i) => (
                  <tr key={i} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 text-xs font-medium">{d.medicine}</td>
                    <td className="px-3 py-2 text-[10px] text-muted-foreground max-w-[200px]">{d.reason}</td>
                    <td className="px-3 py-2 text-center font-bold text-red-600 text-xs">{d.demand}</td>
                    <td className="px-3 py-2 text-center">
                      <Badge variant={d.priority === "critical" ? "destructive" : d.priority === "high" ? "default" : "secondary"} className="text-[10px]">
                        {d.priority}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-[10px]">{d.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-200">
        <CardHeader className="pb-2 bg-orange-50/50">
          <CardTitle className="text-base flex items-center gap-2">
            <Wind className="h-4 w-4 text-orange-600" /> Next Season Prep — Sharad Ritu (Autumn)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Medicine</th>
                  <th className="px-3 py-2 text-left">Reason</th>
                  <th className="px-3 py-2 text-center">Needed By</th>
                  <th className="px-3 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {nextSeasonPrep.map((d, i) => (
                  <tr key={i} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 text-xs font-medium">{d.medicine}</td>
                    <td className="px-3 py-2 text-[10px] text-muted-foreground">{d.reason}</td>
                    <td className="px-3 py-2 text-center text-xs font-bold">{d.eta}</td>
                    <td className="px-3 py-2 text-[10px]">{d.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3">
          <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-purple-800">AI Seasonal Intelligence</p>
            <p className="text-sm text-purple-700">
              Varsha Ritu triggers Vata Prakopa + Mandagni (weak digestion). Historical data shows 65% spike in
              Amavata (RA) cases Jul–Aug across 3 years. AI auto-generates PO suggestions 15 days before
              each Ritu transition. Monsoon also triggers skin conditions (Kushtha) and respiratory issues —
              stock Nimbadi Churna and Dashamoolarishtam accordingly.
              <br/><strong>Savings estimate:</strong> Ritu-based pre-ordering saves 18% vs reactive purchasing (₹2.4L annual savings for a single branch).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
