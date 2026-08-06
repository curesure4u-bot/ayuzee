import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Upload, FileSpreadsheet, FileText, Brain, Sparkles, CheckCircle2,
  XCircle, AlertTriangle, Clock, Search, IndianRupee, RefreshCw,
  Download, Eye, Zap, ArrowRight, Link2, Shield, ScanLine
} from "lucide-react";

type ParsedTransaction = {
  id: string;
  date: string;
  description: string;
  refNo: string;
  credit: number;
  debit: number;
  balance: number;
  aiCategory: string;
  aiConfidence: number;
  matchedBill?: string;
  matchedPatient?: string;
  matchStatus: "matched" | "partial" | "unmatched" | "mismatch";
  autoReconciled: boolean;
};

const sampleParsedTransactions: ParsedTransaction[] = [
  { id: "1", date: "2026-07-21", description: "UPI/426789123456/RAJESH KUMAR/SBI", refNo: "UPI426789123456", credit: 2500, debit: 0, balance: 487500, aiCategory: "Patient Payment - OPD", aiConfidence: 95, matchedBill: "BILL-2145", matchedPatient: "Rajesh Kumar", matchStatus: "matched", autoReconciled: true },
  { id: "2", date: "2026-07-21", description: "UPI/426789234567/SUNITA DEVI/HDFC", refNo: "UPI426789234567", credit: 1800, debit: 0, balance: 489300, aiCategory: "Patient Payment - Pharmacy", aiConfidence: 92, matchedBill: "BILL-2146", matchedPatient: "Sunita Devi", matchStatus: "matched", autoReconciled: true },
  { id: "3", date: "2026-07-21", description: "UPI/426789345678/MOHAMMED ALI/ICICI", refNo: "UPI426789345678", credit: 5200, debit: 0, balance: 494500, aiCategory: "Patient Payment - IPD", aiConfidence: 88, matchedBill: "BILL-2147", matchedPatient: "Mohammed Ali", matchStatus: "matched", autoReconciled: true },
  { id: "4", date: "2026-07-21", description: "NEFT/HDFC87654321/LAKSHMI N", refNo: "HDFC87654321", credit: 12500, debit: 0, balance: 507000, aiCategory: "Patient Payment - Pending", aiConfidence: 72, matchedBill: "BILL-2148", matchedPatient: "Lakshmi Narayan", matchStatus: "partial", autoReconciled: false },
  { id: "5", date: "2026-07-21", description: "UPI/426789456789/PRIYA S/BOB", refNo: "UPI426789456789", credit: 3400, debit: 0, balance: 510400, aiCategory: "Patient Payment - OPD", aiConfidence: 90, matchedBill: "BILL-2149", matchedPatient: "Priya Sharma", matchStatus: "matched", autoReconciled: true },
  { id: "6", date: "2026-07-21", description: "POS/VISA****4321/DEEPA MENON", refNo: "VIS98765432", credit: 8200, debit: 0, balance: 518600, aiCategory: "Patient Payment - Card", aiConfidence: 85, matchedBill: "BILL-2151", matchedPatient: "Deepa Menon", matchStatus: "matched", autoReconciled: true },
  { id: "7", date: "2026-07-21", description: "SALARY/JUL/KUMAR_RECEPTION", refNo: "SAL202607", credit: 0, debit: 22000, balance: 496600, aiCategory: "Expense - Staff Salary", aiConfidence: 98, matchStatus: "matched", autoReconciled: true },
  { id: "8", date: "2026-07-21", description: "NEFT/HIMALAYA WELLNESS PVT LTD", refNo: "NEFT998877", credit: 0, debit: 45000, balance: 451600, aiCategory: "Expense - Medicine Purchase", aiConfidence: 96, matchStatus: "matched", autoReconciled: true },
  { id: "9", date: "2026-07-21", description: "UPI/UNKNOWN/9876543210/SBI", refNo: "UPI999888777", credit: 4500, debit: 0, balance: 456100, aiCategory: "Unknown - Needs Review", aiConfidence: 35, matchStatus: "unmatched", autoReconciled: false },
  { id: "10", date: "2026-07-20", description: "UPI/426788111222/RAVI PATEL/SBI", refNo: "UPI426788111222", credit: 4000, debit: 0, balance: 451600, aiCategory: "Patient Payment - OPD", aiConfidence: 78, matchedBill: "BILL-2139", matchedPatient: "Ravi Patel", matchStatus: "mismatch", autoReconciled: false },
];

