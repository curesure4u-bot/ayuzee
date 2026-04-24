import { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, ExternalLink, Loader2, Radio, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Webinar = {
  id: string;
  title: string;
  description: string | null;
  speaker_name: string | null;
  scheduled_at: string;
  duration_minutes: number | null;
  category: string | null;
  max_attendees?: number | null;
  rsvp_count?: number | null;
  join_url?: string | null;
  recording_url?: string | null;
  cover_image_url?: string | null;
};

const StudentWebinars = () => {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [upcoming, setUpcoming] = useState<Webinar[]>([]);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [recordings, setRecordings] = useState<Webinar[]>([]);
  const [rsvpIds, setRsvpIds] = useState<Set<string>>(new Set());
  const now = useMemo(() => new Date(), [loading]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData.session?.user.id ?? null;
    setUserId(uid);
    setEmail(sessionData.session?.user.email ?? null);

    const [upcomingRes, recordingRes, rsvpRes] = await Promise.all([
      supabase.from("webinars").select("*").eq("is_published", true).gt("scheduled_at", new Date().toISOString()).order("scheduled_at", { ascending: true }),
      supabase.from("webinars").select("*").eq("is_published", true).lt("scheduled_at", new Date().toISOString()).not("recording_url", "is", null).order("scheduled_at", { ascending: false }),
      uid ? supabase.from("webinar_rsvps").select("id, webinar_id, webinars(*)").eq("user_id", uid).order("created_at", { ascending: false }) : Promise.resolve({ data: [] }),
    ]);

    setUpcoming((upcomingRes.data ?? []) as Webinar[]);
    setRecordings((recordingRes.data ?? []) as Webinar[]);
    setRsvps(rsvpRes.data ?? []);
    setRsvpIds(new Set((rsvpRes.data ?? []).map((item: any) => item.webinar_id)));
    setLoading(false);
  };

  const rsvp = async (webinar: Webinar) => {
    if (!userId) return;
    if (rsvpIds.has(webinar.id)) {
      toast.info("You are already registered.");
      return;
    }
    const { error } = await supabase.from("webinar_rsvps").insert({ webinar_id: webinar.id, user_id: userId, email });
    if (error) { toast.error(error.message); return; }
    toast.success("You're registered!");
    load();
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-3xl">Webinars & CME</h1><p className="mt-2 text-muted-foreground">Attend live expert sessions and revisit past recordings.</p></div>
      <Tabs defaultValue="upcoming" className="space-y-5">
        <TabsList className="grid h-auto w-full grid-cols-3"><TabsTrigger value="upcoming">Upcoming</TabsTrigger><TabsTrigger value="rsvps">My RSVPs</TabsTrigger><TabsTrigger value="recordings">Past Recordings</TabsTrigger></TabsList>
        <TabsContent value="upcoming"><WebinarGrid webinars={upcoming} action={(webinar) => <Button onClick={() => rsvp(webinar)} variant={rsvpIds.has(webinar.id) ? "outline" : "hero"}>{rsvpIds.has(webinar.id) ? "Registered" : "RSVP"}</Button>} now={now} /></TabsContent>
        <TabsContent value="rsvps">{rsvps.length === 0 ? <Empty text="Your webinar RSVPs will appear here." /> : <div className="grid gap-5 lg:grid-cols-2">{rsvps.map((item) => <RsvpCard key={item.id} webinar={item.webinars} />)}</div>}</TabsContent>
        <TabsContent value="recordings"><WebinarGrid webinars={recordings} action={(webinar) => <Button asChild><a href={webinar.recording_url || "#"} target="_blank" rel="noopener noreferrer">Watch Recording <ExternalLink className="h-4 w-4" /></a></Button>} now={now} /></TabsContent>
      </Tabs>
    </div>
  );
};

const WebinarGrid = ({ webinars, action, now }: { webinars: Webinar[]; action: (webinar: Webinar) => React.ReactNode; now: Date }) => {
  if (webinars.length === 0) return <Empty text="No webinars found." />;
  return <div className="grid gap-5 lg:grid-cols-2">{webinars.map((webinar) => <WebinarCard key={webinar.id} webinar={webinar} action={action(webinar)} now={now} />)}</div>;
};

const WebinarCard = ({ webinar, action, now }: { webinar: Webinar; action: React.ReactNode; now: Date }) => {
  const start = new Date(webinar.scheduled_at);
  const diffMs = start.getTime() - now.getTime();
  const within24 = diffMs > 0 && diffMs <= 24 * 60 * 60 * 1000;
  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.max(0, Math.floor((diffMs % 3600000) / 60000));
  const seats = Math.max(0, Number(webinar.max_attendees ?? 100) - Number(webinar.rsvp_count ?? 0));

  return <Card className="overflow-hidden"><CardContent className="p-5"><div className="flex flex-wrap gap-2"><Badge variant="outline">{webinar.category || "CME"}</Badge>{within24 && <Badge>Starts in {hours}h {minutes}m</Badge>}</div><h3 className="mt-3 font-display text-xl">{webinar.title}</h3>{webinar.speaker_name && <p className="mt-1 text-sm text-muted-foreground">Speaker: {webinar.speaker_name}</p>}<div className="mt-4 grid gap-2 text-sm text-muted-foreground"><span className="flex items-center gap-2"><Calendar className="h-4 w-4" />{start.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span><span className="flex items-center gap-2"><Clock className="h-4 w-4" />{webinar.duration_minutes || 60} min</span><span className="flex items-center gap-2"><Users className="h-4 w-4" />{seats} seats available</span></div><div className="mt-5">{action}</div></CardContent></Card>;
};

const RsvpCard = ({ webinar }: { webinar: Webinar }) => {
  if (!webinar) return null;
  const start = new Date(webinar.scheduled_at);
  const live = Math.abs(start.getTime() - Date.now()) <= 15 * 60 * 1000;
  return <Card><CardContent className="p-5"><Badge variant="outline">RSVP Confirmed</Badge><h3 className="mt-3 font-display text-xl">{webinar.title}</h3><p className="mt-2 text-sm text-muted-foreground">{start.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p><Button asChild disabled={!live || !webinar.join_url} className="mt-5"><a href={webinar.join_url || "#"} target="_blank" rel="noopener noreferrer">{live ? "Join Live" : "Join link opens near start"}</a></Button></CardContent></Card>;
};

const Empty = ({ text }: { text: string }) => <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-10 text-center text-muted-foreground"><Radio className="mx-auto mb-3 h-8 w-8 text-primary/50" />{text}</div>;
const Loading = () => <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;

export default StudentWebinars;
