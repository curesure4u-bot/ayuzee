import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Building2, TrendingUp, IndianRupee, Users,
  Target, Brain, BarChart3, Download,
  Stethoscope, Info,
} from "lucide-react";

const HmsBranchPerformance = () => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.toLocaleString("en-US", { month: "long" })} ${now.getFullYear()}`;
  });
  const [selectedBranch, setSelectedBranch] = useState("all");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-orange-600" /> Branch Performance Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Target vs Achievement · Weekly · Category · Doctor-wise
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={selectedMonth}>{selectedMonth}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => toast.info("No data to export yet")}><Download className="mr-1 h-4 w-4" /> Export</Button>
        </div>
      </div>

      {/* Overall Summary Cards (empty) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="border-orange-200 bg-orange-50/30">
          <CardContent className="p-3 text-center">
            <Target className="h-5 w-5 mx-auto text-orange-600" />
            <p className="text-lg font-bold mt-1 text-muted-foreground">—</p>
            <p className="text-xs text-muted-foreground">Month Target</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <IndianRupee className="h-5 w-5 mx-auto text-green-600" />
            <p className="text-lg font-bold mt-1 text-muted-foreground">—</p>
            <p className="text-xs text-muted-foreground">Achieved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <BarChart3 className="h-5 w-5 mx-auto text-blue-600" />
            <p className="text-lg font-bold mt-1 text-muted-foreground">—</p>
            <p className="text-xs text-muted-foreground">Achievement %</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Users className="h-5 w-5 mx-auto text-purple-600" />
            <p className="text-lg font-bold mt-1 text-muted-foreground">—</p>
            <p className="text-xs text-muted-foreground">Total OP (Drs)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Building2 className="h-5 w-5 mx-auto text-teal-600" />
            <p className="text-lg font-bold mt-1 text-muted-foreground">0</p>
            <p className="text-xs text-muted-foreground">Active Branches</p>
          </CardContent>
        </Card>
      </div>

      {/* Empty State Notice */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="py-10 text-center space-y-4">
          <Info className="h-12 w-12 text-blue-500 mx-auto" />
          <h2 className="text-xl font-semibold">No Performance Data Available</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            This dashboard will display branch-wise targets, weekly breakdowns, category analysis, and doctor performance once you configure your branches and set monthly targets.
          </p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>To get started:</p>
            <p>1. Add your branches in <strong>Hospital Profile</strong></p>
            <p>2. Set monthly targets in <strong>Master Settings → Targets</strong></p>
            <p>3. Data populates automatically from daily billing</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="branches">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
          <TabsTrigger value="branches">Branch Summary</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Breakdown</TabsTrigger>
          <TabsTrigger value="categories">Category Analysis</TabsTrigger>
          <TabsTrigger value="doctors">Doctor Performance</TabsTrigger>
        </TabsList>

        {/* Branch Summary Tab */}
        <TabsContent value="branches" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base text-center text-orange-600">MONTH OVER ALL SUMMARY</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50"><tr>
                    <th className="px-3 py-2 text-left font-medium">SL.NO</th>
                    <th className="px-3 py-2 text-left font-medium">BRANCH NAME</th>
                    <th className="px-3 py-2 text-right font-medium">TOTAL TARGET</th>
                    <th className="px-3 py-2 text-right font-medium">ACTUAL SALES</th>
                    <th className="px-3 py-2 text-right font-medium">DIFFERENCE</th>
                    <th className="px-3 py-2 text-center font-medium">1st week</th>
                    <th className="px-3 py-2 text-center font-medium">2nd week</th>
                    <th className="px-3 py-2 text-center font-medium">3rd week</th>
                    <th className="px-3 py-2 text-center font-medium">4th week</th>
                    <th className="px-3 py-2 text-center font-medium">MONTHLY %</th>
                  </tr></thead>
                  <tbody>
                    <tr>
                      <td colSpan={10} className="px-3 py-8 text-center text-muted-foreground">
                        No branch data available. Set up branches and targets to see performance here.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weekly Breakdown Tab */}
        <TabsContent value="weekly" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Weekly Target vs Achievement</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                Weekly breakdown will appear once branches and targets are configured.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Category Analysis Tab */}
        <TabsContent value="categories" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Category-wise Performance</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50"><tr>
                    <th className="px-3 py-2 text-left font-medium">Category</th>
                    <th className="px-3 py-2 text-center font-medium">Target</th>
                    <th className="px-3 py-2 text-center font-medium">Actual</th>
                    <th className="px-3 py-2 text-center font-medium">Achievement %</th>
                  </tr></thead>
                  <tbody>
                    <tr>
                      <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">
                        No category data available. Configure categories in Master Settings.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Doctor Performance Tab */}
        <TabsContent value="doctors" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Stethoscope className="h-4 w-4" /> Doctor-wise OP Consulting Performance</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50"><tr>
                    <th className="px-3 py-2 text-left font-medium">Doctor</th>
                    <th className="px-3 py-2 text-left font-medium">Branch</th>
                    <th className="px-3 py-2 text-center font-medium">OP Count</th>
                    <th className="px-3 py-2 text-center font-medium">Target</th>
                    <th className="px-3 py-2 text-center font-medium">Achievement</th>
                    <th className="px-3 py-2 text-center font-medium">Avg/Day</th>
                  </tr></thead>
                  <tbody>
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                        No doctor performance data available. Add doctors and start recording consultations.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Insight placeholder */}
      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-3 flex items-start gap-2">
          <Brain className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
          <div className="text-xs text-purple-700">
            <p className="font-medium">AI Performance Insight</p>
            <p className="mt-0.5">AI insights will appear here once sufficient performance data is available across your branches.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HmsBranchPerformance;
