import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Loader2, MapPin, Pill, Navigation, CheckCircle2, PlayCircle, StopCircle } from "lucide-react";
import type { TherapistContext } from "./TherapistLayout";

interface Session {
  id: string;
  patient_name: string;
  patient_phone: string | null;
  therapy_code: string;
  therapy_name: string;
  scheduled_date: string;
  scheduled_start: string;
  scheduled_duration_minutes: number;
  status: string;
  medicines_prescribed: any;
  actual_start_time: string | null;
  total_amount: number;
  therapist_earnings: number;
  venue?: { name: string; address_line1: string; city: string } | null;
}

const TABS = [
  { key: "upcoming", label: "Upcoming", statuses: ["scheduled", "therapist_assigned", "therapist_en_route", "therapist_arrived"] },
  { key: "in_progress", label: "In Progress", statuses: ["in_progress"] },
  { key: "completed", label: "Completed", statuses: ["completed"] },
  { key: "cancelled", label: "Cancelled", statuses: ["cancelled", "no_show"] },
] as const;

const privacyName = (n: string) => {
  const parts = n.trim().split(" ");
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
};

const TherapistSessions = () => {
  const { therapist } = useOutletContext<TherapistContext>();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [endingSession, setEndingSession] = useState<Session | null>(null);
  const [endNotes, setEndNotes] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("therapy_sessions")
      .select("id, patient_name, patient_phone, therapy_code, therapy_name, scheduled_date, scheduled_start, scheduled_duration_minutes, status, medicines_prescribed, actual_start_time, total_amount, therapist_earnings, therapy_venues(name, address_line1, city)")
      .eq("therapist_id", therapist.id)
      .order("scheduled_date", { ascending: false }).order("scheduled_start", { ascending: false });
    const mapped = (data ?? []).map((s: any) => ({ ...s, venue: s.therapy_venues ?? null }));
    setSessions(mapped as Session[]);
    setLoading(false);
  };

  useEffect(() => {
    document.title = "My Sessions | Therapist | Ayuzee";
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [therapist.id]);

  const getCoords = (): Promise<{ lat: number; lng: number } | null> => new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 8000 }
    );
  });

  const updateStatus = async (id: string, patch: Record<string, unknown>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("therapy_sessions") as any).update(patch).eq("id", id);
    if (error) return toast({ title: "Update failed", description: error.message, variant: "destructive" });
    load();
  };

  const onEnRoute = async (s: Session) => {
    const c = await getCoords();
    await updateStatus(s.id, { status: "therapist_en_route" });
    if (c) await supabase.from("therapist_location_pings").insert({ therapist_id: therapist.id, session_id: s.id, lat: c.lat, lng: c.lng });
    toast({ title: "On your way", description: "Patient and doctor have been notified." });
  };

  const onArrived = async (s: Session) => {
    const c = await getCoords();
    await updateStatus(s.id, { status: "therapist_arrived", therapist_checkin_lat: c?.lat ?? null, therapist_checkin_lng: c?.lng ?? null });
    toast({ title: "Arrival recorded" });
  };

  const onStart = async (s: Session) => {
    await updateStatus(s.id, { status: "in_progress", actual_start_time: new Date().toISOString() });
    toast({ title: "Session started" });
  };

  const submitEnd = async () => {
    if (!endingSession) return;
    const c = await getCoords();
    const startedAt = endingSession.actual_start_time ? new Date(endingSession.actual_start_time).getTime() : Date.now();
    const duration = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
    await updateStatus(endingSession.id, {
      status: "completed",
      actual_end_time: new Date().toISOString(),
      actual_duration_minutes: duration,
      therapist_checkout_lat: c?.lat ?? null,
      therapist_checkout_lng: c?.lng ?? null,
      therapist_notes: endNotes || null,
    });
    // Trigger settlement (idempotent on the server). Don't block UX on errors.
    supabase.functions.invoke("settle-therapy-session", { body: { session_id: endingSession.id } })
      .catch((err) => console.warn("settle invoke failed", err));
    setEndingSession(null);
    setEndNotes("");
    toast({ title: "Session completed", description: `Duration: ${duration} min` });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Sessions</h1>
      <Tabs defaultValue="upcoming">
        <TabsList>
          {TABS.map(t => <TabsTrigger key={t.key} value={t.key}>{t.label}</TabsTrigger>)}
        </TabsList>
        {TABS.map(tab => {
          const list = sessions.filter(s => (tab.statuses as readonly string[]).includes(s.status));
          return (
            <TabsContent key={tab.key} value={tab.key} className="space-y-3 mt-4">
              {loading ? (
                <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : list.length === 0 ? (
                <Card><CardContent className="p-10 text-center text-muted-foreground">No {tab.label.toLowerCase()} sessions.</CardContent></Card>
              ) : list.map(s => (
                <SessionCard key={s.id} s={s} onEnRoute={onEnRoute} onArrived={onArrived} onStart={onStart} onEnd={(sess) => setEndingSession(sess)} />
              ))}
            </TabsContent>
          );
        })}
      </Tabs>

      <Dialog open={!!endingSession} onOpenChange={(o) => !o && setEndingSession(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>End session</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Add any notes about this session for the doctor's records.</p>
            <Textarea rows={5} placeholder="Patient response, observations, after-care advice…" value={endNotes} onChange={(e) => setEndNotes(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEndingSession(null)}>Cancel</Button>
            <Button onClick={submitEnd}>Complete session</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const SessionCard = ({ s, onEnRoute, onArrived, onStart, onEnd }: { s: Session; onEnRoute: (s: Session) => void; onArrived: (s: Session) => void; onStart: (s: Session) => void; onEnd: (s: Session) => void; }) => {
  const meds = Array.isArray(s.medicines_prescribed) ? s.medicines_prescribed : [];
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold">{privacyName(s.patient_name)}</h3>
              <Badge variant="secondary" className="text-[10px]">{s.therapy_code}</Badge>
              <Badge className="text-[10px]">{s.status.replace(/_/g, " ")}</Badge>
            </div>
            <div className="text-sm text-muted-foreground mt-1">{s.therapy_name}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.scheduled_date} at {s.scheduled_start.slice(0, 5)} · {s.scheduled_duration_minutes} min</div>
            {s.venue && (
              <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" />{s.venue.name} — {s.venue.address_line1}, {s.venue.city}</div>
            )}
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <div className="font-semibold text-foreground">₹{Number(s.therapist_earnings || 0).toLocaleString("en-IN")}</div>
            <div>your earnings</div>
          </div>
        </div>

        {meds.length > 0 && (
          <div className="mt-3 p-3 rounded-lg bg-muted/40">
            <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-1.5"><Pill className="h-3 w-3" />Prescribed medicines</div>
            <ul className="text-sm space-y-0.5">
              {meds.map((m: any, i: number) => <li key={i}>• {m.name} {m.qty ? `× ${m.qty}` : ""} {m.unit ?? ""}</li>)}
            </ul>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {s.status === "scheduled" || s.status === "therapist_assigned" ? (
            <Button size="sm" onClick={() => onEnRoute(s)}><Navigation className="h-4 w-4 mr-1" />I'm on my way</Button>
          ) : null}
          {s.status === "therapist_en_route" && (
            <Button size="sm" onClick={() => onArrived(s)}><CheckCircle2 className="h-4 w-4 mr-1" />I've arrived</Button>
          )}
          {s.status === "therapist_arrived" && (
            <Button size="sm" onClick={() => onStart(s)}><PlayCircle className="h-4 w-4 mr-1" />Start session</Button>
          )}
          {s.status === "in_progress" && (
            <Button size="sm" variant="destructive" onClick={() => onEnd(s)}><StopCircle className="h-4 w-4 mr-1" />End session</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TherapistSessions;
