import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  BarChart3, TrendingUp, TrendingDown, Minus, Search,
  Printer, Download, Share2, Brain, Eye, Palette,
  FileText, CheckCircle2, AlertTriangle, Activity,
} from "lucide-react";

interface SmartReportData {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  testName: string;
  orderNo: string;
  reportDate: string;
  parameters: SmartParameter[];
  overallRisk: "Low" | "Moderate" | "High" | "Critical";
  healthScore: number;
  aiSummary: string;
  recommendations: string[];
}

interface SmartParameter {
  name: string;
  value: number;
  unit: string;
  normalLow: number;
  normalHigh: number;
  status: "Normal" | "Borderline" | "Abnormal" | "Critical";
  trend: "Improving" | "Stable" | "Worsening" | "New";
  previousValues: { date: string; value: number }[];
  percentile?: number;
}

const mockSmartReports: SmartReportData[] = [
  {
    id: "sr1", patientId: "AL-12543", patientName: "Mr. Rajesh Kumar", age: 52, gender: "Male",
    testName: "Comprehensive Metabolic Panel", orderNo: "ORD-2026-0047", reportDate: "2026-07-24",
    overallRisk: "High", healthScore: 42,
    aiSummary: "Significant renal impairment with dangerous potassium elevation. Immediate medical intervention recommended. Pattern suggests progressive CKD with acute-on-chronic component.",
    recommendations: ["Urgent nephrology consultation", "ECG to assess cardiac effects of hyperkalemia", "Fluid management & dietary potassium restriction", "Consider Ayurvedic Punarnava-based adjunct therapy"],
    parameters: [
      { name: "Creatinine", value: 3.8, unit: "mg/dL", normalLow: 0.7, normalHigh: 1.3, status: "Critical", trend: "Worsening", previousValues: [{ date: "2026-04", value: 2.1 }, { date: "2026-01", value: 1.5 }, { date: "2025-10", value: 1.2 }] },
      { name: "Potassium", value: 7.2, unit: "mEq/L", normalLow: 3.5, normalHigh: 5.5, status: "Critical", trend: "Worsening", previousValues: [{ date: "2026-04", value: 5.8 }, { date: "2026-01", value: 5.2 }] },
      { name: "BUN", value: 45, unit: "mg/dL", normalLow: 7, normalHigh: 20, status: "Abnormal", trend: "Worsening", previousValues: [{ date: "2026-04", value: 25 }, { date: "2026-01", value: 18 }] },
      { name: "Sodium", value: 138, unit: "mEq/L", normalLow: 136, normalHigh: 145, status: "Normal", trend: "Stable", previousValues: [{ date: "2026-04", value: 140 }] },
      { name: "Calcium", value: 8.2, unit: "mg/dL", normalLow: 8.5, normalHigh: 10.5, status: "Borderline", trend: "Worsening", previousValues: [{ date: "2026-04", value: 9.2 }] },
      { name: "Uric Acid", value: 8.5, unit: "mg/dL", normalLow: 3.5, normalHigh: 7.2, status: "Abnormal", trend: "Stable", previousValues: [{ date: "2026-04", value: 8.1 }] },
    ],
  },
  {
    id: "sr2", patientId: "AL-14201", patientName: "Mrs. Lakshmi Devi", age: 45, gender: "Female",
    testName: "Complete Blood Count", orderNo: "ORD-2026-0048", reportDate: "2026-07-24",
    overallRisk: "Critical", healthScore: 28,
    aiSummary: "Severe microcytic hypochromic anemia indicating significant iron deficiency. Hemoglobin critically low — blood transfusion may be required. Recommend iron studies and peripheral smear for confirmation.",
    recommendations: ["Packed RBC transfusion if symptomatic", "Iron studies (Serum Iron, TIBC, Ferritin)", "Peripheral blood smear examination", "Rule out GI blood loss", "Ayurvedic: Loha Bhasma + Punarnava Mandur consideration"],
    parameters: [
      { name: "Hemoglobin", value: 5.2, unit: "g/dL", normalLow: 12, normalHigh: 16, status: "Critical", trend: "Worsening", previousValues: [{ date: "2026-06", value: 10.5 }, { date: "2026-03", value: 11.2 }] },
      { name: "RBC Count", value: 2.8, unit: "M/μL", normalLow: 3.8, normalHigh: 5.1, status: "Abnormal", trend: "Worsening", previousValues: [{ date: "2026-06", value: 3.9 }] },
      { name: "MCV", value: 64, unit: "fL", normalLow: 80, normalHigh: 100, status: "Abnormal", trend: "Worsening", previousValues: [{ date: "2026-06", value: 78 }] },
      { name: "MCH", value: 18.5, unit: "pg", normalLow: 27, normalHigh: 32, status: "Abnormal", trend: "Worsening", previousValues: [{ date: "2026-06", value: 26 }] },
      { name: "WBC", value: 7800, unit: "/μL", normalLow: 4000, normalHigh: 11000, status: "Normal", trend: "Stable", previousValues: [{ date: "2026-06", value: 7500 }] },
      { name: "Platelet", value: 2.2, unit: "L/μL", normalLow: 1.5, normalHigh: 4.0, status: "Normal", trend: "Stable", previousValues: [{ date: "2026-06", value: 2.8 }] },
    ],
  },
];

