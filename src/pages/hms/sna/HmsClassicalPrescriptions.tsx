import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, BookOpen, Pill, ChevronRight, Stethoscope, Leaf,
  CheckCircle2, XCircle, Sparkles, Brain
} from "lucide-react";
import { toast } from "sonner";
import {
  CLASSICAL_PRESCRIPTIONS, DISEASE_CATEGORIES,
  type ClassicalDisease, type Formulation
} from "./classicalPrescriptionsData";

const HmsClassicalPrescriptions = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDisease, setSelectedDisease] = useState<ClassicalDisease | null>(null);

  const filtered = useMemo(() => {
    let list = CLASSICAL_PRESCRIPTIONS;
    if (selectedCategory !== "all") {
      list = list.filter(d => d.category === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.modernName.toLowerCase().includes(q) ||
        d.ayurvedicName.toLowerCase().includes(q) ||
        d.singleFormulations.some(f => f.name.toLowerCase().includes(q)) ||
        d.compoundFormulations.some(f => f.name.toLowerCase().includes(q))
      );
    }
    return list;
  }, [search, selectedCategory]);

  function copyPrescription(disease: ClassicalDisease) {
    const lines = [
      `${disease.ayurvedicName} (${disease.modernName})`,
      `\nSingle Formulations:`,
      ...disease.singleFormulations.map((f, i) => `${i+1}. ${f.name} - ${f.dosageForm} - ${f.dose} - Anupana: ${f.anupana || "-"} [${f.reference}]`),
      `\nCompound Formulations:`,
      ...disease.compoundFormulations.map((f, i) => `${i+1}. ${f.name} - ${f.dosageForm} - ${f.dose} - Anupana: ${f.anupana || "-"} [${f.reference}]`),
    ];
    navigator.clipboard.writeText(lines.join("\n"));
    toast.success("Prescription details copied");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Classical Ayurvedic Prescriptions
          </h1>
          <p className="text-sm text-muted-foreground">
            CCRAS — {CLASSICAL_PRESCRIPTIONS.length} diseases · Govt. of India reference for registered practitioners
          </p>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/30">
          <Brain className="mr-1 h-3 w-3" /> CCRAS Official
        </Badge>
      </div>

      {/* Info Card */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-primary mt-0.5" />
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-primary">CCRAS Reference: </span>
              Search by disease (Ayurvedic or modern name) to find classical prescriptions with
              single & compound formulations, dosage, anupana, textual reference, and Pathyapathya (Do's & Don'ts).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search disease: Jvara, Fever, Sciatica, Asthma..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Badge variant="outline">{filtered.length} diseases</Badge>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={selectedCategory === "all" ? "default" : "outline"}
          className="text-xs h-7" onClick={() => setSelectedCategory("all")}>
          All ({CLASSICAL_PRESCRIPTIONS.length})
        </Button>
        {DISEASE_CATEGORIES.map(cat => (
          <Button key={cat.value} size="sm"
            variant={selectedCategory === cat.value ? "default" : "outline"}
            className="text-xs h-7"
            onClick={() => setSelectedCategory(cat.value)}>
            {cat.label} ({cat.count})
          </Button>
        ))}
      </div>

      {/* Disease List & Detail */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* List */}
        <div className="lg:col-span-1 space-y-2 max-h-[650px] overflow-y-auto">
          {filtered.length === 0 ? (
            <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">No diseases found.</CardContent></Card>
          ) : filtered.map((d) => (
            <Card key={d.id}
              className={`cursor-pointer hover:border-primary/50 transition-colors ${selectedDisease?.id === d.id ? "border-primary bg-primary/5" : ""}`}
              onClick={() => setSelectedDisease(d)}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{d.ayurvedicName}</p>
                    <p className="text-xs text-muted-foreground">{d.modernName}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground mt-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2">
          {selectedDisease ? (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedDisease.ayurvedicName}</CardTitle>
                    <p className="text-sm text-muted-foreground">{selectedDisease.modernName}</p>
                  </div>
                  <Badge variant="outline">{selectedDisease.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm max-h-[580px] overflow-y-auto">
                {/* Single Formulations */}
                <div>
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                    <Leaf className="h-3 w-3" /> A. Single Formulations
                  </h3>
                  <div className="space-y-2">
                    {selectedDisease.singleFormulations.map((f, i) => (
                      <FormulationRow key={i} f={f} index={i + 1} />
                    ))}
                  </div>
                </div>

                {/* Compound Formulations */}
                <div>
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                    <Pill className="h-3 w-3" /> B. Compound Formulations
                  </h3>
                  <div className="space-y-2">
                    {selectedDisease.compoundFormulations.map((f, i) => (
                      <FormulationRow key={i} f={f} index={i + 1} />
                    ))}
                  </div>
                </div>

                {/* Pathyapathya */}
                <div>
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                    <Stethoscope className="h-3 w-3" /> C. Pathyapathya (Do's & Don'ts)
                  </h3>
                  <div className="rounded border overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-2 font-medium">Category</th>
                          <th className="text-left p-2 font-medium text-green-700">Pathya (Do's)</th>
                          <th className="text-left p-2 font-medium text-red-700">Apathya (Don'ts)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDisease.pathyaApathya.cereals && (
                          <tr className="border-t"><td className="p-2 font-medium">Cereals</td><td className="p-2">{selectedDisease.pathyaApathya.cereals.pathya || "—"}</td><td className="p-2">{selectedDisease.pathyaApathya.cereals.apathya || "—"}</td></tr>
                        )}
                        {selectedDisease.pathyaApathya.pulses && (
                          <tr className="border-t"><td className="p-2 font-medium">Pulses</td><td className="p-2">{selectedDisease.pathyaApathya.pulses.pathya || "—"}</td><td className="p-2">{selectedDisease.pathyaApathya.pulses.apathya || "—"}</td></tr>
                        )}
                        {selectedDisease.pathyaApathya.fruitsVegetables && (
                          <tr className="border-t"><td className="p-2 font-medium">Fruits & Veg</td><td className="p-2">{selectedDisease.pathyaApathya.fruitsVegetables.pathya || "—"}</td><td className="p-2">{selectedDisease.pathyaApathya.fruitsVegetables.apathya || "—"}</td></tr>
                        )}
                        {selectedDisease.pathyaApathya.others && (
                          <tr className="border-t"><td className="p-2 font-medium">Others</td><td className="p-2">{selectedDisease.pathyaApathya.others.pathya || "—"}</td><td className="p-2">{selectedDisease.pathyaApathya.others.apathya || "—"}</td></tr>
                        )}
                        {selectedDisease.pathyaApathya.lifeStyle && (
                          <tr className="border-t"><td className="p-2 font-medium">Life style</td><td className="p-2">{selectedDisease.pathyaApathya.lifeStyle.pathya || "—"}</td><td className="p-2">{selectedDisease.pathyaApathya.lifeStyle.apathya || "—"}</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t flex gap-2">
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => copyPrescription(selectedDisease)}>
                    Copy All Details
                  </Button>
                </div>

                <p className="text-[10px] text-muted-foreground italic pt-2">
                  Source: CCRAS, Dept. of AYUSH, Ministry of Health & Family Welfare, Govt. of India (2010).
                  Dose is for adults. For children use 1/2 or 1/4 dose. Dose and duration may be decided by physician on case to case basis.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center text-sm text-muted-foreground">
                <BookOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                <p className="font-medium">Select a disease to view prescriptions</p>
                <p className="text-xs mt-1">Browse or search by Ayurvedic/modern disease name</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

function FormulationRow({ f, index }: { f: Formulation; index: number }) {
  return (
    <div className="rounded border p-2 bg-card">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-muted rounded-full w-5 h-5 flex items-center justify-center font-medium">{index}</span>
            <span className="font-medium text-sm">{f.name}</span>
            <Badge variant="outline" className="text-[9px] h-4">{f.dosageForm}</Badge>
          </div>
          {f.botanical && <p className="text-[10px] text-muted-foreground ml-7 italic">{f.botanical}</p>}
        </div>
      </div>
      <div className="ml-7 mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px]">
        <span><span className="text-muted-foreground">Dose:</span> {f.dose}</span>
        {f.anupana && <span><span className="text-muted-foreground">Anupana:</span> {f.anupana}</span>}
        <span className="text-muted-foreground italic">{f.reference}</span>
      </div>
    </div>
  );
}

export default HmsClassicalPrescriptions;
