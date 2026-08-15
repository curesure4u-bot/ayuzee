import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Wind, ArrowLeft, Play, Pause, RotateCcw, CheckCircle2,
  AlertTriangle, Clock, Target, Zap, Brain, Activity,
  ChevronDown, ChevronUp, Timer,
} from "lucide-react";

const preparationSteps = [
  { step: 1, instruction: "Find a quiet space. Sit upright on a chair with feet flat on the floor, or cross-legged on a cushion.", duration: 60 },
  { step: 2, instruction: "Close your eyes. Place your attention on your body sitting in space.", duration: 30 },
  { step: 3, instruction: "Take 3 slow, deep breaths to settle. Exhale completely each time.", duration: 45 },
  { step: 4, instruction: "Set your intention: 'I am pulling my mind out of my body to heal my spine.'", duration: 20 },
];

const mainSteps = [
  { step: 1, instruction: "Squeeze your perineum (root lock / Mula Bandha) and contract your lower abdomen inward.", duration: 5, note: "This locks the energy at the base of your spine." },
  { step: 2, instruction: "While holding the squeeze, take a sharp breath IN through the nose — pull the breath up your spine like pulling energy through a straw.", duration: 4, note: "Imagine energy rising from sacrum → lumbar → thoracic → cervical → brain." },
  { step: 3, instruction: "Hold the breath at the top of your head. Squeeze all internal muscles upward. Hold for 5-10 seconds.", duration: 10, note: "This creates pressure that pushes cerebrospinal fluid up to the pineal gland." },
  { step: 4, instruction: "Release and exhale slowly through the mouth. Relax all muscles completely.", duration: 8, note: "Feel the tingling or warmth along your spine." },
  { step: 5, instruction: "Rest for one normal breath cycle.", duration: 6 },
  { step: 6, instruction: "Repeat this cycle 7-8 times. Each time, squeeze harder and pull the breath higher.", duration: 240, note: "Total: about 4 minutes of active breathing." },
  { step: 7, instruction: "After the last breath, sit still with eyes closed. Place attention on the space around your body. Stay in this open awareness for 10-15 minutes.", duration: 900, note: "This is where healing happens — the body reorganizes itself." },
];

const postSteps = [
  { step: 1, instruction: "Slowly bring awareness back to your body. Feel your spine from tailbone to skull.", duration: 30 },
  { step: 2, instruction: "Wiggle fingers and toes. Open your eyes gently.", duration: 20 },
  { step: 3, instruction: "Note any sensations in your spine — tingling, warmth, lightness, or energy movement.", duration: 30 },
  { step: 4, instruction: "Log your session: pain level before/after, energy sensations, depth of meditation.", duration: 60 },
];

