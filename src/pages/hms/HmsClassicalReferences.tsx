import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  BookOpen, Search, Loader2, Sparkles, Filter,
  ScrollText, ThumbsUp, ThumbsDown, ExternalLink,
} from "lucide-react";

type ReferenceResult = {
  id?: string;
  text?: { name: string; name_sanskrit?: string; author?: string; system?: string };
  text_name?: string;
  sthana: string;
  chapter_number?: number;
  chapter_name?: string;
  chapter?: string;
  verse_start?: number;
  verse_end?: number;
  verse_range?: string;
  sanskrit_text?: string;
  english_translation?: string;
  summary?: string;
  hindi_translation?: string;
  commentary?: string;
  clinical_topic?: string;
  clinical_tags?: string[];
  diseases_mentioned?: string[];
  herbs_mentioned?: string[];
  principles?: string[];
  clinical_relevance?: string;
  confidence?: string;
  source?: string;
};

const TEXTS = [
  { value: "", label: "All Texts" },
  { value: "Charaka Samhita", label: "Charaka Samhita" },
  { value: "Sushruta Samhita", label: "Sushruta Samhita" },
  { value: "Ashtanga Hridaya", label: "Ashtanga Hridaya" },
  { value: "Bhavaprakasha", label: "Bhavaprakasha" },
  { value: "Madhava Nidana", label: "Madhava Nidana" },
  { value: "Sharangadhara Samhita", label: "Sharangadhara Samhita" },
  { value: "Rasa Tarangini", label: "Rasa Tarangini" },
];

const TOPIC_SUGGESTIONS = [
  "Jwara (Fever)", "Prameha (Diabetes)", "Amavata (Rheumatoid Arthritis)",
  "Sandhivata (Osteoarthritis)", "Rasayana (Rejuvenation)", "Viruddha Ahara",
  "Panchakarma", "Dinacharya", "Vata disorders", "Kushtha (Skin diseases)",
  "Hridya (Cardiac)", "Medhya (Nootropic)", "Agni (Digestion)",
];

