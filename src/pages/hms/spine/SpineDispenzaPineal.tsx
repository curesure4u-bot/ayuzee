import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Sparkles, ArrowLeft, CheckCircle2, Clock, Brain, AlertTriangle,
  ChevronDown, ChevronUp, Timer, Eye, Moon,
} from "lucide-react";

const preparationSteps = [
  { step: 1, instruction: "Sit upright in complete darkness or use a sleep mask. The pineal gland responds to absence of light.", duration: 30 },
  { step: 2, instruction: "Close eyes. Rest tongue on the roof of your mouth (Khechari Mudra position).", duration: 15 },
  { step: 3, instruction: "Take 5 slow breaths. With each exhale, release all tension. Let your body become very still.", duration: 75 },
  { step: 4, instruction: "Set intention: 'I am activating my pineal gland to release healing chemistry into my body.'", duration: 20 },
];

const mainSteps = [
  { step: 1, instruction: "Perform 3 rounds of the Spinal Breath (Tool 1): Squeeze perineum, inhale sharply pulling energy up spine, hold at crown, release. 3 rounds.", duration: 120, note: "This primes the cerebrospinal fluid to reach the pineal." },
  { step: 2, instruction: "After the 3rd breath, keep your attention locked on the space BEHIND your forehead — the center of your brain. Converge your closed eyes slightly upward toward this point.", duration: 30, note: "This is the location of the pineal gland / Ajna chakra." },
  { step: 3, instruction: "With eyes still closed and looking up-and-inward, perform slow rhythmic breathing: Inhale 4 counts, hold 4 counts, exhale 4 counts. Keep attention on the pineal point.", duration: 240, note: "You may start seeing colors — purple, indigo, gold, white. This is normal." },
  { step: 4, instruction: "If you see patterns, colors, or a kaleidoscope effect — follow it. Don't analyze. Just observe. This is your pineal gland producing neurochemistry.", duration: 300, note: "These visuals indicate activation. Stay relaxed and observant." },
  { step: 5, instruction: "Now let go of any technique. Surrender completely. Let whatever is happening in your inner space unfold. Stay in this state for 15 minutes.", duration: 900, note: "Deep healing state. Anti-inflammatory neurochemicals are flooding your body." },
  { step: 6, instruction: "If at any point you feel overwhelming bliss, warmth spreading through your body, or your spine tingling — this is the healing response. Stay with it.", duration: 120, note: "The neurochemicals produced are natural anti-inflammatories and tissue regenerators." },
];

const postSteps = [
  { step: 1, instruction: "Very slowly bring awareness back. Do NOT rush. You may feel deeply relaxed or altered.", duration: 60 },
  { step: 2, instruction: "Feel your spine. Notice any warmth, tingling, or pulsing along the vertebral column.", duration: 30 },
  { step: 3, instruction: "Gently open eyes. Stay seated for 2 minutes before standing.", duration: 120 },
  { step: 4, instruction: "Drink water. Record: Colors seen, body sensations, depth of experience, spine changes.", duration: 60 },
];

