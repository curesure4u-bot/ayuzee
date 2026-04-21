import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ExternalLink, Loader2, Users, Video } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Webinars = () => {
  const navigate = useNavigate();
  const [webinars, setWebinars] = useState<any[]>([]);
  const [rsvps, setRsvps] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data: w } = await supabase.from("webinars").select("*").eq("is_published", true).order("scheduled_at", { ascending: true });
    setWebinars(w ?? []);
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id ?? null;
    setUserId(uid);
    if (uid) {
      const { data: r } = await supabase.from("webinar_rsvps").select("webinar_id").eq("user_id", uid);
      setRsvps(new Set((r ?? []).map((x: any) => x.webinar_id)));
    }
    setLoading(false);
  };

  const rsvp = async (id: string) => {
    if (!userId) { toast.info("Sign in to RSVP"); navigate("/auth"); return; }
    if (rsvps.has(id)) {
      await supabase.from("webinar_rsvps").delete().eq("webinar_id", id).eq("user_id", userId);
      const next = new Set(rsvps); next.delete(id); setRsvps(next);
      toast.success("RSVP cancelled");
    } else {
      const { data: sess } = await supabase.auth.getSession();
      await supabase.from("webinar_rsvps").insert({ webinar_id: id, user_id: userId, email: sess.session?.user.email });
      const next = new Set(rsvps); next.add(id); setRsvps(next);
      toast.success("You're registered!");
    }
    load();
  };

  if (loading) return <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (webinars.length === 0) return <Card className="p-12 text-center"><Video className="mx-auto h-10 w-10 text-muted-foreground" /><p className="mt-4 text-muted-foreground">No webinars scheduled.</p></Card>;

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {webinars.map((w) => {
        const isPast = new Date(w.scheduled_at) < new Date();
        const registered = rsvps.has(w.id);
        return (
          <Card key={w.id} className="overflow-hidden">
            {w.cover_image_url && <img src={w.cover_image_url} alt={w.title} className="aspect-video w-full object-cover" />}
            <div className="p-5">
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded-full bg-accent px-2 py-0.5 font-semibold text-primary">{w.category}</span>
                {isPast && <span className="rounded-full bg-muted px-2 py-0.5 font-semibold text-muted-foreground">Ended</span>}
              </div>
              <h3 className="mt-3 font-display text-xl leading-tight">{w.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{w.description}</p>
              <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                <p><strong className="text-foreground">Speaker:</strong> {w.speaker_name}</p>
                <p className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date(w.scheduled_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
                <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {w.duration_minutes} min</p>
                <p className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {w.rsvp_count} registered</p>
              </div>
              <div className="mt-5 flex gap-2">
                {isPast && w.recording_url ? (
                  <Button asChild variant="hero" className="flex-1"><a href={w.recording_url} target="_blank" rel="noopener noreferrer">Watch replay <ExternalLink className="h-3.5 w-3.5" /></a></Button>
                ) : isPast ? (
                  <Button disabled variant="outline" className="flex-1">Recording coming soon</Button>
                ) : (
                  <>
                    <Button onClick={() => rsvp(w.id)} variant={registered ? "outline" : "hero"} className="flex-1">{registered ? "Cancel RSVP" : "Register"}</Button>
                    {registered && <Button asChild variant="hero" className="flex-1"><a href={w.join_url} target="_blank" rel="noopener noreferrer">Join <ExternalLink className="h-3.5 w-3.5" /></a></Button>}
                  </>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default Webinars;
