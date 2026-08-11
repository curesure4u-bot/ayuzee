import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, AlertTriangle, ChevronDown, ChevronUp, Search } from "lucide-react";

interface TherapistContext {
  therapist: { id: string; user_id: string; full_name: string; verification_status: string; is_available: boolean };
  reload: () => Promise<void>;
}

interface Protocol {
  id: string;
  therapy_type: string;
  title: string;
  description: string;
  preparation_steps: any[];
  procedure_steps: any[];
  post_procedure_steps: any[];
  indications: string[];
  contraindications: string[];
  precautions: string[];
  duration_minutes: number;
  materials_required: any[];
  reference_text: string;
  difficulty_level: string;
}

export default function TherapistProtocolLibrary() {
  const { therapist } = useOutletContext<TherapistContext>();
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [therapyTypes, setTherapyTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchProtocols();
  }, []);

  const fetchProtocols = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("therapy_protocol_library")
      .select("*")
      .order("therapy_type", { ascending: true });

    if (error) {
      toast.error("Failed to load protocols");
    } else if (data) {
      setProtocols(data);
      const types = [...new Set(data.map((p: Protocol) => p.therapy_type))].filter(Boolean) as string[];
      setTherapyTypes(types);
    }
    setLoading(false);
  };

  const filteredProtocols = protocols.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === "all" || p.therapy_type === filterType;
    return matchSearch && matchType;
  });

  const grouped = filteredProtocols.reduce((acc, p) => {
    const type = p.therapy_type || "Uncategorized";
    if (!acc[type]) acc[type] = [];
    acc[type].push(p);
    return acc;
  }, {} as Record<string, Protocol[]>);

  const renderSteps = (steps: any[], label: string) => {
    if (!steps || steps.length === 0) return null;
    return (
      <div className="mt-3">
        <h4 className="font-semibold text-sm mb-1">{label}</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
          {steps.map((step: any, i: number) => (
            <li key={i}>{typeof step === "string" ? step : step.description || step.step || JSON.stringify(step)}</li>
          ))}
        </ol>
      </div>
    );
  };

  if (loading) {
    return <div className="p-6 text-center">Loading protocol library...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <BookOpen className="w-6 h-6" />Panchakarma Protocol Library
      </h1>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search protocols..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {therapyTypes.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Protocols grouped by type */}
      {Object.keys(grouped).length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No protocols found
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([type, typeProtocols]) => (
          <div key={type} className="space-y-3">
            <h2 className="text-lg font-semibold border-b pb-2">{type}</h2>
            {typeProtocols.map((protocol) => (
              <Card key={protocol.id}>
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => setExpandedId(expandedId === protocol.id ? null : protocol.id)}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{protocol.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      {protocol.difficulty_level && (
                        <Badge variant="outline">{protocol.difficulty_level}</Badge>
                      )}
                      {protocol.duration_minutes && (
                        <Badge variant="secondary">{protocol.duration_minutes} min</Badge>
                      )}
                      {expandedId === protocol.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                  {protocol.description && (
                    <p className="text-sm text-muted-foreground mt-1">{protocol.description}</p>
                  )}
                </CardHeader>

                {expandedId === protocol.id && (
                  <CardContent className="space-y-4">
                    {/* Contraindications Alert */}
                    {protocol.contraindications && protocol.contraindications.length > 0 && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-semibold text-sm text-red-700 flex items-center gap-1 mb-2">
                          <AlertTriangle className="w-4 h-4" />Contraindications
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {protocol.contraindications.map((c, i) => (
                            <Badge key={i} variant="destructive" className="text-xs">{c}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Indications */}
                    {protocol.indications && protocol.indications.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Indications</h4>
                        <div className="flex flex-wrap gap-1">
                          {protocol.indications.map((ind, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{ind}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Steps */}
                    {renderSteps(protocol.preparation_steps, "Preparation Steps")}
                    {renderSteps(protocol.procedure_steps, "Procedure Steps")}
                    {renderSteps(protocol.post_procedure_steps, "Post-Procedure Steps")}

                    {/* Precautions */}
                    {protocol.precautions && protocol.precautions.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Precautions</h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                          {protocol.precautions.map((p, i) => <li key={i}>{p}</li>)}
                        </ul>
                      </div>
                    )}

                    {/* Materials */}
                    {protocol.materials_required && protocol.materials_required.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Materials Required</h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                          {protocol.materials_required.map((m: any, i: number) => (
                            <li key={i}>{typeof m === "string" ? m : m.name || JSON.stringify(m)}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Reference */}
                    {protocol.reference_text && (
                      <div className="p-3 bg-muted rounded-lg">
                        <h4 className="font-semibold text-sm mb-1">Reference</h4>
                        <p className="text-sm">{protocol.reference_text}</p>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
