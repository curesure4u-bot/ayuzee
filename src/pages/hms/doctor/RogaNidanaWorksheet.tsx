import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ClipboardList, Printer, Save, Sparkles, ChevronRight } from "lucide-react";

const mockGridhrasiCase = {
  nidana: {
    aharaja: "Excessive intake of Ruksha (dry), Sheeta (cold) food; irregular meals; Vata-aggravating diet (beans, raw salad)",
    viharaja: "Prolonged sitting (desk job >8 hrs), heavy lifting with improper posture, suppression of natural urges (Vegadharana)",
    manasika: "Chronic stress, anxiety, sleep deprivation for 3+ months",
    agantuja: "History of fall on buttocks 6 months ago; exposure to cold draft",
  },
  poorvarupa: [
    "Intermittent stiffness in lower back on waking",
    "Mild tingling in left buttock after prolonged sitting",
    "Occasional cramping in calf muscles",
    "Feeling of heaviness in left leg",
  ],
  rupa: [
    "Severe shooting pain from buttock to heel (Sphik-Kati-Prishtha-Uru-Janu-Jangha-Pada — in order)",
    "Restricted SLR (Straight Leg Raise) at 30°",
    "Numbness and tingling in L5/S1 dermatome",
    "Difficulty in walking, standing from sitting position",
    "Aggravated by coughing/sneezing (Valsalva positive)",
  ],
  samprapti: {
    dosha: "Vata (Vyana + Apana) — Prakopa",
    dushya: "Rasa, Asthi, Majja",
    srotas: "Asthivaha Srotas (Srotodushti: Sanga type)",
    agni: "Mandagni → Ama formation → Srotavarodha",
    sthana: "Sphik (Buttock), Kati (Lumbar), Pada (Foot) — Sthanasamshraya in Kandara (tendons)",
  },
  upashaya: {
    relieves: "Warm oil application (Taila Abhyanga), Swedana (fomentation), mild movement after rest",
    aggravates: "Cold exposure, prolonged sitting, straining at stool, heavy lifting",
    confirms: "Relief with Snehana + Swedana confirms Vata-dominant Gridhrasi (vs. Vata-Kapha type)",
  },
};

const RogaNidanaWorksheet = () => {
  const [notes, setNotes] = useState("");

  const handleSave = () => toast.success("Roga-Nidana worksheet saved to patient record");
  const handlePrint = () => { window.print(); toast.info("Print dialog opened"); };
  const handleAIFill = () => toast.info("AI auto-fill: Analyzing symptoms to suggest Nidana & Samprapti...");

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" /> Roga-Nidana Worksheet
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Structured AYUSH Diagnosis — Case: Gridhrasi (Sciatica)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleAIFill}><Sparkles className="h-4 w-4 mr-1" /> AI Auto-fill</Button>
          <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="h-4 w-4 mr-1" /> Print</Button>
          <Button size="sm" onClick={handleSave}><Save className="h-4 w-4 mr-1" /> Save</Button>
        </div>
      </div>

      {/* 1. Nidana */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Badge className="bg-red-100 text-red-700">1</Badge> Nidana (Causative Factors)
          </CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          {Object.entries(mockGridhrasiCase.nidana).map(([key, val]) => (
            <div key={key} className="border rounded-lg p-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                {key === "aharaja" ? "Aharaja (Dietary)" : key === "viharaja" ? "Viharaja (Lifestyle)" : key === "manasika" ? "Manasika (Mental)" : "Agantuja (External)"}
              </p>
              <p className="text-sm">{val}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 2. Poorvarupa */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Badge className="bg-amber-100 text-amber-700">2</Badge> Poorvarupa (Prodromal Symptoms)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {mockGridhrasiCase.poorvarupa.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <ChevronRight className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" /> {s}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* 3. Rupa */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Badge className="bg-blue-100 text-blue-700">3</Badge> Rupa (Signs & Symptoms)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {mockGridhrasiCase.rupa.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" /> {s}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* 4. Samprapti */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Badge className="bg-purple-100 text-purple-700">4</Badge> Samprapti (Pathogenesis Flow)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {Object.entries(mockGridhrasiCase.samprapti).map(([key, val], i, arr) => (
              <span key={key} className="flex items-center gap-2">
                <span className="bg-purple-50 border border-purple-200 rounded px-2 py-1">
                  <span className="font-semibold capitalize">{key}:</span> {val}
                </span>
                {i < arr.length - 1 && <ChevronRight className="h-4 w-4 text-purple-400" />}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 5. Upashaya */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Badge className="bg-green-100 text-green-700">5</Badge> Upashaya (Therapeutic Test)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="border rounded-lg p-3 bg-green-50/50">
            <p className="text-xs font-semibold text-green-700 mb-1">What Relieves</p>
            <p className="text-sm">{mockGridhrasiCase.upashaya.relieves}</p>
          </div>
          <div className="border rounded-lg p-3 bg-red-50/50">
            <p className="text-xs font-semibold text-red-700 mb-1">What Aggravates</p>
            <p className="text-sm">{mockGridhrasiCase.upashaya.aggravates}</p>
          </div>
          <div className="border rounded-lg p-3 bg-blue-50/50">
            <p className="text-xs font-semibold text-blue-700 mb-1">Diagnostic Confirmation</p>
            <p className="text-sm">{mockGridhrasiCase.upashaya.confirms}</p>
          </div>
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-lg">Additional Clinical Notes</CardTitle></CardHeader>
        <CardContent>
          <Textarea placeholder="Add clinical observations..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </CardContent>
      </Card>
    </div>
  );
};

export default RogaNidanaWorksheet;
