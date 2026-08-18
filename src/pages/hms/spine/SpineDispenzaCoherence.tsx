import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Users, ArrowLeft, CheckCircle2, Clock, Heart, Brain,
  ChevronDown, ChevronUp, Timer, Radio, Calendar, Plus,
} from "lucide-react";
import { ClinicMembershipLockOverlay } from "@/components/dispenza/PremiumLockOverlay";
import { useDispenzaAccess } from "@/hooks/useDispenzaAccess";

const phases = [
  { phase: 1, title: "Individual Coherence", duration: "5 min", instruction: "Each person does heart-focused breathing. Breathe in gratitude, breathe out love. Build your own coherent field first.", note: "You must be coherent yourself before you can heal others." },
  { phase: 2, title: "Expand Your Field", duration: "3 min", instruction: "Expand your heart energy outward to fill the room. Feel your energy connecting with everyone else's.", note: "Imagine a golden web of light connecting all hearts." },
  { phase: 3, title: "Directed Healing", duration: "15 min", instruction: "Facilitator names each person one by one. When your name is called, receive. Everyone else: send love and healing intention to that person's spine.", note: "Send energy specifically to their stated spinal condition." },
  { phase: 4, title: "Collective Field", duration: "10 min", instruction: "Direct the combined intention to ALL spines in the group simultaneously. Visualize every spine in the room glowing with health.", note: "The group field is now coherent — this is where healing amplifies." },
  { phase: 5, title: "Silent Integration", duration: "5 min", instruction: "Release all intention. Sit in silence. Let the healing energy integrate. Trust the intelligence of the field.", note: "The body knows what to do with this energy." },
];

const upcomingSessions = [
  { date: "Next Tuesday", time: "6:30 PM", mode: "In-Clinic", facilitator: "Dr. Saleem", spots: 8 },
  { date: "Next Saturday", time: "7:00 AM", mode: "Online (Zoom)", facilitator: "Therapist Priya", spots: 15 },
  { date: "Monthly Mega", time: "5:00 PM", mode: "Hybrid", facilitator: "Dr. Saleem", spots: 50 },
];

export default function SpineDispenzaCoherence() {
  const navigate = useNavigate();
  const [currentPhase, setCurrentPhase] = useState(0);
  const [showScience, setShowScience] = useState(false);

  // Check real clinic membership access from Supabase
  const { hasClinicAccess: hasClinicMembership } = useDispenzaAccess();

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Clinic Membership Lock */}
      {!hasClinicMembership && <ClinicMembershipLockOverlay toolName="Coherence Healing (Group)" />}
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/hms/spine-dispenza")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-600" />
            Coherence Healing (Group)
          </h1>
          <p className="text-sm text-gray-600">Collective Intention for Amplified Healing</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-amber-100 text-amber-700">45 min</Badge>
          <Badge className="bg-amber-100 text-amber-700">Intermediate</Badge>
          <Badge className="bg-indigo-100 text-indigo-700">Evening</Badge>
        </div>
      </div>

      {/* What This Is */}
      <Card className="border-amber-200 bg-amber-50/30">
        <CardContent className="p-4">
          <p className="text-sm text-gray-700">
            <strong>What:</strong> A group meditation where participants direct healing intention toward each person's spine. Based on Dr. Dispenza's Project Coherence research showing documented remissions and recoveries.
          </p>
          <p className="text-sm text-gray-700 mt-2">
            <strong>Spine Benefit:</strong> Group coherence creates a measurable electromagnetic field that promotes tissue healing. Participants with spinal conditions have shown measurable disc rehydration and reduced stenosis after consistent sessions.
          </p>
          <p className="text-sm text-gray-700 mt-2">
            <strong>Setup:</strong> Gather in a circle (in-person or online). 5-50 people. Facilitator guides the group through 5 phases. Each participant shares their healing intention at the start.
          </p>
        </CardContent>
      </Card>

      {/* Upcoming Sessions */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Upcoming Group Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {upcomingSessions.map((s, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border hover:border-green-300 transition-all">
              <div className="flex-1">
                <p className="text-sm font-semibold">{s.date} — {s.time}</p>
                <p className="text-xs text-gray-500">{s.mode} • Led by {s.facilitator} • {s.spots} spots</p>
              </div>
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs">
                <Plus className="w-3 h-3 mr-1" /> Join
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 5 Phases */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Radio className="w-5 h-5 text-amber-500" />
            5-Phase Group Protocol
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {phases.map((p, idx) => (
            <div key={idx} className={`p-4 rounded-lg border transition-all ${
              idx === currentPhase ? "border-amber-400 bg-amber-50 shadow-sm" : "border-gray-200"
            }`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
                  idx < currentPhase ? "bg-green-500 text-white" :
                  idx === currentPhase ? "bg-amber-500 text-white" : "bg-gray-200 text-gray-600"
                }`}>
                  {idx < currentPhase ? "✓" : p.phase}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{p.title}</span>
                    <Badge variant="outline" className="text-[10px]">
                      <Timer className="w-2.5 h-2.5 mr-0.5" /> {p.duration}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700">{p.instruction}</p>
                  <p className="text-xs text-amber-600 mt-1 italic">💡 {p.note}</p>
                  {idx === currentPhase && (
                    <Button size="sm" className="mt-2 h-6 text-xs bg-amber-600 hover:bg-amber-700"
                      onClick={() => {
                        if (idx < phases.length - 1) setCurrentPhase(idx + 1);
                        else { setCurrentPhase(0); toast.success("Group session complete! Healing field activated."); }
                      }}>
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Phase Complete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Facilitator Guide */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Heart className="w-4 h-4 text-blue-500" />
            Facilitator Quick Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-gray-600 space-y-1">
          <p>1. Welcome everyone. Ask each person to share their spine healing intention (one sentence).</p>
          <p>2. Guide 5 synchronized breaths to unify the group.</p>
          <p>3. Lead through all 5 phases with gentle voice guidance.</p>
          <p>4. During Phase 3: Name each person slowly (30 seconds each). Others send intention.</p>
          <p>5. After: Sharing round — each person shares one sensation. Record group score.</p>
          <p>6. Schedule next session before everyone leaves.</p>
        </CardContent>
      </Card>

      {/* Science */}
      <Card className="border-purple-200">
        <CardHeader className="pb-2 cursor-pointer" onClick={() => setShowScience(!showScience)}>
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-500" />
            Science: Group Coherence & Healing Fields
            {showScience ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
          </CardTitle>
        </CardHeader>
        {showScience && (
          <CardContent className="text-xs text-gray-600 space-y-2">
            <p><strong>Heart Electromagnetic Field:</strong> The heart produces an electromagnetic field detectable 3+ feet from the body. When multiple people are in coherence, these fields synchronize — creating a measurable "group field."</p>
            <p><strong>Intention Studies:</strong> Randomized controlled trials show directed intention can measurably affect biological systems (wound healing speed, plant growth, enzyme activity).</p>
            <p><strong>Social Healing:</strong> The social support aspect alone reduces cortisol by 25% and increases oxytocin — both directly beneficial for pain reduction and tissue healing.</p>
            <p><strong>Placebo Amplification:</strong> Group belief and shared intention amplify the placebo effect beyond individual practice. The brain produces more endorphins when healing is witnessed and supported by others.</p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
