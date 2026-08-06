import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Pill,
  CheckCircle2,
  Calendar,
  TrendingUp,
  Clock,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string; // e.g. "BD" (twice daily), "TID", "OD"
  time_slots: string[]; // e.g. ["Morning", "Evening"]
  start_date: string;
  end_date: string | null;
  prescribed_by: string;
}

interface AdherenceLog {
  id: string;
  medicine_id: string;
  log_date: string;
  time_slot: string;
  taken: boolean;
}

const SAMPLE_MEDICINES: Medicine[] = [
  { id: "m1", name: "Rasnasaptak Kashaya", dosage: "15ml", frequency: "BD", time_slots: ["Morning", "Evening"], start_date: "2026-07-01", end_date: "2026-08-01", prescribed_by: "Dr. Arun Sharma" },
  { id: "m2", name: "Yogaraja Guggulu", dosage: "2 tablets", frequency: "BD", time_slots: ["Morning", "Evening"], start_date: "2026-07-01", end_date: "2026-08-01", prescribed_by: "Dr. Arun Sharma" },
  { id: "m3", name: "Ashwagandha Churna", dosage: "3g", frequency: "OD", time_slots: ["Night"], start_date: "2026-07-01", end_date: null, prescribed_by: "Dr. Arun Sharma" },
];

