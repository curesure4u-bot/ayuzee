import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen, Search, ShieldCheck } from "lucide-react";

interface FType { id: string; code: string; name: string }
interface Row {
  id: string; afi_number: string | null; afi_part: number | null; name: string;
  classical_text: string | null; dose: string | null;
  indications_modern: string[] | null; indications: string[] | null;
  formulation_type_id: string | null;
  anupana: string | null;
  has_physicochemical_standards: boolean | null;
  api_volume: string | null;
}

const ANUPANA_OPTIONS = ["All", "Water", "Warm milk", "Honey", "Ghee", "Ginger juice", "Others"];

export default function AfiFormulary() {
  const [types, setTypes] = useState<FType[]>([]);
  const [typeCounts, setTypeCounts] = useState<Record<string, number>>({});
  const [rows, setRows] = useState<Row[]>([]);
  const [activeType, setActiveType] = useState<string>("all");
  const [anupanaFilter, setAnupanaFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  usePageSEO({ title: "Classical Formulary (AFI + API) — Ayuzee", noIndex: true });

  useEffect(() => {
    (async () => {
      const { data: t } = await supabase.from("afi_formulation_types").select("id,code,name").order("sort_order");
      setTypes((t as FType[]) || []);

      const { data: counts } = await supabase
        .from("afi_formulations").select("formulation_type_id").eq("is_published", true);
      const cmap: Record<string, number> = {};
      (counts || []).forEach((r: { formulation_type_id: string | null }) => {
        if (r.formulation_type_id) cmap[r.formulation_type_id] = (cmap[r.formulation_type_id] || 0) + 1;
      });
      setTypeCounts(cmap);
      await fetchRows("all", "", "All");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRows = async (type: string, q: string, anu: string) => {
    setLoading(true);

    // If query looks like a botanical name search, get formulation IDs from botanical table first
    let botanicalIds: string[] | null = null;
    if (q.trim().length >= 3) {
      const { data: bot } = await supabase
        .from("api_botanical_names")
        .select("formulation_id")
        .or(`botanical_name.ilike.%${q}%,sanskrit_name.ilike.%${q}%,common_name.ilike.%${q}%`)
        .limit(500);
      const ids = Array.from(new Set((bot || []).map((b: { formulation_id: string }) => b.formulation_id)));
      if (ids.length > 0) botanicalIds = ids;
    }

    let query = supabase.from("afi_formulations")
      .select("id,afi_number,afi_part,name,classical_text,dose,indications,indications_modern,formulation_type_id,anupana,has_physicochemical_standards,api_volume")
      .eq("is_published", true).order("name").limit(500);
    if (type !== "all") query = query.eq("formulation_type_id", type);

    if (q.trim()) {
      // Search name/classical/indications OR formulation IDs matched by botanical search
      const conds = [
        `name.ilike.%${q}%`,
        `classical_text.ilike.%${q}%`,
      ];
      if (botanicalIds && botanicalIds.length > 0) {
        conds.push(`id.in.(${botanicalIds.join(",")})`);
      }
      query = query.or(conds.join(","));
    }

    if (anu !== "All") {
      if (anu === "Others") {
        const known = ["Water", "Warm milk", "Honey", "Ghee", "Ginger juice"];
        query = query.not("anupana", "is", null).not("anupana", "in", `(${known.map(k => `"${k}"`).join(",")})`);
      } else {
        query = query.ilike("anupana", `%${anu}%`);
      }
    }

    const { data } = await query;
    setRows((data as Row[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRows(activeType, search, anupanaFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeType, anupanaFilter]);

  const totalPublished = Object.values(typeCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Classical Formulary</h1>
          <p className="text-sm text-muted-foreground">
            {totalPublished} formulations · Ayurvedic Formulary of India + API Part II quality standards
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/doctor/afi-formulary/disease-index">
            <Button variant="outline"><BookOpen className="h-4 w-4 mr-2" />Disease Index</Button>
          </Link>
        </div>
      </div>

      <div className="flex gap-2 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name, classical source, Sanskrit or botanical herb (e.g. Piper longum)…"
            value={search}
            className="pl-9"
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchRows(activeType, search, anupanaFilter)} />
        </div>
        <Button onClick={() => fetchRows(activeType, search, anupanaFilter)}>Search</Button>
      </div>

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

      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-xs text-muted-foreground">Anupāna:</span>
        {ANUPANA_OPTIONS.map(a => (
          <Button key={a} size="sm" variant={anupanaFilter === a ? "secondary" : "ghost"}
            className="h-7 px-2 text-xs"
            onClick={() => setAnupanaFilter(a)}>
            {a}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : rows.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No published formulations match. Admins can extract them from PDFs via /admin/afi-management.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {rows.map(r => (
            <Link key={r.id} to={`/doctor/afi-formulary/${r.id}`}>
              <Card className="hover:border-primary transition cursor-pointer h-full">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-lg">{r.name}</h3>
                    <div className="flex flex-col items-end gap-1">
                      {r.afi_part && (
                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                          AFI {r.afi_part} · {r.afi_number || ""}
                        </Badge>
                      )}
                      {r.has_physicochemical_standards && (
                        <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px]">
                          <ShieldCheck className="h-3 w-3 mr-1" />API Verified
                        </Badge>
                      )}
                    </div>
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
                  <div className="text-sm flex justify-between">
                    {r.dose && <span><span className="text-muted-foreground">Dose: </span>{r.dose}</span>}
                    {r.anupana && <span className="text-xs text-muted-foreground">+ {r.anupana}</span>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