const HmsClassicalReferences = () => {
  const [query, setQuery] = useState("");
  const [textFilter, setTextFilter] = useState("");
  const [diseaseFilter, setDiseaseFilter] = useState("");
  const [herbFilter, setHerbFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ReferenceResult[]>([]);
  const [aiResults, setAiResults] = useState<ReferenceResult[]>([]);
  const [source, setSource] = useState<string>("");

  const search = async () => {
    if (!query.trim() && !diseaseFilter && !herbFilter) {
      return toast.error("Enter a search query or select a filter");
    }
    setLoading(true);
    setResults([]);
    setAiResults([]);
    try {
      const { data, error } = await supabase.functions.invoke("classical-reference-search", {
        body: {
          query: query.trim() || undefined,
          text_filter: textFilter || undefined,
          disease_filter: diseaseFilter || undefined,
          herb_filter: herbFilter || undefined,
          limit: 25,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResults(data?.results || []);
      setAiResults(data?.ai_results || []);
      setSource(data?.source || "");
      const total = (data?.results?.length || 0) + (data?.ai_results?.length || 0);
      if (total > 0) toast.success(`Found ${total} reference(s)`);
      else toast.info("No references found — try a broader search");
    } catch (e: any) {
      toast.error(e.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const allResults = [...results, ...aiResults];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-amber-600" /> Classical Reference Engine
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Search across Charaka Samhita, Sushruta Samhita, Ashtanga Hridaya, Bhavaprakasha, and more.
          Full-text search with AI-powered fallback.
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Search clinical topic, disease, herb, principle... (e.g. 'Sandhivata treatment' or 'Rasayana for memory')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              className="flex-1"
            />
            <Button onClick={search} disabled={loading}>
              {loading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Search className="mr-1 h-4 w-4" />}
              Search
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Text</label>
              <Select value={textFilter} onValueChange={setTextFilter}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="All Texts" /></SelectTrigger>
                <SelectContent>
                  {TEXTS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Disease</label>
              <Input className="h-8 text-xs" placeholder="e.g. amavata, jwara" value={diseaseFilter} onChange={(e) => setDiseaseFilter(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Herb / Drug</label>
              <Input className="h-8 text-xs" placeholder="e.g. guggulu, ashwagandha" value={herbFilter} onChange={(e) => setHerbFilter(e.target.value)} />
            </div>
          </div>

          {/* Topic suggestions */}
          <div className="flex flex-wrap gap-1.5">
            {TOPIC_SUGGESTIONS.map((t) => (
              <Button key={t} variant="outline" size="sm" className="text-[10px] h-6 px-2" onClick={() => { setQuery(t); }}>
                {t}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {allResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">{allResults.length} result{allResults.length !== 1 ? "s" : ""}</Badge>
            {source === "ai" && <Badge variant="outline" className="text-xs text-purple-600"><Sparkles className="h-3 w-3 mr-0.5" /> AI-sourced</Badge>}
            {source === "database" && <Badge variant="outline" className="text-xs text-green-600">📚 Database</Badge>}
          </div>

          {allResults.map((ref, idx) => (
            <Card key={ref.id || idx} className="hover:shadow-md transition">
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <ScrollText className="h-4 w-4 text-amber-600 shrink-0" />
                    <span className="font-medium text-sm">{ref.text?.name || ref.text_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {ref.sthana} · Ch. {ref.chapter_number || ref.chapter}
                      {ref.chapter_name && ` — ${ref.chapter_name}`}
                    </span>
                    {(ref.verse_start || ref.verse_range) && (
                      <Badge variant="secondary" className="text-[10px]">
                        Verse {ref.verse_start ? `${ref.verse_start}${ref.verse_end ? `-${ref.verse_end}` : ""}` : ref.verse_range}
                      </Badge>
                    )}
                  </div>
                  {ref.source === "ai" && (
                    <Badge variant="outline" className="text-[10px] text-purple-600 shrink-0">
                      <Sparkles className="h-2.5 w-2.5 mr-0.5" /> AI
                      {ref.confidence && ` · ${ref.confidence}`}
                    </Badge>
                  )}
                </div>

                {/* Sanskrit text */}
                {ref.sanskrit_text && (
                  <div className="bg-amber-50 border border-amber-100 rounded p-2 mb-2">
                    <p className="text-sm font-serif text-amber-900 leading-relaxed">{ref.sanskrit_text}</p>
                  </div>
                )}

                {/* Translation */}
                <p className="text-sm text-foreground mb-2">
                  {ref.english_translation || ref.summary}
                </p>

                {/* Clinical relevance */}
                {(ref.clinical_relevance || ref.clinical_topic) && (
                  <p className="text-xs text-blue-700 bg-blue-50 rounded p-2 mb-2">
                    <strong>Clinical Relevance:</strong> {ref.clinical_relevance || ref.clinical_topic}
                  </p>
                )}

                {/* Commentary */}
                {ref.commentary && (
                  <p className="text-xs text-muted-foreground italic mb-2">{ref.commentary}</p>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {(ref.clinical_tags || []).map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-[10px]">{tag}</Badge>
                  ))}
                  {(ref.diseases_mentioned || []).map((d, i) => (
                    <Badge key={`d-${i}`} variant="secondary" className="text-[10px] bg-red-50 text-red-700">{d}</Badge>
                  ))}
                  {(ref.herbs_mentioned || []).map((h, i) => (
                    <Badge key={`h-${i}`} variant="secondary" className="text-[10px] bg-green-50 text-green-700">{h}</Badge>
                  ))}
                  {(ref.principles || []).map((p, i) => (
                    <Badge key={`p-${i}`} variant="secondary" className="text-[10px] bg-purple-50 text-purple-700">{p}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && allResults.length === 0 && source && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No references found. Try a broader search term.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HmsClassicalReferences;
