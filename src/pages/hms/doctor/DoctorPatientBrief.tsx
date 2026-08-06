import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Brain,
  User,
  AlertTriangle,
  Pill,
  Calendar,
  Activity,
  FileText,
  Printer,
  ClipboardList,
  FlaskConical,
  HeartPulse,
  TrendingUp,
  Stethoscope,
  Eye,
  Clock,
  ShieldAlert,
} from "lucide-react";

const patientData = {
  name: "Mr. Nagaraj",
  id: "AL-8472",
  age: 58,
  gender: "Male",
  prakriti: "Vata-Pitta",
  visitCount: 14,
  registeredSince: "March 2022",
};

const allergies = [
  { name: "Sulfonamides", severity: "severe" },
  { name: "Shrimp / Shellfish", severity: "moderate" },
  { name: "Latex", severity: "mild" },
];

const currentMedications = {
  ayush: [
    { name: "Simhanada Guggulu", dose: "2 tabs BD", system: "Ayurveda", since: "3 months" },
    { name: "Rasnasaptakam Kashayam", dose: "15ml BD", system: "Ayurveda", since: "3 months" },
    { name: "Ashwagandha Churna", dose: "3g HS", system: "Ayurveda", since: "6 months" },
  ],
  allopathy: [
    { name: "Methotrexate", dose: "15mg weekly", system: "Allopathy", since: "18 months" },
    { name: "Folic Acid", dose: "5mg (next day)", system: "Allopathy", since: "18 months" },
    { name: "Metformin", dose: "500mg BD", system: "Allopathy", since: "2 years" },
  ],
};

const lastVisits = [
  { date: "15 Jan 2025", complaint: "Joint stiffness, morning pain > 1hr", doctor: "Dr. Sharma (Ayurveda)" },
  { date: "02 Jan 2025", complaint: "Follow-up RA. DAS28 improved.", doctor: "Dr. Sharma (Ayurveda)" },
  { date: "18 Dec 2024", complaint: "HbA1c review. Mild neuropathy.", doctor: "Dr. Rao (General Medicine)" },
];

const pendingLabs = [
  { test: "HbA1c", dueReason: "3 months since last — due for recheck", priority: "high" },
  { test: "LFT (Liver Function)", dueReason: "Monthly monitoring (MTX)", priority: "high" },
  { test: "ESR + CRP", dueReason: "RA activity marker", priority: "moderate" },
];

const activeProcedures = [
  { name: "Janu Basti (Knee)", status: "Completed 5/7 sessions", nextDate: "Tomorrow" },
  { name: "Patra Pinda Sweda", status: "Completed 3/7 sessions", nextDate: "Tomorrow" },
];

const vitalsTrend = [
  { date: "15 Jan", bp: "138/88", pulse: 78, weight: "72 kg", sugar: "148 mg/dL" },
  { date: "02 Jan", bp: "142/90", pulse: 80, weight: "73 kg", sugar: "156 mg/dL" },
  { date: "18 Dec", bp: "140/86", pulse: 76, weight: "73.5 kg", sugar: "162 mg/dL" },
];

const aiInsights = [
  "Recurring Gridhrasi (Sciatica). On MTX for RA — monitor LFT monthly.",
  "Last HbA1c was 3 months ago — due for recheck.",
  "BP trending borderline high. Consider lifestyle modification or Sarpagandha.",
  "Good compliance with Panchakarma. DAS28 improving since Dec.",
  "Drug interaction alert: Monitor Ashwagandha + MTX (hepatic load).",
];

