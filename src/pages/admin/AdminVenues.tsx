import {  useEffect, useMemo, useState  } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Venue = { id: string; owner_user_id: string | null; name: string; type: string | null; city: string; state: string; phone: string | null; rooms: any; available_therapies: string[] | null; rating: number | null; is_verified: boolean | null; is_active: boolean | null; is_suspended?: boolean; registration_doc_url: string | null };
const tabs = ["all", "pending", "approved", "suspended"];
const statusOf = (v: Venue) => v.is_suspended || v.is_active === false && v.is_verified ? "suspended" : v.is_verified ? "approved" : "pending";
const roomCount = (rooms: any) => Array.isArray(rooms) ? rooms.length : Array.isArray(rooms?.rooms) ? rooms.rooms.length : 0;

const AdminVenues = () => {
  usePageSEO({ title: "Admin · Venues — Ayuzee", noIndex: true });
  const [rows, setRows] = useState<Venue[]>([]);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [revenue, setRevenue] = useState<Record<string, number>>({});
  const [rejectFor, setRejectFor] = useState<Venue | null>(null);
  const [reason, setReason] = useState("");

  const load = async () => {
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    const [venues, logs] = await Promise.all([
      (supabase as any).from("therapy_venues").select("*").order("created_at", { ascending: false }),
      supabase.from("venue_revenue_logs").select("venue_id,amount").gte("created_at", monthStart.toISOString()),
    ]);
    setRows((venues.data ?? []) as Venue[]);
    const next: Record<string, number> = {};
    (logs.data ?? []).forEach((log: { venue_id: string | null; amount: number }) => { if (log.venue_id) next[log.venue_id] = (next[log.venue_id] ?? 0) + Number(log.amount || 0); });
    setRevenue(next);
  };
  useEffect(() => { load(); }, []);
  const filtered = useMemo(() => rows.filter((v) => (tab === "all" || statusOf(v) === tab) && (!query || `${v.name} ${v.city} ${v.state}`.toLowerCase().includes(query.toLowerCase()))), [rows, tab, query]);
  const notify = (v: Venue, message: string) => v.phone ? supabase.functions.invoke("send-whatsapp", { body: { to: v.phone, message } }) : Promise.resolve();
  const approve = async (v: Venue) => { const { error } = await (supabase as any).from("therapy_venues").update({ is_verified: true, is_active: true, is_suspended: false }).eq("id", v.id); if (error) return toast.error(error.message); if (v.owner_user_id) await supabase.from("user_roles").upsert({ user_id: v.owner_user_id, role: "venue_owner" as any }, { onConflict: "user_id,role" }); await notify(v, `Your venue ${v.name} is approved on Ayuzee`); toast.success("Venue approved"); load(); };
  const reject = async () => { if (!rejectFor) return; const { error } = await (supabase as any).from("therapy_venues").update({ is_verified: false, is_active: false }).eq("id", rejectFor.id); if (error) return toast.error(error.message); await notify(rejectFor, `Your venue ${rejectFor.name} was rejected. Reason: ${reason}`); toast.success("Venue rejected"); setRejectFor(null); setReason(""); load(); };
  const suspend = async (v: Venue) => { const { error } = await (supabase as any).from("therapy_venues").update({ is_active: false, is_suspended: true }).eq("id", v.id); if (error) return toast.error(error.message); toast.success("Venue suspended"); load(); };
  const openDoc = async (v: Venue) => { const path = v.registration_doc_url || (v.owner_user_id ? `${v.owner_user_id}/reg.pdf` : ""); if (!path) return toast.error("Registration document unavailable"); const { data } = await supabase.storage.from("venue-docs").createSignedUrl(path, 900); if (data?.signedUrl) window.open(data.signedUrl, "_blank"); else toast.error("Registration document unavailable"); };

  return <div className="space-y-6"><div><h1 className="font-display text-3xl">Venues</h1><p className="text-sm text-muted-foreground">Approve and manage therapy venues.</p></div><Card><CardContent className="p-4"><div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><Tabs value={tab} onValueChange={setTab}><TabsList>{tabs.map((t) => <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>)}</TabsList></Tabs><Input className="lg:w-80" placeholder="Search venues" value={query} onChange={(e) => setQuery(e.target.value)} /></div><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>City</TableHead><TableHead>State</TableHead><TableHead>Rooms</TableHead><TableHead>Therapies</TableHead><TableHead>Rating</TableHead><TableHead>Status</TableHead><TableHead>Revenue</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{filtered.map((v) => <TableRow key={v.id}><TableCell className="font-medium">{v.name}</TableCell><TableCell><Badge variant="outline">{v.type || "Venue"}</Badge></TableCell><TableCell>{v.city}</TableCell><TableCell>{v.state}</TableCell><TableCell>{roomCount(v.rooms)}</TableCell><TableCell>{v.available_therapies?.length ?? 0}</TableCell><TableCell>{(v.rating ?? 0).toFixed(1)}</TableCell><TableCell><Badge variant={statusOf(v) === "approved" ? "default" : "secondary"}>{statusOf(v)}</Badge></TableCell><TableCell>{statusOf(v) === "approved" ? `₹${(revenue[v.id] ?? 0).toLocaleString("en-IN")}` : "—"}</TableCell><TableCell><div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => openDoc(v)}>Reg Doc</Button>{statusOf(v) === "pending" && <><Button size="sm" onClick={() => approve(v)}>Approve</Button><Button size="sm" variant="destructive" onClick={() => { setRejectFor(v); setReason(""); }}>Reject</Button></>}{statusOf(v) === "approved" && <><Button size="sm" variant="destructive" onClick={() => suspend(v)}>Suspend</Button><Button size="sm" variant="link" asChild><Link to={`/admin/sessions?venue_id=${v.id}`}>Bookings</Link></Button></>}</div>{statusOf(v) === "pending" && <p className="mt-2 text-xs text-muted-foreground">Rooms: {JSON.stringify(v.rooms ?? []).slice(0, 90)}</p>}</TableCell></TableRow>)}{filtered.length === 0 && <TableRow><TableCell colSpan={10} className="py-8 text-center text-muted-foreground">No venues found.</TableCell></TableRow>}</TableBody></Table></CardContent></Card><Dialog open={!!rejectFor} onOpenChange={(open) => !open && setRejectFor(null)}><DialogContent><DialogHeader><DialogTitle>Reject {rejectFor?.name}</DialogTitle></DialogHeader><Textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" /><DialogFooter><Button variant="outline" onClick={() => setRejectFor(null)}>Cancel</Button><Button variant="destructive" disabled={!reason.trim()} onClick={reject}>Reject</Button></DialogFooter></DialogContent></Dialog></div>;
};

export default AdminVenues;
