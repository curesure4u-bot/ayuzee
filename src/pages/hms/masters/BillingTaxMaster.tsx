import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Pencil, X, IndianRupee } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type PaymentType = {
  id: string;
  name: string;
  isPaymentInfoRequired: boolean;
  isPosPaymentRequired: boolean;
  status: "active" | "inactive";
};

type DiscountRemark = {
  id: string;
  remark: string;
};

type ExpenseItem = {
  id: string;
  expenseType: string;
  accountHead: string;
  expenseTarget: "pl" | "balancesheet";
  status: "active" | "inactive";
};

// ─── Mock Data ───────────────────────────────────────────────────────────────
const mockPaymentTypes: PaymentType[] = [
  { id: "1", name: "GooglePay", isPaymentInfoRequired: false, isPosPaymentRequired: false, status: "active" },
  { id: "2", name: "Net_banking", isPaymentInfoRequired: false, isPosPaymentRequired: false, status: "active" },
  { id: "3", name: "phonepe", isPaymentInfoRequired: false, isPosPaymentRequired: false, status: "active" },
  { id: "4", name: "UPI", isPaymentInfoRequired: false, isPosPaymentRequired: false, status: "active" },
  { id: "5", name: "Credit Card", isPaymentInfoRequired: true, isPosPaymentRequired: true, status: "active" },
  { id: "6", name: "Debit Card", isPaymentInfoRequired: true, isPosPaymentRequired: true, status: "active" },
];

const mockDiscountRemarks: DiscountRemark[] = [
  { id: "1", remark: "Camp Patient" },
  { id: "2", remark: "Staff" },
];

