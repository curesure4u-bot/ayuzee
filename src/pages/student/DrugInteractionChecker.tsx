import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, CheckCircle2, Info, Pill, Search, ShieldAlert, X } from "lucide-react";

// ---------- Interaction Database ----------

type DrugItem = {
  id: string;
  name: string;
  sanskrit?: string;
  category: string;
};

type Interaction = {
  item1: string;
  item2: string;
  severity: "high" | "moderate" | "low";
  type: string;
  description: string;
  reference: string;
};

const DRUG_ITEMS: DrugItem[] = [
  // Classical drugs
  { id: "ghee", name: "Ghrita (Ghee)", sanskrit: "घृत", category: "Sneha" },
  { id: "honey", name: "Madhu (Honey)", sanskrit: "मधु", category: "Sweetener" },
  { id: "milk", name: "Ksheera (Milk)", sanskrit: "क्षीर", category: "Food" },
  { id: "curd", name: "Dadhi (Curd)", sanskrit: "दधि", category: "Food" },
  { id: "fish", name: "Matsya (Fish)", sanskrit: "मत्स्य", category: "Food" },
  { id: "salt", name: "Lavana (Salt)", sanskrit: "लवण", category: "Rasa" },
  { id: "hot_water", name: "Ushna Jala (Hot Water)", sanskrit: "उष्ण जल", category: "Anupana" },
  { id: "cold_water", name: "Sheeta Jala (Cold Water)", sanskrit: "शीत जल", category: "Anupana" },
  { id: "visha", name: "Visha (Poison/Toxin)", sanskrit: "विष", category: "Toxic" },
  { id: "aconite", name: "Vatsanabha (Aconite)", sanskrit: "वत्सनाभ", category: "Drug" },
  { id: "bhallataka", name: "Bhallataka (Semecarpus)", sanskrit: "भल्लातक", category: "Drug" },
  { id: "shilajit", name: "Shilajit", sanskrit: "शिलाजित", category: "Rasayana" },
  { id: "guggulu", name: "Guggulu", sanskrit: "गुग्गुलु", category: "Drug" },
  { id: "pippali", name: "Pippali (Long Pepper)", sanskrit: "पिप्पली", category: "Drug" },
  { id: "turmeric", name: "Haridra (Turmeric)", sanskrit: "हरिद्रा", category: "Drug" },
  { id: "neem", name: "Nimba (Neem)", sanskrit: "निम्ब", category: "Drug" },
  { id: "copper", name: "Tamra Bhasma (Copper)", sanskrit: "ताम्र भस्म", category: "Bhasma" },
  { id: "iron", name: "Loha Bhasma (Iron)", sanskrit: "लोह भस्म", category: "Bhasma" },
  { id: "mercury", name: "Parada (Mercury)", sanskrit: "पारद", category: "Rasa Dravya" },
  { id: "sulphur", name: "Gandhaka (Sulphur)", sanskrit: "गन्धक", category: "Rasa Dravya" },
  { id: "sour_food", name: "Amla Dravya (Sour items)", sanskrit: "अम्ल द्रव्य", category: "Food" },
  { id: "radish", name: "Mulaka (Radish)", sanskrit: "मूलक", category: "Food" },
  { id: "jaggery", name: "Guda (Jaggery)", sanskrit: "गुड", category: "Sweetener" },
  { id: "sesame", name: "Tila (Sesame)", sanskrit: "तिल", category: "Food" },
  { id: "meat", name: "Mamsa (Meat)", sanskrit: "मांस", category: "Food" },
];

