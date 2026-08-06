import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Activity, ArrowRight, CheckCircle2, Heart, Info, RotateCcw, Shuffle, X, Zap } from "lucide-react";

// ---------- Nadi Data ----------

type NadiPattern = {
  id: string;
  name: string;
  sanskrit: string;
  dosha: string;
  gati: string;
  animal_analogy: string;
  description: string;
  finger_position: string;
  characteristics: string[];
  clinical_significance: string[];
  pulse_visual: string; // ASCII art representation
};

const NADI_PATTERNS: NadiPattern[] = [
  {
    id: "vata",
    name: "Vata Nadi",
    sanskrit: "वात नाडी",
    dosha: "Vata",
    gati: "Sarpa Gati (Serpentine)",
    animal_analogy: "Moves like a snake — irregular, thin, fast, slithering",
    description: "Felt prominently under the INDEX finger (Tarjani). The pulse is thin, rapid, irregular in rhythm, and feels like a snake moving in zigzag. Low volume, cold to touch.",
    finger_position: "INDEX finger (below radial styloid) — Vata position",
    characteristics: ["Thin and thread-like (Tanu)", "Fast and irregular (Chala)", "Cold to touch (Sheeta)", "Disappears on slight pressure", "Variable rhythm — sometimes fast, sometimes slow", "Best felt in early morning (Vata Kala)"],
    clinical_significance: ["Anxiety, insomnia, nervousness", "Constipation, bloating", "Joint pain, crackling", "Dry skin, weight loss", "Irregular digestion (Vishama Agni)", "Neurological conditions"],
    pulse_visual: "╭─╮ ╭╮ ╭──╮  ╭╮╭╮\n│ ╰╮│╰─╯  ╰╮ ││╰╯\n╯  ╰╯      ╰─╯╰   ",
  },
  {
    id: "pitta",
    name: "Pitta Nadi",
    sanskrit: "पित्त नाडी",
    dosha: "Pitta",
    gati: "Manduka Gati (Frog-like)",
    animal_analogy: "Jumps like a frog — bounding, forceful, regular jumps",
    description: "Felt prominently under the MIDDLE finger (Madhyama). Bounding, forceful, regular rhythm with distinct 'jumping' quality. Warm to touch, moderate rate, full volume.",
    finger_position: "MIDDLE finger — Pitta position",
    characteristics: ["Bounding and jumping (Manduka)", "Warm/hot to touch (Ushna)", "Regular and forceful", "Moderate to fast rate", "Full volume — easily felt", "Prominent during midday (Pitta Kala)"],
    clinical_significance: ["Hyperacidity, inflammation", "Skin rashes, burning sensation", "Anger, irritability", "Loose stools, diarrhea", "Liver disorders, jaundice", "Bleeding tendencies (Raktapitta)"],
    pulse_visual: "   ╭╮   ╭╮   ╭╮   ╭╮\n───╯╰───╯╰───╯╰───╯╰──\n   ▲    ▲    ▲    ▲    ",
  },
  {
    id: "kapha",
    name: "Kapha Nadi",
    sanskrit: "कफ नाडी",
    dosha: "Kapha",
    gati: "Hamsa Gati (Swan-like)",
    animal_analogy: "Glides like a swan — slow, graceful, broad, majestic",
    description: "Felt prominently under the RING finger (Anamika). Slow, steady, broad, heavy pulse. Cool to touch. Feels like a swan gliding on water — smooth, rhythmic, unhurried.",
    finger_position: "RING finger — Kapha position",
    characteristics: ["Slow and steady (Manda)", "Broad and heavy (Sthula)", "Cool to touch (Sheeta)", "Low rate, high volume", "Very regular rhythm", "Prominent in morning (Kapha Kala, 6-10 AM)"],
    clinical_significance: ["Congestion, mucus", "Weight gain, lethargy", "Diabetes (Prameha)", "Edema, water retention", "Depression, sluggishness", "Hypothyroidism"],
    pulse_visual: "  ╭───╮   ╭───╮   ╭───╮\n──╯   ╰───╯   ╰───╯   ╰──\n  ~~~   ~~~   ~~~   ~~~  ",
  },
  {
    id: "vata_pitta",
    name: "Vata-Pitta Nadi",
    sanskrit: "वात-पित्त नाडी",
    dosha: "Vata-Pitta (Dual)",
    gati: "Mixed — Snake + Frog",
    animal_analogy: "Alternates between irregular slithering and forceful jumping",
    description: "Felt under both INDEX and MIDDLE fingers. Pulse shows features of both — sometimes irregular and thin (Vata), sometimes bounding and warm (Pitta). Rate is generally fast.",
    finger_position: "INDEX + MIDDLE fingers feel prominent",
    characteristics: ["Fast rate (Tikshna + Chala)", "Warm but variable volume", "Irregular force — sometimes strong, sometimes weak", "Can feel wiry and sharp", "Pulse changes with mental state"],
    clinical_significance: ["Acid reflux with bloating", "Migraine with anxiety", "Insomnia with irritability", "Skin diseases with dryness", "Variable appetite (hungry then nauseous)", "Inflammatory joint pain"],
    pulse_visual: "╭╮ ╭──╮╭╮  ╭─╮╭──╮\n│╰─╯  ╰╯╰──╯ ╰╯  ╰─\n▲  ~~~  ▲▲   ▲ ~~~  ",
  },
  {
    id: "pitta_kapha",
    name: "Pitta-Kapha Nadi",
    sanskrit: "पित्त-कफ नाडी",
    dosha: "Pitta-Kapha (Dual)",
    gati: "Mixed — Frog + Swan",
    animal_analogy: "Full and bounding but slower — like a heavy frog on a lake",
    description: "Felt under MIDDLE and RING fingers. Full, warm pulse that is slower than pure Pitta. Bounding quality with some heaviness. Regular rhythm.",
    finger_position: "MIDDLE + RING fingers feel prominent",
    characteristics: ["Full and heavy (Sthula + Bala)", "Warm to touch", "Moderate rate — not too fast", "Regular bounding rhythm", "Feels 'thick' under fingers"],
    clinical_significance: ["Obesity with inflammation", "Fatty liver, metabolic syndrome", "PCOD with acne", "Diabetes with infections", "Thyroid disorders", "Stagnation with heat signs"],
    pulse_visual: "  ╭──╮  ╭──╮  ╭──╮  \n──╯  ╰──╯  ╰──╯  ╰──\n  ▲▲   ▲▲   ▲▲   ▲▲ ",
  },
  {
    id: "sama",
    name: "Sama Nadi (Balanced)",
    sanskrit: "सम नाडी",
    dosha: "Tridosha Samya",
    gati: "Balanced — all fingers equal",
    animal_analogy: "Smooth flowing river — even, balanced, harmonious",
    description: "All three fingers feel EQUAL pulse. This indicates Tridosha balance (health). Regular, moderate rate, normal temperature, comfortable volume. This is the pulse of a healthy person (Swastha).",
    finger_position: "All three fingers (INDEX, MIDDLE, RING) feel equal",
    characteristics: ["Equal pressure under all 3 fingers", "Regular and rhythmic", "Normal temperature", "72-80 beats/minute (normal rate)", "Comfortable volume — not too strong or weak", "Indicates good health (Swastha Lakshana)"],
    clinical_significance: ["Perfect health", "Strong Ojas", "Good immunity (Vyadhi Kshamatva)", "Balanced Agni", "Sound sleep", "Clear mind"],
    pulse_visual: " ╭─╮ ╭─╮ ╭─╮ ╭─╮ ╭─╮\n─╯ ╰─╯ ╰─╯ ╰─╯ ╰─╯ ╰─\n ♥   ♥   ♥   ♥   ♥   ♥",
  },
];

