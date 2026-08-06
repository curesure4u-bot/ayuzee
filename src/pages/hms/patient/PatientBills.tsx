import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Receipt, Printer, MoreHorizontal, Brain, Sparkles } from "lucide-react";

const patientHeader = { name: "Mr. Nagaraj 14233", id: "AL-8472", age: "65 years 1 months 16 days", gender: "M", mobile: "9443314670" };

const opBills = [
  { complaint: "Consultation", billNo: "OP2627-1885", billDate: "21/07/2026 14:52", amount: 1500, paid: 1500, payType: "Cash" },
  { complaint: "lower hip pain..", billNo: "OP2627-1882", billDate: "21/07/2026 13:11", amount: 200, paid: 200, payType: "Cash" },
  { complaint: "Consultation", billNo: "OP2627-1663", billDate: "12/07/2026 13:26", amount: 1500, paid: 1500, payType: "Cash" },
  { complaint: "op treatment", billNo: "OP2627-957", billDate: "31/05/2026 14:39", amount: 999, paid: 999, payType: "Cash" },
  { complaint: "op treatment", billNo: "OP2627-179", billDate: "11/04/2026 13:26", amount: 1200, paid: 1200, payType: "Cash" },
  { complaint: "diagnostic", billNo: "", billDate: "11/04/2026 12:21", amount: 0, paid: 0, payType: "Cash" },
  { complaint: "Diagnostic", billNo: "OP2627-174", billDate: "11/04/2026 11:37", amount: 3000, paid: 3000, payType: "Cash" },
  { complaint: "op treatment", billNo: "OP2627-172", billDate: "11/04/2026 10:17", amount: 150, paid: 150, payType: "Cash" },
  { complaint: "pain in low back", billNo: "OP2526-5903", billDate: "25/01/2026 10:29", amount: 150, paid: 150, payType: "Cash" },
  { complaint: "Consultation", billNo: "OP2526-5327", billDate: "21/12/2025 14:17", amount: 999, paid: 999, payType: "Cash" },
];
const ipBills = [
  { billNo: "IP-60", billDate: "23/04/2025 18:20", amount: 26950, paid: 26950, payType: "Cash" },
  { billNo: "IP-55", billDate: "21/04/2025 20:27", amount: 2000, paid: 2000, payType: "Cash" },
  { billNo: "33AANCA565011Z3133", billDate: "28/05/2023 16:11", amount: 65553, paid: 65553, payType: "Cash" },
];
const pharmacyBills = [
  { sNo: 1, billNo: "PHARMA-3532", billDate: "21/07/2026 15:03", consultant: "Dr. Mohamad Saleem MD (AYURVEDA)", prevBal: 0, amount: 3716, received: 3716, payType: "Cash" },
  { sNo: 2, billNo: "PHARMA-3154", billDate: "12/07/2026 12:13", consultant: "self", prevBal: 0, amount: 350, received: 350, payType: "Cash" },
  { sNo: 3, billNo: "PHARMA-1778", billDate: "31/05/2026 12:05", consultant: "Dr. sahana fathima B.A.M.S", prevBal: 0, amount: 5448, received: 5448, payType: "Cash" },
  { sNo: 4, billNo: "PHARMA-1233", billDate: "12/05/2026 13:07", consultant: "Dr. sahana fathima B.A.M.S", prevBal: 0, amount: 6195, received: 6195, payType: "GooglePay" },
  { sNo: 5, billNo: "PHARMA-328", billDate: "11/04/2026 12:47", consultant: "Dr. sahana fathima B.A.M.S", prevBal: 0, amount: 6046, received: 6046, payType: "Cash" },
];

