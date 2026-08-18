import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Dices, Heart, Brain, TrendingUp, TrendingDown, Target,
  Zap, Shield, Award, Flame, Crown, Star, CheckCircle2,
  XCircle, ArrowRight, RotateCcw, Sparkles, Activity,
  AlertTriangle, Footprints, Users, BookHeart, Wind,
} from "lucide-react";

// ─── GAME BOARD CELLS ───
const painCycleCells = [
  { id: 1, label: "Pain Flare", type: "pain", icon: "🔥", desc: "Acute pain episode strikes", points: -10 },
  { id: 2, label: "Painkiller", type: "quick-fix", icon: "💊", desc: "Temporary relief, no healing", points: -2 },
  { id: 3, label: "Skip Exercise", type: "pain", icon: "🛋️", desc: "Too tired, skip corrective exercise", points: -8 },
  { id: 4, label: "Doctor Visit", type: "neutral", icon: "🏥", desc: "Assessment — new treatment plan", points: +5 },
  { id: 5, label: "Stress Spike", type: "pain", icon: "😰", desc: "Work/life stress tightens spine", points: -7 },
  { id: 6, label: "Bad Posture Day", type: "pain", icon: "🪑", desc: "Sat hunched for 8+ hours", points: -6 },
  { id: 7, label: "Treatment Session", type: "healing", icon: "🌿", desc: "Kati Basti / Panchakarma", points: +12 },
  { id: 8, label: "Sleep Poorly", type: "pain", icon: "😴", desc: "Less than 6 hours or bad mattress", points: -5 },
  { id: 9, label: "Meditation Done", type: "healing", icon: "🧠", desc: "Completed Dispenza session", points: +10 },
  { id: 10, label: "Inflammation Meal", type: "pain", icon: "🍟", desc: "Ate processed/inflammatory food", points: -4 },
  { id: 11, label: "Walking Practice", type: "healing", icon: "🚶", desc: "Mindful walking meditation", points: +6 },
  { id: 12, label: "Weight Gain", type: "pain", icon: "⚖️", desc: "Extra load on spine", points: -5 },
  { id: 13, label: "Yoga Class", type: "healing", icon: "🧘", desc: "Corrective yoga session", points: +8 },
  { id: 14, label: "Emergency Visit", type: "pain", icon: "🚑", desc: "Severe flare — back to square one", points: -15 },
  { id: 15, label: "Group Healing", type: "healing", icon: "👥", desc: "Coherence healing session", points: +15 },
  { id: 16, label: "Habit Formed!", type: "asset", icon: "⭐", desc: "New healing habit locked in", points: +20 },
];

const healingTrackCells = [
  { id: 17, label: "Self-Managing", type: "milestone", icon: "🎯", desc: "No longer need weekly appointments", points: +10 },
  { id: 18, label: "Pain-Free Week", type: "milestone", icon: "🌈", desc: "Full week with zero pain", points: +15 },
  { id: 19, label: "Teach Others", type: "milestone", icon: "🎓", desc: "Help another patient with their journey", points: +20 },
  { id: 20, label: "Community Coach", type: "milestone", icon: "👑", desc: "Lead a group healing session", points: +25 },
  { id: 21, label: "Purpose Found", type: "milestone", icon: "🌟", desc: "Pain became your teacher — you found purpose", points: +30 },
  { id: 22, label: "REGENERATION!", type: "victory", icon: "🏆", desc: "Spine regenerating. You WON the game!", points: +50 },
];

// ─── ASSET & LIABILITY CARDS ───
const assetCards = [
  { name: "Daily Meditation Habit", passivePoints: +5, cost: "21 days to build", icon: "🧠" },
  { name: "Corrective Exercise Routine", passivePoints: +4, cost: "14 days consistent", icon: "💪" },
  { name: "Ergonomic Workspace", passivePoints: +2, cost: "₹5,000 investment", icon: "🪑" },
  { name: "Anti-Inflammatory Diet", passivePoints: +3, cost: "30 days clean eating", icon: "🥗" },
  { name: "Quality Sleep Setup", passivePoints: +2, cost: "Orthopedic mattress + routine", icon: "🛏️" },
  { name: "Panchakarma Course Complete", passivePoints: +6, cost: "14-day full course", icon: "🌿" },
  { name: "Dispenza 8-Week Protocol", passivePoints: +7, cost: "8 weeks daily practice", icon: "✨" },
  { name: "Walking 10K Steps Daily", passivePoints: +3, cost: "Build over 4 weeks", icon: "🚶" },
  { name: "Community Support Group", passivePoints: +2, cost: "Join + attend weekly", icon: "👥" },
  { name: "Stress Management Mastery", passivePoints: +4, cost: "Breath + boundaries", icon: "🕊️" },
];

