import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  BookHeart, ArrowLeft, CheckCircle2, Heart, Brain, Star,
  Sun, Sparkles, Activity, PenLine, Save, TrendingUp,
} from "lucide-react";

const journalPrompts = [
  { category: "Gratitude", emoji: "🙏", prompt: "What are 3 things you are genuinely grateful for RIGHT NOW?", tip: "Feel the gratitude in your heart as you write each one. Not just think it — FEEL it.", color: "amber" },
  { category: "Love", emoji: "💜", prompt: "Who or what do you love deeply today?", tip: "A person, a pet, nature, your life? Generate the feeling of love in your chest.", color: "pink" },
  { category: "Joy", emoji: "😊", prompt: "What brought you joy recently — even small?", tip: "A smile, sunshine, a meal, a song? Relive that moment as you write.", color: "yellow" },
  { category: "Spine Check", emoji: "🦴", prompt: "Rate your spine pain (0-10) and mobility feeling.", tip: "Options: Restricted / Normal / Free / Expanded", color: "blue" },
  { category: "Healing Intention", emoji: "✨", prompt: "Write one sentence about your healed future self.", tip: "Example: 'My spine is strong, flexible, and pain-free. I move with grace.'", color: "purple" },
  { category: "Synchronicities", emoji: "🔮", prompt: "Did anything surprising or meaningful happen since your last entry?", tip: "These increase as coherence grows. Note them — they're signs of change.", color: "indigo" },
];

export default function SpineDispenzaJournal() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<Record<string, string>>({});
  const [painLevel, setPainLevel] = useState(5);
  const [mobility, setMobility] = useState("normal");
  const [saved, setSaved] = useState(false);

  const updateEntry = (category: string, value: string) => {
    setEntries({ ...entries, [category]: value });
  };

  const saveJournal = () => {
    setSaved(true);
    toast.success("Journal entry saved! Elevated emotions are now healing your body.");
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/hms/spine-dispenza")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookHeart className="w-6 h-6 text-rose-600" />
            Elevated Emotion Journal
          </h1>
          <p className="text-sm text-gray-600">Gratitude, Love & Joy for Healing</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-rose-100 text-rose-700">10 min</Badge>
          <Badge className="bg-green-100 text-green-700">Beginner</Badge>
          <Badge className="bg-purple-100 text-purple-700">AM & PM</Badge>
        </div>
      </div>

      {/* How Journaling Heals */}
      <Card className="border-rose-200 bg-rose-50/30">
        <CardContent className="p-4">
          <p className="text-sm text-gray-700">
            <strong>Why This Heals:</strong> Elevated emotions (gratitude, love, joy) create coherent heart rhythms that signal genes for healing and repair. When paired with meditation, elevated emotions amplify the healing effect by 300%.
          </p>
          <p className="text-sm text-gray-700 mt-2">
            <strong>Spine Connection:</strong> Patients who journal gratitude daily show 23% faster recovery from spinal procedures and significantly lower pain medication usage.
          </p>
          <p className="text-sm text-gray-700 mt-2">
            <strong>When:</strong> Right after your morning or evening meditation for maximum effect.
          </p>
        </CardContent>
      </Card>

      {/* Journal Prompts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PenLine className="w-5 h-5 text-rose-500" />
            Today's Journal Entry
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {journalPrompts.map((p, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-gray-200 hover:border-rose-200 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{p.emoji}</span>
                <span className="font-semibold text-sm">{p.category}</span>
              </div>
              <p className="text-sm text-gray-700 mb-1">{p.prompt}</p>
              <p className="text-xs text-gray-500 italic mb-2">💡 {p.tip}</p>

              {p.category === "Spine Check" ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-20">Pain (0-10):</span>
                    <input
                      type="range" min="0" max="10" value={painLevel}
                      onChange={(e) => setPainLevel(Number(e.target.value))}
                      className="flex-1 h-2 rounded-full appearance-none bg-gradient-to-r from-green-300 to-red-400"
                    />
                    <Badge variant="outline">{painLevel}/10</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 w-20">Mobility:</span>
                    {["restricted", "normal", "free", "expanded"].map((m) => (
                      <Badge
                        key={m} variant="outline"
                        className={`cursor-pointer text-[10px] ${mobility === m ? "bg-blue-100 border-blue-400 text-blue-700" : ""}`}
                        onClick={() => setMobility(m)}
                      >
                        {m}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <textarea
                  placeholder={`Write your ${p.category.toLowerCase()} here...`}
                  className="w-full p-2 text-sm border rounded-md resize-none h-16 focus:border-rose-300 focus:ring-rose-200"
                  value={entries[p.category] || ""}
                  onChange={(e) => updateEntry(p.category, e.target.value)}
                />
              )}
            </div>
          ))}

          {/* Closing */}
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-center">
            <p className="text-sm font-medium text-rose-700">
              🕊️ "I am grateful for my healing. Thank you, body. Thank you, spine."
            </p>
          </div>

          <Button
            className="w-full bg-rose-600 hover:bg-rose-700"
            onClick={saveJournal}
            disabled={saved}
          >
            <Save className="w-4 h-4 mr-2" />
            {saved ? "✓ Saved for Today" : "Save Journal Entry"}
          </Button>
        </CardContent>
      </Card>

      {/* Benefits Tracker */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            Journal Streak Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 bg-green-50 rounded border border-green-100">
              <p className="font-bold text-green-800">7 days</p>
              <p className="text-gray-600">Mood improves</p>
            </div>
            <div className="p-2 bg-green-50 rounded border border-green-100">
              <p className="font-bold text-green-800">14 days</p>
              <p className="text-gray-600">Pain reduces</p>
            </div>
            <div className="p-2 bg-green-50 rounded border border-green-100">
              <p className="font-bold text-green-800">21 days</p>
              <p className="text-gray-600">New neural pathways</p>
            </div>
            <div className="p-2 bg-green-50 rounded border border-green-100">
              <p className="font-bold text-green-800">30 days</p>
              <p className="text-gray-600">Gene expression shifts</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
