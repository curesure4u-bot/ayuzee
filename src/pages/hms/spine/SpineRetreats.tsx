import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Tent, Plus, Save, MapPin, CalendarClock, IndianRupee, Users, Share2,
  CheckCircle2, Sparkles, UserPlus, Sun,
} from "lucide-react";

interface Retreat {
  id: string;
  title: string;
  retreat_type: string;
  description?: string | null;
  location?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  duration_days?: number | null;
  price?: number | null;
  early_bird_price?: number | null;
  capacity?: number | null;
  seats_filled?: number | null;
  inclusions?: string[] | null;
  highlights?: string[] | null;
  is_published: boolean;
}
interface Reg {
  id: string;
  retreat_title?: string | null;
  participant_name: string;
  phone?: string | null;
  status: string;
  created_at: string;
}

const typeMeta: Record<string, { color: string; label: string }> = {
  retreat: { color: "green", label: "Retreat" },
  bootcamp: { color: "orange", label: "Boot Camp" },
  detox: { color: "cyan", label: "Detox" },
  rasayana: { color: "purple", label: "Rasayana" },
};

const blankR = { title: "", retreat_type: "retreat", description: "", location: "", start_date: "", end_date: "", duration_days: "", price: "", early_bird_price: "", capacity: "", inclusions: "", highlights: "" };
const blankReg = { participant_name: "", phone: "", email: "", package: "" };

