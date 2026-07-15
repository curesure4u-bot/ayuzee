import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Droplets, Save } from "lucide-react";

const HmsSiddha = () => {
  const [patientName, setPatientName] = useState("");
  // Envagai Thervu (Eight-fold examination in Siddha)
  const [naadi, setNaadi] = useState("");
  const [sparisam, setSparisam] = useState("");
  const [naa, setNaa] = useState("");
  const [niram, setNiram] = useState("");
  const [mozhi, setMozhi] = useState("");
  const [vizhi, setVizhi] = useState("");
  const [malam, setMalam] = useState("");
  const [moothiram, setMoothiram] = useState("");

  // Neikuri
  const [neikuriPattern, setNeikuriPattern] = useState("");
  const [neikuriInference, setNeikuriInference] = useState("");
  // Manikadai Nool
  const [manikadaiReading, setManikadaiReading] = useState("");
  // Pulse
  const [pulseVali, setPulseVali] = useState("");
  const [pulseAzhal, setPulseAzhal] = useState("");
  const [pulseIyam, setPulseIyam] = useState("");

  const handleSave = () => {
    if (!patientName.trim()) return toast.error("Select a patient first");
    toast.success("Siddha assessment saved successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Droplets className="h-6 w-6 text-teal-600" /> Siddha Clinical Module
          </h1>
          <p className="text-sm text-muted-foreground">
            Envagai Thervu, Neikuri, Manikadai Nool & Siddha Diagnosis
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
              <Input value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Search patient" />
            </div>
            <div><Label>UHID</Label><Input placeholder="Auto-generated" disabled /></div>
            <div><Label>Date</Label><Input type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="envagai">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
          <TabsTrigger value="envagai">Envagai Thervu</TabsTrigger>
          <TabsTrigger value="neikuri">Neikuri</TabsTrigger>
          <TabsTrigger value="manikadai">Manikadai Nool</TabsTrigger>
          <TabsTrigger value="diagnosis">Diagnosis & Rx</TabsTrigger>
        </TabsList>

        <TabsContent value="envagai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Envagai Thervu (Eight-fold Examination)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>1. Naadi (Pulse)</Label>
                  <Select value={naadi} onValueChange={setNaadi}>
                    <SelectTrigger><SelectValue placeholder="Select Naadi" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vali">Vali (Vatham)</SelectItem>
                      <SelectItem value="azhal">Azhal (Pitham)</SelectItem>
                      <SelectItem value="iyam">Iyam (Kapham)</SelectItem>
                      <SelectItem value="vali_azhal">Vali Azhal</SelectItem>
                      <SelectItem value="azhal_iyam">Azhal Iyam</SelectItem>
                      <SelectItem value="iya_vali">Iya Vali</SelectItem>
                      <SelectItem value="thontha">Thontha Naadi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>2. Sparisam (Touch)</Label>
                  <Select value={sparisam} onValueChange={setSparisam}>
                    <SelectTrigger><SelectValue placeholder="Select Sparisam" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mithaveppam">Mitha Veppam (Mild warmth)</SelectItem>
                      <SelectItem value="miguveppam">Migu Veppam (High heat)</SelectItem>
                      <SelectItem value="thatpam">Thatpam (Cold)</SelectItem>
                      <SelectItem value="viyarvai">Viyarvai (Sweating)</SelectItem>
                      <SelectItem value="varatchi">Varatchi (Dryness)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>3. Naa (Tongue)</Label>
                  <Select value={naa} onValueChange={setNaa}>
                    <SelectTrigger><SelectValue placeholder="Select Naa" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maa_padinthiruthal">Maa Padinthiruthal (Coated)</SelectItem>
                      <SelectItem value="velluppu">Velluppu (Pallor)</SelectItem>
                      <SelectItem value="sivappu">Sivappu (Redness)</SelectItem>
                      <SelectItem value="kari">Kari (Dark)</SelectItem>
                      <SelectItem value="punn">Punn (Ulcer)</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>4. Niram (Complexion)</Label>
                  <Select value={niram} onValueChange={setNiram}>
                    <SelectTrigger><SelectValue placeholder="Select Niram" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="karuppu">Karuppu (Dark)</SelectItem>
                      <SelectItem value="manjal">Manjal (Yellow)</SelectItem>
                      <SelectItem value="velluppu">Velluppu (Pale)</SelectItem>
                      <SelectItem value="sivappu">Sivappu (Red)</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>5. Mozhi (Speech)</Label>
                  <Select value={mozhi} onValueChange={setMozhi}>
                    <SelectTrigger><SelectValue placeholder="Select Mozhi" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sama_oli">Sama Oli (Normal)</SelectItem>
                      <SelectItem value="urattha_oli">Urattha Oli (Loud)</SelectItem>
                      <SelectItem value="thazhna_oli">Thazhna Oli (Low)</SelectItem>
                      <SelectItem value="kuralin_oasai">Kurali (Hoarse)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>6. Vizhi (Eyes)</Label>
                  <Select value={vizhi} onValueChange={setVizhi}>
                    <SelectTrigger><SelectValue placeholder="Select Vizhi" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sivappu">Sivappu (Red)</SelectItem>
                      <SelectItem value="manjal">Manjal (Yellow)</SelectItem>
                      <SelectItem value="velluppu">Velluppu (Pale)</SelectItem>
                      <SelectItem value="kari">Kari (Dark circles)</SelectItem>
                      <SelectItem value="erichal">Erichal (Burning)</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>7. Malam (Stool)</Label>
                  <Select value={malam} onValueChange={setMalam}>
                    <SelectTrigger><SelectValue placeholder="Select Malam" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ilagal">Ilagal (Loose)</SelectItem>
                      <SelectItem value="irugal">Irugal (Hard/Constipated)</SelectItem>
                      <SelectItem value="kari">Kari (Dark)</SelectItem>
                      <SelectItem value="manjal">Manjal (Yellow)</SelectItem>
                      <SelectItem value="seetham">Seetham (Mucus)</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>8. Moothiram (Urine)</Label>
                  <Select value={moothiram} onValueChange={setMoothiram}>
                    <SelectTrigger><SelectValue placeholder="Select Moothiram" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="niram_manjal">Manjal (Yellow)</SelectItem>
                      <SelectItem value="niram_vellai">Vellai (Pale)</SelectItem>
                      <SelectItem value="niram_sivappu">Sivappu (Red)</SelectItem>
                      <SelectItem value="nurai">Nurai (Frothy)</SelectItem>
                      <SelectItem value="erichal">Erichal (Burning)</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="neikuri" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Neikuri (Oil-on-Urine Examination)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Drop sesame oil on collected urine sample and observe the spreading pattern.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Oil Spreading Pattern</Label>
                  <Select value={neikuriPattern} onValueChange={setNeikuriPattern}>
                    <SelectTrigger><SelectValue placeholder="Select pattern" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="snake">Snake-like (Aravu pol) - Vatham</SelectItem>
                      <SelectItem value="ring">Ring-like (Aazhi pol) - Pitham</SelectItem>
                      <SelectItem value="pearl">Pearl-like (Muthu pol) - Kapham</SelectItem>
                      <SelectItem value="snake_ring">Snake + Ring - Vali Azhal</SelectItem>
                      <SelectItem value="ring_pearl">Ring + Pearl - Azhal Iyam</SelectItem>
                      <SelectItem value="snake_pearl">Snake + Pearl - Iya Vali</SelectItem>
                      <SelectItem value="rapid_spread">Rapid spreading - Good prognosis</SelectItem>
                      <SelectItem value="sinks">Oil sinks - Poor prognosis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Inference</Label>
                  <Select value={neikuriInference} onValueChange={setNeikuriInference}>
                    <SelectTrigger><SelectValue placeholder="Select inference" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="curable">Easily Curable (Saathiyam)</SelectItem>
                      <SelectItem value="difficult">Difficult to Cure (Kastasaathiyam)</SelectItem>
                      <SelectItem value="incurable">Incurable (Asaathiyam)</SelectItem>
                      <SelectItem value="good_prog">Good Prognosis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Neikuri Observations</Label>
                <Textarea placeholder="Describe oil color, speed of spread, direction, shape formed..." rows={3} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manikadai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Manikadai Nool (Wrist Circumference Measurement)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Measure using a thread around the wrist and compare the body length ratio.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Wrist Circumference (Virarkadai)</Label>
                  <Input
                    value={manikadaiReading}
                    onChange={(e) => setManikadaiReading(e.target.value)}
                    placeholder="e.g., 10 3/4 virarkadai"
                  />
                </div>
                <div>
                  <Label>Interpretation</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select reading" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 - Thridosha disorder</SelectItem>
                      <SelectItem value="9.75">9 3/4 - Pittham disorder</SelectItem>
                      <SelectItem value="9.5">9 1/2 - Kapham disorder</SelectItem>
                      <SelectItem value="9.25">9 1/4 - Vatham disorder</SelectItem>
                      <SelectItem value="other">Other measurement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Naadi Assessment (Pulse Ratio)</Label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Vali (Vatham)</Label>
                    <Input value={pulseVali} onChange={(e) => setPulseVali(e.target.value)} placeholder="1" />
                  </div>
                  <div>
                    <Label className="text-xs">Azhal (Pitham)</Label>
                    <Input value={pulseAzhal} onChange={(e) => setPulseAzhal(e.target.value)} placeholder="1/2" />
                  </div>
                  <div>
                    <Label className="text-xs">Iyam (Kapham)</Label>
                    <Input value={pulseIyam} onChange={(e) => setPulseIyam(e.target.value)} placeholder="1/4" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnosis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Siddha Diagnosis & Treatment Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Mukkutra Verupaadu (Humoral Pathology)</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vali_thannilai">Vali Thannilai Valarchi</SelectItem>
                      <SelectItem value="azhal_thannilai">Azhal Thannilai Valarchi</SelectItem>
                      <SelectItem value="iyam_thannilai">Iyam Thannilai Valarchi</SelectItem>
                      <SelectItem value="vali_vetrunilai">Vali Vetrunilai Valarchi</SelectItem>
                      <SelectItem value="azhal_vetrunilai">Azhal Vetrunilai Valarchi</SelectItem>
                      <SelectItem value="iyam_vetrunilai">Iyam Vetrunilai Valarchi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Udal Thathukkal (Body Tissues)</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Affected tissue" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saaram">Saaram (Plasma)</SelectItem>
                      <SelectItem value="senneer">Senneer (Blood)</SelectItem>
                      <SelectItem value="oon">Oon (Muscle)</SelectItem>
                      <SelectItem value="kozhuppu">Kozhuppu (Fat)</SelectItem>
                      <SelectItem value="enbu">Enbu (Bone)</SelectItem>
                      <SelectItem value="moolai">Moolai (Marrow)</SelectItem>
                      <SelectItem value="sukkilam">Sukkilam/Suronitham (Reproductive)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Siddha Diagnosis (Noi Nithanam)</Label>
                <Textarea placeholder="Enter Siddha disease diagnosis..." rows={2} />
              </div>
              <div>
                <Label>Treatment (Maruthuvam)</Label>
                <Textarea placeholder="Internal medicines, external therapies, diet and lifestyle modifications..." rows={3} />
              </div>
              <div>
                <Label>Siddha Medicines Prescribed</Label>
                <Textarea placeholder="Medicine name, dose, adjuvant (anupaanam), duration..." rows={3} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsSiddha;
