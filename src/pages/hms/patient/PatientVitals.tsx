import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Activity, Heart, Brain, Sparkles, TrendingUp,
  AlertTriangle, Save, BarChart3, Table, Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { assessPatientRisk } from "@/services/patientAiService";

const patientHeader = {
  name: "Mr. Nagaraj 14233",
  id: "AL-8472",
  age: "65 years 1 months 16 days",
  gender: "M",
  mobile: "9443314670",
};

interface VitalEntry {
  date: string;
  type: string;
  height: string;
  weight: string;
  bmi: string;
  bp: string;
  temp: string;
  pulse: string;
  respiratory: string;
  spo2RA: string;
  spo2O2: string;
  cbg: string;
  heartRate: string;
  sugar: string;
}

const mockVitals: VitalEntry[] = [];

const vitalCharts = ["Height Chart", "Weight", "BMI", "BloodPressure", "Temperature", "Spo2", "Sugar", "Head Circumference"];

const PatientVitals = () => {
  const [vitalsHistory, setVitalsHistory] = useState<VitalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<"graphical" | "table">("graphical");
  const [selectedChart, setSelectedChart] = useState("Height Chart");
  const [aiAlert, setAiAlert] = useState<string | null>(null);

  // Input state for new vitals
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bp, setBp] = useState("");
  const [temperature, setTemperature] = useState("");
  const [pulse, setPulse] = useState("");
  const [respiratory, setRespiratory] = useState("");
  const [spo2, setSpo2] = useState("");
  const [sugar, setSugar] = useState("");
  const [painScore, setPainScore] = useState("");

  useEffect(() => {
    loadVitalsHistory();
  }, []);

  const loadVitalsHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("hms_triage_records")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      setVitalsHistory((data || []).map((r: any) => ({
        date: new Date(r.created_at).toLocaleDateString(),
        type: "OP",
        height: r.height?.toString() || "",
        weight: r.weight?.toString() || "",
        bmi: r.bmi?.toString() || "",
        bp: r.blood_pressure_systolic ? `${r.blood_pressure_systolic}/${r.blood_pressure_diastolic}` : "",
        temp: r.temperature?.toString() || "",
        pulse: r.pulse_rate?.toString() || "",
        respiratory: r.respiratory_rate?.toString() || "",
        spo2RA: r.spo2?.toString() || "",
        spo2O2: "",
        cbg: "",
        heartRate: r.pulse_rate?.toString() || "",
        sugar: r.blood_sugar_random?.toString() || "",
      })));
    } catch (err: any) {
      console.error("Failed to load vitals:", err);
    }
    setLoading(false);
  };

  const handleSaveVitals = async () => {
    if (!height && !weight && !bp) {
      return toast.error("Enter at least one vital measurement");
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Login required"); setSaving(false); return; }

      const bpParts = bp.split("/");
      const bmi = height && weight ? (Number(weight) / ((Number(height) / 100) ** 2)).toFixed(1) : null;

      const { error } = await (supabase as any)
        .from("hms_triage_records")
        .insert({
          patient_id: user.id,
          blood_pressure_systolic: bpParts[0] ? parseInt(bpParts[0]) : null,
          blood_pressure_diastolic: bpParts[1] ? parseInt(bpParts[1]) : null,
          pulse_rate: pulse ? parseInt(pulse) : null,
          temperature: temperature ? parseFloat(temperature) : null,
          respiratory_rate: respiratory ? parseInt(respiratory) : null,
          spo2: spo2 ? parseInt(spo2) : null,
          weight: weight ? parseFloat(weight) : null,
          height: height ? parseFloat(height) : null,
          bmi: bmi ? parseFloat(bmi) : null,
          blood_sugar_random: sugar ? parseFloat(sugar) : null,
          pain_scale: painScore ? parseInt(painScore) : null,
          chief_complaint: "Vitals capture",
          triage_priority: "normal",
          status: "captured",
          captured_by: user.id,
        });

      if (error) throw error;

      // AI Analysis
      const bmiVal = height && weight ? (Number(weight) / ((Number(height) / 100) ** 2)).toFixed(1) : "";
      const result = await assessPatientRisk(
        {
          id: "v-new", patientId: "current", date: new Date().toISOString().slice(0, 10),
          time: "now", type: "OP", height: Number(height), weight: Number(weight),
          bmi: bmiVal ? Number(bmiVal) : undefined, bloodPressure: bp, sugar: sugar ? Number(sugar) : undefined,
          createdBy: "system", createdAt: new Date().toISOString(),
        },
        undefined,
        65
      );

      if (result.riskLevel !== "Low") {
        setAiAlert(result.insights.join(" | "));
      }

      toast.success("Vitals saved to Supabase", {
        description: `BMI: ${bmiVal || "N/A"} | AI Risk: ${result.riskLevel}`,
      });

      // Reset and reload
      setHeight(""); setWeight(""); setBp(""); setTemperature(""); setPulse(""); setRespiratory(""); setSpo2(""); setSugar(""); setPainScore("");
      loadVitalsHistory();
    } catch (err: any) {
      toast.error("Failed to save vitals: " + (err.message || "Unknown error"));
      console.error(err);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <Card className="border-t-4 border-t-teal-500">
        <CardContent className="p-4">
          <div className="text-center text-teal-600 font-semibold text-lg mb-2">Vitals</div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
            <div><strong>Name:</strong> {patientHeader.name}</div>
            <div><strong>ID:</strong> {patientHeader.id}</div>
            <div><strong>Age:</strong> {patientHeader.age}</div>
            <div><strong>Gender:</strong> {patientHeader.gender}</div>
            <div><strong>Mobile:</strong> {patientHeader.mobile}</div>
          </div>
        </CardContent>
      </Card>

      {/* AI Alert */}
      {aiAlert && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="p-3 flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-amber-800">AI Health Alert</p>
              <p className="text-sm text-amber-700">{aiAlert}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Record New Vitals */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" /> Record Vitals
            <Badge variant="outline" className="text-xs ml-auto">
              <Brain className="h-3 w-3 mr-1" /> AI will auto-analyze
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <div>
              <Label className="text-xs">Height (cm)</Label>
              <Input value={height} onChange={(e) => setHeight(e.target.value)} placeholder="cm" className="h-8" />
            </div>
            <div>
              <Label className="text-xs">Weight (kg)</Label>
              <Input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="kg" className="h-8" />
            </div>
            <div>
              <Label className="text-xs">Blood Pressure</Label>
              <Input value={bp} onChange={(e) => setBp(e.target.value)} placeholder="120/80 mmHg" className="h-8" />
            </div>
            <div>
              <Label className="text-xs">Temperature (°F)</Label>
              <Input value={temperature} onChange={(e) => setTemperature(e.target.value)} placeholder="°F" className="h-8" />
            </div>
            <div>
              <Label className="text-xs">Pulse (bpm)</Label>
              <Input value={pulse} onChange={(e) => setPulse(e.target.value)} placeholder="bpm" className="h-8" />
            </div>
            <div>
              <Label className="text-xs">Respiratory Rate</Label>
              <Input value={respiratory} onChange={(e) => setRespiratory(e.target.value)} placeholder="/min" className="h-8" />
            </div>
            <div>
              <Label className="text-xs">SpO2 (%)</Label>
              <Input value={spo2} onChange={(e) => setSpo2(e.target.value)} placeholder="%" className="h-8" />
            </div>
            <div>
              <Label className="text-xs">Sugar (mg/dL)</Label>
              <Input value={sugar} onChange={(e) => setSugar(e.target.value)} placeholder="mg/dL" className="h-8" />
            </div>
            <div>
              <Label className="text-xs">Pain Score (0-10)</Label>
              <Input value={painScore} onChange={(e) => setPainScore(e.target.value)} placeholder="0-10" className="h-8" />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSaveVitals} disabled={saving} className="bg-orange-600 hover:bg-orange-700 h-8">
                {saving ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />} Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={view === "graphical" ? "default" : "outline"}
          onClick={() => setView("graphical")}
          className={view === "graphical" ? "bg-teal-600" : ""}
        >
          <BarChart3 className="h-3 w-3 mr-1" /> Graphical View
        </Button>
        <Button
          size="sm"
          variant={view === "table" ? "default" : "outline"}
          onClick={() => setView("table")}
          className={view === "table" ? "bg-teal-600" : ""}
        >
          <Table className="h-3 w-3 mr-1" /> Table View
        </Button>
      </div>

      {/* Graphical View */}
      {view === "graphical" && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {vitalCharts.map((chart) => (
                <Button
                  key={chart}
                  size="sm"
                  variant={selectedChart === chart ? "default" : "outline"}
                  onClick={() => setSelectedChart(chart)}
                  className={selectedChart === chart ? "bg-teal-600 h-7" : "h-7"}
                >
                  {chart} ▼
                </Button>
              ))}
            </div>
            <div className="h-64 flex items-center justify-center border rounded-md bg-muted/20">
              <div className="text-center text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 text-teal-400" />
                <p className="text-sm">Patient {selectedChart}</p>
                <p className="text-xs">(Chart visualization renders here with historical data)</p>
                <p className="text-xs mt-2 text-violet-600 flex items-center justify-center gap-1">
                  <Sparkles className="h-3 w-3" /> AI trend analysis active
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table View */}
      {view === "table" && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b bg-muted/50">
                  <tr>
                    {["Date", "Type", "Height(cm)", "Weight(kg)", "BMI", "Blood Pressure(mm Hg)", "Temperature(F)", "Pulse Rate(per min)", "Respiratory Rate(breaths/min)", "Overall Pain Score", "Individual Pain Spot & Score", "Spo2(% at RA)", "Spo2(% at O2)", "CBG(mg/dl)", "Heart Rate(beats/min)", "Sugar"].map((h) => (
                      <th key={h} className="px-2 py-2 text-left font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vitalsHistory.map((v, i) => (
                    <tr key={i} className="border-b hover:bg-muted/30">
                      <td className="px-2 py-2">{v.date}</td>
                      <td className="px-2 py-2">{v.type}</td>
                      <td className="px-2 py-2">{v.height}</td>
                      <td className="px-2 py-2">{v.weight}</td>
                      <td className="px-2 py-2">{v.bmi}</td>
                      <td className="px-2 py-2">{v.bp}</td>
                      <td className="px-2 py-2">{v.temp}</td>
                      <td className="px-2 py-2">{v.pulse}</td>
                      <td className="px-2 py-2">{v.respiratory}</td>
                      <td className="px-2 py-2">—</td>
                      <td className="px-2 py-2">—</td>
                      <td className="px-2 py-2">{v.spo2RA}</td>
                      <td className="px-2 py-2">{v.spo2O2 || "—"}</td>
                      <td className="px-2 py-2">{v.cbg || "—"}</td>
                      <td className="px-2 py-2">{v.heartRate}</td>
                      <td className="px-2 py-2">{v.sugar}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientVitals;
