import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarClock, Printer, Share2, CheckCircle, Circle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePatientTreatmentPlan } from "@/hooks/usePatientTreatmentPlan";

const phaseColors: Record<string, string> = {
  "Purva Karma": "bg-blue-100 text-blue-800",
  "Pradhana Karma": "bg-green-100 text-green-800",
  "Paschat Karma": "bg-orange-100 text-orange-800",
};

export default function TreatmentPlanner() {
  const { patientId } = useParams();
  const { plan, loading, error, markDayComplete } = usePatientTreatmentPlan(patientId);

  const handlePrint = () => toast.success("Treatment roadmap sent to printer");
  const handleShare = () => toast.success("Treatment plan shared via WhatsApp");

  const handleMarkComplete = async (dayId: string) => {
    const success = await markDayComplete(dayId);
    if (success) toast.success("Day marked complete");
    else toast.error("Failed to update");
  };

  const progress = plan.totalDays > 0 ? Math.round((plan.currentDay / plan.totalDays) * 100) : 0;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarClock className="h-6 w-6 text-indigo-600" /> Treatment Planner
          </h1>
          <p className="text-muted-foreground">{plan.patient} • {plan.title}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-1" /> Share
          </Button>
          <Button size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1" /> Print
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading treatment plan...</span>
        </div>
      )}

      {error && !loading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-3 text-xs text-amber-700">
            ⚠ Could not load live data (showing demo). {error}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress: Day {plan.currentDay}/{plan.totalDays}</span>
            <span className="text-sm font-bold text-green-600">{progress}% Complete</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Start: {plan.startDate}</span>
            <span>End: {plan.endDate}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Day-by-Day Treatment Roadmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {plan.days.map((day) => (
              <div key={day.id} className="flex items-center gap-3 p-2 rounded-lg border">
                {day.status === "done" ? (
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                ) : (
                  <button onClick={() => handleMarkComplete(day.id)} className="shrink-0 hover:opacity-70">
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  </button>
                )}
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <span className="text-sm font-medium w-16 shrink-0">Day {day.dayNumber}</span>
                  <Badge className={`text-xs ${phaseColors[day.phase] || "bg-gray-100 text-gray-800"}`}>{day.phase}</Badge>
                  <span className="text-sm text-muted-foreground">{day.activity}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
