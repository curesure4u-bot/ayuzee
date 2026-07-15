import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { IndianRupee, Plus, Edit, Trash2, CreditCard, Receipt, Percent } from "lucide-react";

const BillingTaxMaster = () => {
  const [addTaxOpen, setAddTaxOpen] = useState(false);
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <IndianRupee className="h-6 w-6 text-green-600" /> Billing & Tax Master
          </h1>
          <p className="text-sm text-muted-foreground">Payment modes, discount rules, tax slabs, invoice numbering & expense categories</p>
        </div>
      </div>

      <Tabs defaultValue="tax">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
          <TabsTrigger value="tax">Tax Rates (GST)</TabsTrigger>
          <TabsTrigger value="payment">Payment Modes</TabsTrigger>
          <TabsTrigger value="discount">Discount Rules</TabsTrigger>
          <TabsTrigger value="invoice">Invoice Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="tax" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><Percent className="h-4 w-4" /> GST Tax Slabs</CardTitle>
                <Button size="sm" onClick={() => setAddTaxOpen(true)}><Plus className="mr-1 h-3 w-3" /> Add Tax</Button>
              </div>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left font-medium">#</th><th className="px-3 py-2 text-left font-medium">Tax Name</th><th className="px-3 py-2 text-left font-medium">CGST</th><th className="px-3 py-2 text-left font-medium">SGST</th><th className="px-3 py-2 text-left font-medium">Total</th><th className="px-3 py-2 text-left font-medium">Applicable To</th><th className="px-3 py-2 text-left font-medium">Status</th><th className="px-3 py-2 text-left font-medium">Actions</th></tr></thead>
                <tbody>
                  {[
                    { name: "GST Exempt", cgst: 0, sgst: 0, applicable: "Consultation, Govt. scheme patients", active: true },
                    { name: "GST 5%", cgst: 2.5, sgst: 2.5, applicable: "Ayurveda medicines (classical)", active: true },
                    { name: "GST 12%", cgst: 6, sgst: 6, applicable: "Proprietary medicines, Lab consumables", active: true },
                    { name: "GST 18%", cgst: 9, sgst: 9, applicable: "Therapy services, Panchakarma, Room rent", active: true },
                    { name: "GST 28%", cgst: 14, sgst: 14, applicable: "Luxury items (if any)", active: false },
                  ].map((t, i) => (
                    <tr key={i} className="border-b"><td className="px-3 py-2">{i + 1}</td><td className="px-3 py-2 font-medium">{t.name}</td><td className="px-3 py-2">{t.cgst}%</td><td className="px-3 py-2">{t.sgst}%</td><td className="px-3 py-2 font-bold">{t.cgst + t.sgst}%</td><td className="px-3 py-2 text-xs text-muted-foreground">{t.applicable}</td><td className="px-3 py-2"><Badge variant={t.active ? "outline" : "secondary"} className={`text-[10px] ${t.active ? "text-green-600" : ""}`}>{t.active ? "Active" : "Inactive"}</Badge></td><td className="px-3 py-2"><Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Edit className="h-3 w-3" /></Button></td></tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><CreditCard className="h-4 w-4" /> Payment Modes</CardTitle>
                <Button size="sm" onClick={() => setAddPaymentOpen(true)}><Plus className="mr-1 h-3 w-3" /> Add Mode</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { name: "Cash", code: "CASH", enabled: true, default: true },
                  { name: "UPI (PhonePe/GPay)", code: "UPI", enabled: true, default: false },
                  { name: "Credit/Debit Card", code: "CARD", enabled: true, default: false },
                  { name: "Net Banking", code: "NEFT", enabled: true, default: false },
                  { name: "Insurance/TPA", code: "INS", enabled: true, default: false },
                  { name: "Credit (Due)", code: "CREDIT", enabled: true, default: false },
                  { name: "Corporate Billing", code: "CORP", enabled: true, default: false },
                  { name: "Cheque", code: "CHQ", enabled: false, default: false },
                  { name: "Ayushman Bharat (PMJAY)", code: "PMJAY", enabled: true, default: false },
                  { name: "CGHS/ECHS", code: "CGHS", enabled: true, default: false },
                ].map((pm) => (
                  <div key={pm.code} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">{pm.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{pm.code}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {pm.default && <Badge className="text-[9px]">Default</Badge>}
                      <Switch defaultChecked={pm.enabled} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discount" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Discount Categories & Rules</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left font-medium">Category</th><th className="px-3 py-2 text-left font-medium">Max %</th><th className="px-3 py-2 text-left font-medium">Max ₹</th><th className="px-3 py-2 text-left font-medium">Needs Approval</th><th className="px-3 py-2 text-left font-medium">Applicable</th><th className="px-3 py-2 text-left font-medium">Status</th></tr></thead>
                <tbody>
                  {[
                    { cat: "Staff Discount", maxPct: 20, maxAmt: 5000, approval: false, applicable: "Hospital staff & family" },
                    { cat: "Senior Citizen", maxPct: 10, maxAmt: 2000, approval: false, applicable: "Age > 60 years" },
                    { cat: "Corporate Discount", maxPct: 15, maxAmt: 10000, approval: true, applicable: "Tied-up corporates" },
                    { cat: "Loyalty Discount", maxPct: 5, maxAmt: 1000, approval: false, applicable: "Repeat patients > 5 visits" },
                    { cat: "Package Discount", maxPct: 25, maxAmt: 20000, approval: true, applicable: "Long-term Panchakarma" },
                    { cat: "Charitable/Free", maxPct: 100, maxAmt: 0, approval: true, applicable: "ATMRI/Ayush Help cases" },
                  ].map((d, i) => (
                    <tr key={i} className="border-b"><td className="px-3 py-2 font-medium">{d.cat}</td><td className="px-3 py-2">{d.maxPct}%</td><td className="px-3 py-2">{d.maxAmt > 0 ? `₹${d.maxAmt.toLocaleString("en-IN")}` : "No limit"}</td><td className="px-3 py-2">{d.approval ? <Badge variant="secondary" className="text-[10px]">Yes</Badge> : "No"}</td><td className="px-3 py-2 text-xs text-muted-foreground">{d.applicable}</td><td className="px-3 py-2"><Badge variant="outline" className="text-[10px] text-green-600">Active</Badge></td></tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoice" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Receipt className="h-4 w-4" /> Invoice Numbering & Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { type: "OP Bill", prefix: "AYZ/OP/", current: "AYZ/OP/2026-27/1245", resetOn: "April 1 (FY start)" },
                  { type: "IP Bill", prefix: "AYZ/IP/", current: "AYZ/IP/2026-27/089", resetOn: "April 1 (FY start)" },
                  { type: "Pharmacy Sale", prefix: "AYZ/PH/", current: "AYZ/PH/2026-27/3456", resetOn: "April 1 (FY start)" },
                  { type: "Lab Receipt", prefix: "AYZ/LB/", current: "AYZ/LB/2026-27/678", resetOn: "April 1 (FY start)" },
                  { type: "Advance Receipt", prefix: "AYZ/ADV/", current: "AYZ/ADV/2026-27/234", resetOn: "April 1 (FY start)" },
                  { type: "Refund Voucher", prefix: "AYZ/REF/", current: "AYZ/REF/2026-27/012", resetOn: "April 1 (FY start)" },
                ].map((inv) => (
                  <div key={inv.type} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{inv.type}</p>
                      <Button size="sm" variant="ghost" className="h-6"><Edit className="h-3 w-3" /></Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Prefix: <span className="font-mono">{inv.prefix}</span></p>
                    <p className="text-xs text-muted-foreground">Current: <span className="font-mono font-medium">{inv.current}</span></p>
                    <p className="text-xs text-muted-foreground">Resets: {inv.resetOn}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 pt-3 border-t">
                <div className="flex items-center gap-2"><Switch defaultChecked /><Label>Auto-number bills</Label></div>
                <div className="flex items-center gap-2"><Switch defaultChecked /><Label>Include GST on invoice</Label></div>
                <div className="flex items-center gap-2"><Switch /><Label>E-Invoice (GST Portal)</Label></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={addTaxOpen} onOpenChange={setAddTaxOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Tax Rate</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Tax Name</Label><Input placeholder="e.g., GST 5%" /></div>
            <div className="grid grid-cols-2 gap-3"><div><Label>CGST %</Label><Input type="number" placeholder="2.5" /></div><div><Label>SGST %</Label><Input type="number" placeholder="2.5" /></div></div>
            <div><Label>Applicable To</Label><Input placeholder="Description of applicable items" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAddTaxOpen(false)}>Cancel</Button><Button onClick={() => { toast.success("Tax added"); setAddTaxOpen(false); }}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addPaymentOpen} onOpenChange={setAddPaymentOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Payment Mode</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3"><div><Label>Name</Label><Input placeholder="Payment mode name" /></div><div><Label>Code</Label><Input placeholder="Short code" /></div></div>
            <div className="flex items-center gap-2"><Switch defaultChecked /><Label>Enabled</Label></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAddPaymentOpen(false)}>Cancel</Button><Button onClick={() => { toast.success("Payment mode added"); setAddPaymentOpen(false); }}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillingTaxMaster;
