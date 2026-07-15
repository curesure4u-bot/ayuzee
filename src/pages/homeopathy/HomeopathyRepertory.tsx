import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const HomeopathyRepertory = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    const { data } = await (supabase as any)
      .from("homeopathy_rubrics")
      .select("id, chapter, rubric, full_path, remedies, total_remedies")
      .textSearch("rubric", query, { type: "websearch" })
      .limit(20);
    setResults(data || []);
    setLoading(false);
  };

  const chapterColors: Record<string, string> = {
    MIND: "bg-purple-100 text-purple-700",
    HEAD: "bg-blue-100 text-blue-700",
    STOMACH: "bg-amber-100 text-amber-700",
    SKIN: "bg-green-100 text-green-700",
    GENERALS: "bg-teal-100 text-teal-700",
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav appLevel={true} />

      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">🔍 Kent Repertory Search</h1>
          <p className="text-muted-foreground mt-2">
            Search 68,000+ rubrics from Kent, Boericke and Boenninghausen repertories
          </p>
        </div>

        <div className="flex gap-2 mb-4">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="e.g. FEAR, darkness | MIND, anxiety | STOMACH, hunger 11 AM"
            className="text-base py-6"
          />
          <Button onClick={search} disabled={loading} className="bg-purple-700 hover:bg-purple-800 text-white px-6">
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>

        {/* Quick chapter pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {["MIND", "HEAD", "STOMACH", "BACK", "SKIN", "GENERALS", "FEVER"].map((ch) => (
            <button
              key={ch}
              onClick={() => setQuery(ch)}
              className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-purple-400 hover:text-purple-700 transition-all"
            >
              {ch}
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-16">
            <div className="inline-block h-8 w-8 border-4 border-purple-200 border-t-purple-700 rounded-full animate-spin" />
            <p className="mt-3 text-muted-foreground">Searching repertory...</p>
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-12 bg-muted/30 rounded-2xl">
            <div className="text-5xl">🔍</div>
            <p className="mt-4 font-medium">No rubrics found for "{query}". Try different keywords.</p>
            <p className="mt-2 text-sm text-muted-foreground">Note: The repertory database needs to be loaded with data first.</p>
            <p className="mt-1 text-xs text-muted-foreground">Run the Homeopathy database SQL from the setup prompt to load rubric data.</p>
          </div>
        )}

        <div className="space-y-4">
          {results.map((rubric: any) => {
            const remedies = Array.isArray(rubric.remedies) ? rubric.remedies : [];
            const topRemedies = remedies.slice(0, 8);
            return (
              <div key={rubric.id} className="border border-border rounded-2xl p-5 bg-white hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${chapterColors[rubric.chapter] || "bg-gray-100 text-gray-700"}`}>
                      {rubric.chapter}
                    </span>
                    <h3 className="font-semibold">{rubric.rubric}</h3>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {rubric.total_remedies || remedies.length} remedies
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{rubric.full_path}</p>
                <div className="flex flex-wrap gap-2">
                  {topRemedies.map((r: any, i: number) => (
                    <span key={i} className="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      {r.remedy}
                      {r.grade >= 3 && <span className="ml-1 text-amber-600">{"★".repeat(r.grade - 1)}</span>}
                    </span>
                  ))}
                  {remedies.length > 8 && (
                    <span className="text-xs px-2 py-1 text-muted-foreground">+{remedies.length - 8} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Not a doctor notice */}
        <div className="mt-12 p-6 rounded-2xl bg-purple-50 border border-purple-200 text-center">
          <h3 className="font-semibold text-purple-900">🏥 BHMS Doctor? Access the full case taking module</h3>
          <p className="text-sm text-purple-700 mt-2">
            Case taking form, AI repertorisation, prescription writing — all for free.
          </p>
          <Link to="/doctor/auth" className="mt-4 inline-block bg-purple-700 hover:bg-purple-800 text-white text-sm font-semibold px-5 py-2 rounded-full">
            Join as BHMS Doctor
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};
export default HomeopathyRepertory;
