import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, Printer, Download, IndianRupee, Building2,
} from "lucide-react";

// This component renders an individual payslip for printing/PDF

const HrmsPayslip = () => {
  const { employeeId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const month = Number(searchParams.get("month")) || new Date().getMonth() + 1;
  const year = Number(searchParams.get("year")) || new Date().getFullYear();
  const periodLabel = `${new Date(year, month - 1).toLocaleString("en-IN", { month: "long" })} ${year}`;

  // In production, fetch from hrms_payroll_items. Using mock for now.
  const payslip = {
    employeeName: "Dr. Arun Sharma",
    employeeCode: "EMP-0001",
    designation: "Senior Consultant",
    department: "Ayurveda",
    joinDate: "01 Apr 2023",
    bankName: "Indian Overseas Bank",
    bankAccount: "****4521",
    ifsc: "IOBA0001234",
    pan: "ABCDE1234F",
    uan: "1001234567890",

    workingDays: 26,
    presentDays: 26,
    lopDays: 0,
    paidDays: 26,

    earnings: [
      { name: "Basic Salary", amount: 48000 },
      { name: "House Rent Allowance", amount: 14400 },
      { name: "Special Allowance", amount: 18000 },
      { name: "Medical Allowance", amount: 1250 },
      { name: "Conveyance Allowance", amount: 1600 },
      { name: "Performance Incentive", amount: 12000 },
    ],
    deductions: [
      { name: "Provident Fund (Employee)", amount: 5760 },
      { name: "Professional Tax", amount: 1250 },
      { name: "TDS (Income Tax)", amount: 8500 },
    ],
    employerContributions: [
      { name: "PF (Employer)", amount: 5760 },
      { name: "ESI (Employer)", amount: 0 },
    ],
  };

  const totalEarnings = payslip.earnings.reduce((s, e) => s + e.amount, 0);
  const totalDeductions = payslip.deductions.reduce((s, d) => s + d.amount, 0);
  const netSalary = totalEarnings - totalDeductions;

  const handlePrint = () => {
    window.print();
  };

  // Convert number to words (Indian format)
  const numToWords = (num: number): string => {
    if (num === 0) return "Zero";
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
      "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const convert = (n: number): string => {
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
      if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + convert(n % 100) : "");
      if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "");
      if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convert(n % 100000) : "");
      return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + convert(n % 10000000) : "");
    };

    return convert(Math.round(num)) + " Rupees Only";
  };

  return (
    <div className="space-y-4">
      {/* Actions (hidden on print) */}
      <div className="flex items-center justify-between print:hidden">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-3.5 w-3.5 mr-1" /> Print
          </Button>
          <Button size="sm">
            <Download className="h-3.5 w-3.5 mr-1" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Payslip Card */}
      <Card className="max-w-3xl mx-auto print:shadow-none print:border-0">
        <CardContent className="p-6 print:p-4">
          {/* Company Header */}
          <div className="text-center border-b pb-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Building2 className="h-6 w-6 text-green-700" />
              <h1 className="text-xl font-bold text-green-800">Ayuzee Healthcare</h1>
            </div>
            <p className="text-xs text-muted-foreground">#11, Main Road, Kadayanallur, Tamil Nadu 627751</p>
            <p className="text-sm font-semibold mt-2">PAYSLIP — {periodLabel}</p>
          </div>

          {/* Employee Details */}
          <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
            <div className="space-y-1">
              <div className="flex"><span className="w-28 text-muted-foreground">Employee Name:</span><span className="font-medium">{payslip.employeeName}</span></div>
              <div className="flex"><span className="w-28 text-muted-foreground">Employee Code:</span><span className="font-medium">{payslip.employeeCode}</span></div>
              <div className="flex"><span className="w-28 text-muted-foreground">Designation:</span><span>{payslip.designation}</span></div>
              <div className="flex"><span className="w-28 text-muted-foreground">Department:</span><span>{payslip.department}</span></div>
              <div className="flex"><span className="w-28 text-muted-foreground">Date of Joining:</span><span>{payslip.joinDate}</span></div>
            </div>
            <div className="space-y-1">
              <div className="flex"><span className="w-28 text-muted-foreground">Bank:</span><span>{payslip.bankName}</span></div>
              <div className="flex"><span className="w-28 text-muted-foreground">Account No:</span><span>{payslip.bankAccount}</span></div>
              <div className="flex"><span className="w-28 text-muted-foreground">IFSC:</span><span>{payslip.ifsc}</span></div>
              <div className="flex"><span className="w-28 text-muted-foreground">PAN:</span><span>{payslip.pan}</span></div>
              <div className="flex"><span className="w-28 text-muted-foreground">UAN:</span><span>{payslip.uan}</span></div>
            </div>
          </div>

          {/* Attendance Summary */}
          <div className="mt-4 p-3 rounded bg-muted/30 flex items-center justify-around text-xs">
            <div className="text-center"><p className="font-bold">{payslip.workingDays}</p><p className="text-muted-foreground">Working Days</p></div>
            <div className="text-center"><p className="font-bold text-green-700">{payslip.presentDays}</p><p className="text-muted-foreground">Present</p></div>
            <div className="text-center"><p className="font-bold text-red-600">{payslip.lopDays}</p><p className="text-muted-foreground">LOP Days</p></div>
            <div className="text-center"><p className="font-bold">{payslip.paidDays}</p><p className="text-muted-foreground">Paid Days</p></div>
          </div>

          {/* Earnings & Deductions Table */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            {/* Earnings */}
            <div>
              <h3 className="text-xs font-bold text-green-700 mb-2 uppercase tracking-wide">Earnings</h3>
              <div className="space-y-1">
                {payslip.earnings.map((e, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span>{e.name}</span>
                    <span className="font-medium">₹{e.amount.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-sm font-bold text-green-700">
                <span>Total Earnings</span>
                <span>₹{totalEarnings.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Deductions */}
            <div>
              <h3 className="text-xs font-bold text-red-700 mb-2 uppercase tracking-wide">Deductions</h3>
              <div className="space-y-1">
                {payslip.deductions.map((d, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span>{d.name}</span>
                    <span className="font-medium text-red-600">₹{d.amount.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-sm font-bold text-red-600">
                <span>Total Deductions</span>
                <span>₹{totalDeductions.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Net Salary */}
          <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Net Salary (Take Home)</p>
                <p className="text-2xl font-bold text-green-800 flex items-center gap-1">
                  <IndianRupee className="h-5 w-5" />
                  {netSalary.toLocaleString("en-IN")}
                </p>
              </div>
              <Badge className="bg-green-100 text-green-700 text-xs border-0">Credited to Bank</Badge>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 italic">
              ({numToWords(netSalary)})
            </p>
          </div>

          {/* Employer Contributions */}
          <div className="mt-4">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">Employer Contributions (not part of take-home)</h3>
            <div className="flex gap-4 text-xs">
              {payslip.employerContributions.filter((c) => c.amount > 0).map((c, i) => (
                <span key={i} className="text-muted-foreground">{c.name}: <strong>₹{c.amount.toLocaleString("en-IN")}</strong></span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t text-center">
            <p className="text-[9px] text-muted-foreground">
              This is a computer-generated payslip and does not require a signature.
            </p>
            <p className="text-[9px] text-muted-foreground mt-1">
              For queries, contact HR at hr@ayuzee.com | Generated on {new Date().toLocaleDateString("en-IN")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HrmsPayslip;
