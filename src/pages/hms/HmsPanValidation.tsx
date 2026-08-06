import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  CreditCard, AlertTriangle, CheckCircle, IndianRupee,
  Shield, FileText, Search, History
} from "lucide-react";

type PanValidationRecord = {
  id: string;
  bill_no: string;
  patient_name: string;
  cash_amount: number;
  pan_number: string;
  pan_name: string;
  validated: boolean;
  validated_at: string;
  billed_by: string;
};

const mockRecords: PanValidationRecord[] = [
  { id: "1", bill_no: "IP-2026-0089", patient_name: "Vikram Singh", cash_amount: 285000, pan_number: "ABCPV1234K", pan_name: "Vikram Singh", validated: true, validated_at: "Jul 28, 2:30 PM", billed_by: "Kumar (Cashier)" },
  { id: "2", bill_no: "PK-2026-0045", patient_name: "Rajesh Sharma", cash_amount: 350000, pan_number: "DGHPS5678L", pan_name: "Rajesh Kumar Sharma", validated: true, validated_at: "Jul 25, 11:00 AM", billed_by: "Priya (Front Desk)" },
  { id: "3", bill_no: "IP-2026-0102", patient_name: "Sunita Devi", cash_amount: 220000, pan_number: "PENDING", pan_name: "—", validated: false, validated_at: "—", billed_by: "Kumar (Cashier)" },
];

const validatePanFormat = (pan: string): boolean => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan.toUpperCase());
};

const HmsPanValidation = () => {
  const [records] = useState<PanValidationRecord[]>(mockRecords);
  const [showPrompt, setShowPrompt] = useState(false);
  const [panInput, setPanInput] = useState("");
  const [panNameInput, setPanNameInput] = useState("");
  const [cashAmount, setCashAmount] = useState("250000");
  const [panError, setPanError] = useState("");

  const handleCashAmountChange = (amount: string) => {
    setCashAmount(amount);
    const numericAmount = Number(amount);
    if (numericAmount >= 200000) {
      setShowPrompt(true);
    }
  };

  const handleValidatePan = () => {
    if (!panInput.trim()) {
      setPanError("PAN number is required for cash transactions above ₹2,00,000");
      return;
    }
    if (!validatePanFormat(panInput)) {
      setPanError("Invalid PAN format. Must be: ABCDE1234F (5 letters + 4 digits + 1 letter)");
      return;
    }
    if (!panNameInput.trim()) {
      setPanError("Name as on PAN card is required");
      return;
    }
    setPanError("");
    toast.success(`PAN validated: ${panInput.toUpperCase()} — ${panNameInput}`);
    setShowPrompt(false);
    setPanInput("");
    setPanNameInput("");
  };

  const pendingCount = records.filter(r => !r.validated).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" /> PAN Card Validation
          </h1>
          <p className="text-sm text-muted-foreground">
            Section 269ST compliance — Auto-prompt for PAN when cash exceeds ₹2,00,000
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => window.location.href = "/hms/billing"}>Billing</Button>
          <Button size="sm" variant="outline" onClick={() => window.location.href = "/hms/accounts"}>Accounts</Button>
        </div>
      </div>

      {/* Compliance Alert */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="p-4 flex items-start gap-3">
          <Shield className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">Indian Income Tax Act — Section 269ST</p>
            <p className="text-xs text-amber-700 mt-0.5">
              No person shall receive an amount of ₹2,00,000 or more in cash from any person in a single day, 
              for a single transaction, or for a single event without collecting PAN details. 
              Penalty for non-compliance: Equal to the amount received (100% penalty).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Demo: Trigger the PAN validation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <IndianRupee className="h-4 w-4" /> Test PAN Prompt (Billing Simulation)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">Enter a cash amount to see how the auto-prompt works in the billing flow:</p>
          <div className="flex gap-3 items-end">
            <div>
              <Label className="text-xs">Cash Payment Amount (₹)</Label>
              <Input type="number" value={cashAmount} onChange={(e) => handleCashAmountChange(e.target.value)} className="w-48" />
            </div>
            <Button size="sm" onClick={() => { if (Number(cashAmount) >= 200000) setShowPrompt(true); else toast.info("Amount below ₹2 lakh — no PAN required"); }}>
              Process Payment
            </Button>
            {Number(cashAmount) >= 200000 && (
              <Badge variant="destructive" className="animate-pulse">PAN Required</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{records.length}</p><p className="text-xs text-muted-foreground">High-Value Cash Bills</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-green-600">{records.filter(r => r.validated).length}</p><p className="text-xs text-muted-foreground">PAN Validated</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-red-600">{pendingCount}</p><p className="text-xs text-muted-foreground">Pending Validation</p></CardContent></Card>
      </div>

      {/* Records */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><History className="h-4 w-4" /> PAN Validation Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {records.map(record => (
              <div key={record.id} className={`flex items-center justify-between rounded-lg border p-3 ${!record.validated ? "bg-red-50 border-red-200" : ""}`}>
                <div className="flex items-center gap-3">
                  {record.validated ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-red-500" />}
                  <div>
                    <p className="font-medium text-sm">{record.patient_name}</p>
                    <p className="text-xs text-muted-foreground">{record.bill_no} · Cash: ₹{record.cash_amount.toLocaleString()} · By: {record.billed_by}</p>
                  </div>
                </div>
                <div className="text-right">
                  {record.validated ? (
                    <div>
                      <p className="text-sm font-mono">{record.pan_number}</p>
                      <p className="text-xs text-muted-foreground">{record.pan_name} · {record.validated_at}</p>
                    </div>
                  ) : (
                    <Button size="sm" variant="destructive" onClick={() => setShowPrompt(true)}>Collect PAN</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* PAN Validation Prompt Dialog */}
      <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-5 w-5" /> PAN Card Required — Section 269ST
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-800">
              Cash payment of <strong>₹{Number(cashAmount).toLocaleString()}</strong> exceeds ₹2,00,000. 
              PAN card details must be collected before processing this payment.
              <br /><strong>Penalty for non-compliance: 100% of amount received.</strong>
            </div>
            <div>
              <Label>PAN Number *</Label>
              <Input value={panInput} onChange={(e) => { setPanInput(e.target.value.toUpperCase()); setPanError(""); }} placeholder="e.g. ABCPV1234K" maxLength={10} className="font-mono uppercase" />
              <p className="text-xs text-muted-foreground mt-0.5">Format: 5 letters + 4 digits + 1 letter</p>
            </div>
            <div>
              <Label>Name as on PAN Card *</Label>
              <Input value={panNameInput} onChange={(e) => setPanNameInput(e.target.value)} placeholder="Full name exactly as printed on PAN" />
            </div>
            {panError && <p className="text-xs text-red-600 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {panError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPrompt(false)}>Cancel (Bill Not Allowed)</Button>
            <Button onClick={handleValidatePan}><CheckCircle className="mr-1 h-4 w-4" /> Validate & Proceed</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsPanValidation;
