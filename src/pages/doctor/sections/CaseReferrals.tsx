import { useState, useEffect } from "react";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Send,
  Inbox,
  ArrowRightLeft,
  UserPlus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Plus,
  MessageSquare,
  Stethoscope,
} from "lucide-react";

const REFERRAL_TYPES = [
  { value: "referral", label: "Referral", description: "Refer patient to another doctor" },
  { value: "second_opinion", label: "Second Opinion", description: "Seek expert opinion on a case" },
  { value: "co_management", label: "Co-Management", description: "Jointly manage a complex case" },
  { value: "transfer", label: "Transfer", description: "Transfer patient care entirely" },
];

const URGENCY_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  emergency: { label: "Emergency", color: "bg-red-100 text-red-700", icon: AlertTriangle },
  urgent: { label: "Urgent", color: "bg-amber-100 text-amber-700", icon: Clock },
  routine: { label: "Routine", color: "bg-green-100 text-green-700", icon: Clock },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700" },
  accepted: { label: "Accepted", color: "bg-green-100 text-green-700" },
  declined: { label: "Declined", color: "bg-red-100 text-red-700" },
  completed: { label: "Completed", color: "bg-blue-100 text-blue-700" },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-700" },
};

interface Referral {
  id: string;
  referring_doctor_id: string;
  referred_to_doctor_id: string;
  referral_type: string;
  urgency: string;
  patient_name: string | null;
  patient_age: number | null;
  patient_gender: string | null;
  condition: string;
  diagnosis: string | null;
  current_treatment: string | null;
  reason_for_referral: string;
  clinical_notes: string | null;
  status: string;
  response_notes: string | null;
  responded_at: string | null;
  outcome_notes: string | null;
  completed_at: string | null;
  created_at: string;
}

