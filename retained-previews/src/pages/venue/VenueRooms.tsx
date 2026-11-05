import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import type { VenueContext } from "./VenueLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, CalendarOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Room { room_name: string; capacity: number; hourly_rate: number }
interface UnavailRow { id: string; room_name: string; unavailable_date: string }
interface BookingRow { id: string; scheduled_date: string; scheduled_start: string; venue_room: string | null; therapy_name: string; patient_name: string }

const VenueRooms = () => {
  const { venue } = useOutletContext<VenueContext>();
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [unavail, setUnavail] = useState<UnavailRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [saving, setSaving] = useState(false);

  // build current week (today + next 6 days)
  const week = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  }), []);

  const reload = async () => {
    const [{ data: v }, { data: u }, { data: b }] = await Promise.all([
      supabase.from("therapy_venues").select("rooms").eq("id", venue.id).maybeSingle(),
      supabase.from("room_unavailability").select("id, room_name, unavailable_date").eq("venue_id", venue.id),
      supabase.from("therapy_sessions").select("id, scheduled_date, scheduled_start, venue_room, therapy_name, patient_name").eq("venue_id", venue.id).gte("scheduled_date", week[0]).lte("scheduled_date", week[6]),
    ]);
    setRooms(((v?.rooms as unknown as Room[]) ?? []) || []);
    setUnavail((u ?? []) as UnavailRow[]);
    setBookings((b ?? []) as BookingRow[]);
    setLoading(false);
  };

  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [venue.id]);

  const isUnavailable = (room: string, date: string) =>
    unavail.find(x => x.room_name === room && x.unavailable_date === date);

  const toggleDate = async (room: string, date: string) => {
    const existing = isUnavailable(room, date);
    if (existing) {
      const { error } = await supabase.from("room_unavailability").delete().eq("id", existing.id);
      if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    } else {
      const { error } = await supabase.from("room_unavailability").insert({ venue_id: venue.id, room_name: room, unavailable_date: date });
      if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    }
    reload();
  };

  const saveRates = async () => {
    setSaving(true);
    const { error } = await supabase.from("therapy_venues").update({ rooms: rooms as unknown as never }).eq("id", venue.id);
    setSaving(false);
    if (error) return toast({ title: "Save failed", description: error.message, variant: "destructive" });
    toast({ title: "Rates saved" });
  };

  if (loading) return <div className="min-h-[40vh] grid place-items-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">My Rooms</h1>
          <p className="text-muted-foreground">Manage rates, availability, and view weekly bookings.</p>
        </div>
        <Button onClick={saveRates} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}Save rates</Button>
      </div>

      {rooms.length === 0 && <Card><CardContent className="p-6 text-sm text-muted-foreground">No rooms yet — add some during onboarding.</CardContent></Card>}

      {rooms.map((room, i) => {
        const roomBookings = bookings.filter(b => b.venue_room === room.room_name);
        return (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <CardTitle className="text-lg">{room.room_name}</CardTitle>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Capacity:</span>
                  <span className="font-medium">{room.capacity}</span>
                  <span className="text-muted-foreground ml-3">Hourly rate ₹</span>
                  <Input type="number" className="w-24 h-8" value={room.hourly_rate} onChange={e => {
                    const c = [...rooms]; c[i].hourly_rate = Number(e.target.value); setRooms(c);
                  }} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {week.map(date => {
                  const blocked = isUnavailable(room.room_name, date);
                  const dayBookings = roomBookings.filter(b => b.scheduled_date === date);
                  const d = new Date(date);
                  return (
                    <div key={date} className={`rounded-lg border p-2 text-xs min-h-[100px] ${blocked ? "bg-destructive/10 border-destructive/30" : "bg-muted/20"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <div className="font-medium">{d.toLocaleDateString("en-IN", { weekday: "short" })}</div>
                          <div className="text-muted-foreground">{d.getDate()}/{d.getMonth() + 1}</div>
                        </div>
                        <Switch checked={!blocked} onCheckedChange={() => toggleDate(room.room_name, date)} />
                      </div>
                      {blocked ? (
                        <div className="text-destructive flex items-center gap-1 mt-2"><CalendarOff className="h-3 w-3" />Blocked</div>
                      ) : dayBookings.length === 0 ? (
                        <div className="text-muted-foreground italic mt-2">Free</div>
                      ) : (
                        <ul className="space-y-1 mt-1">
                          {dayBookings.slice(0, 3).map(b => (
                            <li key={b.id} className="bg-primary/10 text-primary rounded px-1 py-0.5 truncate" title={`${b.scheduled_start} ${b.therapy_name} — ${b.patient_name}`}>
                              {b.scheduled_start.slice(0, 5)} {b.therapy_name}
                            </li>
                          ))}
                          {dayBookings.length > 3 && <li className="text-muted-foreground">+{dayBookings.length - 3} more</li>}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default VenueRooms;
