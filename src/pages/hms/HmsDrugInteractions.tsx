import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Pill, Search, ShieldAlert, AlertTriangle, Info, CheckCircle,
  Plus, X, Loader2, BookOpen, ThumbsUp, ThumbsDown, Sparkles,
} from "lucide-react";

type InteractionResult = {
  substance_1: string;
  substance_2: string;
  system_1?: string;
  system_2?: string;
  severity: string;
  interaction_type?: string;
  mechanism: string;
  clinical_effect: string;
  recommendation: string;
  evidence_level?: string;
  classical_reference?: string;
  modern_reference?: string;
  source: string;
};

type SearchResponse = {
  query: string[];
  matched_substances: any[];
  database_interactions: InteractionResult[];
  ai_interactions: InteractionResult[];
  source: string;
  total_found: number;
};

const severityConfig: Record<string, { color: string; icon: any; label: string }> = {
  critical: { color: "border-red-400 bg-red-50/50", icon: ShieldAlert, label: "Critical" },
  high: { color: "border-red-300 bg-red-50/30", icon: ShieldAlert, label: "High Risk" },
  moderate: { color: "border-amber-300 bg-amber-50/30", icon: AlertTriangle, label: "Moderate" },
  low: { color: "border-green-200 bg-green-50/20", icon: Info, label: "Low Risk" },
  beneficial: { color: "border-emerald-300 bg-emerald-50/30", icon: CheckCircle, label: "Beneficial" },
  unknown: { color: "border-gray-200 bg-gray-50/20", icon: Info, label: "Unknown" },
};

