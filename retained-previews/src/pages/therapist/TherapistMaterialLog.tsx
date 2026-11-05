import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Package, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { maskPatientName } from "@/utils/therapistPrivacy";
import type { TherapistContext } from "./TherapistLayout";

interface MaterialItem {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  prescribed_quantity: number;
}

interface UnloggedSession {
  id: string;
  therapy_name: string;
  session_date: string;
  patient_name: string;
  venue_id: string | null;
}

interface MaterialLog {
  id: string;
  session_id: string;
  items: MaterialItem[];
  estimated_cost: number;
  venue_acknowledged: boolean;
  venue_acknowledged_by: string | null;
  venue_acknowledged_at: string | null;
  has_discrepancy: boolean;
  discrepancy_notes: string | null;
  created_at: string;
  therapy_name?: string;
  session_date?: string;
  patient_name?: string;
}

const CATEGORIES = ["oil", "herb", "powder", "decoction", "linen", "consumable", "other"];
const UNITS = ["ml", "g", "pieces", "sets"];

const emptyItem: MaterialItem = {
  name: "",
  category: "oil",
  quantity: 0,
  unit: "ml",
  prescribed_quantity: 0,
};

export default function TherapistMaterialLog() {
  const { therapist } = useOutletContext<TherapistContext>();
  const [unloggedSessions, setUnloggedSessions] = useState<UnloggedSession[]>([]);
  const [logHistory, setLogHistory] = useState<MaterialLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<UnloggedSession | null>(null);
  const [items, setItems] = useState<MaterialItem[]>([{ ...emptyItem }]);
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    if (therapist?.id) {
      fetchData();
    }
  }, [therapist?.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchUnloggedSessions(), fetchLogHistory()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnloggedSessions = async () => {
    try {
      // Get completed sessions for this therapist
      const { data: sessions, error: sessErr } = await (supabase as any)
        .from("therapy_sessions")
        .select("id, therapy_name, session_date, patient_name, venue_id")
        .eq("therapist_id", therapist.id)
        .eq("status", "completed")
        .order("session_date", { ascending: false })
        .limit(50);

      if (sessErr) throw sessErr;

      if (!sessions || sessions.length === 0) {
        setUnloggedSessions([]);
        return;
      }

      // Get session IDs that already have material logs
      const sessionIds = sessions.map((s: any) => s.id);
      const { data: existingLogs, error: logErr } = await (supabase as any)
        .from("therapist_material_consumption")
        .select("session_id")
        .eq("therapist_id", therapist.id)
        .in("session_id", sessionIds);

      if (logErr) throw logErr;

      const loggedIds = new Set((existingLogs || []).map((l: any) => l.session_id));
      const unlogged = sessions.filter((s: any) => !loggedIds.has(s.id));
      setUnloggedSessions(unlogged);
    } catch (error) {
      console.error("Error fetching unlogged sessions:", error);
    }
  };

  const fetchLogHistory = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("therapist_material_consumption")
        .select("*")
        .eq("therapist_id", therapist.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Enrich with session details
      if (data && data.length > 0) {
        const sessionIds = data.map((d: any) => d.session_id);
        const { data: sessions } = await (supabase as any)
          .from("therapy_sessions")
          .select("id, therapy_name, session_date, patient_name")
          .in("id", sessionIds);

        const sessionMap = new Map(
          (sessions || []).map((s: any) => [s.id, s])
        );

        const enriched = data.map((log: any) => {
          const session = sessionMap.get(log.session_id) as any;
          return {
            ...log,
            therapy_name: session?.therapy_name || "Unknown",
            session_date: session?.session_date || "",
            patient_name: session?.patient_name || "Unknown",
          };
        });
        setLogHistory(enriched);
      } else {
        setLogHistory([]);
      }
    } catch (error) {
      console.error("Error fetching log history:", error);
    }
  };

  const openLogDialog = (session: UnloggedSession) => {
    setSelectedSession(session);
    setItems([{ ...emptyItem }]);
    setEstimatedCost(0);
    setDialogOpen(true);
  };

  const addItem = () => {
    setItems([...items, { ...emptyItem }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof MaterialItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSubmit = async () => {
    if (!selectedSession) return;

    const validItems = items.filter((item) => item.name.trim() !== "");
    if (validItems.length === 0) {
      toast.error("Please add at least one material item");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await (supabase as any)
        .from("therapist_material_consumption")
        .insert({
          therapist_id: therapist.id,
          session_id: selectedSession.id,
          items: validItems,
          estimated_cost: estimatedCost,
          venue_id: selectedSession.venue_id,
          venue_acknowledged: false,
          has_discrepancy: false,
        });

      if (error) throw error;

      toast.success("Material log submitted successfully");
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error submitting material log:", error);
      toast.error("Failed to submit material log");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Material Log</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading material logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Package className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Material Log</h1>
      </div>

      {/* Unlogged Sessions */}
      {unloggedSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sessions Needing Material Log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {unloggedSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium text-sm">{session.therapy_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(session.session_date).toLocaleDateString()} —{" "}
                    {maskPatientName(session.patient_name)}
                  </p>
                </div>
                <Button size="sm" onClick={() => openLogDialog(session)}>
                  Log Materials
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {unloggedSessions.length === 0 && logHistory.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground text-center">
              No sessions to log
            </p>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Material logs will appear here after you complete sessions.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Log History */}
      {logHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Logged Materials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {logHistory.map((log) => (
              <Collapsible
                key={log.id}
                open={expandedLogId === log.id}
                onOpenChange={(open) => setExpandedLogId(open ? log.id : null)}
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="text-left">
                      <p className="font-medium text-sm">{log.therapy_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.session_date
                          ? new Date(log.session_date).toLocaleDateString()
                          : ""}{" "}
                        — {maskPatientName(log.patient_name || "")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        ₹{log.estimated_cost}
                      </span>
                      {log.venue_acknowledged ? (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Acknowledged
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-3 border border-t-0 rounded-b-lg bg-muted/30 space-y-2">
                    {(log.items || []).map((item: MaterialItem, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>
                          {item.name} ({item.category})
                        </span>
                        <span>
                          {item.quantity} {item.unit}
                          {item.prescribed_quantity > 0 && (
                            <span className="text-muted-foreground ml-1">
                              / {item.prescribed_quantity} prescribed
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                    {log.has_discrepancy && log.discrepancy_notes && (
                      <p className="text-xs text-red-600 mt-2">
                        Discrepancy: {log.discrepancy_notes}
                      </p>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Material Log Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Log Materials Used</DialogTitle>
          </DialogHeader>

          {selectedSession && (
            <div className="space-y-4">
              {/* Session Info */}
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium text-sm">{selectedSession.therapy_name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(selectedSession.session_date).toLocaleDateString()} —{" "}
                  {maskPatientName(selectedSession.patient_name)}
                </p>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Materials</p>
                  <Button size="sm" variant="outline" onClick={addItem}>
                    <Plus className="h-3 w-3 mr-1" /> Add Item
                  </Button>
                </div>

                {items.map((item, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        Item {index + 1}
                      </span>
                      {items.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      )}
                    </div>
                    <Input
                      placeholder="Material name"
                      value={item.name}
                      onChange={(e) => updateItem(index, "name", e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        value={item.category}
                        onValueChange={(val) => updateItem(index, "category", val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={item.unit}
                        onValueChange={(val) => updateItem(index, "unit", val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {UNITS.map((u) => (
                            <SelectItem key={u} value={u}>
                              {u}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground">Quantity Used</label>
                        <Input
                          type="number"
                          min={0}
                          value={item.quantity || ""}
                          onChange={(e) =>
                            updateItem(index, "quantity", parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Prescribed Qty</label>
                        <Input
                          type="number"
                          min={0}
                          value={item.prescribed_quantity || ""}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "prescribed_quantity",
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Estimated Cost */}
              <div>
                <label className="text-sm font-medium">Total Estimated Cost (₹)</label>
                <Input
                  type="number"
                  min={0}
                  value={estimatedCost || ""}
                  onChange={(e) => setEstimatedCost(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>

              {/* Submit */}
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Material Log"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
