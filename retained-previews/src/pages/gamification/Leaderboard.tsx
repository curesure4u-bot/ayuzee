import { usePageSEO } from "@/hooks/usePageSEO";
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

  usePageSEO({ title: "Leaderboard — Ayuzee", noIndex: true });

  useEffect(() => {
    (async () => {
      if (period === "all") {
        const { data } = await (supabase as any).rpc("gam_get_leaderboard", { _limit: 50 });
        setRows((data ?? []).map((r: any, i: number) => ({
          user_id: `rank-${r.rank ?? i + 1}`,
          full_name: r.display_name ?? null,
          total: r.total_points,
        })));
      } else {
        // Weekly/monthly leaderboard is disabled for privacy (no per-user breakdown).
        setRows([]);
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