type UploadState = "idle" | "uploading" | "parsing" | "matching" | "done";

const BankStatementAI = () => {
  const [uploadState, setUploadState] = useState<UploadState>("done");
  const [selectedFile, setSelectedFile] = useState<string | null>("SBI_Statement_Jul2026.pdf");
  const [transactions, setTransactions] = useState(sampleParsedTransactions);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("parsed");

  const matched = transactions.filter(t => t.matchStatus === "matched").length;
  const partial = transactions.filter(t => t.matchStatus === "partial").length;
  const unmatched = transactions.filter(t => t.matchStatus === "unmatched").length;
  const mismatches = transactions.filter(t => t.matchStatus === "mismatch").length;
  const autoReconciled = transactions.filter(t => t.autoReconciled).length;
  const totalCredits = transactions.reduce((s, t) => s + t.credit, 0);
  const totalDebits = transactions.reduce((s, t) => s + t.debit, 0);

  const filtered = transactions.filter(t => {
    if (filterStatus === "matched") return t.matchStatus === "matched";
    if (filterStatus === "unmatched") return t.matchStatus === "unmatched" || t.matchStatus === "partial";
    if (filterStatus === "mismatch") return t.matchStatus === "mismatch";
    return true;
  });

  const simulateUpload = () => {
    setUploadState("uploading");
    setTimeout(() => setUploadState("parsing"), 1500);
    setTimeout(() => setUploadState("matching"), 3000);
    setTimeout(() => setUploadState("done"), 4500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Bank Statement Reconciliation
          </h2>
          <p className="text-sm text-muted-foreground">
            Upload PDF/Excel bank statements — AI auto-parses, categorizes & matches with HMS bills
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline"><Download className="mr-1 h-4 w-4" /> Export Report</Button>
          <Button size="sm" disabled={selectedItems.length === 0}>
            <CheckCircle2 className="mr-1 h-4 w-4" /> Approve Selected ({selectedItems.length})
          </Button>
        </div>
      </div>

      {/* Upload Section */}
      <Card className="border-dashed border-2 border-primary/30">
        <CardContent className="p-6">
          {uploadState === "idle" ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-medium">Upload Bank Statement</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Supports PDF (scanned/digital), Excel (.xlsx/.xls), CSV formats
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Button onClick={simulateUpload}>
                  <FileText className="mr-2 h-4 w-4" /> Upload PDF
                </Button>
                <Button variant="outline" onClick={simulateUpload}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Upload Excel/CSV
                </Button>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" /> SBI</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" /> HDFC</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" /> ICICI</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" /> Axis</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" /> BOB</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" /> Indian Bank</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" /> Any Bank</span>
              </div>
            </div>
          ) : uploadState === "done" ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">{selectedFile}</p>
                  <p className="text-xs text-muted-foreground">{transactions.length} transactions parsed · {autoReconciled} auto-reconciled</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setUploadState("idle"); setSelectedFile(null); }}>
                  <RefreshCw className="mr-1 h-4 w-4" /> Upload New
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 animate-pulse">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {uploadState === "uploading" && "Uploading statement..."}
                    {uploadState === "parsing" && "AI parsing transactions (OCR for PDF)..."}
                    {uploadState === "matching" && "Matching with HMS bills & categorizing..."}
                  </p>
                  <Progress value={uploadState === "uploading" ? 33 : uploadState === "parsing" ? 66 : 90} className="mt-2 h-2" />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs text-center">
                <div className={`p-2 rounded ${uploadState === "uploading" ? "bg-primary/10 text-primary font-medium" : "bg-green-50 text-green-700"}`}>
                  1. Upload
                </div>
                <div className={`p-2 rounded ${uploadState === "parsing" ? "bg-primary/10 text-primary font-medium" : uploadState === "matching" ? "bg-green-50 text-green-700" : "bg-muted"}`}>
                  2. AI Parse (OCR)
                </div>
                <div className={`p-2 rounded ${uploadState === "matching" ? "bg-primary/10 text-primary font-medium" : "bg-muted"}`}>
                  3. Auto-Match
                </div>
                <div className="p-2 rounded bg-muted">4. Reconcile</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Insights */}
      {uploadState === "done" && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-primary">AI Reconciliation Summary</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                  <div className="p-2 rounded bg-green-50 text-center">
                    <p className="font-bold text-green-700">{matched}</p>
                    <p className="text-xs text-green-600">Auto-Matched</p>
                  </div>
                  <div className="p-2 rounded bg-amber-50 text-center">
                    <p className="font-bold text-amber-700">{partial}</p>
                    <p className="text-xs text-amber-600">Partial Match</p>
                  </div>
                  <div className="p-2 rounded bg-gray-50 text-center">
                    <p className="font-bold text-gray-700">{unmatched}</p>
                    <p className="text-xs text-gray-600">Unmatched</p>
                  </div>
                  <div className="p-2 rounded bg-red-50 text-center">
                    <p className="font-bold text-red-700">{mismatches}</p>
                    <p className="text-xs text-red-600">Amount Mismatch</p>
                  </div>
                </div>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <p>• ₹4,500 credit from unknown UPI — AI suggests: new patient walk-in or advance payment</p>
                  <p>• Ravi Patel (BILL-2139): System shows ₹4,500 but bank received ₹4,000 — ₹500 short</p>
                  <p>• Lakshmi Narayan NEFT partially matches BILL-2148 (amount correct, name fuzzy match 72%)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      {uploadState === "done" && (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Total Credits</p>
              <p className="font-display text-lg font-bold text-green-600">₹{totalCredits.toLocaleString("en-IN")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Total Debits</p>
              <p className="font-display text-lg font-bold text-red-600">₹{totalDebits.toLocaleString("en-IN")}</p>
            </CardContent>
          </Card>
          <Card className="border-green-200">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Auto-Reconciled</p>
              <p className="font-display text-lg font-bold text-green-600">{autoReconciled}/{transactions.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">AI Confidence Avg</p>
              <p className="font-display text-lg font-bold text-primary">
                {Math.round(transactions.reduce((s, t) => s + t.aiConfidence, 0) / transactions.length)}%
              </p>
            </CardContent>
          </Card>
          <Card className="border-amber-200">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Needs Review</p>
              <p className="font-display text-lg font-bold text-amber-600">{partial + unmatched + mismatches}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Parsed Transactions */}
      {uploadState === "done" && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="parsed">All Transactions ({transactions.length})</TabsTrigger>
            <TabsTrigger value="needs-review">Needs Review ({partial + unmatched + mismatches})</TabsTrigger>
            <TabsTrigger value="auto-categorized">AI Categories</TabsTrigger>
            <TabsTrigger value="settings">AI Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="parsed" className="space-y-4 mt-4">
            <div className="flex items-center gap-3">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="matched">Matched</SelectItem>
                  <SelectItem value="unmatched">Unmatched</SelectItem>
                  <SelectItem value="mismatch">Mismatch</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Search description, ref#, patient..." className="max-w-sm" />
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        <th className="px-3 py-2 w-8"><Checkbox /></th>
                        <th className="px-3 py-2 text-left font-medium">Date</th>
                        <th className="px-3 py-2 text-left font-medium">Description</th>
                        <th className="px-3 py-2 text-right font-medium">Credit</th>
                        <th className="px-3 py-2 text-right font-medium">Debit</th>
                        <th className="px-3 py-2 text-left font-medium">AI Category</th>
                        <th className="px-3 py-2 text-left font-medium">Matched To</th>
                        <th className="px-3 py-2 text-center font-medium">Confidence</th>
                        <th className="px-3 py-2 text-center font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((t) => (
                        <tr key={t.id} className={`border-b hover:bg-muted/30 ${
                          t.matchStatus === "mismatch" ? "bg-red-50/30" :
                          t.matchStatus === "unmatched" ? "bg-amber-50/30" : ""
                        }`}>
                          <td className="px-3 py-2">
                            <Checkbox
                              checked={selectedItems.includes(t.id)}
                              onCheckedChange={() => setSelectedItems(prev =>
                                prev.includes(t.id) ? prev.filter(x => x !== t.id) : [...prev, t.id]
                              )}
                            />
                          </td>
                          <td className="px-3 py-2 text-xs">{t.date}</td>
                          <td className="px-3 py-2">
                            <p className="font-medium text-xs truncate max-w-[200px]">{t.description}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{t.refNo}</p>
                          </td>
                          <td className="px-3 py-2 text-right font-semibold text-green-600">
                            {t.credit > 0 ? `₹${t.credit.toLocaleString("en-IN")}` : "—"}
                          </td>
                          <td className="px-3 py-2 text-right font-semibold text-red-600">
                            {t.debit > 0 ? `₹${t.debit.toLocaleString("en-IN")}` : "—"}
                          </td>
                          <td className="px-3 py-2">
                            <Badge variant="outline" className="text-[10px]">{t.aiCategory}</Badge>
                          </td>
                          <td className="px-3 py-2 text-xs">
                            {t.matchedBill ? (
                              <div>
                                <span className="font-medium">{t.matchedBill}</span>
                                {t.matchedPatient && <p className="text-[10px] text-muted-foreground">{t.matchedPatient}</p>}
                              </div>
                            ) : <span className="text-muted-foreground">—</span>}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <Badge className={`text-[10px] ${
                              t.aiConfidence >= 90 ? "bg-green-100 text-green-700" :
                              t.aiConfidence >= 70 ? "bg-amber-100 text-amber-700" :
                              "bg-red-100 text-red-700"
                            }`}>
                              {t.aiConfidence}%
                            </Badge>
                          </td>
                          <td className="px-3 py-2 text-center">
                            {t.matchStatus === "matched" && <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />}
                            {t.matchStatus === "partial" && <AlertTriangle className="h-4 w-4 text-amber-500 mx-auto" />}
                            {t.matchStatus === "unmatched" && <XCircle className="h-4 w-4 text-gray-400 mx-auto" />}
                            {t.matchStatus === "mismatch" && <XCircle className="h-4 w-4 text-red-500 mx-auto" />}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="needs-review" className="space-y-3 mt-4">
            {transactions.filter(t => t.matchStatus !== "matched").map((t) => (
              <Card key={t.id} className={t.matchStatus === "mismatch" ? "border-red-200" : "border-amber-200"}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className={t.matchStatus === "mismatch" ? "bg-red-100 text-red-700" : t.matchStatus === "partial" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700"}>
                          {t.matchStatus}
                        </Badge>
                        <span className="font-medium text-sm">{t.description}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{t.date}</span>
                        <span>Ref: {t.refNo}</span>
                        <span>Amount: {t.credit > 0 ? `₹${t.credit.toLocaleString("en-IN")} (Cr)` : `₹${t.debit.toLocaleString("en-IN")} (Dr)`}</span>
                      </div>
                      <div className="mt-2 p-2 rounded bg-primary/5 text-xs">
                        <span className="font-medium text-primary">AI Suggestion: </span>
                        {t.matchStatus === "mismatch" && `Amount mismatch with ${t.matchedBill}. Bank: ₹${t.credit.toLocaleString("en-IN")}, HMS: ₹4,500. Possible partial payment.`}
                        {t.matchStatus === "partial" && `Name fuzzy-matched to ${t.matchedPatient} (${t.aiConfidence}% confidence). Verify manually.`}
                        {t.matchStatus === "unmatched" && "No matching bill found. Could be advance payment or walk-in. Create new income entry?"}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-xs h-7">Manual Match</Button>
                      <Button size="sm" className="text-xs h-7">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Approve
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="auto-categorized" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" /> AI Auto-Categorization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { category: "Patient Payment - OPD", count: 4, total: 15600, color: "bg-green-100 text-green-700" },
                    { category: "Patient Payment - IPD", count: 1, total: 5200, color: "bg-blue-100 text-blue-700" },
                    { category: "Patient Payment - Pharmacy", count: 1, total: 1800, color: "bg-purple-100 text-purple-700" },
                    { category: "Patient Payment - Card", count: 1, total: 8200, color: "bg-indigo-100 text-indigo-700" },
                    { category: "Expense - Staff Salary", count: 1, total: 22000, color: "bg-red-100 text-red-700" },
                    { category: "Expense - Medicine Purchase", count: 1, total: 45000, color: "bg-orange-100 text-orange-700" },
                    { category: "Unknown - Needs Review", count: 1, total: 4500, color: "bg-gray-100 text-gray-700" },
                  ].map((cat, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded border">
                      <div className="flex items-center gap-3">
                        <Badge className={cat.color}>{cat.category}</Badge>
                        <span className="text-xs text-muted-foreground">{cat.count} transactions</span>
                      </div>
                      <span className="font-semibold text-sm">₹{cat.total.toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  AI learns from your corrections. The more you verify, the smarter it gets. Current model accuracy: 89%.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">AI Reconciliation Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded border">
                      <div>
                        <p className="text-sm font-medium">Auto-Reconcile Threshold</p>
                        <p className="text-xs text-muted-foreground">Min confidence for auto-approval</p>
                      </div>
                      <Input type="number" defaultValue="85" className="w-20 text-center" />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded border">
                      <div>
                        <p className="text-sm font-medium">Name Fuzzy Match Tolerance</p>
                        <p className="text-xs text-muted-foreground">Allow partial name matches</p>
                      </div>
                      <Input type="number" defaultValue="70" className="w-20 text-center" />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded border">
                      <div>
                        <p className="text-sm font-medium">Amount Mismatch Tolerance (₹)</p>
                        <p className="text-xs text-muted-foreground">Ignore small differences</p>
                      </div>
                      <Input type="number" defaultValue="50" className="w-20 text-center" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded border">
                      <div>
                        <p className="text-sm font-medium">Supported Banks</p>
                        <p className="text-xs text-muted-foreground">PDF format detection</p>
                      </div>
                      <Badge>All Indian Banks</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded border">
                      <div>
                        <p className="text-sm font-medium">OCR Engine</p>
                        <p className="text-xs text-muted-foreground">For scanned PDF statements</p>
                      </div>
                      <Badge className="bg-primary/10 text-primary">AI Vision Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded border">
                      <div>
                        <p className="text-sm font-medium">Auto-Upload Schedule</p>
                        <p className="text-xs text-muted-foreground">Pull from email/API</p>
                      </div>
                      <Select defaultValue="daily">
                        <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How it works */}
            <Card className="border-blue-100">
              <CardContent className="p-4">
                <p className="font-medium text-sm mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-600" /> How AI Bank Reconciliation Works
                </p>
                <div className="grid gap-2 sm:grid-cols-5 text-xs text-center">
                  <div className="p-3 rounded bg-blue-50 space-y-1">
                    <Upload className="h-5 w-5 mx-auto text-blue-600" />
                    <p className="font-semibold">Upload</p>
                    <p className="text-muted-foreground">PDF/Excel/CSV</p>
                  </div>
                  <div className="p-3 rounded bg-blue-50 space-y-1">
                    <ScanLine className="h-5 w-5 mx-auto text-blue-600" />
                    <p className="font-semibold">OCR Parse</p>
                    <p className="text-muted-foreground">Extract all txns</p>
                  </div>
                  <div className="p-3 rounded bg-blue-50 space-y-1">
                    <Brain className="h-5 w-5 mx-auto text-blue-600" />
                    <p className="font-semibold">AI Categorize</p>
                    <p className="text-muted-foreground">Income/Expense/Type</p>
                  </div>
                  <div className="p-3 rounded bg-blue-50 space-y-1">
                    <Link2 className="h-5 w-5 mx-auto text-blue-600" />
                    <p className="font-semibold">Auto-Match</p>
                    <p className="text-muted-foreground">HMS Bills & Patients</p>
                  </div>
                  <div className="p-3 rounded bg-blue-50 space-y-1">
                    <Shield className="h-5 w-5 mx-auto text-blue-600" />
                    <p className="font-semibold">Reconcile</p>
                    <p className="text-muted-foreground">1-click approval</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default BankStatementAI;
