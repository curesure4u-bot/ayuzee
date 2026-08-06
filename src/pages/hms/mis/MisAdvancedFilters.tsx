import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar, Upload, Download, FileSpreadsheet, Brain, Sparkles,
  ArrowRight, Link2, Filter, Search, Clock, ChevronRight,
  BarChart3, TrendingUp, Eye, RefreshCw, Zap, Layers
} from "lucide-react";

const presetRanges = [
  { label: "Today", value: "today", from: "2026-07-22", to: "2026-07-22" },
  { label: "Yesterday", value: "yesterday", from: "2026-07-21", to: "2026-07-21" },
  { label: "Last 3 Days", value: "last-3", from: "2026-07-19", to: "2026-07-22" },
  { label: "This Week", value: "this-week", from: "2026-07-20", to: "2026-07-22" },
  { label: "Last Week", value: "last-week", from: "2026-07-13", to: "2026-07-19" },
  { label: "This Month", value: "this-month", from: "2026-07-01", to: "2026-07-22" },
  { label: "Last Month", value: "last-month", from: "2026-06-01", to: "2026-06-30" },
  { label: "This Quarter (Q3)", value: "this-quarter", from: "2026-07-01", to: "2026-09-30" },
  { label: "Last Quarter (Q2)", value: "last-quarter", from: "2026-04-01", to: "2026-06-30" },
  { label: "This Half Year", value: "this-half", from: "2026-07-01", to: "2026-12-31" },
  { label: "Last Half Year", value: "last-half", from: "2026-01-01", to: "2026-06-30" },
  { label: "This Financial Year", value: "this-fy", from: "2026-04-01", to: "2027-03-31" },
  { label: "Last Financial Year", value: "last-fy", from: "2025-04-01", to: "2026-03-31" },
  { label: "Custom Range", value: "custom", from: "", to: "" },
];

const interlinkMap = [
  { from: "Daily Summary", to: ["Income By Consultant", "Income By Dept", "Net Collection"], type: "drill-down" },
  { from: "Income By Consultant", to: ["Income By Patient", "Visits per Dr", "Incentive - Doctor wise"], type: "drill-down" },
  { from: "Income By Dept", to: ["Income By Dept/Group - Userwise", "Treatment Vs Issue"], type: "drill-down" },
  { from: "Net Collection", to: ["Consolidated Transaction - Type Wise", "Settlement - Postpaid"], type: "related" },
  { from: "Total Expense", to: ["Expense By Type", "Expense By Month", "PettyCash Vs Expense"], type: "drill-down" },
  { from: "Outstanding Due - All", to: ["Credit Bills - Pending", "Settlement - Due", "Franchise - Due"], type: "related" },
  { from: "Sale - Bill Wise", to: ["Sale - Product Wise", "Sale Margin", "Current Stock - Batchwise"], type: "drill-down" },
  { from: "Test Orders - By Date", to: ["TAT - By Test", "Results - Abnormal", "Lab Consumables"], type: "drill-down" },
  { from: "Registration", to: ["Checked-In - By Date", "Visits - By Type", "Income By Patient"], type: "patient-journey" },
  { from: "Visits per Dr", to: ["Income By Consultant", "Appointment Vs Checkin", "Dr Vs Treatment"], type: "related" },
  { from: "GRN", to: ["Credit Purchase - Pending", "Current Stock - Supplier Wise", "Purchase Tax Report"], type: "drill-down" },
  { from: "Expiry List", to: ["Short Expiry List", "Product Flow Analysis", "Stock Adjustment"], type: "action" },
];

const compareOptions = [
  { label: "Day vs Day", description: "Compare today vs yesterday or any two days" },
  { label: "Week vs Week", description: "This week vs last week performance" },
  { label: "Month vs Month", description: "Current month vs previous month" },
  { label: "Quarter vs Quarter", description: "Q3 vs Q2 comparison" },
  { label: "Year vs Year", description: "FY 2026-27 vs FY 2025-26" },
  { label: "Branch vs Branch", description: "Compare two branches side by side" },
  { label: "Doctor vs Doctor", description: "Compare consultant performance" },
  { label: "Department vs Department", description: "Cross-department analysis" },
];

