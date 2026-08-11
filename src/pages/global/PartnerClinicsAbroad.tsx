import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const clinics = [
  { city: "London", name: "Ayurveda Life Clinic", systems: ["Panchakarma", "Pulse Diagnosis", "Yoga Therapy"], verified: true },
  { city: "Dubai", name: "Al Shifa Ayurvedic Center", systems: ["Panchakarma", "Marma Therapy", "Detox"], verified: true },
  { city: "Singapore", name: "Wellness Vedic SG", systems: ["Ayurveda", "Siddha", "Naturopathy"], verified: true },
  { city: "New York", name: "Manhattan Ayurveda", systems: ["Integrative Ayurveda", "Nutrition", "Meditation"], verified: true },
  { city: "Melbourne", name: "Southern Cross Ayurveda", systems: ["Panchakarma", "Herbal Medicine", "Prenatal Care"], verified: true },
  { city: "Berlin", name: "Vedic Healing Berlin", systems: ["Ayurveda", "Yoga", "Sound Therapy"], verified: false },
  { city: "Toronto", name: "Maple Leaf Wellness", systems: ["Ayurveda", "Acupuncture", "Dietetics"], verified: true },
  { city: "Muscat", name: "Oman Ayush Clinic", systems: ["Panchakarma", "Unani", "Ayurveda"], verified: true },
];

export default function PartnerClinicsAbroad() {
  const handleApply = () => {
    toast.success("Partner application submitted! We'll review within 48 hours.");
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Partner Clinics Abroad</h1>
          <p className="text-muted-foreground">Our verified Ayurvedic clinic network across the globe.</p>
        </div>
        <Button onClick={handleApply}>Apply as Partner</Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {clinics.map((clinic) => (
          <Card key={clinic.city}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base">{clinic.city}</CardTitle>
                {clinic.verified && <Badge variant="default" className="text-xs">✓ Verified</Badge>}
              </div>
              <p className="text-sm font-medium text-muted-foreground">{clinic.name}</p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {clinic.systems.map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
