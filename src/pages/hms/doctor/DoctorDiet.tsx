import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Brain,
  Printer,
  MessageCircle,
  Leaf,
  Sun,
  Thermometer,
} from "lucide-react";

const dietChart = [
  {
    time: "Early Morning (6:00 AM)",
    pathya: "Warm water with Triphala churna (1 tsp), Soaked methi (fenugreek) seeds",
    apathya: "Cold water, Tea/Coffee on empty stomach, Ice cream",
    notes: "Helps Agni (digestive fire) kindling, reduces Ama",
  },
  {
    time: "Breakfast (8:00 AM)",
    pathya: "Daliya (broken wheat porridge) with ghee, Moong dal chilla, Warm milk with turmeric",
    apathya: "Bread, Cold cereals, Raw salads, Curd/Yogurt",
    notes: "Warm, unctuous foods pacify Vata. Ghee lubricates joints.",
  },
  {
    time: "Mid-Morning (10:30 AM)",
    pathya: "Dry ginger tea, 4-5 soaked almonds, Seasonal warm fruit (papaya/pomegranate)",
    apathya: "Cold drinks, Packaged juices, Banana, Watermelon",
    notes: "Light snack maintains metabolism without overloading Agni",
  },
  {
    time: "Lunch (12:30 PM)",
    pathya: "Rice with ghee, Moong/Masoor dal, Steamed seasonal veggies, Buttermilk (Takra)",
    apathya: "Rajma, Chole, Raw onion, Cold raita, Fermented foods",
    notes: "Largest meal when Agni is strongest. Include all 6 Rasas.",
  },
  {
    time: "Evening (4:00 PM)",
    pathya: "Vegetable soup, Roasted makhana, Herbal tea (Ashwagandha/Shatavari)",
    apathya: "Fried snacks, Biscuits, Cold beverages, Maida items",
    notes: "Light & warm. Ashwagandha reduces Vata and inflammation.",
  },
  {
    time: "Dinner (7:00 PM)",
    pathya: "Khichdi with ghee, Chapati (wheat) with lauki sabzi, Warm dal soup",
    apathya: "Non-veg, Heavy curries, Paneer, Curd, Salad",
    notes: "Early & light dinner. Warm, easily digestible foods preferred.",
  },
  {
    time: "Bedtime (9:30 PM)",
    pathya: "Warm milk with Ashwagandha + pinch of nutmeg, Haritaki churna (if constipated)",
    apathya: "Heavy snacks, Cold milk, Eating anything heavy",
    notes: "Promotes sound sleep. Nutmeg and Ashwagandha are Vata-shamak.",
  },
];

const rasaRecommendations = [
  { rasa: "Madhura (Sweet)", recommendation: "Increase", reason: "Pacifies Vata & Pitta, nourishes tissues" },
  { rasa: "Amla (Sour)", recommendation: "Moderate", reason: "Stimulates Agni, but excess aggravates Pitta" },
  { rasa: "Lavana (Salty)", recommendation: "Moderate", reason: "Reduces Vata but excess causes water retention" },
  { rasa: "Tikta (Bitter)", recommendation: "Small amount", reason: "Detoxifies but increases Vata if excess" },
  { rasa: "Katu (Pungent)", recommendation: "Small amount", reason: "Helps digestion but aggravates Pitta" },
  { rasa: "Kashaya (Astringent)", recommendation: "Avoid/Minimal", reason: "Increases Vata, causes dryness in joints" },
];

