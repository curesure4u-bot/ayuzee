import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Leaf, Plus, Search } from "lucide-react";

type Herb = {
  sanskrit: string; botanical: string; partUsed: string;
  rasa: string; guna: string; virya: string; vipaka: string;
  karma: string[]; dosage: string; reference: string;
};

const herbs: Herb[] = [
  { sanskrit: "Guduchi", botanical: "Tinospora cordifolia", partUsed: "Stem", rasa: "Tikta, Kashaya", guna: "Laghu, Snigdha", virya: "Ushna", vipaka: "Madhura", karma: ["Rasayana", "Pitta Shamaka", "Deepana", "Jwaraghna"], dosage: "3-6g powder / 20-40ml Swarasa", reference: "Bhavaprakasha Nighantu - Guduchyadi Varga" },
  { sanskrit: "Ashwagandha", botanical: "Withania somnifera", partUsed: "Root", rasa: "Tikta, Kashaya", guna: "Laghu, Snigdha", virya: "Ushna", vipaka: "Madhura", karma: ["Rasayana", "Balya", "Vata Shamaka", "Nidrajanana"], dosage: "3-6g powder with milk", reference: "Charaka Samhita - Balya Mahakashaya" },
  { sanskrit: "Brahmi", botanical: "Bacopa monnieri", partUsed: "Whole plant", rasa: "Tikta, Kashaya", guna: "Laghu", virya: "Sheeta", vipaka: "Madhura", karma: ["Medhya", "Pitta Shamaka", "Rasayana", "Anxiolytic"], dosage: "2-4g powder / 10-20ml juice", reference: "Charaka Samhita - Medhya Rasayana" },
  { sanskrit: "Haritaki", botanical: "Terminalia chebula", partUsed: "Fruit", rasa: "Pancharasa (except Lavana)", guna: "Laghu, Ruksha", virya: "Ushna", vipaka: "Madhura", karma: ["Tridosha Shamaka", "Rasayana", "Anulomana", "Deepana"], dosage: "3-6g powder", reference: "Ashtanga Hridaya - Haritakyadi Varga" },
  { sanskrit: "Amalaki", botanical: "Emblica officinalis", partUsed: "Fruit", rasa: "Pancharasa (Amla dominant)", guna: "Laghu, Ruksha", virya: "Sheeta", vipaka: "Madhura", karma: ["Rasayana", "Pitta Shamaka", "Chakshushya", "Vayasthapana"], dosage: "3-6g powder / 10-20ml juice", reference: "Charaka Samhita - Vayasthapana" },
  { sanskrit: "Guggulu", botanical: "Commiphora mukul", partUsed: "Gum resin", rasa: "Tikta, Katu", guna: "Laghu, Ruksha, Tikshna", virya: "Ushna", vipaka: "Katu", karma: ["Vata-Kapha Shamaka", "Medohara", "Shothaghna", "Vedanasthapana"], dosage: "2-4g purified guggulu", reference: "Sushruta Samhita - Shodhana Gana" },
  { sanskrit: "Shatavari", botanical: "Asparagus racemosus", partUsed: "Root", rasa: "Madhura, Tikta", guna: "Guru, Snigdha", virya: "Sheeta", vipaka: "Madhura", karma: ["Pitta Shamaka", "Rasayana", "Stanyajanana", "Balya"], dosage: "3-6g powder with milk", reference: "Charaka Samhita - Balya Mahakashaya" },
  { sanskrit: "Pippali", botanical: "Piper longum", partUsed: "Fruit", rasa: "Katu", guna: "Laghu, Snigdha, Tikshna", virya: "Anushna (not very hot)", vipaka: "Madhura", karma: ["Deepana", "Pachana", "Rasayana", "Kapha-Vata Shamaka"], dosage: "1-3g powder", reference: "Charaka Samhita - Kasa Chikitsa" },
  { sanskrit: "Yashtimadhu", botanical: "Glycyrrhiza glabra", partUsed: "Root", rasa: "Madhura", guna: "Guru, Snigdha", virya: "Sheeta", vipaka: "Madhura", karma: ["Pitta Shamaka", "Chakshushya", "Kantya", "Mutrala"], dosage: "3-6g powder / 50ml Kwatha", reference: "Charaka Samhita - Sandhaniya Gana" },
  { sanskrit: "Nimba", botanical: "Azadirachta indica", partUsed: "Bark, Leaf", rasa: "Tikta, Kashaya", guna: "Laghu, Ruksha", virya: "Sheeta", vipaka: "Katu", karma: ["Pitta-Kapha Shamaka", "Krimighna", "Kushthaghna", "Raktashodhaka"], dosage: "Bark: 3-6g / Leaf juice: 10-20ml", reference: "Bhavaprakasha - Vatadi Varga" },
  { sanskrit: "Kutaja", botanical: "Holarrhena antidysenterica", partUsed: "Bark, Seed", rasa: "Tikta, Kashaya", guna: "Laghu, Ruksha", virya: "Sheeta", vipaka: "Katu", karma: ["Pitta-Kapha Shamaka", "Grahi", "Atisarahar", "Krimighna"], dosage: "3-6g bark powder", reference: "Charaka Samhita - Atisara Chikitsa" },
  { sanskrit: "Bala", botanical: "Sida cordifolia", partUsed: "Root", rasa: "Madhura", guna: "Laghu, Snigdha, Picchila", virya: "Sheeta", vipaka: "Madhura", karma: ["Vata Shamaka", "Balya", "Brimhana", "Ojovardhaka"], dosage: "3-6g powder / Taila externally", reference: "Charaka Samhita - Balya Mahakashaya" },
];

