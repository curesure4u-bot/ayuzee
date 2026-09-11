import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Rocket, Building2, Package, Users, FileCheck, GraduationCap,
  CheckCircle2, Circle, ArrowRight, ArrowLeft, Save, Home,
  Store, Wifi, Layers, MapPin, IndianRupee, Clock, Award,
  ClipboardList, AlertTriangle, Target, Shield,
} from "lucide-react";

// ─── Model Types ───
const franchiseModels = [
  { id: "physical", name: "Physical Center", icon: Store, investment: "₹15-25 Lakhs", space: "800-1200 sq ft", staff: "4-5 people", desc: "Full experience center with treatment rooms, Panchakarma, pharmacy", color: "blue" },
  { id: "online", name: "Online (Digital)", icon: Wifi, investment: "₹2-5 Lakhs", space: "Home office / small", staff: "2-3 people", desc: "Teleconsult, AI assessment, home therapy kits, video follow-up", color: "green" },
  { id: "hybrid", name: "Hybrid Model", icon: Layers, investment: "₹10-18 Lakhs", space: "500-800 sq ft", staff: "3-4 people", desc: "Physical hub for hands-on therapy + digital reach for assessment & follow-up", color: "purple" },
];

// ─── Setup Steps ───
interface SetupStep {
  id: string;
  title: string;
  icon: any;
  items: { task: string; detail: string; models: string[] }[];
}

