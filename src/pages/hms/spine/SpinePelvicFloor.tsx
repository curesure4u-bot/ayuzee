import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { KEGEL_PROGRAM, KEGEL_TIPS, VITALITY_REFERENCES } from "@/lib/spineVitalityData";
import {
  Dumbbell, CheckCircle2, Info, Share2, ExternalLink, ShieldCheck, Clock,
  ArrowRight, Lightbulb,
} from "lucide-react";

export default function SpinePelvicFloor() {
  const [level, setLevel] = useState(1);
  const cur = KEGEL_PROGRAM.find((l) => l.level === level) || KEGEL_PROGRAM[0];

  const shareProgram = () => {
    const text = `Pelvic Floor (Kegel) Program — Level ${cur.level}: ${cur.name} (${cur.weeks}). ${cur.routine}, ${cur.hold}. Goal: ${cur.goal}. Practice daily for best results.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    toast.success("Opening WhatsApp to share the program");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Dumbbell className="h-6 w-6 text-teal-600" /> Pelvic Floor / Kegel Program</h1>
          <p className="text-muted-foreground mt-1">A guided, levelled pelvic floor (PC muscle) training program — for men and women.</p>
        </div>
        <Badge className="bg-teal-100 text-teal-700">Evidence-based</Badge>
      </div>

      {/* Guardrail */}
      <Card className="border-blue-200 bg-blue-50/40">
        <CardContent className="pt-4 text-sm text-muted-foreground flex gap-3">
          <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
          <div>
            <p className="font-medium text-foreground">How it helps</p>
            <p className="mt-1">Pelvic floor muscle training is a validated, low-risk therapy shown to improve premature ejaculation, erectile function and pelvic control, and supports arousal and continence in women. Results typically appear over 8-12 weeks of consistent daily practice. Prescribe alongside the relevant clinical protocol.</p>
          </div>
        </CardContent>
      </Card>

      {/* Level selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {KEGEL_PROGRAM.map((l) => (
          <button key={l.level} onClick={() => setLevel(l.level)}
            className={`rounded-lg border p-3 text-left transition ${level === l.level ? "border-teal-400 bg-teal-50" : "border-border hover:bg-muted/50"}`}>
            <div className="flex items-center gap-1.5">
              <span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${level === l.level ? "bg-teal-600 text-white" : "bg-muted text-muted-foreground"}`}>{l.level}</span>
              <span className="text-xs font-semibold">{l.name}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">{l.weeks}</p>
          </button>
        ))}
      </div>

      {/* Current level detail */}
      <Card className="border-teal-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Level {cur.level}: {cur.name}</CardTitle>
            <Badge variant="outline" className="text-[10px] gap-1"><Clock className="h-3 w-3" /> {cur.weeks}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-md bg-muted/50 p-3"><p className="text-[10px] text-muted-foreground uppercase">Hold / Rest</p><p className="text-sm font-semibold mt-0.5">{cur.hold}</p></div>
            <div className="rounded-md bg-muted/50 p-3"><p className="text-[10px] text-muted-foreground uppercase">Routine</p><p className="text-sm font-semibold mt-0.5">{cur.routine}</p></div>
            <div className="rounded-md bg-muted/50 p-3"><p className="text-[10px] text-muted-foreground uppercase">Goal</p><p className="text-sm font-semibold mt-0.5">{cur.goal}</p></div>
          </div>
          <div className="flex items-center gap-2">
            {level < KEGEL_PROGRAM.length && (
              <Button size="sm" variant="outline" className="gap-1" onClick={() => setLevel(level + 1)}>Next Level <ArrowRight className="h-3.5 w-3.5" /></Button>
            )}
            <Button size="sm" className="gap-1" onClick={shareProgram}><Share2 className="h-3.5 w-3.5" /> Share with Patient</Button>
          </div>
        </CardContent>
      </Card>

      {/* How to do it correctly */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><Lightbulb className="h-4 w-4 text-amber-500" /> How to Do It Correctly</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-1.5">
            {KEGEL_TIPS.map((t, i) => (
              <li key={i} className="text-sm text-muted-foreground flex gap-2"><CheckCircle2 className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" /> {t}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Progression overview */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><Info className="h-4 w-4" /> 12-Week Progression</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {KEGEL_PROGRAM.map((l) => (
              <div key={l.level} className="flex items-center gap-3 rounded-md border p-2.5">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-teal-100 text-teal-700 text-xs font-bold shrink-0">{l.level}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{l.name} <span className="text-muted-foreground font-normal">· {l.weeks}</span></p>
                  <p className="text-[11px] text-muted-foreground">{l.routine} · {l.hold}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* References */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">References</p>
          <div className="space-y-1">
            {VITALITY_REFERENCES.map((r) => (
              <a key={r.url} href={r.url} target="_blank" rel="noreferrer" className="text-[11px] text-teal-700 hover:underline flex items-center gap-1"><ExternalLink className="h-3 w-3" /> {r.label}</a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
