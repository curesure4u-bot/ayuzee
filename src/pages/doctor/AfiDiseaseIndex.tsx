import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Search } from "lucide-react";

const POPULAR = [
  ["Arsha", "Piles"], ["Jwara", "Fever"], ["Prameha", "Diabetes"], ["Kasa", "Cough"],
  ["Shwasa", "Asthma"], ["Amavata", "Rheumatoid Arthritis"], ["Pandu", "Anaemia"], ["Kamala", "Jaundice"],
  ["Atisara", "Diarrhoea"], ["Kustha", "Skin Disease"], ["Vata Vyadhi", "Neurological"], ["Mutra Roga", "Urinary"],
  ["Stri Roga", "Gynaecology"], ["Bala Roga", "Paediatric"], ["Hridroga", "Cardiac"], ["Netra Roga", "Eye"],
];

interface Row {
  disease_name: string; disease_modern: string | null;
  formulation_id: string | null; formulation_name: string | null;
}

export default function AfiDiseaseIndex() {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [openDisease, setOpenDisease] = useState<string | null>(null);

  useEffect(() => { document.title = "Disease-wise Formula Index — AFI"; fetchAll(""); }, []);

  const fetchAll = async (q: string) => {
    let query = supabase.from("afi_disease_formulation_map")
      .select("disease_name,disease_modern,formulation_id,formulation_name")
      .order("disease_name").limit(500);
    if (q.trim()) query = query.or(`disease_name.ilike.%${q}%,disease_modern.ilike.%${q}%`);
    const { data } = await query;
    setRows((data as Row[]) || []);
  };

  // Group by disease
  const grouped: Record<string, Row[]> = {};
  rows.forEach(r => { (grouped[r.disease_name] ||= []).push(r); });

  return (
    <div className="container mx-auto px-4 py-6 space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Disease-wise Formula Index</h1>
        <p className="text-sm text-muted-foreground">AFI Therapeutic Index · Find classical formulas by condition</p>
      </div>

      <div className="flex gap-2 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by disease or condition..." className="pl-9" value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchAll(search)} />
        </div>
        <Button onClick={() => fetchAll(search)}>Search</Button>
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-2 text-muted-foreground">Popular Conditions</h2>
        <div className="flex flex-wrap gap-2">
          {POPULAR.map(([s, m]) => (
            <Button key={s} size="sm" variant="outline" onClick={() => { setSearch(s); fetchAll(s); }}>
              {s} <span className="text-muted-foreground ml-1">({m})</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {Object.keys(grouped).length === 0 ? (
          <Card><CardContent className="p-6 text-center text-muted-foreground">
            No disease mappings yet. Admins can seed these from AFI Part I & II appendices.
          </CardContent></Card>
        ) : Object.entries(grouped).map(([disease, items]) => (
          <Card key={disease}>
            <CardContent className="p-0">
              <button
                className="w-full p-4 flex justify-between items-center hover:bg-muted/50"
                onClick={() => setOpenDisease(openDisease === disease ? null : disease)}
              >
                <div className="text-left">
                  <div className="font-semibold">{disease}</div>
                  {items[0]?.disease_modern && <div className="text-xs text-muted-foreground">{items[0].disease_modern}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{items.length} formulas</Badge>
                  {openDisease === disease ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>
              </button>
              {openDisease === disease && (
                <div className="border-t divide-y">
                  {items.map((it, i) => (
                    <Link key={i} to={`/doctor/afi-formulary/${it.formulation_id}`}
                      className="flex justify-between p-3 hover:bg-muted/30">
                      <span className="font-medium">{it.formulation_name}</span>
                      <span className="text-xs text-primary">View →</span>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
