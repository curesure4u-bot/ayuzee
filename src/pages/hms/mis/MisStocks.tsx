import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pill, FileSpreadsheet, Printer, Brain, AlertTriangle,
  TrendingUp, Package, Warehouse, BarChart3, Loader2
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useMisStock, generateAiStockSummary, type MisStockFilters } from "@/hooks/useMisStock";

const stockCategories = [
  { label: "Schedule", items: ["Schedule Register", "Schedule Register H", "Schedule Register H1"], color: "bg-teal-600" },
  { label: "Net Collection", items: ["Split By User"], color: "bg-teal-700" },
  { label: "Sale", items: ["Bill Wise", "Bill Wise - Detailed", "Advance", "Date Wise", "Product Wise", "Tax Wise", "Discount Wise", "Discounted Bills - Optical Advance", "Patient Wise", "Patient Type Wise", "Consultant Wise", "Payment Type Wise", "Manufacturer Bill Wise", "Sale Margin"], color: "bg-green-600" },
  { label: "Sale Return", items: ["Return", "Return Wise - Detailed", "Return Product Wise", "Return Date Wise"], color: "bg-green-700" },
  { label: "IP Closed Bills", items: ["All"], color: "bg-blue-600" },
  { label: "Advance Pending", items: ["Pending", "Pending Cumulative"], color: "bg-amber-600" },
  { label: "Expense", items: ["Total Expense", "Expense By Month", "Expense By Type", "Expense By Consultant", "Edited Expense", "Expense TDS", "PettyCash Vs Expense", "PettyCash"], color: "bg-orange-600" },
  { label: "Removed Expenses", items: ["All"], color: "bg-red-500" },
  { label: "Outstanding Due", items: ["By Date", "All", "Written Off"], color: "bg-amber-700" },
  { label: "Purchase", items: ["Quotations", "Quotations Detailed", "PO", "Pending PO - Product wise", "GRN", "GRN Detailed", "GRN - Date Wise", "GRN - Manufacturer Wise", "GRN - Supplier Wise", "GRN - Product Wise", "GRN - Product Batch Wise", "GReturn", "Supplier Level Margin", "Product Level Margin"], color: "bg-purple-600" },
  { label: "Indent", items: ["Indent (From Store)", "GDN", "GDN Detailed", "Received Indent", "Received Indent Detailed", "Transit List", "Indent (To Store)", "Indent Detailed (To Store)", "Indent Consolidated Product (To Store)"], color: "bg-indigo-600" },
  { label: "Return Indent", items: ["Created List", "Transit List"], color: "bg-indigo-700" },
  { label: "Issue", items: ["Created Issue", "Created Issue Detailed", "Cancelled Issue", "Edited Issue"], color: "bg-blue-700" },
  { label: "Issue Margin", items: ["Product Wise", "Bill Wise"], color: "bg-blue-800" },
  { label: "Stock Adjustment", items: ["All"], color: "bg-gray-600" },
  { label: "Current Stock", items: ["Batchwise", "Stock Value", "Consolidated", "Manufacturer Wise", "Supplier Wise", "Pharmacological Name Wise", "Category Wise", "Indication Wise", "By Date", "By Tray"], color: "bg-emerald-600" },
  { label: "ReOrder List", items: ["All"], color: "bg-lime-600" },
  { label: "Expiry", items: ["Expiry List", "Expiry List By Date", "Short Expiry List", "Expired List"], color: "bg-red-600" },
  { label: "Product Flow Analysis", items: ["All", "All - By Value", "Job Log"], color: "bg-cyan-600" },
  { label: "Edited List", items: ["Sale Bill", "Return Bill", "GRN", "GDN"], color: "bg-gray-700" },
  { label: "Discounted Bills", items: ["Bills", "Advance Opticals", "Bulk Discount Log"], color: "bg-pink-600" },
  { label: "Currency Rate", items: ["View"], color: "bg-lime-700" },
  { label: "Cancelled List", items: ["Sale Bill", "Return Bill", "Purchase Order", "Goods Received Note", "Goods Returned Note", "GDN", "Return Indent"], color: "bg-red-700" },
  { label: "Removed Counter Bills", items: ["Sale Bill", "Return Bill"], color: "bg-red-800" },
  { label: "Credit Bills", items: ["Pending", "Pending - Cumulative", "Pending - Cumulative PatientWise", "Settled", "Settled - Receipt wise", "Cancelled"], color: "bg-blue-600" },
  { label: "Settlement", items: ["Postpaid", "Settled", "Cancelled", "Cancelled Receipt"], color: "bg-purple-700" },
  { label: "Credit Purchase", items: ["Pending", "Pending - Cumulative", "Settled", "Settled - Receipt wise", "Cancelled"], color: "bg-violet-600" },
  { label: "Analysis", items: ["Fast Moving Products", "Slow Moving Products", "Non Moving Products"], color: "bg-sky-600" },
  { label: "VAT Report", items: ["Sale Bill wise", "Sales Return Date wise", "Sales Return Bill wise"], color: "bg-rose-600" },
  { label: "Purchase VAT Report", items: ["Purchase VAT", "Purchase Return VAT"], color: "bg-rose-700" },
  { label: "Sales Tax Report", items: ["Sale Date wise", "Sale Bill Item wise", "Sale Bill wise", "Sale HSN wise", "Sales Return Date wise", "Sales Return Bill Item wise", "Sales Return Bill wise", "Sales Return HSN wise"], color: "bg-amber-600" },
  { label: "Issue Tax Report", items: ["Issue Date wise", "Issue Bill Item wise", "Issue Bill wise"], color: "bg-amber-700" },
  { label: "Purchase Tax Report", items: ["Purchase Bill Item wise", "Purchase Bill wise", "Purchase HSN wise", "Purchase Return Bill Item wise", "Purchase Return Bill wise", "Purchase Return HSN wise"], color: "bg-orange-700" },
  { label: "Unavailable Medicine", items: ["All"], color: "bg-gray-500" },
];