export default function SpineRetreats() {
  const [tab, setTab] = useState("upcoming");
  const [retreats, setRetreats] = useState<Retreat[]>([]);
  const [regs, setRegs] = useState<Reg[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...blankR });
  const [regFor, setRegFor] = useState<Retreat | null>(null);
  const [reg, setReg] = useState({ ...blankReg });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data: r } = await (supabase.from("spine_retreats") as any).select("*").order("start_date", { ascending: true });
      setRetreats((r as Retreat[]) || []);
      const { data: rg } = await (supabase.from("spine_retreat_registrations") as any).select("*").order("created_at", { ascending: false });
      setRegs((rg as Reg[]) || []);
    } catch { setRetreats([]); setRegs([]); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const saveRetreat = async () => {
    if (!form.title) { toast.error("Enter retreat title"); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await (supabase.from("spine_retreats") as any).insert({
        owner_id: user?.id || null, title: form.title, retreat_type: form.retreat_type,
        description: form.description || null, location: form.location || null,
        start_date: form.start_date || null, end_date: form.end_date || null,
        duration_days: form.duration_days ? parseInt(form.duration_days) : null,
        price: form.price ? Number(form.price) : null, early_bird_price: form.early_bird_price ? Number(form.early_bird_price) : null,
        capacity: form.capacity ? parseInt(form.capacity) : null, seats_filled: 0,
        inclusions: form.inclusions ? form.inclusions.split(",").map((s) => s.trim()).filter(Boolean) : [],
        highlights: form.highlights ? form.highlights.split(",").map((s) => s.trim()).filter(Boolean) : [],
        is_published: true,
      });
      if (error) toast.error("Save failed: " + error.message);
      else { toast.success("Retreat created!"); setForm({ ...blankR }); setShowForm(false); load(); }
    } catch { toast.error("Something went wrong"); }
    setSaving(false);
  };

  const register = async () => {
    if (!regFor || !reg.participant_name) { toast.error("Enter participant name"); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await (supabase.from("spine_retreat_registrations") as any).insert({
        owner_id: user?.id || null, retreat_id: regFor.id, retreat_title: regFor.title,
        participant_name: reg.participant_name, phone: reg.phone || null, email: reg.email || null,
        package: reg.package || null, status: "registered",
      });
      if (error) { toast.error("Register failed: " + error.message); }
      else {
        await (supabase.from("spine_retreats") as any).update({ seats_filled: (regFor.seats_filled || 0) + 1 }).eq("id", regFor.id);
        toast.success(`${reg.participant_name} registered for ${regFor.title}`); setReg({ ...blankReg }); setRegFor(null); load();
      }
    } catch { toast.error("Something went wrong"); }
    setSaving(false);
  };

  const share = (r: Retreat) => {
    const price = r.early_bird_price ? `Early bird ₹${r.early_bird_price} (reg ₹${r.price}).` : r.price ? `₹${r.price}.` : "";
    const when = r.start_date ? ` from ${new Date(r.start_date).toLocaleDateString()}` : "";
    const text = `🌿 ${r.title}${when} at ${r.location || "our center"}. ${price} Limited seats — book now!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Tent className="h-6 w-6 text-orange-600" /> Retreats & Boot Camps</h1>
          <p className="text-muted-foreground mt-1">Annual residential wellness events — premium revenue + deep patient loyalty.</p>
        </div>
        <Button size="sm" onClick={() => setShowForm((v) => !v)} className="gap-1"><Plus className="h-4 w-4" /> New Retreat</Button>
      </div>

      {showForm && (
        <Card className="border-orange-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Create Retreat / Boot Camp</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs font-medium">Title</label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Annual Spine & Longevity Retreat" /></div>
              <div><label className="text-xs font-medium">Type</label>
                <Select value={form.retreat_type} onValueChange={(v) => setForm({ ...form, retreat_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(typeMeta).map(([k, m]) => <SelectItem key={k} value={k}>{m.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><label className="text-xs font-medium">Description</label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="h-16" /></div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div><label className="text-xs font-medium">Location</label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
              <div><label className="text-xs font-medium">Start Date</label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
              <div><label className="text-xs font-medium">End Date</label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
              <div><label className="text-xs font-medium">Days</label><Input type="number" value={form.duration_days} onChange={(e) => setForm({ ...form, duration_days: e.target.value })} placeholder="5" /></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div><label className="text-xs font-medium">Price ₹</label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="35000" /></div>
              <div><label className="text-xs font-medium">Early Bird ₹</label><Input type="number" value={form.early_bird_price} onChange={(e) => setForm({ ...form, early_bird_price: e.target.value })} placeholder="28000" /></div>
              <div><label className="text-xs font-medium">Capacity</label><Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="20" /></div>
            </div>
            <div><label className="text-xs font-medium">Inclusions (comma-separated)</label><Input value={form.inclusions} onChange={(e) => setForm({ ...form, inclusions: e.target.value })} placeholder="Accommodation, Meals, Therapy" /></div>
            <div><label className="text-xs font-medium">Highlights (comma-separated)</label><Input value={form.highlights} onChange={(e) => setForm({ ...form, highlights: e.target.value })} placeholder="Drop your Wellness Age, Small group" /></div>
            <Button className="w-full gap-1" onClick={saveRetreat} disabled={saving}><Save className="h-4 w-4" /> {saving ? "Creating..." : "Create Retreat"}</Button>
          </CardContent>
        </Card>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-2 w-full max-w-sm">
          <TabsTrigger value="upcoming" className="text-xs gap-1"><CalendarClock className="h-3 w-3" /> Retreats</TabsTrigger>
          <TabsTrigger value="regs" className="text-xs gap-1"><Users className="h-3 w-3" /> Registrations</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {loading ? <p className="text-sm text-muted-foreground text-center py-8">Loading...</p> :
            retreats.length === 0 ? (
              <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No retreats yet. Create your first annual retreat or boot camp.</CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {retreats.map((r) => {
                  const meta = typeMeta[r.retreat_type] || typeMeta.retreat;
                  const pct = r.capacity ? Math.round(((r.seats_filled || 0) / r.capacity) * 100) : 0;
                  return (
                    <Card key={r.id} className={`border-${meta.color}-200`}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Badge className={`bg-${meta.color}-100 text-${meta.color}-700 text-[9px]`}>{meta.label}</Badge>
                            <p className="font-semibold text-sm mt-1">{r.title}</p>
                          </div>
                          {r.early_bird_price && <Badge className="bg-rose-100 text-rose-700 text-[9px]"><Sun className="h-2.5 w-2.5 mr-0.5" /> Early Bird</Badge>}
                        </div>
                        {r.description && <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{r.description}</p>}
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                          {r.location && <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {r.location}</span>}
                          {r.start_date && <span className="flex items-center gap-0.5"><CalendarClock className="h-3 w-3" /> {new Date(r.start_date).toLocaleDateString()}</span>}
                          {r.duration_days && <span>{r.duration_days} days</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {r.early_bird_price ? (
                            <><span className="text-lg font-bold text-orange-600 flex items-center"><IndianRupee className="h-4 w-4" />{r.early_bird_price}</span><span className="text-xs text-muted-foreground line-through">₹{r.price}</span></>
                          ) : r.price ? <span className="text-lg font-bold text-orange-600 flex items-center"><IndianRupee className="h-4 w-4" />{r.price}</span> : null}
                        </div>
                        {(r.highlights || []).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">{(r.highlights || []).map((h) => <Badge key={h} variant="secondary" className="text-[9px]">{h}</Badge>)}</div>
                        )}
                        {r.capacity ? (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-0.5"><span>{r.seats_filled || 0}/{r.capacity} seats</span><span>{pct}% full</span></div>
                            <Progress value={pct} className="h-1.5" />
                          </div>
                        ) : null}
                        <div className="flex items-center gap-2 mt-3">
                          <Button size="sm" className="gap-1 flex-1" onClick={() => setRegFor(r)}><UserPlus className="h-3.5 w-3.5" /> Register</Button>
                          <Button size="sm" variant="outline" className="gap-1" onClick={() => share(r)}><Share2 className="h-3.5 w-3.5" /> Share</Button>
                        </div>

                        {regFor?.id === r.id && (
                          <div className="mt-3 rounded-md border p-2.5 space-y-2 bg-muted/30">
                            <p className="text-xs font-medium">Register a participant</p>
                            <div className="grid grid-cols-2 gap-2">
                              <Input value={reg.participant_name} onChange={(e) => setReg({ ...reg, participant_name: e.target.value })} placeholder="Name" className="h-8 text-xs" />
                              <Input value={reg.phone} onChange={(e) => setReg({ ...reg, phone: e.target.value })} placeholder="Phone" className="h-8 text-xs" />
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" className="gap-1 flex-1" onClick={register} disabled={saving}><CheckCircle2 className="h-3.5 w-3.5" /> {saving ? "..." : "Confirm"}</Button>
                              <Button size="sm" variant="ghost" onClick={() => setRegFor(null)}>Cancel</Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
        </TabsContent>

        <TabsContent value="regs" className="space-y-2">
          {regs.length === 0 ? (
            <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No registrations yet.</CardContent></Card>
          ) : (
            regs.map((rg) => (
              <Card key={rg.id}><CardContent className="py-3 flex items-center justify-between gap-2">
                <div className="min-w-0"><p className="font-medium text-sm truncate">{rg.participant_name}</p><p className="text-[11px] text-muted-foreground">{rg.retreat_title} · {new Date(rg.created_at).toLocaleDateString()}{rg.phone ? ` · ${rg.phone}` : ""}</p></div>
                <Badge className="bg-green-100 text-green-700 text-[9px]">{rg.status}</Badge>
              </CardContent></Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
