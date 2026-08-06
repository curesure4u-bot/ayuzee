import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  FlaskConical, Plus, Search, BookOpen, Package, Clock,
  CheckCircle2, FileText,
} from "lucide-react";

// Reference: Ayurvedic Formulary of India (AFI) | Sharangdhara Samhita - Madhyama Khanda

type FormulationType = "Kashayam" | "Churna" | "Taila" | "Ghrita" | "Asava" | "Arishta" | "Vati" | "Guggulu";

interface ClassicalFormulation {
  id: string;
  name: string;
  type: FormulationType;
  ingredients: string[];
  indication: string;
  dose: string;
  anupana: string;
  reference: string;
}

interface CustomIngredient {
  name: string;
  quantity: string;
  part: string;
}

interface BatchRecord {
  id: string;
  formulationName: string;
  batchNo: string;
  preparedDate: string;
  expiryDate: string;
  quantity: string;
  status: "Ready" | "In Process" | "Quarantine" | "Released";
  preparedBy: string;
}

const classicalFormulations: ClassicalFormulation[] = [
  {
    id: "f1", name: "Dasamoolarishtam", type: "Arishta",
    ingredients: ["Bilva", "Agnimantha", "Shyonaka", "Patala", "Gambhari", "Brihati", "Kantakari", "Gokshura", "Shalaparni", "Prishnaparni", "Dhataki pushpa", "Jaggery"],
    indication: "Post-partum care, weakness, respiratory conditions, Vata disorders",
    dose: "15-30 ml with equal water, twice daily after food",
    anupana: "Water",
    reference: "AFI Part-I, 2:1 | Ashtanga Hridaya"
  },
  {
    id: "f2", name: "Triphala Churna", type: "Churna",
    ingredients: ["Haritaki", "Vibhitaki", "Amalaki"],
    indication: "Constipation, eye disorders, obesity, detox, Rasayana",
    dose: "3-6g with warm water or honey at bedtime",
    anupana: "Warm water / Honey / Ghee",
    reference: "Charaka Samhita - Chikitsa 1 | AFI Part-I"
  },
  {
    id: "f3", name: "Mahatiktaka Ghrita", type: "Ghrita",
    ingredients: ["Nimba", "Patola", "Vyaghri", "Amrita", "Vasa", "Kutaja", "Triphala", "Trayamana", "Ghrita", "Water"],
    indication: "Skin diseases, Pitta disorders, Virechana Poorvakarma, chronic dermatitis",
    dose: "5-10ml increasing dose for Snehapana; 5ml for Shamana",
    anupana: "Warm water",
    reference: "Ashtanga Hridaya - Chikitsa 19 | AFI Part-I"
  },
  {
    id: "f4", name: "Kaishore Guggulu", type: "Guggulu",
    ingredients: ["Guggulu", "Triphala", "Guduchi", "Trikatu", "Vidanga", "Danti Mula", "Trivrit", "Ghrita"],
    indication: "Gout, skin diseases, inflammatory conditions, Vatarakta",
    dose: "2-4 tablets (250mg each) twice daily",
    anupana: "Warm water / Milk",
    reference: "Sharangdhara Samhita 7:82 | Bhaishajya Ratnavali"
  },
  {
    id: "f5", name: "Dhanwantaram Kashayam", type: "Kashayam",
    ingredients: ["Bala", "Yava", "Kulatha", "Dasamoola", "Rasna", "Eranda", "Devadaru", "Sahachara", "Punarnava"],
    indication: "Vata disorders, neurological conditions, post-partum care, paralysis",
    dose: "15ml kashayam + 45ml water, twice daily before food",
    anupana: "Warm water",
    reference: "Ashtanga Hridaya - Chikitsa 21 | Sahasrayogam"
  },
  {
    id: "f6", name: "Chandraprabha Vati", type: "Vati",
    ingredients: ["Chandraprabha (Camphor)", "Vacha", "Musta", "Bhunimba", "Guduchi", "Daru Haridra", "Haridra", "Triphala", "Trikatu", "Guggulu", "Loha Bhasma", "Shilajit"],
    indication: "Prameha (Diabetes), UTI, calculi, general debility",
    dose: "2 tablets twice daily with milk or water",
    anupana: "Milk / Luke warm water",
    reference: "Sharangdhara Samhita | Bhaishajya Ratnavali - Prameha"
  },
  {
    id: "f7", name: "Ksheerabala Taila (101)", type: "Taila",
    ingredients: ["Bala (Sida cordifolia)", "Ksheera (Milk)", "Tila Taila (Sesame oil)"],
    indication: "Neurological disorders, facial paralysis, insomnia, Nasya, Abhyanga",
    dose: "External: As needed for Abhyanga/Nasya; Internal: 5-10 drops",
    anupana: "Milk (internal use)",
    reference: "Ashtanga Hridaya - Chikitsa 21 | Sahasrayogam"
  },
  {
    id: "f8", name: "Kumaryasavam", type: "Asava",
    ingredients: ["Kumari (Aloe vera)", "Lauha Bhasma", "Dhataki Pushpa", "Guda (Jaggery)", "Musta", "Chitraka", "Trikatu"],
    indication: "Liver disorders, anemia, digestive issues, gynecological conditions",
    dose: "15-30ml with equal water after food",
    anupana: "Water",
    reference: "Bhaishajya Ratnavali | AFI Part-I"
  },
];

