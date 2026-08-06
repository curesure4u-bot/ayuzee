import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Droplets, Send, IndianRupee } from "lucide-react";

type Procedure = {
  name: string;
  duration: string;
  oils: string;
  medicines: string;
  poorvakarma: string;
  diet: string;
  instructions: string;
  cost: number;
};

const procedures: Record<string, Procedure> = {
  vamana: { name: "Vamana", duration: "1 day (+ 7 days Poorvakarma)", oils: "Phala Ghrita (internal Snehapana x 5-7 days)", medicines: "Madanaphala Pippali Churna, Vacha, Saindhava, Madhu, Yashtimadhu Kwatha", poorvakarma: "Snehapana (Phala Ghrita, increasing dose x 5-7 days), Sarvanga Abhyanga + Bashpa Sweda x 3 days", diet: "Poorvakarma: Peya → Vilepi → Yusha; Post: Samsarjana Krama (7 days)", instructions: "Empty stomach procedure. Patient must be observed 6 hours post. Monitor vitals. Contraindicated in pregnancy, children, debilitated.", cost: 12000 },
  virechana: { name: "Virechana", duration: "1 day (+ 7 days Poorvakarma)", oils: "Trivrit Lehya or Abhayadi Modaka; Eranda Taila option", medicines: "Trivrit, Kutaja, Draksha, Haritaki, Aragvadha", poorvakarma: "Snehapana (Panchatikta Ghrita x 5-7 days), Abhyanga + Swedana x 3 days", diet: "Samsarjana Krama post-procedure (Peya → Vilepi → Akruta Yusha → Kruta Yusha)", instructions: "Procedure early morning. Target 15-30 Vegas. Monitor fluid balance. Rest for 7 days post.", cost: 8000 },
  basti_yoga: { name: "Yoga Basti (8 days)", duration: "8 days (5 Anuvasana + 3 Niruha)", oils: "Dhanvantara Taila / Sahacharadi Taila (Anuvasana); Dashamula Kwatha (Niruha)", medicines: "Dashamula, Madhu, Saindhava, Shatapushpa Kalka, Taila, Kwatha", poorvakarma: "Local Abhyanga (Kati region) + Nadi Sweda before each Basti", diet: "Light, warm food. Avoid Vata-aggravating items. No heavy meals 3 hrs before", instructions: "Alternating schedule: A-N-A-N-A-N-A-A. Retain Anuvasana min 6 hrs. Niruha retention 48 min ideal.", cost: 18000 },
  nasya: { name: "Nasya (Marsha)", duration: "7 days", oils: "Anu Taila / Shadbindu Taila (6-8 drops each nostril)", medicines: "Anu Taila, Vacha Churna (Pradhamana if Kapha), Haridra dhuma post", poorvakarma: "Mukha Abhyanga with Bala Taila + Nadi Sweda to face/neck x 10 min", diet: "Warm liquid diet 1 hr before. Avoid cold water, cold breeze for 2 hrs post", instructions: "Supine position, head tilted back. Patient to spit out secretions. Best time: morning. Avoid in rain/extreme cold.", cost: 7000 },
  raktamokshana: { name: "Raktamokshana (Jalaukavacharana)", duration: "Single session (repeat per indication)", oils: "No oil needed (clean area with Haridra paste post)", medicines: "Haridra paste, bandage, Jaloukas (medicinal leeches) — 3-5 per session", poorvakarma: "Light Snehana + Swedana of local area. Verify Hb > 10 g/dL", diet: "Normal diet. Iron-rich foods post-procedure. Avoid sour/spicy x 24 hrs", instructions: "Apply leeches to affected site. Duration 30-45 min. Post: turmeric dressing. Monitor for excess bleeding. CI: anemia, pregnancy.", cost: 3500 },
  shirodhara: { name: "Shirodhara", duration: "7-14 days (45 min/session)", oils: "Ksheerabala Taila / Brahmi Taila / Takra (buttermilk for Pitta)", medicines: "Brahmi Taila, Ksheerabala 101 Avartana, warm milk option", poorvakarma: "Shiro Abhyanga (head massage) x 10 min before each session", diet: "Sattvic diet. Avoid stimulants (caffeine, spices). Early dinner.", instructions: "Patient supine, eyes covered. Oil stream at Ajna point. Maintain oil temperature 38-40°C. Ideal for insomnia, anxiety, migraine.", cost: 21000 },
  kati_basti: { name: "Kati Basti", duration: "7-14 days (30-40 min/session)", oils: "Dhanvantara Taila / Murivenna / Kottamchukkadi Taila", medicines: "Selected medicated oil retained in dough dam at lumbar region", poorvakarma: "Light Abhyanga of lower back area", diet: "Warm, light food. Avoid heavy lifting for 2 hrs post", instructions: "Warm oil pool at lumbar spine using black gram dough ring. Maintain warmth. Best for Gridhrasi, Kati Shoola.", cost: 14000 },
  greeva_basti: { name: "Greeva Basti", duration: "7-14 days (30 min/session)", oils: "Kottamchukkadi Taila / Mahanarayana Taila", medicines: "Medicated oil retained in dough dam at cervical region", poorvakarma: "Greeva Abhyanga (neck massage)", diet: "Avoid cold foods, AC exposure post-treatment", instructions: "Dough dam at cervical region. Warm oil retained 30 min. Best for cervical spondylosis, neck pain.", cost: 14000 },
};

const PanchakarmaPrescription = () => {
  const [selected, setSelected] = useState<string>("");
  const proc = selected ? procedures[selected] : null;

  const handlePrescribe = () => toast.success(`${proc?.name} therapy plan prescribed to patient successfully`);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Droplets className="h-6 w-6 text-primary" /> Panchakarma Prescription Builder
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Ref: Charaka Samhita — Siddhi Sthana</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Select Procedure</CardTitle></CardHeader>
        <CardContent>
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="w-full sm:w-80">
              <SelectValue placeholder="Choose a Panchakarma procedure..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(procedures).map(([key, p]) => (
                <SelectItem key={key} value={key}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {proc && (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Duration</CardTitle></CardHeader>
              <CardContent><p className="text-sm">{proc.duration}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Cost Estimate</CardTitle></CardHeader>
              <CardContent><p className="text-sm flex items-center gap-1"><IndianRupee className="h-4 w-4" /> {proc.cost.toLocaleString("en-IN")}</p></CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Oils / Ghrita Required</CardTitle></CardHeader>
            <CardContent><p className="text-sm">{proc.oils}</p></CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Medicines for Procedure</CardTitle></CardHeader>
            <CardContent><p className="text-sm">{proc.medicines}</p></CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Poorvakarma Requirements</CardTitle></CardHeader>
            <CardContent><p className="text-sm">{proc.poorvakarma}</p></CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Diet Plan (Per Phase)</CardTitle></CardHeader>
            <CardContent><p className="text-sm">{proc.diet}</p></CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Patient Instructions & Contraindications</CardTitle></CardHeader>
            <CardContent><p className="text-sm">{proc.instructions}</p></CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handlePrescribe} className="gap-2"><Send className="h-4 w-4" /> Prescribe to Patient</Button>
          </div>
        </>
      )}

      {!proc && (
        <div className="text-center py-12 text-muted-foreground">
          <Droplets className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Select a procedure above to auto-fill prescription details</p>
        </div>
      )}
    </div>
  );
};

export default PanchakarmaPrescription;
