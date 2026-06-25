import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bookmark, BookmarkCheck, Search, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Disease = { ch: number; name: string; modern: string };
type Category = {
  key: string;
  icon: string;
  name: string;
  sanskrit: string;
  modern: string;
  diseases: Disease[];
};

const CATEGORIES: Category[] = [
  {
    key: "pranavaha",
    icon: "🫁",
    name: "Pranavaha Srotas",
    sanskrit: "Pranavaha Srotas",
    modern: "Respiratory System",
    diseases: [
      { ch: 1, name: "Kasa", modern: "Cough" },
      { ch: 2, name: "Tamaka Swasa", modern: "Bronchial Asthma" },
    ],
  },
  {
    key: "annavaha",
    icon: "🍽️",
    name: "Annavaha Srotas",
    sanskrit: "Annavaha Srotas",
    modern: "Digestive System",
    diseases: [{ ch: 3, name: "Amlapitta", modern: "Hyperacidity / GERD" }],
  },
  {
    key: "udakavaha",
    icon: "💧",
    name: "Udakavaha Srotas",
    sanskrit: "Udakavaha Srotas",
    modern: "Water Channels",
    diseases: [{ ch: 4, name: "Jalodara", modern: "Ascites" }],
  },
  {
    key: "rasavaha",
    icon: "🩸",
    name: "Rasavaha Srotas",
    sanskrit: "Rasavaha Srotas",
    modern: "Plasma / Nutrition",
    diseases: [
      { ch: 5, name: "Amavata", modern: "Rheumatoid Arthritis" },
      { ch: 6, name: "Jwara", modern: "Fever (incl. Dengue)" },
      { ch: 7, name: "Pandu", modern: "Anaemia" },
    ],
  },
  {
    key: "raktavaha",
    icon: "🔴",
    name: "Raktavaha Srotas",
    sanskrit: "Raktavaha Srotas",
    modern: "Blood",
    diseases: [
      { ch: 8, name: "Ekakushtha", modern: "Psoriasis" },
      { ch: 9, name: "Kamala", modern: "Jaundice / Liver Disease" },
    ],
  },
  {
    key: "medovaha",
    icon: "⚖️",
    name: "Medovaha Srotas",
    sanskrit: "Medovaha Srotas",
    modern: "Metabolic",
    diseases: [
      { ch: 10, name: "Hypothyroidism", modern: "Hypothyroidism" },
      { ch: 11, name: "Madhumeha", modern: "Diabetes Mellitus" },
      { ch: 12, name: "Sthoulya", modern: "Obesity" },
    ],
  },
  {
    key: "purishavaha",
    icon: "🟫",
    name: "Purishavaha Srotas",
    sanskrit: "Purishavaha Srotas",
    modern: "Excretory",
    diseases: [
      { ch: 13, name: "Arsha", modern: "Haemorrhoids / Piles" },
      { ch: 14, name: "Atisara", modern: "Diarrhoea" },
      { ch: 15, name: "Bhagandara", modern: "Fistula-in-Ano" },
      { ch: 16, name: "Krimi", modern: "Worm Infestation" },
      { ch: 17, name: "Parikartika", modern: "Fissure-in-Ano" },
    ],
  },
  {
    key: "manovaha",
    icon: "🧠",
    name: "Manovaha Srotas",
    sanskrit: "Manovaha Srotas",
    modern: "Mental Health",
    diseases: [
      { ch: 18, name: "Anidra", modern: "Insomnia" },
      { ch: 19, name: "Apasmara", modern: "Epilepsy" },
      { ch: 20, name: "Vishada", modern: "Depression" },
    ],
  },
  {
    key: "mutravaha",
    icon: "🫘",
    name: "Mutravaha Srotas",
    sanskrit: "Mutravaha Srotas",
    modern: "Urinary",
    diseases: [
      { ch: 21, name: "Ashmari", modern: "Urinary Calculi / Kidney Stone" },
      { ch: 22, name: "Mutraghata", modern: "Urinary Retention" },
      { ch: 23, name: "Mutrasthila", modern: "BPH / Prostate" },
    ],
  },
  {
    key: "artavavaha",
    icon: "🌸",
    name: "Artavavaha Srotas",
    sanskrit: "Artavavaha Srotas",
    modern: "Reproductive",
    diseases: [
      { ch: 24, name: "Asrigdara", modern: "DUB / Menorrhagia" },
      { ch: 25, name: "Kashtaarthava", modern: "Dysmenorrhoea" },
      { ch: 26, name: "Shwetapradara", modern: "Leucorrhoea" },
    ],
  },
  {
    key: "vata-vyadhi",
    icon: "⚡",
    name: "Vata Vyadhi",
    sanskrit: "Vata Vyadhi",
    modern: "Neurological",
    diseases: [
      { ch: 27, name: "Avabahuka", modern: "Frozen Shoulder" },
      { ch: 28, name: "Katigraha", modern: "Low Back Pain" },
      { ch: 29, name: "Gridhrasi", modern: "Sciatica" },
      { ch: 30, name: "Pakshaghata", modern: "Hemiplegia / Stroke" },
      { ch: 31, name: "Sandhigata Vata", modern: "Osteoarthritis" },
      { ch: 32, name: "Vatarakta", modern: "Gout" },
    ],
  },
  {
    key: "netragata",
    icon: "👁️",
    name: "Netragata Roga",
    sanskrit: "Netragata Roga",
    modern: "Eye",
    diseases: [
      { ch: 33, name: "Abhishyanda", modern: "Conjunctivitis" },
      { ch: 34, name: "Adhimantha", modern: "Glaucoma" },
    ],
  },
  {
    key: "urdhwa-jatrugata",
    icon: "🦷",
    name: "Urdhwa Jatrugata",
    sanskrit: "Urdhwa Jatrugata",
    modern: "ENT / Head",
    diseases: [
      { ch: 35, name: "Dantavestaka", modern: "Gingivitis" },
      { ch: 36, name: "Mukhapaka", modern: "Stomatitis / Mouth Ulcer" },
      { ch: 37, name: "Pratishyaya", modern: "Rhinitis / Sinusitis" },
      { ch: 38, name: "Shiroroga", modern: "Headache / Migraine" },
    ],
  },
];