const mockBatches: BatchRecord[] = [
  { id: "b1", formulationName: "Triphala Churna", batchNo: "TC-2026-07-001", preparedDate: "2026-07-15", expiryDate: "2027-07-15", quantity: "5 Kg", status: "Released", preparedBy: "Pharmacist Ravi" },
  { id: "b2", formulationName: "Dhanwantaram Kashayam", batchNo: "DK-2026-07-002", preparedDate: "2026-07-18", expiryDate: "2026-10-18", quantity: "20 Liters", status: "Ready", preparedBy: "Pharmacist Anand" },
  { id: "b3", formulationName: "Kaishore Guggulu", batchNo: "KG-2026-07-003", preparedDate: "2026-07-20", expiryDate: "2028-07-20", quantity: "2000 tablets", status: "In Process", preparedBy: "Pharmacist Meena" },
  { id: "b4", formulationName: "Ksheerabala 101", batchNo: "KB-2026-07-004", preparedDate: "2026-07-10", expiryDate: "2029-07-10", quantity: "10 Liters", status: "Quarantine", preparedBy: "Pharmacist Ravi" },
];

const formulationTypes: FormulationType[] = ["Kashayam", "Churna", "Taila", "Ghrita", "Asava", "Arishta", "Vati", "Guggulu"];

