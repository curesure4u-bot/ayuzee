import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Video, BookOpen, FileText, FlaskConical, IndianRupee,
  ExternalLink, Play, Download, Star, TrendingUp, Users,
  Clock, Target, CheckCircle2, Award, Brain, Zap, Heart,
  ArrowRight, Calendar, Shield, Plus, Trash2, Edit2, Save,
  X, Loader2,
} from "lucide-react";

// ─── Types ───
interface ResourceRecord {
  id: string;
  resource_type: string;
  title: string;
  therapy: string;
  category: string;
  description: string;
  video_url: string;
  video_duration: string;
  video_language: string;
  patient_profile: string;
  condition: string;
  vas_before: number | null;
  vas_after: number | null;
  treatment_duration: string;
  treatment_given: string;
  outcome: string;
  key_learning: string;
  follow_up: string;
  pages: string;
  contents: string[];
  format: string;
  authors: string;
  journal: string;
  publication_year: number | null;
  study_type: string;
  pubmed_id: string;
  pubmed_url: string;
  finding: string;
  evidence_level: string;
  cost_per_session: number | null;
  sessions_needed: number | null;
  total_cost: number | null;
  success_rate: number | null;
  avg_pain_reduction: number | null;
  cost_per_vas_point: number | null;
  roi: string;
  break_even_sessions: number | null;
  compared_to_modern: string;
  package_suggestion: string;
  revenue_per_patient: number | null;
  patient_retention: number | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

type ResourceType = "video" | "case_study" | "protocol" | "research" | "cost_benefit";

// ─── Fallback static data (used when DB is empty) ───
const fallbackVideos = [
  { title: "Agnikarma Procedure — Live Demonstration", therapy: "Agnikarma", category: "Level 1", video_duration: "8:45", video_url: "https://www.youtube.com/watch?v=agnikarma-demo", description: "Step-by-step Agnikarma using Panchdhatu Shalaka on trigger points.", video_language: "English + Hindi" },
  { title: "Kati Basti — Complete Setup & Procedure", therapy: "Kati Basti", category: "Level 2 (PK)", video_duration: "15:20", video_url: "https://www.youtube.com/watch?v=kati-basti-procedure", description: "Dough ring preparation, oil temperature check, retention technique.", video_language: "English" },
  { title: "Acupuncture for Low Back Pain — BL40, BL60", therapy: "Acupuncture", category: "Integrative", video_duration: "10:45", video_url: "https://www.youtube.com/watch?v=acu-lbp-points", description: "Point location, needle depth, De Qi sensation for lumbar pain.", video_language: "English" },
  { title: "Kukundara Marma for Low Back Pain", therapy: "Marma Therapy", category: "Level 1", video_duration: "7:30", video_url: "https://www.youtube.com/watch?v=kukundara-marma", description: "Location and stimulation technique for sacral Marma point.", video_language: "English + Malayalam" },
  { title: "Spine Yoga Protocol — Full Sequence", therapy: "Spine Yoga", category: "Yoga/Exercise", video_duration: "20:00", video_url: "https://www.youtube.com/watch?v=spine-yoga-sequence", description: "Complete 20-min home exercise routine for chronic back pain.", video_language: "English" },
];

const fallbackCases = [
  { title: "Chronic Sciatica — Farmer", therapy: "Agnikarma", patient_profile: "Male, 45 yrs, Farmer", condition: "Chronic Sciatica (L5-S1) — 2 years", vas_before: 8, vas_after: 2, treatment_duration: "3 sessions", treatment_given: "Agnikarma on 4 gluteal trigger points", outcome: "VAS 8→2. SLR improved 30°→70°.", key_learning: "Precise TrP identification before cauterization is key.", follow_up: "Monthly maintenance. Pain-free at 6 months." },
  { title: "L4-L5 Disc Bulge — Auto Driver", therapy: "Kati Basti", patient_profile: "Male, 52 yrs, Auto Driver", condition: "L4-L5 Disc Bulge — MRI confirmed", vas_before: 9, vas_after: 3, treatment_duration: "14 days", treatment_given: "Kati Basti × 14 + Tikta Ksheer Basti × 16", outcome: "VAS 9→3. MRI showed disc regression at 3 months.", key_learning: "Combined Kati Basti + Basti protocol needed for disc cases.", follow_up: "Monthly Kati Basti × 6. Symptom-free at 1 year." },
  { title: "Cervical Spondylosis — Software Engineer", therapy: "Acupuncture", patient_profile: "Male, 35 yrs, Software Engineer", condition: "C5-C6 with arm numbness — 1 year", vas_before: 7, vas_after: 2, treatment_duration: "12 sessions", treatment_given: "Acupuncture + Electroacupuncture 2Hz", outcome: "VAS 7→2. Arm numbness resolved by session 8.", key_learning: "Electroacupuncture 2Hz targets nerve regeneration.", follow_up: "Weekly then monthly. Numbness-free at 6 months." },
];

// ─── Component ───
export default function SpineClinicalResources() {
  const [activeTab, setActiveTab] = useState("videos");
  const [resources, setResources] = useState<ResourceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [videoFilter, setVideoFilter] = useState("all");
  const [caseFilter, setCaseFilter] = useState("all");
  const [saving, setSaving] = useState(false);

  // Form state for adding/editing
  const [form, setForm] = useState<Partial<ResourceRecord>>({});

  // Fetch user and resources
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);

