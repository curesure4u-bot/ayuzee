import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface Counter { name: string; count: number }
interface PriceRow { name: string; manufacturers: { manufacturer: string; mrp: number }[] }

export default function AdminFormularyAnalytics() {
  const [loading, setLoading] = useState(true);
  const [topPrescribed, setTopPrescribed] = useState<Counter[]>([]);
  const [topBookmarked, setTopBookmarked] = useState<Counter[]>([]);
  const [gaps, setGaps] = useState<string[]>([]);
  const [prices, setPrices] = useState<PriceRow[]>([]);

  useEffect(() => {
    document.title = "Formulary Analytics — Admin";
    (async () => {
      // Prescribed counts: aggregate from items jsonb
      const { data: rxs } = await supabase
        .from("formulary_prescriptions")
        .select("items")
        .limit(1000);
      const pmap = new Map<string, number>();
      (rxs || []).forEach((r) => {
        ((r.items as unknown as { name: string }[]) || []).forEach((it) => {
          if (!it?.name) return;
          pmap.set(it.name, (pmap.get(it.name) || 0) + 1);
        });
      });
      setTopPrescribed([...pmap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, count]) => ({ name, count })));

      // Bookmarks
      const { data: bms } = await supabase.from("formulary_bookmarks").select("formula_id");
      const bmap = new Map<string, number>();
      (bms || []).forEach((b: { formula_id: string }) => bmap.set(b.formula_id, (bmap.get(b.formula_id) || 0) + 1));
      setTopBookmarked([...bmap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, count]) => ({ name, count })));

      // Gaps & prices from classical_formulas + manufacturer_products
      const { data: formulas } = await supabase.from("classical_formulas").select("id, name");
      const { data: mps } = await supabase.from("manufacturer_products").select("formula_id, brand_name, pack_sizes, is_available, manufacturer_id");
      const mpByFormula = new Map<string, { manufacturer: string; mrp: number }[]>();
      ((mps as Array<{ formula_id: string | null; brand_name: string | null; pack_sizes: unknown; is_available: boolean; manufacturer_id: string | null }> | null) || []).forEach((m) => {
        if (!m.is_available || !m.formula_id) return;
        const packs = Array.isArray(m.pack_sizes) ? (m.pack_sizes as Array<{ mrp?: number; price?: number }>) : [];
        const mrp = Number(packs[0]?.mrp ?? packs[0]?.price ?? 0);
        const arr = mpByFormula.get(m.formula_id) || [];
        arr.push({ manufacturer: m.brand_name || "Manufacturer", mrp });
        mpByFormula.set(m.formula_id, arr);
      });
      setGaps(((formulas as Array<{ id: string; name: string }> | null) || []).filter((f) => !mpByFormula.get(f.id)?.length).map((f) => f.name));
      const priceRows: PriceRow[] = ((formulas as Array<{ id: string; name: string }> | null) || []).slice(0, 20)
        .map((f: { id: string; name: string }) => ({ name: f.name, manufacturers: mpByFormula.get(f.id) || [] }))
        .filter((r) => r.manufacturers.length > 0);
      setPrices(priceRows);

      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Formulary Analytics</h1>
        <p className="text-sm text-muted-foreground">Doctor prescription and formulary usage insights.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card><CardContent className="p-4">
          <h2 className="font-semibold mb-3">Top 10 Most Prescribed</h2>
          {topPrescribed.length === 0 ? <p className="text-sm text-muted-foreground">No prescription data yet.</p> :
            <Table><TableBody>{topPrescribed.map((r) => (
              <TableRow key={r.name}><TableCell className="font-medium">{r.name}</TableCell><TableCell className="text-right"><Badge>{r.count}</Badge></TableCell></TableRow>
            ))}</TableBody></Table>}
        </CardContent></Card>

        <Card><CardContent className="p-4">
          <h2 className="font-semibold mb-3">Top 10 Most Bookmarked</h2>
          {topBookmarked.length === 0 ? <p className="text-sm text-muted-foreground">No bookmark data yet.</p> :
            <Table><TableBody>{topBookmarked.map((r) => (
              <TableRow key={r.name}><TableCell className="font-medium font-mono text-xs">{r.name}</TableCell><TableCell className="text-right"><Badge variant="secondary">{r.count}</Badge></TableCell></TableRow>
            ))}</TableBody></Table>}
        </CardContent></Card>
      </div>

      <Card><CardContent className="p-4">
        <h2 className="font-semibold mb-3">Pharma Exchange Gaps ({gaps.length})</h2>
        <p className="text-xs text-muted-foreground mb-3">Formulas with no available manufacturer listing.</p>
        <div className="flex flex-wrap gap-1.5">
          {gaps.length === 0 ? <span className="text-sm text-muted-foreground">All formulas covered.</span> :
            gaps.map((g) => <Badge key={g} variant="outline" className="border-orange-300 text-orange-700">{g}</Badge>)}
        </div>
      </CardContent></Card>

      <Card><CardContent className="p-4">
        <h2 className="font-semibold mb-3">Price Comparison — Top 20 Formulas</h2>
        {prices.length === 0 ? <p className="text-sm text-muted-foreground">No manufacturer pricing yet.</p> : (
          <Table>
            <TableHeader><TableRow><TableHead>Formula</TableHead><TableHead>Manufacturers</TableHead><TableHead className="text-right">Lowest</TableHead><TableHead className="text-right">Highest</TableHead><TableHead className="text-right">Spread</TableHead></TableRow></TableHeader>
            <TableBody>{prices.map((p) => {
              const mrps = p.manufacturers.map((m) => m.mrp);
              const lo = Math.min(...mrps), hi = Math.max(...mrps);
              return (
                <TableRow key={p.name}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-xs">{p.manufacturers.map((m) => `${m.manufacturer} ₹${m.mrp}`).join(" · ")}</TableCell>
                  <TableCell className="text-right text-green-700 font-semibold">₹{lo}</TableCell>
                  <TableCell className="text-right">₹{hi}</TableCell>
                  <TableCell className="text-right">{hi - lo > 0 ? `${Math.round(((hi - lo) / lo) * 100)}%` : "—"}</TableCell>
                </TableRow>
              );
            })}</TableBody>
          </Table>
        )}
      </CardContent></Card>
    </div>
  );
}
