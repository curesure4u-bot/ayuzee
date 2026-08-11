import { Video, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const steps = [
  "Patient initiates from e-Sanjeevani",
  "Routed to Ayuzee AYUSH doctor",
  "Consultation recorded in both platforms",
  "Prescription synced to ABHA",
];

const stats = [
  { label: "Sessions This Month", value: "87" },
  { label: "Avg Duration", value: "18 min" },
  { label: "Patient Satisfaction", value: "4.6/5" },
  { label: "Referrals from eSanjeevani", value: "23" },
];

const services = ["General Ayurveda OPD", "Panchakarma Consultation", "Yoga Therapy", "Diet Counseling"];

export default function ESanjeevanibridge() {
  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Video className="h-8 w-8 text-teal-600" />
        <div>
          <h1 className="text-2xl font-bold">e-Sanjeevani Bridge</h1>
          <p className="text-muted-foreground">Connect Ayuzee with India's national telemedicine platform</p>
        </div>
      </div>

      <Card className="border-teal-200 bg-teal-50">
        <CardContent className="flex items-center justify-between p-4">
          <div className="space-y-1">
            <p className="font-medium">Bridge Status: <Badge className="bg-green-100 text-green-800">Active</Badge></p>
            <p className="text-sm text-muted-foreground">Sessions today: 12 • Total linked patients: 345</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>How It Works</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-muted rounded p-2 text-sm">
                  <span className="font-bold text-teal-600">{i + 1}.</span> {step}
                </div>
                {i < steps.length - 1 && <ArrowRight className="h-4 w-4 hidden md:block text-muted-foreground" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="text-center p-4">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Button onClick={() => toast.info("Redirecting to e-Sanjeevani portal...")}>Open e-Sanjeevani Portal</Button>
        <Button variant="outline" onClick={() => toast.success("Pending records synced successfully")}>Sync Pending Records</Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Supported Services</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {services.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
        </CardContent>
      </Card>
    </div>
  );
}