interface MisStocksProps {
  location?: string;
}

const MisStocks = ({ location }: MisStocksProps) => {
  const [selectedCategory, setSelectedCategory] = useState("Sale");
  const [selectedReport, setSelectedReport] = useState("Bill Wise");
  const [selectedStore, setSelectedStore] = useState<string | undefined>(undefined);

  const filters: MisStockFilters = {
    location: location || "all",
    store: selectedStore,
  };

  const { storeValues, reorderItems, expiryItems, summary, loading, error } = useMisStock(filters);

  return (
    <div className="space-y-4 mt-4">
      {/* AI Insight */}
      <Card className="border-primary/20">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <Brain className="h-4 w-4 text-primary mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-primary">AI Stock Intelligence: </span>
              {loading ? "Analyzing stock data..." : generateAiStockSummary(summary)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center justify-center py-4 text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-xs">Loading stock data...</span>
        </div>
      )}

      {/* Error banner */}
      {error && !loading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-2 text-xs text-amber-700">
            ⚠ Could not load live data (showing cached/demo). {error}
          </CardContent>
        </Card>
      )}

      {/* Store Selection */}
      <Card>
        <CardContent className="p-3">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Choose Store for Report</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={!selectedStore ? "default" : "outline"} className="text-xs h-7"
              onClick={() => setSelectedStore(undefined)}>
              Show All
            </Button>
            {storeValues.map((s) => (
              <Button key={s.store} size="sm"
                variant={selectedStore === s.store ? "default" : "outline"}
                className="text-xs h-7 text-primary"
                onClick={() => setSelectedStore(s.store)}>
                {s.store}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-sm font-bold text-primary">₹{(summary.totalStockValue / 100000).toFixed(1)}L</p>
            <p className="text-[10px] text-muted-foreground">Total Stock Value</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-sm font-bold">{summary.totalProducts}</p>
            <p className="text-[10px] text-muted-foreground">Total Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-sm font-bold text-red-600">{summary.belowReorderCount}</p>
            <p className="text-[10px] text-muted-foreground">Below Reorder</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-sm font-bold text-amber-600">{summary.expiringIn30Days}</p>
            <p className="text-[10px] text-muted-foreground">Expiring (30d)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-sm font-bold text-orange-600">₹{(summary.expiringValue / 1000).toFixed(1)}K</p>
            <p className="text-[10px] text-muted-foreground">Expiry Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Buttons - scrollable rows */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {stockCategories.slice(0, 12).map((cat) => (
              <Button key={cat.label} size="sm"
                variant={selectedCategory === cat.label ? "default" : "outline"}
                className={`text-[10px] h-6 px-2 ${selectedCategory === cat.label ? cat.color + " text-white border-0" : ""}`}
                onClick={() => { setSelectedCategory(cat.label); setSelectedReport(cat.items[0]); }}>
                {cat.label} {cat.items.length > 1 && "▾"}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {stockCategories.slice(12, 24).map((cat) => (
              <Button key={cat.label} size="sm"
                variant={selectedCategory === cat.label ? "default" : "outline"}
                className={`text-[10px] h-6 px-2 ${selectedCategory === cat.label ? cat.color + " text-white border-0" : ""}`}
                onClick={() => { setSelectedCategory(cat.label); setSelectedReport(cat.items[0]); }}>
                {cat.label} {cat.items.length > 1 && "▾"}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {stockCategories.slice(24).map((cat) => (
              <Button key={cat.label} size="sm"
                variant={selectedCategory === cat.label ? "default" : "outline"}
                className={`text-[10px] h-6 px-2 ${selectedCategory === cat.label ? cat.color + " text-white border-0" : ""}`}
                onClick={() => { setSelectedCategory(cat.label); setSelectedReport(cat.items[0]); }}>
                {cat.label} {cat.items.length > 1 && "▾"}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sub-reports */}
      {stockCategories.find(c => c.label === selectedCategory)?.items && (
        <Card>
          <CardContent className="p-3">
            <p className="text-xs font-semibold text-muted-foreground mb-2">{selectedCategory}:</p>
            <div className="flex flex-wrap gap-2">
              {stockCategories.find(c => c.label === selectedCategory)?.items.map((r) => (
                <Button key={r} size="sm" variant={selectedReport === r ? "default" : "secondary"} className="text-xs h-6"
                  onClick={() => setSelectedReport(r)}>
                  {r}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export & Title */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">{selectedCategory} - {selectedReport}</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="text-xs h-7 bg-green-50 text-green-700 border-green-200">
            <FileSpreadsheet className="mr-1 h-3 w-3" /> Export CSV
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-7 bg-green-50 text-green-700 border-green-200">
            <FileSpreadsheet className="mr-1 h-3 w-3" /> Export Excel
          </Button>
        </div>
      </div>

      {/* Stock Value Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium">Stock Value by Store</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={storeValues} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v/100000).toFixed(1)}L`} />
              <YAxis type="category" dataKey="store" tick={{ fontSize: 10 }} width={130} />
              <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
              <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Reorder Alerts Table */}
      {reorderItems.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-red-500" /> Reorder Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-primary">S.No</th>
                    <th className="px-3 py-2 text-left font-medium text-primary">Product</th>
                    <th className="px-3 py-2 text-left font-medium text-primary">Store</th>
                    <th className="px-3 py-2 text-left font-medium text-primary">Category</th>
                    <th className="px-3 py-2 text-right font-medium text-primary">Current Qty</th>
                    <th className="px-3 py-2 text-right font-medium text-primary">Min Level</th>
                    <th className="px-3 py-2 text-right font-medium text-primary">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reorderItems.slice(0, 10).map((item, i) => (
                    <tr key={i} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2">{i + 1}</td>
                      <td className="px-3 py-2 font-medium">{item.productName}</td>
                      <td className="px-3 py-2">{item.store}</td>
                      <td className="px-3 py-2">{item.category}</td>
                      <td className="px-3 py-2 text-right text-red-600 font-semibold">{item.currentQty}</td>
                      <td className="px-3 py-2 text-right">{item.minLevel}</td>
                      <td className="px-3 py-2 text-right">
                        <Badge variant="destructive" className="text-[10px]">Low</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expiry Alerts Table */}
      {expiryItems.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Expiry Alerts (30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-primary">S.No</th>
                    <th className="px-3 py-2 text-left font-medium text-primary">Product</th>
                    <th className="px-3 py-2 text-left font-medium text-primary">Batch</th>
                    <th className="px-3 py-2 text-left font-medium text-primary">Store</th>
                    <th className="px-3 py-2 text-right font-medium text-primary">Qty</th>
                    <th className="px-3 py-2 text-right font-medium text-primary">Value</th>
                    <th className="px-3 py-2 text-right font-medium text-primary">Days Left</th>
                  </tr>
                </thead>
                <tbody>
                  {expiryItems.slice(0, 10).map((item, i) => (
                    <tr key={i} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2">{i + 1}</td>
                      <td className="px-3 py-2 font-medium">{item.productName}</td>
                      <td className="px-3 py-2">{item.batch}</td>
                      <td className="px-3 py-2">{item.store}</td>
                      <td className="px-3 py-2 text-right">{item.quantity}</td>
                      <td className="px-3 py-2 text-right">₹{item.value.toLocaleString("en-IN")}</td>
                      <td className="px-3 py-2 text-right">
                        <Badge variant={item.daysUntilExpiry <= 7 ? "destructive" : "outline"}
                          className="text-[10px]">
                          {item.daysUntilExpiry}d
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MisStocks;
