import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Leaf, Heart, Dumbbell, Brain, Stethoscope, Activity,
  CheckCircle2, ChevronDown, ChevronUp, BookOpen, Star,
  Zap, Eye, Target, Users,
} from "lucide-react";

export default function SpineAyushNativeModules() {
  const [expandedModule, setExpandedModule] = useState<number | null>(14);

  const ayushModules = [
    {
      id: 14, title: "Ayurvedic Spine Assessment", subtitle: "Ashtavidha Pareeksha Applied to Spine",
      icon: Leaf, color: "text-green-600", bg: "bg-green-50 border-green-200",
      overview: "Apply the 8-fold Ayurvedic examination (Ashtavidha Pareeksha) specifically to spine patients. No Western anatomy knowledge needed — use your BAMS training directly.",
      topics: [
        { title: "Nadi Pareeksha (Pulse) for Spine", content: "Vata-dominant pulse = degenerative spine. Pitta pulse = inflammatory (acute disc). Kapha pulse = structural/obesity-related spine. Assess Gati (speed), Bala (strength), and Tala (rhythm) with spine focus.", clinical: "Vata Nadi + back pain = Kati Basti first. Pitta Nadi + inflammation = Lepa/Virechana first." },
        { title: "Mutra Pareeksha (Urine) for Spine", content: "Dark/scanty urine = Vata derangement (disc degeneration). Burning/yellow = Pitta (nerve inflammation). Heavy/cloudy = Kapha (structural). Tail bindu (oil drop test) on urine reveals Dosha.", clinical: "Vata Mutra pattern in spine patient confirms Basti karma as priority treatment." },
        { title: "Mala Pareeksha (Stool) for Spine", content: "Constipation/hard stool = Vata in Pakwashaya (Apana Vayu disturbed). Loose/burning = Pitta. Heavy/mucoid = Kapha. Apana Vayu seat is pelvis — directly affects lumbar spine.", clinical: "Never treat lumbar pain without correcting Apana Vayu (bowel regulation)." },
        { title: "Jihva Pareeksha (Tongue) for Spine", content: "Coated tongue = Ama (toxins). Tremulous tongue = Vata excess. Red/inflamed = Pitta. Pale/swollen = Kapha. Ama in Dhatus blocks healing — Shodhana needed before Shamana.", clinical: "Heavy Ama coating → do Deepana-Pachana first (7 days), then start spine Panchakarma." },
        { title: "Shabda Pareeksha (Voice) for Spine", content: "Hoarse/cracking voice = Vata in Greeva (cervical). Rough/strained = Prana Vayu involvement. If spine patient also has voice change → cervical nerve compression likely.", clinical: "Voice change + neck pain = C3-C4 involvement → Nasya + Greeva Basti priority." },
        { title: "Sparsha Pareeksha (Touch/Palpation)", content: "Palpate spine: Hot = Pitta/inflammation. Cold = Vata/degeneration. Swollen = Kapha/structural. Tenderness = Vata Sanga. Muscle hardness = Vata-Kapha. THIS is your main spine assessment tool.", clinical: "Most important Pareeksha for spine. Palpate every level — tenderness tells the story." },
        { title: "Drik Pareeksha (Eye/Observation)", content: "Observe posture (is it your Posterior/Anterior/Lateral view — but through AYUSH lens). Look for: Kshaya (wasting), Vriddhi (swelling), Sama (symmetry). Skin color changes over spine.", clinical: "What you SEE = equivalent to Modules M2-M4 but through Dosha lens instead of Western anatomy." },
        { title: "Akruti Pareeksha (Body Build)", content: "Vata Prakriti: thin, tall, dry → prone to disc degeneration. Pitta: medium, muscular → prone to inflammatory disc. Kapha: heavy, broad → prone to degenerative arthritis, obesity-spine. Body type determines treatment approach.", clinical: "Prakriti determines: oil type, duration of treatment, dietary advice, and prognosis timeline." },
        { title: "Dashavidha Pareeksha for Spine", content: "10-fold examination: Prakriti, Vikriti, Sara (tissue quality), Samhanana (compactness), Pramana (measurements), Satmya (adaptability), Sattva (mind), Ahara Shakti (digestion), Vyayama Shakti (exercise capacity), Vaya (age).", clinical: "Sara assessment: Asthi Sara = strong bones (good prognosis). Mamsa Sara = strong muscles (faster recovery). Both weak = longer treatment needed." },
        { title: "Sroto Pareeksha (Channel Assessment)", content: "Key Srotas for spine: Asthi Vaha (bone channel), Majja Vaha (nerve/marrow channel), Mamsa Vaha (muscle channel). Signs of Sroto Dushti: pain, swelling, grating, weakness, numbness.", clinical: "Asthi-Majja Sroto Dushti = disc + nerve involvement → Tikta Ksheer Basti is specific treatment." },
      ],
    },
    {
      id: 15, title: "Siddha Varma Spine Evaluation", subtitle: "96/108 Varma Point Assessment for Spinal Disorders",
      icon: Zap, color: "text-amber-600", bg: "bg-amber-50 border-amber-200",
      overview: "Siddha medicine's unique contribution — Varma points (vital points) that when disturbed cause spine problems, and when stimulated correctly, heal them. Based on your Siddha training.",
      topics: [
        { title: "Varma System Overview for Spine", content: "96 Varma points in the body (some texts say 108). Spine-related Varmam: Kondai Kaalam (head-spine junction), Mantharai Kaalam (cervical), Pidarikkalam (upper back), Chitambala Adi (lumbar), Kuthikaal (sacral).", clinical: "When a Varma point is 'disturbed' (trauma, posture, stress), it creates downstream nerve/organ problems." },
        { title: "Padu Varmam (Trauma Varma) for Spine", content: "Points that get disturbed by injury/fall/posture. Assess: Is there a history of fall/accident/sudden movement? Which Padu Varmam was affected? Tenderness at specific Varma = confirms involvement.", clinical: "History of fall + tenderness at Varma point = direct treatment target (Thokku or Thattu technique)." },
        { title: "Todu Varmam (Touch Points) for Assessment", content: "Gentle touch assessment: press each spine-related Varma with fingertip. Patient's response: pain, tingling, referred sensation = active Varma. No response = healthy Varma.", clinical: "This is YOUR version of 'posture assessment' — assess Varma points instead of anatomical landmarks." },
        { title: "Nerve Pathway (Narambu) Assessment", content: "Siddha identifies 72,000 Narambu (nerve channels). Key spine channels: Suzhumunai (central), Idakalai (left), Pingalai (right). Assess flow by: pulse at wrist, tenderness along pathway, patient symptoms.", clinical: "Suzhumunai block = central spine pain. Idakalai block = left-side symptoms. Pingalai = right-side." },
        { title: "Mantra + Varma + Oil — Triple Protocol", content: "Traditional Siddha spine treatment combines: (1) Varma stimulation (Thokku/Thattu), (2) Specific oil application (Iluppennai, Notchi oil), (3) Mantra vibration therapy. All three together amplify effect.", clinical: "Apply Varma therapy first → oil massage → mantra/breathing. This is your complete Siddha spine consultation." },
        { title: "Pathiyam (Diet Restrictions in Siddha)", content: "Siddha mandates specific diet during spine treatment: avoid cold foods, sour items, excessive salt. Recommended: warm foods, millets, Siddha kashayas. Pathiyam non-compliance = treatment failure.", clinical: "ALWAYS give Pathiyam chart to patient. Non-compliance is #1 reason for failed treatment in Siddha." },
      ],
    },
    {
      id: 16, title: "Yoga-Based Spine Assessment", subtitle: "Pancha Kosha & Asana-Based Functional Evaluation",
      icon: Dumbbell, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200",
      overview: "Assess spine through Yoga framework: which Kosha (layer) is affected? Which Chakra is blocked? Which Asana reveals the restriction? Uses YOUR yoga training — no Western anatomy needed.",
      topics: [
        { title: "Pancha Kosha Assessment", content: "5 layers: Annamaya (physical — pain, stiffness), Pranamaya (energy — fatigue, breathlessness), Manomaya (mind — stress-related pain), Vijnanamaya (awareness — poor body sense), Anandamaya (bliss — loss of joy). Which layer is PRIMARY for this patient?", clinical: "Physical-only pain → treat body. Stress-driven pain → treat Pranamaya + Manomaya first (Pranayama + meditation before therapy)." },
        { title: "Chakra-Spine Correlation Assessment", content: "Muladhara (L5-Coccyx): stability, grounding issues. Swadhisthana (L1-L3): reproductive/creative block. Manipura (T12-T8): power/digestion. Anahata (T1-T4): emotional. Vishuddha (C4-C7): expression. Ajna (C1-C3): clarity.", clinical: "Blocked Chakra = specific spinal level. Treat the Chakra → spine symptoms improve. Use specific asanas + mantras per Chakra." },
        { title: "Asana-Based Functional Test", content: "Test key asanas and note restrictions: Tadasana (standing alignment), Pashchimottanasana (forward bend = hamstrings), Bhujangasana (extension = spine flexibility), Trikonasana (lateral = side muscles), Ardha Matsyendrasana (rotation).", clinical: "Which asana is restricted tells you which movement is lost → target that specific direction in treatment." },
        { title: "Pranayama Assessment", content: "Test breathing: Nostril dominance (Ida/Pingala), Breath hold capacity (Kumbhaka), Chest vs abdominal breathing. Restricted breathing = Prana Vayu dysfunction = cervicothoracic involvement.", clinical: "Poor Kumbhaka + upper back pain = thoracic spine + respiratory connection. Treat with Pranayama + thoracic Panchakarma." },
        { title: "Yoga Therapy Prescription", content: "Based on assessment, prescribe: (1) Specific asanas for restricted direction, (2) Pranayama for energy level, (3) Meditation/Yoga Nidra for stress component, (4) Bandhas for core stability (Mula Bandha, Uddiyana).", clinical: "Create a personalized 15-min Yoga prescription card for EACH patient. This IS their homework." },
      ],
    },
    {
      id: 17, title: "TCM Meridian Spine Assessment", subtitle: "Bladder Channel & Du Mai Evaluation for Spine",
      icon: Brain, color: "text-red-600", bg: "bg-red-50 border-red-200",
      overview: "Assess spine through Traditional Chinese Medicine lens: Bladder meridian (back), Du Mai (governing vessel), Kidney essence. If you practice acupuncture — this is your framework.",
      topics: [
        { title: "BL Channel Palpation (Back Shu Points)", content: "Bladder meridian runs 1.5 cun + 3 cun lateral to spine. Each vertebral level has a Back-Shu point connecting to an organ. Palpate tenderness = identifies involved organ + spine level simultaneously.", clinical: "BL23 tender = Kidney weakness + L2 involvement. BL18 tender = Liver issue + T9 spine. One palpation gives BOTH spine + organ diagnosis." },
        { title: "Du Mai (Governing Vessel) Assessment", content: "Midline spine channel: GV4 (Mingmen/Life Gate at L2), GV14 (C7-T1), GV20 (crown). Press each — tenderness = Yang deficiency at that level. Cold at GV4 = Kidney Yang deficiency.", clinical: "Cold GV4 + low back pain = Kidney Yang deficiency → Moxa GV4 + Kati Basti with warm oil." },
        { title: "Kidney Essence (Jing) Assessment for Spine", content: "TCM: Kidney governs bones. Weak Kidney Jing = weak spine (degeneration). Signs: early graying, loose teeth, weak knees, hearing loss, low libido, fatigue. More signs = worse spinal degeneration prognosis.", clinical: "Multiple Kidney Jing depletion signs → longer treatment needed. Add Kidney-nourishing herbs + Basti." },
        { title: "Pattern Diagnosis for Spine", content: "Key spine patterns: (1) Kidney Yang Deficiency (cold + weak + chronic), (2) Blood Stagnation (sharp + fixed + worse at night), (3) Damp-Cold Invasion (heavy + worse in rain), (4) Liver Qi Stagnation (stress + migrating pain).", clinical: "Pattern determines point selection + herb selection + therapy choice. Don't treat all back pain the same." },
        { title: "Acupuncture Point Prescription Building", content: "Based on pattern: select local points (Huatuojiaji at level) + distal points (BL40, GB34) + pattern points (KD3 for Kidney, LR3 for Liver, SP9 for Damp). Build 6-8 point prescription.", clinical: "This replaces Western 'muscle imbalance' thinking with energetic diagnosis → same result, different framework." },
      ],
    },
    {
      id: 18, title: "Dr. Saleem's Clinical Spine Protocol", subtitle: "Simple 5-Step Method — Your Daily Clinical Practice",
      icon: Star, color: "text-purple-600", bg: "bg-purple-50 border-purple-200",
      overview: "YOUR simplified clinical protocol that combines the best of all systems into a practical 5-step method. This is what you do with EVERY spine patient — quick, effective, no complex Western anatomy needed.",
      topics: [
        { title: "Step 1: LOOK (Drishti Pareeksha)", content: "Simply LOOK at the patient standing: Are they tilted? Is one shoulder higher? Do they lean forward? Is there a visible curve? Can they stand straight comfortably? This takes 30 seconds and gives you 70% of the information.", clinical: "Tilted = spinal deviation. Forward lean = disc/flexion pattern. Can't stand straight = severe. Shoulder height difference = thoracic/cervical involvement." },
        { title: "Step 2: TOUCH (Sparsha Pareeksha)", content: "Run your hand down the spine: Where is it hot? Where is it cold? Where does the patient flinch? Where is muscle hard like stone? Where is it empty/wasted? This tells you the EXACT level and Dosha.", clinical: "Hot + tender = Pitta (inflammation) → Lepa/cooling. Cold + stiff = Vata (degeneration) → Basti/warming. Hard lump = Kapha (structural) → Agnikarma/deep therapy." },
        { title: "Step 3: MOVE (Cheshta Pareeksha)", content: "Ask patient to: Bend forward (Flexion), Bend backward (Extension), Bend sideways (Lateral), Turn/twist (Rotation). Which direction is restricted? Which direction causes pain? Which is comfortable?", clinical: "Restricted flexion = disc/hamstring. Restricted extension = facet/stenosis. Restricted rotation = thoracic. Restricted lateral = muscle spasm one side." },
        { title: "Step 4: DIAGNOSE (Dosha + Level + Direction)", content: "Combine Steps 1-3 into simple diagnosis: (1) Which DOSHA? (Vata/Pitta/Kapha), (2) Which LEVEL? (Cervical/Thoracic/Lumbar/Sacral), (3) Which DIRECTION is restricted? (Flexion/Extension/Rotation/Lateral). That's your diagnosis.", clinical: "Example: 'Vata at L4-S1 with restricted flexion' → Treatment: Kati Basti + Tikta Ksheer Basti + flexion-mobilization + self-BL40 acupressure." },
        { title: "Step 5: TREAT (Protocol Selection)", content: "Based on diagnosis, select from YOUR toolkit: Level 1 therapy (same day relief) → Level 2 Panchakarma (course) → 15 Integrative therapies (adjuncts) → Self-care prescription (patient homework). Use the Quick Protocol Builder for instant decisions.", clinical: "This 5-step method works for 90% of spine patients. Complex cases: add Modules M1-M13 framework OR refer to specialist." },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Leaf className="h-6 w-6 text-green-600" /> AYUSH-Native Spine Modules (M14–M18)</h1>
          <p className="text-muted-foreground mt-1">Assess spine using YOUR AYUSH training — Ayurveda, Siddha, Yoga, TCM, Dr. Saleem's 5-Step Method</p>
        </div>
        <Badge className="bg-green-100 text-green-700"><BookOpen className="h-3 w-3 mr-1" /> For AYUSH Practitioners</Badge>
      </div>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 text-sm">
          <p><strong>Why these modules?</strong> M1-M13 are based on Western posture/movement science (for physiotherapists and franchise team). M14-M18 use YOUR Ayurveda/Siddha/Yoga/TCM training — no Western anatomy needed. Both paths lead to the same goal: identify and fix the spine problem.</p>
        </CardContent>
      </Card>

      {/* Module Cards */}
      <div className="space-y-3">
        {ayushModules.map(mod => (
          <Card key={mod.id} className={`${mod.bg} transition-all ${expandedModule === mod.id ? "shadow-lg" : "hover:shadow-md"}`}>
            <div className="p-4 cursor-pointer flex items-center justify-between" onClick={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}>
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg bg-white grid place-items-center shadow-sm`}>
                  <mod.icon className={`h-5 w-5 ${mod.color}`} />
                </div>
                <div>
                  <p className="font-bold flex items-center gap-2">M{mod.id}: {mod.title} <Badge className="text-[9px] bg-white">{mod.topics.length} topics</Badge></p>
                  <p className="text-xs text-muted-foreground italic">{mod.subtitle}</p>
                </div>
              </div>
              {expandedModule === mod.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>

            {expandedModule === mod.id && (
              <CardContent className="pt-0 space-y-3">
                <Separator />
                <p className="text-sm text-muted-foreground">{mod.overview}</p>
                <div className="space-y-2">
                  {mod.topics.map((topic, i) => (
                    <div key={i} className="p-3 bg-white rounded-lg border space-y-2">
                      <p className="font-medium text-sm flex items-center gap-2">
                        <span className="h-5 w-5 rounded-full bg-green-600 text-white text-[10px] grid place-items-center shrink-0">{i+1}</span>
                        {topic.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{topic.content}</p>
                      <div className="text-xs bg-green-50 p-2 rounded border border-green-100">
                        <span className="font-medium text-green-700">Clinical Application: </span>
                        <span className="text-green-800">{topic.clinical}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
