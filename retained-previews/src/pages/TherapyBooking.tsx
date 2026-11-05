import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Loader2, MapPin, Star, Clock, Check, ShoppingBag, CreditCard, User, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { SiteNav } from "@/components/site/SiteNav";

const loadRazorpay = () =>
  new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

// Haversine distance in km
const distanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const HOURLY_SLOTS = Array.from({ length: 11 }, (_, i) => `${String(8 + i).padStart(2, "0")}:00`);

const TherapyBooking = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [doctor, setDoctor] = useState<any>(null);
  const [venues, setVenues] = useState<any[]>([]);
  const [therapists, setTherapists] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);

  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  const [selectedRoom, setSelectedRoom] = useState<{ name: string; rate: number } | null>(null);
  const [selectedTherapist, setSelectedTherapist] = useState<any>(null);
  const [genderFilter, setGenderFilter] = useState<string>("any");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [paying, setPaying] = useState(false);

  // Load session + doctor
  useEffect(() => {
    (async () => {
      if (!sessionId) return;
      const { data: sess, error } = await supabase
        .from("therapy_sessions")
        .select("*")
        .eq("id", sessionId)
        .maybeSingle();
      if (error || !sess) {
        toast.error("Session not found");
        setLoading(false);
        return;
      }
      setSession(sess);
      setDate(sess.scheduled_date || new Date().toISOString().slice(0, 10));

      if (sess.doctor_user_id) {
        const { data: doc } = await supabase
          .from("doctors")
          .select("full_name, avatar_url, specialization")
          .eq("user_id", sess.doctor_user_id)
          .maybeSingle();
        setDoctor(doc);
      }
      setLoading(false);
    })();
  }, [sessionId]);

  // Geolocation
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {/* silently ignore */},
      { timeout: 5000 },
    );
  }, []);

  // Load venues + therapists for the therapy_code
  useEffect(() => {
    (async () => {
      if (!session?.therapy_code) return;
      const [{ data: vs }, { data: ts }] = await Promise.all([
        supabase
          .from("therapy_venues")
          .select("*")
          .eq("is_verified", true)
          .contains("available_therapies", [session.therapy_code]),
        supabase
          .from("therapists")
          .select("*")
          .eq("is_verified", true)
          .eq("is_available", true)
          .contains("allowed_therapies", [session.therapy_code]),
      ]);
      setVenues(vs ?? []);
      setTherapists(ts ?? []);
    })();
  }, [session?.therapy_code]);

  // Load therapist availability + booked slots when therapist+date chosen
  useEffect(() => {
    (async () => {
      if (!selectedTherapist?.id || !date) {
        setAvailability([]);
        setBookedSlots([]);
        return;
      }
      const weekday = new Date(date).getDay();
      const [{ data: avail }, { data: booked }] = await Promise.all([
        supabase
          .from("therapist_availability")
          .select("*")
          .eq("therapist_id", selectedTherapist.id)
          .eq("weekday", weekday)
          .eq("is_active", true),
        supabase
          .from("therapy_sessions")
          .select("scheduled_start")
          .eq("therapist_id", selectedTherapist.id)
          .eq("scheduled_date", date)
          .in("status", ["therapist_assigned", "therapist_en_route", "therapist_arrived", "in_progress"]),
      ]);
      setAvailability(avail ?? []);
      setBookedSlots((booked ?? []).map((b: any) => (b.scheduled_start || "").slice(0, 5)));
      setTime("");
    })();
  }, [selectedTherapist?.id, date]);

  const sortedVenues = useMemo(() => {
    if (!userPos) return venues;
    return [...venues]
      .map((v) => ({
        ...v,
        _distance: v.latitude && v.longitude
          ? distanceKm(userPos.lat, userPos.lng, v.latitude, v.longitude)
          : Infinity,
      }))
      .sort((a, b) => a._distance - b._distance);
  }, [venues, userPos]);

  const filteredTherapists = useMemo(
    () => therapists.filter((t) => genderFilter === "any" ? true : t.gender === genderFilter),
    [therapists, genderFilter],
  );

  const durationMin = session?.duration_minutes || session?.scheduled_duration_minutes || 60;
  const therapyFee = selectedRoom ? Math.round(selectedRoom.rate * (durationMin / 60)) : 0;
  const platformFee = Math.round(therapyFee * 0.10);
  const total = therapyFee + platformFee;

  const isSlotAvailable = (slot: string) => {
    if (bookedSlots.includes(slot)) return false;
    if (availability.length === 0) return true; // no schedule set => allow all
    return availability.some((a) => slot >= (a.start_time || "").slice(0, 5) && slot < (a.end_time || "").slice(0, 5));
  };

  const medicines: any[] = useMemo(() => {
    const a = session?.medicines_prescribed;
    const b = session?.prescribed_medicines;
    const arr = Array.isArray(a) ? a : Array.isArray(b) ? b : [];
    return arr;
  }, [session]);

  const addMedicinesToCart = () => {
    if (medicines.length === 0) return;
    medicines.forEach((m) => {
      addItem({
        id: m.product_id || m.id,
        name: m.name || m.product_name,
        brand: m.brand || "",
        unit: m.unit || null,
        price: Number(m.price ?? m.unit_price ?? 0),
      }, Number(m.quantity ?? 1));
    });
    toast.success(`${medicines.length} medicine(s) added to cart`);
  };

  const sendNotifications = async (paidSession: any) => {
    const venueName = selectedVenue?.name;
    const venueAddr = `${selectedVenue?.address ?? ""}, ${selectedVenue?.city ?? ""}`;
    const therapistName = selectedTherapist?.full_name;
    const patientFirst = (paidSession.patient_name || "Patient").split(" ")[0];
    const when = `${paidSession.scheduled_date} at ${paidSession.scheduled_start}`;

    const calls = [
      paidSession.patient_phone && supabase.functions.invoke("send-whatsapp", {
        body: {
          to: paidSession.patient_phone,
          message: `Your ${paidSession.therapy_name} session is confirmed for ${when} at ${venueName}. Therapist: ${therapistName}. Your medicines will be shipped.`,
        },
      }),
      selectedTherapist?.phone && supabase.functions.invoke("send-whatsapp", {
        body: {
          to: selectedTherapist.phone,
          message: `New session assigned: ${paidSession.therapy_name} for patient ${patientFirst} on ${when} at ${venueName} (${venueAddr}). Open Ayuzee to confirm.`,
        },
      }),
      selectedVenue?.phone && supabase.functions.invoke("send-whatsapp", {
        body: {
          to: selectedVenue.phone,
          message: `New booking: ${paidSession.therapy_name} in ${selectedRoom?.name} on ${when}. Therapist: ${therapistName}.`,
        },
      }),
    ].filter(Boolean);

    await Promise.allSettled(calls);
  };

  const handlePay = async () => {
    if (!selectedVenue || !selectedRoom) return toast.error("Choose a venue & room");
    if (!selectedTherapist) return toast.error("Choose a therapist");
    if (!date || !time) return toast.error("Choose date & time");

    setPaying(true);
    try {
      const startH = parseInt(time.slice(0, 2), 10);
      const endH = startH + Math.ceil(durationMin / 60);
      const scheduled_end = `${String(endH).padStart(2, "0")}:00`;

      // Stage assignment + amounts on the session row
      const therapist_earnings = Math.round(therapyFee * 0.7);
      const venue_earnings = Math.round(therapyFee * 0.2);
      const doctor_referral_fee = therapyFee - therapist_earnings - venue_earnings;

      const { error: updErr } = await supabase
        .from("therapy_sessions")
        .update({
          therapist_id: selectedTherapist.id,
          venue_id: selectedVenue.id,
          venue_room: selectedRoom.name,
          scheduled_date: date,
          scheduled_start: `${time}:00`,
          scheduled_end: `${scheduled_end}:00`,
          duration_minutes: durationMin,
          total_amount: total,
          platform_fee: platformFee,
          therapist_earnings,
          venue_earnings,
          doctor_referral_fee,
        })
        .eq("id", sessionId!);
      if (updErr) throw updErr;

      const ok = await loadRazorpay();
      if (!ok) throw new Error("Could not load Razorpay");

      const { data: rzp, error: rzpErr } = await supabase.functions.invoke("razorpay-create-order", {
        body: { order_id: sessionId, kind: "therapy_session" },
      });
      if (rzpErr || !rzp?.razorpay_order_id) throw new Error(rzpErr?.message || "Payment init failed");

      const rz = new window.Razorpay({
        key: rzp.key_id,
        amount: rzp.amount,
        currency: rzp.currency,
        order_id: rzp.razorpay_order_id,
        name: "Ayuzee",
        description: session.therapy_name,
        prefill: { name: session.patient_name, contact: session.patient_phone || "" },
        theme: { color: "#16a34a" },
        handler: async (resp: any) => {
          const { error: vErr } = await supabase.functions.invoke("razorpay-verify-payment", {
            body: {
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
              internal_id: sessionId,
              kind: "therapy_session",
            },
          });
          if (vErr) { toast.error("Payment verification failed"); return; }
          toast.success("Booking confirmed! 🌿");
          // Re-load and notify
          const { data: paid } = await supabase.from("therapy_sessions").select("*").eq("id", sessionId!).maybeSingle();
          if (paid) await sendNotifications(paid);
          navigate("/dashboard");
        },
        modal: { ondismiss: () => { setPaying(false); toast.info("Payment cancelled"); } },
      });
      rz.open();
    } catch (e: any) {
      toast.error(e?.message ?? "Could not start payment");
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="container py-20 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }
  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="container py-20 text-center text-muted-foreground">Session not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="container max-w-5xl space-y-6 py-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Back
        </Button>

        {/* Section 1: Prescribed therapy */}
        <Card className="bg-gradient-to-br from-primary/5 to-transparent p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Your prescribed therapy</p>
          <h1 className="mt-1 font-display text-2xl">{session.therapy_name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <Badge>{session.therapy_code}</Badge>
            <span className="flex items-center gap-1 text-muted-foreground"><Clock className="h-3.5 w-3.5" />{durationMin} min</span>
            {doctor && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <User className="h-3.5 w-3.5" /> Prescribed by Dr. {doctor.full_name}
              </span>
            )}
            <span className="text-muted-foreground">
              Session {session.session_number} of {session.total_sessions_in_plan}
            </span>
          </div>
        </Card>

        {/* Section 2: Choose venue */}
        <Card className="p-6">
          <h2 className="font-display text-lg">Choose a nearby venue</h2>
          {!userPos && (
            <p className="mt-1 text-xs text-muted-foreground">Enable location to sort by distance.</p>
          )}
          {sortedVenues.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No verified venues offer this therapy yet.</p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {sortedVenues.map((v) => {
                const rooms = Array.isArray(v.rooms) ? v.rooms : [];
                const isSelected = selectedVenue?.id === v.id;
                return (
                  <Card key={v.id} className={`p-4 transition ${isSelected ? "border-primary ring-2 ring-primary/30" : ""}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{v.name}</p>
                        <p className="text-xs capitalize text-muted-foreground">{(v.venue_type || "").replace("_", " ")}</p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {v.city}
                          {v._distance !== Infinity && ` · ${v._distance.toFixed(1)} km`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs"><Star className="h-3 w-3 fill-current text-amber-500" />{Number(v.rating || 0).toFixed(1)}</div>
                    </div>
                    <div className="mt-3 space-y-1">
                      {rooms.length === 0 && (
                        <Button
                          size="sm"
                          variant={isSelected ? "default" : "outline"}
                          className="h-8 w-full text-xs"
                          onClick={() => { setSelectedVenue(v); setSelectedRoom({ name: "Default room", rate: v.hourly_rate || 500 }); }}
                        >
                          Select · ₹{v.hourly_rate || 500}/hr
                        </Button>
                      )}
                      {rooms.map((r: any) => {
                        const sel = isSelected && selectedRoom?.name === r.name;
                        return (
                          <Button
                            key={r.name}
                            size="sm"
                            variant={sel ? "default" : "outline"}
                            className="h-8 w-full justify-between text-xs"
                            onClick={() => { setSelectedVenue(v); setSelectedRoom({ name: r.name, rate: Number(r.hourly_rate || r.rate || v.hourly_rate || 500) }); }}
                          >
                            <span>{r.name} · cap {r.capacity || 1}</span>
                            <span>₹{r.hourly_rate || r.rate}/hr</span>
                          </Button>
                        );
                      })}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Card>

        {/* Section 3: Choose therapist */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg">Choose a certified therapist</h2>
            <ToggleGroup type="single" value={genderFilter} onValueChange={(v) => v && setGenderFilter(v)} size="sm">
              <ToggleGroupItem value="any" className="h-7 text-xs">Any</ToggleGroupItem>
              <ToggleGroupItem value="female" className="h-7 text-xs">Female</ToggleGroupItem>
              <ToggleGroupItem value="male" className="h-7 text-xs">Male</ToggleGroupItem>
            </ToggleGroup>
          </div>
          {filteredTherapists.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No certified therapists available right now.</p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTherapists.map((t) => {
                const sel = selectedTherapist?.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTherapist(t)}
                    className={`rounded-lg border p-3 text-left transition ${sel ? "border-primary ring-2 ring-primary/30" : "hover:border-primary/40"}`}
                  >
                    <div className="flex items-center gap-3">
                      {t.photo_url ? (
                        <img src={t.photo_url} alt={t.full_name} className="h-12 w-12 rounded-full object-cover"  loading="lazy" decoding="async" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-sm font-medium">
                          {t.full_name?.[0]}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{t.full_name}</p>
                        <p className="text-xs capitalize text-muted-foreground">{t.gender} · {t.years_experience || 0}y exp</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-current text-amber-500" />{Number(t.rating || 0).toFixed(1)}</span>
                      <span>{t.total_sessions || 0} sessions</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        {/* Section 4: Date & time */}
        <Card className="p-6">
          <h2 className="font-display text-lg">Choose date and time</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Date</Label>
              <Input type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label>Time slot</Label>
              <div className="mt-2 flex flex-wrap gap-1">
                {HOURLY_SLOTS.map((slot) => {
                  const ok = isSlotAvailable(slot);
                  const sel = time === slot;
                  return (
                    <Button
                      key={slot}
                      type="button"
                      size="sm"
                      variant={sel ? "default" : "outline"}
                      disabled={!selectedTherapist || !ok}
                      className="h-8 text-[11px]"
                      onClick={() => setTime(slot)}
                    >
                      {slot}
                    </Button>
                  );
                })}
              </div>
              {!selectedTherapist && (
                <p className="mt-2 text-xs text-muted-foreground">Choose a therapist to see available slots.</p>
              )}
            </div>
          </div>
        </Card>

        {/* Section 5: Medicines */}
        {medicines.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg">Medicines prescribed</h2>
              <Button size="sm" variant="outline" onClick={addMedicinesToCart}>
                <ShoppingBag className="mr-1 h-4 w-4" /> Add all to cart
              </Button>
            </div>
            <ul className="mt-3 divide-y">
              {medicines.map((m, i) => (
                <li key={i} className="flex items-center justify-between py-2 text-sm">
                  <span>{m.name || m.product_name}</span>
                  <span className="text-muted-foreground">× {m.quantity || 1}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">These medicines will be dispatched to you before your session.</p>
          </Card>
        )}

        {/* Section 6: Payment summary */}
        <Card className="p-6">
          <h2 className="font-display text-lg">Payment summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Therapy fee ({durationMin} min)</span><span>₹{therapyFee}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Platform fee (10%)</span><span>₹{platformFee}</span></div>
            <div className="flex justify-between border-t pt-2 text-base font-semibold"><span>Total</span><span>₹{total}</span></div>
          </div>
          <Button size="lg" className="mt-4 w-full" onClick={handlePay} disabled={paying || !selectedVenue || !selectedRoom || !selectedTherapist || !date || !time}>
            {paying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
            {paying ? "Processing…" : `Pay ₹${total} & confirm booking`}
          </Button>
          {(!selectedVenue || !selectedTherapist || !time) && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              <Check className="mr-1 inline h-3 w-3" /> Select venue, therapist, date & time to continue.
            </p>
          )}
        </Card>
      </main>
    </div>
  );
};

export default TherapyBooking;
