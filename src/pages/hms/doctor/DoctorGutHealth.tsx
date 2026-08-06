import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Brain,
  Sparkles,
  Activity,
  Pill,
  Utensils,
  Leaf,
  Send,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const symptoms = [
  { id: "bloating", label: "Bloating / Abdominal distension" },
  { id: "gas", label: "Excessive Gas / Flatulence" },
  { id: "constipation", label: "Constipation" },
  { id: "diarrhea", label: "Diarrhea / Loose stools" },
  { id: "acid_reflux", label: "Acid Reflux / Heartburn" },
  { id: "food_intolerance", label: "Food Intolerance" },
  { id: "fatigue_eating", label: "Fatigue after eating" },
  { id: "skin_issues", label: "Skin issues (acne, eczema, rashes)" },
  { id: "bad_breath", label: "Bad breath / Coated tongue" },
  { id: "nausea", label: "Nausea / Loss of appetite" },
  { id: "abdominal_pain", label: "Abdominal pain / Cramping" },
  { id: "undigested_food", label: "Undigested food in stool" },
  { id: "heaviness", label: "Heaviness after meals" },
  { id: "irregular_appetite", label: "Irregular appetite" },
  { id: "brain_fog", label: "Brain fog / Poor concentration" },
];

const frequencyOptions = ["Never", "Sometimes", "Often", "Always"];

type FrequencyMap = Record<string, number>;

const mockAnalysis = {
  score: 38,
  agniStatus: "Mandagni (Weak Digestive Fire)",
  agniDescription:
    "Your digestive fire is currently weakened, leading to incomplete digestion and formation of Ama (metabolic toxins). Food is not being properly transformed into nutrients.",
  amaLevel: "Moderate",
  amaDescription:
    "Moderate accumulation of Ama detected. Signs include coated tongue, fatigue after meals, and irregular bowel movements. Ama is blocking the Srotas (channels).",
  koshtha: "Krura (Hard bowel)",
  koshthaDescription:
    "Your bowel tendency is Krura type — tends toward constipation, requires stronger measures for purgation. Vata predominant in the GI tract.",
};

const mockRecommendations = {
  herbs: [
    { name: "Trikatu Churna", dose: "1/2 tsp before meals with warm water", purpose: "Kindles Agni, reduces Ama" },
    { name: "Hingvastak Churna", dose: "1 tsp with first morsel of food", purpose: "Relieves bloating & gas, improves digestion" },
    { name: "Chitrakadi Vati", dose: "2 tablets before lunch & dinner", purpose: "Deepana-Pachana (appetite stimulant & digestant)" },
    { name: "Triphala Churna", dose: "1 tsp at bedtime with warm water", purpose: "Gentle laxative, detoxification, Krura Koshtha management" },
  ],
  diet: [
    "Eat only when genuinely hungry — skip meals if no appetite",
    "Drink warm water (boiled with cumin/ajwain) throughout day",
    "Include Agni-kindling spices: ginger, black pepper, cumin, hing",
    "Avoid cold, raw, heavy foods — especially curd, cheese, banana",
    "Practice Langhana (light fasting) once a week — liquid diet only",
    "Eat largest meal at lunch when Agni is strongest (Pitta time)",
  ],
  panchakarma: [
    {
      name: "Virechana (Therapeutic Purgation)",
      description: "Recommended for Ama elimination and resetting digestive function. 7-day prep with Snehapana (medicated ghee), followed by purgation.",
      priority: "High",
    },
    {
      name: "Basti (Medicated Enema)",
      description: "Dashamool Niruha Basti to address Vata in colon and Krura Koshtha. Course of 8 days Yoga Basti recommended.",
      priority: "Medium",
    },
  ],
};