const CaseReferrals = () => {
  const { userId } = useDoctor();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("sent");
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [responseAction, setResponseAction] = useState<"accepted" | "declined">("accepted");
  const [form, setForm] = useState({
    referred_to_doctor_id: "",
    referral_type: "referral",
    urgency: "routine",
    patient_name: "",
    patient_age: "",
    patient_gender: "",
    condition: "",
    diagnosis: "",
    current_treatment: "",
    reason_for_referral: "",
    clinical_notes: "",
  });

  useEffect(() => {
    if (!userId) return;
    loadReferrals();
  }, [userId]);

  const loadReferrals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("case_referrals")
      .select("*")
      .or(`referring_doctor_id.eq.${userId},referred_to_doctor_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (!error && data) setReferrals(data as Referral[]);
    setLoading(false);
  };

  const sentReferrals = referrals.filter((r) => r.referring_doctor_id === userId);
  const receivedReferrals = referrals.filter((r) => r.referred_to_doctor_id === userId);

  const handleSubmit = async () => {
    if (!form.condition || !form.reason_for_referral || !form.referred_to_doctor_id) {
      toast.error("Doctor ID, condition, and reason are required");
      return;
    }
    setSaving(true);

    const payload = {
      referring_doctor_id: userId,
      referred_to_doctor_id: form.referred_to_doctor_id,
      referral_type: form.referral_type,
      urgency: form.urgency,
      patient_name: form.patient_name || null,
      patient_age: form.patient_age ? parseInt(form.patient_age) : null,
      patient_gender: form.patient_gender || null,
      condition: form.condition,
      diagnosis: form.diagnosis || null,
      current_treatment: form.current_treatment || null,
      reason_for_referral: form.reason_for_referral,
      clinical_notes: form.clinical_notes || null,
      status: "pending",
    };

    const { error } = await supabase.from("case_referrals").insert(payload);
    if (error) {
      toast.error("Failed to send referral: " + error.message);
    } else {
      toast.success("Referral sent successfully!");
      setShowForm(false);
      setForm({ referred_to_doctor_id: "", referral_type: "referral", urgency: "routine", patient_name: "", patient_age: "", patient_gender: "", condition: "", diagnosis: "", current_treatment: "", reason_for_referral: "", clinical_notes: "" });
      loadReferrals();
    }
    setSaving(false);
  };

  const handleRespond = async (referralId: string) => {
    const { error } = await supabase
      .from("case_referrals")
      .update({
        status: responseAction,
        response_notes: responseText || null,
        responded_at: new Date().toISOString(),
      })
      .eq("id", referralId);

    if (error) {
      toast.error("Failed to respond");
    } else {
      toast.success(responseAction === "accepted" ? "Referral accepted!" : "Referral declined");
      setRespondingTo(null);
      setResponseText("");
      loadReferrals();
    }
  };

  const handleComplete = async (referralId: string, notes: string) => {
    const { error } = await supabase
      .from("case_referrals")
      .update({ status: "completed", outcome_notes: notes, completed_at: new Date().toISOString() })
      .eq("id", referralId);

    if (error) toast.error("Failed to update");
    else { toast.success("Referral marked as completed"); loadReferrals(); }
  };

  const renderReferralCard = (referral: Referral, isSent: boolean) => {
    const urgencyConfig = URGENCY_CONFIG[referral.urgency];
    const statusConfig = STATUS_CONFIG[referral.status];
    return (
      <Card key={referral.id}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                <Badge variant="outline" className="text-[10px]">{REFERRAL_TYPES.find((t) => t.value === referral.referral_type)?.label}</Badge>
                <Badge className={`${urgencyConfig.color} text-[10px]`}>{urgencyConfig.label}</Badge>
              </div>
              <h3 className="font-semibold text-sm mt-2">{referral.condition}</h3>
              {referral.diagnosis && <p className="text-xs text-muted-foreground">{referral.diagnosis}</p>}
            </div>
            <span className="text-xs text-muted-foreground">{new Date(referral.created_at).toLocaleDateString("en-IN")}</span>
          </div>

          {/* Patient Info */}
          {referral.patient_name && (
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span>Patient: {referral.patient_name}</span>
              {referral.patient_age && <span>{referral.patient_age} yrs</span>}
              {referral.patient_gender && <span>{referral.patient_gender}</span>}
            </div>
          )}

          <p className="mt-2 text-sm text-foreground/80">{referral.reason_for_referral}</p>

          {referral.clinical_notes && (
            <div className="mt-2 rounded-md bg-muted/50 p-2">
              <p className="text-xs text-muted-foreground">Clinical Notes: {referral.clinical_notes}</p>
            </div>
          )}

          {referral.current_treatment && (
            <p className="mt-1 text-xs text-muted-foreground">Current Rx: {referral.current_treatment}</p>
          )}

          {/* Response */}
          {referral.response_notes && (
            <div className="mt-3 rounded-lg border bg-muted/30 p-3">
              <p className="text-xs font-medium text-primary">Response</p>
              <p className="text-sm mt-1">{referral.response_notes}</p>
            </div>
          )}

          {/* Outcome */}
          {referral.outcome_notes && (
            <div className="mt-2 rounded-lg border border-green-200 bg-green-50 p-3">
              <p className="text-xs font-medium text-green-700">Outcome</p>
              <p className="text-sm mt-1">{referral.outcome_notes}</p>
            </div>
          )}

          {/* Actions for received referrals */}
          {!isSent && referral.status === "pending" && (
            <>
              {respondingTo === referral.id ? (
                <div className="mt-4 space-y-3 border-t pt-3">
                  <div className="flex gap-2">
                    <Button size="sm" variant={responseAction === "accepted" ? "default" : "outline"} onClick={() => setResponseAction("accepted")}>Accept</Button>
                    <Button size="sm" variant={responseAction === "declined" ? "destructive" : "outline"} onClick={() => setResponseAction("declined")}>Decline</Button>
                  </div>
                  <Textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder={responseAction === "accepted" ? "I'll see this patient. Available on..." : "Reason for declining..."}
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleRespond(referral.id)}>Submit</Button>
                    <Button size="sm" variant="ghost" onClick={() => setRespondingTo(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={() => { setRespondingTo(referral.id); setResponseAction("accepted"); }}>
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Respond
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Case Referrals</h1>
          <p className="text-muted-foreground">Refer patients, seek second opinions, or co-manage complex cases with peers.</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-1">
          <Plus className="h-4 w-4" /> New Referral
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="text-center">
          <CardContent className="pt-5 pb-4">
            <Send className="mx-auto h-5 w-5 text-blue-600 mb-1" />
            <p className="font-display text-xl font-bold">{sentReferrals.length}</p>
            <p className="text-xs text-muted-foreground">Sent</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-5 pb-4">
            <Inbox className="mx-auto h-5 w-5 text-emerald-600 mb-1" />
            <p className="font-display text-xl font-bold">{receivedReferrals.length}</p>
            <p className="text-xs text-muted-foreground">Received</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-5 pb-4">
            <Clock className="mx-auto h-5 w-5 text-amber-600 mb-1" />
            <p className="font-display text-xl font-bold">{referrals.filter((r) => r.status === "pending").length}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-5 pb-4">
            <CheckCircle2 className="mx-auto h-5 w-5 text-green-600 mb-1" />
            <p className="font-display text-xl font-bold">{referrals.filter((r) => r.status === "completed").length}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="sent" className="gap-1"><Send className="h-3.5 w-3.5" /> Sent ({sentReferrals.length})</TabsTrigger>
          <TabsTrigger value="received" className="gap-1"><Inbox className="h-3.5 w-3.5" /> Received ({receivedReferrals.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="sent" className="space-y-3 mt-4">
          {sentReferrals.length === 0 ? (
            <Card className="py-12 text-center">
              <Send className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">No referrals sent yet.</p>
            </Card>
          ) : (
            sentReferrals.map((r) => renderReferralCard(r, true))
          )}
        </TabsContent>

        <TabsContent value="received" className="space-y-3 mt-4">
          {receivedReferrals.length === 0 ? (
            <Card className="py-12 text-center">
              <Inbox className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">No referrals received yet.</p>
            </Card>
          ) : (
            receivedReferrals.map((r) => renderReferralCard(r, false))
          )}
        </TabsContent>
      </Tabs>

      {/* New Referral Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Referral</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Refer To (Doctor User ID) *</Label>
                <Input
                  value={form.referred_to_doctor_id}
                  onChange={(e) => setForm({ ...form, referred_to_doctor_id: e.target.value })}
                  placeholder="Enter doctor's user ID"
                />
                <p className="text-[10px] text-muted-foreground">You can find this from the doctor directory</p>
              </div>
              <div className="space-y-2">
                <Label>Referral Type</Label>
                <Select value={form.referral_type} onValueChange={(v) => setForm({ ...form, referral_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {REFERRAL_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label} — {t.description}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Urgency</Label>
              <Select value={form.urgency} onValueChange={(v) => setForm({ ...form, urgency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Patient Name</Label>
                <Input value={form.patient_name} onChange={(e) => setForm({ ...form, patient_name: e.target.value })} placeholder="Patient name" />
              </div>
              <div className="space-y-2">
                <Label>Age</Label>
                <Input type="number" value={form.patient_age} onChange={(e) => setForm({ ...form, patient_age: e.target.value })} placeholder="Age" />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={form.patient_gender} onValueChange={(v) => setForm({ ...form, patient_gender: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Condition *</Label>
              <Input value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} placeholder="e.g., Chronic Rheumatoid Arthritis (Amavata)" />
            </div>

            <div className="space-y-2">
              <Label>Diagnosis</Label>
              <Input value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} placeholder="e.g., Seropositive RA, DAS28: 4.8" />
            </div>

            <div className="space-y-2">
              <Label>Current Treatment</Label>
              <Textarea value={form.current_treatment} onChange={(e) => setForm({ ...form, current_treatment: e.target.value })} placeholder="Current medications and therapies..." rows={2} />
            </div>

            <div className="space-y-2">
              <Label>Reason for Referral *</Label>
              <Textarea value={form.reason_for_referral} onChange={(e) => setForm({ ...form, reason_for_referral: e.target.value })} placeholder="Why are you referring this patient?" rows={3} />
            </div>

            <div className="space-y-2">
              <Label>Clinical Notes</Label>
              <Textarea value={form.clinical_notes} onChange={(e) => setForm({ ...form, clinical_notes: e.target.value })} placeholder="Additional clinical observations, lab reports, etc." rows={3} />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={saving}>
                {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Send className="mr-1 h-4 w-4" />}
                Send Referral
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CaseReferrals;
