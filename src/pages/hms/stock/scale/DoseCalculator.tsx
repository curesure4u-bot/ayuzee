import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Brain, Calculator, AlertTriangle, CheckCircle, Printer,
  Package, Pill, ShoppingCart,
} from "lucide-react";

// ─── TAB 1: DOSE CALCULATOR ───
function DoseCalcTab() {
  const dosageForms = [
    { form: "Kashayam (Decoction)", packSize: "200ml bottle", dose: "15ml", dilution: "+ 45ml warm water", frequency: "BD (twice daily)", perDay: 30, unit: "ml", packUnits: 200, daysPerPack: 6.7, forFifteen: 3, forThirty: 5 },
    { form: "Arishtam / Asava (Fermented)", packSize: "450ml bottle", dose: "25ml", dilution: "+ 25ml warm water", frequency: "BD (twice daily)", perDay: 50, unit: "ml", packUnits: 450, daysPerPack: 9, forFifteen: 2, forThirty: 4 },
    { form: "Churna (Powder)", packSize: "100g pack", dose: "5g (1 tsp)", dilution: "With honey/warm water", frequency: "BD (twice daily)", perDay: 10, unit: "g", packUnits: 100, daysPerPack: 10, forFifteen: 2, forThirty: 3 },
    { form: "Ghritam (Medicated Ghee)", packSize: "150ml jar", dose: "5-10ml", dilution: "With warm water/milk", frequency: "BD (twice daily)", perDay: 15, unit: "ml", packUnits: 150, daysPerPack: 10, forFifteen: 2, forThirty: 3 },
    { form: "Guggulu / Vati (Tablet)", packSize: "60 tablets", dose: "2 tabs", dilution: "With warm water", frequency: "BD (twice daily)", perDay: 4, unit: "tabs", packUnits: 60, daysPerPack: 15, forFifteen: 1, forThirty: 2 },
    { form: "Taila (Oil - internal)", packSize: "200ml bottle", dose: "5-10ml", dilution: "With warm milk", frequency: "OD (once daily)", perDay: 10, unit: "ml", packUnits: 200, daysPerPack: 20, forFifteen: 1, forThirty: 2 },
    { form: "Bhasma / Pishti (Ash)", packSize: "2g / 10g vial", dose: "125-250mg", dilution: "With honey + ghee", frequency: "BD (twice daily)", perDay: 0.5, unit: "g", packUnits: 2, daysPerPack: 4, forFifteen: 4, forThirty: 8 },
    { form: "Leha / Avaleha (Confection)", packSize: "200g jar", dose: "10g (2 tsp)", dilution: "With warm milk", frequency: "BD (twice daily)", perDay: 20, unit: "g", packUnits: 200, daysPerPack: 10, forFifteen: 2, forThirty: 3 },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">AYUSH dosage form reference — standard dose, dilution, and pack requirement per duration</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Dosage Form</th><th className="px-3 py-2 text-center">Pack Size</th><th className="px-3 py-2 text-center">Single Dose</th><th className="px-3 py-2 text-left">Dilution/Vehicle</th><th className="px-3 py-2 text-center">Frequency</th><th className="px-3 py-2 text-center">Per Day</th><th className="px-3 py-2 text-center">Days/Pack</th><th className="px-3 py-2 text-center">For 15 days</th><th className="px-3 py-2 text-center">For 30 days</th></tr></thead><tbody>
          {dosageForms.map((d, i) => (
            <tr key={i} className="border-b hover:bg-muted/30">
              <td className="px-3 py-2 text-xs font-medium">{d.form}</td>
              <td className="px-3 py-2 text-center text-xs">{d.packSize}</td>
              <td className="px-3 py-2 text-center text-xs font-bold">{d.dose}</td>
              <td className="px-3 py-2 text-[10px] text-muted-foreground">{d.dilution}</td>
              <td className="px-3 py-2 text-center text-xs">{d.frequency}</td>
              <td className="px-3 py-2 text-center text-xs">{d.perDay}{d.unit}</td>
              <td className="px-3 py-2 text-center text-xs font-bold">{d.daysPerPack}</td>
              <td className="px-3 py-2 text-center"><Badge className="text-[10px] bg-blue-100 text-blue-700">{d.forFifteen} packs</Badge></td>
              <td className="px-3 py-2 text-center"><Badge className="text-[10px] bg-purple-100 text-purple-700">{d.forThirty} packs</Badge></td>
            </tr>
          ))}
        </tbody></table>
      </div>
      <Card className="border-red-200 bg-red-50/30">
        <CardContent className="p-3 text-xs text-red-700">
          <AlertTriangle className="h-3.5 w-3.5 inline mr-1" />
          <strong>Common mistake:</strong> Kashayam 200ml bottle lasts only 6.7 days at 15ml BD dose! Patient needs 3 bottles for 15 days. Most pharmacies dispense only 1 bottle → patient runs out on day 7 → drops treatment. <strong>AI auto-alerts pharmacist on correct quantity.</strong>
        </CardContent>
      </Card>
    </div>
  );
}


