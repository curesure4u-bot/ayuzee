import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  ExternalLink,
  Download,
  FileText,
  Loader2,
} from "lucide-react";
import {
  REQUIRED_DOCUMENTS,
  type Manufacturer,
  type DocumentVerificationStatus,
} from "@/types/manufacturer";
import {
  useVerificationLogs,
  useVerifyDocument,
} from "@/hooks/useManufacturerApprovals";

interface Props {
  manufacturer: Manufacturer;
  /** Optional callback when overall verification progress changes */
  onProgressChange?: (verified: number, total: number) => void;
}

const statusBadge: Record<DocumentVerificationStatus | "not_uploaded", { label: string; cls: string; icon: JSX.Element }> = {
  verified: {
    label: "Verified",
    cls: "bg-emerald-500/15 text-emerald-600 border-emerald-300",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  pending: {
    label: "Pending review",
    cls: "bg-amber-500/15 text-amber-600 border-amber-300",
    icon: <Circle className="h-3.5 w-3.5" />,
  },
  issue_found: {
    label: "Issue found",
    cls: "bg-red-500/15 text-red-600 border-red-300",
    icon: <AlertCircle className="h-3.5 w-3.5" />,
  },
  not_uploaded: {
    label: "Not uploaded",
    cls: "bg-muted text-muted-foreground border-border",
    icon: <FileText className="h-3.5 w-3.5" />,
  },
};

export const ManufacturerDocumentChecklist = ({ manufacturer: m, onProgressChange }: Props) => {
  const { data: logs = [] } = useVerificationLogs(m.id);
  const verify = useVerifyDocument(m.id);

  const [issueDoc, setIssueDoc] = useState<{ type: string; label: string } | null>(null);
  const [issueComment, setIssueComment] = useState("");
  const [preview, setPreview] = useState<{ url: string; label: string } | null>(null);

  // Latest status per doc
  const docStatus = useMemo(() => {
    const map: Record<string, DocumentVerificationStatus> = {};
    for (const log of logs) {
      if (!map[log.document_type]) map[log.document_type] = log.status;
    }
    return map;
  }, [logs]);

  const total = REQUIRED_DOCUMENTS.length;
  const verifiedCount = REQUIRED_DOCUMENTS.filter((d) => docStatus[d.type] === "verified").length;
  const progress = total === 0 ? 0 : Math.round((verifiedCount / total) * 100);

  // Notify parent on change
  useMemo(() => {
    onProgressChange?.(verifiedCount, total);
  }, [verifiedCount, total, onProgressChange]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          {verifiedCount} of {total} required documents verified
        </p>
        <Badge variant="outline" className="font-mono">
          {progress}%
        </Badge>
      </div>
      <Progress value={progress} className="h-2 [&>div]:bg-emerald-500" />

      <ul className="divide-y rounded-md border">
        {REQUIRED_DOCUMENTS.map((d) => {
          const url = (m as any)[d.urlField] as string | null;
          const key = url ? (docStatus[d.type] ?? "pending") : "not_uploaded";
          const meta = statusBadge[key];
          const latest = logs.find((l) => l.document_type === d.type);

          return (
            <li key={d.type} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{d.label}</span>
                  <Badge variant="outline" className={`gap-1 ${meta.cls}`}>
                    {meta.icon}
                    {meta.label}
                  </Badge>
                </div>
                {latest?.comments && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Note: {latest.comments}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {url ? (
                  <>
                    <Button size="sm" variant="outline" onClick={() => setPreview({ url, label: d.label })}>
                      <ExternalLink className="mr-1 h-3.5 w-3.5" /> View
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <a href={url} download>
                        <Download className="mr-1 h-3.5 w-3.5" /> Download
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      disabled={verify.isPending || docStatus[d.type] === "verified"}
                      onClick={() => verify.mutate({ type: d.type, status: "verified" })}
                    >
                      {verify.isPending ? (
                        <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                      )}
                      Verify
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={verify.isPending}
                      onClick={() => {
                        setIssueDoc({ type: d.type, label: d.label });
                        setIssueComment(latest?.comments ?? "");
                      }}
                    >
                      <AlertCircle className="mr-1 h-3.5 w-3.5" /> Issue
                    </Button>
                  </>
                ) : (
                  <span className="text-xs italic text-muted-foreground">Awaiting upload</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Document preview */}
      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{preview?.label}</DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="h-[70vh] w-full overflow-auto rounded-md border bg-muted">
              {/\.(png|jpe?g|webp|gif)(\?|$)/i.test(preview.url) ? (
                <img src={preview.url} alt={preview.label} className="mx-auto max-h-full" />
              ) : (
                <iframe src={preview.url} title={preview.label} className="h-full w-full" />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Issue dialog */}
      <Dialog open={!!issueDoc} onOpenChange={(o) => !o && setIssueDoc(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark issue — {issueDoc?.label}</DialogTitle>
          </DialogHeader>
          <Textarea
            rows={4}
            placeholder="Describe the issue (will be sent to the manufacturer)"
            value={issueComment}
            onChange={(e) => setIssueComment(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIssueDoc(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!issueComment.trim() || verify.isPending}
              onClick={() => {
                if (!issueDoc) return;
                verify.mutate(
                  { type: issueDoc.type, status: "issue_found", comments: issueComment.trim() },
                  {
                    onSuccess: () => {
                      setIssueDoc(null);
                      setIssueComment("");
                    },
                  },
                );
              }}
            >
              {verify.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              Save issue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManufacturerDocumentChecklist;
