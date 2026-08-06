import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Leaf, Search, Shuffle, X, Flower2, Droplets, ThermometerSun } from "lucide-react";
import { toast } from "sonner";

// ---------- Herb Database ----------

type Herb = {
  id: number;
  name: string;
  sanskrit: string;
  latin: string;
  family: string;
  rasa: string;
  guna: string;
  veerya: string;
  vipaka: string;
  dosha_karma: string;
  part_used: string;
  habitat: string;
  identification: string;
  therapeutic_uses: string[];
  dose: string;
  category: string;
};

const HERBS: Herb[] = [
  { id: 1, name: "Ashwagandha", sanskrit: "अश्वगन्धा", latin: "Withania somnifera", family: "Solanaceae", rasa: "Tikta, Kashaya", guna: "Laghu, Snigdha", veerya: "Ushna", vipaka: "Madhura", dosha_karma: "Vata-Kapha Shamaka", part_used: "Root", habitat: "Dry regions of India — Rajasthan, MP, Gujarat", identification: "Erect branching shrub (30-150cm). Leaves ovate, simple. Flowers small, greenish-yellow in axillary clusters. Fruit: red berry enclosed in papery calyx. Root: stout, fleshy, whitish-brown, horse-like smell.", therapeutic_uses: ["Rasayana (rejuvenator)", "Balya (strength)", "Vajikarana (aphrodisiac)", "Anxiety & insomnia", "Muscle wasting", "Arthritic conditions"], dose: "3-6g powder; 15-30ml kashaya", category: "Rasayana" },
  { id: 2, name: "Brahmi", sanskrit: "ब्राह्मी", latin: "Bacopa monnieri", family: "Scrophulariaceae", rasa: "Tikta, Kashaya", guna: "Laghu", veerya: "Sheeta", vipaka: "Madhura", dosha_karma: "Tridosha Shamaka (esp. Pitta)", part_used: "Whole plant", habitat: "Marshy areas, wet lands. Throughout India near water bodies.", identification: "Small creeping succulent herb. Leaves fleshy, oblong, sessile, oppositely arranged. Flowers small, pale blue/white with 4-5 petals. Found near ponds and streams. Taste: bitter.", therapeutic_uses: ["Medhya Rasayana (brain tonic)", "Memory enhancement", "Epilepsy", "Anxiety & stress", "Voice improvement", "Skin diseases"], dose: "2-4g powder; juice 10-20ml", category: "Medhya" },
  { id: 3, name: "Guduchi", sanskrit: "गुडूची", latin: "Tinospora cordifolia", family: "Menispermaceae", rasa: "Tikta, Kashaya", guna: "Guru, Snigdha", veerya: "Ushna", vipaka: "Madhura", dosha_karma: "Tridosha Shamaka", part_used: "Stem", habitat: "Climbing on Neem and Mango trees. Throughout tropical India.", identification: "Large climbing shrub with corky, papery bark. Stem: succulent with prominent nodes. Leaves heart-shaped (cordate), membranous. Aerial roots from branches. Bark has warty lenticels. Cross-section shows wheel-spoke pattern.", therapeutic_uses: ["Jvarahara (antipyretic)", "Rasayana", "Prameha (diabetes)", "Immune modulator", "Hepatoprotective", "Gout"], dose: "3-6g powder; juice 20-30ml", category: "Rasayana" },
  { id: 4, name: "Haridra (Turmeric)", sanskrit: "हरिद्रा", latin: "Curcuma longa", family: "Zingiberaceae", rasa: "Tikta, Katu", guna: "Ruksha, Laghu", veerya: "Ushna", vipaka: "Katu", dosha_karma: "Kapha-Pitta Shamaka", part_used: "Rhizome", habitat: "Cultivated throughout India. Andhra Pradesh, Tamil Nadu, Odisha major producers.", identification: "Perennial herb (60-90cm). Large oblong leaves from pseudostem. Rhizome: bright orange-yellow internally, aromatic, cylindrical with finger-like branches. Flowers: pale yellow in spike inflorescence with pink-tipped bracts.", therapeutic_uses: ["Kusthaghna (skin diseases)", "Shothaghna (anti-inflammatory)", "Wound healing", "Diabetes", "Liver disorders", "Cosmetic/complexion"], dose: "3-6g powder; paste externally", category: "Kusthaghna" },
  { id: 5, name: "Yashtimadhu (Licorice)", sanskrit: "यष्टीमधु", latin: "Glycyrrhiza glabra", family: "Fabaceae", rasa: "Madhura", guna: "Guru, Snigdha", veerya: "Sheeta", vipaka: "Madhura", dosha_karma: "Vata-Pitta Shamaka", part_used: "Root & Stolon", habitat: "Sub-Himalayan tracts, Jammu, Dehradun. Imported from Afghanistan.", identification: "Perennial herb/undershrub. Leaves compound, pinnate with 4-7 pairs of leaflets, sticky underside. Root: long, cylindrical, brown externally, yellow internally, distinctly SWEET taste. Flowers: pale blue-violet in axillary spikes.", therapeutic_uses: ["Kasa-Shvasa (cough, asthma)", "Amlapitta (hyperacidity)", "Peptic ulcer", "Voice improvement", "Eye diseases", "Wound healing"], dose: "3-5g powder; 50-100ml kashaya", category: "Kasahara" },
  { id: 6, name: "Amalaki (Amla)", sanskrit: "आमलकी", latin: "Emblica officinalis", family: "Euphorbiaceae", rasa: "Pancharasa (all except Lavana)", guna: "Guru, Ruksha, Sheeta", veerya: "Sheeta", vipaka: "Madhura", dosha_karma: "Tridosha Shamaka (esp. Pitta)", part_used: "Fruit", habitat: "Throughout deciduous forests of India. Cultivated widely.", identification: "Medium deciduous tree (8-18m). Leaves: small, linear-oblong, closely set on branchlets resembling pinnate leaf. Bark: grey, flaking. Fruit: globose, fleshy, 6-lobed, pale green/yellowish, sour taste, fibrous.", therapeutic_uses: ["Rasayana (premier rejuvenator)", "Prameha (diabetes)", "Raktapitta (bleeding disorders)", "Hair & eye tonic", "Scurvy (Vitamin C)", "Part of Triphala"], dose: "3-6g powder; juice 10-20ml", category: "Rasayana" },
  { id: 7, name: "Shatavari", sanskrit: "शतावरी", latin: "Asparagus racemosus", family: "Liliaceae", rasa: "Madhura, Tikta", guna: "Guru, Snigdha", veerya: "Sheeta", vipaka: "Madhura", dosha_karma: "Vata-Pitta Shamaka", part_used: "Tuberous root", habitat: "Throughout India in tropical and subtropical regions. Rocky hillsides.", identification: "Thorny climbing plant with pine-needle-like cladodes (modified stems). TRUE leaves reduced to thorns. Roots: tuberous, fascicled (cluster of 10-30), white, finger-like. Flowers: small, white, fragrant in racemes.", therapeutic_uses: ["Stanyajanana (galactagogue)", "Vajikarana (female reproductive)", "Shukrala (male fertility)", "Amlapitta (acidity)", "Rasayana", "Balya"], dose: "3-6g powder; 15-30ml juice", category: "Vajikarana" },
  { id: 8, name: "Tulasi (Holy Basil)", sanskrit: "तुलसी", latin: "Ocimum sanctum", family: "Lamiaceae", rasa: "Katu, Tikta", guna: "Laghu, Ruksha", veerya: "Ushna", vipaka: "Katu", dosha_karma: "Kapha-Vata Shamaka", part_used: "Leaves, seeds, whole plant", habitat: "Cultivated throughout India in households. Two varieties: Krishna & Rama Tulasi.", identification: "Erect aromatic herb (30-75cm). Stems quadrangular (square), hairy. Leaves: simple, opposite, ovate, serrated margins, strongly aromatic. Flowers: purplish in terminal racemes. Krishna variety: purple-tinged; Rama variety: green.", therapeutic_uses: ["Kasa-Shvasa (cough, cold)", "Jvara (fever)", "Krimighna (antimicrobial)", "Cardiac tonic", "Stress adaptogen", "Mosquito repellent"], dose: "Juice 10-20ml; leaves 5-10", category: "Kasahara" },
  { id: 9, name: "Bhumyamalaki", sanskrit: "भूम्यामलकी", latin: "Phyllanthus niruri", family: "Euphorbiaceae", rasa: "Tikta, Kashaya, Madhura", guna: "Laghu, Ruksha", veerya: "Sheeta", vipaka: "Madhura", dosha_karma: "Pitta-Kapha Shamaka", part_used: "Whole plant", habitat: "Throughout India as a weed in moist shady places. Rainy season herb.", identification: "Small annual herb (30-60cm). Leaves: small, elliptic, alternate, closely arranged on branches (looks like pinnate compound). Fruits: tiny, round, smooth capsules on UNDERSIDE of branches (hence Bhumi=ground + Amalaki=amla look-alike).", therapeutic_uses: ["Yakrit Vikara (liver disorders)", "Hepatitis B", "Jaundice", "Kidney stones", "Prameha (diabetes)", "Skin diseases"], dose: "3-6g powder; juice 10-20ml", category: "Yakritottejaka" },
  { id: 10, name: "Pippali (Long Pepper)", sanskrit: "पिप्पली", latin: "Piper longum", family: "Piperaceae", rasa: "Katu", guna: "Laghu, Snigdha", veerya: "Anushna (not very hot)", vipaka: "Madhura", dosha_karma: "Vata-Kapha Shamaka", part_used: "Fruit, Root (Pippalimula)", habitat: "North-eastern India, Western Ghats. Moist evergreen forests.", identification: "Slender climbing/creeping aromatic plant. Leaves: cordate (heart-shaped) at base, deep green, alternate, net-veined. Fruit spike: cylindrical, 2-3cm, greyish-black when dry, composed of tiny embedded fruits. Pungent taste. Resembles catkin.", therapeutic_uses: ["Kasahara (cough)", "Deepana (appetizer)", "Rasayana (with honey/ghee)", "Shvasa (asthma)", "Hepatoprotective", "Bioavailability enhancer"], dose: "1-3g powder; Vardhamana Pippali for Rasayana", category: "Deepaniya" },
  { id: 11, name: "Shankhapushpi", sanskrit: "शङ्खपुष्पी", latin: "Convolvulus pluricaulis", family: "Convolvulaceae", rasa: "Tikta, Katu, Kashaya", guna: "Snigdha", veerya: "Sheeta", vipaka: "Madhura", dosha_karma: "Tridosha Shamaka", part_used: "Whole plant", habitat: "Throughout India in dry, rocky areas. Rajasthan, Gujarat common.", identification: "Perennial prostrate herb spreading on ground. Stems: thin, hairy, multiple from root. Leaves: small, elliptic, alternate, hairy. Flowers: white/light blue, conch-shaped (Shankha = conch), single on axillary peduncle. Root: woody.", therapeutic_uses: ["Medhya (brain tonic)", "Epilepsy", "Insomnia", "Anxiety", "Memory & concentration", "Hypertension"], dose: "3-6g powder; juice 10-20ml", category: "Medhya" },
  { id: 12, name: "Nimba (Neem)", sanskrit: "निम्ब", latin: "Azadirachta indica", family: "Meliaceae", rasa: "Tikta, Kashaya", guna: "Laghu, Ruksha", veerya: "Sheeta", vipaka: "Katu", dosha_karma: "Kapha-Pitta Shamaka", part_used: "Bark, Leaves, Oil, Seeds", habitat: "Throughout India up to 700m. Hardy, drought-resistant tree.", identification: "Large evergreen tree (15-20m). Leaves: pinnately compound with 8-19 serrated leaflets, bitter taste. Bark: rough, grey-brown, fissured. Flowers: small, white, fragrant in axillary panicles. Fruit: oval drupe, yellow when ripe, single-seeded.", therapeutic_uses: ["Kusthaghna (skin diseases)", "Krimighna (anti-parasitic)", "Prameha (diabetes)", "Jvara (fever)", "Dental care", "Wound healing"], dose: "Bark kashaya 50ml; leaf juice 10-20ml; oil externally", category: "Kusthaghna" },
];