const INTERACTIONS: Interaction[] = [
  { item1: "ghee", item2: "honey", severity: "high", type: "Samyoga Viruddha", description: "Ghee and Honey in equal quantity is considered one of the most toxic combinations (Viruddha Ahara). Creates Ama and is slow poison. Unequal proportions are acceptable.", reference: "Charaka Samhita Su. 26/84" },
  { item1: "milk", item2: "fish", severity: "high", type: "Samyoga Viruddha", description: "Fish with milk causes Kushtha (skin diseases) and channel-blocking. Both are Abhishyandi but have opposite Veerya (milk is Sheeta, fish is Ushna).", reference: "Charaka Samhita Su. 26/81" },
  { item1: "milk", item2: "salt", severity: "moderate", type: "Samyoga Viruddha", description: "Milk with salt is Viruddha as salt curdles milk and aggravates Pitta-Kapha. Causes skin disorders on long-term use.", reference: "Charaka Samhita Su. 26/82" },
  { item1: "milk", item2: "sour_food", severity: "moderate", type: "Veerya Viruddha", description: "Milk (Sheeta Veerya) with sour substances (Ushna Veerya) creates Veerya Viruddha. Leads to blood vitiation and Rakta-Pitta.", reference: "Ashtanga Hridaya Su. 7/29" },
  { item1: "milk", item2: "radish", severity: "moderate", type: "Samyoga Viruddha", description: "Radish with milk is incompatible. Radish is Ushna and Teekshna while milk is Madhura and Sheeta — opposing qualities cause Agni disturbance.", reference: "Charaka Samhita Su. 26/84" },
  { item1: "honey", item2: "hot_water", severity: "high", type: "Samskara Viruddha", description: "Honey should NEVER be heated or mixed with hot substances. Heated honey produces Ama (toxins) comparable to poison. This is a fundamental Ayurvedic principle.", reference: "Charaka Samhita Su. 26/84, Ashtanga Hridaya Su. 5/53" },
  { item1: "curd", item2: "hot_water", severity: "moderate", type: "Virya Viruddha", description: "Heated curd or curd with hot items disturbs Rakta Dhatu. Curd should not be consumed at night or heated.", reference: "Ashtanga Hridaya Su. 5/37" },
  { item1: "ghee", item2: "cold_water", severity: "low", type: "Krama Viruddha", description: "Drinking cold water immediately after consuming ghee can impair Agni (digestive fire). Warm water is the recommended Anupana with ghee.", reference: "Sushruta Samhita Su. 20/16" },
  { item1: "bhallataka", item2: "curd", severity: "high", type: "Drug-Food Interaction", description: "Bhallataka (marking nut) should NEVER be taken with curd or Kanji. Causes severe skin reactions and internal burning.", reference: "Rasa Tarangini 24/5" },
  { item1: "shilajit", item2: "meat", severity: "moderate", type: "Pathya Viruddha", description: "During Shilajit Rasayana course, non-vegetarian food (especially Kulatha) should be avoided. Reduces efficacy and can cause Ama.", reference: "Charaka Samhita Chi. 1-3" },
  { item1: "copper", item2: "sour_food", severity: "moderate", type: "Patra Viruddha", description: "Copper vessel + acidic/sour foods create toxic copper salts (verdigris). Never store sour substances in copper. Relevant to Tamra Bhasma administration.", reference: "Rasa Tarangini 17" },
  { item1: "iron", item2: "milk", severity: "low", type: "Anupana Viruddha", description: "Loha Bhasma should be taken with Triphala Kwatha or honey as Anupana, NOT milk. Milk reduces iron absorption and efficacy.", reference: "Rasa Ratna Samucchaya 5/86" },
  { item1: "mercury", item2: "salt", severity: "high", type: "Shodhana Viruddha", description: "Improperly processed Mercury (Parada) with Lavana creates toxic amalgams. Strict Shodhana protocols must be followed before any internal use.", reference: "Rasa Tarangini 5/15" },
  { id: "14", item1: "guggulu", item2: "sour_food", severity: "moderate", type: "Pathya Viruddha", description: "During Guggulu consumption, Amla Rasa (sour foods), exercise in sunlight, anger, and alcohol should be avoided (Guggulu Pathya).", reference: "Sushruta Samhita Chi. 5" },
  { item1: "pippali", item2: "ghee", severity: "low", type: "Beneficial Combination", description: "Pippali with Ghee is actually a beneficial Yogavahi combination. Ghee carries Pippali's properties deeper into tissues (Rasayana effect).", reference: "Charaka Samhita Chi. 1/3" },
  { item1: "turmeric", item2: "milk", severity: "low", type: "Beneficial Combination", description: "Turmeric with warm milk (Haldi Doodh) is a classical Rasayana combination. Anti-inflammatory, Ojas-building, and immune-boosting.", reference: "Bhavaprakasha Nighantu, Haritakyadi Varga" },
  { item1: "jaggery", item2: "curd", severity: "moderate", type: "Samyoga Viruddha", description: "Jaggery (Guda) and curd together increase Kapha and Meda, leading to Prameha (diabetes) and obesity on regular consumption.", reference: "Ashtanga Hridaya Su. 7/32" },
  { item1: "sesame", item2: "milk", severity: "low", type: "Krama Viruddha", description: "Consuming sesame preparations followed immediately by milk can cause digestive disturbance. Small gap recommended.", reference: "Charaka Samhita Su. 26" },
];

