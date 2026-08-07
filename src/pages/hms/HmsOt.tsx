import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Syringe, Plus, Calendar, CheckCircle, Activity, Loader2,
} from "lucide-react";
import { useOtSchedule } from "@/hooks/useOtSchedule";

const HmsOt = () => {
  const { rooms, schedule, inProgress, upcoming, completed, loading, error, updateStatus } = useOtSchedule();

  const handleStart = async (id: string) => {
    const success = await updateStatus(id, "in_progress");
    if (success) toast.success("Procedure started");
  };

  const handleComplete = async (id: string) => {
    const success = await updateStatus(id, "completed");
    if (success) toast.success("Procedure completed");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Syringe className="h-6 w-6 text-rose-600" /> Operation Theater Management
          </h1>
          <p className="text-sm text-muted-foreground">Multi-OT scheduling, surgical team assignment & procedure tracking</p>
        </div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Schedule Procedure</Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-4 text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Loading OT data...</span>
        </div>
      )}

      {error && !loading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-2 text-xs text-amber-700">⚠ Could not load live data (showing demo). {error}</CardContent>
        </Card>
      )}

      {/* OT Room Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {rooms.map((room) => (
          <Card key={room.id} className={room.status === "in_use" ? "border-red-300 bg-red-50/20" : room.status === "cleaning" ? "border-amber-300 bg-amber-50/20" : "border-green-200 bg-green-50/20"}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-sm">{room.name}</p>
                <Badge variant={room.status === "in_use" ? "destructive" : room.status === "available" ? "outline" : "secondary"}
                  className={`text-xs capitalize ${room.status === "available" ? "text-green-600" : ""}`}>
                  {room.status.replace("_", " ")}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{room.type}</p>
              {room.currentCase && <p className="text-xs font-medium mt-1 text-red-700">{room.currentCase}</p>}
              <div className="mt-2">
                <div className="flex justify-between text-[10px] mb-0.5"><span>Utilization</span><span>{room.utilizationToday}%</span></div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${room.utilizationToday > 70 ? "bg-green-500" : room.utilizationToday > 40 ? "bg-amber-500" : "bg-red-400"}`} style={{ width: `${room.utilizationToday}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><Activity className="h-5 w-5 mx-auto text-red-600" /><p className="text-xl font-bold mt-1">{inProgress}</p><p className="text-xs text-muted-foreground">In Progress</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Calendar className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">{upcoming}</p><p className="text-xs text-muted-foreground">Upcoming</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><CheckCircle className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold mt-1">{completed}</p><p className="text-xs text-muted-foreground">Completed</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Syringe className="h-5 w-5 mx-auto text-purple-600" /><p className="text-xl font-bold mt-1">{schedule.length}</p><p className="text-xs text-muted-foreground">Total Today</p></CardContent></Card>
      </div>

      {/* Schedule Table */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Today's OT Schedule</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50"><tr>
                <th className="px-3 py-2 text-left font-medium">OT</th>
                <th className="px-3 py-2 text-left font-medium">Patient</th>
                <th className="px-3 py-2 text-left font-medium">Procedure</th>
                <th className="px-3 py-2 text-left font-medium">Surgeon</th>
                <th className="px-3 py-2 text-left font-medium">Time</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2 text-center font-medium">Action</th>
              </tr></thead>
              <tbody>
                {schedule.map((s) => (
                  <tr key={s.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 text-xs font-medium">{s.otRoom}</td>
                    <td className="px-3 py-2">{s.patient}</td>
                    <td className="px-3 py-2 text-xs">{s.procedure}</td>
                    <td className="px-3 py-2 text-xs">{s.surgeon}</td>
                    <td className="px-3 py-2 text-xs">{s.scheduledTime}</td>
                    <td className="px-3 py-2">
                      <Badge variant={s.status === "completed" ? "outline" : s.status === "in_progress" ? "destructive" : "secondary"}
                        className={`text-xs capitalize ${s.status === "completed" ? "text-green-600" : ""}`}>
                        {s.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-center">
                      {s.status === "scheduled" && <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => handleStart(s.id)}>Start</Button>}
                      {s.status === "in_progress" && <Button size="sm" variant="ghost" className="h-6 text-xs text-green-600" onClick={() => handleComplete(s.id)}>Complete</Button>}
                    </td>
                  </tr>
                ))}
                {schedule.length === 0 && (
                  <tr><td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">No procedures scheduled today</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HmsOt;
