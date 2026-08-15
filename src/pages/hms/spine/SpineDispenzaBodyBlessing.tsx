import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Heart, ArrowLeft, CheckCircle2, Clock, Target, Brain,
  ChevronDown, ChevronUp, Timer, Sparkles, Activity,
} from "lucide-react";

const preparationSteps = [
  { step: 1, instruction: "Lie down comfortably on your back (Shavasana) or sit upright. Spine should be neutral.", duration: 30 },
  { step: 2, instruction: "Close your eyes. Take 5 deep breaths — inhale for 4 counts, exhale for 6 counts.", duration: 60 },
  { step: 3, instruction: "Feel gratitude for your body. Thank it for carrying you through life.", duration: 30 },
  { step: 4, instruction: "Set intention: 'I am sending healing energy to every part of my spine.'", duration: 20 },
];

const mainSteps = [
  { step: 1, instruction: "Place your attention on the TOP of your head (crown). Bless this area. Say internally: 'Thank you for my brain, my thoughts, my awareness.' Feel love and gratitude here for 60 seconds.", duration: 60, bodyPart: "Crown", emoji: "👑" },
  { step: 2, instruction: "Move attention to your CERVICAL SPINE (neck — C1 to C7). Bless each vertebra. Say: 'Thank you for supporting my head, for allowing me to turn and look at life.' Send warmth here.", duration: 90, bodyPart: "Cervical Spine (C1-C7)", emoji: "🦒" },
  { step: 3, instruction: "Move to your THORACIC SPINE (upper & mid back — T1 to T12). Bless this area. Say: 'Thank you for protecting my heart and lungs, for giving me the strength to stand tall.'", duration: 90, bodyPart: "Thoracic Spine (T1-T12)", emoji: "🫁" },
  { step: 4, instruction: "Move to your LUMBAR SPINE (lower back — L1 to L5). Bless this area. Say: 'Thank you for bearing my weight, for allowing me to bend and move freely. I send you healing energy.'", duration: 90, bodyPart: "Lumbar Spine (L1-L5)", emoji: "💪" },
  { step: 5, instruction: "Move to your SACRUM and COCCYX. Bless this foundation. Say: 'Thank you for being my root, my stability, my connection to earth.'", duration: 60, bodyPart: "Sacrum & Coccyx", emoji: "🌳" },
  { step: 6, instruction: "Now bless your ENTIRE SPINE as one unit. Visualize golden healing light flowing from sacrum to skull, filling every disc, every nerve, every muscle.", duration: 120, bodyPart: "Full Spine (Golden Light)", emoji: "✨" },
  { step: 7, instruction: "Bless your HANDS and ARMS (the healers). Bless your HEART (the source of love). Bless your LEGS (your foundation).", duration: 120, bodyPart: "Extremities", emoji: "🙌" },
  { step: 8, instruction: "Now bless the SPACE around your body — the energy field. Expand your awareness outward. Feel yourself bigger than your body.", duration: 180, bodyPart: "Energy Field", emoji: "🌟" },
  { step: 9, instruction: "Rest in this expanded feeling of gratitude and wholeness for 5 minutes. No effort. Just be.", duration: 300, bodyPart: "Integration", emoji: "🕊️" },
];

const postSteps = [
  { step: 1, instruction: "Slowly bring attention back to your physical body. Feel the surface beneath you.", duration: 30 },
  { step: 2, instruction: "Move fingers, toes, gently rock head side to side.", duration: 20 },
  { step: 3, instruction: "Notice: Has the quality of sensation in your spine changed? More warmth? Less tension?", duration: 30 },
  { step: 4, instruction: "Open eyes. Sit up slowly. Drink water. Record your experience.", duration: 60 },
];

