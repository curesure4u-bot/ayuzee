import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Library } from "lucide-react";

const YogaProtocolsList = () => {
  const [list, setList] = useState<any[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    supabase.from("yoga_condition_protocols").select("*").eq("is_published", true).order("condition_name")
      .then(({ data }) => setList(data ?? []));
  }, []);

  const filtered = list.filter((p) =>
    !q || (p.condition_name + (p.category ?? "") + (p.description ?? "")).toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search protocols (back pain, PCOS, hypertension…)" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <Card key={p.id} className="rounded-2xl">
            <CardContent className="p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary"><Library className="h-4 w-4" /></span>
                  <div>
                    <p className="font-semibold leading-tight">{p.condition_name}</p>
                    {p.category && <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{p.category}</p>}
                  </div>
                </div>
              </div>
              {p.description && <p className="text-xs text-muted-foreground line-clamp-3">{p.description}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                <Badge variant="outline">{p.duration_weeks ?? "—"} wks</Badge>
                <Badge variant="outline">{p.frequency_per_week ?? "—"}/wk</Badge>
                <Badge variant="secondary">{(p.recommended_asanas?.length ?? 0)} asanas</Badge>
              </div>
              <div className="mt-3 flex justify-end">
                <Link to={`/vaidya/yoga/plans/new?protocol=${p.id}&name=&auto=1`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  Use protocol <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card className="rounded-2xl md:col-span-2 lg:col-span-3"><CardContent className="p-8 text-center text-sm text-muted-foreground">No protocols match.</CardContent></Card>
        )}
      </div>
    </div>
  );
};

export default YogaProtocolsList;
