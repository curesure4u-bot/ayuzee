import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Heart, Plus, Trash2, Sun, Sparkles, Calendar } from "lucide-react";

type GratitudeEntry = {
  id: string;
  date: string;
  items: string[];
  affirmation: string;
};

const uid = () => crypto.randomUUID();

const sampleEntries: GratitudeEntry[] = [
  { id: uid(), date: new Date().toISOString().split("T")[0], items: ["My health and energy today", "A kind patient who brought sweets", "Sunny weather for the morning walk"], affirmation: "I am grateful for the abundance in my life and the people I serve." },
  { id: uid(), date: new Date(Date.now() - 86400000).toISOString().split("T")[0], items: ["Successfully treated a chronic case", "Good conversation with a colleague", "Healthy home-cooked meal"], affirmation: "Every day I grow stronger in skill and compassion." },
  { id: uid(), date: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0], items: ["A patient's recovery milestone", "Time with family in the evening", "Learning something new from a research paper"], affirmation: "I am exactly where I need to be on my journey." },
  { id: uid(), date: new Date(Date.now() - 86400000 * 3).toISOString().split("T")[0], items: ["The clinic running smoothly", "Support from my team", "A quiet moment of meditation"], affirmation: "I create peace and healing wherever I go." },
];

const SAMPLE_AFFIRMATIONS = [
  "I am capable of achieving great things.",
  "I attract health, abundance, and joy.",
  "My work makes a meaningful difference in people's lives.",
  "I am growing stronger and wiser every day.",
  "I deserve rest, peace, and happiness.",
  "I trust the journey and embrace each day.",
  "I am grateful for all that I have and all that is coming.",
  "My patients heal because I care deeply.",
];

const TaskTrackerGratitude = () => {
  const [entries, setEntries] = useState<GratitudeEntry[]>(sampleEntries);
  const [item1, setItem1] = useState("");
  const [item2, setItem2] = useState("");
  const [item3, setItem3] = useState("");
  const [affirmation, setAffirmation] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const hasTodayEntry = entries.some(e => e.date === today);
  const streak = useMemo(() => {
    let count = 0;
    const d = new Date();
    while (true) {
      const dateStr = d.toISOString().split("T")[0];
      if (entries.some(e => e.date === dateStr)) { count++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return count;
  }, [entries]);

  const saveToday = () => {
    const items = [item1, item2, item3].filter(i => i.trim());
    if (items.length === 0) { toast.error("Write at least one gratitude"); return; }
    const existing = entries.find(e => e.date === today);
    if (existing) {
      setEntries(prev => prev.map(e => e.date === today ? { ...e, items, affirmation } : e));
      toast.success("Updated today's gratitude");
    } else {
      setEntries(prev => [{ id: uid(), date: today, items, affirmation }, ...prev]);
      toast.success("Gratitude saved! Beautiful.");
    }
    setItem1(""); setItem2(""); setItem3(""); setAffirmation("");
  };

  const randomAffirmation = () => {
    const random = SAMPLE_AFFIRMATIONS[Math.floor(Math.random() * SAMPLE_AFFIRMATIONS.length)];
    setAffirmation(random);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2"><Heart className="h-6 w-6 text-rose-500" /> Gratitude & Affirmations</h1>
          <p className="text-sm text-muted-foreground">3 things you're grateful for + a daily affirmation</p>
        </div>
        <Badge variant="outline" className="text-sm px-3 py-1.5"><Sparkles className="mr-1 h-3.5 w-3.5 text-amber-500" />{streak} day streak</Badge>
      </div>

      {/* Today's Entry */}
      <Card className={`border-rose-200 ${hasTodayEntry ? "bg-green-50/30 border-green-200" : "bg-rose-50/30"}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sun className="h-4 w-4 text-amber-500" />
            {hasTodayEntry ? "Today's Gratitude (saved)" : "Today's Gratitude"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">1.</span>
              <Input value={item1} onChange={e => setItem1(e.target.value)} placeholder="I'm grateful for..." className="border-rose-200" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">2.</span>
              <Input value={item2} onChange={e => setItem2(e.target.value)} placeholder="I'm grateful for..." className="border-rose-200" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">3.</span>
              <Input value={item3} onChange={e => setItem3(e.target.value)} placeholder="I'm grateful for..." className="border-rose-200" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Today's Affirmation</Label>
              <Button variant="ghost" size="sm" className="h-5 text-[10px] text-rose-500" onClick={randomAffirmation}>
                <Sparkles className="mr-0.5 h-3 w-3" /> Random
              </Button>
            </div>
            <Input value={affirmation} onChange={e => setAffirmation(e.target.value)} placeholder="I am... I have... I create..." className="border-rose-200 italic" />
          </div>
          <Button onClick={saveToday} className="w-full bg-rose-500 hover:bg-rose-600">
            <Heart className="mr-1 h-4 w-4" /> {hasTodayEntry ? "Update" : "Save"} Gratitude
          </Button>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center">
          <Heart className="h-5 w-5 mx-auto text-rose-500 mb-1" />
          <p className="text-xl font-bold">{entries.length}</p>
          <p className="text-[10px] text-muted-foreground">Total Entries</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Sparkles className="h-5 w-5 mx-auto text-amber-500 mb-1" />
          <p className="text-xl font-bold">{streak}</p>
          <p className="text-[10px] text-muted-foreground">Day Streak</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Sun className="h-5 w-5 mx-auto text-orange-500 mb-1" />
          <p className="text-xl font-bold">{entries.reduce((s, e) => s + e.items.length, 0)}</p>
          <p className="text-[10px] text-muted-foreground">Total Gratitudes</p>
        </CardContent></Card>
      </div>

      {/* Past Entries */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold">Previous Entries</h2>
        {entries.map(entry => (
          <Card key={entry.id} className="hover:shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Badge variant="outline" className="text-[9px] mb-2"><Calendar className="mr-0.5 h-2.5 w-2.5" />{entry.date}</Badge>
                  <ol className="space-y-1 list-decimal list-inside text-sm">
                    {entry.items.map((item, i) => <li key={i}>{item}</li>)}
                  </ol>
                  {entry.affirmation && (
                    <p className="mt-2 text-xs italic text-rose-600 flex items-start gap-1">
                      <Heart className="h-3 w-3 shrink-0 mt-0.5" /> "{entry.affirmation}"
                    </p>
                  )}
                </div>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-red-400" onClick={() => setEntries(prev => prev.filter(e => e.id !== entry.id))}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TaskTrackerGratitude;
