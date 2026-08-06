import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  AlertTriangle, Activity, Search, Bell, Phone, CheckCircle,
  Clock, Filter, TrendingUp, TrendingDown, ArrowUp, ArrowDown,
  RefreshCw, FlaskConical
} from "lucide-react";

type LabResult = {
  id: string;
  patient_name: string;
  patient_id: string;
  test_name: string;
  parameter: string;
  value: number;
  unit: string;
  normal_min: number;
  normal_max: number;
  critical_low: number;
  critical_high: number;
  severity: "critical" | "abnormal_high" | "abnormal_low" | "normal";
  status: "new" | "acknowledged" | "doctor_notified" | "action_taken";
  reported_at: string;
  doctor: string;
  ward?: string;
};

const mockResults: LabResult[] = [
  { id: "1", patient_name: "Anand Singh", patient_id: "ICU-03", test_name: "CBC", parameter: "Hemoglobin", value: 5.2, unit: "g/dL", normal_min: 12, normal_max: 16, critical_low: 7, critical_high: 20, severity: "critical", status: "new", reported_at: "10:15 AM", doctor: "Dr. Patel", ward: "ICU" },
  { id: "2", patient_name: "Rajesh Kumar", patient_id: "OP-142", test_name: "Blood Sugar", parameter: "Fasting Glucose", value: 320, unit: "mg/dL", normal_min: 70, normal_max: 110, critical_low: 50, critical_high: 400, severity: "abnormal_high", status: "doctor_notified", reported_at: "09:45 AM", doctor: "Dr. Saleem" },
  { id: "3", patient_name: "Sunita Devi", patient_id: "IP-15", test_name: "Renal Function", parameter: "Creatinine", value: 4.8, unit: "mg/dL", normal_min: 0.6, normal_max: 1.2, critical_low: 0.3, critical_high: 10, severity: "abnormal_high", status: "acknowledged", reported_at: "09:30 AM", doctor: "Dr. Meena", ward: "General" },
  { id: "4", patient_name: "Priya Sharma", patient_id: "OP-156", test_name: "Lipid Profile", parameter: "LDL Cholesterol", value: 195, unit: "mg/dL", normal_min: 0, normal_max: 100, critical_low: 0, critical_high: 190, severity: "abnormal_high", status: "new", reported_at: "11:00 AM", doctor: "Dr. Saleem" },
  { id: "5", patient_name: "Vikram Singh", patient_id: "OP-160", test_name: "Thyroid", parameter: "TSH", value: 0.1, unit: "mIU/L", normal_min: 0.4, normal_max: 4.0, critical_low: 0.1, critical_high: 10, severity: "critical", status: "new", reported_at: "10:45 AM", doctor: "Dr. Anitha" },
  { id: "6", patient_name: "Meera Devi", patient_id: "IP-22", test_name: "Electrolytes", parameter: "Potassium", value: 6.2, unit: "mEq/L", normal_min: 3.5, normal_max: 5.0, critical_low: 2.5, critical_high: 6.5, severity: "critical", status: "acknowledged", reported_at: "08:30 AM", doctor: "Dr. Patel", ward: "ICU" },
  { id: "7", patient_name: "Amit Patel", patient_id: "OP-148", test_name: "Liver Function", parameter: "SGPT (ALT)", value: 185, unit: "U/L", normal_min: 7, normal_max: 56, critical_low: 0, critical_high: 1000, severity: "abnormal_high", status: "action_taken", reported_at: "08:00 AM", doctor: "Dr. Saleem" },
];

const severityConfig = {
  critical: { color: "bg-red-100 text-red-800 border-red-200", label: "CRITICAL", icon: AlertTriangle },
  abnormal_high: { color: "bg-orange-100 text-orange-800 border-orange-200", label: "HIGH", icon: ArrowUp },
  abnormal_low: { color: "bg-blue-100 text-blue-800 border-blue-200", label: "LOW", icon: ArrowDown },
  normal: { color: "bg-green-100 text-green-800 border-green-200", label: "NORMAL", icon: CheckCircle },
};

const statusConfig = {
  new: { color: "text-red-600", label: "New — Action Required" },
  acknowledged: { color: "text-amber-600", label: "Acknowledged" },
  doctor_notified: { color: "text-blue-600", label: "Doctor Notified" },
  action_taken: { color: "text-green-600", label: "Action Taken" },
};

