import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Check, MessageSquare, X, Loader2 } from "lucide-react";
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
  const [reason, setReason] = useState("");
  const [infoOpen, setInfoOpen] = useState(false);
  const [info, setInfo] = useState("");

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

  const busy = approve.isPending || reject.isPending || requestInfo.isPending;

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
            <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">Documents</p>
            <ProductDocumentViewer documents={docs} />
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
            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                size="sm"
                disabled={busy}
                onClick={() => approve.mutate(product)}
                className="bg-emerald-600 hover:bg-emerald-700"
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
          <Textarea
            rows={4}
            placeholder="Provide a reason that will be sent to the manufacturer"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!reason.trim() || reject.isPending}
              onClick={() => {
                reject.mutate(
                  { product, reason: reason.trim() },
                  {
                    onSuccess: () => {
                      setRejectOpen(false);
                      setReason("");
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