const MedicineAdherence = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>(SAMPLE_MEDICINES);
  const [logs, setLogs] = useState<AdherenceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id ?? null;
      setUserId(uid);

      if (uid) {
        // Try loading from medicine_adherence_logs table
        const { data: logData } = await supabase
          .from("medicine_adherence_logs")
          .select("*")
          .eq("user_id", uid)
          .gte("log_date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10))
          .order("log_date", { ascending: false });

        if (logData) setLogs(logData as AdherenceLog[]);

        // Try loading prescribed medicines
        const { data: meds } = await supabase
          .from("patient_prescribed_medicines")
          .select("*")
          .eq("patient_id", uid)
          .eq("is_active", true);

        if (meds && meds.length > 0) setMedicines(meds as Medicine[]);
      }
      setLoading(false);
    })();
  }, []);

  const todayLogs = useMemo(() => logs.filter((l) => l.log_date === today), [logs, today]);

  const todaySlots = useMemo(() => {
    const slots: { medicine: Medicine; time_slot: string; taken: boolean }[] = [];
    medicines.forEach((med) => {
      med.time_slots.forEach((slot) => {
        const taken = todayLogs.some((l) => l.medicine_id === med.id && l.time_slot === slot && l.taken);
        slots.push({ medicine: med, time_slot: slot, taken });
      });
    });
    return slots;
  }, [medicines, todayLogs, today]);

  const todayCompleted = todaySlots.filter((s) => s.taken).length;
  const todayTotal = todaySlots.length;
  const todayPct = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

  // 7-day adherence
  const weekPct = useMemo(() => {
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().slice(0, 10);
    });
    let total = 0;
    let taken = 0;
    last7.forEach((date) => {
      medicines.forEach((med) => {
        med.time_slots.forEach((slot) => {
          total++;
          if (logs.some((l) => l.log_date === date && l.medicine_id === med.id && l.time_slot === slot && l.taken)) taken++;
        });
      });
    });
    return total > 0 ? Math.round((taken / total) * 100) : 0;
  }, [logs, medicines]);

  const handleToggle = async (medicineId: string, timeSlot: string, currentlyTaken: boolean) => {
    if (!userId) return;

    if (currentlyTaken) {
      // Remove log
      await supabase
        .from("medicine_adherence_logs")
        .delete()
        .eq("user_id", userId)
        .eq("medicine_id", medicineId)
        .eq("log_date", today)
        .eq("time_slot", timeSlot);

      setLogs((prev) => prev.filter((l) => !(l.medicine_id === medicineId && l.log_date === today && l.time_slot === timeSlot)));
    } else {
      // Add log
      const { data, error } = await supabase
        .from("medicine_adherence_logs")
        .insert({ user_id: userId, medicine_id: medicineId, log_date: today, time_slot: timeSlot, taken: true })
        .select()
        .single();

      if (!error && data) {
        setLogs((prev) => [...prev, data as AdherenceLog]);
        toast.success("Marked as taken!");
      }
    }
  };

  const getTimeIcon = (slot: string) => {
    if (slot === "Morning") return "🌅";
    if (slot === "Afternoon") return "☀️";
    if (slot === "Evening") return "🌇";
    if (slot === "Night") return "🌙";
    return "💊";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Medicine Diary</h1>
        <p className="text-muted-foreground">Track your daily medicine intake. Your doctor can see your adherence score.</p>
      </div>

      {/* Today's Progress */}
      <Card className={todayPct === 100 ? "border-green-200 bg-green-50/50" : ""}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Today — {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}</h3>
            </div>
            <Badge className={todayPct === 100 ? "bg-green-100 text-green-700" : todayPct > 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}>
              {todayCompleted}/{todayTotal} taken
            </Badge>
          </div>
          <Progress value={todayPct} className="h-3" />
          {todayPct === 100 && (
            <p className="mt-2 text-sm text-green-700 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> All medicines taken for today!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Weekly Overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="text-center">
          <CardContent className="pt-5 pb-4">
            <TrendingUp className="mx-auto h-5 w-5 text-primary mb-1" />
            <p className="font-display text-2xl font-bold text-primary">{todayPct}%</p>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-5 pb-4">
            <Sparkles className="mx-auto h-5 w-5 text-emerald-600 mb-1" />
            <p className="font-display text-2xl font-bold text-emerald-600">{weekPct}%</p>
            <p className="text-xs text-muted-foreground">7-Day Average</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-5 pb-4">
            <Pill className="mx-auto h-5 w-5 text-violet-600 mb-1" />
            <p className="font-display text-2xl font-bold">{medicines.length}</p>
            <p className="text-xs text-muted-foreground">Active Medicines</p>
          </CardContent>
        </Card>
      </div>

      {/* Medicine Checklist */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" /> Today's Checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 p-4">
          {todaySlots.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Pill className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
              <p>No active medicines. Prescriptions from your doctor will appear here.</p>
            </div>
          ) : (
            <>
              {["Morning", "Afternoon", "Evening", "Night"].map((timeGroup) => {
                const slotsInGroup = todaySlots.filter((s) => s.time_slot === timeGroup);
                if (slotsInGroup.length === 0) return null;
                return (
                  <div key={timeGroup} className="mb-4">
                    <p className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1">
                      {getTimeIcon(timeGroup)} {timeGroup}
                    </p>
                    <div className="space-y-2">
                      {slotsInGroup.map((slot, idx) => (
                        <div
                          key={`${slot.medicine.id}-${slot.time_slot}-${idx}`}
                          className={`flex items-center gap-3 rounded-lg border p-3 transition ${slot.taken ? "border-green-200 bg-green-50/50" : "hover:bg-muted/50"}`}
                        >
                          <Checkbox
                            checked={slot.taken}
                            onCheckedChange={() => handleToggle(slot.medicine.id, slot.time_slot, slot.taken)}
                            className="h-5 w-5"
                          />
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${slot.taken ? "line-through text-muted-foreground" : ""}`}>
                              {slot.medicine.name}
                            </p>
                            <p className="text-xs text-muted-foreground">{slot.medicine.dosage} · {slot.medicine.frequency}</p>
                          </div>
                          {slot.taken && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </CardContent>
      </Card>

      {/* Prescribed by */}
      {medicines.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Prescribed Medicines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4">
            {medicines.map((med) => (
              <div key={med.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">{med.name}</p>
                  <p className="text-xs text-muted-foreground">{med.dosage} · {med.frequency} · {med.time_slots.join(", ")}</p>
                  <p className="text-[10px] text-muted-foreground">By {med.prescribed_by}</p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>From {new Date(med.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                  {med.end_date && <p>To {new Date(med.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Adherence Tip */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="flex items-start gap-3 p-4">
          <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">Why track adherence?</p>
            <p className="text-xs text-blue-700 mt-1">
              Ayurvedic medicines work best with consistent intake. Your doctor can see your adherence score and adjust treatment accordingly. High adherence patients see 60% faster results.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicineAdherence;
