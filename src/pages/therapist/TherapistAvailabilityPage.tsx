import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Plus, Trash2, Settings } from "lucide-react";

interface TherapistContext {
  therapist: { id: string; user_id: string; full_name: string; verification_status: string; is_available: boolean };
  reload: () => Promise<void>;
}

interface AvailabilitySlot {
  id: string;
  therapist_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface BlockedDate {
  id: string;
  therapist_id: string;
  blocked_date: string;
  reason: string;
}

interface SchedulingSettings {
  therapist_id: string;
  auto_accept_bookings: boolean;
  max_sessions_per_day: number;
  buffer_minutes: number;
  advance_booking_days: number;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function TherapistAvailabilityPage() {
  const { therapist } = useOutletContext<TherapistContext>();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [settings, setSettings] = useState<SchedulingSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Add slot dialog state
  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [newSlotDay, setNewSlotDay] = useState("0");
  const [newSlotStart, setNewSlotStart] = useState("09:00");
  const [newSlotEnd, setNewSlotEnd] = useState("10:00");

  // Block date dialog state
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [newBlockDate, setNewBlockDate] = useState("");
  const [newBlockReason, setNewBlockReason] = useState("");

  useEffect(() => {
    fetchData();
  }, [therapist.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [slotsRes, blockedRes, settingsRes] = await Promise.all([
        (supabase as any).from("therapist_availability_slots").select("*").eq("therapist_id", therapist.id),
        (supabase as any).from("therapist_blocked_dates").select("*").eq("therapist_id", therapist.id).order("blocked_date", { ascending: true }),
        (supabase as any).from("therapist_scheduling_settings").select("*").eq("therapist_id", therapist.id).maybeSingle(),
      ]);

      if (slotsRes.data) setSlots(slotsRes.data);
      if (blockedRes.data) setBlockedDates(blockedRes.data);
      if (settingsRes.data) {
        setSettings(settingsRes.data);
      } else {
        // Create default settings
        const defaultSettings: SchedulingSettings = {
          therapist_id: therapist.id,
          auto_accept_bookings: false,
          max_sessions_per_day: 8,
          buffer_minutes: 15,
          advance_booking_days: 30,
        };
        const { data } = await (supabase as any).from("therapist_scheduling_settings").insert(defaultSettings).select().single();
        if (data) setSettings(data);
      }
    } catch (error) {
      toast.error("Failed to load availability data");
    } finally {
      setLoading(false);
    }
  };

  const addSlot = async () => {
    const { error } = await (supabase as any).from("therapist_availability_slots").insert({
      therapist_id: therapist.id,
      day_of_week: parseInt(newSlotDay),
      start_time: newSlotStart,
      end_time: newSlotEnd,
      is_active: true,
    });

    if (error) {
      toast.error("Failed to add slot");
    } else {
      toast.success("Slot added");
      setSlotDialogOpen(false);
      setNewSlotStart("09:00");
      setNewSlotEnd("10:00");
      fetchData();
    }
  };

  const removeSlot = async (slotId: string) => {
    const { error } = await (supabase as any).from("therapist_availability_slots").delete().eq("id", slotId);
    if (error) {
      toast.error("Failed to remove slot");
    } else {
      toast.success("Slot removed");
      setSlots(slots.filter((s) => s.id !== slotId));
    }
  };

  const toggleSlot = async (slotId: string, isActive: boolean) => {
    const { error } = await (supabase as any).from("therapist_availability_slots").update({ is_active: !isActive }).eq("id", slotId);
    if (error) {
      toast.error("Failed to update slot");
    } else {
      setSlots(slots.map((s) => (s.id === slotId ? { ...s, is_active: !isActive } : s)));
    }
  };

  const addBlockedDate = async () => {
    if (!newBlockDate) {
      toast.error("Please select a date");
      return;
    }
    const { error } = await (supabase as any).from("therapist_blocked_dates").insert({
      therapist_id: therapist.id,
      blocked_date: newBlockDate,
      reason: newBlockReason || "Leave",
    });

    if (error) {
      toast.error("Failed to block date");
    } else {
      toast.success("Date blocked");
      setBlockDialogOpen(false);
      setNewBlockDate("");
      setNewBlockReason("");
      fetchData();
    }
  };

  const removeBlockedDate = async (id: string) => {
    const { error } = await (supabase as any).from("therapist_blocked_dates").delete().eq("id", id);
    if (error) {
      toast.error("Failed to remove blocked date");
    } else {
      toast.success("Blocked date removed");
      setBlockedDates(blockedDates.filter((b) => b.id !== id));
    }
  };

  const updateSettings = async (updates: Partial<SchedulingSettings>) => {
    const { error } = await (supabase as any)
      .from("therapist_scheduling_settings")
      .update(updates)
      .eq("therapist_id", therapist.id);

    if (error) {
      toast.error("Failed to update settings");
    } else {
      setSettings((prev) => (prev ? { ...prev, ...updates } : null));
      toast.success("Settings updated");
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading availability...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Availability & Scheduling</h1>
        <div className="flex gap-2">
          <Dialog open={slotDialogOpen} onOpenChange={setSlotDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" />Add Slot</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Availability Slot</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Day of Week</Label>
                  <Select value={newSlotDay} onValueChange={setNewSlotDay}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DAYS.map((day, i) => (
                        <SelectItem key={i} value={String(i)}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Time</Label>
                    <Input type="time" value={newSlotStart} onChange={(e) => setNewSlotStart(e.target.value)} />
                  </div>
                  <div>
                    <Label>End Time</Label>
                    <Input type="time" value={newSlotEnd} onChange={(e) => setNewSlotEnd(e.target.value)} />
                  </div>
                </div>
                <Button onClick={addSlot} className="w-full">Add Slot</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><Calendar className="w-4 h-4 mr-2" />Block Date</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Block a Date</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={newBlockDate} onChange={(e) => setNewBlockDate(e.target.value)} />
                </div>
                <div>
                  <Label>Reason</Label>
                  <Input placeholder="e.g. Festival, Travel, Personal Leave" value={newBlockReason} onChange={(e) => setNewBlockReason(e.target.value)} />
                </div>
                <Button onClick={addBlockedDate} className="w-full">Block Date</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Weekly Calendar Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5" />Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {DAYS.map((day, dayIndex) => {
              const daySlots = slots.filter((s) => s.day_of_week === dayIndex);
              return (
                <div key={dayIndex} className="border rounded-lg p-3">
                  <h3 className="font-semibold text-sm mb-2">{day}</h3>
                  {daySlots.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No slots</p>
                  ) : (
                    <div className="space-y-2">
                      {daySlots.map((slot) => (
                        <div key={slot.id} className={`flex items-center justify-between text-xs p-1.5 rounded ${slot.is_active ? "bg-green-50 border border-green-200" : "bg-gray-50 border border-gray-200"}`}>
                          <span className="cursor-pointer" onClick={() => toggleSlot(slot.id, slot.is_active)}>
                            {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                          </span>
                          <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => removeSlot(slot.id)}>
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Blocked Dates */}
      <Card>
        <CardHeader>
          <CardTitle>Blocked Dates</CardTitle>
        </CardHeader>
        <CardContent>
          {blockedDates.length === 0 ? (
            <p className="text-muted-foreground">No blocked dates</p>
          ) : (
            <div className="space-y-2">
              {blockedDates.map((bd) => (
                <div key={bd.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">{new Date(bd.blocked_date).toLocaleDateString()}</span>
                    <Badge variant="secondary" className="ml-2">{bd.reason}</Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeBlockedDate(bd.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scheduling Settings */}
      {settings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5" />Scheduling Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-Accept Bookings</Label>
                <p className="text-sm text-muted-foreground">Automatically confirm new bookings</p>
              </div>
              <Switch
                checked={settings.auto_accept_bookings}
                onCheckedChange={(checked) => updateSettings({ auto_accept_bookings: checked })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Max Sessions/Day</Label>
                <Input
                  type="number"
                  value={settings.max_sessions_per_day}
                  onChange={(e) => updateSettings({ max_sessions_per_day: parseInt(e.target.value) || 8 })}
                />
              </div>
              <div>
                <Label>Buffer Minutes</Label>
                <Input
                  type="number"
                  value={settings.buffer_minutes}
                  onChange={(e) => updateSettings({ buffer_minutes: parseInt(e.target.value) || 15 })}
                />
              </div>
              <div>
                <Label>Advance Booking (Days)</Label>
                <Input
                  type="number"
                  value={settings.advance_booking_days}
                  onChange={(e) => updateSettings({ advance_booking_days: parseInt(e.target.value) || 30 })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
