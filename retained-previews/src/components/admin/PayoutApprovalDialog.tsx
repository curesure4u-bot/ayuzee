import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { computeTds, type PayoutRequestRow, usePayoutAction } from "@/hooks/usePayouts";

type Mode = "approve" | "reject" | "hold" | "process";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payout: PayoutRequestRow | null;
  mode: Mode;
}

const REJECT_REASONS = [
  "Insufficient balance verification",
  "Invalid bank details",
  "Suspicious activity",
  "Pending order settlements",
  "Other",
];

export const PayoutApprovalDialog = ({ open, onOpenChange, payout, mode }: Props) => {
  const action = usePayoutAction();
  const [paymentMethod, setPaymentMethod] = useState<"manual" | "razorpay" | "neft" | "rtgs" | "upi">("manual");
  const [utr, setUtr] = useState("");
  const [reason, setReason] = useState(REJECT_REASONS[0]);
  const [otherReason, setOtherReason] = useState("");
  const [holdReason, setHoldReason] = useState("");
  const [adminNote, setAdminNote] = useState("");

  useEffect(() => {
    if (open) {
      setPaymentMethod("manual");
      setUtr("");
      setReason(REJECT_REASONS[0]);
      setOtherReason("");
      setHoldReason("");
      setAdminNote("");
    }
  }, [open]);

  const tds = useMemo(() => (payout ? computeTds(Number(payout.amount)) : 0), [payout]);
  const net = payout ? Number(payout.amount) - tds : 0;

  if (!payout) return null;

  const submit = async () => {
    if (mode === "process" && paymentMethod !== "razorpay" && !utr.trim()) {
      // require UTR for manual processing
      return;
    }
    const finalReason = reason === "Other" ? otherReason.trim() : reason;
    await action.mutateAsync({
      payout_request_id: payout.id,
      action: mode,
      payment_method: mode === "process" ? paymentMethod : undefined,
      utr_number: mode === "process" ? utr.trim() || undefined : undefined,
      rejection_reason: mode === "reject" ? finalReason : undefined,
      hold_reason: mode === "hold" ? holdReason.trim() || undefined : undefined,
      admin_note: adminNote.trim() || undefined,
      tds_amount: mode === "process" ? tds : undefined,
    });
    onOpenChange(false);
  };

  const titleMap: Record<Mode, string> = {
    approve: "Approve payout request",
    reject: "Reject payout request",
    hold: "Place payout on hold",
    process: "Process payout",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{titleMap[mode]}</DialogTitle>
          <DialogDescription>
            {payout.requester?.full_name ?? "User"} · ₹{Number(payout.amount).toLocaleString("en-IN")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div className="rounded-md border p-3 space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">Payee</span><span>{payout.account_holder_name ?? payout.requester?.full_name ?? "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">A/C</span><span>{payout.account_number_masked ?? "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">IFSC</span><span>{payout.ifsc_code ?? "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Bank</span><span>{payout.bank_name ?? "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Gross</span><span className="font-mono">₹{Number(payout.amount).toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">TDS</span><span className="font-mono">₹{tds.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between font-semibold border-t pt-1"><span>Net to transfer</span><span className="font-mono">₹{net.toLocaleString("en-IN")}</span></div>
          </div>

          {mode === "process" && (
            <>
              <div>
                <Label>Payment method</Label>
                <Select value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual (admin initiates via bank)</SelectItem>
                    <SelectItem value="neft">Manual NEFT</SelectItem>
                    <SelectItem value="rtgs">Manual RTGS</SelectItem>
                    <SelectItem value="upi">Manual UPI</SelectItem>
                    <SelectItem value="razorpay">Razorpay Payouts (auto)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {paymentMethod !== "razorpay" && (
                <div>
                  <Label>UTR / Reference number *</Label>
                  <Input value={utr} onChange={(e) => setUtr(e.target.value)} placeholder="e.g. SBIN1234567890" />
                </div>
              )}
            </>
          )}

          {mode === "reject" && (
            <>
              <div>
                <Label>Rejection reason</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {REJECT_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {reason === "Other" && (
                <div>
                  <Label>Specify reason *</Label>
                  <Input value={otherReason} onChange={(e) => setOtherReason(e.target.value)} />
                </div>
              )}
            </>
          )}

          {mode === "hold" && (
            <div>
              <Label>Hold reason</Label>
              <Input value={holdReason} onChange={(e) => setHoldReason(e.target.value)} placeholder="What needs investigation?" />
            </div>
          )}

          <div>
            <Label>Admin note (internal)</Label>
            <Textarea rows={2} value={adminNote} onChange={(e) => setAdminNote(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={submit}
            disabled={
              action.isPending ||
              (mode === "reject" && reason === "Other" && !otherReason.trim()) ||
              (mode === "process" && paymentMethod !== "razorpay" && !utr.trim())
            }
            variant={mode === "reject" ? "destructive" : "default"}
          >
            {action.isPending ? "Working..." : mode === "process" ? "Process Payout" : titleMap[mode].split(" ")[0]}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
