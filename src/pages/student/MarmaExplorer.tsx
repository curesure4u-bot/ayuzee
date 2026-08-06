import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MapPin, Zap, Heart, Info, X } from "lucide-react";

// ---------- Marma Data ----------

type MarmaPoint = {
  id: number;
  name: string;
  sanskrit: string;
  location: string;
  type: string;
  region: string;
  structures: string;
  effect_of_injury: string;
  therapeutic_use: string;
  size: string;
  cx: number; // SVG x position (percentage-based)
  cy: number; // SVG y position (percentage-based)
};

const MARMA_POINTS: MarmaPoint[] = [
  { id: 1, name: "Adhipati", sanskrit: "अधिपति", location: "Crown of head (vertex)", type: "Sandhi (Joint)", region: "Head", structures: "Confluence of cranial sutures", effect_of_injury: "Sadyo Pranahara (Immediately fatal)", therapeutic_use: "Meditation, consciousness disorders, memory enhancement. Shirodhara applied near this point.", size: "½ Anguli", cx: 50, cy: 4 },
  { id: 2, name: "Simanta", sanskrit: "सीमन्त", location: "Suture lines of skull (5 points)", type: "Sandhi (Joint)", region: "Head", structures: "Cranial sutures", effect_of_injury: "Kalantara Pranahara (Fatal over time)", therapeutic_use: "Headaches, anxiety, insomnia. Oil application along suture lines.", size: "4 Anguli", cx: 50, cy: 7 },
  { id: 3, name: "Sthapani", sanskrit: "स्थपनी", location: "Between eyebrows (glabella)", type: "Sira (Vessel)", region: "Head", structures: "Frontal artery and supratrochlear nerve", effect_of_injury: "Kalantara Pranahara", therapeutic_use: "Third eye point. Used for mental clarity, headache, sinusitis. Nasya therapy target.", size: "½ Anguli", cx: 50, cy: 13 },
  { id: 4, name: "Shankha", sanskrit: "शङ्ख", location: "Temple region (2 points)", type: "Asthi (Bone)", region: "Head", structures: "Temporal bone, temporal artery", effect_of_injury: "Sadyo Pranahara", therapeutic_use: "Migraine, temporal headache, TMJ disorders. Gentle massage with oil.", size: "½ Anguli", cx: 38, cy: 12 },
  { id: 5, name: "Phana", sanskrit: "फण", location: "Sides of nostrils (2 points)", type: "Sira (Vessel)", region: "Head", structures: "Angular artery, infraorbital nerve", effect_of_injury: "Vaikalyakara (Disability)", therapeutic_use: "Anosmia, nasal polyps, allergic rhinitis. Nasya and marma massage.", size: "½ Anguli", cx: 47, cy: 17 },
  { id: 6, name: "Vidhura", sanskrit: "विधुर", location: "Behind earlobes (2 points)", type: "Snayu (Tendon)", region: "Head", structures: "Mastoid process, posterior auricular artery", effect_of_injury: "Vaikalyakara (Deafness)", therapeutic_use: "Hearing disorders, tinnitus, vertigo. Karna Poorana therapy.", size: "½ Anguli", cx: 62, cy: 14 },
  { id: 7, name: "Krikatika", sanskrit: "कृकाटिका", location: "Base of skull / neck junction (2 points)", type: "Sandhi (Joint)", region: "Neck", structures: "Atlanto-occipital joint", effect_of_injury: "Vaikalyakara", therapeutic_use: "Cervical spondylosis, neck stiffness, torticollis. Greeva Basti.", size: "½ Anguli", cx: 50, cy: 20 },
  { id: 8, name: "Nila", sanskrit: "नील", location: "Sides of larynx (2 points)", type: "Sira (Vessel)", region: "Neck", structures: "Common carotid artery, vagus nerve", effect_of_injury: "Kalantara Pranahara", therapeutic_use: "Voice disorders, thyroid problems, throat infections.", size: "4 Anguli", cx: 44, cy: 24 },
  { id: 9, name: "Hridaya", sanskrit: "हृदय", location: "Center of chest (cardiac region)", type: "Sira (Vessel)", region: "Chest", structures: "Heart, great vessels", effect_of_injury: "Sadyo Pranahara", therapeutic_use: "Cardiac disorders, anxiety, emotional healing. Hrid Basti application site.", size: "½ Anguli", cx: 50, cy: 35 },
  { id: 10, name: "Stanamula", sanskrit: "स्तनमूल", location: "Base of breast (2 points)", type: "Mamsa (Muscle)", region: "Chest", structures: "Pectoralis major, thoracic nerves", effect_of_injury: "Kalantara Pranahara", therapeutic_use: "Respiratory disorders, lactation problems, chest congestion.", size: "2 Anguli", cx: 42, cy: 38 },
  { id: 11, name: "Nabhi", sanskrit: "नाभि", location: "Umbilicus", type: "Sira (Vessel)", region: "Abdomen", structures: "Abdominal aorta, mesenteric vessels", effect_of_injury: "Sadyo Pranahara", therapeutic_use: "Digestive disorders, IBS, menstrual problems. Nabhi Basti therapy.", size: "4 Anguli", cx: 50, cy: 48 },
  { id: 12, name: "Basti", sanskrit: "बस्ति", location: "Hypogastric region (below umbilicus)", type: "Sira (Vessel)", region: "Abdomen", structures: "Urinary bladder, iliac vessels", effect_of_injury: "Sadyo Pranahara", therapeutic_use: "Urinary disorders, reproductive issues, low back pain. Uttar Basti.", size: "4 Anguli", cx: 50, cy: 54 },
  { id: 13, name: "Kshipra", sanskrit: "क्षिप्र", location: "Web between thumb and index finger (4 points)", type: "Snayu (Tendon)", region: "Upper Limb", structures: "First dorsal interosseous, radial artery", effect_of_injury: "Kalantara Pranahara", therapeutic_use: "Cardiac emergencies (LI-4 equivalent), headache, pain relief, labor induction.", size: "½ Anguli", cx: 25, cy: 55 },
  { id: 14, name: "Manibandha", sanskrit: "मणिबन्ध", location: "Wrist joint (2 points)", type: "Sandhi (Joint)", region: "Upper Limb", structures: "Radiocarpal joint, radial/ulnar arteries", effect_of_injury: "Vaikalyakara", therapeutic_use: "Carpal tunnel, wrist pain, pulse diagnosis point (Nadi Pariksha).", size: "2 Anguli", cx: 24, cy: 50 },
  { id: 15, name: "Kurpara", sanskrit: "कूर्पर", location: "Elbow joint (2 points)", type: "Sandhi (Joint)", region: "Upper Limb", structures: "Elbow joint, brachial artery", effect_of_injury: "Vaikalyakara", therapeutic_use: "Tennis elbow, arthritis, upper limb pain. Local Basti application.", size: "3 Anguli", cx: 22, cy: 42 },
  { id: 16, name: "Janu", sanskrit: "जानु", location: "Knee joint (2 points)", type: "Sandhi (Joint)", region: "Lower Limb", structures: "Knee joint, popliteal vessels", effect_of_injury: "Vaikalyakara", therapeutic_use: "Osteoarthritis, ligament injuries. Janu Basti therapy.", size: "3 Anguli", cx: 38, cy: 72 },
  { id: 17, name: "Gulpha", sanskrit: "गुल्फ", location: "Ankle joint (2 points)", type: "Sandhi (Joint)", region: "Lower Limb", structures: "Ankle joint, tibial vessels", effect_of_injury: "Rujakara (Painful)", therapeutic_use: "Ankle sprains, edema, plantar fasciitis. Padabhyanga.", size: "2 Anguli", cx: 40, cy: 88 },
  { id: 18, name: "Urvi", sanskrit: "ऊर्वी", location: "Mid-thigh (2 points)", type: "Sira (Vessel)", region: "Lower Limb", structures: "Femoral artery, femoral nerve", effect_of_injury: "Kalantara Pranahara (Blood loss)", therapeutic_use: "Sciatica, thigh pain, muscle wasting. Abhyanga and Pinda Sweda.", size: "1 Anguli", cx: 62, cy: 64 },
  { id: 19, name: "Talahridaya", sanskrit: "तलहृदय", location: "Center of palm / sole (4 points)", type: "Mamsa (Muscle)", region: "Extremities", structures: "Palmar/plantar arch, digital nerves", effect_of_injury: "Kalantara Pranahara", therapeutic_use: "Insomnia (foot point), fatigue, cardiac support. Padabhyanga on sole.", size: "½ Anguli", cx: 60, cy: 93 },
  { id: 20, name: "Katikatarunai", sanskrit: "कटीकतरुणै", location: "Sacroiliac joints (2 points)", type: "Asthi (Bone)", region: "Back", structures: "Sacroiliac joint, iliolumbar artery", effect_of_injury: "Vaikalyakara (Limping)", therapeutic_use: "Low back pain, sciatica, SI joint dysfunction. Kati Basti.", size: "½ Anguli", cx: 55, cy: 57 },
];

