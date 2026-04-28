import { useDoctor } from "@/hooks/useDoctor";

export type PrintLine = {
  name: string;
  category?: string;
  potency?: string;
  dose: string;
  frequency: string;
  duration?: string;
  anupana?: string;
  repetition?: string;
  instructions?: string;
};

interface Props {
  system: "Ayurveda" | "Homeopathy" | "Siddha" | "Unani";
  patientName: string;
  patientPhone?: string | null;
  patientAge?: number | null;
  patientGender?: string | null;
  visitDate: string;
  followUpDate?: string;
  diagnosis?: string;
  advice?: string;
  lines: PrintLine[];
}

const systemAccent: Record<Props["system"], string> = {
  Ayurveda: "#16a34a",
  Homeopathy: "#0ea5e9",
  Siddha: "#f97316",
  Unani: "#8b5cf6",
};

const PrescriptionPrintable = ({
  system, patientName, patientPhone, patientAge, patientGender,
  visitDate, followUpDate, diagnosis, advice, lines,
}: Props) => {
  const { doctor } = useDoctor();
  const accent = systemAccent[system];

  return (
    <div
      className="hidden print:block bg-white text-black"
      style={{ padding: "20mm 18mm", fontFamily: "Georgia, 'Times New Roman', serif" }}
    >
      {/* Header */}
      <div style={{ borderBottom: `3px double ${accent}`, paddingBottom: 12, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: accent }}>
              {doctor?.clinic_name || (doctor?.full_name ? `Dr. ${doctor.full_name}'s Clinic` : "Clinic")}
            </div>
            <div style={{ fontSize: 12, color: "#444" }}>
              {doctor?.full_name ? `Dr. ${doctor.full_name}` : ""}
              {doctor?.qualification ? `, ${doctor.qualification}` : ""}
              {doctor?.specialization ? ` · ${doctor.specialization}` : ` · ${system} Practitioner`}
            </div>
            <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>
              {doctor?.clinic_address || ""}
              {doctor?.phone ? ` · ☏ ${doctor.phone}` : ""}
              {doctor?.email ? ` · ${doctor.email}` : ""}
            </div>
            {doctor?.registration_number && (
              <div style={{ fontSize: 11, color: "#666" }}>Reg. No: {doctor.registration_number}</div>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                display: "inline-block", padding: "4px 10px", borderRadius: 4,
                background: accent, color: "white", fontSize: 11, fontWeight: 600, letterSpacing: 1,
              }}
            >
              {system.toUpperCase()} Rx
            </div>
            <div style={{ fontSize: 11, color: "#666", marginTop: 6 }}>Date: {visitDate}</div>
          </div>
        </div>
      </div>

      {/* Patient block */}
      <table style={{ width: "100%", fontSize: 12, marginBottom: 14, borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={{ padding: "4px 6px", background: "#f7f7f7", width: "18%", fontWeight: 600 }}>Patient</td>
            <td style={{ padding: "4px 6px", borderBottom: "1px solid #eee" }}>{patientName || "—"}</td>
            <td style={{ padding: "4px 6px", background: "#f7f7f7", width: "18%", fontWeight: 600 }}>Age / Sex</td>
            <td style={{ padding: "4px 6px", borderBottom: "1px solid #eee" }}>
              {patientAge ?? "—"} {patientGender ? `/ ${patientGender}` : ""}
            </td>
          </tr>
          <tr>
            <td style={{ padding: "4px 6px", background: "#f7f7f7", fontWeight: 600 }}>Phone</td>
            <td style={{ padding: "4px 6px", borderBottom: "1px solid #eee" }}>{patientPhone || "—"}</td>
            <td style={{ padding: "4px 6px", background: "#f7f7f7", fontWeight: 600 }}>Follow-up</td>
            <td style={{ padding: "4px 6px", borderBottom: "1px solid #eee" }}>{followUpDate || "—"}</td>
          </tr>
          {diagnosis && (
            <tr>
              <td style={{ padding: "4px 6px", background: "#f7f7f7", fontWeight: 600 }}>Diagnosis</td>
              <td colSpan={3} style={{ padding: "4px 6px", borderBottom: "1px solid #eee" }}>{diagnosis}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Rx symbol + lines */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 56, lineHeight: 1, color: accent, fontWeight: 700 }}>
          ℞
        </div>
        <div style={{ flex: 1 }}>
          <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${accent}` }}>
                <th style={{ textAlign: "left", padding: 4, width: 24 }}>#</th>
                <th style={{ textAlign: "left", padding: 4 }}>Medicine</th>
                {system === "Homeopathy" && <th style={{ textAlign: "left", padding: 4 }}>Potency</th>}
                <th style={{ textAlign: "left", padding: 4 }}>Dose</th>
                <th style={{ textAlign: "left", padding: 4 }}>Frequency</th>
                <th style={{ textAlign: "left", padding: 4 }}>{system === "Homeopathy" ? "Repetition" : "Duration"}</th>
                {system !== "Homeopathy" && <th style={{ textAlign: "left", padding: 4 }}>Anupana</th>}
              </tr>
            </thead>
            <tbody>
              {lines.map((l, i) => (
                <tr key={i} style={{ borderBottom: "1px dotted #ccc", verticalAlign: "top" }}>
                  <td style={{ padding: 6 }}>{i + 1}</td>
                  <td style={{ padding: 6 }}>
                    <div style={{ fontWeight: 600 }}>{l.name}</div>
                    {l.category && <div style={{ fontSize: 10, color: "#666" }}>{l.category}</div>}
                    {l.instructions && <div style={{ fontSize: 10, color: "#444", fontStyle: "italic" }}>↳ {l.instructions}</div>}
                  </td>
                  {system === "Homeopathy" && <td style={{ padding: 6 }}>{l.potency || "—"}</td>}
                  <td style={{ padding: 6 }}>{l.dose || "—"}</td>
                  <td style={{ padding: 6 }}>{l.frequency || "—"}</td>
                  <td style={{ padding: 6 }}>{(system === "Homeopathy" ? l.repetition : l.duration) || "—"}</td>
                  {system !== "Homeopathy" && <td style={{ padding: 6 }}>{l.anupana || "—"}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advice */}
      {advice && (
        <div style={{ marginTop: 18, fontSize: 12 }}>
          <div style={{ fontWeight: 600, color: accent, marginBottom: 4 }}>
            {system === "Ayurveda" ? "Pathya / Lifestyle Advice"
              : system === "Siddha" ? "Pathiyam / Lifestyle Advice"
              : system === "Unani" ? "Parhez / Lifestyle Advice"
              : "Advice"}
          </div>
          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{advice}</div>
        </div>
      )}

      {/* Footer / signature */}
      <div style={{ marginTop: 50, display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 11, color: "#555" }}>
        <div>
          <div style={{ fontStyle: "italic" }}>This prescription is valid only when signed by the prescriber.</div>
          <div style={{ marginTop: 4 }}>Generated via Ayuzee · {new Date().toLocaleString()}</div>
        </div>
        <div style={{ textAlign: "center", borderTop: "1px solid #333", paddingTop: 4, minWidth: 200 }}>
          {doctor?.full_name ? `Dr. ${doctor.full_name}` : "Signature"}
          <div style={{ fontSize: 10, color: "#666" }}>{doctor?.qualification || ""}</div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionPrintable;
