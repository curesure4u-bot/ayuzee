import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import SpineChecklist from "@/components/spine/SpineChecklist";
import { CHECKLIST_TEMPLATES } from "@/components/spine/spineChecklistTemplates";
import {
  ClipboardCheck, ShieldCheck, AlertTriangle, History, ArrowLeft, CheckCircle2, Clock,
} from "lucide-react";

interface ChecklistRecord {
  id: string;
  checklist_type: string;
  checklist_title: string;
  patient_name: string | null;
  completion_pct: number;
  all_clear: boolean;
  red_flags_triggered: string[] | null;
  performed_by: string | null;
  created_at: string;
}

export default function SpineChecklists() {
  const [activeType, setActiveType] = useState<string | null>(null);
  const [records, setRecords] = useState<ChecklistRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const { data } = await (supabase.from("spine_checklists") as any)
        .select("id, checklist_type, checklist_title, patient_name, completion_pct, all_clear, red_flags_triggered, performed_by, created_at")
        .order("created_at", { ascending: false })
        .limit(25);
      setRecords((data as ChecklistRecord[]) || []);
    } catch {
      setRecords([]);
    }
    setLoading(false);
  };

  useEffect(() => { loadRecords(); }, []);

  const active = CHECKLIST_TEMPLATES.find((t) => t.type === activeType);

  // ─── Detail view: one checklist open ───
  if (active) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <Button variant="ghost" size="sm" onClick={() => { setActiveType(null); loadRecords(); }} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to all checklists
        </Button>
        <SpineChecklist template={active} />
      </div>
    );
  }

  // ─── Library grid ───
  const redFlagCount = records.filter((r) => (r.red_flags_triggered?.length || 0) > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 text-emerald-600" />
            Spine SOP & Safety Checklists
          </h1>
          <p className="text-muted-foreground mt-1">
            Standard operating checklists to keep every day safe, consistent and audit-ready — usable by any team member.
          </p>
        </div>
        <Badge className="bg-emerald-100 text-emerald-700"><ShieldCheck className="h-3 w-3 mr-1" /> Safety & Quality</Badge>
      </div>

      {/* Why this matters (non-tech friendly) */}
      <Card className="border-emerald-200 bg-emerald-50/40">
        <CardContent className="pt-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">How to use</p>
          <p>Pick a checklist below and tick each item as you do it. Items marked <span className="text-red-500 font-medium">*</span> are required.
          Red-flag items marked in red mean <span className="text-red-600 font-medium">STOP</span> — if any is present, do not treat and refer the patient.
          Every completed checklist is saved as a record you can review later.</p>
        </CardContent>
      </Card>

      {/* Checklist cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {CHECKLIST_TEMPLATES.map((t) => {
          const req = t.items.filter((i) => i.required).length;
          const rf = t.items.filter((i) => i.redFlag).length;
          return (
            <Card
              key={t.type}
              className="cursor-pointer transition hover:shadow-md hover:border-emerald-300"
              onClick={() => setActiveType(t.type)}
            >
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <span className="text-2xl">{t.icon}</span>
                  {rf > 0 && <Badge className="bg-red-100 text-red-700 text-[9px]"><AlertTriangle className="h-2.5 w-2.5 mr-0.5" /> {rf} red flags</Badge>}
                </div>
                <p className="font-semibold text-sm mt-2">{t.title}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.purpose}</p>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="outline" className="text-[10px]">{t.items.length} items</Badge>
                  {req > 0 && <Badge variant="outline" className="text-[10px]">{req} required</Badge>}
                </div>
                <Button size="sm" className="w-full mt-3">Open checklist</Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent records */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2"><History className="h-4 w-4" /> Recent Checklist Records</CardTitle>
            <div className="flex items-center gap-2">
              {redFlagCount > 0 && <Badge className="bg-red-100 text-red-700 text-[10px]">{redFlagCount} with red flags</Badge>}
              <Button variant="ghost" size="sm" onClick={loadRecords}>Refresh</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-6">Loading...</p>
          ) : records.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No checklist records yet. Complete a checklist above to start building your audit trail.</p>
          ) : (
            <div className="space-y-1.5">
              {records.map((r) => {
                const hasRf = (r.red_flags_triggered?.length || 0) > 0;
                return (
                  <div key={r.id} className={`flex items-center justify-between gap-2 rounded-md border p-2.5 text-sm ${hasRf ? "border-red-200 bg-red-50/40" : "border-border"}`}>
                    <div className="min-w-0">
                      <p className="font-medium truncate flex items-center gap-1.5">
                        {hasRf ? <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                          : r.all_clear ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                          : <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                        {r.checklist_title}
                        {r.patient_name && <span className="text-muted-foreground font-normal">· {r.patient_name}</span>}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {new Date(r.created_at).toLocaleString()}{r.performed_by ? ` · ${r.performed_by}` : ""}
                      </p>
                    </div>
                    <div className="shrink-0">
                      {hasRf ? <Badge className="bg-red-100 text-red-700 text-[9px]">Red flag</Badge>
                        : r.all_clear ? <Badge className="bg-green-100 text-green-700 text-[9px]">All clear</Badge>
                        : <Badge variant="outline" className="text-[9px]">{r.completion_pct}%</Badge>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
