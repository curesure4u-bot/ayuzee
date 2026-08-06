import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Brain,
  Printer,
  MessageCircle,
  AlertTriangle,
  Activity,
  Wind,
  Hand,
  Eye,
} from "lucide-react";

const yogaPlan = [
  {
    asana: "Bhujangasana (Cobra Pose)",
    duration: "30 seconds hold",
    repetitions: "3-5 times",
    precautions: "Do not overextend the spine. Keep elbows slightly bent.",
    contraindication: false,
    videoLink: "#",
  },
  {
    asana: "Shalabhasana (Locust Pose)",
    duration: "20 seconds hold",
    repetitions: "3 times",
    precautions: "Avoid if acute pain. Lift legs only as high as comfortable.",
    contraindication: false,
    videoLink: "#",
  },
  {
    asana: "Marjariasana (Cat-Cow Stretch)",
    duration: "1 minute",
    repetitions: "10 cycles",
    precautions: "Move slowly and gently. Coordinate with breath.",
    contraindication: false,
    videoLink: "#",
  },
  {
    asana: "Setu Bandhasana (Bridge Pose)",
    duration: "30 seconds hold",
    repetitions: "3-5 times",
    precautions: "Keep knees aligned over ankles. Do not turn head while in pose.",
    contraindication: false,
    videoLink: "#",
  },
  {
    asana: "Pawanmuktasana (Wind-Relieving Pose)",
    duration: "30 seconds each leg",
    repetitions: "3 times each side",
    precautions: "Hug knee gently without forcing. Keep opposite leg relaxed.",
    contraindication: false,
    videoLink: "#",
  },
  {
    asana: "Paschimottanasana (Seated Forward Bend)",
    duration: "—",
    repetitions: "—",
    precautions: "AVOID - Forward bends aggravate Sciatica. Can increase disc pressure.",
    contraindication: true,
    videoLink: "#",
  },
];

const pranayama = [
  {
    name: "Anulom Vilom (Alternate Nostril Breathing)",
    duration: "5 minutes",
    rounds: "10 rounds",
    benefits: "Balances Vata, calms nervous system, reduces pain perception",
  },
  {
    name: "Bhramari (Humming Bee Breath)",
    duration: "3 minutes",
    rounds: "7 rounds",
    benefits: "Reduces anxiety & muscle tension, promotes relaxation",
  },
  {
    name: "Dirga Pranayama (Three-Part Breath)",
    duration: "5 minutes",
    rounds: "Continuous",
    benefits: "Full oxygenation, reduces stress response, calms Vata",
  },
];

const mudras = [
  {
    name: "Vayu Mudra",
    duration: "15 minutes, 2x daily",
    benefits: "Reduces Vata aggravation, helps in nerve pain, joint stiffness",
    technique: "Fold index finger to touch base of thumb, press with thumb",
  },
  {
    name: "Prana Mudra",
    duration: "15 minutes, 2x daily",
    benefits: "Increases vitality, strengthens immune system, reduces fatigue",
    technique: "Touch tips of ring finger and little finger to thumb tip",
  },
];

