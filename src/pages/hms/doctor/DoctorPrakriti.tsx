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
  Wind,
  Flame,
  Droplets,
  Save,
  User,
  CheckCircle2,
} from "lucide-react";

const questions = [
  {
    category: "Physical",
    items: [
      { id: 1, question: "Body frame / build", options: ["Thin, light, tall or short", "Medium, moderate build", "Large, broad, stocky"] },
      { id: 2, question: "Body weight", options: ["Low, hard to gain weight", "Moderate, can gain/lose easily", "Heavy, hard to lose weight"] },
      { id: 3, question: "Skin texture", options: ["Dry, rough, thin, cool", "Warm, oily, prone to rashes", "Thick, moist, smooth, cool"] },
      { id: 4, question: "Hair quality", options: ["Dry, frizzy, thin, dark", "Fine, soft, early greying/balding", "Thick, oily, lustrous, wavy"] },
      { id: 5, question: "Eye size & appearance", options: ["Small, dry, nervous glance", "Medium, sharp, penetrating", "Large, calm, attractive"] },
      { id: 6, question: "Joints", options: ["Prominent, cracking, dry", "Loose, flexible, warm", "Large, well-padded, firm"] },
      { id: 7, question: "Teeth & gums", options: ["Irregular, receding gums", "Medium, yellowish, soft gums", "Strong, white, healthy gums"] },
      { id: 8, question: "Nails", options: ["Dry, brittle, rough", "Soft, pink, flexible", "Thick, strong, smooth"] },
      { id: 9, question: "Height", options: ["Very tall or very short", "Average height", "Moderate to tall, well-proportioned"] },
      { id: 10, question: "Gait / Walking style", options: ["Fast, light, irregular", "Purposeful, determined", "Slow, steady, graceful"] },
    ],
  },
  {
    category: "Physiological",
    items: [
      { id: 11, question: "Appetite", options: ["Irregular, variable", "Strong, can't skip meals", "Steady, can skip meals easily"] },
      { id: 12, question: "Digestion", options: ["Irregular, bloating, gas", "Fast, acid reflux possible", "Slow but steady"] },
      { id: 13, question: "Thirst", options: ["Variable, forgets to drink", "Excessive, needs cold water", "Low, moderate intake"] },
      { id: 14, question: "Bowel movements", options: ["Dry, hard, constipation", "Loose, frequent, soft", "Regular, heavy, well-formed"] },
      { id: 15, question: "Sweat", options: ["Minimal, scanty", "Profuse, strong odour", "Moderate, pleasant"] },
      { id: 16, question: "Sleep pattern", options: ["Light, interrupted, insomnia", "Moderate, sound but short", "Deep, heavy, prolonged"] },
      { id: 17, question: "Body temperature preference", options: ["Dislikes cold, loves warmth", "Dislikes heat, loves cool", "Tolerates both, dislikes damp"] },
      { id: 18, question: "Physical stamina", options: ["Low, tires easily", "Moderate, intense bursts", "High, good endurance"] },
      { id: 19, question: "Menstrual cycle (if applicable)", options: ["Irregular, scanty, painful", "Regular, heavy, warm", "Regular, moderate, painless"] },
      { id: 20, question: "Voice quality", options: ["Low, hoarse, cracking", "Sharp, clear, commanding", "Deep, pleasant, melodious"] },
    ],
  },
  {
    category: "Psychological",
    items: [
      { id: 21, question: "Mind activity", options: ["Restless, many ideas, quick", "Focused, sharp, intense", "Calm, steady, slow"] },
      { id: 22, question: "Memory", options: ["Quick to learn, quick to forget", "Sharp, clear memory", "Slow to learn, never forgets"] },
      { id: 23, question: "Emotional tendency", options: ["Anxious, fearful, worried", "Angry, irritable, jealous", "Attached, greedy, sentimental"] },
      { id: 24, question: "Decision making", options: ["Indecisive, changes mind often", "Quick, decisive, firm", "Slow, deliberate, steady"] },
      { id: 25, question: "Dreams", options: ["Flying, running, fearful", "Fire, conflict, colourful", "Water, romance, peaceful"] },
      { id: 26, question: "Social behaviour", options: ["Talkative, makes friends quickly", "Leader type, selective friends", "Loyal, few deep friendships"] },
      { id: 27, question: "Spending habits", options: ["Spends quickly, impulsive", "Spends on luxuries, planned", "Saves money, conservative"] },
      { id: 28, question: "Stress response", options: ["Anxiety, panic, nervousness", "Anger, frustration, criticism", "Withdrawal, depression, silence"] },
      { id: 29, question: "Speech pattern", options: ["Fast, talkative, scattered", "Precise, argumentative, sharp", "Slow, thoughtful, measured"] },
      { id: 30, question: "Creativity", options: ["Highly creative, artistic", "Innovative, technical", "Supportive, nurturing"] },
    ],
  },
];

const mockResult = {
  vata: 45,
  pitta: 35,
  kapha: 20,
  dominantPrakriti: "Vata-Pitta Prakriti",
  recommendations: [
    "Follow a warm, nourishing, grounding diet — favour sweet, sour, salty tastes",
    "Maintain regular routines — eat and sleep at consistent times",
    "Practice calming activities: meditation, gentle yoga, Pranayama (Nadi Shodhana)",
    "Oil massage (Abhyanga) with sesame oil before bath — daily if possible",
    "Avoid excessive fasting, cold foods, raw salads, and irregular eating",
    "Herbs: Ashwagandha, Brahmi, Shatavari for Vata balance; Amalaki for Pitta",
    "Keep warm — avoid cold, windy environments",
    "Creative expression and moderate exercise (walking, swimming) recommended",
  ],
};

