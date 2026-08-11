import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const timezones = [
  { label: "IST (UTC+5:30)", value: "Asia/Kolkata" },
  { label: "GST (UTC+4)", value: "Asia/Dubai" },
  { label: "GMT (UTC+0)", value: "Europe/London" },
  { label: "EST (UTC-5)", value: "America/New_York" },
  { label: "PST (UTC-8)", value: "America/Los_Angeles" },
  { label: "SGT (UTC+8)", value: "Asia/Singapore" },
];

const doctors = [
  { name: "Dr. Arjun Nair", specialization: "Panchakarma", rating: 4.9, priceUSD: 45, priceINR: 3745 },
  { name: "Dr. Fatima Al-Rashid", specialization: "Pulse Diagnosis", rating: 4.8, priceUSD: 55, priceINR: 4576 },
  { name: "Dr. Mei Chen", specialization: "Acupuncture + Ayurveda", rating: 4.7, priceUSD: 50, priceINR: 4160 },
  { name: "Dr. James Whitfield", specialization: "Integrative Medicine", rating: 4.6, priceUSD: 60, priceINR: 4992 },
];

const timeSlots = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00", "19:00"];

export default function InternationalTeleconsult() {
  const [selectedTZ, setSelectedTZ] = useState("Asia/Kolkata");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");

  const handleBook = () => {
    if (!selectedDoctor || !selectedSlot) {
      toast.error("Please select a doctor and time slot");
      return;
    }
    toast.success(`Booked ${selectedDoctor} at ${selectedSlot} (${selectedTZ})`);
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      <h1 className="text-3xl font-bold">International Teleconsultation</h1>
      <p className="text-muted-foreground">Book Ayurvedic consultations across time zones.</p>

      <Card>
        <CardHeader><CardTitle>Your Timezone</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {timezones.map((tz) => (
            <Button key={tz.value} variant={selectedTZ === tz.value ? "default" : "outline"} size="sm" onClick={() => setSelectedTZ(tz.value)}>
              {tz.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {doctors.map((doc) => (
          <Card key={doc.name} className={`cursor-pointer transition ${selectedDoctor === doc.name ? "ring-2 ring-primary" : ""}`} onClick={() => setSelectedDoctor(doc.name)}>
            <CardContent className="pt-6 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{doc.name}</h3>
                  <p className="text-sm text-muted-foreground">{doc.specialization}</p>
                </div>
                <Badge>⭐ {doc.rating}</Badge>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary">${doc.priceUSD} USD</Badge>
                <Badge variant="outline">₹{doc.priceINR} INR</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Available Slots</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {timeSlots.map((slot) => (
            <Button key={slot} variant={selectedSlot === slot ? "default" : "outline"} size="sm" onClick={() => setSelectedSlot(slot)}>
              {slot}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Button onClick={handleBook} className="w-full" size="lg">Book Teleconsultation</Button>
    </div>
  );
}
