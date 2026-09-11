import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { VITALITY_CONDITIONS, VITALITY_REFERENCES } from "@/lib/spineVitalityData";
import {
  HeartPulse, ShieldCheck, Leaf, Activity, Dumbbell, Brain, AlertTriangle,
  ExternalLink, Lock, ArrowLeft, Stethoscope, ClipboardList, Gauge,
} from "lucide-react";

const audienceBadge = (a: string) =>
  a === "men" ? "bg-blue-100 text-blue-700" : a === "women" ? "bg-pink-100 text-pink-700" : "bg-purple-100 text-purple-700";

export default function SpineVajikaranaHub() {
  const navigate = useNavigate();
  const [active, setActive] = useState<string | null>(null);
  const cond = VITALITY_CONDITIONS.find((c) => c.key === active);

  const Section = ({ icon: Icon, title, items, color }: { icon: any; title: string; items: string[]; color: string }) => (
    <div>
      <p className={`text-xs font-semibold flex items-center gap-1 text-${color}-700`}><Icon className="h-3.5 w-3.5" /> {title}</p>
      <ul className="mt-1 space-y-1">
        {items.map((s, i) => <li key={i} className="text-xs text-muted-foreground flex gap-1.5"><span className={`text-${color}-500`}>•</span> {s}</li>)}
      </ul>
    </div>
  );

  // ── Detail view ──
  if (cond) {
    return (
      <div className="space-y-4 max-w-3xl">
        <Button variant="ghost" size="sm" onClick={() => setActive(null)} className="gap-1"><ArrowLeft className="h-4 w-4" /> Back to conditions</Button>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <CardTitle className="text-base">{cond.title}</CardTitle>
              <Badge className={`text-[10px] ${audienceBadge(cond.audience)}`}>{cond.audience === "both" ? "Men & Women" : cond.audience}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{cond.overview}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {cond.redFlags.length > 0 && (
              <div className="rounded-md border border-red-300 bg-red-50 p-3">
                <p className="text-sm font-semibold text-red-800 flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> Red flags — refer</p>
                <ul className="mt-1 space-y-0.5">{cond.redFlags.map((r, i) => <li key={i} className="text-xs text-red-700">• {r}</li>)}</ul>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Section icon={Dumbbell} title="Pelvic Floor / Kegel" items={cond.pelvic} color="teal" />
              <Section icon={Leaf} title="Ayurvedic / Vajikarana" items={cond.ayurvedic} color="green" />
              <Section icon={Activity} title="Spine / Nerve" items={cond.spine} color="indigo" />
              <Section icon={Brain} title="Lifestyle / Mind-Body" items={cond.lifestyle} color="amber" />
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" className="gap-1" onClick={() => navigate("/hms/spine-vitality-assessment")}><ClipboardList className="h-4 w-4" /> Create Patient Plan</Button>
              <Button size="sm" variant="outline" className="gap-1" onClick={() => navigate("/hms/spine-pelvic-floor")}><Dumbbell className="h-4 w-4" /> Kegel Program</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Library view ──
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><HeartPulse className="h-6 w-6 text-rose-600" /> Vajikarana & Pelvic Health</h1>
          <p className="text-muted-foreground mt-1">Clinical protocols integrating pelvic floor rehab, Ayurvedic Vajikarana, spine care & lifestyle.</p>
        </div>
        <Badge className="bg-rose-100 text-rose-700"><Lock className="h-3 w-3 mr-1" /> Confidential · Clinical</Badge>
      </div>

      {/* Guardrail banner */}
      <Card className="border-blue-200 bg-blue-50/40">
        <CardContent className="pt-4 text-sm text-muted-foreground flex gap-3">
          <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
          <div>
            <p className="font-medium text-foreground">Professional clinical tool (18+)</p>
            <p className="mt-1">Educational/therapeutic reference for the physician. Integrates evidence-based pelvic floor therapy with classical Ayurvedic Vajikarana. This is not a substitute for individual medical evaluation — always screen red flags and refer where indicated. Patient records are kept strictly confidential (private to your account).</p>
          </div>
        </CardContent>
      </Card>

      {/* The integrated model */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">The Integrated Model — Spine · Pelvic · Vajikarana</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {[
              { icon: Activity, label: "Spine & Nerve", d: "Lumbosacral (S2-S4) & pelvic nerves" },
              { icon: Dumbbell, label: "Pelvic Floor", d: "Kegel / PC muscle training" },
              { icon: Leaf, label: "Vajikarana", d: "Ayurvedic vitality Rasayana" },
              { icon: Brain, label: "Mind-Body", d: "Stress, sleep, confidence" },
            ].map((p, i) => {
              const Icon = p.icon;
              return (
                <div key={i}>
                  <div className="w-10 h-10 rounded-full bg-rose-100 grid place-items-center mx-auto"><Icon className="h-5 w-5 text-rose-600" /></div>
                  <p className="text-xs font-medium mt-1">{p.label}</p>
                  <p className="text-[10px] text-muted-foreground">{p.d}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Condition library */}
      <div>
        <h2 className="text-sm font-semibold mb-2">Condition Protocols</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {VITALITY_CONDITIONS.map((c) => (
            <Card key={c.key} className="cursor-pointer transition hover:shadow-md hover:border-rose-300" onClick={() => setActive(c.key)}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <Stethoscope className="h-5 w-5 text-rose-600" />
                  <Badge className={`text-[9px] ${audienceBadge(c.audience)}`}>{c.audience === "both" ? "M & W" : c.audience}</Badge>
                </div>
                <p className="font-semibold text-sm mt-2">{c.title}</p>
                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-3">{c.overview}</p>
                <Button size="sm" variant="outline" className="w-full mt-3">View Protocol</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="gap-1" onClick={() => navigate("/hms/spine-pelvic-floor")}><Dumbbell className="h-4 w-4" /> Pelvic Floor / Kegel Program</Button>
        <Button variant="outline" size="sm" className="gap-1" onClick={() => navigate("/hms/spine-vitality-assessment")}><ClipboardList className="h-4 w-4" /> Confidential Assessment</Button>
        <Button variant="outline" size="sm" className="gap-1" onClick={() => navigate("/hms/spine-wellness-age")}><Gauge className="h-4 w-4" /> Wellness Age</Button>
      </div>

      {/* References */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">Evidence & References</p>
          <div className="space-y-1">
            {VITALITY_REFERENCES.map((r) => (
              <a key={r.url} href={r.url} target="_blank" rel="noreferrer" className="text-[11px] text-rose-700 hover:underline flex items-center gap-1"><ExternalLink className="h-3 w-3" /> {r.label}</a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
