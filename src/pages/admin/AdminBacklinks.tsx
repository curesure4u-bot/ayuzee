import { useCallback, useEffect, useMemo, useState } from "react";
import { Link as LinkIcon, RefreshCw, TrendingDown, TrendingUp, ExternalLink, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

type Snapshot = {
  snapshot_date: string;
  total_backlinks: number;
  referring_domains: number;
  follow_count: number;
  nofollow_count: number;
  new_count: number;
  lost_count: number;
  authority_score: number | null;
};

type Backlink = {
  id: string;
  source_url: string;
  source_domain: string | null;
  source_title: string | null;
  anchor: string | null;
  page_ascore: number | null;
  is_nofollow: boolean;
  first_seen_at: string | null;
  last_seen_at: string | null;
  status: string;
  lost_at: string | null;
  first_detected_at: string;
};

const fmtDate = (d: string | null) => (d ? new Date(d).toLocaleDateString() : "—");

export default function AdminBacklinks() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [newLinks, setNewLinks] = useState<Backlink[]>([]);
  const [lostLinks, setLostLinks] = useState<Backlink[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [snapRes, newRes, lostRes, countRes] = await Promise.all([
      supabase.from("seo_backlink_snapshots").select("*").order("snapshot_date", { ascending: true }).limit(90),
      supabase.from("seo_backlinks").select("*").eq("status", "active").order("first_detected_at", { ascending: false }).limit(50),
      supabase.from("seo_backlinks").select("*").eq("status", "lost").order("lost_at", { ascending: false }).limit(50),
      supabase.from("seo_backlinks").select("id", { count: "exact", head: true }).eq("status", "active"),
    ]);
    setSnapshots((snapRes.data as Snapshot[]) ?? []);
    setNewLinks((newRes.data as Backlink[]) ?? []);
    setLostLinks((lostRes.data as Backlink[]) ?? []);
    setActiveCount(countRes.count ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke("backlink-refresh", { body: {} });
      if (error) throw error;
      const d = data as { new?: number; lost?: number; total?: number; error?: string };
      if (d?.error) throw new Error(d.error);
      toast.success(`Refreshed — ${d?.new ?? 0} new, ${d?.lost ?? 0} lost, ${d?.total ?? 0} total`);
      await load();
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e);
      toast.error(`Refresh failed: ${m}`);
    } finally {
      setRefreshing(false);
    }
  };

  const latest = snapshots[snapshots.length - 1];
  const previous = snapshots[snapshots.length - 2];
  const totalDelta = latest && previous ? latest.total_backlinks - previous.total_backlinks : 0;

  const chartData = useMemo(() => snapshots.map((s) => ({
    date: new Date(s.snapshot_date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    Total: s.total_backlinks,
    "Ref. domains": s.referring_domains,
    New: s.new_count,
    Lost: s.lost_count,
  })), [snapshots]);

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Backlink Monitor</h1>
          <p className="text-sm text-muted-foreground">Tracking inbound links to <span className="font-medium">ayuzee.com</span> — powered by Semrush.</p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Pulling from Semrush…" : "Refresh now"}
        </Button>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total backlinks" icon={<LinkIcon className="h-4 w-4" />} value={latest?.total_backlinks ?? activeCount} delta={totalDelta} />
        <StatCard title="Referring domains" icon={<Globe className="h-4 w-4" />} value={latest?.referring_domains ?? 0} />
        <StatCard title="New (today)" icon={<TrendingUp className="h-4 w-4 text-emerald-600" />} value={latest?.new_count ?? 0} />
        <StatCard title="Lost (today)" icon={<TrendingDown className="h-4 w-4 text-rose-600" />} value={latest?.lost_count ?? 0} />
      </section>

      <Card>
        <CardHeader><CardTitle>Backlinks over time</CardTitle></CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No snapshots yet. Click <strong>Refresh now</strong> to take the first one.
            </p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Total" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Ref. domains" stroke="#6366f1" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="New" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Lost" stroke="#ef4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="new">
        <TabsList>
          <TabsTrigger value="new">New backlinks ({newLinks.length})</TabsTrigger>
          <TabsTrigger value="lost">Lost backlinks ({lostLinks.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="new">
          <BacklinkTable rows={newLinks} loading={loading} dateColumn="first_detected_at" dateLabel="First seen" emptyText="No backlinks yet. Refresh to pull the latest from Semrush." />
        </TabsContent>
        <TabsContent value="lost">
          <BacklinkTable rows={lostLinks} loading={loading} dateColumn="lost_at" dateLabel="Lost on" emptyText="No lost backlinks recorded yet." />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ title, value, icon, delta }: { title: string; value: number; icon: React.ReactNode; delta?: number }) {
  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
        <span className="text-muted-foreground">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold">{value.toLocaleString()}</div>
        {delta !== undefined && delta !== 0 && (
          <p className={`mt-1 text-xs ${delta > 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {delta > 0 ? "+" : ""}{delta} vs last snapshot
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function BacklinkTable({ rows, loading, dateColumn, dateLabel, emptyText }: { rows: Backlink[]; loading: boolean; dateColumn: "first_detected_at" | "lost_at"; dateLabel: string; emptyText: string }) {
  if (loading) return <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>;
  if (rows.length === 0) return <p className="py-10 text-center text-sm text-muted-foreground">{emptyText}</p>;
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead>Anchor</TableHead>
              <TableHead>Authority</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>{dateLabel}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="max-w-md">
                  <a href={r.source_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                    <span className="truncate">{r.source_domain ?? r.source_url}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                  {r.source_title && <p className="truncate text-xs text-muted-foreground">{r.source_title}</p>}
                </TableCell>
                <TableCell className="max-w-xs truncate text-sm">{r.anchor ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={(r.page_ascore ?? 0) >= 30 ? "default" : "secondary"}>
                    {r.page_ascore ?? 0}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={r.is_nofollow ? "outline" : "default"}>{r.is_nofollow ? "nofollow" : "follow"}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{fmtDate(r[dateColumn])}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
