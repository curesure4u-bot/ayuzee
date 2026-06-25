import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Languages, Loader2, Printer } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";

type Lang = "en" | "ta" | "ml" | "hi";
type Props = {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  categoryKey: string;
  diseaseKey: string;
  diseaseName: string;
  diseaseModern: string;
  pathya?: string;
  apathya?: string;
};

const LABELS: Record<Lang, { do: string; avoid: string; title: string; lifestyle: string; doctor: string; date: string }> = {
  en: { do: "Do (Pathya)", avoid: "Avoid (Apathya)", title: "Patient Handout", lifestyle: "Lifestyle Notes", doctor: "Doctor", date: "Date" },
  ta: { do: "செய்ய வேண்டியவை (பத்யம்)", avoid: "தவிர்க்க வேண்டியவை (அபத்யம்)", title: "நோயாளி வழிகாட்டி", lifestyle: "வாழ்வியல் குறிப்புகள்", doctor: "மருத்துவர்", date: "தேதி" },
  ml: { do: "ചെയ്യേണ്ടത് (പത്യം)", avoid: "ഒഴിവാക്കേണ്ടത് (അപത്യം)", title: "രോഗി മാർഗ്ഗനിർദ്ദേശം", lifestyle: "ജീവിതരീതി കുറിപ്പുകൾ", doctor: "ഡോക്ടർ", date: "തീയതി" },
  hi: { do: "करें (पथ्य)", avoid: "बचें (अपथ्य)", title: "रोगी मार्गदर्शिका", lifestyle: "जीवनशैली सुझाव", doctor: "चिकित्सक", date: "दिनांक" },
};

export default function PatientHandoutDialog({ open, onOpenChange, categoryKey, diseaseKey, diseaseName, diseaseModern, pathya, apathya }: Props) {
  const [lang, setLang] = useState<Lang>("en");
  const [translated, setTranslated] = useState<{ pathya?: string; apathya?: string; lifestyle?: string; name?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    if (lang === "en") { setTranslated(null); return; }
    setLoading(true);
    supabase
      .from("astg_handouts")
      .select("disease_name_translated,pathya_translated,apathya_translated,lifestyle_notes")
      .eq("category_key", categoryKey)
      .eq("disease_key", diseaseKey)
      .eq("language", lang)
      .maybeSingle()
      .then(({ data }) => {
        setTranslated(
          data
            ? {
                name: data.disease_name_translated ?? undefined,
                pathya: data.pathya_translated ?? undefined,
                apathya: data.apathya_translated ?? undefined,
                lifestyle: data.lifestyle_notes ?? undefined,
              }
            : null,
        );
        setLoading(false);
      });
  }, [open, lang, categoryKey, diseaseKey]);

  const labels = LABELS[lang];
  const showPathya = (lang === "en" ? pathya : translated?.pathya) ?? pathya ?? "";
  const showApathya = (lang === "en" ? apathya : translated?.apathya) ?? apathya ?? "";
  const showName = translated?.name ?? diseaseName;

  async function downloadPDF() {
    if (!previewRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(previewRef.current, { scale: 2, backgroundColor: "#ffffff" });
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgRatio = canvas.height / canvas.width;
      const w = pageW - 40;
      const h = Math.min(w * imgRatio, pageH - 40);
      pdf.addImage(img, "PNG", 20, 20, w, h);
      pdf.save(`handout-${diseaseKey}-${lang}.pdf`);
      toast.success("Handout downloaded");
    } catch (e: any) {
      toast.error(e.message ?? "PDF failed");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Languages className="h-4 w-4" /> Patient Handout
          </DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Language</span>
          <Select value={lang} onValueChange={(v) => setLang(v as Lang)}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
              <SelectItem value="ml">മലയാളം (Malayalam)</SelectItem>
              <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
            </SelectContent>
          </Select>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {lang !== "en" && !loading && !translated && (
            <span className="text-xs text-amber-600">No translation saved — showing English content with {lang.toUpperCase()} labels.</span>
          )}
        </div>

        <div
          ref={previewRef}
          className="rounded-lg border bg-white p-6 text-gray-900"
          style={{ fontFamily: "'Noto Sans', 'Noto Sans Tamil', 'Noto Sans Malayalam', 'Noto Sans Devanagari', system-ui, sans-serif" }}
        >
          <div className="border-b pb-3">
            <div className="text-xs uppercase tracking-wide text-emerald-700">{labels.title} · Ayuzee</div>
            <h2 className="text-2xl font-bold">{showName}</h2>
            <p className="text-sm text-gray-600">{diseaseModern} · {diseaseName}</p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded border border-emerald-200 bg-emerald-50 p-3">
              <h3 className="mb-2 font-semibold text-emerald-800">✅ {labels.do}</h3>
              <p className="whitespace-pre-line text-sm">{showPathya || "—"}</p>
            </div>
            <div className="rounded border border-red-200 bg-red-50 p-3">
              <h3 className="mb-2 font-semibold text-red-800">❌ {labels.avoid}</h3>
              <p className="whitespace-pre-line text-sm">{showApathya || "—"}</p>
            </div>
          </div>
          {translated?.lifestyle && (
            <div className="mt-4 rounded border bg-amber-50 p-3">
              <h3 className="mb-1 font-semibold text-amber-800">🌿 {labels.lifestyle}</h3>
              <p className="whitespace-pre-line text-sm">{translated.lifestyle}</p>
            </div>
          )}
          <div className="mt-6 flex justify-between border-t pt-3 text-xs text-gray-500">
            <span>{labels.doctor}: ____________________</span>
            <span>{labels.date}: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={downloadPDF} disabled={generating} className="gap-2">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