const DoctorPatientBrief = () => {
  const handleStartConsultation = () => {
    toast.success("Consultation started", {
      description: `Starting consultation for ${patientData.name} (${patientData.id})`,
    });
  };

  const handleViewFullHistory = () => {
    toast.info("Opening full patient history...", {
      description: "Loading all visits, reports, and treatment timeline.",
    });
  };

  const handlePrintBrief = () => {
    toast.success("Printing patient brief...", {
      description: "One-page summary sent to printer.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            AI Patient Summary Brief
          </h1>
          <p className="text-muted-foreground mt-1">
            Auto-generated one-page summary before consultation
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrintBrief}>
            <Printer className="h-4 w-4 mr-2" />
            Print Brief
          </Button>
          <Button variant="outline" onClick={handleViewFullHistory}>
            <FileText className="h-4 w-4 mr-2" />
            View Full History
          </Button>
          <Button onClick={handleStartConsultation}>
            <Stethoscope className="h-4 w-4 mr-2" />
            Start Consultation
          </Button>
        </div>
      </div>

      {/* Patient Header */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold">
                  {patientData.name}{" "}
                  <span className="text-muted-foreground font-normal text-sm">
                    ({patientData.id})
                  </span>
                </h2>
                <p className="text-sm text-muted-foreground">
                  {patientData.age} yrs • {patientData.gender} • Prakriti:{" "}
                  <Badge variant="outline" className="ml-1">
                    {patientData.prakriti}
                  </Badge>
                </p>
              </div>
            </div>
            <div className="flex gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{patientData.visitCount}</p>
                <p className="text-xs text-muted-foreground">Total Visits</p>
              </div>
              <div>
                <p className="text-sm font-medium">{patientData.registeredSince}</p>
                <p className="text-xs text-muted-foreground">Registered Since</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Allergies - Red Highlighted */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-4 w-4" />
            Key Allergies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {allergies.map((allergy, idx) => (
              <Badge
                key={idx}
                className={`${
                  allergy.severity === "severe"
                    ? "bg-red-600 text-white"
                    : allergy.severity === "moderate"
                    ? "bg-red-400 text-white"
                    : "bg-red-200 text-red-800"
                }`}
              >
                <ShieldAlert className="h-3 w-3 mr-1" />
                {allergy.name} ({allergy.severity})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Medications */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Pill className="h-4 w-4 text-primary" />
              Current Medications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs font-medium text-green-700 mb-2">AYUSH Medicines</p>
              {currentMedications.ayush.map((med, idx) => (
                <div key={idx} className="flex justify-between items-center py-1 text-sm border-b last:border-0">
                  <span className="font-medium">{med.name}</span>
                  <span className="text-xs text-muted-foreground">{med.dose} • {med.since}</span>
                </div>
              ))}
            </div>
            <Separator />
            <div>
              <p className="text-xs font-medium text-blue-700 mb-2">Allopathy Medicines</p>
              {currentMedications.allopathy.map((med, idx) => (
                <div key={idx} className="flex justify-between items-center py-1 text-sm border-b last:border-0">
                  <span className="font-medium">{med.name}</span>
                  <span className="text-xs text-muted-foreground">{med.dose} • {med.since}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Last 3 Visits */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Last 3 Visits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lastVisits.map((visit, idx) => (
                <div key={idx} className="border-b last:border-0 pb-2 last:pb-0">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {visit.date}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{visit.doctor}</span>
                  </div>
                  <p className="text-sm mt-1">{visit.complaint}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Labs */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-orange-500" />
              Pending Labs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingLabs.map((lab, idx) => (
                <div key={idx} className="flex items-start gap-2 py-1 border-b last:border-0">
                  <Badge
                    className={`text-xs shrink-0 ${
                      lab.priority === "high"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {lab.priority === "high" ? "URGENT" : "DUE"}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium">{lab.test}</p>
                    <p className="text-xs text-muted-foreground">{lab.dueReason}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Procedures */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-600" />
              Active Procedures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeProcedures.map((proc, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">{proc.name}</p>
                    <Badge variant="outline" className="text-xs">{proc.nextDate}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{proc.status}</p>
                  <Progress value={proc.name.includes("Janu") ? 71 : 43} className="h-1.5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vitals Trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-red-500" />
            Vitals Trend (Last 3 Readings)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-2 text-xs font-medium text-muted-foreground">Date</th>
                  <th className="text-center p-2 text-xs font-medium text-muted-foreground">BP</th>
                  <th className="text-center p-2 text-xs font-medium text-muted-foreground">Pulse</th>
                  <th className="text-center p-2 text-xs font-medium text-muted-foreground">Weight</th>
                  <th className="text-center p-2 text-xs font-medium text-muted-foreground">Fasting Sugar</th>
                  <th className="text-center p-2 text-xs font-medium text-muted-foreground">Trend</th>
                </tr>
              </thead>
              <tbody>
                {vitalsTrend.map((vital, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2 text-sm font-medium">{vital.date}</td>
                    <td className="p-2 text-sm text-center">
                      <Badge variant={idx === 0 ? "secondary" : "outline"}>{vital.bp}</Badge>
                    </td>
                    <td className="p-2 text-sm text-center">{vital.pulse} bpm</td>
                    <td className="p-2 text-sm text-center">{vital.weight}</td>
                    <td className="p-2 text-sm text-center">{vital.sugar}</td>
                    <td className="p-2 text-center">
                      {idx === 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mx-auto" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-muted-foreground mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* AI Risk Assessment & Insights */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-purple-800">
            <Brain className="h-4 w-4" />
            AI Risk Assessment & Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {aiInsights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <Eye className="h-3 w-3 text-purple-600 mt-1 shrink-0" />
                <p className="text-sm text-purple-800">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bottom Actions */}
      <div className="flex justify-center gap-3">
        <Button size="lg" onClick={handleStartConsultation}>
          <Stethoscope className="h-4 w-4 mr-2" />
          Start Consultation
        </Button>
        <Button size="lg" variant="outline" onClick={handleViewFullHistory}>
          <ClipboardList className="h-4 w-4 mr-2" />
          View Full History
        </Button>
        <Button size="lg" variant="outline" onClick={handlePrintBrief}>
          <Printer className="h-4 w-4 mr-2" />
          Print Brief
        </Button>
      </div>
    </div>
  );
};

export default DoctorPatientBrief;
