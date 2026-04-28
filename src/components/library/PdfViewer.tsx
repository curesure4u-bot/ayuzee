import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Download, ExternalLink, Loader2 } from "lucide-react";

interface PdfViewerProps {
  /** Path under /public, e.g. "/acupoints-and-uses.pdf" */
  src: string;
  title: string;
}

/**
 * Resilient PDF viewer.
 * - Uses an absolute URL (origin + path) so the embedded viewer works
 *   even when the app is running inside a sandboxed preview iframe.
 * - Falls back to a friendly "Open / Download" panel if the browser
 *   refuses to render the embedded PDF (common in iframes / mobile).
 */
export const PdfViewer = ({ src, title }: PdfViewerProps) => {
  const [absoluteSrc, setAbsoluteSrc] = useState<string>(src);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const url = new URL(src, window.location.origin).toString();
        setAbsoluteSrc(url);
      } catch {
        setAbsoluteSrc(src);
      }
    }
  }, [src]);

  useEffect(() => {
    setStatus("loading");
    // Verify the file actually exists (catches 404 / wrong path issues fast).
    let cancelled = false;
    fetch(absoluteSrc, { method: "HEAD" })
      .then((r) => {
        if (cancelled) return;
        if (!r.ok) setStatus("error");
        else setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [absoluteSrc]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline">
          <a href={absoluteSrc} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" /> Open in new tab
          </a>
        </Button>
        <Button asChild size="sm" variant="outline">
          <a href={absoluteSrc} download>
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </a>
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="relative aspect-[4/5] w-full bg-muted md:aspect-[16/10]">
          {status === "loading" && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/60 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading PDF…
            </div>
          )}

          {status === "error" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted p-6 text-center">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-sm font-medium">
                  This PDF can&apos;t be previewed inline in this browser.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Use the buttons above to open it in a new tab or download it.
                </p>
              </div>
              <div className="flex gap-2">
                <Button asChild size="sm">
                  <a href={absoluteSrc} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" /> Open PDF
                  </a>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <a href={absoluteSrc} download>
                    <Download className="mr-2 h-4 w-4" /> Download
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              key={absoluteSrc}
              src={`${absoluteSrc}#view=FitH&toolbar=1`}
              title={title}
              className="h-full w-full border-0"
              onLoad={() => setStatus("ready")}
              onError={() => setStatus("error")}
            />
          )}
        </div>
      </Card>
    </div>
  );
};

export default PdfViewer;
