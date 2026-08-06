import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  IndianRupee, Receipt, CreditCard, Search, Printer,
  Download, FileText, Building2, User, CheckCircle2,
  Clock, AlertTriangle, Percent, Shield, Plus, X,
} from "lucide-react";

interface LabBillItem {
  id: string;
  testName: string;
  testCode: string;
  price: number;
  discount: number;
  netAmount: number;
  isProfile: boolean;
}

interface LabBill {
  id: string;
  billNo: string;
  orderNo: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  age: number;
  gender: string;
  referredBy: string;
  billDate: string;
  items: LabBillItem[];
  subtotal: number;
  discountTotal: number;
  taxAmount: number;
  netTotal: number;
  paidAmount: number;
  dueAmount: number;
  paymentMode: string;
  paymentStatus: "Paid" | "Partial" | "Pending" | "Refunded";
  insuranceClaimed: boolean;
  insuranceProvider?: string;
  insuranceAmount?: number;
  receiptPrinted: boolean;
  b2bClient?: string;
}

const mockBills: LabBill[] = [
  {
    id: "1", billNo: "LB-2026-00341", orderNo: "ORD-2026-0047", patientId: "AL-12543",
    patientName: "Mr. Rajesh Kumar", patientPhone: "+91 98765 43210", age: 52, gender: "Male",
    referredBy: "Dr. Mohamad Saleem", billDate: "2026-07-24 08:35 AM",
    items: [
      { id: "i1", testName: "Renal Function Test (RFT)", testCode: "BIO-RFT", price: 850, discount: 0, netAmount: 850, isProfile: true },
      { id: "i2", testName: "Complete Urine Examination", testCode: "CP-CUE", price: 150, discount: 0, netAmount: 150, isProfile: false },
    ],
    subtotal: 1000, discountTotal: 0, taxAmount: 0, netTotal: 1000, paidAmount: 1000, dueAmount: 0,
    paymentMode: "UPI", paymentStatus: "Paid", insuranceClaimed: false, receiptPrinted: true,
  },
  {
    id: "2", billNo: "LB-2026-00342", orderNo: "ORD-2026-0048", patientId: "AL-14201",
    patientName: "Mrs. Lakshmi Devi", patientPhone: "+91 87654 32109", age: 45, gender: "Female",
    referredBy: "Dr. Anitha Kumari", billDate: "2026-07-24 09:20 AM",
    items: [
      { id: "i3", testName: "Complete Blood Count (CBC)", testCode: "HEM-CBC", price: 450, discount: 50, netAmount: 400, isProfile: true },
      { id: "i4", testName: "Iron Studies", testCode: "BIO-IRON", price: 650, discount: 50, netAmount: 600, isProfile: false },
      { id: "i5", testName: "Peripheral Smear", testCode: "HEM-PS", price: 200, discount: 0, netAmount: 200, isProfile: false },
    ],
    subtotal: 1300, discountTotal: 100, taxAmount: 0, netTotal: 1200, paidAmount: 500, dueAmount: 700,
    paymentMode: "Cash", paymentStatus: "Partial", insuranceClaimed: false, receiptPrinted: false,
  },
  {
    id: "3", billNo: "LB-2026-00343", orderNo: "ORD-2026-0049", patientId: "AL-15320",
    patientName: "Mr. Suresh Babu", patientPhone: "+91 76543 21098", age: 38, gender: "Male",
    referredBy: "Dr. Mohamad Saleem", billDate: "2026-07-24 09:50 AM",
    items: [
      { id: "i6", testName: "Lipid Profile", testCode: "BIO-LIP", price: 600, discount: 0, netAmount: 600, isProfile: true },
      { id: "i7", testName: "Liver Function Test (LFT)", testCode: "BIO-LFT", price: 750, discount: 0, netAmount: 750, isProfile: true },
      { id: "i8", testName: "HbA1c", testCode: "BIO-HBA1C", price: 500, discount: 0, netAmount: 500, isProfile: false },
      { id: "i9", testName: "Thyroid Profile (T3, T4, TSH)", testCode: "BIO-THY", price: 800, discount: 0, netAmount: 800, isProfile: true },
    ],
    subtotal: 2650, discountTotal: 0, taxAmount: 0, netTotal: 2650, paidAmount: 0, dueAmount: 2650,
    paymentMode: "", paymentStatus: "Pending", insuranceClaimed: true, insuranceProvider: "Star Health Insurance", insuranceAmount: 2650, receiptPrinted: false, b2bClient: "Star Health",
  },
  {
    id: "4", billNo: "LB-2026-00340", orderNo: "ORD-2026-0045", patientId: "AL-13105",
    patientName: "Mrs. Priya Sharma", patientPhone: "+91 65432 10987", age: 30, gender: "Female",
    referredBy: "Dr. Mohamad Saleem", billDate: "2026-07-24 07:10 AM",
    items: [
      { id: "i10", testName: "Thyroid Profile", testCode: "BIO-THY", price: 800, discount: 100, netAmount: 700, isProfile: true },
    ],
    subtotal: 800, discountTotal: 100, taxAmount: 0, netTotal: 700, paidAmount: 700, dueAmount: 0,
    paymentMode: "Card", paymentStatus: "Paid", insuranceClaimed: false, receiptPrinted: true,
  },
];

