import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Thermometer, Snowflake, X, AlertTriangle, Calculator, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { INGREDIENTS, RASA_STYLES, VIRUDDHA_PAIRS, type Ingredient } from "@/data/dravyaguna";

const DOSHA_COLOR = {
  pacifies: "bg-green-500",
  aggravates: "bg-red-500",
  neutral: "bg-slate-300",
} as const;

function TridoshaChart({ d }: { d: Ingredient["dosha"] }) {
  return (
    <div className="flex gap-1.5 items-center text-xs">
      {(["vata", "pitta", "kapha"] as const).map((k) => (
        <div key={k} className="flex items-center gap-1">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${DOSHA_COLOR[d[k]]}`} />
          <span className="capitalize">{k}</span>
        </div>
      ))}
    </div>
  );
}

function VeeryaViz({ v }: { v: Ingredient["veerya"] }) {
  if (v === "Ushna") return <span className="inline-flex items-center gap-1 text-red-600 text-xs font-medium"><Thermometer className="h-3.5 w-3.5" /> Ushna (hot)</span>;
  return <span className="inline-flex items-center gap-1 text-blue-600 text-xs font-medium"><Snowflake className="h-3.5 w-3.5" /> Sheeta (cold)</span>;
}

export default function IngredientEncyclopedia() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Ingredient | null>(null);
  const [calcOpen, setCalcOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return INGREDIENTS;
    return INGREDIENTS.filter((i) =>
      i.sanskrit.toLowerCase().includes(t) ||
      i.common.toLowerCase().includes(t) ||
      i.latin.toLowerCase().includes(t) ||
      i.conditions.some((c) => c.toLowerCase().includes(t))
    );
  }, [q]);

  const togglePick = (id: string) => {
    setPicked((p) => p.includes(id) ? p.filter((x) => x !== id) : (p.length >= 5 ? p : [...p, id]));
  };

  // Calculator results
  const matchingFormulas = useMemo(() => {
    if (picked.length === 0) return [];
    const formulaCounts: Record<string, number> = {};
    picked.forEach((pid) => {
      const ing = INGREDIENTS.find((i) => i.id === pid);
      ing?.usedIn.forEach((fid) => { formulaCounts[fid] = (formulaCounts[fid] || 0) + 1; });
    });
    return Object.entries(formulaCounts)
      .filter(([, c]) => c === picked.length)
      .map(([fid]) => fid);
  }, [picked]);

  const partialMatches = useMemo(() => {
    if (picked.length < 2) return [];
    const counts: Record<string, number> = {};
    picked.forEach((pid) => {
      INGREDIENTS.find((i) => i.id === pid)?.usedIn.forEach((fid) => { counts[fid] = (counts[fid] || 0) + 1; });
    });
    return Object.entries(counts)
      .filter(([, c]) => c >= 2 && c < picked.length)
      .sort((a, b) => b[1] - a[1])
      .map(([fid, c]) => ({ fid, c }));
  }, [picked]);

  const viruddhaWarnings = useMemo(() => {
    return VIRUDDHA_PAIRS.filter(([a, b]) => picked.includes(a) && picked.includes(b));
  }, [picked]);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
            <Link to="/doctor/formulary"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Formulary</Link>
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Ingredient Encyclopedia</h1>
          <p className="text-muted-foreground text-sm mt-1">Dravyaguna — every herb, mineral and Anupana with Rasa-Guna-Veerya-Vipaka.</p>
        </div>
        <Button onClick={() => setCalcOpen(true)}><Calculator className="h-4 w-4 mr-2" /> Formulation Calculator</Button>
      </header>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search by Sanskrit, common, Latin name, or condition…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((ing) => (
          <Card key={ing.id} className="hover:shadow-md transition cursor-pointer" onClick={() => setSelected(ing)}>
            <CardContent className="p-4 space-y-3">
              <div>
                <div className="text-lg font-semibold leading-tight">{ing.sanskrit}</div>
                <div className="text-xs text-muted-foreground">{ing.common} · <em>{ing.latin}</em></div>
              </div>
              <div className="flex flex-wrap gap-1">
                {ing.rasa.map((r) => <Badge key={r} variant="outline" className={RASA_STYLES[r]}>{r}</Badge>)}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span><span className="text-muted-foreground">Guna:</span> {ing.guna.join("/")}</span>
                <VeeryaViz v={ing.veerya} />
                <span><span className="text-muted-foreground">Vipaka:</span> {ing.vipaka}</span>
              </div>
              <TridoshaChart d={ing.dosha} />
              {ing.prabhava && <div className="text-xs"><span className="text-muted-foreground">Prabhava:</span> <span className="italic">{ing.prabhava}</span></div>}
              <p className="text-sm">{ing.oneLine}</p>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">No ingredients match.</div>
        )}
      </div>

      {/* Detail drawer */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="text-2xl">{selected.sanskrit}</SheetTitle>
                <SheetDescription>{selected.common} · <em>{selected.latin}</em></SheetDescription>
              </SheetHeader>
              <div className="mt-5 space-y-5 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Rasa (taste)</div>
                  <div className="flex flex-wrap gap-1.5">{selected.rasa.map((r) => <Badge key={r} variant="outline" className={RASA_STYLES[r]}>{r}</Badge>)}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><div className="text-xs text-muted-foreground">Guna</div><div className="font-medium">{selected.guna.join(", ")}</div></div>
                  <div><div className="text-xs text-muted-foreground">Veerya</div><VeeryaViz v={selected.veerya} /></div>
                  <div><div className="text-xs text-muted-foreground">Vipaka</div><div className="font-medium">{selected.vipaka}</div></div>
                  <div><div className="text-xs text-muted-foreground">Tridosha</div><TridoshaChart d={selected.dosha} /></div>
                </div>
                {selected.prabhava && (
                  <div>
                    <div className="text-xs text-muted-foreground">Prabhava (special action)</div>
                    <div className="font-medium italic">{selected.prabhava}</div>
                  </div>
                )}
                <div>
                  <div className="text-xs text-muted-foreground">Best for conditions</div>
                  <div className="flex flex-wrap gap-1.5 mt-1">{selected.conditions.map((c) => <Badge key={c} variant="secondary">{c}</Badge>)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Adjuvant role</div>
                  <p>{selected.role}</p>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Used in formulas</div>
                  {selected.usedIn.length > 0 ? (
                    <ul className="list-disc list-inside mt-1">
                      {selected.usedIn.map((fid) => (
                        <li key={fid}><Link to="/doctor/formulary" className="text-primary hover:underline">{fid.replace(/-/g, " ")}</Link></li>
                      ))}
                    </ul>
                  ) : <p className="italic text-muted-foreground">Standalone or generic Anupana</p>}
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Classical reference</div>
                  <div className="italic">{selected.reference}</div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Formulation Calculator */}
      <Sheet open={calcOpen} onOpenChange={setCalcOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Formulation Calculator</SheetTitle>
            <SheetDescription>Pick 3–5 ingredients to find matching classical formulas and check Viruddha (incompatibility).</SheetDescription>
          </SheetHeader>

          <Tabs defaultValue="pick" className="mt-5">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="pick">Pick ingredients ({picked.length}/5)</TabsTrigger>
              <TabsTrigger value="result">Results</TabsTrigger>
            </TabsList>

            <TabsContent value="pick" className="mt-4 space-y-3">
              {picked.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-2 bg-muted/40 rounded">
                  {picked.map((pid) => {
                    const ing = INGREDIENTS.find((i) => i.id === pid)!;
                    return (
                      <Badge key={pid} variant="default" className="gap-1">
                        {ing.sanskrit}
                        <button onClick={() => togglePick(pid)} aria-label="Remove"><X className="h-3 w-3" /></button>
                      </Badge>
                    );
                  })}
                </div>
              )}
              <div className="grid grid-cols-2 gap-1.5 max-h-96 overflow-y-auto pr-1">
                {INGREDIENTS.map((ing) => {
                  const on = picked.includes(ing.id);
                  return (
                    <button
                      key={ing.id}
                      onClick={() => togglePick(ing.id)}
                      disabled={!on && picked.length >= 5}
                      className={`text-left px-3 py-2 rounded border text-sm transition ${on ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted border-border"} disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      <div className="font-medium">{ing.sanskrit}</div>
                      <div className={`text-xs ${on ? "opacity-80" : "text-muted-foreground"}`}>{ing.common}</div>
                    </button>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="result" className="mt-4 space-y-4">
              {viruddhaWarnings.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Viruddha (incompatible combination) detected</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside mt-1">
                      {viruddhaWarnings.map(([a, b, reason], i) => <li key={i}>{a} + {b} — {reason}</li>)}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              {picked.length === 0 && <p className="text-muted-foreground text-sm">Pick at least one ingredient.</p>}
              {picked.length > 0 && (
                <>
                  <div>
                    <div className="font-semibold mb-2">Classical formulas containing ALL selected ({matchingFormulas.length})</div>
                    {matchingFormulas.length > 0 ? (
                      <ul className="space-y-1">
                        {matchingFormulas.map((fid) => (
                          <li key={fid} className="p-2 bg-muted/40 rounded text-sm">
                            <Link to="/doctor/formulary" className="font-medium text-primary hover:underline">{fid.replace(/-/g, " ")}</Link>
                          </li>
                        ))}
                      </ul>
                    ) : <p className="text-sm text-muted-foreground">No classical formula in our seed contains all selected ingredients.</p>}
                  </div>
                  {partialMatches.length > 0 && (
                    <div>
                      <div className="font-semibold mb-2">Partial matches (≥2 ingredients shared)</div>
                      <ul className="space-y-1">
                        {partialMatches.map(({ fid, c }) => (
                          <li key={fid} className="p-2 bg-muted/30 rounded text-sm flex justify-between">
                            <Link to="/doctor/formulary" className="text-primary hover:underline">{fid.replace(/-/g, " ")}</Link>
                            <Badge variant="outline">{c}/{picked.length} ingredients</Badge>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
              {picked.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => setPicked([])}>Clear selection</Button>
              )}
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </div>
  );
}
