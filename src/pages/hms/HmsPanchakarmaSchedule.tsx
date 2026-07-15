import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const therapists = ["Suresh (M)", "Priya (F)", "Arun (M)", "Kavitha (F)", "Rajesh (M)"];
const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

type ScheduleEntry = {
  therapist: string;
  time: string;
  patient: string;
  therapy: string;
  room: string;
};

const mockSchedule: ScheduleEntry[] = [
  { therapist: "Suresh (M)", time: "09:00", patient: "Ramesh K.", therapy: "Abhyanga", room: "R1" },
  { therapist: "Suresh (M)", time: "10:00", patient: "Anand S.", therapy: "Nasya", room: "R4" },
  { therapist: "Priya (F)", time: "09:00", patient: "Lakshmi D.", therapy: "Shirodhara", room: "R2" },
  { therapist: "Priya (F)", time: "11:00", patient: "Meera N.", therapy: "Njavarakizhi", room: "R1" },
  { therapist: "Arun (M)", time: "10:00", patient: "Sunil M.", therapy: "Vasti", room: "R3" },
  { therapist: "Arun (M)", time: "14:00", patient: "Ramesh K.", therapy: "Pizhichil", room: "R1" },
  { therapist: "Kavitha (F)", time: "11:00", patient: "Meera N.", therapy: "Pizhichil", room: "R1" },
  { therapist: "Kavitha (F)", time: "15:00", patient: "Lakshmi D.", therapy: "Elakizhi", room: "R2" },
];

const HmsPanchakarmaSchedule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [viewMode, setViewMode] = useState<"therapist" | "room">("therapist");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-amber-600" /> Therapy Schedule
          </h1>
          <p className="text-sm text-muted-foreground">
            Weekly therapy schedule view with therapist and room allocation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={viewMode} onValueChange={(v: "therapist" | "room") => setViewMode(v)}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="therapist">By Therapist</SelectItem>
              <SelectItem value="room">By Room</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date Navigation */}
      <Card>
        <CardContent className="p-3 flex items-center justify-between">
          <Button variant="ghost" size="sm"><ChevronLeft className="h-4 w-4" /></Button>
          <div className="text-center">
            <p className="font-medium">{new Date(selectedDate).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          <Button variant="ghost" size="sm"><ChevronRight className="h-4 w-4" /></Button>
        </CardContent>
      </Card>

      {/* Schedule Grid */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-3 py-2 text-left font-medium w-[100px]">Time</th>
                {therapists.map((t) => (
                  <th key={t} className="px-3 py-2 text-left font-medium">{t}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time) => (
                <tr key={time} className="border-b">
                  <td className="px-3 py-3 font-medium text-muted-foreground">{time}</td>
                  {therapists.map((therapist) => {
                    const entry = mockSchedule.find((s) => s.therapist === therapist && s.time === time);
                    return (
                      <td key={`${therapist}-${time}`} className="px-2 py-2">
                        {entry ? (
                          <div className="rounded-md bg-primary/10 border border-primary/20 p-2 text-xs">
                            <p className="font-medium">{entry.patient}</p>
                            <p className="text-muted-foreground">{entry.therapy}</p>
                            <Badge variant="outline" className="text-[10px] mt-1">{entry.room}</Badge>
                          </div>
                        ) : (
                          <div className="rounded-md border border-dashed border-muted-foreground/20 p-2 text-xs text-center text-muted-foreground">
                            —
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Therapist Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {therapists.map((t) => {
          const count = mockSchedule.filter((s) => s.therapist === t).length;
          return (
            <Card key={t}>
              <CardContent className="p-3">
                <p className="text-sm font-medium">{t}</p>
                <p className="text-xs text-muted-foreground">{count} sessions today</p>
                <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: `${(count / 5) * 100}%` }} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default HmsPanchakarmaSchedule;
