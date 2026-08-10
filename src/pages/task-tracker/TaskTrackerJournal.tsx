import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { BookOpen, Plus, Trash2, Calendar, Heart, Sun } from "lucide-react";

type JournalEntry = {
  id: string;
  entry_date: string;
  content: string;
  mood: "great" | "good" | "neutral" | "low" | "bad";
  created_at: string;
};

const MOODS: { value: JournalEntry["mood"]; emoji: string; label: string; color: string }[] = [
  { value: "great", emoji: "🌟", label: "Great", color: "bg-green-100 text-green-700 border-green-200" },
  { value: "good", emoji: "😊", label: "Good", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "neutral", emoji: "😐", label: "Neutral", color: "bg-gray-100 text-gray-700 border-gray-200" },
  { value: "low", emoji: "😔", label: "Low", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "bad", emoji: "😢", label: "Bad", color: "bg-red-100 text-red-700 border-red-200" },
];

const uid = () => crypto.randomUUID();

const sampleEntries: JournalEntry[] = [
  {
    id: uid(), entry_date: new Date().toISOString().split("T")[0],
    content: "Had a productive morning. Finished the patient reports early and took a short walk during lunch. Feeling energized about the new treatment protocol we're implementing.",
    mood: "great", created_at: new Date().toISOString(),
  },
  {
    id: uid(), entry_date: (() => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split("T")[0]; })(),
    content: "Long day at the clinic. Three back-to-back consultations but managed to stay on schedule. Need to review the Panchakarma protocol for tomorrow's patient.",
    mood: "good", created_at: new Date().toISOString(),
  },
  {
    id: uid(), entry_date: (() => { const d = new Date(); d.setDate(d.getDate() - 2); return d.toISOString().split("T")[0]; })(),
    content: "Quiet day. Spent time reading research papers on Ayurvedic approaches to chronic pain management. Found some interesting references to explore further.",
    mood: "neutral", created_at: new Date().toISOString(),
  },
  {
    id: uid(), entry_date: (() => { const d = new Date(); d.setDate(d.getDate() - 4); return d.toISOString().split("T")[0]; })(),
    content: "Challenging case today — patient not responding as expected to treatment. Consulted with a senior colleague. Will adjust the approach next week.",
    mood: "low", created_at: new Date().toISOString(),
  },
];

