import { useState, useEffect, useMemo } from "react";
import {
  Award,
  Calculator,
  Coins,
  IndianRupee,
  Plus,
  PiggyBank,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useBeyondGamification } from "@/hooks/useBeyondGamification";

const INCOME_CATEGORIES = [
  { value: "clinic_opd", label: "Clinic / OPD" },
  { value: "surgery", label: "Surgery / Procedures" },
  { value: "locum", label: "Locum / Visiting" },
  { value: "online_consult", label: "Online Consults" },
  { value: "teaching", label: "Teaching / CME" },
  { value: "royalty", label: "Royalty / Writing" },
  { value: "other_income", label: "Other Income" },
];

const EXPENSE_CATEGORIES = [
  { value: "rent", label: "Clinic Rent" },
  { value: "staff_salary", label: "Staff Salary" },
  { value: "equipment", label: "Equipment" },
  { value: "medicines", label: "Medicines / Supplies" },
  { value: "insurance", label: "Insurance" },
  { value: "tax", label: "Tax" },
  { value: "emi", label: "EMI / Loan" },
  { value: "utilities", label: "Utilities" },
  { value: "personal", label: "Personal" },
  { value: "other_expense", label: "Other" },
];

interface FinanceEntry {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  description: string | null;
  date: string;
}

// ════════════════════════════════════════════════════════════
// INCOME / EXPENSE TRACKER
// ════════════════════════════════════════════════════════════

