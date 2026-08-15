import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Footprints, ArrowLeft, CheckCircle2, Clock, Brain,
  ChevronDown, ChevronUp, Timer, Eye, Activity,
} from "lucide-react";

const preparationSteps = [
  { step: 1, instruction: "Stand with feet hip-width apart. Close your eyes. Feel your spine stacked: sacrum → lumbar → thoracic → cervical → skull.", duration: 30 },
  { step: 2, instruction: "MENTAL REHEARSAL: Before walking, visualize yourself walking with perfect posture. See your spine tall, shoulders relaxed, head balanced. Watch this movie of yourself for 2 minutes.", duration: 120 },
  { step: 3, instruction: "Feel what it would feel like to walk with this perfect alignment. Generate the FEELING of confidence, grace, and freedom in your body NOW — before you take a step.", duration: 60 },
];

const mainSteps = [
  { step: 1, instruction: "Open your eyes softly (half-lidded gaze, looking 3 meters ahead on the ground). Begin walking VERY slowly.", duration: 30, note: "Speed: about 1 step per 3 seconds." },
  { step: 2, instruction: "HEEL STRIKE: Notice your heel touching the ground. Feel the shock absorption through your ankle, knee, hip, up to your spine.", duration: 60, note: "Awareness of ground reaction force and spinal response." },
  { step: 3, instruction: "MID-STANCE: Feel your weight transfer over the foot. Is your pelvis level? Is your lumbar curve maintained?", duration: 60 },
  { step: 4, instruction: "TOE-OFF: Push off with your toes. Feel the activation of your glutes and core. Your spine stays tall.", duration: 60 },
  { step: 5, instruction: "ARM SWING: Notice if your arms swing naturally. Opposite arm to opposite leg. Shoulders relaxed, not hiked.", duration: 60 },
  { step: 6, instruction: "HEAD POSITION: Is your head balanced over your spine? Chin slightly tucked? Not forward?", duration: 60 },
  { step: 7, instruction: "Continue walking for 10 minutes with this full awareness. If your mind wanders, gently bring it back to the FEELING of perfect alignment.", duration: 600, note: "Walk in a quiet space — a room, hallway, or garden path." },
  { step: 8, instruction: "For the last 2 minutes, gradually increase speed to normal walking pace while maintaining awareness.", duration: 120 },
];

const postSteps = [
  { step: 1, instruction: "Stop walking. Stand still. Close your eyes. Feel your spine in this new alignment.", duration: 30 },
  { step: 2, instruction: "Notice: Does standing tall feel more natural now? Has your habitual posture shifted?", duration: 30 },
  { step: 3, instruction: "Set intention: 'I will carry this awareness into my regular walking today.'", duration: 20 },
  { step: 4, instruction: "Record: Posture awareness level (1-10), any corrections noticed, gait quality.", duration: 60 },
];

export default function SpineDispenzaWalking() {
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
      toast.success("Mental rehearsal complete! Begin mindful walking...");
    } else if (currentPhase === "main") {
      setCurrentPhase("post"); setCurrentStep(0); setCompletedSteps([]);
      toast.success("Walking complete! Stand still and integrate...");
    } else {
      toast.success("Session done! Your motor cortex is rewiring for better posture.");
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
            <Footprints className="w-6 h-6 text-green-600" />
            Walking Meditation
          </h1>
          <p className="text-sm text-gray-600">Posture Rehearsal & Mindful Movement</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-green-100 text-green-700">20 min</Badge>
          <Badge className="bg-green-100 text-green-700">Beginner</Badge>
          <Badge className="bg-amber-100 text-amber-700">Morning</Badge>
        </div>
      </div>

      <Card className="border-green-200 bg-green-50/30">
        <CardContent className="p-4">
          <p className="text-sm text-gray-700">
            <strong>What:</strong> Mentally rehearse perfect spinal alignment, then walk slowly with full awareness of each spinal segment. Creates new neural pathways for correct posture.
          </p>
          <p className="text-sm text-gray-700 mt-2">
            <strong>Spine Benefit:</strong> Mental rehearsal activates the same motor cortex regions as physical movement. You're rewiring your brain for better posture. Pairs perfectly with corrective exercise modules for Upper/Lower Cross Syndrome.
          </p>
          <p className="text-sm text-gray-700 mt-2">
            <strong>Contraindications:</strong> Severe balance disorders (do seated version), acute lower limb injury, vertigo.
          </p>
        </CardContent>
      </Card>

      {/* Phase Indicator */}
      <div className="flex items-center gap-2">
        {["prep", "main", "post"].map((phase) => (
          <div key={phase} className={`flex-1 h-2 rounded-full ${
            currentPhase === phase ? "bg-green-500" :
            (phase === "prep" && currentPhase !== "prep") || (phase === "main" && currentPhase === "post") ? "bg-green-300" : "bg-gray-200"
          }`} />
        ))}
      </div>

      {/* Steps */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            {currentPhase === "prep" && <><Brain className="w-5 h-5 text-purple-500" /> Mental Rehearsal</>}
            {currentPhase === "main" && <><Footprints className="w-5 h-5 text-green-500" /> Mindful Walking</>}
            {currentPhase === "post" && <><CheckCircle2 className="w-5 h-5 text-green-500" /> Integration</>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {steps.map((s, idx) => (
            <div key={idx} className={`p-4 rounded-lg border transition-all ${
              idx === currentStep ? "border-green-400 bg-green-50 shadow-sm" :
              completedSteps.includes(idx) ? "border-green-200 bg-green-50/50" : "border-gray-200"
            }`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
                  completedSteps.includes(idx) ? "bg-green-500 text-white" :
                  idx === currentStep ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
                }`}>
                  {completedSteps.includes(idx) ? "✓" : s.step}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${idx === currentStep ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                    {s.instruction}
                  </p>
                  {"note" in s && s.note && (
                    <p className="text-xs text-green-600 mt-1 italic">💡 {s.note}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant="outline" className="text-[10px]">
                      <Timer className="w-2.5 h-2.5 mr-0.5" /> {s.duration}s
                    </Badge>
                    {idx === currentStep && (
                      <Button size="sm" className="h-6 text-xs bg-green-600 hover:bg-green-700" onClick={() => markComplete(idx)}>
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
            Science: Neuroplasticity & Gait Retraining
            {showScience ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
          </CardTitle>
        </CardHeader>
        {showScience && (
          <CardContent className="text-xs text-gray-600 space-y-2">
            <p><strong>Motor Cortex Activation:</strong> Imagining movement activates the same motor cortex neurons as performing it. Mental rehearsal creates real structural changes in the brain.</p>
            <p><strong>Slow Walking = Learning Mode:</strong> At slow speeds, movement becomes conscious (cortical) rather than automatic (subcortical). This allows you to overwrite faulty movement patterns.</p>
            <p><strong>Posture Automaticity:</strong> After 21+ days of mindful walking, the correct patterns become automatic. The brain builds new myelin sheaths around the "good posture" circuits.</p>
            <p><strong>Gait-Spine Connection:</strong> Every step creates forces through your spine. Correct gait = even force distribution. Faulty gait = excessive loading on specific segments (usually L4-L5, L5-S1).</p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