const REGIONS = ["All", "Head", "Neck", "Chest", "Abdomen", "Upper Limb", "Lower Limb", "Back", "Extremities"];
const TYPES = ["All", "Sandhi (Joint)", "Sira (Vessel)", "Mamsa (Muscle)", "Snayu (Tendon)", "Asthi (Bone)"];

// ---------- Body Map SVG ----------

function BodyMap({ points, selected, onSelect }: { points: MarmaPoint[]; selected: MarmaPoint | null; onSelect: (p: MarmaPoint) => void }) {
  return (
    <div className="relative w-full max-w-[280px] mx-auto aspect-[1/2.5] bg-gradient-to-b from-amber-50 to-orange-50 rounded-2xl border border-amber-200 overflow-hidden">
      {/* Simple body outline */}
      <svg viewBox="0 0 100 250" className="absolute inset-0 w-full h-full" aria-label="Human body outline with marma points">
        {/* Head */}
        <ellipse cx="50" cy="12" rx="10" ry="12" fill="none" stroke="#d4a574" strokeWidth="0.5" />
        {/* Neck */}
        <rect x="46" y="23" width="8" height="5" fill="none" stroke="#d4a574" strokeWidth="0.5" rx="2" />
        {/* Torso */}
        <path d="M35 28 Q30 50 32 80 L38 100 L50 105 L62 100 L68 80 Q70 50 65 28 Z" fill="none" stroke="#d4a574" strokeWidth="0.5" />
        {/* Arms */}
        <path d="M35 30 Q25 45 20 60 Q18 70 20 80 L22 85" fill="none" stroke="#d4a574" strokeWidth="0.5" />
        <path d="M65 30 Q75 45 80 60 Q82 70 80 80 L78 85" fill="none" stroke="#d4a574" strokeWidth="0.5" />
        {/* Legs */}
        <path d="M40 105 Q38 130 37 160 Q36 180 38 200 L40 230" fill="none" stroke="#d4a574" strokeWidth="0.5" />
        <path d="M60 105 Q62 130 63 160 Q64 180 62 200 L60 230" fill="none" stroke="#d4a574" strokeWidth="0.5" />

        {/* Marma Points */}
        {points.map((point) => (
          <g key={point.id} onClick={() => onSelect(point)} className="cursor-pointer">
            <circle
              cx={point.cx}
              cy={(point.cy / 100) * 250}
              r={selected?.id === point.id ? 3.5 : 2.5}
              fill={selected?.id === point.id ? "#ea580c" : "#dc2626"}
              stroke={selected?.id === point.id ? "#fff" : "#fecaca"}
              strokeWidth={selected?.id === point.id ? 1 : 0.5}
              className="transition-all hover:r-[3.5]"
            />
            {selected?.id === point.id && (
              <circle cx={point.cx} cy={(point.cy / 100) * 250} r="5" fill="none" stroke="#ea580c" strokeWidth="0.5" opacity="0.5" />
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

// ---------- Main Page ----------

const MarmaExplorer = () => {
  const [selected, setSelected] = useState<MarmaPoint | null>(null);
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [view, setView] = useState("map");

  const filtered = useMemo(() => {
    let list = MARMA_POINTS;
    if (regionFilter !== "All") list = list.filter((p) => p.region === regionFilter);
    if (typeFilter !== "All") list = list.filter((p) => p.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.sanskrit.includes(q) || p.location.toLowerCase().includes(q) || p.therapeutic_use.toLowerCase().includes(q));
    }
    return list;
  }, [search, regionFilter, typeFilter]);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" /> Marma Point Explorer
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Interactive body map — tap on points to learn location, type, effects, and therapeutic applications
        </p>
      </div>

      <Tabs value={view} onValueChange={setView}>
        <TabsList>
          <TabsTrigger value="map" className="gap-1.5"><MapPin className="h-3.5 w-3.5" /> Body Map</TabsTrigger>
          <TabsTrigger value="list" className="gap-1.5"><Info className="h-3.5 w-3.5" /> List View ({MARMA_POINTS.length})</TabsTrigger>
        </TabsList>

        {/* Map View */}
        <TabsContent value="map" className="mt-4">
          <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
            <BodyMap points={filtered} selected={selected} onSelect={setSelected} />

            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <select className="border rounded-md px-2 py-1.5 text-sm bg-background" value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}>{REGIONS.map((r) => <option key={r} value={r}>{r === "All" ? "All Regions" : r}</option>)}</select>
                <select className="border rounded-md px-2 py-1.5 text-sm bg-background" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>{TYPES.map((t) => <option key={t} value={t}>{t === "All" ? "All Types" : t}</option>)}</select>
              </div>

              {/* Selected point detail */}
              {selected ? (
                <Card className="border-primary/30">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Zap className="h-4 w-4 text-orange-600" /> {selected.name} <span className="text-sm font-normal text-muted-foreground">({selected.sanskrit})</span>
                      </CardTitle>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelected(null)}><X className="h-4 w-4" /></Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div><p className="text-xs font-medium text-muted-foreground">Location</p><p>{selected.location}</p></div>
                      <div><p className="text-xs font-medium text-muted-foreground">Type</p><p>{selected.type}</p></div>
                      <div><p className="text-xs font-medium text-muted-foreground">Region</p><p>{selected.region}</p></div>
                      <div><p className="text-xs font-medium text-muted-foreground">Size</p><p>{selected.size}</p></div>
                    </div>
                    <div><p className="text-xs font-medium text-muted-foreground">Structures</p><p className="text-muted-foreground">{selected.structures}</p></div>
                    <div><p className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Heart className="h-3 w-3 text-red-500" /> Effect of Injury</p><p className="text-red-700 bg-red-50 rounded px-2 py-1 text-xs">{selected.effect_of_injury}</p></div>
                    <div><p className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Zap className="h-3 w-3 text-green-600" /> Therapeutic Use</p><p className="text-green-800 bg-green-50 rounded px-2 py-1 text-xs">{selected.therapeutic_use}</p></div>
                  </CardContent>
                </Card>
              ) : (
                <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  Tap a point on the body map to view details
                </CardContent></Card>
              )}

              {/* Quick list */}
              <p className="text-xs text-muted-foreground">{filtered.length} points visible</p>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filtered.map((p) => (
                  <button key={p.id} className={`w-full text-left rounded-lg px-3 py-2 text-xs transition-colors ${selected?.id === p.id ? "bg-primary/10 border border-primary/30" : "hover:bg-muted"}`} onClick={() => setSelected(p)}>
                    <span className="font-medium">{p.name}</span> <span className="text-muted-foreground">— {p.region}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="space-y-4 mt-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search marma points..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <select className="border rounded-md px-2 py-1.5 text-sm bg-background" value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}>{REGIONS.map((r) => <option key={r} value={r}>{r === "All" ? "All Regions" : r}</option>)}</select>
            <select className="border rounded-md px-2 py-1.5 text-sm bg-background" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>{TYPES.map((t) => <option key={t} value={t}>{t === "All" ? "All Types" : t}</option>)}</select>
          </div>

          <Badge variant="outline">{filtered.length} marma points</Badge>

          <div className="space-y-2">
            {filtered.map((point) => (
              <Card key={point.id} className="hover:border-primary/20 transition-colors cursor-pointer" onClick={() => { setSelected(point); setView("map"); }}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{point.name} <span className="font-normal text-muted-foreground">({point.sanskrit})</span></h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{point.location}</p>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <Badge variant="outline" className="text-[10px]">{point.region}</Badge>
                        <Badge variant="secondary" className="text-[10px]">{point.type}</Badge>
                        <Badge className="text-[10px] bg-red-50 text-red-700 border-red-200">{point.effect_of_injury.split(" ")[0]}</Badge>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">{point.size}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarmaExplorer;
