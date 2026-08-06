import { useState, useEffect } from "react";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  GraduationCap,
  Plus,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Target,
  BookOpen,
  Video,
  Users,
  FileText,
  Microscope,
  Loader2,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

const ACTIVITY_TYPES = [
  { value: "course", label: "Course", icon: BookOpen },
  { value: "webinar", label: "Webinar", icon: Video },
  { value: "workshop", label: "Workshop", icon: Users },
  { value: "conference", label: "Conference", icon: Users },
  { value: "publication", label: "Publication", icon: FileText },
  { value: "research", label: "Research", icon: Microscope },
  { value: "case_presentation", label: "Case Presentation", icon: FileText },
  { value: "peer_review", label: "Peer Review", icon: CheckCircle2 },
  { value: "teaching", label: "Teaching", icon: GraduationCap },
  { value: "online_module", label: "Online Module", icon: BookOpen },
];

const CREDIT_CATEGORIES = [
  { value: "Category 1", label: "Category 1 (Formal CME)", description: "Accredited courses, conferences" },
  { value: "Category 2", label: "Category 2 (Self-directed)", description: "Publications, research, teaching" },
  { value: "Category 3", label: "Category 3 (Practice-based)", description: "Case presentations, audits" },
];

interface CmeCredit {
  id: string;
  activity_type: string;
  activity_title: string;
  provider: string | null;
  credits_earned: number;
  credit_category: string;
  date_completed: string;
  certificate_url: string | null;
  certificate_number: string | null;
  valid_until: string | null;
  description: string | null;
  verified: boolean;
  status: string;
  created_at: string;
}

interface CmeStats {
  totalCredits: number;
  thisYear: number;
  cat1: number;
  cat2: number;
  cat3: number;
  verified: number;
  required: number;
}

