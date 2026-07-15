import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  BarChart3, TrendingUp, Building2, Users, Activity,
  Target, CheckCircle, AlertTriangle, Globe, Download,
} from "lucide-react";

const HmsGovernance = () => {
  const [level, setLevel] = useState("facility");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-indigo-600" /> Governance & Leadership Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">Outcome-based governance · Live KPIs · Center→State→National roll-up · Regulatory returns</p>
        </div>
        <div className="flex gap-2">
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="facility">Facility Level</SelectItem>
              <SelectItem value="district">District Level</SelectItem>
              <SelectItem value="state">State Level</SelectItem>
              <SelectItem value="national">National Level</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm"><Download className="mr-1 h-4 w-4" /> Generate Return</Button>
        </div>
      </div>

      {/* Live Command Center KPIs */}
      <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4 text-indigo-600" /> Live Command Center</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { label: "Centers Online", value: "7/7", color: "text-green-600", icon: Building2 },
              { label: "Today's Caseload", value: "240", color: "text-blue-600", icon: Users },
              { label: "Active Treatments", value: "89", color: "text-purple-600", icon: Activity },
              { label: "Outcome Score", value: "78%", color: "text-emerald-600", icon: TrendingUp },
              { label: "Compliance", value: "92%", color: "text-amber-600", icon: CheckCircle },
              { label: "Alerts", value: "3", color: "text-red-600", icon: AlertTriangle },
            ].map((kpi) => (
              <div key={kpi.label} className="text-center p-3 rounded-lg bg-card border">
                <kpi.icon className={`h-5 w-5 mx-auto ${kpi.color}`} />
                <p className={`text-xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
                <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Outcome Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4" /> Clinical Outcome Indicators</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { indicator: "Panchakarma Improvement Rate", value: 78, target: 70, unit: "%" },
              { indicator: "Patient Satisfaction (NPS)", value: 72, target: 50, unit: "score" },
              { indicator: "Treatment Completion Rate", value: 85, target: 80, unit: "%" },
              { indicator: "Follow-up Adherence", value: 68, target: 75, unit: "%" },
              { indicator: "Adverse Event Rate", value: 2, target: 5, unit: "% (lower is better)" },
              { indicator: "Average Outcome Score Improvement", value: 62, target: 50, unit: "%" },
            ].map((ind) => (
              <div key={ind.indicator}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>{ind.indicator}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{ind.value}{ind.unit.includes("%") ? "%" : ""}</span>
                    {((ind.unit.includes("lower") && ind.value <= ind.target) || (!ind.unit.includes("lower") && ind.value >= ind.target)) ?
                      <CheckCircle className="h-3 w-3 text-green-500" /> : <AlertTriangle className="h-3 w-3 text-amber-500" />}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={Math.min((ind.value / (ind.target * 1.5)) * 100, 100)} className="h-2 flex-1" />
                  <span className="text-[10px] text-muted-foreground">Target: {ind.target}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4" /> Facility-wise Performance</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { facility: "Ayuzee Main Hospital", caseload: 85, outcome: 82, compliance: 95 },
              { facility: "Ayuzee City Center", caseload: 52, outcome: 78, compliance: 90 },
              { facility: "Panchakarma Center (Thrissur)", caseload: 18, outcome: 88, compliance: 98 },
              { facility: "Wellness Hub (Calicut)", caseload: 28, outcome: 72, compliance: 85 },
              { facility: "Suburban Clinic", caseload: 22, outcome: 70, compliance: 82 },
            ].map((f) => (
              <div key={f.facility} className="p-3 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">{f.facility}</p>
                  <Badge variant="outline" className="text-[10px]">{f.caseload} patients/day</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Outcome Score</p>
                    <div className="flex items-center gap-1"><Progress value={f.outcome} className="h-1.5 flex-1" /><span className="text-xs font-bold">{f.outcome}%</span></div>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Compliance</p>
                    <div className="flex items-center gap-1"><Progress value={f.compliance} className="h-1.5 flex-1" /><span className="text-xs font-bold">{f.compliance}%</span></div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Regulatory Returns */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" /> Regulatory Returns & Reporting</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { name: "Monthly AYUSH Morbidity Return", due: "Aug 5, 2026", status: "pending", format: "NAMASTE coded" },
              { name: "Quarterly Outcome Report", due: "Oct 1, 2026", status: "upcoming", format: "VAS/WOMAC scores" },
              { name: "NABH Quality Indicators", due: "Jul 31, 2026", status: "due_soon", format: "12 indicators" },
              { name: "ABDM Compliance Report", due: "Monthly", status: "auto_generated", format: "FHIR records pushed" },
              { name: "Annual Clinical Audit", due: "Mar 31, 2027", status: "upcoming", format: "Full year data" },
              { name: "State AYUSH Directorate Return", due: "Quarterly", status: "pending", format: "Standard format" },
            ].map((r) => (
              <div key={r.name} className="p-3 rounded-lg border">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">{r.name}</p>
                  <Badge variant={r.status === "auto_generated" ? "outline" : r.status === "due_soon" ? "destructive" : "secondary"} className={`text-[9px] capitalize ${r.status === "auto_generated" ? "text-green-600" : ""}`}>{r.status.replace("_", " ")}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Due: {r.due} · Format: {r.format}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HmsGovernance;
