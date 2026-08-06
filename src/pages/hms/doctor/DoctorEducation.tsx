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
  FileText,
  Languages,
  Sparkles,
  Heart,
  ShieldCheck,
  Utensils,
  Activity,
} from "lucide-react";

const mockPatients = [
  { id: "P001", name: "Rajesh Kumar" },
  { id: "P002", name: "Priya Sharma" },
  { id: "P003", name: "Suresh Patel" },
];

const mockConditions = [
  "Amavata (Rheumatoid Arthritis)",
  "Gridhrasi (Sciatica)",
  "Pandu (Anemia)",
  "Madhumeha (Diabetes)",
  "Shwasa (Asthma)",
];

const mockEducationContent = {
  title: "Understanding Amavata (Rheumatoid Arthritis)",
  explanation: `Amavata is a condition where your body's digestive fire (Agni) becomes weak. When digestion is poor, a toxic substance called "Ama" forms in the body. This Ama gets carried by Vata (the movement energy) and settles in your joints, causing pain, swelling, and stiffness.

Think of it like this: when food is not properly digested, it creates a sticky residue that clogs your joints — similar to how grease clogs pipes. Your immune system then reacts to this buildup, causing inflammation and pain.

In modern terms, this is similar to Rheumatoid Arthritis where the immune system mistakenly attacks the joints.`,
  dos: [
    "Eat warm, freshly cooked meals — avoid cold or stale food",
    "Drink warm water throughout the day (never cold water)",
    "Apply warm sesame oil on joints before bath",
    "Practice gentle yoga — Pawanmuktasana series helps joints",
    "Take Rasna-Erandadi Kashayam as prescribed by doctor",
    "Get adequate rest — sleep by 10 PM",
    "Use dry ginger (Shunthi) in cooking regularly",
  ],
  donts: [
    "Avoid curd, cold drinks, and ice cream completely",
    "Do not eat incompatible foods (milk + fruit, fish + milk)",
    "Avoid heavy exercise or over-exertion of inflamed joints",
    "Do not suppress natural urges (especially passing gas & stool)",
    "Avoid sleeping during daytime (increases Kapha & Ama)",
    "Do not consume fermented foods, pickles, or vinegar",
    "Avoid exposure to cold wind or AC directly on joints",
  ],
  seekHelp: [
    "Sudden severe joint swelling with high fever",
    "Inability to move any joint for more than 2 hours in morning",
    "Unexplained weight loss with joint pain",
    "Eye redness or dryness along with joint symptoms",
    "Numbness or tingling in hands/feet",
  ],
  dietTips: [
    "Start day with warm water + dry ginger powder",
    "Include Pathya foods: old rice, moong dal, barley, bitter gourd",
    "Use spices: turmeric, cumin, fennel, ginger in daily cooking",
    "Avoid Apathya: curd, urad dal, fish, jaggery, sesame",
    "Drink Panchamool Kwath or Dashamool tea in evening",
    "Eat dinner before 7 PM — keep it light (khichdi/soup)",
  ],
  lifestyle: [
    "Abhyanga (oil massage) with Mahanarayan Taila before bath",
    "Swedana (steam therapy) on affected joints 2-3 times/week",
    "Gentle Pranayama: Anulom-Vilom, Bhramari (10 minutes daily)",
    "Walk 15-20 minutes in morning sun (Vitamin D + warmth)",
    "Avoid stress — practice meditation or Yoga Nidra",
    "Wear warm clothing, especially cover joints in cold weather",
  ],
};

const DoctorEducation = () => {
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [isGenerated, setIsGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!selectedPatient || !selectedCondition) {
      toast.error("Please select both patient and condition");
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerated(true);
      setIsGenerating(false);
      toast.success("Education handout generated successfully");
    }, 1500);
  };

  const handleWhatsApp = () => {
    toast.success("Handout sent via WhatsApp to patient");
  };

  const handlePrint = () => {
    toast.success("Sending to printer...");
  };

  const handleTranslate = (lang: string) => {
    toast.success(`Generating handout in ${lang}...`);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            Patient Education Handout (AI)
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate patient-friendly education materials powered by AI
          </p>
        </div>
        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
          <Sparkles className="h-3 w-3 mr-1" />
          AI Powered
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Patient & Condition</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Patient</Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {mockPatients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.id})
                    </SelectItem>
                  ))}
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
                  {mockConditions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full md:w-auto">
            <Sparkles className="h-4 w-4 mr-2" />
            {isGenerating ? "Generating..." : "Generate Education Handout"}
          </Button>
        </CardContent>
      </Card>

      {isGenerated && (
        <>
          <Card className="border-purple-200">
            <CardHeader className="bg-purple-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                {mockEducationContent.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Prepared for: Rajesh Kumar | Condition: Amavata (Rheumatoid Arthritis)
              </p>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Disease Explanation */}
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2 text-purple-700">
                  <Brain className="h-4 w-4" />
                  What is this condition? (Simple Explanation)
                </h3>
                <p className="text-sm leading-relaxed whitespace-pre-line text-gray-700">
                  {mockEducationContent.explanation}
                </p>
              </div>

              <Separator />

              {/* Do's & Don'ts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2 text-green-700">
                    <ShieldCheck className="h-4 w-4" />
                    Do's ✓
                  </h3>
                  <ul className="space-y-1">
                    {mockEducationContent.dos.map((item, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2 text-red-700">
                    <ShieldCheck className="h-4 w-4" />
                    Don'ts ✗
                  </h3>
                  <ul className="space-y-1">
                    {mockEducationContent.donts.map((item, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-red-600 mt-0.5">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Separator />

              {/* When to Seek Help */}
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2 text-orange-700">
                  <Heart className="h-4 w-4" />
                  When to Seek Immediate Help
                </h3>
                <ul className="space-y-1">
                  {mockEducationContent.seekHelp.map((item, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-orange-600 mt-0.5">⚠️</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              {/* Diet Tips */}
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2 text-emerald-700">
                  <Utensils className="h-4 w-4" />
                  Diet Tips
                </h3>
                <ul className="space-y-1">
                  {mockEducationContent.dietTips.map((item, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-emerald-600 mt-0.5">🍽️</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              {/* Lifestyle Modifications */}
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2 text-blue-700">
                  <Activity className="h-4 w-4" />
                  Lifestyle Modifications
                </h3>
                <ul className="space-y-1">
                  {mockEducationContent.lifestyle.map((item, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">🧘</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleWhatsApp} className="bg-green-600 hover:bg-green-700">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send via WhatsApp
                </Button>
                <Button onClick={handlePrint} variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  Print Handout
                </Button>
                <Button onClick={() => handleTranslate("Tamil")} variant="outline">
                  <Languages className="h-4 w-4 mr-2" />
                  Generate in Tamil
                </Button>
                <Button onClick={() => handleTranslate("Hindi")} variant="outline">
                  <Languages className="h-4 w-4 mr-2" />
                  Generate in Hindi
                </Button>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <strong>AI Note:</strong> Generated in patient's preferred language. Simplified medical terms for easy understanding.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default DoctorEducation;
