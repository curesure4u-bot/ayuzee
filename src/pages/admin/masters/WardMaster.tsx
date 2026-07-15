import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, BedDouble } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import HmsMasterHeader from "@/components/hms/HmsMasterHeader";

type Ward = { id: string; ward_name: string; ward_type: string; total_beds: number; daily_charge: number; floor: string | null };
type Bed = { id: string; ward_id: string; bed_number: string; status: "available" | "occupied" | "cleaning" | "maintenance"; current_patient_name: string | null; current_patient_id: string | null; daily_charge_override: number | null };

const STATUS_BG: Record<Bed["status"], string> = {
  available: "bg-[#DCFCE7] border-green-300 text-green-900",
  occupied: "bg-[#FEE2E2] border-red-300 text-red-900",
  cleaning: "bg-[#FEF9C3] border-yellow-300 text-yellow-900",
  maintenance: "bg-[#F3F4F6] border-gray-300 text-gray-700",
};
const STATUS_DOT: Record<Bed["status"], string> = {
  available: "bg-green-500", occupied: "bg-red-500", cleaning: "bg-yellow-500", maintenance: "bg-gray-400",
};
const WARD_TYPES = ["general", "private", "semi_private", "observation", "panchakarma_room", "yoga_hall", "therapy_room"];

const WardMaster = () => {
  const [wards, setWards] = useState<Ward[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [selBed, setSelBed] = useState<Bed | null>(null);
  const [openWard, setOpenWard] = useState(false);
  const [wardForm, setWardForm] = useState<any>({ ward_name: "", ward_type: "general", total_beds: 0, daily_charge: 0, floor: "" });
  const navigate = useNavigate();

  const load = async () => {
    const [w, b] = await Promise.all([
      supabase.from("hms_wards").select("*").eq("is_active", true).order("ward_name"),
      supabase.from("hms_ward_beds").select("*").eq("is_active", true).order("bed_number"),
    ]);
    setWards((w.data ?? []) as Ward[]); setBeds((b.data ?? []) as Bed[]);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("ward-beds-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "hms_ward_beds" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const occupancy = useMemo(() => {
    const occ = beds.filter((b) => b.status === "occupied").length;
    const total = beds.length;
    const pct = total ? Math.round((occ / total) * 100) : 0;
    return { occ, total, pct };
  }, [beds]);

  const saveWard = async () => {
    if (!wardForm.ward_name) return toast.error("Ward name required");
    const { error } = await supabase.from("hms_wards").insert(wardForm);
    if (error) return toast.error(error.message);
    toast.success("Ward created"); setOpenWard(false); setWardForm({ ward_name: "", ward_type: "general", total_beds: 0, daily_charge: 0, floor: "" }); load();
  };

  const updateBed = async (patch: Partial<Bed>) => {
    if (!selBed) return;
    const { error } = await supabase.from("hms_ward_beds").update(patch).eq("id", selBed.id);
    if (error) return toast.error(error.message);
    toast.success("Bed updated"); setSelBed(null);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <HmsMasterHeader
        title="🛏️ Ward Master"
        description="Visual bed map with real-time status. Click any bed to admit, discharge, or change status."
        actions={
          <Dialog open={openWard} onOpenChange={setOpenWard}>
            <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Ward</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add ward</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Ward name</Label><Input value={wardForm.ward_name} onChange={(e) => setWardForm({ ...wardForm, ward_name: e.target.value })} /></div>
                <div>
                  <Label>Type</Label>
                  <Select value={wardForm.ward_type} onValueChange={(v) => setWardForm({ ...wardForm, ward_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{WARD_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label>Floor</Label><Input value={wardForm.floor} onChange={(e) => setWardForm({ ...wardForm, floor: e.target.value })} /></div>
                  <div><Label>Total beds</Label><Input type="number" value={wardForm.total_beds} onChange={(e) => setWardForm({ ...wardForm, total_beds: Number(e.target.value) })} /></div>
                  <div><Label>Daily charge (₹)</Label><Input type="number" value={wardForm.daily_charge} onChange={(e) => setWardForm({ ...wardForm, daily_charge: Number(e.target.value) })} /></div>
                </div>
              </div>
              <DialogFooter><Button onClick={saveWard}>Create Ward</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Occupancy bar */}
      <Card className="mb-6 p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BedDouble className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">{occupancy.occ} / {occupancy.total} Beds Occupied</h3>
          </div>
          <Badge variant={occupancy.pct >= 80 ? "destructive" : occupancy.pct >= 50 ? "default" : "secondary"}>{occupancy.pct}%</Badge>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full transition-all ${occupancy.pct >= 80 ? "bg-red-500" : occupancy.pct >= 50 ? "bg-orange-500" : "bg-green-500"}`}
            style={{ width: `${occupancy.pct}%` }}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-xs">
          {(["available", "occupied", "cleaning", "maintenance"] as const).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${STATUS_DOT[s]}`} />
              <span className="capitalize">{s}: {beds.filter((b) => b.status === s).length}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Wards */}
      <div className="space-y-6">
        {wards.map((w) => {
          const wbeds = beds.filter((b) => b.ward_id === w.id);
          return (
            <div key={w.id}>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">{w.ward_name}</h2>
                <Badge variant="outline">₹{Number(w.daily_charge).toLocaleString()}/day · {w.ward_type.replace("_", " ")}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {wbeds.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelBed(b)}
                    className={`relative rounded-lg border-2 p-4 text-center transition hover:scale-105 hover:shadow-md ${STATUS_BG[b.status]}`}
                  >
                    <span className={`absolute right-2 top-2 h-2.5 w-2.5 rounded-full ${STATUS_DOT[b.status]}`} />
                    <div className="text-xl font-bold">{b.bed_number}</div>
                    <div className="mt-1 truncate text-xs">
                      {b.status === "occupied" ? (b.current_patient_name || "Occupied") :
                       b.status === "cleaning" ? "Cleaning" :
                       b.status === "maintenance" ? "Maintenance" : "Available"}
                    </div>
                  </button>
                ))}
                {wbeds.length === 0 && <p className="col-span-full text-xs text-muted-foreground">No beds in this ward.</p>}
              </div>
            </div>
          );
        })}
        {wards.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No wards yet. Add one to get started.</p>}
      </div>

      {/* Bed action dialog */}
      <Dialog open={!!selBed} onOpenChange={(v) => !v && setSelBed(null)}>
        <DialogContent>
          {selBed && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  Bed {selBed.bed_number}
                  <Badge variant="outline" className={STATUS_BG[selBed.status]}>{selBed.status}</Badge>
                </DialogTitle>
              </DialogHeader>
              {selBed.status === "available" && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">This bed is available.</p>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => { setSelBed(null); navigate("/admin/master-management/ip-admission-types"); }}>Admit Patient</Button>
                    <Button variant="outline" onClick={() => updateBed({ status: "maintenance" })}>Mark as Maintenance</Button>
                  </div>
                </div>
              )}
              {selBed.status === "occupied" && (
                <div className="space-y-3">
                  <p className="text-sm"><strong>Patient:</strong> {selBed.current_patient_name || "—"}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => updateBed({ status: "available", current_patient_name: null, current_patient_id: null })}>Discharge Patient</Button>
                    <Button variant="outline" onClick={() => updateBed({ status: "cleaning" })}>Mark as Cleaning</Button>
                  </div>
                </div>
              )}
              {selBed.status === "cleaning" && (
                <Button onClick={() => updateBed({ status: "available" })}>Mark as Available</Button>
              )}
              {selBed.status === "maintenance" && (
                <Button onClick={() => updateBed({ status: "available" })}>Mark as Available</Button>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WardMaster;