const AyushFormulations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<FormulationType | "All">("All");
  const [customIngredients, setCustomIngredients] = useState<CustomIngredient[]>([
    { name: "Haritaki", quantity: "1 part", part: "Fruit rind" },
    { name: "Vibhitaki", quantity: "1 part", part: "Fruit rind" },
    { name: "Amalaki", quantity: "1 part", part: "Fruit" },
  ]);

  const filteredFormulations = classicalFormulations.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.ingredients.some(i => i.toLowerCase().includes(searchTerm.toLowerCase())) ||
      f.indication.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "All" || f.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Released": return "bg-green-100 text-green-700";
      case "Ready": return "bg-blue-100 text-blue-700";
      case "In Process": return "bg-amber-100 text-amber-700";
      case "Quarantine": return "bg-red-100 text-red-700";
      default: return "bg-gray-100";
    }
  };

  const getTypeColor = (type: FormulationType) => {
    const colors: Record<FormulationType, string> = {
      Kashayam: "bg-amber-100 text-amber-700",
      Churna: "bg-green-100 text-green-700",
      Taila: "bg-yellow-100 text-yellow-700",
      Ghrita: "bg-orange-100 text-orange-700",
      Asava: "bg-purple-100 text-purple-700",
      Arishta: "bg-indigo-100 text-indigo-700",
      Vati: "bg-blue-100 text-blue-700",
      Guggulu: "bg-rose-100 text-rose-700",
    };
    return colors[type];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-purple-700 flex items-center gap-2">
          <FlaskConical className="h-5 w-5" /> AYUSH Formulations
        </h2>
        <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
          <Plus className="mr-1 h-3 w-3" /> New Formulation
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground italic">
        Ref: Ayurvedic Formulary of India (AFI) | Sharangdhara Samhita - Madhyama Khanda
      </p>

      <Tabs defaultValue="library" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="library">Classical Library</TabsTrigger>
          <TabsTrigger value="custom">Custom Builder</TabsTrigger>
          <TabsTrigger value="batches">Batch Tracking</TabsTrigger>
        </TabsList>

        {/* Classical Library */}
        <TabsContent value="library" className="space-y-4">
          <div className="flex gap-2 items-center flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                placeholder="Search formulation, ingredient, or indication..."
                className="pl-7 h-8 text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-1 flex-wrap">
              <Badge
                variant={selectedType === "All" ? "default" : "outline"}
                className="cursor-pointer text-[9px]"
                onClick={() => setSelectedType("All")}
              >All</Badge>
              {formulationTypes.map((t) => (
                <Badge
                  key={t}
                  variant={selectedType === t ? "default" : "outline"}
                  className="cursor-pointer text-[9px]"
                  onClick={() => setSelectedType(t)}
                >{t}</Badge>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            {filteredFormulations.map((f) => (
              <Card key={f.id} className="hover:shadow-sm transition">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{f.name}</span>
                        <Badge className={`text-[9px] ${getTypeColor(f.type)}`}>{f.type}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{f.indication}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="text-[9px] h-6" onClick={() => toast.info(`Opening ${f.name} details`)}>
                      <BookOpen className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {f.ingredients.slice(0, 6).map((ing, i) => (
                      <Badge key={i} variant="outline" className="text-[8px]">{ing}</Badge>
                    ))}
                    {f.ingredients.length > 6 && (
                      <Badge variant="outline" className="text-[8px] text-muted-foreground">+{f.ingredients.length - 6} more</Badge>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-3 gap-2 text-[10px]">
                    <p><span className="text-muted-foreground">Dose:</span> {f.dose}</p>
                    <p><span className="text-muted-foreground">Anupana:</span> {f.anupana}</p>
                    <p><span className="text-muted-foreground">Ref:</span> <em>{f.reference}</em></p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Custom Builder */}
        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Custom Formulation Builder</CardTitle>
              <p className="text-[10px] text-muted-foreground">Create personalized medicine combinations with specific proportions</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-muted-foreground">Formulation Name</label>
                  <Input placeholder="e.g., Custom Triphala Plus" className="h-8 text-xs mt-1" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">Type</label>
                  <Input placeholder="Churna / Kashayam / etc." className="h-8 text-xs mt-1" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium">Ingredients</label>
                  <Button size="sm" variant="outline" className="h-6 text-[9px]" onClick={() => {
                    setCustomIngredients([...customIngredients, { name: "", quantity: "", part: "" }]);
                  }}>
                    <Plus className="h-2 w-2 mr-1" /> Add
                  </Button>
                </div>
                <div className="space-y-1">
                  {customIngredients.map((ing, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Ingredient name"
                        className="h-7 text-[10px]"
                        value={ing.name}
                        onChange={(e) => {
                          const updated = [...customIngredients];
                          updated[idx].name = e.target.value;
                          setCustomIngredients(updated);
                        }}
                      />
                      <Input
                        placeholder="Quantity"
                        className="h-7 text-[10px]"
                        value={ing.quantity}
                        onChange={(e) => {
                          const updated = [...customIngredients];
                          updated[idx].quantity = e.target.value;
                          setCustomIngredients(updated);
                        }}
                      />
                      <Input
                        placeholder="Part used"
                        className="h-7 text-[10px]"
                        value={ing.part}
                        onChange={(e) => {
                          const updated = [...customIngredients];
                          updated[idx].part = e.target.value;
                          setCustomIngredients(updated);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-muted-foreground">Method of Preparation</label>
                  <Input placeholder="Describe preparation steps..." className="h-8 text-xs mt-1" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">Shelf Life (Yoga Kshema)</label>
                  <Input placeholder="e.g., 2 years" className="h-8 text-xs mt-1" />
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => toast.success("Formulation saved to library")}>
                  <CheckCircle2 className="mr-1 h-3 w-3" /> Save Formulation
                </Button>
                <Button size="sm" variant="outline" onClick={() => toast.info("Creating batch from formulation")}>
                  <Package className="mr-1 h-3 w-3" /> Create Batch
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Batch Tracking */}
        <TabsContent value="batches" className="space-y-4">
          <div className="grid sm:grid-cols-4 gap-3">
            <Card className="border-green-200"><CardContent className="p-3 text-center"><CheckCircle2 className="h-4 w-4 mx-auto text-green-600" /><p className="text-lg font-bold text-green-600 mt-1">{mockBatches.filter(b => b.status === "Released").length}</p><p className="text-[10px] text-muted-foreground">Released</p></CardContent></Card>
            <Card className="border-blue-200"><CardContent className="p-3 text-center"><Package className="h-4 w-4 mx-auto text-blue-600" /><p className="text-lg font-bold text-blue-600 mt-1">{mockBatches.filter(b => b.status === "Ready").length}</p><p className="text-[10px] text-muted-foreground">Ready</p></CardContent></Card>
            <Card className="border-amber-200"><CardContent className="p-3 text-center"><Clock className="h-4 w-4 mx-auto text-amber-600" /><p className="text-lg font-bold text-amber-600 mt-1">{mockBatches.filter(b => b.status === "In Process").length}</p><p className="text-[10px] text-muted-foreground">In Process</p></CardContent></Card>
            <Card className="border-red-200"><CardContent className="p-3 text-center"><FileText className="h-4 w-4 mx-auto text-red-600" /><p className="text-lg font-bold text-red-600 mt-1">{mockBatches.filter(b => b.status === "Quarantine").length}</p><p className="text-[10px] text-muted-foreground">Quarantine</p></CardContent></Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Batch Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left p-2">Batch No</th>
                      <th className="text-left p-2">Formulation</th>
                      <th className="text-left p-2">Prepared</th>
                      <th className="text-left p-2">Expiry</th>
                      <th className="text-left p-2">Qty</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockBatches.map((batch) => (
                      <tr key={batch.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="p-2 font-mono text-[10px]">{batch.batchNo}</td>
                        <td className="p-2 font-medium">{batch.formulationName}</td>
                        <td className="p-2">{batch.preparedDate}</td>
                        <td className="p-2">{batch.expiryDate}</td>
                        <td className="p-2">{batch.quantity}</td>
                        <td className="p-2"><Badge className={`text-[8px] ${getStatusColor(batch.status)}`}>{batch.status}</Badge></td>
                        <td className="p-2 text-muted-foreground">{batch.preparedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AyushFormulations;
