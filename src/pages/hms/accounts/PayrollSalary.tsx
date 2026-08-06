import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Users, IndianRupee, Calendar, Download, CheckCircle2,
  Clock, FileText, Search, Printer, CreditCard,
} from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  empId: string;
  role: string;
  department: string;
  joinDate: string;
  basicSalary: number;
  hra: number;
  allowances: number;
  grossSalary: number;
  pfDeduction: number;
  esiDeduction: number;
  tdsDeduction: number;
  otherDeductions: number;
  netSalary: number;
  bankAccount: string;
  presentDays: number;
  absentDays: number;
  overtimeHours: number;
  status: "Processed" | "Pending" | "On Hold";
  paidDate?: string;
}

const mockStaff: StaffMember[] = [
  { id: "1", name: "Tech. Arun Kumar", empId: "EMP-001", role: "Lab Technician", department: "Laboratory", joinDate: "2023-06-15", basicSalary: 18000, hra: 5400, allowances: 3000, grossSalary: 26400, pfDeduction: 2160, esiDeduction: 198, tdsDeduction: 0, otherDeductions: 0, netSalary: 24042, bankAccount: "IOB ****4521", presentDays: 26, absentDays: 0, overtimeHours: 8, status: "Processed", paidDate: "2026-07-01" },
  { id: "2", name: "Tech. Meena S", empId: "EMP-002", role: "Lab Technician", department: "Haematology", joinDate: "2024-01-10", basicSalary: 16000, hra: 4800, allowances: 2500, grossSalary: 23300, pfDeduction: 1920, esiDeduction: 175, tdsDeduction: 0, otherDeductions: 500, netSalary: 20705, bankAccount: "SBI ****7890", presentDays: 24, absentDays: 2, overtimeHours: 4, status: "Processed", paidDate: "2026-07-01" },
  { id: "3", name: "Rec. Priya M", empId: "EMP-003", role: "Receptionist", department: "Front Desk", joinDate: "2024-03-20", basicSalary: 14000, hra: 4200, allowances: 2000, grossSalary: 20200, pfDeduction: 1680, esiDeduction: 152, tdsDeduction: 0, otherDeductions: 0, netSalary: 18368, bankAccount: "ICICI ****3456", presentDays: 25, absentDays: 1, overtimeHours: 0, status: "Processed", paidDate: "2026-07-01" },
  { id: "4", name: "Rec. Meena K", empId: "EMP-004", role: "Receptionist", department: "Front Desk", joinDate: "2025-01-05", basicSalary: 13000, hra: 3900, allowances: 1500, grossSalary: 18400, pfDeduction: 1560, esiDeduction: 138, tdsDeduction: 0, otherDeductions: 0, netSalary: 16702, bankAccount: "KVB ****6789", presentDays: 26, absentDays: 0, overtimeHours: 2, status: "Pending" },
  { id: "5", name: "Phlebotomist Ravi", empId: "EMP-005", role: "Phlebotomist", department: "Collection", joinDate: "2024-08-01", basicSalary: 12000, hra: 3600, allowances: 2000, grossSalary: 17600, pfDeduction: 1440, esiDeduction: 132, tdsDeduction: 0, otherDeductions: 0, netSalary: 16028, bankAccount: "IOB ****1234", presentDays: 26, absentDays: 0, overtimeHours: 12, status: "Pending" },
  { id: "6", name: "Housekeeping - Lakshmi", empId: "EMP-006", role: "Housekeeping", department: "Support", joinDate: "2023-11-01", basicSalary: 10000, hra: 3000, allowances: 1000, grossSalary: 14000, pfDeduction: 1200, esiDeduction: 105, tdsDeduction: 0, otherDeductions: 0, netSalary: 12695, bankAccount: "PNB ****5678", presentDays: 26, absentDays: 0, overtimeHours: 0, status: "Pending" },
];

