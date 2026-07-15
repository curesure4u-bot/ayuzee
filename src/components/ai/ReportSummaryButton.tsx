import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Loader2, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface Props {
  bucket: string;
  path: string;
  fileName?: string;
  /** Patient user id — enables patient/doctor RLS visibility. */
  patientId?: string | null;
  /** Optional link back to source row (patient_files, atmri_sponsored_cases, prescription_orders, …). */
  refTable?: string;
  refId?: string;
  /** Optional label passed into the prompt so Claude knows what kind of doc it is. */
  documentKind?: string;
  variant?: "button" | "inline";
  className?: string;
}

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15MB safety cap for base64 payload

const SYSTEM_PROMPT = `You are Ayuzee's clinical-report assistant helping licensed AYUSH doctors and admins triage patient-uploaded documents (lab reports, prescriptions, discharge summaries, radiology reports, scanned handwritten notes).

You are NOT diagnosing. You are summarising what the document says so a qualified practitioner can read faster.

Always reply in markdown with these exact sections and headings:

### Document type
One line — what kind of report this looks like.

### Key findings
3–6 bullet points with the most important information from the document. Quote values with their units. Include patient demographics if visible.

### Abnormal or flagged values
Bullet each value that is outside the reference range printed on the report itself, in the form: **Test name** — value (ref range) — high/low. If no reference ranges are visible or nothing looks abnormal, say "None visible on this report." Do NOT invent reference ranges.

### Suggested follow-up questions for the patient
3–5 questions the doctor could ask the patient in consultation based on what this document shows.

### Confidence & caveats
Note anything that limits reliability — handwriting, poor scan quality, cropped pages, missing header, non-English text, etc.

Rules:
- Never diagnose or prescribe.
- Never invent values not visible in the document.
- If the document is not a medical report (blank page, unrelated image, illegible), say so plainly under "Document type" and leave the other sections empty.
- Be concise. Doctors are scanning, not reading.`;

const guessMime = (name: string, fallback = "application/octet-stream") => {
  const n = name.toLowerCase();
  if (n.endsWith(".pdf")) return "application/pdf";
  if (n.endsWith(".png")) return "image/png";
  if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "image/jpeg";
  if (n.endsWith(".webp")) return "image/webp";
  if (n.endsWith(".gif")) return "image/gif";
  return fallback;
};

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = String(r.result || "");
      const idx = s.indexOf(",");
      resolve(idx >= 0 ? s.slice(idx + 1) : s);
    };
    r.onerror = reject;
    r.readAsDataURL(blob);
  });

export const ReportSummaryButton = ({
  bucket,
  path,
  fileName,
  patientId,
  refTable,
  refId,
  documentKind,
  variant = "button",
  className,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string>("");
  const [open, setOpen] = useState(true);
  const [checkedExisting, setCheckedExisting] = useState(false);

  // Check for a previously generated summary so we don't re-spend tokens.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("report_summaries")
        .select("summary_markdown")
        .eq("source_bucket", bucket)
        .eq("source_path", path)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!cancelled && data?.summary_markdown) setSummary(data.summary_markdown);
      if (!cancelled) setCheckedExisting(true);
    })();
    return () => { cancelled = true; };
  }, [bucket, path]);

  const runSummary = async () => {
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) throw new Error("Sign in required");

      // 1. Download the file from storage using a short-lived signed URL.
      const { data: signed, error: signErr } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 300);
      if (signErr || !signed?.signedUrl) throw new Error(signErr?.message || "Could not access file");

      const fileResp = await fetch(signed.signedUrl);
      if (!fileResp.ok) throw new Error(`Fetch failed (${fileResp.status})`);
      const blob = await fileResp.blob();
      if (blob.size > MAX_UPLOAD_BYTES) {
        throw new Error(`File too large for AI summary (${Math.round(blob.size / 1024 / 1024)}MB, max 15MB)`);
      }

      const mime = blob.type && blob.type !== "application/octet-stream"
        ? blob.type
        : guessMime(fileName || path);

      if (!mime.startsWith("image/") && mime !== "application/pdf") {
        throw new Error(`Unsupported file type for AI summary: ${mime}`);
      }

      const base64 = await blobToBase64(blob);

      // 2. Call gateway with attachment.
      const { data: aiRes, error: aiErr } = await supabase.functions.invoke("ai-gateway", {
        body: {
          feature: "report_summary",
          system: SYSTEM_PROMPT,
          prompt: `Summarise this patient document${documentKind ? ` (${documentKind})` : ""}${fileName ? ` — filename: ${fileName}` : ""} for a reviewing doctor. Follow the required section structure exactly.`,
          context: { document_kind: documentKind, file_name: fileName },
          max_tokens: 1200,
          attachments: [{ mime, data_base64: base64, filename: fileName || path.split("/").pop() }],
        },
      });
      if (aiErr) throw aiErr;
      const text: string = (aiRes?.response ?? "").trim();
      if (!text) throw new Error("Empty response from AI");

      setSummary(text);
      setOpen(true);

      // 3. Persist. Failure here shouldn't block showing the summary.
      const { error: insErr } = await supabase.from("report_summaries").insert({
        patient_id: patientId ?? null,
        created_by: session.session.user.id,
        source_bucket: bucket,
        source_path: path,
        source_ref_table: refTable ?? null,
        source_ref_id: refId ?? null,
        summary_markdown: text,
        model: aiRes?.usage?.model ?? null,
        tokens_used: aiRes?.usage?.total_tokens ?? null,
      });
      if (insErr) console.error("report_summaries insert failed", insErr);
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Failed to summarise");
    } finally {
      setLoading(false);
    }
  };

  const btn = (
    <Button
      variant={variant === "inline" ? "ghost" : "outline"}
      size="sm"
      onClick={runSummary}
      disabled={loading || !checkedExisting}
      className={className}
    >
      {loading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" />}
      {loading ? "Summarising…" : summary ? "Re-summarise" : "Summarize with AI"}
    </Button>
  );

  return (
    <div className={cn("space-y-3", variant === "inline" && "inline-block align-middle")}>
      {btn}
      {summary && (
        <Card className="border-primary/30 bg-primary/[0.03]">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Sparkles className="h-4 w-4" /> AI-generated summary
            </span>
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {open && (
            <div className="border-t border-border px-4 py-3">
              <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-2.5 text-xs text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <p>AI-generated summary — <strong>verify against original report</strong> before making any clinical decision.</p>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{summary}</ReactMarkdown>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