function IncomeExpenseTracker() {
  const { addXP, recordStreak, grantBadge } = useBeyondGamification();
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<"income" | "expense">("income");
  const [category, setCategory] = useState("clinic_opd");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadEntries(); }, []);

  const loadEntries = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { setLoading(false); return; }
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const { data } = await (supabase as any)
      .from("beyond_finance_entries")
      .select("id, type, category, amount, description, date")
      .eq("user_id", session.session.user.id)
      .gte("date", startOfMonth.toISOString().split("T")[0])
      .order("date", { ascending: false });
    setEntries(data || []);
    setLoading(false);
  };

  const addEntry = async () => {
    if (!amount || Number(amount) <= 0) { toast.error("Enter a valid amount"); return; }
    setSaving(true);
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { setSaving(false); return; }

    await (supabase as any).from("beyond_finance_entries").insert({
      user_id: session.session.user.id,
      type, category,
      amount: Number(amount),
      description: description || null,
    });

    // Gamification on first entry
    if (entries.length === 0) {
      await addXP(15, "finance_logged", "First finance entry this month");
      await recordStreak("finance");
      await grantBadge("Penny Wise");
    }

    setAmount("");
    setDescription("");
    toast.success(`${type === "income" ? "Income" : "Expense"} logged: ₹${Number(amount).toLocaleString("en-IN")}`);
    loadEntries();
    setSaving(false);
  };

  const totalIncome = entries.filter((e) => e.type === "income").reduce((s, e) => s + Number(e.amount), 0);
  const totalExpense = entries.filter((e) => e.type === "expense").reduce((s, e) => s + Number(e.amount), 0);
  const savings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Monthly Summary */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <Card><CardContent className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Income</p>
          <p className="text-lg font-bold text-green-600">₹{totalIncome.toLocaleString("en-IN")}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Expense</p>
          <p className="text-lg font-bold text-red-600">₹{totalExpense.toLocaleString("en-IN")}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Savings</p>
          <p className={`text-lg font-bold ${savings >= 0 ? "text-emerald-600" : "text-red-600"}`}>₹{savings.toLocaleString("en-IN")}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Savings Rate</p>
          <p className={`text-lg font-bold ${savingsRate >= 20 ? "text-emerald-600" : "text-amber-600"}`}>{savingsRate}%</p>
        </CardContent></Card>
      </div>

      {/* Add Entry Form */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Add Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 items-end">
            <Select value={type} onValueChange={(v: "income" | "expense") => { setType(v); setCategory(v === "income" ? "clinic_opd" : "rent"); }}>
              <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1 min-w-[120px]">
              <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="pl-8" />
            </div>
            <Input placeholder="Note (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className="flex-1 min-w-[120px]" />
            <Button onClick={addEntry} disabled={saving} size="sm" className="gap-1"><Plus className="h-3 w-3" /> Add</Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Entries */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">This Month ({entries.length} entries)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-xs text-muted-foreground">Loading...</p> : entries.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No entries yet this month. Start tracking!</p>
          ) : (
            <div className="space-y-1 max-h-[300px] overflow-y-auto">
              {entries.slice(0, 20).map((entry) => (
                <div key={entry.id} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                  <span className={`h-2 w-2 rounded-full ${entry.type === "income" ? "bg-green-500" : "bg-red-500"}`} />
                  <span className="flex-1 truncate">{entry.description || entry.category.replace("_", " ")}</span>
                  <span className={`font-medium ${entry.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {entry.type === "income" ? "+" : "-"}₹{Number(entry.amount).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// SIP CALCULATOR
// ════════════════════════════════════════════════════════════

function SIPCalculator() {
  const [monthly, setMonthly] = useState("10000");
  const [years, setYears] = useState("10");
  const [rate, setRate] = useState("12");

  const result = useMemo(() => {
    const P = Number(monthly) || 0;
    const n = (Number(years) || 0) * 12;
    const r = (Number(rate) || 0) / 100 / 12;
    if (P <= 0 || n <= 0 || r <= 0) return { invested: 0, returns: 0, total: 0 };
    const total = P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    const invested = P * n;
    return { invested, returns: Math.round(total - invested), total: Math.round(total) };
  }, [monthly, years, rate]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4 text-green-500" /> SIP Returns Calculator
        </CardTitle>
        <CardDescription className="text-xs">See how small monthly investments grow over time.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="text-xs text-muted-foreground">Monthly SIP (₹)</label>
            <Input type="number" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Years</label>
            <Input type="number" value={years} onChange={(e) => setYears(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Expected Return (%)</label>
            <Input type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
          </div>
        </div>
        <div className="grid gap-3 grid-cols-3 rounded-lg bg-muted/60 p-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Invested</p>
            <p className="text-sm font-bold">₹{result.invested.toLocaleString("en-IN")}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Returns</p>
            <p className="text-sm font-bold text-green-600">₹{result.returns.toLocaleString("en-IN")}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Total Value</p>
            <p className="text-sm font-bold text-emerald-600">₹{result.total.toLocaleString("en-IN")}</p>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground text-center">
          ₹{Number(monthly).toLocaleString("en-IN")}/month for {years} years at {rate}% = ₹{result.total.toLocaleString("en-IN")}
        </p>
      </CardContent>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════
// EMI CALCULATOR
// ════════════════════════════════════════════════════════════

function EMICalculator() {
  const [principal, setPrincipal] = useState("5000000");
  const [rate, setRate] = useState("8.5");
  const [tenure, setTenure] = useState("20");

  const result = useMemo(() => {
    const P = Number(principal) || 0;
    const r = (Number(rate) || 0) / 100 / 12;
    const n = (Number(tenure) || 0) * 12;
    if (P <= 0 || r <= 0 || n <= 0) return { emi: 0, totalInterest: 0, totalPayment: 0 };
    const emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    return { emi: Math.round(emi), totalInterest: Math.round(totalPayment - P), totalPayment: Math.round(totalPayment) };
  }, [principal, rate, tenure]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Calculator className="h-4 w-4 text-blue-500" /> EMI Calculator
        </CardTitle>
        <CardDescription className="text-xs">Clinic setup loan, home loan, or education loan EMI.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="text-xs text-muted-foreground">Loan Amount (₹)</label>
            <Input type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Interest Rate (%)</label>
            <Input type="number" value={rate} onChange={(e) => setRate(e.target.value)} step="0.1" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Tenure (Years)</label>
            <Input type="number" value={tenure} onChange={(e) => setTenure(e.target.value)} />
          </div>
        </div>
        <div className="grid gap-3 grid-cols-3 rounded-lg bg-muted/60 p-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Monthly EMI</p>
            <p className="text-sm font-bold">₹{result.emi.toLocaleString("en-IN")}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Total Interest</p>
            <p className="text-sm font-bold text-orange-600">₹{result.totalInterest.toLocaleString("en-IN")}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Total Payment</p>
            <p className="text-sm font-bold">₹{result.totalPayment.toLocaleString("en-IN")}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════
// TAX SAVER QUICK REFERENCE
// ════════════════════════════════════════════════════════════

function TaxSaverGuide() {
  const taxSections = [
    { section: "80C", limit: "₹1,50,000", items: "PPF, ELSS, LIC, EPF, NSC, Home Loan Principal, Children Tuition" },
    { section: "80D", limit: "₹25,000-₹1,00,000", items: "Health Insurance (self + family + parents). Extra ₹50K if parents are senior citizens" },
    { section: "80E", limit: "No limit", items: "Education Loan Interest (for self, spouse, or children)" },
    { section: "80U/80DD", limit: "₹75,000-₹1,25,000", items: "Disability deduction (self or dependent)" },
    { section: "Depreciation", limit: "Varies", items: "Medical equipment depreciation @ 15-40% (for clinic owners)" },
    { section: "44ADA", limit: "50% of gross", items: "Presumptive taxation for professionals (income ≤ ₹75L): declare 50% as profit, no books needed" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <PiggyBank className="h-4 w-4 text-emerald-500" /> Tax Saver Quick Reference
        </CardTitle>
        <CardDescription className="text-xs">Key deductions every doctor should use (Old Regime).</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {taxSections.map((s) => (
            <div key={s.section} className="rounded-lg border p-3">
              <div className="flex items-center justify-between mb-1">
                <Badge variant="outline" className="text-xs font-mono">{s.section}</Badge>
                <span className="text-xs font-medium text-green-600">{s.limit}</span>
              </div>
              <p className="text-xs text-muted-foreground">{s.items}</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-3 text-center">
          This is general guidance. Consult a CA for your specific situation.
        </p>
      </CardContent>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN FINANCE TOOLKIT PAGE
// ════════════════════════════════════════════════════════════

const FinanceToolkit = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl flex items-center gap-2">
            <Coins className="h-7 w-7 text-emerald-500" />
            Finance Toolkit
          </h1>
          <p className="text-muted-foreground">Master your money — what they never taught in med school</p>
        </div>
        <Badge variant="outline" className="w-fit gap-1">
          <Award className="h-3 w-3" /> +15 XP on first log
        </Badge>
      </div>

      <Tabs defaultValue="tracker" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tracker" className="gap-1">
            <Wallet className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Tracker</span>
          </TabsTrigger>
          <TabsTrigger value="sip" className="gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">SIP</span>
          </TabsTrigger>
          <TabsTrigger value="emi" className="gap-1">
            <Calculator className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">EMI</span>
          </TabsTrigger>
          <TabsTrigger value="tax" className="gap-1">
            <PiggyBank className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Tax</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tracker">
          <IncomeExpenseTracker />
        </TabsContent>

        <TabsContent value="sip">
          <SIPCalculator />
        </TabsContent>

        <TabsContent value="emi">
          <EMICalculator />
        </TabsContent>

        <TabsContent value="tax">
          <TaxSaverGuide />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceToolkit;
