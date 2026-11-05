import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

type Item = {
  meal_type: string; day_number: number;
  quantity: number | null; unit: string | null; notes: string | null;
  food: { name: string; name_local: string | null } | null;
};
type Chart = {
  id: string; title: string; prakriti: string | null; status: string;
  created_at: string; vaidya_id: string;
};

const MEAL_ORDER = ["breakfast", "lunch", "snack", "dinner"];

export default function PatientDietChart() {
  const { id } = useParams<{ id: string }>();
  const [chart, setChart] = useState<Chart | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [vaidyaName, setVaidyaName] = useState("");
  const [patientName, setPatientName] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const { data: c } = await supabase.from("diet_charts").select("*").eq("id", id).maybeSingle();
      if (!c) { setLoading(false); return; }
      setChart(c as any);

      const { data: rows } = await supabase
        .from("diet_chart_items")
        .select("meal_type, day_number, quantity, unit, notes, food:food_items(name, name_local)")
        .eq("diet_chart_id", id)
        .order("day_number");
      setItems((rows as any) ?? []);

      const { data: vaidyaProf } = await supabase.from("profiles").select("full_name").eq("id", c.vaidya_id).maybeSingle();
      setVaidyaName(vaidyaProf?.full_name ?? "");

      const { data: userRes } = await supabase.auth.getUser();
      if (userRes.user) {
        const { data: p } = await supabase.from("profiles").select("full_name").eq("id", userRes.user.id).maybeSingle();
        setPatientName(p?.full_name ?? "");
      }
      setLoading(false);
    })();
  }, [id]);

  const days = useMemo(() => {
    const s = new Set<number>();
    items.forEach((it) => s.add(it.day_number));
    return Array.from(s).sort((a, b) => a - b);
  }, [items]);

  const download = async () => {
    if (!chart) return;
    setDownloading(true);
    try {
      const doc = new jsPDF();
      days.forEach((day, i) => {
        if (i > 0) doc.addPage();
        doc.setFontSize(18);
        doc.text("Ayuzee — Diet Chart", 14, 18);
        doc.setFontSize(11);
        doc.text(`${chart.title}`, 14, 26);
        doc.text(`Patient: ${patientName || "—"}`, 14, 33);
        doc.text(`Vaidya: ${vaidyaName || "—"}    Prakriti: ${chart.prakriti ?? "—"}`, 14, 39);
        doc.setDrawColor(150);
        doc.line(14, 42, 196, 42);
        doc.setFontSize(14);
        doc.text(`Day ${day}`, 14, 52);
        let y = 60;
        MEAL_ORDER.forEach((meal) => {
          const mealItems = items.filter((it) => it.day_number === day && it.meal_type === meal);
          if (!mealItems.length) return;
          doc.setFontSize(12);
          doc.setFont(undefined, "bold");
          doc.text(meal.charAt(0).toUpperCase() + meal.slice(1), 14, y);
          doc.setFont(undefined, "normal");
          y += 6;
          mealItems.forEach((it) => {
            const name = it.food?.name ?? "—";
            const qty = it.quantity ? `${it.quantity} ${it.unit ?? ""}` : "";
            const line = `• ${name}${qty ? "  —  " + qty : ""}`;
            doc.setFontSize(11);
            doc.text(line, 18, y);
            y += 5;
            if (it.notes) {
              doc.setFontSize(9);
              doc.setTextColor(100);
              doc.text(`   ${it.notes}`, 18, y);
              doc.setTextColor(0);
              y += 5;
            }
            if (y > 275) { doc.addPage(); y = 20; }
          });
          y += 3;
        });
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text(`Generated ${new Date().toLocaleDateString()} · ayuzee.com`, 14, 290);
        doc.setTextColor(0);
      });
      doc.save(`diet-chart-${chart.title.replace(/\s+/g, "-")}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="p-6 text-muted-foreground">Loading…</div>;
  if (!chart) return <div className="p-6">Diet chart not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">{chart.title}</h1>
          <div className="text-sm text-muted-foreground mt-1">
            {vaidyaName && <>By {vaidyaName} · </>}Started {new Date(chart.created_at).toLocaleDateString()}
          </div>
          {chart.prakriti && <Badge variant="outline" className="mt-2">{chart.prakriti}</Badge>}
        </div>
        <Button onClick={download} disabled={downloading}>
          {downloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
          Download PDF
        </Button>
      </div>

      {chart.status === "draft" && (
        <div className="rounded-md bg-yellow-50 dark:bg-yellow-950/30 p-3 text-sm text-yellow-800 dark:text-yellow-200">
          This diet chart is still in draft — your Vaidya hasn't activated it yet.
        </div>
      )}

      {days.map((day) => (
        <Card key={day}>
          <CardHeader><CardTitle>Day {day}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {MEAL_ORDER.map((meal) => {
              const list = items.filter((it) => it.day_number === day && it.meal_type === meal);
              if (!list.length) return null;
              return (
                <div key={meal}>
                  <div className="text-sm font-semibold capitalize mb-2">{meal}</div>
                  <ul className="space-y-2">
                    {list.map((it, idx) => (
                      <li key={idx} className="flex justify-between gap-3 items-start border-b pb-2 last:border-b-0">
                        <div>
                          <div className="font-medium">{it.food?.name ?? "—"}</div>
                          {it.notes && <div className="text-xs text-muted-foreground mt-0.5">{it.notes}</div>}
                        </div>
                        <div className="text-sm text-muted-foreground whitespace-nowrap">
                          {it.quantity ? `${it.quantity} ${it.unit ?? ""}` : ""}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
