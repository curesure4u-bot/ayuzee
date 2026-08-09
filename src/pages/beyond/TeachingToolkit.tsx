import { useState } from "react";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ClipboardCopy,
  GraduationCap,
  Lightbulb,
  ListChecks,
  Presentation,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// ════════════════════════════════════════════════════════════
// SLIDE DECK GENERATOR
// ════════════════════════════════════════════════════════════

function SlideDeckGenerator() {
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("PG students");
  const [duration, setDuration] = useState("15");
  const [outline, setOutline] = useState<string[]>([]);

  const generateOutline = () => {
    if (!topic.trim()) { toast.error("Enter a topic"); return; }
    const mins = Number(duration);
    const slideCount = Math.max(5, Math.round(mins / 2));
    const generated = [
      `Slide 1: Title — "${topic}" (1 min)`,
      `Slide 2: Learning Objectives — What will the audience learn? (1 min)`,
      `Slide 3: Why This Matters — Clinical relevance / prevalence (2 min)`,
      ...Array.from({ length: slideCount - 6 }, (_, i) => `Slide ${i + 4}: Key Point ${i + 1} — [Add content] (2 min)`),
      `Slide ${slideCount - 2}: Case Discussion — Real case applying the concept (3 min)`,
      `Slide ${slideCount - 1}: Summary & Take-Home Points (1 min)`,
      `Slide ${slideCount}: Questions & References (2 min)`,
    ];
    setOutline(generated);
    toast.success(`Generated ${generated.length}-slide outline for ${mins} min talk`);
  };

  const copyOutline = () => {
    navigator.clipboard.writeText(outline.join("\n"));
    toast.success("Outline copied!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2"><Presentation className="h-4 w-4 text-blue-500" /> Slide Deck Generator</CardTitle>
        <CardDescription className="text-xs">Enter your topic → get a structured presentation outline instantly.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="text-xs text-muted-foreground">Topic</label>
            <Input placeholder="e.g. Panchakarma in Rheumatoid Arthritis" value={topic} onChange={(e) => setTopic(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Duration (min)</label>
            <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>
        </div>
        <Button onClick={generateOutline} className="w-full">Generate Presentation Outline</Button>
        {outline.length > 0 && (
          <div className="rounded-lg border p-3 space-y-1">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary" className="text-xs">{outline.length} slides</Badge>
              <Button size="sm" variant="ghost" className="text-xs gap-1" onClick={copyOutline}><ClipboardCopy className="h-3 w-3" /> Copy</Button>
            </div>
            {outline.map((slide, i) => (
              <p key={i} className="text-xs text-muted-foreground">{slide}</p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════
// MCQ MAKER
// ════════════════════════════════════════════════════════════

function MCQMaker() {
  const [inputText, setInputText] = useState("");
  const [mcqs, setMcqs] = useState<{ q: string; options: string[]; answer: string }[]>([]);

  const generateMCQs = () => {
    if (inputText.trim().length < 50) { toast.error("Paste at least a paragraph of medical text"); return; }
    // Simple keyword-based MCQ generation (client-side, no AI needed)
    const sentences = inputText.split(/[.!?]+/).filter((s) => s.trim().length > 20);
    const generated = sentences.slice(0, 5).map((sentence, i) => {
      const words = sentence.trim().split(" ");
      const keyWord = words.find((w) => w.length > 5) || words[Math.floor(words.length / 2)];
      return {
        q: `Q${i + 1}: ${sentence.trim().replace(keyWord || "", "______")}?`,
        options: [`A) ${keyWord}`, `B) [Distractor 1]`, `C) [Distractor 2]`, `D) [Distractor 3]`],
        answer: `A) ${keyWord}`,
      };
    });
    setMcqs(generated);
    toast.success(`Generated ${generated.length} MCQs — edit distractors manually`);
  };

  const copyMCQs = () => {
    const text = mcqs.map((m) => `${m.q}\n${m.options.join("\n")}\nAnswer: ${m.answer}`).join("\n\n");
    navigator.clipboard.writeText(text);
    toast.success("MCQs copied!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2"><ListChecks className="h-4 w-4 text-purple-500" /> MCQ / Quiz Maker</CardTitle>
        <CardDescription className="text-xs">Paste any medical text → get auto-generated MCQs. Edit distractors to finalize.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea placeholder="Paste medical text here (e.g. from a textbook chapter)..." value={inputText} onChange={(e) => setInputText(e.target.value)} rows={5} className="text-sm" />
        <Button onClick={generateMCQs} className="w-full">Generate MCQs from Text</Button>
        {mcqs.length > 0 && (
          <div className="rounded-lg border p-3 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">{mcqs.length} questions</Badge>
              <Button size="sm" variant="ghost" className="text-xs gap-1" onClick={copyMCQs}><ClipboardCopy className="h-3 w-3" /> Copy All</Button>
            </div>
            {mcqs.map((mcq, i) => (
              <div key={i} className="rounded-lg bg-muted/60 p-2">
                <p className="text-xs font-medium">{mcq.q}</p>
                {mcq.options.map((opt, j) => (
                  <p key={j} className="text-xs text-muted-foreground ml-2">{opt}</p>
                ))}
                <p className="text-[10px] text-green-600 mt-1">✓ {mcq.answer}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════
// CASE-BASED TEACHING FORMATTER
// ════════════════════════════════════════════════════════════

function CaseTeachingFormatter() {
  const [problem, setProblem] = useState("");
  const [discussion, setDiscussion] = useState("");
  const [learning, setLearning] = useState("");

  const copyFormatted = () => {
    const output = `CASE-BASED TEACHING\n\n📋 PROBLEM/SCENARIO:\n${problem}\n\n💬 DISCUSSION POINTS:\n${discussion}\n\n🎯 LEARNING POINTS:\n${learning}`;
    navigator.clipboard.writeText(output);
    toast.success("Case teaching format copied!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2"><BookOpen className="h-4 w-4 text-amber-500" /> Case-Based Teaching Format</CardTitle>
        <CardDescription className="text-xs">Structure any clinical case into Problem → Discussion → Learning Points.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="text-xs font-medium">Problem / Scenario</label>
          <Textarea placeholder="Present the clinical scenario (patient history, findings)..." value={problem} onChange={(e) => setProblem(e.target.value)} rows={3} className="text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium">Discussion Points</label>
          <Textarea placeholder="What questions should students consider? Differential diagnosis?" value={discussion} onChange={(e) => setDiscussion(e.target.value)} rows={3} className="text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium">Learning Points (Key Takeaways)</label>
          <Textarea placeholder="What should students remember from this case?" value={learning} onChange={(e) => setLearning(e.target.value)} rows={3} className="text-sm" />
        </div>
        <Button onClick={copyFormatted} className="w-full gap-2" variant="outline"><ClipboardCopy className="h-4 w-4" /> Copy Formatted Case</Button>
      </CardContent>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════

const TeachingToolkit = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-blue-500" />
          Teaching & Presentation Toolkit
        </h1>
        <p className="text-muted-foreground">Create teaching content fast — slides, quizzes, cases</p>
      </div>

      <Tabs defaultValue="slides" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="slides" className="text-xs gap-1"><Presentation className="h-3.5 w-3.5" /> Slides</TabsTrigger>
          <TabsTrigger value="mcq" className="text-xs gap-1"><ListChecks className="h-3.5 w-3.5" /> MCQ Maker</TabsTrigger>
          <TabsTrigger value="case" className="text-xs gap-1"><BookOpen className="h-3.5 w-3.5" /> Case Format</TabsTrigger>
        </TabsList>
        <TabsContent value="slides"><SlideDeckGenerator /></TabsContent>
        <TabsContent value="mcq"><MCQMaker /></TabsContent>
        <TabsContent value="case"><CaseTeachingFormatter /></TabsContent>
      </Tabs>
    </div>
  );
};

export default TeachingToolkit;