const DoctorDiet = () => {
  const [selectedPatient, setSelectedPatient] = useState("rajesh-kumar");
  const [selectedCondition, setSelectedCondition] = useState("amavata");
  const [selectedPrakriti, setSelectedPrakriti] = useState("vata-pitta");
  const [showChart, setShowChart] = useState(true);

  const handleGenerate = () => {
    setShowChart(true);
    toast.success("AI Diet chart generated based on Prakriti + Condition + Season");
  };

  const handleSendWhatsApp = () => {
    toast.success("Diet chart sent to patient via WhatsApp");
  };

  const handlePrint = () => {
    toast.success("Preparing diet chart for printing...");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Leaf className="h-8 w-8 text-green-600" />
            Diet & Pathya Prescription (AI)
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-generated Ayurvedic diet plans based on Prakriti, condition & season
          </p>
        </div>
      </div>

      {/* Selection Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Select Patient</Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rajesh-kumar">Rajesh Kumar</SelectItem>
                  <SelectItem value="priya-sharma">Priya Sharma</SelectItem>
                  <SelectItem value="anil-verma">Anil Verma</SelectItem>
                  <SelectItem value="sunita-devi">Sunita Devi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Condition</Label>
              <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amavata">Amavata (Rheumatoid Arthritis)</SelectItem>
                  <SelectItem value="madhumeha">Madhumeha (Diabetes)</SelectItem>
                  <SelectItem value="sandhivata">Sandhivata (Osteoarthritis)</SelectItem>
                  <SelectItem value="gridhrasi">Gridhrasi (Sciatica)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prakriti Type</Label>
              <Select value={selectedPrakriti} onValueChange={setSelectedPrakriti}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Prakriti" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vata-pitta">Vata-Pitta</SelectItem>
                  <SelectItem value="pitta-kapha">Pitta-Kapha</SelectItem>
                  <SelectItem value="vata-kapha">Vata-Kapha</SelectItem>
                  <SelectItem value="tridosha">Tridosha (Balanced)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="mt-4" onClick={handleGenerate}>
            <Brain className="h-4 w-4 mr-2" />
            Generate AI Diet Plan
          </Button>
        </CardContent>
      </Card>

      {showChart && (
        <>
          {/* AI Note */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 flex items-center gap-3">
              <Brain className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">AI Recommendation</p>
                <p className="text-sm text-green-700">
                  Based on Prakriti (Vata-Pitta) + condition (Amavata/RA) + season (Varsha Ritu),
                  recommending warm, unctuous foods. Avoid cold, dry, raw items. Emphasize Madhura
                  & Amla rasa. Include anti-inflammatory spices: Turmeric, Ginger, Guggulu.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Seasonal Adjustment */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4 flex items-start gap-3">
              <Sun className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-800">Seasonal Adjustment (Varsha Ritu - Monsoon)</p>
                <p className="text-sm text-blue-700">
                  Agni is weak during monsoon. Prefer light, warm, freshly cooked food. Avoid
                  leafy greens (contamination risk), curd at night, and heavy-to-digest foods.
                  Add Pippali (long pepper) and Saindhava Lavana to meals.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Diet Chart Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5" />
                  Diet Chart — Vata-Pitta Prakriti with Amavata (RA)
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleSendWhatsApp}>
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Send via WhatsApp
                  </Button>
                  <Button size="sm" variant="outline" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-1" />
                    Print Diet Chart
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium w-[15%]">Time</th>
                      <th className="text-left p-3 font-medium w-[30%] text-green-700">
                        Pathya (Recommended)
                      </th>
                      <th className="text-left p-3 font-medium w-[30%] text-red-700">
                        Apathya (Avoid)
                      </th>
                      <th className="text-left p-3 font-medium w-[25%]">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dietChart.map((row, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-medium">{row.time}</td>
                        <td className="p-3 text-green-800">{row.pathya}</td>
                        <td className="p-3 text-red-700">{row.apathya}</td>
                        <td className="p-3 text-muted-foreground text-xs">{row.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Rasa Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rasa (Taste) Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium">Rasa (Taste)</th>
                      <th className="text-left p-3 font-medium">Recommendation</th>
                      <th className="text-left p-3 font-medium">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rasaRecommendations.map((row, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-medium">{row.rasa}</td>
                        <td className="p-3">
                          <Badge
                            className={
                              row.recommendation === "Increase"
                                ? "bg-green-500 text-white"
                                : row.recommendation === "Avoid/Minimal"
                                ? "bg-red-500 text-white"
                                : "bg-yellow-500 text-white"
                            }
                          >
                            {row.recommendation}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">{row.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Specific Ayurvedic Diet Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ayurvedic Diet Rules (Ahara Vidhi Visheshayatana)</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">1</Badge>
                  <span><strong>Ushna (Warm):</strong> Always eat freshly cooked, warm food. Avoid refrigerated or reheated food.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">2</Badge>
                  <span><strong>Snigdha (Unctuous):</strong> Include ghee, sesame oil in diet. Reduces Vata and lubricates joints.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">3</Badge>
                  <span><strong>Matravat (Quantity):</strong> Eat only until 3/4 stomach full. Leave space for digestion.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">4</Badge>
                  <span><strong>Jeerne (After digestion):</strong> Eat next meal only after previous meal is fully digested (3-4 hours gap).</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">5</Badge>
                  <span><strong>Viruddha Ahara (Incompatible):</strong> Avoid milk + fruit, fish + milk, honey + ghee in equal quantity.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default DoctorDiet;
