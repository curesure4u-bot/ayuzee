import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarClock, Printer, Share2, CheckCircle, Circle } from "lucide-react";
import { toast } from "sonner";

const treatmentPlan = {
  patient: "Mr. Rajesh Kumar",
  title: "14-Day Panchakarma Journey – Kati Basti Protocol",
  doctor: "Dr. Anand Sharma",
  startDate: "2024-12-15",
  endDate: "2024-12-28",
  currentDay: 14,
  totalDays: 14,
};

const dailyPlan = [
  { day: 1, phase: "Purva Karma", activity: "Deepana-Pachana (Trikatu Churna 3g TDS)", status: "done" },
  { day: 2, phase: "Purva Karma", activity: "Deepana-Pachana + Mild Abhyanga", status: "done" },
  { day: 3, phase: "Purva Karma", activity: "Snehapana – Guggulutiktaka Ghritam 30ml", status: "done" },
  { day: 4, phase: "Purva Karma", activity: "Snehapana – Guggulutiktaka Ghritam 50ml", status: "done" },
  { day: 5, phase: "Purva Karma", activity: "Snehapana – Guggulutiktaka Ghritam 80ml", status: "done" },
  { day: 6, phase: "Purva Karma", activity: "Rest Day + Sarvanga Abhyanga + Bashpa Swedana", status: "done" },
  { day: 7, phase: "Pradhana Karma", activity: "Kati Basti – Dhanwantharam Tailam (45 min)", status: "done" },
  { day: 8, phase: "Pradhana Karma", activity: "Kati Basti + Nadi Swedana to lumbar region", status: "done" },
  { day: 9, phase: "Pradhana Karma", activity: "Kati Basti + Patra Pinda Sweda", status: "done" },
  { day: 10, phase: "Pradhana Karma", activity: "Kati Basti + Greeva Basti (added)", status: "done" },
  { day: 11, phase: "Pradhana Karma", activity: "Kati Basti + Matra Basti (60ml Anu Tailam)", status: "done" },
  { day: 12, phase: "Paschat Karma", activity: "Samsarjana Krama – Peya (rice water only)", status: "done" },
  { day: 13, phase: "Paschat Karma", activity: "Samsarjana Krama – Vilepi (thin rice gruel)", status: "done" },
  { day: 14, phase: "Paschat Karma", activity: "Samsarjana – Akrita Yusha, back to normal diet", status: "done" },
];

const phaseColors: Record<string, string> = {
  "Purva Karma": "bg-blue-100 text-blue-800",
  "Pradhana Karma": "bg-green-100 text-green-800",
  "Paschat Karma": "bg-orange-100 text-orange-800",
};

export default function TreatmentPlanner() {
  const handlePrint = () => toast.success("Treatment roadmap sent to printer");
  const handleShare = () => toast.success("Treatment plan shared via WhatsApp");

  const progress = Math.round((treatmentPlan.currentDay / treatmentPlan.totalDays) * 100);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarClock className="h-6 w-6 text-indigo-600" /> Treatment Planner
          </h1>
          <p className="text-muted-foreground">{treatmentPlan.patient} • {treatmentPlan.title}</p>
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

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress: Day {treatmentPlan.currentDay}/{treatmentPlan.totalDays}</span>
            <span className="text-sm font-bold text-green-600">{progress}% Complete</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Start: {treatmentPlan.startDate}</span>
            <span>End: {treatmentPlan.endDate}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Day-by-Day Treatment Roadmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {dailyPlan.map((day) => (
              <div key={day.day} className="flex items-center gap-3 p-2 rounded-lg border">
                {day.status === "done" ? (
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <span className="text-sm font-medium w-16 shrink-0">Day {day.day}</span>
                  <Badge className={`text-xs ${phaseColors[day.phase] || ""}`}>{day.phase}</Badge>
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