      const { data, error } = await supabase
        .from("spine_clinical_resources")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (!error && data && data.length > 0) {
        setResources(data as unknown as ResourceRecord[]);
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  // Get resources by type
  const getByType = (type: ResourceType) => resources.filter(r => r.resource_type === type);
  const videos = getByType("video");
  const cases = getByType("case_study");
  const protocols = getByType("protocol");
  const research = getByType("research");
  const costBenefit = getByType("cost_benefit");

  // CRUD Operations
  const handleSave = async () => {
    if (!form.title) { toast.error("Title is required"); return; }
    setSaving(true);

    const resourceType = activeTab === "videos" ? "video"
      : activeTab === "cases" ? "case_study"
      : activeTab === "protocols" ? "protocol"
      : activeTab === "research" ? "research"
      : "cost_benefit";

    const payload: any = {
      resource_type: resourceType,
      title: form.title || "",
      therapy: form.therapy || "",
      category: form.category || "",
      description: form.description || "",
      video_url: form.video_url || "",
      video_duration: form.video_duration || "",
      video_language: form.video_language || "",
      patient_profile: form.patient_profile || "",
      condition: form.condition || "",
      vas_before: form.vas_before || null,
      vas_after: form.vas_after || null,
      treatment_duration: form.treatment_duration || "",
      treatment_given: form.treatment_given || "",
      outcome: form.outcome || "",
      key_learning: form.key_learning || "",
      follow_up: form.follow_up || "",
      pages: form.pages || "",
      format: form.format || "",
      authors: form.authors || "",
      journal: form.journal || "",
      publication_year: form.publication_year || null,
      study_type: form.study_type || "",
      pubmed_id: form.pubmed_id || "",
      pubmed_url: form.pubmed_url || "",
      finding: form.finding || "",
      evidence_level: form.evidence_level || "",
      cost_per_session: form.cost_per_session || null,
      sessions_needed: form.sessions_needed || null,
      total_cost: form.total_cost || null,
      success_rate: form.success_rate || null,
      avg_pain_reduction: form.avg_pain_reduction || null,
      cost_per_vas_point: form.cost_per_vas_point || null,
      roi: form.roi || "",
      break_even_sessions: form.break_even_sessions || null,
      compared_to_modern: form.compared_to_modern || "",
      package_suggestion: form.package_suggestion || "",
      revenue_per_patient: form.revenue_per_patient || null,
      patient_retention: form.patient_retention || null,
      created_by: user?.id || null,
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from("spine_clinical_resources")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
        setResources(prev => prev.map(r => r.id === editingId ? { ...r, ...payload } : r));
        toast.success("Resource updated!");
      } else {
        const { data, error } = await supabase
          .from("spine_clinical_resources")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        setResources(prev => [...prev, data as unknown as ResourceRecord]);
        toast.success("Resource added!");
      }
      setShowAddForm(false);
      setEditingId(null);
      setForm({});
    } catch (err: any) {
      toast.error("Save failed: " + (err?.message || "Unknown error"));
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this resource?")) return;
    const { error } = await supabase
      .from("spine_clinical_resources")
      .update({ is_active: false })
      .eq("id", id);
    if (!error) {
      setResources(prev => prev.filter(r => r.id !== id));
      toast.success("Resource removed");
    } else {
      toast.error("Delete failed");
    }
  };

  const startEdit = (record: ResourceRecord) => {
    setForm(record);
    setEditingId(record.id);
    setShowAddForm(true);
  };

  const startAdd = () => {
    setForm({});
    setEditingId(null);
    setShowAddForm(true);
  };

  // ─── Admin Add/Edit Form ───
  const renderForm = () => {
    const type = activeTab;
    return (
      <Card className="border-purple-200 bg-purple-50/20 mb-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">{editingId ? "Edit Resource" : "Add New Resource"}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => { setShowAddForm(false); setEditingId(null); setForm({}); }}><X className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Common fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-medium">Title *</label>
              <Input value={form.title || ""} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Resource title" />
            </div>
            <div>
              <label className="text-xs font-medium">Therapy</label>
              <Input value={form.therapy || ""} onChange={e => setForm(p => ({ ...p, therapy: e.target.value }))} placeholder="e.g. Kati Basti" />
            </div>
            <div>
              <label className="text-xs font-medium">Category</label>
              <Select value={form.category || ""} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Level 1">Level 1</SelectItem>
                  <SelectItem value="Level 2 (PK)">Level 2 (PK)</SelectItem>
                  <SelectItem value="Integrative">Integrative</SelectItem>
                  <SelectItem value="Yoga/Exercise">Yoga/Exercise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Video fields */}
          {type === "videos" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="text-xs font-medium">Video URL (YouTube)</label>
                <Input value={form.video_url || ""} onChange={e => setForm(p => ({ ...p, video_url: e.target.value }))} placeholder="https://youtube.com/watch?v=..." />
              </div>
              <div>
                <label className="text-xs font-medium">Duration</label>
                <Input value={form.video_duration || ""} onChange={e => setForm(p => ({ ...p, video_duration: e.target.value }))} placeholder="e.g. 12:30" />
              </div>
              <div>
                <label className="text-xs font-medium">Language</label>
                <Input value={form.video_language || ""} onChange={e => setForm(p => ({ ...p, video_language: e.target.value }))} placeholder="e.g. English + Hindi" />
              </div>
            </div>
          )}