const TaskTrackerJournal = () => {
  const [entries, setEntries] = useState<JournalEntry[]>(sampleEntries);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<JournalEntry["mood"]>("neutral");
  const [viewDate, setViewDate] = useState(new Date().toISOString().split("T")[0]);

  const today = new Date().toISOString().split("T")[0];

  // Mood distribution (last 30 days)
  const moodStats = useMemo(() => {
    const counts: Record<string, number> = { great: 0, good: 0, neutral: 0, low: 0, bad: 0 };
    entries.forEach(e => { counts[e.mood] = (counts[e.mood] || 0) + 1; });
    return counts;
  }, [entries]);

  const startNewEntry = () => {
    const existing = entries.find(e => e.entry_date === today);
    if (existing) {
      setEditingDate(today);
      setContent(existing.content);
      setMood(existing.mood);
    } else {
      setEditingDate(today);
      setContent("");
      setMood("neutral");
    }
  };

  const saveEntry = () => {
    if (!editingDate) return;
    if (!content.trim()) { toast.error("Write something first!"); return; }

    const existing = entries.find(e => e.entry_date === editingDate);
    if (existing) {
      setEntries(prev => prev.map(e =>
        e.entry_date === editingDate ? { ...e, content, mood } : e
      ));
      toast.success("Entry updated");
    } else {
      setEntries(prev => [{
        id: uid(),
        entry_date: editingDate,
        content,
        mood,
        created_at: new Date().toISOString(),
      }, ...prev]);
      toast.success("Journal entry saved");
    }
    setEditingDate(null);
    setContent("");
  };

  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    toast.success("Entry deleted");
  };

  const getMoodConfig = (m: string) => MOODS.find(x => x.value === m) || MOODS[2];

  // Streak: consecutive days with entries
  const journalStreak = useMemo(() => {
    let streak = 0;
    const d = new Date();
    while (true) {
      const dateStr = d.toISOString().split("T")[0];
      if (entries.some(e => e.entry_date === dateStr)) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else break;
    }
    return streak;
  }, [entries]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-600" /> Daily Journal
          </h1>
          <p className="text-sm text-muted-foreground">Quick daily reflections and mood tracking</p>
        </div>
        <Button onClick={startNewEntry} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="mr-1 h-4 w-4" /> {entries.some(e => e.entry_date === today) ? "Edit Today" : "Write Today"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-indigo-100 text-indigo-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{entries.length}</p>
              <p className="text-xs text-muted-foreground">Total Entries</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-orange-100 text-orange-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{journalStreak}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-green-100 text-green-600">
              <Sun className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{moodStats.great + moodStats.good}</p>
              <p className="text-xs text-muted-foreground">Good Days</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground mb-1">Mood Overview</p>
            <div className="flex gap-1">
              {MOODS.map(m => (
                <div key={m.value} className="text-center flex-1">
                  <span className="text-sm">{m.emoji}</span>
                  <p className="text-[10px] font-bold">{moodStats[m.value]}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Editor */}
      {editingDate && (
        <Card className="border-indigo-200 bg-indigo-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-indigo-700 flex items-center gap-2">
              <Calendar className="h-4 w-4" /> {editingDate === today ? "Today's Entry" : editingDate}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mood selector */}
            <div>
              <Label className="text-xs">How are you feeling?</Label>
              <div className="flex gap-2 mt-1">
                {MOODS.map(m => (
                  <button
                    key={m.value}
                    className={`flex flex-col items-center gap-0.5 rounded-lg border px-3 py-2 transition-all ${
                      mood === m.value ? `${m.color} ring-2 ring-offset-1` : "bg-white hover:bg-muted/50"
                    }`}
                    onClick={() => setMood(m.value)}
                  >
                    <span className="text-lg">{m.emoji}</span>
                    <span className="text-[9px] font-medium">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div>
              <Label className="text-xs">What's on your mind?</Label>
              <Textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Write about your day, thoughts, gratitude, or anything..."
                rows={5}
                className="mt-1 resize-none"
              />
              <p className="text-[10px] text-muted-foreground mt-1">{content.length} characters</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={saveEntry} className="bg-indigo-600 hover:bg-indigo-700">Save Entry</Button>
              <Button variant="outline" onClick={() => setEditingDate(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entries List */}
      <div className="space-y-3">
        {entries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-10 w-10 mx-auto text-indigo-300 mb-3" />
              <p className="text-lg font-medium">No journal entries yet</p>
              <p className="text-sm text-muted-foreground">Start writing to build your daily reflection habit.</p>
            </CardContent>
          </Card>
        ) : entries.map(entry => {
          const moodConfig = getMoodConfig(entry.mood);
          const isToday = entry.entry_date === today;
          return (
            <Card key={entry.id} className={`hover:shadow-sm transition-shadow ${isToday ? "border-indigo-200" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Mood indicator */}
                    <div className={`shrink-0 grid h-10 w-10 place-items-center rounded-lg border ${moodConfig.color}`}>
                      <span className="text-lg">{moodConfig.emoji}</span>
                    </div>
                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px]">
                          <Calendar className="mr-1 h-2.5 w-2.5" />
                          {entry.entry_date}
                          {isToday && " (Today)"}
                        </Badge>
                        <Badge className={`text-[9px] ${moodConfig.color}`}>{moodConfig.label}</Badge>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{entry.content}</p>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => {
                        setEditingDate(entry.entry_date);
                        setContent(entry.content);
                        setMood(entry.mood);
                      }}
                    >
                      <BookOpen className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => deleteEntry(entry.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default TaskTrackerJournal;
