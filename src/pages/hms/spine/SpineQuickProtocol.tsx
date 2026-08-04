import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Activity, Zap, CheckCircle2, ArrowRight, Stethoscope, Heart,
  Clock, Target, Brain, Leaf, Star, Users,
} from "lucide-react";

export default function SpineQuickProtocol() {
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);

  const conditions = [
    { id: "sciatica", name: "Sciatica / Gridhrasi", emoji: "🦵", desc: "Leg pain radiating from back, L4-S1" },
    { id: "cervical", name: "Cervical Spondylosis", emoji: "🦴", desc: "Neck pain, arm numbness, C4-C7" },
    { id: "lbp", name: "Chronic Low Back Pain", emoji: "💪", desc: "Persistent lumbar pain, mechanical" },
    { id: "disc", name: "Disc Herniation / Bulge", emoji: "🔬", desc: "L4-L5 / L5-S1 disc involvement" },
    { id: "frozen", name: "Frozen Shoulder (Spine-linked)", emoji: "🤚", desc: "Cervicothoracic origin shoulder restriction" },
    { id: "headache", name: "Cervicogenic Headache", emoji: "🧠", desc: "Headache from C1-C3 spine, migraine-type" },
    { id: "knee", name: "Knee Pain (Postural Origin)", emoji: "🦿", desc: "Knee pain from pronation/hip/spine chain" },
    { id: "stiffness", name: "Morning Stiffness (Full Spine)", emoji: "🌅", desc: "Vata/Kapha type morning rigidity" },
    { id: "thoracic", name: "Upper Back / Inter-Scapular", emoji: "🔥", desc: "Burning between shoulder blades, T4-T8" },
    { id: "si", name: "SI Joint Dysfunction", emoji: "⚡", desc: "Sacroiliac pain, one-sided low back" },
  ];

  const protocols: Record<string, { dosha: string; level: string; level1: string[]; level2: string[]; therapies15: string[]; selfCare: string[]; modules: string[]; timeline: string; followUp: string[]; medicines: string[] }> = {
    sciatica: {
      dosha: "Vata (Gridhrasi — Vata Nanatmaja Vikara)",
      level: "L4-S1, Sciatic nerve pathway",
      level1: ["Agnikarma on gluteal trigger points (immediate relief)", "Viddha Karma at Kati region", "Trigger Point therapy — piriformis + QL", "Varma therapy — Chitambala Adi point"],
      level2: ["Kati Basti × 7 days (Dhanwantaram Taila @ 42°C)", "Tikta Ksheer Basti × 16 days (alternating Anuvasana/Niruha)", "Patra Pinda Sweda × 7 days", "Agnikarma × 3 sessions (weekly)"],
      therapies15: ["T1: Acupuncture — BL40 + BL60 + Huatuojiaji L4-S1", "T3: Dry Needling — Piriformis + Multifidus", "T9: Cupping — Sliding on erector spinae + gluteals", "T14: Marma — Kukundara + Katikataruna + Nitamba"],
      selfCare: ["BL40 acupressure 3×/day (60 sec each knee)", "Piriformis ball release (2 min each side)", "Cat-cow 10 reps morning + evening", "Ear seeds on spine zone (replace every 5 days)"],
      modules: ["M9: Lower Cross Syndrome (if anterior tilt)", "M6: Functional Assessment (single leg stability)", "M18: Dr. Saleem's 5-Step Method"],
      timeline: "Relief: 1-2 weeks | Significant: 4-6 weeks | Complete: 3-4 months",
      followUp: ["Day 1 post-L1: 'How is pain today?'", "Day 7: VAS reassessment", "Day 14: Mid-course review", "Monthly: maintenance session"],
      medicines: ["Maharasnadi Kashayam 15ml BD before food", "Yogaraja Guggulu 2 tabs BD", "Dhanwantaram Tailam (external for Abhyanga)", "Ksheerabala 101 Avarti Capsule 1-0-1"],
    },
    cervical: {
      dosha: "Vata-Pitta (Greeva Stambha / Manyastambha)",
      level: "C4-C7, Cervical nerve roots",
      level1: ["Marma therapy — Krikatika + Amsa points", "Doctor's therapy — cervical traction (gentle)", "Trigger Point — upper trapezius + levator scap", "Mudra therapy — Gyan Mudra + neck breathing"],
      level2: ["Greeva Basti × 7 days (Ksheerabala Taila @ 40°C)", "Nasya × 7 days (Anu Taila 6 drops per nostril)", "Abhyanga + Nadi Sweda (neck focus) × 7 days", "Shirodhara × 5 days (if stress component)"],
      therapies15: ["T1: Acupuncture — GB20 + GB21 + Huatuojiaji C4-C7", "T6: Shiatsu — BL10 + BL channel cervical segment", "T5: Ear seeds — cervical zone on antihelix", "T12: MET — cervical rotation + lateral flexion correction"],
      selfCare: ["GB20 self-press 3×/day (skull base, 60 sec)", "Chin tucks × 10 every hour (at desk)", "Greeva Sanchalana (neck rotations — slow × 5 each)", "Hot towel on neck before bed (5 min)"],
      modules: ["M8: Upper Cross Syndrome (UCS)", "M4: Lateral View (forward head posture)", "M16: Yoga — Pranayama for cervical"],
      timeline: "Relief: 3-5 days | Significant: 2-3 weeks | Complete: 2-3 months",
      followUp: ["Day 1: neck exercise compliance check", "Day 3: VAS reassessment", "Day 7: Nasya completion review", "Fortnightly: maintenance Greeva Basti"],
      medicines: ["Dhanwantaram Kashayam 15ml BD", "Ekangaveer Ras 1 tab BD", "Mahamasha Taila (external Greeva Abhyanga)", "Ashwagandha Churna 1 tsp night with milk"],
    },
    lbp: {
      dosha: "Vata-Kapha (Kati Shoola — chronic mechanical)",
      level: "L1-L5, Paraspinal muscles, Facet joints",
      level1: ["Agnikarma on paraspinal trigger points", "Marma — Kukundara bilateral", "Cupping (dry) on erector spinae", "Trigger Point — multifidus + QL"],
      level2: ["Kati Basti × 7 days (Sahacharadi + Dhanwantaram mix)", "Patra Pinda Sweda × 7 days", "Meru Chikitsa × 3 sessions (mobilization)", "Abhyanga + Swedana × 7 days (pre-Basti)"],
      therapies15: ["T1: Acupuncture — BL23 + BL25 + BL40 + Huatuojiaji", "T4: Trigger Point — Multifidus + QL + Gluteus medius", "T9: Cupping — sliding along erectors", "T11: Thai — assisted spinal twist + traction"],
      selfCare: ["Tennis ball wall roll on paraspinals (5 min/day)", "Cat-cow + bird-dog × 10 each morning", "BL40 acupressure (behind knees) 3×/day", "Avoid prolonged sitting >30 min without break"],
      modules: ["M9: Lower Cross Syndrome", "M7: Corrective Exercise (4-Phase)", "M14: Ayurvedic Assessment (Sparsha)"],
      timeline: "Relief: 3-5 days | Significant: 3-4 weeks | Complete: 2-4 months",
      followUp: ["Daily: exercise compliance check", "Weekly: VAS + ROM reassessment", "Monthly: Kati Basti maintenance", "Quarterly: full re-evaluation"],
      medicines: ["Rasnasaptakam Kashayam 15ml BD", "Yogaraja Guggulu 2 tabs BD", "Mahanarayan Taila (external)", "Guggulu Tiktakam Kashayam if Ama present"],
    },
    disc: {
      dosha: "Vata in Asthi-Majja Dhatu (Disc = Majja Kshaya)",
      level: "L4-L5 / L5-S1 (most common), Neural foramen",
      level1: ["Gentle traction (Doctor's therapy — decompression)", "Marma — Kukundara + Katikataruna", "Varma therapy — nerve release points", "NO Agnikarma directly on disc level (only paraspinal TrPs)"],
      level2: ["Kati Basti × 14 days (Ksheerabala 101 Taila @ 42°C)", "Tikta Ksheer Basti × 16 days (Asthi-Majja Dhatu nutrition)", "Pizhichil × 7 days (if nerve involvement severe)", "Meru Chikitsa GENTLE only (grade I-II mobilization)"],
      therapies15: ["T1: Electroacupuncture — Huatuojiaji L4-S1 (2/100Hz)", "T3: Dry Needling — multifidus at disc level", "T12: MET — for segmental restriction above/below disc", "T14: Marma — full Kati region Marma protocol"],
      selfCare: ["McKenzie extension in lying (prone press-up) × 10", "NO forward bending / heavy lifting", "BL40 + BL60 acupressure daily", "Knee-to-chest stretch (ONLY if extension-biased disc)"],
      modules: ["M4: Lateral View (lordosis assessment)", "M12: Flat Back (if decreased lordosis)", "M18: Dr. Saleem's 5-Step (MOVE test critical)"],
      timeline: "Relief: 1-2 weeks | Significant: 6-8 weeks | Complete: 4-6 months",
      followUp: ["Day 3: nerve symptom monitoring (leg numbness change)", "Weekly: VAS + SLR test", "Monthly: reassess — continue or modify", "Red flags: bladder/bowel → REFER immediately"],
      medicines: ["Tikta Ksheer Basti Dravya (as per Basti schedule)", "Ksheerabala 101 Avarti 1 cap BD", "Laksha Guggulu 2 tabs BD (bone nourishment)", "Ashwagandha + Bala combination (Rasayana)"],
    },
    frozen: {
      dosha: "Vata-Kapha (Avabahuka — Amsa Shosha)",
      level: "C5-T2 nerve supply to shoulder, Glenohumeral joint",
      level1: ["Agnikarma on shoulder trigger points (supraspinatus, infraspinatus)", "Marma — Amsa + Amsaphalaka points", "Doctor's therapy — gentle pendulum mobilization", "Cupping on upper back/shoulder area"],
      level2: ["Greeva Basti × 7 days (covering C5-T2)", "Patra Pinda Sweda on shoulder + upper back × 7 days", "Nasya × 7 days (Prana Vayu for nerve supply)", "Pichu on shoulder joint (oil-soaked cotton retained)"],
      therapies15: ["T1: Acupuncture — LI15 + SJ14 + GB21 + local Ashi points", "T10: Moxibustion — warming frozen joint (Kapha-cold type)", "T11: Thai — assisted shoulder rotation + stretch", "T6: Shiatsu — Amsa Sen line press + mobilization"],
      selfCare: ["Wall finger climbing exercise (flexion)", "Pendulum exercise 3×/day (circular arm swing)", "Towel stretch behind back (IR + ER)", "Hot pack on shoulder 15 min before exercises"],
      modules: ["M8: Upper Cross Syndrome (shoulder posture connection)", "M3: Anterior View (shoulder protraction check)", "M16: Yoga — shoulder-opening asanas"],
      timeline: "Relief: 1 week | Significant: 4-6 weeks | Complete: 3-6 months",
      followUp: ["Daily: ROM exercise compliance", "Weekly: shoulder ROM measurement (flexion, abduction, rotation)", "Fortnightly: Agnikarma repeat if needed", "Monthly: full reassessment"],
      medicines: ["Dhanwantaram Kashayam 15ml BD", "Yogaraja Guggulu 2 tabs BD", "Kottamchukkadi Taila (external shoulder)", "Eranda Taila 10ml bedtime (Vata Anulomana)"],
    },
    headache: {
      dosha: "Vata-Pitta (Shirahshoola from Greeva — cervicogenic)",
      level: "C1-C3, Suboccipital muscles, Greater occipital nerve",
      level1: ["Marma — Krikatika + Sthapani (between eyebrows)", "Trigger Point — suboccipitals + upper trap + SCM", "Varma — Kondai Kaalam stimulation", "Mudra — Gyan Mudra + Bhramari Pranayama"],
      level2: ["Nasya × 7 days (Anu Taila — primary treatment)", "Greeva Basti × 7 days (C1-C3 focus)", "Shirodhara × 7 days (stress + Pitta calming)", "Shirobasti (if chronic migraine — oil retention on head)"],
      therapies15: ["T1: Acupuncture — GB20 + GV20 + LI4 + Taiyang", "T5: Ear acupuncture — Shenmen + Occiput + Forehead point", "T6: Shiatsu — occipital + BL10 sustained press", "T8: Reflexology — big toe (head reflex zone)"],
      selfCare: ["GB20 self-press 3×/day (60 sec firm pressure)", "Suboccipital ball release (lie on 2 tennis balls at skull base)", "Avoid looking down at phone >10 min continuously", "Bhramari Pranayama 5 rounds morning + evening"],
      modules: ["M8: Upper Cross Syndrome (forward head → headache)", "M17: TCM — Du Mai + BL channel for head", "M14: Ayurvedic — Shabda + Sparsha Pareeksha"],
      timeline: "Relief: same day with Nasya | Significant: 1-2 weeks | Complete: 2-3 months",
      followUp: ["Day 1: headache frequency check", "Day 7: Nasya course completion review", "Fortnightly: VAS + headache diary", "Monthly: trigger reassessment"],
      medicines: ["Pathyadi Kashayam 15ml BD (specific for Shirahshoola)", "Shirashooladi Vajra Ras 1 tab BD", "Anu Taila for Nasya (6 drops per nostril)", "Brahmi Ghrita 1 tsp at bedtime"],
    },
    knee: {
      dosha: "Vata-Kapha (Janu Shoola from postural chain — ascending)",
      level: "L3-L4 nerve, Hip-Knee-Foot kinetic chain",
      level1: ["Agnikarma on knee trigger points (VMO, popliteal)", "Marma — Janu Marma bilateral", "Trigger Point — ITB + vastus lateralis + popliteus", "Varma — Ullangaal Varmam (knee-related)"],
      level2: ["Janu Basti × 7 days (warm oil retention on knee)", "Kati Basti × 7 days (if lumbar origin confirmed)", "Patra Pinda Sweda on knee + thigh × 7 days", "Upanaha Sweda (overnight poultice) × 7 nights"],
      therapies15: ["T1: Acupuncture — ST35 + ST36 + GB34 + local Ashi", "T11: Thai — hip opener stretches (knee pain from hip)", "T8: Reflexology — knee reflex zone on foot", "T13: Sujok — knee correspondence on hand"],
      selfCare: ["Arch strengthening: towel curls + single leg balance", "VMO activation: terminal knee extension with hold", "Foam roller ITB (outer thigh) 2 min each side", "Check footwear — proper arch support needed"],
      modules: ["M11: Pronation Distortion Syndrome (foot→knee chain)", "M6: Functional Assessment (single leg squat test)", "M15: Siddha Varma — lower limb Varmam"],
      timeline: "Relief: 1 week | Significant: 4-6 weeks | Complete: 3 months",
      followUp: ["Weekly: knee ROM + pain with stairs", "Fortnightly: posture chain reassessment", "Monthly: full lower limb evaluation", "Note: if no improvement in 4 weeks → imaging needed"],
      medicines: ["Rasnaerandadi Kashayam 15ml BD", "Kaishore Guggulu 2 tabs BD", "Kottamchukkadi Taila (external knee)", "Gandha Taila (Siddha — external application)"],
    },
    stiffness: {
      dosha: "Vata-Kapha (Stambha — Sheeta/Guru Guna excess)",
      level: "Full spine, worse in Kapha Kala (morning 6-10 AM)",
      level1: ["Full spine Marma therapy (awakening protocol)", "Cupping — sliding along entire erector spinae", "Moxibustion — GV4 + BL23 warming", "Doctor's therapy — full spine mobilization"],
      level2: ["Abhyanga + Swedana × 7 days (Vata-Kapha oil: Dhanwantaram)", "Choorna Pinda Sweda × 7 days (dry heat herbal bolus)", "Kati Basti × 7 days (warming)", "Virechana (if Ama/Kapha dominant)"],
      therapies15: ["T10: Moxibustion — entire BL channel warming", "T6: Shiatsu — full spine press + Sotai corrections", "T11: Thai — full body stretching routine", "T14: Marma — full 15-point spine Marma activation"],
      selfCare: ["Surya Namaskar (Sun Salutation) 3-5 rounds every morning", "Hot shower directed on spine (3 min morning)", "Self-Abhyanga with warm sesame oil before bath", "Avoid cold food/drink especially morning"],
      modules: ["M7: Corrective Exercise (Phase 1: Mobility)", "M16: Yoga — Surya Namaskar for spine", "M14: Ayurvedic — Akruti (body type) assessment"],
      timeline: "Relief: 2-3 days | Significant: 1-2 weeks | Complete: 1-2 months",
      followUp: ["Day 1: morning stiffness duration (minutes)", "Weekly: compare morning stiffness duration", "Monthly: seasonal adjustment (worse in winter)", "Ongoing: Ritucharya (seasonal routine) guidance"],
      medicines: ["Rasnasaptakam Kashayam 15ml BD (morning empty stomach)", "Trayodashang Guggulu 2 tabs BD", "Dhanwantaram Tailam (self-Abhyanga)", "Eranda Taila 10ml bedtime 2×/week"],
    },
    thoracic: { dosha: "Pitta-Vata (Prishtha Shoola — inter-scapular burning)", level: "T4-T8, Rhomboids, Middle trapezius", level1: ["Trigger Point — rhomboids + middle trap (ischemic compression)", "Cupping between scapulae (3-4 cups static)", "Marma — Amsaphalaka + Brihati Marma", "Agnikarma if chronic knots present"], level2: ["Prishtha Basti × 7 days (thoracic focus)", "Patra Pinda Sweda × 7 days (upper back)", "Greeva Basti + Prishtha extension × 7 days", "Lepa (cooling paste) if Pitta-dominant burning"], therapies15: ["T1: Acupuncture — BL15 + BL17 + BL43 (thoracic)", "T3: Dry Needling — rhomboids + serratus posterior", "T9: Cupping — static between scapulae", "T12: MET — thoracic extension + rotation correction"], selfCare: ["Theracane for inter-scapular self-compression", "Thoracic extension over foam roller (30 sec × 5)", "Scapular retraction exercises (squeeze shoulder blades)", "Posture reset: every 30 min pull shoulders back + breathe"], modules: ["M8: Upper Cross Syndrome (scapular position)", "M2: Posterior View (thoracic alignment)", "M5: Practical (scapular palpation)"], timeline: "Relief: 3-5 days | Significant: 2-3 weeks | Complete: 2 months", followUp: ["Daily: posture reset reminder", "Weekly: VAS + desk ergonomic check", "Monthly: full upper body reassessment"], medicines: ["Guduchyadi Kashayam 15ml BD (if Pitta)", "Kaishore Guggulu 2 tabs BD", "Pinda Taila (cooling external)", "Chandanadi Taila (if burning sensation)"] },
    si: { dosha: "Vata (Trika Shoola — Sacroiliac Vata Sanga)", level: "SI joint, L5-S1 junction, Piriformis, Gluteus medius", level1: ["Agnikarma on SI joint trigger points", "Marma — Kukundara bilateral (direct SI access)", "Doctor's therapy — SI mobilization / MET", "Trigger Point — piriformis + gluteus medius"], level2: ["Kati Basti × 7 days (covering SI area specifically)", "Tikta Ksheer Basti × 8 days (Vata in Asthi)", "Upanaha Sweda (warm poultice overnight on SI) × 7", "Meru Chikitsa for SI correction × 3 sessions"], therapies15: ["T1: Acupuncture — BL27 + BL28 + BL54 + GB30", "T3: Dry Needling — gluteus medius + piriformis", "T12: MET — SI joint self-correction technique", "T11: Thai — hip rotation + SI decompression stretches"], selfCare: ["SI belt for support during acute phase", "Bridge + squeeze (adductor activation) 3×/day", "Figure-4 piriformis stretch 30 sec × 3 each side", "Avoid single-leg standing / crossing legs"], modules: ["M9: Lower Cross Syndrome (pelvic tilt → SI strain)", "M5: Practical (PSIS palpation)", "M18: Dr. Saleem's 5-Step (TOUCH for SI)"], timeline: "Relief: 3-5 days | Significant: 2-3 weeks | Complete: 2-3 months", followUp: ["Day 1: pain with sitting/standing transitions", "Weekly: SI provocation tests", "Monthly: core stability reassessment", "If no response 4 weeks: imaging (MRI SI joints)"], medicines: ["Rasnasaptakam Kashayam 15ml BD", "Yogaraja Guggulu 2 tabs BD", "Sahacharadi Taila (external SI area)", "Eranda Taila 10ml bedtime (Apana Vata correction)"] },
  };

  const selected = selectedCondition ? protocols[selectedCondition] : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Zap className="h-6 w-6 text-amber-600" /> Quick Protocol Builder</h1>
          <p className="text-muted-foreground mt-1">Select condition → Get instant treatment plan (Level 1 + Level 2 + Therapies + Self-Care + Medicines)</p>
        </div>
        <Badge className="bg-amber-100 text-amber-700"><Brain className="h-3 w-3 mr-1" /> Clinical Decision Tool</Badge>
      </div>

      {/* Condition Selector */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">What is the patient's condition?</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {conditions.map(c => (
              <button key={c.id} onClick={() => setSelectedCondition(c.id)}
                className={`p-3 rounded-lg border text-left transition ${selectedCondition === c.id ? "bg-amber-100 border-amber-400 ring-2 ring-amber-300" : "hover:bg-muted"}`}>
                <span className="text-xl">{c.emoji}</span>
                <p className="font-medium text-xs mt-1">{c.name}</p>
                <p className="text-[9px] text-muted-foreground">{c.desc}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Protocol Output */}
      {selected && (
        <div className="space-y-4">
          {/* Header */}
          <Card className="border-amber-200 bg-amber-50/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">{conditions.find(c => c.id === selectedCondition)?.name}</h2>
                  <p className="text-sm text-muted-foreground">{selected.dosha} · {selected.level}</p>
                </div>
                <Badge variant="outline"><Clock className="h-3 w-3 mr-1" /> {selected.timeline}</Badge>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Level 1 */}
            <Card className="border-green-200">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-green-600" /> Level 1: Same Day Relief (OPD)</CardTitle></CardHeader>
              <CardContent><ul className="space-y-1.5">{selected.level1.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs"><CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />{item}</li>
              ))}</ul></CardContent>
            </Card>

            {/* Level 2 */}
            <Card className="border-purple-200">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Star className="h-4 w-4 text-purple-600" /> Level 2: Panchakarma Course</CardTitle></CardHeader>
              <CardContent><ul className="space-y-1.5">{selected.level2.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs"><CheckCircle2 className="h-3.5 w-3.5 text-purple-500 shrink-0 mt-0.5" />{item}</li>
              ))}</ul></CardContent>
            </Card>

            {/* 15 Therapies */}
            <Card className="border-blue-200">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4 text-blue-600" /> From 15 Integrative Therapies</CardTitle></CardHeader>
              <CardContent><ul className="space-y-1.5">{selected.therapies15.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs"><CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />{item}</li>
              ))}</ul></CardContent>
            </Card>

            {/* Self-Care */}
            <Card className="border-teal-200">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Heart className="h-4 w-4 text-teal-600" /> Patient Self-Care (Home)</CardTitle></CardHeader>
              <CardContent><ul className="space-y-1.5">{selected.selfCare.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs"><CheckCircle2 className="h-3.5 w-3.5 text-teal-500 shrink-0 mt-0.5" />{item}</li>
              ))}</ul></CardContent>
            </Card>

            {/* Medicines */}
            <Card className="border-amber-200">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Leaf className="h-4 w-4 text-amber-600" /> Medicines (Internal + External)</CardTitle></CardHeader>
              <CardContent><ul className="space-y-1.5">{selected.medicines.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs"><CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />{item}</li>
              ))}</ul></CardContent>
            </Card>

            {/* Modules + Follow-up */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-indigo-600" /> Modules to Assign + Follow-up</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs font-medium mb-1">Assign Modules:</p>
                  <div className="flex flex-wrap gap-1">{selected.modules.map(m => <Badge key={m} variant="outline" className="text-[9px]">{m}</Badge>)}</div>
                </div>
                <Separator />
                <div>
                  <p className="text-xs font-medium mb-1">Follow-up Schedule:</p>
                  <ul className="space-y-1">{selected.followUp.map((f, i) => (
                    <li key={i} className="text-[10px] text-muted-foreground flex items-center gap-1"><ArrowRight className="h-2.5 w-2.5 shrink-0" />{f}</li>
                  ))}</ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
