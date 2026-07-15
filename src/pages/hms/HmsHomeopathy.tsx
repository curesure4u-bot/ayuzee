import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Heart, Save, Plus, Search, X } from "lucide-react";

const HmsHomeopathy = () => {
  const [patientName, setPatientName] = useState("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [symptomInput, setSymptomInput] = useState("");
  const [miasm, setMiasm] = useState("");
  const [constitution, setConstitution] = useState("");
  const [remedy, setRemedy] = useState("");
  const [potency, setPotency] = useState("");
  const [thermals, setThermals] = useState("");

  const addSymptom = () => {
    if (symptomInput.trim() && !symptoms.includes(symptomInput.trim())) {
      setSymptoms([...symptoms, symptomInput.trim()]);
      setSymptomInput("");
    }
  };

  const removeSymptom = (s: string) => setSymptoms(symptoms.filter((x) => x !== s));

  const handleSave = () => {
    if (!patientName.trim()) return toast.error("Select a patient first");
    toast.success("Homeopathy case saved successfully");
  };

  // Common remedies for repertorization display
  const commonRemedies = [
    { name: "Arsenicum Album", abbr: "Ars", score: 18 },
    { name: "Nux Vomica", abbr: "Nux-v", score: 15 },
    { name: "Pulsatilla", abbr: "Puls", score: 14 },
    { name: "Sulphur", abbr: "Sulph", score: 13 },
    { name: "Lycopodium", abbr: "Lyc", score: 12 },
    { name: "Phosphorus", abbr: "Phos", score: 11 },
    { name: "Calcarea Carb", abbr: "Calc", score: 10 },
    { name: "Natrum Mur", abbr: "Nat-m", score: 9 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-pink-600" /> Homeopathy Clinical Module
          </h1>
          <p className="text-sm text-muted-foreground">
            Case taking, Repertorization, Miasm Analysis & Remedy Selection
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-1 h-4 w-4" /> Save Case
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Patient Name</Label>
              <Input value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Search patient" />
            </div>
            <div><Label>Case Number</Label><Input placeholder="Auto-generated" disabled /></div>
            <div><Label>Date</Label><Input type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="case-taking">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full">
          <TabsTrigger value="case-taking">Case Taking</TabsTrigger>
          <TabsTrigger value="repertory">Repertorization</TabsTrigger>
          <TabsTrigger value="miasm">Miasm Analysis</TabsTrigger>
          <TabsTrigger value="remedy">Remedy Selection</TabsTrigger>
          <TabsTrigger value="followup">Follow-up</TabsTrigger>
        </TabsList>

        <TabsContent value="case-taking" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Detailed Case Taking</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Chief Complaint</Label>
                  <Textarea placeholder="Main complaint with duration, modalities..." rows={3} />
                </div>
                <div>
                  <Label>History of Present Illness</Label>
                  <Textarea placeholder="Onset, progression, character of symptoms..." rows={3} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Thermals</Label>
                  <Select value={thermals} onValueChange={setThermals}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hot">Hot patient (Agg. heat)</SelectItem>
                      <SelectItem value="chilly">Chilly patient (Agg. cold)</SelectItem>
                      <SelectItem value="ambithermal">Ambithermal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Constitution</Label>
                  <Select value={constitution} onValueChange={setConstitution}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phosphoric">Phosphoric</SelectItem>
                      <SelectItem value="calcarea">Calcarea</SelectItem>
                      <SelectItem value="sulphuric">Sulphuric</SelectItem>
                      <SelectItem value="lycopodium">Lycopodium</SelectItem>
                      <SelectItem value="pulsatilla">Pulsatilla</SelectItem>
                      <SelectItem value="nux_vomica">Nux Vomica</SelectItem>
                      <SelectItem value="arsenicum">Arsenicum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Mental Generals</Label>
                <Textarea placeholder="Anxiety, fears, irritability, weeping, fastidious, jealousy..." rows={3} />
              </div>
              <div>
                <Label>Physical Generals</Label>
                <Textarea placeholder="Appetite, thirst, desires/aversions, sleep, perspiration, menses..." rows={3} />
              </div>
              <div>
                <Label>Modalities (Aggravations & Ameliorations)</Label>
                <Textarea placeholder="Worse: morning/evening/night, heat/cold, motion/rest, food..." rows={2} />
              </div>
              <div>
                <Label>Past & Family History</Label>
                <Textarea placeholder="TB, diabetes, cancer, skin diseases, mental illness in family..." rows={2} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repertory" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Repertorization</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Add Symptoms/Rubrics for Repertorization</Label>
                <div className="flex gap-2">
                  <Input
                    value={symptomInput}
                    onChange={(e) => setSymptomInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSymptom()}
                    placeholder="e.g., Mind; Anxiety; night"
                  />
                  <Button onClick={addSymptom} size="sm"><Plus className="h-4 w-4" /></Button>
                </div>
              </div>
              {symptoms.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {symptoms.map((s) => (
                    <Badge key={s} variant="secondary" className="gap-1">
                      {s}
                      <button onClick={() => removeSymptom(s)}><X className="h-3 w-3" /></button>
                    </Badge>
                  ))}
                </div>
              )}
              {/* Repertorization Results */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Remedy</th>
                      <th className="px-4 py-2 text-left font-medium">Abbreviation</th>
                      <th className="px-4 py-2 text-left font-medium">Score</th>
                      <th className="px-4 py-2 text-left font-medium">Match</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commonRemedies.map((r, i) => (
                      <tr key={r.abbr} className="border-b hover:bg-muted/30">
                        <td className="px-4 py-2 font-medium">{r.name}</td>
                        <td className="px-4 py-2">{r.abbr}</td>
                        <td className="px-4 py-2 font-bold">{r.score}</td>
                        <td className="px-4 py-2">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-pink-500 h-2 rounded-full"
                              style={{ width: `${(r.score / 18) * 100}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground">
                Based on Kent Repertory integration. Add symptoms above to refine results.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="miasm" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Miasm Analysis</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Dominant Miasm</Label>
                  <Select value={miasm} onValueChange={setMiasm}>
                    <SelectTrigger><SelectValue placeholder="Select miasm" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="psora">Psora (Deficiency)</SelectItem>
                      <SelectItem value="sycosis">Sycosis (Excess)</SelectItem>
                      <SelectItem value="syphilis">Syphilis (Destruction)</SelectItem>
                      <SelectItem value="tubercular">Tubercular (Psora + Syphilis)</SelectItem>
                      <SelectItem value="cancer">Cancer Miasm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Secondary Miasm</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="psora">Psora</SelectItem>
                      <SelectItem value="sycosis">Sycosis</SelectItem>
                      <SelectItem value="syphilis">Syphilis</SelectItem>
                      <SelectItem value="tubercular">Tubercular</SelectItem>
                      <SelectItem value="none">None identified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Miasmatic Evidence</Label>
                <Textarea placeholder="Family history indicators, skin manifestations, disease patterns, suppressions..." rows={3} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Card className="border-orange-200 bg-orange-50/30">
                  <CardContent className="p-3 text-center">
                    <p className="text-xs font-medium text-orange-700">Psoric Signs</p>
                    <p className="text-lg font-bold mt-1">—</p>
                  </CardContent>
                </Card>
                <Card className="border-blue-200 bg-blue-50/30">
                  <CardContent className="p-3 text-center">
                    <p className="text-xs font-medium text-blue-700">Sycotic Signs</p>
                    <p className="text-lg font-bold mt-1">—</p>
                  </CardContent>
                </Card>
                <Card className="border-red-200 bg-red-50/30">
                  <CardContent className="p-3 text-center">
                    <p className="text-xs font-medium text-red-700">Syphilitic Signs</p>
                    <p className="text-lg font-bold mt-1">—</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="remedy" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Remedy Selection & Prescription</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>Selected Remedy</Label>
                  <Input value={remedy} onChange={(e) => setRemedy(e.target.value)} placeholder="e.g., Arsenicum Album" />
                </div>
                <div>
                  <Label>Potency</Label>
                  <Select value={potency} onValueChange={setPotency}>
                    <SelectTrigger><SelectValue placeholder="Select potency" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6c">6C</SelectItem>
                      <SelectItem value="12c">12C</SelectItem>
                      <SelectItem value="30c">30C</SelectItem>
                      <SelectItem value="200c">200C</SelectItem>
                      <SelectItem value="1m">1M</SelectItem>
                      <SelectItem value="10m">10M</SelectItem>
                      <SelectItem value="50m">50M (CM)</SelectItem>
                      <SelectItem value="6x">6X</SelectItem>
                      <SelectItem value="12x">12X</SelectItem>
                      <SelectItem value="30x">30X</SelectItem>
                      <SelectItem value="q">Mother Tincture (Q)</SelectItem>
                      <SelectItem value="lm1">LM1</SelectItem>
                      <SelectItem value="lm2">LM2</SelectItem>
                      <SelectItem value="lm3">LM3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Dosage</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single dose</SelectItem>
                      <SelectItem value="bd">Twice daily</SelectItem>
                      <SelectItem value="tds">Thrice daily</SelectItem>
                      <SelectItem value="weekly">Once weekly</SelectItem>
                      <SelectItem value="sos">SOS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Justification for Remedy</Label>
                <Textarea placeholder="Key symptoms covered, constitutional match, miasmatic suitability..." rows={3} />
              </div>
              <div>
                <Label>Intercurrent Remedy (if needed)</Label>
                <Input placeholder="e.g., Sulphur 200C as intercurrent" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="followup" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Follow-up Evaluation</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Response to Remedy</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select response" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marked">Marked improvement</SelectItem>
                      <SelectItem value="moderate">Moderate improvement</SelectItem>
                      <SelectItem value="slight">Slight improvement</SelectItem>
                      <SelectItem value="no_change">No change</SelectItem>
                      <SelectItem value="aggravation">Initial aggravation</SelectItem>
                      <SelectItem value="worse">Getting worse</SelectItem>
                      <SelectItem value="new_symptoms">New symptoms appeared</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Hering's Law Direction</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="above_below">Above to below (Good)</SelectItem>
                      <SelectItem value="center_periphery">Center to periphery (Good)</SelectItem>
                      <SelectItem value="recent_old">Recent to old symptoms (Good)</SelectItem>
                      <SelectItem value="reverse">Reverse direction (Poor)</SelectItem>
                      <SelectItem value="not_applicable">Not applicable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Follow-up Notes</Label>
                <Textarea placeholder="Changes observed, new symptoms, old symptoms returning, general energy level..." rows={4} />
              </div>
              <div>
                <Label>Next Plan</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wait">Wait and watch (Sac lac)</SelectItem>
                    <SelectItem value="repeat_same">Repeat same remedy</SelectItem>
                    <SelectItem value="higher_potency">Higher potency of same remedy</SelectItem>
                    <SelectItem value="change_remedy">Change remedy</SelectItem>
                    <SelectItem value="intercurrent">Give intercurrent</SelectItem>
                    <SelectItem value="antidote">Antidote needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsHomeopathy;
