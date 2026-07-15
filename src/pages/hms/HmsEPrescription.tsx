import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  FileText, QrCode, Pen, Printer, Send, Download,
  Shield, Plus, Trash2, CheckCircle, MessageCircle,
} from "lucide-react";

type PrescriptionMedicine = {
  id: string; name: string; type: string; dose: string;
  frequency: string; duration: string; route: string;
  instructions: string; beforeAfterFood: string;
};

type RecentPrescription = {
  id: string; rxNo: string; patient: string; doctor: string;
  date: string; medicines: number; status: "sent" | "printed" | "draft";
  sentVia: string;
};

const mockMedicines: PrescriptionMedicine[] = [
  { id: "1", name: "Yogaraja Guggulu", type: "Classical", dose: "2 tablets", frequency: "TDS", duration: "30 days", route: "Oral", instructions: "With warm water", beforeAfterFood: "After food" },
  { id: "2", name: "Rasnasaptakam Kashayam", type: "Classical", dose: "15 ml", frequency: "BD", duration: "30 days", route: "Oral", instructions: "With equal water & honey", beforeAfterFood: "Before food" },
  { id: "3", name: "Dhanwantharam Tailam", type: "Classical", dose: "Q.S.", frequency: "Daily", duration: "30 days", route: "External", instructions: "Apply warm to affected joints. Gentle massage.", beforeAfterFood: "N/A (External)" },
  { id: "4", name: "Ashwagandha Churnam", type: "Classical", dose: "3 gm", frequency: "HS", duration: "30 days", route: "Oral", instructions: "With warm milk", beforeAfterFood: "After dinner" },
];

const mockRecent: RecentPrescription[] = [
  { id: "1", rxNo: "RX-2026-0456", patient: "Ramesh Kumar", doctor: "Dr. Arun Sharma", date: "2026-07-15", medicines: 4, status: "sent", sentVia: "WhatsApp + ABDM" },
  { id: "2", rxNo: "RX-2026-0455", patient: "Lakshmi Devi", doctor: "Dr. Meena Patel", date: "2026-07-15", medicines: 3, status: "printed", sentVia: "Printed" },
  { id: "3", rxNo: "RX-2026-0454", patient: "Sunil Menon", doctor: "Dr. Arun Sharma", date: "2026-07-14", medicines: 5, status: "sent", sentVia: "WhatsApp" },
  { id: "4", rxNo: "RX-2026-0453", patient: "Meera Nair", doctor: "Dr. Meena Patel", date: "2026-07-14", medicines: 2, status: "draft", sentVia: "—" },
];

