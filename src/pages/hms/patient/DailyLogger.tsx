import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Activity, Droplets, Moon, Timer, BarChart3, Plus, Play, Square } from "lucide-react";

// ─── Mock Data ───
const patient = { name: "Mr. Rajesh Kumar", prakriti: "Pitta-Vata" };

const mealsData = [
  { time: "07:30", type: "Breakfast", food: "Poha with coriander, buttermilk", pathya: true },
  { time: "10:00", type: "Snack", food: "Coconut water + dates", pathya: true },
  { time: "13:00", type: "Lunch", food: "Rice, dal, lauki sabzi, salad", pathya: true },
  { time: "16:30", type: "Snack", food: "Roasted makhana", pathya: true },
  { time: "20:00", type: "Dinner", food: "Spicy paneer tikka, garlic naan", pathya: false },
];

const weeklyMealCompliance = [
  { day: "Mon", compliant: true }, { day: "Tue", compliant: true },
  { day: "Wed", compliant: false }, { day: "Thu", compliant: true },
  { day: "Fri", compliant: true }, { day: "Sat", compliant: true },
  { day: "Sun", compliant: true },
];

const waterLog = [
  { time: "06:30", ml: 250 }, { time: "08:00", ml: 250 }, { time: "09:30", ml: 250 },
  { time: "11:00", ml: 250 }, { time: "12:30", ml: 250 }, { time: "14:00", ml: 250 },
  { time: "16:00", ml: 250 }, { time: "18:00", ml: 250 },
];

const sleepWeekly = [
  { day: "Mon", hours: 7, quality: 4 }, { day: "Tue", hours: 6.5, quality: 3 },
  { day: "Wed", hours: 8, quality: 5 }, { day: "Thu", hours: 7.5, quality: 4 },
  { day: "Fri", hours: 7, quality: 4 }, { day: "Sat", hours: 8, quality: 5 },
  { day: "Sun", hours: 7.5, quality: 4 },
];

const fastingDays = [3, 7, 11, 17, 21, 25];

