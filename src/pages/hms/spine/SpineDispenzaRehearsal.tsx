import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Brain, ArrowLeft, CheckCircle2, Clock, Eye, Sparkles,
  ChevronDown, ChevronUp, Timer, Star, Play, Target,
} from "lucide-react";

const preparationSteps = [
  { step: 1, instruction: "Sit or lie comfortably. Close eyes. Do 2 minutes of slow breathing to calm the mind.", duration: 120 },
  { step: 2, instruction: "Recall your current condition: What does your spine feel like now? What can't you do? Acknowledge it without judgment.", duration: 30 },
  { step: 3, instruction: "Now DECIDE: 'I am going to create a new experience for my body. My future self is already healed.'", duration: 20 },
  { step: 4, instruction: "Generate the EMOTION of already being healed — relief, joy, freedom, gratitude. Feel it NOW, before the visualization.", duration: 60 },
];

const mainSteps = [
  { step: 1, instruction: "SEE your future self waking up in the morning. Your spine feels light, strong, pain-free. You stretch with ease — reaching, twisting, bending. Visualize this in vivid detail.", duration: 120, scene: "Morning Wakeup" },
  { step: 2, instruction: "SEE yourself standing in front of a mirror. Your posture is tall, balanced, confident. Shoulders back, head centered. You LOOK healthy. Feel pride and gratitude.", duration: 90, scene: "Mirror — Perfect Posture" },
  { step: 3, instruction: "SEE yourself MOVING through your day — walking, sitting at work, playing with family, exercising. Your spine supports every movement flawlessly. No guarding. No fear.", duration: 120, scene: "Daily Life — Free Movement" },
  { step: 4, instruction: "SEE yourself doing something you CAN'T do now because of your spine. Lifting your child. Playing sports. Dancing. Traveling. Make it specific and personal.", duration: 120, scene: "Your Specific Achievement" },
  { step: 5, instruction: "SEE your doctor's face as they review your scan — they say: 'Remarkable improvement. Your discs look healthier. Your alignment is excellent.' Feel the joy.", duration: 90, scene: "Medical Confirmation" },
  { step: 6, instruction: "Now BECOME this future self. Step INTO the movie. You ARE this person now. Feel the freedom in your spine. The strength. The gratitude. EMBODY it fully.", duration: 180, scene: "Embodiment — You ARE Healed" },
  { step: 7, instruction: "Stay in this embodied state for 5-10 minutes. Let your body memorize this feeling. This is your new normal.", duration: 600, scene: "Integration — New Normal" },
];

const postSteps = [
  { step: 1, instruction: "Slowly return to present moment. Keep the FEELING of your future self alive in your body.", duration: 30 },
  { step: 2, instruction: "Tell yourself: 'This is who I am becoming. Every cell in my body is moving toward this reality.'", duration: 20 },
  { step: 3, instruction: "Open eyes. Move with the posture and confidence of your future self TODAY.", duration: 20 },
  { step: 4, instruction: "Record: What did you visualize? How vivid was it (1-10)? What emotion was strongest? Spine sensation?", duration: 60 },
];