const severityConfig = {
  high: { color: "bg-red-100 text-red-800 border-red-200", icon: ShieldAlert, label: "High Risk" },
  moderate: { color: "bg-amber-100 text-amber-800 border-amber-200", icon: AlertTriangle, label: "Moderate" },
  low: { color: "bg-green-100 text-green-800 border-green-200", icon: Info, label: "Low / Safe" },
};

// ---------- Main Page ----------

const DrugInteractionChecker = () => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const filteredDrugs = useMemo(() => {
    if (!search.trim()) return DRUG_ITEMS;
    const q = search.toLowerCase();
    return DRUG_ITEMS.filter((d) => d.name.toLowerCase().includes(q) || (d.sanskrit || "").includes(q) || d.category.toLowerCase().includes(q));
  }, [search]);

  const interactions = useMemo(() => {
    if (selectedItems.length < 2) return [];
    const results: Interaction[] = [];
    for (let i = 0; i < selectedItems.length; i++) {
      for (let j = i + 1; j < selectedItems.length; j++) {
        const a = selectedItems[i];
        const b = selectedItems[j];
        const found = INTERACTIONS.filter(
          (int) => (int.item1 === a && int.item2 === b) || (int.item1 === b && int.item2 === a)
        );
        results.push(...found);
      }
    }
    return results.sort((a, b) => {
      const order = { high: 0, moderate: 1, low: 2 };
      return order[a.severity] - order[b.severity];
    });
  }, [selectedItems]);

  const addItem = (id: string) => {
    if (!selectedItems.includes(id)) setSelectedItems((prev) => [...prev, id]);
  };

  const removeItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((i) => i !== id));
  };

  const getItemName = (id: string) => DRUG_ITEMS.find((d) => d.id === id)?.name || id;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Pill className="h-6 w-6 text-primary" /> Drug Interaction Checker
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Classical Viruddha Ahara simulator — select drugs/foods to check Ayurvedic incompatibilities
        </p>
      </div>

      {/* Selected Items */}
      <Card>
        <CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Selected Items (select 2+ to check interactions)</p>
          <div className="flex flex-wrap gap-2 min-h-[36px]">
            {selectedItems.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No items selected. Choose from the list below.</p>
            ) : (
              selectedItems.map((id) => (
                <Badge key={id} variant="secondary" className="gap-1 pr-1">
                  {getItemName(id)}
                  <button onClick={() => removeItem(id)} className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5" aria-label="Remove">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
          {selectedItems.length > 0 && (
            <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={() => setSelectedItems([])}>Clear All</Button>
          )}
        </CardContent>
      </Card>

      {/* Interaction Results */}
      {selectedItems.length >= 2 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-sm">
            {interactions.length > 0
              ? `${interactions.length} interaction${interactions.length !== 1 ? "s" : ""} found`
              : "No known interactions"}
          </h2>

          {interactions.length === 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <p className="text-sm text-green-800">No known Viruddha (incompatibility) found between these items in classical texts.</p>
              </CardContent>
            </Card>
          )}

          {interactions.map((int, idx) => {
            const config = severityConfig[int.severity];
            const Icon = config.icon;
            return (
              <Card key={idx} className={`border ${config.color.split(" ")[2] || ""}`}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${int.severity === "high" ? "text-red-600" : int.severity === "moderate" ? "text-amber-600" : "text-green-600"}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{getItemName(int.item1)} + {getItemName(int.item2)}</span>
                        <Badge className={`text-[10px] ${config.color}`}>{config.label}</Badge>
                        <Badge variant="outline" className="text-[10px]">{int.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{int.description}</p>
                      <p className="text-xs text-muted-foreground mt-1 italic">Ref: {int.reference}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Drug List */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search drugs, foods, bhasmas..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {filteredDrugs.map((drug) => {
            const isSelected = selectedItems.includes(drug.id);
            return (
              <Button
                key={drug.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className="justify-start text-left h-auto py-2 px-3"
                onClick={() => isSelected ? removeItem(drug.id) : addItem(drug.id)}
              >
                <div>
                  <p className="text-xs font-medium">{drug.name}</p>
                  <p className="text-[10px] opacity-70">{drug.category}</p>
                </div>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DrugInteractionChecker;
