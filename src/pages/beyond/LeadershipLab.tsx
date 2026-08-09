import { useState, useEffect } from "react";
import {
  Award,
  CheckCircle2,
  ChevronRight,
  Compass,
  Lightbulb,
  Lock,
  Shield,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useBeyondGamification } from "@/hooks/useBeyondGamification";

interface ScenarioOption {
  id: string;
  text: string;
  feedback: string;
  score: number;
  style: string;
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  context: string;
  level: number;
  category: string;
  options: ScenarioOption[];
  best_option_id: string;
  learning_point: string;
}

interface UserProgress {
  scenario_id: string;
  score: number;
  chosen_option_id: string;
}

const LEVELS = [
  { level: 1, title: "Self-Leadership", desc: "Manage yourself first", icon: Star, color: "text-blue-500" },
  { level: 2, title: "One-on-One", desc: "Lead individuals", icon: Users, color: "text-green-500" },
  { level: 3, title: "Team Leadership", desc: "Lead a small team", icon: Shield, color: "text-amber-500" },
  { level: 4, title: "Department", desc: "Systems & strategy", icon: Compass, color: "text-purple-500" },
  { level: 5, title: "Thought Leadership", desc: "Influence at scale", icon: Trophy, color: "text-rose-500" },
];

const CATEGORY_LABELS: Record<string, string> = {
  self_leadership: "Self-Leadership",
  team_leadership: "Team",
  conflict: "Conflict",
  communication: "Communication",
  decision_making: "Decisions",
  delegation: "Delegation",
};

// ════════════════════════════════════════════════════════════
// SCENARIO PLAYER COMPONENT
// ════════════════════════════════════════════════════════════

