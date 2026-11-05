import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { BookOpen, Clock, Pill, Salad, Target, Search, UserPlus, Loader2 } from "lucide-react";
import { useTreatmentProtocols } from "@/hooks/useTreatmentProtocols";

const TreatmentProtocols = () => {
  const [filter, setFilter] = useState("");
  const { protocols, loading, error, applyProtocol } = useTreatmentProtocols(filter);

  const handleApply = async (id: string, name: string) => {
    await applyProtocol(id);
    toast.success(`"${name}" applied to current patient`);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="h-6 w-6" /> Treatment Protocols</h1>
        <Badge variant="outline">{protocols.length} protocols</Badge>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Filter by condition..." className="pl-9" value={filter} onChange={(e) => setFilter(e.target.value)} />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading protocols...</span>
        </div>
      )}

      {error && !loading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-3 text-xs text-amber-700">
            ⚠ Could not load live data (showing cached/demo). {error}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {protocols.map((protocol) => (
          <Card key={protocol.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{protocol.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="w-fit">{protocol.condition}</Badge>
                {protocol.successRate && (
                  <Badge variant="outline" className="text-green-600 text-[10px]">{protocol.successRate}% success</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" />{protocol.duration}</div>
              <div><span className="font-medium flex items-center gap-1"><Target className="h-3 w-3" /> Therapies:</span>
                <ul className="ml-4 mt-1 list-disc text-muted-foreground">{protocol.therapies.map((t, i) => <li key={i}>{t}</li>)}</ul>
              </div>
              <div><span className="font-medium flex items-center gap-1"><Pill className="h-3 w-3" /> Medicines:</span>
                <ul className="ml-4 mt-1 list-disc text-muted-foreground">{protocol.medicines.map((m, i) => <li key={i}>{m}</li>)}</ul>
              </div>
              <div><span className="font-medium flex items-center gap-1"><Salad className="h-3 w-3" /> Diet:</span>
                <p className="text-muted-foreground mt-1">{protocol.diet}</p>
              </div>
              <div className="rounded bg-green-50 dark:bg-green-950/30 p-2 text-xs text-green-700 dark:text-green-400">
                <strong>Expected:</strong> {protocol.expectedOutcome}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Used {protocol.usageCount}x</span>
                <Button className="gap-2" size="sm" onClick={() => handleApply(protocol.id, protocol.name)}>
                  <UserPlus className="h-4 w-4" /> Apply to Patient
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TreatmentProtocols;