const PayrollSalary = () => {
  const [staff] = useState<StaffMember[]>(mockStaff);
  const [activeTab, setActiveTab] = useState("payroll");
  const [month, setMonth] = useState("2026-07");
  const [search, setSearch] = useState("");

  const totalGross = staff.reduce((s, e) => s + e.grossSalary, 0);
  const totalNet = staff.reduce((s, e) => s + e.netSalary, 0);
  const totalPF = staff.reduce((s, e) => s + e.pfDeduction, 0);
  const totalESI = staff.reduce((s, e) => s + e.esiDeduction, 0);
  const processedCount = staff.filter(s => s.status === "Processed").length;

  const filtered = staff.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.empId.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2"><Users className="h-5 w-5" /> Payroll & Salary Management</h2>
        <div className="flex gap-2">
          <Input type="month" className="h-8 text-xs w-[140px]" value={month} onChange={(e) => setMonth(e.target.value)} />
          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => toast.success("Salary processed for all pending staff")}><CreditCard className="mr-1 h-3 w-3" /> Process All</Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="border-blue-200"><CardContent className="p-3 text-center"><Users className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold text-blue-600 mt-1">{staff.length}</p><p className="text-[10px] text-muted-foreground">Total Staff</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><IndianRupee className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600 mt-1">₹{(totalGross / 1000).toFixed(0)}K</p><p className="text-[10px] text-muted-foreground">Gross Payroll</p></CardContent></Card>
        <Card className="border-purple-200"><CardContent className="p-3 text-center"><IndianRupee className="h-4 w-4 mx-auto text-purple-600" /><p className="text-xl font-bold text-purple-600 mt-1">₹{(totalNet / 1000).toFixed(0)}K</p><p className="text-[10px] text-muted-foreground">Net Payout</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><IndianRupee className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold text-amber-600 mt-1">₹{((totalPF + totalESI) / 1000).toFixed(1)}K</p><p className="text-[10px] text-muted-foreground">PF + ESI</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><CheckCircle2 className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600 mt-1">{processedCount}/{staff.length}</p><p className="text-[10px] text-muted-foreground">Processed</p></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="payroll">Payroll Sheet</TabsTrigger><TabsTrigger value="payslip">Payslips</TabsTrigger></TabsList>

        {/* Payroll Sheet */}
        <TabsContent value="payroll" className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-[220px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" /><Input className="pl-8 h-8 text-xs" placeholder="Search staff..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <Button size="sm" variant="outline" className="h-8 text-xs"><Download className="mr-1 h-3 w-3" /> Export</Button>
            <Button size="sm" variant="outline" className="h-8 text-xs"><Printer className="mr-1 h-3 w-3" /> Print</Button>
          </div>
          <Card><CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-xs min-w-[900px]">
              <thead className="bg-muted/50 border-b">
                <tr><th className="px-2 py-2 text-left">Employee</th><th className="px-2 py-2 text-left">Role</th><th className="px-2 py-2 text-right">Basic</th><th className="px-2 py-2 text-right">HRA</th><th className="px-2 py-2 text-right">Allow.</th><th className="px-2 py-2 text-right font-bold">Gross</th><th className="px-2 py-2 text-right">PF</th><th className="px-2 py-2 text-right">ESI</th><th className="px-2 py-2 text-right">Other</th><th className="px-2 py-2 text-right font-bold text-green-700">Net</th><th className="px-2 py-2 text-center">Days</th><th className="px-2 py-2 text-center">Status</th></tr>
              </thead>
              <tbody>
                {filtered.map((emp) => (
                  <tr key={emp.id} className="border-b">
                    <td className="px-2 py-2"><p className="font-medium">{emp.name}</p><p className="text-[10px] text-muted-foreground">{emp.empId}</p></td>
                    <td className="px-2 py-2">{emp.role}</td>
                    <td className="px-2 py-2 text-right">₹{emp.basicSalary.toLocaleString()}</td>
                    <td className="px-2 py-2 text-right">₹{emp.hra.toLocaleString()}</td>
                    <td className="px-2 py-2 text-right">₹{emp.allowances.toLocaleString()}</td>
                    <td className="px-2 py-2 text-right font-bold">₹{emp.grossSalary.toLocaleString()}</td>
                    <td className="px-2 py-2 text-right text-red-600">₹{emp.pfDeduction.toLocaleString()}</td>
                    <td className="px-2 py-2 text-right text-red-600">₹{emp.esiDeduction.toLocaleString()}</td>
                    <td className="px-2 py-2 text-right text-red-600">{emp.otherDeductions > 0 ? `₹${emp.otherDeductions}` : "-"}</td>
                    <td className="px-2 py-2 text-right font-bold text-green-700">₹{emp.netSalary.toLocaleString()}</td>
                    <td className="px-2 py-2 text-center">{emp.presentDays}/{emp.presentDays + emp.absentDays}</td>
                    <td className="px-2 py-2 text-center"><Badge className={`text-[9px] ${emp.status === "Processed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{emp.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50"><tr><td colSpan={5} className="px-2 py-2 text-right font-bold">Totals:</td><td className="px-2 py-2 text-right font-bold">₹{totalGross.toLocaleString()}</td><td className="px-2 py-2 text-right text-red-600">₹{totalPF.toLocaleString()}</td><td className="px-2 py-2 text-right text-red-600">₹{totalESI.toLocaleString()}</td><td className="px-2 py-2 text-right text-red-600">₹{staff.reduce((s, e) => s + e.otherDeductions, 0).toLocaleString()}</td><td className="px-2 py-2 text-right font-bold text-green-700">₹{totalNet.toLocaleString()}</td><td colSpan={2}></td></tr></tfoot>
            </table>
          </CardContent></Card>
        </TabsContent>

        {/* Payslips */}
        <TabsContent value="payslip" className="space-y-3">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Generate Payslips — {month}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground">Click on any staff to generate and print their monthly payslip.</p>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                {staff.map((emp) => (
                  <div key={emp.id} className="border rounded p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50" onClick={() => toast.info(`Payslip generated for ${emp.name}`)}>
                    <div><p className="text-xs font-medium">{emp.name}</p><p className="text-[10px] text-muted-foreground">{emp.role} | Net: ₹{emp.netSalary.toLocaleString()}</p></div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="h-5 text-[9px]"><FileText className="h-3 w-3" /></Button>
                      <Button size="sm" variant="outline" className="h-5 text-[9px]"><Printer className="h-3 w-3" /></Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button size="sm" variant="outline" className="mt-2" onClick={() => toast.success("All payslips generated")}><Download className="mr-1 h-3 w-3" /> Download All Payslips (PDF)</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PayrollSalary;
