import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, FileText } from "lucide-react";

export type DocumentItem = {
  label: string;
  url: string | null | undefined;
};

const isImage = (url: string) => /\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(url);

export const ProductDocumentViewer = ({ documents }: { documents: DocumentItem[] }) => {
  const [open, setOpen] = useState<DocumentItem | null>(null);
  const available = documents.filter((d) => !!d.url) as { label: string; url: string }[];

  if (available.length === 0) {
    return <p className="text-xs italic text-muted-foreground">No documents uploaded.</p>;
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {available.map((doc) => (
          <Button
            key={doc.label}
            size="sm"
            variant="outline"
            onClick={() => setOpen(doc)}
            className="gap-1"
          >
            <FileText className="h-3.5 w-3.5" />
            {doc.label}
          </Button>
        ))}
      </div>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-3">
              <span>{open?.label}</span>
              {open && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <a href={open.url} target="_blank" rel="noreferrer">
                      <ExternalLink className="mr-1 h-3.5 w-3.5" /> Open
                    </a>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <a href={open.url} download>
                      <Download className="mr-1 h-3.5 w-3.5" /> Download
                    </a>
                  </Button>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
          {open && (
            <div className="h-[70vh] w-full overflow-auto rounded-md border bg-muted">
              {isImage(open.url) ? (
                <img src={open.url} alt={open.label} className="mx-auto max-h-full" />
              ) : (
                <iframe
                  src={open.url}
                  title={open.label}
                  className="h-full w-full"
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductDocumentViewer;