const liabilityCards = [
  { name: "Sedentary Desk Job", passiveDrain: -4, fix: "Stand-up breaks every 45 min", icon: "💻" },
  { name: "Old Mattress (>5 years)", passiveDrain: -3, fix: "Replace with orthopedic", icon: "🛏️" },
  { name: "Chronic Stress (unmanaged)", passiveDrain: -5, fix: "Meditation + boundaries", icon: "😰" },
  { name: "Obesity (BMI > 30)", passiveDrain: -4, fix: "Diet + walking program", icon: "⚖️" },
  { name: "Smoking", passiveDrain: -3, fix: "Quit — damages disc nutrition", icon: "🚬" },
  { name: "Incomplete Treatment", passiveDrain: -6, fix: "Complete the full course", icon: "⏸️" },
  { name: "Negative Mindset", passiveDrain: -3, fix: "Journal + Future Self meditation", icon: "🌧️" },
  { name: "No Exercise Habit", passiveDrain: -5, fix: "Start with 10 min/day", icon: "🛋️" },
];

// ─── MAIN COMPONENT ───
export default function SpineCashflowGame() {
  const [playerPosition, setPlayerPosition] = useState(0);
  const [healingPoints, setHealingPoints] = useState(0);
  const [painPoints, setPainPoints] = useState(0);
  const [weekNumber, setWeekNumber] = useState(1);
  const [isOnHealingTrack, setIsOnHealingTrack] = useState(false);
  const [consecutivePositiveWeeks, setConsecutivePositiveWeeks] = useState(0);
  const [ownedAssets, setOwnedAssets] = useState<string[]>([]);
  const [activeLiabilities, setActiveLiabilities] = useState<string[]>(["Sedentary Desk Job", "No Exercise Habit"]);
  const [gameLog, setGameLog] = useState<string[]>(["Game started! You're in the Pain Cycle. Build healing assets to escape."]);
  const [activeTab, setActiveTab] = useState("how-to-play");
  const [diceResult, setDiceResult] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);

  const totalPassiveHealing = ownedAssets.reduce((sum, name) => {
    const asset = assetCards.find(a => a.name === name);
    return sum + (asset?.passivePoints || 0);
  }, 0);

  const totalPassiveDrain = activeLiabilities.reduce((sum, name) => {
    const liability = liabilityCards.find(l => l.name === name);
    return sum + (liability?.passiveDrain || 0);
  }, 0);

  const netWeekly = healingPoints + totalPassiveHealing + painPoints + totalPassiveDrain;
  const escapeProgress = Math.min(100, (consecutivePositiveWeeks / 4) * 100);

  const rollDice = () => {
    const roll = Math.floor(Math.random() * 6) + 1;
    setDiceResult(roll);

    const cells = isOnHealingTrack ? healingTrackCells : painCycleCells;
    const newPos = (playerPosition + roll) % cells.length;
    setPlayerPosition(newPos);

    const cell = cells[newPos];
    const points = cell.points;

    if (points > 0) {
      setHealingPoints(prev => prev + points);
    } else {
      setPainPoints(prev => prev + points);
    }

    const logMsg = `Week ${weekNumber}: Rolled ${roll} → ${cell.icon} ${cell.label} (${points > 0 ? "+" : ""}${points} pts) — ${cell.desc}`;
    setGameLog(prev => [logMsg, ...prev.slice(0, 19)]);

    // Check escape condition
    if (netWeekly + points > 0) {
      setConsecutivePositiveWeeks(prev => prev + 1);
      if (consecutivePositiveWeeks + 1 >= 4 && !isOnHealingTrack) {
        setIsOnHealingTrack(true);
        setPlayerPosition(0);
        toast.success("🎉 You ESCAPED the Pain Cycle! Welcome to the Healing Track!");
        setGameLog(prev => ["🎉 ESCAPED THE PAIN CYCLE! Entered Healing Track!", ...prev]);
      }
    } else {
      setConsecutivePositiveWeeks(0);
    }

    setWeekNumber(prev => prev + 1);

    // Victory check
    if (isOnHealingTrack && newPos >= healingTrackCells.length - 1) {
      toast.success("🏆 REGENERATION COMPLETE! You won the game! Pain → Purpose achieved!");
      setGameLog(prev => ["🏆 VICTORY! Degeneration → Regeneration complete!", ...prev]);
    }
  };

  const acquireAsset = (assetName: string) => {
    if (!ownedAssets.includes(assetName)) {
      setOwnedAssets([...ownedAssets, assetName]);
      setHealingPoints(prev => prev + 5);
      toast.success(`Asset acquired: ${assetName}`);
      setGameLog(prev => [`✅ Asset acquired: ${assetName}`, ...prev]);
    }
  };

  const removeLiability = (liabilityName: string) => {
    setActiveLiabilities(activeLiabilities.filter(l => l !== liabilityName));
    setHealingPoints(prev => prev + 3);
    toast.success(`Liability eliminated: ${liabilityName}`);
    setGameLog(prev => [`🗑️ Liability removed: ${liabilityName}`, ...prev]);
  };

  const resetGame = () => {
    setPlayerPosition(0); setHealingPoints(0); setPainPoints(0);
    setWeekNumber(1); setIsOnHealingTrack(false); setConsecutivePositiveWeeks(0);
    setOwnedAssets([]); setActiveLiabilities(["Sedentary Desk Job", "No Exercise Habit"]);
    setGameLog(["Game reset! Starting fresh in the Pain Cycle."]);
    setDiceResult(0);
    toast("Game reset!");
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Dices className="w-7 h-7 text-purple-600" />
            Spine Cashflow Game
          </h1>
          <p className="text-gray-600 mt-1">Pain to Purpose — Degeneration to Regeneration</p>
        </div>
        <div className="flex gap-2">
          <Badge className={isOnHealingTrack ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
            {isOnHealingTrack ? "🌟 HEALING TRACK" : "🔄 PAIN CYCLE"}
          </Badge>
          <Badge variant="outline">Week {weekNumber}</Badge>
          <Button size="sm" variant="outline" onClick={resetGame}>
            <RotateCcw className="w-3 h-3 mr-1" /> Reset
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)}>
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="how-to-play">How to Play</TabsTrigger>
          <TabsTrigger value="game">Game Board</TabsTrigger>
          <TabsTrigger value="statement">Health Statement</TabsTrigger>
          <TabsTrigger value="assets">Assets & Liabilities</TabsTrigger>
        </TabsList>

        {/* ─── HOW TO PLAY TAB ─── */}
        <TabsContent value="how-to-play" className="space-y-4">
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <BookHeart className="w-6 h-6 text-purple-600" />
                How to Play — Spine Cashflow Game
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Concept */}
              <div className="p-4 bg-white/70 rounded-lg border">
                <h3 className="font-bold text-lg mb-2">🎯 The Concept</h3>
                <p className="text-sm text-gray-700">
                  Just like Robert Kiyosaki's Cashflow Game teaches you to escape the "Rat Race" by building passive income,
                  this game teaches you to escape the <strong>"Pain Cycle"</strong> by building <strong>"Healing Assets"</strong> — habits,
                  treatments, and mindset shifts that heal your spine permanently.
                </p>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="p-3 bg-red-50 rounded border border-red-200 text-center">
                    <p className="text-2xl">🔄</p>
                    <p className="font-bold text-red-700 text-sm">Pain Cycle</p>
                    <p className="text-xs text-red-600">Trapped by pain, pills, emergency visits</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded border border-green-200 text-center">
                    <p className="text-2xl">🌟</p>
                    <p className="font-bold text-green-700 text-sm">Healing Track</p>
                    <p className="text-xs text-green-600">Self-managing, pain-free, thriving</p>
                  </div>
                </div>
              </div>

              {/* Rules */}
              <div className="p-4 bg-white/70 rounded-lg border">
                <h3 className="font-bold text-lg mb-2">📜 Rules</h3>
                <ol className="space-y-2 text-sm text-gray-700 list-decimal ml-4">
                  <li><strong>Roll the dice</strong> each week. You land on a cell that gives or takes healing points.</li>
                  <li><strong>Build Healing Assets</strong> (habits that give you PASSIVE healing every week — like passive income).</li>
                  <li><strong>Eliminate Pain Liabilities</strong> (things that drain your healing every week — like expenses).</li>
                  <li><strong>Escape Condition:</strong> Get 4 consecutive weeks where your NET healing is positive.</li>
                  <li>Once you escape, you enter the <strong>Healing Track</strong> — the fast track to REGENERATION.</li>
                  <li><strong>WIN</strong> by reaching "REGENERATION" on the Healing Track. Pain → Purpose achieved!</li>
                </ol>
              </div>

              {/* Key Terms */}
              <div className="p-4 bg-white/70 rounded-lg border">
                <h3 className="font-bold text-lg mb-2">📖 Key Terms (Kiyosaki → Spine)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {[
                    ["Income", "Healing Points", "Points from treatments, exercise, meditation"],
                    ["Expenses", "Pain Points", "Points lost to pain flares, bad habits, stress"],
                    ["Assets", "Healing Assets", "Habits that give PASSIVE healing weekly"],
                    ["Liabilities", "Pain Liabilities", "Things that DRAIN your healing weekly"],
                    ["Passive Income", "Passive Healing", "Habits heal you without effort"],
                    ["Rat Race", "Pain Cycle", "Trapped in pain-pill-pain loop"],
                    ["Fast Track", "Healing Track", "Self-managing, purpose-driven"],
                    ["Financial Freedom", "Regeneration", "Spine regenerating, pain-free life"],
                  ].map(([kiyo, spine, desc], i) => (
                    <div key={i} className="flex gap-2 p-2 rounded bg-gray-50 border">
                      <span className="text-xs text-gray-400 line-through w-24 shrink-0">{kiyo}</span>
                      <span className="text-xs font-bold text-purple-700 w-28 shrink-0">{spine}</span>
                      <span className="text-xs text-gray-600">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strategy Tips */}
              <div className="p-4 bg-white/70 rounded-lg border">
                <h3 className="font-bold text-lg mb-2">💡 Winning Strategy</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>🔑 <strong>Focus on ASSETS first</strong> — one new healing habit per week. Each asset gives you passive healing FOREVER.</p>
                  <p>🔑 <strong>Eliminate LIABILITIES</strong> — each one removed stops the bleeding. Fix the easy ones first.</p>
                  <p>🔑 <strong>Passive Healing must exceed Passive Drain</strong> — this is how you escape. Just like passive income &gt; expenses.</p>
                  <p>🔑 <strong>Consistency wins</strong> — 4 positive weeks in a row. One bad week resets the counter.</p>
                  <p>🔑 <strong>Dispenza meditation</strong> is your highest-value asset (+7 passive). Invest the 8 weeks.</p>
                </div>
              </div>

              {/* Journey Map */}
              <div className="p-4 bg-white/70 rounded-lg border">
                <h3 className="font-bold text-lg mb-2">🗺️ Your Journey</h3>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {["🔥 Pain", "→", "💊 Quick Fixes", "→", "🌿 Real Treatment", "→", "💪 Habits", "→", "⭐ Assets", "→", "🎯 Escape", "→", "🌟 Healing", "→", "🏆 Regeneration"].map((step, i) => (
                    <span key={i} className={`shrink-0 text-xs px-2 py-1 rounded ${
                      step.includes("→") ? "text-gray-400" :
                      step.includes("Pain") || step.includes("Quick") ? "bg-red-50 text-red-700 border border-red-200" :
                      step.includes("Regeneration") || step.includes("Healing") ? "bg-green-50 text-green-700 border border-green-200" :
                      "bg-purple-50 text-purple-700 border border-purple-200"
                    }`}>{step}</span>
                  ))}
                </div>
              </div>

              <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => setActiveTab("game")}>
                <Dices className="w-4 h-4 mr-2" /> Start Playing!
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── GAME BOARD TAB ─── */}
        <TabsContent value="game" className="space-y-4">
          {/* Dice + Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-purple-200 bg-purple-50/50">
              <CardContent className="p-4 text-center">
                <p className="text-5xl font-bold mb-2">{diceResult || "🎲"}</p>
                <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={rollDice}>
                  <Dices className="w-4 h-4 mr-2" /> Roll Dice (Next Week)
                </Button>
                <p className="text-xs text-gray-500 mt-2">Each roll = 1 week of your real life</p>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-gray-500 uppercase">Escape Progress</p>
                <p className="text-2xl font-bold text-green-700">{consecutivePositiveWeeks}/4 weeks</p>
                <Progress value={escapeProgress} className="mt-2 h-3" />
                <p className="text-[10px] text-gray-500 mt-1">4 consecutive positive weeks to escape</p>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-gray-500 uppercase">Net Weekly</p>
                <p className={`text-2xl font-bold ${netWeekly >= 0 ? "text-green-700" : "text-red-700"}`}>
                  {netWeekly >= 0 ? "+" : ""}{netWeekly} pts
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                  Healing: +{healingPoints + totalPassiveHealing} | Pain: {painPoints + totalPassiveDrain}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Visual Board */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                {isOnHealingTrack ? (
                  <><Sparkles className="w-5 h-5 text-green-500" /> Healing Track (Fast Track)</>
                ) : (
                  <><RotateCcw className="w-5 h-5 text-red-500" /> Pain Cycle (Escape This!)</>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {(isOnHealingTrack ? healingTrackCells : painCycleCells).map((cell, idx) => (
                  <div
                    key={cell.id}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      idx === playerPosition ? "ring-2 ring-purple-500 bg-purple-100 shadow-lg scale-105" :
                      cell.type === "pain" ? "bg-red-50 border-red-200" :
                      cell.type === "healing" ? "bg-green-50 border-green-200" :
                      cell.type === "asset" ? "bg-amber-50 border-amber-200" :
                      cell.type === "milestone" ? "bg-blue-50 border-blue-200" :
                      cell.type === "victory" ? "bg-gradient-to-br from-amber-100 to-yellow-100 border-amber-300" :
                      "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <span className="text-lg">{cell.icon}</span>
                    <p className="text-[9px] font-medium mt-0.5 leading-tight">{cell.label}</p>
                    <p className={`text-[9px] font-bold ${cell.points > 0 ? "text-green-600" : "text-red-600"}`}>
                      {cell.points > 0 ? "+" : ""}{cell.points}
                    </p>
                  </div>
                ))}
              </div>
              {playerPosition > 0 && (
                <div className="mt-3 p-3 rounded-lg bg-gray-50 border">
                  <p className="text-sm">
                    <span className="text-lg mr-2">{(isOnHealingTrack ? healingTrackCells : painCycleCells)[playerPosition]?.icon}</span>
                    <strong>{(isOnHealingTrack ? healingTrackCells : painCycleCells)[playerPosition]?.label}:</strong>{" "}
                    {(isOnHealingTrack ? healingTrackCells : painCycleCells)[playerPosition]?.desc}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Game Log */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">📋 Game Log (Recent Events)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {gameLog.map((log, i) => (
                  <p key={i} className={`text-xs ${i === 0 ? "font-semibold text-purple-700" : "text-gray-600"}`}>{log}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── HEALTH STATEMENT TAB ─── */}
        <TabsContent value="statement" className="space-y-4">
          <Card className="border-2 border-purple-300">
            <CardHeader className="bg-purple-50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                Your Health Statement
              </CardTitle>
              <p className="text-xs text-gray-600">Like a financial statement — but for your spine healing</p>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Income Section */}
              <div>
                <h4 className="font-semibold text-green-700 flex items-center gap-1 mb-2">
                  <TrendingUp className="w-4 h-4" /> HEALING INCOME (This Game)
                </h4>
                <div className="p-3 bg-green-50 rounded border border-green-200">
                  <div className="flex justify-between text-sm">
                    <span>From dice rolls (treatments, exercise, meditation)</span>
                    <span className="font-bold text-green-700">+{healingPoints}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>Passive from Assets ({ownedAssets.length} assets)</span>
                    <span className="font-bold text-green-700">+{totalPassiveHealing}/week</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold text-green-800">
                    <span>Total Healing Income</span>
                    <span>+{healingPoints + totalPassiveHealing}</span>
                  </div>
                </div>
              </div>

              {/* Expense Section */}
              <div>
                <h4 className="font-semibold text-red-700 flex items-center gap-1 mb-2">
                  <TrendingDown className="w-4 h-4" /> PAIN EXPENSES (Draining You)
                </h4>
                <div className="p-3 bg-red-50 rounded border border-red-200">
                  <div className="flex justify-between text-sm">
                    <span>From dice rolls (pain flares, bad habits)</span>
                    <span className="font-bold text-red-700">{painPoints}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>Passive from Liabilities ({activeLiabilities.length} liabilities)</span>
                    <span className="font-bold text-red-700">{totalPassiveDrain}/week</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold text-red-800">
                    <span>Total Pain Expenses</span>
                    <span>{painPoints + totalPassiveDrain}</span>
                  </div>
                </div>
              </div>

              {/* Net */}
              <div className={`p-4 rounded-lg border-2 text-center ${netWeekly >= 0 ? "border-green-400 bg-green-50" : "border-red-400 bg-red-50"}`}>
                <p className="text-sm font-medium text-gray-600">NET HEALING (Income - Expenses)</p>
                <p className={`text-3xl font-bold ${netWeekly >= 0 ? "text-green-700" : "text-red-700"}`}>
                  {netWeekly >= 0 ? "+" : ""}{netWeekly} pts/week
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {netWeekly >= 0
                    ? `✓ POSITIVE! ${4 - consecutivePositiveWeeks} more positive weeks to escape.`
                    : "✗ NEGATIVE — build more assets or remove liabilities!"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── ASSETS & LIABILITIES TAB ─── */}
        <TabsContent value="assets" className="space-y-4">
          {/* Assets */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Healing Assets (Build These!)
              </CardTitle>
              <p className="text-xs text-gray-600">Each asset gives you PASSIVE healing every week — like passive income</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {assetCards.map((asset, i) => {
                const owned = ownedAssets.includes(asset.name);
                return (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    owned ? "border-green-300 bg-green-50" : "border-gray-200 hover:border-green-200"
                  }`}>
                    <span className="text-xl">{asset.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{asset.name}</p>
                      <p className="text-xs text-gray-500">Investment: {asset.cost}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-300">
                      +{asset.passivePoints}/week
                    </Badge>
                    {owned ? (
                      <Badge className="bg-green-500 text-white">✓ Owned</Badge>
                    ) : (
                      <Button size="sm" variant="outline" className="text-xs border-green-300 text-green-700"
                        onClick={() => acquireAsset(asset.name)}>
                        Acquire
                      </Button>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Liabilities */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Pain Liabilities (Eliminate These!)
              </CardTitle>
              <p className="text-xs text-gray-600">Each liability DRAINS your healing every week — like monthly expenses</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {liabilityCards.map((liability, i) => {
                const active = activeLiabilities.includes(liability.name);
                return (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    active ? "border-red-300 bg-red-50" : "border-gray-200 opacity-50"
                  }`}>
                    <span className="text-xl">{liability.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{liability.name}</p>
                      <p className="text-xs text-gray-500">Fix: {liability.fix}</p>
                    </div>
                    <Badge className="bg-red-100 text-red-700 border-red-300">
                      {liability.passiveDrain}/week
                    </Badge>
                    {active ? (
                      <Button size="sm" variant="outline" className="text-xs border-red-300 text-red-700"
                        onClick={() => removeLiability(liability.name)}>
                        Eliminate
                      </Button>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-500">✓ Fixed</Badge>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
