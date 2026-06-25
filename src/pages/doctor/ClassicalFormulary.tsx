import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, BookmarkCheck, Search, ShoppingCart, ExternalLink, BadgeCheck, ArrowDownAZ, Activity, TrendingUp, FileSignature, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { toast } from "sonner";
import { PrescribeFormulaDialog } from "@/components/doctor/PrescribeFormulaDialog";
import { FormularyTray } from "@/components/doctor/FormularyTray";
import { trayStore } from "@/lib/formulary-tray";
import { supabase } from "@/integrations/supabase/client";

type FormType =
  | "Kashayam" | "Churna" | "Arishta" | "Tailam" | "Ghritam"
  | "Vati" | "Lehyam" | "Bhasma" | "Rasayana";

const TYPE_COLORS: Record<string, string> = {
  Kashayam: "bg-blue-100 text-blue-800 border-blue-200",
  Churna: "bg-green-100 text-green-800 border-green-200",
  Arishta: "bg-purple-100 text-purple-800 border-purple-200",
  Tailam: "bg-orange-100 text-orange-800 border-orange-200",
  Ghritam: "bg-amber-100 text-amber-800 border-amber-200",
  Vati: "bg-rose-100 text-rose-800 border-rose-200",
  Lehyam: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Bhasma: "bg-slate-200 text-slate-800 border-slate-300",
  Rasayana: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

interface Ingredient { name: string; quantity: string; role: string }
interface ManufacturerListing { manufacturer: string; pack: string; mrp: number; gmp: boolean; available: boolean }
interface Formula {
  id: string;
  name: string;
  sanskrit?: string;
  type: FormType;
  indications: string[];
  dose: string;
  anupana: string;
  reference: string;
  ingredients: Ingredient[];
  contraindications: string;
  duration: string;
  precautions: string;
  pediatric?: string;
  manufacturers: ManufacturerListing[];
  related: string[];
  alternatives: string[];
  astg?: { disease: string; chapter: string; level: number; href?: string };
}

const SEED: Formula[] = [
  {
    id: "chandraprabha-vati", name: "Chandraprabha Vati", sanskrit: "चन्द्रप्रभा वटी", type: "Vati",
    indications: ["Madhumeha (Diabetes)", "Ashmari (Calculi)", "Mutraghata", "Prameha", "Shukra dushti"],
    dose: "2 tab BD", anupana: "Warm water", reference: "Sharangadhara Samhita, Madhyama Khanda 7/40-49",
    ingredients: [
      { name: "Guggulu", quantity: "1 part", role: "Chief" },
      { name: "Shilajatu", quantity: "1 part", role: "Chief" },
      { name: "Vacha", quantity: "1/16 part", role: "Adjuvant" },
      { name: "Musta", quantity: "1/16 part", role: "Adjuvant" },
      { name: "Loha Bhasma", quantity: "1/8 part", role: "Mineral" },
    ],
    contraindications: "Pregnancy, severe renal failure", duration: "4-8 weeks",
    precautions: "Monitor blood sugar; review periodically",
    manufacturers: [
      { manufacturer: "Kottakkal Arya Vaidya Sala", pack: "100 tab", mrp: 180, gmp: true, available: true },
      { manufacturer: "SNA Oushadhasala", pack: "100 tab", mrp: 165, gmp: true, available: true },
      { manufacturer: "Dabur", pack: "100 tab", mrp: 145, gmp: true, available: true },
      { manufacturer: "Baidyanath", pack: "100 tab", mrp: 155, gmp: true, available: false },
    ],
    related: ["shilajatu-vati", "gokshuradi-guggulu"], alternatives: ["yogaraja-guggulu"],
    astg: { disease: "Madhumeha (Type 2 DM)", chapter: "Endocrine", level: 2 },
  },
  {
    id: "triphala-churna", name: "Triphala Churna", sanskrit: "त्रिफला चूर्ण", type: "Churna",
    indications: ["Constipation", "Eye health", "Rasayana", "Mild obesity"],
    dose: "3-6 g HS", anupana: "Warm water / honey", reference: "Ashtanga Hridaya, Uttara 13",
    ingredients: [
      { name: "Haritaki", quantity: "1 part", role: "Chief" },
      { name: "Vibhitaki", quantity: "1 part", role: "Chief" },
      { name: "Amalaki", quantity: "1 part", role: "Chief" },
    ],
    contraindications: "Diarrhoea, pregnancy (high dose)", duration: "Long term safe", precautions: "Reduce dose if loose stools",
    pediatric: "Clark's rule from 12 yr",
    manufacturers: [
      { manufacturer: "Kottakkal", pack: "100 g", mrp: 95, gmp: true, available: true },
      { manufacturer: "SNA Oushadhasala", pack: "100 g", mrp: 85, gmp: true, available: true },
      { manufacturer: "Dabur", pack: "120 g", mrp: 70, gmp: true, available: true },
      { manufacturer: "Himalaya", pack: "100 tab", mrp: 110, gmp: true, available: true },
    ],
    related: ["sitopaladi-churna"], alternatives: ["abhayarishta"],
    astg: { disease: "Vibandha (Constipation)", chapter: "Gastro-intestinal", level: 1 },
  },
  {
    id: "dashamula-kwatha", name: "Dashamula Kwatha", sanskrit: "दशमूल क्वाथ", type: "Kashayam",
    indications: ["Vata disorders", "Backache", "Post-partum care", "Fever"],
    dose: "40 ml BD", anupana: "Empty stomach", reference: "Sahasrayogam, Kashaya Prakarana",
    ingredients: [
      { name: "Bilva", quantity: "Equal", role: "Chief" }, { name: "Agnimantha", quantity: "Equal", role: "Chief" },
      { name: "Shyonaka", quantity: "Equal", role: "Chief" }, { name: "Gambhari", quantity: "Equal", role: "Chief" },
      { name: "Patala", quantity: "Equal", role: "Chief" }, { name: "Brihati", quantity: "Equal", role: "Adjuvant" },
      { name: "Kantakari", quantity: "Equal", role: "Adjuvant" }, { name: "Shalaparni", quantity: "Equal", role: "Adjuvant" },
      { name: "Prishniparni", quantity: "Equal", role: "Adjuvant" }, { name: "Gokshura", quantity: "Equal", role: "Adjuvant" },
    ],
    contraindications: "Pitta predominance, ulcers", duration: "2-4 weeks", precautions: "Avoid in high pitta",
    manufacturers: [
      { manufacturer: "Kottakkal", pack: "200 ml", mrp: 220, gmp: true, available: true },
      { manufacturer: "SNA", pack: "200 ml", mrp: 195, gmp: true, available: true },
      { manufacturer: "Vaidyaratnam", pack: "200 ml", mrp: 210, gmp: true, available: true },
    ],
    related: ["yogaraja-guggulu", "ksheerabala-taila"], alternatives: ["maharasnadi-kashayam"],
  },
  {
    id: "sahacharadi-taila", name: "Sahacharadi Taila", sanskrit: "सहचरादि तैलम्", type: "Tailam",
    indications: ["Neurological disorders", "Joint pain", "Sciatica"],
    dose: "External application", anupana: "—", reference: "Sahasrayogam, Taila Prakarana",
    ingredients: [
      { name: "Sahachara", quantity: "Chief", role: "Chief" },
      { name: "Tila Taila", quantity: "Base", role: "Base oil" },
    ],
    contraindications: "Open wounds", duration: "21-28 days", precautions: "External use only",
    manufacturers: [
      { manufacturer: "Kottakkal", pack: "200 ml", mrp: 280, gmp: true, available: true },
      { manufacturer: "SNA", pack: "200 ml", mrp: 260, gmp: true, available: true },
      { manufacturer: "Vaidyaratnam", pack: "200 ml", mrp: 250, gmp: true, available: true },
    ],
    related: ["mahanarayan-taila", "ksheerabala-taila"], alternatives: ["mahanarayan-taila"],
  },
  {
    id: "mahanarayan-taila", name: "Mahanarayan Taila", sanskrit: "महानारायण तैलम्", type: "Tailam",
    indications: ["Arthritis", "Muscle pain", "Paralysis"],
    dose: "External massage", anupana: "Warm", reference: "Bhaishajya Ratnavali, Vatavyadhi Adhikara",
    ingredients: [{ name: "Bala", quantity: "Chief", role: "Chief" }, { name: "Ashwagandha", quantity: "Adjuvant", role: "Adjuvant" }, { name: "Tila Taila", quantity: "Base", role: "Base" }],
    contraindications: "Acute inflammation", duration: "Ongoing", precautions: "Warm before use",
    manufacturers: [
      { manufacturer: "Kottakkal", pack: "200 ml", mrp: 320, gmp: true, available: true },
      { manufacturer: "Baidyanath", pack: "200 ml", mrp: 240, gmp: true, available: true },
      { manufacturer: "Dabur", pack: "100 ml", mrp: 175, gmp: true, available: true },
      { manufacturer: "SNA", pack: "200 ml", mrp: 290, gmp: true, available: true },
    ],
    related: ["sahacharadi-taila", "yogaraja-guggulu"], alternatives: ["sahacharadi-taila"],
  },
  {
    id: "yogaraja-guggulu", name: "Yogaraja Guggulu", sanskrit: "योगराज गुग्गुलु", type: "Vati",
    indications: ["Arthritis", "Gout", "Vata disorders"],
    dose: "2 tab BD", anupana: "Warm water", reference: "Sharangadhara Samhita, Madhyama Khanda 7",
    ingredients: [{ name: "Guggulu", quantity: "Chief", role: "Chief" }, { name: "Triphala", quantity: "Adjuvant", role: "Adjuvant" }, { name: "Trikatu", quantity: "Adjuvant", role: "Adjuvant" }],
    contraindications: "Pregnancy, severe gastritis", duration: "6-12 weeks", precautions: "Take after food",
    manufacturers: [
      { manufacturer: "Kottakkal", pack: "100 tab", mrp: 200, gmp: true, available: true },
      { manufacturer: "SNA", pack: "100 tab", mrp: 180, gmp: true, available: true },
      { manufacturer: "Baidyanath", pack: "100 tab", mrp: 160, gmp: true, available: true },
    ],
    related: ["dashamula-kwatha", "mahanarayan-taila"], alternatives: ["chandraprabha-vati"],
    astg: { disease: "Sandhivata (Osteoarthritis)", chapter: "Musculoskeletal", level: 2 },
  },
  {
    id: "sitopaladi-churna", name: "Sitopaladi Churna", sanskrit: "सितोपलादि चूर्ण", type: "Churna",
    indications: ["Cough", "Respiratory weakness", "Fever"],
    dose: "3-6 g BD", anupana: "Honey", reference: "Sharangadhara Samhita, Madhyama Khanda 6",
    ingredients: [{ name: "Sita (sugar candy)", quantity: "16 parts", role: "Vehicle" }, { name: "Vamshalochana", quantity: "8 parts", role: "Chief" }, { name: "Pippali", quantity: "4 parts", role: "Chief" }, { name: "Ela", quantity: "2 parts", role: "Adjuvant" }, { name: "Twak", quantity: "1 part", role: "Adjuvant" }],
    contraindications: "Diabetes (sugar base)", duration: "2-3 weeks", precautions: "Use Talisadi for diabetics",
    pediatric: "1-3 g with honey",
    manufacturers: [
      { manufacturer: "Kottakkal", pack: "50 g", mrp: 90, gmp: true, available: true },
      { manufacturer: "SNA", pack: "50 g", mrp: 80, gmp: true, available: true },
      { manufacturer: "Dabur", pack: "60 g", mrp: 70, gmp: true, available: true },
    ],
    related: ["vasavaleha"], alternatives: ["talisadi-churna"],
    astg: { disease: "Kasa (Cough)", chapter: "Respiratory", level: 1 },
  },
  {
    id: "vasavaleha", name: "Vasavaleha", sanskrit: "वासावलेह", type: "Lehyam",
    indications: ["Bronchial asthma", "Cough", "TB"],
    dose: "6-12 g BD", anupana: "Warm milk", reference: "Bhaishajya Ratnavali, Rajayakshma",
    ingredients: [{ name: "Vasa", quantity: "Chief", role: "Chief" }, { name: "Sharkara", quantity: "Vehicle", role: "Vehicle" }, { name: "Madhu", quantity: "Adjuvant", role: "Adjuvant" }],
    contraindications: "Diabetes", duration: "4-8 weeks", precautions: "Avoid cold foods",
    manufacturers: [
      { manufacturer: "Kottakkal", pack: "200 g", mrp: 260, gmp: true, available: true },
      { manufacturer: "SNA", pack: "200 g", mrp: 230, gmp: true, available: true },
      { manufacturer: "Vaidyaratnam", pack: "200 g", mrp: 245, gmp: true, available: true },
    ],
    related: ["sitopaladi-churna"], alternatives: ["chyawanprash"],
  },
  {
    id: "drakshasava", name: "Drakshasava", sanskrit: "द्राक्षासव", type: "Arishta",
    indications: ["Fever", "Anaemia", "Cardiac weakness"],
    dose: "20 ml BD", anupana: "Equal water after food", reference: "Sahasrayogam, Asava Prakarana",
    ingredients: [{ name: "Draksha", quantity: "Chief", role: "Chief" }, { name: "Madhuka pushpa", quantity: "Adjuvant", role: "Adjuvant" }],
    contraindications: "Children under 12, alcoholism", duration: "4-6 weeks", precautions: "Self-generated alcohol present",
    manufacturers: [
      { manufacturer: "Kottakkal", pack: "450 ml", mrp: 180, gmp: true, available: true },
      { manufacturer: "SNA", pack: "450 ml", mrp: 160, gmp: true, available: true },
      { manufacturer: "Baidyanath", pack: "450 ml", mrp: 140, gmp: true, available: true },
      { manufacturer: "Dabur", pack: "450 ml", mrp: 150, gmp: true, available: true },
    ],
    related: ["dashamula-kwatha"], alternatives: ["lohasava"],
  },
  {
    id: "brahmi-ghrita", name: "Brahmi Ghrita", sanskrit: "ब्राह्मी घृत", type: "Ghritam",
    indications: ["Epilepsy", "Memory", "Mental disorders"],
    dose: "10-20 g BD", anupana: "Warm milk", reference: "Charaka Samhita, Chikitsa 10",
    ingredients: [{ name: "Brahmi", quantity: "Chief", role: "Chief" }, { name: "Goghrita", quantity: "Base", role: "Base" }, { name: "Vacha", quantity: "Adjuvant", role: "Adjuvant" }],
    contraindications: "Obesity, hyperlipidaemia", duration: "8-12 weeks", precautions: "Take before food",
    manufacturers: [
      { manufacturer: "Kottakkal", pack: "150 ml", mrp: 420, gmp: true, available: true },
      { manufacturer: "SNA", pack: "150 ml", mrp: 380, gmp: true, available: true },
      { manufacturer: "Vaidyaratnam", pack: "150 ml", mrp: 400, gmp: true, available: true },
    ],
    related: ["ashwagandha-churna"], alternatives: ["saraswatarishta"],
  },
  {
    id: "ashwagandha-churna", name: "Ashwagandha Churna", sanskrit: "अश्वगन्धा चूर्ण", type: "Churna",
    indications: ["Debility", "Vata disorders", "Rasayana", "Insomnia"],
    dose: "3-6 g BD", anupana: "Warm milk + honey", reference: "Bhavaprakasha Nighantu",
    ingredients: [{ name: "Ashwagandha root", quantity: "100%", role: "Chief" }],
    contraindications: "Hyperthyroidism, pregnancy (high dose)", duration: "8-12 weeks", precautions: "Standardised root preferred",
    manufacturers: [
      { manufacturer: "Kottakkal", pack: "100 g", mrp: 180, gmp: true, available: true },
      { manufacturer: "SNA", pack: "100 g", mrp: 160, gmp: true, available: true },
      { manufacturer: "Himalaya", pack: "60 tab", mrp: 220, gmp: true, available: true },
      { manufacturer: "Dabur", pack: "100 g", mrp: 150, gmp: true, available: true },
    ],
    related: ["brahmi-ghrita"], alternatives: ["chyawanprash"],
  },
  {
    id: "mahatiktaka-ghrita", name: "Mahatiktaka Ghrita", sanskrit: "महातिक्तक घृत", type: "Ghritam",
    indications: ["Skin diseases", "Blood disorders", "Chronic eczema"],
    dose: "10-20 g BD", anupana: "Warm water", reference: "Ashtanga Hridaya, Chikitsa 19",
    ingredients: [{ name: "Tikta dravyas", quantity: "Chief", role: "Chief" }, { name: "Goghrita", quantity: "Base", role: "Base" }],
    contraindications: "Pregnancy", duration: "4-8 weeks", precautions: "Snehapana protocol",
    manufacturers: [
      { manufacturer: "Kottakkal", pack: "150 ml", mrp: 460, gmp: true, available: true },
      { manufacturer: "SNA", pack: "150 ml", mrp: 410, gmp: true, available: true },
      { manufacturer: "Vaidyaratnam", pack: "150 ml", mrp: 440, gmp: true, available: true },
    ],
    related: ["arogyavardhini-vati"], alternatives: ["panchatikta-ghrita-guggulu"],
  },
  {
    id: "anu-taila", name: "Anu Taila", sanskrit: "अणु तैलम्", type: "Tailam",
    indications: ["Nasal disorders", "Headache", "Nasya"],
    dose: "2-4 drops each nostril", anupana: "—", reference: "Ashtanga Hridaya, Sutra 20",
    ingredients: [{ name: "Tila taila", quantity: "Base", role: "Base" }, { name: "36 herbs", quantity: "Adjuvant", role: "Adjuvant" }],
    contraindications: "Acute cold, fever", duration: "7-14 days morning", precautions: "Nasya only",
    manufacturers: [
      { manufacturer: "Kottakkal", pack: "10 ml", mrp: 90, gmp: true, available: true },
      { manufacturer: "SNA", pack: "10 ml", mrp: 80, gmp: true, available: true },
      { manufacturer: "Vaidyaratnam", pack: "10 ml", mrp: 85, gmp: true, available: true },
    ],
    related: ["ksheerabala-taila"], alternatives: ["shadbindu-taila"],
  },
  {
    id: "ksheerabala-taila", name: "Ksheerabala Taila", sanskrit: "क्षीरबला तैलम्", type: "Tailam",
    indications: ["Vata disorders", "Neurological", "Insomnia"],
    dose: "External / Nasya", anupana: "—", reference: "Ashtanga Hridaya, Chikitsa 21",
    ingredients: [{ name: "Bala", quantity: "Chief", role: "Chief" }, { name: "Cow milk", quantity: "Adjuvant", role: "Adjuvant" }, { name: "Tila taila", quantity: "Base", role: "Base" }],
    contraindications: "Open wounds", duration: "21 days", precautions: "Warm before use",
    manufacturers: [
      { manufacturer: "Kottakkal", pack: "200 ml", mrp: 340, gmp: true, available: true },
      { manufacturer: "SNA", pack: "200 ml", mrp: 310, gmp: true, available: true },
      { manufacturer: "Vaidyaratnam", pack: "200 ml", mrp: 320, gmp: true, available: true },
    ],
    related: ["anu-taila", "sahacharadi-taila"], alternatives: ["dhanwantharam-taila"],
  },
  {
    id: "arogyavardhini-vati", name: "Arogyavardhini Vati", sanskrit: "आरोग्यवर्धिनी वटी", type: "Vati",
    indications: ["Liver disorders", "Obesity", "Metabolic syndrome", "Skin diseases"],
    dose: "2 tab BD", anupana: "Warm water", reference: "Rasaratna Samuchaya 20/87-90",
    ingredients: [{ name: "Parada", quantity: "1 part", role: "Mineral" }, { name: "Gandhaka", quantity: "1 part", role: "Mineral" }, { name: "Loha bhasma", quantity: "1 part", role: "Mineral" }, { name: "Triphala", quantity: "1 part", role: "Adjuvant" }, { name: "Katuki", quantity: "1 part", role: "Chief" }],
    contraindications: "Pregnancy, children, severe hepatic failure", duration: "4-6 weeks", precautions: "Use only certified Bhasma",
    manufacturers: [
      { manufacturer: "Kottakkal", pack: "100 tab", mrp: 240, gmp: true, available: true },
      { manufacturer: "SNA", pack: "100 tab", mrp: 215, gmp: true, available: true },
      { manufacturer: "Baidyanath", pack: "100 tab", mrp: 190, gmp: true, available: true },
      { manufacturer: "Dabur", pack: "100 tab", mrp: 180, gmp: true, available: false },
    ],
    related: ["mahatiktaka-ghrita"], alternatives: ["panchatikta-ghrita-guggulu"],
    astg: { disease: "Yakrit Vikara (Hepatic disorders)", chapter: "Hepato-biliary", level: 2 },
  },
];

const TYPE_TABS: Array<{ key: string; label: string }> = [
  { key: "all", label: "All" },
  { key: "Kashayam", label: "Kashayam" },
  { key: "Churna", label: "Churnam" },
  { key: "Arishta", label: "Arishta/Asava" },
  { key: "Tailam", label: "Tailam" },
  { key: "Ghritam", label: "Ghritam" },
  { key: "Vati", label: "Vati/Gutika" },
  { key: "Lehyam", label: "Lehyam" },
  { key: "Bhasma", label: "Bhasma" },
  { key: "Rasayana", label: "Rasayana" },
];

const BOOKMARK_KEY = "ayuzee.formulary.bookmarks";
const loadBookmarks = (): string[] => {
  try { return JSON.parse(localStorage.getItem(BOOKMARK_KEY) || "[]"); } catch { return []; }
};

export default function ClassicalFormulary() {
  const [type, setType] = useState("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"az" | "category" | "used">("az");
  const [bookmarks, setBookmarks] = useState<string[]>(loadBookmarks);
  const [selected, setSelected] = useState<Formula | null>(null);
  const [prescribeOpen, setPrescribeOpen] = useState(false);

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(BOOKMARK_KEY, JSON.stringify(next));
      toast.success(prev.includes(id) ? "Bookmark removed" : "Saved to bookmarks");
      return next;
    });
  };

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = SEED.filter((f) => (type === "all" || f.type === type));
    if (term) {
      list = list.filter((f) =>
        f.name.toLowerCase().includes(term) ||
        (f.sanskrit || "").toLowerCase().includes(term) ||
        f.indications.some((i) => i.toLowerCase().includes(term)) ||
        f.ingredients.some((i) => i.name.toLowerCase().includes(term))
      );
    }
    if (sort === "az") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "category") list = [...list].sort((a, b) => a.type.localeCompare(b.type));
    if (sort === "used") list = [...list].sort((a, b) => b.manufacturers.length - a.manufacturers.length);
    return list;
  }, [type, q, sort]);

  const lookup = (id: string) => SEED.find((f) => f.id === id);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Classical Ayurvedic Formulary</h1>
          <p className="text-muted-foreground text-sm mt-1">2000+ formulations · All manufacturers · Manufacturer-neutral reference</p>
        </div>
        <Button asChild variant="outline"><Link to="/doctor/formulary/ingredients">📖 Ingredient Encyclopedia</Link></Button>
      </header>

      {/* Formulation type tabs */}
      <div className="mb-4 -mx-2 px-2 overflow-x-auto">
        <div className="flex gap-2 min-w-max pb-2">
          {TYPE_TABS.map((t) => (
            <Button key={t.key} size="sm" variant={type === t.key ? "default" : "outline"} onClick={() => setType(t.key)}>
              {t.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Search + sort */}
      <div className="flex flex-col md:flex-row gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by formula, indication, or ingredient…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
          <SelectTrigger className="w-full md:w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="az"><ArrowDownAZ className="h-4 w-4 inline mr-2" />A–Z</SelectItem>
            <SelectItem value="category"><Activity className="h-4 w-4 inline mr-2" />By disease category</SelectItem>
            <SelectItem value="used"><TrendingUp className="h-4 w-4 inline mr-2" />Most used</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((f) => {
          const lowest = Math.min(...f.manufacturers.filter((m) => m.available).map((m) => m.mrp));
          const isBM = bookmarks.includes(f.id);
          return (
            <Card key={f.id} className="hover:shadow-md transition cursor-pointer" onClick={() => setSelected(f)}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold leading-tight">{f.name}</div>
                    {f.sanskrit && <div className="text-sm text-muted-foreground">{f.sanskrit}</div>}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); toggleBookmark(f.id); }} aria-label="Bookmark">
                    {isBM ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5 text-muted-foreground" />}
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <Badge variant="outline" className={TYPE_COLORS[f.type] || ""}>{f.type}</Badge>
                  {f.indications.slice(0, 3).map((i) => <Badge key={i} variant="secondary" className="font-normal">{i}</Badge>)}
                  {f.indications.length > 3 && <Badge variant="outline">+{f.indications.length - 3} more</Badge>}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">Dose</div>
                    <div className="font-medium">{f.dose} / {f.anupana}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">From</div>
                    <div className="font-medium">₹{lowest} · {f.manufacturers.length} mfr</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">No formulas match your filters.</div>
        )}
      </div>

      {/* Detail drawer */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="text-2xl">{selected.name}</SheetTitle>
                <SheetDescription className="text-base">
                  {selected.sanskrit} ·{" "}
                  <Badge variant="outline" className={TYPE_COLORS[selected.type]}>{selected.type}</Badge>
                </SheetDescription>
                <div className="flex flex-wrap gap-2 pt-3">
                  <Button size="sm" onClick={() => setPrescribeOpen(true)}>
                    <FileSignature className="h-4 w-4 mr-2" /> Prescribe
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    const mfr = selected.manufacturers.find((m) => m.available) || selected.manufacturers[0];
                    trayStore.add({
                      formula_id: selected.id, name: selected.name, sanskrit: selected.sanskrit, type: selected.type,
                      dose: selected.dose, frequency: "BD", duration: selected.duration || "4 weeks", anupana: selected.anupana,
                      manufacturer: mfr?.manufacturer, manufacturer_pack: mfr?.pack, manufacturer_mrp: mfr?.mrp,
                    });
                    toast.success("Added to prescription tray");
                  }}>
                    <Plus className="h-4 w-4 mr-2" /> Add to tray
                  </Button>
                </div>
              </SheetHeader>

              <Tabs defaultValue="composition" className="mt-6">
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="composition">Composition</TabsTrigger>
                  <TabsTrigger value="clinical">Clinical Use</TabsTrigger>
                  <TabsTrigger value="available">Available From</TabsTrigger>
                  <TabsTrigger value="related">Related</TabsTrigger>
                  <TabsTrigger value="astg">ASTG</TabsTrigger>
                </TabsList>

                {/* Composition */}
                <TabsContent value="composition" className="mt-4 space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow><TableHead>Ingredient</TableHead><TableHead>Quantity</TableHead><TableHead>Role</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                      {selected.ingredients.map((i, idx) => (
                        <TableRow key={idx} className={idx % 2 ? "bg-muted/30" : ""}>
                          <TableCell className="font-medium">{i.name}</TableCell>
                          <TableCell>{i.quantity}</TableCell>
                          <TableCell><Badge variant="outline">{i.role}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="text-sm">
                    <div className="text-muted-foreground">Classical Reference</div>
                    <div className="font-medium italic">{selected.reference}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">Total ingredients: {selected.ingredients.length}</div>
                </TabsContent>

                {/* Clinical */}
                <TabsContent value="clinical" className="mt-4 space-y-4 text-sm">
                  <div>
                    <div className="font-semibold mb-1">Indications</div>
                    <div className="flex flex-wrap gap-1.5">{selected.indications.map((i) => <Badge key={i} variant="secondary">{i}</Badge>)}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><div className="text-muted-foreground">Adult dose</div><div className="font-medium">{selected.dose}</div></div>
                    <div><div className="text-muted-foreground">Pediatric</div><div className="font-medium">{selected.pediatric || "Use Clark's rule"}</div></div>
                    <div><div className="text-muted-foreground">Anupana</div><div className="font-medium">{selected.anupana}</div></div>
                    <div><div className="text-muted-foreground">Duration</div><div className="font-medium">{selected.duration}</div></div>
                  </div>
                  <div>
                    <div className="font-semibold text-destructive mb-1">Contraindications</div>
                    <p>{selected.contraindications}</p>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Special precautions</div>
                    <p>{selected.precautions}</p>
                  </div>
                </TabsContent>

                {/* Available From */}
                <TabsContent value="available" className="mt-4">
                  {(() => {
                    const lowest = Math.min(...selected.manufacturers.filter((m) => m.available).map((m) => m.mrp));
                    return (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Manufacturer</TableHead>
                            <TableHead>Pack</TableHead>
                            <TableHead>MRP</TableHead>
                            <TableHead>GMP</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selected.manufacturers.map((m, idx) => (
                            <TableRow key={idx} className={idx % 2 ? "bg-muted/30" : ""}>
                              <TableCell className="font-medium">{m.manufacturer}</TableCell>
                              <TableCell>{m.pack}</TableCell>
                              <TableCell className={m.mrp === lowest && m.available ? "font-bold text-green-700" : ""}>
                                ₹{m.mrp}{m.mrp === lowest && m.available && " · Lowest"}
                              </TableCell>
                              <TableCell>{m.gmp && <BadgeCheck className="h-4 w-4 text-green-600" />}</TableCell>
                              <TableCell>{m.available ? <Badge className="bg-green-100 text-green-800 border-green-200" variant="outline">In stock</Badge> : <Badge variant="outline">Out</Badge>}</TableCell>
                              <TableCell>
                                <Button size="sm" disabled={!m.available} onClick={() => toast.success("Order flow coming soon")}>
                                  <ShoppingCart className="h-3 w-3 mr-1" /> Order
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    );
                  })()}
                </TabsContent>

                {/* Related */}
                <TabsContent value="related" className="mt-4 space-y-4 text-sm">
                  <div>
                    <div className="font-semibold mb-2">Doctors also use with this</div>
                    <div className="flex flex-wrap gap-2">
                      {selected.related.map((rid) => {
                        const r = lookup(rid);
                        return r ? (
                          <Button key={rid} variant="outline" size="sm" onClick={() => setSelected(r)}>{r.name}</Button>
                        ) : <Badge key={rid} variant="outline">{rid}</Badge>;
                      })}
                      {selected.related.length === 0 && <span className="text-muted-foreground">None listed</span>}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold mb-2">Used for same indication</div>
                    <div className="flex flex-wrap gap-2">
                      {selected.alternatives.map((rid) => {
                        const r = lookup(rid);
                        return r ? (
                          <Button key={rid} variant="outline" size="sm" onClick={() => setSelected(r)}>{r.name}</Button>
                        ) : <Badge key={rid} variant="outline">{rid}</Badge>;
                      })}
                      {selected.alternatives.length === 0 && <span className="text-muted-foreground">None listed</span>}
                    </div>
                  </div>
                </TabsContent>

                {/* ASTG */}
                <TabsContent value="astg" className="mt-4 text-sm">
                  {selected.astg ? (
                    <div className="space-y-3">
                      <div><div className="text-muted-foreground">Disease</div><div className="font-medium">{selected.astg.disease}</div></div>
                      <div><div className="text-muted-foreground">Chapter</div><div className="font-medium">{selected.astg.chapter}</div></div>
                      <div><div className="text-muted-foreground">Level</div><Badge>Level {selected.astg.level}</Badge></div>
                      <Button asChild size="sm" variant="outline">
                        <Link to="/doctor/astg-reference"><ExternalLink className="h-3 w-3 mr-1" /> View full ASTG Protocol</Link>
                      </Button>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">This formula is not currently mapped to an ASTG protocol.</p>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
