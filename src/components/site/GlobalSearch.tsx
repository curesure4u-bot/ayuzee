import { FormEvent, useEffect, useRef, useState } from "react";
import { BookOpen, Briefcase, GraduationCap, Loader2, Pill, Search, Sparkles, Stethoscope } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export type SearchType = "doctors" | "therapies" | "medicines" | "courses" | "jobs";

export type GlobalSearchResult = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  icon: typeof Stethoscope;
};

export const searchTabs: { type: SearchType; label: string; icon: typeof Stethoscope }[] = [
  { type: "doctors", label: "Doctors", icon: Stethoscope },
  { type: "therapies", label: "Therapies", icon: Sparkles },
  { type: "medicines", label: "Medicines", icon: Pill },
  { type: "courses", label: "Courses", icon: GraduationCap },
  { type: "jobs", label: "Jobs", icon: Briefcase },
];

const money = (value?: number | null) => value ? `₹${Number(value).toLocaleString("en-IN")}` : "";

export const runGlobalSearch = async (type: SearchType, query: string, limit = 5): Promise<GlobalSearchResult[]> => {
  const q = query.trim();
  if (!q) return [];
  const like = `%${q}%`;
  const today = new Date().toISOString().slice(0, 10);

  if (type === "doctors") {
    const { data } = await supabase.from("doctors").select("id,full_name,specialization,city").eq("is_approved", true).or(`full_name.ilike.${like},specialization.ilike.${like}`).limit(limit);
    return ((data ?? []) as any[]).map((d) => ({ id: d.id, title: d.full_name, subtitle: [d.specialization, d.city].filter(Boolean).join(" · "), href: `/doctors/${d.id}`, icon: Stethoscope }));
  }
  if (type === "therapies") {
    const { data } = await supabase.from("therapies").select("id,name,category,price").eq("is_published", true).eq("is_active", true).or(`name.ilike.${like},category.ilike.${like}`).limit(limit);
    return ((data ?? []) as any[]).map((t) => ({ id: t.id, title: t.name, subtitle: [t.category, money(t.price)].filter(Boolean).join(" · "), href: `/therapies?category=${encodeURIComponent(t.category ?? "")}&q=${encodeURIComponent(t.name)}`, icon: Sparkles }));
  }
  if (type === "medicines") {
    const { data } = await supabase.from("products").select("id,name,brand,category,price,discount_price").or(`name.ilike.${like},category.ilike.${like}`).limit(limit);
    return ((data ?? []) as any[]).map((p) => ({ id: p.id, title: p.name, subtitle: [p.brand, p.category, money(p.discount_price ?? p.price)].filter(Boolean).join(" · "), href: `/shop/${p.id}`, icon: Pill }));
  }
  if (type === "courses") {
    const { data } = await supabase.from("lms_courses").select("id,title,slug,description,category").eq("is_published", true).or(`title.ilike.${like},description.ilike.${like}`).limit(limit);
    return ((data ?? []) as any[]).map((c) => ({ id: c.id, title: c.title, subtitle: c.category ?? "Course", href: `/learning/courses/${c.slug}`, icon: GraduationCap }));
  }
  const { data } = await (supabase as any).from("job_listings").select("id,job_title,specialization,organization_name,location_city,location_state").eq("is_active", true).eq("is_approved", true).or(`expires_at.is.null,expires_at.gt.${today}`).or(`job_title.ilike.${like},specialization.ilike.${like},organization_name.ilike.${like}`).limit(limit);
  return ((data ?? []) as any[]).map((j) => ({ id: j.id, title: j.job_title, subtitle: [j.organization_name, j.specialization, [j.location_city, j.location_state].filter(Boolean).join(", ")].filter(Boolean).join(" · "), href: `/jobs#job-${j.id}`, icon: Briefcase }));
};

export const GlobalSearch = ({ className, autoFocus = false }: { className?: string; autoFocus?: boolean }) => {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<SearchType>("doctors");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GlobalSearchResult[]>([]);

  useEffect(() => {
    const handler = window.setTimeout(async () => {
      const q = query.trim();
      if (q.length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setResults(await runGlobalSearch(active, q, 5));
      setLoading(false);
      setOpen(true);
    }, 300);
    return () => window.clearTimeout(handler);
  }, [query, active]);

  useEffect(() => {
    const onDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const q = query.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}&type=${active}`);
  };

  return (
    <div ref={ref} className={cn("relative w-full md:w-80 lg:w-[420px]", className)}>
      <form onSubmit={submit}>
        <Search className="pointer-events-none absolute left-4 top-5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input autoFocus={autoFocus} value={query} onChange={(e) => setQuery(e.target.value)} onFocus={() => setOpen(true)} className="h-10 rounded-full border-border bg-background pl-11 pr-4 shadow-soft" placeholder="Search doctors, therapies, medicines, colleges..." />
      </form>
      {open && (
        <div className="absolute left-0 right-0 top-12 z-[80] overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95">
          <div className="grid grid-cols-5 gap-1 border-b border-border p-2">
            {searchTabs.map((tab) => (
              <button key={tab.type} type="button" onClick={() => setActive(tab.type)} className={cn("rounded-full px-2 py-1.5 text-[11px] font-semibold transition-smooth hover:bg-primary/10", active === tab.type ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>{tab.label}</button>
            ))}
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {loading && <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Searching…</div>}
            {!loading && query.trim().length < 2 && <p className="px-3 py-8 text-center text-sm text-muted-foreground">Type at least 2 characters to search.</p>}
            {!loading && query.trim().length >= 2 && results.length === 0 && <p className="px-3 py-8 text-center text-sm text-muted-foreground">No results found.</p>}
            {!loading && results.map((result) => (
              <Link key={`${active}-${result.id}`} to={result.href} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl p-3 transition-smooth hover:bg-primary/10">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><result.icon className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{result.title}</span><span className="block truncate text-xs text-muted-foreground">{result.subtitle}</span></span>
              </Link>
            ))}
          </div>
          {query.trim() && <Link to={`/search?q=${encodeURIComponent(query.trim())}&type=${active}`} onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 border-t border-border px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/10"><BookOpen className="h-4 w-4" /> See all results for “{query.trim()}”</Link>}
        </div>
      )}
    </div>
  );
};
