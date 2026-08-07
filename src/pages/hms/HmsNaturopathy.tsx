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
import { Leaf, Save } from "lucide-react";

const HmsNaturopathy = () => {
  const [patientName, setPatientName] = useState("");

  // Pancha Mahabhuta assessment
  const [prithvi, setPrithvi] = useState("");
  const [jala, setJala] = useState("");
  const [agni, setAgni] = useState("");
  const [vayu, setVayu] = useState("");
  const [akasha, setAkasha] = useState("");

  // Hydrotherapy
  const [hydroType, setHydroType] = useState("");
  const [hydroDuration, setHydroDuration] = useState("");
  const [hydroTemp, setHydroTemp] = useState("");

  // Diet therapy
  const [dietType, setDietType] = useState("");
  const [fastingPlan, setFastingPlan] = useState("");

  // Mud therapy
  const [mudArea, setMudArea] = useState("");
  const [mudDuration, setMudDuration] = useState("");

  const handleSave = () => {
    if (!patientName.trim()) return toast.error("Select a patient first");
    toast.success("Naturopathy assessment saved successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Leaf className="h-6 w-6 text-emerald-600" /> Naturopathy Clinical Module
          </h1>
          <p className="text-sm text-muted-foreground">
            Hydrotherapy, Mud Therapy, Diet Therapy, Fasting & Nature Cure protocols
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

      <Tabs defaultValue="assessment">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full">
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
          <TabsTrigger value="hydrotherapy">Hydrotherapy</TabsTrigger>
          <TabsTrigger value="mud-therapy">Mud Therapy</TabsTrigger>
          <TabsTrigger value="diet">Diet & Fasting</TabsTrigger>
          <TabsTrigger value="treatment">Treatment Plan</TabsTrigger>
        </TabsList>

        {/* Naturopathic Assessment */}
        <TabsContent value="assessment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Pancha Mahabhuta Assessment & Vital Force Evaluation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Prithvi (Earth Element)</Label>
                  <Select value={prithvi} onValueChange={setPrithvi}>
                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="excess">Excess (heavy, sluggish)</SelectItem>
                      <SelectItem value="deficient">Deficient (weak bones, brittle)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Jala (Water Element)</Label>
                  <Select value={jala} onValueChange={setJala}>
                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="excess">Excess (edema, congestion)</SelectItem>
                      <SelectItem value="deficient">Deficient (dehydration, dry skin)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Agni (Fire Element)</Label>
                  <Select value={agni} onValueChange={setAgni}>
                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="excess">Excess (hyperacidity, inflammation)</SelectItem>
                      <SelectItem value="deficient">Deficient (poor digestion, cold)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Vayu (Air Element)</Label>
                  <Select value={vayu} onValueChange={setVayu}>
                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="excess">Excess (bloating, anxiety, pain)</SelectItem>
                      <SelectItem value="deficient">Deficient (lethargy, stagnation)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Akasha (Ether/Space Element)</Label>
                  <Select value={akasha} onValueChange={setAkasha}>
                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="excess">Excess (isolation, disconnection)</SelectItem>
                      <SelectItem value="deficient">Deficient (congestion, blockage)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Vital Force (Vis Medicatrix Naturae)</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Assess vital force" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strong">Strong (good healing capacity)</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="weak">Weak (chronic depletion)</SelectItem>
                      <SelectItem value="suppressed">Suppressed (long-term medication)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Toxemia Level (Morbid Matter)</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Assess toxin accumulation" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimal">Minimal (occasional fatigue)</SelectItem>
                    <SelectItem value="moderate">Moderate (skin issues, digestive upset)</SelectItem>
                    <SelectItem value="high">High (chronic conditions, multi-system)</SelectItem>
                    <SelectItem value="critical">Critical (autoimmune, degenerative)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Nature Cure Assessment Notes</Label>
                <Textarea placeholder="Bowel health, skin condition, sleep quality, emotional state, lifestyle observations..." rows={3} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hydrotherapy */}
        <TabsContent value="hydrotherapy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hydrotherapy Prescription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Hydrotherapy Type</Label>
                  <Select value={hydroType} onValueChange={setHydroType}>
                    <SelectTrigger><SelectValue placeholder="Select therapy" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hip_bath">Hip Bath (Kati Snan)</SelectItem>
                      <SelectItem value="spinal_bath">Spinal Bath</SelectItem>
                      <SelectItem value="steam_bath">Steam Bath</SelectItem>
                      <SelectItem value="sauna">Sauna</SelectItem>
                      <SelectItem value="foot_bath">Foot Bath</SelectItem>
                      <SelectItem value="arm_bath">Arm Bath</SelectItem>
                      <SelectItem value="full_immersion">Full Immersion Bath</SelectItem>
                      <SelectItem value="wet_sheet_pack">Wet Sheet Pack</SelectItem>
                      <SelectItem value="chest_pack">Chest Pack</SelectItem>
                      <SelectItem value="abdomen_pack">Abdomen Pack</SelectItem>
                      <SelectItem value="enema">Enema (Colon Hydrotherapy)</SelectItem>
                      <SelectItem value="douche">Spinal Spray / Douche</SelectItem>
                      <SelectItem value="contrast_bath">Contrast Bath (Hot-Cold)</SelectItem>
                      <SelectItem value="underwater_massage">Underwater Massage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Temperature</Label>
                  <Select value={hydroTemp} onValueChange={setHydroTemp}>
                    <SelectTrigger><SelectValue placeholder="Select temperature" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cold">Cold (10-18 C)</SelectItem>
                      <SelectItem value="cool">Cool (18-26 C)</SelectItem>
                      <SelectItem value="neutral">Neutral (33-36 C)</SelectItem>
                      <SelectItem value="warm">Warm (37-40 C)</SelectItem>
                      <SelectItem value="hot">Hot (40-45 C)</SelectItem>
                      <SelectItem value="contrast">Contrast (alternating)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input
                    value={hydroDuration}
                    onChange={(e) => setHydroDuration(e.target.value)}
                    placeholder="e.g., 20"
                    type="number"
                  />
                </div>
                <div>
                  <Label>Frequency</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="alternate">Alternate days</SelectItem>
                      <SelectItem value="twice_week">Twice a week</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Hydrotherapy Notes / Precautions</Label>
                <Textarea placeholder="Special instructions, contraindications, patient response..." rows={3} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mud Therapy */}
        <TabsContent value="mud-therapy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mud Therapy (Mitti Chikitsa)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Application Area</Label>
                  <Select value={mudArea} onValueChange={setMudArea}>
                    <SelectTrigger><SelectValue placeholder="Select area" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_body">Full Body Mud Pack</SelectItem>
                      <SelectItem value="abdomen">Abdomen Mud Pack</SelectItem>
                      <SelectItem value="eyes">Eye Mud Pack</SelectItem>
                      <SelectItem value="face">Face Mud Pack</SelectItem>
                      <SelectItem value="head">Head Mud Pack</SelectItem>
                      <SelectItem value="joints">Joint Mud Application</SelectItem>
                      <SelectItem value="spine">Spinal Mud Pack</SelectItem>
                      <SelectItem value="local">Local (specify in notes)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input
                    value={mudDuration}
                    onChange={(e) => setMudDuration(e.target.value)}
                    placeholder="e.g., 30"
                    type="number"
                  />
                </div>
                <div>
                  <Label>Mud Type</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select mud type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="black_clay">Black Clay (Fuller's Earth)</SelectItem>
                      <SelectItem value="red_clay">Red Clay</SelectItem>
                      <SelectItem value="bentonite">Bentonite Clay</SelectItem>
                      <SelectItem value="river_mud">River Bed Mud</SelectItem>
                      <SelectItem value="herbal_mud">Herbal Infused Mud</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Sessions Planned</Label>
                  <Input placeholder="e.g., 7 days" />
                </div>
              </div>
              <div>
                <Label>Indications & Notes</Label>
                <Textarea placeholder="Therapeutic goals, skin condition, patient tolerance..." rows={3} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Diet & Fasting */}
        <TabsContent value="diet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Diet Therapy & Fasting Protocol</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Diet Type</Label>
                  <Select value={dietType} onValueChange={setDietType}>
                    <SelectTrigger><SelectValue placeholder="Select diet" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eliminative">Eliminative Diet (liquids, fruits)</SelectItem>
                      <SelectItem value="soothing">Soothing Diet (fruits + steamed veg)</SelectItem>
                      <SelectItem value="constructive">Constructive Diet (balanced whole food)</SelectItem>
                      <SelectItem value="raw_food">Raw Food Diet</SelectItem>
                      <SelectItem value="alkaline">Alkaline Diet</SelectItem>
                      <SelectItem value="mono_diet">Mono Diet (single food)</SelectItem>
                      <SelectItem value="juice_therapy">Juice Therapy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Fasting Plan</Label>
                  <Select value={fastingPlan} onValueChange={setFastingPlan}>
                    <SelectTrigger><SelectValue placeholder="Select fasting type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No fasting</SelectItem>
                      <SelectItem value="intermittent_16_8">Intermittent (16:8)</SelectItem>
                      <SelectItem value="intermittent_18_6">Intermittent (18:6)</SelectItem>
                      <SelectItem value="juice_fast_1">Juice Fast (1 day/week)</SelectItem>
                      <SelectItem value="juice_fast_3">Juice Fast (3 days)</SelectItem>
                      <SelectItem value="water_fast_1">Water Fast (1 day)</SelectItem>
                      <SelectItem value="water_fast_3">Water Fast (3 days supervised)</SelectItem>
                      <SelectItem value="fruit_fast">Fruit Fast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Dietary Restrictions</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {["No refined sugar", "No white flour", "No dairy", "No caffeine", "No alcohol", "No processed food", "No fried food", "No non-veg"].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <Checkbox id={item} />
                      <label htmlFor={item} className="text-sm">{item}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label>Diet Schedule & Specific Instructions</Label>
                <Textarea placeholder="Morning routine, meal timings, specific foods to include/avoid, water intake goals..." rows={4} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Treatment Plan */}
        <TabsContent value="treatment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Naturopathy Treatment Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Therapies Prescribed</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    "Hydrotherapy", "Mud Therapy", "Massage (Swedish)", "Acupressure",
                    "Chromotherapy", "Magnetotherapy", "Air Bath (Vayu Snan)",
                    "Sun Bath (Surya Snan)", "Yoga Asanas", "Pranayama",
                    "Meditation", "Enema", "Wet Pack", "Spinal Bath",
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
                  <Label>Treatment Duration</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select duration" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7_days">7 Days (Acute)</SelectItem>
                      <SelectItem value="14_days">14 Days (Sub-acute)</SelectItem>
                      <SelectItem value="21_days">21 Days (Standard course)</SelectItem>
                      <SelectItem value="30_days">30 Days (Chronic)</SelectItem>
                      <SelectItem value="90_days">90 Days (Lifestyle disease)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Follow-up Interval</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select interval" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily (in-patient)</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Lifestyle Modifications</Label>
                <Textarea placeholder="Sleep schedule, exercise routine, stress management, digital detox, nature exposure recommendations..." rows={3} />
              </div>
              <div>
                <Label>Expected Healing Response (Healing Crisis)</Label>
                <Textarea placeholder="Explain potential aggravation phase, detox symptoms patient may experience, and when to report..." rows={3} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsNaturopathy;
