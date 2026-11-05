import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Pill, ChevronRight } from "lucide-react";

type Drug = {
  id: string; name: string; slug: string; category: string;
  indications: string[] | null; dose: string | null; preferred_use: string | null;
};

const EssentialDrugs = () => {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from("essential_drugs")
        .select("id, name, slug, category, indications, dose, preferred_use")
        .order("name");
      setDrugs(data ?? []);
      setLoading(false);
    })();
  }, []);

  const categories = useMemo(() => {
    const m = new Map<string, number>();
    drugs.forEach((d) => m.set(d.category, (m.get(d.category) ?? 0) + 1));
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [drugs]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return drugs.filter((d) => {
      if (cat !== "all" && d.category !== cat) return false;
      if (!term) return true;
      const hay = `${d.name} ${d.category} ${(d.indications ?? []).join(" ")}`.toLowerCase();
      return hay.includes(term);
    });
  }, [drugs, q, cat]);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl">AYUSH Essential Ayurveda Drugs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          National Essential Medicines List of Ayurveda — {drugs.length} classical formulations across {categories.length} categories.
        </p>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by name or indication (e.g. jwara, arsha, kasa…)" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" variant={cat === "all" ? "default" : "outline"} onClick={() => setCat("all")}>
            All ({drugs.length})
          </Button>
          {categories.map(([c, n]) => (
            <Button key={c} size="sm" variant={cat === c ? "default" : "outline"} onClick={() => setCat(c)}>
              {c} ({n})
            </Button>
          ))}
        </div>
      </Card>

      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!loading && filtered.length === 0 && (
          <Card className="col-span-full p-8 text-center text-sm text-muted-foreground">No drugs match your search.</Card>
        )}
        {filtered.map((d) => (
          <Link key={d.id} to={`/essential-drugs/${d.slug}`}>
            <Card className="h-full p-4 transition-all hover:border-primary hover:shadow-md">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Pill className="h-4 w-4 text-primary" />
                    <p className="font-semibold">{d.name}</p>
                  </div>
                  <Badge variant="secondary" className="mt-1 text-xs">{d.category}</Badge>
                  {d.preferred_use && d.preferred_use !== "Both" && (
                    <Badge variant="outline" className="ml-1 text-xs">{d.preferred_use}</Badge>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
              {d.indications && d.indications.length > 0 && (
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                  <span className="font-medium">Indications:</span> {d.indications.slice(0, 6).join(", ")}
                </p>
              )}
              {d.dose && <p className="mt-1 text-xs"><span className="font-medium">Dose:</span> {d.dose}</p>}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default EssentialDrugs;