const setupSteps: SetupStep[] = [
  {
    id: "location", title: "1. Location & Space", icon: MapPin,
    items: [
      { task: "Choose location", detail: "Ground floor preferred, near residential/commercial hub, parking available, min 800 sq ft for physical", models: ["physical", "hybrid"] },
      { task: "Verify accessibility", detail: "Wheelchair access, clean surroundings, visible signage spot", models: ["physical", "hybrid"] },
      { task: "Lease agreement", detail: "Minimum 3-year lease, clear terms, permission for medical use", models: ["physical", "hybrid"] },
      { task: "Home office setup", detail: "Quiet room for teleconsultation, good lighting, stable internet 50+ Mbps", models: ["online", "hybrid"] },
      { task: "Internet & backup", detail: "Primary broadband + mobile hotspot backup, UPS for power cuts", models: ["physical", "online", "hybrid"] },
    ],
  },
  {
    id: "rooms", title: "2. Room Setup", icon: Building2,
    items: [
      { task: "Reception + Waiting area", detail: "Front desk, HMS terminal, 8-10 seats, education screen, dermatome wall chart", models: ["physical", "hybrid"] },
      { task: "Examination room (120 sq ft)", detail: "Couch, doctor desk, HMS terminal, posture analysis tablet, VAS charts", models: ["physical", "hybrid"] },
      { task: "Level 1 Therapy room (100 sq ft)", detail: "Agnikarma setup, cupping, needling, trigger point + Marma table", models: ["physical", "hybrid"] },
      { task: "Panchakarma room (150 sq ft)", detail: "Droni table with drainage, Kati/Greeva Basti setup, steam, oil warmer, privacy curtains", models: ["physical", "hybrid"] },
      { task: "Pharmacy / Dispensary (80 sq ft)", detail: "Medicine racks, oils, billing counter, HMS Stock module", models: ["physical", "hybrid"] },
      { task: "Utility area", detail: "Oil prep, linen storage, staff area, restroom", models: ["physical", "hybrid"] },
      { task: "Virtual consultation room", detail: "Camera, mic, backdrop, screen for showing HMS to patient", models: ["online", "hybrid"] },
    ],
  },
  {
    id: "equipment", title: "3. Equipment & Supplies", icon: Package,
    items: [
      { task: "Panchakarma equipment", detail: "Droni, Basti dough rings, oil warmers, steam unit, medicated oils (Dhanwantaram, Ksheerabala, etc.)", models: ["physical", "hybrid"] },
      { task: "Level 1 therapy tools", detail: "Panchdhatu Shalaka (Agnikarma), cupping set, acupuncture/dry needles, Marma oils", models: ["physical", "hybrid"] },
      { task: "Assessment tools", detail: "Posture analysis tablet/app, VAS scales, goniometer, examination couch", models: ["physical", "hybrid"] },
      { task: "Pharmacy stock", detail: "Classical Kashayams, Guggulu preparations, external Tailams, initial 30-day inventory", models: ["physical", "hybrid"] },
      { task: "Home therapy kits", detail: "Ear seeds, silicone cupping cups, exercise cards, Marma guides, meditation audio (for courier)", models: ["online", "hybrid"] },
      { task: "Tech setup", detail: "Computers/tablets with HMS access, printer, QR check-in system, billing", models: ["physical", "online", "hybrid"] },
    ],
  },
  {
    id: "staff", title: "4. Staff Onboarding", icon: Users,
    items: [
      { task: "Duty Doctor (BAMS)", detail: "Registered Ayurveda physician. Handles assessment, diagnosis, protocols, Level 1, prescriptions", models: ["physical", "online", "hybrid"] },
      { task: "Male Therapist", detail: "Trained in Panchakarma. Treats male patients. Certificate/diploma in PK therapy", models: ["physical", "hybrid"] },
      { task: "Female Therapist", detail: "Trained in Panchakarma. Treats female patients (mandatory for modesty)", models: ["physical", "hybrid"] },
      { task: "Receptionist", detail: "Booking, check-in, billing, follow-up calls. HMS reception training", models: ["physical", "hybrid"] },
      { task: "Online coordinator", detail: "Manages teleconsult scheduling, home kit dispatch, WhatsApp coaching", models: ["online", "hybrid"] },
      { task: "Staff training on HMS", detail: "All staff trained on relevant HMS modules (assessment, session recording, billing)", models: ["physical", "online", "hybrid"] },
    ],
  },
  {
    id: "licensing", title: "5. Licensing & Compliance", icon: FileCheck,
    items: [
      { task: "AYUSH clinic registration", detail: "Register clinic under state AYUSH department. Display registration certificate", models: ["physical", "hybrid"] },
      { task: "Doctor registration verify", detail: "BAMS doctor's state medical council registration valid and displayed", models: ["physical", "online", "hybrid"] },
      { task: "Drug license (pharmacy)", detail: "If dispensing medicines: retail drug license from state drug controller", models: ["physical", "hybrid"] },
      { task: "GST registration", detail: "Register for GST, set up billing with proper tax", models: ["physical", "online", "hybrid"] },
      { task: "Biomedical waste", detail: "Agreement with authorized biomedical waste disposal (needles, cupping waste)", models: ["physical", "hybrid"] },
      { task: "Franchise agreement", detail: "Sign Ayuzee franchise agreement, brand guidelines, revenue share terms", models: ["physical", "online", "hybrid"] },
      { task: "Insurance", detail: "Professional indemnity + establishment insurance", models: ["physical", "hybrid"] },
      { task: "Telemedicine compliance", detail: "Follow Telemedicine Practice Guidelines 2020 for online consultations", models: ["online", "hybrid"] },
    ],
  },
  {
    id: "launch", title: "6. Training & Launch", icon: Rocket,
    items: [
      { task: "Complete HMS training", detail: "Franchisee + staff complete Spine AYUSH module training (M1-M19)", models: ["physical", "online", "hybrid"] },
      { task: "Therapy certification", detail: "Therapists certified in 19 integrative therapies protocols", models: ["physical", "hybrid"] },
      { task: "Trial run (soft launch)", detail: "2 weeks with friends/family patients to test workflow", models: ["physical", "online", "hybrid"] },
      { task: "Marketing setup", detail: "Google Business, social media, local ads, referral program (Funnel & Marketing module)", models: ["physical", "online", "hybrid"] },
      { task: "Launch offer", detail: "AI Assessment ₹199 promo, opening discount packages", models: ["physical", "online", "hybrid"] },
      { task: "Go live", detail: "Grand opening, first paying patients, HMS fully operational", models: ["physical", "online", "hybrid"] },
    ],
  },
];

