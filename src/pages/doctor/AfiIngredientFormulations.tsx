import {  useEffect, useState  } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2 } from "lucide-react";

interface BotRow {
  id: string;
  formulation_id: string;
  ingredient_serial: number | null;
  sanskrit_name: string | null;
  botanical_name: string | null;
  common_name: string | null;
  part_used: string | null;
  part_used_full: string | null;
  quantity_ratio: string | null;
  is_prakshepa: boolean;
  afi_formulations?: {
    id: string;
    name: string;
    name_original: string | null;
    formulation_type_id: string | null;
    is_published: boolean;
  } | null;
}

export default function AfiIngredientFormulations() {
  const { botanical } = useParams<{ botanical: string }>();
  const nav = useNavigate();
  const decoded = decodeURIComponent(botanical || "");
  const [rows, setRows] = useState<BotRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeNames, setTypeNames] = useState<Record<string, string>>({});

  usePageSEO({
    title: `${decoded} — Formulations | Ayuzee`,
    noIndex: true,
  });

  useEffect(() => { (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("api_botanical_names")
        .select(`
          id, formulation_id, ingredient_serial, sanskrit_name, botanical_name,
          common_name, part_used, part_used_full, quantity_ratio, is_prakshepa,
          afi_formulations!inner ( id, name, name_original, formulation_type_id, is_published )
        `)
        .ilike("botanical_name", `%${decoded}%`)
        .eq("afi_formulations.is_published", true)
        .order("ingredient_serial");
      const filtered = ((data as unknown as BotRow[]) || []).filter(r => r.afi_formulations);
      setRows(filtered);

      const { data: t } = await supabase.from("afi_formulation_types").select("id,name");
      const m: Record<string, string> = {};
      (t || []).forEach((row: { id: string; name: string }) => { m[row.id] = row.name; });
      setTypeNames(m);
      setLoading(false);
    })();
  }, [decoded]);

  // Pick the first row's metadata to show in the header
  const meta = rows[0];

  // De-dupe by formulation
  const byForm = new Map<string, BotRow>();
  rows.forEach(r => { if (!byForm.has(r.formulation_id)) byForm.set(r.formulation_id, r); });
  const unique = Array.from(byForm.values());

  return (
    <div className="container mx-auto px-4 py-6 space-y-4">
      <Button variant="ghost" size="sm" onClick={() => nav(-1)}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>

      <div>
        <h1 className="text-2xl font-bold italic">{decoded}</h1>
        {meta && (
          <p className="text-sm text-muted-foreground">
            {meta.sanskrit_name && <>Sanskrit: <span className="font-medium">{meta.sanskrit_name}</span></>}
            {meta.common_name && <> · Common: <span className="font-medium">{meta.common_name}</span></>}
            {meta.part_used_full && <> · Part commonly used: <span className="font-medium">{meta.part_used_full}</span></>}
          </p>
        )}
        <p className="text-sm mt-1">{unique.length} formulation{unique.length !== 1 ? "s" : ""} contain this ingredient.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : unique.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No published formulations contain this ingredient.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {unique.map(r => (
            <Link key={r.formulation_id} to={`/doctor/afi-formulary/${r.formulation_id}`}>
              <Card className="hover:border-primary transition h-full">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold">{r.afi_formulations?.name}</h3>
                    {r.afi_formulations?.formulation_type_id && (
                      <Badge variant="outline" className="text-xs">{typeNames[r.afi_formulations.formulation_type_id]}</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground flex gap-3 flex-wrap">
                    {r.quantity_ratio && <span>Quantity: {r.quantity_ratio}</span>}
                    <span>Role: {r.is_prakshepa ? "Prakṣepa (added later)" : "Main"}</span>
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
