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
  Building2, Zap, Users, Truck, Wrench, ShoppingCart,
  FileText, Calendar, CheckCircle2, Clock,
} from "lucide-react";

interface Expense {
  id: string;
  voucherNo: string;
  date: string;
  category: string;
  subCategory: string;
  description: string;
  amount: number;
  paidTo: string;
  mode: "Cash" | "Bank Transfer" | "UPI" | "Cheque";
  approvedBy: string;
  status: "Approved" | "Pending" | "Rejected";
  receipt?: boolean;
}

const mockExpenses: Expense[] = [
  { id: "1", voucherNo: "EXP-2026-0451", date: "2026-07-24", category: "Rent & Utilities", subCategory: "Electricity", description: "EB Bill - July 2026", amount: 18500, paidTo: "TNEB", mode: "Bank Transfer", approvedBy: "Admin", status: "Approved", receipt: true },
  { id: "2", voucherNo: "EXP-2026-0452", date: "2026-07-24", category: "Staff Salary", subCategory: "Technician", description: "Tech. Arun - July salary advance", amount: 15000, paidTo: "Arun K", mode: "Bank Transfer", approvedBy: "Dr. Mohamad Saleem", status: "Approved" },
  { id: "3", voucherNo: "EXP-2026-0453", date: "2026-07-23", category: "Lab Supplies", subCategory: "Reagents", description: "Beckman reagent order - Glucose + Creatinine", amount: 5600, paidTo: "Beckman Coulter India", mode: "Bank Transfer", approvedBy: "Lab Manager", status: "Approved", receipt: true },
  { id: "4", voucherNo: "EXP-2026-0454", date: "2026-07-23", category: "Maintenance", subCategory: "Equipment Repair", description: "AC repair - Lab room", amount: 3500, paidTo: "Cool Care Services", mode: "Cash", approvedBy: "Admin", status: "Approved" },
  { id: "5", voucherNo: "EXP-2026-0455", date: "2026-07-23", category: "Marketing", subCategory: "Printing", description: "Patient pamphlets - 1000 copies", amount: 4200, paidTo: "Sri Murugan Printers", mode: "Cash", approvedBy: "Admin", status: "Approved", receipt: true },
  { id: "6", voucherNo: "EXP-2026-0456", date: "2026-07-24", category: "Transport", subCategory: "Fuel", description: "Home collection bike - Petrol", amount: 800, paidTo: "Petty Cash", mode: "Cash", approvedBy: "Supervisor", status: "Approved" },
  { id: "7", voucherNo: "EXP-2026-0457", date: "2026-07-24", category: "Office Supplies", subCategory: "Stationery", description: "Printer paper, ink, files", amount: 2100, paidTo: "Lakshmi Stores", mode: "Cash", approvedBy: "Admin", status: "Pending" },
  { id: "8", voucherNo: "EXP-2026-0458", date: "2026-07-24", category: "Professional Fees", subCategory: "Audit", description: "CA audit fees - Q1", amount: 25000, paidTo: "M/s. Kumar & Associates", mode: "Cheque", approvedBy: "Dr. Mohamad Saleem", status: "Pending" },
];

const categories = [
  { name: "Rent & Utilities", icon: Building2, total: 42000, color: "text-blue-600" },
  { name: "Staff Salary", icon: Users, total: 285000, color: "text-purple-600" },
  { name: "Lab Supplies", icon: ShoppingCart, total: 68000, color: "text-green-600" },
  { name: "Maintenance", icon: Wrench, total: 18500, color: "text-amber-600" },
  { name: "Marketing", icon: FileText, total: 12000, color: "text-pink-600" },
  { name: "Transport", icon: Truck, total: 8500, color: "text-orange-600" },
  { name: "Professional Fees", icon: FileText, total: 35000, color: "text-red-600" },
  { name: "Office Supplies", icon: ShoppingCart, total: 6200, color: "text-teal-600" },
];

