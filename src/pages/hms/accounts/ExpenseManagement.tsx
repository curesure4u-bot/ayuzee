import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  TrendingDown, Plus, Search, Download, IndianRupee,
  Building2, Users, Truck, Wrench, ShoppingCart,
  FileText, Calendar, CheckCircle2, Clock, Loader2,
} from "lucide-react";
import { useExpenseManagement, type ExpenseCategory, type PaymentMode } from "@/hooks/useExpenseManagement";

const categoryOptions: ExpenseCategory[] = [
  "Rent & Utilities", "Staff Salary", "Lab Supplies", "Maintenance",
  "Marketing", "Transport", "Professional Fees", "Office Supplies",
  "Medicine Purchase", "Equipment", "Insurance", "Taxes", "Other",
];

const categoryIcons: Record<string, typeof Building2> = {
  "Rent & Utilities": Building2,
  "Staff Salary": Users,
  "Lab Supplies": ShoppingCart,
  "Maintenance": Wrench,
  "Marketing": FileText,
  "Transport": Truck,
  "Professional Fees": FileText,
  "Office Supplies": ShoppingCart,
};

const ExpenseManagement = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("ALL");

  // Form state
  const [formCategory, setFormCategory] = useState<string>("");
  const [formAmount, setFormAmount] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formPaidTo, setFormPaidTo] = useState("");
  const [formMode, setFormMode] = useState<PaymentMode>("Cash");
  const [formApprovedBy, setFormApprovedBy] = useState("");
  const [formDescription, setFormDescription] = useState("");

  const { expenses, categories, totalMonth, totalWeek, pendingCount, loading, error, createExpense } = useExpenseManagement({
    search,
    category: catFilter,
  });

  const filtered = search
    ? expenses.filter((e) =>
        e.description.toLowerCase().includes(search.toLowerCase()) ||
        e.paidTo.toLowerCase().includes(search.toLowerCase()) ||
        e.voucherNo.toLowerCase().includes(search.toLowerCase()))
    : expenses;

  const handleCreateExpense = async () => {
    if (!formCategory || !formAmount || !formPaidTo || !formDescription) {
      toast.error("Please fill all required fields");
      return;
    }
    const success = await createExpense({
      date: formDate,
      category: formCategory as ExpenseCategory,
      subCategory: "",
      description: formDescription,
      amount: Number(formAmount),
      paidTo: formPaidTo,
      mode: formMode,
      approvedBy: formApprovedBy || "Admin",
      status: "Pending",
      receipt: false,
    });
    if (success) {
      toast.success("Expense recorded!");
      setFormCategory(""); setFormAmount(""); setFormPaidTo(""); setFormDescription("");
    } else {
      toast.error("Failed to save expense");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2"><TrendingDown className="h-5 w-5" /> Expense Management</h2>
        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => setActiveTab("add")}><Plus className="mr-1 h-3 w-3" /> New Expense</Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-4 text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Loading expenses...</span>
        </div>
      )}

      {error && !loading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-2 text-xs text-amber-700">⚠ Could not load live data (showing demo). {error}</CardContent>
        </Card>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-red-200"><CardContent className="p-3 text-center"><TrendingDown className="h-4 w-4 mx-auto text-red-600" /><p className="text-xl font-bold text-red-600 mt-1">₹{(totalMonth / 1000).toFixed(0)}K</p><p className="text-[10px] text-muted-foreground">Total (Month)</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><Calendar className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold text-amber-600 mt-1">₹{(totalWeek / 1000).toFixed(1)}K</p><p className="text-[10px] text-muted-foreground">This Week</p></CardContent></Card>
        <Card className="border-orange-200"><CardContent className="p-3 text-center"><Clock className="h-4 w-4 mx-auto text-orange-600" /><p className="text-xl font-bold text-orange-600 mt-1">{pendingCount}</p><p className="text-[10px] text-muted-foreground">Pending Approval</p></CardContent></Card>
        <Card className="border-blue-200"><CardContent className="p-3 text-center"><FileText className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold text-blue-600 mt-1">{categories.length}</p><p className="text-[10px] text-muted-foreground">Categories</p></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="list">Expenses</TabsTrigger><TabsTrigger value="add">Add Expense</TabsTrigger><TabsTrigger value="category">Category Breakdown</TabsTrigger></TabsList>

        {/* Expenses List */}
        <TabsContent value="list" className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-[250px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" /><Input className="pl-8 h-8 text-xs" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <Select value={catFilter} onValueChange={setCatFilter}><SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">All Categories</SelectItem>{categoryOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
            <Button size="sm" variant="outline" className="h-8 text-xs"><Download className="mr-1 h-3 w-3" /> Export</Button>
          </div>
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-b"><tr><th className="px-3 py-2 text-left">Voucher</th><th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-left">Category</th><th className="px-3 py-2 text-left">Description</th><th className="px-3 py-2 text-left">Paid To</th><th className="px-3 py-2 text-right">Amount</th><th className="px-3 py-2 text-center">Mode</th><th className="px-3 py-2 text-center">Status</th></tr></thead>
              <tbody>
                {filtered.map((exp) => (
                  <tr key={exp.id} className="border-b">
                    <td className="px-3 py-2 font-medium">{exp.voucherNo}</td>
                    <td className="px-3 py-2">{exp.date}</td>
                    <td className="px-3 py-2"><Badge variant="outline" className="text-[9px]">{exp.category}</Badge></td>
                    <td className="px-3 py-2">{exp.description}</td>
                    <td className="px-3 py-2 text-muted-foreground">{exp.paidTo}</td>
                    <td className="px-3 py-2 text-right font-bold text-red-600">₹{exp.amount.toLocaleString()}</td>
                    <td className="px-3 py-2 text-center"><Badge variant="outline" className="text-[9px]">{exp.mode}</Badge></td>
                    <td className="px-3 py-2 text-center"><Badge className={`text-[9px] ${exp.status === "Approved" ? "bg-green-100 text-green-700" : exp.status === "Pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{exp.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr className="bg-red-50"><td colSpan={5} className="px-3 py-2 text-xs font-bold text-right">Total:</td><td className="px-3 py-2 text-right font-bold text-red-700">₹{filtered.reduce((s, e) => s + e.amount, 0).toLocaleString()}</td><td colSpan={2}></td></tr></tfoot>
            </table>
          </CardContent></Card>
        </TabsContent>

        {/* Add Expense Form */}
        <TabsContent value="add" className="space-y-3">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Record New Expense</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="space-y-2"><label className="text-xs font-medium">Category *</label><Select value={formCategory} onValueChange={setFormCategory}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{categoryOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><label className="text-xs font-medium">Amount (₹) *</label><Input className="h-8 text-xs" type="number" placeholder="Enter amount" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} /></div>
                <div className="space-y-2"><label className="text-xs font-medium">Date</label><Input className="h-8 text-xs" type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} /></div>
                <div className="space-y-2"><label className="text-xs font-medium">Paid To *</label><Input className="h-8 text-xs" placeholder="Vendor / Person name" value={formPaidTo} onChange={(e) => setFormPaidTo(e.target.value)} /></div>
                <div className="space-y-2"><label className="text-xs font-medium">Payment Mode</label><Select value={formMode} onValueChange={(v) => setFormMode(v as PaymentMode)}><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Cash">Cash</SelectItem><SelectItem value="Bank Transfer">Bank Transfer</SelectItem><SelectItem value="UPI">UPI</SelectItem><SelectItem value="Cheque">Cheque</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><label className="text-xs font-medium">Approved By</label><Select value={formApprovedBy} onValueChange={setFormApprovedBy}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="Admin">Admin</SelectItem><SelectItem value="Dr. Mohamad Saleem">Dr. Mohamad Saleem</SelectItem><SelectItem value="Manager">Manager</SelectItem></SelectContent></Select></div>
              </div>
              <div className="space-y-2"><label className="text-xs font-medium">Description *</label><Textarea className="text-xs min-h-[60px]" placeholder="Describe the expense..." value={formDescription} onChange={(e) => setFormDescription(e.target.value)} /></div>
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleCreateExpense}><Plus className="mr-1 h-4 w-4" /> Save Expense</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Category Breakdown */}
        <TabsContent value="category" className="space-y-3">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Monthly Expense by Category</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {categories.map((cat) => {
                const Icon = categoryIcons[cat.name] || FileText;
                return (
                  <div key={cat.name} className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1"><span className="font-medium">{cat.name}</span><span className="font-bold">₹{(cat.total / 1000).toFixed(0)}K</span></div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-red-400 rounded-full" style={{ width: `${cat.percentage}%` }} /></div>
                    </div>
                    <span className="text-[10px] text-muted-foreground w-8">{cat.percentage}%</span>
                  </div>
                );
              })}
              <div className="pt-2 border-t text-xs text-right font-bold">Total Monthly Expenses: ₹{(totalMonth / 1000).toFixed(0)}K</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExpenseManagement;
