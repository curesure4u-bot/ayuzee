import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Search, BookOpen, Plus, Sparkles, Pill } from "lucide-react";

const mockFormulations = [
  {
    name: "Simhanada Guggulu",
    type: "Guggulu Kalpa",
    ingredients: "Triphala, Guggulu, Gandhaka, Castor oil",
    indication: "Amavata (Rheumatoid Arthritis), Constipation with Ama",
    dosage: "2 tablets twice daily with warm water",
    reference: "AFI Part I, 5:14",
  },
  {
    name: "Rasnasaptakam Kashayam",
    type: "Kashayam",
    ingredients: "Rasna, Guduchi, Eranda, Devadaru, Amrita, Punarnava, Aragwadha",
    indication: "Gridhrasi (Sciatica), Sandhivata, Amavata",
    dosage: "15 ml twice daily before food",
    reference: "AFI Part I, 3:22",
  },
  {
    name: "Yogaraja Guggulu",
    type: "Guggulu Kalpa",
    ingredients: "Chitraka, Pippali, Guggulu, Triphala, Trikatu",
    indication: "Sandhivata, Vatavyadhi, Gulma",
    dosage: "2 tablets twice daily with warm water",
    reference: "AFI Part I, 5:25",
  },
  {
    name: "Chandraprabha Vati",
    type: "Vati",
    ingredients: "Shilajit, Guggulu, Karpura, Vacha, Mustak",
    indication: "Prameha (Diabetes), Mutraghata, Shukra disorders",
    dosage: "2 tablets twice daily",
    reference: "AFI Part I, 4:8",
  },
  {
    name: "Dashamoolarishtam",
    type: "Arishtam",
    ingredients: "Dashamoola (10 roots), Jaggery, Dhataki",
    indication: "Shwasa, Kasa, Jwara, Post-partum care",
    dosage: "20 ml twice daily after food with equal water",
    reference: "AFI Part II, 1:12",
  },
  {
    name: "Ksheerabala 101",
    type: "Taila (101 Avartana)",
    ingredients: "Bala, Ksheera, Tila Taila",
    indication: "Vatavyadhi, Pakshavadha, Gridhrasi, Neuro disorders",
    dosage: "10 drops internally / external Abhyanga",
    reference: "AFI Part I, 6:5",
  },
  {
    name: "Ashwagandha Churna",
    type: "Churna",
    ingredients: "Ashwagandha (Withania somnifera) root powder",
    indication: "Balya, Rasayana, Daurbalya, Anxiety, Sleep disorders",
    dosage: "3-5 gm with warm milk at night",
    reference: "AFI Part I, 2:3",
  },
  {
    name: "Triphala Guggulu",
    type: "Guggulu Kalpa",
    ingredients: "Triphala, Guggulu, Pippali",
    indication: "Medoroga, Bhagandara (Fistula), Arsha, Obesity",
    dosage: "2 tablets twice daily",
    reference: "AFI Part I, 5:20",
  },
];

const DoctorFormulary = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [showAiResult, setShowAiResult] = useState(false);

  const filteredFormulations = mockFormulations.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.indication.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.ingredients.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAiSearch = () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a condition or symptoms to search");
      return;
    }
    setShowAiResult(true);
    setAiSuggestions([
      "Simhanada Guggulu — for Amavata with Ama and joint inflammation",
      "Rasnasaptakam Kashayam — for Vata-dominant joint pain",
      "Yogaraja Guggulu — for chronic Sandhivata",
      "Dashamoolarishtam — if associated Shwasa/Kasa",
      "Ksheerabala 101 — for neurological Vata involvement",
    ]);
    toast.success("AI suggestions generated from AFI database");
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <BookOpen className="h-6 w-6 text-emerald-600" />
            AFI Formulary (AI Search)
          </CardTitle>
          <p className="text-muted-foreground">
            Searchable database of 5000+ Ayurvedic formulations from Ayurvedic Formulary of India.
            Type a condition or symptoms for AI-powered suggestions.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="formulary-search" className="sr-only">
                Search formulations
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="formulary-search"
                  placeholder="Type disease, symptoms, or formulation name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowAiResult(false);
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={handleAiSearch} className="gap-2">
              <Sparkles className="h-4 w-4" />
              AI Suggest
            </Button>
          </div>

          {showAiResult && aiSuggestions.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <h4 className="font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI Suggested Formulations (Top 5)
              </h4>
              <ul className="space-y-1">
                {aiSuggestions.map((s, i) => (
                  <li key={i} className="text-sm text-emerald-800">
                    {i + 1}. {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Formulations ({filteredFormulations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold">Name</th>
                  <th className="text-left p-3 font-semibold">Type</th>
                  <th className="text-left p-3 font-semibold">Key Ingredients</th>
                  <th className="text-left p-3 font-semibold">Indication</th>
                  <th className="text-left p-3 font-semibold">Dosage</th>
                  <th className="text-left p-3 font-semibold">Reference</th>
                  <th className="text-left p-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredFormulations.map((f, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3 font-medium">{f.name}</td>
                    <td className="p-3">
                      <Badge variant="secondary">{f.type}</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground max-w-[200px]">{f.ingredients}</td>
                    <td className="p-3">{f.indication}</td>
                    <td className="p-3 text-xs">{f.dosage}</td>
                    <td className="p-3">
                      <Badge variant="outline">{f.reference}</Badge>
                    </td>
                    <td className="p-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1"
                        onClick={() =>
                          toast.success(`${f.name} added to prescription`)
                        }
                      >
                        <Plus className="h-3 w-3" />
                        Add to Prescription
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredFormulations.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No formulations found matching your search.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorFormulary;
