import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Moon, Save } from "lucide-react";

const HmsUnani = () => {
  const [patientName, setPatientName] = useState("");

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
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
          <TabsTrigger value="mizaj">Mizaj Assessment</TabsTrigger>
          <TabsTrigger value="nabz">Nabz (Pulse)</TabsTrigger>
          <TabsTrigger value="akhlat">Akhlat</TabsTrigger>
          <TabsTrigger value="ilaj">Ilaj (Treatment)</TabsTrigger>
        </TabsList>

        <TabsContent value="mizaj" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Mizaj (Temperament) Assessment</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Patient Mizaj (Temperament)</Label>
                  <Select>
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
                  <Select>
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
                  <Select>
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
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="red_warm">Red & Warm (Damvi)</SelectItem>
                      <SelectItem value="yellow_hot">Yellow & Hot (Safravi)</SelectItem>
                      <SelectItem value="white_cold">White & Cold (Balghami)</SelectItem>
                      <SelectItem value="dark_dry">Dark & Dry (Saudavi)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Tabiyat (Vital Force) Status</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strong">Strong (Qawi)</SelectItem>
                    <SelectItem value="moderate">Moderate (Mutawassit)</SelectItem>
                    <SelectItem value="weak">Weak (Za'eef)</SelectItem>
                  </SelectContent>
                </Select>
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
                  <Label>Pulse Rate</Label>
                  <Input type="number" placeholder="Beats per minute" />
                </div>
                <div>
                  <Label>Pulse Type (Nabz)</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select Nabz type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nabz_qawi">Nabz Qawi (Strong pulse)</SelectItem>
                      <SelectItem value="nabz_zaeef">Nabz Za'eef (Weak pulse)</SelectItem>
                      <SelectItem value="nabz_sareeh">Nabz Sareeh (Fast pulse)</SelectItem>
                      <SelectItem value="nabz_bati">Nabz Bati (Slow pulse)</SelectItem>
                      <SelectItem value="nabz_mumtali">Nabz Mumtali (Full pulse)</SelectItem>
                      <SelectItem value="nabz_dagheeq">Nabz Dagheeq (Thready pulse)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Pulse Quality</Label>
                  <Select>
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
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="damvi">Indicates Damvi condition</SelectItem>
                      <SelectItem value="safravi">Indicates Safravi condition</SelectItem>
                      <SelectItem value="balghami">Indicates Balghami condition</SelectItem>
                      <SelectItem value="saudavi">Indicates Saudavi condition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Nabz Observations</Label>
                <Textarea placeholder="Detailed pulse characteristics, rhythm, volume, tension..." rows={2} />
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
                  <Select>
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
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sue_mizaj_saada">Sue Mizaj Saada (Simple imbalance)</SelectItem>
                      <SelectItem value="sue_mizaj_maddi">Sue Mizaj Maddi (Material imbalance)</SelectItem>
                      <SelectItem value="excess">Imtila (Excess)</SelectItem>
                      <SelectItem value="deficiency">Istifragh (Deficiency)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Baul (Urine) Examination</Label>
                <Textarea placeholder="Color, consistency, sediment, odor..." rows={2} />
              </div>
              <div>
                <Label>Baraz (Stool) Examination</Label>
                <Textarea placeholder="Consistency, color, frequency, odor..." rows={2} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ilaj" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Ilaj (Treatment Plan)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Ilaj bil Tadbeer (Regimental Therapy)</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select therapy" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hijama">Hijama (Cupping)</SelectItem>
                      <SelectItem value="fasd">Fasd (Venesection)</SelectItem>
                      <SelectItem value="dalak">Dalak (Massage)</SelectItem>
                      <SelectItem value="hammam">Hammam (Bath therapy)</SelectItem>
                      <SelectItem value="riyazat">Riyazat (Exercise)</SelectItem>
                      <SelectItem value="irsal_alaq">Irsal-e-Alaq (Leeching)</SelectItem>
                      <SelectItem value="kai">Kai (Emesis)</SelectItem>
                      <SelectItem value="huqna">Huqna (Enema)</SelectItem>
                      <SelectItem value="taleeq">Taleeq (Leech therapy)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ilaj bil Ghiza (Dietotherapy)</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select diet" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hot_moist">Haar Ratab (Hot & Moist foods)</SelectItem>
                      <SelectItem value="hot_dry">Haar Yabis (Hot & Dry foods)</SelectItem>
                      <SelectItem value="cold_moist">Barid Ratab (Cold & Moist foods)</SelectItem>
                      <SelectItem value="cold_dry">Barid Yabis (Cold & Dry foods)</SelectItem>
                      <SelectItem value="balanced">Mu'tadil (Balanced diet)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Ilaj bil Dawa (Pharmacotherapy)</Label>
                <Textarea placeholder="Unani medicines prescribed - Majoon, Habb, Jawarish, Sharbat, Arq, Roghan..." rows={3} />
              </div>
              <div>
                <Label>Ilaj bil Yad (Surgery, if applicable)</Label>
                <Textarea placeholder="Surgical intervention if needed..." rows={2} />
              </div>
              <div>
                <Label>Tadbeer (Regimen) Advice</Label>
                <Textarea placeholder="Lifestyle modifications, exercise, sleep pattern, stress management..." rows={3} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsUnani;
