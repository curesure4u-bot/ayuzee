import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const COPY = {
  wellness: {
    title: "Wellness education only",
    body: "This tool is for general wellness education. It does not diagnose, treat, or replace emergency care or consultation with a qualified AYUSH practitioner.",
  },
  "ai-cds": {
    title: "AI clinical decision support",
    body: "AI-generated suggestions are for clinical decision support only. The treating physician is solely responsible for diagnosis, treatment, and patient safety.",
  },
  ayush: {
    title: "AYUSH information",
    body: "AYUSH therapies complement — but do not replace — conventional medical care where indicated. Seek immediate help for emergencies.",
  },
} as const;

type Variant = keyof typeof COPY;

export const ClinicalDisclaimer = ({
  variant = "wellness",
  className = "",
}: {
  variant?: Variant;
  className?: string;
}) => {
  const { title, body } = COPY[variant];
  return (
    <Alert variant="default" className={`border-amber-200 bg-amber-50/80 text-amber-950 ${className}`}>
      <AlertTriangle className="h-4 w-4 text-amber-700" />
      <AlertTitle className="text-amber-900">{title}</AlertTitle>
      <AlertDescription className="text-amber-900/90">{body}</AlertDescription>
    </Alert>
  );
};
