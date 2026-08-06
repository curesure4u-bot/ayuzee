import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FlaskConical, FileSpreadsheet, Printer, Brain, Clock, Users,
  AlertTriangle, CheckCircle2, BarChart3
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const testOrderCategories = [
  { label: "By Date", items: ["All"], color: "bg-teal-600" },
  { label: "By Test", items: ["Test - Granular", "Test", "Test - Consolidated"], color: "bg-teal-700" },
  { label: "By Department", items: ["All"], color: "bg-green-600" },
  { label: "By Category", items: ["All"], color: "bg-green-700" },
  { label: "By Patient", items: ["All"], color: "bg-blue-600" },
  { label: "By Consultant", items: ["By Test", "By Samples", "By Patient", "By Department"], color: "bg-blue-700" },
  { label: "By Credit Provider", items: ["By Test", "By Samples", "By Patient", "By Department"], color: "bg-purple-600" },
  { label: "By Runnr", items: ["By Test", "By Samples", "By Patient", "By Department"], color: "bg-purple-700" },
  { label: "By Phlebo", items: ["By Test", "By Samples", "By Patient", "By Department"], color: "bg-indigo-600" },
  { label: "By Marketing Executives", items: ["By Test", "By Samples", "By Patient", "By Department"], color: "bg-indigo-700" },
  { label: "By Completed", items: ["By Test"], color: "bg-emerald-600" },
  { label: "By Visit", items: ["By OP", "By IP"], color: "bg-emerald-700" },
  { label: "By Machine", items: ["All"], color: "bg-cyan-600" },
  { label: "Sample Archival", items: ["All"], color: "bg-cyan-700" },
  { label: "By Referred Out", items: ["All"], color: "bg-sky-600" },
  { label: "By Referred In", items: ["All"], color: "bg-sky-700" },
  { label: "Outsourced", items: ["All"], color: "bg-amber-600" },
  { label: "Lab Consumables", items: ["Department", "Test", "Test Vs Consumables", "Product", "Reagent"], color: "bg-amber-700" },
  { label: "TAT", items: ["By Test", "By Dept", "By Order"], color: "bg-orange-600" },
  { label: "Delayed", items: ["All"], color: "bg-red-600" },
  { label: "Cancelled orders", items: ["All"], color: "bg-red-700" },
  { label: "Not Performed orders", items: ["All"], color: "bg-gray-600" },
  { label: "Rejected orders", items: ["All"], color: "bg-gray-700" },
  { label: "Results", items: ["Abnormal", "Critical"], color: "bg-rose-600" },
  { label: "Emergency", items: ["By Date", "TAT By Test", "TAT By Dept"], color: "bg-rose-700" },
  { label: "ReTest", items: ["All"], color: "bg-pink-600" },
  { label: "Processed Test Count", items: ["All"], color: "bg-pink-700" },
];

const orderRequestReports = [
  { label: "By Provider", color: "bg-teal-600" },
  { label: "By Runnr", color: "bg-teal-700" },
  { label: "Home Collection", color: "bg-green-600" },
  { label: "By Phlebo", color: "bg-green-700" },
];

const tatData = [
  { dept: "Biochemistry", avgTAT: 1.2, target: 2 },
  { dept: "Hematology", avgTAT: 0.8, target: 1.5 },
  { dept: "Microbiology", avgTAT: 24, target: 24 },
  { dept: "Pathology", avgTAT: 3.5, target: 4 },
  { dept: "Serology", avgTAT: 2.1, target: 3 },
];

