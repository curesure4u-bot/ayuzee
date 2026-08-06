import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Info, Shield, Plus, X, Search, Pill } from "lucide-react";

interface Interaction {
  drug_a: string;
  drug_b: string;
  interaction_type: string;
  severity: string;
  description: string;
  recommendation: string;
  ayurvedic_reasoning: string | null;
}

const SEVERITY_CONFIG: Record<string, { color: string; icon: typeof AlertTriangle }> = {
  severe: { color: "border-red-300 bg-red-50 text-red-800", icon: AlertTriangle },
  moderate: { color: "border-amber-300 bg-amber-50 text-amber-800", icon: Info },
  mild: { color: "border-blue-300 bg-blue-50 text-blue-800", icon: Info },
};

const DrugInteractionChecker = () => {
  const [medicines, setMedicines] = useState<string[]>([""]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState(false);

  const addMedicine = () => setMedicines([...medicines, ""]);
  const removeMedicine = (idx: number) => setMedicines(medicines.filter((_, i) => i !== idx));
  const updateMedicine = (idx: number, val: string) => {
    const next = [...medicines];
    next[idx] = val;
    setMedicines(next);
  };

  const checkInteractions = async () => {
    const valid = medicines.filter((m) => m.trim());
    if (valid.length < 2) { toast.error("Enter at least 2 medicines to check interactions"); return; }

    setChecking(true);
    setInteractions([]);

    const found: Interaction[] = [];
    // Check each pair
    for (let i = 0; i < valid.length; i++) {
      for (let j = i + 1; j < valid.length; j++) {
        const a = valid[i].trim().toLowerCase();
        const b = valid[j].trim().toLowerCase();
        const { data } = await supabase
          .from("ayush_drug_interactions")
          .select("*")
          .or(`and(drug_a.ilike.%${a}%,drug_b.ilike.%${b}%),and(drug_a.ilike.%${b}%,drug_b.ilike.%${a}%)`)
          .limit(5);
        if (data && data.length > 0) found.push(...(data as Interaction[]));
      }
    }

    setInteractions(found);
    setChecked(true);
    setChecking(false);
    if (found.length === 0) toast.success("No known interactions found between these medicines!");
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="container py-10">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-amber-100">
              <Shield className="h-7 w-7 text-amber-700" />
            </div>
            <h1 className="font-display text-2xl font-bold">Medicine Interaction Checker</h1>
            <p className="mt-2 text-muted-foreground">Check if your Ayurvedic medicines can be safely taken together.</p>
          </div>

          {/* Medicine Input */}
          <Card>
            <CardHeader><CardTitle className="text-base">Enter Your Medicines</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {medicines.map((med, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Pill className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Input
                    value={med}
                    onChange={(e) => updateMedicine(idx, e.target.value)}
                    placeholder={`Medicine ${idx + 1} (e.g., Ashwagandha, Guggulu, Brahmi...)`}
                  />
                  {medicines.length > 1 && (
                    <Button size="icon" variant="ghost" onClick={() => removeMedicine(idx)}><X className="h-4 w-4" /></Button>
                  )}
                </div>
              ))}
              <div className="flex gap-3">
                {medicines.length < 8 && (
                  <Button variant="outline" size="sm" onClick={addMedicine}><Plus className="mr-1 h-3.5 w-3.5" /> Add Medicine</Button>
                )}
                <Button onClick={checkInteractions} disabled={checking} className="gap-1">
                  <Search className="h-4 w-4" /> {checking ? "Checking..." : "Check Interactions"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {checked && (
            <>
              {interactions.length === 0 ? (
                <Card className="border-green-300 bg-green-50">
                  <CardContent className="flex items-center gap-3 p-5">
                    <CheckCircle2 className="h-8 w-8 text-green-600 shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-800">No Interactions Found</h3>
                      <p className="text-sm text-green-700">These medicines appear safe to take together based on our database. Always consult your Vaidya for personalized guidance.</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  <h3 className="font-semibold text-red-700">⚠️ {interactions.length} interaction(s) found</h3>
                  {interactions.map((int, i) => {
                    const cfg = SEVERITY_CONFIG[int.severity] ?? SEVERITY_CONFIG.moderate;
                    return (
                      <Card key={i} className={`border ${cfg.color}`}>
                        <CardContent className="p-5">
                          <div className="flex items-start gap-3">
                            <cfg.icon className="h-5 w-5 shrink-0 mt-0.5" />
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold">{int.drug_a} + {int.drug_b}</span>
                                <Badge className={int.interaction_type === "contraindicated" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}>
                                  {int.interaction_type}
                                </Badge>
                                <Badge variant="outline" className="text-[10px]">{int.severity}</Badge>
                              </div>
                              <p className="text-sm">{int.description}</p>
                              {int.recommendation && (
                                <p className="mt-2 text-sm font-medium text-primary">💡 {int.recommendation}</p>
                              )}
                              {int.ayurvedic_reasoning && (
                                <p className="mt-1 text-xs text-muted-foreground italic">Ayurvedic reasoning: {int.ayurvedic_reasoning}</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Disclaimer */}
          <p className="text-center text-xs text-muted-foreground">
            This tool checks against known AYUSH drug interactions. It does not replace professional medical advice. Always consult your doctor or Vaidya before combining medicines.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DrugInteractionChecker;
