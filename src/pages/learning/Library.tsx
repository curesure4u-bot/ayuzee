import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { setSEO } from "@/lib/seo";
import {
  Search,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  Sparkles,
  MapPin,
  Stethoscope,
  ListChecks,
  Combine,
  Activity,
  Library as LibraryIcon,
  Flower2,
  Pill,
  Bone,
  HeartHandshake,
  Download,
  Clock,
  type LucideIcon,
} from "lucide-react";

type Category =
  | "Acupuncture"
  | "Ayurveda"
  | "Homeopathy"
  | "Yoga"
  | "Spine"
  | "Therapies"
  | "Downloads";

interface Resource {
  id: string;
  title: string;
  desc: string;
  to: string;
  icon: LucideIcon;
  category: Category;
  tags: string[];
  badge?: string;
}

const RESOURCES: Resource[] = [
  {
    id: "acu-hub",
    title: "Acupuncture Hub",
    desc: "Central workspace for all integrated acupuncture references and protocols.",
    to: "/treatments/acupuncture",
    icon: Activity,
    category: "Acupuncture",
    tags: ["acupuncture", "hub", "overview"],
    badge: "Hub",
  },
  {
    id: "tung",
    title: "Tung's Acupuncture Points",
    desc: "Fast access to classical Master Tung point systems.",
    to: "/treatments/tung-points",
    icon: Sparkles,
    category: "Acupuncture",
    tags: ["tung", "master tung", "extraordinary points", "classical"],
  },
  {
    id: "acupoints",
    title: "Acupoints & Their Uses",
    desc: "Search meridian points, actions and indications.",
    to: "/treatments/acupoints-uses",
    icon: MapPin,
    category: "Acupuncture",
    tags: ["meridian", "LI4", "ST36", "points", "indications"],
  },
  {
    id: "acu-50",
    title: "50 Diseases — Quick Protocols",
    desc: "Rapid treatment combinations for common conditions.",
    to: "/treatments/acupuncture-50-diseases",
    icon: Stethoscope,
    category: "Acupuncture",
    tags: ["protocols", "quick", "sciatica", "migraine", "stress"],
  },
  {
    id: "acu-300",
    title: "300 Diseases with Points",
    desc: "Expanded clinical protocol encyclopedia.",
    to: "/treatments/acupuncture-300-diseases",
    icon: ListChecks,
    category: "Acupuncture",
    tags: ["encyclopedia", "cervical spondylosis", "diseases"],
  },
  {
    id: "acu-homeo",
    title: "Acupuncture × Homeopathy",
    desc: "Integrative protocols and clinical synergy concepts.",
    to: "/treatments/acupuncture-homeopathy",
    icon: Combine,
    category: "Acupuncture",
    tags: ["homeopathy", "belladonna", "integrative"],
  },
];

const CATEGORIES: { key: Category | "All"; label: string; icon: LucideIcon }[] = [
  { key: "All", label: "All", icon: LibraryIcon },
  { key: "Ayurveda", label: "Ayurveda", icon: Flower2 },
  { key: "Acupuncture", label: "Acupuncture", icon: Activity },
  { key: "Homeopathy", label: "Homeopathy", icon: Pill },
  { key: "Yoga", label: "Yoga", icon: Flower2 },
  { key: "Spine", label: "Spine", icon: Bone },
  { key: "Therapies", label: "Therapies", icon: HeartHandshake },
  { key: "Downloads", label: "Downloads", icon: Download },
];

const FUTURE_CATEGORIES = [
  "Siddha references",
  "Unani references",
  "Panchakarma manuals",
  "Rehab protocols",
  "Student notes",
  "Video lessons",
];

const BOOKMARK_KEY = "ayuzee.library.bookmarks";
const RECENT_KEY = "ayuzee.library.recent";