// ---------- Quiz Component ----------

function NadiQuiz() {
  const [quizPattern, setQuizPattern] = useState<NadiPattern | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [answered, setAnswered] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const startQuestion = () => {
    const pattern = NADI_PATTERNS[Math.floor(Math.random() * NADI_PATTERNS.length)];
    const wrongOptions = NADI_PATTERNS.filter((p) => p.id !== pattern.id).sort(() => Math.random() - 0.5).slice(0, 3).map((p) => p.name);
    const allOptions = [...wrongOptions, pattern.name].sort(() => Math.random() - 0.5);
    setQuizPattern(pattern);
    setOptions(allOptions);
    setAnswered(null);
  };

  const handleAnswer = (answer: string) => {
    if (answered) return;
    setAnswered(answer);
    setScore((prev) => ({ correct: prev.correct + (answer === quizPattern!.name ? 1 : 0), total: prev.total + 1 }));
  };

  if (!quizPattern) {
    return (
      <Card><CardContent className="p-8 text-center space-y-4">
        <Activity className="h-10 w-10 text-primary mx-auto" />
        <h2 className="font-semibold text-lg">Nadi Pariksha Quiz</h2>
        <p className="text-sm text-muted-foreground">Read pulse characteristics and identify the Nadi type</p>
        {score.total > 0 && <p className="text-sm">Score: {score.correct}/{score.total}</p>}
        <Button onClick={startQuestion} className="gap-2"><Shuffle className="h-4 w-4" /> Start Quiz</Button>
      </CardContent></Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline">Score: {score.correct}/{score.total}</Badge>
        <Button variant="ghost" size="sm" onClick={() => setQuizPattern(null)}>End Quiz</Button>
      </div>
      <Card className="border-primary/20">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Identify this pulse pattern:</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
            <pre className="font-mono text-xs text-primary overflow-x-auto">{quizPattern.pulse_visual}</pre>
            <p><strong>Animal Analogy:</strong> {quizPattern.animal_analogy}</p>
            <p><strong>Finger Position:</strong> {quizPattern.finger_position}</p>
            <p><strong>Characteristics:</strong> {quizPattern.characteristics.slice(0, 3).join(", ")}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {options.map((opt) => {
              const isCorrect = opt === quizPattern.name;
              const isSelected = opt === answered;
              let variant: "default" | "outline" | "destructive" = "outline";
              if (answered) { if (isCorrect) variant = "default"; else if (isSelected) variant = "destructive"; }
              return (
                <Button key={opt} variant={variant} className="h-auto py-3 text-xs" onClick={() => handleAnswer(opt)} disabled={!!answered}>
                  {answered && isCorrect && <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
                  {answered && isSelected && !isCorrect && <X className="h-3.5 w-3.5 mr-1" />}
                  {opt}
                </Button>
              );
            })}
          </div>
          {answered && (
            <div className="flex justify-between items-center pt-2">
              <p className={`text-sm font-medium ${answered === quizPattern.name ? "text-green-600" : "text-red-600"}`}>
                {answered === quizPattern.name ? "Correct!" : `Wrong — it's ${quizPattern.name}`}
              </p>
              <Button size="sm" onClick={startQuestion}>Next <ArrowRight className="h-3.5 w-3.5 ml-1" /></Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------- Main Page ----------

const PulseReadingPractice = () => {
  const [selectedPattern, setSelectedPattern] = useState<NadiPattern | null>(null);
  const [mode, setMode] = useState<"learn" | "quiz">("learn");

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Activity className="h-6 w-6 text-primary" /> Pulse Reading Practice</h1>
        <p className="text-sm text-muted-foreground mt-1">Nadi Pariksha simulation — learn to identify Vata, Pitta, Kapha pulse patterns by their characteristics</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button variant={mode === "learn" ? "default" : "outline"} size="sm" onClick={() => setMode("learn")} className="gap-1.5">
          <Heart className="h-3.5 w-3.5" /> Learn Patterns
        </Button>
        <Button variant={mode === "quiz" ? "default" : "outline"} size="sm" onClick={() => setMode("quiz")} className="gap-1.5">
          <Shuffle className="h-3.5 w-3.5" /> Quiz Mode
        </Button>
      </div>

      {mode === "quiz" ? (
        <NadiQuiz />
      ) : (
        <div className="space-y-4">
          {/* Finger Position Guide */}
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2"><Info className="h-4 w-4 text-indigo-600" /> Finger Placement (Triskandha)</h3>
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="rounded-lg bg-white/60 p-2">
                  <p className="font-bold text-blue-700">INDEX</p>
                  <p className="text-muted-foreground">Vata</p>
                  <p className="text-[10px]">Below radial styloid</p>
                </div>
                <div className="rounded-lg bg-white/60 p-2">
                  <p className="font-bold text-orange-700">MIDDLE</p>
                  <p className="text-muted-foreground">Pitta</p>
                  <p className="text-[10px]">Middle position</p>
                </div>
                <div className="rounded-lg bg-white/60 p-2">
                  <p className="font-bold text-green-700">RING</p>
                  <p className="text-muted-foreground">Kapha</p>
                  <p className="text-[10px]">Proximal position</p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">Right hand pulse for males, Left hand for females. Examine in early morning on empty stomach.</p>
            </CardContent>
          </Card>

          {/* Pattern Cards */}
          <div className="grid gap-3 sm:grid-cols-2">
            {NADI_PATTERNS.map((pattern) => (
              <Card
                key={pattern.id}
                className={`cursor-pointer transition-colors hover:border-primary/30 ${selectedPattern?.id === pattern.id ? "border-primary ring-1 ring-primary/20" : ""}`}
                onClick={() => setSelectedPattern(selectedPattern?.id === pattern.id ? null : pattern)}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">{pattern.name}</h3>
                    <Badge variant="outline" className="text-[10px]">{pattern.dosha}</Badge>
                  </div>
                  <pre className="font-mono text-[10px] text-primary overflow-x-auto bg-muted/50 rounded p-2">{pattern.pulse_visual}</pre>
                  <p className="text-xs text-muted-foreground">{pattern.gati}</p>
                  <p className="text-xs italic text-muted-foreground">{pattern.animal_analogy}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Pattern Detail */}
          {selectedPattern && (
            <Card className="border-primary/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" /> {selectedPattern.name} <span className="text-sm font-normal text-muted-foreground">({selectedPattern.sanskrit})</span>
                  </CardTitle>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedPattern(null)}><X className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>{selectedPattern.description}</p>

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Finger Position</p>
                  <Badge variant="secondary">{selectedPattern.finger_position}</Badge>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Key Characteristics</p>
                  <ul className="space-y-1">
                    {selectedPattern.characteristics.map((c, i) => (
                      <li key={i} className="text-xs flex items-start gap-1.5"><span className="text-primary mt-0.5">•</span> {c}</li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1"><Heart className="h-3 w-3 text-red-500" /> Clinical Significance</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPattern.clinical_significance.map((s) => (
                      <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default PulseReadingPractice;
