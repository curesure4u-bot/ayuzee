import { useState, useEffect } from "react";
import {
  Award,
  BookOpen,
  Calendar,
  Lightbulb,
  PenTool,
  RefreshCw,
  Sparkles,
  Tag,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useBeyondGamification } from "@/hooks/useBeyondGamification";

const JOURNAL_TYPES = [
  { value: "reflection", label: "Reflection", icon: Lightbulb },
  { value: "learning", label: "Learning Log", icon: BookOpen },
  { value: "goal_review", label: "Goal Review", icon: Sparkles },
  { value: "free_write", label: "Free Write", icon: PenTool },
];

const PROMPTS: Record<string, string[]> = {
  reflection: [
    "What went well today and why?",
    "What would I do differently if I could redo today?",
    "What am I avoiding right now? Why?",
    "What lesson did life teach me this week?",
    "What am I most proud of recently?",
    "If I could give my morning-self one piece of advice, what would it be?",
    "What drained my energy today? What restored it?",
    "What is one thing I learned about myself this week?",
  ],
  learning: [
    "What new clinical or non-clinical skill did I learn today?",
    "What book/article/video taught me something recently?",
    "What mistake taught me the most this week?",
    "What concept am I struggling to understand? What would help?",
    "What did I learn from a patient today?",
    "What did a colleague do that I want to learn from?",
  ],
  goal_review: [
    "What progress did I make on my top goal this week?",
    "What is blocking me from my most important goal?",
    "Am I spending time on what matters most? Where is the gap?",
    "What goal have I been neglecting? Why?",
    "What would achieving my current goal make possible?",
  ],
  free_write: [
    "Write whatever is on your mind. No rules, no structure.",
    "What are you feeling right now? Name it.",
    "Write a letter to your future self, 1 year from now.",
    "If you could change one thing about your life today, what would it be?",
  ],
};

const TAGS = ["clinical", "personal", "relationships", "finance", "wellness", "career", "leadership", "time", "growth", "gratitude"];

interface JournalEntry {
  id: string;
  type: string;
  prompt: string | null;
  content: string;
  tags: string[];
  mood_score: number | null;
  date: string;
  created_at: string;
}

const ReflectionJournal = () => {
  const { addXP, addCoins, recordStreak, grantBadge } = useBeyondGamification();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // New entry form
  const [type, setType] = useState("reflection");
  const [prompt, setPrompt] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEntries();
    randomizePrompt("reflection");
  }, []);

  const loadEntries = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { setLoading(false); return; }
    const { data } = await (supabase as any)
      .from("beyond_journal_entries")
      .select("*")
      .eq("user_id", session.session.user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setEntries(data || []);
    setLoading(false);
  };

  const randomizePrompt = (journalType: string) => {
    const pool = PROMPTS[journalType] || PROMPTS.reflection;
    setPrompt(pool[Math.floor(Math.random() * pool.length)]);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const saveEntry = async () => {
    if (!content.trim() || content.trim().length < 10) {
      toast.error("Write at least a couple of sentences");
      return;
    }
    setSaving(true);
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { setSaving(false); return; }

    await (supabase as any).from("beyond_journal_entries").insert({
      user_id: session.session.user.id,
      type,
      prompt: prompt || null,
      content,
      tags: selectedTags,
    });

    // Gamification
    await addXP(30, "journal_written", "Wrote a journal reflection");
    await addCoins(10, "journal_written");
    await recordStreak("reflection");
    await grantBadge("Scribe");

    // Check Philosopher badge (50 entries)
    const totalEntries = entries.length + 1;
    if (totalEntries >= 50) {
      await grantBadge("Philosopher");
    }

    setContent("");
    setSelectedTags([]);
    randomizePrompt(type);
    toast.success("Journal saved! +30 XP");
    loadEntries();
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl flex items-center gap-2">
            <PenTool className="h-7 w-7 text-indigo-500" />
            Reflection Journal
          </h1>
          <p className="text-muted-foreground">5 minutes of writing creates clarity for the whole day</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1"><Award className="h-3 w-3" /> +30 XP</Badge>
          <Badge variant="secondary" className="gap-1">{entries.length} entries</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Write Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">New Entry</CardTitle>
              <Select value={type} onValueChange={(v) => { setType(v); randomizePrompt(v); }}>
                <SelectTrigger className="w-[150px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOURNAL_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Prompt */}
            <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/30 p-3 flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-indigo-700 dark:text-indigo-300">{prompt}</p>
              </div>
              <button onClick={() => randomizePrompt(type)} className="text-indigo-400 hover:text-indigo-600" title="New prompt">
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Writing Area */}
            <Textarea
              placeholder="Start writing... let your thoughts flow."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="text-sm leading-relaxed"
            />

            {/* Tags */}
            <div>
              <p className="text-xs font-medium mb-2 flex items-center gap-1"><Tag className="h-3 w-3" /> Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                      selectedTags.includes(tag) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Save */}
            <Button onClick={saveEntry} disabled={saving} className="w-full gap-2">
              <PenTool className="h-4 w-4" />
              {saving ? "Saving..." : "Save Entry (+30 XP)"}
            </Button>
          </CardContent>
        </Card>

        {/* History */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Recent Entries
          </h3>
          {loading ? (
            <p className="text-xs text-muted-foreground">Loading...</p>
          ) : entries.length === 0 ? (
            <Card><CardContent className="p-4 text-center">
              <PenTool className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-xs text-muted-foreground">No entries yet. Start writing!</p>
            </CardContent></Card>
          ) : (
            entries.slice(0, 10).map((entry) => (
              <Card key={entry.id} className="cursor-default">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline" className="text-[10px] capitalize">{entry.type.replace("_", " ")}</Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(entry.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  {entry.prompt && (
                    <p className="text-[10px] text-indigo-500 italic mb-1">{entry.prompt}</p>
                  )}
                  <p className="text-xs text-muted-foreground line-clamp-3">{entry.content}</p>
                  {entry.tags.length > 0 && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {entry.tags.map((t) => (
                        <span key={t} className="text-[9px] bg-muted px-1.5 py-0.5 rounded">{t}</span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReflectionJournal;