const CMECredits = () => {
  const { userId } = useDoctor();
  const [credits, setCredits] = useState<CmeCredit[]>([]);
  const [stats, setStats] = useState<CmeStats>({ totalCredits: 0, thisYear: 0, cat1: 0, cat2: 0, cat3: 0, verified: 0, required: 30 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    activity_type: "course",
    activity_title: "",
    provider: "",
    credits_earned: "1",
    credit_category: "Category 1",
    date_completed: "",
    certificate_number: "",
    valid_until: "",
    description: "",
  });

  useEffect(() => {
    if (!userId) return;
    loadCredits();
  }, [userId]);

  const loadCredits = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cme_credits")
      .select("*")
      .eq("doctor_id", userId)
      .eq("status", "active")
      .order("date_completed", { ascending: false });

    if (!error && data) {
      const c = data as CmeCredit[];
      setCredits(c);
      calculateStats(c);
    }
    setLoading(false);
  };

  const calculateStats = (c: CmeCredit[]) => {
    const currentYear = new Date().getFullYear();
    const thisYearCredits = c.filter((x) => new Date(x.date_completed).getFullYear() === currentYear);

    setStats({
      totalCredits: c.reduce((s, x) => s + x.credits_earned, 0),
      thisYear: thisYearCredits.reduce((s, x) => s + x.credits_earned, 0),
      cat1: c.filter((x) => x.credit_category === "Category 1").reduce((s, x) => s + x.credits_earned, 0),
      cat2: c.filter((x) => x.credit_category === "Category 2").reduce((s, x) => s + x.credits_earned, 0),
      cat3: c.filter((x) => x.credit_category === "Category 3").reduce((s, x) => s + x.credits_earned, 0),
      verified: c.filter((x) => x.verified).reduce((s, x) => s + x.credits_earned, 0),
      required: 30,
    });
  };

  const handleSubmit = async () => {
    if (!form.activity_title || !form.date_completed) {
      toast.error("Activity title and date are required");
      return;
    }
    setSaving(true);

    const payload = {
      doctor_id: userId,
      activity_type: form.activity_type,
      activity_title: form.activity_title,
      provider: form.provider || null,
      credits_earned: parseFloat(form.credits_earned) || 1,
      credit_category: form.credit_category,
      date_completed: form.date_completed,
      certificate_number: form.certificate_number || null,
      valid_from: form.date_completed,
      valid_until: form.valid_until || null,
      description: form.description || null,
      status: "active",
    };

    const { error } = await supabase.from("cme_credits").insert(payload);
    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success("CME credit recorded successfully!");
      setShowForm(false);
      setForm({ activity_type: "course", activity_title: "", provider: "", credits_earned: "1", credit_category: "Category 1", date_completed: "", certificate_number: "", valid_until: "", description: "" });
      loadCredits();
    }
    setSaving(false);
  };

  const progressPct = Math.min(100, (stats.thisYear / stats.required) * 100);
  const getActivityIcon = (type: string) => {
    const found = ACTIVITY_TYPES.find((t) => t.value === type);
    return found ? found.icon : BookOpen;
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
          <h1 className="font-display text-2xl font-bold">CME Credits</h1>
          <p className="text-muted-foreground">Track your Continuing Medical Education credits for council compliance.</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-1">
          <Plus className="h-4 w-4" /> Add Credit
        </Button>
      </div>

      {/* Annual Progress */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold">Annual CME Progress ({new Date().getFullYear()})</h3>
              <p className="text-sm text-muted-foreground">{stats.thisYear} of {stats.required} credits earned</p>
            </div>
            <div className="text-right">
              <p className="font-display text-3xl font-bold text-primary">{stats.thisYear}</p>
              <p className="text-xs text-muted-foreground">/ {stats.required} required</p>
            </div>
          </div>
          <Progress value={progressPct} className="h-3" />
          {progressPct >= 100 ? (
            <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> Annual requirement met!
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground flex items-center gap-1">
              <AlertCircle className="h-4 w-4" /> {stats.required - stats.thisYear} more credits needed this year
            </p>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="text-center">
          <CardContent className="pt-5 pb-4">
            <p className="font-display text-2xl font-bold">{stats.totalCredits}</p>
            <p className="text-xs text-muted-foreground">Lifetime Credits</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-5 pb-4">
            <p className="font-display text-2xl font-bold text-blue-600">{stats.cat1}</p>
            <p className="text-xs text-muted-foreground">Category 1</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-5 pb-4">
            <p className="font-display text-2xl font-bold text-emerald-600">{stats.cat2}</p>
            <p className="text-xs text-muted-foreground">Category 2</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-5 pb-4">
            <p className="font-display text-2xl font-bold text-green-600">{stats.verified}</p>
            <p className="text-xs text-muted-foreground">Verified</p>
          </CardContent>
        </Card>
      </div>

      {/* Credits List */}
      {credits.length === 0 ? (
        <Card className="py-12 text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-muted-foreground">No CME credits recorded yet. Start tracking your learning activities!</p>
          <Button className="mt-4" onClick={() => setShowForm(true)}>Add Your First Credit</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {credits.map((credit) => {
            const ActivityIcon = getActivityIcon(credit.activity_type);
            return (
              <Card key={credit.id}>
                <CardContent className="flex items-start gap-4 p-5">
                  <div className="rounded-lg bg-primary/10 p-2.5">
                    <ActivityIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm">{credit.activity_title}</h3>
                      {credit.verified && (
                        <Badge variant="outline" className="border-green-300 bg-green-50 text-green-700 text-[10px] gap-0.5">
                          <CheckCircle2 className="h-2.5 w-2.5" /> Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {credit.provider && <span>{credit.provider}</span>}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(credit.date_completed).toLocaleDateString("en-IN")}
                      </span>
                      <Badge variant="outline" className="text-[10px]">{credit.credit_category}</Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {ACTIVITY_TYPES.find((t) => t.value === credit.activity_type)?.label}
                      </Badge>
                    </div>
                    {credit.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{credit.description}</p>
                    )}
                    {credit.valid_until && new Date(credit.valid_until) < new Date() && (
                      <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> Expired on {new Date(credit.valid_until).toLocaleDateString("en-IN")}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display text-lg font-bold text-primary">{credit.credits_earned}</p>
                    <p className="text-[10px] text-muted-foreground">credits</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Credit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record CME Credit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Activity Type *</Label>
                <Select value={form.activity_type} onValueChange={(v) => setForm({ ...form, activity_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Credit Category *</Label>
                <Select value={form.credit_category} onValueChange={(v) => setForm({ ...form, credit_category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CREDIT_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Activity Title *</Label>
              <Input
                value={form.activity_title}
                onChange={(e) => setForm({ ...form, activity_title: e.target.value })}
                placeholder="e.g., Advanced Panchakarma Techniques Workshop"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Provider / Organizer</Label>
                <Input
                  value={form.provider}
                  onChange={(e) => setForm({ ...form, provider: e.target.value })}
                  placeholder="e.g., CCIM, Ayuzee Academy"
                />
              </div>
              <div className="space-y-2">
                <Label>Credits Earned *</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={form.credits_earned}
                  onChange={(e) => setForm({ ...form, credits_earned: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Date Completed *</Label>
                <Input type="date" value={form.date_completed} onChange={(e) => setForm({ ...form, date_completed: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Valid Until</Label>
                <Input type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Certificate Number</Label>
                <Input value={form.certificate_number} onChange={(e) => setForm({ ...form, certificate_number: e.target.value })} placeholder="CERT-2024-XXX" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief details about the activity..."
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={saving}>
                {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Award className="mr-1 h-4 w-4" />}
                Save Credit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CMECredits;
