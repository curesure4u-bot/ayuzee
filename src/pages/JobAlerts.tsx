import { useEffect, useState } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useNavigate } from "react-router-dom";
import { Bell, BellOff, Clock, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

/* ─── Constants ─── */
const AYUSH_DEPARTMENTS = [
  "Kayachikitsa (General Medicine)",
  "Shalya Tantra (Surgery)",
  "Shalakya Tantra (ENT & Ophthalmology)",
  "Prasuti & Stree Roga (OBG)",
  "Kaumarbhritya (Pediatrics)",
  "Panchakarma",
  "Dravyaguna (Pharmacology)",
  "Rasashastra & Bhaishajya Kalpana (Pharmaceutics)",
  "Swasthavritta (Preventive Medicine)",
  "Roga Nidana (Pathology)",
  "Organon of Medicine (Homeopathy)",
  "Repertory (Homeopathy)",
  "Materia Medica (Homeopathy)",
  "Unani Medicine",
  "Siddha Medicine",
  "Naturopathy & Drugless Therapy",
  "Yoga Therapy",
];

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh", "Puducherry", "Chandigarh",
];

const JOB_TYPES = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contractual", label: "Contractual" },
  { value: "visiting", label: "Visiting" },
  { value: "internship", label: "Internship" },
];

const FREQUENCY_OPTIONS = [
  { value: "instant", label: "Instant (as posted)", icon: "⚡" },
  { value: "daily", label: "Daily digest", icon: "📅" },
  { value: "weekly", label: "Weekly summary", icon: "📆" },
];

type JobAlert = {
  id: string;
  name: string;
  filters: {
    specialization?: string;
    department?: string;
    state?: string;
    job_type?: string;
    keywords?: string;
    is_government?: boolean;
  };
  frequency: string;
  is_active: boolean;
  matched_count: number;
  last_sent_at: string | null;
  created_at: string;
};

const initialAlertForm = {
  name: "",
  department: "",
  specialization: "",
  state: "",
  job_type: "",
  keywords: "",
  frequency: "daily",
  is_government: false,
};