export default function SpineDispenzaBodyBlessing() {
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
      toast.success("Preparation complete! Begin blessing your spine...");
    } else if (currentPhase === "main") {
      setCurrentPhase("post"); setCurrentStep(0); setCompletedSteps([]);
      toast.success("Blessing complete! Time for gentle return...");
    } else {
      toast.success("Beautiful session! Your spine received deep healing attention.");
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/hms/spine-dispenza")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="w-6 h-6 text-pink-600" />
            Body Part Blessing
          </h1>
          <p className="text-sm text-gray-600">Healing Attention on Spinal Segments</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-pink-100 text-pink-700">30 min</Badge>
          <Badge className="bg-green-100 text-green-700">Beginner</Badge>
          <Badge className="bg-purple-100 text-purple-700">AM & PM</Badge>
        </div>
      </div>

      {/* What This Does */}
      <Card className="border-pink-200 bg-pink-50/30">
        <CardContent className="p-4">
          <p className="text-sm text-gray-700">
            <strong>What:</strong> Place focused loving attention on each part of your body — specifically your spinal segments. Where you place attention, energy flows and healing happens.
          </p>
          <p className="text-sm text-gray-700 mt-2">
            <strong>Spine Benefit:</strong> The autonomic nervous system responds to focused attention by increasing blood flow and reducing inflammation in the attended area. Perfect post-Panchakarma or post-adjustment meditation.
          </p>
          <p className="text-sm text-gray-700 mt-2">
            <strong>Best For:</strong> All dosha types (Tridosha). Especially good for patients with multi-level spine involvement.
          </p>
        </CardContent>
      </Card>

      {/* Phase Indicator */}
      <div className="flex items-center gap-2">
        {["prep", "main", "post"].map((phase) => (
          <div key={phase} className={`flex-1 h-2 rounded-full ${
            currentPhase === phase ? "bg-pink-500" :
            (phase === "prep" && currentPhase !== "prep") || (phase === "main" && currentPhase === "post") ? "bg-green-400" : "bg-gray-200"
          }`} />
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span className={currentPhase === "prep" ? "font-bold text-pink-600" : ""}>Preparation</span>
        <span className={currentPhase === "main" ? "font-bold text-pink-600" : ""}>Body Blessing</span>
        <span className={currentPhase === "post" ? "font-bold text-pink-600" : ""}>Return</span>
      </div>

      {/* Step-by-Step */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            {currentPhase === "prep" && <><Clock className="w-5 h-5 text-amber-500" /> Preparation</>}
            {currentPhase === "main" && <><Heart className="w-5 h-5 text-pink-500" /> Blessing Each Part</>}
            {currentPhase === "post" && <><CheckCircle2 className="w-5 h-5 text-green-500" /> Gentle Return</>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {steps.map((s, idx) => (
            <div key={idx} className={`p-4 rounded-lg border transition-all ${
              idx === currentStep ? "border-pink-400 bg-pink-50 shadow-sm" :
              completedSteps.includes(idx) ? "border-green-200 bg-green-50/50" : "border-gray-200"
            }`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
                  completedSteps.includes(idx) ? "bg-green-500 text-white" :
                  idx === currentStep ? "bg-pink-500 text-white" : "bg-gray-200 text-gray-600"
                }`}>
                  {completedSteps.includes(idx) ? "✓" : "bodyPart" in s ? (s as any).emoji || s.step : s.step}
                </div>
                <div className="flex-1">
                  {"bodyPart" in s && (
                    <Badge variant="outline" className="mb-1 text-[10px] bg-pink-50 text-pink-700 border-pink-200">
                      {(s as any).bodyPart}
                    </Badge>
                  )}
                  <p className={`text-sm ${idx === currentStep ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                    {s.instruction}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant="outline" className="text-[10px]">
                      <Timer className="w-2.5 h-2.5 mr-0.5" /> {s.duration}s
                    </Badge>
                    {idx === currentStep && (
                      <Button size="sm" variant="default" className="h-6 text-xs bg-pink-600 hover:bg-pink-700" onClick={() => markComplete(idx)}>
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
            Science: Why Blessing Heals
            {showScience ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
          </CardTitle>
        </CardHeader>
        {showScience && (
          <CardContent className="text-xs text-gray-600 space-y-2">
            <p><strong>Attention = Energy:</strong> Focused attention increases local blood flow by up to 25%. When you "bless" a body part, you're directing more oxygen and nutrients there.</p>
            <p><strong>Autonomic Shift:</strong> Gratitude and love activate the parasympathetic nervous system (rest & repair mode). This reduces muscle guarding and allows spinal structures to relax.</p>
            <p><strong>Gene Expression:</strong> Heart-coherent emotions (gratitude, love) have been shown to upregulate genes for healing and downregulate genes for inflammation within minutes.</p>
            <p><strong>Placebo Neuroscience:</strong> When you expect healing in a specific area, the brain releases endorphins and anti-inflammatory chemicals targeted to that area. This is not "just placebo" — it's measurable biology.</p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
