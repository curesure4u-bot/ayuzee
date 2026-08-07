import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3, Download, Loader2,
} from "lucide-react";
import { useLabMISReports } from "@/hooks/useLabMISReports";

const MISReports = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("this-month");

  const { metrics, revenueByTest, revenueByDoctor, deptPerformance, locationPerformance, loading, error } = useLabMISReports(dateRange);

  const maxRevenue = Math.max(...revenueByTest.map((t) => t.revenue), 1);
  const maxDrRevenue = Math.max(...revenueByDoctor.map((d) => d.revenue), 1);
  const maxLocRevenue = Math.max(...locationPerformance.map((l) => l.revenue), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2"><BarChart3 className="h-5 w-5" /> MIS & Custom Reports</h2>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}><SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="today">Today</SelectItem><SelectItem value="this-week">This Week</SelectItem><SelectItem value="this-month">This Month</SelectItem><SelectItem value="last-month">Last Month</SelectItem><SelectItem value="quarter">This Quarter</SelectItem><SelectItem value="year">This Year</SelectItem></SelectContent></Select>
          <Button size="sm" variant="outline" className="h-8 text-xs"><Download className="mr-1 h-3 w-3" /> Export Excel</Button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-4 text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Loading reports...</span>
        </div>
      )}

      {error && !loading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-2 text-xs text-amber-700">⚠ Could not load live data (showing demo). {error}</CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-3 text-center">
              <p className="text-[10px] text-muted-foreground">{metric.label}</p>
              <p className="text-lg font-bold mt-0.5">{metric.value}</p>
              {metric.change !== 0 && (
                <p className={`text-[10px] font-medium ${metric.trend === "up" ? "text-green-600" : metric.trend === "down" ? "text-red-600" : "text-gray-500"}`}>
                  {metric.trend === "up" ? "↑" : metric.trend === "down" ? "↓" : "→"} {Math.abs(metric.change)}%
                </p>
              )}
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
                {revenueByTest.map((test) => (
                  <tr key={test.testName} className="border-b">
                    <td className="px-3 py-2 font-medium">{test.testName}</td>
                    <td className="px-3 py-2 text-right">{test.count}</td>
                    <td className="px-3 py-2 text-right font-bold text-green-600">₹{(test.revenue / 1000).toFixed(0)}K</td>
                    <td className="px-3 py-2 text-right">₹{test.avgPrice}</td>
                    <td className="px-3 py-2 text-right">{test.percentOfTotal}%</td>
                    <td className="px-3 py-2"><div className="h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-green-500 rounded-full" style={{ width: `${(test.revenue / maxRevenue) * 100}%` }} /></div></td>
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
                {revenueByDoctor.map((doc) => (
                  <tr key={doc.doctorName} className="border-b">
                    <td className="px-3 py-2 font-medium">{doc.doctorName}</td>
                    <td className="px-3 py-2 text-right">{doc.referrals}</td>
                    <td className="px-3 py-2 text-right font-bold text-green-600">₹{(doc.revenue / 1000).toFixed(0)}K</td>
                    <td className="px-3 py-2 text-right text-purple-600">₹{(doc.commission / 1000).toFixed(1)}K</td>
                    <td className="px-3 py-2"><Badge variant="outline" className="text-[9px]">{doc.topTest}</Badge></td>
                    <td className="px-3 py-2"><div className="h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${(doc.revenue / maxDrRevenue) * 100}%` }} /></div></td>
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
              <thead className="bg-muted/50 border-b"><tr><th className="px-3 py-2 text-left">Department</th><th className="px-3 py-2 text-right">Tests</th><th className="px-3 py-2 text-right">Revenue</th><th className="px-3 py-2 text-right">Avg TAT</th><th className="px-3 py-2 text-right">TAT %</th><th className="px-3 py-2 text-right">Completed</th></tr></thead>
              <tbody>
                {deptPerformance.map((dept) => (
                  <tr key={dept.department} className="border-b">
                    <td className="px-3 py-2 font-medium">{dept.department}</td>
                    <td className="px-3 py-2 text-right">{dept.tests}</td>
                    <td className="px-3 py-2 text-right font-bold text-green-600">₹{(dept.revenue / 1000).toFixed(0)}K</td>
                    <td className="px-3 py-2 text-right">{dept.avgTAT}</td>
                    <td className="px-3 py-2 text-right"><span className={dept.tatCompliance >= 90 ? "text-green-600" : "text-amber-600"}>{dept.tatCompliance}%</span></td>
                    <td className="px-3 py-2 text-right">{dept.completedCount}</td>
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
                {locationPerformance.map((loc) => (
                  <tr key={loc.location} className="border-b">
                    <td className="px-3 py-2 font-medium">{loc.location}</td>
                    <td className="px-3 py-2 text-right">{loc.tests}</td>
                    <td className="px-3 py-2 text-right font-bold text-green-600">₹{(loc.revenue / 1000).toFixed(0)}K</td>
                    <td className="px-3 py-2 text-right">{loc.patients}</td>
                    <td className="px-3 py-2 text-right">₹{loc.avgBillValue}</td>
                    <td className="px-3 py-2"><div className="h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-purple-500 rounded-full" style={{ width: `${(loc.revenue / maxLocRevenue) * 100}%` }} /></div></td>
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
