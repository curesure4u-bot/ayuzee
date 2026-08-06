import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, Brain, TrendingUp, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const prakritiData = {
  patient: "Mr. Rajesh Kumar",
  uhid: "AYZ-2024-001285",
  prakriti: { vata: 45, pitta: 30, kapha: 25 },
  vikruti: { vata: 65, pitta: 25, kapha: 10 },
  lastAssessed: "2024-12-15",
  dashavidha: [
    { param: "Sara (Essence)", finding: "Majja Sara – Good intelligence, soft joints" },
    { param: "Samhanana (Compactness)", finding: "Moderate – Medium frame" },
    { param: "Pramana (Measurement)", finding: "Height 172cm, proportional limbs" },
    { param: "Satmya (Adaptability)", finding: "Madhyama – Moderate adaptability" },
    { param: "Satva (Mind)", finding: "Madhyama Satva – Moderate mental strength" },
    { param: "Ahara Shakti (Digestion)", finding: "Vishama Agni – Irregular appetite" },
    { param: "Vyayama Shakti (Exercise)", finding: "Avara – Low exercise capacity" },
    { param: "Vaya (Age)", finding: "Madhyama – Middle age (42 years)" },
  ],
  doshaHistory: [
    { date: "2024-06-10", vata: 48, pitta: 30, kapha: 22 },
    { date: "2024-09-15", vata: 52, pitta: 28, kapha: 20 },
    { date: "2024-12-15", vata: 65, pitta: 25, kapha: 10 },
  ],
  aiRecommendations: [
    "Vata is significantly aggravated – prioritize Vata Shamana chikitsa",
    "Warm, oily, nourishing diet recommended (Snigdha, Ushna Ahara)",
    "Avoid cold foods, raw salads, excess travel, late nights",
    "Abhyanga with Dhanwantharam Tailam daily before bath",
    "Basti (medicated enema) as primary Panchakarma for Vata",
    "Yoga: Gentle Pawanmuktasana series, avoid intense Vinyasa",
  ],
};

function DoshaBar({ label, percentage, color }: { label: string; percentage: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span>{percentage}%</span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

export default function PrakritiProfile() {
  const handleReassess = () => {
    toast.info("Redirecting to Prakriti Assessment...");
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Leaf className="h-6 w-6 text-green-600" /> Prakriti Profile</h1>
          <p className="text-muted-foreground">{prakritiData.patient} • {prakritiData.uhid}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleReassess}><RefreshCw className="h-4 w-4 mr-1" /> Re-assess</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Prakriti (Constitution)</CardTitle>
            <p className="text-xs text-muted-foreground">Assessed: {prakritiData.lastAssessed}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <DoshaBar label="Vata" percentage={prakritiData.prakriti.vata} color="bg-blue-500" />
            <DoshaBar label="Pitta" percentage={prakritiData.prakriti.pitta} color="bg-red-500" />
            <DoshaBar label="Kapha" percentage={prakritiData.prakriti.kapha} color="bg-yellow-500" />
            <Badge variant="secondary" className="mt-2">Vata-Pitta Prakriti</Badge>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Vikruti (Current Imbalance)</CardTitle>
            <p className="text-xs text-muted-foreground">Current dosha status</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <DoshaBar label="Vata" percentage={prakritiData.vikruti.vata} color="bg-blue-500" />
            <DoshaBar label="Pitta" percentage={prakritiData.vikruti.pitta} color="bg-red-500" />
            <DoshaBar label="Kapha" percentage={prakritiData.vikruti.kapha} color="bg-yellow-500" />
            <Badge variant="destructive" className="mt-2">Vata Aggravated (+20%)</Badge>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dashavidha">
        <TabsList>
          <TabsTrigger value="dashavidha">Dashavidha Pariksha</TabsTrigger>
          <TabsTrigger value="history">Dosha Trend</TabsTrigger>
          <TabsTrigger value="ai">AI Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="dashavidha">
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {prakritiData.dashavidha.map((item, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2 border-b last:border-0">
                    <span className="font-medium text-sm w-48 shrink-0">{item.param}</span>
                    <span className="text-sm text-muted-foreground">{item.finding}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Dosha Balance Over Visits</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prakritiData.doshaHistory.map((entry, i) => (
                  <div key={i} className="space-y-2">
                    <p className="text-sm font-medium">{entry.date}</p>
                    <div className="flex gap-2 text-xs">
                      <Badge variant="outline">V: {entry.vata}%</Badge>
                      <Badge variant="outline">P: {entry.pitta}%</Badge>
                      <Badge variant="outline">K: {entry.kapha}%</Badge>
                    </div>
                    <div className="h-4 flex rounded-full overflow-hidden">
                      <div className="bg-blue-400" style={{ width: `${entry.vata}%` }} />
                      <div className="bg-red-400" style={{ width: `${entry.pitta}%` }} />
                      <div className="bg-yellow-400" style={{ width: `${entry.kapha}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Brain className="h-4 w-4" /> AI-Based Recommendations</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {prakritiData.aiRecommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Leaf className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
