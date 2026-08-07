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
import { Moon, Save } from "lucide-react";

const HmsUnani = () => {
  const [patientName, setPatientName] = useState("");

  // Mizaj
  const [mizaj, setMizaj] = useState("");
  const [qualMizaj, setQualMizaj] = useState("");
  const [bodyBuild, setBodyBuild] = useState("");
  const [skinType, setSkinType] = useState("");
  const [tabiyat, setTabiyat] = useState("");

  // Nabz
  const [nabzType, setNabzType] = useState("");
  const [nabzQuality, setNabzQuality] = useState("");
  const [nabzIndication, setNabzIndication] = useState("");

  // Akhlat
  const [dominantKhilt, setDominantKhilt] = useState("");
  const [imbalanceType, setImbalanceType] = useState("");

  // Ilaj
  const [tadbeerId, setTadbeerId] = useState("");
  const [ghizaType, setGhizaType] = useState("");

  const handleSave = () => {
    if (!patientName.trim()) return toast.error("Select a patient first");
    toast.success("Unani assessment saved successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Moon className="h-6 w-6 text-indigo-600" /> Unani Clinical Module
          </h1>
          <p className="text-sm text-muted-foreground">
            Mizaj Assessment, Nabz, Akhlat & Ilaj Principles
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-1 h-4 w-4" /> Save Assessment
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Patient Name</Label>
              <Input value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Search patient" />
            </div>
            <div><Label>UHID</Label><Input placeholder="Auto-generated" disabled /></div>
            <div><Label>Date</Label><Input type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="mizaj">
        <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full">
          <TabsTrigger value="mizaj">Mizaj</TabsTrigger>
          <TabsTrigger value="nabz">Nabz</TabsTrigger>
          <TabsTrigger value="akhlat">Akhlat</TabsTrigger>
          <TabsTrigger value="tadabeer">Ilaj bil Tadabeer</TabsTrigger>
          <TabsTrigger value="ghiza">Ilaj bil Ghiza</TabsTrigger>
          <TabsTrigger value="dawa">Ilaj bil Dawa</TabsTrigger>
        </TabsList>

        <TabsContent value="mizaj" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Mizaj (Temperament) Assessment</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Patient Mizaj (Temperament)</Label>
                  <Select value={mizaj} onValueChange={setMizaj}>
                    <SelectTrigger><SelectValue placeholder="Select Mizaj" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="damvi">Damvi (Sanguine)</SelectItem>
                      <SelectItem value="safravi">Safravi (Bilious/Choleric)</SelectItem>
                      <SelectItem value="balghami">Balghami (Phlegmatic)</SelectItem>
                      <SelectItem value="saudavi">Saudavi (Melancholic)</SelectItem>
                      <SelectItem value="damvi_safravi">Damvi-Safravi</SelectItem>
                      <SelectItem value="balghami_saudavi">Balghami-Saudavi</SelectItem>
                      <SelectItem value="mutadil">Mu'tadil (Balanced)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Qualitative Mizaj</Label>
                  <Select value={qualMizaj} onValueChange={setQualMizaj}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="haar_ratab">Haar Ratab (Hot & Moist)</SelectItem>
                      <SelectItem value="haar_yabis">Haar Yabis (Hot & Dry)</SelectItem>
                      <SelectItem value="barid_ratab">Barid Ratab (Cold & Moist)</SelectItem>
                      <SelectItem value="barid_yabis">Barid Yabis (Cold & Dry)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Body Build (Jism)</Label>
                  <Select value={bodyBuild} onValueChange={setBodyBuild}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="qawi">Qawi (Strong)</SelectItem>
                      <SelectItem value="mutawassit">Mutawassit (Moderate)</SelectItem>
                      <SelectItem value="zaeef">Za'eef (Weak)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Skin Color & Texture</Label>
                  <Select value={skinType} onValueChange={setSkinType}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="red_warm">Red & Warm (Damvi)</SelectItem>
                      <SelectItem value="yellow_hot">Yellow & Hot (Safravi)</SelectItem>
                      <SelectItem value="white_cold">White & Cold (Balghami)</SelectItem>
                      <SelectItem value="dark_dry">Dark & Dry (Saudavi)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tabiyat (Vital Force) Status</Label>
                  <Select value={tabiyat} onValueChange={setTabiyat}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strong">Strong (Qawi)</SelectItem>
                      <SelectItem value="moderate">Moderate (Mutawassit)</SelectItem>
                      <SelectItem value="weak">Weak (Za'eef)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Hair Type</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="thick_black">Thick & Black (Damvi)</SelectItem>
                      <SelectItem value="thin_brown">Thin & Brownish (Safravi)</SelectItem>
                      <SelectItem value="soft_light">Soft & Light (Balghami)</SelectItem>
                      <SelectItem value="dry_coarse">Dry & Coarse (Saudavi)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Sleep Pattern (Naum)</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="heavy">Heavy/Deep (Balghami)</SelectItem>
                      <SelectItem value="moderate">Moderate (Damvi)</SelectItem>
                      <SelectItem value="light">Light/Disturbed (Safravi)</SelectItem>
                      <SelectItem value="insomnia">Insomnia (Saudavi)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Emotional Tendency</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cheerful">Cheerful/Social (Damvi)</SelectItem>
                      <SelectItem value="angry">Angry/Irritable (Safravi)</SelectItem>
                      <SelectItem value="calm_lazy">Calm/Lazy (Balghami)</SelectItem>
                      <SelectItem value="anxious">Anxious/Depressed (Saudavi)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {mizaj && (
                <Card className="bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-200">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Assessed Mizaj</p>
                    <p className="text-2xl font-bold text-indigo-700 mt-1 capitalize">{mizaj.replace("_", "-")}</p>
                    {qualMizaj && <Badge variant="outline" className="mt-2 capitalize">{qualMizaj.replace("_", " ")}</Badge>}
                  </CardContent>
                </Card>
              )}
              <div>
                <Label>Mizaj Assessment Notes</Label>
                <Textarea placeholder="Additional observations about temperament, seasonal variations, familial traits..." rows={3} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nabz" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Nabz (Pulse Examination)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Pulse Rate (bpm)</Label>
                  <Input type="number" placeholder="Beats per minute" />
                </div>
                <div>
                  <Label>Pulse Type (Nabz)</Label>
                  <Select value={nabzType} onValueChange={setNabzType}>
                    <SelectTrigger><SelectValue placeholder="Select Nabz type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nabz_qawi">Nabz Qawi (Strong pulse)</SelectItem>
                      <SelectItem value="nabz_zaeef">Nabz Za'eef (Weak pulse)</SelectItem>
                      <SelectItem value="nabz_sareeh">Nabz Sareeh (Fast pulse)</SelectItem>
                      <SelectItem value="nabz_bati">Nabz Bati (Slow pulse)</SelectItem>
                      <SelectItem value="nabz_mumtali">Nabz Mumtali (Full pulse)</SelectItem>
                      <SelectItem value="nabz_dagheeq">Nabz Dagheeq (Thready pulse)</SelectItem>
                      <SelectItem value="nabz_mutawatir">Nabz Mutawatir (Frequent)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Pulse Quality</Label>
                  <Select value={nabzQuality} onValueChange={setNabzQuality}>
                    <SelectTrigger><SelectValue placeholder="Select quality" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">Regular (Muntazim)</SelectItem>
                      <SelectItem value="irregular">Irregular (Ghair Muntazim)</SelectItem>
                      <SelectItem value="bounding">Bounding (Wathab)</SelectItem>
                      <SelectItem value="feeble">Feeble (Latif)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Nabz Indication</Label>
                  <Select value={nabzIndication} onValueChange={setNabzIndication}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="damvi">Indicates Damvi condition</SelectItem>
                      <SelectItem value="safravi">Indicates Safravi condition</SelectItem>
                      <SelectItem value="balghami">Indicates Balghami condition</SelectItem>
                      <SelectItem value="saudavi">Indicates Saudavi condition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tension (Salabat)</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select tension" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High (Sulb)</SelectItem>
                      <SelectItem value="normal">Normal (Mutawassit)</SelectItem>
                      <SelectItem value="low">Low (Layyin)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Volume (Miqdaar)</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select volume" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="large">Large (Azeem)</SelectItem>
                      <SelectItem value="moderate">Moderate (Mutawassit)</SelectItem>
                      <SelectItem value="small">Small (Sagheer)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Nabz Observations</Label>
                <Textarea placeholder="Detailed pulse characteristics: rhythm, volume, tension, speed, compressibility, vessel wall condition..." rows={3} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="akhlat" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Akhlat (Humoral) Assessment</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Dominant Khilt (Humor)</Label>
                  <Select value={dominantKhilt} onValueChange={setDominantKhilt}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dam">Dam (Blood)</SelectItem>
                      <SelectItem value="safra">Safra (Yellow Bile)</SelectItem>
                      <SelectItem value="balgham">Balgham (Phlegm)</SelectItem>
                      <SelectItem value="sauda">Sauda (Black Bile)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Humoral Imbalance Type</Label>
                  <Select value={imbalanceType} onValueChange={setImbalanceType}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sue_mizaj_saada">Sue Mizaj Saada (Simple imbalance)</SelectItem>
                      <SelectItem value="sue_mizaj_maddi">Sue Mizaj Maddi (Material imbalance)</SelectItem>
                      <SelectItem value="imtila">Imtila (Quantitative excess)</SelectItem>
                      <SelectItem value="istifragh">Istifragh (Deficiency)</SelectItem>
                      <SelectItem value="sudda">Sudda (Obstruction)</SelectItem>
                      <SelectItem value="taffun">Ta'affun (Putrefaction)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Affected A'za (Organ System)</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select organ" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dimagh">Dimagh (Brain)</SelectItem>
                      <SelectItem value="qalb">Qalb (Heart)</SelectItem>
                      <SelectItem value="jigar">Jigar (Liver)</SelectItem>
                      <SelectItem value="meda">Me'da (Stomach)</SelectItem>
                      <SelectItem value="ama">Am'a (Intestines)</SelectItem>
                      <SelectItem value="gurda">Gurda (Kidneys)</SelectItem>
                      <SelectItem value="rihem">Rihem (Uterus)</SelectItem>
                      <SelectItem value="mafasil">Mafasil (Joints)</SelectItem>
                      <SelectItem value="jild">Jild (Skin)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Fasad-e-Akhlat (Humoral Corruption)</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Akhlat Salima)</SelectItem>
                      <SelectItem value="mild">Mild corruption</SelectItem>
                      <SelectItem value="moderate">Moderate corruption</SelectItem>
                      <SelectItem value="severe">Severe corruption (Ghaleez)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Baul (Urine) Examination</Label>
                <Textarea placeholder="Color (Lawn): clear/yellow/dark/red. Consistency (Qiwam): thin/thick. Sediment (Rusub): present/absent. Odor, froth..." rows={2} />
              </div>
              <div>
                <Label>Baraz (Stool) Examination</Label>
                <Textarea placeholder="Consistency, color, frequency, odor, mucus, blood presence..." rows={2} />
              </div>
              <div>
                <Label>Lisan (Tongue) Examination</Label>
                <Textarea placeholder="Color, coating, moisture, cracks, tremors..." rows={2} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ilaj bil Tadabeer (Regimental Therapy) */}
        <TabsContent value="tadabeer" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Ilaj bil Tadabeer (Regimental Therapy)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Non-pharmacological interventions to restore humoral balance and promote Tabiyat.
              </p>
              <div className="space-y-2">
                <Label>Prescribed Regimens</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    "Hijama (Cupping)", "Fasd (Venesection)", "Dalak (Massage)",
                    "Hammam (Turkish Bath)", "Riyazat (Exercise)", "Irsal-e-Alaq (Leeching)",
                    "Kai (Emesis therapy)", "Huqna (Enema)", "Taleeq (Leech therapy)",
                    "Inkibab (Steam inhalation)", "Nutool (Irrigation)", "Aabzan (Sitz bath)",
                    "Zimad (Poultice)", "Takmeed (Fomentation)", "Tila (Ointment application)",
                  ].map((therapy) => (
                    <div key={therapy} className="flex items-center gap-2">
                      <Checkbox id={therapy} />
                      <label htmlFor={therapy} className="text-sm">{therapy}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Primary Tadbeer</Label>
                  <Select value={tadbeerId} onValueChange={setTadbeerId}>
                    <SelectTrigger><SelectValue placeholder="Select primary" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hijama">Hijama (Cupping)</SelectItem>
                      <SelectItem value="fasd">Fasd (Venesection)</SelectItem>
                      <SelectItem value="dalak">Dalak (Massage)</SelectItem>
                      <SelectItem value="hammam">Hammam (Bath)</SelectItem>
                      <SelectItem value="riyazat">Riyazat (Exercise)</SelectItem>
                      <SelectItem value="irsal_alaq">Irsal-e-Alaq (Leeching)</SelectItem>
                      <SelectItem value="huqna">Huqna (Enema)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Sessions Planned</Label>
                  <Input placeholder="e.g., 5 sessions over 2 weeks" />
                </div>
              </div>
              <div>
                <Label>Tadbeer Protocol & Notes</Label>
                <Textarea placeholder="Site of application, duration, frequency, precautions, expected outcome..." rows={3} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ilaj bil Ghiza (Dietotherapy) */}
        <TabsContent value="ghiza" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Ilaj bil Ghiza (Dietotherapy)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Treatment through food — correcting mizaj imbalance using foods of opposite temperament.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Diet Temperament Required</Label>
                  <Select value={ghizaType} onValueChange={setGhizaType}>
                    <SelectTrigger><SelectValue placeholder="Select diet type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="haar_ratab">Haar Ratab (Hot & Moist foods)</SelectItem>
                      <SelectItem value="haar_yabis">Haar Yabis (Hot & Dry foods)</SelectItem>
                      <SelectItem value="barid_ratab">Barid Ratab (Cold & Moist foods)</SelectItem>
                      <SelectItem value="barid_yabis">Barid Yabis (Cold & Dry foods)</SelectItem>
                      <SelectItem value="mutadil">Mu'tadil (Balanced diet)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Digestive Capacity (Quwwat-e-Hazima)</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strong">Strong (Qawi)</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="weak">Weak (Za'eef)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Recommended Foods (Ghiza Mufeed)</Label>
                <Textarea placeholder="e.g., For Safravi: cooling foods — cucumber, watermelon, pomegranate, curd, barley water (Ma-ul-Shaeer)..." rows={3} />
              </div>
              <div>
                <Label>Foods to Avoid (Ghiza Muzir)</Label>
                <Textarea placeholder="e.g., For Safravi: avoid hot spices, fried foods, red meat, excessive salt..." rows={3} />
              </div>
              <div>
                <Label>Meal Schedule & Special Instructions</Label>
                <Textarea placeholder="Timings, water intake, food combinations, seasonal adjustments, Tadeej (gradual change)..." rows={3} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ilaj bil Dawa (Pharmacotherapy) */}
        <TabsContent value="dawa" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Ilaj bil Dawa (Unani Pharmacotherapy)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Medicine Form (Shakl-e-Dawa)</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select dosage form" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="majoon">Majoon (Confection)</SelectItem>
                      <SelectItem value="habb">Habb (Tablet/Pill)</SelectItem>
                      <SelectItem value="jawarish">Jawarish (Digestive confection)</SelectItem>
                      <SelectItem value="sharbat">Sharbat (Syrup)</SelectItem>
                      <SelectItem value="arq">Arq (Distillate)</SelectItem>
                      <SelectItem value="roghan">Roghan (Medicated oil)</SelectItem>
                      <SelectItem value="safoof">Safoof (Powder)</SelectItem>
                      <SelectItem value="qurs">Qurs (Tablet)</SelectItem>
                      <SelectItem value="joshanda">Joshanda (Decoction)</SelectItem>
                      <SelectItem value="kushta">Kushta (Calcined metal/mineral)</SelectItem>
                      <SelectItem value="zimad">Zimad (Paste for external use)</SelectItem>
                      <SelectItem value="marham">Marham (Ointment)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Drug Temperament (Mizaj-e-Dawa)</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select drug mizaj" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="haar_1">Haar Daraja Awwal (Hot 1st degree)</SelectItem>
                      <SelectItem value="haar_2">Haar Daraja Duwwum (Hot 2nd degree)</SelectItem>
                      <SelectItem value="haar_3">Haar Daraja Siyyum (Hot 3rd degree)</SelectItem>
                      <SelectItem value="barid_1">Barid Daraja Awwal (Cold 1st degree)</SelectItem>
                      <SelectItem value="barid_2">Barid Daraja Duwwum (Cold 2nd degree)</SelectItem>
                      <SelectItem value="barid_3">Barid Daraja Siyyum (Cold 3rd degree)</SelectItem>
                      <SelectItem value="mutadil">Mu'tadil (Balanced)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Prescriptions (Nuskha)</Label>
                <Textarea placeholder="Medicine name, dose, Anupaan (vehicle), frequency, duration.&#10;e.g., Majoon Dabeed-ul-Ward 5g BD with lukewarm water × 14 days&#10;     Arq Gulab 50ml OD empty stomach × 7 days" rows={5} />
              </div>
              <div>
                <Label>Munzij (Concoction/Maturation) Therapy</Label>
                <Textarea placeholder="Maturation medicines before Mushil (purgation): e.g., Joshanda-e-Unnab for 3 days..." rows={2} />
              </div>
              <div>
                <Label>Mushil (Purgative/Evacuant) if indicated</Label>
                <Textarea placeholder="Post-maturation evacuation medicine: type, dose, timing..." rows={2} />
              </div>
              <div>
                <Label>Ilaj bil Yad (Surgery, if applicable)</Label>
                <Textarea placeholder="Surgical intervention if needed — Jarahat procedures..." rows={2} />
              </div>
              <div>
                <Label>Follow-up & Prognosis</Label>
                <Textarea placeholder="Next visit date, expected response time, warning signs to report, prognosis assessment..." rows={3} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsUnani;
