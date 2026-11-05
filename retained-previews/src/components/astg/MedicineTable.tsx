import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, Link2, ShoppingCart, Baby, Pill, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Medicine } from "@/data/astg";
import { adjustPediatric, medicineKey } from "@/lib/astg-pediatric";
import { findEDLMatches, type EDLMatch } from "@/lib/astg-edl";
import PrescribeOrderDialog from "./PrescribeOrderDialog";

type Props = {
  categoryKey: string;
  diseaseKey: string;
  level: number;
  medicines: Medicine[];
};

type LinkRow = { medicine_key: string; product_id: string | null; supplier_sku: string | null };
type Product = { id: string; name: string; price: number | null; stock: number | null };

export default function MedicineTable({ categoryKey, diseaseKey, level, medicines }: Props) {
  const [links, setLinks] = useState<Record<string, LinkRow>>({});
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [pediatric, setPediatric] = useState(false);
  const [weight, setWeight] = useState<number | "">("");
  const [age, setAge] = useState<number | "">("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [edl, setEdl] = useState<Record<string, EDLMatch[]>>({});
  const [edlOpen, setEdlOpen] = useState<EDLMatch[] | null>(null);
  const [orderFor, setOrderFor] = useState<Medicine | null>(null);
  const [linkOpen, setLinkOpen] = useState<{ med: Medicine; key: string } | null>(null);

  const keys = useMemo(
    () => medicines.map((m) => medicineKey(categoryKey, diseaseKey, level, m.name)),
    [medicines, categoryKey, diseaseKey, level],
  );

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getUser();
      if (sess.user) {
        const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", sess.user.id);
        setIsAdmin((roles ?? []).some((r: any) => r.role === "admin" || r.role === "super_admin"));
      }
      const { data: linkRows } = await supabase
        .from("astg_medicine_links")
        .select("medicine_key,product_id,supplier_sku")
        .in("medicine_key", keys);
      const map: Record<string, LinkRow> = {};
      const pids: string[] = [];
      (linkRows ?? []).forEach((r: any) => {
        map[r.medicine_key] = r;
        if (r.product_id) pids.push(r.product_id);
      });
      setLinks(map);
      if (pids.length) {
        const { data: prods } = await supabase.from("products").select("id,name,price,stock").in("id", pids);
        const pmap: Record<string, Product> = {};
        (prods ?? []).forEach((p: any) => (pmap[p.id] = p));
        setProducts(pmap);
      }
      // EDL lookups (sequential to limit load)
      const edlMap: Record<string, EDLMatch[]> = {};
      for (const m of medicines) {
        edlMap[m.name] = await findEDLMatches(m.name);
      }
      setEdl(edlMap);
    })();
  }, [keys, medicines]);

  async function linkProduct(med: Medicine, key: string, productId: string, sku: string) {
    const payload = {
      medicine_key: key,
      category_key: categoryKey,
      disease_key: diseaseKey,
      level_number: level,
      medicine_name: med.name,
      product_id: productId || null,
      supplier_sku: sku || null,
    };
    const { error } = await supabase.from("astg_medicine_links").upsert(payload, { onConflict: "medicine_key" });
    if (error) return toast.error(error.message);
    setLinks((prev) => ({ ...prev, [key]: payload as LinkRow }));
    setLinkOpen(null);
    toast.success("Linked to Pharma Exchange");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 rounded-md border bg-muted/30 px-3 py-2 text-sm">
        <div className="flex items-center gap-2">
          <Baby className="h-4 w-4" />
          <span className="font-medium">Pediatric mode</span>
          <Switch checked={pediatric} onCheckedChange={setPediatric} />
        </div>
        {pediatric && (
          <>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">Weight (kg)</span>
              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : "")}
                className="h-7 w-20"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">Age (yrs)</span>
              <Input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value ? Number(e.target.value) : "")}
                className="h-7 w-16"
              />
            </div>
            <span className="text-xs text-muted-foreground">Clark's rule (weight) & Young's rule (age)</span>
          </>
        )}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medicine</TableHead>
              <TableHead>Form</TableHead>
              <TableHead>Dose</TableHead>
              {pediatric && <TableHead className="bg-amber-50">Pediatric</TableHead>}
              <TableHead>Anupana</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Sourcing</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medicines.map((m, i) => {
              const key = keys[i];
              const link = links[key];
              const product = link?.product_id ? products[link.product_id] : undefined;
              const matches = edl[m.name] ?? [];
              const ped = pediatric
                ? adjustPediatric(m.dose, typeof weight === "number" ? weight : undefined, typeof age === "number" ? age : undefined)
                : null;
              return (
                <TableRow key={i} className={i % 2 ? "bg-muted/20" : ""}>
                  <TableCell className="font-medium">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {m.name}
                      {m.isCommon && <Badge variant="secondary" className="text-[10px]">Common</Badge>}
                      {matches.length > 0 && (
                        <Badge
                          variant="outline"
                          className="cursor-pointer border-emerald-300 bg-emerald-50 text-[10px] text-emerald-700"
                          onClick={() => setEdlOpen(matches)}
                        >
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          EDL · {Array.from(new Set(matches.map((x) => x.system))).join("/")}
                        </Badge>
                      )}
                    </div>
                    {m.dosha && <div className="text-xs text-muted-foreground">{m.dosha}</div>}
                  </TableCell>
                  <TableCell className="text-sm">{m.formulation ?? "—"}</TableCell>
                  <TableCell className="text-sm">{m.dose ?? "—"}</TableCell>
                  {pediatric && (
                    <TableCell className="bg-amber-50/60 text-sm">
                      <div>{ped?.label}</div>
                      {ped?.warning && <div className="text-xs text-amber-700">{ped.warning}</div>}
                    </TableCell>
                  )}
                  <TableCell className="text-sm">{m.anupana ?? "—"}</TableCell>
                  <TableCell className="text-sm">{m.duration ?? "—"}</TableCell>
                  <TableCell className="text-xs">
                    {product ? (
                      <div className="space-y-0.5">
                        <Badge className="bg-primary/10 text-primary" variant="outline">
                          <Pill className="mr-1 h-3 w-3" /> Pharma Exchange
                        </Badge>
                        <div className="text-muted-foreground">
                          {product.price ? `₹${product.price}` : ""} {product.stock != null ? `· stock ${product.stock}` : ""}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Not linked</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {isAdmin && (
                        <Button size="sm" variant="ghost" onClick={() => setLinkOpen({ med: m, key })}>
                          <Link2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button size="sm" className="gap-1" onClick={() => setOrderFor(m)}>
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Prescribe
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {orderFor && (
        <PrescribeOrderDialog
          open={!!orderFor}
          onOpenChange={(o) => !o && setOrderFor(null)}
          medicineName={orderFor.name}
          product={
            (() => {
              const k = medicineKey(categoryKey, diseaseKey, level, orderFor.name);
              const pid = links[k]?.product_id;
              return pid ? { id: pid, name: products[pid]?.name ?? orderFor.name, price: products[pid]?.price ?? null } : null;
            })()
          }
          defaults={{ dose: orderFor.dose, anupana: orderFor.anupana, duration: orderFor.duration }}
        />
      )}

      {linkOpen && (
        <LinkProductDialog
          open={!!linkOpen}
          onOpenChange={(o) => !o && setLinkOpen(null)}
          medicineName={linkOpen.med.name}
          onSave={(pid, sku) => linkProduct(linkOpen.med, linkOpen.key, pid, sku)}
        />
      )}

      <Dialog open={!!edlOpen} onOpenChange={(o) => !o && setEdlOpen(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Essential Drug List Matches</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            {(edlOpen ?? []).map((m) => (
              <div key={`${m.system}-${m.id}`} className="rounded border p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{m.name}</span>
                  <Badge>{m.system}</Badge>
                </div>
                {m.dose && <div><span className="text-muted-foreground">Dose:</span> {m.dose}</div>}
                {m.indications?.length ? <div><span className="text-muted-foreground">Indications:</span> {m.indications.join(", ")}</div> : null}
                {m.precautions && <div><span className="text-muted-foreground">Precautions:</span> {m.precautions}</div>}
                {m.reference && <div className="text-xs text-muted-foreground">{m.reference}</div>}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LinkProductDialog({
  open,
  onOpenChange,
  medicineName,
  onSave,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  medicineName: string;
  onSave: (productId: string, sku: string) => void;
}) {
  const [q, setQ] = useState(medicineName);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [sku, setSku] = useState("");
  const [pid, setPid] = useState<string>("");

  useEffect(() => {
    if (!open || !q) return;
    setLoading(true);
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("products")
        .select("id,name,price,stock")
        .ilike("name", `%${q}%`)
        .limit(20);
      setResults((data as Product[]) ?? []);
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [q, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Link to Pharma Exchange product</DialogTitle>
        </DialogHeader>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" />
        <div className="max-h-64 space-y-1 overflow-y-auto">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {results.map((p) => (
            <button
              key={p.id}
              className={`flex w-full items-center justify-between rounded border px-2 py-1.5 text-left text-sm hover:bg-muted ${pid === p.id ? "border-primary bg-primary/5" : ""}`}
              onClick={() => setPid(p.id)}
            >
              <span>{p.name}</span>
              <span className="text-xs text-muted-foreground">{p.price ? `₹${p.price}` : ""}</span>
            </button>
          ))}
          {!loading && results.length === 0 && <div className="text-xs text-muted-foreground">No matches</div>}
        </div>
        <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Supplier SKU (optional)" />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!pid} onClick={() => onSave(pid, sku)}>Link</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
