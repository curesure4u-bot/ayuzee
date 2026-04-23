import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, IndianRupee, Wallet } from "lucide-react";
import type { TherapistContext } from "./TherapistLayout";

interface Row {
  id: string;
  patient_name: string;
  therapy_name: string;
  therapy_code: string;
  scheduled_date: string;
  therapist_earnings: number;
  total_amount: number;
}

const weekKey = (d: Date) => {
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week.toString().padStart(2, "0")}`;
};
const monthKey = (d: Date) => `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;

const TherapistEarnings = () => {
  const { therapist } = useOutletContext<TherapistContext>();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Earnings | Therapist | Ayuzee";
    (async () => {
      const { data } = await supabase.from("therapy_sessions")
        .select("id, patient_name, therapy_name, therapy_code, scheduled_date, therapist_earnings, total_amount")
        .eq("therapist_id", therapist.id).eq("status", "completed")
        .order("scheduled_date", { ascending: false });
      setRows((data ?? []) as Row[]);
      setLoading(false);
    })();
  }, [therapist.id]);

  const { byWeek, byMonth, total } = useMemo(() => {
    const w: Record<string, number> = {};
    const m: Record<string, number> = {};
    let t = 0;
    rows.forEach(r => {
      const d = new Date(r.scheduled_date);
      const amt = Number(r.therapist_earnings || 0);
      w[weekKey(d)] = (w[weekKey(d)] || 0) + amt;
      m[monthKey(d)] = (m[monthKey(d)] || 0) + amt;
      t += amt;
    });
    return { byWeek: w, byMonth: m, total: t };
  }, [rows]);

  if (loading) return <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Earnings</h1>
          <p className="text-sm text-muted-foreground">Track your completed sessions and payouts.</p>
        </div>
        <Button asChild><Link to="/therapist/profile"><Wallet className="h-4 w-4 mr-2" />Request payout</Link></Button>
      </div>

      <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Total lifetime earnings</div>
            <div className="text-3xl font-bold mt-1 flex items-center"><IndianRupee className="h-6 w-6" />{total.toLocaleString("en-IN")}</div>
          </div>
          <Wallet className="h-12 w-12 text-primary/40" />
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <BreakdownCard title="By month" data={byMonth} />
        <BreakdownCard title="By week" data={byWeek} />
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="font-semibold mb-4">Completed sessions</h2>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No completed sessions yet.</p>
          ) : (
            <div className="space-y-2">
              {rows.map(r => (
                <div key={r.id} className="flex items-center justify-between gap-3 p-3 border rounded-lg">
                  <div className="min-w-0">
                    <div className="font-medium truncate text-sm">{r.therapy_name}</div>
                    <div className="text-xs text-muted-foreground">{r.scheduled_date} · {r.patient_name}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-semibold">₹{Number(r.therapist_earnings).toLocaleString("en-IN")}</div>
                    <Badge variant="outline" className="text-[10px]">{r.therapy_code}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const BreakdownCard = ({ title, data }: { title: string; data: Record<string, number> }) => {
  const entries = Object.entries(data).sort(([a], [b]) => b.localeCompare(a)).slice(0, 6);
  const max = Math.max(1, ...Object.values(data));
  return (
    <Card><CardContent className="p-5">
      <h3 className="font-semibold mb-3">{title}</h3>
      {entries.length === 0 ? <p className="text-sm text-muted-foreground">No data.</p> : (
        <div className="space-y-2">
          {entries.map(([k, v]) => (
            <div key={k}>
              <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">{k}</span><span className="font-medium">₹{v.toLocaleString("en-IN")}</span></div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${(v / max) * 100}%` }} /></div>
            </div>
          ))}
        </div>
      )}
    </CardContent></Card>
  );
};

export default TherapistEarnings;
