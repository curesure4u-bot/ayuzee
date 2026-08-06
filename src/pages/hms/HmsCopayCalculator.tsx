import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Calculator, Shield, IndianRupee, AlertTriangle, CheckCircle,
  FileText, Percent, CreditCard, Building2, User, Printer
} from "lucide-react";

type InsurancePolicy = {
  id: string;
  provider: string;
  policy_number: string;
  member_id: string;
  plan_name: string;
  coverage_type: "cashless" | "reimbursement";
  copay_percent: number;
  pharmacy_copay_percent: number;
  room_limit: number;
  annual_limit: number;
  used_amount: number;
  valid_until: string;
  tpa: string;
  preauth_required: boolean;
};

type BillLineItem = {
  id: string;
  description: string;
  category: "consultation" | "procedure" | "pharmacy" | "lab" | "room" | "panchakarma" | "other";
  amount: number;
  covered: boolean;
  coverage_percent: number;
};

const mockPolicy: InsurancePolicy = {
  id: "ins-001",
  provider: "Star Health Insurance",
  policy_number: "SH-2026-00456789",
  member_id: "MEM-12345",
  plan_name: "Family Health Optima",
  coverage_type: "cashless",
  copay_percent: 10,
  pharmacy_copay_percent: 20,
  room_limit: 5000,
  annual_limit: 500000,
  used_amount: 85000,
  valid_until: "2027-03-31",
  tpa: "Medi Assist",
  preauth_required: true,
};

const defaultBillItems: BillLineItem[] = [
  { id: "1", description: "Consultation - Dr. Saleem (Ayurveda)", category: "consultation", amount: 500, covered: true, coverage_percent: 100 },
  { id: "2", description: "Panchakarma - Abhyanga + Swedana", category: "panchakarma", amount: 3500, covered: true, coverage_percent: 80 },
  { id: "3", description: "Lab - CBC + Lipid Profile", category: "lab", amount: 850, covered: true, coverage_percent: 100 },
  { id: "4", description: "Pharmacy - Dashamoolarishtam 450ml", category: "pharmacy", amount: 320, covered: true, coverage_percent: 80 },
  { id: "5", description: "Pharmacy - Ashwagandha Churna 100g", category: "pharmacy", amount: 180, covered: true, coverage_percent: 80 },
  { id: "6", description: "Room Charges (General Ward) - 1 day", category: "room", amount: 2000, covered: true, coverage_percent: 100 },
];

