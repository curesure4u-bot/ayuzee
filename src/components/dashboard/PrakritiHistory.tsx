import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Plus } from "lucide-react";

interface Row {
  id: string;
  mode: string;
  dominant_dosha: string | null;
  vata_score: number;
  pitta_score: number;
  kapha_score: number;
  created_at: string;
}

export const PrakritiHistory = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("prakriti_assessments")
      .select("id, mode, dominant_dosha, vata_score, pitta_score, kapha_score, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setRows((data as Row[]) || []);
        setLoading(false);
      });
  }, []);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> My Prakriti Assessments
          </h2>
          <p className="text-sm text-muted-foreground">Your Ayurveda constitution history</p>
        </div>
        <Button asChild size="sm" variant="hero">
          <Link to="/diagnosis/prakriti/run?mode=self"><Plus className="mr-1 h-4 w-4" /> New</Link>
        </Button>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No assessments yet. Take your first one.</p>
      ) : (
        <div className="mt-5 space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium capitalize">{r.dominant_dosha?.replace("-", " – ") || "—"}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString()} · V {r.vata_score} / P {r.pitta_score} / K {r.kapha_score}
                </p>
              </div>
              <Badge variant="outline" className="capitalize">{r.mode}</Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
