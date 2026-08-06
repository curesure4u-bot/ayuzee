import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  BarChart3, TrendingUp, IndianRupee, Users, Download,
  FileText, Calendar, Filter, FlaskConical, Building2,
  Stethoscope, Clock, Target, Printer, RefreshCw,
} from "lucide-react";

interface MISMetric {
  label: string;
  value: string;
  change: number;
  trend: "up" | "down" | "flat";
}

interface RevenueByTest {
  testName: string;
  count: number;
  revenue: number;
  avgPrice: number;
  percentOfTotal: number;
}

interface RevenueByDoctor {
  doctorName: string;
  referrals: number;
  revenue: number;
  commission: number;
  topTest: string;
}

interface DepartmentPerformance {
  department: string;
  tests: number;
  revenue: number;
  avgTAT: string;
  tatCompliance: number;
  qcPass: number;
}

interface LocationPerformance {
  location: string;
  tests: number;
  revenue: number;
  patients: number;
  avgBillValue: number;
}

const mockMetrics: MISMetric[] = [
  { label: "Total Revenue (Jul)", value: "₹8,45,000", change: 12.5, trend: "up" },
  { label: "Total Tests (Jul)", value: "2,340", change: 8.2, trend: "up" },
  { label: "Unique Patients", value: "1,125", change: 5.1, trend: "up" },
  { label: "Avg Bill Value", value: "₹752", change: -2.3, trend: "down" },
  { label: "Collection Rate", value: "92.4%", change: 1.8, trend: "up" },
  { label: "TAT Compliance", value: "89.7%", change: 3.5, trend: "up" },
];

const mockRevenueByTest: RevenueByTest[] = [
  { testName: "Complete Blood Count", count: 420, revenue: 189000, avgPrice: 450, percentOfTotal: 22.4 },
  { testName: "Thyroid Profile", count: 185, revenue: 148000, avgPrice: 800, percentOfTotal: 17.5 },
  { testName: "Lipid Profile", count: 210, revenue: 126000, avgPrice: 600, percentOfTotal: 14.9 },
  { testName: "Renal Function Test", count: 140, revenue: 119000, avgPrice: 850, percentOfTotal: 14.1 },
  { testName: "Liver Function Test", count: 135, revenue: 101250, avgPrice: 750, percentOfTotal: 12.0 },
  { testName: "HbA1c", count: 165, revenue: 82500, avgPrice: 500, percentOfTotal: 9.8 },
  { testName: "Blood Sugar (F/PP)", count: 310, revenue: 55800, avgPrice: 180, percentOfTotal: 6.6 },
  { testName: "Vitamin D", count: 35, revenue: 42000, avgPrice: 1200, percentOfTotal: 5.0 },
];

const mockRevenueByDoctor: RevenueByDoctor[] = [
  { doctorName: "Dr. Mohamad Saleem", referrals: 156, revenue: 245000, commission: 36750, topTest: "RFT" },
  { doctorName: "Dr. Anitha Kumari", referrals: 89, revenue: 178000, commission: 21360, topTest: "Thyroid" },
  { doctorName: "Dr. Ramesh Babu", referrals: 45, revenue: 112000, commission: 11200, topTest: "Lipid" },
  { doctorName: "Dr. Priya Nair", referrals: 32, revenue: 48000, commission: 3200, topTest: "CBC" },
  { doctorName: "Walk-in (Self)", referrals: 520, revenue: 262000, commission: 0, topTest: "CBC" },
];

const mockDeptPerformance: DepartmentPerformance[] = [
  { department: "BIOCHEMISTRY", tests: 1250, revenue: 520000, avgTAT: "2.1 Hrs", tatCompliance: 91, qcPass: 98.5 },
  { department: "HAEMATOLOGY", tests: 620, revenue: 185000, avgTAT: "1.5 Hrs", tatCompliance: 95, qcPass: 99.2 },
  { department: "MICROBIOLOGY", tests: 85, revenue: 127500, avgTAT: "72 Hrs", tatCompliance: 88, qcPass: 97.0 },
  { department: "CLINICAL PATHOLOGY", tests: 280, revenue: 42000, avgTAT: "45 Min", tatCompliance: 97, qcPass: 99.5 },
  { department: "RADIOLOGY", tests: 105, revenue: 168000, avgTAT: "3.2 Hrs", tatCompliance: 85, qcPass: 100 },
];

const mockLocationPerf: LocationPerformance[] = [
  { location: "Kadayanallur (Main)", tests: 1450, revenue: 520000, patients: 680, avgBillValue: 765 },
  { location: "Rajapalayam", tests: 520, revenue: 186000, patients: 245, avgBillValue: 759 },
  { location: "Tenkasi", tests: 280, revenue: 98000, patients: 140, avgBillValue: 700 },
  { location: "Sankarankovil (CC)", tests: 90, revenue: 41000, patients: 60, avgBillValue: 683 },
];

