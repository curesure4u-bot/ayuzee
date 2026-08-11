import { useState } from "react";
import { Brain, ArrowRight, ArrowLeft, RotateCcw, AlertCircle, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

type Category =
  | "Digestive"
  | "Respiratory"
  | "Musculoskeletal"
  | "Skin"
  | "Mental Health"
  | "Women's Health"
  | "General"
  | "Pain"
  | "Fever"
  | "Other";

type Duration = "just_started" | "1_3_days" | "1_2_weeks" | "more_2_weeks" | "chronic";
type Severity = "mild" | "moderate" | "severe" | "emergency";

interface SubSymptom {
  id: string;
  label: string;
  redFlag?: boolean;
}

const subSymptomsByCategory: Record<Category, SubSymptom[]> = {
  Digestive: [
    { id: "bloating", label: "Bloating / Gas" },
    { id: "nausea", label: "Nausea / Vomiting" },
    { id: "diarrhea", label: "Diarrhea" },
    { id: "constipation", label: "Constipation" },
    { id: "acid_reflux", label: "Acid reflux / Heartburn" },
    { id: "blood_stool", label: "Blood in stool", redFlag: true },
    { id: "abdominal_pain", label: "Abdominal pain" },
    { id: "loss_appetite", label: "Loss of appetite" },
  ],
  Respiratory: [
    { id: "cough", label: "Cough (dry or wet)" },
    { id: "breathlessness", label: "Breathlessness", redFlag: true },
    { id: "wheezing", label: "Wheezing" },
    { id: "sore_throat", label: "Sore throat" },
    { id: "nasal_congestion", label: "Nasal congestion" },
    { id: "chest_pain", label: "Chest pain", redFlag: true },
    { id: "phlegm", label: "Excessive phlegm" },
  ],
  Musculoskeletal: [
    { id: "joint_pain", label: "Joint pain" },
    { id: "back_pain", label: "Back pain" },
    { id: "stiffness", label: "Morning stiffness" },
    { id: "swelling", label: "Joint swelling" },
    { id: "muscle_weakness", label: "Muscle weakness" },
    { id: "numbness", label: "Numbness / Tingling", redFlag: true },
    { id: "limited_mobility", label: "Limited range of motion" },
  ],
  Skin: [
    { id: "rash", label: "Skin rash" },
    { id: "itching", label: "Itching" },
    { id: "dryness", label: "Dry / Flaky skin" },
    { id: "acne", label: "Acne / Pimples" },
    { id: "pigmentation", label: "Pigmentation changes" },
    { id: "hair_loss", label: "Hair loss" },
    { id: "wound_healing", label: "Slow wound healing" },
  ],
  "Mental Health": [
    { id: "anxiety", label: "Anxiety / Worry" },
    { id: "depression", label: "Low mood / Sadness" },
    { id: "insomnia", label: "Insomnia / Sleep issues" },
    { id: "concentration", label: "Poor concentration" },
    { id: "fatigue", label: "Mental fatigue" },
    { id: "self_harm", label: "Thoughts of self-harm", redFlag: true },
    { id: "irritability", label: "Irritability / Mood swings" },
  ],
  "Women's Health": [
    { id: "irregular_periods", label: "Irregular periods" },
    { id: "heavy_periods", label: "Heavy menstrual bleeding" },
    { id: "cramps", label: "Menstrual cramps" },
    { id: "pcos", label: "PCOS symptoms" },
    { id: "hot_flashes", label: "Hot flashes" },
    { id: "breast_lump", label: "Breast lump", redFlag: true },
    { id: "vaginal_discharge", label: "Unusual discharge" },
  ],
  General: [
    { id: "fatigue_gen", label: "Fatigue / Low energy" },
    { id: "weight_change", label: "Unexplained weight change" },
    { id: "night_sweats", label: "Night sweats" },
    { id: "dizziness", label: "Dizziness" },
    { id: "swollen_lymph", label: "Swollen lymph nodes" },
    { id: "thirst", label: "Excessive thirst" },
    { id: "frequent_urination", label: "Frequent urination" },
  ],
  Pain: [
    { id: "headache", label: "Headache" },
    { id: "migraine", label: "Migraine" },
    { id: "neck_pain", label: "Neck pain" },
    { id: "shoulder_pain", label: "Shoulder pain" },
    { id: "knee_pain", label: "Knee pain" },
    { id: "sudden_severe", label: "Sudden severe pain", redFlag: true },
    { id: "radiating", label: "Radiating / Shooting pain" },
  ],
  Fever: [
    { id: "high_fever", label: "High fever (>103°F)", redFlag: true },
    { id: "chills", label: "Chills / Rigors" },
    { id: "body_ache", label: "Body ache" },
    { id: "sweating", label: "Excessive sweating" },
    { id: "intermittent", label: "Intermittent fever" },
    { id: "rash_fever", label: "Fever with rash", redFlag: true },
  ],
  Other: [
    { id: "other_mild", label: "Mild discomfort" },
    { id: "other_recurring", label: "Recurring issue" },
    { id: "other_new", label: "New symptom" },
    { id: "other_worsening", label: "Worsening condition" },
    { id: "other_multiple", label: "Multiple symptoms" },
  ],
};

const ayushApproach: Record<Category, { system: string; description: string }> = {
  Digestive: { system: "Ayurveda", description: "Agni (digestive fire) correction through diet, herbs, and Panchakarma detox" },
  Respiratory: { system: "Ayurveda & Yoga", description: "Pranayama breathing techniques, herbal formulations, and steam therapy" },
  Musculoskeletal: { system: "Panchakarma Therapy", description: "Abhyanga massage, Kati Basti, Janu Basti, and therapeutic yoga" },
  Skin: { system: "Ayurveda & Homeopathy", description: "Blood purification (Raktashodhana), constitutional homeopathic remedies" },
  "Mental Health": { system: "Yoga & Counseling", description: "Meditation, Pranayama, Shirodhara therapy, and mindfulness counseling" },
  "Women's Health": { system: "Ayurveda", description: "Hormonal balance through Shatavari, Ashoka, and Panchakarma therapies" },
  General: { system: "Ayurveda", description: "Prakriti-based constitutional assessment and Rasayana (rejuvenation) therapy" },
  Pain: { system: "Panchakarma & Acupuncture", description: "Targeted Panchakarma with acupuncture for pain relief and inflammation reduction" },
  Fever: { system: "Ayurveda", description: "Jwara Chikitsa protocol with antipyretic herbs and supportive care" },
  Other: { system: "Integrative AYUSH", description: "Holistic assessment to determine the most suitable AYUSH approach" },
};

const categories: Category[] = [
  "Digestive", "Respiratory", "Musculoskeletal", "Skin",
  "Mental Health", "Women's Health", "General", "Pain", "Fever", "Other",
];

const durations: { value: Duration; label: string }[] = [
  { value: "just_started", label: "Just started (today)" },
  { value: "1_3_days", label: "1-3 days" },
  { value: "1_2_weeks", label: "1-2 weeks" },
  { value: "more_2_weeks", label: "More than 2 weeks" },
  { value: "chronic", label: "Chronic (months/years)" },
];

const severities: { value: Severity; label: string; color: string }[] = [
  { value: "mild", label: "Mild", color: "bg-green-100 text-green-800" },
  { value: "moderate", label: "Moderate", color: "bg-yellow-100 text-yellow-800" },
  { value: "severe", label: "Severe", color: "bg-orange-100 text-orange-800" },
  { value: "emergency", label: "Emergency", color: "bg-red-100 text-red-800" },
];

export default function AITriageBot() {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<Category | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [duration, setDuration] = useState<Duration | null>(null);
  const [severity, setSeverity] = useState<Severity | null>(null);
  const [showResult, setShowResult] = useState(false);

  const hasRedFlags = category
    ? subSymptomsByCategory[category]
        .filter((s) => s.redFlag && selectedSymptoms.includes(s.id))
        .length > 0
    : false;

  const getRecommendation = () => {
    if (severity === "emergency" || hasRedFlags) {
      return {
        level: "Emergency",
        color: "bg-red-50 border-red-300",
        textColor: "text-red-800",
        message: "Please visit the nearest hospital immediately. Call 108 for ambulance.",
        icon: <Phone className="w-6 h-6 text-red-600" />,
      };
    }
    if (severity === "severe") {
      return {
        level: "Urgent",
        color: "bg-orange-50 border-orange-300",
        textColor: "text-orange-800",
        message: "We recommend booking an urgent consultation with a doctor.",
        icon: <AlertCircle className="w-6 h-6 text-orange-600" />,
      };
    }
    if (severity === "moderate" && (duration === "more_2_weeks" || duration === "chronic")) {
      return {
        level: "Specialist",
        color: "bg-blue-50 border-blue-300",
        textColor: "text-blue-800",
        message: "Book an appointment with an AYUSH specialist for holistic treatment.",
        icon: <Brain className="w-6 h-6 text-blue-600" />,
      };
    }
    return {
      level: "Self-Care",
      color: "bg-green-50 border-green-300",
      textColor: "text-green-800",
      message: "Self-care recommended. Consider booking a wellness consultation for preventive guidance.",
      icon: <Brain className="w-6 h-6 text-green-600" />,
    };
  };

  const handleNext = () => {
    if (step === 1 && !category) {
      toast.error("Please select a symptom category");
      return;
    }
    if (step === 2 && selectedSymptoms.length === 0) {
      toast.error("Please select at least one symptom");
      return;
    }
    if (step === 3 && !duration) {
      toast.error("Please select duration");
      return;
    }
    if (step === 4 && !severity) {
      toast.error("Please select severity level");
      return;
    }
    if (step === 4) {
      setShowResult(true);
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const resetAll = () => {
    setStep(1);
    setCategory(null);
    setSelectedSymptoms([]);
    setDuration(null);
    setSeverity(null);
    setShowResult(false);
  };

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  if (showResult) {
    const rec = getRecommendation();
    const approach = category ? ayushApproach[category] : null;

    return (
      <div className="container mx-auto p-4 md:p-6 max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <Brain className="w-10 h-10 text-primary mx-auto" />
          <h1 className="text-2xl font-bold">Your Health Guide Recommendation</h1>
        </div>

        <Card className={`border-2 ${rec.color}`}>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              {rec.icon}
              <div>
                <Badge className={rec.textColor + " text-sm"}>{rec.level}</Badge>
                <p className="mt-2 font-medium">{rec.message}</p>
              </div>
            </div>

            {severity === "emergency" || hasRedFlags ? (
              <div className="bg-red-100 p-4 rounded-lg">
                <p className="font-bold text-red-800 flex items-center gap-2">
                  <Phone className="w-5 h-5" /> Emergency: Call 108
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {approach && severity !== "emergency" && !hasRedFlags && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recommended AYUSH Approach</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Badge variant="secondary" className="text-sm">
                {approach.system}
              </Badge>
              <p className="text-gray-700">{approach.description}</p>
              <p className="text-sm text-gray-500 mt-2">
                Category: {category} | Duration: {durations.find((d) => d.value === duration)?.label} | Severity: {severity}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3">
          <Button asChild className="flex-1">
            <a href="/doctors">Book Appointment</a>
          </Button>
          <Button variant="outline" onClick={resetAll} className="flex-1">
            <RotateCcw className="w-4 h-4 mr-2" />
            Start Over
          </Button>
        </div>

        <p className="text-xs text-gray-400 text-center">
          This is not a medical diagnosis. Always consult a qualified healthcare provider for proper evaluation and treatment.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-2xl space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Brain className="w-10 h-10 text-primary mx-auto" />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">AI Health Guide</h1>
        <p className="text-gray-600">Tell us your symptoms — we'll guide you to the right care</p>
        <p className="text-xs text-orange-600 bg-orange-50 inline-block px-3 py-1 rounded-full">
          This is not a diagnosis. Always consult a qualified doctor.
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              s === step
                ? "bg-primary text-white"
                : s < step
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {s}
          </div>
        ))}
      </div>

      {/* Step 1: Category */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>What area is bothering you?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    setSelectedSymptoms([]);
                  }}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    category === cat
                      ? "bg-primary text-white border-primary"
                      : "bg-white hover:bg-gray-50 border-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Sub-symptoms */}
      {step === 2 && category && (
        <Card>
          <CardHeader>
            <CardTitle>Select your symptoms ({category})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subSymptomsByCategory[category].map((symptom) => (
                <div key={symptom.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={symptom.id}
                    checked={selectedSymptoms.includes(symptom.id)}
                    onCheckedChange={() => toggleSymptom(symptom.id)}
                  />
                  <label
                    htmlFor={symptom.id}
                    className={`text-sm cursor-pointer ${
                      symptom.redFlag ? "text-red-700 font-medium" : "text-gray-700"
                    }`}
                  >
                    {symptom.label}
                    {symptom.redFlag && (
                      <span className="ml-2 text-xs text-red-500">(Red flag)</span>
                    )}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Duration */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>How long have you had these symptoms?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {durations.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDuration(d.value)}
                  className={`w-full p-3 rounded-lg border text-left text-sm font-medium transition-colors ${
                    duration === d.value
                      ? "bg-primary text-white border-primary"
                      : "bg-white hover:bg-gray-50 border-gray-200"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Severity */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>How would you rate the severity?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {severities.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSeverity(s.value)}
                  className={`w-full p-3 rounded-lg border text-left text-sm font-medium transition-colors ${
                    severity === s.value
                      ? "bg-primary text-white border-primary"
                      : "bg-white hover:bg-gray-50 border-gray-200"
                  }`}
                >
                  {s.label}
                  {s.value === "emergency" && (
                    <span className="block text-xs mt-1 opacity-80">
                      Unbearable pain, difficulty breathing, chest pain, loss of consciousness
                    </span>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 1}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleNext}>
          {step === 4 ? "Get Recommendation" : "Next"}
          {step < 4 && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
}
