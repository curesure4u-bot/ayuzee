import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Pill, FlaskConical, CreditCard, Leaf, FileText, Heart, Filter, ChevronDown } from "lucide-react";
import { toast } from "sonner";

const timelineEvents = [
  { id: 1, date: "2024-12-15", time: "10:30 AM", type: "visit", title: "OPD Consultation – Dr. Anand Sharma", detail: "Chief complaint: Chronic lower back pain (Kati Shoola). Prakriti: Vata-Kapha. Advised Panchakarma.", color: "bg-blue-500" },
  { id: 2, date: "2024-12-15", time: "11:00 AM", type: "prescription", title: "Prescription Issued", detail: "Yogaraja Guggulu 2 BD, Maharasnadi Kashayam 15ml BD before food, Dhanwantharam Tailam for external application.", color: "bg-green-500" },
  { id: 3, date: "2024-12-16", time: "09:00 AM", type: "therapy", title: "Panchakarma – Abhyanga + Swedana", detail: "Full body Abhyanga with Dhanwantharam Tailam (45 min) followed by Bashpa Swedana (15 min). Therapist: Mr. Suresh.", color: "bg-purple-500" },
  { id: 4, date: "2024-12-17", time: "08:30 AM", type: "lab", title: "Lab – ESR, CRP, RA Factor", detail: "ESR: 28 mm/hr (H), CRP: 12 mg/L (H), RA Factor: Negative. Suggests active inflammation.", color: "bg-orange-500" },
  { id: 5, date: "2024-12-18", time: "10:00 AM", type: "imaging", title: "X-Ray Lumbosacral Spine", detail: "Mild degenerative changes at L4-L5. No fracture or dislocation. Disc space narrowing noted.", color: "bg-indigo-500" },
  { id: 6, date: "2024-12-20", time: "09:30 AM", type: "nadi", title: "Nadi Pariksha Report", detail: "Vata aggravation detected. Pitta mildly elevated. Kapha stable. Recommended: Vata-shamana protocol.", color: "bg-teal-500" },
  { id: 7, date: "2024-12-22", time: "11:00 AM", type: "payment", title: "Payment – ₹8,500", detail: "Panchakarma package (7 days Kati Basti) – ₹7,000. Medicines – ₹1,500. Mode: UPI.", color: "bg-yellow-600" },
  { id: 8, date: "2024-12-28", time: "10:30 AM", type: "visit", title: "Follow-up – Dr. Anand Sharma", detail: "Patient reports 60% relief in back pain. Continue treatment for 7 more days. Added Kati Basti.", color: "bg-blue-500" },
];

const typeConfig: Record<string, { icon: typeof Activity; label: string }> = {
  visit: { icon: Heart, label: "Visit" },
  prescription: { icon: Pill, label: "Rx" },
  therapy: { icon: Leaf, label: "Therapy" },
  lab: { icon: FlaskConical, label: "Lab" },
  imaging: { icon: FileText, label: "Imaging" },
  nadi: { icon: Activity, label: "Nadi" },
  payment: { icon: CreditCard, label: "Payment" },
};

export default function PatientTimeline() {
  const handleExport = () => {
    toast.success("Timeline exported as PDF");
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Patient Timeline</h1>
          <p className="text-muted-foreground">Mr. Rajesh Kumar • UHID: AYZ-2024-001285</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-1" /> Filter</Button>
          <Button size="sm" onClick={handleExport}>Export PDF</Button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {Object.entries(typeConfig).map(([key, val]) => (
          <Badge key={key} variant="outline" className="cursor-pointer hover:bg-accent">
            <val.icon className="h-3 w-3 mr-1" /> {val.label}
          </Badge>
        ))}
      </div>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
        <div className="space-y-4">
          {timelineEvents.map((event) => {
            const config = typeConfig[event.type];
            const Icon = config?.icon || Activity;
            return (
              <div key={event.id} className="relative pl-10">
                <div className={`absolute left-2.5 w-3 h-3 rounded-full ${event.color} ring-2 ring-background`} />
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          <Icon className="h-3 w-3 mr-1" /> {config?.label}
                        </Badge>
                        <CardTitle className="text-sm font-medium">{event.title}</CardTitle>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{event.date} • {event.time}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">{event.detail}</p>
                    <Button variant="ghost" size="sm" className="mt-2 text-xs h-7 px-2">
                      <ChevronDown className="h-3 w-3 mr-1" /> View Details
                    </Button>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