const rasaOptions = ["Madhura", "Amla", "Lavana", "Katu", "Tikta", "Kashaya"];
const viryaOptions = ["Ushna", "Sheeta"];
const karmaOptions = ["Pitta Shamaka", "Vata Shamaka", "Kapha Shamaka", "Deepana", "Pachana", "Rasayana", "Medhya", "Balya"];

const DravyaGunaSearch = () => {
  const [search, setSearch] = useState("");
  const [rasaFilter, setRasaFilter] = useState("");
  const [viryaFilter, setViryaFilter] = useState("");
  const [karmaFilter, setKarmaFilter] = useState("");

  const filtered = herbs.filter(h => {
    const matchSearch = !search || h.sanskrit.toLowerCase().includes(search.toLowerCase()) || h.botanical.toLowerCase().includes(search.toLowerCase());
    const matchRasa = !rasaFilter || h.rasa.includes(rasaFilter);
    const matchVirya = !viryaFilter || h.virya.includes(viryaFilter);
    const matchKarma = !karmaFilter || h.karma.some(k => k.includes(karmaFilter));
    return matchSearch && matchRasa && matchVirya && matchKarma;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Leaf className="h-6 w-6 text-primary" /> Dravya-Guna Search
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Smart herb search by Rasa, Guna, Virya, Vipaka & Karma</p>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="grid sm:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search herb..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
            </div>
            <Select value={rasaFilter} onValueChange={setRasaFilter}>
              <SelectTrigger><SelectValue placeholder="Rasa (Taste)" /></SelectTrigger>
              <SelectContent>{rasaOptions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={viryaFilter} onValueChange={setViryaFilter}>
              <SelectTrigger><SelectValue placeholder="Virya (Potency)" /></SelectTrigger>
              <SelectContent>{viryaOptions.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={karmaFilter} onValueChange={setKarmaFilter}>
              <SelectTrigger><SelectValue placeholder="Karma (Action)" /></SelectTrigger>
              <SelectContent>{karmaOptions.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {(rasaFilter || viryaFilter || karmaFilter) && (
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setRasaFilter(""); setViryaFilter(""); setKarmaFilter(""); }}>Clear filters</Button>
          )}
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">{filtered.length} herbs found</p>

      <div className="space-y-3">
        {filtered.map((h, i) => (
          <Card key={i}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{h.sanskrit} <span className="text-muted-foreground font-normal text-sm">({h.botanical})</span></h3>
                  <p className="text-xs text-muted-foreground">Part used: {h.partUsed}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => toast.success(`${h.sanskrit} added to prescription`)}><Plus className="h-3 w-3 mr-1" /> Add to Rx</Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs">
                <div><span className="font-medium">Rasa:</span> {h.rasa}</div>
                <div><span className="font-medium">Guna:</span> {h.guna}</div>
                <div><span className="font-medium">Virya:</span> {h.virya}</div>
                <div><span className="font-medium">Vipaka:</span> {h.vipaka}</div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {h.karma.map((k, j) => <Badge key={j} variant="secondary" className="text-[10px]">{k}</Badge>)}
              </div>
              <p className="text-xs mt-2"><span className="font-medium">Dosage:</span> {h.dosage}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Ref: {h.reference}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DravyaGunaSearch;
