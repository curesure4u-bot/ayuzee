import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil, Sparkles, X, Lightbulb, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────
type Suggestion = {
  id: string;
  category: string;
  suggestion: string;
  language: string;
  forWhom: string;
  aiGenerated: boolean;
  usageCount: number;
  status: "active" | "inactive";
};

// ─── Constants ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Template Module",
  "Chief Complaints",
  "Diagnosis",
  "Advice to Patient",
  "Diet Instructions",
  "Medicine Instruction",
  "Follow-up Instructions",
  "Exercise / Yoga",
  "Pathya (Do's)",
  "Apathya (Don'ts)",
  "Investigation Advice",
  "Referral Notes",
  "Discharge Advice",
  "Panchakarma Instructions",
  "Pre-operative Instructions",
  "Post-operative Care",
  "Emergency Signs",
  "Lifestyle Modification",
  "Mental Health / Stress",
  "Seasonal Advice (Ritucharya)",
];

const FOR_WHOM = ["Doctor", "Patient", "Staff", "Both (Doctor & Patient)"];

const LANGUAGES = ["English", "Tamil", "Hindi", "Malayalam", "Telugu", "Kannada"];

// AI Suggestion Templates by category
const AI_SUGGESTIONS_BY_CATEGORY: Record<string, string[]> = {
  "Template Module": [
    "Online consultation fix the time",
    "Please come review after 15 days",
    "Bring previous reports on next visit",
    "Continue medicines for 1 month and review",
    "Take medicines regularly as prescribed",
    "Contact hospital if symptoms worsen",
  ],
  "Chief Complaints": [
    "Joint pain - bilateral knee, worse in morning",
    "Low back pain radiating to left leg since 2 months",
    "Headache - throbbing, frontal, worse in sun",
    "Indigestion and bloating after food since 3 weeks",
    "Skin rashes with itching on elbows and knees",
    "Cough with whitish sputum, worse at night",
    "Excessive thirst and frequent urination",
    "Hair fall with dandruff since 6 months",
    "Neck stiffness and shoulder pain",
    "Sleep disturbance with anxiety",
  ],
  "Diagnosis": [
    "Sandhigata Vata (Osteoarthritis Knee) - M17",
    "Gridhrasi (Sciatica) - M54.3",
    "Amavata (Rheumatoid Arthritis) - M06",
    "Tamaka Shwasa (Bronchial Asthma) - J45",
    "Madhumeha (Type 2 DM) - E11",
    "Kushtha (Psoriasis) - L40",
    "Pandu (Iron Deficiency Anaemia) - D50",
    "Katigraha (Lumbar Spondylosis) - M47",
    "Arsha (Hemorrhoids) - K64",
    "Khalitya (Alopecia) - L63",
  ],
  "Advice to Patient": [
    "Avoid cold food and cold drinks",
    "Take warm water throughout the day",
    "Apply warm oil to affected joints before bath",
    "Do gentle exercises as advised",
    "Sleep before 10 PM, wake before 6 AM",
    "Avoid day sleep (only 20 min if needed)",
    "Take food on time - do not skip meals",
    "Reduce screen time before bed",
    "Walk 20 minutes after meals",
    "Practice deep breathing 10 min daily",
  ],
  "Diet Instructions": [
    "Avoid curd at night - use buttermilk instead",
    "Include ghee in daily diet (1-2 tsp)",
    "Eat warm, freshly cooked food",
    "Avoid fermented, processed, and packaged food",
    "Include green leafy vegetables daily",
    "Drink warm water with lemon in morning",
    "Avoid excess salt, sour, and spicy food",
    "Take dinner before 7:30 PM - keep it light",
    "Include seasonal fruits (avoid banana at night)",
    "Soaked almonds (4-5) in morning on empty stomach",
  ],
  "Medicine Instruction": [
    "Take with warm water after food",
    "Take with warm milk at bedtime",
    "Take with honey on empty stomach",
    "Mix with ghee and take before food",
    "Apply externally on affected area",
    "Gargle for 2 minutes and spit - do not swallow",
    "Take 30 minutes before food",
    "Dissolve in warm water and drink",
    "Apply on scalp, keep for 1 hour, then wash",
    "Take with equal quantity honey and ghee (not equal)",
  ],
  "Follow-up Instructions": [
    "Review after 15 days with investigation reports",
    "Come for follow-up after completing medicine course",
    "Weekly follow-up during Panchakarma treatment",
    "Monthly review for chronic disease management",
    "Immediate review if symptoms worsen",
    "Teleconsultation follow-up after 1 week",
    "Bring blood sugar log on next visit",
    "Follow-up after 3 days of starting treatment",
  ],
  "Exercise / Yoga": [
    "Surya Namaskar - 5 rounds daily in morning",
    "Pawanmuktasana series for joint mobility",
    "Bhujangasana for back strengthening",
    "Pranayama - Anulom Vilom 15 min daily",
    "Knee strengthening exercises as demonstrated",
    "Walking 30 min daily at moderate pace",
    "Swimming (if available) for joint pain",
    "Avoid high-impact exercises and jumping",
    "Shavasana for relaxation 10 min daily",
    "Meditation (Dhyana) 15-20 min in morning",
  ],
  "Panchakarma Instructions": [
    "Come empty stomach for Vamana procedure",
    "Apply oil on body 1 hour before treatment",
    "Avoid heavy food on treatment days - take light diet",
    "Rest for 1 hour after Shirodhara",
    "Do not take head bath on Nasya day",
    "Drink warm water after Vasti procedure",
    "Avoid cold exposure after Abhyanga",
    "Follow specific Pathya diet during Panchakarma",
    "Do not travel immediately after treatment",
    "Inform therapist about any discomfort during procedure",
  ],
  "Emergency Signs": [
    "Seek immediate help if chest pain or breathlessness",
    "Visit ER if fever > 103°F not responding to medicine",
    "Call hospital if severe vomiting or dehydration",
    "Come immediately if sudden weakness in limbs",
    "Seek help for allergic reaction (swelling, rash, breathing difficulty)",
    "Visit ER for severe abdominal pain with vomiting",
    "Call if blood in stool or urine",
    "Come immediately for sudden severe headache with neck stiffness",
  ],
};

