import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  AlertTriangle, Building2, CalendarClock, CheckCircle2, HeartPulse,
  Loader2, ShieldAlert, ShieldCheck, Stethoscope, XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Legend,
} from "recharts";

const sb = supabase as any;

type Venue = {
  id: string; name: string; city: string | null; address: string | null;
  license_number: string | null; license_expiry: string | null;
  registration_status: "pending" | "approved" | "suspended" | "rejected";
  is_active: boolean; offered_therapy_type_ids: string[] | null;
  reviewer_notes: string | null; reviewed_at: string | null; created_at: string;
};

type TherapyType = { id: string; name: string; is_privileged: boolean | null };

type Credential = {
  id: string; therapist_id: string; venue_id: string;
  privileged_therapy_type_ids: string[] | null;
  qualification: string | null;
  health_check_status: string | null;
  health_check_expiry: string | null;
  verified_at: string | null;
  is_active: boolean;
  credentials_note: string | null;
};

type Therapist = { id: string; full_name: string | null; city: string | null };

type QI = {
  id: string; venue_id: string | null; period_start: string; period_end: string;
  protocol_adherence_pct: number | null; complication_rate: number | null;
  avg_satisfaction_score: number | null; total_sessions: number | null;
  total_incidents: number | null; generated_at: string;
};

type AdverseEvent = {
  id: string; session_id: string; severity: string; description: string | null;
  resolved: boolean; created_at: string; root_cause: string | null;
  corrective_action: string | null; vaidya_notified_at: string | null;
};

type SessionRef = { id: string; venue_id: string | null; therapist_id: string | null; scheduled_date: string | null };

const daysTo = (d: string | null) => (d ? Math.ceil((new Date(d).getTime() - Date.now()) / 86400000) : null);

const SEVERITY_STYLE: Record<string, string> = {
  critical: "bg-destructive text-destructive-foreground",
  severe: "bg-destructive/80 text-destructive-foreground",
  moderate: "bg-amber-500 text-white",
  mild: "bg-yellow-400 text-yellow-950",
};

export default function AdminPanchakarmaDashboard() {
  const [uid, setUid] = useState<string | null>(null);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? null)); }, []);

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          Panchakarma Platform Admin
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage venues, therapist credentialing, and quality signals across every Panchakarma center.
        </p>
      </header>

      <Tabs defaultValue="venues">
        <TabsList className="mb-4 flex flex-wrap">
          <TabsTrigger value="venues"><Building2 className="h-4 w-4 mr-1.5" /> Venues</TabsTrigger>
          <TabsTrigger value="credentials"><Stethoscope className="h-4 w-4 mr-1.5" /> Credentialing</TabsTrigger>
          <TabsTrigger value="quality"><HeartPulse className="h-4 w-4 mr-1.5" /> Quality & Events</TabsTrigger>
        </TabsList>

        <TabsContent value="venues"><VenuesPanel uid={uid} /></TabsContent>
        <TabsContent value="credentials"><CredentialsPanel uid={uid} /></TabsContent>
        <TabsContent value="quality"><QualityPanel /></TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------------------------- Venues ---------------------------- */