const HmsDrugInteractions = () => {
  const [substances, setSubstances] = useState<string[]>(["", ""]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);

  const updateSubstance = (idx: number, val: string) => {
    setSubstances((prev) => prev.map((s, i) => (i === idx ? val : s)));
  };

  const addSubstance = () => setSubstances((prev) => [...prev, ""]);
  const removeSubstance = (idx: number) => {
    if (substances.length <= 2) return;
    setSubstances((prev) => prev.filter((_, i) => i !== idx));
  };

  const checkInteractions = async () => {
    const valid = substances.filter((s) => s.trim());
    if (valid.length < 2) return toast.error("Enter at least 2 substances");
    setLoading(true);
    setResults(null);
    try {
      const { data, error } = await supabase.functions.invoke("drug-interaction-check", {
        body: { substances: valid, include_ai: true },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResults(data as SearchResponse);
      const total = (data.database_interactions?.length || 0) + (data.ai_interactions?.length || 0);
      if (total > 0) toast.success(`Found ${total} interaction(s)`);
      else toast.info("No known interactions found");
    } catch (e: any) {
      toast.error(e.message || "Interaction check failed");
    } finally {
      setLoading(false);
    }
  };

  const allInteractions = [
    ...(results?.database_interactions || []),
    ...(results?.ai_interactions || []),
  ].sort((a, b) => {
    const order: Record<string, number> = { critical: 0, high: 1, moderate: 2, low: 3, beneficial: 4, unknown: 5 };
    return (order[a.severity] ?? 5) - (order[b.severity] ?? 5);
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Pill className="h-6 w-6 text-primary" /> Drug-Herb Interaction Checker
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Cross-system analysis: Ayurveda × Allopathy × Homeopathy × Siddha. Database + AI-powered inference with classical Viruddha Ahara principles.
        </p>
      </div>

      {/* Input */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Check Interactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {substances.map((sub, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-[10px] shrink-0">{idx + 1}</Badge>
              <Input
                placeholder={`Substance ${idx + 1} (e.g. ${idx === 0 ? "Guggulu" : idx === 1 ? "Warfarin" : "Ashwagandha"})`}
                value={sub}
                onChange={(e) => updateSubstance(idx, e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && checkInteractions()}
              />
              {substances.length > 2 && (
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 shrink-0" onClick={() => removeSubstance(idx)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={addSubstance}>
              <Plus className="h-3 w-3 mr-1" /> Add substance
            </Button>
            <Button onClick={checkInteractions} disabled={loading}>
              {loading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Search className="mr-1 h-4 w-4" />}
              {loading ? "Checking..." : "Check Interactions"}
            </Button>
          </div>

          {/* Quick checks */}
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-2">Quick checks:</p>
            <div className="flex flex-wrap gap-2">
              {[
                ["Guggulu", "Warfarin"],
                ["Ashwagandha", "Levothyroxine"],
                ["Ghee", "Honey"],
                ["Milk", "Fish"],
                ["Pippali", "Phenytoin"],
                ["Brahmi", "Sertraline"],
                ["Turmeric", "Milk"],
              ].map(([a, b]) => (
                <Button key={`${a}-${b}`} variant="outline" size="sm" className="text-xs h-7"
                  onClick={() => { setSubstances([a, b]); }}>
                  {a} × {b}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">
              {results.total_found} interaction{results.total_found !== 1 ? "s" : ""} found
            </Badge>
            <Badge variant="outline" className={`text-xs ${results.source === "database" ? "text-green-600" : "text-purple-600"}`}>
              {results.source === "database" ? "📚 Database" : results.source === "ai_inference" ? "🤖 AI Inferred" : "No data"}
            </Badge>
            {results.matched_substances?.length > 0 && (
              <span className="text-xs text-muted-foreground">
                Matched: {results.matched_substances.map((s: any) => s.name).join(", ")}
              </span>
            )}
          </div>

          {/* Interaction Cards */}
          {allInteractions.map((inter, idx) => {
            const config = severityConfig[inter.severity] || severityConfig.unknown;
            const Icon = config.icon;
            return (
              <Card key={idx} className={config.color}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className="font-medium text-sm">{inter.substance_1}</span>
                      <span className="text-muted-foreground">×</span>
                      <span className="font-medium text-sm">{inter.substance_2}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <Badge variant={inter.severity === "critical" || inter.severity === "high" ? "destructive" : "outline"} className="text-[10px] capitalize">
                        {config.label}
                      </Badge>
                      {inter.source === "ai_inference" && (
                        <Badge variant="outline" className="text-[10px] text-purple-600">
                          <Sparkles className="h-2.5 w-2.5 mr-0.5" /> AI
                        </Badge>
                      )}
                    </div>
                  </div>

                  {inter.interaction_type && (
                    <Badge variant="secondary" className="text-[10px] mb-2 capitalize">
                      {inter.interaction_type.replace(/_/g, " ")}
                    </Badge>
                  )}

                  <p className="text-xs text-muted-foreground mb-2"><strong>Mechanism:</strong> {inter.mechanism}</p>
                  <p className="text-xs text-muted-foreground mb-2"><strong>Clinical Effect:</strong> {inter.clinical_effect}</p>

                  <div className="p-2 rounded bg-white/70 border mb-2">
                    <p className="text-xs"><span className="font-medium text-blue-700">Recommendation:</span> {inter.recommendation}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                    {inter.evidence_level && <span>📊 Evidence: {inter.evidence_level.replace(/_/g, " ")}</span>}
                    {inter.classical_reference && (
                      <span className="flex items-center gap-0.5">
                        <BookOpen className="h-3 w-3" /> {inter.classical_reference}
                      </span>
                    )}
                    {inter.modern_reference && <span>📄 {inter.modern_reference}</span>}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {allInteractions.length === 0 && (
            <Card className="border-green-200 bg-green-50/20">
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <p className="text-sm font-medium text-green-700">No significant interactions found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  These substances appear safe to combine based on our database and AI analysis.
                  Always verify with clinical judgment.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <Card className="border-amber-200 bg-amber-50/30">
        <CardContent className="p-3 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800">
            This tool combines a curated database of 60+ classical and modern interactions with AI inference for novel combinations.
            AI-inferred interactions should be verified with additional sources. Clinical judgment remains primary.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HmsDrugInteractions;
