import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AYUSH_THERAPIES, AYUSH_SYSTEMS, type AyushTherapy } from "@/data/ayushTherapyCatalog";
import { Search, Eye, EyeOff, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TherapyCatalog = () => {
  const [q, setQ] = useState("");
  const [system, setSystem] = useState<string>("All");
  const [showPrice, setShowPrice] = useState(true);
  const navigate = useNavigate();

  const groups = useMemo(() => {
    const filtered = AYUSH_THERAPIES.filter((t) => {
      if (system !== "All" && t.system !== system) return false;
      if (!q.trim()) return true;
      const s = q.toLowerCase();
      return t.name.toLowerCase().includes(s) || t.code.toLowerCase().includes(s);
    });
    const m = new Map<string, AyushTherapy[]>();
    for (const t of filtered) {
      const k = `${t.system} · ${t.group}`;
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(t);
    }
    return Array.from(m.entries());
  }, [q, system]);

  const total = AYUSH_THERAPIES.length;
  const shown = groups.reduce((s, [, arr]) => s + arr.length, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-xl">Ayush Therapy Catalog</h1>
            <p className="text-xs text-muted-foreground">
              Ministry of Ayush Benchmark Rates 2026 — {total} therapies across Ayurveda, Yoga, Naturopathy, Physiotherapy, Unani & Siddha. Use for therapy planning & billing.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowPrice((v) => !v)}>
            {showPrice ? <><EyeOff className="mr-1 h-4 w-4" /> Hide prices</> : <><Eye className="mr-1 h-4 w-4" /> Show prices</>}
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-8" placeholder="Search by therapy name or code (e.g. PCK01, Abhyanga)" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-1">
            {(["All", ...AYUSH_SYSTEMS] as const).map((s) => (
              <Button key={s} size="sm" variant={system === s ? "default" : "outline"} onClick={() => setSystem(s)}>
                {s}
              </Button>
            ))}
          </div>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">Showing {shown} of {total}</p>
      </Card>

      {groups.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">No therapies match your search.</Card>
      ) : (
        groups.map(([heading, list]) => (
          <Card key={heading} className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="font-display text-base">{heading}</h2>
              <Badge variant="secondary" className="text-[10px]">{list.length}</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-2 pr-2 w-20">Code</th>
                    <th className="py-2 pr-2">Therapy / Intervention</th>
                    {showPrice && <th className="py-2 pr-2 w-28 text-right">Unit Cost</th>}
                    <th className="py-2 pr-2 w-32 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((t) => (
                    <tr key={t.code} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-2.5 pr-2 font-mono text-xs">{t.code}</td>
                      <td className="py-2.5 pr-2">{t.name}</td>
                      {showPrice && (
                        <td className="py-2.5 pr-2 text-right font-semibold text-primary">₹{t.price.toLocaleString("en-IN")}</td>
                      )}
                      <td className="py-2.5 pr-2 text-right">
                        <Button size="sm" variant="ghost" onClick={() => navigate(`/vaidya/therapy-plans?code=${t.code}`)}>
                          Plan →
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

export default TherapyCatalog;
