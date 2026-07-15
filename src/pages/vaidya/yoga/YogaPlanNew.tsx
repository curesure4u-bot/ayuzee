import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDoctor } from "@/hooks/useDoctor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { buildPlanFromProtocol } from "./YogaAssessmentForm";

const YogaPlanNew = () => {
  const { userId } = useDoctor();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const assessmentId = params.get("assessment");
  const presetName = params.get("name") ?? "";

  const [patientName, setPatientName] = useState(presetName);
  const [planName, setPlanName] = useState("");
  const [protocolId, setProtocolId] = useState("");
  const [protocols, setProtocols] = useState<any[]>([]);
  const [planType, setPlanType] = useState<"therapeutic" | "beginner" | "advanced" | "custom" | "7_day" | "21_day" | "48_day_rejuvenation">("therapeutic");
  const [duration, setDuration] = useState("6");
  const [frequency, setFrequency] = useState("5");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("yoga_condition_protocols").select("id, condition_name").eq("is_published", true).order("condition_name")
      .then(({ data }) => setProtocols(data ?? []));
  }, []);

  const handleCreate = async (auto: boolean) => {
    if (!userId) { toast.error("Sign in required"); return; }
    if (!patientName.trim()) { toast.error("Patient name required"); return; }
    setSaving(true);
    try {
      if (auto && protocolId) {
        const { data: pid, error } = await buildPlanFromProtocol({
          userId, assessmentId, patientName: patientName.trim(), protocolId,
        });
        if (error) throw error;
        toast.success("Plan generated");
        navigate(`/vaidya/yoga/plans/${pid}`);
        return;
      }
      const { data, error } = await supabase.from("yoga_plans").insert([{
        doctor_user_id: userId,
        patient_name: patientName.trim(),
        plan_name: planName.trim() || `${patientName.trim()} – Yoga Plan`,
        plan_type: planType,
        duration_weeks: Number(duration) || null,
        frequency_per_week: Number(frequency) || null,
        assessment_id: assessmentId,
        status: "draft",
      }]).select().single();
      if (error) throw error;
      toast.success("Plan created");
      navigate(`/vaidya/yoga/plans/${data.id}`);
    } catch (e: any) {
      toast.error(e.message || "Create failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="rounded-2xl">
      <CardHeader><CardTitle className="text-base">New Yoga Plan</CardTitle></CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <Field label="Patient name *">
          <Input value={patientName} onChange={(e) => setPatientName(e.target.value)} />
        </Field>
        <Field label="Plan name">
          <Input value={planName} onChange={(e) => setPlanName(e.target.value)} placeholder="auto if blank" />
        </Field>
        <Field label="Plan type">
          <Select value={planType} onValueChange={(v: any) => setPlanType(v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="therapeutic">Therapeutic</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="7_day">7-day</SelectItem>
              <SelectItem value="21_day">21-day</SelectItem>
              <SelectItem value="48_day_rejuvenation">48-day Rejuvenation</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Auto-generate from protocol">
          <Select value={protocolId} onValueChange={setProtocolId}>
            <SelectTrigger><SelectValue placeholder="(optional)" /></SelectTrigger>
            <SelectContent>
              {protocols.map((p) => <SelectItem key={p.id} value={p.id}>{p.condition_name}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Duration (weeks)"><Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} /></Field>
        <Field label="Sessions / week"><Input type="number" value={frequency} onChange={(e) => setFrequency(e.target.value)} /></Field>

        <div className="md:col-span-2 flex flex-wrap justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => handleCreate(false)} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create empty plan
          </Button>
          <Button onClick={() => handleCreate(true)} disabled={saving || !protocolId}>
            <Sparkles className="mr-2 h-4 w-4" /> Generate from protocol
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const Field = ({ label, children }: any) => (
  <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>
);

export default YogaPlanNew;