export default function ASTGReference() {
  const [selectedKey, setSelectedKey] = useState<string>(CATEGORIES[0].key);
  const [query, setQuery] = useState("");
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  const selected = CATEGORIES.find((c) => c.key === selectedKey) ?? CATEGORIES[0];

  const filteredDiseases = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return selected.diseases;
    return selected.diseases.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.modern.toLowerCase().includes(q),
    );
  }, [query, selected]);

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

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
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search diseases or medicines…"
              className="w-64 pl-8"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Bookmark className="h-4 w-4" />
            Bookmarks
            <Badge variant="secondary" className="ml-1">
              {bookmarks.size}
            </Badge>
          </Button>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        {/* Category sidebar */}
        <aside className="space-y-2">
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
                  <span className="block text-sm font-medium">{c.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {c.modern} · {c.diseases.length}{" "}
                    {c.diseases.length === 1 ? "disease" : "diseases"}
                  </span>
                </span>
              </button>
            );
          })}
        </aside>

        {/* Main content */}
        <main>
          <div className="mb-4 flex items-center gap-3">
            <span className="text-2xl">{selected.icon}</span>
            <div>
              <h2 className="text-xl font-semibold">{selected.name}</h2>
              <p className="text-sm text-muted-foreground">{selected.modern}</p>
            </div>
          </div>

          {filteredDiseases.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No diseases match "{query}" in this category.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDiseases.map((d) => {
                const id = `${selected.key}-${d.ch}`;
                const bookmarked = bookmarks.has(id);
                return (
                  <Card key={id} className="flex flex-col">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Badge variant="outline" className="mb-2 text-xs">
                            Chapter {d.ch}
                          </Badge>
                          <CardTitle className="text-lg leading-tight">
                            {d.name}
                          </CardTitle>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {d.modern}
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
                    <CardContent className="mt-auto pt-2">
                      <Button
                        variant="secondary"
                        className="w-full justify-between"
                        disabled
                      >
                        View Protocol
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <p className="mt-2 text-center text-[11px] text-muted-foreground">
                        Protocol view coming next
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