const MisAdvancedFilters = () => {
  const [activeTab, setActiveTab] = useState("date-range");
  const [selectedRange, setSelectedRange] = useState("this-month");
  const [customFrom, setCustomFrom] = useState("2026-07-01");
  const [customTo, setCustomTo] = useState("2026-07-22");
  const [groupBy, setGroupBy] = useState("day");

  return (
    <div className="space-y-4 mt-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="date-range">Date Range & Grouping</TabsTrigger>
          <TabsTrigger value="import-export">Import / Export</TabsTrigger>
          <TabsTrigger value="interlink">Interlinked Reports</TabsTrigger>
          <TabsTrigger value="compare">Compare Reports</TabsTrigger>
        </TabsList>

        {/* DATE RANGE */}
        <TabsContent value="date-range" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" /> Quick Date Ranges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {presetRanges.map((r) => (
                  <Button key={r.value} size="sm"
                    variant={selectedRange === r.value ? "default" : "outline"}
                    className="text-xs h-8"
                    onClick={() => { setSelectedRange(r.value); if (r.from) { setCustomFrom(r.from); setCustomTo(r.to); } }}>
                    {r.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Custom Range */}
          <Card>
            <CardContent className="p-4">
              <div className="grid gap-4 sm:grid-cols-4 items-end">
                <div className="space-y-1">
                  <Label className="text-xs">From Date</Label>
                  <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">To Date</Label>
                  <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Group By</Label>
                  <Select value={groupBy} onValueChange={setGroupBy}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hour">Hourly</SelectItem>
                      <SelectItem value="day">Daily</SelectItem>
                      <SelectItem value="week">Weekly</SelectItem>
                      <SelectItem value="month">Monthly</SelectItem>
                      <SelectItem value="quarter">Quarterly</SelectItem>
                      <SelectItem value="year">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button><Filter className="mr-1 h-4 w-4" /> Generate Report</Button>
              </div>
            </CardContent>
          </Card>

          {/* Grouping Options */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Report Grouping & Aggregation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: "Day-wise Breakdown", desc: "Each day as separate row", icon: "📅" },
                  { label: "Week-wise Summary", desc: "Aggregated by week number", icon: "📆" },
                  { label: "Month-wise Summary", desc: "Monthly totals with trend", icon: "🗓️" },
                  { label: "Quarter-wise", desc: "Q1/Q2/Q3/Q4 comparison", icon: "📊" },
                  { label: "Year-wise", desc: "Annual comparison", icon: "📈" },
                  { label: "In-Between Days", desc: "Custom day range analysis", icon: "↔️" },
                ].map((opt, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded border hover:border-primary/50 cursor-pointer transition-colors">
                    <span className="text-lg">{opt.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Date Intelligence */}
          <Card className="border-primary/20">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <Brain className="h-4 w-4 text-primary mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-primary">AI Date Suggestions: </span>
                  Based on your usage, you most access: Daily Summary (daily), Income reports (weekly), 
                  Expense (monthly). Auto-generating these on schedule. Your peak revenue days: Mon & Thu.
                  Suggest comparing this Q3 vs last Q3 for seasonal analysis.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IMPORT / EXPORT */}
        <TabsContent value="import-export" className="space-y-4 mt-4">
          {/* Export Options */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Download className="h-4 w-4 text-green-600" /> Export Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Button variant="outline" className="h-auto py-3 flex-col gap-1 border-green-200 hover:bg-green-50">
                  <FileSpreadsheet className="h-6 w-6 text-green-600" />
                  <span className="text-xs font-medium">Export as CSV</span>
                  <span className="text-[10px] text-muted-foreground">Comma-separated values</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex-col gap-1 border-green-200 hover:bg-green-50">
                  <FileSpreadsheet className="h-6 w-6 text-green-700" />
                  <span className="text-xs font-medium">Export as Excel</span>
                  <span className="text-[10px] text-muted-foreground">.xlsx with formatting</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex-col gap-1 border-red-200 hover:bg-red-50">
                  <FileSpreadsheet className="h-6 w-6 text-red-600" />
                  <span className="text-xs font-medium">Export as PDF</span>
                  <span className="text-[10px] text-muted-foreground">Print-ready format</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex-col gap-1 border-blue-200 hover:bg-blue-50">
                  <FileSpreadsheet className="h-6 w-6 text-blue-600" />
                  <span className="text-xs font-medium">Tally Format</span>
                  <span className="text-[10px] text-muted-foreground">Tally-compatible XML</span>
                </Button>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label className="text-xs">Export Which Report</Label>
                  <Select defaultValue="current">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">Current Viewed Report</SelectItem>
                      <SelectItem value="all-collection">All Collection Reports</SelectItem>
                      <SelectItem value="all-accounts">All Accounts Reports</SelectItem>
                      <SelectItem value="all-stocks">All Stock Reports</SelectItem>
                      <SelectItem value="full-mis">Complete MIS Package</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Date Range</Label>
                  <Select defaultValue="this-month">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {presetRanges.slice(0, 10).map(r => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button className="w-full"><Download className="mr-1 h-4 w-4" /> Generate & Download</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Import */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Upload className="h-4 w-4 text-blue-600" /> Import Data (CSV/Excel)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Upload CSV or Excel file</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Import bank statements, supplier invoices, expense sheets, or historical data
                </p>
                <div className="mt-3 flex justify-center gap-2">
                  <Button size="sm"><Upload className="mr-1 h-4 w-4" /> Choose File</Button>
                  <Button size="sm" variant="outline">Download Template</Button>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Supported Import Types:</p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    "Bank Statement (PDF/CSV)", "Expense Sheet (Excel)", "Patient List (CSV)",
                    "Stock Inventory (Excel)", "Supplier Invoice (PDF/CSV)", "Historical Bills (CSV)",
                    "Tally Vouchers (XML)", "Insurance Claims (Excel)", "Payroll Data (CSV)"
                  ].map((t, i) => (
                    <Badge key={i} variant="outline" className="text-xs justify-start">{t}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Import Processing */}
          <Card className="border-primary/20">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-primary mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-primary">AI Import Intelligence: </span>
                  Uploaded files are auto-detected for format, columns auto-mapped, duplicates flagged, 
                  and data validated before import. AI suggests category assignments and reconciles with existing records.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* INTERLINKED REPORTS */}
        <TabsContent value="interlink" className="space-y-4 mt-4">
          <Card className="border-blue-100">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <Link2 className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-blue-700">Interlinked Reports: </span>
                  Click any report to drill-down into related sub-reports. AI shows contextual links 
                  based on what you're viewing. Every number is clickable — trace from summary → detail → individual transaction.
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" /> Report Drill-Down Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {interlinkMap.map((link, i) => (
                  <div key={i} className="p-3 rounded border hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-primary/10 text-primary text-xs">{link.from}</Badge>
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      <Badge variant="outline" className="text-[10px] capitalize">{link.type}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5 ml-4">
                      {link.to.map((target, j) => (
                        <Button key={j} size="sm" variant="secondary" className="text-[10px] h-5 px-2">
                          <ArrowRight className="mr-0.5 h-2.5 w-2.5" /> {target}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Drill-Down Example */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Example: Revenue Drill-Down Path</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <Badge className="bg-primary text-white">Daily Summary ₹60,700</Badge>
                <ChevronRight className="h-3 w-3" />
                <Badge variant="outline">By Consultant: Dr.Sivarama ₹19,000</Badge>
                <ChevronRight className="h-3 w-3" />
                <Badge variant="outline">By Patient: Rajesh ₹2,500</Badge>
                <ChevronRight className="h-3 w-3" />
                <Badge variant="outline">Bill #2145: OPD + Lab</Badge>
                <ChevronRight className="h-3 w-3" />
                <Badge variant="outline">Line Items: Consultation ₹500, CBC ₹800, Thyroid ₹1,200</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                Every number in every report is clickable. AI suggests the most relevant drill-down path based on context.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* COMPARE REPORTS */}
        <TabsContent value="compare" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" /> Compare & Benchmark
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {compareOptions.map((opt, i) => (
                  <Card key={i} className="cursor-pointer hover:border-primary/50 transition-colors">
                    <CardContent className="p-3">
                      <p className="text-sm font-medium">{opt.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{opt.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comparison Setup */}
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-medium mb-3">Set Up Comparison</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 items-end">
                <div className="space-y-1">
                  <Label className="text-xs">Report</Label>
                  <Select defaultValue="income">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Total Income</SelectItem>
                      <SelectItem value="collection">Net Collection</SelectItem>
                      <SelectItem value="expense">Total Expense</SelectItem>
                      <SelectItem value="visits">Visits</SelectItem>
                      <SelectItem value="sales">Pharmacy Sales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Period A</Label>
                  <Select defaultValue="this-month">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {presetRanges.slice(0, 10).map(r => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">vs Period B</Label>
                  <Select defaultValue="last-month">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {presetRanges.slice(0, 10).map(r => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Group By</Label>
                  <Select defaultValue="day">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Daily</SelectItem>
                      <SelectItem value="week">Weekly</SelectItem>
                      <SelectItem value="month">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button><TrendingUp className="mr-1 h-4 w-4" /> Compare</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MisAdvancedFilters;
