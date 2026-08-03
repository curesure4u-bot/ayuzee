import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity, Search, Globe, Stethoscope, Heart, Brain, Clock, Users,
  CheckCircle2, Play, ChevronRight, Leaf, Target, Zap, Hand,
  GraduationCap, BarChart3, AlertTriangle, Sparkles,
} from "lucide-react";

export default function SpineIntegrativeTherapies() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const therapies = [
    {
      id: 1, title: "Acupuncture (TCM)", origin: "China",
      category: "needle", icon: "🪡", color: "red",
      doctorTopics: ["BL Channel (Bladder Meridian) for spine", "Huatuojiaji points (paravertebral)", "Du Mai (Governing Vessel)", "Electroacupuncture protocols", "Needle depth & angle per level", "Safety zones & contraindications"],
      patientTopics: ["Acupressure on BL40, BL60, GB34", "Self-ear seed placement", "Point location guide with photos", "Daily press routine (5 min)", "When to stop & report"],
      spineIndications: ["Sciatica", "Cervical spondylosis", "Lumbar disc", "Spinal stenosis", "Muscle spasm"],
      evidenceLevel: "Strong (WHO recognized)", evidenceScore: 85,
      measureTools: ["VAS Pain Scale", "ODI (Oswestry)", "NDI (Neck Disability)", "ROM measurement"],
      ayushIntegration: "Combine with Kati Basti + Agnikarma for enhanced Vata pacification",
    },
    {
      id: 2, title: "Acupressure Therapy", origin: "China/Japan",
      category: "manual", icon: "👆", color: "blue",
      doctorTopics: ["Point location anatomy (spine-specific)", "Pressure techniques (sustained, circular, pulsed)", "Protocol for cervical/lumbar/thoracic", "Tui Na integration", "Dosage: duration & frequency", "Referral patterns from trigger points"],
      patientTopics: ["Self-press GB20 (headache/neck)", "Self-press BL23 (low back)", "Tennis ball against wall technique", "Thumb press routine for morning stiffness", "Partner-assisted back point protocol"],
      spineIndications: ["Muscle tension", "Headache (cervicogenic)", "Morning stiffness", "Chronic low back pain", "Stress-related spine pain"],
      evidenceLevel: "Moderate", evidenceScore: 70,
      measureTools: ["VAS Pain Scale", "Pressure Pain Threshold (PPT)", "Muscle Tension Score", "Patient Satisfaction"],
      ayushIntegration: "Combine with Marma therapy — overlapping points amplify effect",
    },
    {
      id: 3, title: "Dry Needling", origin: "Western/Modern",
      category: "needle", icon: "📌", color: "orange",
      doctorTopics: ["Trigger point anatomy (spine muscles)", "Needle insertion: multifidus, QL, piriformis, traps", "Local twitch response technique", "Superficial vs deep needling", "Safety: pneumothorax prevention", "Post-needling care"],
      patientTopics: ["Foam roller myofascial release (substitute)", "Lacrosse ball piriformis release", "Self-MFR for upper traps", "Post-treatment stretching routine", "Hydration & heat application"],
      spineIndications: ["Myofascial pain syndrome", "Trigger point referral pain", "Chronic muscle spasm", "Post-exercise soreness", "Fibromyalgia (adjunct)"],
      evidenceLevel: "Strong", evidenceScore: 80,
      measureTools: ["VAS Pain Scale", "PPT (algometer)", "Twitch Response Count", "Functional Movement Screen"],
      ayushIntegration: "Post-Dry Needling Abhyanga with Mahanarayan Taila for tissue healing",
    },
    {
      id: 4, title: "Trigger Point Therapy", origin: "USA (Travell & Simons)",
      category: "manual", icon: "🎯", color: "purple",
      doctorTopics: ["Trigger point identification (taut band, referred pain)", "Ischemic compression technique", "Spray & stretch method", "Positional release (strain-counterstrain)", "Key spine TrPs: multifidus, QL, levator scap, piriformis", "Treatment frequency & progression"],
      patientTopics: ["Tennis ball / Theracane self-treatment", "Wall press technique for traps", "Floor ball for piriformis/glutes", "Self-compression: hold 60-90 sec", "Post-release stretching protocol"],
      spineIndications: ["Referred pain patterns", "Chronic muscle knots", "Postural pain", "Headache from neck TrPs", "Hip pain from QL/piriformis TrPs"],
      evidenceLevel: "Strong", evidenceScore: 78,
      measureTools: ["VAS Pain Scale", "PPT (algometer)", "Number of Active TrPs", "Referred Pain Map"],
      ayushIntegration: "Agnikarma at trigger points + Patra Pinda Sweda for deep tissue release",
    },
    {
      id: 5, title: "Auriculotherapy (Ear Acupuncture)", origin: "France/China",
      category: "microsystem", icon: "👂", color: "amber",
      doctorTopics: ["Ear microsystem anatomy (Nogier map)", "Spine correspondence zones on ear", "Needle vs ear seed vs electroauricular", "Battlefield acupuncture (BFA) protocol", "Point detection (tenderness/electrical)", "Treatment for acute vs chronic spine pain"],
      patientTopics: ["Self-application of ear seeds (Vaccaria)", "Spine zone location on ear (with diagram)", "Press ear seeds 3× daily protocol", "Magnetic pellet self-use", "When to replace seeds (3-5 days)"],
      spineIndications: ["Acute pain (rapid relief)", "Chronic back pain", "Sciatica", "Post-surgical pain", "Anxiety/stress-related spine tension"],
      evidenceLevel: "Moderate-Strong", evidenceScore: 72,
      measureTools: ["VAS Pain Scale", "Ear Point Tenderness Score", "Pain Medication Usage", "Sleep Quality Index"],
      ayushIntegration: "Combine with Karna Purana (ear oil therapy) for enhanced nerve calming",
    },
    {
      id: 6, title: "Japanese Kampo & Shiatsu", origin: "Japan",
      category: "traditional", icon: "🇯🇵", color: "rose",
      doctorTopics: ["Shiatsu meridian theory (spine channels)", "Ampuku (abdominal diagnosis for spine)", "Kampo formulas for spine: Shakuyakukanzoto, Keishikajutsubuto", "Sotai exercises (corrective movement)", "Makko-Ho meridian stretches", "Ki flow assessment along spine"],
      patientTopics: ["Self-Shiatsu: thumb press along BL channel", "Makko-Ho 6 stretches (daily routine)", "Sotai self-corrective exercises", "Hot towel (oshibori) application", "Breathing coordination with press"],
      spineIndications: ["Chronic stiffness", "Morning back pain", "Nerve compression symptoms", "Cold-type spine pain", "Muscle weakness patterns"],
      evidenceLevel: "Moderate", evidenceScore: 65,
      measureTools: ["VAS Pain Scale", "Flexibility Index", "Abdominal Diagnosis Map", "Ki-Flow Score (subjective)"],
      ayushIntegration: "Kampo herb compatibility with Ayurvedic formulations for Vata-Kapha spine disorders",
    },
    {
      id: 7, title: "Korean Hand Therapy (KHT)", origin: "South Korea",
      category: "microsystem", icon: "✋", color: "teal",
      doctorTopics: ["Hand correspondence to spine (Koryo system)", "Spine points on hand (dorsum = back)", "Stimulation methods: press, moxa, needle, magnet", "E-beam device on hand spine zone", "Protocol for cervical/thoracic/lumbar", "Integration with body acupuncture"],
      patientTopics: ["Self-locate spine line on hand dorsum", "Toothpick stimulation of hand spine points", "Magnetic pellet placement (self)", "Ring therapy for spine zones", "Daily 5-minute hand stimulation routine"],
      spineIndications: ["Any spine pain (microsystem access)", "Travel/office pain relief", "Adjunct to main treatment", "Maintenance between sessions", "Emergency pain management"],
      evidenceLevel: "Moderate", evidenceScore: 60,
      measureTools: ["VAS Pain Scale", "Hand Point Tenderness", "Response Time to Relief", "Patient Compliance Score"],
      ayushIntegration: "Combine with Sujok (similar) + Marma hand points for multi-system stimulation",
    },
    {
      id: 8, title: "Reflexology (Foot & Hand)", origin: "Egypt/USA",
      category: "microsystem", icon: "🦶", color: "green",
      doctorTopics: ["Spinal reflex zones on foot (medial arch = spine)", "C1-Coccyx mapping along foot arch", "Thumb walking technique", "Hook & back-up for specific vertebrae", "Treatment sequence for spine", "Combining with essential oils"],
      patientTopics: ["Self-foot rolling (golf ball/bottle)", "Thumb press along medial arch daily", "Spinal twist foot technique", "Hand reflexology for spine (thenar eminence)", "Partner foot reflexology guide"],
      spineIndications: ["General spine pain", "Nerve-related symptoms", "Stress-induced back tension", "Sleep disturbance from pain", "Adjunct to manual therapy"],
      evidenceLevel: "Moderate", evidenceScore: 62,
      measureTools: ["VAS Pain Scale", "Foot Tenderness Map", "Relaxation Response Scale", "Sleep Quality Index"],
      ayushIntegration: "Pada Abhyanga (Ayurvedic foot massage) + Reflexology = enhanced Vata grounding",
    },
    {
      id: 9, title: "Cupping Therapy (Hijama)", origin: "Middle East/China",
      category: "manual", icon: "🫙", color: "indigo",
      doctorTopics: ["Dry cupping for spine muscle release", "Wet cupping (Hijama) for inflammation", "Fire cupping vs silicone cups", "Sliding cupping along erector spinae", "Cup placement: paraspinal, sacral, cervical", "Contraindications & skin care"],
      patientTopics: ["Silicone cup self-application (back: wall technique)", "Self-cupping for upper traps (mirror)", "Sliding cup on thigh/calf (accessible areas)", "Duration: 5-10 min maximum", "Aftercare: warmth, hydration, rest"],
      spineIndications: ["Muscle tension/spasm", "Blood stagnation (TCM)", "Chronic low back pain", "Fascial adhesions", "Post-exercise recovery"],
      evidenceLevel: "Moderate", evidenceScore: 68,
      measureTools: ["VAS Pain Scale", "Cup Mark Color Assessment", "ROM improvement", "Fascia Mobility Test"],
      ayushIntegration: "Hijama + Raktamokshana (Ayurvedic blood-letting) share similar principles for Pitta-Rakta disorders",
    },
    {
      id: 10, title: "Moxibustion", origin: "China/Japan",
      category: "thermal", icon: "🔥", color: "orange",
      doctorTopics: ["Direct vs indirect moxa techniques", "Moxa on BL channel for spine warming", "Ginger moxa for cold-type back pain", "Moxa box for lumbar/sacral area", "Warming needle (needle + moxa combined)", "Duration & frequency protocols"],
      patientTopics: ["Self-moxa stick application (indirect)", "Warming BL23, GV4 (Mingmen) at home", "Moxa timing: best in morning/winter", "Safety: distance, duration, extinguishing", "Alternative: infrared lamp on same points"],
      spineIndications: ["Cold-type back pain (worse in cold/damp)", "Morning stiffness", "Chronic weakness (Kidney Yang deficiency)", "Degenerative disc disease", "Vata/Kapha type spine disorders"],
      evidenceLevel: "Moderate", evidenceScore: 65,
      measureTools: ["VAS Pain Scale", "Cold Sensitivity Score", "Morning Stiffness Duration", "Thermal Comfort Index"],
      ayushIntegration: "Moxibustion = Agni-vardhana; combines with Swedana & warm oil Basti for maximum Vata-Kapha treatment",
    },
    {
      id: 11, title: "Thai Massage & Sen Lines", origin: "Thailand",
      category: "manual", icon: "🇹🇭", color: "violet",
      doctorTopics: ["Sen Sumana (central spine channel)", "Sen Ittha & Pingkhala (bilateral spine lines)", "Spine stretching sequences (Thai Yoga)", "Elbow/knee/foot techniques for paraspinals", "Passive spinal twist protocols", "Contraindications for spine pathology"],
      patientTopics: ["Partner-assisted Thai stretches (simple)", "Self-spinal twist sequence (floor)", "Hip opener stretches for LBP", "Assisted traction (partner pulls legs)", "Daily Thai-Yoga spine flow (10 min)"],
      spineIndications: ["Stiffness & reduced mobility", "Chronic mechanical back pain", "Hip-spine connection dysfunction", "Postural correction maintenance", "Flexibility restoration"],
      evidenceLevel: "Moderate", evidenceScore: 67,
      measureTools: ["VAS Pain Scale", "Sit-and-Reach Test", "Spinal Rotation ROM", "Flexibility Score"],
      ayushIntegration: "Thai spine stretches + Panchakarma Pizhichil (oil pouring) for lubricated deep stretching",
    },
    {
      id: 12, title: "Osteopathic & Chiropractic Concepts", origin: "USA/UK",
      category: "manual", icon: "🦴", color: "slate",
      doctorTopics: ["Muscle Energy Technique (MET) for spine", "Positional Release (counterstrain)", "Craniosacral rhythm assessment", "HVLA concepts (NOT self-applied)", "Myofascial unwinding", "Somatic dysfunction diagnosis (TART)"],
      patientTopics: ["Self-MET for SI joint (bridge + resist)", "Self-positional release for tender points", "Diaphragm self-release breathing", "Pelvic clock exercise (craniosacral concept)", "Self-traction: hanging, inversion"],
      spineIndications: ["Joint restriction/fixation", "SI joint dysfunction", "Facet joint pain", "Post-manipulation maintenance", "Hypomobility segments"],
      evidenceLevel: "Strong", evidenceScore: 82,
      measureTools: ["VAS Pain Scale", "Segmental ROM", "TART Assessment", "Functional Movement Screen"],
      ayushIntegration: "MET + Meru Chikitsa (Ayurvedic spine manipulation) share biomechanical correction principles",
    },
    {
      id: 13, title: "Sujok Therapy", origin: "South Korea (Prof. Park)",
      category: "microsystem", icon: "🌀", color: "cyan",
      doctorTopics: ["Standard correspondence: hand/foot = body", "Insect correspondence for spine", "Six Ki treatment for spine energy", "Twist therapy for spinal correction", "Seed therapy placement for spine zones", "Color therapy (chakra-spine correlation)"],
      patientTopics: ["Self-locate spine on hand (middle finger = spine)", "Apply seeds along middle finger (spine line)", "Color pen marking for energy correction", "Twist therapy self-exercise (5 min daily)", "Ring/rubber band stimulation of spine zone"],
      spineIndications: ["Quick pain relief (microsystem)", "Energy imbalance correction", "Maintenance therapy", "Non-invasive option for needle-phobic", "Children & elderly (gentle)"],
      evidenceLevel: "Low-Moderate", evidenceScore: 55,
      measureTools: ["VAS Pain Scale", "Correspondence Point Tenderness", "Energy Level (subjective)", "Treatment Response Speed"],
      ayushIntegration: "Sujok seed therapy + Bija Mantra + Marma hand points = triple microsystem approach",
    },
    {
      id: 14, title: "Marma Therapy (Ayurveda)", origin: "India",
      category: "traditional", icon: "🙏", color: "amber",
      doctorTopics: ["15 Spine-related Marma points (Kukundara, Katikataruna, Nitamba, Parshvasandhi)", "Stimulation techniques: press, oil, heat, mantra", "Marma assessment for spine diagnosis", "Sequential activation protocol", "Contraindications per Marma", "Integration with Panchakarma"],
      patientTopics: ["Self-press Kukundara Marma (sacral dimples)", "Self-press Katikataruna (hip joint area)", "Oil application on Janu Marma (knee-spine connection)", "Morning Marma activation routine (7 points)", "Breathing + Marma press combination"],
      spineIndications: ["Vata-type spine pain", "Energy blockage (Prana obstruction)", "Chronic stiffness", "Nerve-related symptoms", "Post-treatment maintenance"],
      evidenceLevel: "Traditional + Emerging", evidenceScore: 63,
      measureTools: ["VAS Pain Scale", "Marma Tenderness Score", "Prana Flow Assessment", "Dosha Balance Index"],
      ayushIntegration: "Core AYUSH therapy — integrates directly with all Panchakarma spine protocols",
    },
    {
      id: 15, title: "Pranic Healing & Energy Work", origin: "Philippines/India",
      category: "energy", icon: "✨", color: "violet",
      doctorTopics: ["Chakra-spine correlation (7 chakras along spine)", "Scanning technique for spine energy blocks", "Sweeping/cleansing congested energy", "Energizing depleted spine zones", "Color pranas for specific spine conditions", "Twin Heart meditation for spine healing"],
      patientTopics: ["Self-scanning: feel heat/cold along spine", "Basic sweeping (hand movement 3 inches from body)", "Visualization: golden light along spine", "Breathing into painful area technique", "Daily spine energy hygiene (5 min morning)"],
      spineIndications: ["Stress/emotional back pain", "Energy depletion", "Post-treatment energy restoration", "Psychosomatic spine conditions", "Maintenance & prevention"],
      evidenceLevel: "Low (energy-based)", evidenceScore: 45,
      measureTools: ["VAS Pain Scale", "Chakra Activity Score", "Stress Reduction Index", "Bio-field Assessment"],
      ayushIntegration: "Pranic concepts align with Prana Vayu, Chakra = Marma correlation in Ayurveda",
    },
  ];

  // Outcome measurement tools used across all systems
  const measurementTools = [
    { name: "VAS Pain Scale", description: "0-10 visual analog scale", usage: "Before & after every session", universal: true },
    { name: "ODI (Oswestry Disability Index)", description: "Low back functional disability", usage: "Baseline + every 2 weeks", universal: true },
    { name: "NDI (Neck Disability Index)", description: "Cervical functional disability", usage: "Baseline + every 2 weeks", universal: true },
    { name: "ROM (Range of Motion)", description: "Inclinometer or goniometer measurement", usage: "Baseline + weekly", universal: true },
    { name: "PPT (Pressure Pain Threshold)", description: "Algometer reading on trigger points", usage: "Before & after treatment", universal: false },
    { name: "Patient Satisfaction Score", description: "1-5 scale post-treatment", usage: "After every session", universal: true },
    { name: "Sleep Quality Index", description: "Pittsburgh Sleep Quality Index (PSQI)", usage: "Baseline + monthly", universal: false },
    { name: "Functional Movement Screen", description: "7 movement patterns scored 0-3", usage: "Baseline + monthly", universal: false },
  ];

  const categories = [
    { value: "all", label: "All Systems" },
    { value: "needle", label: "Needle-Based" },
    { value: "manual", label: "Manual Therapy" },
    { value: "microsystem", label: "Microsystems" },
    { value: "traditional", label: "Traditional Systems" },
    { value: "thermal", label: "Thermal" },
    { value: "energy", label: "Energy-Based" },
  ];

  const filtered = therapies.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.spineIndications.some(i => i.toLowerCase().includes(search.toLowerCase()));
    const matchCat = filterCategory === "all" || t.category === filterCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6 text-indigo-600" />
            Integrative Spine Therapies — Global Systems
          </h1>
          <p className="text-muted-foreground mt-1">
            15 Complementary Medicine Systems · Doctor Training + Patient Self-Treatment · Evidence-Based Outcomes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-indigo-600 border-indigo-300">
            <Globe className="h-3 w-3 mr-1" /> 8+ Countries
          </Badge>
          <Badge variant="outline" className="text-green-600 border-green-300">
            <Target className="h-3 w-3 mr-1" /> Measurable Outcomes
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center">
          <Globe className="h-5 w-5 mx-auto text-indigo-600" />
          <p className="text-xl font-bold mt-1">15</p>
          <p className="text-xs text-muted-foreground">Therapy Systems</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Stethoscope className="h-5 w-5 mx-auto text-purple-600" />
          <p className="text-xl font-bold mt-1">90+</p>
          <p className="text-xs text-muted-foreground">Doctor Topics</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Heart className="h-5 w-5 mx-auto text-rose-600" />
          <p className="text-xl font-bold mt-1">75+</p>
          <p className="text-xs text-muted-foreground">Patient Self-Care Topics</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <BarChart3 className="h-5 w-5 mx-auto text-green-600" />
          <p className="text-xl font-bold mt-1">8</p>
          <p className="text-xs text-muted-foreground">Measurement Tools</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Leaf className="h-5 w-5 mx-auto text-amber-600" />
          <p className="text-xl font-bold mt-1">100%</p>
          <p className="text-xs text-muted-foreground">AYUSH Integrated</p>
        </CardContent></Card>
      </div>

      {/* Outcome Measurement Tools Card */}
      <Card className="border-green-200 bg-green-50/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-green-600" /> Standard Outcome Measurement Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {measurementTools.map((tool) => (
              <div key={tool.name} className="p-2 bg-white rounded border text-xs">
                <p className="font-medium">{tool.name}</p>
                <p className="text-muted-foreground text-[10px]">{tool.description}</p>
                <p className="text-green-600 text-[10px] mt-1">{tool.usage}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search therapies, indications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={filterCategory} onValueChange={setFilterCategory}>
          <TabsList className="h-9">
            {categories.map(c => (
              <TabsTrigger key={c.value} value={c.value} className="text-xs px-2">
                {c.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Therapy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((therapy) => (
          <Card
            key={therapy.id}
            className="hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => navigate(`/hms/spine-therapies/${therapy.id}`)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{therapy.icon}</span>
                  <div>
                    <CardTitle className="text-sm leading-tight group-hover:text-indigo-600 transition-colors">
                      {therapy.title}
                    </CardTitle>
                    <p className="text-[10px] text-muted-foreground">Origin: {therapy.origin}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[9px]">T{therapy.id}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Evidence Score */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">Evidence: {therapy.evidenceLevel}</span>
                  <span className="font-bold">{therapy.evidenceScore}%</span>
                </div>
                <Progress value={therapy.evidenceScore} className="h-1.5" />
              </div>

              {/* Doctor + Patient Topics Count */}
              <div className="flex gap-2">
                <div className="flex-1 p-1.5 bg-purple-50 rounded text-center">
                  <p className="text-xs font-bold text-purple-700">{therapy.doctorTopics.length}</p>
                  <p className="text-[9px] text-purple-600">Doctor Topics</p>
                </div>
                <div className="flex-1 p-1.5 bg-green-50 rounded text-center">
                  <p className="text-xs font-bold text-green-700">{therapy.patientTopics.length}</p>
                  <p className="text-[9px] text-green-600">Patient Self-Care</p>
                </div>
              </div>

              {/* Spine Indications */}
              <div className="flex flex-wrap gap-1">
                {therapy.spineIndications.slice(0, 3).map((ind) => (
                  <Badge key={ind} variant="outline" className="text-[9px] px-1.5 py-0">{ind}</Badge>
                ))}
                {therapy.spineIndications.length > 3 && (
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-muted-foreground">
                    +{therapy.spineIndications.length - 3}
                  </Badge>
                )}
              </div>

              {/* Measurement Tools */}
              <div className="text-[10px] text-muted-foreground">
                <span className="font-medium">Measures: </span>
                {therapy.measureTools.slice(0, 2).join(", ")}
                {therapy.measureTools.length > 2 && ` +${therapy.measureTools.length - 2}`}
              </div>

              {/* AYUSH Integration */}
              <div className="text-[10px] bg-amber-50 p-1.5 rounded border border-amber-100">
                <span className="font-medium text-amber-700">AYUSH Integration: </span>
                <span className="text-amber-800">{therapy.ayushIntegration}</span>
              </div>

              <Button variant="ghost" size="sm" className="w-full h-7 text-[10px] gap-1 text-indigo-600">
                <Play className="h-3 w-3" /> View Full Protocol
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No therapies found matching your filters.</p>
        </div>
      )}
    </div>
  );
}