const CATEGORIES = ["All", "Rasayana", "Medhya", "Kasahara", "Kusthaghna", "Vajikarana", "Deepaniya", "Yakritottejaka"];

// ---------- Quiz Mode ----------

function QuizMode({ herbs }: { herbs: Herb[] }) {
  const [quizHerb, setQuizHerb] = useState<Herb | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [answered, setAnswered] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const startQuestion = () => {
    const herb = herbs[Math.floor(Math.random() * herbs.length)];
    const wrongOptions = herbs.filter((h) => h.id !== herb.id).sort(() => Math.random() - 0.5).slice(0, 3).map((h) => h.name);
    const allOptions = [...wrongOptions, herb.name].sort(() => Math.random() - 0.5);
    setQuizHerb(herb);
    setOptions(allOptions);
    setAnswered(null);
  };

  const handleAnswer = (answer: string) => {
    if (answered) return;
    setAnswered(answer);
    setScore((prev) => ({
      correct: prev.correct + (answer === quizHerb!.name ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  if (!quizHerb) {
    return (
      <Card>
        <CardContent className="p-8 text-center space-y-4">
          <Leaf className="h-10 w-10 text-primary mx-auto" />
          <h2 className="font-semibold text-lg">Herb Identification Quiz</h2>
          <p className="text-sm text-muted-foreground">Read the description and identify the herb. Test your Dravyaguna knowledge!</p>
          {score.total > 0 && <p className="text-sm">Score: {score.correct}/{score.total} ({Math.round((score.correct / score.total) * 100)}%)</p>}
          <Button onClick={startQuestion} className="gap-2"><Shuffle className="h-4 w-4" /> Start Quiz</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline">Score: {score.correct}/{score.total}</Badge>
        <Button variant="ghost" size="sm" onClick={() => { setQuizHerb(null); }}>End Quiz</Button>
      </div>

      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Identify this herb from its characteristics:</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
            <p><strong>Family:</strong> {quizHerb.family}</p>
            <p><strong>Part Used:</strong> {quizHerb.part_used}</p>
            <p><strong>Rasa:</strong> {quizHerb.rasa} | <strong>Veerya:</strong> {quizHerb.veerya} | <strong>Vipaka:</strong> {quizHerb.vipaka}</p>
            <p><strong>Identification:</strong> {quizHerb.identification}</p>
            <p><strong>Habitat:</strong> {quizHerb.habitat}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {options.map((opt) => {
              const isCorrect = opt === quizHerb.name;
              const isSelected = opt === answered;
              let variant: "default" | "outline" | "destructive" = "outline";
              if (answered) {
                if (isCorrect) variant = "default";
                else if (isSelected) variant = "destructive";
              }
              return (
                <Button key={opt} variant={variant} className="h-auto py-3" onClick={() => handleAnswer(opt)} disabled={!!answered}>
                  {answered && isCorrect && <CheckCircle2 className="h-4 w-4 mr-1" />}
                  {answered && isSelected && !isCorrect && <X className="h-4 w-4 mr-1" />}
                  {opt}
                </Button>
              );
            })}
          </div>

          {answered && (
            <div className="flex justify-between items-center pt-2">
              <p className={`text-sm font-medium ${answered === quizHerb.name ? "text-green-600" : "text-red-600"}`}>
                {answered === quizHerb.name ? "Correct!" : `Wrong — it's ${quizHerb.name}`}
              </p>
              <Button size="sm" onClick={startQuestion}>Next Question</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------- Main Page ----------

const HerbIdentifier = () => {
  const [tab, setTab] = useState("browse");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [selectedHerb, setSelectedHerb] = useState<Herb | null>(null);

  const filtered = useMemo(() => {
    let list = HERBS;
    if (catFilter !== "All") list = list.filter((h) => h.category === catFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((h) => h.name.toLowerCase().includes(q) || h.sanskrit.includes(q) || h.latin.toLowerCase().includes(q) || h.therapeutic_uses.some((u) => u.toLowerCase().includes(q)));
    }
    return list;
  }, [search, catFilter]);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Leaf className="h-6 w-6 text-primary" /> Herb Identifier</h1>
        <p className="text-sm text-muted-foreground mt-1">Browse Dravyaguna herbs with identification features, or quiz yourself on herb recognition</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="browse" className="gap-1.5"><Leaf className="h-3.5 w-3.5" /> Browse ({HERBS.length})</TabsTrigger>
          <TabsTrigger value="quiz" className="gap-1.5"><Shuffle className="h-3.5 w-3.5" /> Quiz Mode</TabsTrigger>
        </TabsList>

        {/* Browse Tab */}
        <TabsContent value="browse" className="space-y-4 mt-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search herb name, Latin, uses..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <select className="border rounded-md px-3 py-2 text-sm bg-background" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>{CATEGORIES.map((c) => <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>)}</select>
          </div>

          {/* Selected herb detail */}
          {selectedHerb && (
            <Card className="border-primary/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{selectedHerb.name} <span className="font-normal text-sm text-muted-foreground">({selectedHerb.sanskrit})</span></CardTitle>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedHerb(null)}><X className="h-4 w-4" /></Button>
                </div>
                <p className="text-xs text-muted-foreground italic">{selectedHerb.latin} — {selectedHerb.family}</p>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="rounded bg-muted/50 p-2"><p className="text-[10px] text-muted-foreground flex items-center gap-1"><Flower2 className="h-3 w-3" /> Rasa</p><p className="text-xs font-medium">{selectedHerb.rasa}</p></div>
                  <div className="rounded bg-muted/50 p-2"><p className="text-[10px] text-muted-foreground">Guna</p><p className="text-xs font-medium">{selectedHerb.guna}</p></div>
                  <div className="rounded bg-muted/50 p-2"><p className="text-[10px] text-muted-foreground flex items-center gap-1"><ThermometerSun className="h-3 w-3" /> Veerya</p><p className="text-xs font-medium">{selectedHerb.veerya}</p></div>
                  <div className="rounded bg-muted/50 p-2"><p className="text-[10px] text-muted-foreground flex items-center gap-1"><Droplets className="h-3 w-3" /> Vipaka</p><p className="text-xs font-medium">{selectedHerb.vipaka}</p></div>
                </div>
                <div><p className="text-xs font-medium text-muted-foreground">Dosha Karma</p><p>{selectedHerb.dosha_karma}</p></div>
                <div><p className="text-xs font-medium text-muted-foreground">Part Used</p><p>{selectedHerb.part_used}</p></div>
                <div><p className="text-xs font-medium text-muted-foreground">Identification</p><p className="text-muted-foreground">{selectedHerb.identification}</p></div>
                <div><p className="text-xs font-medium text-muted-foreground">Habitat</p><p className="text-muted-foreground">{selectedHerb.habitat}</p></div>
                <div><p className="text-xs font-medium text-muted-foreground">Therapeutic Uses</p>
                  <div className="flex flex-wrap gap-1 mt-1">{selectedHerb.therapeutic_uses.map((u) => <Badge key={u} variant="secondary" className="text-[10px]">{u}</Badge>)}</div>
                </div>
                <div><p className="text-xs font-medium text-muted-foreground">Dose</p><p>{selectedHerb.dose}</p></div>
              </CardContent>
            </Card>
          )}

          {/* Herb list */}
          <div className="space-y-2">
            {filtered.map((herb) => (
              <Card key={herb.id} className={`hover:border-primary/20 transition-colors cursor-pointer ${selectedHerb?.id === herb.id ? "border-primary/30" : ""}`} onClick={() => setSelectedHerb(herb)}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{herb.name} <span className="font-normal text-muted-foreground">({herb.sanskrit})</span></h3>
                      <p className="text-xs text-muted-foreground italic">{herb.latin}</p>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <Badge variant="outline" className="text-[10px]">{herb.category}</Badge>
                        <Badge variant="secondary" className="text-[10px]">{herb.veerya}</Badge>
                        <span className="text-[10px] text-muted-foreground">Part: {herb.part_used}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">{herb.rasa.split(",")[0]}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Quiz Tab */}
        <TabsContent value="quiz" className="mt-4">
          <QuizMode herbs={HERBS} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HerbIdentifier;
