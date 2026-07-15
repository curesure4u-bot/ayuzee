import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Eye, Calendar, CheckCircle, Clock, Activity, Pill, Search } from "lucide-react";

type SessionView = {
  day: number; date: string; therapies: { name: string; time: string; status: "done" | "today" | "upcoming" | "skipped"; therapist: string; room: string; consumables: string; autoDeducted: boolean }[];
};

type PatientTreatmentPlan = {
  patient: string; uhid: string; package: string; totalDays: number;
  completedDays: number; currentDay: number; doctor: string;
  medicines: { name: string; dose: string; frequency: string; remaining: number; total: number }[];
  sessions: SessionView[];
};

const mockPlan: PatientTreatmentPlan = {
  patient: "Ramesh Kumar", uhid: "AYZ-2026-001", package: "14-Day Full Panchakarma", totalDays: 14,
  completedDays: 9, currentDay: 10, doctor: "Dr. Meena Patel",
  medicines: [
    { name: "Yogaraja Guggulu", dose: "2 tabs TDS", frequency: "After food", remaining: 12, total: 30 },
    { name: "Rasnasaptakam Kashayam", dose: "15ml BD", frequency: "Before food", remaining: 12, total: 30 },
    { name: "Ashwagandha Churnam", dose: "3g HS", frequency: "With milk", remaining: 18, total: 30 },
  ],
  sessions: [
    { day: 8, date: "2026-07-12", therapies: [{ name: "Abhyanga", time: "09:00", status: "done", therapist: "Suresh", room: "R1", consumables: "Dhanwantharam 200ml", autoDeducted: true }, { name: "Kashaya Vasti", time: "10:30", status: "done", therapist: "Arun", room: "R3", consumables: "Dashamoola 400ml", autoDeducted: true }] },
    { day: 9, date: "2026-07-13", therapies: [{ name: "Abhyanga", time: "09:00", status: "done", therapist: "Suresh", room: "R1", consumables: "Dhanwantharam 200ml", autoDeducted: true }, { name: "Sneha Vasti", time: "10:30", status: "done", therapist: "Arun", room: "R3", consumables: "Ksheerabala 100ml", autoDeducted: true }] },
    { day: 10, date: "2026-07-14", therapies: [{ name: "Abhyanga", time: "09:00", status: "done", therapist: "Priya", room: "R1", consumables: "Dhanwantharam 200ml", autoDeducted: true }, { name: "Kashaya Vasti", time: "10:30", status: "today", therapist: "Arun", room: "R3", consumables: "Dashamoola 400ml", autoDeducted: false }, { name: "Janu Basti", time: "14:00", status: "today", therapist: "Kavitha", room: "R2", consumables: "Kottamchukkadi 150ml", autoDeducted: false }] },
    { day: 11, date: "2026-07-15", therapies: [{ name: "Abhyanga", time: "09:00", status: "upcoming", therapist: "Suresh", room: "R1", consumables: "Dhanwantharam 200ml", autoDeducted: false }, { name: "Sneha Vasti", time: "10:30", status: "upcoming", therapist: "Arun", room: "R3", consumables: "Ksheerabala 100ml", autoDeducted: false }, { name: "Janu Basti", time: "14:00", status: "upcoming", therapist: "Kavitha", room: "R2", consumables: "Kottamchukkadi 150ml", autoDeducted: false }] },
    { day: 12, date: "2026-07-16", therapies: [{ name: "Abhyanga", time: "09:00", status: "upcoming", therapist: "Priya", room: "R1", consumables: "Dhanwantharam 200ml", autoDeducted: false }, { name: "Kashaya Vasti", time: "10:30", status: "upcoming", therapist: "Arun", room: "R3", consumables: "Dashamoola 400ml", autoDeducted: false }] },
  ],
};

