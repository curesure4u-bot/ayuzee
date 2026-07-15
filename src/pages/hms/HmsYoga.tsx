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
import { Dumbbell, Save } from "lucide-react";

const HmsYoga = () => {
  const [patientName, setPatientName] = useState("");
  const [stressLevel, setStressLevel] = useState([5]);
  const [fitnessLevel, setFitnessLevel] = useState([5]);
  const [flexibilityLevel, setFlexibilityLevel] = useState([5]);

  const handleSave = () => {
    if (!patientName.trim()) return toast.error("Select a patient first");
    toast.success("Yoga & Naturopathy assessment saved");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-orange-600" /> Yoga & Naturopathy Module
          </h1>
          <p className="text-sm text-muted-foreground">
            Yoga Assessment, Lifestyle Scoring, Exercise Prescription & Wellness Tracking
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

      <Tabs defaultValue="assessment">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
          <TabsTrigger value="assessment">Yoga Assessment</TabsTrigger>
          <TabsTrigger value="lifestyle">Lifestyle Scoring</TabsTrigger>
          <TabsTrigger value="prescription">Prescription</TabsTrigger>
          <TabsTrigger value="naturopathy">Naturopathy</TabsTrigger>
        </TabsList>

        <TabsContent value="assessment" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Yoga Fitness Assessment</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Stress Level</Label>
                    <Badge variant="outline">{stressLevel[0]}/10</Badge>
                  </div>
                  <Slider value={stressLevel} onValueChange={setStressLevel} max={10} step={1} />
                  <p className="text-xs text-muted-foreground mt-1">
                    {stressLevel[0] <= 3 ? "Low stress" : stressLevel[0] <= 6 ? "Moderate stress" : "High stress"}
                  </p>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Fitness Level</Label>
                    <Badge variant="outline">{fitnessLevel[0]}/10</Badge>
                  </div>
                  <Slider value={fitnessLevel} onValueChange={setFitnessLevel} max={10} step={1} />
                  <p className="text-xs text-muted-foreground mt-1">
                    {fitnessLevel[0] <= 3 ? "Sedentary" : fitnessLevel[0] <= 6 ? "Moderate" : "Active"}
                  </p>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Flexibility</Label>
                    <Badge variant="outline">{flexibilityLevel[0]}/10</Badge>
                  </div>
                  <Slider value={flexibilityLevel} onValueChange={setFlexibilityLevel} max={10} step={1} />
                  <p className="text-xs text-muted-foreground mt-1">
                    {flexibilityLevel[0] <= 3 ? "Stiff" : flexibilityLevel[0] <= 6 ? "Moderate" : "Flexible"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Posture Assessment</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal posture</SelectItem>
                      <SelectItem value="kyphosis">Kyphosis (rounded upper back)</SelectItem>
                      <SelectItem value="lordosis">Lordosis (excessive lower back curve)</SelectItem>
                      <SelectItem value="scoliosis">Scoliosis (lateral curve)</SelectItem>
                      <SelectItem value="forward_head">Forward head posture</SelectItem>
                      <SelectItem value="flat_back">Flat back</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Breathing Pattern</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diaphragmatic">Diaphragmatic (Normal)</SelectItem>
                      <SelectItem value="chest">Chest breathing (Shallow)</SelectItem>
                      <SelectItem value="mouth">Mouth breathing</SelectItem>
                      <SelectItem value="irregular">Irregular pattern</SelectItem>
                      <SelectItem value="rapid">Rapid/Hyperventilation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>BMI Category</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="underweight">Underweight (&lt;18.5)</SelectItem>
                      <SelectItem value="normal">Normal (18.5-24.9)</SelectItem>
                      <SelectItem value="overweight">Overweight (25-29.9)</SelectItem>
                      <SelectItem value="obese">Obese (&gt;30)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Sleep Quality</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="good">Good (7-8 hrs, refreshed)</SelectItem>
                      <SelectItem value="fair">Fair (6-7 hrs)</SelectItem>
                      <SelectItem value="poor">Poor (disturbed/insomnia)</SelectItem>
                      <SelectItem value="excessive">Excessive (&gt;9 hrs)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lifestyle" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Lifestyle & Wellness Scoring</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Diet Pattern</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sattvic">Sattvic (Pure vegetarian, balanced)</SelectItem>
                      <SelectItem value="rajasic">Rajasic (Spicy, stimulating)</SelectItem>
                      <SelectItem value="tamasic">Tamasic (Heavy, processed)</SelectItem>
                      <SelectItem value="mixed">Mixed diet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Daily Routine (Dinacharya)</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disciplined">Disciplined (Brahma Muhurta waking)</SelectItem>
                      <SelectItem value="moderate">Moderate regularity</SelectItem>
                      <SelectItem value="irregular">Irregular schedule</SelectItem>
                      <SelectItem value="night_shift">Night shift worker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Mental State</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="calm">Calm & focused</SelectItem>
                      <SelectItem value="anxious">Anxious/Restless</SelectItem>
                      <SelectItem value="depressed">Low mood/Depressed</SelectItem>
                      <SelectItem value="angry">Irritable/Angry</SelectItem>
                      <SelectItem value="scattered">Scattered/Distracted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Addiction/Habits</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No addictions</SelectItem>
                      <SelectItem value="smoking">Smoking</SelectItem>
                      <SelectItem value="alcohol">Alcohol</SelectItem>
                      <SelectItem value="tobacco">Tobacco chewing</SelectItem>
                      <SelectItem value="caffeine">Excessive caffeine</SelectItem>
                      <SelectItem value="screen">Screen addiction</SelectItem>
                      <SelectItem value="multiple">Multiple habits</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Social & Emotional Well-being</Label>
                <Textarea placeholder="Family relationships, work stress, social connections, emotional support system..." rows={3} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescription" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Yoga Prescription</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Asanas (Postures) Prescribed</Label>
                <Textarea placeholder="e.g., Tadasana, Bhujangasana, Paschimottanasana, Shavasana - with sets, duration, and precautions..." rows={4} />
              </div>
              <div>
                <Label>Pranayama (Breathing Exercises)</Label>
                <Textarea placeholder="e.g., Anulom Vilom (10 min), Bhramari (5 min), Kapalbhati (3 min)..." rows={3} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Meditation Technique</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mindfulness">Mindfulness meditation</SelectItem>
                      <SelectItem value="om">Om chanting meditation</SelectItem>
                      <SelectItem value="yoga_nidra">Yoga Nidra</SelectItem>
                      <SelectItem value="trataka">Trataka (Candle gazing)</SelectItem>
                      <SelectItem value="vipassana">Vipassana</SelectItem>
                      <SelectItem value="chakra">Chakra meditation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Duration (minutes/day)</Label>
                  <Input type="number" placeholder="e.g., 45" />
                </div>
              </div>
              <div>
                <Label>Shatkarma (Cleansing Practices)</Label>
                <Textarea placeholder="Jala Neti, Sutra Neti, Dhauti, Basti, Trataka, Kapalbhati if applicable..." rows={2} />
              </div>
              <div>
                <Label>Diet Plan</Label>
                <Textarea placeholder="Morning routine, breakfast, lunch, evening, dinner recommendations..." rows={3} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="naturopathy" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Naturopathy Treatments</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Hydrotherapy</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hip_bath">Hip Bath</SelectItem>
                      <SelectItem value="spinal_bath">Spinal Bath</SelectItem>
                      <SelectItem value="foot_bath">Foot Bath</SelectItem>
                      <SelectItem value="steam_bath">Steam Bath</SelectItem>
                      <SelectItem value="enema">Enema</SelectItem>
                      <SelectItem value="colon_hydrotherapy">Colon Hydrotherapy</SelectItem>
                      <SelectItem value="cold_pack">Cold Pack/Compress</SelectItem>
                      <SelectItem value="hot_pack">Hot Pack/Compress</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Mud Therapy</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mud_pack_abdomen">Mud Pack (Abdomen)</SelectItem>
                      <SelectItem value="mud_pack_eyes">Mud Pack (Eyes)</SelectItem>
                      <SelectItem value="mud_bath">Full Mud Bath</SelectItem>
                      <SelectItem value="none">Not applicable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Massage Therapy</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="swedish">Swedish Massage</SelectItem>
                      <SelectItem value="deep_tissue">Deep Tissue</SelectItem>
                      <SelectItem value="reflexology">Reflexology</SelectItem>
                      <SelectItem value="acupressure">Acupressure</SelectItem>
                      <SelectItem value="aromatherapy">Aromatherapy Massage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Fasting Therapy</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="juice_fast">Juice fasting</SelectItem>
                      <SelectItem value="fruit_fast">Fruit fasting</SelectItem>
                      <SelectItem value="water_fast">Water fasting</SelectItem>
                      <SelectItem value="intermittent">Intermittent fasting</SelectItem>
                      <SelectItem value="none">Not recommended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Chromo/Magneto/Other Therapies</Label>
                <Textarea placeholder="Color therapy, magnet therapy, acupuncture points if applicable..." rows={2} />
              </div>
              <div>
                <Label>Follow-up Schedule</Label>
                <Input placeholder="e.g., Weekly for 4 weeks then monthly" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsYoga;
