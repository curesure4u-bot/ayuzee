import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Brain, Plus, X, Search, FlaskConical, Leaf } from "lucide-react";

const mockResults = [
  {
    modern: { name: "Lumbar Disc Herniation (L4-L5)", icd: "M51.16", probability: 72 },
    ayush: { name: "Gridhrasi (Vataja)", nidana: "Vata Prakopa due to sedentary lifestyle", probability: 85 },
    investigations: ["MRI Lumbar Spine", "NCV Studies", "X-ray LS Spine AP/Lateral"],
  },
  {
    modern: { name: "Piriformis Syndrome", icd: "G57.0", probability: 45 },
    ayush: { name: "Gridhrasi (Vata-Kaphaja)", nidana: "Mamsagata Vata", probability: 40 },
    investigations: ["FAIR Test", "MRI Pelvis", "EMG"],
  },
  {
    modern: { name: "Sacroiliac Joint Dysfunction", icd: "M53.3", probability: 30 },
    ayush: { name: "Kati Shoola (Sandhigata Vata)", nidana: "Asthi-Sandhi Kshaya", probability: 35 },
    investigations: ["SI Joint X-ray", "CT Pelvis", "Provocative Tests"],
  },
  {
    modern: { name: "Lumbar Spinal Stenosis", icd: "M48.06", probability: 20 },
    ayush: { name: "Grudhrasi with Suptata", nidana: "Dhatukshaya, Vata Vruddhi", probability: 22 },
    investigations: ["MRI with Myelography", "Walking Test"],
  },
];

const AIDifferentialDx = () => {
  const [symptoms, setSymptoms] = useState<string[]>(["Lower back pain", "Radiating leg pain", "Tingling in foot"]);
  const [input, setInput] = useState("");
  const [showResults, setShowResults] = useState(true);

  const addSymptom = () => {
    if (!input.trim()) return;
    setSymptoms([...symptoms, input.trim()]);
    setInput("");
  };

  const removeSymptom = (idx: number) => setSymptoms(symptoms.filter((_, i) => i !== idx));

  const handleAnalyze = () => {
    if (symptoms.length < 2) { toast.error("Add at least 2 symptoms"); return; }
    setShowResults(true);
    toast.success("AI analysis complete");
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AI Differential Diagnosis</h1>
        <Badge className="gap-1 bg-purple-100 text-purple-700 border-purple-200"><Brain className="h-3 w-3" /> AI-Powered</Badge>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Search className="h-5 w-5" /> Enter Symptoms</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input placeholder="Type a symptom..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSymptom()} />
            <Button onClick={addSymptom} size="icon" variant="outline"><Plus className="h-4 w-4" /></Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {symptoms.map((s, i) => (
              <Badge key={i} variant="secondary" className="gap-1 py-1">
                {s}
                <button onClick={() => removeSymptom(i)}><X className="h-3 w-3" /></button>
              </Badge>
            ))}
          </div>
          <Button onClick={handleAnalyze} className="gap-2"><Brain className="h-4 w-4" /> Analyze</Button>
        </CardContent>
      </Card>

      {showResults && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Differential Diagnoses (Ranked)</h2>
          {mockResults.map((r, i) => (
            <Card key={i} className={i === 0 ? "border-primary" : ""}>
              <CardContent className="p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FlaskConical className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-semibold uppercase text-blue-600">Modern</span>
                    </div>
                    <p className="font-medium text-sm">{r.modern.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">ICD: {r.modern.icd}</Badge>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${r.modern.probability}%` }} />
                      </div>
                      <span className="text-xs font-bold">{r.modern.probability}%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-green-600" />
                      <span className="text-xs font-semibold uppercase text-green-600">AYUSH (Nidana)</span>
                    </div>
                    <p className="font-medium text-sm">{r.ayush.name}</p>
                    <p className="text-xs text-muted-foreground">{r.ayush.nidana}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${r.ayush.probability}%` }} />
                      </div>
                      <span className="text-xs font-bold">{r.ayush.probability}%</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs font-medium mb-1">Suggested Investigations:</p>
                  <div className="flex flex-wrap gap-1">
                    {r.investigations.map((inv, j) => (
                      <Badge key={j} variant="secondary" className="text-xs">{inv}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIDifferentialDx;
