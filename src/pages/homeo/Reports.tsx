import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { homeoTokens as t } from "./lib/ui";
import { toast } from "sonner";
import { FileText, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Reports = () => {
  const [params] = useSearchParams();
  const initialCase = params.get("case") ?? "";
  const [cases, setCases] = useState<any[]>([]);
  const [selected, setSelected] = useState(initialCase);
  const [clinicName, setClinicName] = useState("Ayuzee Homeo Clinic");
  const [doctorName, setDoctorName] = useState("");
  const [regNo, setRegNo] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("homeo_cases")
        .select("id, case_date, patient:homeo_patients(full_name, chief_complaint)")
        .order("case_date", { ascending: false })
        .limit(100);
      setCases(data ?? []);
      const { data: u } = await supabase.auth.getUser();
      if (u.user) setDoctorName(u.user.email?.split("@")[0] ?? "");
    };
    load();
  }, []);

  const exportPDF = async () => {
    if (!selected) return toast.error("Select a case");

    const { data: c } = await supabase.from("homeo_cases").select("*, patient:homeo_patients(*)").eq("id", selected).single();
    const { data: rx } = await supabase.from("homeo_prescriptions").select("*").eq("case_id", selected).order("prescribed_at", { ascending: false });
    const { data: fu } = await supabase.from("homeo_followups").select("*").eq("case_id", selected).order("followup_date");

    if (!c) return toast.error("Case not found");

    const doc = new jsPDF();
    const W = doc.internal.pageSize.getWidth();
    let y = 15;

    // Header
    doc.setFillColor(20, 50, 35);
    doc.rect(0, 0, W, 28, "F");
    doc.setTextColor(220, 180, 90);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(clinicName, W / 2, 14, { align: "center" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Dr. ${doctorName}${regNo ? ` · Reg ${regNo}` : ""}`, W / 2, 22, { align: "center" });

    y = 38;
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Patient Case Report", 14, y);
    y += 7;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${new Date(c.case_date).toLocaleDateString()}`, W - 14, y - 7, { align: "right" });

    autoTable(doc, {
      startY: y,
      theme: "plain",
      styles: { fontSize: 10, cellPadding: 1.5 },
      body: [
        ["Patient", c.patient?.full_name ?? "—"],
        ["Age / Gender", `${c.patient?.age ?? "?"} y · ${c.patient?.gender ?? "—"}`],
        ["Occupation", c.patient?.occupation ?? "—"],
        ["Phone", c.patient?.phone ?? "—"],
        ["Chief complaint", c.patient?.chief_complaint ?? "—"],
        ["Chronicity", c.patient?.chronicity ?? "—"],
      ],
    });

    y = (doc as any).lastAutoTable.finalY + 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Case Taking", 14, y);
    y += 2;

    const sec = (label: string, val?: string | null) => val ? [label, val] : null;
    const rows = [
      sec("Mind", c.mind),
      sec("Thermal", c.thermal_state),
      sec("Thirst", c.thirst),
      sec("Cravings", c.cravings),
      sec("Aversions", c.aversions),
      sec("Sleep", c.sleep),
      sec("Dreams", c.dreams),
      sec("Perspiration", c.perspiration),
      sec("Stool", c.stool),
      sec("Urine", c.urine),
      sec("Female", c.female_complaints),
      sec("Better by", c.modalities_better),
      sec("Worse by", c.modalities_worse),
      sec("Past hx", c.past_history),
      sec("Family hx", c.family_history),
    ].filter(Boolean) as string[][];

    autoTable(doc, {
      startY: y + 2,
      theme: "striped",
      headStyles: { fillColor: [20, 50, 35], textColor: [220, 180, 90] },
      head: [["Section", "Findings"]],
      body: rows,
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: { 0: { cellWidth: 35, fontStyle: "bold" } },
    });

    if (rx && rx.length) {
      y = (doc as any).lastAutoTable.finalY + 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Prescription", 14, y);
      autoTable(doc, {
        startY: y + 2,
        theme: "striped",
        headStyles: { fillColor: [20, 50, 35], textColor: [220, 180, 90] },
        head: [["Remedy", "Potency", "Dosage", "Instructions"]],
        body: rx.map((r) => [r.remedy_name, r.potency, r.dosage, r.instructions ?? ""]),
        styles: { fontSize: 9, cellPadding: 2 },
      });
    }

    if (fu && fu.length) {
      y = (doc as any).lastAutoTable.finalY + 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Follow-ups", 14, y);
      autoTable(doc, {
        startY: y + 2,
        theme: "striped",
        headStyles: { fillColor: [20, 50, 35], textColor: [220, 180, 90] },
        head: [["Date", "Outcome", "Notes", "Next"]],
        body: fu.map((f) => [
          new Date(f.followup_date).toLocaleDateString(),
          f.outcome,
          f.notes ?? "",
          f.next_action ?? "",
        ]),
        styles: { fontSize: 9, cellPadding: 2 },
      });
    }

    // Footer
    const ph = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Generated by Ayuzee Homeo AI · ${new Date().toLocaleString()}`, W / 2, ph - 8, { align: "center" });

    doc.save(`Homeo-Case-${c.patient?.full_name?.replace(/\s+/g, "_") ?? "report"}-${Date.now()}.pdf`);
    toast.success("PDF downloaded");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className={t.label}>Reports</p>
        <h2 className="font-display text-2xl font-semibold text-[hsl(45_85%_78%)]">Export case report as PDF</h2>
      </div>

      <div className={`${t.card} p-5 space-y-4`}>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className={t.label}>Clinic name</label>
            <input className={`${t.input} mt-1`} value={clinicName} onChange={(e) => setClinicName(e.target.value)} />
          </div>
          <div>
            <label className={t.label}>Doctor name</label>
            <input className={`${t.input} mt-1`} value={doctorName} onChange={(e) => setDoctorName(e.target.value)} />
          </div>
          <div>
            <label className={t.label}>Registration No.</label>
            <input className={`${t.input} mt-1`} value={regNo} onChange={(e) => setRegNo(e.target.value)} />
          </div>
        </div>

        <div>
          <label className={t.label}>Case</label>
          <select className={`${t.input} mt-1`} value={selected} onChange={(e) => setSelected(e.target.value)}>
            <option value="">Select a case…</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.patient?.full_name ?? "—"} · {c.chief_complaint?.slice(0, 40)} · {new Date(c.case_date).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <button onClick={exportPDF} disabled={!selected} className={t.primaryBtn}>
            <Download className="h-4 w-4" /> Generate & Download PDF
          </button>
        </div>

        <div className={`flex items-start gap-2 rounded-md border border-[hsl(45_40%_55%/0.2)] bg-[hsl(160_30%_8%)] p-3 text-xs ${t.mutedText}`}>
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(45_85%_60%)]" />
          PDF includes patient details, full case taking, prescription, and follow-up history. Customize header above to match your clinic letterhead.
        </div>
      </div>
    </div>
  );
};

export default Reports;