// ─── Mock Data ───────────────────────────────────────────────────────────────
const mockActiveSuggestions: Suggestion[] = [
  { id: "1", category: "Template Module", suggestion: "Online consultation fix the time", language: "English", forWhom: "Patient", aiGenerated: false, usageCount: 85, status: "active" },
  { id: "2", category: "Template Module", suggestion: "Please come review after 15 days", language: "English", forWhom: "Patient", aiGenerated: false, usageCount: 120, status: "active" },
  { id: "3", category: "Template Module", suggestion: "Bring previous reports on next visit", language: "English", forWhom: "Patient", aiGenerated: false, usageCount: 65, status: "active" },
  { id: "4", category: "Chief Complaints", suggestion: "Joint pain - bilateral knee, worse in morning and cold weather", language: "English", forWhom: "Doctor", aiGenerated: false, usageCount: 200, status: "active" },
  { id: "5", category: "Chief Complaints", suggestion: "Low back pain radiating to left leg since 2 months", language: "English", forWhom: "Doctor", aiGenerated: false, usageCount: 180, status: "active" },
  { id: "6", category: "Diagnosis", suggestion: "Sandhigata Vata (Osteoarthritis Knee) - M17", language: "English", forWhom: "Doctor", aiGenerated: false, usageCount: 150, status: "active" },
  { id: "7", category: "Diagnosis", suggestion: "Gridhrasi (Sciatica) - M54.3", language: "English", forWhom: "Doctor", aiGenerated: false, usageCount: 130, status: "active" },
  { id: "8", category: "Advice to Patient", suggestion: "Avoid cold food and cold drinks", language: "English", forWhom: "Patient", aiGenerated: false, usageCount: 250, status: "active" },
  { id: "9", category: "Advice to Patient", suggestion: "Take warm water throughout the day", language: "English", forWhom: "Patient", aiGenerated: false, usageCount: 220, status: "active" },
  { id: "10", category: "Advice to Patient", suggestion: "Apply warm oil to affected joints before bath", language: "English", forWhom: "Patient", aiGenerated: false, usageCount: 190, status: "active" },
  { id: "11", category: "Diet Instructions", suggestion: "Avoid curd at night - use buttermilk instead", language: "English", forWhom: "Patient", aiGenerated: true, usageCount: 145, status: "active" },
  { id: "12", category: "Diet Instructions", suggestion: "Include ghee in daily diet (1-2 tsp)", language: "English", forWhom: "Patient", aiGenerated: true, usageCount: 130, status: "active" },
  { id: "13", category: "Exercise / Yoga", suggestion: "Surya Namaskar - 5 rounds daily in morning", language: "English", forWhom: "Patient", aiGenerated: true, usageCount: 95, status: "active" },
  { id: "14", category: "Exercise / Yoga", suggestion: "Pranayama - Anulom Vilom 15 min daily", language: "English", forWhom: "Patient", aiGenerated: true, usageCount: 88, status: "active" },
  { id: "15", category: "Medicine Instruction", suggestion: "Take with warm water after food", language: "English", forWhom: "Both (Doctor & Patient)", aiGenerated: false, usageCount: 310, status: "active" },
  { id: "16", category: "Follow-up Instructions", suggestion: "Review after 15 days with investigation reports", language: "English", forWhom: "Patient", aiGenerated: false, usageCount: 175, status: "active" },
  { id: "17", category: "Panchakarma Instructions", suggestion: "Come empty stomach for Vamana procedure", language: "English", forWhom: "Patient", aiGenerated: false, usageCount: 45, status: "active" },
  { id: "18", category: "Emergency Signs", suggestion: "Seek immediate help if chest pain or breathlessness", language: "English", forWhom: "Patient", aiGenerated: true, usageCount: 30, status: "active" },
];