          {/* Case study fields */}
          {type === "cases" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-medium">Patient Profile</label>
                  <Input value={form.patient_profile || ""} onChange={e => setForm(p => ({ ...p, patient_profile: e.target.value }))} placeholder="e.g. Male, 45 yrs, Farmer" />
                </div>
                <div>
                  <label className="text-xs font-medium">Condition</label>
                  <Input value={form.condition || ""} onChange={e => setForm(p => ({ ...p, condition: e.target.value }))} placeholder="e.g. Chronic Sciatica L5-S1" />
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div>
                    <label className="text-xs font-medium">VAS Before</label>
                    <Input type="number" min="0" max="10" value={form.vas_before || ""} onChange={e => setForm(p => ({ ...p, vas_before: parseInt(e.target.value) || null }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium">VAS After</label>
                    <Input type="number" min="0" max="10" value={form.vas_after || ""} onChange={e => setForm(p => ({ ...p, vas_after: parseInt(e.target.value) || null }))} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium">Treatment Duration</label>
                  <Input value={form.treatment_duration || ""} onChange={e => setForm(p => ({ ...p, treatment_duration: e.target.value }))} placeholder="e.g. 14 days" />
                </div>
                <div>
                  <label className="text-xs font-medium">Treatment Given</label>
                  <Input value={form.treatment_given || ""} onChange={e => setForm(p => ({ ...p, treatment_given: e.target.value }))} placeholder="e.g. Kati Basti × 14 + Basti × 16" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium">Outcome</label>
                <Textarea value={form.outcome || ""} onChange={e => setForm(p => ({ ...p, outcome: e.target.value }))} className="h-14 text-xs" placeholder="Results achieved..." />
              </div>
              <div>
                <label className="text-xs font-medium">Key Learning</label>
                <Input value={form.key_learning || ""} onChange={e => setForm(p => ({ ...p, key_learning: e.target.value }))} placeholder="What did this case teach us?" />
              </div>
              <div>
                <label className="text-xs font-medium">Follow-up</label>
                <Input value={form.follow_up || ""} onChange={e => setForm(p => ({ ...p, follow_up: e.target.value }))} placeholder="Long-term outcome..." />
              </div>
            </>
          )}

          {/* Research fields */}
          {type === "research" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-medium">Authors</label>
                  <Input value={form.authors || ""} onChange={e => setForm(p => ({ ...p, authors: e.target.value }))} placeholder="e.g. Sharma R, et al." />
                </div>
                <div>
                  <label className="text-xs font-medium">Journal</label>
                  <Input value={form.journal || ""} onChange={e => setForm(p => ({ ...p, journal: e.target.value }))} placeholder="e.g. J Ayurveda Integr Med" />
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div>
                    <label className="text-xs font-medium">Year</label>
                    <Input type="number" value={form.publication_year || ""} onChange={e => setForm(p => ({ ...p, publication_year: parseInt(e.target.value) || null }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Study Type</label>
                    <Input value={form.study_type || ""} onChange={e => setForm(p => ({ ...p, study_type: e.target.value }))} placeholder="RCT" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-medium">PubMed ID</label>
                  <Input value={form.pubmed_id || ""} onChange={e => setForm(p => ({ ...p, pubmed_id: e.target.value }))} placeholder="e.g. 32109456" />
                </div>
                <div>
                  <label className="text-xs font-medium">PubMed URL</label>
                  <Input value={form.pubmed_url || ""} onChange={e => setForm(p => ({ ...p, pubmed_url: e.target.value }))} placeholder="https://pubmed.ncbi.nlm.nih.gov/..." />
                </div>
                <div>
                  <label className="text-xs font-medium">Evidence Level</label>
                  <Select value={form.evidence_level || ""} onValueChange={v => setForm(p => ({ ...p, evidence_level: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Level 1 (Systematic Review)">Level 1 (Systematic Review)</SelectItem>
                      <SelectItem value="Level 1 (Meta-Analysis)">Level 1 (Meta-Analysis)</SelectItem>
                      <SelectItem value="Level 1 (Guideline)">Level 1 (Guideline)</SelectItem>
                      <SelectItem value="Level 2 (RCT)">Level 2 (RCT)</SelectItem>
                      <SelectItem value="Level 2 (Multi-center trial)">Level 2 (Multi-center)</SelectItem>
                      <SelectItem value="Level 3 (Clinical trial)">Level 3 (Clinical trial)</SelectItem>
                      <SelectItem value="Level 3 (Comparative)">Level 3 (Comparative)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium">Key Finding</label>
                <Textarea value={form.finding || ""} onChange={e => setForm(p => ({ ...p, finding: e.target.value }))} className="h-14 text-xs" placeholder="Main result or conclusion..." />
              </div>
            </>
          )}

          {/* Cost-benefit fields */}
          {type === "costbenefit" && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div><label className="text-xs font-medium">₹/Session</label><Input type="number" value={form.cost_per_session || ""} onChange={e => setForm(p => ({ ...p, cost_per_session: parseInt(e.target.value) || null }))} /></div>
                <div><label className="text-xs font-medium">Sessions Needed</label><Input type="number" value={form.sessions_needed || ""} onChange={e => setForm(p => ({ ...p, sessions_needed: parseInt(e.target.value) || null }))} /></div>
                <div><label className="text-xs font-medium">Total Cost</label><Input type="number" value={form.total_cost || ""} onChange={e => setForm(p => ({ ...p, total_cost: parseInt(e.target.value) || null }))} /></div>
                <div><label className="text-xs font-medium">Success Rate %</label><Input type="number" value={form.success_rate || ""} onChange={e => setForm(p => ({ ...p, success_rate: parseInt(e.target.value) || null }))} /></div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div><label className="text-xs font-medium">Pain Relief %</label><Input type="number" value={form.avg_pain_reduction || ""} onChange={e => setForm(p => ({ ...p, avg_pain_reduction: parseInt(e.target.value) || null }))} /></div>
                <div><label className="text-xs font-medium">₹/VAS Point</label><Input type="number" value={form.cost_per_vas_point || ""} onChange={e => setForm(p => ({ ...p, cost_per_vas_point: parseInt(e.target.value) || null }))} /></div>
                <div><label className="text-xs font-medium">ROI Rating</label><Input value={form.roi || ""} onChange={e => setForm(p => ({ ...p, roi: e.target.value }))} placeholder="e.g. Very High" /></div>
                <div><label className="text-xs font-medium">Retention %</label><Input type="number" value={form.patient_retention || ""} onChange={e => setForm(p => ({ ...p, patient_retention: parseInt(e.target.value) || null }))} /></div>
              </div>
              <div><label className="text-xs font-medium">vs Modern Medicine</label><Input value={form.compared_to_modern || ""} onChange={e => setForm(p => ({ ...p, compared_to_modern: e.target.value }))} placeholder="Comparison with conventional treatment..." /></div>
              <div><label className="text-xs font-medium">Package Suggestion</label><Input value={form.package_suggestion || ""} onChange={e => setForm(p => ({ ...p, package_suggestion: e.target.value }))} placeholder="e.g. ₹7,500 for 7 days" /></div>
            </>
          )}

          {/* Protocol fields */}
          {type === "protocols" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div><label className="text-xs font-medium">Pages</label><Input value={form.pages || ""} onChange={e => setForm(p => ({ ...p, pages: e.target.value }))} placeholder="e.g. 2 pages" /></div>
              <div><label className="text-xs font-medium">Format</label><Input value={form.format || ""} onChange={e => setForm(p => ({ ...p, format: e.target.value }))} placeholder="e.g. A4 Portrait" /></div>
              <div><label className="text-xs font-medium">Description</label><Input value={form.description || ""} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What this protocol covers" /></div>
            </div>
          )}

          {/* Description (for videos) */}
          {type === "videos" && (
            <div>
              <label className="text-xs font-medium">Description</label>
              <Textarea value={form.description || ""} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="h-14 text-xs" placeholder="Brief description of the video content..." />
            </div>
          )}

          {/* Save button */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => { setShowAddForm(false); setEditingId(null); setForm({}); }}>Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1">
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              {editingId ? "Update" : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ─── Admin action buttons ───
  const AdminActions = ({ record }: { record: ResourceRecord }) => {
    if (!user) return null;
    return (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => startEdit(record)}>
          <Edit2 className="h-3 w-3 text-blue-500" />
        </Button>
        <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => handleDelete(record.id)}>
          <Trash2 className="h-3 w-3 text-red-400" />
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-purple-600" />
            Spine Clinical Resource Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            Videos, Case Studies, Printable Protocols, Research Evidence & Cost-Benefit Analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-purple-100 text-purple-700">
            <Brain className="h-3 w-3 mr-1" /> Clinical Knowledge Base
          </Badge>
          {user && <Badge variant="outline" className="text-green-600 border-green-300">Admin Mode</Badge>}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={v => { setActiveTab(v); setShowAddForm(false); }}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="videos" className="gap-1 text-xs"><Video className="h-3 w-3" /> Videos ({videos.length || fallbackVideos.length})</TabsTrigger>
          <TabsTrigger value="cases" className="gap-1 text-xs"><Users className="h-3 w-3" /> Cases ({cases.length || fallbackCases.length})</TabsTrigger>
          <TabsTrigger value="protocols" className="gap-1 text-xs"><FileText className="h-3 w-3" /> Protocols ({protocols.length})</TabsTrigger>
          <TabsTrigger value="research" className="gap-1 text-xs"><FlaskConical className="h-3 w-3" /> Research ({research.length})</TabsTrigger>
          <TabsTrigger value="costbenefit" className="gap-1 text-xs"><IndianRupee className="h-3 w-3" /> Cost ({costBenefit.length})</TabsTrigger>
        </TabsList>

        {/* ─── TAB 1: VIDEOS ─── */}
        <TabsContent value="videos" className="space-y-4">
          {user && (
            <div className="flex justify-between items-center">
              <div className="flex gap-2 flex-wrap">
                {["all", "Level 1", "Level 2 (PK)", "Integrative", "Yoga/Exercise"].map(cat => (
                  <Button key={cat} size="sm" variant={videoFilter === cat ? "default" : "outline"} onClick={() => setVideoFilter(cat)} className="text-xs">{cat === "all" ? "All" : cat}</Button>
                ))}
              </div>
              <Button size="sm" onClick={startAdd} className="gap-1"><Plus className="h-3 w-3" /> Add Video</Button>
            </div>
          )}
          {!user && (
            <div className="flex gap-2 flex-wrap">
              {["all", "Level 1", "Level 2 (PK)", "Integrative", "Yoga/Exercise"].map(cat => (
                <Button key={cat} size="sm" variant={videoFilter === cat ? "default" : "outline"} onClick={() => setVideoFilter(cat)} className="text-xs">{cat === "all" ? "All" : cat}</Button>
              ))}
            </div>
          )}

          {showAddForm && activeTab === "videos" && renderForm()}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(videos.length > 0 ? videos : fallbackVideos.map((v, i) => ({ ...v, id: `fb-${i}`, resource_type: "video" } as any)))
              .filter((v: any) => videoFilter === "all" || v.category === videoFilter)
              .map((video: any) => (
                <Card key={video.id} className="hover:shadow-md transition">
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-start gap-2">
                      <div className="w-10 h-10 rounded bg-red-100 flex items-center justify-center shrink-0">
                        <Play className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <p className="font-medium text-xs leading-tight">{video.title}</p>
                          {video.id && !video.id.startsWith("fb-") && <AdminActions record={video} />}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Badge variant="secondary" className="text-[9px]">{video.therapy}</Badge>
                          <Badge variant="outline" className="text-[9px]">{video.video_duration}</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{video.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[9px] text-muted-foreground">{video.video_language}</span>
                          {video.video_url && (
                            <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5">
                              Watch <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* ─── TAB 2: CASE STUDIES ─── */}
        <TabsContent value="cases" className="space-y-4">
          {user && (
            <div className="flex justify-end">
              <Button size="sm" onClick={startAdd} className="gap-1"><Plus className="h-3 w-3" /> Add Case Study</Button>
            </div>
          )}

          {showAddForm && activeTab === "cases" && renderForm()}

          <div className="space-y-4">
            {(cases.length > 0 ? cases : fallbackCases.map((c, i) => ({ ...c, id: `fb-${i}`, resource_type: "case_study" } as any)))
              .map((cs: any) => (
                <Card key={cs.id}>
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-100 text-purple-700 text-[10px]">{cs.therapy}</Badge>
                        <span className="text-xs font-medium">{cs.patient_profile}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {cs.vas_before != null && <Badge className="bg-red-50 text-red-600 text-[10px]">VAS {cs.vas_before}</Badge>}
                        {cs.vas_before != null && cs.vas_after != null && <ArrowRight className="h-3 w-3 text-green-500" />}
                        {cs.vas_after != null && <Badge className="bg-green-50 text-green-600 text-[10px]">VAS {cs.vas_after}</Badge>}
                        {cs.vas_before && cs.vas_after != null && cs.vas_before > 0 && (
                          <Badge className="bg-green-100 text-green-700 text-[10px]">{Math.round(((cs.vas_before - cs.vas_after) / cs.vas_before) * 100)}% relief</Badge>
                        )}
                        {cs.id && !cs.id.startsWith("fb-") && <AdminActions record={cs} />}
                      </div>
                    </div>
                    <p className="text-xs font-medium text-muted-foreground">{cs.condition}</p>
                    <Separator className="my-2" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase">Treatment ({cs.treatment_duration})</p>
                        <p className="mt-0.5">{cs.treatment_given}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase">Outcome</p>
                        <p className="mt-0.5 text-green-700">{cs.outcome}</p>
                      </div>
                    </div>
                    {cs.key_learning && (
                      <div className="mt-2 p-2 rounded bg-amber-50 border border-amber-100">
                        <p className="text-[10px] font-medium text-amber-700 flex items-center gap-1"><Zap className="h-3 w-3" /> Key Learning</p>
                        <p className="text-[10px] mt-0.5">{cs.key_learning}</p>
                      </div>
                    )}
                    {cs.follow_up && <p className="text-[10px] text-muted-foreground mt-1"><Clock className="h-3 w-3 inline mr-0.5" /> {cs.follow_up}</p>}
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* ─── TAB 3: PROTOCOLS ─── */}
        <TabsContent value="protocols" className="space-y-4">
          {user && (
            <div className="flex justify-end">
              <Button size="sm" onClick={startAdd} className="gap-1"><Plus className="h-3 w-3" /> Add Protocol</Button>
            </div>
          )}
          {showAddForm && activeTab === "protocols" && renderForm()}

          {protocols.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>No protocol sheets added yet.{user ? " Click 'Add Protocol' to create one." : " Login to manage content."}</p>
            </CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {protocols.map(ps => (
                <Card key={ps.id} className="hover:shadow-md transition">
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        <div className="w-9 h-9 rounded bg-blue-100 flex items-center justify-center shrink-0"><FileText className="h-4 w-4 text-blue-600" /></div>
                        <div>
                          <p className="font-medium text-xs">{ps.title}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Badge variant="secondary" className="text-[9px]">{ps.therapy}</Badge>
                            {ps.pages && <Badge variant="outline" className="text-[9px]">{ps.pages}</Badge>}
                            {ps.format && <Badge variant="outline" className="text-[9px]">{ps.format}</Badge>}
                          </div>
                          {ps.description && <p className="text-[10px] text-muted-foreground mt-1">{ps.description}</p>}
                        </div>
                      </div>
                      <AdminActions record={ps} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── TAB 4: RESEARCH ─── */}
        <TabsContent value="research" className="space-y-4">
          {user && (
            <div className="flex justify-end">
              <Button size="sm" onClick={startAdd} className="gap-1"><Plus className="h-3 w-3" /> Add Citation</Button>
            </div>
          )}
          {showAddForm && activeTab === "research" && renderForm()}

          {research.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">
              <FlaskConical className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>No research citations added yet.{user ? " Click 'Add Citation' to create one." : " Login to manage content."}</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-2">
              {research.map(r => (
                <Card key={r.id}>
                  <CardContent className="pt-3 pb-2">
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center shrink-0"><FlaskConical className="h-4 w-4 text-green-600" /></div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <p className="font-medium text-xs">{r.title}</p>
                          <AdminActions record={r} />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{r.authors} — <em>{r.journal}</em> ({r.publication_year})</p>
                        <div className="flex items-center gap-1 mt-1">
                          {r.evidence_level && <Badge className="bg-green-50 text-green-700 text-[9px]">{r.evidence_level}</Badge>}
                          <Badge variant="secondary" className="text-[9px]">{r.therapy}</Badge>
                          {r.study_type && <Badge variant="outline" className="text-[9px]">{r.study_type}</Badge>}
                        </div>
                        {r.finding && <p className="text-[10px] mt-1.5 p-1.5 bg-muted/50 rounded"><strong>Finding:</strong> {r.finding}</p>}
                        {r.pubmed_url && (
                          <a href={r.pubmed_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5 mt-1">
                            PubMed: {r.pubmed_id} <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── TAB 5: COST-BENEFIT ─── */}
        <TabsContent value="costbenefit" className="space-y-4">
          {user && (
            <div className="flex justify-end">
              <Button size="sm" onClick={startAdd} className="gap-1"><Plus className="h-3 w-3" /> Add Entry</Button>
            </div>
          )}
          {showAddForm && activeTab === "costbenefit" && renderForm()}

          {costBenefit.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">
              <IndianRupee className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>No cost-benefit data added yet.{user ? " Click 'Add Entry' to create one." : " Login to manage content."}</p>
            </CardContent></Card>
          ) : (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Cost-Benefit Comparison</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-[10px]">
                    <thead>
                      <tr className="border-b text-muted-foreground">
                        <th className="text-left p-1.5">Therapy</th>
                        <th className="text-center p-1.5">₹/Session</th>
                        <th className="text-center p-1.5">Sessions</th>
                        <th className="text-center p-1.5">Total</th>
                        <th className="text-center p-1.5">Success%</th>
                        <th className="text-center p-1.5">Relief%</th>
                        <th className="text-center p-1.5">₹/VAS</th>
                        <th className="text-center p-1.5">ROI</th>
                        <th className="text-left p-1.5">Package</th>
                        <th className="p-1.5"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {costBenefit.sort((a, b) => (a.cost_per_vas_point || 9999) - (b.cost_per_vas_point || 9999)).map(d => (
                        <tr key={d.id} className="border-b hover:bg-muted/30">
                          <td className="p-1.5 font-medium">{d.therapy || d.title}</td>
                          <td className="p-1.5 text-center">₹{d.cost_per_session}</td>
                          <td className="p-1.5 text-center">{d.sessions_needed}</td>
                          <td className="p-1.5 text-center">₹{d.total_cost?.toLocaleString()}</td>
                          <td className="p-1.5 text-center font-bold text-green-600">{d.success_rate}%</td>
                          <td className="p-1.5 text-center">{d.avg_pain_reduction}%</td>
                          <td className="p-1.5 text-center">₹{d.cost_per_vas_point}</td>
                          <td className="p-1.5 text-center"><Badge variant="outline" className="text-[8px]">{d.roi}</Badge></td>
                          <td className="p-1.5 text-green-700">{d.package_suggestion}</td>
                          <td className="p-1.5"><AdminActions record={d} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Info notice */}
      {!user && (
        <Card className="border-amber-200 bg-amber-50/30">
          <CardContent className="pt-3 pb-2 text-center text-xs text-amber-700">
            Login to add, edit, or delete resources. All logged-in users have admin access to manage this content.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