const mockExpenses: ExpenseItem[] = [
  { id: "1", expenseType: "ADVERTISEMENT", accountHead: "pl", expenseTarget: "pl", status: "active" },
  { id: "2", expenseType: "agreement renewal", accountHead: "pl", expenseTarget: "pl", status: "inactive" },
  { id: "3", expenseType: "AMC (LIFT)", accountHead: "pl", expenseTarget: "pl", status: "inactive" },
  { id: "4", expenseType: "ASSET PURCHASE", accountHead: "balancesheet.", expenseTarget: "balancesheet", status: "active" },
  { id: "5", expenseType: "AUDITOR - MAZ GLOBAL.", accountHead: "pl", expenseTarget: "pl", status: "inactive" },
  { id: "6", expenseType: "bank deposit", accountHead: "balancesheet.", expenseTarget: "balancesheet", status: "active" },
  { id: "7", expenseType: "BUILDING ADVANCE", accountHead: "pl", expenseTarget: "pl", status: "active" },
  { id: "8", expenseType: "building advance", accountHead: "pl", expenseTarget: "pl", status: "inactive" },
  { id: "9", expenseType: "camp expenses", accountHead: "pl", expenseTarget: "pl", status: "active" },
  { id: "10", expenseType: "cleaning material", accountHead: "pl", expenseTarget: "pl", status: "active" },
  { id: "11", expenseType: "courier and freight charges", accountHead: "pl", expenseTarget: "pl", status: "active" },
  { id: "12", expenseType: "DONATION", accountHead: "pl", expenseTarget: "pl", status: "active" },
  { id: "13", expenseType: "EB BILL", accountHead: "pl", expenseTarget: "pl", status: "active" },
  { id: "14", expenseType: "Egg", accountHead: "pl", expenseTarget: "pl", status: "inactive" },
  { id: "15", expenseType: "ELECTRICAL ITEMS PURCHASE", accountHead: "pl", expenseTarget: "pl", status: "active" },
  { id: "16", expenseType: "ELECTRONIC ITEMS PURCHASE", accountHead: "pl", expenseTarget: "pl", status: "active" },
  { id: "17", expenseType: "EQUIPMENT PURCHASE", accountHead: "pl", expenseTarget: "pl", status: "active" },
  { id: "18", expenseType: "FOOD EXPENSE", accountHead: "pl", expenseTarget: "pl", status: "inactive" },
  { id: "19", expenseType: "gift", accountHead: "pl", expenseTarget: "pl", status: "inactive" },
  { id: "20", expenseType: "house keeping", accountHead: "pl", expenseTarget: "pl", status: "inactive" },
  { id: "21", expenseType: "insurance", accountHead: "pl", expenseTarget: "pl", status: "active" },
  { id: "22", expenseType: "INTERNET AND PHONE RECHARGE", accountHead: "pl", expenseTarget: "pl", status: "active" },
  { id: "23", expenseType: "ip food expenses", accountHead: "pl", expenseTarget: "pl", status: "active" },
  { id: "24", expenseType: "kitchen expenses", accountHead: "pl", expenseTarget: "pl", status: "active" },
  { id: "25", expenseType: "license renewal", accountHead: "pl", expenseTarget: "pl", status: "active" },
  { id: "26", expenseType: "loan payment", accountHead: "pl", expenseTarget: "pl", status: "active" },
  { id: "27", expenseType: "MARKETING EXPENSES", accountHead: "pl", expenseTarget: "pl", status: "active" },
  { id: "28", expenseType: "Newspaper", accountHead: "pl", expenseTarget: "pl", status: "inactive" },
  { id: "29", expenseType: "other branch transfer", accountHead: "pl", expenseTarget: "pl", status: "active" },
  { id: "30", expenseType: "petrol", accountHead: "pl", expenseTarget: "pl", status: "active" },
  { id: "31", expenseType: "Petty cash Clearing Balance", accountHead: "pl", expenseTarget: "pl", status: "active" },
  { id: "32", expenseType: "petty cash received", accountHead: "pl", expenseTarget: "pl", status: "active" },
  { id: "33", expenseType: "PF AND ESI", accountHead: "pl", expenseTarget: "pl", status: "active" },
  { id: "34", expenseType: "PROFESSIONAL CHARGES", accountHead: "pl", expenseTarget: "pl", status: "active" },
  { id: "35", expenseType: "raw container purchase", accountHead: "pl", expenseTarget: "pl", status: "inactive" },
  { id: "36", expenseType: "software renewal", accountHead: "pl", expenseTarget: "pl", status: "active" },
  { id: "37", expenseType: "staffs salary", accountHead: "pl", expenseTarget: "pl", status: "active" },
  { id: "38", expenseType: "tea and snacks", accountHead: "pl", expenseTarget: "pl", status: "inactive" },
  { id: "39", expenseType: "TRAVEL EXPENSES", accountHead: "pl", expenseTarget: "pl", status: "active" },
  { id: "40", expenseType: "TREATMENT EXPENSES", accountHead: "pl", expenseTarget: "pl", status: "active" },
];

