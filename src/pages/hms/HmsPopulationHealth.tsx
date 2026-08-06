import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Users, Activity, AlertTriangle, TrendingUp } from "lucide-react";

const predictions = [
  { region: "Kadayanallur", season: "Varsha (Monsoon)", prediction: "Joint pain +45%, Respiratory +30%, Skin infections +25%", confidence: 88, action: "Stock: Rasnasaptakam +50%, Sitopaladi +40%. Schedule: Extra PK slots for Kati Basti" },
  { region: "Tirunelveli", season: "Varsha (Monsoon)", prediction: "Dengue cluster risk (based on last 3 years pattern)", confidence: 72, action: "Alert: Papaya leaf + Guduchi capsules. Prepare Jwara protocol. Notify PHC coordination." },
  { region: "Chennai", season: "Greeshma → Varsha transition", prediction: "Pitta disorders surge (acidity, skin rashes, UTI) +35%", confidence: 85, action: "Stock: Avipattikar, Usheerasava, Chandanadi Taila. Offer Pitta-shamana packages." },
  { region: "Theni (Hill)", season: "Sharad (Autumn)", prediction: "Vata season onset — back pain, nerve pain, insomnia +40%", confidence: 91, action: "Marketing: Launch 'Spine Season Offer' 2 weeks before. Pre-book PK rooms." },
  { region: "All Branches", season: "Swarnaprasanam", prediction: "Next Pushya Nakshatra: Aug 12 — expect 200+ children", confidence: 98, action: "Prepare: 200 Swarna Bhasma doses, 4 extra therapists, extended hours 6AM-8PM" },
];

const diseaseMap = [
  { disease: "Gridhrasi (Sciatica)", patients: 180, trend: "+12%", topAge: "45-65", topSeason: "Varsha/Hemanta", topBranch: "Kadayanallur" },
  { disease: "Sandhivata (OA Knee)", patients: 145, trend: "+8%", topAge: "55-75", topSeason: "Hemanta/Shishira", topBranch: "Tirunelveli" },
  { disease: "Amavata (RA)", patients: 62, trend: "+5%", topAge: "35-55", topSeason: "Varsha", topBranch: "Chennai" },
  { disease: "Pakshaghata (Paralysis)", patients: 28, trend: "-3%", topAge: "60-80", topSeason: "All year", topBranch: "Kadayanallur" },
  { disease: "Twak Roga (Skin)", patients: 95, trend: "+20%", topAge: "20-40", topSeason: "Greeshma/Varsha", topBranch: "Chennai" },
];

const HmsPopulationHealth = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div><h1 className="text-2xl font-bold">Population Health Prediction</h1><p className="text-sm text-muted-foreground">AI predicts disease trends by region + season (Ritucharya) → proactive stock & staffing</p></div>
      <Badge className="bg-purple-100 text-purple-800"><Brain className="mr-1 h-3 w-3" />AI Forecasting Active</Badge>
    </div>
    <Card><CardHeader><CardTitle>AI Predictions (Next 30 Days)</CardTitle></CardHeader><CardContent className="space-y-3">
      {predictions.map((p, i) => (
        <div key={i} className="p-3 border rounded-lg space-y-1">
          <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Badge variant="outline">{p.region}</Badge><Badge className="bg-blue-100 text-blue-800">{p.season}</Badge></div><Badge className="bg-purple-100 text-purple-800">{p.confidence}% confidence</Badge></div>
          <p className="text-sm font-medium">{p.prediction}</p>
          <p className="text-xs text-green-700 bg-green-50 p-2 rounded">🎯 Action: {p.action}</p>
        </div>
      ))}
    </CardContent></Card>
    <Card><CardHeader><CardTitle>Disease Epidemiology (Your Patient Base)</CardTitle></CardHeader><CardContent className="p-0"><table className="w-full text-sm"><thead className="bg-muted/50"><tr><th className="p-3 text-left">Disease</th><th className="p-3">Patients</th><th className="p-3">Trend</th><th className="p-3">Peak Age</th><th className="p-3">Peak Season</th><th className="p-3">Top Branch</th></tr></thead>
      <tbody>{diseaseMap.map(d => (<tr key={d.disease} className="border-t"><td className="p-3 font-medium">{d.disease}</td><td className="p-3 text-center">{d.patients}</td><td className="p-3 text-center"><Badge className={d.trend.startsWith("+") ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>{d.trend}</Badge></td><td className="p-3 text-center">{d.topAge}</td><td className="p-3 text-center text-xs">{d.topSeason}</td><td className="p-3 text-center text-xs">{d.topBranch}</td></tr>))}</tbody></table></CardContent></Card>
  </div>
);
export default HmsPopulationHealth;
