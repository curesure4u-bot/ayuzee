import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Users, IndianRupee, Target, Building2, TrendingUp, Brain, Home } from "lucide-react";
import { Link } from "react-router-dom";

const V2Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Activity className="h-6 w-6 text-purple-600" /> Spine AYUSH V2</h1>
          <p className="text-muted-foreground mt-1">Next generation spine care dashboard</p>
        </div>
        <Badge variant="outline" className="text-purple-600 border-purple-300"><Brain className="h-3 w-3 mr-1" /> AI-Powered V2</Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center"><Users className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">401</p><p className="text-xs text-muted-foreground">Total Patients</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><IndianRupee className="h-5 w-5 mx-auto text-green-600" /><p className="text-lg font-bold mt-1">₹26.1L</p><p className="text-xs text-muted-foreground">Revenue</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Target className="h-5 w-5 mx-auto text-orange-600" /><p className="text-xl font-bold mt-1">84%</p><p className="text-xs text-muted-foreground">Success Rate</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Building2 className="h-5 w-5 mx-auto text-purple-600" /><p className="text-xl font-bold mt-1">6</p><p className="text-xs text-muted-foreground">Branches</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><TrendingUp className="h-5 w-5 mx-auto text-amber-500" /><p className="text-xl font-bold mt-1">4.7/5</p><p className="text-xs text-muted-foreground">Satisfaction</p></CardContent></Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link to="/hms/spine-ayush-v2/assessment">
          <Card className="hover:bg-muted/50 cursor-pointer transition">
            <CardContent className="p-4 text-center">
              <Brain className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <p className="font-medium">AI Assessment</p>
              <p className="text-xs text-muted-foreground">₹199 entry point</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/hms/spine-ayush-v2/examination">
          <Card className="hover:bg-muted/50 cursor-pointer transition">
            <CardContent className="p-4 text-center">
              <Activity className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <p className="font-medium">Examination</p>
              <p className="text-xs text-muted-foreground">7-System exam</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/hms/spine-ayush-v2/protocols">
          <Card className="hover:bg-muted/50 cursor-pointer transition">
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 mx-auto text-orange-600 mb-2" />
              <p className="font-medium">Protocols</p>
              <p className="text-xs text-muted-foreground">Treatment plans</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/hms/spine-ayush-v2/packages">
          <Card className="hover:bg-muted/50 cursor-pointer transition">
            <CardContent className="p-4 text-center">
              <IndianRupee className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <p className="font-medium">Packages</p>
              <p className="text-xs text-muted-foreground">Pricing & plans</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Other V2 Pages */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Link to="/hms/spine-ayush-v2/patients">
          <Card className="hover:bg-muted/50 cursor-pointer transition">
            <CardContent className="p-4"><p className="font-medium">Patient Management</p></CardContent>
          </Card>
        </Link>
        <Link to="/hms/spine-ayush-v2/outcomes">
          <Card className="hover:bg-muted/50 cursor-pointer transition">
            <CardContent className="p-4"><p className="font-medium">Outcomes & Tracking</p></CardContent>
          </Card>
        </Link>
        <Link to="/hms/spine-ayush-v2/franchise">
          <Card className="hover:bg-muted/50 cursor-pointer transition">
            <CardContent className="p-4"><p className="font-medium">Franchise KPIs</p></CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default V2Dashboard;