// ─── TAB 2: QUANTITY ADVISOR (PRESCRIPTION-BASED) ───
function QuantityAdvisorTab() {
  const prescriptionExample = [
    { medicine: "Rasnasaptakam Kashayam 200ml", dose: "15ml BD", duration: "15 days", perDay: 30, totalNeeded: 450, packSize: 200, packsNeeded: 3, alert: "Patient needs 3 bottles (not 1!)", alertType: "critical" },
    { medicine: "Simhanada Guggulu 60t", dose: "2 tabs BD", duration: "15 days", perDay: 4, totalNeeded: 60, packSize: 60, packsNeeded: 1, alert: "Exact fit — 1 box sufficient", alertType: "ok" },
    { medicine: "Dasamoolarishtam 450ml", dose: "25ml BD", duration: "15 days", perDay: 50, totalNeeded: 750, packSize: 450, packsNeeded: 2, alert: "Patient needs 2 bottles", alertType: "warning" },
    { medicine: "Ashwagandha Churna 100g", dose: "5g BD", duration: "15 days", perDay: 10, totalNeeded: 150, packSize: 100, packsNeeded: 2, alert: "1 pack lasts only 10 days — need 2", alertType: "warning" },
    { medicine: "Swarna Bhasma 2g", dose: "125mg BD", duration: "15 days", perDay: 0.25, totalNeeded: 3.75, packSize: 2, packsNeeded: 2, alert: "2g vial lasts only 8 days at this dose — need 2 vials", alertType: "critical" },
    { medicine: "Kottamchukkadi Taila 200ml", dose: "External (PK use)", duration: "5 sessions", perDay: 200, totalNeeded: 1000, packSize: 200, packsNeeded: 5, alert: "5 bottles for 5 PK sessions (200ml/session)", alertType: "info" },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Auto-calculate packs needed based on prescription dose × duration</p>
      <Card className="border-blue-200">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Sample Prescription — Dr. Arun (Rx#4525 for Rajesh Kumar, 15 days)</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Medicine</th><th className="px-3 py-2 text-center">Dose</th><th className="px-3 py-2 text-center">Duration</th><th className="px-3 py-2 text-center">Total Needed</th><th className="px-3 py-2 text-center">Pack Size</th><th className="px-3 py-2 text-center">Packs Required</th><th className="px-3 py-2 text-left">Alert</th></tr></thead><tbody>
            {prescriptionExample.map((p, i) => (
              <tr key={i} className={`border-b ${p.alertType === "critical" ? "bg-red-50/50" : p.alertType === "warning" ? "bg-amber-50/50" : ""}`}>
                <td className="px-3 py-2 text-xs font-medium">{p.medicine}</td>
                <td className="px-3 py-2 text-center text-xs">{p.dose}</td>
                <td className="px-3 py-2 text-center text-xs">{p.duration}</td>
                <td className="px-3 py-2 text-center text-xs font-bold">{p.totalNeeded}{p.totalNeeded > 100 ? "ml" : p.totalNeeded > 10 ? "g" : "g"}</td>
                <td className="px-3 py-2 text-center text-xs">{p.packSize}</td>
                <td className="px-3 py-2 text-center"><Badge variant={p.alertType === "critical" ? "destructive" : p.alertType === "warning" ? "default" : "outline"} className={`text-xs ${p.alertType === "ok" ? "text-green-600" : ""}`}>{p.packsNeeded}</Badge></td>
                <td className="px-3 py-2 text-[10px]"><span className={p.alertType === "critical" ? "text-red-600 font-bold" : p.alertType === "warning" ? "text-amber-600" : "text-green-600"}>{p.alert}</span></td>
              </tr>
            ))}
          </tbody></table></div>
        </CardContent>
      </Card>
      <div className="flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-100 border border-red-300" /> Critical: Will run out before duration ends</span>
        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-amber-100 border border-amber-300" /> Warning: Needs more than 1 pack</span>
        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-100 border border-green-300" /> OK: Exact or sufficient</span>
      </div>
    </div>
  );
}


// ─── TAB 3: PHARMACY BILL ALERT ───
function BillAlertTab() {
  const billAlerts = [
    { patient: "Rajesh Kumar", rx: "Rx#4525", time: "10:42 AM", medicines: [
      { item: "Rasnasaptakam Kashayam 200ml", prescribed: "15ml BD × 15 days", needed: 3, billing: 1, alert: "SHORT! Patient will run out on Day 7. Add 2 more bottles.", severity: "critical" },
      { item: "Simhanada Guggulu 60t", prescribed: "2 tabs BD × 15 days", needed: 1, billing: 1, alert: "Correct quantity.", severity: "ok" },
      { item: "Dasamoolarishtam 450ml", prescribed: "25ml BD × 15 days", needed: 2, billing: 1, alert: "SHORT! 1 bottle lasts only 9 days. Add 1 more.", severity: "warning" },
    ]},
    { patient: "Meera Nair", rx: "Rx#4526", time: "10:15 AM", medicines: [
      { item: "Ashwagandha Churna 100g", prescribed: "5g BD × 30 days", needed: 3, billing: 1, alert: "SHORT! 1 pack = 10 days only. Need 3 packs for 30 days.", severity: "critical" },
      { item: "Chandraprabha Vati 60t", prescribed: "2 tabs BD × 30 days", needed: 2, billing: 1, alert: "SHORT! 1 box = 15 days. Need 2 for 30 days.", severity: "warning" },
      { item: "Swarna Bhasma 2g", prescribed: "125mg BD × 30 days", needed: 4, billing: 1, alert: "CRITICAL! 2g vial = 8 days at this dose. Need 4 vials for 30 days. Bill = ₹12,000!", severity: "critical" },
    ]},
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Real-time alerts when pharmacist is billing — prevents under-dispensing</p>
      <div className="space-y-4">
        {billAlerts.map((bill, i) => (
          <Card key={i} className="border-amber-200">
            <CardHeader className="pb-2 bg-amber-50/50">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Bill Alert — {bill.patient} ({bill.rx}) • {bill.time}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-3">
              {bill.medicines.map((med, j) => (
                <div key={j} className={`p-2 rounded border text-xs ${med.severity === "critical" ? "border-red-300 bg-red-50/50" : med.severity === "warning" ? "border-amber-200 bg-amber-50/30" : "border-green-200 bg-green-50/30"}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{med.item}</p>
                      <p className="text-[10px] text-muted-foreground">Prescribed: {med.prescribed}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px]">Need: <strong>{med.needed}</strong> | Billing: <strong className={med.billing < med.needed ? "text-red-600" : "text-green-600"}>{med.billing}</strong></p>
                    </div>
                  </div>
                  <p className={`mt-1 font-bold text-[10px] ${med.severity === "critical" ? "text-red-600" : med.severity === "warning" ? "text-amber-600" : "text-green-600"}`}>
                    {med.severity === "critical" ? "🚨" : med.severity === "warning" ? "⚠️" : "✅"} {med.alert}
                  </p>
                </div>
              ))}
              <Button size="sm" className="w-full h-8 text-xs" onClick={() => toast.success("Quantities corrected in bill")}>
                <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Auto-Correct Quantities in Bill
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


// ─── TAB 4: PATIENT DOSAGE CARD ───
function DosageCardTab() {
  const card = {
    patient: "Rajesh Kumar", age: 45, id: "P-1001", doctor: "Dr. Arun", date: "22 Jul 2026", duration: "15 days",
    medicines: [
      { sl: 1, name: "Rasnasaptakam Kashayam", dose: "15ml", vehicle: "+ 45ml warm water", time: "6:00 AM & 6:00 PM", relation: "Before food (empty stomach)", bottles: "3 bottles for 15 days", note: "Shake well. Slightly warm the medicine." },
      { sl: 2, name: "Simhanada Guggulu", dose: "2 tablets", vehicle: "With warm water", time: "After breakfast & dinner", relation: "After food", bottles: "1 box (60 tabs)", note: "Do not crush. Swallow whole." },
      { sl: 3, name: "Dasamoolarishtam", dose: "25ml", vehicle: "+ 25ml warm water", time: "After lunch & dinner", relation: "After food", bottles: "2 bottles for 15 days", note: "Can be taken without dilution if preferred." },
      { sl: 4, name: "Kottamchukkadi Taila", dose: "Apply externally", vehicle: "Warm slightly before use", time: "Night before sleep", relation: "External use only", bottles: "1 bottle (for 15 days self-application)", note: "Apply on lower back. Massage 10 min. Wash after 1 hour or leave overnight." },
    ],
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Printable patient dosage card — exact measurements, timing, vehicle, quantity purchased</p>
      <Card className="border-2 border-dashed max-w-lg mx-auto">
        <CardContent className="p-4 space-y-3 text-xs">
          <div className="text-center border-b pb-2">
            <p className="font-bold text-sm">AYUZEE — Patient Medicine Guide</p>
            <p className="text-[10px] text-muted-foreground">Follow exactly as prescribed for best results</p>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[10px]">
            <p><strong>Patient:</strong> {card.patient} ({card.age}y)</p>
            <p><strong>Doctor:</strong> {card.doctor}</p>
            <p><strong>Date:</strong> {card.date}</p>
            <p><strong>Duration:</strong> {card.duration}</p>
          </div>
          <div className="border-t pt-2">
            <table className="w-full text-[10px]"><thead className="border-b"><tr><th className="py-1 text-left">#</th><th className="py-1 text-left">Medicine</th><th className="py-1 text-center">Dose</th><th className="py-1 text-left">How to Take</th><th className="py-1 text-center">When</th><th className="py-1 text-left">Qty</th></tr></thead><tbody>
              {card.medicines.map((m) => (
                <tr key={m.sl} className="border-b">
                  <td className="py-1.5">{m.sl}</td>
                  <td className="py-1.5 font-medium">{m.name}</td>
                  <td className="py-1.5 text-center font-bold">{m.dose}</td>
                  <td className="py-1.5">{m.vehicle}<br/><span className="text-muted-foreground">{m.relation}</span></td>
                  <td className="py-1.5 text-center">{m.time}</td>
                  <td className="py-1.5">{m.bottles}</td>
                </tr>
              ))}
            </tbody></table>
          </div>
          <div className="border-t pt-2 text-[9px] text-muted-foreground">
            <p><strong>General rules:</strong> Maintain 30 min gap between medicines. Avoid cold water, curd, and sour foods during treatment. Follow diet chart provided.</p>
            <p className="mt-1"><strong>Next visit:</strong> After 15 days. Bring empty bottles for refill count verification.</p>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-center gap-2">
        <Button size="sm" onClick={() => toast.success("Dosage card printed")}><Printer className="h-3.5 w-3.5 mr-1" /> Print Card</Button>
        <Button size="sm" variant="outline" onClick={() => toast.success("Sent to patient WhatsApp")}>Send via WhatsApp</Button>
      </div>
    </div>
  );
}


// ─── TAB 5: AI STOCK PREDICTOR ───
function AiStockPredictorTab() {
  const predictions = [
    { medicine: "Rasnasaptakam Kashayam 200ml", activePatients: 45, avgBottlesPerPatient: 3, monthlyConsumption: 135, currentStock: 320, daysOfStock: 35, reorderQty: 150, insight: "Highest consumption item. 45 active patients × 3 bottles/15 days = 135 bottles/month. Current stock sufficient for 35 days." },
    { medicine: "Dasamoolarishtam 450ml", activePatients: 38, avgBottlesPerPatient: 2, monthlyConsumption: 76, currentStock: 280, daysOfStock: 55, reorderQty: 0, insight: "Stock healthy. Arishtam — no wastage risk (unlimited shelf-life). Can hold higher buffer safely." },
    { medicine: "Ashwagandha Churna 100g", activePatients: 30, avgBottlesPerPatient: 3, monthlyConsumption: 90, currentStock: 450, daysOfStock: 75, reorderQty: 0, insight: "Overstocked slightly. But monsoon demand rising — hold current level." },
    { medicine: "Swarna Bhasma 2g", activePatients: 5, avgBottlesPerPatient: 4, monthlyConsumption: 20, currentStock: 15, daysOfStock: 22, reorderQty: 25, insight: "HIGH VALUE item (₹3,000/vial). Only 5 patients but each needs 4 vials/month. Low stock — reorder urgently. ₹75,000 monthly revenue from this single item." },
    { medicine: "Simhanada Guggulu 60t", activePatients: 52, avgBottlesPerPatient: 1, monthlyConsumption: 52, currentStock: 580, daysOfStock: 167, reorderQty: 0, insight: "Heavily overstocked (167 days!). Guggulu 1 box/15 days means half the consumption assumed. Reduce next PO." },
    { medicine: "Kottamchukkadi Taila 200ml", activePatients: 22, avgBottlesPerPatient: 5, monthlyConsumption: 110, currentStock: 210, daysOfStock: 28, reorderQty: 100, insight: "PK usage (200ml/session) drives consumption. 22 patients × 5 sessions/month = 110 bottles. Barely 4 weeks stock left." },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">AI predicts stock consumption based on active patients × dose × duration — smarter reordering</p>
      <div className="space-y-3">
        {predictions.map((p, i) => (
          <Card key={i} className={p.daysOfStock < 30 ? "border-amber-200" : p.daysOfStock > 120 ? "border-blue-200" : ""}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm">{p.medicine}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{p.activePatients} patients</span>
                    <span>{p.avgBottlesPerPatient} packs/patient</span>
                    <span>{p.monthlyConsumption}/month</span>
                    <span>Stock: {p.currentStock}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${p.daysOfStock < 30 ? "text-amber-600" : p.daysOfStock > 120 ? "text-blue-600" : "text-green-600"}`}>{p.daysOfStock} days</p>
                  {p.reorderQty > 0 && <Badge variant="destructive" className="text-[10px] mt-1">Reorder: {p.reorderQty}</Badge>}
                  {p.daysOfStock > 120 && <Badge variant="outline" className="text-[10px] text-blue-600 mt-1">Overstocked</Badge>}
                </div>
              </div>
              <p className="text-[10px] mt-2 p-2 rounded bg-purple-50 text-purple-700">{p.insight}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


// ─── TAB 6: BILL DOSAGE INSTRUCTIONS (Auto-print on every sale bill) ───
function BillInstructionsTab() {
  const sampleBill = {
    billNo: "SB-2026-8845", patient: "Rajesh Kumar", date: "22 Jul 2026", doctor: "Dr. Arun",
    items: [
      { sl: 1, medicine: "Rasnasaptakam Kashayam 200ml", qty: 3, mrp: 210, total: 630, instruction: "6AM & 6PM | 15ml + 45ml warm water | Before food (empty stomach)", shortCode: "BD-BF-15ml+WW", icon: "🍵" },
      { sl: 2, medicine: "Simhanada Guggulu 60t", qty: 1, mrp: 150, total: 150, instruction: "After Breakfast & Dinner | 2 tablets | With warm water", shortCode: "BD-AF-2tab+WW", icon: "💊" },
      { sl: 3, medicine: "Dasamoolarishtam 450ml", qty: 2, mrp: 185, total: 370, instruction: "After Lunch & Dinner | 25ml + 25ml warm water | After food", shortCode: "BD-AF-25ml+WW", icon: "🍶" },
      { sl: 4, medicine: "Ashwagandha Churna 100g", qty: 2, mrp: 160, total: 320, instruction: "Night (before sleep) | 5g (1 tsp) + warm milk + honey | After dinner", shortCode: "OD-AN-5g+Milk", icon: "🌿" },
      { sl: 5, medicine: "Kottamchukkadi Taila 200ml", qty: 1, mrp: 280, total: 280, instruction: "Night | Apply on lower back, massage 10 min | External use ONLY", shortCode: "EXT-Night-Apply", icon: "🫒" },
      { sl: 6, medicine: "Swarna Bhasma 2g", qty: 2, mrp: 3000, total: 6000, instruction: "6AM & 6PM | 125mg (pinch) + honey + ghee | Before food", shortCode: "BD-BF-125mg+H+G", icon: "⚗️" },
    ],
  };

  const shortCodeLegend = [
    { code: "BD", meaning: "Twice daily (Bis Die)" },
    { code: "OD", meaning: "Once daily" },
    { code: "TDS", meaning: "Three times daily" },
    { code: "BF", meaning: "Before food" },
    { code: "AF", meaning: "After food" },
    { code: "AN", meaning: "At night" },
    { code: "WW", meaning: "Warm water" },
    { code: "H", meaning: "Honey (Madhu)" },
    { code: "G", meaning: "Ghee (Ghrita)" },
    { code: "M", meaning: "Milk (Ksheera)" },
    { code: "EXT", meaning: "External use only" },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Auto-printed dosage instructions on every sale bill — patient knows exactly how to take each medicine</p>

      <Card className="border-2 border-dashed max-w-2xl mx-auto">
        <CardContent className="p-4 space-y-3">
          <div className="text-center border-b pb-2">
            <p className="font-bold">AYUZEE PHARMACY — SALE BILL</p>
            <p className="text-[10px] text-muted-foreground">Bill#: {sampleBill.billNo} | Date: {sampleBill.date} | Patient: {sampleBill.patient} | Dr: {sampleBill.doctor}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b bg-muted/30">
                <tr><th className="px-2 py-1 text-left">#</th><th className="px-2 py-1 text-left">Medicine</th><th className="px-2 py-1 text-center">Qty</th><th className="px-2 py-1 text-right">MRP</th><th className="px-2 py-1 text-right">Total</th></tr>
              </thead>
              <tbody>
                {sampleBill.items.map((item) => (
                  <tr key={item.sl} className="border-b">
                    <td className="px-2 py-1">{item.sl}</td>
                    <td className="px-2 py-1">
                      <p className="font-medium">{item.medicine}</p>
                      <p className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                        {item.icon} {item.instruction}
                      </p>
                    </td>
                    <td className="px-2 py-1 text-center">{item.qty}</td>
                    <td className="px-2 py-1 text-right">₹{item.mrp}</td>
                    <td className="px-2 py-1 text-right font-bold">₹{item.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t">
                <tr><td colSpan={4} className="px-2 py-1 text-right font-bold">Grand Total:</td><td className="px-2 py-1 text-right font-bold">₹{sampleBill.items.reduce((s, i) => s + i.total, 0).toLocaleString()}</td></tr>
              </tfoot>
            </table>
          </div>
          <div className="border-t pt-2 text-[9px] text-muted-foreground">
            <p><strong>General:</strong> Maintain 30 min gap between medicines. Take Kashayam first (empty stomach), then Vati/Guggulu after food. Avoid cold water, curd, sour food during treatment.</p>
            <p className="mt-0.5"><strong>Duration:</strong> 15 days. Next visit on 06 Aug 2026. Do not stop medicine without consulting doctor.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Short Code Legend (for pharmacist reference)</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {shortCodeLegend.map((l, i) => (
              <div key={i} className="text-xs p-1.5 rounded bg-muted/30">
                <span className="font-mono font-bold text-blue-600">{l.code}</span> = {l.meaning}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-200 bg-green-50/30">
        <CardContent className="p-3 text-xs text-green-700 space-y-1">
          <p><strong>How it works:</strong></p>
          <p>1. Doctor writes Rx with dose + frequency + vehicle in HMS</p>
          <p>2. When pharmacist creates sale bill, instructions AUTO-ATTACH to each line item</p>
          <p>3. Bill prints with instruction below each medicine (blue highlighted line)</p>
          <p>4. Same instructions sent via WhatsApp to patient (with regional language option)</p>
          <p>5. AI detects if instruction is missing for any item → alerts pharmacist before printing</p>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3">
          <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-purple-800">AI Instruction Intelligence</p>
            <p className="text-sm text-purple-700">
              Auto-generates instructions based on dosage form + doctor's Rx. If doctor writes "Rasnasaptakam BD BF" →
              AI expands to: "6AM &amp; 6PM | 15ml + 45ml warm water | Before food (empty stomach)".
              Detects conflicts: If patient has 2 medicines both marked "before food 6AM" → AI suggests staggering by 15 min.
              Multi-language: Same bill instructions available in Tamil, Hindi, Malayalam, Kannada (patient's preferred language from registration).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── MAIN COMPONENT ───
export default function DoseCalculator() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calculator className="h-6 w-6 text-blue-600" /> Dose Calculator &amp; Quantity Advisor
        </h1>
        <p className="text-muted-foreground mt-1">
          Auto-calculate exact quantity needed for prescribed duration — alert pharmacist, guide patient, predict stock
        </p>
      </div>

      <Card className="border-red-200 bg-red-50/30">
        <CardContent className="p-3 text-xs text-red-700">
          <AlertTriangle className="h-3.5 w-3.5 inline mr-1" />
          <strong>The #1 reason patients drop AYUSH treatment:</strong> Medicine runs out before next visit because pharmacy dispensed
          insufficient quantity. A 200ml Kashayam bottle at 15ml BD lasts only 6.7 days — but patient was prescribed 15 days!
          This module ensures correct quantity is always dispensed.
        </CardContent>
      </Card>

      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="calculator" className="text-xs">Dose Calculator</TabsTrigger>
          <TabsTrigger value="advisor" className="text-xs">Quantity Advisor</TabsTrigger>
          <TabsTrigger value="bill-alert" className="text-xs">Bill Alert</TabsTrigger>
          <TabsTrigger value="bill-instructions" className="text-xs">Bill Instructions</TabsTrigger>
          <TabsTrigger value="dosage-card" className="text-xs">Dosage Card</TabsTrigger>
          <TabsTrigger value="ai-stock" className="text-xs">AI Stock Predictor</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator"><DoseCalcTab /></TabsContent>
        <TabsContent value="advisor"><QuantityAdvisorTab /></TabsContent>
        <TabsContent value="bill-alert"><BillAlertTab /></TabsContent>
        <TabsContent value="bill-instructions"><BillInstructionsTab /></TabsContent>
        <TabsContent value="dosage-card"><DosageCardTab /></TabsContent>
        <TabsContent value="ai-stock"><AiStockPredictorTab /></TabsContent>
      </Tabs>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3">
          <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-purple-800">AI Dose &amp; Distribution Intelligence</p>
            <p className="text-sm text-purple-700">
              <strong>Impact:</strong> Since implementing dose-based quantity alerts, patient treatment completion rate improved
              from 45% to 82% (patients no longer run out mid-treatment).
              <br/><strong>Simhanada Guggulu overstocked</strong> (167 days) — because dose is only 2 tabs BD (1 box/15 days, not 2 as assumed in old PO logic). AI corrected reorder formula.
              <br/><strong>Swarna Bhasma</strong> — highest revenue-per-vial item. 5 patients generating ₹75K/month. Ensure zero stock-out.
              <br/><strong>Suggestion:</strong> Print dosage card for every patient (reduces pharmacy queries by 60% — patients call asking "how much to take").
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
