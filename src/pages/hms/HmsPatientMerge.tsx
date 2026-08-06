import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  GitMerge, Search, AlertTriangle, CheckCircle, Users,
  Phone, Calendar, ArrowRight, RefreshCw, Eye, Trash2
} from "lucide-react";

type DuplicateCandidate = {
  id: string;
  patient_a: { id: string; name: string; phone: string; dob: string; visits: number; city: string };
  patient_b: { id: string; name: string; phone: string; dob: string; visits: number; city: string };
  match_score: number;
  match_criteria: string;
  status: "pending" | "confirmed_duplicate" | "not_duplicate" | "merged";
};

const mockDuplicates: DuplicateCandidate[] = [
  {
    id: "1",
    patient_a: { id: "a1", name: "Rahul Sharma", phone: "9876543210", dob: "1985-03-15", visits: 12, city: "Mumbai" },
    patient_b: { id: "b1", name: "Rahul K Sharma", phone: "9876543210", dob: "1985-03-15", visits: 3, city: "Mumbai" },
    match_score: 95, match_criteria: "Phone + DOB", status: "pending"
  },
  {
    id: "2",
    patient_a: { id: "a2", name: "Meera Devi", phone: "8765432100", dob: "1992-07-22", visits: 8, city: "Delhi" },
    patient_b: { id: "b2", name: "Meera Devi Gupta", phone: "8765432109", dob: "1992-07-22", visits: 2, city: "Delhi" },
    match_score: 75, match_criteria: "Name + DOB", status: "pending"
  },
  {
    id: "3",
    patient_a: { id: "a3", name: "Vikram Singh", phone: "7654321098", dob: "1978-11-05", visits: 20, city: "Jaipur" },
    patient_b: { id: "b3", name: "Vikram Singh", phone: "7654321098", dob: "1978-11-05", visits: 5, city: "Jaipur" },
    match_score: 100, match_criteria: "Phone + Name + DOB", status: "confirmed_duplicate"
  },
];