const MisTestOrders = () => {
  const [selectedCategory, setSelectedCategory] = useState("By Date");
  const [selectedReport, setSelectedReport] = useState("All");

  return (
    <div className="space-y-4 mt-4">
      {/* AI Insight */}
      <Card className="border-primary/20">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <Brain className="h-4 w-4 text-primary mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-primary">AI Lab Intelligence: </span>
              Today: 42 orders, 38 completed, 3 pending, 1 rejected. Avg TAT: 1.8hrs (within SLA).
              2 critical results flagged for Dr. Sivarama. Biochemistry workload 35% above normal.
              Reagent stock for CBC: 3 days remaining - auto reorder triggered.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Order Categories */}
      <Card>
        <CardContent className="p-3">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Test Orders</p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {testOrderCategories.slice(0, 14).map((cat) => (
              <Button key={cat.label} size="sm"
                variant={selectedCategory === cat.label ? "default" : "outline"}
                className={`text-[10px] h-6 px-2 ${selectedCategory === cat.label ? cat.color + " text-white border-0" : ""}`}
                onClick={() => { setSelectedCategory(cat.label); setSelectedReport(cat.items[0]); }}>
                {cat.label} {cat.items.length > 1 && "▾"}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {testOrderCategories.slice(14).map((cat) => (
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

      {/* Order Request */}
      <Card>
        <CardContent className="p-3">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Order Request</p>
          <div className="flex flex-wrap gap-2">
            {orderRequestReports.map((r) => (
              <Button key={r.label} size="sm" variant="outline" className="text-xs h-7">{r.label}</Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sub-reports */}
      {testOrderCategories.find(c => c.label === selectedCategory)?.items.length! > 1 && (
        <Card>
          <CardContent className="p-3">
            <div className="flex flex-wrap gap-2">
              {testOrderCategories.find(c => c.label === selectedCategory)?.items.map((r) => (
                <Button key={r} size="sm" variant={selectedReport === r ? "default" : "secondary"} className="text-xs h-6"
                  onClick={() => setSelectedReport(r)}>{r}</Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export & Title */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Test Orders - {selectedCategory} - {selectedReport}</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="text-xs h-7 bg-green-50 text-green-700 border-green-200">
            <FileSpreadsheet className="mr-1 h-3 w-3" /> Export CSV
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-7 bg-green-50 text-green-700 border-green-200">
            <FileSpreadsheet className="mr-1 h-3 w-3" /> Export Excel
          </Button>
        </div>
      </div>

      {/* TAT Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium">Department TAT (Avg Hours) vs Target</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={tatData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dept" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="avgTAT" fill="#f97316" name="Avg TAT (hrs)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" fill="#e5e7eb" name="Target (hrs)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sample Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-2 py-2 text-left font-medium text-primary">S.No</th>
                  <th className="px-2 py-2 text-left font-medium text-primary">Location</th>
                  <th className="px-2 py-2 text-left font-medium text-primary">Order No.</th>
                  <th className="px-2 py-2 text-left font-medium text-primary">Order Date</th>
                  <th className="px-2 py-2 text-left font-medium text-primary">Bill No</th>
                  <th className="px-2 py-2 text-left font-medium text-primary">ID</th>
                  <th className="px-2 py-2 text-left font-medium text-primary">Name</th>
                  <th className="px-2 py-2 text-left font-medium text-primary">Age</th>
                  <th className="px-2 py-2 text-left font-medium text-primary">Gender</th>
                  <th className="px-2 py-2 text-left font-medium text-primary">Test</th>
                  <th className="px-2 py-2 text-left font-medium text-primary">Dept</th>
                  <th className="px-2 py-2 text-left font-medium text-primary">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { loc: "Kadayanallur", orderNo: "LAB-4521", date: "22/07/2026 09:15", bill: "B-2145", id: "P001", name: "Rajesh Kumar", age: 45, gender: "M", test: "CBC + ESR", dept: "Hematology", status: "Completed" },
                  { loc: "Kadayanallur", orderNo: "LAB-4522", date: "22/07/2026 09:30", bill: "B-2146", id: "P002", name: "Sunita Devi", age: 38, gender: "F", test: "Thyroid Profile", dept: "Biochemistry", status: "Completed" },
                  { loc: "Kadayanallur", orderNo: "LAB-4523", date: "22/07/2026 10:00", bill: "B-2147", id: "P003", name: "Mohammed Ali", age: 52, gender: "M", test: "LFT + KFT", dept: "Biochemistry", status: "Pending" },
                ].map((row, i) => (
                  <tr key={i} className="border-b hover:bg-muted/30">
                    <td className="px-2 py-2">{i + 1}</td>
                    <td className="px-2 py-2">{row.loc}</td>
                    <td className="px-2 py-2 font-mono">{row.orderNo}</td>
                    <td className="px-2 py-2">{row.date}</td>
                    <td className="px-2 py-2">{row.bill}</td>
                    <td className="px-2 py-2">{row.id}</td>
                    <td className="px-2 py-2 font-medium">{row.name}</td>
                    <td className="px-2 py-2">{row.age}</td>
                    <td className="px-2 py-2">{row.gender}</td>
                    <td className="px-2 py-2">{row.test}</td>
                    <td className="px-2 py-2">{row.dept}</td>
                    <td className="px-2 py-2">
                      <Badge className={row.status === "Completed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                        {row.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MisTestOrders;
