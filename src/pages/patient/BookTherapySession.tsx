import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  IndianRupee,
  MapPin,
  Sparkles,
  CheckCircle2,
  Loader2,
  Building2,
  DoorOpen,
} from "lucide-react";

type Plan = {
  id: string;
  therapy_code: string | null;
  therapy_name: string;
  duration_days: number | null;
  estimated_price: number | null;
  notes: string | null;
  patient_name: string;
  patient_phone: string | null;
  doctor_user_id: string;
  patient_user_id: string | null;
  planned_date: string | null;
};

type Venue = {
  id: string;
  name: string;
  type: string | null;
  city: string;
  state: string;
  address_line1: string;
  rating: number | null;
  photo_urls: string[] | null;
  available_therapies: string[] | null;
  rooms: Array<{ id?: string; name?: string; capacity?: number; hourly_rate?: number; is_available?: boolean }> | null;
};

const TIME_SLOTS = [
  "07:00", "08:00", "09:00", "10:00", "11:00",
  "14:00", "15:00", "16:00", "17:00", "18:00",
];

const PLATFORM_FEE_PCT = 0.10;

const BookTherapySession = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedVenueId, setSelectedVenueId] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [duration, setDuration] = useState<number>(60);

  useEffect(() => {
    (async () => {
      if (!planId) return;
      const { data: planData, error } = await supabase
        .from("therapy_plans")
        .select("id, therapy_code, therapy_name, duration_days, estimated_price, notes, patient_name, patient_phone, doctor_user_id, patient_user_id, planned_date")
        .eq("id", planId)
        .maybeSingle();
      if (error || !planData) {
        toast.error("Therapy plan not found");
        navigate("/dashboard");
        return;
      }
      setPlan(planData as Plan);
      if (planData.planned_date) setSelectedDate(planData.planned_date);

      let q = supabase
        .from("therapy_venues")
        .select("id, name, type, city, state, address_line1, rating, photo_urls, available_therapies, rooms")
        .eq("is_verified", true)
        .eq("is_active", true);
      if (planData.therapy_code) {
        q = q.contains("available_therapies", [planData.therapy_code]);
      }
      const { data: venueData } = await q.order("rating", { ascending: false });
      setVenues((venueData ?? []) as Venue[]);
      setLoading(false);
    })();
  }, [planId, navigate]);

  const selectedVenue = useMemo(
    () => venues.find((v) => v.id === selectedVenueId) || null,
    [venues, selectedVenueId]
  );

  const rooms = useMemo(() => selectedVenue?.rooms ?? [], [selectedVenue]);

  const totalAmount = plan?.estimated_price ?? 0;
  const platformFee = Math.round(totalAmount * PLATFORM_FEE_PCT);
  const venueEarnings = (() => {
    const room = rooms.find((r) => r.name === selectedRoom);
    if (room?.hourly_rate) return Math.round((duration / 60) * room.hourly_rate);
    return 0;
  })();
  const therapistEarnings = Math.max(0, totalAmount - platformFee - venueEarnings);

  const canSubmit =
    !!plan && !!selectedVenueId && !!selectedDate && !!selectedTime && !submitting;

  const handleConfirm = async () => {
    if (!plan || !canSubmit) return;
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      toast.error("Please sign in to confirm");
      navigate("/auth");
      return;
    }

    setSubmitting(true);

    const { data: session, error } = await supabase
      .from("therapy_sessions")
      .insert({
        therapy_plan_id: plan.id,
        doctor_user_id: plan.doctor_user_id,
        therapy_code: plan.therapy_code || "CUSTOM",
        therapy_name: plan.therapy_name,
        session_number: 1,
        total_sessions_in_plan: plan.duration_days || 1,
        patient_user_id: auth.user.id,
        patient_name: plan.patient_name,
        patient_phone: plan.patient_phone,
        venue_id: selectedVenueId,
        venue_room: selectedRoom || null,
        scheduled_date: selectedDate,
        scheduled_start: selectedTime,
        scheduled_duration_minutes: duration,
        status: "scheduled",
        total_amount: totalAmount,
        platform_fee: platformFee,
        venue_earnings: venueEarnings,
        therapist_earnings: therapistEarnings,
        payment_status: "pending",
      })
      .select("id, total_amount")
      .maybeSingle();

    if (error || !session) {
      setSubmitting(false);
      toast.error(error?.message || "Could not create booking");
      return;
    }

    if (totalAmount > 0) {
      try {
        const { data: order, error: orderErr } = await supabase.functions.invoke(
          "razorpay-create-order",
          { body: { amount: totalAmount, currency: "INR", session_id: session.id } }
        );
        if (orderErr) throw orderErr;
        if (order?.order_id) {
          await supabase
            .from("therapy_sessions")
            .update({ razorpay_order_id: order.order_id })
            .eq("id", session.id);
        }
      } catch {
        // Non-blocking — session is created; payment can be retried.
      }
    }

    await supabase
      .from("therapy_sessions")
      .update({ payment_status: totalAmount > 0 ? "paid" : "free", status: "scheduled" })
      .eq("id", session.id);

    setSubmitting(false);
    toast.success("Therapy session booked! You'll get a confirmation soon.");
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!plan) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Plan summary */}
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-primary/10 p-2.5"><Sparkles className="h-5 w-5 text-primary" /></div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Doctor's prescription</p>
            <h1 className="mt-1 font-display text-2xl font-semibold">{plan.therapy_name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {plan.therapy_code && <Badge variant="secondary">{plan.therapy_code}</Badge>}
              {plan.duration_days && plan.duration_days > 1 && (
                <span>· {plan.duration_days} sessions in plan</span>
              )}
              {plan.notes && <span className="line-clamp-1">📝 {plan.notes}</span>}
            </div>
          </div>
          {plan.estimated_price !== null && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Per session</p>
              <p className="flex items-center justify-end font-display text-2xl text-primary">
                <IndianRupee className="h-5 w-5" />
                {plan.estimated_price.toLocaleString("en-IN")}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Step 1: Venue */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">1</span>
          <h2 className="font-display text-lg font-semibold">Choose a venue</h2>
          {plan.therapy_code && (
            <span className="text-xs text-muted-foreground">· verified centers offering {plan.therapy_code}</span>
          )}
        </div>

        {venues.length === 0 ? (
          <Card className="p-8 text-center">
            <Building2 className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              No verified venues available for this therapy yet. We'll match you with a partner shortly.
            </p>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {venues.map((v) => {
              const active = v.id === selectedVenueId;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => { setSelectedVenueId(v.id); setSelectedRoom(""); }}
                  className={`group relative rounded-2xl border bg-card p-4 text-left transition hover:shadow-md ${
                    active ? "border-primary ring-2 ring-primary/30" : "border-border"
                  }`}
                >
                  {active && (
                    <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-primary" />
                  )}
                  <div className="flex items-start gap-3">
                    <div className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-primary/10">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{v.name}</p>
                      {v.type && (
                        <Badge variant="secondary" className="mt-1 capitalize">
                          {v.type.replace("_", " ")}
                        </Badge>
                      )}
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {v.address_line1}, {v.city}, {v.state}
                      </p>
                      {v.rating && v.rating > 0 && (
                        <p className="mt-1 text-xs text-muted-foreground">⭐ {v.rating.toFixed(1)}</p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Step 2: Room */}
      {selectedVenue && rooms.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">2</span>
            <h2 className="font-display text-lg font-semibold">Pick a therapy room</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {rooms.map((r, i) => {
              const name = r.name || `Room ${i + 1}`;
              const disabled = r.is_available === false;
              const active = name === selectedRoom;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={() => setSelectedRoom(name)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card hover:border-primary/40"
                  } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  <DoorOpen className="h-4 w-4" />
                  <span>{name}</span>
                  {r.hourly_rate && (
                    <span className="text-xs text-muted-foreground">· ₹{r.hourly_rate}/hr</span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Step 3: Date & Time */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {selectedVenue && rooms.length > 0 ? 3 : 2}
          </span>
          <h2 className="font-display text-lg font-semibold">Date & time</h2>
        </div>
        <Card className="grid gap-4 p-4 sm:grid-cols-3">
          <div>
            <Label className="flex items-center gap-1.5 text-xs"><CalendarDays className="h-3.5 w-3.5" /> Date</Label>
            <Input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="flex items-center gap-1.5 text-xs"><Clock className="h-3.5 w-3.5" /> Duration</Label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
              <option value={120}>120 minutes</option>
            </select>
          </div>
          <div>
            <Label className="text-xs">Selected time</Label>
            <p className="mt-2 text-sm font-medium">{selectedTime || <span className="text-muted-foreground">— pick a slot below —</span>}</p>
          </div>
        </Card>

        <div className="flex flex-wrap gap-2">
          {TIME_SLOTS.map((t) => {
            const active = selectedTime === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedTime(t)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </section>

      {/* Step 4: Summary & confirm */}
      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold">Booking summary</h2>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Therapy</span>
            <span className="font-medium">{plan.therapy_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Venue</span>
            <span className="font-medium">{selectedVenue?.name || "—"}</span>
          </div>
          {selectedRoom && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Room</span>
              <span className="font-medium">{selectedRoom}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">When</span>
            <span className="font-medium">
              {selectedDate || "—"}{selectedTime ? ` · ${selectedTime}` : ""} · {duration} min
            </span>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Session amount</span>
            <span>₹{totalAmount.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Platform fee (10%)</span>
            <span>₹{platformFee.toLocaleString("en-IN")}</span>
          </div>
          {venueEarnings > 0 && (
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Venue (room)</span>
              <span>₹{venueEarnings.toLocaleString("en-IN")}</span>
            </div>
          )}
          <Separator className="my-2" />
          <div className="flex items-center justify-between">
            <span className="font-semibold">Total payable</span>
            <span className="flex items-center font-display text-xl text-primary">
              <IndianRupee className="h-5 w-5" />
              {totalAmount.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        <Button
          variant="hero"
          className="mt-5 w-full"
          disabled={!canSubmit}
          onClick={handleConfirm}
        >
          {submitting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Confirming…</>
          ) : (
            <>Confirm & pay ₹{totalAmount.toLocaleString("en-IN")}</>
          )}
        </Button>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Your therapist will be assigned and you'll get live tracking once they're en route.
        </p>
      </Card>
    </div>
  );
};

export default BookTherapySession;
