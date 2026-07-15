import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ASTGClinicalAssistant from "@/components/astg/ASTGClinicalAssistant";
import {
  AlertTriangle,
  CalendarClock,
  FileDown,
  Flower2,
  Loader2,
  ScanLine,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import jsPDF from "jspdf";

type Report = {
  id: string;
  assessment_id: string;
  final_summary: string | null;
  likely_astg_pattern: string | null;
  recommended_action: string | null;
  signed_at: string | null;
  signed_by: string | null;
  pdf_url: string | null;
  astg_disease_id: string | null;
  astg_red_flag_matched: string | null;
  astg_red_flag_source: string | null;
  interpretation_bypassed: boolean | null;
  doctor_name?: string | null;
  assessment: {
    id: string;
    risk_label: string | null;
    spine_score: number | null;
    has_red_flag: boolean;
    created_at: string;
    status: string;
  } | null;
};

const PatientSpineReports = () => {
  usePageSEO({
    title: "My Spine Reports — Ayuzee",
    description: "Signed spine health summaries from your Vaidya.",
  });

  const [rows, setRows] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [hijamaBusyId, setHijamaBusyId] = useState<string | null>(null);
  const [hijamaPlan, setHijamaPlan] = useState<Record<string, unknown> | null>(null);
  const [pdfBusyId, setPdfBusyId] = useState<string | null>(null);
  const [patientName, setPatientName] = useState<string>("Patient");
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id;
      if (!uid) {
        setLoading(false);
        return;
      }
      setUserId(uid);
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", uid)
        .maybeSingle();
      setPatientName(profile?.full_name || "Patient");
      const { data: assessments, error } = await supabase
        .from("spine_assessments")
        .select("id, risk_label, spine_score, has_red_flag, created_at, status")
        .eq("patient_id", uid)
        .eq("status", "reviewed")
        .order("created_at", { ascending: false });
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }
      const ids = (assessments ?? []).map((a) => a.id);
      if (ids.length === 0) {
        setRows([]);
        setLoading(false);
        return;
      }
      const { data: reports } = await supabase
        .from("spine_reports")
        .select("id, assessment_id, final_summary, likely_astg_pattern, recommended_action, signed_at, signed_by, pdf_url, astg_disease_id, astg_red_flag_matched, astg_red_flag_source, interpretation_bypassed")
        .in("assessment_id", ids)
        .not("signed_at", "is", null);

      const doctorIds = Array.from(
        new Set((reports ?? []).map((r) => r.signed_by).filter(Boolean) as string[])
      );
      const doctorNameById = new Map<string, string>();
      if (doctorIds.length > 0) {
        const { data: docs } = await supabase
          .from("doctors")
          .select("id, full_name")
          .in("id", doctorIds);
        (docs ?? []).forEach((d) => doctorNameById.set(d.id, d.full_name ?? ""));
      }

      const byId = new Map((reports ?? []).map((r) => [r.assessment_id, r]));
      const combined: Report[] = (assessments ?? [])
        .map((a) => {
          const r = byId.get(a.id);
          if (!r) return null;
          return {
            ...r,
            doctor_name: r.signed_by ? doctorNameById.get(r.signed_by) ?? null : null,
            assessment: a,
          } as Report;
        })
        .filter((r): r is Report => r !== null);
      setRows(combined);
      setLoading(false);
    })();
  }, []);

  const downloadPdf = async (report: Report) => {
    if (!userId) return;
    setPdfBusyId(report.id);
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;

      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Ayuzee — Spine Health Report", margin, 50);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const dateText = report.signed_at
        ? format(new Date(report.signed_at), "d MMM yyyy")
        : format(new Date(), "d MMM yyyy");
      doc.text(`Patient: ${patientName}    ·    Date: ${dateText}`, margin, 68);
      doc.setDrawColor(180);
      doc.line(margin, 78, pageWidth - margin, 78);

      let y = 100;

      const addBlock = (label: string, body?: string | null) => {
        if (!body) return;
        if (y > pageHeight - 120) {
          doc.addPage();
          y = 60;
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(label, margin, y);
        y += 14;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(body, pageWidth - margin * 2);
        doc.text(lines, margin, y);
        y += lines.length * 13 + 10;
      };

      addBlock("Risk assessment", report.assessment?.risk_label ?? "—");
      addBlock("Vaidya's summary", report.final_summary ?? "—");
      addBlock("Recommended action", report.recommended_action ?? "—");

      // Footer
      const footerY = pageHeight - 60;
      doc.setDrawColor(180);
      doc.line(margin, footerY - 12, pageWidth - margin, footerY - 12);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      const doctorLine = report.doctor_name
        ? `Signed by Dr. ${report.doctor_name}`
        : "Signed by your Vaidya";
      const signedAt = report.signed_at
        ? ` on ${format(new Date(report.signed_at), "d MMM yyyy · h:mm a")}`
        : "";
      doc.text(`${doctorLine}${signedAt}`, margin, footerY);
      doc.setFont("helvetica", "normal");
      doc.text("Generated by Ayuzee · This report is for personal reference only.", margin, footerY + 14);

      const blob = doc.output("blob");
      const path = `${userId}/spine/${report.id}.pdf`;
      const { error: upErr } = await supabase.storage
        .from("clinical-reports")
        .upload(path, blob, { upsert: true, contentType: "application/pdf" });
      if (upErr) throw upErr;

      const { error: updErr } = await supabase
        .from("spine_reports")
        .update({ pdf_url: path })
        .eq("id", report.id);
      if (updErr) throw updErr;

      const { data: signed, error: signErr } = await supabase.storage
        .from("clinical-reports")
        .createSignedUrl(path, 60 * 60);
      if (signErr) throw signErr;

      setRows((prev) =>
        prev.map((r) => (r.id === report.id ? { ...r, pdf_url: path } : r))
      );

      // Trigger download
      const link = document.createElement("a");
      link.href = signed.signedUrl;
      link.download = `spine-report-${format(
        new Date(report.signed_at ?? Date.now()),
        "yyyy-MM-dd"
      )}.pdf`;
      link.rel = "noreferrer";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Report downloaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not generate PDF");
    } finally {
      setPdfBusyId(null);
    }
  };


  const runHijama = async (report: Report) => {
    setHijamaBusyId(report.id);
    setHijamaPlan(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-hijama-plan", {
        body: {
          chief_complaint: `Spine complaint — ${report.likely_astg_pattern ?? "spine"}`,
          pain_location: "Spine / lower back",
          risk_level: report.assessment?.risk_label ?? "unknown",
          contraindications: [],
        },
      });
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      setHijamaPlan((data as { plan?: Record<string, unknown> })?.plan ?? null);
      toast.success("Hijama plan ready");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not generate Hijama plan");
    } finally {
      setHijamaBusyId(null);
    }
  };

  const bookPanchakarma = async (report: Report) => {
    const pattern = report.likely_astg_pattern;
    if (!pattern) return;
    // Look up disease id by name; fall back to pattern name
    const { data } = await supabase
      .from("astg_diseases")
      .select("id, name")
      .ilike("name", `%${pattern}%`)
      .limit(1)
      .maybeSingle();
    const diseaseId = data?.id ?? pattern;
    const name = data?.name ?? pattern;
    navigate(
      `/vaidya/appointments/new?type=panchakarma&disease=${encodeURIComponent(
        String(diseaseId)
      )}&name=${encodeURIComponent(name)}`
    );
  };

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
          Ayuzee · Your reports
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold">My Spine Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Summaries from your Vaidya after reviewing your spine assessment.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading your reports…
        </div>
      ) : rows.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          <ScanLine className="mx-auto mb-3 h-8 w-8 text-primary/60" />
          You don't have any signed spine reports yet.
          <div className="mt-4">
            <Button asChild variant="outline">
              <Link to="/diagnosis/spine">Take the spine assessment</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {rows.map((r) => (
            <ReportCard
              key={r.id}
              report={r}
              hijamaBusy={hijamaBusyId === r.id}
              hijamaPlan={hijamaBusyId === null && hijamaPlan ? hijamaPlan : null}
              pdfBusy={pdfBusyId === r.id}
              onHijama={() => runHijama(r)}
              onPanchakarma={() => bookPanchakarma(r)}
              onDownload={() => downloadPdf(r)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ReportCard = ({
  report,
  hijamaBusy,
  hijamaPlan,
  pdfBusy,
  onHijama,
  onPanchakarma,
  onDownload,
}: {
  report: Report;
  hijamaBusy: boolean;
  hijamaPlan: Record<string, unknown> | null;
  pdfBusy: boolean;
  onHijama: () => void;
  onPanchakarma: () => void;
  onDownload: () => void;
}) => {
  const redFlag = !!report.assessment?.has_red_flag || !!report.interpretation_bypassed;
  const astgMatched = !!report.astg_red_flag_matched;

  const summary = useMemo(() => report.final_summary ?? "", [report.final_summary]);

  return (
    <Card className="p-6 space-y-5">
      {redFlag && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
            <div className="flex-1">
              <p className="font-semibold text-destructive">
                Please book an in-person consultation
              </p>
              {astgMatched ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    Flagged: {report.astg_red_flag_matched}
                  </span>{" "}
                  — per {report.astg_red_flag_source ?? "DGHS Standard Treatment Guidelines on Musculoskeletal Disorders"}.
                  AI interpretation was skipped so a Vaidya can evaluate you in person first.
                </p>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">
                  Your assessment flagged nerve, weakness, or night-pain symptoms. A Vaidya should
                  evaluate you in person before you rely on AI suggestions.
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button asChild variant="hero" size="sm">
                  <Link to="/doctors">
                    <Stethoscope className="mr-2 h-4 w-4" />
                    Book a Vaidya now
                  </Link>
                </Button>
                {report.astg_disease_id && (
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/astg/musculoskeletal/${report.astg_disease_id}`}>
                      View ASTG reference
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              {report.assessment?.risk_label ?? "Reviewed"}
            </Badge>
            {report.likely_astg_pattern && (
              <Badge variant="secondary">
                <Sparkles className="mr-1 h-3 w-3" />
                {report.likely_astg_pattern}
              </Badge>
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Signed{" "}
            {report.signed_at
              ? format(new Date(report.signed_at), "d MMM yyyy · h:mm a")
              : "—"}
          </p>
        </div>
        {report.assessment?.spine_score != null && (
          <div className="text-right">
            <div className="text-2xl font-semibold">{report.assessment.spine_score}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Spine load
            </div>
          </div>
        )}
      </div>

      <Separator />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {report.doctor_name ? `Signed by Dr. ${report.doctor_name}` : "Signed by your Vaidya"}
        </p>
        <Button variant="outline" size="sm" onClick={onDownload} disabled={pdfBusy}>
          {pdfBusy ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Preparing PDF…
            </>
          ) : (
            <>
              <FileDown className="mr-2 h-4 w-4" />
              Download Report
            </>
          )}
        </Button>
      </div>

      <div className={redFlag ? "opacity-60" : ""}>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Your Vaidya's summary
        </p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
          {summary || "No summary provided."}
        </p>
        {!redFlag && report.astg_disease_id && (
          <p className="mt-3 text-xs text-muted-foreground">
            Reference:{" "}
            <Link
              to={`/astg/musculoskeletal/${report.astg_disease_id}`}
              className="text-primary underline underline-offset-2 hover:no-underline"
            >
              ASTG Musculoskeletal Disorders page
            </Link>
          </p>
        )}
      </div>

      {report.likely_astg_pattern && (
        <div className={redFlag ? "opacity-60" : ""}>
          <Separator className="mb-4" />
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Next steps
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <ASTGClinicalAssistant
              variant="inline"
              diseaseContext={report.likely_astg_pattern}
            />
            <Button variant="outline" onClick={onHijama} disabled={hijamaBusy}>
              {hijamaBusy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Flower2 className="mr-2 h-4 w-4" />
                  Get a Hijama Plan
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onPanchakarma}>
              <CalendarClock className="mr-2 h-4 w-4" />
              Book Panchakarma (Kati/Greeva Basti)
            </Button>
          </div>

          {hijamaPlan && (
            <Card className="mt-4 border-primary/30 bg-primary/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                AI Hijama plan (for your Vaidya to review)
              </p>
              <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-xs">
                {JSON.stringify(hijamaPlan, null, 2)}
              </pre>
            </Card>
          )}
        </div>
      )}
    </Card>
  );
};

export default PatientSpineReports;