const HmsLabCriticalResults = () => {
  const [results] = useState<LabResult[]>(mockResults);
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyCritical, setShowOnlyCritical] = useState(true);

  const filtered = results.filter(r => {
    if (showOnlyCritical && r.severity === "normal") return false;
    const matchSeverity = filterSeverity === "all" || r.severity === filterSeverity;
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    const matchSearch = r.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.test_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.parameter.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSeverity && matchStatus && matchSearch;
  });

  const criticalCount = results.filter(r => r.severity === "critical").length;
  const abnormalCount = results.filter(r => r.severity === "abnormal_high" || r.severity === "abnormal_low").length;
  const newCount = results.filter(r => r.status === "new").length;

  const handleAcknowledge = (id: string) => {
    toast.success("Result acknowledged. Doctor will be auto-notified via WhatsApp.");
  };

  const handleNotifyDoctor = (id: string) => {
    toast.success("Critical alert sent to doctor via SMS + WhatsApp + App notification.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-600" /> Critical & Abnormal Results
          </h1>
          <p className="text-sm text-muted-foreground">
            Pathologist view — Filter out-of-range values for quick review and action
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => window.location.href = "/hms/lab-diagnostics"}>Full Lab</Button>
          <Button size="sm" variant="outline"><RefreshCw className="mr-1 h-4 w-4" /> Refresh</Button>
        </div>
      </div>

      {/* Alert Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-red-200"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-red-600">{criticalCount}</p><p className="text-xs text-muted-foreground">Critical</p></CardContent></Card>
        <Card className="border-orange-200"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-orange-600">{abnormalCount}</p><p className="text-xs text-muted-foreground">Abnormal</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-amber-600">{newCount}</p><p className="text-xs text-muted-foreground">Pending Action</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{results.length}</p><p className="text-xs text-muted-foreground">Total Flagged Today</p></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search patient, test..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <Select value={filterSeverity} onValueChange={setFilterSeverity}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="critical">Critical Only</SelectItem>
            <SelectItem value="abnormal_high">High</SelectItem>
            <SelectItem value="abnormal_low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New (Action Required)</SelectItem>
            <SelectItem value="acknowledged">Acknowledged</SelectItem>
            <SelectItem value="doctor_notified">Doctor Notified</SelectItem>
            <SelectItem value="action_taken">Action Taken</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-muted-foreground">Hide normal</span>
          <Switch checked={showOnlyCritical} onCheckedChange={setShowOnlyCritical} />
        </div>
      </div>

      {/* Results List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><FlaskConical className="h-4 w-4" /> Flagged Results ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filtered.map(result => {
              const sev = severityConfig[result.severity];
              const stat = statusConfig[result.status];
              const SevIcon = sev.icon;
              const deviation = result.value > result.normal_max
                ? `↑ ${Math.round(((result.value - result.normal_max) / result.normal_max) * 100)}% above`
                : `↓ ${Math.round(((result.normal_min - result.value) / result.normal_min) * 100)}% below`;

              return (
                <div key={result.id} className={`rounded-lg border p-4 ${result.severity === "critical" ? "border-red-300 bg-red-50/50" : "hover:bg-muted/20"}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`h-8 w-8 rounded-full grid place-items-center ${sev.color}`}>
                        <SevIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{result.patient_name}</p>
                          <span className="text-xs text-muted-foreground">({result.patient_id})</span>
                          {result.ward && <Badge variant="outline" className="text-xs">{result.ward}</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {result.test_name} → <strong>{result.parameter}</strong>
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className={`text-lg font-bold ${result.severity === "critical" ? "text-red-700" : result.severity === "abnormal_high" ? "text-orange-700" : "text-blue-700"}`}>
                            {result.value} {result.unit}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Normal: {result.normal_min}–{result.normal_max} {result.unit}
                          </span>
                          <Badge className={sev.color}>{deviation}</Badge>
                        </div>
                        <p className={`text-xs mt-1 ${stat.color}`}>{stat.label} · {result.reported_at} · Dr. {result.doctor.replace("Dr. ", "")}</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      {result.status === "new" && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleAcknowledge(result.id)}>
                            <CheckCircle className="mr-1 h-3 w-3" /> Acknowledge
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleNotifyDoctor(result.id)}>
                            <Phone className="mr-1 h-3 w-3" /> Alert Doctor
                          </Button>
                        </>
                      )}
                      {result.status === "acknowledged" && (
                        <Button size="sm" variant="outline" onClick={() => handleNotifyDoctor(result.id)}>
                          <Bell className="mr-1 h-3 w-3" /> Notify Doctor
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HmsLabCriticalResults;
