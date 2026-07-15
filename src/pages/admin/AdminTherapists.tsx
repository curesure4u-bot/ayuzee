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

type Therapist = { id: string; user_id: string | null; full_name: string; phone: string; gender: string | null; city: string | null; certifying_body: string | null; certificate_url: string | null; allowed_therapies: string[] | null; rating: number | null; total_sessions: number | null; verification_status: string | null; is_verified: boolean | null; is_suspended?: boolean; is_banned?: boolean; rejection_reason: string | null };
const tabs = ["all", "pending", "approved", "suspended", "banned"];
const statusOf = (t: Therapist) => t.is_banned ? "banned" : t.is_suspended ? "suspended" : t.is_verified || t.verification_status === "approved" ? "approved" : "pending";

const AdminTherapists = () => {
  usePageSEO({ title: "Admin · Therapists — Ayuzee", noIndex: true });
  const [rows, setRows] = useState<Therapist[]>([]);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [rejectFor, setRejectFor] = useState<Therapist | null>(null);
  const [reason, setReason] = useState("");
  const [flagCounts, setFlagCounts] = useState<Record<string, number>>({});
  const [flagFor, setFlagFor] = useState<Therapist | null>(null);
  const [flagReason, setFlagReason] = useState("");

  const load = async () => {
    const [therapists, flags] = await Promise.all([
      (supabase as any).from("therapists").select("*").order("created_at", { ascending: false }),
      supabase.from("therapist_safety_flags").select("therapist_id").eq("resolved", false),
    ]);
    setRows((therapists.data ?? []) as Therapist[]);
    const counts: Record<string, number> = {};
    (flags.data ?? []).forEach((flag: { therapist_id: string | null }) => { if (flag.therapist_id) counts[flag.therapist_id] = (counts[flag.therapist_id] ?? 0) + 1; });
    setFlagCounts(counts);
  };
  useEffect(() => { load(); }, []);
  const filtered = useMemo(() => rows.filter((t) => (tab === "all" || statusOf(t) === tab) && (!query || `${t.full_name} ${t.city ?? ""} ${t.certifying_body ?? ""}`.toLowerCase().includes(query.toLowerCase()))), [rows, tab, query]);
  const notify = (phone: string, message: string) => supabase.functions.invoke("send-whatsapp", { body: { to: phone, message } });
  const approve = async (t: Therapist) => { const { error } = await (supabase as any).from("therapists").update({ is_verified: true, verification_status: "approved", is_suspended: false, is_banned: false, rejection_reason: null }).eq("id", t.id); if (error) return toast.error(error.message); if (t.user_id) await supabase.from("user_roles").upsert({ user_id: t.user_id, role: "therapist" as any }, { onConflict: "user_id,role" }); await notify(t.phone, "Your Ayuzee therapist account is approved"); toast.success("Therapist approved"); load(); };
  const reject = async () => { if (!rejectFor) return; const { error } = await (supabase as any).from("therapists").update({ is_verified: false, verification_status: "rejected", rejection_reason: reason }).eq("id", rejectFor.id); if (error) return toast.error(error.message); await notify(rejectFor.phone, `Your Ayuzee therapist application was rejected. Reason: ${reason}`); toast.success("Therapist rejected"); setRejectFor(null); setReason(""); load(); };
  const suspend = async (t: Therapist) => { const { error } = await (supabase as any).from("therapists").update({ is_suspended: true, verification_status: "suspended" }).eq("id", t.id); if (error) return toast.error(error.message); toast.success("Therapist suspended"); load(); };
  const createFlag = async () => { if (!flagFor) return; const { error } = await supabase.from("therapist_safety_flags").insert({ therapist_id: flagFor.id, reason: flagReason, severity: "warning" }); if (error) return toast.error(error.message); toast.success("Safety flag added"); setFlagFor(null); setFlagReason(""); load(); };
  const openCert = async (t: Therapist) => { if (!t.certificate_url) return; const { data } = await supabase.storage.from("therapist-docs").createSignedUrl(t.certificate_url, 900); if (data?.signedUrl) window.open(data.signedUrl, "_blank"); else window.open(t.certificate_url, "_blank"); };

  return <div className="space-y-6"><div><h1 className="font-display text-3xl">Therapists</h1><p className="text-sm text-muted-foreground">Approve therapists, review safety, and manage status.</p></div><Card><CardContent className="p-4"><div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><Tabs value={tab} onValueChange={setTab}><TabsList>{tabs.map((t) => <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>)}</TabsList></Tabs><Input className="lg:w-80" placeholder="Search therapists" value={query} onChange={(e) => setQuery(e.target.value)} /></div><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Gender</TableHead><TableHead>City</TableHead><TableHead>Certification body</TableHead><TableHead>Allowed therapies</TableHead><TableHead>Rating</TableHead><TableHead>Sessions</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{filtered.map((t) => <TableRow key={t.id}><TableCell className="font-medium">{t.full_name}{(flagCounts[t.id] ?? 0) > 0 && <Badge variant="destructive" className="ml-2">{flagCounts[t.id]}</Badge>}</TableCell><TableCell>{t.gender || "—"}</TableCell><TableCell>{t.city || "—"}</TableCell><TableCell>{t.certifying_body || "—"}</TableCell><TableCell><div className="flex flex-wrap gap-1">{(t.allowed_therapies ?? []).slice(0, 3).map((x) => <Badge key={x} variant="secondary">{x}</Badge>)}{(t.allowed_therapies?.length ?? 0) > 3 && <Badge variant="outline">+{(t.allowed_therapies?.length ?? 0) - 3}</Badge>}</div></TableCell><TableCell>{(t.rating ?? 0).toFixed(1)}</TableCell><TableCell>{t.total_sessions ?? 0}</TableCell><TableCell><Badge variant={statusOf(t) === "approved" ? "default" : statusOf(t) === "banned" ? "destructive" : "secondary"}>{statusOf(t)}</Badge></TableCell><TableCell><div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => openCert(t)}>Certificate</Button>{statusOf(t) === "pending" && <><Button size="sm" onClick={() => approve(t)}>Approve</Button><Button size="sm" variant="destructive" onClick={() => { setRejectFor(t); setReason(""); }}>Reject</Button></>}{statusOf(t) === "approved" && <><Button size="sm" variant="destructive" onClick={() => suspend(t)}>Suspend</Button><Button size="sm" variant="outline" onClick={() => { setFlagFor(t); setFlagReason(""); }}>Safety Flag</Button></>}<Button size="sm" variant="link" asChild><Link to={`/admin/safety?therapist_id=${t.id}`}>History</Link></Button></div></TableCell></TableRow>)}{filtered.length === 0 && <TableRow><TableCell colSpan={9} className="py-8 text-center text-muted-foreground">No therapists found.</TableCell></TableRow>}</TableBody></Table></CardContent></Card><Dialog open={!!rejectFor} onOpenChange={(open) => !open && setRejectFor(null)}><DialogContent><DialogHeader><DialogTitle>Reject {rejectFor?.full_name}</DialogTitle></DialogHeader><Textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" /><DialogFooter><Button variant="outline" onClick={() => setRejectFor(null)}>Cancel</Button><Button variant="destructive" disabled={!reason.trim()} onClick={reject}>Reject</Button></DialogFooter></DialogContent></Dialog><Dialog open={!!flagFor} onOpenChange={(open) => !open && setFlagFor(null)}><DialogContent><DialogHeader><DialogTitle>Add safety flag</DialogTitle></DialogHeader><Textarea rows={4} value={flagReason} onChange={(e) => setFlagReason(e.target.value)} placeholder="Safety concern" /><DialogFooter><Button variant="outline" onClick={() => setFlagFor(null)}>Cancel</Button><Button disabled={!flagReason.trim()} onClick={createFlag}>Save Flag</Button></DialogFooter></DialogContent></Dialog></div>;
};

export default AdminTherapists;
