import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Maximize, ArrowLeft, CheckCircle2, Clock, Brain,
  ChevronDown, ChevronUp, Timer, Eye, Waves,
} from "lucide-react";

const preparationSteps = [
  { step: 1, instruction: "Sit comfortably. Spine upright but relaxed. Hands on thighs, palms up.", duration: 30 },
  { step: 2, instruction: "Close eyes. Take 3 slow breaths. With each exhale, let go of tension.", duration: 45 },
  { step: 3, instruction: "Acknowledge any pain or discomfort in your spine without judgment. Just notice it.", duration: 30 },
];

const mainSteps = [
  { step: 1, instruction: "Become aware of the SPACE between your eyes. Not your eyes — the space between them. Can you sense that empty space?", duration: 30, note: "This shifts brain from object-focus to space-focus." },
  { step: 2, instruction: "Now sense the SPACE behind your eyes — the space your brain occupies inside your skull. Just notice the volume of space.", duration: 45 },
  { step: 3, instruction: "Expand awareness to the SPACE around your entire head. The space above, beside, behind your head.", duration: 45 },
  { step: 4, instruction: "Now sense the SPACE around your neck and cervical spine. The space that surrounds your vertebrae.", duration: 45 },
  { step: 5, instruction: "Expand to the SPACE around your entire torso — the space your thoracic spine occupies. The space around your ribs, lungs, heart.", duration: 60 },
  { step: 6, instruction: "Sense the SPACE around your lower back — the space your lumbar spine lives in. The space around your pelvis.", duration: 60 },
  { step: 7, instruction: "Now become aware of the ENTIRE SPACE your body occupies in the room. Your whole body floating in space.", duration: 60 },
  { step: 8, instruction: "Expand further — sense the space of the entire room. You are aware of the room without opening your eyes.", duration: 60 },
  { step: 9, instruction: "Expand to the space beyond the room — the building, the area, the city... keep expanding.", duration: 60 },
  { step: 10, instruction: "Now just REST in infinite space. You are no body, no thing, no where, in no time. Just awareness in space. Stay here for 10 minutes.", duration: 600, note: "This is where alpha/theta brain waves activate healing. Don't try to do anything." },
];

const postSteps = [
  { step: 1, instruction: "Slowly bring awareness back — from infinite space back to the room, back to your body.", duration: 45 },
  { step: 2, instruction: "Notice your spine now. Has the sensation of pain or tightness changed? Often it reduces or disappears.", duration: 30 },
  { step: 3, instruction: "Wiggle fingers, take a deep breath, open eyes.", duration: 20 },
  { step: 4, instruction: "Record: Pain before vs after. Any sensations of expansion or lightness.", duration: 60 },
];

export default function SpineDispenzaOpenFocus() {
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
      toast.success("Ready! Begin expanding into space...");
    } else if (currentPhase === "main") {
      setCurrentPhase("post"); setCurrentStep(0); setCompletedSteps([]);
      toast.success("Beautiful! Returning from infinite space...");
    } else {
      toast.success("Session complete! Notice how your pain has shifted.");
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
            <Maximize className="w-6 h-6 text-indigo-600" />
            Space-Time (Open Focus)
          </h1>
          <p className="text-sm text-gray-600">Dissolving Pain Through Expanded Awareness</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-indigo-100 text-indigo-700">20 min</Badge>
          <Badge className="bg-green-100 text-green-700">Beginner</Badge>
          <Badge className="bg-purple-100 text-purple-700">Anytime</Badge>
        </div>
      </div>

      {/* What This Does */}
      <Card className="border-indigo-200 bg-indigo-50/30">
        <CardContent className="p-4">
          <p className="text-sm text-gray-700">
            <strong>What:</strong> Shift your awareness from narrow pain-focus to the vast space around you. Your brain waves shift from high-beta (stress/pain) to alpha/theta (healing/regeneration).
          </p>
          <p className="text-sm text-gray-700 mt-2">
            <strong>Spine Benefit:</strong> Chronic spine pain creates narrow-focus brain patterns that amplify pain signals. Open Focus breaks this cycle, reducing pain perception by 40-60%. Also reduces muscle guarding and spasm.
          </p>
          <p className="text-sm text-gray-700 mt-2">
            <strong>Best For:</strong> Chronic pain patients, Vata-dominant constitution, anyone with anxiety-driven spine tension.
          </p>
        </CardContent>
      </Card>

      {/* Phase Indicator */}
      <div className="flex items-center gap-2">
        {["prep", "main", "post"].map((phase) => (
          <div key={phase} className={`flex-1 h-2 rounded-full ${
            currentPhase === phase ? "bg-indigo-500" :
            (phase === "prep" && currentPhase !== "prep") || (phase === "main" && currentPhase === "post") ? "bg-green-400" : "bg-gray-200"
          }`} />
        ))}
      </div>

      {/* Steps */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            {currentPhase === "prep" && <><Clock className="w-5 h-5 text-amber-500" /> Settle In</>}
            {currentPhase === "main" && <><Eye className="w-5 h-5 text-indigo-500" /> Expand Into Space</>}
            {currentPhase === "post" && <><CheckCircle2 className="w-5 h-5 text-green-500" /> Return</>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {steps.map((s, idx) => (
            <div key={idx} className={`p-4 rounded-lg border transition-all ${
              idx === currentStep ? "border-indigo-400 bg-indigo-50 shadow-sm" :
              completedSteps.includes(idx) ? "border-green-200 bg-green-50/50" : "border-gray-200"
            }`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
                  completedSteps.includes(idx) ? "bg-green-500 text-white" :
                  idx === currentStep ? "bg-indigo-500 text-white" : "bg-gray-200 text-gray-600"
                }`}>
                  {completedSteps.includes(idx) ? "✓" : s.step}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${idx === currentStep ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                    {s.instruction}
                  </p>
                  {"note" in s && s.note && (
                    <p className="text-xs text-indigo-600 mt-1 italic">💡 {s.note}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant="outline" className="text-[10px]">
                      <Timer className="w-2.5 h-2.5 mr-0.5" /> {s.duration}s
                    </Badge>
                    {idx === currentStep && (
                      <Button size="sm" className="h-6 text-xs bg-indigo-600 hover:bg-indigo-700" onClick={() => markComplete(idx)}>
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
            Science: Pain & Brain Waves
            {showScience ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
          </CardTitle>
        </CardHeader>
        {showScience && (
          <CardContent className="text-xs text-gray-600 space-y-2">
            <p><strong>High Beta = Pain Amplifier:</strong> When you focus narrowly on pain, your brain produces high-beta waves (20-30Hz) which actually increase pain signaling. It's a vicious cycle.</p>
            <p><strong>Alpha/Theta = Healing Mode:</strong> When you become aware of space (open focus), brain waves shift to alpha (8-12Hz) and theta (4-8Hz). These are the frequencies where the body repairs tissue, reduces inflammation, and regenerates.</p>
            <p><strong>Muscle Relaxation:</strong> Space-awareness deactivates the motor cortex that holds muscles in guarding patterns. Paraspinal muscles relax, reducing compression on spinal structures.</p>
            <p><strong>Central Sensitization Reset:</strong> Chronic pain "winds up" the spinal cord. Open focus meditation helps reset central sensitization by reducing descending facilitatory signals from the brain.</p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
