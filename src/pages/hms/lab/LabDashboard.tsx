import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FlaskConical, Users, IndianRupee, Clock, AlertTriangle,
  CheckCircle2, Loader2, XCircle, TrendingUp, Brain,
  Home, Truck, BarChart3, Activity,
} from "lucide-react";
import type { LabDashboardStats } from "@/types/lab-hms";

const mockStats: LabDashboardStats = {
  newPatients: 12,
  returningPatients: 8,
  pendingAmount: 4500,
  totalOrdersToday: 47,
  completedToday: 32,
  pendingToday: 8,
  inProgressToday: 5,
  editedToday: 2,
  cancelledToday: 0,
  discountedToday: 3,
  avgTAT: "2.5 Hrs",
  criticalAlerts: 2,
  outsourcePending: 4,
  homeCollectionScheduled: 3,
};

const LabDashboard = () => {
  const [stats] = useState<LabDashboardStats>(mockStats);
  const [location, setLocation] = useState("loc1");

  return (
    <div className="space-y-6">
      {/* Location Selector */}
      <div className="flex items-center gap-3">
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="w-[280px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem>
            <SelectItem value="loc2">PACR SALAI, Rajapalayam</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Patient Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 mx-auto text-blue-600" />
            <p className="text-sm text-muted-foreground mt-1">New Patients</p>
            <p className="text-3xl font-bold text-blue-600">{stats.newPatients}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 mx-auto text-green-600" />
            <p className="text-sm text-muted-foreground mt-1">Returning Patients</p>
            <p className="text-3xl font-bold text-green-600">{stats.returningPatients}</p>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="p-4 text-center">
            <IndianRupee className="h-5 w-5 mx-auto text-red-600" />
            <p className="text-sm text-muted-foreground mt-1">Pending Amount</p>
            <p className="text-3xl font-bold text-red-600">₹{stats.pendingAmount.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-5 w-5 mx-auto text-purple-600" />
            <p className="text-sm text-muted-foreground mt-1">Avg TAT</p>
            <p className="text-3xl font-bold text-purple-600">{stats.avgTAT}</p>
          </CardContent>
        </Card>
      </div>

      {/* Order Status Row */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        <Card><CardContent className="p-3 text-center"><FlaskConical className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">{stats.totalOrdersToday}</p><p className="text-xs text-muted-foreground">Total Orders</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><CheckCircle2 className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold mt-1 text-green-600">{stats.completedToday}</p><p className="text-xs text-muted-foreground">Completed</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><Loader2 className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold mt-1 text-amber-600">{stats.pendingToday}</p><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Activity className="h-4 w-4 mx-auto text-blue-500" /><p className="text-xl font-bold mt-1">{stats.inProgressToday}</p><p className="text-xs text-muted-foreground">In Progress</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><XCircle className="h-4 w-4 mx-auto text-red-500" /><p className="text-xl font-bold mt-1 text-red-500">{stats.cancelledToday}</p><p className="text-xs text-muted-foreground">Cancelled</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><IndianRupee className="h-4 w-4 mx-auto text-orange-500" /><p className="text-xl font-bold mt-1 text-orange-500">{stats.discountedToday}</p><p className="text-xs text-muted-foreground">Discounted</p></CardContent></Card>
      </div>

      {/* Quick Actions + AI Alerts */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Link to="/hms/lab-diagnostics/order"><Button variant="outline" size="sm" className="w-full justify-start text-xs"><FlaskConical className="mr-1 h-3 w-3" /> New Lab Order</Button></Link>
            <Link to="/hms/lab-diagnostics/order-status"><Button variant="outline" size="sm" className="w-full justify-start text-xs"><Activity className="mr-1 h-3 w-3" /> Order Status</Button></Link>
            <Link to="/hms/lab-diagnostics/home-collection"><Button variant="outline" size="sm" className="w-full justify-start text-xs"><Home className="mr-1 h-3 w-3" /> Home Collection</Button></Link>
            <Link to="/hms/lab-diagnostics/outsource"><Button variant="outline" size="sm" className="w-full justify-start text-xs"><Truck className="mr-1 h-3 w-3" /> Outsource</Button></Link>
            <Link to="/hms/lab-diagnostics/barcode"><Button variant="outline" size="sm" className="w-full justify-start text-xs"><BarChart3 className="mr-1 h-3 w-3" /> Generate Barcode</Button></Link>
            <Link to="/hms/lab-diagnostics/ai"><Button variant="outline" size="sm" className="w-full justify-start text-xs bg-purple-50 border-purple-200 text-purple-700"><Brain className="mr-1 h-3 w-3" /> AI Lab Intelligence</Button></Link>
          </CardContent>
        </Card>

        {/* AI Critical Alerts */}
        <Card className="border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" /> AI Critical Alerts
              <Badge className="bg-red-600 text-white text-xs">{stats.criticalAlerts}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="bg-red-50 border border-red-200 rounded p-2 text-xs">
              <div className="flex items-center gap-1 text-red-700 font-medium">
                <AlertTriangle className="h-3 w-3" /> Critical: Potassium 7.2 mEq/L
              </div>
              <p className="text-red-600 mt-0.5">Patient: Mr. Rajesh (AL-12543) - Requires immediate attention</p>
              <p className="text-muted-foreground mt-0.5">AI: Possible hyperkalemia. Suggest ECG + repeat K+ stat.</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded p-2 text-xs">
              <div className="flex items-center gap-1 text-amber-700 font-medium">
                <AlertTriangle className="h-3 w-3" /> Warning: HbA1c 11.2%
              </div>
              <p className="text-amber-600 mt-0.5">Patient: Mrs. Lakshmi (AL-14201) - Uncontrolled diabetes</p>
              <p className="text-muted-foreground mt-0.5">AI: Significant elevation. Suggest medication review + diet counseling.</p>
            </div>
            {stats.outsourcePending > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs">
                <p className="text-blue-700"><Truck className="inline h-3 w-3 mr-1" />{stats.outsourcePending} outsourced reports pending</p>
              </div>
            )}
            {stats.homeCollectionScheduled > 0 && (
              <div className="bg-green-50 border border-green-200 rounded p-2 text-xs">
                <p className="text-green-700"><Home className="inline h-3 w-3 mr-1" />{stats.homeCollectionScheduled} home collections scheduled today</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Donut Chart Placeholder (matching DocDoc) */}
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="12" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="12"
                strokeDasharray={`${(stats.completedToday / Math.max(stats.totalOrdersToday, 1)) * 251} 251`} />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="12"
                strokeDasharray={`${(stats.pendingToday / Math.max(stats.totalOrdersToday, 1)) * 251} 251`}
                strokeDashoffset={`-${(stats.completedToday / Math.max(stats.totalOrdersToday, 1)) * 251}`} />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="12"
                strokeDasharray={`${(stats.cancelledToday / Math.max(stats.totalOrdersToday, 1)) * 251} 251`}
                strokeDashoffset={`-${((stats.completedToday + stats.pendingToday) / Math.max(stats.totalOrdersToday, 1)) * 251}`} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.totalOrdersToday}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </div>
          <div className="ml-6 space-y-2 text-sm">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-green-500" /> Completed: {stats.completedToday}</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-amber-500" /> Pending: {stats.pendingToday}</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-500" /> In Progress: {stats.inProgressToday}</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-red-500" /> Cancelled: {stats.cancelledToday}</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-purple-500" /> Edited: {stats.editedToday}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LabDashboard;
