import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Bookmark, Copy, Printer, Loader2 } from "lucide-react";

interface F {
  id: string; afi_number: string | null; afi_part: number | null; name: string; name_original: string | null;
  classical_reference: string | null; classical_text: string | null; chapter_reference: string | null;
  verse_numbers: string | null; dose: string | null;
  indications: string[] | null; indications_modern: string[] | null;
  special_notes: string | null; formulation_type_id: string | null;
}
interface Ing {
  id: string; serial_number: number | null; name: string; common_name: string | null;
  part_used: string | null; part_used_full: string | null; quantity: number | null; unit: string | null;
  is_prakshepa: boolean;
}

export default function AfiFormulaDetail() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [f, setF] = useState<F | null>(null);
  const [ings, setIngs] = useState<Ing[]>([]);
  const [related, setRelated] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { data: row } = await supabase.from("afi_formulations").select("*").eq("id", id).maybeSingle();
      setF(row as F);
      const { data: ig } = await supabase.from("afi_ingredients").select("*")
        .eq("formulation_id", id).order("serial_number");
      setIngs((ig as Ing[]) || []);

      if (row?.indications && row.indications.length > 0) {
        const { data: rel } = await supabase.from("afi_formulations")
          .select("id,name").eq("is_published", true)
          .overlaps("indications", row.indications).neq("id", id).limit(8);
        setRelated((rel as any[]) || []);
      }
      setLoading(false);
      document.title = `${row?.name || "Formula"} — AFI`;
    })();
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!f) return <div className="p-8 text-center">Formula not found</div>;

  const mainIngs = ings.filter(i => !i.is_prakshepa);
  const prak = ings.filter(i => i.is_prakshepa);

  const copyRx = () => {
    const txt = `Rx: ${f.name} (AFI Part ${f.afi_part}, ${f.afi_number}) — Dose: ${f.dose || "as advised"} — Indications: ${(f.indications_modern || f.indications || []).join(", ")}`;
    navigator.clipboard.writeText(txt);
    toast.success("Copied for prescription");
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-24 space-y-4">
      <Button variant="ghost" size="sm" onClick={() => nav(-1)}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>

      <div className="flex flex-col md:flex-row justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{f.name}</h1>
          {f.name_original && <p className="text-sm text-muted-foreground italic">{f.name_original}</p>}
        </div>
        <Badge variant="outline" className="self-start">AFI Part {f.afi_part} · {f.afi_number}</Badge>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="composition">Composition ({ings.length})</TabsTrigger>
          <TabsTrigger value="related">Related ({related.length})</TabsTrigger>
          <TabsTrigger value="order">Order / Source</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 pt-4">
          {f.classical_reference && (
            <Card><CardContent className="p-4">
              <div className="text-xs text-muted-foreground uppercase">Classical Reference</div>
              <div className="font-medium">{f.classical_reference}</div>
              {f.chapter_reference && <div className="text-sm text-muted-foreground mt-1">{f.chapter_reference} · {f.verse_numbers}</div>}
            </CardContent></Card>
          )}
          {f.dose && (
            <Card className="bg-primary/5 border-primary"><CardContent className="p-4">
              <div className="text-xs text-muted-foreground uppercase">Dose</div>
              <div className="text-xl font-bold">{f.dose}</div>
            </CardContent></Card>
          )}
          <Card><CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase mb-2">Indications</div>
            <div className="grid md:grid-cols-2 gap-2 text-sm">
              {(f.indications || []).map((s, i) => (
                <div key={i} className="flex justify-between border-b py-1">
                  <span className="italic">{s}</span>
                  <span className="text-muted-foreground">{f.indications_modern?.[i] || ""}</span>
                </div>
              ))}
            </div>
          </CardContent></Card>
          {f.special_notes && (
            <Card><CardContent className="p-4">
              <div className="text-xs text-muted-foreground uppercase mb-1">Special Notes</div>
              <p className="text-sm">{f.special_notes}</p>
            </CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="composition" className="pt-4">
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Ingredient</TableHead>
                <TableHead>Common Name</TableHead>
                <TableHead>Plant Part</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {mainIngs.map(i => (
                  <TableRow key={i.id}>
                    <TableCell>{i.serial_number}</TableCell>
                    <TableCell className="font-medium">{i.name}</TableCell>
                    <TableCell>{i.common_name || "—"}</TableCell>
                    <TableCell>{i.part_used_full || i.part_used || "—"}</TableCell>
                    <TableCell className="text-right">{i.quantity ?? "—"} {i.unit || ""}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
          {prak.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">PrakShepa Dravyas (added later)</h3>
              <Card><CardContent className="p-0">
                <Table><TableBody>
                  {prak.map(i => (
                    <TableRow key={i.id}>
                      <TableCell>{i.serial_number}</TableCell>
                      <TableCell>{i.name}</TableCell>
                      <TableCell>{i.part_used || "—"}</TableCell>
                      <TableCell className="text-right">{i.quantity ?? "—"} {i.unit || ""}</TableCell>
                    </TableRow>
                  ))}
                </TableBody></Table>
              </CardContent></Card>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-3">
            All quantities shown are for batch preparation per the classical formula.
          </p>
        </TabsContent>

        <TabsContent value="related" className="pt-4">
          {related.length === 0 ? (
            <p className="text-muted-foreground text-sm">No related formulations indexed yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-2">
              {related.map(r => (
                <Link key={r.id} to={`/doctor/afi-formulary/${r.id}`}>
                  <Card className="hover:border-primary transition"><CardContent className="p-3 font-medium">{r.name}</CardContent></Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="order" className="pt-4 space-y-3">
          <Card><CardContent className="p-4 space-y-3">
            <p className="text-sm">This is a classical formula. Search Ayuzee Pharma Exchange for manufacturers who stock it.</p>
            <Input placeholder="Search manufacturer (coming soon)…" disabled />
            <p className="text-xs text-muted-foreground">Multi-manufacturer price comparison launching soon.</p>
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* Floating action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-3 flex justify-center gap-2 z-30">
        <Button variant="outline" size="sm"><Bookmark className="h-4 w-4 mr-1" />Bookmark</Button>
        <Button variant="outline" size="sm" onClick={copyRx}><Copy className="h-4 w-4 mr-1" />Copy Rx</Button>
        <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1" />Print</Button>
      </div>
    </div>
  );
}