function VenuesPanel({ uid }: { uid: string | null }) {
  const [loading, setLoading] = useState(true);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [confirm, setConfirm] = useState<{ venue: Venue; next: Venue["registration_status"] } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await sb.from("panchakarma_venues")
      .select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    const rows = (data ?? []) as Venue[];
    setVenues(rows);
    setNotes(Object.fromEntries(rows.map((r) => [r.id, r.reviewer_notes ?? ""])));
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const act = async (v: Venue, next: Venue["registration_status"]) => {
    if (!uid) return;
    const note = notes[v.id]?.trim() ?? "";
    if ((next === "rejected" || next === "suspended") && note.length < 10) {
      return toast.error(`Please add reviewer notes (≥10 chars) before ${next}.`);
    }
    setBusy(v.id);
    const patch: any = {
      registration_status: next,
      reviewer_notes: note || null,
      reviewed_by: uid,
      reviewed_at: new Date().toISOString(),
      is_active: next === "approved",
    };
    const { error } = await sb.from("panchakarma_venues").update(patch).eq("id", v.id);
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success(`Venue ${next}`);
    load();
  };

  const summary = useMemo(() => {
    const s = { pending: 0, approved: 0, suspended: 0, rejected: 0, expiringSoon: 0, expired: 0 };
    venues.forEach((v) => {
      s[v.registration_status] += 1;
      const d = daysTo(v.license_expiry);
      if (d !== null) {
        if (d < 0) s.expired += 1;
        else if (d <= 30) s.expiringSoon += 1;
      }
    });
    return s;
  }, [venues]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: "Pending", value: summary.pending, icon: CalendarClock },
          { label: "Approved", value: summary.approved, icon: CheckCircle2 },
          { label: "Suspended", value: summary.suspended, icon: ShieldAlert },
          { label: "Rejected", value: summary.rejected, icon: XCircle },
          { label: "Expiring ≤30d", value: summary.expiringSoon, icon: AlertTriangle },
          { label: "Expired", value: summary.expired, icon: AlertTriangle },
        ].map((s) => (
          <Card key={s.label}><CardContent className="p-3">
            <div className="text-xs text-muted-foreground flex items-center gap-1"><s.icon className="h-3.5 w-3.5" />{s.label}</div>
            <div className="text-2xl font-semibold">{s.value}</div>
          </CardContent></Card>
        ))}
      </div>

      <div className="space-y-3">
        {venues.map((v) => {
          const dte = daysTo(v.license_expiry);
          const expired = dte !== null && dte < 0;
          const soon = dte !== null && dte >= 0 && dte <= 30;
          return (
            <Card key={v.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <CardTitle className="text-base">{v.name}</CardTitle>
                    <CardDescription>
                      {[v.address, v.city].filter(Boolean).join(", ") || "No address"}
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{v.registration_status}</Badge>
                    <Badge variant={v.is_active ? "default" : "outline"}>{v.is_active ? "Active" : "Inactive"}</Badge>
                    {expired && <Badge variant="destructive">License expired</Badge>}
                    {soon && !expired && <Badge className="bg-amber-500 text-white">Expiring in {dte}d</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 md:grid-cols-3 text-sm">
                  <div><div className="text-xs uppercase text-muted-foreground">License #</div><div>{v.license_number || "—"}</div></div>
                  <div><div className="text-xs uppercase text-muted-foreground">Expiry</div><div className={expired ? "text-destructive" : ""}>{v.license_expiry ?? "—"}</div></div>
                  <div><div className="text-xs uppercase text-muted-foreground">Therapies</div><div>{v.offered_therapy_type_ids?.length ?? 0}</div></div>
                </div>
                <Separator />
                <Textarea
                  rows={2}
                  placeholder="Reviewer notes (required for suspend/reject)"
                  value={notes[v.id] ?? ""}
                  onChange={(e) => setNotes((n) => ({ ...n, [v.id]: e.target.value }))}
                />
                <div className="flex flex-wrap justify-end gap-2">
                  <Button variant="destructive" size="sm" onClick={() => setConfirm({ venue: v, next: "rejected" })} disabled={busy === v.id || v.registration_status === "rejected"}>
                    <XCircle className="h-4 w-4 mr-1" /> Reject
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setConfirm({ venue: v, next: "suspended" })} disabled={busy === v.id || v.registration_status === "suspended"}>
                    <ShieldAlert className="h-4 w-4 mr-1" /> Suspend
                  </Button>
                  <Button size="sm" onClick={() => setConfirm({ venue: v, next: "approved" })} disabled={busy === v.id || v.registration_status === "approved"}>
                    {busy === v.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
                    Approve & Activate
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {venues.length === 0 && <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">No venues yet.</CardContent></Card>}
      </div>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm?.next === "approved" && "Approve and activate venue?"}
              {confirm?.next === "suspended" && "Suspend this venue?"}
              {confirm?.next === "rejected" && "Reject this venue?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              <span className="block font-medium text-foreground">{confirm?.venue.name}</span>
              {confirm?.next === "approved" && "The venue owner will be able to onboard rooms and accept bookings immediately."}
              {confirm?.next === "suspended" && "All bookings and new sessions will be blocked until you re-approve. Reviewer notes will be sent to the owner."}
              {confirm?.next === "rejected" && "The registration will be closed. Reviewer notes will be sent to the owner."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async (e) => {
                e.preventDefault();
                if (!confirm) return;
                await act(confirm.venue, confirm.next);
                setConfirm(null);
              }}
              disabled={!!busy}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Confirm {confirm?.next}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ---------------------------- Credentials ---------------------------- */
function CredentialsPanel({ uid }: { uid: string | null }) {
  const [loading, setLoading] = useState(true);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [types, setTypes] = useState<TherapyType[]>([]);
  const [venueId, setVenueId] = useState<string>("");
  const [creds, setCreds] = useState<Credential[]>([]);
  const [therapists, setTherapists] = useState<Record<string, Therapist>>({});
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: v }, { data: t }] = await Promise.all([
        sb.from("panchakarma_venues").select("id,name,city,address,license_number,license_expiry,registration_status,is_active,offered_therapy_type_ids,reviewer_notes,reviewed_at,created_at").eq("registration_status", "approved").order("name"),
        sb.from("panchakarma_therapy_types").select("id,name,is_privileged").eq("is_active", true).order("name"),
      ]);
      setVenues((v ?? []) as Venue[]);
      setTypes((t ?? []) as TherapyType[]);
      if (v?.length && !venueId) setVenueId(v[0].id);
      setLoading(false);
    })();
  }, []);

  const loadCreds = useCallback(async (vid: string) => {
    if (!vid) return;
    const { data, error } = await sb.from("panchakarma_therapist_credentials")
      .select("*").eq("venue_id", vid).order("created_at", { ascending: false });
    if (error) return toast.error(error.message);
    const rows = (data ?? []) as Credential[];
    setCreds(rows);
    const ids = Array.from(new Set(rows.map((r) => r.therapist_id)));
    if (ids.length) {
      const { data: ts } = await sb.from("therapists").select("id,full_name,city").in("id", ids);
      const map: Record<string, Therapist> = {};
      (ts ?? []).forEach((t: Therapist) => (map[t.id] = t));
      setTherapists(map);
    } else setTherapists({});
  }, []);

  useEffect(() => { loadCreds(venueId); }, [venueId, loadCreds]);

  const togglePriv = async (c: Credential, typeId: string, checked: boolean) => {
    const current = new Set(c.privileged_therapy_type_ids ?? []);
    if (checked) current.add(typeId); else current.delete(typeId);
    setBusy(c.id);
    const { error } = await sb.from("panchakarma_therapist_credentials")
      .update({ privileged_therapy_type_ids: Array.from(current), verified_by: uid, verified_at: new Date().toISOString() })
      .eq("id", c.id);
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success(checked ? "Privilege granted" : "Privilege revoked");
    loadCreds(venueId);
  };

  const toggleActive = async (c: Credential) => {
    setBusy(c.id);
    const { error } = await sb.from("panchakarma_therapist_credentials")
      .update({ is_active: !c.is_active, verified_by: uid, verified_at: new Date().toISOString() })
      .eq("id", c.id);
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success(c.is_active ? "Credential deactivated" : "Credential reactivated");
    loadCreds(venueId);
  };

  const venueTypes = useMemo(() => {
    const v = venues.find((x) => x.id === venueId);
    const offered = new Set(v?.offered_therapy_type_ids ?? []);
    return types.filter((t) => offered.has(t.id));
  }, [venues, venueId, types]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (venues.length === 0) return <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">No approved venues yet.</CardContent></Card>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Select value={venueId} onValueChange={setVenueId}>
          <SelectTrigger className="w-[320px]"><SelectValue placeholder="Choose venue" /></SelectTrigger>
          <SelectContent>{venues.map((v) => <SelectItem key={v.id} value={v.id}>{v.name}{v.city ? ` — ${v.city}` : ""}</SelectItem>)}</SelectContent>
        </Select>
        <div className="text-xs text-muted-foreground">{venueTypes.length} therapy types offered</div>
      </div>

      {creds.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">No therapist credentials at this venue.</CardContent></Card>
      ) : creds.map((c) => {
        const t = therapists[c.therapist_id];
        const dte = daysTo(c.health_check_expiry);
        const hcExpired = dte !== null && dte < 0;
        const hcSoon = dte !== null && dte >= 0 && dte <= 30;
        return (
          <Card key={c.id}>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{t?.full_name || c.therapist_id.slice(0, 8)}</CardTitle>
                  <CardDescription>{c.qualification || "Qualification not recorded"}{t?.city ? ` · ${t.city}` : ""}</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={c.is_active ? "default" : "outline"}>{c.is_active ? "Active" : "Revoked"}</Badge>
                  {c.health_check_status && <Badge variant="secondary">Health: {c.health_check_status}</Badge>}
                  {hcExpired && <Badge variant="destructive">Health check expired</Badge>}
                  {hcSoon && !hcExpired && <Badge className="bg-amber-500 text-white">Health check due in {dte}d</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-muted-foreground">Privileged therapy types</div>
              {venueTypes.length === 0 ? (
                <div className="text-sm text-muted-foreground">Venue has no therapy types configured.</div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                  {venueTypes.map((tt) => {
                    const checked = (c.privileged_therapy_type_ids ?? []).includes(tt.id);
                    return (
                      <label key={tt.id} className="flex items-center gap-2 rounded border p-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={checked}
                          disabled={busy === c.id}
                          onCheckedChange={(v) => togglePriv(c, tt.id, !!v)}
                        />
                        <span className="flex-1">{tt.name}</span>
                        {tt.is_privileged && <Badge variant="outline" className="text-[10px]">privileged</Badge>}
                      </label>
                    );
                  })}
                </div>
              )}
              <div className="flex justify-end">
                <Button variant={c.is_active ? "outline" : "default"} size="sm" onClick={() => toggleActive(c)} disabled={busy === c.id}>
                  {c.is_active ? "Revoke credential" : "Reactivate credential"}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/* ---------------------------- Quality ---------------------------- */
function QualityPanel() {
  const [loading, setLoading] = useState(true);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [venueId, setVenueId] = useState<string>("all");
  const [qi, setQi] = useState<QI[]>([]);
  const [events, setEvents] = useState<AdverseEvent[]>([]);
  const [sessionMap, setSessionMap] = useState<Record<string, SessionRef>>({});
  const [severity, setSeverity] = useState<string>("all");
  const [unresolvedOnly, setUnresolvedOnly] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: v }, { data: q }, { data: e }] = await Promise.all([
        sb.from("panchakarma_venues").select("id,name,city,address,license_number,license_expiry,registration_status,is_active,offered_therapy_type_ids,reviewer_notes,reviewed_at,created_at").order("name"),
        sb.from("panchakarma_quality_indicators").select("*").order("period_end", { ascending: true }).limit(500),
        sb.from("panchakarma_adverse_events").select("*").order("created_at", { ascending: false }).limit(200),
      ]);
      setVenues((v ?? []) as Venue[]);
      setQi((q ?? []) as QI[]);
      const ae = (e ?? []) as AdverseEvent[];
      setEvents(ae);
      const sids = Array.from(new Set(ae.map((x) => x.session_id).filter(Boolean)));
      if (sids.length) {
        const { data: sess } = await sb.from("panchakarma_sessions").select("id,venue_id,therapist_id,scheduled_date").in("id", sids);
        const m: Record<string, SessionRef> = {};
        (sess ?? []).forEach((s: SessionRef) => (m[s.id] = s));
        setSessionMap(m);
      }
      setLoading(false);
    })();
  }, []);

  const venueName = (id: string | null) => venues.find((v) => v.id === id)?.name ?? "Unknown venue";

  const scopedQI = useMemo(() => {
    if (venueId === "all") return qi.filter((r) => r.venue_id === null);
    return qi.filter((r) => r.venue_id === venueId);
  }, [qi, venueId]);

  const chartData = useMemo(() =>
    scopedQI.map((r) => ({
      period: r.period_end,
      adherence: Number(r.protocol_adherence_pct ?? 0),
      complication: Number(r.complication_rate ?? 0),
      satisfaction: Number(r.avg_satisfaction_score ?? 0),
      sessions: r.total_sessions ?? 0,
      incidents: r.total_incidents ?? 0,
    })), [scopedQI]);

  const scopedEvents = useMemo(() => events.filter((e) => {
    if (severity !== "all" && e.severity !== severity) return false;
    if (unresolvedOnly && e.resolved) return false;
    if (venueId !== "all") {
      const s = sessionMap[e.session_id];
      if (!s || s.venue_id !== venueId) return false;
    }
    return true;
  }), [events, severity, unresolvedOnly, venueId, sessionMap]);

  const bySeverity = useMemo(() => {
    const c = { critical: 0, severe: 0, moderate: 0, mild: 0 } as Record<string, number>;
    scopedEvents.forEach((e) => { c[e.severity] = (c[e.severity] ?? 0) + 1; });
    return c;
  }, [scopedEvents]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={venueId} onValueChange={setVenueId}>
          <SelectTrigger className="w-[320px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Platform-wide (all venues)</SelectItem>
            {venues.map((v) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Protocol adherence & satisfaction</CardTitle></CardHeader>
          <CardContent className="h-64">
            {chartData.length === 0 ? <EmptyChart /> : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="period" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="adherence" stroke="hsl(var(--primary))" name="Adherence %" />
                  <Line type="monotone" dataKey="satisfaction" stroke="#22c55e" name="Satisfaction" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Sessions vs. incidents</CardTitle></CardHeader>
          <CardContent className="h-64">
            {chartData.length === 0 ? <EmptyChart /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="period" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sessions" fill="hsl(var(--primary))" name="Sessions" />
                  <Bar dataKey="incidents" fill="hsl(var(--destructive))" name="Incidents" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Adverse events</CardTitle>
              <CardDescription>Grouped by severity — resolve underlying sessions via the Vaidya queue.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["critical","severe","moderate","mild"] as const).map((s) => (
                <Badge key={s} className={SEVERITY_STYLE[s]}>{s}: {bySeverity[s] ?? 0}</Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="mild">Mild</SelectItem>
              </SelectContent>
            </Select>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={unresolvedOnly} onCheckedChange={(v) => setUnresolvedOnly(!!v)} />
              Unresolved only
            </label>
          </div>

          {scopedEvents.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No adverse events match the filters.</div>
          ) : (
            <div className="space-y-2">
              {scopedEvents.map((e) => {
                const s = sessionMap[e.session_id];
                return (
                  <div key={e.id} className="rounded-lg border p-3 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge className={SEVERITY_STYLE[e.severity] ?? ""}>{e.severity}</Badge>
                        <Badge variant={e.resolved ? "default" : "outline"}>{e.resolved ? "resolved" : "open"}</Badge>
                        <span className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Venue: {venueName(s?.venue_id ?? null)}
                      </div>
                    </div>
                    <div className="text-sm">{e.description || <span className="italic text-muted-foreground">No description</span>}</div>
                    {(e.root_cause || e.corrective_action) && (
                      <div className="text-xs text-muted-foreground">
                        {e.root_cause && <div><b>Root cause:</b> {e.root_cause}</div>}
                        {e.corrective_action && <div><b>Corrective action:</b> {e.corrective_action}</div>}
                      </div>
                    )}
                    <div className="pt-1">
                      <Button asChild variant="link" size="sm" className="h-6 px-0 text-xs">
                        <Link to="/vaidya/panchakarma/adverse-events">Open Vaidya adverse-event queue →</Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyChart() {
  return <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No quality indicators for this scope yet.</div>;
}
