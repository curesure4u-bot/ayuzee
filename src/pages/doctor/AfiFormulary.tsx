import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Bookmark, BookOpen, Search } from "lucide-react";

interface FType { id: string; code: string; name: string }
interface Row {
  id: string; afi_number: string | null; afi_part: number | null; name: string;
  classical_text: string | null; dose: string | null;
  indications_modern: string[] | null; indications: string[] | null;
  formulation_type_id: string | null;
  ingredient_count?: number;
}

export default function AfiFormulary() {
  const [types, setTypes] = useState<FType[]>([]);
  const [typeCounts, setTypeCounts] = useState<Record<string, number>>({});
  const [rows, setRows] = useState<Row[]>([]);
  const [activeType, setActiveType] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = "Classical Formulary (AFI) — Ayuzee"; }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: t } = await supabase.from("afi_formulation_types").select("id,code,name").order("sort_order");
      setTypes((t as FType[]) || []);

      const { data: counts } = await supabase
        .from("afi_formulations").select("formulation_type_id").eq("is_published", true);
      const cmap: Record<string, number> = {};
      (counts || []).forEach((r: any) => {
        if (r.formulation_type_id) cmap[r.formulation_type_id] = (cmap[r.formulation_type_id] || 0) + 1;
      });
      setTypeCounts(cmap);
      await fetchRows("all", "");
    })();
    // eslint-disable-next-line
  }, []);

  const fetchRows = async (type: string, q: string) => {
    setLoading(true);
    let query = supabase.from("afi_formulations")
      .select("id,afi_number,afi_part,name,classical_text,dose,indications,indications_modern,formulation_type_id")
      .eq("is_published", true).order("name").limit(500);
    if (type !== "all") query = query.eq("formulation_type_id", type);
    if (q.trim()) query = query.or(`name.ilike.%${q}%,classical_text.ilike.%${q}%`);
    const { data } = await query;
    setRows((data as Row[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchRows(activeType, search); /* eslint-disable-next-line */ }, [activeType]);

  const totalPublished = Object.values(typeCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Classical Formulary</h1>
          <p className="text-sm text-muted-foreground">
            {totalPublished} formulations · Ayurvedic Formulary of India, Govt. of India
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/doctor/afi-formulary/disease-index">
            <Button variant="outline"><BookOpen className="h-4 w-4 mr-2" />Disease Index</Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, classical source, indication..." value={search}
            className="pl-9"
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchRows(activeType, search)} />
        </div>
        <Button onClick={() => fetchRows(activeType, search)}>Search</Button>
      </div>

      {/* Type tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button size="sm" variant={activeType === "all" ? "default" : "outline"} onClick={() => setActiveType("all")}>
          All {totalPublished}
        </Button>
        {types.map(t => (
          <Button key={t.id} size="sm" variant={activeType === t.id ? "default" : "outline"}
            onClick={() => setActiveType(t.id)} className="whitespace-nowrap">
            {t.name} {typeCounts[t.id] || 0}
          </Button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : rows.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No published formulations yet. Admins can extract them from the AFI PDFs via /admin/afi-management.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {rows.map(r => (
            <Link key={r.id} to={`/doctor/afi-formulary/${r.id}`}>
              <Card className="hover:border-primary transition cursor-pointer h-full">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-lg">{r.name}</h3>
                    <Badge variant="outline" className="text-xs whitespace-nowrap">
                      AFI Part {r.afi_part || "?"} · {r.afi_number || ""}
                    </Badge>
                  </div>
                  {r.classical_text && (
                    <p className="text-xs text-muted-foreground italic">{r.classical_text}</p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {(r.indications_modern || r.indications || []).slice(0, 3).map((ind, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{ind}</Badge>
                    ))}
                    {((r.indications_modern?.length || 0) > 3) && (
                      <Badge variant="secondary" className="text-xs">
                        +{(r.indications_modern?.length || 0) - 3} more
                      </Badge>
                    )}
                  </div>
                  {r.dose && (
                    <div className="text-sm"><span className="text-muted-foreground">Dose: </span>{r.dose}</div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