const MISReports = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("this-month");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2"><BarChart3 className="h-5 w-5" /> MIS & Custom Reports</h2>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}><SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="today">Today</SelectItem><SelectItem value="this-week">This Week</SelectItem><SelectItem value="this-month">This Month</SelectItem><SelectItem value="last-month">Last Month</SelectItem><SelectItem value="quarter">This Quarter</SelectItem><SelectItem value="year">This Year</SelectItem><SelectItem value="custom">Custom Range</SelectItem></SelectContent></Select>
          <Button size="sm" variant="outline" className="h-8 text-xs"><Download className="mr-1 h-3 w-3" /> Export Excel</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {mockMetrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-3 text-center">
              <p className="text-[10px] text-muted-foreground">{metric.label}</p>
              <p className="text-lg font-bold mt-0.5">{metric.value}</p>
              <p className={`text-[10px] font-medium ${metric.trend === "up" ? "text-green-600" : metric.trend === "down" ? "text-red-600" : "text-gray-500"}`}>{metric.trend === "up" ? "↑" : metric.trend === "down" ? "↓" : "→"} {Math.abs(metric.change)}%</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="overview">Revenue by Test</TabsTrigger><TabsTrigger value="doctors">By Doctor</TabsTrigger><TabsTrigger value="department">By Department</TabsTrigger><TabsTrigger value="location">By Location</TabsTrigger></TabsList>

        {/* Revenue by Test */}
        <TabsContent value="overview" className="space-y-3">
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-b"><tr><th className="px-3 py-2 text-left">Test Name</th><th className="px-3 py-2 text-right">Count</th><th className="px-3 py-2 text-right">Revenue</th><th className="px-3 py-2 text-right">Avg Price</th><th className="px-3 py-2 text-right">% of Total</th><th className="px-3 py-2 text-left w-[150px]">Share</th></tr></thead>
              <tbody>
                {mockRevenueByTest.map((test) => (
                  <tr key={test.testName} className="border-b">
                    <td className="px-3 py-2 font-medium">{test.testName}</td>
                    <td className="px-3 py-2 text-right">{test.count}</td>
                    <td className="px-3 py-2 text-right font-bold text-green-600">₹{(test.revenue / 1000).toFixed(0)}K</td>
                    <td className="px-3 py-2 text-right">₹{test.avgPrice}</td>
                    <td className="px-3 py-2 text-right">{test.percentOfTotal}%</td>
                    <td className="px-3 py-2"><div className="h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-green-500 rounded-full" style={{ width: `${test.percentOfTotal * 4}%` }} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        {/* By Doctor */}
        <TabsContent value="doctors" className="space-y-3">
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-b"><tr><th className="px-3 py-2 text-left">Doctor</th><th className="px-3 py-2 text-right">Referrals</th><th className="px-3 py-2 text-right">Revenue</th><th className="px-3 py-2 text-right">Commission</th><th className="px-3 py-2 text-left">Top Test</th><th className="px-3 py-2 text-left w-[120px]">Contribution</th></tr></thead>
              <tbody>
                {mockRevenueByDoctor.map((doc) => (
                  <tr key={doc.doctorName} className="border-b">
                    <td className="px-3 py-2 font-medium">{doc.doctorName}</td>
                    <td className="px-3 py-2 text-right">{doc.referrals}</td>
                    <td className="px-3 py-2 text-right font-bold text-green-600">₹{(doc.revenue / 1000).toFixed(0)}K</td>
                    <td className="px-3 py-2 text-right text-purple-600">₹{(doc.commission / 1000).toFixed(1)}K</td>
                    <td className="px-3 py-2"><Badge variant="outline" className="text-[9px]">{doc.topTest}</Badge></td>
                    <td className="px-3 py-2"><div className="h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${(doc.revenue / 845000) * 100}%` }} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        {/* By Department */}
        <TabsContent value="department" className="space-y-3">
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-b"><tr><th className="px-3 py-2 text-left">Department</th><th className="px-3 py-2 text-right">Tests</th><th className="px-3 py-2 text-right">Revenue</th><th className="px-3 py-2 text-right">Avg TAT</th><th className="px-3 py-2 text-right">TAT %</th><th className="px-3 py-2 text-right">QC Pass %</th></tr></thead>
              <tbody>
                {mockDeptPerformance.map((dept) => (
                  <tr key={dept.department} className="border-b">
                    <td className="px-3 py-2 font-medium">{dept.department}</td>
                    <td className="px-3 py-2 text-right">{dept.tests}</td>
                    <td className="px-3 py-2 text-right font-bold text-green-600">₹{(dept.revenue / 1000).toFixed(0)}K</td>
                    <td className="px-3 py-2 text-right">{dept.avgTAT}</td>
                    <td className="px-3 py-2 text-right"><span className={dept.tatCompliance >= 90 ? "text-green-600" : "text-amber-600"}>{dept.tatCompliance}%</span></td>
                    <td className="px-3 py-2 text-right"><span className={dept.qcPass >= 98 ? "text-green-600" : "text-amber-600"}>{dept.qcPass}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        {/* By Location */}
        <TabsContent value="location" className="space-y-3">
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-b"><tr><th className="px-3 py-2 text-left">Location</th><th className="px-3 py-2 text-right">Tests</th><th className="px-3 py-2 text-right">Revenue</th><th className="px-3 py-2 text-right">Patients</th><th className="px-3 py-2 text-right">Avg Bill</th><th className="px-3 py-2 text-left w-[120px]">Share</th></tr></thead>
              <tbody>
                {mockLocationPerf.map((loc) => (
                  <tr key={loc.location} className="border-b">
                    <td className="px-3 py-2 font-medium">{loc.location}</td>
                    <td className="px-3 py-2 text-right">{loc.tests}</td>
                    <td className="px-3 py-2 text-right font-bold text-green-600">₹{(loc.revenue / 1000).toFixed(0)}K</td>
                    <td className="px-3 py-2 text-right">{loc.patients}</td>
                    <td className="px-3 py-2 text-right">₹{loc.avgBillValue}</td>
                    <td className="px-3 py-2"><div className="h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-purple-500 rounded-full" style={{ width: `${(loc.revenue / 845000) * 100}%` }} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MISReports;
