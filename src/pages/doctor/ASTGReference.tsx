import { Fragment, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Bookmark,
  BookmarkCheck,
  Search,
  ChevronRight,
  Filter,
  Pill,
  Stethoscope,
  Activity,
  Keyboard,
  GitCompareArrows,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORIES, type Disease, type Category } from "@/data/astg";
import {
  search,
  MEDICINE_INDEX,
  diseaseMatchesDosha,
  diseaseMatchesLevel,
  ALL_DISEASES,
  type DoshaFilter,
  type LevelFilter,
} from "@/lib/astg-search";
import ASTGClinicalAssistant from "@/components/astg/ASTGClinicalAssistant";
import { getRecent } from "@/lib/astg-history";

function RecentlyViewedStrip() {
  const items = getRecent();
  if (!items.length) return null;
  return (
    <div className="mb-4 rounded-lg border bg-muted/30 p-3">
      <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Recently Viewed</div>
      <div className="flex flex-wrap gap-2">
        {items.map((r) => (
          <a key={r.diseaseKey} href={`/doctor/astg-reference/${r.categoryKey}/${r.diseaseKey}`}
             className="rounded-md border bg-background px-3 py-1.5 text-sm hover:bg-muted">
            <span className="font-medium">{r.name}</span>
            <span className="ml-2 text-xs text-muted-foreground">{new Date(r.viewedAt).toLocaleDateString()}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

const DOSHAS: { value: DoshaFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "vata", label: "Vataja" },
  { value: "pitta", label: "Pittaja" },
  { value: "kapha", label: "Kaphaja" },
  { value: "tridosha", label: "Tridosha" },
];

const LEVELS: { value: LevelFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: 1, label: "L1 · PHC" },
  { value: 2, label: "L2 · CHC" },
  { value: 3, label: "L3 · DH" },
];

export default function ASTGReference() {
  const navigate = useNavigate();
  const [selectedKey, setSelectedKey] = useState<string>(CATEGORIES[0].key);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [dosha, setDosha] = useState<DoshaFilter>("all");
  const [level, setLevel] = useState<LevelFilter>("all");
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [quickOpen, setQuickOpen] = useState(false);
  const [medicineQuery, setMedicineQuery] = useState("");

  const selected = CATEGORIES.find((c) => c.key === selectedKey) ?? CATEGORIES[0];

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const results = useMemo(() => search(debounced), [debounced]);

  // Cmd+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setQuickOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const filteredDiseases = useMemo(() => {
    return selected.diseases.filter(
      (d) => diseaseMatchesDosha(d, dosha) && diseaseMatchesLevel(d, level),
    );
  }, [selected, dosha, level]);

  const toggleBookmark = (id: string) =>
    setBookmarks((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleCompare = (id: string) =>
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });

  const comparing = compareIds
    .map((id) => ALL_DISEASES.find((d) => d.id === id))
    .filter(Boolean) as { category: Category; disease: Disease; id: string }[];

  const medicineMatches = useMemo(() => {
    const q = medicineQuery.trim().toLowerCase();
    if (!q) return [];
    return MEDICINE_INDEX.filter((m) => m.name.toLowerCase().includes(q)).slice(0, 30);
  }, [medicineQuery]);

  return (
    <div className="container py-6">
      <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Ayurvedic Standard Treatment Guidelines
          </h1>
          <p className="text-sm text-muted-foreground">
            Ministry of AYUSH, Govt. of India — 2017 Edition
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="secondary">AYUSH</Badge>
            <Badge variant="outline">38 Diseases</Badge>
            <Badge variant="outline">13 Srotas</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              placeholder="Search diseases, medicines, symptoms…"
              className="w-72 pl-8"
            />
            {showResults && debounced.length >= 2 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-96 overflow-y-auto rounded-md border bg-popover p-2 shadow-lg">
                {results.diseases.length === 0 &&
                results.medicines.length === 0 &&
                results.symptoms.length === 0 ? (
                  <p className="px-2 py-3 text-sm text-muted-foreground">
                    No matches for "{debounced}"
                  </p>
                ) : (
                  <>
                    {results.diseases.length > 0 && (
                      <div className="mb-2">
                        <p className="px-2 py-1 text-xs font-semibold uppercase text-muted-foreground">
                          🏥 Diseases
                        </p>
                        {results.diseases.map((h) => (
                          <button
                            key={h.id}
                            onMouseDown={() =>
                              navigate(
                                `/doctor/astg-reference/${h.category.key}/${h.disease.key}`,
                              )
                            }
                            className="flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
                          >
                            <span>
                              <span className="font-medium">{h.disease.name}</span>{" "}
                              <span className="text-muted-foreground">
                                — {h.disease.modern}
                              </span>
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {h.category.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                    {results.medicines.length > 0 && (
                      <div className="mb-2">
                        <p className="px-2 py-1 text-xs font-semibold uppercase text-muted-foreground">
                          💊 Medicines
                        </p>
                        {results.medicines.map((m) => (
                          <button
                            key={m.name}
                            onMouseDown={() => {
                              setMedicineQuery(m.name);
                              document
                                .getElementById("astg-tab-medicines")
                                ?.click();
                            }}
                            className="flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
                          >
                            <span className="font-medium">{m.name}</span>
                            <span className="text-xs text-muted-foreground">
                              used in {m.uses.length}{" "}
                              {m.uses.length === 1 ? "disease" : "diseases"}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                    {results.symptoms.length > 0 && (
                      <div>
                        <p className="px-2 py-1 text-xs font-semibold uppercase text-muted-foreground">
                          🔍 Symptoms
                        </p>
                        {results.symptoms.map((s, i) => (
                          <button
                            key={i}
                            onMouseDown={() =>
                              navigate(
                                `/doctor/astg-reference/${s.category.key}/${s.disease.key}`,
                              )
                            }
                            className="flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
                          >
                            <span className="truncate">{s.symptom}</span>
                            <span className="text-xs text-muted-foreground">
                              → {s.disease.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setQuickOpen(true)}
          >
            <Keyboard className="h-4 w-4" />
            Quick Lookup
            <kbd className="ml-1 hidden rounded border bg-muted px-1 text-[10px] sm:inline">
              ⌘K
            </kbd>
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Bookmark className="h-4 w-4" />
            Bookmarks
            <Badge variant="secondary" className="ml-1">
              {bookmarks.size}
            </Badge>
          </Button>
        </div>
      </header>

      <RecentlyViewedStrip />

      <Tabs defaultValue="browse">
        <TabsList>
          <TabsTrigger value="browse">Browse by System</TabsTrigger>
          <TabsTrigger value="medicines" id="astg-tab-medicines">
            <Pill className="mr-1.5 h-4 w-4" />
            Medicine Finder
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="mt-4">
          <div className="grid gap-6 md:grid-cols-[280px_1fr]">
            <aside className="space-y-4">
              {/* Filter panel */}
              <div className="rounded-lg border bg-card p-3">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Filter className="h-3.5 w-3.5" /> Filters
                </div>
                <p className="mt-2 text-[11px] font-medium text-muted-foreground">
                  Dosha
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {DOSHAS.map((d) => (
                    <Button
                      key={d.value}
                      size="sm"
                      variant={dosha === d.value ? "default" : "outline"}
                      className="h-7 px-2 text-xs"
                      onClick={() => setDosha(d.value)}
                    >
                      {d.label}
                    </Button>
                  ))}
                </div>
                <p className="mt-3 text-[11px] font-medium text-muted-foreground">
                  Treatment Level
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {LEVELS.map((l) => (
                    <Button
                      key={String(l.value)}
                      size="sm"
                      variant={level === l.value ? "default" : "outline"}
                      className="h-7 px-2 text-xs"
                      onClick={() => setLevel(l.value)}
                    >
                      {l.label}
                    </Button>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between rounded-md border border-dashed p-2">
                  <span className="flex items-center gap-1.5 text-xs">
                    <GitCompareArrows className="h-3.5 w-3.5" />
                    Compare mode
                  </span>
                  <Button
                    size="sm"
                    variant={compareMode ? "default" : "outline"}
                    className="h-6 px-2 text-xs"
                    onClick={() => {
                      setCompareMode((v) => !v);
                      if (compareMode) setCompareIds([]);
                    }}
                  >
                    {compareMode ? "On" : "Off"}
                  </Button>
                </div>
              </div>

              <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Body Systems (Srotas)
              </p>
              {CATEGORIES.map((c) => {
                const active = c.key === selectedKey;
                return (
                  <button
                    key={c.key}
                    onClick={() => setSelectedKey(c.key)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                      active
                        ? "border-primary bg-primary/5"
                        : "hover:border-muted-foreground/30 hover:bg-muted/50",
                    )}
                  >
                    <span className="text-xl leading-none">{c.icon}</span>
                    <span className="flex-1">
                      <span className="flex items-center gap-1.5 text-sm font-medium">
                        {c.name}
                        {c.guidelineYear === 2025 && (
                          <Badge className="h-4 bg-emerald-600 px-1.5 text-[10px] leading-none text-white hover:bg-emerald-600">
                            Updated 2025
                          </Badge>
                        )}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {c.modern} · {c.diseases.length}{" "}
                        {c.diseases.length === 1 ? "disease" : "diseases"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </aside>

            <main>
              <div className="mb-4 flex items-center gap-3">
                <span className="text-2xl">{selected.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">{selected.name}</h2>
                    {selected.guidelineYear === 2025 && (
                      <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                        Updated 2025
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{selected.modern}</p>
                  {selected.sourceNote && (
                    <p className="mt-0.5 text-xs text-muted-foreground italic">
                      Source: {selected.sourceNote}
                    </p>
                  )}
                </div>
                {compareMode && comparing.length > 0 && (
                  <Badge variant="secondary">
                    Comparing {comparing.length}/2
                  </Badge>
                )}
              </div>

              {compareMode && comparing.length === 2 && (
                <ComparisonView
                  a={comparing[0]}
                  b={comparing[1]}
                  onClear={() => setCompareIds([])}
                />
              )}

              {filteredDiseases.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center text-sm text-muted-foreground">
                    No diseases match the current filters in this category.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredDiseases.map((dx) => {
                    const id = `${selected.key}-${dx.key}`;
                    const bookmarked = bookmarks.has(id);
                    const hasProtocol = !!dx.levels?.length;
                    const inCompare = compareIds.includes(id);
                    return (
                      <Card
                        key={id}
                        className={cn(
                          "flex flex-col",
                          inCompare && "ring-2 ring-primary",
                        )}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="mb-2 flex flex-wrap items-center gap-1.5">
                                <Badge variant="outline" className="text-xs">
                                  Chapter {dx.ch}
                                </Badge>
                                {(dx.guidelineYear ?? selected.guidelineYear) === 2025 && (
                                  <Badge className="h-5 bg-emerald-600 px-1.5 text-[10px] text-white hover:bg-emerald-600">
                                    Updated 2025
                                  </Badge>
                                )}
                              </div>
                              <CardTitle className="text-lg leading-tight">
                                {dx.name}
                              </CardTitle>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {dx.modern}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={
                                bookmarked ? "Remove bookmark" : "Add bookmark"
                              }
                              onClick={() => toggleBookmark(id)}
                            >
                              {bookmarked ? (
                                <BookmarkCheck className="h-5 w-5 text-primary" />
                              ) : (
                                <Bookmark className="h-5 w-5" />
                              )}
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="mt-auto space-y-2 pt-2">
                          {compareMode && (
                            <Button
                              variant={inCompare ? "default" : "outline"}
                              size="sm"
                              className="w-full"
                              onClick={() => toggleCompare(id)}
                            >
                              {inCompare ? "Selected" : "Add to Compare"}
                            </Button>
                          )}
                          <Button
                            asChild={hasProtocol}
                            variant="secondary"
                            className="w-full justify-between"
                            disabled={!hasProtocol}
                          >
                            {hasProtocol ? (
                              <Link
                                to={`/doctor/astg-reference/${selected.key}/${dx.key}`}
                              >
                                View Protocol
                                <ChevronRight className="h-4 w-4" />
                              </Link>
                            ) : (
                              <span>
                                Protocol coming soon
                                <ChevronRight className="h-4 w-4" />
                              </span>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </main>
          </div>
        </TabsContent>

        <TabsContent value="medicines" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" /> Medicine Finder
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter a medicine name to see every disease it's prescribed for, the
                facility level, and dosing.
              </p>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="e.g. Sitopaladi Churna, Chandraprabha Vati, Triphala…"
                value={medicineQuery}
                onChange={(e) => setMedicineQuery(e.target.value)}
              />
              {medicineQuery.trim() && (
                <div className="mt-4 space-y-3">
                  {medicineMatches.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No medicines match "{medicineQuery}".
                    </p>
                  ) : (
                    medicineMatches.map((m) => (
                      <Card key={m.name}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{m.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">
                            Used in {m.uses.length}{" "}
                            {m.uses.length === 1 ? "disease" : "diseases"}
                          </p>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-1.5">
                            {m.uses.map((u, i) => (
                              <Link
                                key={i}
                                to={`/doctor/astg-reference/${u.category.key}/${u.disease.key}`}
                                className="flex items-center justify-between gap-2 rounded border px-2 py-1.5 text-sm hover:bg-muted"
                              >
                                <span>
                                  <span className="font-medium">
                                    {u.disease.name}
                                  </span>{" "}
                                  <span className="text-muted-foreground">
                                    · L{u.level} · {u.medicine.dose ?? "—"}
                                    {u.medicine.anupana ? ` · ${u.medicine.anupana}` : ""}
                                  </span>
                                </span>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </Link>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Lookup floating button */}
      <Button
        size="lg"
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg"
        onClick={() => setQuickOpen(true)}
        aria-label="Quick disease lookup"
      >
        <Search className="h-5 w-5" />
      </Button>

      <ASTGClinicalAssistant variant="floating" />


      <Dialog open={quickOpen} onOpenChange={setQuickOpen}>
        <DialogContent className="p-0 sm:max-w-lg">
          <Command>
            <CommandInput placeholder="Quick lookup — type a disease name…" />
            <CommandList>
              <CommandEmpty>No diseases found.</CommandEmpty>
              <CommandGroup heading="A–Z Diseases">
                {[...ALL_DISEASES]
                  .sort((a, b) => a.disease.name.localeCompare(b.disease.name))
                  .map((h) => (
                    <CommandItem
                      key={h.id}
                      value={`${h.disease.name} ${h.disease.modern}`}
                      onSelect={() => {
                        setQuickOpen(false);
                        navigate(
                          `/doctor/astg-reference/${h.category.key}/${h.disease.key}`,
                        );
                      }}
                    >
                      <Stethoscope className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{h.disease.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {h.disease.modern}
                      </span>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ComparisonView({
  a,
  b,
  onClear,
}: {
  a: { category: Category; disease: Disease };
  b: { category: Category; disease: Disease };
  onClear: () => void;
}) {
  const rows: { label: string; get: (d: Disease) => string }[] = [
    { label: "Modern", get: (d) => d.modern },
    { label: "Definition", get: (d) => d.definition ?? "—" },
    { label: "Key Symptoms", get: (d) => (d.lakshana ?? []).slice(0, 4).join("; ") || "—" },
    { label: "Diagnostic", get: (d) => d.diagnostic ?? "—" },
    {
      label: "Top L1 Medicines",
      get: (d) =>
        (d.levels?.find((l) => l.level === 1)?.medicines ?? [])
          .slice(0, 3)
          .map((m) => m.name)
          .join(", ") || "—",
    },
    { label: "Pathya", get: (d) => d.pathya ?? "—" },
    { label: "Apathya", get: (d) => d.apathya ?? "—" },
  ];
  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4" /> Differential Comparison
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClear} className="gap-1">
          <X className="h-4 w-4" /> Clear
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div />
          <div className="font-semibold">{a.disease.name}</div>
          <div className="font-semibold">{b.disease.name}</div>
          {rows.map((row) => {
            const va = row.get(a.disease);
            const vb = row.get(b.disease);
            const diff = va !== vb;
            return (
              <Fragment key={row.label}>
                <div className="text-xs font-medium uppercase text-muted-foreground">
                  {row.label}
                </div>
                <div className={cn("rounded p-2", diff && "bg-amber-50 dark:bg-amber-950/30")}>
                  {va}
                </div>
                <div className={cn("rounded p-2", diff && "bg-amber-50 dark:bg-amber-950/30")}>
                  {vb}
                </div>
              </Fragment>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
