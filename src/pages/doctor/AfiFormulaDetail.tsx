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
import { ArrowLeft, Bookmark, Copy, Printer, Loader2, ExternalLink, ShieldCheck } from "lucide-react";

interface F {
  id: string; afi_number: string | null; afi_part: number | null; name: string; name_original: string | null;
  classical_reference: string | null; classical_text: string | null; chapter_reference: string | null;
  verse_numbers: string | null; dose: string | null;
  indications: string[] | null; indications_modern: string[] | null;
  special_notes: string | null; formulation_type_id: string | null;
  // API Part II enrichments
  api_volume: string | null; api_afi_crossref: string | null;
  description_colour: string | null; description_texture: string | null;
  description_odour: string | null; description_taste: string | null;
  anupana: string | null; storage_conditions: string | null;
  ph_min: number | null; ph_max: number | null; ph_solution_concentration: string | null;
  loss_on_drying_max: number | null; total_ash_max: number | null;
  acid_insoluble_ash_max: number | null;
  alcohol_extractive_min: number | null; water_extractive_min: number | null;
  has_physicochemical_standards: boolean | null;
  data_source: string | null;
}
interface Ing {
  id: string; serial_number: number | null; name: string; common_name: string | null;
  part_used: string | null; part_used_full: string | null; quantity: number | null; unit: string | null;
  is_prakshepa: boolean;
}
interface Bot {
  id: string; ingredient_serial: number | null; sanskrit_name: string | null;
  botanical_name: string | null; common_name: string | null; part_used: string | null;
  part_used_full: string | null; quantity_ratio: string | null; is_prakshepa: boolean;
}

function slugifyBotanical(name: string) {
  return encodeURIComponent(name.trim());
}

