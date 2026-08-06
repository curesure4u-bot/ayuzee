import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText, Search, Copy, Edit, Plus, Check } from "lucide-react";
import { toast } from "sonner";

const templates = [
  {
    id: 1, name: "Gridhrasi (Sciatica)", condition: "Gridhrasi", usageCount: 142,
    chiefComplaints: "Low back pain radiating to lower limb, aggravated by forward bending & prolonged sitting",
    examination: "SLR +ve, Tenderness L4-L5, Restricted lumbar flexion, Vata Prakriti features",
    prescription: "1. Yogaraja Guggulu 2 BD after food\n2. Rasnadi Kashayam 15ml BD before food\n3. Dhanwantaram Taila for Kati Basti\n4. Maharasnadi Kashayam 15ml BD (if chronic)",
    diet: "Warm foods, avoid cold items, include garlic-ginger, sesame oil cooking, avoid curd at night",
    yoga: "Bhujangasana (modified), Shalabhasana, Marjariasana, avoid forward bends",
  },
  {
    id: 2, name: "Prameha (Diabetes Type 2)", condition: "Prameha", usageCount: 98,
    chiefComplaints: "Polyuria, polydipsia, fatigue, numbness in feet, non-healing wound (if present)",
    examination: "BMI elevated, Kapha Prakriti features, Prameha Pidaka on skin, Madhura Mutra",
    prescription: "1. Nishamalaki Churna 5g BD\n2. Chandraprabha Vati 2 BD\n3. Shilajatu Vati 1 BD\n4. Triphala Kashayam 15ml HS",
    diet: "Millets (Ragi, Jowar), bitter gourd, fenugreek water AM, avoid rice-wheat-sugar, small frequent meals",
    yoga: "Surya Namaskar 5 rounds, Mandukasana, Ardha Matsyendrasana, Kapalabhati 5 min",
  },
  {
    id: 3, name: "Amavata (RA)", condition: "Amavata", usageCount: 76,
    chiefComplaints: "Multiple joint pain & swelling (symmetrical), morning stiffness > 30 min, fatigue",
    examination: "Joint swelling (MCPs, PIPs, wrists), Tenderness, Reduced grip strength, Ama lakshanas on tongue",
    prescription: "1. Simhanada Guggulu 2 TDS\n2. Rasnasaptakam Kashayam 15ml BD\n3. Eranda Taila 10ml HS\n4. Amavatari Rasa 1 BD",
    diet: "Langhana first 3 days (light kanji only), then warm light food, avoid curd-fermented-cold items",
    yoga: "Pawanmuktasana series, gentle joint ROM exercises, Shavasana 15 min",
  },
  {
    id: 4, name: "Greeva Stambha (Cervical Spondylosis)", condition: "Greeva Stambha", usageCount: 89,
    chiefComplaints: "Neck pain, stiffness, radiating pain to shoulder/arm, headache, giddiness",
    examination: "Restricted neck ROM, Spurling test +ve, Tenderness C4-C7, Muscle spasm trapezius",
    prescription: "1. Trayodashanga Guggulu 2 BD\n2. Dashamoola Kashayam 15ml BD\n3. Ksheerabala 101 Avarti 10 drops HS (nasal)\n4. Maha Vishagarbha Taila for Greeva Basti",
    diet: "Warm soups, avoid cold drinks-ice cream, include warm milk with turmeric HS",
    yoga: "Gentle neck rotations, Matsyasana (supported), Brahma Mudra, avoid headstand",
  },
  {
    id: 5, name: "Kushtha (Psoriasis)", condition: "Kushtha", usageCount: 54,
    chiefComplaints: "Scaly erythematous plaques, itching, dryness, nail changes, joint pain (if psoriatic arthritis)",
    examination: "Auspitz sign +ve, Candle grease sign, Koebner phenomenon, Nail pitting",
    prescription: "1. Manjishthadi Kashayam 15ml BD\n2. Khadirarishta 20ml BD after food\n3. Gandhaka Rasayana 2 BD\n4. Panchatikta Ghrita externally",
    diet: "Avoid sour-salty excess, no seafood-alcohol, include bitter gourd, neem water AM",
    yoga: "Pranayama (Sheetali, Anuloma Viloma), Meditation 20 min, Shavasana",
  },
];

export default function QuickTemplatesPage() {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = templates.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) || t.condition.toLowerCase().includes(search.toLowerCase())
  );

  const applyTemplate = (name: string) => {
    toast.success(`Template "${name}" applied to current consultation.`);
  };

  const duplicateTemplate = (name: string) => {
    toast.success(`Template "${name}" duplicated. You can now edit the copy.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quick Templates & Macros</h1>
          <p className="text-muted-foreground">One-click auto-fill for common consultation patterns</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" />New Template</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search templates by condition..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid gap-4">
        {filtered.map((t) => (
          <Card key={t.id} className="cursor-pointer" onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" />{t.name}</CardTitle>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Badge variant="outline">Used {t.usageCount}x</Badge>
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => duplicateTemplate(t.name)}><Copy className="h-3 w-3" />Duplicate</Button>
                  <Button size="sm" variant="outline" className="gap-1"><Edit className="h-3 w-3" />Edit</Button>
                  <Button size="sm" className="gap-1" onClick={() => applyTemplate(t.name)}><Check className="h-3 w-3" />Apply</Button>
                </div>
              </div>
            </CardHeader>
            {expandedId === t.id && (
              <CardContent className="space-y-3 border-t pt-3">
                <div><span className="text-xs font-medium uppercase text-muted-foreground">Chief Complaints</span><p className="text-sm mt-1">{t.chiefComplaints}</p></div>
                <div><span className="text-xs font-medium uppercase text-muted-foreground">Examination Findings</span><p className="text-sm mt-1">{t.examination}</p></div>
                <div><span className="text-xs font-medium uppercase text-muted-foreground">Prescription</span><pre className="text-sm mt-1 whitespace-pre-wrap font-sans">{t.prescription}</pre></div>
                <div><span className="text-xs font-medium uppercase text-muted-foreground">Diet Chart</span><p className="text-sm mt-1">{t.diet}</p></div>
                <div><span className="text-xs font-medium uppercase text-muted-foreground">Yoga Prescription</span><p className="text-sm mt-1">{t.yoga}</p></div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
