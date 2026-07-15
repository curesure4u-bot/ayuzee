import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Leaf, Save, Plus, ClipboardList } from "lucide-react";

type DoshaScore = { vata: number; pitta: number; kapha: number };

const HmsAyurveda = () => {
  const [activeTab, setActiveTab] = useState("ashtavidha");
  const [patientName, setPatientName] = useState("");
  const [doshaScore, setDoshaScore] = useState<DoshaScore>({ vata: 33, pitta: 33, kapha: 34 });

  // Ashtavidha Pareeksha fields
  const [nadi, setNadi] = useState("");
  const [mutra, setMutra] = useState("");
  const [mala, setMala] = useState("");
  const [jihva, setJihva] = useState("");
  const [shabda, setShabda] = useState("");
  const [sparsha, setSparsha] = useState("");
  const [drik, setDrik] = useState("");
  const [akriti, setAkriti] = useState("");

  // Dashavidha Pareeksha fields
  const [prakruti, setPrakruti] = useState("");
  const [vikruti, setVikruti] = useState("");
  const [sara, setSara] = useState("");
  const [samhanana, setSamhanana] = useState("");
  const [pramana, setPramana] = useState("");
  const [satmya, setSatmya] = useState("");
  const [satva, setSatva] = useState("");
  const [ahara, setAhara] = useState("");
  const [vyayama, setVyayama] = useState("");
  const [vaya, setVaya] = useState("");

  // Additional Ayurveda fields
  const [agni, setAgni] = useState("");
  const [ama, setAma] = useState("");
  const [ojas, setOjas] = useState("");
  const [samprapti, setSamprapti] = useState("");
  const [chikitsa, setChikitsa] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    if (!patientName.trim()) return toast.error("Select a patient first");
    toast.success("Ayurveda assessment saved successfully");
  };

  const getDominantDosha = () => {
    const max = Math.max(doshaScore.vata, doshaScore.pitta, doshaScore.kapha);
    if (max === doshaScore.vata) return "Vata";
    if (max === doshaScore.pitta) return "Pitta";
    return "Kapha";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-600" /> Ayurveda Clinical Module
          </h1>
          <p className="text-sm text-muted-foreground">
            Complete Ayurvedic examination and assessment tools
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-1 h-4 w-4" /> Save Assessment
        </Button>
      </div>

      {/* Patient Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Patient Name</Label>
              <Input
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Search or enter patient name"
              />
            </div>
            <div>
              <Label>UHID</Label>
              <Input placeholder="Auto-generated" disabled />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different examination types */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full">
          <TabsTrigger value="ashtavidha">Ashtavidha</TabsTrigger>
          <TabsTrigger value="dashavidha">Dashavidha</TabsTrigger>
          <TabsTrigger value="dosha">Dosha Analysis</TabsTrigger>
          <TabsTrigger value="agni-ama">Agni & Ama</TabsTrigger>
          <TabsTrigger value="chikitsa">Chikitsa Plan</TabsTrigger>
        </TabsList>

        {/* Ashtavidha Pareeksha */}
        <TabsContent value="ashtavidha" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Ashtavidha Pareeksha (Eight-fold Examination)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>1. Nadi (Pulse)</Label>
                  <Select value={nadi} onValueChange={setNadi}>
                    <SelectTrigger><SelectValue placeholder="Select Nadi type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vata_nadi">Vata Nadi (Snake-like)</SelectItem>
                      <SelectItem value="pitta_nadi">Pitta Nadi (Frog-like)</SelectItem>
                      <SelectItem value="kapha_nadi">Kapha Nadi (Swan-like)</SelectItem>
                      <SelectItem value="vata_pitta">Vata-Pitta</SelectItem>
                      <SelectItem value="pitta_kapha">Pitta-Kapha</SelectItem>
                      <SelectItem value="vata_kapha">Vata-Kapha</SelectItem>
                      <SelectItem value="sama">Sama (Balanced)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>2. Mutra (Urine)</Label>
                  <Select value={mutra} onValueChange={setMutra}>
                    <SelectTrigger><SelectValue placeholder="Select Mutra status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal (Prakruta)</SelectItem>
                      <SelectItem value="scanty">Scanty (Alpa)</SelectItem>
                      <SelectItem value="excessive">Excessive (Bahu)</SelectItem>
                      <SelectItem value="turbid">Turbid (Avila)</SelectItem>
                      <SelectItem value="dark">Dark colored</SelectItem>
                      <SelectItem value="painful">Painful (Sarujna)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>3. Mala (Stool)</Label>
                  <Select value={mala} onValueChange={setMala}>
                    <SelectTrigger><SelectValue placeholder="Select Mala status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal (Sama)</SelectItem>
                      <SelectItem value="constipated">Constipated (Vibandha)</SelectItem>
                      <SelectItem value="loose">Loose (Atisara)</SelectItem>
                      <SelectItem value="mucoid">Mucoid (Ama yukta)</SelectItem>
                      <SelectItem value="hard">Hard & Dry</SelectItem>
                      <SelectItem value="foul">Foul smelling (Durgandha)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>4. Jihva (Tongue)</Label>
                  <Select value={jihva} onValueChange={setJihva}>
                    <SelectTrigger><SelectValue placeholder="Select Jihva status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal (Prakruta)</SelectItem>
                      <SelectItem value="coated">Coated (Sama)</SelectItem>
                      <SelectItem value="dry">Dry (Ruksha)</SelectItem>
                      <SelectItem value="pale">Pale (Pandu)</SelectItem>
                      <SelectItem value="red">Red (Rakta)</SelectItem>
                      <SelectItem value="black">Black/Dark (Krishna)</SelectItem>
                      <SelectItem value="tremors">Tremors (Kampa)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>5. Shabda (Voice/Speech)</Label>
                  <Select value={shabda} onValueChange={setShabda}>
                    <SelectTrigger><SelectValue placeholder="Select Shabda" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal (Prakruta)</SelectItem>
                      <SelectItem value="hoarse">Hoarse (Swarabheda)</SelectItem>
                      <SelectItem value="nasal">Nasal</SelectItem>
                      <SelectItem value="weak">Weak (Kshina)</SelectItem>
                      <SelectItem value="loud">Loud/High pitched</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>6. Sparsha (Touch/Skin)</Label>
                  <Select value={sparsha} onValueChange={setSparsha}>
                    <SelectTrigger><SelectValue placeholder="Select Sparsha" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal (Sama)</SelectItem>
                      <SelectItem value="dry_rough">Dry & Rough (Ruksha)</SelectItem>
                      <SelectItem value="hot">Hot (Ushna)</SelectItem>
                      <SelectItem value="cold_moist">Cold & Moist (Sheeta)</SelectItem>
                      <SelectItem value="oily">Oily (Snigdha)</SelectItem>
                      <SelectItem value="sweaty">Sweaty (Sweda yukta)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>7. Drik (Eyes)</Label>
                  <Select value={drik} onValueChange={setDrik}>
                    <SelectTrigger><SelectValue placeholder="Select Drik" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal (Prakruta)</SelectItem>
                      <SelectItem value="red">Red (Rakta)</SelectItem>
                      <SelectItem value="yellow">Yellow (Peeta)</SelectItem>
                      <SelectItem value="pale">Pale (Pandu)</SelectItem>
                      <SelectItem value="dry">Dry (Ruksha)</SelectItem>
                      <SelectItem value="watery">Watery (Ashrupurna)</SelectItem>
                      <SelectItem value="sunken">Sunken (Nimna)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>8. Akriti (General Appearance)</Label>
                  <Select value={akriti} onValueChange={setAkriti}>
                    <SelectTrigger><SelectValue placeholder="Select Akriti" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal Build</SelectItem>
                      <SelectItem value="thin">Thin/Lean (Krisha)</SelectItem>
                      <SelectItem value="obese">Obese (Sthula)</SelectItem>
                      <SelectItem value="medium">Medium (Madhyama)</SelectItem>
                      <SelectItem value="emaciated">Emaciated (Dhatu Kshaya)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Ashtavidha Notes</Label>
                <Textarea placeholder="Additional observations during eight-fold examination..." rows={3} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dashavidha Pareeksha */}
        <TabsContent value="dashavidha" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Dashavidha Pareeksha (Ten-fold Examination)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>1. Prakruti (Constitution)</Label>
                  <Select value={prakruti} onValueChange={setPrakruti}>
                    <SelectTrigger><SelectValue placeholder="Select Prakruti" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vata">Vata Prakruti</SelectItem>
                      <SelectItem value="pitta">Pitta Prakruti</SelectItem>
                      <SelectItem value="kapha">Kapha Prakruti</SelectItem>
                      <SelectItem value="vata_pitta">Vata-Pitta</SelectItem>
                      <SelectItem value="pitta_kapha">Pitta-Kapha</SelectItem>
                      <SelectItem value="vata_kapha">Vata-Kapha</SelectItem>
                      <SelectItem value="tridosha">Tridosha (Sama)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>2. Vikruti (Current Imbalance)</Label>
                  <Select value={vikruti} onValueChange={setVikruti}>
                    <SelectTrigger><SelectValue placeholder="Select Vikruti" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vata_vriddhi">Vata Vriddhi</SelectItem>
                      <SelectItem value="pitta_vriddhi">Pitta Vriddhi</SelectItem>
                      <SelectItem value="kapha_vriddhi">Kapha Vriddhi</SelectItem>
                      <SelectItem value="vata_pitta_v">Vata-Pitta Vriddhi</SelectItem>
                      <SelectItem value="pitta_kapha_v">Pitta-Kapha Vriddhi</SelectItem>
                      <SelectItem value="vata_kapha_v">Vata-Kapha Vriddhi</SelectItem>
                      <SelectItem value="tridosha_v">Tridosha Vriddhi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>3. Sara (Tissue Quality)</Label>
                  <Select value={sara} onValueChange={setSara}>
                    <SelectTrigger><SelectValue placeholder="Select Sara" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pravara">Pravara (Excellent)</SelectItem>
                      <SelectItem value="madhyama">Madhyama (Moderate)</SelectItem>
                      <SelectItem value="avara">Avara (Poor)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>4. Samhanana (Body Compactness)</Label>
                  <Select value={samhanana} onValueChange={setSamhanana}>
                    <SelectTrigger><SelectValue placeholder="Select Samhanana" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pravara">Pravara (Well-built)</SelectItem>
                      <SelectItem value="madhyama">Madhyama (Moderate)</SelectItem>
                      <SelectItem value="avara">Avara (Loose/Weak)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>5. Pramana (Body Proportions)</Label>
                  <Select value={pramana} onValueChange={setPramana}>
                    <SelectTrigger><SelectValue placeholder="Select Pramana" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sama">Sama (Proportional)</SelectItem>
                      <SelectItem value="hrasva">Hrasva (Short)</SelectItem>
                      <SelectItem value="deergha">Deergha (Tall)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>6. Satmya (Adaptability)</Label>
                  <Select value={satmya} onValueChange={setSatmya}>
                    <SelectTrigger><SelectValue placeholder="Select Satmya" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pravara">Pravara (High adaptability)</SelectItem>
                      <SelectItem value="madhyama">Madhyama (Moderate)</SelectItem>
                      <SelectItem value="avara">Avara (Low adaptability)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>7. Satva (Mental Strength)</Label>
                  <Select value={satva} onValueChange={setSatva}>
                    <SelectTrigger><SelectValue placeholder="Select Satva" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pravara">Pravara (Strong will)</SelectItem>
                      <SelectItem value="madhyama">Madhyama (Moderate)</SelectItem>
                      <SelectItem value="avara">Avara (Weak will)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>8. Ahara Shakti (Digestive Capacity)</Label>
                  <Select value={ahara} onValueChange={setAhara}>
                    <SelectTrigger><SelectValue placeholder="Select Ahara Shakti" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pravara">Pravara (Strong digestion)</SelectItem>
                      <SelectItem value="madhyama">Madhyama (Moderate)</SelectItem>
                      <SelectItem value="avara">Avara (Weak digestion)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>9. Vyayama Shakti (Exercise Capacity)</Label>
                  <Select value={vyayama} onValueChange={setVyayama}>
                    <SelectTrigger><SelectValue placeholder="Select Vyayama Shakti" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pravara">Pravara (High stamina)</SelectItem>
                      <SelectItem value="madhyama">Madhyama (Moderate)</SelectItem>
                      <SelectItem value="avara">Avara (Low stamina)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>10. Vaya (Age Group)</Label>
                  <Select value={vaya} onValueChange={setVaya}>
                    <SelectTrigger><SelectValue placeholder="Select Vaya" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bala">Bala (Childhood, 0-16)</SelectItem>
                      <SelectItem value="madhya">Madhya (Middle, 16-60)</SelectItem>
                      <SelectItem value="vriddha">Vriddha (Old age, 60+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dosha Analysis */}
        <TabsContent value="dosha" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dosha Scoring & Prakruti Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Vata Score</Label>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700">
                        {doshaScore.vata}%
                      </Badge>
                    </div>
                    <Slider
                      value={[doshaScore.vata]}
                      onValueChange={([v]) => setDoshaScore({ ...doshaScore, vata: v })}
                      max={100}
                      step={1}
                      className="[&_[role=slider]]:bg-purple-500"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Pitta Score</Label>
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        {doshaScore.pitta}%
                      </Badge>
                    </div>
                    <Slider
                      value={[doshaScore.pitta]}
                      onValueChange={([v]) => setDoshaScore({ ...doshaScore, pitta: v })}
                      max={100}
                      step={1}
                      className="[&_[role=slider]]:bg-red-500"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Kapha Score</Label>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {doshaScore.kapha}%
                      </Badge>
                    </div>
                    <Slider
                      value={[doshaScore.kapha]}
                      onValueChange={([v]) => setDoshaScore({ ...doshaScore, kapha: v })}
                      max={100}
                      step={1}
                      className="[&_[role=slider]]:bg-blue-500"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">Dominant Dosha</p>
                      <p className="text-3xl font-bold text-green-700 mt-1">{getDominantDosha()}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        V:{doshaScore.vata} | P:{doshaScore.pitta} | K:{doshaScore.kapha}
                      </p>
                    </CardContent>
                  </Card>
                  <div>
                    <Label>Dhatu Assessment</Label>
                    <Textarea placeholder="Rasa, Rakta, Mamsa, Meda, Asthi, Majja, Shukra status..." rows={3} />
                  </div>
                  <div>
                    <Label>Mala Assessment</Label>
                    <Textarea placeholder="Purisha, Mutra, Sweda observations..." rows={2} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agni & Ama Assessment */}
        <TabsContent value="agni-ama" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Agni & Ama Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Agni (Digestive Fire)</Label>
                  <Select value={agni} onValueChange={setAgni}>
                    <SelectTrigger><SelectValue placeholder="Select Agni type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sama">Sama Agni (Balanced)</SelectItem>
                      <SelectItem value="vishama">Vishama Agni (Irregular - Vata)</SelectItem>
                      <SelectItem value="tikshna">Tikshna Agni (Sharp - Pitta)</SelectItem>
                      <SelectItem value="manda">Manda Agni (Slow - Kapha)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ama (Toxin Status)</Label>
                  <Select value={ama} onValueChange={setAma}>
                    <SelectTrigger><SelectValue placeholder="Select Ama level" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nirama">Nirama (No toxins)</SelectItem>
                      <SelectItem value="mild_ama">Mild Ama</SelectItem>
                      <SelectItem value="moderate_ama">Moderate Ama</SelectItem>
                      <SelectItem value="severe_ama">Severe Ama (Sama condition)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ojas (Vitality)</Label>
                  <Select value={ojas} onValueChange={setOjas}>
                    <SelectTrigger><SelectValue placeholder="Select Ojas status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="good">Good (Para Ojas)</SelectItem>
                      <SelectItem value="diminished">Diminished (Ojas Kshaya)</SelectItem>
                      <SelectItem value="displaced">Displaced (Ojas Vyapad)</SelectItem>
                      <SelectItem value="obstructed">Obstructed (Ojas Visramsa)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Koshtha (Bowel Habit)</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select Koshtha" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="krura">Krura (Hard bowel - Vata)</SelectItem>
                      <SelectItem value="mrudu">Mrudu (Soft bowel - Pitta)</SelectItem>
                      <SelectItem value="madhyama">Madhyama (Moderate - Kapha)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Srotas (Channels) Involvement</Label>
                <Textarea placeholder="Pranavaha, Annavaha, Rasavaha, Raktavaha srotas findings..." rows={3} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chikitsa Plan */}
        <TabsContent value="chikitsa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Samprapti & Chikitsa Siddhanta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Samprapti (Pathogenesis)</Label>
                <Textarea
                  value={samprapti}
                  onChange={(e) => setSamprapti(e.target.value)}
                  placeholder="Describe the disease pathogenesis - Nidana, Dosha, Dushya, Srotas, Srotodushti, Agni, Ama, Udbhava Sthana, Sanchara, Vyakti Sthana..."
                  rows={4}
                />
              </div>
              <div>
                <Label>Chikitsa Siddhanta (Treatment Principles)</Label>
                <Textarea
                  value={chikitsa}
                  onChange={(e) => setChikitsa(e.target.value)}
                  placeholder="Nidana Parivarjana, Shodhana, Shamana, Pathya-Apathya, Rasayana..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Shodhana Recommended</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select Shodhana" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vamana">Vamana (Emesis)</SelectItem>
                      <SelectItem value="virechana">Virechana (Purgation)</SelectItem>
                      <SelectItem value="basti">Basti (Enema)</SelectItem>
                      <SelectItem value="nasya">Nasya (Nasal)</SelectItem>
                      <SelectItem value="raktamokshana">Raktamokshana (Bloodletting)</SelectItem>
                      <SelectItem value="none">Not indicated at present</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Pathya (Diet Regimen)</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select diet type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="laghu">Laghu Ahara (Light diet)</SelectItem>
                      <SelectItem value="guru">Guru Ahara (Heavy diet)</SelectItem>
                      <SelectItem value="snigdha">Snigdha (Unctuous)</SelectItem>
                      <SelectItem value="ruksha">Ruksha (Dry/Light)</SelectItem>
                      <SelectItem value="ushna">Ushna (Warm)</SelectItem>
                      <SelectItem value="sheeta">Sheeta (Cooling)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Additional Clinical Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional observations, recommendations, or follow-up plans..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsAyurveda;