export default function AfiFormulaDetail() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [f, setF] = useState<F | null>(null);
  const [ings, setIngs] = useState<Ing[]>([]);
  const [bots, setBots] = useState<Bot[]>([]);
  const [related, setRelated] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { data: row } = await supabase.from("afi_formulations").select("*").eq("id", id).maybeSingle();
      setF(row as F);

      const [{ data: ig }, { data: bn }] = await Promise.all([
        supabase.from("afi_ingredients").select("*").eq("formulation_id", id).order("serial_number"),
        supabase.from("api_botanical_names").select("*").eq("formulation_id", id).order("ingredient_serial"),
      ]);
      setIngs((ig as Ing[]) || []);
      setBots((bn as Bot[]) || []);

      if (row?.indications && row.indications.length > 0) {
        const { data: rel } = await supabase.from("afi_formulations")
          .select("id,name").eq("is_published", true)
          .overlaps("indications", row.indications).neq("id", id).limit(8);
        setRelated((rel as { id: string; name: string }[]) || []);
      }
      setLoading(false);
      document.title = `${row?.name || "Formula"} — Classical Formulary`;
    })();
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!f) return <div className="p-8 text-center">Formula not found</div>;

  const mainIngs = ings.filter(i => !i.is_prakshepa);
  const prak = ings.filter(i => i.is_prakshepa);
  const hasApi = !!(f.api_volume || bots.length > 0 || f.has_physicochemical_standards);
  const hasDescription = !!(f.description_colour || f.description_texture || f.description_odour || f.description_taste);

  // Merge botanical names into ingredient rows by serial number for the composition table
  const botBySerial = new Map<number, Bot>();
  bots.forEach(b => { if (b.ingredient_serial != null) botBySerial.set(b.ingredient_serial, b); });

  const copyRx = () => {
    const txt = `Rx: ${f.name}${f.afi_number ? ` (AFI Part ${f.afi_part}, ${f.afi_number})` : ""} — Dose: ${f.dose || "as advised"}${f.anupana ? ` with ${f.anupana}` : ""} — Indications: ${(f.indications_modern || f.indications || []).join(", ")}`;
    navigator.clipboard.writeText(txt);
    toast.success("Copied for prescription");
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-24 space-y-4">
      <Button variant="ghost" size="sm" onClick={() => nav(-1)}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>

      <div className="flex flex-col md:flex-row justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-3xl font-bold">{f.name}</h1>
            {hasApi && (
              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">
                <ShieldCheck className="h-3 w-3 mr-1" /> API Verified
              </Badge>
            )}
          </div>
          {f.name_original && <p className="text-sm text-muted-foreground italic">{f.name_original}</p>}
        </div>
        <div className="flex flex-col items-start md:items-end gap-1">
          {f.afi_part && <Badge variant="outline">AFI Part {f.afi_part} · {f.afi_number}</Badge>}
          {f.api_volume && <Badge variant="outline">{f.api_volume}</Badge>}
          {f.api_afi_crossref && <span className="text-xs text-muted-foreground">{f.api_afi_crossref}</span>}
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="composition">Composition ({ings.length || bots.length})</TabsTrigger>
          {f.has_physicochemical_standards && (
            <TabsTrigger value="standards">Quality Standards</TabsTrigger>
          )}
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

          {(f.dose || f.anupana || f.storage_conditions) && (
            <Card className="bg-primary/5 border-primary"><CardContent className="p-4 space-y-2">
              {f.dose && (
                <div>
                  <div className="text-xs text-muted-foreground uppercase">Dose</div>
                  <div className="text-xl font-bold">{f.dose}</div>
                </div>
              )}
              {f.anupana && (
                <div>
                  <div className="text-xs text-muted-foreground uppercase">Anupāna (vehicle)</div>
                  <div className="text-base font-medium">{f.anupana}</div>
                </div>
              )}
              {f.storage_conditions && (
                <div>
                  <div className="text-xs text-muted-foreground uppercase">Storage</div>
                  <div className="text-sm">{f.storage_conditions}</div>
                </div>
              )}
            </CardContent></Card>
          )}

          {hasDescription && (
            <Card><CardContent className="p-4">
              <div className="text-xs text-muted-foreground uppercase mb-2 flex items-center gap-1">
                🔍 How to identify this medicine
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 text-sm">
                {f.description_colour && <div><span className="text-muted-foreground">Colour: </span>{f.description_colour}</div>}
                {f.description_texture && <div><span className="text-muted-foreground">Form: </span>{f.description_texture}</div>}
                {f.description_odour && <div><span className="text-muted-foreground">Odour: </span>{f.description_odour}</div>}
                {f.description_taste && <div><span className="text-muted-foreground">Taste: </span>{f.description_taste}</div>}
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                Source: Ayurvedic Pharmacopoeia of India, Part II
              </p>
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

        <TabsContent value="composition" className="pt-4 space-y-4">
          {/* Prefer AFI ingredients (with quantities); fall back to API botanicals if AFI is empty */}
          {mainIngs.length > 0 ? (
            <Card><CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Sanskrit Name</TableHead>
                  <TableHead>Common Name</TableHead>
                  <TableHead>Botanical Name</TableHead>
                  <TableHead>Plant Part</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {mainIngs.map(i => {
                    const bot = i.serial_number != null ? botBySerial.get(i.serial_number) : undefined;
                    const botanical = bot?.botanical_name;
                    return (
                      <TableRow key={i.id}>
                        <TableCell>{i.serial_number}</TableCell>
                        <TableCell className="font-medium">{i.name}</TableCell>
                        <TableCell>{i.common_name || bot?.common_name || "—"}</TableCell>
                        <TableCell className="italic text-muted-foreground">
                          {botanical ? (
                            <Link to={`/doctor/afi-formulary/ingredient/${slugifyBotanical(botanical)}`}
                              className="inline-flex items-center gap-1 hover:text-primary">
                              {botanical}
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          ) : "—"}
                        </TableCell>
                        <TableCell>{i.part_used_full || i.part_used || bot?.part_used_full || "—"}</TableCell>
                        <TableCell className="text-right">{i.quantity ?? "—"} {i.unit || ""}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent></Card>
          ) : bots.length > 0 ? (
            <Card><CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Sanskrit Name</TableHead>
                  <TableHead>Botanical Name</TableHead>
                  <TableHead>Plant Part</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {bots.filter(b => !b.is_prakshepa).map(b => (
                    <TableRow key={b.id}>
                      <TableCell>{b.ingredient_serial}</TableCell>
                      <TableCell className="font-medium">{b.sanskrit_name || "—"}</TableCell>
                      <TableCell className="italic text-muted-foreground">
                        {b.botanical_name ? (
                          <Link to={`/doctor/afi-formulary/ingredient/${slugifyBotanical(b.botanical_name)}`}
                            className="inline-flex items-center gap-1 hover:text-primary">
                            {b.botanical_name}<ExternalLink className="h-3 w-3" />
                          </Link>
                        ) : "—"}
                      </TableCell>
                      <TableCell>{b.part_used_full || b.part_used || "—"}</TableCell>
                      <TableCell className="text-right">{b.quantity_ratio || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent></Card>
          ) : (
            <p className="text-muted-foreground text-sm">No ingredients indexed yet.</p>
          )}

          {prak.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Prakṣepa Dravyas (added later)</h3>
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

          <p className="text-xs text-muted-foreground">
            All quantities shown are for batch preparation per the classical formula.
            {bots.length > 0 && " Botanical names sourced from the Ayurvedic Pharmacopoeia of India (API)."}
          </p>
        </TabsContent>

        {f.has_physicochemical_standards && (
          <TabsContent value="standards" className="pt-4 space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Pharmacopoeial Standards</h2>
              <p className="text-sm text-muted-foreground">
                Ayurvedic Pharmacopoeia of India — Official Quality Parameters
              </p>
            </div>
            <Card><CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Parameter</TableHead>
                  <TableHead className="text-right">Limit</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {f.loss_on_drying_max != null && (
                    <TableRow><TableCell>Loss on Drying</TableCell>
                      <TableCell className="text-right">≤ {f.loss_on_drying_max}%</TableCell></TableRow>
                  )}
                  {f.total_ash_max != null && (
                    <TableRow><TableCell>Total Ash</TableCell>
                      <TableCell className="text-right">≤ {f.total_ash_max}%</TableCell></TableRow>
                  )}
                  {f.acid_insoluble_ash_max != null && (
                    <TableRow><TableCell>Acid-Insoluble Ash</TableCell>
                      <TableCell className="text-right">≤ {f.acid_insoluble_ash_max}%</TableCell></TableRow>
                  )}
                  {f.alcohol_extractive_min != null && (
                    <TableRow><TableCell>Alcohol-Soluble Extractive</TableCell>
                      <TableCell className="text-right">≥ {f.alcohol_extractive_min}%</TableCell></TableRow>
                  )}
                  {f.water_extractive_min != null && (
                    <TableRow><TableCell>Water-Soluble Extractive</TableCell>
                      <TableCell className="text-right">≥ {f.water_extractive_min}%</TableCell></TableRow>
                  )}
                  {(f.ph_min != null || f.ph_max != null) && (
                    <TableRow>
                      <TableCell>pH{f.ph_solution_concentration ? ` (${f.ph_solution_concentration} solution)` : ""}</TableCell>
                      <TableCell className="text-right">
                        {f.ph_min ?? "?"} to {f.ph_max ?? "?"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent></Card>
            <Card className="bg-muted/40"><CardContent className="p-4 text-xs text-muted-foreground">
              These standards are from the official Ayurvedic Pharmacopoeia of India, Part II.
              They are regulatory quality benchmarks for manufacturers, not clinical guidance for doctors.
              Source: Ministry of AYUSH, Govt. of India.
            </CardContent></Card>
          </TabsContent>
        )}

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
