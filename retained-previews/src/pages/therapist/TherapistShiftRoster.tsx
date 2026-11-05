import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { TherapistContext } from "./TherapistLayout";

interface ShiftAssignment {
  id: string;
  therapist_id: string;
  shift_date: string;
  shift_type: "morning" | "afternoon" | "evening" | "full_day";
  start_time: string;
  end_time: string;
  venue_name: string;
  venue_address: string;
  assigned_by: string;
  status: "assigned" | "confirmed" | "in_progress" | "completed" | "cancelled";
  therapist_confirmed_at: string | null;
  expected_sessions: number;
  completed_sessions: number;
  notes: string | null;
}

const shiftTypeColors: Record<string, string> = {
  morning: "bg-blue-100 text-blue-800",
  afternoon: "bg-amber-100 text-amber-800",
  evening: "bg-indigo-100 text-indigo-800",
  full_day: "bg-purple-100 text-purple-800",
};

const statusColors: Record<string, string> = {
  assigned: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  in_progress: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

function formatShiftType(type: string): string {
  return type.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTime(time: string): string {
  if (!time) return "";
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().split("T")[0];
  return dateStr === today;
}

export default function TherapistShiftRoster() {
  const { therapist } = useOutletContext<TherapistContext>();
  const [shifts, setShifts] = useState<ShiftAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    if (therapist?.id) {
      fetchShifts();
    }
  }, [therapist?.id]);

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const pastDate = new Date(today);
      pastDate.setDate(pastDate.getDate() - 7);
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + 7);

      const { data, error } = await (supabase as any)
        .from("therapist_shift_assignments")
        .select("*")
        .eq("therapist_id", therapist.id)
        .gte("shift_date", pastDate.toISOString().split("T")[0])
        .lte("shift_date", futureDate.toISOString().split("T")[0])
        .order("shift_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) throw error;
      setShifts(data || []);
    } catch (error) {
      console.error("Error fetching shifts:", error);
      toast.error("Failed to load shift data");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmShift = async (shiftId: string) => {
    setConfirmingId(shiftId);
    try {
      const { error } = await (supabase as any)
        .from("therapist_shift_assignments")
        .update({
          status: "confirmed",
          therapist_confirmed_at: new Date().toISOString(),
        })
        .eq("id", shiftId)
        .eq("therapist_id", therapist.id);

      if (error) throw error;

      toast.success("Shift confirmed successfully");
      fetchShifts();
    } catch (error) {
      console.error("Error confirming shift:", error);
      toast.error("Failed to confirm shift");
    } finally {
      setConfirmingId(null);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const todayShift = shifts.find((s) => s.shift_date === todayStr && s.status !== "cancelled");
  const upcomingShifts = shifts.filter(
    (s) => s.shift_date > todayStr && s.status !== "cancelled"
  );
  const pastShifts = shifts.filter((s) => s.shift_date < todayStr);

  const renderShiftCard = (shift: ShiftAssignment, highlight = false) => (
    <Card
      key={shift.id}
      className={highlight ? "border-2 border-primary" : ""}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{formatDate(shift.shift_date)}</span>
            {isToday(shift.shift_date) && (
              <Badge variant="default" className="text-xs">Today</Badge>
            )}
          </div>
          <Badge className={`text-xs ${statusColors[shift.status] || ""}`}>
            {shift.status.replace("_", " ")}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={`text-xs ${shiftTypeColors[shift.shift_type] || ""}`}>
            {formatShiftType(shift.shift_type)}
          </Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatTime(shift.start_time)} – {formatTime(shift.end_time)}
          </div>
        </div>

        <div className="flex items-start gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">{shift.venue_name}</p>
            {shift.venue_address && (
              <p className="text-muted-foreground text-xs">{shift.venue_address}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>{shift.expected_sessions} expected sessions</span>
          {shift.completed_sessions > 0 && (
            <span className="ml-1">({shift.completed_sessions} completed)</span>
          )}
        </div>

        {shift.notes && (
          <p className="text-xs text-muted-foreground italic">{shift.notes}</p>
        )}

        {shift.status === "assigned" && (
          <Button
            size="sm"
            onClick={() => handleConfirmShift(shift.id)}
            disabled={confirmingId === shift.id}
            className="w-full mt-2"
          >
            {confirmingId === shift.id ? "Confirming..." : "Confirm Shift"}
          </Button>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">My Shifts</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading shift roster...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Calendar className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">My Shifts</h1>
      </div>

      {/* Today's Shift */}
      {todayShift ? (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Today's Shift</h2>
          {renderShiftCard(todayShift, true)}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-6 text-center">
            <p className="text-muted-foreground">No shift assigned for today</p>
          </CardContent>
        </Card>
      )}

      {/* This Week */}
      {upcomingShifts.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Upcoming (Next 7 Days)</h2>
          <div className="space-y-3">
            {upcomingShifts.map((shift) => renderShiftCard(shift))}
          </div>
        </div>
      )}

      {/* Past Shifts */}
      {pastShifts.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-muted-foreground">Past Shifts (Last 7 Days)</h2>
          <div className="space-y-3 opacity-75">
            {pastShifts.map((shift) => renderShiftCard(shift))}
          </div>
        </div>
      )}

      {shifts.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground text-center">
              No shifts scheduled
            </p>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Your venue manager will assign shifts to you.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Notice */}
      <p className="text-xs text-muted-foreground text-center border-t pt-4">
        Shifts are assigned by your venue manager. Contact admin for schedule changes.
      </p>
    </div>
  );
}