const HmsPatientMerge = () => {
  const [duplicates] = useState<DuplicateCandidate[]>(mockDuplicates);
  const [searchTerm, setSearchTerm] = useState("");
  const [mergeOpen, setMergeOpen] = useState(false);
  const [selected, setSelected] = useState<DuplicateCandidate | null>(null);
  const [primaryId, setPrimaryId] = useState<"a" | "b">("a");

  const handleScan = () => {
    toast.success("Duplicate detection scan initiated. Found 3 potential duplicates.");
  };

  const handleMerge = () => {
    if (!selected) return;
    toast.success(`Merged records: ${selected.patient_b.name} → ${selected.patient_a.name}. All appointments, prescriptions, and bills transferred.`);
    setMergeOpen(false);
    setSelected(null);
  };

  const handleNotDuplicate = (id: string) => {
    toast.info("Marked as NOT a duplicate. Will not appear again.");
  };

  const openMerge = (dup: DuplicateCandidate) => {
    setSelected(dup);
    setPrimaryId("a");
    setMergeOpen(true);
  };

  const filtered = duplicates.filter((d) =>
    d.patient_a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.patient_b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.patient_a.phone.includes(searchTerm) ||
    d.patient_b.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <GitMerge className="h-6 w-6 text-primary" /> Patient Duplicate Merge
          </h1>
          <p className="text-sm text-muted-foreground">
            Detect and merge duplicate patient records to maintain clean data
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleScan}>
            <RefreshCw className="mr-1 h-4 w-4" /> Run Scan
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-amber-600">{duplicates.filter(d => d.status === "pending").length}</p><p className="text-xs text-muted-foreground">Pending Review</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-red-600">{duplicates.filter(d => d.status === "confirmed_duplicate").length}</p><p className="text-xs text-muted-foreground">Confirmed Dupes</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-green-600">{duplicates.filter(d => d.status === "merged").length}</p><p className="text-xs text-muted-foreground">Merged</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-blue-600">{duplicates.filter(d => d.match_score >= 90).length}</p><p className="text-xs text-muted-foreground">High Confidence</p></CardContent></Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search by name or phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {/* Duplicate Candidates */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" /> Potential Duplicates ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {filtered.map((dup) => (
            <div key={dup.id} className="border rounded-lg p-4 hover:bg-muted/20 transition">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant={dup.match_score >= 90 ? "destructive" : dup.match_score >= 70 ? "secondary" : "outline"}>
                    {dup.match_score}% match
                  </Badge>
                  <span className="text-xs text-muted-foreground">Matched on: {dup.match_criteria}</span>
                </div>
                <Badge variant={dup.status === "pending" ? "secondary" : dup.status === "merged" ? "outline" : "default"}>
                  {dup.status.replace("_", " ")}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Patient A */}
                <div className="border rounded p-3 bg-blue-50/50">
                  <p className="font-medium text-sm">{dup.patient_a.name}</p>
                  <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                    <p className="flex items-center gap-1"><Phone className="h-3 w-3" /> {dup.patient_a.phone}</p>
                    <p className="flex items-center gap-1"><Calendar className="h-3 w-3" /> DOB: {dup.patient_a.dob}</p>
                    <p>{dup.patient_a.city} · {dup.patient_a.visits} visits</p>
                  </div>
                </div>
                {/* Patient B */}
                <div className="border rounded p-3 bg-orange-50/50">
                  <p className="font-medium text-sm">{dup.patient_b.name}</p>
                  <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                    <p className="flex items-center gap-1"><Phone className="h-3 w-3" /> {dup.patient_b.phone}</p>
                    <p className="flex items-center gap-1"><Calendar className="h-3 w-3" /> DOB: {dup.patient_b.dob}</p>
                    <p>{dup.patient_b.city} · {dup.patient_b.visits} visits</p>
                  </div>
                </div>
              </div>

              {dup.status === "pending" || dup.status === "confirmed_duplicate" ? (
                <div className="flex gap-2 mt-3 justify-end">
                  <Button size="sm" variant="ghost" onClick={() => handleNotDuplicate(dup.id)}>
                    <Trash2 className="mr-1 h-3 w-3" /> Not Duplicate
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openMerge(dup)}>
                    <Eye className="mr-1 h-3 w-3" /> Review & Merge
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Merge Dialog */}
      <Dialog open={mergeOpen} onOpenChange={setMergeOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitMerge className="h-5 w-5" /> Merge Patient Records
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select the primary record. All data from the other record will be transferred to the primary.
              </p>
              <div className="space-y-2">
                <div
                  className={`border rounded-lg p-3 cursor-pointer transition ${primaryId === "a" ? "border-primary bg-primary/5" : "hover:bg-muted/30"}`}
                  onClick={() => setPrimaryId("a")}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selected.patient_a.name}</p>
                      <p className="text-xs text-muted-foreground">{selected.patient_a.phone} · {selected.patient_a.visits} visits</p>
                    </div>
                    {primaryId === "a" && <CheckCircle className="h-5 w-5 text-primary" />}
                  </div>
                </div>
                <div className="flex justify-center"><ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" /></div>
                <div
                  className={`border rounded-lg p-3 cursor-pointer transition ${primaryId === "b" ? "border-primary bg-primary/5" : "hover:bg-muted/30"}`}
                  onClick={() => setPrimaryId("b")}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selected.patient_b.name}</p>
                      <p className="text-xs text-muted-foreground">{selected.patient_b.phone} · {selected.patient_b.visits} visits</p>
                    </div>
                    {primaryId === "b" && <CheckCircle className="h-5 w-5 text-primary" />}
                  </div>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-800">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                This will transfer all appointments, prescriptions, bills, and lab reports to the primary record. This action can be rolled back within 30 days.
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setMergeOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleMerge}>Confirm Merge</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsPatientMerge;
