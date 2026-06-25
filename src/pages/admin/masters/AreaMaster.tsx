import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Pencil, ChevronDown, ChevronRight, MapPin } from "lucide-react";
import { toast } from "sonner";
import HmsMasterHeader from "@/components/hms/HmsMasterHeader";

type Area = { id: string; area_name: string; city: string | null; district: string | null; state: string; pincode: string | null; zone: string | null; is_active: boolean };

const empty = { id: "", area_name: "", city: "", district: "", state: "Tamil Nadu", pincode: "", zone: "" };

const AreaMaster = () => {
  const [rows, setRows] = useState<Area[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [openZones, setOpenZones] = useState<Record<string, boolean>>({});

  const load = async () => {
    const { data } = await supabase.from("hms_service_areas").select("*").order("zone").order("area_name");
    setRows((data ?? []) as Area[]);
    // Optional patient count per district (best effort, guarded)
    try {
      const districts = Array.from(new Set((data ?? []).map((r: any) => r.district).filter(Boolean)));
      const out: Record<string, number> = {};
      await Promise.all(districts.map(async (d) => {
        const { count } = await supabase.from("vaidya_patients").select("id", { count: "exact", head: true }).ilike("address", `%${d}%`);
        out[d as string] = count ?? 0;
      }));
      setCounts(out);
    } catch { /* counts are optional */ }
  };
  useEffect(() => { load(); }, []);

  const byZone = useMemo(() => {
    const map: Record<string, Area[]> = {};
    for (const r of rows) {
      const z = r.zone || "Unzoned";
      (map[z] ||= []).push(r);
    }
    return map;
  }, [rows]);

  const save = async () => {
    if (!form.area_name) return toast.error("Area name required");
    const p: any = { ...form, city: form.city || null, district: form.district || null, pincode: form.pincode || null, zone: form.zone || null };
    delete p.id;
    const { error } = form.id ? await supabase.from("hms_service_areas").update(p).eq("id", form.id) : await supabase.from("hms_service_areas").insert(p);
    if (error) return toast.error(error.message);
    toast.success("Saved"); setOpen(false); setForm(empty); load();
  };

  return (
    <div className="mx-auto max-w-6xl">
      <HmsMasterHeader
        title="📍 Area Master"
        description="Service areas and zones across Tamil Nadu."
        actions={
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setForm(empty); }}>
            <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Area</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{form.id ? "Edit" : "Add"} area</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><Label>Area name</Label><Input value={form.area_name} onChange={(e) => setForm({ ...form, area_name: e.target.value })} /></div>
                <div><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
                <div><Label>District</Label><Input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} /></div>
                <div><Label>State</Label><Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></div>
                <div><Label>Pincode</Label><Input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} /></div>
                <div className="col-span-2"><Label>Zone</Label><Input placeholder="e.g. Tenkasi Zone" value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} /></div>
              </div>
              <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="space-y-3">
        {Object.entries(byZone).map(([zone, areas]) => (
          <Collapsible key={zone} open={openZones[zone] ?? true} onOpenChange={(v) => setOpenZones((m) => ({ ...m, [zone]: v }))}>
            <Card>
              <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left">
                <div className="flex items-center gap-2">
                  {(openZones[zone] ?? true) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{zone}</span>
                  <Badge variant="secondary">{areas.length} areas</Badge>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid gap-2 border-t p-3">
                  {areas.map((a) => (
                    <div key={a.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{a.area_name}</span>
                        {a.district && <Badge variant="outline">{a.district}</Badge>}
                        {a.pincode && <span className="font-mono text-xs text-muted-foreground">{a.pincode}</span>}
                        {a.district && counts[a.district] != null && (
                          <span className="text-xs text-muted-foreground">~{counts[a.district]} patients</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={a.is_active} onCheckedChange={async (v) => { await supabase.from("hms_service_areas").update({ is_active: v }).eq("id", a.id); load(); }} />
                        <Button size="icon" variant="ghost" onClick={() => { setForm({ ...a, city: a.city ?? "", district: a.district ?? "", pincode: a.pincode ?? "", zone: a.zone ?? "" }); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={async () => { if (confirm("Delete?")) { await supabase.from("hms_service_areas").delete().eq("id", a.id); load(); } }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
        {rows.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No areas yet.</p>}
      </div>
    </div>
  );
};

export default AreaMaster;