// ─── Component ───────────────────────────────────────────────────────────────
const BillingTaxMaster = () => {
  // Master setting section: "payment-type", "discount-remarks", "expense"
  const [section, setSection] = useState<"payment-type" | "discount-remarks" | "expense">("payment-type");

  // Payment Type form
  const [ptName, setPtName] = useState("");
  const [ptInfoRequired, setPtInfoRequired] = useState(false);
  const [ptPosRequired, setPtPosRequired] = useState(false);
  const [ptSearch, setPtSearch] = useState("");
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>(mockPaymentTypes);

  // Discount Remarks form
  const [drRemark, setDrRemark] = useState("");
  const [drSearch, setDrSearch] = useState("");
  const [discountRemarks, setDiscountRemarks] = useState<DiscountRemark[]>(mockDiscountRemarks);

  // Expense form
  const [expType, setExpType] = useState("");
  const [expAccountHead, setExpAccountHead] = useState("");
  const [expTarget, setExpTarget] = useState<"pl" | "balancesheet">("pl");
  const [expSearch, setExpSearch] = useState("");
  const [expenses, setExpenses] = useState<ExpenseItem[]>(mockExpenses);

  // ─── Payment Type Handlers ─────────────────────────────────────────────────
  const handleCreatePaymentType = () => {
    if (!ptName.trim()) return toast.error("Payment Type Name is required");
    const newPt: PaymentType = {
      id: Date.now().toString(),
      name: ptName.trim(),
      isPaymentInfoRequired: ptInfoRequired,
      isPosPaymentRequired: ptPosRequired,
      status: "active",
    };
    setPaymentTypes([...paymentTypes, newPt]);
    toast.success(`Payment Type "${ptName}" created successfully!`);
    setPtName(""); setPtInfoRequired(false); setPtPosRequired(false);
  };

  // ─── Discount Remarks Handlers ────────────────────────────────────────────
  const handleCreateDiscountRemark = () => {
    if (!drRemark.trim()) return toast.error("Discount Remark is required");
    const newDr: DiscountRemark = { id: Date.now().toString(), remark: drRemark.trim() };
    setDiscountRemarks([...discountRemarks, newDr]);
    toast.success(`Discount Remark "${drRemark}" created!`);
    setDrRemark("");
  };

  const handleDeleteDiscountRemark = (id: string) => {
    setDiscountRemarks(discountRemarks.filter(d => d.id !== id));
    toast.success("Discount Remark deleted");
  };

  // ─── Expense Handlers ──────────────────────────────────────────────────────
  const handleCreateExpense = () => {
    if (!expType.trim()) return toast.error("Expense Type is required");
    const newExp: ExpenseItem = {
      id: Date.now().toString(),
      expenseType: expType.trim(),
      accountHead: expAccountHead || "pl",
      expenseTarget: expTarget,
      status: "active",
    };
    setExpenses([...expenses, newExp]);
    toast.success(`Expense "${expType}" created!`);
    setExpType(""); setExpAccountHead(""); setExpTarget("pl");
  };

  const filteredPaymentTypes = paymentTypes.filter(p =>
    p.name.toLowerCase().includes(ptSearch.toLowerCase())
  );
  const filteredDiscountRemarks = discountRemarks.filter(d =>
    d.remark.toLowerCase().includes(drSearch.toLowerCase())
  );
  const filteredExpenses = expenses.filter(e =>
    e.expenseType.toLowerCase().includes(expSearch.toLowerCase())
  );

  // ─── Render Payment Type Section ───────────────────────────────────────────
  const renderPaymentType = () => (
    <Card>
      <CardHeader className="pb-2 border-b bg-primary/5">
        <CardTitle className="text-base text-center text-primary">Manage Payment Type</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Create Form */}
        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <Label className="font-semibold">Payment Type Name :</Label>
            <Input
              value={ptName}
              onChange={e => setPtName(e.target.value)}
              className="w-56 mt-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="font-semibold text-sm">Is Payment Info Required :</Label>
            <Checkbox
              checked={ptInfoRequired}
              onCheckedChange={c => setPtInfoRequired(!!c)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="font-semibold text-sm">Is POS Payment Required :</Label>
            <Checkbox
              checked={ptPosRequired}
              onCheckedChange={c => setPtPosRequired(!!c)}
            />
          </div>
          <Button onClick={handleCreatePaymentType} className="bg-teal-600 hover:bg-teal-700 text-white">
            Create
          </Button>
        </div>

        {/* Table */}
        <div className="flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-2 text-sm">
            Show <select className="border rounded px-2 py-1 text-xs"><option>100</option><option>50</option><option>25</option></select> entries
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs">Search:</span>
            <Input className="h-7 text-xs w-40" value={ptSearch} onChange={e => setPtSearch(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-orange-600">Payment Type</th>
                <th className="px-4 py-2 text-left font-semibold text-orange-600">Is Payment Info Required</th>
                <th className="px-4 py-2 text-left font-semibold text-orange-600">Is POS Payment Required</th>
                <th className="px-4 py-2 text-left font-semibold text-orange-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPaymentTypes.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-4 text-center text-muted-foreground">No data available</td></tr>
              ) : (
                filteredPaymentTypes.map(pt => (
                  <tr key={pt.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-2">{pt.name}</td>
                    <td className="px-4 py-2">
                      {pt.isPaymentInfoRequired ? "true" : "false"}
                      <Pencil className="h-3 w-3 inline text-orange-500 ml-1 cursor-pointer" />
                    </td>
                    <td className="px-4 py-2">
                      {pt.isPosPaymentRequired ? "yes" : "no"}
                      <Pencil className="h-3 w-3 inline text-orange-500 ml-1 cursor-pointer" />
                    </td>
                    <td className="px-4 py-2">
                      <span className={pt.status === "active" ? "text-emerald-600" : "text-orange-600"}>
                        {pt.status}
                      </span>
                      <Pencil className="h-3 w-3 inline text-orange-500 ml-1 cursor-pointer" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="text-xs text-muted-foreground">
          Showing 1 to {filteredPaymentTypes.length} of {filteredPaymentTypes.length} entries
        </div>
      </CardContent>
    </Card>
  );

  // ─── Render Discount Remarks Section ───────────────────────────────────────
  const renderDiscountRemarks = () => (
    <Card>
      <CardHeader className="pb-2 border-b bg-primary/5">
        <CardTitle className="text-base text-center text-primary">Manage Discount Remark</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Create Form */}
        <div className="flex items-end gap-4">
          <div className="flex-1 max-w-md">
            <Label className="font-semibold">Discount Remark :</Label>
            <Input
              value={drRemark}
              onChange={e => setDrRemark(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button onClick={handleCreateDiscountRemark} className="bg-teal-600 hover:bg-teal-700 text-white">
            Create
          </Button>
        </div>

        {/* Table */}
        <div className="flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-2 text-sm">
            Show <select className="border rounded px-2 py-1 text-xs"><option>100</option><option>50</option><option>25</option></select> entries
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs">Search:</span>
            <Input className="h-7 text-xs w-40" value={drSearch} onChange={e => setDrSearch(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-orange-600 flex-1">Discount Remarks</th>
                <th className="px-4 py-2 text-center font-semibold text-orange-600 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {filteredDiscountRemarks.length === 0 ? (
                <tr><td colSpan={2} className="px-4 py-4 text-center text-muted-foreground">No data available</td></tr>
              ) : (
                filteredDiscountRemarks.map(dr => (
                  <tr key={dr.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-2">{dr.remark}</td>
                    <td className="px-4 py-2 text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded"
                        onClick={() => handleDeleteDiscountRemark(dr.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing 1 to {filteredDiscountRemarks.length} of {filteredDiscountRemarks.length} entries</span>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" className="h-6 text-xs" disabled>Previous</Button>
            <Badge variant="outline" className="text-xs">1</Badge>
            <Button size="sm" variant="outline" className="h-6 text-xs" disabled>Next</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // ─── Render Expense Section ────────────────────────────────────────────────
  const renderExpense = () => (
    <Card>
      <CardHeader className="pb-2 border-b bg-primary/5">
        <CardTitle className="text-base text-center text-primary">Manage Expense</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Create Form */}
        <div className="space-y-3 max-w-lg">
          <div>
            <Label className="font-semibold">Expense Type:</Label>
            <Input
              value={expType}
              onChange={e => setExpType(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="font-semibold">Account Head:</Label>
            <Input
              value={expAccountHead}
              onChange={e => setExpAccountHead(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="font-semibold">Expense Target:</Label>
            <div className="flex items-center gap-4 mt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="expTarget"
                  value="pl"
                  checked={expTarget === "pl"}
                  onChange={() => setExpTarget("pl")}
                  className="accent-orange-500"
                />
                <span className="text-sm">P&L</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="expTarget"
                  value="balancesheet"
                  checked={expTarget === "balancesheet"}
                  onChange={() => setExpTarget("balancesheet")}
                  className="accent-orange-500"
                />
                <span className="text-sm">Balance Sheet</span>
              </label>
            </div>
          </div>
          <Button onClick={handleCreateExpense} className="bg-orange-500 hover:bg-orange-600 text-white">
            Create
          </Button>
        </div>

        {/* Table */}
        <div className="flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-2 text-sm">
            Show <select className="border rounded px-2 py-1 text-xs"><option>100</option><option>50</option><option>25</option></select> entries
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs">Search:</span>
            <Input className="h-7 text-xs w-40" value={expSearch} onChange={e => setExpSearch(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-orange-600">Expense Type</th>
                <th className="px-4 py-2 text-left font-semibold text-orange-600">Account Head</th>
                <th className="px-4 py-2 text-left font-semibold text-orange-600">Expense Target</th>
                <th className="px-4 py-2 text-left font-semibold text-orange-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-4 text-center text-muted-foreground">No data available</td></tr>
              ) : (
                filteredExpenses.map(exp => (
                  <tr key={exp.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-2">{exp.expenseType}</td>
                    <td className="px-4 py-2 text-xs">{exp.accountHead}</td>
                    <td className="px-4 py-2 text-xs">{exp.expenseTarget === "pl" ? "pl" : "balancesheet."}</td>
                    <td className="px-4 py-2">
                      <span className={exp.status === "active" ? "text-emerald-600" : "text-orange-600"}>
                        {exp.status}
                      </span>
                      <Pencil className="h-3 w-3 inline text-orange-500 ml-1 cursor-pointer" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing 1 to {filteredExpenses.length} of {filteredExpenses.length} entries</span>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" className="h-6 text-xs" disabled>Previous</Button>
            <Badge variant="outline" className="text-xs">1</Badge>
            <Button size="sm" variant="outline" className="h-6 text-xs" disabled>Next</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // ─── Main Render ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <IndianRupee className="h-6 w-6 text-green-600" /> Billing Master
          </h1>
          <p className="text-sm text-muted-foreground">
            Create new payment types, discount remarks, discount categories, and expense categories.
          </p>
        </div>
        <Badge variant="secondary">
          Payments: {paymentTypes.length} | Expenses: {expenses.length}
        </Badge>
      </div>

      {/* Master Setting Layout: Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
        {/* Sidebar */}
        <div className="space-y-1">
          <Card className="p-0">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm font-semibold">Billing Master</CardTitle>
            </CardHeader>
            <CardContent className="p-1 space-y-0.5">
              <Button
                variant={section === "payment-type" ? "default" : "ghost"}
                size="sm"
                className={`w-full justify-start text-xs h-8 ${section === "payment-type" ? "bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200" : ""}`}
                onClick={() => setSection("payment-type")}
              >
                <span className="mr-2">💳</span> Payment Type
              </Button>
              <Button
                variant={section === "discount-remarks" ? "default" : "ghost"}
                size="sm"
                className={`w-full justify-start text-xs h-8 ${section === "discount-remarks" ? "bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200" : ""}`}
                onClick={() => setSection("discount-remarks")}
              >
                <span className="mr-2">✏️</span> Discount Remarks
              </Button>
              <Button
                variant={section === "expense" ? "default" : "ghost"}
                size="sm"
                className={`w-full justify-start text-xs h-8 ${section === "expense" ? "bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200" : ""}`}
                onClick={() => setSection("expense")}
              >
                <span className="mr-2">💰</span> Expense
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div>
          {section === "payment-type" && renderPaymentType()}
          {section === "discount-remarks" && renderDiscountRemarks()}
          {section === "expense" && renderExpense()}
        </div>
      </div>
    </div>
  );
};

export default BillingTaxMaster;