const DoctorPrakriti = () => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(0);

  const handleAnswer = (questionId: number, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < 10) {
      toast.error("Please answer at least 10 questions for accurate assessment");
      return;
    }
    setShowResult(true);
    toast.success("Prakriti assessment complete!");
  };

  const handleSaveToProfile = () => {
    toast.success("Prakriti assessment saved to patient profile");
  };

  const getDoshaIcon = (dosha: string) => {
    switch (dosha) {
      case "Vata": return <Wind className="h-4 w-4" />;
      case "Pitta": return <Flame className="h-4 w-4" />;
      case "Kapha": return <Droplets className="h-4 w-4" />;
      default: return null;
    }
  };

  const getDoshaColor = (dosha: string) => {
    switch (dosha) {
      case "Vata": return "text-purple-700 bg-purple-100";
      case "Pitta": return "text-red-700 bg-red-100";
      case "Kapha": return "text-blue-700 bg-blue-100";
      default: return "";
    }
  };

  const currentQuestions = questions[currentCategory];
  const totalAnswered = Object.keys(answers).length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            Prakriti Assessment (AI)
          </h1>
          <p className="text-muted-foreground mt-1">
            30-question Ayurvedic constitution analysis
          </p>
        </div>
        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
          <Sparkles className="h-3 w-3 mr-1" />
          AI Powered
        </Badge>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress: {totalAnswered}/30 questions answered</span>
            <span className="text-sm text-muted-foreground">{Math.round((totalAnswered / 30) * 100)}%</span>
          </div>
          <Progress value={(totalAnswered / 30) * 100} className="h-2" />
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <Card>
        <CardHeader>
          <div className="flex gap-2 flex-wrap">
            {questions.map((cat, idx) => (
              <Button
                key={cat.category}
                variant={currentCategory === idx ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentCategory(idx)}
              >
                {cat.category} ({cat.items.filter((q) => answers[q.id] !== undefined).length}/10)
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="font-semibold text-lg">{currentQuestions.category} Attributes</h3>
          {currentQuestions.items.map((q) => (
            <div key={q.id} className="border rounded-lg p-4 space-y-2">
              <p className="font-medium text-sm">
                {q.id}. {q.question}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {q.options.map((opt, optIdx) => {
                  const doshaLabel = optIdx === 0 ? "Vata" : optIdx === 1 ? "Pitta" : "Kapha";
                  const isSelected = answers[q.id] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleAnswer(q.id, optIdx)}
                      className={`p-3 rounded-lg border text-left text-sm transition-all ${
                        isSelected
                          ? optIdx === 0
                            ? "border-purple-500 bg-purple-50 ring-2 ring-purple-300"
                            : optIdx === 1
                            ? "border-red-500 bg-red-50 ring-2 ring-red-300"
                            : "border-blue-500 bg-blue-50 ring-2 ring-blue-300"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-xs ${getDoshaColor(doshaLabel)}`}>
                          {getDoshaIcon(doshaLabel)} {doshaLabel}
                        </Badge>
                        {isSelected && <CheckCircle2 className="h-3 w-3 text-green-600 ml-auto" />}
                      </div>
                      <p className="mt-1">{opt}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Submit */}
      {!showResult && (
        <Button onClick={handleSubmit} className="w-full" size="lg">
          <Sparkles className="h-4 w-4 mr-2" />
          Analyze Prakriti (AI)
        </Button>
      )}

      {/* AI Result */}
      {showResult && (
        <>
          <Card className="border-purple-200">
            <CardHeader className="bg-purple-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                AI Prakriti Result
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-purple-700">{mockResult.dominantPrakriti}</h2>
                <p className="text-muted-foreground">Based on 30-point assessment analysis</p>
              </div>

              <Separator />

              {/* Dosha Bar Chart */}
              <div className="space-y-4">
                <h3 className="font-semibold">Dosha Distribution</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-medium text-purple-700">
                        <Wind className="h-4 w-4" /> Vata
                      </span>
                      <span className="text-sm font-bold text-purple-700">{mockResult.vata}%</span>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all"
                        style={{ width: `${mockResult.vata}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-medium text-red-700">
                        <Flame className="h-4 w-4" /> Pitta
                      </span>
                      <span className="text-sm font-bold text-red-700">{mockResult.pitta}%</span>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full transition-all"
                        style={{ width: `${mockResult.pitta}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-medium text-blue-700">
                        <Droplets className="h-4 w-4" /> Kapha
                      </span>
                      <span className="text-sm font-bold text-blue-700">{mockResult.kapha}%</span>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${mockResult.kapha}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Recommendations */}
              <div className="space-y-2">
                <h3 className="font-semibold">Personalized Recommendations</h3>
                <ul className="space-y-2">
                  {mockResult.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSaveToProfile} className="w-full" variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save to Patient Profile
          </Button>
        </>
      )}
    </div>
  );
};

export default DoctorPrakriti;
