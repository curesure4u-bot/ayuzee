import { format } from "date-fns";
import { motion } from "framer-motion";
import { Banknote, Calendar, FileText, History, Pause, ShieldCheck, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { computeTds, type PayoutRequestRow, usePayoutHistory } from "@/hooks/usePayouts";

interface Props {
  payout: PayoutRequestRow;
  selected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
  onApprove?: (p: PayoutRequestRow) => void;
  onReject?: (p: PayoutRequestRow) => void;
  onHold?: (p: PayoutRequestRow) => void;
  onProcess?: (p: PayoutRequestRow) => void;
}

const statusVariant = (s: string): "default" | "secondary" | "destructive" | "outline" => {
  if (s === "approved") return "default";
  if (s === "rejected") return "destructive";
  if (s === "processed") return "secondary";
  return "outline";
};

export const PayoutRequestCard = ({ payout, selected, onSelect, onApprove, onReject, onHold, onProcess }: Props) => {
  const { data: history } = usePayoutHistory(payout.requester_user_id);
  const tds = computeTds(Number(payout.amount));
  const net = Number(payout.amount) - tds;
  const lastProcessed = (history ?? []).find((h) => h.status === "processed" && h.id !== payout.id);

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
      <Card>
        <CardContent className="p-4 md:p-5 space-y-4">
          <div className="flex items-start gap-3">
            {onSelect && payout.status === "approved" && (
              <Checkbox
                className="mt-1.5"
                checked={selected}
                onCheckedChange={(v) => onSelect(payout.id, !!v)}
              />
            )}
            <Avatar className="h-12 w-12">
              <AvatarImage src={payout.requester?.avatar_url ?? undefined} />
              <AvatarFallback>{(payout.requester?.full_name ?? "?").slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold truncate">{payout.requester?.full_name ?? "Unknown"}</h3>
                <Badge variant="outline" className="capitalize">{payout.role ?? payout.type ?? "user"}</Badge>
                <Badge variant={statusVariant(payout.status)} className="capitalize">{payout.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                <Calendar className="inline h-3 w-3 mr-1" />
                Requested {format(new Date(payout.created_at), "PPp")}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">₹{Number(payout.amount).toLocaleString("en-IN")}</div>
              <div className="text-xs text-muted-foreground">
                Wallet: ₹{Number(payout.wallet?.balance ?? 0).toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-md border p-3 text-sm space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Banknote className="h-3.5 w-3.5" /> Bank Details
              </div>
              <div><span className="text-muted-foreground">Holder:</span> {payout.account_holder_name ?? "—"}</div>
              <div><span className="text-muted-foreground">A/C:</span> {payout.account_number_masked ?? "—"}</div>
              <div><span className="text-muted-foreground">IFSC:</span> {payout.ifsc_code ?? "—"}</div>
              <div><span className="text-muted-foreground">Bank:</span> {payout.bank_name ?? "—"} {payout.bank_branch ? `· ${payout.bank_branch}` : ""}</div>
              <div className="text-xs text-muted-foreground">Method: {payout.payment_method ?? "Manual"}</div>
            </div>

            <div className="rounded-md border p-3 text-sm space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" /> Settlement Summary
              </div>
              <div className="flex justify-between"><span className="text-muted-foreground">Gross</span><span className="font-mono">₹{Number(payout.amount).toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">TDS {tds > 0 ? "(10%)" : ""}</span>
                <span className="font-mono">₹{tds.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-1 mt-1">
                <span>Net Payable</span>
                <span className="font-mono">₹{net.toLocaleString("en-IN")}</span>
              </div>
              {payout.utr_number && (
                <div className="text-xs text-emerald-600 dark:text-emerald-400">UTR: {payout.utr_number}</div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span><History className="inline h-3 w-3 mr-1" />{(history?.length ?? 0)} previous request(s)</span>
              {lastProcessed?.processed_at && (
                <span>Last paid {format(new Date(lastProcessed.processed_at), "PP")}</span>
              )}
              {Array.isArray(payout.supporting_documents) && payout.supporting_documents.length > 0 && (
                <span><FileText className="inline h-3 w-3 mr-1" />{payout.supporting_documents.length} doc(s)</span>
              )}
            </div>
          </div>

          {(payout.notes || payout.admin_note || payout.rejection_reason || payout.hold_reason) && (
            <div className="rounded-md bg-muted/50 p-2 text-xs space-y-1">
              {payout.notes && <div><b>User note:</b> {payout.notes}</div>}
              {payout.admin_note && <div><b>Admin note:</b> {payout.admin_note}</div>}
              {payout.rejection_reason && <div className="text-destructive"><b>Rejected:</b> {payout.rejection_reason}</div>}
              {payout.hold_reason && <div><b>On hold:</b> {payout.hold_reason}</div>}
            </div>
          )}

          {payout.status === "pending" && (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => onApprove?.(payout)}>Approve</Button>
              <Button size="sm" variant="outline" onClick={() => onHold?.(payout)}>
                <Pause className="h-3.5 w-3.5" /> Hold
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onReject?.(payout)}>
                <X className="h-3.5 w-3.5" /> Reject
              </Button>
            </div>
          )}
          {payout.status === "approved" && (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => onProcess?.(payout)}>Process Payout</Button>
              <Button size="sm" variant="destructive" onClick={() => onReject?.(payout)}>Reject</Button>
            </div>
          )}
          {payout.status === "hold" && (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => onApprove?.(payout)}>Approve</Button>
              <Button size="sm" variant="destructive" onClick={() => onReject?.(payout)}>Reject</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
