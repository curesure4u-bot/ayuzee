import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  CalendarClock, Users, Plus, Trash2, Save, Clock, UserCog,
  Stethoscope, Heart, Building2, Sun, Moon, Coffee, Check,
  AlertTriangle, Calendar,
} from "lucide-react";

// ─── Types ───
interface StaffMember {
  id: string;
  name: string;
  role: string;
  gender: string;
  phone: string;
}

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const shifts = [
  { id: "morning", label: "Morning", time: "8 AM - 1 PM", icon: Sun, color: "amber" },
  { id: "afternoon", label: "Afternoon", time: "2 PM - 6 PM", icon: Coffee, color: "orange" },
  { id: "evening", label: "Evening", time: "6 PM - 9 PM", icon: Moon, color: "indigo" },
];

const roleColors: Record<string, string> = {
  "Duty Doctor": "bg-blue-100 text-blue-700",
  "Male Therapist": "bg-green-100 text-green-700",
  "Female Therapist": "bg-pink-100 text-pink-700",
  "Receptionist": "bg-amber-100 text-amber-700",
  "Online Coordinator": "bg-purple-100 text-purple-700",
};

const defaultStaff: StaffMember[] = [
  { id: "s1", name: "Dr. (BAMS)", role: "Duty Doctor", gender: "any", phone: "" },
  { id: "s2", name: "Therapist (M)", role: "Male Therapist", gender: "male", phone: "" },
  { id: "s3", name: "Therapist (F)", role: "Female Therapist", gender: "female", phone: "" },
  { id: "s4", name: "Receptionist", role: "Receptionist", gender: "any", phone: "" },
];