const HmsTreatmentView = () => {
  const [plan] = useState<PatientTreatmentPlan>(mockPlan);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Eye className="h-6 w-6 text-purple-600" /> Live Treatment View
          </h1>
          <p className="text-sm text-muted-foreground">Real-time treatment visibility · Auto-consumable deduction · Session progress for patients & staff</p>
        </div>
        <Select defaultValue="ramesh">
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="ramesh">Ramesh Kumar</SelectItem><SelectItem value="lakshmi">Lakshmi Devi</SelectItem><SelectItem value="sunil">Sunil Menon</SelectItem></SelectContent>
        </Select>
      </div>

      {/* Patient Package Summary */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center">
            <div><p className="text-xs text-muted-foreground">Patient</p><p className="font-bold text-lg">{plan.patient}</p><p className="text-xs text-muted-foreground">{plan.uhid}</p></div>
            <div><p className="text-xs text-muted-foreground">Package</p><p className="font-medium">{plan.package}</p><p className="text-xs text-muted-foreground">{plan.doctor}</p></div>
            <div><p className="text-xs text-muted-foreground">Progress</p>
              <div className="flex items-center gap-2 mt-1"><Progress value={(plan.completedDays / plan.totalDays) * 100} className="h-3 flex-1" /><span className="text-sm font-bold">{plan.completedDays}/{plan.totalDays}</span></div>
            </div>
            <div className="text-center"><p className="text-3xl font-bold text-purple-700">Day {plan.currentDay}</p><p className="text-xs text-muted-foreground">of {plan.totalDays}</p></div>
            <div className="text-center"><Badge className="bg-purple-100 text-purple-700 border-purple-300 text-sm px-3 py-1">{Math.round((plan.completedDays / plan.totalDays) * 100)}% Complete</Badge></div>
          </div>
        </CardContent>
      </Card>

      {/* Session Timeline (Gantt-like) */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4" /> Treatment Schedule (Day-by-Day)</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {plan.sessions.map((session) => (
              <div key={session.day} className={`rounded-lg border p-3 ${session.day === plan.currentDay ? "border-purple-300 bg-purple-50/30 ring-1 ring-purple-200" : ""}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={session.day < plan.currentDay ? "outline" : session.day === plan.currentDay ? "default" : "secondary"} className={`text-xs ${session.day < plan.currentDay ? "text-green-600" : ""}`}>
                      Day {session.day}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{session.date}</span>
                    {session.day === plan.currentDay && <Badge className="bg-purple-600 text-white text-[9px]">TODAY</Badge>}
                  </div>
                  <span className="text-xs text-muted-foreground">{session.therapies.length} therapies</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {session.therapies.map((t, i) => (
                    <div key={i} className={`p-2 rounded border ${t.status === "done" ? "bg-green-50 border-green-200" : t.status === "today" ? "bg-blue-50 border-blue-200" : "bg-card"}`}>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium">{t.name}</p>
                        {t.status === "done" ? <CheckCircle className="h-3 w-3 text-green-600" /> : t.status === "today" ? <Activity className="h-3 w-3 text-blue-600" /> : <Clock className="h-3 w-3 text-muted-foreground" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{t.time} · {t.therapist} · {t.room}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[9px] text-muted-foreground">{t.consumables}</span>
                        {t.autoDeducted && <Badge variant="outline" className="text-[8px] text-green-600">Stock deducted</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Medicines with auto-deduction */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Pill className="h-4 w-4" /> Active Medicines (Auto-deducting from Pharmacy)</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {plan.medicines.map((m) => (
              <div key={m.name} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="text-sm font-medium">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.dose} · {m.frequency}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{m.remaining} days left</p>
                    <Progress value={(m.remaining / m.total) * 100} className="h-1.5 w-20" />
                  </div>
                  <Badge variant="outline" className="text-[9px] text-green-600">Auto-deduct</Badge>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-3">
            Consumables (oils, herbs) are automatically deducted from pharmacy inventory when a therapy session is marked complete. Medicine costs auto-added to patient billing.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HmsTreatmentView;
