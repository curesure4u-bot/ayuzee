import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Search, Leaf, Brain, Sparkles, BookOpen, Copy, Plus,
  ChevronRight, Stethoscope, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { ALL_SNA_MEDICINES, SNA_CATEGORIES, type SnaMedicine } from "./snaData";
import { findEDLMatches, type EDLMatch } from "@/lib/astg-edl";
import PrescribeOrderDialog from "@/components/astg/PrescribeOrderDialog";

const HmsSnaFormulary = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMedicine, setSelectedMedicine] = useState<SnaMedicine | null>(null);

  // Prescription integration
  const [prescribeOpen, setPrescribeOpen] = useState(false);
  const [prescribeMed, setPrescribeMed] = useState<SnaMedicine | null>(null);

  // EDL integration
  const [edlLoading, setEdlLoading] = useState(false);
  const [edlMatches, setEdlMatches] = useState<EDLMatch[]>([]);
  const [edlOpen, setEdlOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = ALL_SNA_MEDICINES;
    if (selectedCategory !== "all") {
      list = list.filter(m => m.category === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.indication.toLowerCase().includes(q) ||
        m.ingredients.toLowerCase().includes(q)
      );
    }
    return list;
  }, [search, selectedCategory]);

  // Handle "Add to Prescription" - opens PrescribeOrderDialog
  function handlePrescribe(med: SnaMedicine) {
    setPrescribeMed(med);
    setPrescribeOpen(true);
  }

  // Handle "Essential Drugs" - lookup EDL matches
  async function handleEDLLookup(med: SnaMedicine) {
    setEdlLoading(true);
    try {
      const matches = await findEDLMatches(med.name);
      setEdlMatches(matches);
      setEdlOpen(true);
      if (matches.length === 0) {
        toast.info(`No Essential Drugs List match found for "${med.name}"`);
      }
    } catch (e: any) {
      toast.error("Failed to query Essential Drugs List");
    } finally {
      setEdlLoading(false);
    }
  }

  // Handle "ASTG Link" - navigate to ASTG/Doctor reference page with medicine search
  function handleASTGLink(med: SnaMedicine) {
    // Try vaidya path first (works in both /hms and /vaidya contexts)
    const indication = med.indication.split(",")[0].trim();
    navigate(`/hms/doctor-astg?q=${encodeURIComponent(indication)}`);
  }

  // Handle "Copy Details"
  function handleCopy(med: SnaMedicine) {
    const text = `${med.name}\nCategory: ${med.category}\nIngredients: ${med.ingredients}\nIndication: ${med.indication}\nDose: ${med.dose}${med.anupana ? `\nAnupana: ${med.anupana}` : ""}\nReference: ${med.reference}`;
    navigator.clipboard.writeText(text);
    toast.success("Medicine details copied to clipboard");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            Ayurveda Ayuzee Formulary
          </h1>
          <p className="text-sm text-muted-foreground">
            {ALL_SNA_MEDICINES.length} Ayurveda classical formulations across 8 categories
          </p>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/30">
          <Brain className="mr-1 h-3 w-3" /> AI Prescription Ready
        </Badge>
      </div>

      {/* AI Insight */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-primary mt-0.5" />
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-primary">AI Integration: </span>
              Search by disease/indication to find formulations. Click "Add to Prescription" to 
              create a prescription order for your patient. Use "ASTG Link" for clinical reference 
              and "Essential Drugs" for EDL cross-matching.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search medicine, ingredient, or indication..." 
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Badge variant="outline">{filtered.length} results</Badge>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={selectedCategory === "all" ? "default" : "outline"}
          className="text-xs h-7" onClick={() => setSelectedCategory("all")}>
          All ({ALL_SNA_MEDICINES.length})
        </Button>
        {SNA_CATEGORIES.map(cat => (
          <Button key={cat.value} size="sm"
            variant={selectedCategory === cat.value ? "default" : "outline"}
            className={`text-xs h-7 ${selectedCategory === cat.value ? cat.color + " text-white border-0" : ""}`}
            onClick={() => setSelectedCategory(cat.value)}>
            {cat.label} ({cat.count})
          </Button>
        ))}
      </div>

      {/* Medicine List & Detail */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* List */}
        <div className="lg:col-span-2 space-y-2 max-h-[600px] overflow-y-auto">
          {filtered.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No medicines found.</CardContent></Card>
          ) : filtered.map((m) => (
            <Card key={`${m.category}-${m.id}`} 
              className={`cursor-pointer hover:border-primary/50 transition-colors ${selectedMedicine?.id === m.id && selectedMedicine?.category === m.category ? "border-primary" : ""}`}
              onClick={() => setSelectedMedicine(m)}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{m.name}</p>
                      <Badge className={`text-[10px] ${SNA_CATEGORIES.find(c=>c.value===m.category)?.color} text-white`}>
                        {m.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      <span className="font-medium">Indication:</span> {m.indication}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detail Panel */}
        <div>
          {selectedMedicine ? (
            <Card className="sticky top-4">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{selectedMedicine.name}</CardTitle>
                  <Badge className={`${SNA_CATEGORIES.find(c=>c.value===selectedMedicine.category)?.color} text-white`}>
                    {selectedMedicine.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-xs text-muted-foreground mb-1">Ingredients:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedMedicine.ingredients.split(",").map((ing, i) => (
                      <Badge key={i} variant="outline" className="text-[10px]">{ing.trim()}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-medium text-xs text-muted-foreground mb-1">Indication:</p>
                  <p className="text-xs">{selectedMedicine.indication}</p>
                </div>
                <div>
                  <p className="font-medium text-xs text-muted-foreground mb-1">Dose:</p>
                  <p className="text-xs">{selectedMedicine.dose}</p>
                </div>
                {selectedMedicine.anupana && (
                  <div>
                    <p className="font-medium text-xs text-muted-foreground mb-1">Anupana:</p>
                    <p className="text-xs">{selectedMedicine.anupana}</p>
                  </div>
                )}
                <div>
                  <p className="font-medium text-xs text-muted-foreground mb-1">Reference:</p>
                  <p className="text-xs italic">{selectedMedicine.reference}</p>
                </div>

                {/* Action Buttons - FULLY INTEGRATED */}
                <div className="pt-3 border-t space-y-2">
                  <Button size="sm" className="w-full text-xs" onClick={() => handlePrescribe(selectedMedicine)}>
                    <Plus className="mr-1 h-3 w-3" /> Add to Prescription
                  </Button>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 text-xs"
                      onClick={() => handleASTGLink(selectedMedicine)}>
                      <Stethoscope className="mr-1 h-3 w-3" /> ASTG Link
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-xs"
                      disabled={edlLoading}
                      onClick={() => handleEDLLookup(selectedMedicine)}>
                      {edlLoading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <BookOpen className="mr-1 h-3 w-3" />}
                      Essential Drugs
                    </Button>
                  </div>
                  <Button size="sm" variant="ghost" className="w-full text-xs"
                    onClick={() => handleCopy(selectedMedicine)}>
                    <Copy className="mr-1 h-3 w-3" /> Copy Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                <Leaf className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                Select a medicine to view details
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Prescription Dialog - connects to prescription_orders table */}
      {prescribeMed && (
        <PrescribeOrderDialog
          open={prescribeOpen}
          onOpenChange={(o) => {
            setPrescribeOpen(o);
            if (!o) setPrescribeMed(null);
          }}
          medicineName={prescribeMed.name}
          product={null}
          defaults={{
            dose: prescribeMed.dose,
            anupana: prescribeMed.anupana || undefined,
          }}
        />
      )}

      {/* Essential Drugs List Dialog */}
      <Dialog open={edlOpen} onOpenChange={setEdlOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Essential Drugs List Matches</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm max-h-[400px] overflow-y-auto">
            {edlMatches.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No matches found in Essential Drugs List.</p>
            ) : edlMatches.map((m) => (
              <div key={`${m.system}-${m.id}`} className="rounded border p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{m.name}</span>
                  <Badge>{m.system}</Badge>
                </div>
                {m.category && <div className="text-xs mt-1"><span className="text-muted-foreground">Category:</span> {m.category}</div>}
                {m.dose && <div className="text-xs"><span className="text-muted-foreground">Dose:</span> {m.dose}</div>}
                {m.indications?.length ? <div className="text-xs"><span className="text-muted-foreground">Indications:</span> {m.indications.join(", ")}</div> : null}
                {m.precautions && <div className="text-xs"><span className="text-muted-foreground">Precautions:</span> {m.precautions}</div>}
                {m.reference && <div className="text-xs text-muted-foreground mt-1 italic">{m.reference}</div>}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsSnaFormulary;