const ExpenseManagement = () => {
  const [expenses] = useState<Expense[]>(mockExpenses);
  const [activeTab, setActiveTab] = useState("list");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("ALL");

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const pendingApproval = expenses.filter(e => e.status === "Pending").length;
  const totalCategories = categories.reduce((s, c) => s + c.total, 0);

  const filtered = expenses.filter(e => {
    const matchSearch = e.description.toLowerCase().includes(search.toLowerCase()) || e.paidTo.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "ALL" || e.category === catFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2"><TrendingDown className="h-5 w-5" /> Expense Management</h2>
        <Button size="sm" className="bg-green-600 hover:bg-green-700"><Plus className="mr-1 h-3 w-3" /> New Expense</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-red-200"><CardContent className="p-3 text-center"><TrendingDown className="h-4 w-4 mx-auto text-red-600" /><p className="text-xl font-bold text-red-600 mt-1">₹{(totalCategories / 1000).toFixed(0)}K</p><p className="text-[10px] text-muted-foreground">Total (Month)</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><Calendar className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold text-amber-600 mt-1">₹{(totalExpenses / 1000).toFixed(1)}K</p><p className="text-[10px] text-muted-foreground">This Week</p></CardContent></Card>
        <Card className="border-orange-200"><CardContent className="p-3 text-center"><Clock className="h-4 w-4 mx-auto text-orange-600" /><p className="text-xl font-bold text-orange-600 mt-1">{pendingApproval}</p><p className="text-[10px] text-muted-foreground">Pending Approval</p></CardContent></Card>
        <Card className="border-blue-200"><CardContent className="p-3 text-center"><FileText className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold text-blue-600 mt-1">{categories.length}</p><p className="text-[10px] text-muted-foreground">Categories</p></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="list">Expenses</TabsTrigger><TabsTrigger value="add">Add Expense</TabsTrigger><TabsTrigger value="category">Category Breakdown</TabsTrigger></TabsList>

        {/* Expenses List */}
        <TabsContent value="list" className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-[250px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" /><Input className="pl-8 h-8 text-xs" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <Select value={catFilter} onValueChange={setCatFilter}><SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">All Categories</SelectItem>{categories.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select>
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
                <div className="space-y-2"><label className="text-xs font-medium">Category</label><Select><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><label className="text-xs font-medium">Amount (₹)</label><Input className="h-8 text-xs" type="number" placeholder="Enter amount" /></div>
                <div className="space-y-2"><label className="text-xs font-medium">Date</label><Input className="h-8 text-xs" type="date" defaultValue="2026-07-24" /></div>
                <div className="space-y-2"><label className="text-xs font-medium">Paid To</label><Input className="h-8 text-xs" placeholder="Vendor / Person name" /></div>
                <div className="space-y-2"><label className="text-xs font-medium">Payment Mode</label><Select defaultValue="Cash"><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Cash">Cash</SelectItem><SelectItem value="Bank Transfer">Bank Transfer</SelectItem><SelectItem value="UPI">UPI</SelectItem><SelectItem value="Cheque">Cheque</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><label className="text-xs font-medium">Approved By</label><Select><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="admin">Admin</SelectItem><SelectItem value="doctor">Dr. Mohamad Saleem</SelectItem><SelectItem value="manager">Manager</SelectItem></SelectContent></Select></div>
              </div>
              <div className="space-y-2"><label className="text-xs font-medium">Description</label><Textarea className="text-xs min-h-[60px]" placeholder="Describe the expense..." /></div>
              <div className="space-y-2"><label className="text-xs font-medium">Attach Receipt (Optional)</label><Input type="file" className="text-xs" accept="image/*,.pdf" /></div>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => toast.success("Expense recorded!")}><Plus className="mr-1 h-4 w-4" /> Save Expense</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Category Breakdown */}
        <TabsContent value="category" className="space-y-3">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Monthly Expense by Category</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {categories.sort((a, b) => b.total - a.total).map((cat) => (
                <div key={cat.name} className="flex items-center gap-3">
                  <cat.icon className={`h-4 w-4 shrink-0 ${cat.color}`} />
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1"><span className="font-medium">{cat.name}</span><span className="font-bold">₹{(cat.total / 1000).toFixed(0)}K</span></div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-red-400 rounded-full" style={{ width: `${(cat.total / totalCategories) * 100}%` }} /></div>
                  </div>
                  <span className="text-[10px] text-muted-foreground w-8">{((cat.total / totalCategories) * 100).toFixed(0)}%</span>
                </div>
              ))}
              <div className="pt-2 border-t text-xs text-right font-bold">Total Monthly Expenses: ₹{(totalCategories / 1000).toFixed(0)}K</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExpenseManagement;
