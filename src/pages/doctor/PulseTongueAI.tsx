import { useState, useCallback } from "react";
import { Eye, Upload, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface DoshaScore {
  vata: number;
  pitta: number;
  kapha: number;
}

interface PulseAnswers {
  rate: string;
  quality: string;
  rhythm: string;
  depth: string;
  feel: string;
}

interface TongueAnswers {
  color: string;
  coating: string;
  shape: string;
  moisture: string;
  marks: string;
}

function calculatePulseDosha(answers: PulseAnswers): DoshaScore | null {
  if (!answers.rate || !answers.quality || !answers.rhythm || !answers.depth || !answers.feel) {
    return null;
  }
  let vata = 0, pitta = 0, kapha = 0;

  // Rate
  if (answers.rate === "slow") kapha += 2;
  else if (answers.rate === "normal") pitta += 1;
  else if (answers.rate === "fast") { vata += 1; pitta += 1; }

  // Quality
  if (answers.quality === "thread") vata += 2;
  else if (answers.quality === "bounding") pitta += 2;
  else if (answers.quality === "heavy") kapha += 2;

  // Rhythm
  if (answers.rhythm === "irregular") vata += 2;
  else if (answers.rhythm === "regular_strong") pitta += 2;
  else if (answers.rhythm === "regular_slow") kapha += 2;

  // Depth
  if (answers.depth === "superficial") vata += 1;
  else if (answers.depth === "medium") pitta += 1;
  else if (answers.depth === "deep") kapha += 1;

  // Feel
  if (answers.feel === "snake") vata += 2;
  else if (answers.feel === "frog") pitta += 2;
  else if (answers.feel === "swan") kapha += 2;

  const total = vata + pitta + kapha;
  return {
    vata: Math.round((vata / total) * 100),
    pitta: Math.round((pitta / total) * 100),
    kapha: Math.round((kapha / total) * 100),
  };
}

function calculateTongueDosha(answers: TongueAnswers): DoshaScore | null {
  if (!answers.color || !answers.coating || !answers.shape || !answers.moisture || !answers.marks) {
    return null;
  }
  let vata = 0, pitta = 0, kapha = 0;

  if (answers.color === "pale") vata += 2;
  else if (answers.color === "red") pitta += 2;
  else if (answers.color === "white") kapha += 2;

  if (answers.coating === "thin_dry") vata += 2;
  else if (answers.coating === "yellow") pitta += 2;
  else if (answers.coating === "thick_white") kapha += 2;

  if (answers.shape === "thin_trembling") vata += 2;
  else if (answers.shape === "medium_pointed") pitta += 2;
  else if (answers.shape === "thick_swollen") kapha += 2;

  if (answers.moisture === "dry") vata += 2;
  else if (answers.moisture === "moist") pitta += 2;
  else if (answers.moisture === "excessive") kapha += 2;

  if (answers.marks === "cracked") vata += 2;
  else if (answers.marks === "ulcers") pitta += 2;
  else if (answers.marks === "teeth_marks") kapha += 2;

  const total = vata + pitta + kapha;
  return {
    vata: Math.round((vata / total) * 100),
    pitta: Math.round((pitta / total) * 100),
    kapha: Math.round((kapha / total) * 100),
  };
}

function DoshaBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 text-sm font-medium">{label}</span>
      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-12 text-sm font-bold text-right">{value}%</span>
    </div>
  );
}

function DoshaResults({ score, title }: { score: DoshaScore; title: string }) {
  return (
    <Card className="mt-6 border-green-200 bg-green-50/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-green-800">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <DoshaBar label="Vata" value={score.vata} color="bg-purple-500" />
        <DoshaBar label="Pitta" value={score.pitta} color="bg-red-500" />
        <DoshaBar label="Kapha" value={score.kapha} color="bg-blue-500" />
      </CardContent>
    </Card>
  );
}

