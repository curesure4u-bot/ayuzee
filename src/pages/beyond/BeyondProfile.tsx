import { useState, useEffect } from "react";
import {
  Award,
  BookOpen,
  Calendar,
  Coins,
  Flame,
  GraduationCap,
  MapPin,
  Save,
  Settings,
  Star,
  Target,
  Trophy,
  User,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const CAREER_STAGES = [
  { value: "student", label: "Medical Student" },
  { value: "intern", label: "Intern / CRRI" },
  { value: "resident", label: "PG Resident" },
  { value: "consultant", label: "Consultant / Practitioner" },
  { value: "senior_doctor", label: "Senior Doctor" },
  { value: "academic", label: "Academic / Professor" },
];

const INTERESTS = [
  "Finance", "Leadership", "Wellness", "Time Management", "Writing",
  "Public Speaking", "Research", "Entrepreneurship", "Teaching", "Digital Health",
  "Meditation", "Reading", "Fitness", "Career Growth", "Work-Life Balance",
];

interface ProfileData {
  full_name: string;
  career_stage: string;
  specialty: string;
  institution: string;
  city: string;
  years_experience: number;
  interests: string[];
  goals: string[];
}

interface StatsData {
  totalXp: number;
  currentLevel: number;
  levelTitle: string;
  coins: number;
  badgeCount: number;
  streakBest: number;
  lessonsCompleted: number;
  booksRead: number;
}

const BeyondProfile = () => {
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "", career_stage: "student", specialty: "",
    institution: "", city: "", years_experience: 0,
    interests: [], goals: [],
  });
  const [stats, setStats] = useState<StatsData>({
    totalXp: 0, currentLevel: 1, levelTitle: "Intern",
    coins: 0, badgeCount: 0, streakBest: 0,
    lessonsCompleted: 0, booksRead: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newGoal, setNewGoal] = useState("");

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { setLoading(false); return; }
    const userId = session.session.user.id;

    const [profRes, xpRes, coinRes, badgeRes, streakRes, lessonRes, bookRes] = await Promise.all([
      (supabase as any).from("beyond_profiles").select("*").eq("user_id", userId).maybeSingle(),
      (supabase as any).from("beyond_user_xp").select("total_xp, current_level, level_title").eq("user_id", userId).maybeSingle(),
      (supabase as any).from("beyond_coin_balance").select("balance").eq("user_id", userId).maybeSingle(),
      (supabase as any).from("beyond_user_badges").select("id").eq("user_id", userId),
      (supabase as any).from("beyond_streaks").select("longest_count").eq("user_id", userId),
      (supabase as any).from("beyond_lesson_completions").select("id").eq("user_id", userId),
      (supabase as any).from("beyond_reading_logs").select("id").eq("user_id", userId).eq("status", "finished"),
    ]);

    if (profRes.data) {
      setProfile({
        full_name: profRes.data.full_name || "",
        career_stage: profRes.data.career_stage || "student",
        specialty: profRes.data.specialty || "",
        institution: profRes.data.institution || "",
        city: profRes.data.city || "",
        years_experience: profRes.data.years_experience || 0,
        interests: profRes.data.interests || [],
        goals: profRes.data.goals || [],
      });
    } else {
      // Pre-fill with email
      setProfile((p) => ({ ...p, full_name: session.session!.user.email?.split("@")[0] || "" }));
    }

    const bestStreak = (streakRes.data || []).reduce((max: number, s: any) => Math.max(max, s.longest_count || 0), 0);

    setStats({
      totalXp: xpRes.data?.total_xp || 0,
      currentLevel: xpRes.data?.current_level || 1,
      levelTitle: xpRes.data?.level_title || "Intern",
      coins: coinRes.data?.balance || 0,
      badgeCount: badgeRes.data?.length || 0,
      streakBest: bestStreak,
      lessonsCompleted: lessonRes.data?.length || 0,
      booksRead: bookRes.data?.length || 0,
    });

    setLoading(false);
  };

  const saveProfile = async () => {
    if (!profile.full_name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { setSaving(false); return; }

    await (supabase as any).from("beyond_profiles").upsert({
      user_id: session.session.user.id,
      full_name: profile.full_name,
      career_stage: profile.career_stage,
      specialty: profile.specialty || null,
      institution: profile.institution || null,
      city: profile.city || null,
      years_experience: profile.years_experience,
      interests: profile.interests,
      goals: profile.goals,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    toast.success("Profile saved!");
    setSaving(false);
  };

  const toggleInterest = (interest: string) => {
    setProfile((p) => ({
      ...p,
      interests: p.interests.includes(interest)
        ? p.interests.filter((i) => i !== interest)
        : [...p.interests, interest],
    }));
  };

  const addGoal = () => {
    if (!newGoal.trim()) return;
    setProfile((p) => ({ ...p, goals: [...p.goals, newGoal.trim()] }));
    setNewGoal("");
  };

  const removeGoal = (idx: number) => {
    setProfile((p) => ({ ...p, goals: p.goals.filter((_, i) => i !== idx) }));
  };

  if (loading) {
    return <div className="grid min-h-[50vh] place-items-center"><p className="text-muted-foreground animate-pulse">Loading profile...</p></div>;
  }

  // XP progress
  const levelThresholds = [0, 500, 1500, 3500, 7000, 12000, 20000, 35000, 55000, 80000];
  const idx = stats.currentLevel - 1;
  const xpInLevel = stats.totalXp - (levelThresholds[idx] || 0);
  const xpNeeded = (levelThresholds[idx + 1] || 80000) - (levelThresholds[idx] || 0);
  const progressPct = Math.min(Math.round((xpInLevel / xpNeeded) * 100), 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl flex items-center gap-2">
          <Settings className="h-7 w-7 text-slate-500" />
          My Profile
        </h1>
        <p className="text-muted-foreground">Your Beyond.Praxis identity and progress</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left: Profile Form */}
        <div className="space-y-4">
          {/* Level Card */}
          <Card className="border-primary/20 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-xl font-bold">
                  {stats.currentLevel}
                </div>
                <div className="flex-1">
                  <p className="font-bold">{stats.levelTitle}</p>
                  <p className="text-xs text-muted-foreground">{stats.totalXp} XP total</p>
                  <Progress value={progressPct} className="h-2 mt-1" />
                  <p className="text-[10px] text-muted-foreground mt-0.5">{progressPct}% to Level {stats.currentLevel + 1}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><User className="h-4 w-4" /> Basic Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Full Name</label>
                <Input value={profile.full_name} onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-muted-foreground">Career Stage</label>
                  <Select value={profile.career_stage} onValueChange={(v) => setProfile((p) => ({ ...p, career_stage: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CAREER_STAGES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Specialty</label>
                  <Input placeholder="e.g. Ayurveda, Surgery..." value={profile.specialty} onChange={(e) => setProfile((p) => ({ ...p, specialty: e.target.value }))} />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="text-xs text-muted-foreground">Institution</label>
                  <Input placeholder="College/Hospital" value={profile.institution} onChange={(e) => setProfile((p) => ({ ...p, institution: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">City</label>
                  <Input placeholder="City" value={profile.city} onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Years Experience</label>
                  <Input type="number" value={profile.years_experience} onChange={(e) => setProfile((p) => ({ ...p, years_experience: Number(e.target.value) }))} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interests */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Star className="h-4 w-4" /> Interests</CardTitle>
              <CardDescription className="text-xs">What do you want to grow in? (select multiple)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {INTERESTS.map((interest) => (
                  <button key={interest} onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                      profile.interests.includes(interest) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}>
                    {interest}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Goals */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4" /> My Goals</CardTitle>
              <CardDescription className="text-xs">What are you working toward?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {profile.goals.map((goal, idx) => (
                <div key={idx} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                  <span className="text-sm flex-1">{goal}</span>
                  <button onClick={() => removeGoal(idx)} className="text-xs text-muted-foreground hover:text-destructive">✕</button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input placeholder="Add a goal..." value={newGoal} onChange={(e) => setNewGoal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addGoal()} />
                <Button size="sm" variant="outline" onClick={addGoal}>Add</Button>
              </div>
            </CardContent>
          </Card>

          {/* Save */}
          <Button onClick={saveProfile} disabled={saving} className="w-full gap-2" size="lg">
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Profile"}
          </Button>
        </div>

        {/* Right: Stats Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Achievement Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Zap className="h-3 w-3" /> Total XP</span>
                <span className="text-sm font-bold">{stats.totalXp}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Coins className="h-3 w-3" /> Coins</span>
                <span className="text-sm font-bold">{stats.coins}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Trophy className="h-3 w-3" /> Badges</span>
                <span className="text-sm font-bold">{stats.badgeCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Flame className="h-3 w-3" /> Best Streak</span>
                <span className="text-sm font-bold">{stats.streakBest} days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1"><GraduationCap className="h-3 w-3" /> Lessons Done</span>
                <span className="text-sm font-bold">{stats.lessonsCompleted}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1"><BookOpen className="h-3 w-3" /> Books Read</span>
                <span className="text-sm font-bold">{stats.booksRead}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="mx-auto h-6 w-6 text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground">Member since</p>
              <p className="text-sm font-medium">
                {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BeyondProfile;
