import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const MateriaMedica = () => {
  const [remedies, setRemedies] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (supabase as any)
      .from("homeopathy_remedies")
      .select("id, name, abbreviation, common_name, kingdom, thermal_state, miasm, keynotes, clinical_indications")
      .order("name")
      .limit(50)
      .then(({ data }: any) => {
        setRemedies(data || []);
        setLoading(false);
      });
  }, []);

  const kingdoms = ["All", "Mineral", "Plant", "Animal", "Nosode"];
  const filtered = remedies.filter(
    (r) =>
      (filter === "All" || r.kingdom === filter) &&
      (query === "" ||
        r.name?.toLowerCase().includes(query.toLowerCase()) ||
        r.abbreviation?.toLowerCase().includes(query.toLowerCase()) ||
        r.clinical_indications?.some((c: string) => c.toLowerCase().includes(query.toLowerCase())))
  );

  const kingdomColor: Record<string, string> = {
    Mineral: "bg-gray-100 text-gray-700",
    Plant: "bg-green-100 text-green-700",
    Animal: "bg-amber-100 text-amber-700",
    Nosode: "bg-purple-100 text-purple-700",
  };
  const thermalColor: Record<string, string> = {
    Chilly: "bg-blue-100 text-blue-700",
    Hot: "bg-red-100 text-red-700",
    Variable: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav appLevel={true} />

      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">📚 Materia Medica Library</h1>
          <p className="text-muted-foreground mt-2">
            3,500+ remedy profiles from Boericke, Kent, Clarke — public domain data
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by remedy name, abbreviation, or condition (e.g. Arsenic, Ars, anxiety)..."
            className="flex-1"
          />
          <div className="flex flex-wrap gap-2">
            {kingdoms.map((k) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`px-4 py-2 rounded-full text-sm border transition-all ${
                  filter === k
                    ? "bg-purple-700 text-white border-purple-700"
                    : "border-border hover:border-purple-400"
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block h-8 w-8 border-4 border-purple-200 border-t-purple-700 rounded-full animate-spin" />
            <p className="mt-3 text-muted-foreground">Loading remedy database...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-2xl">
            <div className="text-5xl">📚</div>
            <p className="mt-4 font-medium">No remedies found{query ? ` for "${query}"` : ""}</p>
            <p className="mt-2 text-sm text-muted-foreground">Run the Homeopathy SQL setup prompt to load the remedy database.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((remedy: any) => (
              <Link
                to={`/homeopathy/materia-medica/${remedy.abbreviation}`}
                key={remedy.id}
                className="bg-white border border-border rounded-2xl p-5 hover:shadow-md hover:border-purple-300 transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{remedy.name}</h3>
                    <p className="text-xs text-purple-700 font-semibold">{remedy.abbreviation}</p>
                    {remedy.common_name && <p className="text-xs text-muted-foreground italic mt-0.5">{remedy.common_name}</p>}
                  </div>
                  <div className="flex flex-col gap-1 items-end shrink-0">
                    {remedy.kingdom && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${kingdomColor[remedy.kingdom] || "bg-gray-100 text-gray-700"}`}>
                        {remedy.kingdom}
                      </span>
                    )}
                    {remedy.thermal_state && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${thermalColor[remedy.thermal_state] || "bg-gray-100 text-gray-700"}`}>
                        {remedy.thermal_state}
                      </span>
                    )}
                  </div>
                </div>
                {remedy.keynotes?.slice(0, 2).map((k: string, i: number) => (
                  <p key={i} className="text-xs text-muted-foreground mt-1">• {k}</p>
                ))}
                {remedy.clinical_indications?.slice(0, 3).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {remedy.clinical_indications.slice(0, 3).map((c: string, i: number) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">{c}</span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};
export default MateriaMedica;
