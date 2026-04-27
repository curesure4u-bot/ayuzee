import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Period = "weekly" | "monthly" | "all";

const Leaderboard = () => {
  const [period, setPeriod] = useState<Period>("all");
  const [rows, setRows] = useState<{ user_id: string; full_name: string | null; total: number }[]>([]);

  useEffect(() => {
    document.title = "Leaderboard — Ayuzee";
  }, []);

  useEffect(() => {
    (async () => {
      if (period === "all") {
        const { data } = await (supabase as any).from("gam_user_stats")
          .select("user_id, total_points").order("total_points", { ascending: false }).limit(50);
        const ids = (data ?? []).map((r: any) => r.user_id);
        const profiles = ids.length
          ? await (supabase as any).from("profiles").select("user_id, full_name").in("user_id", ids)
          : { data: [] };
        const nameMap = new Map((profiles.data ?? []).map((p: any) => [p.user_id, p.full_name]));
        setRows((data ?? []).map((r: any) => ({ user_id: r.user_id, full_name: (nameMap.get(r.user_id) as any) ?? null, total: r.total_points })));
      } else {
        const since = new Date();
        if (period === "weekly") since.setDate(since.getDate() - 7);
        else since.setMonth(since.getMonth() - 1);
        const { data } = await (supabase as any).from("gam_points_transactions")
          .select("user_id, points").gte("created_at", since.toISOString()).limit(5000);
        const totals = new Map<string, number>();
        (data ?? []).forEach((t: any) => totals.set(t.user_id, (totals.get(t.user_id) ?? 0) + t.points));
        const sorted = [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 50);
        const ids = sorted.map(([id]) => id);
        const profiles = ids.length
          ? await (supabase as any).from("profiles").select("user_id, full_name").in("user_id", ids)
          : { data: [] };
        const nameMap = new Map((profiles.data ?? []).map((p: any) => [p.user_id, p.full_name]));
        setRows(sorted.map(([id, total]) => ({ user_id: id, full_name: (nameMap.get(id) as any) ?? null, total })));
      }
    })();
  }, [period]);

  const medal = useMemo(() => ["🥇", "🥈", "🥉"], []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Leaderboard</CardTitle>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <TabsList>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="all">All time</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Rank</TableHead>
              <TableHead>Member</TableHead>
              <TableHead className="text-right">Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="py-8 text-center text-sm text-muted-foreground">No data yet for this period.</TableCell></TableRow>
            ) : rows.map((r, i) => (
              <TableRow key={r.user_id}>
                <TableCell className="font-mono">{medal[i] ?? `#${i + 1}`}</TableCell>
                <TableCell className="font-medium">{r.full_name ?? r.user_id.slice(0, 8)}</TableCell>
                <TableCell className="text-right"><Badge variant="secondary">{r.total} pts</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
