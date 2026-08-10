import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { toast } from "sonner";
import { Wallet, Plus, TrendingUp, TrendingDown, Target, Trash2 } from "lucide-react";

type Transaction = {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
};

type SavingsGoal = {
  id: string;
  name: string;
  target: number;
  saved: number;
};

const uid = () => crypto.randomUUID();
const COLORS = ["#0d9488", "#f59e0b", "#ef4444", "#8b5cf6", "#3b82f6", "#10b981", "#ec4899", "#6b7280"];

const INCOME_CATS = ["Consultation", "Panchakarma", "Medicine Sales", "Online Consult", "Salary", "Scholarship", "Freelance", "Other"];
const EXPENSE_CATS = ["Rent", "Staff Salary", "Medicines", "Equipment", "Utilities", "Food", "Transport", "Education", "Treatment", "Subscriptions", "Other"];

const sampleTransactions: Transaction[] = [
  { id: uid(), type: "income", amount: 15000, category: "Consultation", description: "15 consultations this week", date: "2025-05-12" },
  { id: uid(), type: "income", amount: 8500, category: "Panchakarma", description: "3 PK sessions completed", date: "2025-05-11" },
  { id: uid(), type: "expense", amount: 3200, category: "Medicines", description: "Monthly pharmacy restock", date: "2025-05-10" },
  { id: uid(), type: "expense", amount: 12000, category: "Rent", description: "Clinic rent - May", date: "2025-05-01" },
  { id: uid(), type: "expense", amount: 1500, category: "Utilities", description: "Electricity + Internet", date: "2025-05-05" },
  { id: uid(), type: "income", amount: 5000, category: "Medicine Sales", description: "OTC sales", date: "2025-05-08" },
  { id: uid(), type: "expense", amount: 800, category: "Transport", description: "Fuel for the week", date: "2025-05-09" },
];

const sampleGoals: SavingsGoal[] = [
  { id: uid(), name: "New Panchakarma Equipment", target: 50000, saved: 22000 },
  { id: uid(), name: "CME Conference Fund", target: 15000, saved: 8000 },
  { id: uid(), name: "Emergency Reserve", target: 100000, saved: 45000 },
];

const TaskTrackerFinance = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(sampleTransactions);
  const [goals, setGoals] = useState<SavingsGoal[]>(sampleGoals);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ type: "expense" as "income" | "expense", amount: "", category: "", description: "", date: new Date().toISOString().split("T")[0] });

  const totalIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const expenseByCategory = useMemo(() => {
    const cats: Record<string, number> = {};
    transactions.filter(t => t.type === "expense").forEach(t => { cats[t.category] = (cats[t.category] || 0) + t.amount; });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const incomeByCategory = useMemo(() => {
    const cats: Record<string, number> = {};
    transactions.filter(t => t.type === "income").forEach(t => { cats[t.category] = (cats[t.category] || 0) + t.amount; });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const addTransaction = () => {
    if (!form.amount || !form.category) { toast.error("Amount and category required"); return; }
    setTransactions(prev => [{ id: uid(), ...form, amount: Number(form.amount) }, ...prev]);
    setDialogOpen(false);
    setForm({ type: "expense", amount: "", category: "", description: "", date: new Date().toISOString().split("T")[0] });
    toast.success("Transaction added");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2"><Wallet className="h-6 w-6 text-emerald-600" /> Finance Tracker</h1>
          <p className="text-sm text-muted-foreground">Simple income/expense tracking and savings goals</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700"><Plus className="mr-1 h-4 w-4" /> Add Entry</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-green-200"><CardContent className="p-4 text-center">
          <TrendingUp className="h-5 w-5 mx-auto text-green-600 mb-1" />
          <p className="text-xl font-bold text-green-700">₹{totalIncome.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Total Income</p>
        </CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-4 text-center">
          <TrendingDown className="h-5 w-5 mx-auto text-red-600 mb-1" />
          <p className="text-xl font-bold text-red-700">₹{totalExpense.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Total Expenses</p>
        </CardContent></Card>
        <Card className={balance >= 0 ? "border-teal-200" : "border-red-200"}><CardContent className="p-4 text-center">
          <Wallet className="h-5 w-5 mx-auto text-teal-600 mb-1" />
          <p className={`text-xl font-bold ${balance >= 0 ? "text-teal-700" : "text-red-700"}`}>₹{balance.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Net Balance</p>
        </CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Charts */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs">Expense Breakdown</CardTitle></CardHeader>
          <CardContent className="h-40">
            <ResponsiveContainer><PieChart><Pie data={expenseByCategory} innerRadius={30} outerRadius={55} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
              {expenseByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie><Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} /></PieChart></ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs">Income Sources</CardTitle></CardHeader>
          <CardContent className="h-40">
            <ResponsiveContainer><PieChart><Pie data={incomeByCategory} innerRadius={30} outerRadius={55} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
              {incomeByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie><Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} /></PieChart></ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Savings Goals */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-amber-500" /> Savings Goals</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {goals.map(g => (
            <div key={g.id} className="space-y-1">
              <div className="flex justify-between text-xs"><span className="font-medium">{g.name}</span><span>₹{g.saved.toLocaleString()} / ₹{g.target.toLocaleString()}</span></div>
              <Progress value={(g.saved / g.target) * 100} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Recent Transactions</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[300px] overflow-y-auto">
            {transactions.map(t => (
              <div key={t.id} className="flex items-center gap-3 px-4 py-2 border-b last:border-0 text-xs hover:bg-muted/30">
                <div className={`h-8 w-8 rounded-full grid place-items-center ${t.type === "income" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                  {t.type === "income" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{t.description || t.category}</p>
                  <div className="flex gap-2"><Badge variant="outline" className="text-[9px]">{t.category}</Badge><span className="text-[9px] text-muted-foreground">{t.date}</span></div>
                </div>
                <p className={`font-bold ${t.type === "income" ? "text-green-600" : "text-red-600"}`}>
                  {t.type === "income" ? "+" : "-"}₹{t.amount.toLocaleString()}
                </p>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-red-400" onClick={() => { setTransactions(prev => prev.filter(x => x.id !== t.id)); }}><Trash2 className="h-3 w-3" /></Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-emerald-600">Add Transaction</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Type</Label><Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as any, category: "" }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="income">Income</SelectItem><SelectItem value="expense">Expense</SelectItem></SelectContent></Select></div>
              <div><Label>Amount (₹)</Label><Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" /></div>
            </div>
            <div><Label>Category</Label><Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent>{(form.type === "income" ? INCOME_CATS : EXPENSE_CATS).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Description</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What was this for?" /></div>
            <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={addTransaction} className="bg-emerald-600 hover:bg-emerald-700">Add</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskTrackerFinance;
