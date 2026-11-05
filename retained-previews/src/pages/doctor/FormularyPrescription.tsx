import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Item {
  formula_id: string; name: string; sanskrit?: string; type: string;
  dose: string; frequency: string; duration: string; anupana: string;
  manufacturer?: string;
}
interface Rx {
  id: string; doctor_user_id: string; patient_name: string | null; patient_phone: string | null;
  diagnosis: string | null; pathya: string | null; apathya: string | null;
  items: Item[]; created_at: string;
}

export default function FormularyPrescription() {
  const { id } = useParams();
  const [rx, setRx] = useState<Rx | null>(null);
  const [doctor, setDoctor] = useState<{ full_name: string; registration_number?: string | null; clinic_name?: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const { data, error } = await supabase.from("formulary_prescriptions").select("*").eq("id", id).maybeSingle();
      if (error) { toast.error(error.message); setLoading(false); return; }
      setRx(data as unknown as Rx);
      if (data?.doctor_user_id) {
        const { data: doc } = await supabase.from("doctors")
          .select("full_name, registration_number, clinic_name")
          .eq("user_id", data.doctor_user_id).maybeSingle();
        setDoctor(doc as never);
      }
      setLoading(false);
    })();
  }, [id]);

  const downloadPDF = () => {
    if (!rx) return;
    const doc = new jsPDF();
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();

    // Watermark
    doc.setTextColor(230);
    doc.setFontSize(60);
    doc.text("Ayuzee AYUSH", W / 2, H / 2, { align: "center", angle: 45 });
    doc.setTextColor(0);

    // Header
    doc.setFontSize(18); doc.setFont("helvetica", "bold");
    doc.text(`Dr. ${doctor?.full_name || "Doctor"}`, 14, 20);
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    if (doctor?.registration_number) doc.text(`Reg. No: ${doctor.registration_number}`, 14, 26);
    if (doctor?.clinic_name) doc.text(doctor.clinic_name, 14, 31);
    doc.text(`Date: ${new Date(rx.created_at).toLocaleDateString("en-IN")}`, W - 14, 20, { align: "right" });
    doc.text(`Rx ID: ${rx.id.slice(0, 8)}`, W - 14, 26, { align: "right" });

    doc.setDrawColor(180); doc.line(14, 36, W - 14, 36);

    // Patient
    doc.setFontSize(11); doc.setFont("helvetica", "bold");
    doc.text("Patient:", 14, 44);
    doc.setFont("helvetica", "normal");
    doc.text(`${rx.patient_name || "—"}${rx.patient_phone ? ` · ${rx.patient_phone}` : ""}`, 35, 44);
    if (rx.diagnosis) { doc.setFont("helvetica", "bold"); doc.text("Diagnosis:", 14, 50); doc.setFont("helvetica", "normal"); doc.text(rx.diagnosis, 38, 50); }

    // Rx table
    autoTable(doc, {
      startY: 58,
      head: [["#", "Formula", "Dose", "Freq", "Duration", "Anupana"]],
      body: rx.items.map((it, i) => [
        String(i + 1), `${it.name}${it.sanskrit ? `\n${it.sanskrit}` : ""}`, it.dose, it.frequency, it.duration, it.anupana,
      ]),
      headStyles: { fillColor: [16, 122, 87] },
      styles: { fontSize: 10, cellPadding: 3 },
    });

    let y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    if (rx.pathya) {
      doc.setFont("helvetica", "bold"); doc.text("Pathya (Do's):", 14, y); doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(rx.pathya, W - 28); doc.text(lines, 14, y + 6); y += 6 + lines.length * 5;
    }
    if (rx.apathya) {
      y += 4; doc.setFont("helvetica", "bold"); doc.text("Apathya (Don'ts):", 14, y); doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(rx.apathya, W - 28); doc.text(lines, 14, y + 6); y += 6 + lines.length * 5;
    }

    // Footer
    doc.setFontSize(9); doc.setTextColor(120);
    doc.text("Ayuzee AYUSH Prescription · Generated digitally · Not valid without doctor's verification", W / 2, H - 12, { align: "center" });

    doc.save(`Rx-${rx.id.slice(0, 8)}.pdf`);
  };

  if (loading) return <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!rx) return <div className="p-6">Prescription not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" asChild><Link to="/doctor/formulary"><ArrowLeft className="h-4 w-4 mr-2" />Back</Link></Button>
        <Button onClick={downloadPDF}><Download className="h-4 w-4 mr-2" />Download PDF</Button>
      </div>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between border-b pb-3">
            <div>
              <div className="text-xl font-bold">Dr. {doctor?.full_name || "Doctor"}</div>
              {doctor?.registration_number && <div className="text-xs text-muted-foreground">Reg. No: {doctor.registration_number}</div>}
              {doctor?.clinic_name && <div className="text-xs text-muted-foreground">{doctor.clinic_name}</div>}
            </div>
            <div className="text-right text-xs">
              <div>Date: {new Date(rx.created_at).toLocaleDateString("en-IN")}</div>
              <div>Rx ID: {rx.id.slice(0, 8)}</div>
            </div>
          </div>
          <div className="text-sm"><b>Patient:</b> {rx.patient_name || "—"}{rx.patient_phone && ` · ${rx.patient_phone}`}</div>
          {rx.diagnosis && <div className="text-sm"><b>Diagnosis:</b> {rx.diagnosis}</div>}
          <table className="w-full text-sm border-collapse">
            <thead><tr className="bg-muted"><th className="p-2 text-left">#</th><th className="p-2 text-left">Formula</th><th className="p-2">Dose</th><th className="p-2">Freq</th><th className="p-2">Duration</th><th className="p-2">Anupana</th></tr></thead>
            <tbody>
              {rx.items.map((it, i) => (
                <tr key={i} className="border-b">
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2"><div className="font-medium">{it.name}</div><div className="text-xs text-muted-foreground">{it.sanskrit}</div></td>
                  <td className="p-2 text-center">{it.dose}</td>
                  <td className="p-2 text-center">{it.frequency}</td>
                  <td className="p-2 text-center">{it.duration}</td>
                  <td className="p-2 text-center">{it.anupana}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rx.pathya && <div className="text-sm"><b>Pathya (Do's):</b> {rx.pathya}</div>}
          {rx.apathya && <div className="text-sm"><b>Apathya (Don'ts):</b> {rx.apathya}</div>}
          <div className="text-center text-xs text-muted-foreground border-t pt-3">Ayuzee AYUSH Prescription · Generated digitally</div>
        </CardContent>
      </Card>
    </div>
  );
}
