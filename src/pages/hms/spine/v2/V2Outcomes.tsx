import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, TrendingUp, Target, BarChart3 } from "lucide-react";

const V2Outcomes = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Activity className="h-6 w-6 text-teal-600" /> Outcomes & Tracking V2</h1>
          <p className="text-muted-foreground mt-1">Enhanced tracking with AI predictions</p>
        </div>
        <Badge className="bg-teal-600">Analytics</Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center">
          <TrendingUp className="h-6 w-6 mx-auto text-green-600" />
          <p className="text-2xl font-bold mt-2">84%</p>
          <p className="text-xs text-muted-foreground">Success Rate</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Target className="h-6 w-6 mx-auto text-blue-600" />
          <p className="text-2xl font-bold mt-2">68%</p>
          <p className="text-xs text-muted-foreground">Avg Pain Reduction</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <BarChart3 className="h-6 w-6 mx-auto text-purple-600" />
          <p className="text-2xl font-bold mt-2">7 days</p>
          <p className="text-xs text-muted-foreground">Avg Time to Relief</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Activity className="h-6 w-6 mx-auto text-orange-600" />
          <p className="text-2xl font-bold mt-2">92%</p>
          <p className="text-xs text-muted-foreground">Hit 50%+ Improvement</p>
        </CardContent></Card>
      </div>

      {/* Outcome by Condition */}
      <Card>
        <CardHeader><CardTitle>Outcome by Condition</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            { name: "Gridhrasi (Sciatica)", rate: 87 },
            { name: "Greeva Stambha (Cervical)", rate: 85 },
            { name: "Kati Shoola (Low Back Pain)", rate: 82 },
            { name: "Disc Herniation", rate: 78 },
          ].map((c) => (
            <div key={c.name}>
              <div className="flex justify-between text-sm mb-1">
                <span>{c.name}</span>
                <span className="font-bold">{c.rate}%</span>
              </div>
              <Progress value={c.rate} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default V2Outcomes;