export default function SpineDispenzaBreathwork() {
  const navigate = useNavigate();
  const [currentPhase, setCurrentPhase] = useState<"prep" | "main" | "post">("prep");
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
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
      setCurrentPhase("main");
      setCurrentStep(0);
      setCompletedSteps([]);
      toast.success("Preparation complete! Starting main breath practice...");
    } else if (currentPhase === "main") {
      setCurrentPhase("post");
      setCurrentStep(0);
      setCompletedSteps([]);
      toast.success("Main practice complete! Moving to integration...");
    } else {
      toast.success("Session complete! Well done. Your spine thanks you.");
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
            <Wind className="w-6 h-6 text-blue-600" />
            Breath Work (Spinal Energy)
          </h1>
          <p className="text-sm text-gray-600">Pulling the Mind Out of the Body</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-blue-100 text-blue-700">25 min</Badge>
          <Badge className="bg-amber-100 text-amber-700">Intermediate</Badge>
          <Badge className="bg-green-100 text-green-700">Morning</Badge>
        </div>
      </div>

      {/* What This Does */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="p-4">
          <p className="text-sm text-gray-700">
            <strong>What:</strong> A powerful rhythmic breathing technique that pulls energy from the lower energy centers up through the spine to the brain.
          </p>
          <p className="text-sm text-gray-700 mt-2">
            <strong>Spine Benefit:</strong> Activates cerebrospinal fluid flow, stimulates the pineal gland, and creates a piezoelectric effect on the spinal column. Directly increases blood flow and neural conductivity along the vertebral column.
          </p>
          <p className="text-sm text-gray-700 mt-2">
            <strong>Targets:</strong> Sacral → Lumbar → Thoracic → Cervical (Full spine ascent)
          </p>
        </CardContent>
      </Card>

      {/* Contraindications */}
      <Card className="border-red-200 bg-red-50/30">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="font-semibold text-sm text-red-700">Contraindications (Do NOT practice if):</span>
          </div>
          <ul className="text-xs text-red-600 space-y-1 ml-6 list-disc">
            <li>Uncontrolled high blood pressure</li>
            <li>Recent spinal surgery (within 6 weeks)</li>
            <li>Epilepsy</li>
            <li>Pregnancy (first trimester)</li>
          </ul>
        </CardContent>
      </Card>

      {/* Phase Indicator */}
      <div className="flex items-center gap-2">
        {["prep", "main", "post"].map((phase) => (
          <div
            key={phase}
            className={`flex-1 h-2 rounded-full ${
              currentPhase === phase ? "bg-blue-500" :
              (phase === "prep" && currentPhase !== "prep") ? "bg-green-400" : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span className={currentPhase === "prep" ? "font-bold text-blue-600" : ""}>Preparation</span>
        <span className={currentPhase === "main" ? "font-bold text-blue-600" : ""}>Main Practice</span>
        <span className={currentPhase === "post" ? "font-bold text-blue-600" : ""}>Integration</span>
      </div>

      {/* Step-by-Step Instructions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            {currentPhase === "prep" && <><Clock className="w-5 h-5 text-amber-500" /> Preparation</>}
            {currentPhase === "main" && <><Zap className="w-5 h-5 text-blue-500" /> Main Breath Practice</>}
            {currentPhase === "post" && <><CheckCircle2 className="w-5 h-5 text-green-500" /> Post-Meditation Integration</>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border transition-all ${
                idx === currentStep ? "border-blue-400 bg-blue-50 shadow-sm" :
                completedSteps.includes(idx) ? "border-green-200 bg-green-50/50" : "border-gray-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
                  completedSteps.includes(idx) ? "bg-green-500 text-white" :
                  idx === currentStep ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
                }`}>
                  {completedSteps.includes(idx) ? "✓" : s.step}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${idx === currentStep ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                    {s.instruction}
                  </p>
                  {"note" in s && s.note && (
                    <p className="text-xs text-blue-600 mt-1 italic">💡 {s.note}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant="outline" className="text-[10px]">
                      <Timer className="w-2.5 h-2.5 mr-0.5" /> {s.duration}s
                    </Badge>
                    {idx === currentStep && (
                      <Button size="sm" variant="default" className="h-6 text-xs" onClick={() => markComplete(idx)}>
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

      {/* Science Behind It */}
      <Card className="border-purple-200">
        <CardHeader className="pb-2 cursor-pointer" onClick={() => setShowScience(!showScience)}>
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-500" />
            Science: Why This Heals Your Spine
            {showScience ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
          </CardTitle>
        </CardHeader>
        {showScience && (
          <CardContent className="text-xs text-gray-600 space-y-2">
            <p><strong>CSF Hydraulic Pump:</strong> The squeeze-and-breathe creates a hydraulic pump that moves cerebrospinal fluid (CSF) along the spinal canal. CSF nourishes intervertebral discs which have no direct blood supply.</p>
            <p><strong>Piezoelectric Effect:</strong> The spinal column contains calcium crystals. Compression and release creates tiny electrical charges that stimulate nerve regeneration and bone healing.</p>
            <p><strong>Core Activation:</strong> The perineum lock (Mula Bandha) and abdominal contraction activate the transverse abdominis and pelvic floor — the deep core stabilizers that protect the spine.</p>
            <p><strong>Autonomic Reset:</strong> The breath-hold at the top shifts the autonomic nervous system from sympathetic (fight/flight/pain) to parasympathetic (rest/repair/heal).</p>
          </CardContent>
        )}
      </Card>

      {/* Quick Reference */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <h4 className="font-semibold text-sm mb-2">Quick Reference (Once You Know the Steps)</h4>
          <ol className="text-xs text-gray-600 space-y-1 list-decimal ml-4">
            <li>Sit. Close eyes. 3 settling breaths.</li>
            <li>Squeeze root lock + contract belly inward.</li>
            <li>Sharp inhale through nose — pull up spine.</li>
            <li>Hold at crown. Squeeze up. 5-10 seconds.</li>
            <li>Exhale slowly. Relax completely.</li>
            <li>Repeat 7-8 times.</li>
            <li>Sit in open awareness 10-15 min.</li>
            <li>Return. Log session.</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
