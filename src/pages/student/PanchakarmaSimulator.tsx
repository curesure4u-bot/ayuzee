import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Droplets, Info, Leaf, Play, RotateCcw, Stethoscope } from "lucide-react";

// ---------- Panchakarma Data ----------

type ProcedureStep = {
  title: string;
  duration: string;
  description: string;
  materials: string[];
  precautions: string[];
  tip: string;
};

type Panchakarma = {
  id: string;
  name: string;
  sanskrit: string;
  meaning: string;
  indication: string;
  contraindications: string[];
  poorvakarma: ProcedureStep[];
  pradhanakarma: ProcedureStep[];
  paschatkarma: ProcedureStep[];
};

const PANCHAKARMAS: Panchakarma[] = [
  {
    id: "vamana",
    name: "Vamana",
    sanskrit: "वमन",
    meaning: "Therapeutic Emesis",
    indication: "Kapha disorders — Asthma, allergies, skin diseases, obesity, PCOD, sinusitis",
    contraindications: ["Children < 12 years", "Elderly > 70", "Pregnancy", "Cardiac diseases", "Emaciated patients", "Bleeding disorders"],
    poorvakarma: [
      { title: "Deepana-Pachana", duration: "3-5 days", description: "Administer Trikatu Churna or Chitrakadi Vati to kindle Agni and digest Ama. Patient reports clear hunger and proper stool.", materials: ["Trikatu Churna 3g BD", "Or Chitrakadi Vati 2 BD", "Warm water"], precautions: ["Monitor appetite daily", "Stop when tongue is clear and hunger is sharp"], tip: "Pachana is complete when patient reports clear belching without taste." },
      { title: "Snehapana (Internal Oleation)", duration: "3-7 days", description: "Administer increasing doses of medicated ghee on empty stomach. Start with 30ml, increase by 30ml daily until Samyak Snigdha Lakshanas appear.", materials: ["Mahatiktaka Ghrita or plain ghee", "Starting dose: 30ml", "Warm water as Anupana"], precautions: ["Strict dietary regimen (light, warm food)", "No day sleep", "Monitor stool — oily stool = endpoint"], tip: "Samyak Snigdha signs: Snigdha Varcha (oily stool), Aversion to ghee, Softness of body." },
      { title: "Abhyanga & Swedana", duration: "3 days (after Snehapana)", description: "Full body oil massage with Kapha-reducing oils followed by steam therapy. This liquefies Kapha from peripheral tissues and moves it to Koshtha (GI tract).", materials: ["Til Taila or Dhanwantharam Taila", "Steam box / Bashpa Sweda", "Towels, warm room"], precautions: ["Avoid cold exposure after Swedana", "Light diet (Kapha Shamaka)"], tip: "On the day before Vamana, give Kapha-aggravating diet (milk, curd, sweets) at night." },
    ],
    pradhanakarma: [
      { title: "Vamana Procedure", duration: "Morning (early, empty stomach)", description: "1. Patient drinks milk/sugarcane juice until stomach feels full.\n2. Administer Vamana Yoga (Madanaphala Pippali + Vacha + Saindhava + Madhu).\n3. Wait for urge. Patient sits on knee-high chair.\n4. Support forehead, rub back upward during emesis.\n5. Count Vegas (bouts). Target: 4-8 Vegas.\n6. Note color progression: Kapha → Pitta-tinged → clear.\n7. Stop when Antiki Lakshana (bitter taste, Pitta) appears.", materials: ["Madanaphala Pippali Churna 5-10g", "Vacha Churna 3g", "Saindhava Lavana 5g", "Honey 30ml", "Yashtimadhu Phanta 2L (for Vamanopaga)", "Milk/Sugarcane juice 1-2L", "Emesis basin, towels"], precautions: ["Never force vomiting if urge absent", "Keep emergency drugs ready", "Continuous pulse monitoring", "Stop if blood appears"], tip: "Ideal time: Kapha Kala (6-10 AM). Patient should face East." },
    ],
    paschatkarma: [
      { title: "Dhumapana (Medicated Smoking)", duration: "After Vamana (same day)", description: "Mild medicated smoking with Haridra/Vacha wick to dry residual Kapha in upper respiratory tract.", materials: ["Dhumavarti (Haridra + Vacha)", "Fire source"], precautions: ["Maximum 3 puffs", "Exhale through mouth only"], tip: "This prevents Pratishyaya (cold) after Vamana." },
      { title: "Samsarjana Krama (Graduated Diet)", duration: "3-7 days based on Shuddhi", description: "Gradually re-introduce food:\nDay 1-2: Peya (thin rice gruel)\nDay 3-4: Vilepi (thick gruel)\nDay 5: Akrita Yusha (plain dal soup)\nDay 6: Krita Yusha (seasoned soup)\nDay 7: Normal light diet", materials: ["Rice, Moong dal", "Ghee (small quantity from Day 5)", "Mild spices (cumin, ginger)"], precautions: ["Do NOT skip days or eat heavy food early", "Avoid cold food/drink", "No exercise during this period"], tip: "Samsarjana duration depends on Shuddhi: Pravara = 7 days, Madhyama = 5 days, Avara = 3 days." },
    ],
  },
  {
    id: "virechana",
    name: "Virechana",
    sanskrit: "विरेचन",
    meaning: "Therapeutic Purgation",
    indication: "Pitta disorders — Skin diseases, hyperacidity, liver disorders, jaundice, gout, chronic fever",
    contraindications: ["Rectal prolapse", "Dehydration", "Ulcerative colitis (active)", "Pregnancy", "Very young/old", "Recent fever"],
    poorvakarma: [
      { title: "Deepana-Pachana", duration: "3-5 days", description: "Same as Vamana. Kindle digestive fire and ensure Ama is digested before Snehapana.", materials: ["Trikatu Churna or Panchakola Churna", "Warm water"], precautions: ["Wait for clear hunger signs"], tip: "Nirama signs: No coated tongue, clear appetite, normal stool." },
      { title: "Snehapana (Internal Oleation)", duration: "3-7 days", description: "Increasing doses of medicated ghee. For Pitta, use Mahatiktaka Ghrita or Kalyanaka Ghrita. Endpoint: Samyak Snigdha signs.", materials: ["Mahatiktaka Ghrita / Kalyanaka Ghrita", "Start 30ml, increase daily", "Warm water Anupana"], precautions: ["Same as Vamana Snehapana", "Monitor stool consistency daily"], tip: "Pitta patients may reach Snigdha faster (3-5 days typically)." },
      { title: "Abhyanga & Swedana", duration: "3 days", description: "Oil massage with cooling oils (Chandanadi Taila) followed by mild steam. Moves Pitta from Shakha to Koshtha.", materials: ["Chandanadi Taila / Ksheerabala Taila", "Mild steam (not intense for Pitta)"], precautions: ["Avoid excessive heat for Pitta patients", "Keep hydrated"], tip: "Night before Virechana: give Pitta-aggravating diet (slightly spicy, sour) to bring Pitta to Koshtha." },
    ],
    pradhanakarma: [
      { title: "Virechana Procedure", duration: "Morning (after light breakfast on previous night)", description: "1. Patient takes Virechana drug on empty stomach with warm water.\n2. Wait for first urge (usually 1-3 hours).\n3. Patient uses toilet freely. Count Vegas.\n4. Offer warm water between bouts to prevent dehydration.\n5. Note progression: Fecal → Pitta (yellow-green) → Kapha → Watery clear.\n6. Target: 15-30 Vegas for Madhyama Shuddhi.\n7. Stop when clear watery stool appears.", materials: ["Trivrit Lehya 25-50g OR Eranda Taila 30-60ml", "OR Abhayadi Modaka 4-6", "Warm water (copious)", "Draksha (raisins) for nausea"], precautions: ["Keep ORS ready", "Monitor pulse & hydration", "Do NOT suppress natural urges during process", "Stop if blood/excessive cramping"], tip: "Trivrit is the gold standard for Virechana. Eranda Taila is milder (Mridu Virechana)." },
    ],
    paschatkarma: [
      { title: "Samsarjana Krama", duration: "3-7 days based on Shuddhi", description: "Same graduated diet as post-Vamana. Peya → Vilepi → Yusha → Normal. Duration depends on number of Vegas achieved.", materials: ["Same as Vamana Samsarjana"], precautions: ["Avoid Pitta-aggravating foods", "No sun exposure", "Adequate rest"], tip: "Virechana Samsarjana is typically shorter than Vamana Samsarjana." },
    ],
  },
  {
    id: "basti",
    name: "Basti",
    sanskrit: "बस्ति",
    meaning: "Therapeutic Enema",
    indication: "Vata disorders — Arthritis, sciatica, constipation, neurological conditions, infertility, low back pain",
    contraindications: ["Diarrhea", "Rectal bleeding", "Diabetes (uncontrolled)", "Ascites", "Infancy", "Intestinal obstruction"],
    poorvakarma: [
      { title: "Local Abhyanga & Swedana", duration: "30-45 minutes", description: "Oil massage to abdomen, low back, and thighs followed by Nadi Sweda (local steam). Relaxes muscles and prepares colon.", materials: ["Bala Taila / Dhanwantharam Taila", "Nadi Sweda equipment", "Warm towels"], precautions: ["Focus on Kati and Udara region", "Ensure bowel is empty before Basti"], tip: "Patient should be on left lateral position after preparation." },
    ],
    pradhanakarma: [
      { title: "Niruha Basti (Kashaya Basti / Decoction Enema)", duration: "Retention: 48 min max (Muhurta)", description: "1. Prepare Basti Dravya: Mix in order — Makshika (honey) → Saindhava → Sneha (oil) → Kalka (paste) → Kashaya (decoction).\n2. Fill Basti Putaka (enema bag) with lukewarm mixture (total ~480ml).\n3. Patient in left lateral, right knee flexed.\n4. Lubricate nozzle, insert 4 Angula into rectum.\n5. Administer slowly and steadily.\n6. Patient retains as long as possible (ideal: 1 Muhurta = 48 min).\n7. Note expulsion and contents.", materials: ["Honey 80ml", "Saindhava 5g", "Til Taila 80ml", "Shatapushpa Kalka 20g", "Dashamoola Kashaya 320ml", "Basti Yantra (syringe/bag)", "Glycerine for lubrication"], precautions: ["Temperature: lukewarm (not hot)", "Never force if resistance felt", "Keep patient calm and relaxed"], tip: "Niruha given on empty stomach in the morning. Named 'Asthapana' because it restores health." },
      { title: "Anuvasana Basti (Oil Enema)", duration: "Retention: overnight ideal", description: "1. Give after light meal (unlike Niruha).\n2. Administer 60-120ml of medicated oil.\n3. Patient retains overnight; expelled naturally next morning.\n4. In Yoga Basti protocol: alternate Anuvasana and Niruha over 8 days.", materials: ["Til Taila / Dhanwantharam Taila 60-120ml", "Basti Yantra (smaller nozzle)", "Warm the oil to body temperature"], precautions: ["Given after food (opposite of Niruha)", "If oil not expelled by morning, give mild laxative"], tip: "Yoga Basti schedule: A-N-A-N-A-N-A-A (8 days, A=Anuvasana, N=Niruha)." },
    ],
    paschatkarma: [
      { title: "Post-Basti Care", duration: "1-3 days", description: "Light diet, avoid heavy exercise. Monitor stool for oil expulsion. Gradually return to normal diet and activity.", materials: ["Light food (Khichdi, dal)", "Warm water"], precautions: ["Avoid cold exposure", "No heavy lifting for 2 days", "Monitor for abdominal discomfort"], tip: "Success signs: Good appetite, lightness, proper elimination, pain relief." },
    ],
  },
  {
    id: "nasya",
    name: "Nasya",
    sanskrit: "नस्य",
    meaning: "Nasal Administration",
    indication: "Urdhvajatrugata Roga — Sinusitis, migraine, cervical spondylosis, facial palsy, hair fall, memory loss",
    contraindications: ["Acute cold/fever", "Just after meals", "Pregnancy", "Children < 7", "After head bath", "Rainy season (relatively)"],
    poorvakarma: [
      { title: "Mukha Abhyanga & Swedana", duration: "10-15 minutes", description: "Gentle face and neck massage with warm oil followed by mild steam to the face (Nadi Sweda). Opens nasal passages and loosens Kapha.", materials: ["Anu Taila / Ksheerabala Taila for massage", "Steam inhalation equipment", "Warm towel"], precautions: ["Protect eyes during steam", "Gentle pressure only on sinus areas"], tip: "Tap gently on forehead, cheeks, and nose bridge to stimulate sinuses." },
    ],
    pradhanakarma: [
      { title: "Nasya Procedure (Marsha Nasya)", duration: "5-10 minutes", description: "1. Patient lies supine, head slightly extended (pillow under shoulders).\n2. Close one nostril, instill 4-8 drops of warm medicated oil.\n3. Patient inhales gently (not forcefully).\n4. Repeat on other nostril.\n5. Gently massage nose, forehead, palms, soles.\n6. Patient spits out any oil that reaches throat (do NOT swallow).\n7. Rest for 2-5 minutes.", materials: ["Anu Taila / Shadbindu Taila (4-8 drops per nostril)", "Dropper", "Tissue/spittoon", "Warm water for gargle"], precautions: ["Oil must be at body temperature (warm in palm)", "Never during active nasal bleeding", "Head must be lower than body (extended position)"], tip: "Kavala (gargling with warm water) after Nasya clears residual oil from throat." },
    ],
    paschatkarma: [
      { title: "Dhumapana & Kavala", duration: "5 minutes after Nasya", description: "Mild medicated smoking followed by warm water gargling to clear residual Kapha and prevent accumulation in throat.", materials: ["Dhumavarti (optional)", "Warm water with Saindhava for gargling"], precautions: ["Do not expose to cold air/wind after Nasya", "Avoid cold water for 1 hour"], tip: "Nasya is best done daily in the morning for Pratimarsha (2 drops maintenance dose)." },
    ],
  },
  {
    id: "raktamokshana",
    name: "Raktamokshana",
    sanskrit: "रक्तमोक्षण",
    meaning: "Bloodletting Therapy",
    indication: "Rakta-Pitta disorders — Non-healing ulcers, gout, eczema, varicose veins, abscess, skin diseases",
    contraindications: ["Anemia", "Pregnancy", "Children", "Edema (Shotha)", "After Panchakarma", "Blood disorders"],
    poorvakarma: [
      { title: "Assessment & Preparation", duration: "Same day", description: "Assess patient's Bala, Hb level, blood pressure. Select method based on Dosha:\n- Jalouka (leech): Pitta conditions\n- Shringa (horn): Vata conditions\n- Pracchana (scarification): Kapha/localized conditions\nMark the site and prepare instruments.", materials: ["Leeches (if Jalouka method)", "Sterile blades (if Pracchana)", "Antiseptic", "Turmeric powder for hemostasis", "Bandage"], precautions: ["Check Hb (minimum 10g/dL)", "Written consent", "Ensure sterile instruments", "Have emergency drugs ready"], tip: "Leeches must be 'activated' before use — apply turmeric paste to the bite site to attract them." },
    ],
    pradhanakarma: [
      { title: "Jalouka (Leech) Application", duration: "20-45 minutes", description: "1. Clean the site with warm water (no antiseptic — leeches dislike chemicals).\n2. Apply a drop of milk/blood to attract leech.\n3. Place leech on site. It attaches and begins sucking.\n4. Cover with moist cotton to keep leech comfortable.\n5. Leech raises its head when done (or sprinkle turmeric to detach).\n6. After detachment, allow site to bleed freely for 2-3 minutes (Raktasrava).\n7. Apply Yashtimadhu/Turmeric powder, bandage.\n8. Induce leech to vomit ingested blood (apply turmeric to mouth end).", materials: ["Medicinal leeches (Nirvisha Jalouka)", "Turmeric powder", "Milk", "Moist cotton", "Yashtimadhu powder", "Sterile bandage", "Bowl for leech"], precautions: ["Use only medicinal species (NOT poisonous ones)", "One leech per patient (no reuse)", "Monitor for excessive bleeding", "Patient should not move during procedure"], tip: "A healthy leech sucks impure blood first. When it starts sucking pure blood, it detaches automatically." },
    ],
    paschatkarma: [
      { title: "Post-Raktamokshana Care", duration: "24-48 hours", description: "Apply antiseptic and tight bandage. Monitor for 30 minutes. Advise iron-rich diet. Review in 3-7 days for repeat if needed.", materials: ["Antiseptic cream", "Sterile bandage", "Iron-rich food advice"], precautions: ["No heavy work for 24 hours", "Keep wound dry", "Report if excessive swelling/oozing"], tip: "Maximum 3-4 sittings per disease episode, with 7-day gap between sessions." },
    ],
  },
];

