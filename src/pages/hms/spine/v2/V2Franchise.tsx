import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, IndianRupee, Users, TrendingUp, Target } from "lucide-react";

const branchData = [
  { branch: "Kadayanallur", patients: 124, revenue: 892000, margin: 62 },
  { branch: "Tirunelveli", patients: 89, revenue: 534000, margin: 58 },
  { branch: "Rajapalayam", patients: 71, revenue: 426000, margin: 55 },
  { branch: "Theni", patients: 43, revenue: 258000, margin: 60 },
  { branch: "Chennai", patients: 56, revenue: 392000, margin: 65 },
  { branch: "Tenkasi", patients: 18, revenue: 108000, margin: 52 },
];

const V2Franchise = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Building2 className="h-6 w-6 text-indigo-600" /> Franchise KPIs V2</h1>
          <p className="text-muted-foreground mt-1">Multi-branch performance with enhanced analytics</p>
        </div>
        <Badge className="bg-indigo-600">6 Branches</Badge>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-indigo-200"><CardContent className="p-4 text-center">
          <IndianRupee className="h-6 w-6 mx-auto text-green-600" />
          <p className="text-2xl font-bold mt-2">₹26.1L</p>
          <p className="text-xs text-muted-foreground">Total Revenue</p>
        </CardContent></Card>
        <Card className="border-indigo-200"><CardContent className="p-4 text-center">
          <Users className="h-6 w-6 mx-auto text-blue-600" />
          <p className="text-2xl font-bold mt-2">401</p>
          <p className="text-xs text-muted-foreground">Total Patients</p>
        </CardContent></Card>
        <Card className="border-indigo-200"><CardContent className="p-4 text-center">
          <TrendingUp className="h-6 w-6 mx-auto text-orange-600" />
          <p className="text-2xl font-bold mt-2">60%</p>
          <p className="text-xs text-muted-foreground">Avg Margin</p>
        </CardContent></Card>
        <Card className="border-indigo-200"><CardContent className="p-4 text-center">
          <Target className="h-6 w-6 mx-auto text-purple-600" />
          <p className="text-2xl font-bold mt-2">84%</p>
          <p className="text-xs text-muted-foreground">Success Rate</p>
        </CardContent></Card>
      </div>

      {/* Branch Table */}
      <Card>
        <CardHeader><CardTitle>Branch Performance</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Branch</th>
                <th className="text-right py-2">Patients</th>
                <th className="text-right py-2">Revenue</th>
                <th className="text-right py-2">Margin</th>
              </tr>
            </thead>
            <tbody>
              {branchData.map((b) => (
                <tr key={b.branch} className="border-b">
                  <td className="py-3 font-medium">{b.branch}</td>
                  <td className="py-3 text-right">{b.patients}</td>
                  <td className="py-3 text-right">₹{(b.revenue/100000).toFixed(1)}L</td>
                  <td className="py-3 text-right"><Badge variant="outline">{b.margin}%</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default V2Franchise;