const SmartReports = () => {
  const [reports] = useState<SmartReportData[]>(mockSmartReports);
  const [selectedReport, setSelectedReport] = useState<SmartReportData | null>(mockSmartReports[0]);
  const [search, setSearch] = useState("");
  const [showTrends, setShowTrends] = useState(true);
  const [showAI, setShowAI] = useState(true);

  const getStatusColor = (status: string) => {
    switch (status) { case "Normal": return "bg-green-500"; case "Borderline": return "bg-amber-400"; case "Abnormal": return "bg-orange-500"; case "Critical": return "bg-red-600"; default: return "bg-gray-400"; }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) { case "Normal": return "text-green-700"; case "Borderline": return "text-amber-700"; case "Abnormal": return "text-orange-700"; case "Critical": return "text-red-700"; default: return "text-gray-700"; }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) { case "Low": return "bg-green-100 text-green-700 border-green-300"; case "Moderate": return "bg-amber-100 text-amber-700 border-amber-300"; case "High": return "bg-orange-100 text-orange-700 border-orange-300"; case "Critical": return "bg-red-100 text-red-700 border-red-300"; default: return "bg-gray-100 text-gray-700"; }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) { case "Improving": return <TrendingDown className="h-3 w-3 text-green-600" />; case "Worsening": return <TrendingUp className="h-3 w-3 text-red-600" />; case "Stable": return <Minus className="h-3 w-3 text-blue-600" />; default: return <Activity className="h-3 w-3 text-gray-400" />; }
  };

  const getBarWidth = (value: number, low: number, high: number) => {
    const range = high * 2;
    return Math.min((value / range) * 100, 100);
  };

  const getNormalZone = (low: number, high: number) => {
    const range = high * 2;
    return { left: (low / range) * 100, width: ((high - low) / range) * 100 };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2">
          <Palette className="h-5 w-5" /> Smart Graphical Reports
        </h2>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1"><Switch checked={showTrends} onCheckedChange={setShowTrends} /><span>Trends</span></div>
          <div className="flex items-center gap-1"><Switch checked={showAI} onCheckedChange={setShowAI} /><span>AI Insights</span></div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        {/* Left: Report List */}
        <div className="lg:col-span-1 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input className="pl-8 h-7 text-xs" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {reports.map((r) => (
            <Card key={r.id} className={`cursor-pointer transition ${selectedReport?.id === r.id ? "border-orange-500 bg-orange-50" : "hover:border-orange-300"}`} onClick={() => setSelectedReport(r)}>
              <CardContent className="p-3">
                <p className="text-xs font-medium">{r.patientName}</p>
                <p className="text-[10px] text-muted-foreground">{r.testName}</p>
                <div className="flex items-center justify-between mt-1">
                  <Badge className={`text-[9px] ${getRiskColor(r.overallRisk)}`}>{r.overallRisk} Risk</Badge>
                  <span className="text-[10px] font-bold">{r.healthScore}/100</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Right: Smart Report Preview */}
        <div className="lg:col-span-3 space-y-3">
          {!selectedReport ? (
            <Card><CardContent className="p-12 text-center text-muted-foreground"><Palette className="h-12 w-12 mx-auto mb-3 opacity-30" /><p className="text-sm">Select a report to preview</p></CardContent></Card>
          ) : (
            <>
              {/* Patient Header + Health Score */}
              <Card className="border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">{selectedReport.patientName}</p>
                      <p className="text-xs text-muted-foreground">{selectedReport.patientId} | {selectedReport.age}y / {selectedReport.gender} | {selectedReport.testName}</p>
                      <p className="text-[10px] text-muted-foreground">{selectedReport.orderNo} | {selectedReport.reportDate}</p>
                    </div>
                    <div className="text-center">
                      <div className={`h-16 w-16 rounded-full flex items-center justify-center border-4 ${selectedReport.healthScore > 70 ? "border-green-500" : selectedReport.healthScore > 50 ? "border-amber-500" : selectedReport.healthScore > 30 ? "border-orange-500" : "border-red-500"}`}>
                        <span className="text-lg font-bold">{selectedReport.healthScore}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">Health Score</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`${getRiskColor(selectedReport.overallRisk)}`}>Overall Risk: {selectedReport.overallRisk}</Badge>
                    <Badge variant="outline" className="text-[10px]">{selectedReport.parameters.filter(p => p.status === "Normal").length}/{selectedReport.parameters.length} Normal</Badge>
                    <Badge variant="outline" className="text-[10px] text-red-600 border-red-300">{selectedReport.parameters.filter(p => p.status === "Critical").length} Critical</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Visual Parameter Bars */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Parameter Visual Summary</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {selectedReport.parameters.map((param) => {
                    const normalZone = getNormalZone(param.normalLow, param.normalHigh);
                    const barPos = getBarWidth(param.value, param.normalLow, param.normalHigh);
                    return (
                      <div key={param.name} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium ${getStatusTextColor(param.status)}`}>{param.name}</span>
                            {showTrends && getTrendIcon(param.trend)}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${getStatusTextColor(param.status)}`}>{param.value} {param.unit}</span>
                            <Badge className={`text-[8px] ${getStatusColor(param.status)} text-white`}>{param.status}</Badge>
                          </div>
                        </div>
                        {/* Visual bar */}
                        <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                          {/* Normal zone */}
                          <div className="absolute h-full bg-green-100 border-x border-green-300" style={{ left: `${normalZone.left}%`, width: `${normalZone.width}%` }} />
                          {/* Value marker */}
                          <div className={`absolute top-0 h-full w-1.5 rounded ${getStatusColor(param.status)}`} style={{ left: `${Math.min(barPos, 98)}%` }} />
                        </div>
                        <div className="flex justify-between text-[9px] text-muted-foreground">
                          <span>0</span>
                          <span>{param.normalLow} - {param.normalHigh} (Normal)</span>
                          <span>{param.normalHigh * 2}</span>
                        </div>
                        {/* Trend sparkline */}
                        {showTrends && param.previousValues.length > 0 && (
                          <div className="flex items-center gap-1 text-[9px] text-muted-foreground ml-2">
                            <span>Trend:</span>
                            {param.previousValues.map((pv, i) => (
                              <span key={i} className="px-1 py-0.5 bg-gray-100 rounded">{pv.date}: {pv.value}</span>
                            ))}
                            <span className="px-1 py-0.5 bg-blue-100 rounded font-medium">Now: {param.value}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* AI Summary & Recommendations */}
              {showAI && (
                <Card className="border-purple-200">
                  <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Brain className="h-4 w-4 text-purple-600" /> AI Clinical Summary</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs">{selectedReport.aiSummary}</p>
                    <div>
                      <p className="text-xs font-medium mb-1">Recommendations:</p>
                      <ul className="space-y-1">
                        {selectedReport.recommendations.map((rec, i) => (
                          <li key={i} className="text-xs flex items-start gap-1">
                            <CheckCircle2 className="h-3 w-3 text-purple-600 mt-0.5 shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => toast.success("Smart report PDF generated")}><Printer className="mr-1 h-3 w-3" /> Print Smart PDF</Button>
                <Button size="sm" variant="outline" onClick={() => toast.info("PDF download started")}><Download className="mr-1 h-3 w-3" /> Download</Button>
                <Button size="sm" variant="outline" className="text-green-600" onClick={() => toast.success("Smart report shared via WhatsApp")}><Share2 className="mr-1 h-3 w-3" /> WhatsApp</Button>
                <Button size="sm" variant="outline" onClick={() => toast.info("Switched to standard report view")}><FileText className="mr-1 h-3 w-3" /> Standard View</Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartReports;