const LabBilling = () => {
  const [bills] = useState<LabBill[]>(mockBills);
  const [selectedBill, setSelectedBill] = useState<LabBill | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState("bills");
  const [collectAmount, setCollectAmount] = useState("");
  const [collectMode, setCollectMode] = useState("Cash");

  const filteredBills = bills.filter((b) => {
    const matchSearch = b.patientName.toLowerCase().includes(search.toLowerCase()) ||
      b.billNo.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || b.paymentStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const todayRevenue = bills.reduce((sum, b) => sum + b.paidAmount, 0);
  const todayPending = bills.reduce((sum, b) => sum + b.dueAmount, 0);
  const todayDiscount = bills.reduce((sum, b) => sum + b.discountTotal, 0);
  const todayInsurance = bills.filter(b => b.insuranceClaimed).reduce((sum, b) => sum + (b.insuranceAmount || 0), 0);

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Paid": return "bg-green-100 text-green-700 border-green-300";
      case "Partial": return "bg-amber-100 text-amber-700 border-amber-300";
      case "Pending": return "bg-red-100 text-red-700 border-red-300";
      case "Refunded": return "bg-purple-100 text-purple-700 border-purple-300";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const handleCollectPayment = () => {
    if (!selectedBill || !collectAmount) return;
    const amount = parseFloat(collectAmount);
    if (isNaN(amount) || amount <= 0) { toast.error("Enter valid amount"); return; }
    if (amount > selectedBill.dueAmount) { toast.error("Amount exceeds due amount"); return; }
    toast.success(`₹${amount.toLocaleString()} collected via ${collectMode} for ${selectedBill.patientName}`);
    setCollectAmount("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2">
          <IndianRupee className="h-5 w-5" /> Lab Billing & Payments
        </h2>
        <Button size="sm" className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-1 h-3 w-3" /> New Bill
        </Button>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-green-200">
          <CardContent className="p-3 text-center">
            <IndianRupee className="h-4 w-4 mx-auto text-green-600" />
            <p className="text-xl font-bold text-green-600 mt-1">₹{todayRevenue.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Collected Today</p>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="p-3 text-center">
            <Clock className="h-4 w-4 mx-auto text-red-600" />
            <p className="text-xl font-bold text-red-600 mt-1">₹{todayPending.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardContent className="p-3 text-center">
            <Percent className="h-4 w-4 mx-auto text-amber-600" />
            <p className="text-xl font-bold text-amber-600 mt-1">₹{todayDiscount.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Discounts</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardContent className="p-3 text-center">
            <Shield className="h-4 w-4 mx-auto text-blue-600" />
            <p className="text-xl font-bold text-blue-600 mt-1">₹{todayInsurance.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Insurance Claims</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="bills">Bills</TabsTrigger>
          <TabsTrigger value="pending">Pending Collections</TabsTrigger>
          <TabsTrigger value="insurance">Insurance / B2B</TabsTrigger>
        </TabsList>

        {/* Bills Tab */}
        <TabsContent value="bills" className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9 h-8 text-sm" placeholder="Search patient, bill no..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Partial">Partial</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" className="h-8 text-xs w-[130px]" defaultValue="2026-07-24" />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {/* Bill List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredBills.map((bill) => (
                <Card key={bill.id} className={`cursor-pointer transition hover:border-orange-300 ${selectedBill?.id === bill.id ? "border-orange-500 bg-orange-50" : ""}`} onClick={() => setSelectedBill(bill)}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{bill.patientName}</p>
                        <p className="text-[10px] text-muted-foreground">{bill.billNo} | {bill.billDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">₹{bill.netTotal.toLocaleString()}</p>
                        <Badge className={`text-[10px] ${getPaymentStatusColor(bill.paymentStatus)}`}>{bill.paymentStatus}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                      <span>{bill.items.length} test(s) | Ref: {bill.referredBy}</span>
                      {bill.dueAmount > 0 && <span className="text-red-600 font-medium">Due: ₹{bill.dueAmount.toLocaleString()}</span>}
                    </div>
                    {bill.insuranceClaimed && (
                      <Badge variant="outline" className="text-[9px] mt-1 text-blue-600 border-blue-200"><Shield className="h-2.5 w-2.5 mr-0.5" /> {bill.insuranceProvider}</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Bill Detail / Receipt */}
            <div>
              {!selectedBill ? (
                <Card><CardContent className="p-12 text-center text-muted-foreground">
                  <Receipt className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Select a bill to view details</p>
                </CardContent></Card>
              ) : (
                <Card>
                  <CardContent className="p-4 space-y-3">
                    {/* Receipt Header */}
                    <div className="border-b pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm text-green-700">AYUZEE DIAGNOSTICS</h4>
                          <p className="text-[10px] text-muted-foreground">#11, Main Road, Kadayanallur</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium">Bill No: {selectedBill.billNo}</p>
                          <p className="text-[10px] text-muted-foreground">{selectedBill.billDate}</p>
                        </div>
                      </div>
                    </div>

                    {/* Patient Info */}
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <p><span className="text-muted-foreground">Patient:</span> <strong>{selectedBill.patientName}</strong></p>
                      <p><span className="text-muted-foreground">ID:</span> {selectedBill.patientId}</p>
                      <p><span className="text-muted-foreground">Age/Gender:</span> {selectedBill.age}y / {selectedBill.gender}</p>
                      <p><span className="text-muted-foreground">Referred By:</span> {selectedBill.referredBy}</p>
                    </div>

                    {/* Items Table */}
                    <table className="w-full text-[11px] border">
                      <thead className="bg-gray-50">
                        <tr className="border-b">
                          <th className="px-2 py-1 text-left">Test</th>
                          <th className="px-2 py-1 text-right">Price</th>
                          <th className="px-2 py-1 text-right">Disc.</th>
                          <th className="px-2 py-1 text-right">Net</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedBill.items.map((item) => (
                          <tr key={item.id} className="border-b">
                            <td className="px-2 py-1">{item.testName} {item.isProfile && <Badge variant="outline" className="text-[8px] ml-1">Profile</Badge>}</td>
                            <td className="px-2 py-1 text-right">₹{item.price}</td>
                            <td className="px-2 py-1 text-right text-red-600">{item.discount > 0 ? `-₹${item.discount}` : "-"}</td>
                            <td className="px-2 py-1 text-right font-medium">₹{item.netAmount}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr className="border-b"><td className="px-2 py-1 text-right font-medium" colSpan={3}>Subtotal</td><td className="px-2 py-1 text-right">₹{selectedBill.subtotal}</td></tr>
                        {selectedBill.discountTotal > 0 && <tr className="border-b"><td className="px-2 py-1 text-right text-red-600" colSpan={3}>Discount</td><td className="px-2 py-1 text-right text-red-600">-₹{selectedBill.discountTotal}</td></tr>}
                        <tr className="border-b font-bold"><td className="px-2 py-1 text-right" colSpan={3}>Net Total</td><td className="px-2 py-1 text-right">₹{selectedBill.netTotal}</td></tr>
                        <tr className="border-b text-green-700"><td className="px-2 py-1 text-right" colSpan={3}>Paid</td><td className="px-2 py-1 text-right">₹{selectedBill.paidAmount}</td></tr>
                        {selectedBill.dueAmount > 0 && <tr className="text-red-700 font-bold"><td className="px-2 py-1 text-right" colSpan={3}>Balance Due</td><td className="px-2 py-1 text-right">₹{selectedBill.dueAmount}</td></tr>}
                      </tfoot>
                    </table>

                    {/* Payment Info */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Payment:</span>
                      {selectedBill.paymentMode && <Badge variant="outline" className="text-[10px]">{selectedBill.paymentMode}</Badge>}
                      <Badge className={`text-[10px] ${getPaymentStatusColor(selectedBill.paymentStatus)}`}>{selectedBill.paymentStatus}</Badge>
                      {selectedBill.insuranceClaimed && <Badge variant="outline" className="text-[10px] text-blue-600"><Shield className="h-2.5 w-2.5 mr-0.5" /> Insurance</Badge>}
                    </div>

                    {/* Collect Payment (if due) */}
                    {selectedBill.dueAmount > 0 && (
                      <div className="border border-amber-200 rounded p-3 bg-amber-50 space-y-2">
                        <p className="text-xs font-medium text-amber-700">Collect Payment (Due: ₹{selectedBill.dueAmount.toLocaleString()})</p>
                        <div className="flex gap-2">
                          <Input className="h-8 text-xs w-[100px]" type="number" placeholder="Amount" value={collectAmount} onChange={(e) => setCollectAmount(e.target.value)} />
                          <Select value={collectMode} onValueChange={setCollectMode}>
                            <SelectTrigger className="h-8 text-xs w-[100px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Cash">Cash</SelectItem>
                              <SelectItem value="Card">Card</SelectItem>
                              <SelectItem value="UPI">UPI</SelectItem>
                              <SelectItem value="Online">Online</SelectItem>
                              <SelectItem value="Cheque">Cheque</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700 text-xs" onClick={handleCollectPayment}>
                            <IndianRupee className="mr-1 h-3 w-3" /> Collect
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap pt-2 border-t">
                      <Button size="sm" variant="outline" className="text-xs" onClick={() => toast.success("Receipt printed")}><Printer className="mr-1 h-3 w-3" /> Print Receipt</Button>
                      <Button size="sm" variant="outline" className="text-xs" onClick={() => toast.info("PDF download started")}><Download className="mr-1 h-3 w-3" /> Download</Button>
                      <Button size="sm" variant="outline" className="text-xs" onClick={() => toast.info("Receipt sent via WhatsApp")}>WhatsApp</Button>
                      <Button size="sm" variant="outline" className="text-xs text-red-600" onClick={() => toast.warning("Refund initiated")}>Refund</Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Pending Collections Tab */}
        <TabsContent value="pending" className="space-y-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-600" /> Pending Collections</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left">Patient</th>
                    <th className="px-3 py-2 text-left">Bill No</th>
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-right">Total</th>
                    <th className="px-3 py-2 text-right">Paid</th>
                    <th className="px-3 py-2 text-right">Due</th>
                    <th className="px-3 py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.filter(b => b.dueAmount > 0).map((bill) => (
                    <tr key={bill.id} className="border-b">
                      <td className="px-3 py-2"><p className="font-medium">{bill.patientName}</p><p className="text-[10px] text-muted-foreground">{bill.patientPhone}</p></td>
                      <td className="px-3 py-2">{bill.billNo}</td>
                      <td className="px-3 py-2">{bill.billDate.split(" ")[0]}</td>
                      <td className="px-3 py-2 text-right">₹{bill.netTotal.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right text-green-600">₹{bill.paidAmount.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right text-red-600 font-bold">₹{bill.dueAmount.toLocaleString()}</td>
                      <td className="px-3 py-2 text-center">
                        <Button size="sm" className="h-6 text-[10px] bg-green-600 hover:bg-green-700" onClick={() => toast.success("Payment reminder sent")}>Remind</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-3 py-2 border-t bg-red-50 text-xs text-right">
                <span className="text-red-700 font-bold">Total Pending: ₹{bills.filter(b => b.dueAmount > 0).reduce((s, b) => s + b.dueAmount, 0).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insurance / B2B Tab */}
        <TabsContent value="insurance" className="space-y-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-blue-600" /> Insurance & B2B Claims</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left">Patient</th>
                    <th className="px-3 py-2 text-left">Provider</th>
                    <th className="px-3 py-2 text-left">Bill No</th>
                    <th className="px-3 py-2 text-right">Claim Amount</th>
                    <th className="px-3 py-2 text-center">Status</th>
                    <th className="px-3 py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.filter(b => b.insuranceClaimed).map((bill) => (
                    <tr key={bill.id} className="border-b">
                      <td className="px-3 py-2 font-medium">{bill.patientName}</td>
                      <td className="px-3 py-2">{bill.insuranceProvider}</td>
                      <td className="px-3 py-2">{bill.billNo}</td>
                      <td className="px-3 py-2 text-right font-bold">₹{(bill.insuranceAmount || 0).toLocaleString()}</td>
                      <td className="px-3 py-2 text-center"><Badge className="bg-amber-100 text-amber-700 text-[10px]">Submitted</Badge></td>
                      <td className="px-3 py-2 text-center">
                        <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => toast.info("Claim details opened")}>View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LabBilling;
