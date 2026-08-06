import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Leaf, Brain, Sparkles, Save, Printer, Mail, MessageSquare,
  Upload, Plus, FileText, Activity, Heart, Eye,
  Pill, ClipboardList, AlertCircle,
} from "lucide-react";

const patientHeader = {
  name: "Mrs. Hameedhal Beevi22211",
  id: "AL-15598",
  age: "75 years",
  gender: "F",
  mobile: "9894668292",
};

// Quick navigation shortcuts for right sidebar
const quickNav = [
  { label: "T", title: "Treatment", color: "teal" },
  { label: "👤", title: "Case Sheet", color: "orange" },
  { label: "V", title: "Vitals", color: "green" },
  { label: "H", title: "History", color: "blue" },
  { label: "OP", title: "OP Summary", color: "purple" },
  { label: "R", title: "Rx", color: "red" },
  { label: "PT", title: "Past Treatment", color: "amber" },
];

const AyurvedaCaseSheet = () => {
  const [activeTab, setActiveTab] = useState("complaint");
  const [consultant, setConsultant] = useState("Dr. Mohamad Saleem MD (AYURVEDA)");
  const [visitDate, setVisitDate] = useState("21/07/2026");

  // Complaint Tab
  const [pradhanaVedana, setPradhanaVedana] = useState(
    "pain and swelling along with itching redness, scally skin present in rt leg since 6 month"
  );

  // History Tab
  const [vyadhiVruttanta, setVyadhiVruttanta] = useState(
    "pt was normal before 6 month sudden onset of scolling mild pain present in rt leg, gradually increased by itching\nHTN - taken, report not here"
  );
  const [purvaVyadhi, setPurvaVyadhi] = useState("h/o DM since 8 years\nHbA1C 5.8 (30/5/24)\nh/o varicose");
  const [familyHistory, setFamilyHistory] = useState("Nil relevant");
  const [drugHistory, setDrugHistory] = useState("Enalapril -metformin 2+0\nlycorea - 2+0\nendacara since for varicose");
  const [menstrualHistory, setMenstrualHistory] = useState("n/l");
  const [diet, setDiet] = useState("mixed");
  const [habits, setHabits] = useState("NIL");
  const [appetite, setAppetite] = useState("good");
  const [bowelHabit, setBowelHabit] = useState("constipated");
  const [bowel, setBowel] = useState("st");
  const [micturition, setMicturition] = useState("regular");
  const [sleep, setSleep] = useState("good");

  // Examination Tab - Ashtavidha Pareeksha
  const [nadi, setNadi] = useState("");
  const [mutra, setMutra] = useState("");
  const [mala, setMala] = useState("");
  const [jihva, setJihva] = useState("");
  const [shabda, setShabda] = useState("");
  const [sparsha, setSparsha] = useState("");
  const [drik, setDrik] = useState("");
  const [akriti, setAkriti] = useState("");
  const [examTemp, setExamTemp] = useState("");
  const [examBp, setExamBp] = useState("");
  const [examBmi, setExamBmi] = useState("");
  const [examWeight, setExamWeight] = useState("");
  const [examHeight, setExamHeight] = useState("");
  const [examPulse, setExamPulse] = useState("");
  const [examRr, setExamRr] = useState("");
  const [examSpo2, setExamSpo2] = useState("");
  const [overallPainScore, setOverallPainScore] = useState(0);

  // Examination - Physical & Systemic
  const [physicalExam, setPhysicalExam] = useState("");
  const [systemicExam, setSystemicExam] = useState("");

  // Examination - Rogi Pareeksha
  const [agniType, setAgniType] = useState("");
  const [koshthaType, setKoshthaType] = useState("");
  const [dominantDosha, setDominantDosha] = useState("");
  const [srotoDushti, setSrotoDushti] = useState("");
  const [khaVaigunya, setKhaVaigunya] = useState("");
  const [rogiBala, setRogiBala] = useState("");
  const [rogaBala, setRogaBala] = useState("");
  const [rogiRogaBala, setRogiRogaBala] = useState("");

  // Dashavidha Pareeksha
  const [prakruti, setPrakruti] = useState("");
  const [vikruti, setVikruti] = useState("");
  const [sara, setSara] = useState("");
  const [samhanana, setSamhanana] = useState("");
  const [pramana, setPramana] = useState("");
  const [satmya, setSatmya] = useState("");
  const [satva, setSatva] = useState("");
  const [aharaShakti, setAharaShakti] = useState("");
  const [vyayamaShakti, setVyayamaShakti] = useState("");
  const [vaya, setVaya] = useState("");

  // Investigation Tab
  const [vikrutiPareeksha, setVikrutiPareeksha] = useState("");
  const [additionalInvestigations, setAdditionalInvestigations] = useState<{investigation: string; notes: string}[]>([]);
  const [investigationNotes, setInvestigationNotes] = useState("");

  // Diagnosis Tab
  const [provisionalDiagnosis, setProvisionalDiagnosis] = useState("");
  const [differentialDiagnosis, setDifferentialDiagnosis] = useState("");
  const [finalDiagnosis, setFinalDiagnosis] = useState("");
  const [prognosis, setPrognosis] = useState("");
  const [complications, setComplications] = useState("");

  // Treatment Tab
  const [treatments, setTreatments] = useState<{treatment: string; qty: number; notes: string; status: string}[]>([]);
  const [treatmentNotes, setTreatmentNotes] = useState("");
  const [referralType, setReferralType] = useState("Internal");
  const [referTo, setReferTo] = useState("");
  const [department, setDepartment] = useState("");
  const [carePriority, setCarePriority] = useState("");
  const [referralReason, setReferralReason] = useState("");

  const handleSave = () => {
    toast.success("Case sheet saved successfully");
  };

  const handleAiSuggest = () => {
    toast.info("AI analyzing case data...");
    setTimeout(() => {
      if (activeTab === "diagnosis") {
        setProvisionalDiagnosis("Vicharchika (Eczema) with Siragranthi (Varicose veins)");
        setDifferentialDiagnosis("Kitibha Kushtha / Pama");
        setFinalDiagnosis("Vicharchika (Vata-Kapha predominant)");
        setPrognosis("Sadhya (Curable) with sustained treatment over 3-6 months");
        toast.success("AI diagnosis suggestions generated");
      } else if (activeTab === "treatment") {
        setTreatments([
          { treatment: "Vamana (if Kapha predominant)", qty: 1, notes: "After proper Snehana & Swedana", status: "Advised" },
          { treatment: "Virechana", qty: 1, notes: "Mild purgation for Pitta Shamana", status: "Advised" },
          { treatment: "Raktamokshana (Jalaukavacharana)", qty: 3, notes: "Local leech therapy on affected area", status: "Advised" },
          { treatment: "Takra Dhara", qty: 7, notes: "Medicated buttermilk external application", status: "Advised" },
        ]);
        toast.success("AI treatment plan generated");
      }
    }, 1000);
  };

  return (
    <div className="space-y-4">
      {/* Patient Header */}
      <Card className="border-t-4 border-t-teal-500">
        <CardContent className="p-4">
          <div className="text-center text-teal-600 font-semibold text-lg mb-2">Ayurvedic Template</div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
            <div><strong>Name:</strong> {patientHeader.name}</div>
            <div><strong>ID:</strong> {patientHeader.id}</div>
            <div><strong>Age:</strong> {patientHeader.age}</div>
            <div><strong>Gender:</strong> {patientHeader.gender}</div>
            <div><strong>Mobile:</strong> {patientHeader.mobile}</div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content with Quick Nav */}
      <div className="flex gap-4">
        {/* Case Sheet Tabs */}
        <div className="flex-1">
          <Card>
            <CardContent className="p-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full justify-start flex-wrap h-auto gap-1">
                  <TabsTrigger value="complaint" className="text-xs">Complaint</TabsTrigger>
                  <TabsTrigger value="history" className="text-xs">History</TabsTrigger>
                  <TabsTrigger value="examination" className="text-xs">Examination</TabsTrigger>
                  <TabsTrigger value="investigation" className="text-xs">Investigation</TabsTrigger>
                  <TabsTrigger value="docket" className="text-xs">Docket</TabsTrigger>
                  <TabsTrigger value="diagnosis" className="text-xs">Diagnosis</TabsTrigger>
                  <TabsTrigger value="treatment" className="text-xs">Treatment</TabsTrigger>
                  <TabsTrigger value="prescription" className="text-xs">Prescription</TabsTrigger>
                </TabsList>

                {/* ─── COMPLAINT TAB ─── */}
                <TabsContent value="complaint" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-semibold">Consultant <span className="text-red-500">*</span> :</Label>
                      <Select value={consultant} onValueChange={setConsultant}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dr. Mohamad Saleem MD (AYURVEDA)">Dr. Mohamad Saleem MD (AYURVEDA)</SelectItem>
                          <SelectItem value="Dr. sahana fathima B.A.M.S">Dr. sahana fathima B.A.M.S</SelectItem>
                          <SelectItem value="Dr. Vasumathi BAMS">Dr. Vasumathi BAMS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="font-semibold">Visit Date <span className="text-red-500">*</span> :</Label>
                      <Input value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label className="font-semibold">
                      Pradhana Vedana(Presenting Complaints with Duration) <span className="text-red-500">*</span> :
                    </Label>
                    <Textarea
                      value={pradhanaVedana}
                      onChange={(e) => setPradhanaVedana(e.target.value)}
                      rows={5}
                      className="mt-1"
                      placeholder="Enter presenting complaints with duration..."
                    />
                    <p className="text-xs text-orange-600 mt-1 hover:underline cursor-pointer">
                      Choose from the Chief Complaints list
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                      <Save className="h-3 w-3 mr-1" /> Save
                    </Button>
                    <Button variant="outline" className="text-blue-600">Save & Bill</Button>
                    <Button variant="outline" className="text-red-600" onClick={() => toast.info("Dashboard")}>Dashboard</Button>
                  </div>
                </TabsContent>

                {/* ─── HISTORY TAB ─── */}
                <TabsContent value="history" className="space-y-6 mt-4">
                  <div>
                    <Label className="font-semibold">Vyadhi Vruttanta(History) :</Label>
                    <Textarea value={vyadhiVruttanta} onChange={(e) => setVyadhiVruttanta(e.target.value)} rows={4} />
                    <p className="text-xs text-orange-600 mt-1 cursor-pointer hover:underline">Choose from the History list</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Poorva Vyadhi Vruttanta(History of Prior illness) :</Label>
                    <Textarea value={purvaVyadhi} onChange={(e) => setPurvaVyadhi(e.target.value)} rows={3} />
                    <p className="text-xs text-orange-600 mt-1 cursor-pointer hover:underline">Choose from the History list</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Family History</h3>
                    <Label className="text-sm">Kula Vruttanta(Family History) :</Label>
                    <Textarea value={familyHistory} onChange={(e) => setFamilyHistory(e.target.value)} rows={2} />
                    <p className="text-xs text-orange-600 mt-1 cursor-pointer hover:underline">Choose from the History list</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Drug History</h3>
                    <Label className="text-sm">Chikitsa Vruttanta(Drug History) :</Label>
                    <Textarea value={drugHistory} onChange={(e) => setDrugHistory(e.target.value)} rows={3} />
                    <p className="text-xs text-orange-600 mt-1 cursor-pointer hover:underline">Choose from the History list</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Menstrual History</h3>
                    <Label className="text-sm">Arthava Vruttanta(Menstrual History) :</Label>
                    <Textarea value={menstrualHistory} onChange={(e) => setMenstrualHistory(e.target.value)} rows={2} />
                    <p className="text-xs text-orange-600 mt-1 cursor-pointer hover:underline">Choose from the History list</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Personal History</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div><Label className="text-xs">Diet :</Label><Input value={diet} onChange={(e) => setDiet(e.target.value)} className="h-8" /></div>
                      <div><Label className="text-xs">Habits/Addiction :</Label><Input value={habits} onChange={(e) => setHabits(e.target.value)} className="h-8" /></div>
                      <div><Label className="text-xs">Appetite :</Label><Input value={appetite} onChange={(e) => setAppetite(e.target.value)} className="h-8" /></div>
                      <div><Label className="text-xs">Hypersensitivity :</Label><Input className="h-8" /></div>
                      <div><Label className="text-xs">Bowel :</Label><Input value={bowel} onChange={(e) => setBowel(e.target.value)} className="h-8" /></div>
                      <div><Label className="text-xs">Micturition :</Label><Input value={micturition} onChange={(e) => setMicturition(e.target.value)} className="h-8" /></div>
                      <div><Label className="text-xs">Sleep :</Label><Input value={sleep} onChange={(e) => setSleep(e.target.value)} className="h-8" /></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700"><Save className="h-3 w-3 mr-1" /> Save</Button>
                    <Button variant="outline" className="text-blue-600">Save & Bill</Button>
                    <Button variant="outline" className="text-red-600">Print</Button>
                    <Button variant="outline">Email</Button>
                    <Button variant="outline" className="text-green-600">Whatsapp</Button>
                  </div>
                </TabsContent>

                {/* ─── EXAMINATION TAB ─── */}
                <TabsContent value="examination" className="space-y-6 mt-4">
                  {/* Ashtavidha Pareeksha */}
                  <div>
                    <h3 className="font-semibold text-teal-700">Samanye Pareeksha(General Examination)</h3>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-2">
                      <div><Label className="text-xs">Height(cm)</Label><Input value={examHeight} onChange={(e) => setExamHeight(e.target.value)} className="h-8" /></div>
                      <div><Label className="text-xs">Weight(kg)</Label><Input value={examWeight} onChange={(e) => setExamWeight(e.target.value)} className="h-8" /></div>
                      <div><Label className="text-xs">BMI</Label><Input value={examBmi} onChange={(e) => setExamBmi(e.target.value)} className="h-8" /></div>
                      <div><Label className="text-xs">Temperature (°F)</Label><Input value={examTemp} onChange={(e) => setExamTemp(e.target.value)} className="h-8" /></div>
                      <div><Label className="text-xs">Blood Pressure</Label><Input value={examBp} onChange={(e) => setExamBp(e.target.value)} className="h-8" /></div>
                      <div><Label className="text-xs">Pulse Rate</Label><Input value={examPulse} onChange={(e) => setExamPulse(e.target.value)} className="h-8" /></div>
                      <div><Label className="text-xs">Resp. Rate</Label><Input value={examRr} onChange={(e) => setExamRr(e.target.value)} className="h-8" /></div>
                      <div><Label className="text-xs">SpO2</Label><Input value={examSpo2} onChange={(e) => setExamSpo2(e.target.value)} className="h-8" /></div>
                    </div>
                  </div>

                  {/* Pain Score */}
                  <div>
                    <Label className="font-semibold text-sm">Overall Pain Score:</Label>
                    <div className="flex gap-1 mt-1">
                      {Array.from({ length: 11 }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => setOverallPainScore(i)}
                          className={`w-8 h-8 rounded text-xs font-bold border ${
                            i <= 3 ? "bg-green-100 border-green-300" :
                            i <= 6 ? "bg-yellow-100 border-yellow-300" :
                            "bg-red-100 border-red-300"
                          } ${overallPainScore === i ? "ring-2 ring-offset-1 ring-blue-500" : ""}`}
                        >
                          {i}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ashtavidha Pareeksha */}
                  <Separator />
                  <h3 className="font-semibold text-teal-700">Ashtavidha Pareeksha (8-fold Examination)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div><Label className="text-xs">Nadi (Pulse)</Label><Input value={nadi} onChange={(e) => setNadi(e.target.value)} className="h-8" /></div>
                    <div><Label className="text-xs">Mutra (Urine)</Label><Input value={mutra} onChange={(e) => setMutra(e.target.value)} className="h-8" /></div>
                    <div><Label className="text-xs">Mala (Stool)</Label><Input value={mala} onChange={(e) => setMala(e.target.value)} className="h-8" /></div>
                    <div><Label className="text-xs">Jihva (Tongue)</Label><Input value={jihva} onChange={(e) => setJihva(e.target.value)} className="h-8" /></div>
                    <div><Label className="text-xs">Shabda (Voice)</Label><Input value={shabda} onChange={(e) => setShabda(e.target.value)} className="h-8" /></div>
                    <div><Label className="text-xs">Sparsha (Touch/Skin)</Label><Input value={sparsha} onChange={(e) => setSparsha(e.target.value)} className="h-8" /></div>
                    <div><Label className="text-xs">Drik (Eyes)</Label><Input value={drik} onChange={(e) => setDrik(e.target.value)} className="h-8" /></div>
                    <div><Label className="text-xs">Akriti (Build)</Label><Input value={akriti} onChange={(e) => setAkriti(e.target.value)} className="h-8" /></div>
                  </div>

                  {/* Physical Examination */}
                  <Separator />
                  <div>
                    <Label className="font-semibold">Prashusika pareeksha(Physical Examination) :</Label>
                    <Textarea value={physicalExam} onChange={(e) => setPhysicalExam(e.target.value)} rows={3} className="mt-1" />
                    <p className="text-xs text-orange-600 mt-1 cursor-pointer hover:underline">Choose from the Examination list</p>
                  </div>

                  {/* Systemic Examination */}
                  <div>
                    <Label className="font-semibold">Systemic Examination :</Label>
                    <Textarea value={systemicExam} onChange={(e) => setSystemicExam(e.target.value)} rows={3} className="mt-1" />
                  </div>

                  {/* Rogi Pareeksha */}
                  <Separator />
                  <h3 className="font-semibold text-teal-700">Rogi Pareeksha (Patient Assessment)</h3>
                  <div>
                    <h4 className="text-sm font-medium mt-2">Agni Pareeksha</h4>
                    <Select value={agniType} onValueChange={setAgniType}>
                      <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select Agni Type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Vishama">Vishama (Irregular)</SelectItem>
                        <SelectItem value="Tikshna">Tikshna (Sharp/Intense)</SelectItem>
                        <SelectItem value="Manda">Manda (Sluggish)</SelectItem>
                        <SelectItem value="Sama">Sama (Balanced)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-sm font-medium">Koshtha Pareeksha</h4>
                      <Select value={koshthaType} onValueChange={setKoshthaType}>
                        <SelectTrigger><SelectValue placeholder="Koshtha Type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Krura">Krura (Hard)</SelectItem>
                          <SelectItem value="Mridu">Mridu (Soft)</SelectItem>
                          <SelectItem value="Madhyama">Madhyama (Medium)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Dosha Pareeksha</h4>
                      <Select value={dominantDosha} onValueChange={setDominantDosha}>
                        <SelectTrigger><SelectValue placeholder="Dominant Dosha" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Vata">Vata</SelectItem>
                          <SelectItem value="Pitta">Pitta</SelectItem>
                          <SelectItem value="Kapha">Kapha</SelectItem>
                          <SelectItem value="Vata-Pitta">Vata-Pitta</SelectItem>
                          <SelectItem value="Vata-Kapha">Vata-Kapha</SelectItem>
                          <SelectItem value="Pitta-Kapha">Pitta-Kapha</SelectItem>
                          <SelectItem value="Tridosha">Tridosha</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Rogi Bala</h4>
                      <Select value={rogiBala} onValueChange={setRogiBala}>
                        <SelectTrigger><SelectValue placeholder="Bala" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pravara">Pravara (Strong)</SelectItem>
                          <SelectItem value="Madhyama">Madhyama (Medium)</SelectItem>
                          <SelectItem value="Avara">Avara (Weak)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">Sroto Dushti</Label>
                      <Input value={srotoDushti} onChange={(e) => setSrotoDushti(e.target.value)} className="h-8" />
                    </div>
                    <div>
                      <Label className="text-xs">Kha Vaigunya</Label>
                      <Input value={khaVaigunya} onChange={(e) => setKhaVaigunya(e.target.value)} className="h-8" />
                    </div>
                  </div>

                  {/* Dashavidha Pareeksha */}
                  <Separator />
                  <h3 className="font-semibold text-teal-700">Dashavidha Pareeksha (10-fold Examination)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div><Label className="text-xs">Prakruti</Label><Input value={prakruti} onChange={(e) => setPrakruti(e.target.value)} className="h-8" /></div>
                    <div><Label className="text-xs">Vikruti</Label><Input value={vikruti} onChange={(e) => setVikruti(e.target.value)} className="h-8" /></div>
                    <div><Label className="text-xs">Sara</Label><Input value={sara} onChange={(e) => setSara(e.target.value)} className="h-8" /></div>
                    <div><Label className="text-xs">Samhanana</Label><Input value={samhanana} onChange={(e) => setSamhanana(e.target.value)} className="h-8" /></div>
                    <div><Label className="text-xs">Pramana</Label><Input value={pramana} onChange={(e) => setPramana(e.target.value)} className="h-8" /></div>
                    <div><Label className="text-xs">Satmya</Label><Input value={satmya} onChange={(e) => setSatmya(e.target.value)} className="h-8" /></div>
                    <div><Label className="text-xs">Satva</Label><Input value={satva} onChange={(e) => setSatva(e.target.value)} className="h-8" /></div>
                    <div><Label className="text-xs">Ahara Shakti</Label><Input value={aharaShakti} onChange={(e) => setAharaShakti(e.target.value)} className="h-8" /></div>
                    <div><Label className="text-xs">Vyayama Shakti</Label><Input value={vyayamaShakti} onChange={(e) => setVyayamaShakti(e.target.value)} className="h-8" /></div>
                    <div><Label className="text-xs">Vaya (Age)</Label><Input value={vaya} onChange={(e) => setVaya(e.target.value)} className="h-8" /></div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700"><Save className="h-3 w-3 mr-1" /> Save</Button>
                    <Button variant="outline" className="text-blue-600">Save & Bill</Button>
                    <Button variant="outline" className="text-red-600">Print</Button>
                    <Button variant="outline">Email</Button>
                    <Button variant="outline" className="text-green-600">Whatsapp</Button>
                    <Button variant="outline" className="text-red-600" onClick={() => toast.info("Dashboard")}>Dashboard</Button>
                  </div>
                </TabsContent>

                {/* ─── INVESTIGATION TAB ─── */}
                <TabsContent value="investigation" className="space-y-4 mt-4">
                  <h3 className="font-semibold">Vikruthi Pareeksha(Investigations)</h3>
                  <div>
                    <Label className="font-semibold text-sm">Vikruthi Pareeksha :</Label>
                    <Textarea value={vikrutiPareeksha} onChange={(e) => setVikrutiPareeksha(e.target.value)} rows={4} />
                  </div>
                  <Separator />
                  <h3 className="font-semibold">Additional Investigations</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Add Investigation" className="h-8" />
                    <Input placeholder="Add notes" className="h-8" />
                  </div>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-3 w-3 mr-1" /> Add
                  </Button>
                  <div className="border rounded p-3">
                    <h4 className="text-sm font-medium mb-2">Selected Investigation (Tick the checkbox to include in the report)</h4>
                    <table className="w-full text-xs">
                      <thead><tr><th className="text-left p-1">☐</th><th className="text-left p-1">Investigation</th><th className="text-left p-1">Notes</th></tr></thead>
                      <tbody>
                        {additionalInvestigations.length === 0 && (
                          <tr><td colSpan={3} className="p-2 text-muted-foreground">No investigations added</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <Button size="sm" variant="outline"><Save className="h-3 w-3 mr-1" /> Save as Favorite</Button>
                  <Separator />
                  <h3 className="font-semibold">Favorite Investigations</h3>
                  <div className="flex gap-2 items-center">
                    <span className="text-sm font-medium">Favorites</span>
                    <Input placeholder="Search By Name" className="w-48 h-8" />
                  </div>
                  <Separator />
                  <div>
                    <Label className="font-semibold text-sm">Notes:</Label>
                    <Textarea value={investigationNotes} onChange={(e) => setInvestigationNotes(e.target.value)} rows={4} />
                    <p className="text-xs text-orange-600 mt-1 cursor-pointer hover:underline">Choose from the Notes list</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700"><Save className="h-3 w-3 mr-1" /> Save</Button>
                    <Button variant="outline" className="text-blue-600">Save & Bill</Button>
                    <Button variant="outline" className="text-red-600">Print</Button>
                    <Button variant="outline">Email</Button>
                    <Button variant="outline" className="text-green-600">Whatsapp</Button>
                    <Button variant="outline" className="text-red-600">Dashboard</Button>
                  </div>
                </TabsContent>

                {/* ─── DOCKET TAB ─── */}
                <TabsContent value="docket" className="space-y-4 mt-4">
                  <div className="border rounded p-4">
                    <div className="flex gap-1 mb-2"><Badge>Docs</Badge></div>
                    <div className="bg-sky-50 border border-sky-200 rounded p-4">
                      <h3 className="text-orange-600 font-medium">Upload Docs here.</h3>
                      <ul className="text-xs mt-2 space-y-1 text-muted-foreground">
                        <li>• Please make sure, files are not too big in size, we support size upto 400KB</li>
                        <li>• Please use Google Chrome or Firefox to optimize the image in the client side</li>
                        <li>• Max 5 files only upload at a time</li>
                      </ul>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700"><Plus className="h-3 w-3 mr-1" /> Add Doc</Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">📷 Take photo</Button>
                      <Button size="sm" variant="outline" className="text-red-600">⊘ Cancel upload</Button>
                      <Button size="sm" className="bg-amber-600 hover:bg-amber-700"><Upload className="h-3 w-3 mr-1" /> Upload All</Button>
                      <Button size="sm" variant="outline">👁️ View All</Button>
                    </div>
                    <h4 className="text-sm font-medium mt-4">Available Docs</h4>
                    <p className="text-xs text-muted-foreground">No documents uploaded yet.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700"><Save className="h-3 w-3 mr-1" /> Save</Button>
                    <Button variant="outline" className="text-blue-600">Save & Bill</Button>
                    <Button variant="outline" className="text-red-600">Print</Button>
                    <Button variant="outline">Email</Button>
                    <Button variant="outline" className="text-green-600">Whatsapp</Button>
                    <Button variant="outline" className="text-red-600">Dashboard</Button>
                  </div>
                </TabsContent>

                {/* ─── DIAGNOSIS TAB ─── */}
                <TabsContent value="diagnosis" className="space-y-4 mt-4">
                  <div className="flex justify-end">
                    <Button size="sm" variant="outline" onClick={handleAiSuggest} className="text-violet-600 border-violet-300">
                      <Brain className="h-3 w-3 mr-1" /> AI Suggest Diagnosis
                    </Button>
                  </div>
                  <div>
                    <Label className="font-semibold">Sapekshita Roganimayam(Provisional Diagnosis) :</Label>
                    <Textarea value={provisionalDiagnosis} onChange={(e) => setProvisionalDiagnosis(e.target.value)} rows={3} />
                    <p className="text-xs text-orange-600 mt-1 cursor-pointer hover:underline">Choose from the Diagnosis list</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Vyavachetaka Roganimayam(Differential Diagnosis) :</Label>
                    <Textarea value={differentialDiagnosis} onChange={(e) => setDifferentialDiagnosis(e.target.value)} rows={3} />
                    <p className="text-xs text-orange-600 mt-1 cursor-pointer hover:underline">Choose from the Diagnosis list</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Roganimayam(Diagnosis) :</Label>
                    <Textarea value={finalDiagnosis} onChange={(e) => setFinalDiagnosis(e.target.value)} rows={3} />
                    <p className="text-xs text-orange-600 mt-1 cursor-pointer hover:underline">Choose from the Diagnosis list</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Sadhyasadhyata(Prognosis) :</Label>
                    <Textarea value={prognosis} onChange={(e) => setPrognosis(e.target.value)} rows={3} />
                    <p className="text-xs text-orange-600 mt-1 cursor-pointer hover:underline">Choose from the Diagnosis list</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Upadrava(Complications) :</Label>
                    <Textarea value={complications} onChange={(e) => setComplications(e.target.value)} rows={3} />
                    <p className="text-xs text-orange-600 mt-1 cursor-pointer hover:underline">Choose from the Diagnosis list</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700"><Save className="h-3 w-3 mr-1" /> Save</Button>
                    <Button variant="outline" className="text-blue-600">Save & Bill</Button>
                    <Button variant="outline" className="text-red-600">Print</Button>
                    <Button variant="outline">Email</Button>
                    <Button variant="outline" className="text-green-600">Whatsapp</Button>
                    <Button variant="outline" className="text-red-600">Dashboard</Button>
                  </div>
                </TabsContent>

                {/* ─── TREATMENT TAB ─── */}
                <TabsContent value="treatment" className="space-y-4 mt-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Kriya Kraman (Procedures)</h3>
                    <Button size="sm" variant="outline" onClick={handleAiSuggest} className="text-violet-600 border-violet-300">
                      <Brain className="h-3 w-3 mr-1" /> AI Suggest Treatment
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Select Treatments :</Label>
                      <Input placeholder="Type Treatment" className="h-8" />
                      <Input placeholder="Quantity" className="h-8 w-24 mt-1" />
                      <Input placeholder="Add notes" className="h-8 mt-1" />
                      <Input type="date" placeholder="Expected Completion Date" className="h-8 mt-1 w-48" />
                      <Button size="sm" className="mt-1 bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-3 w-3 mr-1" /> Add
                      </Button>
                    </div>
                    {treatments.length > 0 && (
                      <div className="border rounded p-3">
                        <table className="w-full text-xs">
                          <thead><tr><th className="text-left p-1">Treatment</th><th className="p-1">Qty</th><th className="text-left p-1">Notes</th><th className="p-1">Status</th></tr></thead>
                          <tbody>
                            {treatments.map((t, i) => (
                              <tr key={i} className="border-t">
                                <td className="p-1">{t.treatment}</td>
                                <td className="p-1 text-center">{t.qty}</td>
                                <td className="p-1">{t.notes}</td>
                                <td className="p-1"><Badge variant="outline" className="text-xs">{t.status}</Badge></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Billed Section */}
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium">Advised :</h4>
                    <p className="text-xs text-muted-foreground">1. DR.MOHAMEED SALEEM</p>
                    <div className="flex gap-2 mt-1">
                      <Badge className="bg-blue-600 text-white text-xs">Estimate</Badge>
                      <Badge className="bg-orange-500 text-white text-xs">Print Estimate</Badge>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Billed</h4>
                    <p className="text-xs">1. DR.MOHAMEED SALEEM ✓</p>
                    <Badge className="bg-green-600 text-white text-xs mt-1">
                      Completed on 21/07/2026 By Dr. Mohamad Saleem MD (AYURVEDA)
                    </Badge>
                  </div>

                  {/* Notes */}
                  <div>
                    <Label className="font-semibold text-sm">Notes :</Label>
                    <Textarea value={treatmentNotes} onChange={(e) => setTreatmentNotes(e.target.value)} rows={3} />
                    <p className="text-xs text-orange-600 mt-1 cursor-pointer hover:underline">Choose from the Notes list</p>
                  </div>

                  {/* Referral */}
                  <Separator />
                  <h3 className="font-semibold">Referral</h3>
                  <div className="flex gap-4 mb-2">
                    <label className="flex items-center gap-1 text-sm">
                      <input type="radio" name="refType" checked={referralType === "Internal"} onChange={() => setReferralType("Internal")} /> Internal
                    </label>
                    <label className="flex items-center gap-1 text-sm">
                      <input type="radio" name="refType" checked={referralType === "External"} onChange={() => setReferralType("External")} /> External
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><Label className="text-xs">Refer To :</Label><Select><SelectTrigger className="h-8"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="dr1">Dr. Specialist</SelectItem></SelectContent></Select></div>
                    <div><Label className="text-xs">Ref No :</Label><Input className="h-8" /></div>
                    <div><Label className="text-xs">Department :</Label><Input value={department} onChange={(e) => setDepartment(e.target.value)} className="h-8" /></div>
                    <div><Label className="text-xs">Care Priority :</Label><Select value={carePriority} onValueChange={setCarePriority}><SelectTrigger className="h-8"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="Routine">Routine</SelectItem><SelectItem value="Urgent">Urgent</SelectItem><SelectItem value="Emergency">Emergency</SelectItem></SelectContent></Select></div>
                  </div>
                  <div><Label className="text-xs">Referral Reason :</Label><Textarea value={referralReason} onChange={(e) => setReferralReason(e.target.value)} rows={2} /></div>
                  <div><Label className="text-xs">Notes :</Label><Textarea rows={2} /></div>

                  <div className="flex gap-2">
                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700"><Save className="h-3 w-3 mr-1" /> Save</Button>
                    <Button variant="outline" className="text-blue-600">Save & Bill</Button>
                    <Button variant="outline" className="text-red-600">Print</Button>
                    <Button variant="outline">Email</Button>
                    <Button variant="outline" className="text-green-600">Whatsapp</Button>
                    <Button variant="outline" className="text-red-600">Dashboard</Button>
                  </div>
                </TabsContent>

                {/* ─── PRESCRIPTION TAB ─── */}
                <TabsContent value="prescription" className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                      Add Medicines <Badge className="bg-green-600 text-white text-xs">Vital Charts</Badge>
                    </h3>
                    <Button size="sm" variant="outline" className="text-violet-600 border-violet-300">
                      <Brain className="h-3 w-3 mr-1" /> AI Suggest Medicines
                    </Button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" className="text-xs">Open Past Pharmacy Bills</Button>
                    <Button size="sm" className="bg-blue-600 text-xs">Packages</Button>
                    <Button size="sm" className="bg-teal-600 text-xs">Diagnosis Specific Medicines</Button>
                    <Button size="sm" className="bg-amber-600 text-xs">Show / Hide Favorites</Button>
                    <Button size="sm" variant="outline" className="text-xs ml-auto">Show / Hide Past Prescription</Button>
                  </div>
                  <div className="border rounded p-3 text-xs text-muted-foreground">
                    <p>Medicine input section — Add from stock, search by name, set dosage (Morn/Noon/Eve/Night), Before/After/With Food, Duration, Laterality</p>
                    <p className="mt-2 text-orange-600">☑ Show medicines only from stock</p>
                    <p className="mt-1"><strong>Store:</strong> Select a Store</p>
                  </div>

                  {/* Advice Section */}
                  <Separator />
                  <h3 className="font-semibold">Advice</h3>
                  <Textarea rows={3} placeholder="Enter advice for the patient..." />
                  <p className="text-xs text-orange-600 cursor-pointer hover:underline">Choose from the Advice list | Choose from the CLSS Advice list</p>

                  {/* Docket */}
                  <Separator />
                  <h3 className="font-semibold">Docket</h3>
                  <div className="bg-sky-50 border border-sky-200 rounded p-3">
                    <p className="text-orange-600 text-sm font-medium">Upload Photos here.</p>
                    <ul className="text-xs space-y-1 text-muted-foreground mt-1">
                      <li>• Max file size: 400KB</li>
                      <li>• Max 5 files per upload</li>
                    </ul>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" className="bg-green-600 h-6 text-xs"><Plus className="h-3 w-3 mr-1" /> Add Photo</Button>
                      <Button size="sm" className="bg-blue-600 h-6 text-xs">📷 Take a Photo</Button>
                      <Button size="sm" variant="outline" className="h-6 text-xs text-red-600">⊘ Cancel upload</Button>
                      <Button size="sm" className="bg-amber-600 h-6 text-xs"><Upload className="h-3 w-3 mr-1" /> Upload All</Button>
                    </div>
                  </div>

                  {/* Review */}
                  <Separator />
                  <h3 className="font-semibold">Review</h3>
                  <div className="flex gap-2 items-center">
                    <span className="text-sm">Review To</span>
                    <Input placeholder="Days" className="w-20 h-8" />
                    <Button size="sm" className="bg-blue-600"><Plus className="h-3 w-3 mr-1" /> Add</Button>
                    <Button size="sm" variant="outline">📅 Book Appointment</Button>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700"><Save className="h-3 w-3 mr-1" /> Save</Button>
                    <Button variant="outline" className="text-blue-600">Save & Bill</Button>
                    <Button variant="outline" className="text-red-600">Print</Button>
                    <Button variant="outline">Email</Button>
                    <Button variant="outline" className="text-green-600">Whatsapp</Button>
                    <Button variant="outline" className="text-red-600">Dashboard</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Quick Navigation */}
        <div className="w-10 flex flex-col gap-2">
          {quickNav.map((nav) => (
            <button
              key={nav.label}
              title={nav.title}
              className="w-8 h-8 rounded-full border text-xs font-bold flex items-center justify-center hover:bg-muted transition"
              onClick={() => toast.info(`Navigate to ${nav.title}`)}
            >
              {nav.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AyurvedaCaseSheet;