const PatientBills = () => {
  const [tab, setTab] = useState("op");
  const totalOP = opBills.reduce((s, b) => s + b.amount, 0);
  const totalIP = ipBills.reduce((s, b) => s + b.amount, 0);
  const totalPharma = pharmacyBills.reduce((s, b) => s + b.amount, 0);

  return (
    <div className="space-y-4">
      <Card className="border-t-4 border-t-teal-500">
        <CardContent className="p-4">
          <div className="text-center text-teal-600 font-semibold text-lg mb-2">Bills</div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
            <div><strong>Name:</strong> {patientHeader.name}</div>
            <div><strong>ID:</strong> {patientHeader.id}</div>
            <div><strong>Age:</strong> {patientHeader.age}</div>
            <div><strong>Gender:</strong> {patientHeader.gender}</div>
            <div><strong>Mobile:</strong> {patientHeader.mobile}</div>
          </div>
        </CardContent>
      </Card>

      {/* AI Summary */}
      <Card className="border-violet-200 bg-violet-50">
        <CardContent className="p-3 flex items-center gap-2">
          <Brain className="h-4 w-4 text-violet-600" />
          <span className="text-sm text-violet-700">
            <Sparkles className="h-3 w-3 inline mr-1" />
            Total Billing: OP ₹{totalOP.toLocaleString()} | IP ₹{totalIP.toLocaleString()} | Pharmacy ₹{totalPharma.toLocaleString()} | Grand Total: ₹{(totalOP + totalIP + totalPharma).toLocaleString()}
          </span>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="op">OP Visit</TabsTrigger>
          <TabsTrigger value="ip">IP Visit</TabsTrigger>
          <TabsTrigger value="pharmacy">Pharmacy/Store</TabsTrigger>
          <TabsTrigger value="estimates">Estimates</TabsTrigger>
        </TabsList>

        {/* OP Bills */}
        <TabsContent value="op" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="flex justify-end p-3 gap-2">
                <label className="flex items-center gap-1 text-xs"><input type="checkbox" /> Select All</label>
                <Button size="sm" className="bg-blue-600 text-xs"><Printer className="h-3 w-3 mr-1" /> Print Consolidated</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left text-orange-600 font-semibold">Chief Complaint</th>
                      <th className="px-3 py-2 text-left text-orange-600 font-semibold">Bill No.</th>
                      <th className="px-3 py-2 text-left text-orange-600 font-semibold">Bill Date</th>
                      <th className="px-3 py-2 text-left text-orange-600 font-semibold">Bill Amount</th>
                      <th className="px-3 py-2 text-left text-orange-600 font-semibold">Amount Paid</th>
                      <th className="px-3 py-2 text-left text-orange-600 font-semibold">Payment Type</th>
                      <th className="px-3 py-2 text-center">☐</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {opBills.map((b, i) => (
                      <tr key={i} className="border-b hover:bg-muted/30">
                        <td className="px-3 py-2">{b.complaint}</td>
                        <td className="px-3 py-2 text-orange-600 font-medium">{b.billNo || <span className="text-muted-foreground">No bill generated | <span className="text-orange-600 cursor-pointer">Generate Bill</span></span>}</td>
                        <td className="px-3 py-2">{b.billDate}</td>
                        <td className="px-3 py-2">{b.amount.toFixed(2)}</td>
                        <td className="px-3 py-2">{b.paid.toFixed(2)}</td>
                        <td className="px-3 py-2">{b.payType}</td>
                        <td className="px-3 py-2 text-center"><input type="checkbox" /></td>
                        <td className="px-3 py-2"><MoreHorizontal className="h-4 w-4 text-red-600 cursor-pointer" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IP Bills */}
        <TabsContent value="ip" className="mt-4">
          <Card><CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left text-orange-600 font-semibold">Bill No</th>
                    <th className="px-3 py-2 text-left text-orange-600 font-semibold">Bill Date</th>
                    <th className="px-3 py-2 text-left text-orange-600 font-semibold">Bill Amount</th>
                    <th className="px-3 py-2 text-left text-orange-600 font-semibold">Amount Paid</th>
                    <th className="px-3 py-2 text-left text-orange-600 font-semibold">Payment Type</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {ipBills.map((b, i) => (
                    <tr key={i} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2 text-orange-600 font-medium">{b.billNo}</td>
                      <td className="px-3 py-2">{b.billDate}</td>
                      <td className="px-3 py-2">{b.amount.toLocaleString()}</td>
                      <td className="px-3 py-2">{b.paid.toLocaleString()}</td>
                      <td className="px-3 py-2">{b.payType}</td>
                      <td className="px-3 py-2"><MoreHorizontal className="h-4 w-4 text-red-600 cursor-pointer" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent></Card>
        </TabsContent>

        {/* Pharmacy Bills */}
        <TabsContent value="pharmacy" className="mt-4">
          <Card><CardContent className="p-0">
            <h3 className="p-3 font-semibold">Sale Bills</h3>
            <div className="flex justify-end px-3 gap-2">
              <label className="flex items-center gap-1 text-xs"><input type="checkbox" /> Select All</label>
              <Button size="sm" className="bg-blue-600 text-xs"><Printer className="h-3 w-3 mr-1" /> Print Consolidated</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left text-orange-600">S.No</th>
                    <th className="px-3 py-2 text-left text-orange-600">Bill No.</th>
                    <th className="px-3 py-2 text-left text-orange-600">Bill Date</th>
                    <th className="px-3 py-2 text-left text-orange-600">Consultant</th>
                    <th className="px-3 py-2 text-left text-orange-600">Previous Balance</th>
                    <th className="px-3 py-2 text-left text-orange-600">Bill Amount</th>
                    <th className="px-3 py-2 text-left text-orange-600">Amount Received</th>
                    <th className="px-3 py-2 text-left text-orange-600">Payment Type</th>
                    <th className="px-3 py-2 text-center">☐</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {pharmacyBills.map((b) => (
                    <tr key={b.sNo} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2">{b.sNo}</td>
                      <td className="px-3 py-2 text-orange-600 font-medium">{b.billNo}</td>
                      <td className="px-3 py-2">{b.billDate}</td>
                      <td className="px-3 py-2">{b.consultant}</td>
                      <td className="px-3 py-2">{b.prevBal.toFixed(2)}</td>
                      <td className="px-3 py-2">{b.amount.toFixed(2)}</td>
                      <td className="px-3 py-2">{b.received.toFixed(2)}</td>
                      <td className="px-3 py-2">{b.payType}</td>
                      <td className="px-3 py-2 text-center"><input type="checkbox" /></td>
                      <td className="px-3 py-2"><MoreHorizontal className="h-4 w-4 text-red-600 cursor-pointer" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent></Card>
        </TabsContent>

        {/* Estimates */}
        <TabsContent value="estimates" className="mt-4">
          <Card><CardContent className="p-8 text-center text-muted-foreground">No Estimate bills available.</CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientBills;