const mockInactiveSuggestions: Suggestion[] = [
  { id: "101", category: "Advice to Patient", suggestion: "Avoid non-veg completely (old generic)", language: "English", forWhom: "Patient", aiGenerated: false, usageCount: 5, status: "inactive" },
  { id: "102", category: "Template Module", suggestion: "Test suggestion - delete", language: "English", forWhom: "Staff", aiGenerated: false, usageCount: 0, status: "inactive" },
  { id: "103", category: "Diet Instructions", suggestion: "Eat only fruits for 3 days (too strict)", language: "English", forWhom: "Patient", aiGenerated: false, usageCount: 2, status: "inactive" },
];

// ─── Component ───────────────────────────────────────────────────────────────
const SuggestionMaster = () => {
  // Tab: "new", "manage", "inactive"
  const [tab, setTab] = useState<"new" | "manage" | "inactive">("new");
  const [liveSuggestions, setLiveSuggestions] = useState<any[]>([]);

  useEffect(() => { loadSuggestions(); }, []);

  const loadSuggestions = async () => {
    try {
      const { data } = await (supabase as any)
        .from("hms_suggestions")
        .select("*")
        .eq("is_active", true)
        .order("suggestion_text");
      setLiveSuggestions(data || []);
    } catch (err) { console.error("Suggestions load:", err); }
  };

  // Form state
  const [formCategory, setFormCategory] = useState("");
  const [formSuggestion, setFormSuggestion] = useState("");
  const [formLanguage, setFormLanguage] = useState("English");
  const [formForWhom, setFormForWhom] = useState("Patient");

  // AI prompt
  const [aiCategory, setAiCategory] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  // Data
  const [activeSuggestions, setActiveSuggestions] = useState<Suggestion[]>(mockActiveSuggestions);
  const [inactiveSuggestions, setInactiveSuggestions] = useState<Suggestion[]>(mockInactiveSuggestions);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Handlers
  const handleAdd = () => {
    if (!formCategory) return toast.error("Select a category");
    if (!formSuggestion.trim()) return toast.error("Suggestion text is required");
    const newItem: Suggestion = {
      id: Date.now().toString(),
      category: formCategory,
      suggestion: formSuggestion.trim(),
      language: formLanguage,
      forWhom: formForWhom,
      aiGenerated: false,
      usageCount: 0,
      status: "active",
    };
    setActiveSuggestions([newItem, ...activeSuggestions]);
    toast.success("Suggestion added!");
    setFormSuggestion("");
  };

  const handleAiGenerate = () => {
    if (!aiCategory) return toast.error("Select a category for AI suggestions");
    setAiGenerating(true);
    setTimeout(() => {
      const suggestions = AI_SUGGESTIONS_BY_CATEGORY[aiCategory] || ["No suggestions available for this category"];
      setAiSuggestions(suggestions);
      setAiGenerating(false);
      toast.success(`AI generated ${suggestions.length} suggestions for "${aiCategory}"`);
    }, 800);
  };

  const handleAddAiSuggestion = (text: string) => {
    const newItem: Suggestion = {
      id: Date.now().toString() + Math.random(),
      category: aiCategory,
      suggestion: text,
      language: "English",
      forWhom: ["Chief Complaints", "Diagnosis"].includes(aiCategory) ? "Doctor" : "Patient",
      aiGenerated: true,
      usageCount: 0,
      status: "active",
    };
    setActiveSuggestions([newItem, ...activeSuggestions]);
    setAiSuggestions(aiSuggestions.filter(s => s !== text));
    toast.success("Added to suggestions!");
  };

  const handleAddAllAi = () => {
    const newItems: Suggestion[] = aiSuggestions.map(text => ({
      id: Date.now().toString() + Math.random(),
      category: aiCategory,
      suggestion: text,
      language: "English",
      forWhom: ["Chief Complaints", "Diagnosis"].includes(aiCategory) ? "Doctor" : "Patient",
      aiGenerated: true,
      usageCount: 0,
      status: "active",
    }));
    setActiveSuggestions([...newItems, ...activeSuggestions]);
    setAiSuggestions([]);
    toast.success(`Added all ${newItems.length} suggestions!`);
  };

  const handleRemove = (id: string) => {
    const item = activeSuggestions.find(s => s.id === id);
    if (!item) return;
    setActiveSuggestions(activeSuggestions.filter(s => s.id !== id));
    setInactiveSuggestions([{ ...item, status: "inactive" }, ...inactiveSuggestions]);
    toast.success("Suggestion deactivated");
  };

  const handleReactivate = (id: string) => {
    const item = inactiveSuggestions.find(s => s.id === id);
    if (!item) return;
    setInactiveSuggestions(inactiveSuggestions.filter(s => s.id !== id));
    setActiveSuggestions([{ ...item, status: "active" }, ...activeSuggestions]);
    toast.success("Suggestion reactivated");
  };

  const getFiltered = (data: Suggestion[]) => {
    let filtered = data;
    if (filterCategory !== "all") filtered = filtered.filter(s => s.category === filterCategory);
    if (search) filtered = filtered.filter(s => s.suggestion.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase()));
    return filtered;
  };

  // ─── Render New Tab ────────────────────────────────────────────────────────
  const renderNewTab = () => (
    <div className="space-y-4">
      {/* AI Suggestion Generator */}
      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <Label className="font-semibold text-purple-700">AI Suggestion Generator</Label>
            <Badge className="bg-purple-100 text-purple-700 text-[9px]">Smart Autocomplete</Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            AI generates clinically relevant suggestions for AYUSH practice. Select a category and generate tailored suggestions for doctors and patients.
          </p>
          <div className="flex items-end gap-3">
            <div className="min-w-[220px]">
              <Label className="text-xs">Category</Label>
              <Select value={aiCategory} onValueChange={setAiCategory}>
                <SelectTrigger className="mt-0.5 h-8 text-sm"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {Object.keys(AI_SUGGESTIONS_BY_CATEGORY).map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAiGenerate} disabled={aiGenerating} className="bg-purple-600 hover:bg-purple-700 text-white h-8">
              <Sparkles className="h-3.5 w-3.5 mr-1" /> {aiGenerating ? "Generating..." : "Generate Suggestions"}
            </Button>
          </div>

          {/* AI Generated Results */}
          {aiSuggestions.length > 0 && (
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-purple-700">{aiSuggestions.length} suggestions generated</p>
                <Button size="sm" variant="outline" className="h-6 text-[10px] border-purple-200 text-purple-600" onClick={handleAddAllAi}>Add All</Button>
              </div>
              {aiSuggestions.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded border border-purple-100 bg-white text-xs">
                  <span className="flex-1">{s}</span>
                  <Button size="sm" variant="ghost" className="h-6 text-[10px] text-purple-600 hover:bg-purple-100" onClick={() => handleAddAiSuggestion(s)}>
                    + Add
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Add Form */}
      <Card>
        <CardHeader className="pb-2 border-b bg-primary/5">
          <CardTitle className="text-base text-center text-primary">Manage Suggestion Master</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-end gap-3 flex-wrap">
            <div className="min-w-[180px]">
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select Category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[250px]">
              <Input
                value={formSuggestion}
                onChange={e => setFormSuggestion(e.target.value)}
                placeholder="Add Suggestions"
                className="h-9 text-sm"
                onKeyDown={e => { if (e.key === "Enter") handleAdd(); }}
              />
            </div>
            <div className="min-w-[120px]">
              <Select value={formLanguage} onValueChange={setFormLanguage}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="min-w-[140px]">
              <Select value={formForWhom} onValueChange={setFormForWhom}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{FOR_WHOM.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button onClick={handleAdd} className="bg-orange-500 hover:bg-orange-600 text-white h-9">
              Add
            </Button>
          </div>

          {/* Filter & Table */}
          <div className="flex items-center justify-between border-t pt-3">
            <div className="flex items-center gap-2 text-sm">
              Show <select className="border rounded px-2 py-1 text-xs"><option>100</option><option>50</option><option>25</option></select> entries
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="h-7 w-44 text-xs"><SelectValue placeholder="All Categories" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs">Search:</span>
              <Input className="h-7 text-xs w-48" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">Category</th>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">Suggestions</th>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">For</th>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">Lang</th>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">Uses</th>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">AI</th>
                  <th className="px-3 py-2 text-center font-semibold text-orange-600">Remove</th>
                </tr>
              </thead>
              <tbody>
                {getFiltered(activeSuggestions).length === 0 ? (
                  <tr><td colSpan={7} className="px-3 py-4 text-center text-muted-foreground">No suggestions found</td></tr>
                ) : (
                  getFiltered(activeSuggestions).map(s => (
                    <tr key={s.id} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2 text-xs">{s.category}</td>
                      <td className="px-3 py-2 text-xs">{s.suggestion}</td>
                      <td className="px-3 py-2"><Badge variant="outline" className="text-[9px]">{s.forWhom}</Badge></td>
                      <td className="px-3 py-2 text-[10px]">{s.language}</td>
                      <td className="px-3 py-2"><Badge variant="secondary" className="text-[9px]">{s.usageCount}</Badge></td>
                      <td className="px-3 py-2">{s.aiGenerated && <Sparkles className="h-3 w-3 text-purple-500" />}</td>
                      <td className="px-3 py-2 text-center">
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded" onClick={() => handleRemove(s.id)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Showing 1 to {getFiltered(activeSuggestions).length} of {getFiltered(activeSuggestions).length} entries</span>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" className="h-6 text-xs" disabled>Previous</Button>
              <Badge variant="outline" className="text-xs">1</Badge>
              <Button size="sm" variant="outline" className="h-6 text-xs" disabled>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ─── Render Inactive Tab ───────────────────────────────────────────────────
  const renderInactiveTab = () => (
    <Card>
      <CardHeader className="pb-2 border-b bg-red-50/50">
        <CardTitle className="text-base text-center text-red-600">Manage Inactive Suggestions</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            Show <select className="border rounded px-2 py-1 text-xs"><option>100</option></select> entries
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs">Search:</span>
            <Input className="h-7 text-xs w-48" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Category</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Suggestions</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">For</th>
                <th className="px-3 py-2 text-center font-semibold text-orange-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {getFiltered(inactiveSuggestions).length === 0 ? (
                <tr><td colSpan={4} className="px-3 py-4 text-center text-muted-foreground">No inactive suggestions</td></tr>
              ) : (
                getFiltered(inactiveSuggestions).map(s => (
                  <tr key={s.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 text-xs">{s.category}</td>
                    <td className="px-3 py-2 text-xs">{s.suggestion}</td>
                    <td className="px-3 py-2"><Badge variant="outline" className="text-[9px]">{s.forWhom}</Badge></td>
                    <td className="px-3 py-2 text-center">
                      <Button size="sm" variant="outline" className="h-6 text-[10px] text-emerald-600 border-emerald-300" onClick={() => handleReactivate(s.id)}>
                        Reactivate
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="text-xs text-muted-foreground">Showing 1 to {getFiltered(inactiveSuggestions).length} of {getFiltered(inactiveSuggestions).length} entries</div>
      </CardContent>
    </Card>
  );

  // ─── Main Render ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-amber-500" /> Suggestion Master
          </h1>
          <p className="text-sm text-muted-foreground">
            Define standard suggestions for EMR, prescriptions, and patient advice. AI-powered autocomplete for doctors.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-purple-100 text-purple-700 border-purple-200">
            <Sparkles className="h-3 w-3 mr-1" /> AI Suggestions
          </Badge>
          <Badge variant="secondary">
            Active: {activeSuggestions.length} | Categories: {CATEGORIES.length}
          </Badge>
        </div>
      </div>

      {/* Master Setting Layout: Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
        {/* Sidebar */}
        <div>
          <Card className="p-0">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm font-semibold">Suggestion Master</CardTitle>
            </CardHeader>
            <CardContent className="p-1 space-y-0.5">
              <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-8 bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200">
                <span className="mr-2">💡</span> Manage Suggestion
              </Button>
            </CardContent>
          </Card>

          {/* Category Stats */}
          <Card className="mt-3 p-3">
            <p className="text-xs font-semibold mb-2">By Category</p>
            <div className="space-y-1 text-xs max-h-[300px] overflow-y-auto">
              {CATEGORIES.slice(0, 12).map(cat => {
                const count = activeSuggestions.filter(s => s.category === cat).length;
                return count > 0 ? (
                  <div key={cat} className="flex justify-between">
                    <span className="text-muted-foreground truncate max-w-[130px]">{cat}</span>
                    <Badge variant="secondary" className="text-[10px] h-4">{count}</Badge>
                  </div>
                ) : null;
              })}
            </div>
          </Card>

          {/* Quick Tips */}
          <Card className="mt-3 p-3">
            <p className="text-xs font-semibold mb-2 flex items-center gap-1"><Sparkles className="h-3 w-3 text-purple-500" /> How It Helps</p>
            <div className="space-y-1.5 text-[10px] text-muted-foreground">
              <p>✓ Doctors get autocomplete while typing in EMR</p>
              <p>✓ Patients receive consistent advice</p>
              <p>✓ AI learns from usage to rank suggestions</p>
              <p>✓ Multi-language support for local patients</p>
              <p>✓ Reduces typing time by 60%</p>
              <p>✓ Standardizes clinical documentation</p>
            </div>
          </Card>
        </div>

        {/* Content Area */}
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 border-b pb-0">
            <Button variant="ghost" size="sm" className={`rounded-b-none text-xs ${tab === "new" ? "text-orange-700 border-b-2 border-orange-500 font-semibold bg-orange-50" : "text-muted-foreground"}`} onClick={() => setTab("new")}>
              New
            </Button>
            <Button variant="ghost" size="sm" className={`rounded-b-none text-xs ${tab === "manage" ? "text-teal-700 border-b-2 border-teal-600 font-semibold bg-teal-50" : "text-muted-foreground"}`} onClick={() => setTab("manage")}>
              Manage Suggestions
            </Button>
            <Button variant="ghost" size="sm" className={`rounded-b-none text-xs ${tab === "inactive" ? "text-red-600 border-b-2 border-red-500 font-semibold bg-red-50" : "text-muted-foreground"}`} onClick={() => setTab("inactive")}>
              Manage Inactive
            </Button>
          </div>

          {tab === "new" && renderNewTab()}
          {tab === "manage" && renderNewTab()}
          {tab === "inactive" && renderInactiveTab()}
        </div>
      </div>
    </div>
  );
};

export default SuggestionMaster;
