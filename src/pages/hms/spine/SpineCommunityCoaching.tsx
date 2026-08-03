import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Activity, Users, Heart, Brain, Target, Star, Trophy, Crown,
  Zap, Clock, CheckCircle2, ArrowRight, Globe, Sparkles,
  TrendingUp, BarChart3, Gift, Shield, Award, Flame,
  BookOpen, Stethoscope, Calendar, Smartphone, Lock,
} from "lucide-react";

export default function SpineCommunityCoaching() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  // ─── Journey Stages (Pain → Purpose) ───
  const journeyStages = [
    { stage: "Pain", icon: Activity, color: "red", desc: "Assessment + First Relief", duration: "Week 1-2", action: "Free Assessment → Trial Package" },
    { stage: "Progress", icon: TrendingUp, color: "orange", desc: "Active Treatment + Learning", duration: "Month 1-3", action: "Treatment Modules + Community Entry" },
    { stage: "Power", icon: Zap, color: "blue", desc: "Strength + Self-Management", duration: "Month 3-6", action: "Corrective Exercise + Self-Therapy Mastery" },
    { stage: "Purpose", icon: Star, color: "green", desc: "Advocate + Community Leader", duration: "Month 6-12", action: "Help Others + Earn Rewards" },
    { stage: "Legacy", icon: Crown, color: "purple", desc: "Team Leader + Revenue Share", duration: "Year 2+", action: "Build Team + Transform Lives" },
  ];

  // ─── Flexible Subscription Tiers ───
  const tiers = [
    {
      id: "silver", name: "Silver", icon: Shield, color: "slate",
      tagline: "Start Your Healing Journey",
      duration: "3 Months Program", priceRange: "₹15,000 – ₹25,000",
      note: "Flexible — depends on condition severity",
      includes: [
        "Initial AI Spine Assessment + Report",
        "Access to Modules M1-M7 (Theory + Assessment)",
        "3 Integrative Therapy sessions (doctor-assigned)",
        "Community group access (WhatsApp + App)",
        "Weekly group coaching call",
        "Spine Health Score tracking",
        "Basic gamification (badges + streaks)",
      ],
      notIncluded: ["1-on-1 doctor video", "Diamond content", "Team leader access", "Revenue share"],
      idealFor: "Mild spine issues, prevention, desk workers, first-timers",
    },
    {
      id: "gold", name: "Gold", icon: Award, color: "amber",
      tagline: "Serious Healing + Community",
      duration: "6 Months Program", priceRange: "₹50,000 – ₹1,20,000",
      note: "Based on treatment plan (Panchakarma + therapies included)",
      includes: [
        "Everything in Silver +",
        "Full access to all 13 Modules + 15 Therapies",
        "Personalized treatment plan (Panchakarma + corrective exercise)",
        "Bi-weekly 1-on-1 video with assigned doctor",
        "Monthly live Q&A with Dr. Mohamad Saleem",
        "Advanced gamification (leaderboard + challenges)",
        "Priority booking + home therapy kit",
        "Certificate of completion",
        "FOMO alerts + exclusive content drops",
      ],
      notIncluded: ["Unlimited consultations", "Team leader status", "Revenue share"],
      idealFor: "Moderate-severe conditions, disc problems, chronic pain, committed patients",
    },
    {
      id: "diamond", name: "Diamond", icon: Crown, color: "blue",
      tagline: "Total Transformation + Leadership",
      duration: "12 Months Program", priceRange: "₹2,50,000 – ₹3,50,000",
      note: "Premium all-inclusive — feel free to invest in your health",
      includes: [
        "Everything in Gold +",
        "Unlimited consultations (in-person + video)",
        "Weekly 1-on-1 video with Dr. Saleem's team",
        "Monthly private session with Dr. Mohamad Saleem",
        "All Panchakarma courses included (unlimited sessions)",
        "Team Leader status — guide Silver/Gold members",
        "Exclusive Diamond WhatsApp group",
        "Quarterly home therapy kit (shipped)",
        "All certifications + CME credits",
        "VIP event access + retreats",
        "Referral revenue share (refer 3+ Diamonds → earn)",
      ],
      notIncluded: [],
      idealFor: "Severe/complex conditions, those wanting transformation + leadership role",
    },
    {
      id: "quantum", name: "Quantum", icon: Sparkles, color: "purple",
      tagline: "Become the Healer — Build Your Legacy",
      duration: "Lifetime / Annual Renewal", priceRange: "₹5,00,000+",
      note: "For those who want to LEAD spine wellness in their area",
      includes: [
        "Everything in Diamond +",
        "Franchise partnership discussion priority",
        "Train-the-trainer certification",
        "Co-branded marketing with Ayuzee",
        "Revenue share on all referrals (multi-level)",
        "Exclusive mastermind with Dr. Saleem (quarterly)",
        "Early access to new protocols & research",
        "Lifetime community access",
        "Naming rights for local community chapter",
        "Seat at annual Spine AYUSH summit",
      ],
      notIncluded: [],
      idealFor: "Doctors, therapists, entrepreneurs wanting to build spine wellness business",
    },
  ];

  // ─── Gamification Elements ───
  const gamification = {
    badges: [
      { name: "First Step", desc: "Completed spine assessment", icon: "🎯" },
      { name: "7-Day Warrior", desc: "7 consecutive days of exercises", icon: "🔥" },
      { name: "Module Master", desc: "Completed any full module", icon: "📚" },
      { name: "Pain-Free Week", desc: "VAS score 0 for 7 days", icon: "🌟" },
      { name: "Community Helper", desc: "Helped 5 members in group", icon: "🤝" },
      { name: "30-Day Streak", desc: "30 days continuous practice", icon: "💪" },
      { name: "Therapy Explorer", desc: "Tried 3 different therapy systems", icon: "🌍" },
      { name: "Transformation Story", desc: "Shared before/after with community", icon: "🦋" },
      { name: "Referral Champion", desc: "Referred 3+ people who joined", icon: "👑" },
      { name: "Team Leader", desc: "Became a community team leader", icon: "⭐" },
    ],
    streaks: [
      { days: 7, reward: "Bronze streak badge + 50 spine coins" },
      { days: 14, reward: "Silver streak badge + unlock bonus module" },
      { days: 30, reward: "Gold streak badge + free therapy session" },
      { days: 60, reward: "Diamond streak badge + 1-on-1 with doctor" },
      { days: 90, reward: "Quantum streak + featured on community wall" },
    ],
    spineScore: {
      factors: ["Module completion (20%)", "Daily exercise done (25%)", "Pain reduction (25%)", "Community engagement (15%)", "Therapy attendance (15%)"],
      levels: [
        { range: "0-20", label: "Critical", color: "red" },
        { range: "21-40", label: "Needs Attention", color: "orange" },
        { range: "41-60", label: "Improving", color: "amber" },
        { range: "61-80", label: "Good", color: "blue" },
        { range: "81-100", label: "Excellent", color: "green" },
      ],
    },
  };

  // ─── FOMO Elements ───
  const fomoElements = [
    { text: "47 people in your city improved their Spine Score this week", icon: TrendingUp, type: "social" },
    { text: "Only 8 Diamond spots remaining for Kadayanallur branch", icon: Clock, type: "scarcity" },
    { text: "Dr. Saleem's LIVE session in 2 days — Diamond members only", icon: Calendar, type: "exclusive" },
    { text: "Ramesh (Gold member) just hit Pain-Free status after 4 months!", icon: Trophy, type: "success" },
    { text: "New module dropping Friday — Spine + Gut Connection — early access for Gold+", icon: Gift, type: "content" },
    { text: "₹5,000 early-bird discount ends in 48 hours", icon: Clock, type: "urgency" },
  ];

  // ─── Community Hierarchy ───
  const communityHierarchy = [
    { role: "Super Admin", person: "Dr. Mohamad Saleem", responsibilities: ["Vision & direction", "Monthly LIVE sessions", "Protocol development", "Diamond member personal connect", "Content creation & research"], access: "All" },
    { role: "Team Leaders", person: "Branch Doctors + Senior Therapists", responsibilities: ["Weekly group coaching calls", "Member progress monitoring", "Treatment plan adjustments", "Motivate & accountability", "Escalate complex cases to Super Admin"], access: "Gold + Diamond management" },
    { role: "Community Captains", person: "Healed Diamond Members (Alumni)", responsibilities: ["Daily WhatsApp group engagement", "Share personal healing story", "Welcome new members", "Organize local meetups", "Report issues to Team Leaders"], access: "Community moderation" },
    { role: "Members", person: "Active Patients (Silver/Gold/Diamond)", responsibilities: ["Follow prescribed modules & exercises", "Report progress daily (app/WhatsApp)", "Attend group calls", "Support fellow members", "Share wins & struggles"], access: "Tier-based content access" },
  ];

  // ─── Cross-Links to Modules & Therapies ───
  const crossLinks = {
    modules: [
      { path: "/hms/spine-modules", label: "All 13 Posture & Corrective Modules", desc: "Theory → Assessment → Treatment" },
      { path: "/hms/spine-modules/1", label: "M1: Start Here — Posture Basics", desc: "Foundation for every member" },
      { path: "/hms/spine-modules/7", label: "M7: Corrective Exercise", desc: "The 4-Phase healing model" },
      { path: "/hms/spine-modules/8", label: "M8-M13: Syndrome Protocols", desc: "Your specific condition treatment" },
    ],
    therapies: [
      { path: "/hms/spine-therapies", label: "All 15 Integrative Therapies", desc: "Global complementary systems" },
      { path: "/hms/spine-therapies/1", label: "T1: Acupuncture + Self-Acupressure", desc: "Most evidence-based adjunct" },
      { path: "/hms/spine-therapies/14", label: "T14: Marma Therapy", desc: "Core AYUSH energy healing" },
      { path: "/hms/spine-therapies/5", label: "T5: Ear Seeds (Self-Treatment)", desc: "Carry your therapy everywhere" },
    ],
    spine: [
      { path: "/hms/spine-ayush", label: "Spine Dashboard", desc: "Franchise KPIs & branch data" },
      { path: "/hms/spine-ayush?tab=protocols", label: "Panchakarma Protocols", desc: "Level 2 treatment plans" },
      { path: "/hms/spine-ayush?tab=packages", label: "Packages & Pricing", desc: "Clinical package builder" },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="h-6 w-6 text-amber-500" />
            Spine AYUSH — Community Coaching
          </h1>
          <p className="text-muted-foreground mt-1">
            Pain → Purpose · Degeneration → Regeneration · Build the Community Win
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-amber-100 text-amber-700">
            <Flame className="h-3 w-3 mr-1" /> Funnel Active
          </Badge>
          <Badge variant="outline" className="text-purple-600 border-purple-300">
            <Users className="h-3 w-3 mr-1" /> Community Model
          </Badge>
        </div>
      </div>

      {/* ═══ JOURNEY: Pain → Purpose ═══ */}
      <Card className="border-indigo-200 bg-gradient-to-r from-red-50 via-blue-50 to-green-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-600" /> The Journey: Pain → Purpose → Legacy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {journeyStages.map((s, i) => (
              <div key={s.stage} className="relative p-3 bg-white rounded-lg border text-center">
                <s.icon className={`h-6 w-6 mx-auto text-${s.color}-600 mb-1`} />
                <p className="text-sm font-bold">{s.stage}</p>
                <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                <p className="text-[9px] mt-1 text-indigo-600 font-medium">{s.duration}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{s.action}</p>
                {i < journeyStages.length - 1 && (
                  <ArrowRight className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ═══ FOMO BANNER ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {fomoElements.slice(0, 3).map((fomo, i) => (
          <Card key={i} className="border-amber-200 bg-amber-50/50">
            <CardContent className="p-3 flex items-center gap-2">
              <fomo.icon className="h-4 w-4 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-800">{fomo.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ═══ SUBSCRIPTION TIERS ═══ */}
      <div>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Gift className="h-5 w-5 text-purple-600" /> Membership Tiers — Feel Free to Invest in Your Health
        </h2>
        <p className="text-xs text-muted-foreground mb-4">Programs are flexible (3 months / 6 months / 12 months). Pricing adapts to your condition, treatment needs, and goals. No pressure — invest what feels right.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map((tier) => (
            <Card
              key={tier.id}
              className={`transition-all cursor-pointer ${selectedTier === tier.id ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md"} ${tier.id === "diamond" ? "border-blue-300 bg-blue-50/20" : ""}`}
              onClick={() => setSelectedTier(tier.id === selectedTier ? null : tier.id)}
            >
              <CardHeader className="pb-2 text-center">
                <tier.icon className={`h-8 w-8 mx-auto text-${tier.color}-600`} />
                <CardTitle className="text-sm">{tier.name}</CardTitle>
                <p className="text-[10px] text-muted-foreground italic">{tier.tagline}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-center">
                  <p className="text-xs font-bold text-green-700">{tier.priceRange}</p>
                  <p className="text-[9px] text-muted-foreground">{tier.duration}</p>
                  <p className="text-[9px] text-amber-600 italic">{tier.note}</p>
                </div>
                <Separator />
                <ul className="space-y-1">
                  {tier.includes.slice(0, selectedTier === tier.id ? undefined : 4).map((item) => (
                    <li key={item} className="text-[10px] flex items-start gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                  {selectedTier !== tier.id && tier.includes.length > 4 && (
                    <li className="text-[10px] text-blue-600 font-medium">+{tier.includes.length - 4} more — click to expand</li>
                  )}
                </ul>
                {tier.notIncluded.length > 0 && selectedTier === tier.id && (
                  <div className="pt-1">
                    {tier.notIncluded.map((ni) => (
                      <p key={ni} className="text-[9px] text-muted-foreground flex items-center gap-1"><Lock className="h-2.5 w-2.5" /> {ni}</p>
                    ))}
                  </div>
                )}
                <p className="text-[9px] bg-muted p-1.5 rounded"><strong>Ideal for:</strong> {tier.idealFor}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ═══ GAMIFICATION ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Badges */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" /> Badges & Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {gamification.badges.map((badge) => (
                <div key={badge.name} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <span className="text-lg">{badge.icon}</span>
                  <div>
                    <p className="text-xs font-medium">{badge.name}</p>
                    <p className="text-[9px] text-muted-foreground">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Streaks + Spine Score */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" /> Streak Rewards
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {gamification.streaks.map((s) => (
                <div key={s.days} className="flex items-center justify-between p-2 bg-orange-50 rounded text-xs">
                  <span className="font-bold text-orange-700">{s.days} Days</span>
                  <span className="text-orange-800">{s.reward}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-green-600" /> Spine Health Score (0-100)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-1">
                {gamification.spineScore.levels.map((l) => (
                  <div key={l.range} className={`flex-1 text-center p-1 bg-${l.color}-100 rounded`}>
                    <p className={`text-[9px] font-bold text-${l.color}-700`}>{l.label}</p>
                    <p className="text-[8px] text-muted-foreground">{l.range}</p>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-muted-foreground space-y-0.5">
                <p className="font-medium">Score calculated from:</p>
                {gamification.spineScore.factors.map((f) => (
                  <p key={f} className="pl-2">• {f}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ═══ COMMUNITY HIERARCHY ═══ */}
      <Card className="border-purple-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" /> Community Structure (Siddharth Rajsekar Model)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {communityHierarchy.map((level, i) => (
            <div key={level.role} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded">{level.role}</span>
                  <span className="text-xs text-muted-foreground">{level.person}</span>
                </div>
                <Badge variant="outline" className="text-[9px]">{level.access}</Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {level.responsibilities.map((r) => (
                  <span key={r} className="text-[9px] bg-muted px-1.5 py-0.5 rounded">{r}</span>
                ))}
              </div>
            </div>
          ))}
          <div className="bg-purple-50 p-3 rounded text-xs text-purple-800">
            <strong>The Win:</strong> Members heal → become advocates → attract new members → community grows → everyone benefits. Diamond members become Team Leaders → earn revenue share → build their own local spine wellness community chapter.
          </div>
        </CardContent>
      </Card>

      {/* ═══ MORE FOMO ═══ */}
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" /> FOMO & Health Awareness Triggers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {fomoElements.map((fomo, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-white rounded border">
                <fomo.icon className="h-4 w-4 text-amber-600 shrink-0" />
                <div>
                  <p className="text-xs">{fomo.text}</p>
                  <Badge variant="outline" className="text-[8px] mt-0.5">{fomo.type}</Badge>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-[10px] text-muted-foreground bg-white p-2 rounded border">
            <strong>Implementation:</strong> These notifications appear as push notifications, WhatsApp messages, and in-app banners. Triggered by real data (actual member progress, actual seat counts, actual session schedules). Never fake — always authentic social proof.
          </div>
        </CardContent>
      </Card>

      {/* ═══ CROSS-LINKS TO MODULES & THERAPIES ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Modules */}
        <Card className="border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" /> Learning Modules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {crossLinks.modules.map((link) => (
              <Link key={link.path} to={link.path} className="block p-2 bg-blue-50 rounded hover:bg-blue-100 transition">
                <p className="text-xs font-medium text-blue-700">{link.label}</p>
                <p className="text-[9px] text-blue-600">{link.desc}</p>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Therapies */}
        <Card className="border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Globe className="h-4 w-4 text-green-600" /> Integrative Therapies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {crossLinks.therapies.map((link) => (
              <Link key={link.path} to={link.path} className="block p-2 bg-green-50 rounded hover:bg-green-100 transition">
                <p className="text-xs font-medium text-green-700">{link.label}</p>
                <p className="text-[9px] text-green-600">{link.desc}</p>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Spine Dashboard */}
        <Card className="border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-600" /> Spine Operations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {crossLinks.spine.map((link) => (
              <Link key={link.path} to={link.path} className="block p-2 bg-purple-50 rounded hover:bg-purple-100 transition">
                <p className="text-xs font-medium text-purple-700">{link.label}</p>
                <p className="text-[9px] text-purple-600">{link.desc}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ═══ DEGENERATION → REGENERATION PROMISE ═══ */}
      <Card className="border-green-300 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="p-5 text-center space-y-3">
          <h3 className="text-lg font-bold text-green-800">Degeneration → Regeneration</h3>
          <p className="text-sm text-green-700 max-w-2xl mx-auto">
            Your spine didn't degenerate overnight — it won't regenerate overnight either. But with the right system (AYUSH + Global therapies + Community support + Consistency), transformation is inevitable.
          </p>
          <div className="flex justify-center gap-4 text-xs text-green-600">
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> 3 months: Pain relief</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> 6 months: Strength</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> 12 months: Regeneration</span>
          </div>
          <p className="text-[10px] text-green-600 italic">
            "Every Diamond member started as someone in pain. They stayed because they found purpose." — Dr. Mohamad Saleem
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
