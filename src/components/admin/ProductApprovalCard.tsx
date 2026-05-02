import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, MessageSquare, X, Loader2, ShieldCheck, History } from "lucide-react";
import {
  ProductDocumentViewer,
  type DocumentItem,
} from "@/components/admin/ProductDocumentViewer";
import {
  useApproveProduct,
  useRejectProduct,
  useRequestInfo,
  type ProductApproval,
} from "@/hooks/useProductApprovals";

const statusBadge: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-600 border-amber-300",
  approved: "bg-emerald-500/15 text-emerald-600 border-emerald-300",
  rejected: "bg-red-500/15 text-red-600 border-red-300",
  info_requested: "bg-sky-500/15 text-sky-600 border-sky-300",
};

const fmtINR = (n: number | null | undefined) =>
  n == null ? "—" : `₹${Number(n).toLocaleString("en-IN")}`;

const REJECTION_REASONS = [
  "Missing or invalid license document",
  "Incomplete product information",
  "Pricing or MRP discrepancy",
  "Banned or restricted ingredient",
  "Image quality insufficient",
  "Misleading or unverified claims",
  "Expired or near-expiry batch",
  "Other (specify below)",
];

type Props = {
  product: ProductApproval;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  showActions?: boolean;
};

export const ProductApprovalCard = ({
  product,
  selected,
  onToggleSelect,
  showActions = true,
}: Props) => {
  const approve = useApproveProduct();
  const reject = useRejectProduct();
  const requestInfo = useRequestInfo();

  const [lightbox, setLightbox] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reasonChoice, setReasonChoice] = useState(REJECTION_REASONS[0]);
  const [reasonNote, setReasonNote] = useState("");
  const [infoOpen, setInfoOpen] = useState(false);
  const [info, setInfo] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [verified, setVerified] = useState<Record<string, boolean>>({});

  const sellingPrice = product.discount_price ?? product.price;
  const margin =
    product.mrp && sellingPrice
      ? Math.round(((Number(product.mrp) - Number(sellingPrice)) / Number(product.mrp)) * 100)
      : null;

  const gallery = [
    product.image_url,
    ...((product.gallery_urls ?? []) as string[]),
  ].filter((u): u is string => !!u);

  const docs: DocumentItem[] = [
    { label: "License", url: product.license_url },
    { label: "GMP Certificate", url: product.gmp_certificate_url },
    { label: "ISO Certificate", url: product.iso_certificate_url },
    { label: "FSSAI", url: product.fssai_certificate_url },
  ];
  const availableDocs = docs.filter((d) => !!d.url);

  const timeline = useMemo(() => {
    const items: { label: string; at: string | null; tone: string }[] = [
      { label: "Submitted", at: product.submitted_at || product.created_at, tone: "text-muted-foreground" },
    ];
    if (product.approval_status === "info_requested") {
      items.push({ label: "Info requested", at: null, tone: "text-sky-600" });
    }
    if (product.approval_status === "rejected") {
      items.push({ label: "Rejected", at: null, tone: "text-red-600" });
    }
    if (product.approval_status === "approved") {
      items.push({ label: "Approved", at: product.approved_at, tone: "text-emerald-600" });
    }
    return items;
  }, [product]);

  const busy = approve.isPending || reject.isPending || requestInfo.isPending;
  const allDocsVerified =
    availableDocs.length > 0 && availableDocs.every((d) => verified[d.label]);

  const buildReason = () =>
    reasonChoice === REJECTION_REASONS[REJECTION_REASONS.length - 1]
      ? reasonNote.trim()
      : reasonNote.trim()
        ? `${reasonChoice} — ${reasonNote.trim()}`
        : reasonChoice;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
        <div className="flex items-start gap-3">
          {onToggleSelect && (
            <Checkbox
              checked={selected}
              onCheckedChange={() => onToggleSelect(product.id)}
              className="mt-1"
              aria-label="Select product"
            />
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-lg leading-tight">{product.name}</h3>
              <Badge variant="outline" className={statusBadge[product.approval_status]}>
                {product.approval_status.replace("_", " ")}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {product.brand} · {product.category}
              {product.ayush_system ? ` · ${product.ayush_system}` : ""}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Submitted by{" "}
              <span className="font-medium text-foreground">
                {product.manufacturer_name || product.brand}
              </span>{" "}
              ·{" "}
              {new Date(product.submitted_at || product.created_at).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setHistoryOpen(true)}
          className="gap-1 text-muted-foreground"
        >
          <History className="h-3.5 w-3.5" /> History
        </Button>
      </CardHeader>

      <CardContent className="grid gap-4 lg:grid-cols-[180px_1fr]">
        {/* Gallery */}
        <div className="space-y-2">
          <div className="aspect-square overflow-hidden rounded-md border bg-muted">
            {gallery[0] ? (
              <img
                src={gallery[0]}
                alt={product.name}
                className="h-full w-full cursor-zoom-in object-cover"
                onClick={() => setLightbox(gallery[0])}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                No image
              </div>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="flex flex-wrap gap-1">
              {gallery.slice(1, 5).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setLightbox(u)}
                  className="h-10 w-10 overflow-hidden rounded border"
                >
                  <img src={u} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
            <Field label="MRP" value={fmtINR(product.mrp)} />
            <Field label="Selling" value={fmtINR(sellingPrice)} />
            <Field label="Margin" value={margin == null ? "—" : `${margin}%`} />
            <Field label="Stock" value={`${product.stock} ${product.unit ?? ""}`} />
            <Field label="License #" value={product.license_number ?? "—"} />
            <Field label="Batch" value={product.batch_number ?? "—"} />
            <Field
              label="Expiry"
              value={
                product.expiry_date
                  ? new Date(product.expiry_date).toLocaleDateString("en-IN")
                  : "—"
              }
            />
            <Field label="System" value={product.ayush_system ?? "—"} />
          </div>

          {product.ingredients && product.ingredients.length > 0 && (
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Ingredients</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {product.ingredients.map((i) => (
                  <Badge key={i} variant="secondary" className="font-normal">
                    {i}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {(product.claims || product.description) && (
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Claims</p>
              <p className="text-sm">{product.claims || product.description}</p>
            </div>
          )}

          <div>
            <div className="mb-1 flex items-center justify-between">
              <p className="text-xs font-medium uppercase text-muted-foreground">Documents</p>
              {availableDocs.length > 0 && (
                <span
                  className={`flex items-center gap-1 text-xs ${
                    allDocsVerified ? "text-emerald-600" : "text-amber-600"
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {Object.values(verified).filter(Boolean).length}/{availableDocs.length} verified
                </span>
              )}
            </div>
            <ProductDocumentViewer documents={docs} />
            {showActions && availableDocs.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-3">
                {availableDocs.map((d) => (
                  <label
                    key={d.label}
                    className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <Checkbox
                      checked={!!verified[d.label]}
                      onCheckedChange={(v) =>
                        setVerified((prev) => ({ ...prev, [d.label]: !!v }))
                      }
                    />
                    Verify {d.label}
                  </label>
                ))}
              </div>
            )}
          </div>

          {product.rejection_reason && (
            <p className="rounded-md bg-red-500/10 p-2 text-sm text-red-700">
              <strong>Rejection reason:</strong> {product.rejection_reason}
            </p>
          )}
          {product.requested_info && (
            <p className="rounded-md bg-sky-500/10 p-2 text-sm text-sky-700">
              <strong>Info requested:</strong> {product.requested_info}
            </p>
          )}

          {showActions && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Button
                size="sm"
                disabled={busy || (availableDocs.length > 0 && !allDocsVerified)}
                onClick={() => approve.mutate(product)}
                className="bg-emerald-600 hover:bg-emerald-700"
                title={
                  availableDocs.length > 0 && !allDocsVerified
                    ? "Verify all documents before approving"
                    : undefined
                }
              >
                {approve.isPending ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-1 h-4 w-4" />
                )}
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={busy}
                onClick={() => setRejectOpen(true)}
              >
                <X className="mr-1 h-4 w-4" /> Reject
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => setInfoOpen(true)}
              >
                <MessageSquare className="mr-1 h-4 w-4" /> Request info
              </Button>
              {availableDocs.length > 0 && !allDocsVerified && (
                <span className="text-xs text-amber-600">
                  Verify all documents to enable approval
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>

      {/* Lightbox */}
      <Dialog open={!!lightbox} onOpenChange={(o) => !o && setLightbox(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{product.name}</DialogTitle>
          </DialogHeader>
          {lightbox && <img src={lightbox} alt={product.name} className="mx-auto max-h-[70vh]" />}
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject product</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">Reason</p>
              <Select value={reasonChoice} onValueChange={setReasonChoice}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REJECTION_REASONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Textarea
              rows={3}
              placeholder={
                reasonChoice === REJECTION_REASONS[REJECTION_REASONS.length - 1]
                  ? "Describe the reason (required)"
                  : "Add additional notes (optional)"
              }
              value={reasonNote}
              onChange={(e) => setReasonNote(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={
                reject.isPending ||
                (reasonChoice === REJECTION_REASONS[REJECTION_REASONS.length - 1] &&
                  !reasonNote.trim())
              }
              onClick={() => {
                reject.mutate(
                  { product, reason: buildReason() },
                  {
                    onSuccess: () => {
                      setRejectOpen(false);
                      setReasonNote("");
                      setReasonChoice(REJECTION_REASONS[0]);
                    },
                  },
                );
              }}
            >
              {reject.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              Confirm reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request info dialog */}
      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request more information</DialogTitle>
          </DialogHeader>
          <Textarea
            rows={4}
            placeholder="What additional information should the manufacturer provide?"
            value={info}
            onChange={(e) => setInfo(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setInfoOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!info.trim() || requestInfo.isPending}
              onClick={() => {
                requestInfo.mutate(
                  { product, info: info.trim() },
                  {
                    onSuccess: () => {
                      setInfoOpen(false);
                      setInfo("");
                    },
                  },
                );
              }}
            >
              {requestInfo.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              Send request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approval history — {product.name}</DialogTitle>
          </DialogHeader>
          <ol className="relative ml-3 space-y-4 border-l pl-5">
            {timeline.map((t, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-background bg-primary" />
                <p className={`text-sm font-medium ${t.tone}`}>{t.label}</p>
                <p className="text-xs text-muted-foreground">
                  {t.at
                    ? new Date(t.at).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </p>
              </li>
            ))}
            {product.rejection_reason && (
              <li className="relative">
                <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-background bg-red-500" />
                <p className="text-sm font-medium text-red-600">Reason</p>
                <p className="text-xs text-muted-foreground">{product.rejection_reason}</p>
              </li>
            )}
            {product.requested_info && (
              <li className="relative">
                <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-background bg-sky-500" />
                <p className="text-sm font-medium text-sky-600">Info requested</p>
                <p className="text-xs text-muted-foreground">{product.requested_info}</p>
              </li>
            )}
          </ol>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    <p className="font-medium">{value}</p>
  </div>
);

export default ProductApprovalCard;