const DoctorGutHealth = () => {
  const [responses, setResponses] = useState<FrequencyMap>({});
  const [showResult, setShowResult] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFrequencyChange = (symptomId: string, value: number) => {
    setResponses((prev) => ({ ...prev, [symptomId]: value }));
  };

  const handleAnalyze = () => {
    const answered = Object.keys(responses).length;
    if (answered < 5) {
      toast.error("Please rate at least 5 symptoms for accurate assessment");
      return;
    }
    setIsAnalyzing(true);
    setTimeout(() => {
      setShowResult(true);
      setIsAnalyzing(false);
      toast.success("Gut health analysis complete!");
    }, 2000);
  };

  const handlePrescribe = () => {
    toast.success("Treatment plan added to prescription");
  };

  const handleSendReport = () => {
    toast.success("Gut health report sent to patient via WhatsApp");
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 75) return "Good";
    if (score >= 50) return "Moderate";
    if (score >= 25) return "Poor";
    return "Critical";
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-green-600" />
            Gut Health Assessment (AI)
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered Agni & digestive health analysis
          </p>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-700">
          <Sparkles className="h-3 w-3 mr-1" />
          AI Powered
        </Badge>
      </div>

      {/* Symptom Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Symptom Assessment</CardTitle>
          <p className="text-sm text-muted-foreground">
            Rate how frequently you experience each symptom
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Header */}
            <div className="hidden md:grid grid-cols-[1fr,repeat(4,80px)] gap-2 pb-2 border-b">
              <span className="text-sm font-medium">Symptom</span>
              {frequencyOptions.map((opt) => (
                <span key={opt} className="text-xs font-medium text-center text-muted-foreground">
                  {opt}
                </span>
              ))}
            </div>
            {/* Symptoms */}
            {symptoms.map((symptom) => (
              <div
                key={symptom.id}
                className="grid grid-cols-1 md:grid-cols-[1fr,repeat(4,80px)] gap-2 items-center py-2 border-b border-dashed last:border-0"
              >
                <span className="text-sm">{symptom.label}</span>
                <div className="flex md:contents gap-2">
                  {frequencyOptions.map((opt, idx) => (
                    <button
                      key={opt}
                      onClick={() => handleFrequencyChange(symptom.id, idx)}
                      className={`px-2 py-1 rounded text-xs border transition-all text-center ${
                        responses[symptom.id] === idx
                          ? idx === 0
                            ? "bg-green-100 border-green-400 text-green-700"
                            : idx === 1
                            ? "bg-yellow-100 border-yellow-400 text-yellow-700"
                            : idx === 2
                            ? "bg-orange-100 border-orange-400 text-orange-700"
                            : "bg-red-100 border-red-400 text-red-700"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full" size="lg">
              <Brain className="h-4 w-4 mr-2" />
              {isAnalyzing ? "Analyzing gut health..." : "Analyze Gut Health (AI)"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Results */}
      {showResult && (
        <>
          {/* Score Card */}
          <Card className="border-green-200">
            <CardHeader className="bg-green-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-green-600" />
                AI Gut Health Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Score */}
              <div className="text-center space-y-2">
                <h2 className={`text-5xl font-bold ${getScoreColor(mockAnalysis.score)}`}>
                  {mockAnalysis.score}/100
                </h2>
                <p className="text-lg font-medium text-muted-foreground">
                  Gut Health Score: <span className={getScoreColor(mockAnalysis.score)}>{getScoreLabel(mockAnalysis.score)}</span>
                </p>
                <Progress value={mockAnalysis.score} className="h-3 max-w-md mx-auto" />
              </div>

              <Separator />

              {/* Detailed Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg bg-orange-50 border-orange-200">
                  <h4 className="font-semibold text-orange-700 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Agni Status
                  </h4>
                  <p className="font-bold text-sm mt-1">{mockAnalysis.agniStatus}</p>
                  <p className="text-xs text-gray-600 mt-1">{mockAnalysis.agniDescription}</p>
                </div>
                <div className="p-4 border rounded-lg bg-red-50 border-red-200">
                  <h4 className="font-semibold text-red-700 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Ama Level
                  </h4>
                  <p className="font-bold text-sm mt-1">{mockAnalysis.amaLevel}</p>
                  <p className="text-xs text-gray-600 mt-1">{mockAnalysis.amaDescription}</p>
                </div>
                <div className="p-4 border rounded-lg bg-purple-50 border-purple-200">
                  <h4 className="font-semibold text-purple-700 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Koshtha
                  </h4>
                  <p className="font-bold text-sm mt-1">{mockAnalysis.koshtha}</p>
                  <p className="text-xs text-gray-600 mt-1">{mockAnalysis.koshthaDescription}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-600" />
                Treatment Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Herbs */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2 text-green-700">
                  <Pill className="h-4 w-4" />
                  Recommended Herbs
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {mockRecommendations.herbs.map((herb, i) => (
                    <div key={i} className="p-3 border rounded-lg">
                      <p className="font-semibold text-sm">{herb.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">Dose: {herb.dose}</p>
                      <p className="text-xs text-green-700 mt-1">{herb.purpose}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Diet Changes */}
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2 text-emerald-700">
                  <Utensils className="h-4 w-4" />
                  Diet Changes
                </h3>
                <ul className="space-y-1">
                  {mockRecommendations.diet.map((item, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              {/* Panchakarma */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2 text-purple-700">
                  <Activity className="h-4 w-4" />
                  Panchakarma Suggestions
                </h3>
                {mockRecommendations.panchakarma.map((pk, i) => (
                  <div key={i} className="p-4 border rounded-lg bg-purple-50 border-purple-200">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">{pk.name}</p>
                      <Badge
                        variant="outline"
                        className={
                          pk.priority === "High"
                            ? "bg-red-100 text-red-700 border-red-300"
                            : "bg-yellow-100 text-yellow-700 border-yellow-300"
                        }
                      >
                        {pk.priority} Priority
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">{pk.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-3">
                <Button onClick={handlePrescribe} className="bg-green-600 hover:bg-green-700">
                  <Pill className="h-4 w-4 mr-2" />
                  Prescribe Treatment
                </Button>
                <Button onClick={handleSendReport} variant="outline">
                  <Send className="h-4 w-4 mr-2" />
                  Send Report to Patient
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default DoctorGutHealth;