const HmsCopayCalculator = () => {
  const [policy] = useState<InsurancePolicy>(mockPolicy);
  const [billItems, setBillItems] = useState<BillLineItem[]>(defaultBillItems);
  const [manualDiscount, setManualDiscount] = useState(0);

  // Calculations
  const totalBill = billItems.reduce((sum, item) => sum + item.amount, 0);

  const coveredItems = billItems.filter(i => i.covered);
  const nonCoveredItems = billItems.filter(i => !i.covered);

  const insuranceCoverage = coveredItems.reduce((sum, item) => {
    const categoryMultiplier = item.category === "pharmacy" ? (100 - policy.pharmacy_copay_percent) / 100 : (100 - policy.copay_percent) / 100;
    const itemCoverage = item.amount * (item.coverage_percent / 100) * categoryMultiplier;
    return sum + itemCoverage;
  }, 0);

  const roomExcess = (() => {
    const roomItems = billItems.filter(i => i.category === "room" && i.covered);
    const totalRoom = roomItems.reduce((s, i) => s + i.amount, 0);
    return Math.max(0, totalRoom - policy.room_limit);
  })();

  const remainingLimit = policy.annual_limit - policy.used_amount;
  const effectiveCoverage = Math.min(insuranceCoverage - roomExcess, remainingLimit);
  const patientPays = totalBill - effectiveCoverage - manualDiscount;
  const nonCoveredTotal = nonCoveredItems.reduce((s, i) => s + i.amount, 0);

  const toggleCoverage = (id: string) => {
    setBillItems(prev => prev.map(i => i.id === id ? { ...i, covered: !i.covered } : i));
  };

  const handleGenerateBill = () => {
    toast.success(`Bill generated. Patient copay: ₹${Math.round(patientPays).toLocaleString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" /> Copayment Calculator
          </h1>
          <p className="text-sm text-muted-foreground">
            Auto-calculate insurance coverage, copay & patient responsibility
          </p>
        </div>
        <Button size="sm" onClick={handleGenerateBill}><Printer className="mr-1 h-4 w-4" /> Generate Bill</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Insurance Policy Card */}
        <div className="space-y-4">
          <Card className="border-blue-200 bg-blue-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4 text-blue-600" /> Insurance Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Provider</span><span className="font-medium">{policy.provider}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Policy #</span><span className="font-mono text-xs">{policy.policy_number}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Plan</span><span>{policy.plan_name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Type</span><Badge variant="outline" className="capitalize">{policy.coverage_type}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">TPA</span><span>{policy.tpa}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Valid Until</span><span>{policy.valid_until}</span></div>
              <Separator />
              <div className="flex justify-between"><span className="text-muted-foreground">Copay (General)</span><span className="font-bold">{policy.copay_percent}%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Copay (Pharmacy)</span><span className="font-bold">{policy.pharmacy_copay_percent}%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Room Limit/Day</span><span>₹{policy.room_limit.toLocaleString()}</span></div>
              <Separator />
              <div className="flex justify-between"><span className="text-muted-foreground">Annual Limit</span><span>₹{policy.annual_limit.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Used</span><span className="text-amber-600">₹{policy.used_amount.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Remaining</span><span className="font-bold text-green-600">₹{remainingLimit.toLocaleString()}</span></div>
              {policy.preauth_required && (
                <div className="bg-amber-50 border border-amber-200 rounded p-2 mt-2 text-xs text-amber-800 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" /> Pre-authorization required for this policy
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Center: Bill Items */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" /> Bill Line Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {billItems.map((item) => (
                <div key={item.id} className={`flex items-center justify-between rounded border p-2.5 text-sm ${item.covered ? "bg-green-50/50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={item.covered}
                      onChange={() => toggleCoverage(item.id)}
                      className="rounded border-gray-300"
                    />
                    <div className="truncate">
                      <p className="text-xs font-medium truncate">{item.description}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{item.category} · {item.coverage_percent}% covered</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="font-bold text-sm">₹{item.amount.toLocaleString()}</p>
                    {item.covered && (
                      <p className="text-[10px] text-green-600">
                        -₹{Math.round(item.amount * (item.coverage_percent / 100) * (item.category === "pharmacy" ? (100 - policy.pharmacy_copay_percent) / 100 : (100 - policy.copay_percent) / 100)).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              <Separator className="my-2" />
              <div className="flex items-center gap-3">
                <Label className="text-xs shrink-0">Manual Discount ₹</Label>
                <Input type="number" value={manualDiscount} onChange={(e) => setManualDiscount(Number(e.target.value))} className="h-8 w-28" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Summary */}
        <div className="space-y-4">
          <Card className="border-primary/30">
            <CardHeader className="pb-2 bg-primary/5">
              <CardTitle className="text-base flex items-center gap-2"><IndianRupee className="h-4 w-4" /> Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <div className="flex justify-between text-sm">
                <span>Total Bill</span>
                <span className="font-bold">₹{totalBill.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm text-green-700">
                <span>Insurance Covers</span>
                <span className="font-bold">- ₹{Math.round(effectiveCoverage).toLocaleString()}</span>
              </div>
              <div className="text-xs text-muted-foreground pl-2 space-y-0.5">
                <p>General ({100 - policy.copay_percent}% of covered items)</p>
                <p>Pharmacy ({100 - policy.pharmacy_copay_percent}% coverage)</p>
                {roomExcess > 0 && <p className="text-amber-600">Room excess: +₹{roomExcess.toLocaleString()} (above ₹{policy.room_limit}/day limit)</p>}
              </div>
              {manualDiscount > 0 && (
                <>
                  <Separator />
                  <div className="flex justify-between text-sm text-blue-700">
                    <span>Discount</span>
                    <span>- ₹{manualDiscount.toLocaleString()}</span>
                  </div>
                </>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold bg-amber-50 rounded-lg p-3 border border-amber-200">
                <span className="flex items-center gap-1"><User className="h-4 w-4" /> Patient Pays</span>
                <span className="text-amber-800">₹{Math.round(Math.max(0, patientPays)).toLocaleString()}</span>
              </div>
              <div className="text-xs text-muted-foreground text-center">
                ({policy.copay_percent}% copay + non-covered items + room excess)
              </div>

              {/* Breakdown visual */}
              <div className="mt-3 space-y-1">
                <p className="text-xs font-medium">Coverage Breakdown</p>
                <div className="h-4 w-full rounded-full overflow-hidden bg-gray-100 flex">
                  <div className="h-full bg-green-500 transition-all" style={{ width: `${(effectiveCoverage / totalBill) * 100}%` }} />
                  {manualDiscount > 0 && <div className="h-full bg-blue-400 transition-all" style={{ width: `${(manualDiscount / totalBill) * 100}%` }} />}
                  <div className="h-full bg-amber-400 transition-all" style={{ width: `${(patientPays / totalBill) * 100}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span className="text-green-600">Insurance: {Math.round((effectiveCoverage / totalBill) * 100)}%</span>
                  <span className="text-amber-600">Patient: {Math.round((patientPays / totalBill) * 100)}%</span>
                </div>
              </div>

              <Button className="w-full mt-4" onClick={handleGenerateBill}>
                <CreditCard className="mr-2 h-4 w-4" /> Collect ₹{Math.round(Math.max(0, patientPays)).toLocaleString()} from Patient
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HmsCopayCalculator;