function ImageUpload({ label }: { label: string }) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
      toast.success("Image uploaded for documentation");
    }
  }, []);

  return (
    <div className="mt-4">
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-400 hover:bg-green-50/30 transition-colors">
        {preview ? (
          <img src={preview} alt="Upload preview" className="h-28 object-contain rounded" />
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="h-8 w-8 text-gray-400 mb-1" />
            <span className="text-sm text-gray-500">Click or drag to upload</span>
          </div>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </label>
    </div>
  );
}

export default function PulseTongueAI() {
  const [pulseAnswers, setPulseAnswers] = useState<PulseAnswers>({
    rate: "", quality: "", rhythm: "", depth: "", feel: "",
  });
  const [tongueAnswers, setTongueAnswers] = useState<TongueAnswers>({
    color: "", coating: "", shape: "", moisture: "", marks: "",
  });

  const pulseScore = calculatePulseDosha(pulseAnswers);
  const tongueScore = calculateTongueDosha(tongueAnswers);

  const combinedScore: DoshaScore | null =
    pulseScore && tongueScore
      ? {
          vata: Math.round((pulseScore.vata + tongueScore.vata) / 2),
          pitta: Math.round((pulseScore.pitta + tongueScore.pitta) / 2),
          kapha: Math.round((pulseScore.kapha + tongueScore.kapha) / 2),
        }
      : pulseScore || tongueScore;

  const getPrakriti = (score: DoshaScore): string => {
    const sorted = [
      { name: "Vata", val: score.vata },
      { name: "Pitta", val: score.pitta },
      { name: "Kapha", val: score.kapha },
    ].sort((a, b) => b.val - a.val);

    if (sorted[0].val - sorted[1].val < 10) {
      return `${sorted[0].name}-${sorted[1].name} Prakriti`;
    }
    return `Predominantly ${sorted[0].name} Prakriti`;
  };

  const getClinicalImplications = (score: DoshaScore): string[] => {
    const implications: string[] = [];
    if (score.vata >= 40) {
      implications.push("Prone to neurological, musculoskeletal, and anxiety disorders");
      implications.push("Recommend warm oil therapies (Abhyanga), Basti, and grounding routines");
    }
    if (score.pitta >= 40) {
      implications.push("Prone to inflammatory, hepatic, and skin conditions");
      implications.push("Recommend cooling therapies, Virechana, and Pitta-pacifying diet");
    }
    if (score.kapha >= 40) {
      implications.push("Prone to metabolic, respiratory, and congestive disorders");
      implications.push("Recommend stimulating therapies, Vamana, and light/warm diet");
    }
    if (implications.length === 0) {
      implications.push("Balanced constitution — focus on seasonal regimen (Ritucharya)");
      implications.push("Preventive Rasayana therapy recommended for maintenance");
    }
    return implications;
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Eye className="h-8 w-8 text-green-700" />
          <h1 className="text-3xl font-bold text-gray-900">
            Pulse & Tongue AI Assessment
          </h1>
        </div>
        <p className="text-gray-600">
          Nadi & Jihva Pariksha — Dosha analysis through guided clinical assessment
        </p>
      </div>

      <Tabs defaultValue="pulse" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="pulse">Nadi Pariksha (Pulse)</TabsTrigger>
          <TabsTrigger value="tongue">Jihva Pariksha (Tongue)</TabsTrigger>
          <TabsTrigger value="combined">Combined Analysis</TabsTrigger>
        </TabsList>

        {/* Pulse Tab */}
        <TabsContent value="pulse">
          <Card>
            <CardHeader>
              <CardTitle>Nadi Pariksha — Pulse Assessment</CardTitle>
              <p className="text-sm text-gray-500">Answer each parameter based on clinical pulse examination</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pulse Rate */}
              <div>
                <Label className="text-sm font-semibold">Pulse Rate</Label>
                <RadioGroup
                  value={pulseAnswers.rate}
                  onValueChange={(v) => setPulseAnswers({ ...pulseAnswers, rate: v })}
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="slow" id="rate-slow" />
                    <Label htmlFor="rate-slow">Slow (&lt;60 bpm) — Kapha indicator</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="normal" id="rate-normal" />
                    <Label htmlFor="rate-normal">Normal (60-80 bpm) — Pitta indicator</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fast" id="rate-fast" />
                    <Label htmlFor="rate-fast">Fast (&gt;80 bpm) — Vata/Pitta indicator</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Pulse Quality */}
              <div>
                <Label className="text-sm font-semibold">Pulse Quality</Label>
                <RadioGroup
                  value={pulseAnswers.quality}
                  onValueChange={(v) => setPulseAnswers({ ...pulseAnswers, quality: v })}
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="thread" id="qual-thread" />
                    <Label htmlFor="qual-thread">Thread-like / Feeble (Vata)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bounding" id="qual-bound" />
                    <Label htmlFor="qual-bound">Bounding / Jumping (Pitta)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="heavy" id="qual-heavy" />
                    <Label htmlFor="qual-heavy">Slow / Heavy / Full (Kapha)</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Pulse Rhythm */}
              <div>
                <Label className="text-sm font-semibold">Pulse Rhythm</Label>
                <RadioGroup
                  value={pulseAnswers.rhythm}
                  onValueChange={(v) => setPulseAnswers({ ...pulseAnswers, rhythm: v })}
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="irregular" id="rhy-irreg" />
                    <Label htmlFor="rhy-irreg">Irregular / Variable (Vata)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="regular_strong" id="rhy-strong" />
                    <Label htmlFor="rhy-strong">Regular & Strong (Pitta)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="regular_slow" id="rhy-slow" />
                    <Label htmlFor="rhy-slow">Regular & Slow (Kapha)</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Pulse Depth */}
              <div>
                <Label className="text-sm font-semibold">Pulse Depth</Label>
                <RadioGroup
                  value={pulseAnswers.depth}
                  onValueChange={(v) => setPulseAnswers({ ...pulseAnswers, depth: v })}
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="superficial" id="dep-sup" />
                    <Label htmlFor="dep-sup">Superficial — easily felt (Vata)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="dep-med" />
                    <Label htmlFor="dep-med">Medium depth (Pitta)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="deep" id="dep-deep" />
                    <Label htmlFor="dep-deep">Deep — requires pressure (Kapha)</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Pulse Feel */}
              <div>
                <Label className="text-sm font-semibold">Pulse Feel (Gati)</Label>
                <RadioGroup
                  value={pulseAnswers.feel}
                  onValueChange={(v) => setPulseAnswers({ ...pulseAnswers, feel: v })}
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="snake" id="feel-snake" />
                    <Label htmlFor="feel-snake">Like a snake — Sarpa Gati (Vata)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="frog" id="feel-frog" />
                    <Label htmlFor="feel-frog">Like a frog — Manduka Gati (Pitta)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="swan" id="feel-swan" />
                    <Label htmlFor="feel-swan">Like a swan — Hamsa Gati (Kapha)</Label>
                  </div>
                </RadioGroup>
              </div>

              <ImageUpload label="Upload pulse waveform image (optional)" />

              {pulseScore && <DoshaResults score={pulseScore} title="Pulse-Based Dosha Assessment" />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tongue Tab */}
        <TabsContent value="tongue">
          <Card>
            <CardHeader>
              <CardTitle>Jihva Pariksha — Tongue Assessment</CardTitle>
              <p className="text-sm text-gray-500">Evaluate tongue characteristics for dosha and Ama assessment</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tongue Color */}
              <div>
                <Label className="text-sm font-semibold">Tongue Color</Label>
                <RadioGroup
                  value={tongueAnswers.color}
                  onValueChange={(v) => setTongueAnswers({ ...tongueAnswers, color: v })}
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pale" id="tc-pale" />
                    <Label htmlFor="tc-pale">Pale / Bluish / Dusky (Vata)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="red" id="tc-red" />
                    <Label htmlFor="tc-red">Red / Yellow-coated (Pitta)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="white" id="tc-white" />
                    <Label htmlFor="tc-white">White-coated / Thick coating (Kapha)</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Tongue Coating */}
              <div>
                <Label className="text-sm font-semibold">Tongue Coating</Label>
                <RadioGroup
                  value={tongueAnswers.coating}
                  onValueChange={(v) => setTongueAnswers({ ...tongueAnswers, coating: v })}
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="thin_dry" id="coat-thin" />
                    <Label htmlFor="coat-thin">Thin / Dry / Scanty (Vata)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yellow" id="coat-yellow" />
                    <Label htmlFor="coat-yellow">Yellow / Moderate thickness (Pitta)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="thick_white" id="coat-thick" />
                    <Label htmlFor="coat-thick">Thick / White / Slimy (Kapha)</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Tongue Shape */}
              <div>
                <Label className="text-sm font-semibold">Tongue Shape</Label>
                <RadioGroup
                  value={tongueAnswers.shape}
                  onValueChange={(v) => setTongueAnswers({ ...tongueAnswers, shape: v })}
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="thin_trembling" id="sh-thin" />
                    <Label htmlFor="sh-thin">Thin / Trembling / Pointed (Vata)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium_pointed" id="sh-med" />
                    <Label htmlFor="sh-med">Medium / Slightly pointed tip (Pitta)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="thick_swollen" id="sh-thick" />
                    <Label htmlFor="sh-thick">Thick / Swollen / Broad (Kapha)</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Tongue Moisture */}
              <div>
                <Label className="text-sm font-semibold">Tongue Moisture</Label>
                <RadioGroup
                  value={tongueAnswers.moisture}
                  onValueChange={(v) => setTongueAnswers({ ...tongueAnswers, moisture: v })}
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dry" id="moist-dry" />
                    <Label htmlFor="moist-dry">Dry / Rough (Vata)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moist" id="moist-norm" />
                    <Label htmlFor="moist-norm">Moist / Normal (Pitta)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="excessive" id="moist-excess" />
                    <Label htmlFor="moist-excess">Excessive saliva / Wet (Kapha)</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Tongue Marks */}
              <div>
                <Label className="text-sm font-semibold">Marks / Cracks</Label>
                <RadioGroup
                  value={tongueAnswers.marks}
                  onValueChange={(v) => setTongueAnswers({ ...tongueAnswers, marks: v })}
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cracked" id="mk-crack" />
                    <Label htmlFor="mk-crack">Cracked / Fissured (Vata)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ulcers" id="mk-ulcer" />
                    <Label htmlFor="mk-ulcer">Ulcers / Red dots / Burning (Pitta)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="teeth_marks" id="mk-teeth" />
                    <Label htmlFor="mk-teeth">Teeth marks / Scalloped edges (Kapha)</Label>
                  </div>
                </RadioGroup>
              </div>

              <ImageUpload label="Upload tongue photo for documentation" />

              {tongueScore && (
                <>
                  <DoshaResults score={tongueScore} title="Tongue-Based Dosha Assessment" />
                  <Card className="mt-4 border-orange-200 bg-orange-50/50">
                    <CardContent className="pt-4">
                      <p className="text-sm font-medium text-orange-800">Ama Assessment:</p>
                      <p className="text-sm text-orange-700 mt-1">
                        {tongueAnswers.coating === "thick_white"
                          ? "Significant Ama (toxin) accumulation indicated. Thick white coating suggests Kapha-type Ama with Mandagni (weak digestion). Consider Deepana-Pachana therapy."
                          : tongueAnswers.coating === "yellow"
                          ? "Moderate Ama with Pitta involvement. Yellow coating suggests heat-processed toxins. Consider mild Virechana and bitter herbs."
                          : "Minimal Ama indicated. Thin coating suggests adequate digestive fire. Maintain with appropriate diet."}
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Combined Tab */}
        <TabsContent value="combined">
          <Card>
            <CardHeader>
              <CardTitle>Combined Dosha Analysis</CardTitle>
              <p className="text-sm text-gray-500">Integrated assessment from Nadi and Jihva Pariksha</p>
            </CardHeader>
            <CardContent>
              {combinedScore ? (
                <div className="space-y-6">
                  <DoshaResults score={combinedScore} title="Combined Dosha Score" />

                  <Card className="border-indigo-200 bg-indigo-50/50">
                    <CardContent className="pt-4">
                      <p className="text-lg font-semibold text-indigo-800">
                        {getPrakriti(combinedScore)}
                      </p>
                      <div className="mt-4">
                        <p className="text-sm font-medium text-indigo-700 mb-2">
                          Clinical Implications:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                          {getClinicalImplications(combinedScore).map((imp, i) => (
                            <li key={i} className="text-sm text-indigo-600">{imp}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Button
                    className="w-full bg-green-700 hover:bg-green-800"
                    onClick={() => toast.success("Assessment saved to patient record")}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save to Patient Record
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Eye className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg">Complete at least one assessment</p>
                  <p className="text-sm mt-1">
                    Fill in the Pulse or Tongue questionnaire to see combined analysis
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <p className="text-xs text-gray-400 text-center mt-8 italic">
        AI-assisted assessment tool. Clinical judgment must always prevail. This tool supports but does not replace clinical expertise.
      </p>
    </div>
  );
}
