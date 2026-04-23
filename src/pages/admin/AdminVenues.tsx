import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Venue {
  id: string; name: string; type: string; city: string; state: string; phone: string | null;
  available_therapies: string[]; rooms: unknown; is_verified: boolean; is_active: boolean;
  rating: number; owner_user_id: string | null;
}

const STATUSES = ["pending", "approved", "suspended"] as const;
const statusOf = (v: Venue) => v.is_verified ? (v.is_active ? "approved" : "suspended") : "pending";

const AdminVenues = () => {
  const [list, setList] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [revenueByVenue, setRevenueByVenue] = useState<Record<string, { revenue: number; count: number }>>({});
  const [rejectFor, setRejectFor] = useState<Venue | null>(null);
  const [reason, setReason] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("therapy_venues").select("*").order("created_at", { ascending: false });
    setList((data ?? []) as Venue[]);
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    const { data: logs } = await supabase.from("venue_revenue_logs")
      .select("venue_id, amount, type")
      .eq("type", "net_payout")
      .gte("created_at", monthStart.toISOString());
    const agg: Record<string, { revenue: number; count: number }> = {};
    (logs ?? []).forEach((l: { venue_id: string; amount: number }) => {
      const cur = agg[l.venue_id] ?? { revenue: 0, count: 0 };
      cur.revenue += Number(l.amount); cur.count += 1; agg[l.venue_id] = cur;
    });
    setRevenueByVenue(agg);
    setLoading(false);
  };

  useEffect(() => { document.title = "Venues — Admin"; load(); }, []);

  const approve = async (v: Venue) => {
    const { error } = await supabase.from("therapy_venues").update({ is_verified: true, is_active: true }).eq("id", v.id);
    if (error) return toast.error(error.message);
    if (v.phone) supabase.functions.invoke("send-whatsapp", { body: { to: v.phone, message: `Your venue "${v.name}" is approved on Ayuzee.` } }).catch(() => {});
    toast.success("Venue approved"); load();
  };
  const suspend = async (v: Venue) => {
    const { error } = await supabase.from("therapy_venues").update({ is_active: false }).eq("id", v.id);
    if (error) return toast.error(error.message);
    toast.success("Venue suspended"); load();
  };
  const reject = async () => {
    if (!rejectFor) return;
    const { error } = await supabase.from("therapy_venues").update({ is_verified: false, is_active: false }).eq("id", rejectFor.id);
    if (error) return toast.error(error.message);
    if (rejectFor.phone) supabase.functions.invoke("send-whatsapp", { body: { to: rejectFor.phone, message: `Your venue "${rejectFor.name}" was not approved. Reason: ${reason}` } }).catch(() => {});
    toast.success("Venue rejected"); setRejectFor(null); setReason(""); load();
  };

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-3xl">Venues</h1><p className="text-sm text-muted-foreground">Approve and manage therapy venues.</p></div>
      {loading ? <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
        <Tabs defaultValue="pending">
          <TabsList>{STATUSES.map(s => <TabsTrigger key={s} value={s} className="capitalize">{s} ({list.filter(v => statusOf(v) === s).length})</TabsTrigger>)}</TabsList>
          {STATUSES.map(s => (
            <TabsContent key={s} value={s} className="space-y-3 mt-4">
              {list.filter(v => statusOf(v) === s).length === 0 && <Card><CardContent className="p-10 text-center text-muted-foreground">No {s} venues.</CardContent></Card>}
              {list.filter(v => statusOf(v) === s).map(v => {
                const rev = revenueByVenue[v.id];
                const rooms = Array.isArray(v.rooms) ? v.rooms : [];
                return (
                  <Card key={v.id}><CardContent className="p-5">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{v.name}</h3>
                          <Badge variant="outline" className="capitalize">{v.type}</Badge>
                          <Badge variant="outline" className="capitalize">{statusOf(v)}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{v.city}, {v.state} · {v.phone ?? "—"}</div>
                        <div className="text-xs text-muted-foreground mt-1">{rooms.length} room(s) · Therapies: {(v.available_therapies ?? []).slice(0, 5).join(", ") || "—"}</div>
                        {statusOf(v) === "approved" && rev && (
                          <div className="text-xs text-muted-foreground mt-1">This month: ₹{rev.revenue.toLocaleString("en-IN")} · {rev.count} session(s)</div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {statusOf(v) !== "approved" && <Button size="sm" onClick={() => approve(v)}>Approve</Button>}
                        {statusOf(v) === "approved" && <Button size="sm" variant="destructive" onClick={() => suspend(v)}>Suspend</Button>}
                        {statusOf(v) !== "approved" && <Button size="sm" variant="outline" onClick={() => { setRejectFor(v); setReason(""); }}>Reject</Button>}
                      </div>
                    </div>
                  </CardContent></Card>
                );
              })}
            </TabsContent>
          ))}
        </Tabs>
      )}

      <Dialog open={!!rejectFor} onOpenChange={(o) => !o && setRejectFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject {rejectFor?.name}</DialogTitle></DialogHeader>
          <Textarea rows={4} placeholder="Reason for rejection" value={reason} onChange={(e) => setReason(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectFor(null)}>Cancel</Button>
            <Button variant="destructive" onClick={reject} disabled={!reason.trim()}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminVenues;
