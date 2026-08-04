import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Activity, Users, Heart, Brain, Target, Star, Trophy, Zap,
  Clock, CheckCircle2, ArrowRight, Sparkles, TrendingUp,
  BookOpen, Stethoscope, Calendar, Phone, MessageSquare,
  Bell, Gift, Award, Eye,
} from "lucide-react";

export default function SpineCommunityPipeline() {
  const [expandedStage, setExpandedStage] = useState<number | null>(1);

  const pipelineStages = [
    {
      id: 1, name: "Registration & Welcome", trigger: "Patient registers / first visit",
      color: "bg-blue-50 border-blue-200", badgeColor: "bg-blue-100 text-blue-700",
      modules: [{ id: "M1", name: "Posture Introduction", status: "unlocked", note: "Free preview — builds trust" }],
      therapies: [{ id: "—", name: "No therapy yet", note: "Assessment first" }],
      community: [
        "Welcome message (WhatsApp + SMS + email)",
        "Add to branch WhatsApp community group",
        "Assign buddy (healed patient from same condition)",
        "Share 'Your Spine Journey Starts' video",
        "Send Spine Health Score baseline link",
        "First Daily Tip notification begins",
      ],
      selfMotivation: [
        "Daily spine health tip (auto — WhatsApp/push)",
        "'X people with your condition recovered here' message",
        "Countdown: 'Your assessment is in X days'",
        "Module M1 progress tracking begins",
      ],
      followUp: [
        { day: "Day 0", action: "Welcome call from receptionist" },
        { day: "Day 1", action: "WhatsApp: 'Did you start Module 1?'" },
        { day: "Day 3", action: "SMS: 'Book your full assessment — only ₹199'" },
        { day: "Day 7", action: "Call: 'We noticed you haven't booked yet — any questions?'" },
      ],
      kpis: ["Registration → Assessment conversion rate", "WhatsApp group join rate", "Module M1 start rate"],
    },
    {
      id: 2, name: "Assessment Complete", trigger: "Spine Score generated / posture analysed",
      color: "bg-green-50 border-green-200", badgeColor: "bg-green-100 text-green-700",
      modules: [
        { id: "M1", name: "Posture Introduction", status: "completed", note: "Foundation done" },
        { id: "M2", name: "Posterior View", status: "unlocked", note: "Understand your report" },
        { id: "M3", name: "Anterior View", status: "unlocked", note: "Self-observation skill" },
        { id: "M4", name: "Lateral View", status: "unlocked", note: "Plumb line self-check" },
        { id: "M5", name: "Practical Skills", status: "unlocked", note: "Assessment at home" },
      ],
      therapies: [
        { id: "T2", name: "Acupressure (Self-points taught)", note: "GB20, BL40 — immediate self-help" },
        { id: "T5", name: "Auriculotherapy (Ear seeds given)", note: "Spine zone seeds for ongoing relief" },
      ],
      community: [
        "Share Spine Score in community (optional — gamified)",
        "Get badge: 'First Step' achievement",
        "See others with similar scores — peer connection",
        "Invite to next week's group Q&A session",
        "Unlock community chat participation",
      ],
      selfMotivation: [
        "'Your score is X — here's what people with that score achieved'",
        "Personalized therapy recommendation based on score",
        "Daily acupressure reminder (BL40 + GB20 — 5 min)",
        "Progress: 'Complete M2 this week to understand your report better'",
      ],
      followUp: [
        { day: "Day 0", action: "Report delivered + explained by doctor" },
        { day: "Day 1", action: "WhatsApp: 'Here are your 3 self-care points (video)'" },
        { day: "Day 2", action: "Call: 'Based on your score, we recommend...' (Level 1 booking)" },
        { day: "Day 5", action: "WhatsApp: 'Still experiencing pain? Book your first treatment'" },
      ],
      kpis: ["Assessment → Level 1 conversion", "Ear seed compliance", "Module M2-M5 start rate"],
    },
    {
      id: 3, name: "Level 1 — First Treatment (OPD)", trigger: "First in-clinic therapy done",
      color: "bg-amber-50 border-amber-200", badgeColor: "bg-amber-100 text-amber-700",
      modules: [
        { id: "M6", name: "Functional Assessment", status: "unlocked", note: "Movement quality testing" },
      ],
      therapies: [
        { id: "T4", name: "Trigger Point Therapy", note: "Done in clinic — taught self-compression" },
        { id: "T5", name: "Ear Seeds (maintained)", note: "Replace every 3-5 days" },
        { id: "T14", name: "Marma Therapy", note: "7-point self-Marma taught" },
        { id: "T2", name: "Acupressure (advanced points)", note: "More points added per condition" },
      ],
      community: [
        "3-Day Relief Challenge begins (share daily pain score)",
        "Paired with accountability partner (similar condition)",
        "Post in group: 'My first session — X% relief!'",
        "Streak tracking officially begins",
        "Unlock 'Relief Warrior' badge possibility",
      ],
      selfMotivation: [
        "Daily check-in: 'Rate your pain today 0-10' (WhatsApp bot)",
        "'You felt X% relief — imagine what 7 days can do!'",
        "Streak counter visible in app: Day 1, 2, 3...",
        "Tennis ball / self-tool reminder (morning routine)",
        "Module M6: 'Test yourself — are you ready for Phase 2?'",
      ],
      followUp: [
        { day: "Day 0", action: "Post-treatment: 'How do you feel?' WhatsApp" },
        { day: "Day 1", action: "'Did you do your home exercises today?'" },
        { day: "Day 3", action: "Call: 'Your 3-day check — ready for the full program?'" },
        { day: "Day 5", action: "Conversion call: explain Level 2 package benefits" },
      ],
      kpis: ["Level 1 → Level 2 conversion (target 62%)", "3-day streak completion", "Self-care compliance"],
    },
    {
      id: 4, name: "Level 2 — Package Treatment (Panchakarma)", trigger: "Course / package started",
      color: "bg-purple-50 border-purple-200", badgeColor: "bg-purple-100 text-purple-700",
      modules: [
        { id: "M7", name: "Corrective Exercise Intro", status: "unlocked", note: "4-Phase model begins" },
        { id: "M8", name: "Upper Cross Syndrome", status: "unlocked", note: "If cervical involvement" },
        { id: "M9", name: "Lower Cross Syndrome", status: "unlocked", note: "If lumbar involvement" },
        { id: "M10", name: "Layered Syndrome", status: "unlocked", note: "If full body pattern" },
        { id: "M11", name: "Pronation Distortion", status: "unlocked", note: "If foot/knee chain" },
        { id: "M12", name: "Flat Back", status: "unlocked", note: "If loss of lordosis" },
        { id: "M13", name: "Sway Back", status: "unlocked", note: "If pelvis displacement" },
      ],
      therapies: [
        { id: "T1", name: "Acupuncture (TCM)", note: "Doctor applies — needle points for condition" },
        { id: "T3", name: "Dry Needling", note: "Trigger point needling — multifidus, QL, traps" },
        { id: "T9", name: "Cupping (Hijama)", note: "Sliding/static cupping on paraspinals" },
        { id: "T6", name: "Shiatsu / Kampo", note: "Meridian pressure + herbal formula" },
        { id: "T10", name: "Moxibustion", note: "For cold-type conditions — warming therapy" },
        { id: "T11", name: "Thai Stretching", note: "Assisted stretches for flexibility" },
        { id: "T12", name: "MET / Osteopathic", note: "Joint mobilization + correction" },
        { id: "T14", name: "Marma Therapy (advanced)", note: "Full spine Marma protocol" },
      ],
      community: [
        "Daily progress sharing in group (pain score + photo optional)",
        "Weekly group VIDEO call with doctor + other course members",
        "Module completion badges — shared automatically",
        "Paired in 'Course Cohort' (4-6 people same start date)",
        "Photo journey: Day 1, Day 7, Day 14 comparison",
        "Mid-course celebration (if >50% improvement)",
        "Access to 'Course Members Only' exclusive content",
      ],
      selfMotivation: [
        "Daily exercise log (mark done in app — streak continues)",
        "Module completion progress bar (visible in profile)",
        "Course milestone badges: Day 3, Day 7, Day 14, Course Complete",
        "Comparison with community average: 'You're ahead of 73% of members'",
        "'People in your cohort completed M8 this week — you can too!'",
        "Therapy count tracker: 'You've had 8 therapies from 5 systems!'",
        "Spine Score re-assessment mid-course (see improvement in numbers)",
      ],
      followUp: [
        { day: "Daily", action: "Morning: 'Time for exercises!' | Evening: 'How was today?'" },
        { day: "Day 3", action: "Doctor review: 'How is course going? Any adjustment needed?'" },
        { day: "Day 7", action: "Mid-course VAS reassessment + score update" },
        { day: "Course End", action: "Final assessment + report + celebrate + plan maintenance" },
        { day: "Post-course Day 3", action: "'How are you maintaining? Here's your home plan'" },
      ],
      kpis: ["Course completion rate", "Module completion rate", "Mid-course improvement %", "Group call attendance"],
    },
    {
      id: 5, name: "Self-Management & Mastery", trigger: "Course completed / enters maintenance",
      color: "bg-teal-50 border-teal-200", badgeColor: "bg-teal-100 text-teal-700",
      modules: [
        { id: "M1-M13", name: "ALL modules in revision mode", status: "completed", note: "Can revisit anytime" },
      ],
      therapies: [
        { id: "T2", name: "Acupressure (mastered)", note: "Patient does daily without guidance" },
        { id: "T5", name: "Ear Seeds (self-applies)", note: "Buys own kit, replaces weekly" },
        { id: "T7", name: "Korean Hand Therapy (self)", note: "Daily hand spine point press" },
        { id: "T8", name: "Reflexology (self-rolling)", note: "Golf ball routine mastered" },
        { id: "T13", name: "Sujok (self-seeds)", note: "Hand seeds for maintenance" },
        { id: "T4", name: "Trigger Point (self-tools)", note: "Theracane/ball — independent" },
      ],
      community: [
        "Teach-back: Record video of yourself doing exercises (share with newcomers)",
        "Answer newcomer questions in community group",
        "Attend monthly maintenance session (in-person or video)",
        "30-day challenges: posture photo, streak, refer a friend",
        "Celebrate 'Days Since Pain' milestones (30, 60, 90, 180, 365)",
        "Eligible for 'Community Captain' role",
      ],
      selfMotivation: [
        "'Days Since Pain' counter (visible, shareable)",
        "Monthly challenge participation (streak resets keep engagement)",
        "Maintenance Spine Score tracking (quarterly reassessment)",
        "Self-therapy log: 'I did 28/30 days this month' badge",
        "'Help 5 newcomers' challenge for Community Captain badge",
        "Invite to share testimonial video for featured wall",
      ],
      followUp: [
        { day: "Weekly", action: "Auto: 'How's your spine this week? Quick 1-10 rating'" },
        { day: "Monthly", action: "Call/WhatsApp: 'Monthly maintenance session — book?'" },
        { day: "Quarterly", action: "Re-assessment: Updated Spine Score + comparison" },
        { day: "6 months", action: "Alumni upgrade invitation + Team Leader discussion" },
      ],
      kpis: ["Self-care streak length", "Days since pain-free", "Referral count", "Community engagement score"],
    },
    {
      id: 6, name: "Alumni & Community Leader", trigger: "6+ months pain-free / graduated",
      color: "bg-amber-50 border-amber-300", badgeColor: "bg-amber-100 text-amber-800",
      modules: [
        { id: "ALL", name: "Full access + can guide others", status: "mastered", note: "Teaching mode" },
      ],
      therapies: [
        { id: "T15", name: "Pranic Healing (energy)", note: "Self-energy hygiene daily" },
        { id: "ALL Self", name: "All 6 self-therapies mastered", note: "Complete independence" },
      ],
      community: [
        "Official Testimonial recording (video + written)",
        "Team Leader role — guide 3-5 new members through their journey",
        "Referral program active: earn for every new member you bring",
        "Featured on community wall / social media",
        "Invited to speak at monthly community call",
        "Eligible for local chapter leadership (franchise discussion)",
        "VIP access to retreats, workshops, Dr. Saleem's mastermind",
        "Revenue share on referrals (if Diamond tier)",
      ],
      selfMotivation: [
        "Legacy badge: 'Transformed + Transforming Others'",
        "Revenue/referral earnings tracker",
        "Impact counter: 'You've helped X people start their journey'",
        "'1 Year Pain-Free' celebration — community-wide recognition",
        "Invited to contribute content (blog, video, tips)",
        "Franchise/business opportunity discussion with Dr. Saleem",
      ],
      followUp: [
        { day: "Monthly", action: "Check-in: 'How are your mentees doing?'" },
        { day: "Quarterly", action: "Reassessment + alumni gathering" },
        { day: "Annually", action: "Spine AYUSH Summit — speaking opportunity" },
      ],
      kpis: ["Referrals generated", "Mentee completion rate", "Revenue share earned", "Community engagement"],
    },
  ];

  // Cross-stage activities (run continuously)
  const crossStageActivities = [
    { activity: "Daily Spine Tip (WhatsApp/Push)", frequency: "Daily", forStages: "All" },
    { activity: "Weekly Sunday Q&A LIVE with Dr. Saleem", frequency: "Weekly", forStages: "Stage 2+" },
    { activity: "Monthly Challenge (streak, posture photo, refer)", frequency: "Monthly", forStages: "Stage 3+" },
    { activity: "Automated celebration posts (milestones)", frequency: "On achievement", forStages: "All" },
    { activity: "Branch-wise leaderboard update", frequency: "Weekly", forStages: "Stage 3+" },
    { activity: "WhatsApp bot daily check-in (pain 0-10)", frequency: "Daily", forStages: "Stage 3+" },
    { activity: "Spine Score reassessment reminder", frequency: "Monthly/Quarterly", forStages: "Stage 4+" },
    { activity: "New content drop notifications", frequency: "When available", forStages: "All" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6 text-indigo-600" /> Community Engagement Pipeline</h1>
          <p className="text-muted-foreground mt-1">Patient journey: Registration → Assessment → Treatment → Self-Management → Leadership · 13 Modules + 15 Therapies integrated</p>
        </div>
        <Badge variant="outline" className="text-indigo-600 border-indigo-300"><Activity className="h-3 w-3 mr-1" /> 6-Stage System</Badge>
      </div>

      {/* Pipeline Overview */}
      <div className="grid grid-cols-6 gap-1">
        {pipelineStages.map(s => (
          <button key={s.id} onClick={() => setExpandedStage(expandedStage === s.id ? null : s.id)}
            className={`p-2 rounded text-center text-xs transition ${expandedStage === s.id ? "ring-2 ring-indigo-400 shadow-md" : "hover:shadow"} ${s.color} border`}>
            <p className="font-bold">{s.id}</p>
            <p className="text-[9px] leading-tight mt-0.5">{s.name.split("—")[0].trim()}</p>
          </button>
        ))}
      </div>

      {/* Expanded Stage Detail */}
      {expandedStage && (() => {
        const stage = pipelineStages.find(s => s.id === expandedStage);
        if (!stage) return null;
        return (
          <Card className={`${stage.color} border-2`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">Stage {stage.id}: {stage.name}</CardTitle>
                <Badge className={stage.badgeColor}>Trigger: {stage.trigger}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Modules */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold flex items-center gap-1"><BookOpen className="h-4 w-4 text-blue-600" /> Modules Unlocked</h4>
                  {stage.modules.map(m => (
                    <div key={m.id} className="p-2 bg-white rounded border text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{m.id}: {m.name}</span>
                        <Badge className="text-[8px] bg-blue-50 text-blue-600">{m.status}</Badge>
                      </div>
                      <p className="text-[9px] text-muted-foreground mt-0.5">{m.note}</p>
                    </div>
                  ))}
                  <Link to="/hms/spine-modules" className="text-[10px] text-blue-600 underline">View all modules →</Link>
                </div>

                {/* Therapies */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold flex items-center gap-1"><Stethoscope className="h-4 w-4 text-green-600" /> Therapies Active</h4>
                  {stage.therapies.map(t => (
                    <div key={t.id + t.name} className="p-2 bg-white rounded border text-xs">
                      <span className="font-medium">{t.id}: {t.name}</span>
                      <p className="text-[9px] text-muted-foreground mt-0.5">{t.note}</p>
                    </div>
                  ))}
                  <Link to="/hms/spine-therapies" className="text-[10px] text-green-600 underline">View all therapies →</Link>
                </div>

                {/* Community Activities */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold flex items-center gap-1"><Heart className="h-4 w-4 text-purple-600" /> Community Activities</h4>
                  <div className="space-y-1 max-h-[250px] overflow-y-auto">
                    {stage.community.map((c, i) => (
                      <div key={i} className="flex items-start gap-1.5 p-1.5 bg-white rounded border text-[10px]">
                        <CheckCircle2 className="h-3 w-3 text-purple-500 shrink-0 mt-0.5" />{c}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Self-Motivation + Follow-up */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold flex items-center gap-1"><Zap className="h-4 w-4 text-amber-600" /> Self-Motivation</h4>
                  <div className="space-y-1 max-h-[150px] overflow-y-auto">
                    {stage.selfMotivation.map((s, i) => (
                      <div key={i} className="flex items-start gap-1.5 p-1.5 bg-white rounded border text-[10px]">
                        <Star className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />{s}
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <h4 className="text-xs font-bold flex items-center gap-1"><Bell className="h-3.5 w-3.5 text-red-500" /> Follow-up Schedule</h4>
                  <div className="space-y-1">
                    {stage.followUp.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-[10px] p-1 bg-white rounded border">
                        <Badge className="text-[8px] bg-red-50 text-red-600 shrink-0">{f.day}</Badge>
                        <span>{f.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* KPIs */}
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                <span className="text-[10px] font-medium text-muted-foreground">KPIs:</span>
                {stage.kpis.map(k => <Badge key={k} variant="outline" className="text-[9px]">{k}</Badge>)}
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* Cross-Stage Activities */}
      <Card className="border-indigo-200">
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Calendar className="h-5 w-5 text-indigo-600" /> Activities Running Across ALL Stages</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {crossStageActivities.map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-2 bg-indigo-50 rounded text-xs">
                <Bell className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                <div className="flex-1"><p className="font-medium">{a.activity}</p><p className="text-[9px] text-muted-foreground">{a.frequency} · {a.forStages}</p></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link to="/hms/spine-modules" className="block"><Card className="hover:shadow-md transition border-blue-200"><CardContent className="p-3 text-center"><BookOpen className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xs font-medium mt-1">13 Modules</p></CardContent></Card></Link>
        <Link to="/hms/spine-therapies" className="block"><Card className="hover:shadow-md transition border-green-200"><CardContent className="p-3 text-center"><Stethoscope className="h-5 w-5 mx-auto text-green-600" /><p className="text-xs font-medium mt-1">15 Therapies</p></CardContent></Card></Link>
        <Link to="/hms/spine-patient-recovery" className="block"><Card className="hover:shadow-md transition border-purple-200"><CardContent className="p-3 text-center"><TrendingUp className="h-5 w-5 mx-auto text-purple-600" /><p className="text-xs font-medium mt-1">Recovery Score</p></CardContent></Card></Link>
        <Link to="/hms/spine-community" className="block"><Card className="hover:shadow-md transition border-amber-200"><CardContent className="p-3 text-center"><Users className="h-5 w-5 mx-auto text-amber-600" /><p className="text-xs font-medium mt-1">Community</p></CardContent></Card></Link>
      </div>
    </div>
  );
}