const DailyLogger = () => {
  const [waterCount, setWaterCount] = useState(8);
  const [fastingActive, setFastingActive] = useState(false);
  const [fastingElapsed, setFastingElapsed] = useState(0);
  const waterTarget = 10; // Pitta

  const addWater = () => {
    if (waterCount < waterTarget) {
      setWaterCount(waterCount + 1);
      toast.success("Glass logged!");
    } else {
      toast.info("Daily target already met!");
    }
  };

  const toggleFasting = () => {
    setFastingActive(!fastingActive);
    if (!fastingActive) { setFastingElapsed(0); toast.success("Fasting timer started"); }
    else { toast.success("Fasting ended — well done!"); }
  };

  const pathyaCount = mealsData.filter(m => m.pathya).length;

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Daily Health Logger</h1>
          <p className="text-muted-foreground">{patient.name} · Prakriti: {patient.prakriti}</p>
        </div>
        <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">5-day streak</Badge>
      </div>

      <Tabs defaultValue="meals" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="meals"><Activity className="h-4 w-4 mr-1 hidden sm:inline" />Meals</TabsTrigger>
          <TabsTrigger value="water"><Droplets className="h-4 w-4 mr-1 hidden sm:inline" />Water</TabsTrigger>
          <TabsTrigger value="sleep"><Moon className="h-4 w-4 mr-1 hidden sm:inline" />Sleep</TabsTrigger>
          <TabsTrigger value="fasting"><Timer className="h-4 w-4 mr-1 hidden sm:inline" />Fasting</TabsTrigger>
          <TabsTrigger value="summary"><BarChart3 className="h-4 w-4 mr-1 hidden sm:inline" />Summary</TabsTrigger>
        </TabsList>

        {/* ─── MEALS TAB ─── */}
        <TabsContent value="meals" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                Today's Meals
                <Badge className={pathyaCount >= 4 ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>
                  {pathyaCount}/{mealsData.length} Pathya-compliant
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mealsData.map((meal, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${meal.pathya ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"}`}>
                  <span className="text-2xl">{meal.pathya ? "✅" : "❌"}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{meal.type}</span>
                      <span className="text-xs text-muted-foreground">{meal.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{meal.food}</p>
                  </div>
                  {!meal.pathya && <Badge variant="destructive" className="text-xs">Apathya</Badge>}
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full"><Plus className="h-4 w-4 mr-1" />Log Meal</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Weekly Compliance</CardTitle></CardHeader>
            <CardContent>
              <div className="flex justify-between">
                {weeklyMealCompliance.map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className={`h-4 w-4 rounded-full ${d.compliant ? "bg-green-500" : "bg-red-500"}`} />
                    <span className="text-xs">{d.day}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── WATER TAB ─── */}
        <TabsContent value="water" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Hydration Tracker</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-600">{waterCount}/{waterTarget}</p>
                <p className="text-sm text-muted-foreground">glasses (250ml each) · Target for Pitta: {waterTarget}</p>
              </div>
              <Progress value={(waterCount / waterTarget) * 100} className="h-3" />
              <Button onClick={addWater} className="w-full"><Droplets className="h-4 w-4 mr-2" />Add Glass</Button>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800 font-medium">Hydration Streak: 4 days</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">AYUSH Note: "Ushna Jala (warm water) recommended for your Kapha tendency"</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Today's Log</p>
                <div className="grid grid-cols-4 gap-2">
                  {waterLog.map((w, i) => (
                    <div key={i} className="text-center p-2 bg-blue-50 rounded text-xs">
                      <Droplets className="h-3 w-3 mx-auto text-blue-500 mb-1" />{w.time}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── SLEEP TAB ─── */}
        <TabsContent value="sleep" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-lg">Nidra (Sleep) Logger</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-muted-foreground">Bedtime</label><Input type="time" defaultValue="22:30" /></div>
                <div><label className="text-xs text-muted-foreground">Wake time</label><Input type="time" defaultValue="06:00" /></div>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div><p className="font-medium">Total: 7.5 hrs</p><p className="text-sm text-muted-foreground">Quality: {"⭐".repeat(4)}{"☆".repeat(1)}</p></div>
                <Badge className="bg-purple-100 text-purple-800">Score: 82/100</Badge>
              </div>
              <div><label className="text-xs text-muted-foreground">Dream Log (optional)</label><Input placeholder="Describe any dreams..." /></div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">Sleeping before 10 PM (Kapha kala) = better quality for Pitta Prakriti</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">Nadi Stress Correlation: Low stress detected — sleep quality improving</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Weekly Trend</p>
                <div className="flex justify-between items-end gap-1">
                  {sleepWeekly.map((d, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className="bg-purple-400 rounded w-6" style={{ height: `${d.hours * 8}px` }} />
                      <span className="text-[10px]">{d.hours}h</span>
                      <span className="text-[10px]">{"⭐".repeat(d.quality)}</span>
                      <span className="text-xs">{d.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── FASTING TAB ─── */}
        <TabsContent value="fasting" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-lg">Langhana (Fasting) Tracker</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-3xl font-bold text-orange-700">{fastingActive ? "04:32:15" : "00:00:00"}</p>
                <p className="text-sm text-muted-foreground mt-1">{fastingActive ? "Fasting in progress..." : "Start when ready"}</p>
              </div>
              <Button onClick={toggleFasting} variant={fastingActive ? "destructive" : "default"} className="w-full">
                {fastingActive ? <><Square className="h-4 w-4 mr-2" />End Fast</> : <><Play className="h-4 w-4 mr-2" />Start Fast</>}
              </Button>
              <div>
                <p className="text-sm font-medium mb-2">Fasting Type</p>
                <div className="grid grid-cols-2 gap-2">
                  {["Ekadashi", "Upavasa (water only)", "Laghu Ahara (light food)", "Pre-PK Langhana"].map((t, i) => (
                    <Button key={i} variant="outline" size="sm" className="text-xs">{t}</Button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">This Month's Fasting Days</p>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 30 }, (_, i) => (
                    <div key={i} className={`h-8 w-full rounded flex items-center justify-center text-xs ${fastingDays.includes(i + 1) ? "bg-orange-200 text-orange-800 font-bold" : "bg-muted"}`}>
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">Benefits: Weight change during fasting: -0.3 kg</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">AYUSH: "Langhana is Apatarpana Chikitsa — lightens body, ignites Agni"</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── SUMMARY TAB ─── */}
        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-lg">Today's Overview</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-sm font-medium">Meals</p><p className="text-lg font-bold text-green-700">4/5 compliant</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-sm font-medium">Water</p><p className="text-lg font-bold text-blue-700">8/10 glasses</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                  <p className="text-sm font-medium">Sleep</p><p className="text-lg font-bold text-purple-700">7.5 hrs (4/5)</p>
                </div>
                <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                  <p className="text-sm font-medium">Fasting</p><p className="text-lg font-bold text-orange-700">None today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-lg">Goals Progress</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><div className="flex justify-between text-sm mb-1"><span>Lose 3kg</span><span>1.2kg done (40%)</span></div><Progress value={40} className="h-2" /></div>
              <div><div className="flex justify-between text-sm mb-1"><span>Follow Pathya 90%</span><span>82% this week</span></div><Progress value={82} className="h-2" /></div>
              <div><div className="flex justify-between text-sm mb-1"><span>Sleep by 10 PM</span><span>5/7 days</span></div><Progress value={71} className="h-2" /></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-lg">Badges Earned</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-orange-100 text-orange-800 text-sm py-1">7-day streak 🔥</Badge>
                <Badge className="bg-green-100 text-green-800 text-sm py-1">100% Pathya day 🌿</Badge>
                <Badge className="bg-amber-100 text-amber-800 text-sm py-1">Early riser 🌅</Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-primary">AI Insight</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm">Your Pitta is better controlled this week. Meal compliance improved from 72% to 82%. Continue avoiding sour foods at dinner.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DailyLogger;