const JobAlerts = () => {
  usePageSEO({ title: "Job Alerts — Ayuzee" });
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialAlertForm);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate("/auth", { replace: true });
        return;
      }
      setUserId(data.session.user.id);
      loadAlerts(data.session.user.id);
    });
  }, [navigate]);

  const loadAlerts = async (uid: string) => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("job_alerts")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setAlerts(data ?? []);
    setLoading(false);
  };

  const createAlert = async () => {
    if (!userId) return;
    if (!form.name.trim()) {
      toast.error("Please give your alert a name");
      return;
    }
    setSaving(true);

    const filters: JobAlert["filters"] = {};
    if (form.department) filters.department = form.department;
    if (form.specialization) filters.specialization = form.specialization;
    if (form.state) filters.state = form.state;
    if (form.job_type) filters.job_type = form.job_type;
    if (form.keywords.trim()) filters.keywords = form.keywords.trim();
    if (form.is_government) filters.is_government = true;

    const { error } = await (supabase as any).from("job_alerts").insert({
      user_id: userId,
      name: form.name.trim(),
      filters,
      frequency: form.frequency,
      is_active: true,
    });

    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Job alert created! You'll receive notifications when matching jobs appear.");
    setShowCreate(false);
    setForm(initialAlertForm);
    loadAlerts(userId);
  };

  const toggleAlert = async (alertId: string, isActive: boolean) => {
    const { error } = await (supabase as any)
      .from("job_alerts")
      .update({ is_active: !isActive })
      .eq("id", alertId);
    if (error) {
      toast.error(error.message);
      return;
    }
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, is_active: !isActive } : a))
    );
    toast.success(isActive ? "Alert paused" : "Alert resumed");
  };

  const deleteAlert = async (alertId: string) => {
    const { error } = await (supabase as any)
      .from("job_alerts")
      .delete()
      .eq("id", alertId);
    if (error) {
      toast.error(error.message);
      return;
    }
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    toast.success("Alert deleted");
  };

  const formatFilters = (filters: JobAlert["filters"]) => {
    const parts: string[] = [];
    if (filters.department) parts.push(filters.department);
    if (filters.specialization) parts.push(filters.specialization);
    if (filters.state) parts.push(filters.state);
    if (filters.job_type) parts.push(JOB_TYPES.find((j) => j.value === filters.job_type)?.label ?? filters.job_type);
    if (filters.keywords) parts.push(`"${filters.keywords}"`);
    if (filters.is_government) parts.push("Government only");
    return parts.length ? parts.join(" · ") : "All AYUSH jobs";
  };

  if (loading) {
    return <div className="container py-20 text-center text-muted-foreground">Loading your alerts...</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <main>
        {/* Header */}
        <section className="border-b border-border bg-background">
          <div className="container py-12">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <Badge variant="secondary" className="mb-3">Smart Notifications</Badge>
                <h1 className="font-display text-4xl font-semibold md:text-5xl">Job Alerts</h1>
                <p className="mt-3 text-lg text-muted-foreground">
                  Get notified when AYUSH jobs matching your criteria are posted. Never miss an opportunity.
                </p>
              </div>
              <Button variant="hero" onClick={() => setShowCreate(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Create Alert
              </Button>
            </div>
          </div>
        </section>

        {/* Alerts list */}
        <section className="container py-8">
          {alerts.length === 0 ? (
            <Card className="p-12 text-center">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h2 className="mt-4 font-display text-xl font-semibold">No job alerts yet</h2>
              <p className="mt-2 text-muted-foreground">
                Create your first alert to get notified when new AYUSH jobs match your interests.
              </p>
              <Button variant="hero" onClick={() => setShowCreate(true)} className="mt-6 gap-2">
                <Plus className="h-4 w-4" /> Create Your First Alert
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {alerts.map((alert) => (
                <Card key={alert.id} className={`transition-smooth ${!alert.is_active ? "opacity-60" : ""}`}>
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-lg font-semibold">{alert.name}</h3>
                          <Badge variant={alert.is_active ? "secondary" : "outline"}>
                            {alert.is_active ? "Active" : "Paused"}
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            <Clock className="h-3 w-3" />
                            {FREQUENCY_OPTIONS.find((f) => f.value === alert.frequency)?.label ?? alert.frequency}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {formatFilters(alert.filters)}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span>Created {new Date(alert.created_at).toLocaleDateString("en-IN")}</span>
                          {alert.matched_count > 0 && (
                            <span className="text-primary font-medium">{alert.matched_count} jobs matched</span>
                          )}
                          {alert.last_sent_at && (
                            <span>Last sent {new Date(alert.last_sent_at).toLocaleDateString("en-IN")}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{alert.is_active ? "On" : "Off"}</span>
                          <Switch
                            checked={alert.is_active}
                            onCheckedChange={() => toggleAlert(alert.id, alert.is_active)}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => deleteAlert(alert.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Info section */}
          <Card className="mt-8 border-blue-200 bg-blue-50/50">
            <CardContent className="p-5">
              <h3 className="font-semibold text-blue-900 mb-2">How Job Alerts Work</h3>
              <div className="grid gap-3 text-sm text-blue-800 sm:grid-cols-3">
                <div className="flex gap-2">
                  <span className="text-lg">⚡</span>
                  <div>
                    <p className="font-medium">Instant</p>
                    <p className="text-xs text-blue-700">Get notified as soon as a matching job is posted</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-lg">📅</span>
                  <div>
                    <p className="font-medium">Daily Digest</p>
                    <p className="text-xs text-blue-700">One email per day with all new matches</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-lg">📆</span>
                  <div>
                    <p className="font-medium">Weekly Summary</p>
                    <p className="text-xs text-blue-700">Weekly roundup of new AYUSH opportunities</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Create Alert Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Create Job Alert
            </DialogTitle>
            <DialogDescription>
              Define your criteria. We'll notify you when matching AYUSH jobs appear.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div>
              <Label>Alert name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Panchakarma jobs in Kerala"
                className="mt-1"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Department</Label>
                <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Any department" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any department</SelectItem>
                    {AYUSH_DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>State</Label>
                <Select value={form.state} onValueChange={(v) => setForm({ ...form, state: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Any state" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any state</SelectItem>
                    {INDIAN_STATES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Job type</Label>
                <Select value={form.job_type} onValueChange={(v) => setForm({ ...form, job_type: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Any type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any type</SelectItem>
                    {JOB_TYPES.map((jt) => (
                      <SelectItem key={jt.value} value={jt.value}>{jt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Keywords</Label>
                <Input
                  value={form.keywords}
                  onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                  placeholder="e.g., senior, consultant"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <Switch
                checked={form.is_government}
                onCheckedChange={(v) => setForm({ ...form, is_government: v })}
              />
              <div>
                <Label className="text-sm font-medium">Government jobs only</Label>
                <p className="text-xs text-muted-foreground">UPSC, State PSC, CGHS, ECHS positions</p>
              </div>
            </div>

            <div>
              <Label>Notification frequency</Label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {FREQUENCY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm({ ...form, frequency: opt.value })}
                    className={`rounded-lg border p-3 text-center text-xs font-medium transition-smooth ${
                      form.frequency === opt.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    <span className="text-lg block mb-1">{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="hero" onClick={createAlert} disabled={saving}>
              {saving ? "Creating..." : "Create Alert"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobAlerts;