export default function SpineFranchiseSetup() {
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [currentStep, setCurrentStep] = useState(0);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [franchiseInfo, setFranchiseInfo] = useState({
    ownerName: "", centerName: "", city: "", phone: "", targetLaunch: "",
  });
  const [saving, setSaving] = useState(false);

  const toggleCheck = (id: string) => {
    setChecked(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };

  // Filter items by selected model
  const getStepItems = (step: SetupStep) =>
    selectedModel ? step.items.filter(i => i.models.includes(selectedModel)) : step.items;

  // Progress calculation
  const allApplicableItems = selectedModel
    ? setupSteps.flatMap((s, si) => getStepItems(s).map((_, ii) => `${si}-${ii}`))
    : [];
  const completedCount = allApplicableItems.filter(id => checked.has(id)).length;
  const totalCount = allApplicableItems.length;
  const overallPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const step = setupSteps[currentStep];
  const stepItems = getStepItems(step);
  const stepCompleted = stepItems.filter((_, ii) => checked.has(`${currentStep}-${ii}`)).length;
  const stepPct = stepItems.length > 0 ? Math.round((stepCompleted / stepItems.length) * 100) : 0;

  const handleSave = async () => {
    if (!franchiseInfo.ownerName || !selectedModel) { toast.error("Enter owner name and select a model"); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("spine_franchise_data").insert({
        record_type: "setup",
        owner_id: user?.id || null,
        center_name: franchiseInfo.centerName || franchiseInfo.ownerName,
        model: selectedModel,
        city: franchiseInfo.city,
        phone: franchiseInfo.phone,
        target_launch: franchiseInfo.targetLaunch || null,
        setup_progress: overallPct,
        completed_items: Array.from(checked),
        metadata: { ownerName: franchiseInfo.ownerName },
      });
      toast.success("Franchise setup progress saved!");
    } catch (err) { toast.error("Save failed"); }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Rocket className="h-6 w-6 text-orange-600" />
            Franchise Setup Wizard
          </h1>
          <p className="text-muted-foreground mt-1">
            Step-by-step guide to launch your Spine AYUSH Experience Center
          </p>
        </div>
        <Badge className="bg-orange-100 text-orange-700">
          <Building2 className="h-3 w-3 mr-1" /> Franchise Tool #1
        </Badge>
      </div>

      {/* Step 1: Model Selection */}
      {!selectedModel && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Choose Your Franchise Model</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {franchiseModels.map(model => {
                const Icon = model.icon;
                return (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`p-4 rounded-xl border-2 text-left transition hover:shadow-md hover:border-${model.color}-400`}
                  >
                    <div className={`w-12 h-12 rounded-lg bg-${model.color}-100 flex items-center justify-center mb-3`}>
                      <Icon className={`h-6 w-6 text-${model.color}-600`} />
                    </div>
                    <h3 className="font-bold">{model.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 mb-3">{model.desc}</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1"><IndianRupee className="h-3 w-3 text-green-600" /> {model.investment}</div>
                      <div className="flex items-center gap-1"><Home className="h-3 w-3 text-blue-600" /> {model.space}</div>
                      <div className="flex items-center gap-1"><Users className="h-3 w-3 text-purple-600" /> {model.staff}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedModel && (
        <>
          {/* Selected Model + Info */}
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-100 text-orange-700">
                    {franchiseModels.find(m => m.id === selectedModel)?.name}
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => setSelectedModel("")}>
                    Change Model
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={overallPct} className="h-2 w-32" />
                  <span className="text-xs font-medium">{completedCount}/{totalCount} ({overallPct}%)</span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <div><label className="text-[10px] font-medium">Owner Name</label><Input className="h-7 text-xs" value={franchiseInfo.ownerName} onChange={e => setFranchiseInfo(p => ({ ...p, ownerName: e.target.value }))} placeholder="Your name" /></div>
                <div><label className="text-[10px] font-medium">Center Name</label><Input className="h-7 text-xs" value={franchiseInfo.centerName} onChange={e => setFranchiseInfo(p => ({ ...p, centerName: e.target.value }))} placeholder="e.g. Ayuzee Spine Chennai" /></div>
                <div><label className="text-[10px] font-medium">City</label><Input className="h-7 text-xs" value={franchiseInfo.city} onChange={e => setFranchiseInfo(p => ({ ...p, city: e.target.value }))} placeholder="City" /></div>
                <div><label className="text-[10px] font-medium">Phone</label><Input className="h-7 text-xs" value={franchiseInfo.phone} onChange={e => setFranchiseInfo(p => ({ ...p, phone: e.target.value }))} placeholder="Contact" /></div>
                <div><label className="text-[10px] font-medium">Target Launch</label><Input type="date" className="h-7 text-xs" value={franchiseInfo.targetLaunch} onChange={e => setFranchiseInfo(p => ({ ...p, targetLaunch: e.target.value }))} /></div>
              </div>
            </CardContent>
          </Card>

          {/* Step Navigation Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {setupSteps.map((s, i) => {
              const Icon = s.icon;
              const items = getStepItems(s);
              const done = items.filter((_, ii) => checked.has(`${i}-${ii}`)).length;
              const complete = done === items.length && items.length > 0;
              return (
                <button
                  key={s.id}
                  onClick={() => setCurrentStep(i)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs whitespace-nowrap transition ${
                    currentStep === i ? "bg-orange-100 text-orange-700 border-2 border-orange-300" : "bg-muted hover:bg-muted/70"
                  }`}
                >
                  {complete ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <Icon className="h-3 w-3" />}
                  <span>{s.title}</span>
                </button>
              );
            })}
          </div>

          {/* Current Step Content */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <step.icon className="h-5 w-5 text-orange-600" /> {step.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Progress value={stepPct} className="h-2 w-24" />
                  <span className="text-xs">{stepCompleted}/{stepItems.length}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {stepItems.map((item, ii) => {
                const id = `${currentStep}-${ii}`;
                const isChecked = checked.has(id);
                return (
                  <div
                    key={ii}
                    onClick={() => toggleCheck(id)}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                      isChecked ? "bg-green-50 border-green-200" : "hover:bg-muted/50"
                    }`}
                  >
                    {isChecked ? <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" /> : <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isChecked ? "line-through text-muted-foreground" : ""}`}>{item.task}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Step Navigation Buttons */}
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" disabled={currentStep === 0} onClick={() => setCurrentStep(currentStep - 1)} className="gap-1">
              <ArrowLeft className="h-3 w-3" /> Previous Step
            </Button>
            <span className="text-xs text-muted-foreground">Step {currentStep + 1} of {setupSteps.length}</span>
            {currentStep < setupSteps.length - 1 ? (
              <Button size="sm" onClick={() => setCurrentStep(currentStep + 1)} className="gap-1">
                Next Step <ArrowRight className="h-3 w-3" />
              </Button>
            ) : (
              <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1">
                <Save className="h-3 w-3" /> {saving ? "Saving..." : "Save Progress"}
              </Button>
            )}
          </div>

          {/* Completion Summary */}
          {overallPct === 100 && (
            <Card className="border-green-300 bg-green-50">
              <CardContent className="pt-4 pb-3 text-center">
                <Award className="h-10 w-10 mx-auto text-green-600 mb-2" />
                <h3 className="font-bold text-green-700">Setup Complete — Ready to Launch!</h3>
                <p className="text-xs text-muted-foreground mt-1">All checklist items done. Your Spine AYUSH center is ready to go live.</p>
              </CardContent>
            </Card>
          )}

          {/* Quick Reference: Investment & Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card><CardContent className="pt-3 pb-2 text-center"><IndianRupee className="h-5 w-5 mx-auto text-green-600" /><p className="text-sm font-bold mt-1">{franchiseModels.find(m => m.id === selectedModel)?.investment}</p><p className="text-[9px] text-muted-foreground">Est. Investment</p></CardContent></Card>
            <Card><CardContent className="pt-3 pb-2 text-center"><Clock className="h-5 w-5 mx-auto text-blue-600" /><p className="text-sm font-bold mt-1">45-90 days</p><p className="text-[9px] text-muted-foreground">Setup Timeline</p></CardContent></Card>
            <Card><CardContent className="pt-3 pb-2 text-center"><Target className="h-5 w-5 mx-auto text-purple-600" /><p className="text-sm font-bold mt-1">6-12 months</p><p className="text-[9px] text-muted-foreground">Break-Even Target</p></CardContent></Card>
          </div>
        </>
      )}
    </div>
  );
}
