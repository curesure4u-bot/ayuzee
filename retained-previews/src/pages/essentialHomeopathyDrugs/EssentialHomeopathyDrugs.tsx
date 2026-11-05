import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

const KINGDOMS = ["All", "Plant", "Mineral", "Animal", "Nosode", "Biochemic"];

const EssentialHomeopathyDrugs = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [kingdom, setKingdom] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (supabase as any)
      .from("essential_homeopathy_drugs")
      .select("id, serial_no, name, slug, kingdom, available_potencies, available_forms, indications")
      .order("serial_no")
      .then(({ data }: any) => { setRows(data || []); setLoading(false); });
  }, []);

  const filtered = rows.filter((r) =>
    (kingdom === "All" || r.kingdom === kingdom) &&
    (q === "" || r.name?.toLowerCase().includes(q.toLowerCase()) ||
      r.indications?.some((i: string) => i.toLowerCase().includes(q.toLowerCase())))
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteNav appLevel />
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <h1 className="text-3xl md:text-4xl font-bold">💧 Essential Homeopathy Drugs</h1>
        <p className="text-muted-foreground mt-2">
          200 official remedies with potency guidance · Plant · Mineral · Animal · Nosode · Biochemic
        </p>

        <div className="flex flex-col md:flex-row gap-3 mt-6 mb-6">
          <Input value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search by remedy or indication (e.g. Arnica, fever, anxiety)..." className="flex-1" />
          <div className="flex flex-wrap gap-2">
            {KINGDOMS.map((k) => (
              <button key={k} onClick={() => setKingdom(k)}
                className={`px-3 py-2 rounded-full text-sm border transition-all ${
                  kingdom === k ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/40"
                }`}>{k}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-muted-foreground py-12 text-center">Loading…</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((r) => (
              <Link key={r.id} to={`/essential-homeopathy-drugs/${r.slug}`}
                className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold">{r.serial_no}. {r.name}</h3>
                  <Badge variant="outline" className="text-[10px] shrink-0">{r.kingdom}</Badge>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {r.available_potencies?.map((p: string) => (
                    <span key={p} className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-mono">{p}</span>
                  ))}
                </div>
                {r.indications?.slice(0, 3).map((i: string, idx: number) => (
                  <p key={idx} className="text-xs text-muted-foreground">• {i}</p>
                ))}
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};
export default EssentialHomeopathyDrugs;
