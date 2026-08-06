import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Printer, Share2, Download } from "lucide-react";
import { toast } from "sonner";

const dischargeSummaryData = {
  patient: "Mr. Rajesh Kumar",
  uhid: "AYZ-2024-001285",
  age: 42,
  gender: "Male",
  admissionDate: "2024-12-15",
  dischargeDate: "2024-12-28",
  ward: "Panchakarma Wing – Room 204",
  doctor: "Dr. Anand Sharma (MS Ayurveda – Kayachikitsa)",
  diagnosis: {
    icd: "M54.5 – Low Back Pain",
    ayush: "Kati Shoola (Vata-Kapha Anubandha)",
  },
  treatmentGiven: [
    "Deepana-Pachana with Trikatu Churna × 3 days",
    "Snehapana – Guggulutiktaka Ghritam (3 days, upto 80ml)",
    "Sarvanga Abhyanga + Bashpa Swedana × 5 days",
    "Kati Basti with Dhanwantharam Tailam × 7 days",
    "Patra Pinda Sweda × 3 days",
    "Matra Basti – Anu Tailam 60ml × 2 days",
    "Samsarjana Krama (3 days post-procedure diet)",
  ],
  medicinesOnDischarge: [
    { name: "Yogaraja Guggulu", dose: "2 tabs BD after food", duration: "30 days", system: "Ayurveda" },
    { name: "Maharasnadi Kashayam", dose: "15ml BD with warm water", duration: "30 days", system: "Ayurveda" },
    { name: "Ashwagandha Churna", dose: "3g HS with milk", duration: "60 days", system: "Ayurveda" },
    { name: "Cholecalciferol 60K", dose: "1 sachet/week", duration: "8 weeks", system: "Modern" },
  ],
  dietAdvice: [
    "Warm, freshly cooked food; avoid cold and stale items",
    "Include ghee in diet – 2 tsp daily",
    "Avoid Viruddha Ahara (milk+fish, honey+ghee equal)",
    "Light dinner before 8 PM (Laghu Bhojana at night)",
    "Include Rasam/soup with Jeeraka, Dhanyaka daily",
  ],
  followUpPlan: "Review after 15 days with Dr. Anand Sharma. Repeat ESR/CRP. Continue Yoga protocol.",
  conditionAtDischarge: "Improved. 70% relief in low back pain. Able to walk without support. Morning stiffness absent.",
};

export default function DischargeSummary() {
  const handlePrint = () => toast.success("Discharge summary sent to printer");
  const handleWhatsApp = () => toast.success("Summary shared via WhatsApp");
  const handlePDF = () => toast.success("PDF downloaded");

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" /> Discharge Summary
          </h1>
          <p className="text-muted-foreground">{dischargeSummaryData.patient} • {dischargeSummaryData.uhid}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePDF}>
            <Download className="h-4 w-4 mr-1" /> PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleWhatsApp}>
            <Share2 className="h-4 w-4 mr-1" /> WhatsApp
          </Button>
          <Button size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1" /> Print
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-4 space-y-6 text-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-b pb-4">
            <div><p className="text-xs text-muted-foreground">Patient</p><p className="font-medium">{dischargeSummaryData.patient}</p></div>
            <div><p className="text-xs text-muted-foreground">Age/Gender</p><p className="font-medium">{dischargeSummaryData.age}y / {dischargeSummaryData.gender}</p></div>
            <div><p className="text-xs text-muted-foreground">Admission</p><p className="font-medium">{dischargeSummaryData.admissionDate}</p></div>
            <div><p className="text-xs text-muted-foreground">Discharge</p><p className="font-medium">{dischargeSummaryData.dischargeDate}</p></div>
          </div>

          <div>
            <h3 className="font-semibold mb-1">Diagnosis</h3>
            <p>ICD-10: {dischargeSummaryData.diagnosis.icd}</p>
            <p>AYUSH: {dischargeSummaryData.diagnosis.ayush}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-1">Treatment Given</h3>
            <ul className="list-disc pl-5 space-y-1">
              {dischargeSummaryData.treatmentGiven.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-1">Medicines on Discharge</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted"><tr><th className="p-2 text-left">Medicine</th><th className="p-2 text-left">Dose</th><th className="p-2 text-left">Duration</th><th className="p-2 text-left">System</th></tr></thead>
                <tbody>
                  {dischargeSummaryData.medicinesOnDischarge.map((m, i) => (
                    <tr key={i} className="border-t"><td className="p-2 font-medium">{m.name}</td><td className="p-2">{m.dose}</td><td className="p-2">{m.duration}</td><td className="p-2"><Badge variant="secondary" className="text-xs">{m.system}</Badge></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-1">Dietary Advice (Pathya)</h3>
            <ul className="list-disc pl-5 space-y-1">
              {dischargeSummaryData.dietAdvice.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-1">Follow-up Plan</h3>
            <p>{dischargeSummaryData.followUpPlan}</p>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-1">Condition at Discharge</h3>
            <p className="text-green-700 font-medium">{dischargeSummaryData.conditionAtDischarge}</p>
          </div>

          <div className="border-t pt-4 text-right">
            <p className="font-medium">{dischargeSummaryData.doctor}</p>
            <p className="text-xs text-muted-foreground">Attending Physician</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
