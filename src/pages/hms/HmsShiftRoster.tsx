import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Clock, Plus, Users, Calendar, AlertTriangle, CheckCircle } from "lucide-react";

type ShiftType = { id: string; name: string; time: string; color: string };
type StaffShift = { id: string; name: string; role: string; dept: string; mon: string; tue: string; wed: string; thu: string; fri: string; sat: string; sun: string };

const shifts: ShiftType[] = [
  { id: "M", name: "Morning", time: "06:00-14:00", color: "bg-blue-100 text-blue-700" },
  { id: "A", name: "Afternoon", time: "14:00-22:00", color: "bg-amber-100 text-amber-700" },
  { id: "N", name: "Night", time: "22:00-06:00", color: "bg-purple-100 text-purple-700" },
  { id: "G", name: "General", time: "09:00-17:00", color: "bg-green-100 text-green-700" },
  { id: "O", name: "Off", time: "—", color: "bg-gray-100 text-gray-500" },
];

const mockRoster: StaffShift[] = [
  { id: "1", name: "Nurse Priya", role: "Nurse", dept: "IPD", mon: "M", tue: "M", wed: "M", thu: "A", fri: "A", sat: "A", sun: "O" },
  { id: "2", name: "Nurse Anu", role: "Nurse", dept: "IPD", mon: "A", tue: "A", wed: "A", thu: "M", fri: "M", sat: "M", sun: "O" },
  { id: "3", name: "Nurse Kavitha", role: "Nurse", dept: "Panchakarma", mon: "M", tue: "M", wed: "M", thu: "M", fri: "M", sat: "M", sun: "O" },
  { id: "4", name: "Suresh Therapist", role: "Therapist", dept: "Panchakarma", mon: "G", tue: "G", wed: "G", thu: "G", fri: "G", sat: "G", sun: "O" },
  { id: "5", name: "Priya Therapist", role: "Therapist", dept: "Panchakarma", mon: "G", tue: "G", wed: "G", thu: "G", fri: "G", sat: "O", sun: "O" },
  { id: "6", name: "Rajesh K", role: "Receptionist", dept: "Front Office", mon: "G", tue: "G", wed: "G", thu: "G", fri: "G", sat: "G", sun: "O" },
  { id: "7", name: "Vikram R", role: "Pharmacist", dept: "Pharmacy", mon: "M", tue: "M", wed: "M", thu: "A", fri: "A", sat: "M", sun: "O" },
  { id: "8", name: "Anita D", role: "Lab Tech", dept: "Laboratory", mon: "M", tue: "M", wed: "M", thu: "M", fri: "M", sat: "M", sun: "O" },
  { id: "9", name: "Night Nurse Sita", role: "Nurse", dept: "IPD", mon: "N", tue: "N", wed: "N", thu: "O", fri: "O", sat: "N", sun: "N" },
];

const HmsShiftRoster = () => {
  const [roster] = useState<StaffShift[]>(mockRoster);
  const [addOpen, setAddOpen] = useState(false);
  const [weekOf] = useState("Jul 14-20, 2026");

  const getShiftBadge = (code: string) => {
    const s = shifts.find(sh => sh.id === code);
    if (!s) return <span>—</span>;
    return <Badge className={`text-[10px] ${s.color} border-0`}>{s.id}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Clock className="h-6 w-6 text-indigo-600" /> Staff Shift Rostering
          </h1>
          <p className="text-sm text-muted-foreground">Shift management, staff assignment, overlap detection & overtime tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">← Prev Week</Button>
          <Badge variant="outline" className="px-3 py-1">{weekOf}</Badge>
          <Button variant="outline" size="sm">Next Week →</Button>
          <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="mr-1 h-4 w-4" /> Assign Shift</Button>
        </div>
      </div>

      {/* Shift Legend */}
      <div className="flex flex-wrap gap-2">
        {shifts.map(s => (
          <div key={s.id} className="flex items-center gap-1">
            <Badge className={`text-[10px] ${s.color} border-0`}>{s.id}</Badge>
            <span className="text-xs text-muted-foreground">{s.name} ({s.time})</span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><Users className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">{roster.length}</p><p className="text-xs text-muted-foreground">Staff Rostered</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><CheckCircle className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold mt-1">0</p><p className="text-xs text-muted-foreground">Overlaps</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><AlertTriangle className="h-5 w-5 mx-auto text-amber-600" /><p className="text-xl font-bold mt-1">2</p><p className="text-xs text-muted-foreground">Overtime ({">"} 48h)</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Calendar className="h-5 w-5 mx-auto text-purple-600" /><p className="text-xl font-bold mt-1">3</p><p className="text-xs text-muted-foreground">Leave Requests</p></CardContent></Card>
      </div>

      {/* Roster Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Staff</th>
                  <th className="px-3 py-2 text-left font-medium">Role</th>
                  <th className="px-3 py-2 text-left font-medium">Dept</th>
                  <th className="px-3 py-2 text-center font-medium">Mon</th>
                  <th className="px-3 py-2 text-center font-medium">Tue</th>
                  <th className="px-3 py-2 text-center font-medium">Wed</th>
                  <th className="px-3 py-2 text-center font-medium">Thu</th>
                  <th className="px-3 py-2 text-center font-medium">Fri</th>
                  <th className="px-3 py-2 text-center font-medium">Sat</th>
                  <th className="px-3 py-2 text-center font-medium">Sun</th>
                  <th className="px-3 py-2 text-center font-medium">Hours</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((r) => {
                  const days = [r.mon, r.tue, r.wed, r.thu, r.fri, r.sat, r.sun];
                  const hours = days.filter(d => d !== "O").length * 8;
                  return (
                    <tr key={r.id} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2 font-medium">{r.name}</td>
                      <td className="px-3 py-2 text-xs">{r.role}</td>
                      <td className="px-3 py-2 text-xs">{r.dept}</td>
                      <td className="px-3 py-2 text-center">{getShiftBadge(r.mon)}</td>
                      <td className="px-3 py-2 text-center">{getShiftBadge(r.tue)}</td>
                      <td className="px-3 py-2 text-center">{getShiftBadge(r.wed)}</td>
                      <td className="px-3 py-2 text-center">{getShiftBadge(r.thu)}</td>
                      <td className="px-3 py-2 text-center">{getShiftBadge(r.fri)}</td>
                      <td className="px-3 py-2 text-center">{getShiftBadge(r.sat)}</td>
                      <td className="px-3 py-2 text-center">{getShiftBadge(r.sun)}</td>
                      <td className="px-3 py-2 text-center font-medium">{hours}h</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Shift</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Staff Member *</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
                <SelectContent>{roster.map(r => <SelectItem key={r.id} value={r.name}>{r.name} ({r.role})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date</Label><Input type="date" /></div>
              <div><Label>Shift *</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{shifts.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.time})</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Notes</Label><Input placeholder="Swap/overtime reason..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Shift assigned"); setAddOpen(false); }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsShiftRoster;