const HmsEPrescription = () => {
  const [medicines, setMedicines] = useState<PrescriptionMedicine[]>(mockMedicines);
  const [patientName, setPatientName] = useState("Ramesh Kumar");
  const [diagnosis, setDiagnosis] = useState("Sandhivata (Osteoarthritis - Bilateral Knee)");
  const [advice, setAdvice] = useState("Avoid cold food. Take warm water. Gentle knee exercises daily. Apply warm oil before bath. Review after 15 days with ESR, CRP.");

  const addMedicine = () => {
    setMedicines([...medicines, { id: String(Date.now()), name: "", type: "", dose: "", frequency: "", duration: "", route: "Oral", instructions: "", beforeAfterFood: "After food" }]);
  };

  const removeMedicine = (id: string) => {
    setMedicines(medicines.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-emerald-600" /> E-Prescription
          </h1>
          <p className="text-sm text-muted-foreground">Digital prescription with QR verification, digital signature, ABDM push & multi-format export</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-green-100 text-green-700 border-green-300"><Shield className="h-3 w-3 mr-1" /> ABDM Compliant</Badge>
          <Badge className="bg-blue-100 text-blue-700 border-blue-300"><QrCode className="h-3 w-3 mr-1" /> QR Verified</Badge>
        </div>
      </div>

      <Tabs defaultValue="create">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 w-full">
          <TabsTrigger value="create">Write Prescription</TabsTrigger>
          <TabsTrigger value="preview">Preview & Sign</TabsTrigger>
          <TabsTrigger value="history">Prescription History</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          {/* Patient & Diagnosis */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><Label>Patient *</Label><Input value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Patient name" /></div>
                <div><Label>Diagnosis</Label><Input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="AYUSH + Modern" /></div>
                <div><Label>Prescription No</Label><Input value="RX-2026-0457" disabled className="font-mono" /></div>
              </div>
            </CardContent>
          </Card>

          {/* Medicines Table */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Medicines (Rx)</CardTitle>
                <Button size="sm" onClick={addMedicine}><Plus className="mr-1 h-3 w-3" /> Add Medicine</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-2 py-2 text-left font-medium">#</th>
                      <th className="px-2 py-2 text-left font-medium">Medicine Name</th>
                      <th className="px-2 py-2 text-left font-medium">Dose</th>
                      <th className="px-2 py-2 text-left font-medium">Frequency</th>
                      <th className="px-2 py-2 text-left font-medium">Duration</th>
                      <th className="px-2 py-2 text-left font-medium">Route</th>
                      <th className="px-2 py-2 text-left font-medium">Instructions</th>
                      <th className="px-2 py-2 text-left font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.map((m, i) => (
                      <tr key={m.id} className="border-b">
                        <td className="px-2 py-2 text-muted-foreground">{i + 1}</td>
                        <td className="px-2 py-2"><p className="font-medium text-xs">{m.name || <Input className="h-7 text-xs w-40" placeholder="Medicine" />}</p><p className="text-[10px] text-muted-foreground">{m.type}</p></td>
                        <td className="px-2 py-2 text-xs">{m.dose || <Input className="h-7 text-xs w-16" placeholder="Dose" />}</td>
                        <td className="px-2 py-2 text-xs">{m.frequency || <Input className="h-7 text-xs w-14" placeholder="BD" />}</td>
                        <td className="px-2 py-2 text-xs">{m.duration || <Input className="h-7 text-xs w-20" placeholder="Days" />}</td>
                        <td className="px-2 py-2 text-xs">{m.route}</td>
                        <td className="px-2 py-2 text-[10px] text-muted-foreground">{m.instructions} · {m.beforeAfterFood}</td>
                        <td className="px-2 py-2"><Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-500" onClick={() => removeMedicine(m.id)}><Trash2 className="h-3 w-3" /></Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Advice & Follow-up */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div><Label>Pathya / Advice</Label><Textarea value={advice} onChange={(e) => setAdvice(e.target.value)} rows={3} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Follow-up Date</Label><Input type="date" /></div>
                <div><Label>Next Investigation</Label><Input placeholder="e.g., ESR, CRP after 15 days" /></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          {/* Prescription Preview - Like printed format */}
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-0">
              {/* Hospital Header */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-b p-6 text-center">
                <h2 className="font-display text-xl font-bold text-emerald-800">Ayuzee AYUSH Hospital</h2>
                <p className="text-xs text-emerald-600">#11, Main Road, Trivandrum, Kerala - 695001</p>
                <p className="text-xs text-emerald-600">Ph: +91-471-2345678 | www.ayuzee.com | GSTIN: 32AXXXX0000A1Z5</p>
                <Badge className="mt-2 bg-emerald-100 text-emerald-700 border-emerald-300 text-[10px]">AYUSH Licensed | Reg. No: KL/AYU/2024/1234</Badge>
              </div>

              {/* Patient Info */}
              <div className="p-4 border-b grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Patient:</span> <strong>{patientName}</strong></div>
                <div><span className="text-muted-foreground">Date:</span> <strong>15-Jul-2026</strong></div>
                <div><span className="text-muted-foreground">UHID:</span> AYZ-2026-001</div>
                <div><span className="text-muted-foreground">Rx No:</span> <span className="font-mono">RX-2026-0457</span></div>
                <div className="col-span-2"><span className="text-muted-foreground">Diagnosis:</span> <strong>{diagnosis}</strong></div>
              </div>

              {/* Rx Symbol + Medicines */}
              <div className="p-4 border-b">
                <p className="text-2xl font-serif italic text-emerald-700 mb-3">Rx</p>
                <div className="space-y-2">
                  {medicines.map((m, i) => (
                    <div key={m.id} className="flex gap-2 text-xs">
                      <span className="text-muted-foreground w-4">{i + 1}.</span>
                      <div className="flex-1">
                        <p className="font-medium">{m.name} <span className="text-muted-foreground">({m.type})</span></p>
                        <p className="text-muted-foreground">{m.dose} — {m.frequency} — {m.duration} — {m.beforeAfterFood}</p>
                        {m.instructions && <p className="text-[10px] italic text-muted-foreground">{m.instructions}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advice */}
              <div className="p-4 border-b text-xs">
                <p className="font-medium text-muted-foreground mb-1">Advice / Pathya:</p>
                <p>{advice}</p>
              </div>

              {/* Signature + QR Footer */}
              <div className="p-4 flex items-end justify-between">
                <div className="text-center">
                  <QrCode className="h-16 w-16 text-muted-foreground mx-auto" />
                  <p className="text-[9px] text-muted-foreground mt-1">Scan to verify</p>
                  <p className="text-[8px] font-mono text-muted-foreground">RX-2026-0457</p>
                </div>
                <div className="text-right">
                  <div className="border-b border-dashed border-muted-foreground w-48 mb-1" />
                  <p className="text-xs font-medium">Dr. Arun Sharma</p>
                  <p className="text-[10px] text-muted-foreground">BAMS, MD (Ayu)</p>
                  <p className="text-[10px] text-muted-foreground">Reg No: KL/AYU/12345</p>
                  <Badge variant="outline" className="text-[8px] mt-1"><Pen className="h-2 w-2 mr-0.5" /> Digitally Signed</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={() => toast.success("Prescription printed")}><Printer className="mr-1 h-4 w-4" /> Print</Button>
            <Button variant="outline" onClick={() => toast.success("PDF downloaded")}><Download className="mr-1 h-4 w-4" /> Download PDF</Button>
            <Button variant="outline" onClick={() => toast.success("Sent via WhatsApp")}><MessageCircle className="mr-1 h-4 w-4" /> WhatsApp</Button>
            <Button variant="outline" onClick={() => toast.success("Pushed to ABDM")}><Shield className="mr-1 h-4 w-4" /> Push to ABDM</Button>
            <Button variant="outline" onClick={() => toast.success("Sent to pharmacy")}><Send className="mr-1 h-4 w-4" /> Send to Pharmacy</Button>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card><CardContent className="p-0"><div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50"><tr>
                <th className="px-3 py-2 text-left font-medium">Rx No</th>
                <th className="px-3 py-2 text-left font-medium">Patient</th>
                <th className="px-3 py-2 text-left font-medium">Doctor</th>
                <th className="px-3 py-2 text-left font-medium">Date</th>
                <th className="px-3 py-2 text-left font-medium">Medicines</th>
                <th className="px-3 py-2 text-left font-medium">Sent Via</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
              </tr></thead>
              <tbody>
                {mockRecent.map((rx) => (
                  <tr key={rx.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 font-mono text-xs font-bold">{rx.rxNo}</td>
                    <td className="px-3 py-2 font-medium">{rx.patient}</td>
                    <td className="px-3 py-2 text-xs">{rx.doctor}</td>
                    <td className="px-3 py-2 text-xs">{rx.date}</td>
                    <td className="px-3 py-2">{rx.medicines} items</td>
                    <td className="px-3 py-2 text-xs">{rx.sentVia}</td>
                    <td className="px-3 py-2"><Badge variant={rx.status === "sent" ? "outline" : rx.status === "draft" ? "secondary" : "default"} className={`text-[10px] capitalize ${rx.status === "sent" ? "text-green-600" : ""}`}>{rx.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsEPrescription;