const DoctorYoga = () => {
  const [selectedPatient, setSelectedPatient] = useState("vikram-singh");
  const [selectedCondition, setSelectedCondition] = useState("gridhrasi");
  const [showPlan, setShowPlan] = useState(true);

  const handleGenerate = () => {
    setShowPlan(true);
    toast.success("AI Yoga plan generated based on condition & patient profile");
  };

  const handleSendToPatient = () => {
    toast.success("Yoga prescription sent to patient via WhatsApp");
  };

  const handlePrint = () => {
    toast.success("Preparing yoga chart for printing...");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8 text-purple-600" />
            Yoga & Exercise Prescription (AI)
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-generated yoga and exercise plans tailored to patient condition
          </p>
        </div>
      </div>

      {/* Selection Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Select Patient</Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vikram-singh">Vikram Singh</SelectItem>
                  <SelectItem value="rajesh-kumar">Rajesh Kumar</SelectItem>
                  <SelectItem value="sunita-devi">Sunita Devi</SelectItem>
                  <SelectItem value="meera-patel">Meera Patel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Condition</Label>
              <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gridhrasi">Gridhrasi (Sciatica / Lower Back Pain)</SelectItem>
                  <SelectItem value="sandhivata">Sandhivata (Osteoarthritis)</SelectItem>
                  <SelectItem value="amavata">Amavata (Rheumatoid Arthritis)</SelectItem>
                  <SelectItem value="cervical">Manyasthambha (Cervical Spondylosis)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="mt-4" onClick={handleGenerate}>
            <Brain className="h-4 w-4 mr-2" />
            Generate AI Yoga Plan
          </Button>
        </CardContent>
      </Card>

      {showPlan && (
        <>
          {/* AI Note */}
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4 flex items-center gap-3">
              <Brain className="h-6 w-6 text-purple-600" />
              <div>
                <p className="font-semibold text-purple-800">AI Recommendation</p>
                <p className="text-sm text-purple-700">
                  Avoid forward bends. Focus on gentle back extensions. Start with 5 min, increase
                  to 20 min over 2 weeks. Best practiced in early morning (Brahma Muhurta) on empty
                  stomach. Stop immediately if sharp pain occurs.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Yoga/Asana Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Yoga Plan — Lower Back Pain (Gridhrasi/Sciatica)
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleSendToPatient}>
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Send to Patient
                  </Button>
                  <Button size="sm" variant="outline" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-1" />
                    Print Yoga Chart
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium">Asana/Exercise</th>
                      <th className="text-left p-3 font-medium">Duration</th>
                      <th className="text-left p-3 font-medium">Repetitions</th>
                      <th className="text-left p-3 font-medium">Precautions</th>
                      <th className="text-left p-3 font-medium">Video</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yogaPlan.map((row, index) => (
                      <tr
                        key={index}
                        className={`border-b hover:bg-muted/50 ${
                          row.contraindication ? "bg-red-50" : ""
                        }`}
                      >
                        <td className="p-3 font-medium">
                          <div className="flex items-center gap-2">
                            {row.asana}
                            {row.contraindication && (
                              <Badge variant="destructive">Contraindicated</Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-3">{row.duration}</td>
                        <td className="p-3">{row.repetitions}</td>
                        <td className={`p-3 ${row.contraindication ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
                          {row.contraindication && <AlertTriangle className="h-4 w-4 inline mr-1" />}
                          {row.precautions}
                        </td>
                        <td className="p-3">
                          {!row.contraindication && (
                            <Button size="sm" variant="link" className="p-0 h-auto">
                              <Eye className="h-4 w-4 mr-1" />
                              Watch
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Pranayama Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wind className="h-5 w-5 text-blue-600" />
                Pranayama (Breathing Exercises)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium">Pranayama</th>
                      <th className="text-left p-3 font-medium">Duration</th>
                      <th className="text-left p-3 font-medium">Rounds</th>
                      <th className="text-left p-3 font-medium">Benefits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pranayama.map((row, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-medium">{row.name}</td>
                        <td className="p-3">{row.duration}</td>
                        <td className="p-3">{row.rounds}</td>
                        <td className="p-3 text-muted-foreground">{row.benefits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Mudra Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hand className="h-5 w-5 text-orange-600" />
                Mudra Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mudras.map((mudra, index) => (
                  <Card key={index} className="border">
                    <CardContent className="p-4">
                      <h4 className="font-semibold">{mudra.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{mudra.technique}</p>
                      <Separator className="my-2" />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Duration: {mudra.duration}</span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">{mudra.benefits}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Meditation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Meditation & Relaxation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium">Yoga Nidra (Yogic Sleep)</h4>
                  <p className="text-sm text-muted-foreground">Duration: 20 minutes before sleep</p>
                  <p className="text-sm mt-1">Guided body-scan relaxation. Reduces muscle tension, promotes deep healing sleep. Especially beneficial for chronic pain management.</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium">Trataka (Candle Gazing)</h4>
                  <p className="text-sm text-muted-foreground">Duration: 5 minutes</p>
                  <p className="text-sm mt-1">Improves concentration, reduces stress-related pain amplification. Practice in a dark, quiet room.</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium">Om Chanting</h4>
                  <p className="text-sm text-muted-foreground">Duration: 5 minutes, 11 repetitions</p>
                  <p className="text-sm mt-1">Creates vibrational healing effect on spine. Calms the nervous system and reduces Vata aggravation.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contraindications Warning */}
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800">Contraindications & Precautions</p>
                  <ul className="text-sm text-red-700 mt-2 space-y-1 list-disc list-inside">
                    <li>Avoid all forward bending asanas (Paschimottanasana, Uttanasana, Halasana)</li>
                    <li>Do not practice during acute pain episodes or inflammation flare-ups</li>
                    <li>Avoid Kapalabhati and Bhastrika pranayama (increases intra-abdominal pressure)</li>
                    <li>No jumping or jerky movements. All transitions must be slow and controlled.</li>
                    <li>Stop immediately if pain radiates down the leg or numbness increases</li>
                    <li>Consult doctor before progressing to advanced variations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default DoctorYoga;