const Library = () => {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Category | "All">("All");
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    setSEO(
      "Ayuzee Knowledge Library | Clinical Reference Hub",
      "Premium clinical reference library for Ayurveda, Acupuncture, Homeopathy, Yoga and integrative medicine — search by disease, point, meridian or remedy."
    );
    try {
      setBookmarks(JSON.parse(localStorage.getItem(BOOKMARK_KEY) || "[]"));
      setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"));
    } catch {
      // ignore
    }
  }, []);

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(BOOKMARK_KEY, JSON.stringify(next));
      return next;
    });
  };

  const markRecent = (id: string) => {
    setRecent((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, 8);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return RESOURCES.filter((r) => {
      const inCat = active === "All" || r.category === active;
      const inQuery =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.desc.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q));
      return inCat && inQuery;
    });
  }, [query, active]);

  const bookmarked = RESOURCES.filter((r) => bookmarks.includes(r.id));
  const recentResources = recent
    .map((id) => RESOURCES.find((r) => r.id === id))
    .filter(Boolean) as Resource[];

  return (
    <div className="min-h-screen bg-[#0f141b] text-white">
      <SiteNav />

      {/* Hero */}
      <section className="border-b border-[#2a313d] bg-gradient-to-br from-[#10161f] via-[#0f141b] to-[#0b0f15]">
        <div className="container py-12">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#34d399]">
            <LibraryIcon className="h-4 w-4" />
            Ayuzee Library
          </div>
          <h1 className="mt-3 font-display text-4xl md:text-5xl font-bold">
            Ayuzee Knowledge Library
          </h1>
          <p className="mt-3 max-w-2xl text-sm md:text-base text-white/70">
            Clinical Reference Library for Ayurveda, Acupuncture, Homeopathy, Yoga &amp;
            Integrative Medicine.
          </p>

          {/* Search */}
          <div className="mt-6 flex max-w-2xl items-center gap-2 rounded-xl border border-[#2a313d] bg-[#171c24] px-3">
            <Search className="h-4 w-4 text-white/50" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search disease, symptom, point (LI4), meridian, remedy…"
              className="border-0 bg-transparent text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-xs text-white/50 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category tabs */}
          <div className="mt-5 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              const isActive = active === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setActive(c.key)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    isActive
                      ? "border-[#34d399] bg-[#34d399]/15 text-[#34d399]"
                      : "border-[#2a313d] bg-[#171c24] text-white/70 hover:border-[#34d399]/60 hover:text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <main className="container py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          {/* Cards grid */}
          <div>
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="font-display text-xl">
                {active === "All" ? "All references" : `${active} Library`}
              </h2>
              <span className="text-xs text-white/50">{filtered.length} item(s)</span>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-xl border border-[#2a313d] bg-[#171c24] p-10 text-center text-sm text-white/60">
                No references match your search yet. Try another keyword or category.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filtered.map((r) => {
                  const Icon = r.icon;
                  const isBm = bookmarks.includes(r.id);
                  const isRecent = recent.includes(r.id);
                  return (
                    <div
                      key={r.id}
                      className="group relative overflow-hidden rounded-2xl border border-[#2a313d] bg-[#171c24] p-5 transition hover:border-[#34d399]/60 hover:shadow-[0_0_0_1px_rgba(52,211,153,0.2),0_18px_40px_-20px_rgba(52,211,153,0.35)]"
                    >
                      <div className="flex items-start justify-between">
                        <div className="rounded-xl bg-[#34d399]/10 p-2.5 text-[#34d399]">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex items-center gap-2">
                          {isRecent && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#fbbf24]/15 px-2 py-0.5 text-[10px] font-semibold text-[#fbbf24]">
                              <Clock className="h-3 w-3" /> Recent
                            </span>
                          )}
                          <button
                            onClick={() => toggleBookmark(r.id)}
                            aria-label={isBm ? "Remove bookmark" : "Bookmark"}
                            className={`rounded-md p-1.5 transition ${
                              isBm
                                ? "bg-[#fbbf24]/15 text-[#fbbf24]"
                                : "text-white/50 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            {isBm ? (
                              <BookmarkCheck className="h-4 w-4" />
                            ) : (
                              <Bookmark className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <h3 className="mt-4 font-display text-lg font-semibold">{r.title}</h3>
                      <p className="mt-1.5 text-sm text-white/60">{r.desc}</p>
                      <div className="mt-4 flex items-center gap-2">
                        <Button
                          asChild
                          size="sm"
                          className="bg-[#34d399] text-[#0f141b] hover:bg-[#34d399]/90"
                        >
                          <Link to={r.to} onClick={() => markRecent(r.id)}>
                            Open <ArrowRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                        <span className="ml-auto rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/50">
                          {r.category}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Future ready */}
            <div className="mt-10 rounded-2xl border border-dashed border-[#2a313d] bg-[#0f141b] p-6">
              <h3 className="font-display text-lg">Coming soon</h3>
              <p className="mt-1 text-sm text-white/60">
                Expandable categories ready for future uploads by the Ayuzee admin team.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {FUTURE_CATEGORIES.map((f) => (
                  <span
                    key={f}
                    className="rounded-full border border-[#2a313d] bg-[#171c24] px-3 py-1 text-xs text-white/60"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            <div className="rounded-2xl border border-[#2a313d] bg-[#171c24] p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <BookmarkCheck className="h-4 w-4 text-[#fbbf24]" /> Bookmarks
              </div>
              {bookmarked.length === 0 ? (
                <p className="mt-3 text-xs text-white/50">
                  Tap the bookmark icon on any card to save it here.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {bookmarked.map((r) => (
                    <li key={r.id}>
                      <Link
                        to={r.to}
                        onClick={() => markRecent(r.id)}
                        className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-white/80 hover:bg-white/5 hover:text-white"
                      >
                        <span className="truncate">{r.title}</span>
                        <ArrowRight className="h-3.5 w-3.5 opacity-50" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-[#2a313d] bg-[#171c24] p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Clock className="h-4 w-4 text-[#34d399]" /> Recently viewed
              </div>
              {recentResources.length === 0 ? (
                <p className="mt-3 text-xs text-white/50">No history yet.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {recentResources.map((r) => (
                    <li key={r.id}>
                      <Link
                        to={r.to}
                        className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-white/80 hover:bg-white/5 hover:text-white"
                      >
                        <span className="truncate">{r.title}</span>
                        <ArrowRight className="h-3.5 w-3.5 opacity-50" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>

        <p className="mt-10 text-center text-xs text-white/40">
          Powered by Ayuzee AI · Learn • Reference • Heal
        </p>
      </main>

      <Footer />
    </div>
  );
};

export default Library;
