import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Search,
  BookOpen,
  Sparkles,
  ClipboardList,
  FileText,
} from "lucide-react";

const mockDiseases = [
  {
    name: "Amavata",
    modern: "Rheumatoid Arthritis",
    nidana: "Viruddha Ahara, Mandagni, Sedentary lifestyle",
    lakshana: "Joint pain, swelling, morning stiffness, fever, heaviness",
    samprapti: "Ama + Vata → reaches Sandhis → inflammation of Shleshaka Kapha",
    chikitsa: "Langhanam, Deepana-Pachana, Shodhana (Virechana/Basti), Simhanada Guggulu",
  },
  {
    name: "Gridhrasi",
    modern: "Sciatica",
    nidana: "Vata-prakopa causes, heavy lifting, Ati-sthana (prolonged sitting)",
    lakshana: "Pain radiating from Sphik to Pada, Sakthikshepa difficulty",
    samprapti: "Vata in Kandara/Snayu → affects Gridhrasi Nadi pathway",
    chikitsa: "Kati Basti, Agnikarma, Basti (Tikta-Ksheer), Rasnasaptakam",
  },
  {
    name: "Pandu",
    modern: "Anaemia",
    nidana: "Mitti-bhakshana, Pitta-vardhaka Ahara, Krimija",
    lakshana: "Pallor, weakness, breathlessness, palpitations, Panduta of skin",
    samprapti: "Pitta dushti → Rakta Dhatu Kshaya → Ojakshaya",
    chikitsa: "Dhatri Lauha, Punarnava Mandura, iron-rich Pathya",
  },
  {
    name: "Madhumeha",
    modern: "Diabetes Mellitus",
    nidana: "Asyasukha, Svapnasukha, Kapha-vardhaka Ahara",
    lakshana: "Prabhuta Mutrata, Avila Mutrata, Trishna, Daurbalya",
    samprapti: "Kapha-Meda-Kleda vitiation → Basti dysfunction → Ojakshaya",
    chikitsa: "Chandraprabha Vati, Shilajit, Nisha-Amalaki, Vyayama",
  },
  {
    name: "Sandhivata",
    modern: "Osteoarthritis",
    nidana: "Aging (Vardhakya), Vata-prakopa, overuse of joints",
    lakshana: "Sandhishoola, Sandhishopha, Atopa (crepitus), restricted movement",
    samprapti: "Vata → Shleshaka Kapha Kshaya → Asthi-Sandhigata Vata",
    chikitsa: "Janu Basti, Yogaraja Guggulu, Abhyanga, Basti",
  },
  {
    name: "Shwasa",
    modern: "Bronchial Asthma",
    nidana: "Raja, Dhuma, Sheeta, Pragvata, Vyayama",
    lakshana: "Dyspnoea, wheezing, cough, orthopnoea, Peenasa",
    samprapti: "Pranavahasrotas Dushti → Kapha/Vata in chest → Shwasa",
    chikitsa: "Dashamoolarishtam, Vasa Avaleha, Virechana, Dhumapana",
  },
];

const DoctorAstg = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAiDiagnosis, setShowAiDiagnosis] = useState(false);

  const filteredDiseases = mockDiseases.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.modern.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.lakshana.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAiDiagnosis = () => {
    if (!searchQuery.trim()) {
      toast.error("Enter symptoms for AI differential diagnosis");
      return;
    }
    setShowAiDiagnosis(true);
    toast.success("AI differential diagnosis generated");
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <BookOpen className="h-6 w-6 text-purple-600" />
            ASTG Disease Reference (AI)
          </CardTitle>
          <p className="text-muted-foreground">
            Ayurveda-Siddha-Tamil Nadu Guide disease index. Search by
            symptoms or disease name for comprehensive reference.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="astg-search" className="sr-only">
                Search diseases
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="astg-search"
                  placeholder="Enter symptoms or disease name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowAiDiagnosis(false);
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={handleAiDiagnosis} className="gap-2">
              <Sparkles className="h-4 w-4" />
              AI Differential Diagnosis
            </Button>
          </div>

          {showAiDiagnosis && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI Differential Diagnosis
              </h4>
              <p className="text-sm text-purple-700 mb-3">
                Based on symptoms (joint pain, morning stiffness, swelling):
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Amavata</span>
                  <Badge className="bg-purple-200 text-purple-900">72%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Sandhivata</span>
                  <Badge variant="secondary">18%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Vatarakta</span>
                  <Badge variant="outline">10%</Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredDiseases.map((disease, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{disease.name}</CardTitle>
                <Badge variant="secondary">{disease.modern}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Nidana (Cause)
                  </p>
                  <p className="text-sm">{disease.nidana}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Lakshana (Symptoms)
                  </p>
                  <p className="text-sm">{disease.lakshana}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Samprapti (Pathology)
                  </p>
                  <p className="text-sm">{disease.samprapti}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Chikitsa (Treatment)
                  </p>
                  <p className="text-sm">{disease.chikitsa}</p>
                </div>
              </div>
              <Separator />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() =>
                    toast.info(`Viewing protocol for ${disease.name}`)
                  }
                >
                  <ClipboardList className="h-3 w-3" />
                  View Treatment Protocol
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1"
                  onClick={() =>
                    toast.success(`${disease.name} added to case sheet`)
                  }
                >
                  <FileText className="h-3 w-3" />
                  Add to Case Sheet
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredDiseases.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No diseases found matching your search.
          </p>
        )}
      </div>
    </div>
  );
};

export default DoctorAstg;