function ScenarioPlayer({
  scenario,
  onComplete,
  existingChoice,
}: {
  scenario: Scenario;
  onComplete: (optionId: string, score: number) => void;
  existingChoice?: UserProgress;
}) {
  const [selectedOption, setSelectedOption] = useState<string | null>(existingChoice?.chosen_option_id || null);
  const [revealed, setRevealed] = useState(!!existingChoice);

  const handleChoose = (optionId: string) => {
    if (revealed) return;
    setSelectedOption(optionId);
  };

  const handleConfirm = () => {
    if (!selectedOption) return;
    setRevealed(true);
    const option = scenario.options.find((o) => o.id === selectedOption);
    if (option) onComplete(selectedOption, option.score);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="text-xs">Level {scenario.level}</Badge>
          <Badge variant="secondary" className="text-xs">{CATEGORY_LABELS[scenario.category] || scenario.category}</Badge>
        </div>
        <CardTitle className="text-lg">{scenario.title}</CardTitle>
        <CardDescription>{scenario.context}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Scenario Description */}
        <div className="rounded-lg bg-muted/60 p-4">
          <p className="text-sm">{scenario.description}</p>
        </div>

        {/* Options */}
        <div className="space-y-2">
          <p className="text-sm font-medium">What do you do?</p>
          {scenario.options.map((option) => {
            const isSelected = selectedOption === option.id;
            const isBest = revealed && option.id === scenario.best_option_id;
            const isChosen = revealed && option.id === selectedOption;

            let borderClass = "border";
            if (revealed && isBest) borderClass = "border-2 border-green-500 bg-green-50 dark:bg-green-950/20";
            else if (revealed && isChosen && !isBest) borderClass = "border-2 border-orange-400 bg-orange-50 dark:bg-orange-950/20";
            else if (isSelected && !revealed) borderClass = "border-2 border-primary bg-primary/5";

            return (
              <button
                key={option.id}
                onClick={() => handleChoose(option.id)}
                disabled={revealed}
                className={`w-full text-left rounded-lg p-3 transition-all ${borderClass} ${
                  !revealed ? "hover:border-primary/50 cursor-pointer" : ""
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase mt-0.5">
                    {option.id}.
                  </span>
                  <div className="flex-1">
                    <p className="text-sm">{option.text}</p>
                    {revealed && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground italic">{option.feedback}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${i < option.score ? "text-amber-400 fill-amber-400" : "text-muted"}`}
                              />
                            ))}
                          </div>
                          {isBest && <Badge className="text-[10px] bg-green-600">Best Choice</Badge>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Confirm / Learning Point */}
        {!revealed && selectedOption && (
          <Button onClick={handleConfirm} className="w-full">
            Confirm Choice
          </Button>
        )}

        {revealed && (
          <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/30 p-3">
            <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
              <Lightbulb className="h-3 w-3" /> Learning Point
            </p>
            <p className="text-xs text-indigo-600 dark:text-indigo-300 mt-1">
              {scenario.learning_point}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN LEADERSHIP LAB PAGE
// ════════════════════════════════════════════════════════════

const LeadershipLab = () => {
  const { addXP, addCoins, recordStreak, checkBadges } = useBeyondGamification();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: session } = await supabase.auth.getSession();
    const [scenRes, progRes] = await Promise.all([
      (supabase as any).from("beyond_leadership_scenarios").select("*").eq("is_published", true).order("level").order("title"),
      session.session
        ? (supabase as any).from("beyond_leadership_progress").select("scenario_id, score, chosen_option_id").eq("user_id", session.session.user.id)
        : Promise.resolve({ data: [] }),
    ]);
    setScenarios(scenRes.data || []);
    setProgress(progRes.data || []);
    setLoading(false);
  };

  const handleScenarioComplete = async (scenarioId: string, optionId: string, score: number) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { toast.error("Please sign in"); return; }

    await (supabase as any).from("beyond_leadership_progress").upsert({
      user_id: session.session.user.id,
      scenario_id: scenarioId,
      chosen_option_id: optionId,
      score,
      feedback: scenarios.find((s) => s.id === scenarioId)?.options.find((o) => o.id === optionId)?.feedback,
    }, { onConflict: "user_id,scenario_id" });

    // Gamification
    await addXP(50, "leadership_scenario", "Completed leadership scenario");
    await addCoins(15, "leadership_scenario");
    await recordStreak("learning");

    const newProgress = [...progress.filter((p) => p.scenario_id !== scenarioId), { scenario_id: scenarioId, score, chosen_option_id: optionId }];
    setProgress(newProgress);

    // Check Scenario Master badge (20 scenarios)
    await checkBadges({
      action: "leadership_scenarios",
      streakType: "learning",
      streakCount: newProgress.length,
    });

    const msg = score >= 4 ? "Excellent choice! +50 XP" : score >= 3 ? "Good thinking! +50 XP" : "Interesting choice. Learn from the feedback. +50 XP";
    toast.success(msg);
  };

  // Stats
  const completedCount = progress.length;
  const totalScore = progress.reduce((acc, p) => acc + p.score, 0);
  const avgScore = completedCount > 0 ? (totalScore / completedCount).toFixed(1) : "—";
  const currentLevel = completedCount < 2 ? 1 : completedCount < 4 ? 2 : completedCount < 6 ? 3 : completedCount < 9 ? 4 : 5;

  // Group scenarios by level
  const scenariosByLevel = LEVELS.map((lvl) => ({
    ...lvl,
    scenarios: scenarios.filter((s) => s.level === lvl.level),
    completedInLevel: progress.filter((p) => scenarios.find((s) => s.id === p.scenario_id && s.level === lvl.level)).length,
  }));

  if (loading) {
    return <div className="grid min-h-[50vh] place-items-center"><p className="text-muted-foreground animate-pulse">Loading scenarios...</p></div>;
  }

  // If actively playing a scenario
  if (activeScenario) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setActiveScenario(null)}>
          ← Back to scenarios
        </Button>
        <ScenarioPlayer
          scenario={activeScenario}
          existingChoice={progress.find((p) => p.scenario_id === activeScenario.id)}
          onComplete={(optionId, score) => handleScenarioComplete(activeScenario.id, optionId, score)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl flex items-center gap-2">
            <Compass className="h-7 w-7 text-amber-500" />
            Leadership Lab
          </h1>
          <p className="text-muted-foreground">Practice real leadership scenarios — learn by doing</p>
        </div>
        <Badge variant="outline" className="w-fit gap-1">
          <Award className="h-3 w-3" /> +50 XP per scenario
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-3">
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold">{completedCount}/{scenarios.length}</p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold">{avgScore}</p>
          <p className="text-xs text-muted-foreground">Avg Score (of 5)</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold">Lv.{currentLevel}</p>
          <p className="text-xs text-muted-foreground">{LEVELS[currentLevel - 1].title}</p>
        </CardContent></Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Leadership Progression</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1">
            {LEVELS.map((lvl) => {
              const unlocked = lvl.level <= currentLevel;
              return (
                <div key={lvl.level} className="flex-1 text-center">
                  <div className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    unlocked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {unlocked ? lvl.level : <Lock className="h-3 w-3" />}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 hidden sm:block">{lvl.title}</p>
                </div>
              );
            })}
          </div>
          <Progress value={(completedCount / Math.max(scenarios.length, 1)) * 100} className="mt-3 h-2" />
        </CardContent>
      </Card>

      {/* Scenarios by Level */}
      <div className="space-y-4">
        {scenariosByLevel.map((lvlGroup) => {
          const unlocked = lvlGroup.level <= currentLevel;
          return (
            <Card key={lvlGroup.level} className={!unlocked ? "opacity-60" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <lvlGroup.icon className={`h-4 w-4 ${lvlGroup.color}`} />
                    Level {lvlGroup.level}: {lvlGroup.title}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {lvlGroup.completedInLevel}/{lvlGroup.scenarios.length} done
                  </Badge>
                </div>
                <CardDescription className="text-xs">{lvlGroup.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                {!unlocked ? (
                  <div className="flex items-center gap-2 text-muted-foreground py-2">
                    <Lock className="h-4 w-4" />
                    <p className="text-xs">Complete more scenarios to unlock Level {lvlGroup.level}</p>
                  </div>
                ) : lvlGroup.scenarios.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">No scenarios available. Run the SQL seed script.</p>
                ) : (
                  <div className="space-y-1.5">
                    {lvlGroup.scenarios.map((scenario) => {
                      const completed = progress.find((p) => p.scenario_id === scenario.id);
                      return (
                        <button
                          key={scenario.id}
                          onClick={() => setActiveScenario(scenario)}
                          className="w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent"
                        >
                          {completed ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{scenario.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{scenario.description}</p>
                          </div>
                          {completed && (
                            <div className="flex shrink-0">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < completed.score ? "text-amber-400 fill-amber-400" : "text-muted"}`} />
                              ))}
                            </div>
                          )}
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default LeadershipLab;