export default function SpineDispenzaPineal() {
  const navigate = useNavigate();
  const [currentPhase, setCurrentPhase] = useState<"prep" | "main" | "post">("prep");
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showScience, setShowScience] = useState(false);

  const steps = currentPhase === "prep" ? preparationSteps : currentPhase === "main" ? mainSteps : postSteps;

  const markComplete = (stepIdx: number) => {
    if (!completedSteps.includes(stepIdx)) {
      setCompletedSteps([...completedSteps, stepIdx]);
    }
    if (stepIdx < steps.length - 1) {
      setCurrentStep(stepIdx + 1);
    } else if (currentPhase === "prep") {
      setCurrentPhase("main"); setCurrentStep(0); setCompletedSteps([]);
      toast.success("Darkness set. Begin pineal activation...");
    } else if (currentPhase === "main") {
      setCurrentPhase("post"); setCurrentStep(0); setCompletedSteps([]);
      toast.success("Deep session! Slowly returning...");
    } else {
      toast.success("Profound session complete. Healing neurochemicals are active for hours.");
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/hms/spine-dispenza")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Pineal Gland Activation
          </h1>
          <p className="text-sm text-gray-600">Kaleidoscope & Inner Vision</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-purple-100 text-purple-700">35 min</Badge>
          <Badge className="bg-red-100 text-red-700">Advanced</Badge>
          <Badge className="bg-indigo-100 text-indigo-700">Evening</Badge>
          <Badge className="bg-amber-100 text-amber-700">Premium</Badge>
        </div>
      </div>

      {/* Warning for Advanced */}
      <Card className="border-red-200 bg-red-50/30">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="font-semibold text-sm text-red-700">Advanced Technique — Contraindications:</span>
          </div>
          <ul className="text-xs text-red-600 space-y-1 ml-6 list-disc">
            <li>Epilepsy</li>
            <li>Bipolar disorder (manic phase)</li>
            <li>Recent head trauma</li>
            <li>Psychotic disorders</li>
            <li>Under 16 years old</li>
          </ul>
          <p className="text-xs text-red-600 mt-2 font-medium">
            Prerequisites: Complete at least 2 weeks of daily Breathwork (Tool 1) before attempting this meditation.
          </p>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4">
          <p className="text-sm text-gray-700">
            <strong>What:</strong> Push energy to the pineal gland using breath, then focus attention on the center of the brain. The pineal releases melatonin metabolites and other neurochemicals that are powerful anti-inflammatory agents.
          </p>
          <p className="text-sm text-gray-700 mt-2">
            <strong>Spine Benefit:</strong> The neurochemicals released reduce spinal inflammation, promote disc hydration, and support nerve regeneration. The CSF pump mechanism directly nourishes cervical and cranio-cervical structures.
          </p>
        </CardContent>
      </Card>

      {/* Phase Indicator */}
      <div className="flex items-center gap-2">
        {["prep", "main", "post"].map((phase) => (
          <div key={phase} className={`flex-1 h-2 rounded-full ${
            currentPhase === phase ? "bg-purple-500" :
            (phase === "prep" && currentPhase !== "prep") || (phase === "main" && currentPhase === "post") ? "bg-green-400" : "bg-gray-200"
          }`} />
        ))}
      </div>

      {/* Steps */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            {currentPhase === "prep" && <><Moon className="w-5 h-5 text-indigo-500" /> Preparation (Darkness)</>}
            {currentPhase === "main" && <><Sparkles className="w-5 h-5 text-purple-500" /> Pineal Activation</>}
            {currentPhase === "post" && <><CheckCircle2 className="w-5 h-5 text-green-500" /> Gentle Return</>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {steps.map((s, idx) => (
            <div key={idx} className={`p-4 rounded-lg border transition-all ${
              idx === currentStep ? "border-purple-400 bg-purple-50 shadow-sm" :
              completedSteps.includes(idx) ? "border-green-200 bg-green-50/50" : "border-gray-200"
            }`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
                  completedSteps.includes(idx) ? "bg-green-500 text-white" :
                  idx === currentStep ? "bg-purple-500 text-white" : "bg-gray-200 text-gray-600"
                }`}>
                  {completedSteps.includes(idx) ? "✓" : s.step}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${idx === currentStep ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                    {s.instruction}
                  </p>
                  {"note" in s && s.note && (
                    <p className="text-xs text-purple-600 mt-1 italic">💡 {s.note}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant="outline" className="text-[10px]">
                      <Timer className="w-2.5 h-2.5 mr-0.5" /> {s.duration}s
                    </Badge>
                    {idx === currentStep && (
                      <Button size="sm" className="h-6 text-xs bg-purple-600 hover:bg-purple-700" onClick={() => markComplete(idx)}>
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Done — Next
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Science */}
      <Card className="border-purple-200">
        <CardHeader className="pb-2 cursor-pointer" onClick={() => setShowScience(!showScience)}>
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-500" />
            Science: Pineal Gland & Healing Chemistry
            {showScience ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
          </CardTitle>
        </CardHeader>
        {showScience && (
          <CardContent className="text-xs text-gray-600 space-y-2">
            <p><strong>Melatonin Metabolites:</strong> When activated, the pineal produces not just melatonin but powerful metabolites that are 5× more antioxidant than melatonin itself. These reduce oxidative stress in degenerating spinal discs.</p>
            <p><strong>Piezoelectric Crystals:</strong> The pineal contains calcite microcrystals that are piezoelectric — they convert mechanical pressure (from CSF) into electrical signals, creating measurable electromagnetic fields.</p>
            <p><strong>DMT-like Compounds:</strong> Under specific conditions, the pineal may produce trace amounts of DMT-like compounds that create profound healing states, visual phenomena, and tissue regeneration signals.</p>
            <p><strong>Anti-inflammatory Cascade:</strong> The neurochemical cocktail released suppresses TNF-alpha, IL-6, and other inflammatory markers that are elevated in chronic spinal conditions.</p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