// ---------- Main Page ----------

const PanchakarmaSimulator = () => {
  const [selectedPK, setSelectedPK] = useState<Panchakarma | null>(null);
  const [currentPhase, setCurrentPhase] = useState<"poorvakarma" | "pradhanakarma" | "paschatkarma">("poorvakarma");
  const [stepIdx, setStepIdx] = useState(0);

  const phases = selectedPK ? {
    poorvakarma: selectedPK.poorvakarma,
    pradhanakarma: selectedPK.pradhanakarma,
    paschatkarma: selectedPK.paschatkarma,
  } : null;

  const currentSteps = phases ? phases[currentPhase] : [];
  const currentStep = currentSteps[stepIdx] || null;
  const totalSteps = selectedPK ? selectedPK.poorvakarma.length + selectedPK.pradhanakarma.length + selectedPK.paschatkarma.length : 0;

  const getGlobalStepIdx = () => {
    if (!selectedPK) return 0;
    if (currentPhase === "poorvakarma") return stepIdx;
    if (currentPhase === "pradhanakarma") return selectedPK.poorvakarma.length + stepIdx;
    return selectedPK.poorvakarma.length + selectedPK.pradhanakarma.length + stepIdx;
  };

  const goNext = () => {
    if (stepIdx < currentSteps.length - 1) {
      setStepIdx(stepIdx + 1);
    } else if (currentPhase === "poorvakarma") {
      setCurrentPhase("pradhanakarma"); setStepIdx(0);
    } else if (currentPhase === "pradhanakarma") {
      setCurrentPhase("paschatkarma"); setStepIdx(0);
    }
  };

  const goPrev = () => {
    if (stepIdx > 0) {
      setStepIdx(stepIdx - 1);
    } else if (currentPhase === "paschatkarma" && selectedPK) {
      setCurrentPhase("pradhanakarma"); setStepIdx(selectedPK.pradhanakarma.length - 1);
    } else if (currentPhase === "pradhanakarma" && selectedPK) {
      setCurrentPhase("poorvakarma"); setStepIdx(selectedPK.poorvakarma.length - 1);
    }
  };

  const isFirst = currentPhase === "poorvakarma" && stepIdx === 0;
  const isLast = currentPhase === "paschatkarma" && stepIdx === currentSteps.length - 1;
  const progress = totalSteps > 0 ? ((getGlobalStepIdx() + 1) / totalSteps) * 100 : 0;

  const phaseColor = { poorvakarma: "text-blue-600", pradhanakarma: "text-orange-600", paschatkarma: "text-green-600" };

  if (!selectedPK) {
    return (
      <div className="max-w-4xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Droplets className="h-6 w-6 text-primary" /> Panchakarma Simulator</h1>
          <p className="text-sm text-muted-foreground mt-1">Step-by-step walkthrough of all 5 Panchakarma procedures with materials, precautions, and clinical tips</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PANCHAKARMAS.map((pk) => (
            <Card key={pk.id} className="hover:border-primary/30 transition-colors cursor-pointer" onClick={() => { setSelectedPK(pk); setCurrentPhase("poorvakarma"); setStepIdx(0); }}>
              <CardContent className="p-4 space-y-2">
                <h3 className="font-semibold text-base">{pk.name}</h3>
                <p className="text-xs text-muted-foreground">{pk.sanskrit} — {pk.meaning}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{pk.indication}</p>
                <div className="flex gap-1 flex-wrap">
                  <Badge variant="outline" className="text-[10px]">{pk.poorvakarma.length + pk.pradhanakarma.length + pk.paschatkarma.length} steps</Badge>
                </div>
                <Button size="sm" className="w-full mt-2 gap-1.5"><Play className="h-3.5 w-3.5" /> Start Simulation</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setSelectedPK(null)}><ArrowLeft className="h-5 w-5" /></Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{selectedPK.name} <span className="font-normal text-muted-foreground text-sm">({selectedPK.sanskrit})</span></h1>
          <p className="text-xs text-muted-foreground">{selectedPK.meaning} · {selectedPK.indication.split("—")[0]}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { setCurrentPhase("poorvakarma"); setStepIdx(0); }}><RotateCcw className="h-3.5 w-3.5 mr-1" /> Restart</Button>
      </div>

      {/* Progress */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className={`font-medium ${phaseColor[currentPhase]}`}>
            {currentPhase === "poorvakarma" ? "Poorvakarma (Pre)" : currentPhase === "pradhanakarma" ? "Pradhanakarma (Main)" : "Paschatkarma (Post)"}
          </span>
          <span>Step {getGlobalStepIdx() + 1} of {totalSteps}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Current Step */}
      {currentStep && (
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-primary" /> {currentStep.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px] gap-1"><Clock className="h-3 w-3" /> {currentStep.duration}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm whitespace-pre-wrap">{currentStep.description}</p>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1"><Leaf className="h-3 w-3 text-green-600" /> Materials Required</p>
              <ul className="space-y-1">
                {currentStep.materials.map((m, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="text-green-600 mt-0.5">•</span> {m}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1"><Info className="h-3 w-3 text-amber-600" /> Precautions</p>
              <ul className="space-y-1">
                {currentStep.precautions.map((p, i) => (
                  <li key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
                    <span className="mt-0.5">⚠</span> {p}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
              <p className="text-xs font-medium text-primary flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Clinical Tip</p>
              <p className="text-xs text-muted-foreground mt-0.5">{currentStep.tip}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contraindications (collapsed) */}
      <details className="text-xs">
        <summary className="cursor-pointer font-medium text-muted-foreground">Contraindications ({selectedPK.contraindications.length})</summary>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selectedPK.contraindications.map((c) => (
            <Badge key={c} variant="outline" className="text-[10px] text-red-700 border-red-200">{c}</Badge>
          ))}
        </div>
      </details>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" size="sm" onClick={goPrev} disabled={isFirst}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        {isLast ? (
          <Button size="sm" variant="default" onClick={() => setSelectedPK(null)}>
            <CheckCircle2 className="h-4 w-4 mr-1" /> Complete
          </Button>
        ) : (
          <Button size="sm" onClick={goNext}>
            Next <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default PanchakarmaSimulator;