export default function SpineDispenzaRehearsal() {
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
      toast.success("Emotion generated! Now SEE your future healed self...");
    } else if (currentPhase === "main") {
      setCurrentPhase("post"); setCurrentStep(0); setCompletedSteps([]);
      toast.success("Powerful rehearsal! You ARE your future self now.");
    } else {
      toast.success("Complete! Walk through today AS your healed future self.");
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
            <Brain className="w-6 h-6 text-violet-600" />
            Mental Rehearsal (Future Self)
          </h1>
          <p className="text-sm text-gray-600">Visualize Your Healed Spine & New Life</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-violet-100 text-violet-700">25 min</Badge>
          <Badge className="bg-amber-100 text-amber-700">Intermediate</Badge>
          <Badge className="bg-green-100 text-green-700">Morning</Badge>
        </div>
      </div>

      {/* What This Does */}
      <Card className="border-violet-200 bg-violet-50/30">
        <CardContent className="p-4">
          <p className="text-sm text-gray-700">
            <strong>What:</strong> The most powerful neuroplasticity tool. Vividly imagine being your healed future self — moving freely, standing tall, living without pain. Your brain cannot distinguish between vivid imagination and reality.
          </p>
          <p className="text-sm text-gray-700 mt-2">
            <strong>Spine Benefit:</strong> Motor cortex activation during visualization is identical to physical practice. Patients who visualize daily show measurably faster progress in corrective exercise programs. The emotional component downregulates pain pathways.
          </p>
          <p className="text-sm text-gray-700 mt-2">
            <strong>Key Principle:</strong> FEELING is more important than seeing. You must generate the emotion of being healed BEFORE you visualize. Emotion is the language that signals genes.
          </p>
        </CardContent>
      </Card>

      {/* Phase Indicator */}
      <div className="flex items-center gap-2">
        {["prep", "main", "post"].map((phase) => (
          <div key={phase} className={`flex-1 h-2 rounded-full ${
            currentPhase === phase ? "bg-violet-500" :
            (phase === "prep" && currentPhase !== "prep") || (phase === "main" && currentPhase === "post") ? "bg-green-400" : "bg-gray-200"
          }`} />
        ))}
      </div>

      {/* Steps */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            {currentPhase === "prep" && <><Clock className="w-5 h-5 text-amber-500" /> Generate the Feeling First</>}
            {currentPhase === "main" && <><Eye className="w-5 h-5 text-violet-500" /> Visualize Your Healed Self</>}
            {currentPhase === "post" && <><CheckCircle2 className="w-5 h-5 text-green-500" /> Embody It Today</>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {steps.map((s, idx) => (
            <div key={idx} className={`p-4 rounded-lg border transition-all ${
              idx === currentStep ? "border-violet-400 bg-violet-50 shadow-sm" :
              completedSteps.includes(idx) ? "border-green-200 bg-green-50/50" : "border-gray-200"
            }`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
                  completedSteps.includes(idx) ? "bg-green-500 text-white" :
                  idx === currentStep ? "bg-violet-500 text-white" : "bg-gray-200 text-gray-600"
                }`}>
                  {completedSteps.includes(idx) ? "✓" : s.step}
                </div>
                <div className="flex-1">
                  {"scene" in s && (
                    <Badge variant="outline" className="mb-1 text-[10px] bg-violet-50 text-violet-700 border-violet-200">
                      🎬 Scene: {(s as any).scene}
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
                      <Button size="sm" className="h-6 text-xs bg-violet-600 hover:bg-violet-700" onClick={() => markComplete(idx)}>
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

      {/* Tips */}
      <Card className="border-amber-200 bg-amber-50/30">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            Tips for Vivid Visualization
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-gray-600 space-y-1">
          <p>• Use ALL senses: see, hear, feel, smell, taste your healed life</p>
          <p>• Make it personal — YOUR specific activities, YOUR specific places</p>
          <p>• The more emotional you get, the more powerful the rewiring</p>
          <p>• If you cry tears of joy or gratitude — that's perfect, keep going</p>
          <p>• Practice at the same time daily for maximum neuroplasticity</p>
          <p>• After the session, ACT as if — walk, stand, move as your future self would</p>
        </CardContent>
      </Card>

      {/* Science */}
      <Card className="border-purple-200">
        <CardHeader className="pb-2 cursor-pointer" onClick={() => setShowScience(!showScience)}>
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-500" />
            Science: Mental Rehearsal & Motor Cortex
            {showScience ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
          </CardTitle>
        </CardHeader>
        {showScience && (
          <CardContent className="text-xs text-gray-600 space-y-2">
            <p><strong>Motor Cortex Mapping:</strong> fMRI studies show that imagining movement activates the same brain regions as performing it. Mental rehearsal of posture literally builds the neural circuits for correct alignment.</p>
            <p><strong>Hebbian Learning:</strong> "Neurons that fire together, wire together." By repeatedly imagining your spine as healed, you strengthen the neural connections that support that reality.</p>
            <p><strong>Emotional Signature:</strong> Emotions change gene expression within 60 seconds. Feelings of gratitude and freedom suppress inflammatory genes (NF-kB pathway) and activate healing genes (stem cell production).</p>
            <p><strong>Athletic Precedent:</strong> Olympic athletes use this exact technique. Studies show mental rehearsal + physical practice produces 30% better results than physical practice alone.</p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
