import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  CalendarClock, ArrowLeft, CheckCircle2, Clock, Sun, Moon,
  Play, Target, TrendingUp, Flame, Award, Bell,
} from "lucide-react";

const weeklyProtocol = [
  {
    week: "1-2", phase: "Foundation", goal: "Establish daily habit",
    morning: { tool: "Open Focus", duration: 15, slug: "open-focus" },
    evening: { tool: "Body Blessing", duration: 20, slug: "body-blessing" },
    notes: "Start gentle. Build consistency before intensity. Even 10 minutes counts.",
  },
  {
    week: "3-4", phase: "Building", goal: "Activate spinal energy",
    morning: { tool: "Breathwork", duration: 20, slug: "breathwork" },
    evening: { tool: "Body Blessing", duration: 25, slug: "body-blessing" },
    notes: "Add breath technique once sitting habit is solid. You should feel energy moving.",
  },
  {
    week: "5-6", phase: "Deepening", goal: "Neuroplasticity",
    morning: { tool: "Breathwork + Mental Rehearsal", duration: 30, slug: "rehearsal" },
    evening: { tool: "Open Focus + Journal", duration: 25, slug: "journal" },
    notes: "Combine techniques for deeper rewiring. Visualize your healed spine daily.",
  },
  {
    week: "7-8", phase: "Advanced", goal: "Deep healing chemistry",
    morning: { tool: "Pineal Activation", duration: 35, slug: "pineal" },
    evening: { tool: "Body Blessing + Walking", duration: 30, slug: "walking" },
    notes: "Only advance here if consistent for 6 weeks. This is where profound healing occurs.",
  },
  {
    week: "9+", phase: "Maintenance", goal: "Self-directed practice",
    morning: { tool: "Your Choice (any tool)", duration: 20, slug: "" },
    evening: { tool: "Your Choice (any tool)", duration: 20, slug: "" },
    notes: "By now you know what works best for your spine. Listen to your body.",
  },
];

const complianceTips = [
  { tip: "Set phone alarms for BOTH morning and evening sessions", icon: Bell },
  { tip: "Meditate at the same time daily — habit stacking works", icon: Clock },
  { tip: "Never miss twice in a row — one miss is okay, two breaks the streak", icon: Flame },
  { tip: "Start with the minimum (10 min) on low-motivation days", icon: Play },
  { tip: "Track in the app immediately after each session", icon: CheckCircle2 },
  { tip: "Tell someone (doctor, partner) about your commitment for accountability", icon: Target },
  { tip: "Reward yourself at 7-day, 21-day, and 30-day milestones", icon: Award },
  { tip: "Pair meditation with something you already do (after morning tea, before sleep)", icon: CalendarClock },
];

export default function SpineDispenzaScheduler() {
  const navigate = useNavigate();
  const [currentWeek, setCurrentWeek] = useState(0);
  const [streak] = useState(7);
  const [compliance] = useState(85);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/hms/spine-dispenza")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-orange-600" />
            Meditation Scheduler
          </h1>
          <p className="text-sm text-gray-600">Morning & Evening Protocol Planning</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-orange-100 text-orange-700">8-Week Program</Badge>
          <Badge className="bg-green-100 text-green-700">Beginner Start</Badge>
        </div>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="p-3 text-center">
            <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-orange-900">{streak}</p>
            <p className="text-xs text-orange-600">Day Streak</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-3 text-center">
            <Target className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-green-900">{compliance}%</p>
            <p className="text-xs text-green-600">Compliance</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="p-3 text-center">
            <TrendingUp className="w-5 h-5 text-purple-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-purple-900">Week {currentWeek + 1}</p>
            <p className="text-xs text-purple-600">Current Phase</p>
          </CardContent>
        </Card>
      </div>

      {/* How to Use */}
      <Card className="border-orange-200 bg-orange-50/30">
        <CardContent className="p-4">
          <p className="text-sm text-gray-700">
            <strong>How This Works:</strong> Follow the 8-week progressive protocol below. Each phase builds on the previous one. Morning meditations are energizing (prepare you for the day). Evening meditations are restorative (activate repair during sleep).
          </p>
          <p className="text-sm text-gray-700 mt-2">
            <strong>Minimum for Results:</strong> 80% compliance (meditate at least 11 out of 14 days per phase). Consistency matters more than duration.
          </p>
        </CardContent>
      </Card>

      {/* 8-Week Protocol */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">8-Week Progressive Protocol</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {weeklyProtocol.map((w, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border transition-all ${
                idx === currentWeek ? "border-orange-400 bg-orange-50 shadow-sm" : "border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <Badge className={`shrink-0 ${idx === currentWeek ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-700"}`}>
                  Week {w.week}
                </Badge>
                <span className="font-semibold text-sm">{w.phase}</span>
                <Badge variant="outline" className="ml-auto text-[10px]">
                  Goal: {w.goal}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-2 rounded bg-amber-50 border border-amber-200">
                  <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-amber-800">Morning</p>
                    <p className="text-xs text-gray-700">{w.morning.tool} ({w.morning.duration} min)</p>
                  </div>
                  {w.morning.slug && (
                    <Button size="sm" variant="ghost" className="ml-auto h-6 text-[10px]"
                      onClick={() => navigate(`/hms/spine-dispenza-${w.morning.slug}`)}>
                      <Play className="w-2.5 h-2.5" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-indigo-50 border border-indigo-200">
                  <Moon className="w-4 h-4 text-indigo-500 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-indigo-800">Evening</p>
                    <p className="text-xs text-gray-700">{w.evening.tool} ({w.evening.duration} min)</p>
                  </div>
                  {w.evening.slug && (
                    <Button size="sm" variant="ghost" className="ml-auto h-6 text-[10px]"
                      onClick={() => navigate(`/hms/spine-dispenza-${w.evening.slug}`)}>
                      <Play className="w-2.5 h-2.5" />
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 italic">💡 {w.notes}</p>
              {idx === currentWeek && (
                <Button size="sm" className="mt-3 bg-orange-600 hover:bg-orange-700 text-xs"
                  onClick={() => { if (idx < weeklyProtocol.length - 1) setCurrentWeek(idx + 1); toast.success("Advanced to next phase!"); }}>
                  Mark Phase Complete — Advance
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Compliance Tips */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-green-600" />
            Tips for 100% Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {complianceTips.map((t, i) => {
              const Icon = t.icon;
              return (
                <div key={i} className="flex items-center gap-2 p-2 rounded bg-green-50 border border-green-100">
                  <Icon className="w-4 h-4 text-green-600 shrink-0" />
                  <span className="text-xs text-gray-700">{t.tip}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