export default function SpineFranchiseRoster() {
  const [staff, setStaff] = useState<StaffMember[]>(defaultStaff);
  const [roster, setRoster] = useState<Record<string, string>>({}); // key: "staffId-day-shift" → "on"/"off"/"leave"
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: "", role: "Duty Doctor", gender: "any", phone: "" });
  const [saving, setSaving] = useState(false);

  const cellKey = (staffId: string, day: string, shift: string) => `${staffId}-${day}-${shift}`;

  const cycleCell = (staffId: string, day: string, shift: string) => {
    const key = cellKey(staffId, day, shift);
    setRoster(prev => {
      const current = prev[key] || "off";
      const next = current === "off" ? "on" : current === "on" ? "leave" : "off";
      return { ...prev, [key]: next };
    });
  };

  const addStaff = () => {
    if (!newStaff.name) { toast.error("Enter staff name"); return; }
    setStaff(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), ...newStaff }]);
    setNewStaff({ name: "", role: "Duty Doctor", gender: "any", phone: "" });
    setShowAddStaff(false);
  };

  const removeStaff = (id: string) => {
    setStaff(prev => prev.filter(s => s.id !== id));
    setRoster(prev => {
      const n = { ...prev };
      Object.keys(n).forEach(k => { if (k.startsWith(id + "-")) delete n[k]; });
      return n;
    });
  };

  // Coverage analysis
  const coverage = useMemo(() => {
    const result: Record<string, Record<string, number>> = {};
    days.forEach(day => {
      result[day] = {};
      shifts.forEach(shift => {
        const count = staff.filter(s => roster[cellKey(s.id, day, shift.id)] === "on").length;
        result[day][shift.id] = count;
      });
    });
    return result;
  }, [staff, roster]);

  // Stats
  const stats = useMemo(() => {
    let totalShifts = 0, leaves = 0;
    Object.values(roster).forEach(v => { if (v === "on") totalShifts++; if (v === "leave") leaves++; });
    // Check for gaps (any day-shift with 0 doctor coverage)
    let uncoveredSlots = 0;
    days.forEach(day => shifts.forEach(shift => {
      const doctorOn = staff.some(s => s.role === "Duty Doctor" && roster[cellKey(s.id, day, shift.id)] === "on");
      if (!doctorOn) uncoveredSlots++;
    }));
    return { totalShifts, leaves, uncoveredSlots };
  }, [roster, staff]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("spine_franchise_data").insert({
        record_type: "roster",
        owner_id: user?.id || null,
        staff_list: staff,
        roster_grid: roster,
        metadata: { savedAt: new Date().toISOString() },
      });
      toast.success("Roster saved!");
    } catch (err) { toast.error("Save failed"); }
    setSaving(false);
  };

  const cellStyle = (state: string) => {
    if (state === "on") return "bg-green-500 text-white";
    if (state === "leave") return "bg-red-200 text-red-700";
    return "bg-muted hover:bg-muted/70 text-muted-foreground";
  };
  const cellLabel = (state: string) => state === "on" ? "✓" : state === "leave" ? "L" : "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarClock className="h-6 w-6 text-cyan-600" />
            Staff Roster & Scheduling
          </h1>
          <p className="text-muted-foreground mt-1">
            Weekly shift scheduling for doctors & therapists — click cells to assign shifts
          </p>
        </div>
        <Badge className="bg-cyan-100 text-cyan-700">
          <Building2 className="h-3 w-3 mr-1" /> Franchise Tool #5
        </Badge>
      </div>

      {/* Legend + Stats */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-3 text-xs items-center">
          <span className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-green-500" /> On Duty</span>
          <span className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-red-200" /> Leave</span>
          <span className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-muted border" /> Off</span>
          <span className="text-muted-foreground">(click to cycle)</span>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1"><Check className="h-3 w-3 text-green-500" /> {stats.totalShifts} shifts assigned</Badge>
          {stats.uncoveredSlots > 0 && (
            <Badge className="bg-red-50 text-red-600 gap-1"><AlertTriangle className="h-3 w-3" /> {stats.uncoveredSlots} slots without doctor</Badge>
          )}
        </div>
      </div>

      {/* Shift timing reference */}
      <div className="grid grid-cols-3 gap-2">
        {shifts.map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.id}><CardContent className="pt-3 pb-2 flex items-center gap-2">
              <Icon className={`h-4 w-4 text-${s.color}-500`} />
              <div><p className="text-xs font-medium">{s.label}</p><p className="text-[10px] text-muted-foreground">{s.time}</p></div>
            </CardContent></Card>
          );
        })}
      </div>

      {/* Roster Grid */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-1"><Calendar className="h-4 w-4" /> Weekly Roster</CardTitle>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setShowAddStaff(!showAddStaff)}>
              <Plus className="h-3 w-3" /> Add Staff
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddStaff && (
            <div className="p-3 border rounded bg-muted/30 mb-3 flex gap-2 flex-wrap items-end">
              <div><label className="text-[10px] font-medium">Name</label><Input className="h-7 text-xs w-32" value={newStaff.name} onChange={e => setNewStaff(p => ({ ...p, name: e.target.value }))} placeholder="Staff name" /></div>
              <div><label className="text-[10px] font-medium">Role</label>
                <Select value={newStaff.role} onValueChange={v => setNewStaff(p => ({ ...p, role: v }))}>
                  <SelectTrigger className="h-7 text-xs w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Duty Doctor">Duty Doctor</SelectItem>
                    <SelectItem value="Male Therapist">Male Therapist</SelectItem>
                    <SelectItem value="Female Therapist">Female Therapist</SelectItem>
                    <SelectItem value="Receptionist">Receptionist</SelectItem>
                    <SelectItem value="Online Coordinator">Online Coordinator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><label className="text-[10px] font-medium">Phone</label><Input className="h-7 text-xs w-28" value={newStaff.phone} onChange={e => setNewStaff(p => ({ ...p, phone: e.target.value }))} placeholder="Contact" /></div>
              <Button size="sm" className="h-7 text-xs" onClick={addStaff}>Add</Button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-1 sticky left-0 bg-background z-10 min-w-[130px]">Staff</th>
                  {days.map(day => (
                    <th key={day} colSpan={3} className="text-center p-1 border-l">{day}</th>
                  ))}
                </tr>
                <tr className="text-[8px] text-muted-foreground">
                  <th className="sticky left-0 bg-background z-10"></th>
                  {days.map(day => shifts.map(s => (
                    <th key={`${day}-${s.id}`} className={`p-0.5 ${s.id === "morning" ? "border-l" : ""}`}>{s.label[0]}</th>
                  )))}
                </tr>
              </thead>
              <tbody>
                {staff.map(member => (
                  <tr key={member.id} className="border-t">
                    <td className="p-1 sticky left-0 bg-background z-10">
                      <div className="flex items-center gap-1">
                        <div>
                          <p className="font-medium text-[11px] leading-tight">{member.name}</p>
                          <Badge className={`${roleColors[member.role]} text-[7px]`}>{member.role}</Badge>
                        </div>
                        <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-auto" onClick={() => removeStaff(member.id)}>
                          <Trash2 className="h-2.5 w-2.5 text-red-400" />
                        </Button>
                      </div>
                    </td>
                    {days.map(day => shifts.map(shift => {
                      const state = roster[cellKey(member.id, day, shift.id)] || "off";
                      return (
                        <td key={`${day}-${shift.id}`} className={`p-0.5 ${shift.id === "morning" ? "border-l" : ""}`}>
                          <button
                            onClick={() => cycleCell(member.id, day, shift.id)}
                            className={`w-6 h-6 rounded text-[10px] font-bold transition ${cellStyle(state)}`}
                          >
                            {cellLabel(state)}
                          </button>
                        </td>
                      );
                    }))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Coverage Analysis */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><Stethoscope className="h-4 w-4" /> Doctor Coverage Check</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b">
                  <th className="text-left p-1">Shift</th>
                  {days.map(d => <th key={d} className="text-center p-1">{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {shifts.map(shift => (
                  <tr key={shift.id} className="border-b">
                    <td className="p-1 font-medium">{shift.label}</td>
                    {days.map(day => {
                      const docCount = staff.filter(s => s.role === "Duty Doctor" && roster[cellKey(s.id, day, shift.id)] === "on").length;
                      return (
                        <td key={day} className="p-1 text-center">
                          {docCount > 0
                            ? <span className="text-green-600 font-bold">✓ {docCount}</span>
                            : <span className="text-red-500">⚠ 0</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">A duty doctor should be present in every operating shift. ⚠ marks uncovered slots.</p>
        </CardContent>
      </Card>

      {/* Staffing Guidance */}
      <Card className="border-cyan-200 bg-cyan-50/30">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><UserCog className="h-4 w-4 text-cyan-600" /> Staffing Best Practices</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {[
              "Always have a duty doctor present during operating hours (legal requirement)",
              "Female therapist mandatory for female patient Panchakarma (modesty compliance)",
              "Male therapist for male patient therapies",
              "Give each staff 1 weekly off (rotate to maintain coverage)",
              "Peak hours (morning + evening) need full staff; afternoon can be lighter",
              "Cross-train receptionist on basic HMS + billing for backup",
              "Online coordinator can work flexible/remote hours",
              "Plan leave in advance — avoid same-day gaps in doctor coverage",
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <Check className="h-3 w-3 text-cyan-500 shrink-0 mt-0.5" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => { setRoster({}); toast.info("Roster cleared"); }}>Clear Roster</Button>
        <Button size="sm" className="gap-1" onClick={handleSave} disabled={saving}>
          <Save className="h-3 w-3" /> {saving ? "Saving..." : "Save Roster"}
        </Button>
      </div>
    </div>
  );
}
