import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Activity, Brain, Users, IndianRupee, Target, Building2,
  TrendingUp, Star, Calendar, CheckCircle, BarChart3,
  AlertTriangle, Zap, Heart, Shield, FileText,
} from "lucide-react";

// ─── Data ───
const spineConditions = [
  { name: "Gridhrasi (Sciatica)", pct: 35, patients: 124, avgReduction: 68 },
  { name: "Greeva Stambha (Cervical)", pct: 25, patients: 89, avgReduction: 72 },
  { name: "Kati Shoola (Low Back Pain)", pct: 20, patients: 71, avgReduction: 65 },
  { name: "Disc Herniation (L4-L5/L5-S1)", pct: 12, patients: 43, avgReduction: 55 },
  { name: "Avabahuka (Frozen Shoulder)", pct: 5, patients: 18, avgReduction: 78 },
  { name: "Post-surgical Rehabilitation", pct: 3, patients: 11, avgReduction: 45 },
];

const protocols = [
  { name: "Kati Basti (Lumbar)", duration: "7 days", sessions: 7, price: 8500, successRate: 87, indication: "Low back pain, Sciatica, Disc bulge" },
  { name: "Greeva Basti (Cervical)", duration: "7 days", sessions: 7, price: 8500, successRate: 85, indication: "Neck pain, Cervical spondylosis, Arm numbness" },
  { name: "Prishtha Basti (Full Spine)", duration: "14 days", sessions: 14, price: 16000, successRate: 82, indication: "Multi-level spine involvement, Ankylosing spondylitis" },
  { name: "Agnikarma (Trigger Points)", duration: "3 sessions", sessions: 3, price: 4500, successRate: 78, indication: "Myofascial pain, Trigger points, Acute flare" },
  { name: "Tikta Ksheer Basti", duration: "16 days", sessions: 16, price: 12000, successRate: 80, indication: "Chronic Gridhrasi, Disc degeneration, Vata-Asthi" },
  { name: "Patra Pinda Sweda", duration: "7 days", sessions: 7, price: 7000, successRate: 75, indication: "Muscle spasm, Stiffness, Inflammation" },
  { name: "Nasya + Greeva Basti", duration: "7 days", sessions: 7, price: 9500, successRate: 83, indication: "Cervicogenic headache, C1-C3 involvement" },
  { name: "Meru Chikitsa (Spine Manipulation)", duration: "Per session", sessions: 5, price: 5000, successRate: 70, indication: "Spinal misalignment, Postural correction" },
  { name: "Spine Yoga Therapy", duration: "21 days", sessions: 21, price: 6000, successRate: 72, indication: "Maintenance, Prevention, Mild chronic pain" },
  { name: "PRP + Ayurveda (Integrative)", duration: "3 sessions", sessions: 3, price: 18000, successRate: 68, indication: "Disc degeneration, Failed conservative, Pre-surgical" },
];

const dermatomeMap = [
  { level: "C1-C3", organs: "Head, Scalp, Brain", diseases: "Migraine, Headache, Sinus, Vertigo, Eye strain", treatment: "Nasya + Shirodhara + Greeva Basti" },
  { level: "C4-C7", organs: "Shoulder, Arms, Thyroid, Lungs (upper)", diseases: "Frozen Shoulder, Arm numbness, Thyroid, Breathing issues", treatment: "Greeva Basti + Meru Chikitsa + Nasya" },
  { level: "T1-T4", organs: "Heart, Upper back, Chest", diseases: "Chest pain, Upper back pain, Palpitations", treatment: "Prishtha Basti + Hridaya Basti" },
  { level: "T5-T9", organs: "Stomach, Liver, Pancreas, Spleen", diseases: "Acidity, Diabetes (nerve connection), Liver disorders", treatment: "Prishtha Basti + Virechana + Udwarthanam" },
  { level: "T10-T12", organs: "Kidneys, Intestines, Skin", diseases: "Kidney stones, IBS, Psoriasis, Eczema", treatment: "Kati Basti + Virechana + Takradhara" },
  { level: "L1-L3", organs: "Reproductive organs, Colon, Bladder", diseases: "Infertility, PCOD, Constipation, Menstrual issues", treatment: "Kati Basti + Uttara Basti + Yoga" },
  { level: "L4-S1", organs: "Lower limbs, Sciatic nerve, Knees", diseases: "Sciatica, Knee pain, Foot drop, Leg weakness", treatment: "Kati Basti + Tikta Ksheer Basti + Agnikarma" },
  { level: "S2-Coccyx", organs: "Pelvic floor, Rectum, Sexual organs", diseases: "Piles, Fistula, Erectile dysfunction, Coccyx pain", treatment: "Kati Basti + Ksharasutra + Basti" },
];

const packages = [
  { name: "Spine Assessment Only", duration: "1 visit", price: 199, includes: "AI Spine Score + Posture Analysis + Report", type: "Entry" },
  { name: "Quick Relief (3-Day)", duration: "3 days", price: 4500, includes: "Kati/Greeva Basti × 3 + Medicines 7 days", type: "Trial" },
  { name: "Standard (7-Day)", duration: "7 days", price: 8500, includes: "Basti × 7 + Sweda × 7 + Medicines 30 days + Yoga chart", type: "Popular" },
  { name: "Intensive (14-Day)", duration: "14 days", price: 16000, includes: "Full spine PK + Basti 16 + Agnikarma × 3 + Medicines 60 days", type: "Recommended" },
  { name: "Comprehensive (21-Day)", duration: "21 days", price: 22000, includes: "Complete spine rejuvenation + All therapies + 90-day medicines + Yoga", type: "Premium" },
  { name: "Monthly Maintenance", duration: "Per month", price: 3500, includes: "Weekly session + Medicines + Yoga + WhatsApp support", type: "Subscription" },
  { name: "Corporate Spine Wellness", duration: "Per employee/month", price: 1500, includes: "Assessment + Ergonomic advice + Monthly session", type: "B2B" },
];

const branchSpineData = [
  { branch: "Kadayanallur", patients: 124, revenue: 892000, packages: 45, satisfaction: 4.8, successRate: 87 },
  { branch: "Tirunelveli", patients: 89, revenue: 534000, packages: 32, satisfaction: 4.7, successRate: 85 },
  { branch: "Rajapalayam", patients: 71, revenue: 426000, packages: 28, satisfaction: 4.6, successRate: 82 },
  { branch: "Theni", patients: 43, revenue: 258000, packages: 18, satisfaction: 4.5, successRate: 80 },
  { branch: "Chennai", patients: 56, revenue: 392000, packages: 22, satisfaction: 4.7, successRate: 84 },
  { branch: "Tenkasi", patients: 18, revenue: 108000, packages: 8, satisfaction: 4.4, successRate: 78 },
];

const HmsSpineAyush = () => {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "dashboard";
  const [liveKPIs, setLiveKPIs] = useState({
    totalPatients: 0,
    totalSessions: 0,
    totalLeads: 0,
    avgPainReduction: 0,
    loaded: false,
  });

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const [sessionsRes, leadsRes] = await Promise.all([
          supabase.from("spine_therapy_sessions").select("id, pain_before, pain_after, patient_id", { count: "exact" }),
          supabase.from("spine_leads").select("id", { count: "exact" }),
        ]);

        const sessions = sessionsRes.data || [];
        const uniquePatients = new Set(sessions.map(s => s.patient_id)).size;
        const sessionsWithPain = sessions.filter(s => s.pain_before && s.pain_after && s.pain_before > 0);
        const avgReduction = sessionsWithPain.length > 0
          ? Math.round(sessionsWithPain.reduce((sum, s) => sum + ((s.pain_before - s.pain_after) / s.pain_before) * 100, 0) / sessionsWithPain.length)
          : 0;

        setLiveKPIs({
          totalPatients: uniquePatients,
          totalSessions: sessionsRes.count || 0,
          totalLeads: leadsRes.count || 0,
          avgPainReduction: avgReduction,
          loaded: true,
        });
      } catch (err) {
        console.error("KPI fetch error:", err);
      }
    };
    fetchKPIs();
  }, []);

  // Fallback to static data when DB is empty
  const totalPatients = liveKPIs.loaded && liveKPIs.totalPatients > 0 ? liveKPIs.totalPatients : branchSpineData.reduce((s, b) => s + b.patients, 0);
  const totalRevenue = branchSpineData.reduce((s, b) => s + b.revenue, 0);
  const avgSuccess = liveKPIs.loaded && liveKPIs.avgPainReduction > 0 ? liveKPIs.avgPainReduction : Math.round(branchSpineData.reduce((s, b) => s + b.successRate, 0) / branchSpineData.length);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Activity className="h-6 w-6 text-blue-600" /> Spine AYUSH — Franchise Module</h1>
          <p className="text-muted-foreground mt-1">Spine-focused Ayurveda practice · Assessment → Treatment → Evidence · Franchise KPIs</p>
        </div>
        <Badge variant="outline" className="text-blue-600 border-blue-300"><Brain className="h-3 w-3 mr-1" /> AI-Powered</Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center"><Users className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">{totalPatients}</p><p className="text-xs text-muted-foreground">Spine Patients (All)</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><IndianRupee className="h-5 w-5 mx-auto text-green-600" /><p className="text-lg font-bold mt-1">₹{(totalRevenue/100000).toFixed(1)}L</p><p className="text-xs text-muted-foreground">Spine Revenue</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Target className="h-5 w-5 mx-auto text-orange-600" /><p className="text-xl font-bold mt-1">{avgSuccess}%</p><p className="text-xs text-muted-foreground">Success Rate</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Building2 className="h-5 w-5 mx-auto text-purple-600" /><p className="text-xl font-bold mt-1">{liveKPIs.loaded ? liveKPIs.totalLeads || branchSpineData.length : branchSpineData.length}</p><p className="text-xs text-muted-foreground">{liveKPIs.loaded && liveKPIs.totalLeads > 0 ? "Total Leads" : "Active Branches"}</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Star className="h-5 w-5 mx-auto text-amber-500" /><p className="text-xl font-bold mt-1">{liveKPIs.loaded ? liveKPIs.totalSessions || "4.7/5" : "4.7/5"}</p><p className="text-xs text-muted-foreground">{liveKPIs.loaded && liveKPIs.totalSessions > 0 ? "Total Sessions" : "Patient Satisfaction"}</p></CardContent></Card>
      </div>

      <Tabs defaultValue={tab} value={tab}>
        <TabsList className="hidden">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Top Spine Conditions</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {spineConditions.map(c => (
                  <div key={c.name} className="space-y-1">
                    <div className="flex justify-between text-xs"><span>{c.name}</span><span className="font-bold">{c.pct}% ({c.patients} pts)</span></div>
                    <Progress value={c.pct * 2.5} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Funnel Performance</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {[
                  { stage: "Assessment (₹199 entry)", count: 450, pct: 100 },
                  { stage: "Converted to Package", count: 280, pct: 62 },
                  { stage: "Completed Treatment", count: 220, pct: 49 },
                  { stage: "Follow-up Maintained", count: 165, pct: 37 },
                  { stage: "Referred Others", count: 85, pct: 19 },
                  { stage: "Upsold (Connected Disease)", count: 45, pct: 10 },
                ].map(s => (
                  <div key={s.stage} className="flex items-center gap-2">
                    <span className="text-xs w-[180px]">{s.stage}</span>
                    <Progress value={s.pct} className="flex-1 h-3" />
                    <span className="text-xs font-bold w-16 text-right">{s.count} ({s.pct}%)</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <Card className="border-purple-200 bg-purple-50/30">
            <CardContent className="p-4 flex items-start gap-3"><Brain className="h-5 w-5 text-purple-600 mt-0.5" /><div><p className="font-semibold text-purple-800">AI Insight</p><p className="text-sm text-purple-700">62% conversion from ₹199 assessment to package is strong. Gridhrasi patients have highest success rate (87%). Suggest: Target corporate employees (sitting jobs) for spine wellness packages — 70% of your sciatica cases are IT professionals aged 28-45.</p></div></CardContent>
          </Card>
        </TabsContent>

        {/* Assessment Tab */}
        <TabsContent value="assessment" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">AI Spine Assessment (₹199 Entry Point)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">Patient flow: Upload posture photo → AI scores → Doctor reviews → Package recommendation</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/30">
                  <Activity className="h-10 w-10 mx-auto text-muted-foreground/50" />
                  <p className="text-sm mt-2">Upload Posture Photo</p>
                  <p className="text-[10px] text-muted-foreground">Front + Side + Back views</p>
                </div>
                <div className="border rounded-lg p-4 bg-blue-50">
                  <p className="text-sm font-medium text-blue-700 mb-2">AI Spine Score</p>
                  <div className="text-center"><p className="text-4xl font-bold text-blue-600">45</p><p className="text-xs text-muted-foreground">/100 (Needs Attention)</p></div>
                  <Progress value={45} className="h-3 mt-2 [&>div]:bg-amber-500" />
                </div>
                <div className="border rounded-lg p-4 bg-green-50">
                  <p className="text-sm font-medium text-green-700 mb-2">AI Recommendation</p>
                  <p className="text-xs text-muted-foreground">Based on score + symptoms:</p>
                  <Badge className="mt-2 bg-green-600">7-Day Kati Basti Package</Badge>
                  <p className="text-xs mt-2">Estimated improvement: 65-75%</p>
                  <Button size="sm" className="mt-2 w-full" onClick={() => toast.success("Package booked!")}>Book Package ₹8,500</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Spine Score Guarantee */}
          <Card className="border-amber-300 bg-amber-50/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-800">Spine Score Guarantee™</p>
                  <p className="text-sm text-amber-700 mt-1">If your Spine Score doesn't improve by at least 50% within the treatment duration, we extend your treatment FREE until it does.</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-white rounded border"><p className="text-lg font-bold text-green-600">92%</p><p className="text-[10px] text-muted-foreground">Patients hit 50%+ improvement</p></div>
                    <div className="p-2 bg-white rounded border"><p className="text-lg font-bold">7 days</p><p className="text-[10px] text-muted-foreground">Avg time to 50% relief</p></div>
                    <div className="p-2 bg-white rounded border"><p className="text-lg font-bold text-amber-600">8%</p><p className="text-[10px] text-muted-foreground">Got free extension (still improved)</p></div>
                  </div>
                  <p className="text-[10px] text-amber-600 mt-2">* Guarantee auto-tracked by AI using VAS/ODI scores at each visit. No manual claims needed.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── SPINE EXAMINATION TAB ─── */}
        <TabsContent value="examination" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Spine Special Examination & Measurements</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">Fill during consultation. System auto-tracks progress across visits. Attach X-ray/MRI/Photos for documentation.</p>

              {/* ─── AYURVEDIC SPINE EXAMINATION (FIRST) ─── */}
              <div className="mb-4">
                <p className="text-sm font-bold mb-1 flex items-center gap-2">🍃 Ayurvedic Spine Examination (Kati Pradesha Pareeksha)</p>
                <p className="text-[10px] text-muted-foreground mb-3">Core Ayurvedic assessment — determines Dosha involvement, tissue damage, and treatment strategy (Shodhana vs Shamana).</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Dosha Assessment */}
                  <div className="p-3 border rounded-lg bg-green-50/30">
                    <p className="text-xs font-bold text-green-800 mb-2">Dosha Assessment (Spine-specific)</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between"><span className="text-xs">Vikruti (Current Imbalance)</span><Select defaultValue="vata-kapha"><SelectTrigger className="h-6 w-[130px] text-[10px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="vata">Vata ↑↑</SelectItem><SelectItem value="pitta">Pitta ↑↑</SelectItem><SelectItem value="kapha">Kapha ↑↑</SelectItem><SelectItem value="vata-pitta">Vata-Pitta ↑</SelectItem><SelectItem value="vata-kapha">Vata-Kapha ↑</SelectItem><SelectItem value="tridosha">Tridosha ↑</SelectItem></SelectContent></Select></div>
                      <div className="flex items-center justify-between"><span className="text-xs">Vedana Type (Pain)</span><Select defaultValue="toda"><SelectTrigger className="h-6 w-[130px] text-[10px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="toda">Toda (Pricking-Vata)</SelectItem><SelectItem value="daha">Daha (Burning-Pitta)</SelectItem><SelectItem value="gaurava">Gaurava (Heavy-Kapha)</SelectItem><SelectItem value="toda-daha">Toda+Daha (V+P)</SelectItem></SelectContent></Select></div>
                      <div className="flex items-center justify-between"><span className="text-xs">Pain Pattern (Ruk Prakriti)</span><Select defaultValue="evening"><SelectTrigger className="h-6 w-[130px] text-[10px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="morning">Morning (Kapha)</SelectItem><SelectItem value="afternoon">Afternoon (Pitta)</SelectItem><SelectItem value="evening">Evening/Night (Vata)</SelectItem><SelectItem value="constant">Constant (Tridosha)</SelectItem></SelectContent></Select></div>
                      <div className="flex items-center justify-between"><span className="text-xs">Dosha-Dushya (Tissue)</span><Select defaultValue="vata-asthi"><SelectTrigger className="h-6 w-[130px] text-[10px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="vata-asthi">Vata + Asthi (Bone)</SelectItem><SelectItem value="vata-majja">Vata + Majja (Marrow/Nerve)</SelectItem><SelectItem value="vata-snayu">Vata + Snayu (Ligament)</SelectItem><SelectItem value="vata-sandhi">Vata + Sandhi (Joint)</SelectItem><SelectItem value="kapha-meda">Kapha + Meda (Fat deposit)</SelectItem></SelectContent></Select></div>
                    </div>
                  </div>

                  {/* Agni & Ama */}
                  <div className="p-3 border rounded-lg bg-amber-50/30">
                    <p className="text-xs font-bold text-amber-800 mb-2">Agni, Ama & Koshtha</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between"><span className="text-xs">Agni (Digestive Fire)</span><Select defaultValue="manda"><SelectTrigger className="h-6 w-[130px] text-[10px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sama">Sama (Normal) ✅</SelectItem><SelectItem value="vishama">Vishama (Irregular-Vata)</SelectItem><SelectItem value="tikshna">Tikshna (Sharp-Pitta)</SelectItem><SelectItem value="manda">Manda (Weak-Kapha) ⚠️</SelectItem></SelectContent></Select></div>
                      <div className="flex items-center justify-between"><span className="text-xs">Ama (Toxins)</span><Select defaultValue="moderate"><SelectTrigger className="h-6 w-[130px] text-[10px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="absent">Absent ✅</SelectItem><SelectItem value="mild">Mild (tongue coat)</SelectItem><SelectItem value="moderate">Moderate (stiffness+coat)</SelectItem><SelectItem value="severe">Severe (fever+pain+coat)</SelectItem></SelectContent></Select></div>
                      <div className="flex items-center justify-between"><span className="text-xs">Koshtha (Bowel)</span><Select defaultValue="krura"><SelectTrigger className="h-6 w-[130px] text-[10px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="mridu">Mridu (Soft-easy purge)</SelectItem><SelectItem value="madhya">Madhya (Moderate)</SelectItem><SelectItem value="krura">Krura (Hard-difficult)</SelectItem></SelectContent></Select></div>
                      <div className="flex items-center justify-between"><span className="text-xs">Srotas Dushti (Channel)</span><Select defaultValue="asthi-vaha"><SelectTrigger className="h-6 w-[130px] text-[10px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="asthi-vaha">Asthi-vaha (Bone)</SelectItem><SelectItem value="majja-vaha">Majja-vaha (Nerve)</SelectItem><SelectItem value="vata-vaha">Vata-vaha (Vata channel)</SelectItem><SelectItem value="mamsa-vaha">Mamsa-vaha (Muscle)</SelectItem><SelectItem value="multiple">Multiple Srotas</SelectItem></SelectContent></Select></div>
                    </div>
                  </div>

                  {/* Bala & Sara */}
                  <div className="p-3 border rounded-lg">
                    <p className="text-xs font-bold mb-2">Bala & Sara (Strength & Tissue Quality)</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between"><span className="text-xs">Rogi Bala (Patient Strength)</span><Select defaultValue="madhyama"><SelectTrigger className="h-6 w-[120px] text-[10px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pravara">Pravara (Strong)</SelectItem><SelectItem value="madhyama">Madhyama (Moderate)</SelectItem><SelectItem value="avara">Avara (Weak)</SelectItem></SelectContent></Select></div>
                      <div className="flex items-center justify-between"><span className="text-xs">Roga Bala (Disease Strength)</span><Select defaultValue="madhyama"><SelectTrigger className="h-6 w-[120px] text-[10px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pravara">Pravara (Severe)</SelectItem><SelectItem value="madhyama">Madhyama (Moderate)</SelectItem><SelectItem value="avara">Avara (Mild)</SelectItem></SelectContent></Select></div>
                      <div className="flex items-center justify-between"><span className="text-xs">Asthi Sara (Bone Quality)</span><Select defaultValue="madhyama"><SelectTrigger className="h-6 w-[120px] text-[10px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pravara">Pravara (Strong bones)</SelectItem><SelectItem value="madhyama">Madhyama (Average)</SelectItem><SelectItem value="avara">Avara (Weak/Osteopenia)</SelectItem></SelectContent></Select></div>
                      <div className="flex items-center justify-between"><span className="text-xs">Satva (Mental Tolerance)</span><Select defaultValue="madhyama"><SelectTrigger className="h-6 w-[120px] text-[10px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pravara">Pravara (High tolerance)</SelectItem><SelectItem value="madhyama">Madhyama (Average)</SelectItem><SelectItem value="avara">Avara (Low — fears treatment)</SelectItem></SelectContent></Select></div>
                    </div>
                  </div>

                  {/* Sparsha & Shabda */}
                  <div className="p-3 border rounded-lg">
                    <p className="text-xs font-bold mb-2">Sparsha & Shabda (Palpation & Sound)</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between"><span className="text-xs">Sparsha — Temperature</span><Select defaultValue="cold"><SelectTrigger className="h-6 w-[120px] text-[10px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="hot">Ushna (Hot-Pitta)</SelectItem><SelectItem value="cold">Sheeta (Cold-Vata)</SelectItem><SelectItem value="normal">Sama (Normal)</SelectItem></SelectContent></Select></div>
                      <div className="flex items-center justify-between"><span className="text-xs">Sparsha — Muscle Tone</span><Select defaultValue="spasm"><SelectTrigger className="h-6 w-[120px] text-[10px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="normal">Normal</SelectItem><SelectItem value="spasm">Spasm (Sthambha)</SelectItem><SelectItem value="atrophy">Atrophy (Shosha)</SelectItem><SelectItem value="swollen">Swollen (Shopha)</SelectItem></SelectContent></Select></div>
                      <div className="flex items-center justify-between"><span className="text-xs">Shabda — Crepitus</span><Select defaultValue="present"><SelectTrigger className="h-6 w-[120px] text-[10px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="absent">Absent</SelectItem><SelectItem value="present">Present (Atopa)</SelectItem><SelectItem value="severe">Severe (multiple levels)</SelectItem></SelectContent></Select></div>
                      <div className="flex items-center justify-between"><span className="text-xs">Nadi (Pulse quality)</span><Select defaultValue="vata"><SelectTrigger className="h-6 w-[120px] text-[10px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="vata">Sarpa gati (Snake-Vata)</SelectItem><SelectItem value="pitta">Manduka gati (Frog-Pitta)</SelectItem><SelectItem value="kapha">Hamsa gati (Swan-Kapha)</SelectItem></SelectContent></Select></div>
                    </div>
                  </div>
                </div>

                {/* AI Treatment Decision */}
                <div className="mt-3 p-3 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-xs text-green-700"><Brain className="h-3 w-3 inline mr-1" /><strong>AI Treatment Decision:</strong> Vata-Kapha involvement + Manda Agni + Moderate Ama + Krura Koshtha → Strategy: Deepana-Pachana first (7 days) → then Tikta Ksheer Basti (not Virechana, as Koshtha is Krura). Kati Basti with Sahacharadi Taila (Vata-Kapha). Avoid strong purgation.</p>
                </div>
              </div>

              {/* ─── GUT-SPINE CONNECTION ASSESSMENT ─── */}
              <Separator className="my-4" />
              <div>
                <p className="text-sm font-bold mb-1 flex items-center gap-2">🫁 Gut-Spine Connection Assessment</p>
                <p className="text-[10px] text-muted-foreground mb-3">"Fix the gut → Fix the spine." Vata originates in Pakwashaya (colon). Weak Agni → Ama → deposits in spine joints. Basti works via gut to treat spine. Assess gut health to determine treatment readiness.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Agni Detailed Assessment */}
                  <div className="p-3 border rounded-lg bg-orange-50/30">
                    <p className="text-xs font-bold text-orange-800 mb-2">Jatharagni (Digestive Fire) — Detailed</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between"><span className="text-xs">Agni Type</span><Select defaultValue="manda"><SelectTrigger className="h-6 w-[130px] text-[10px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sama">Sama (Normal) ✅</SelectItem><SelectItem value="vishama">Vishama (Irregular-Vata)</SelectItem><SelectItem value="tikshna">Tikshna (Hyper-Pitta)</SelectItem><SelectItem value="manda">Manda (Hypo-Kapha) ⚠️</SelectItem></SelectContent></Select></div>
                      <div className="flex items-center justify-between"><span className="text-xs">Appetite Pattern</span><Select defaultValue="low"><SelectTrigger className="h-6 w-[130px] text-[10px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="strong">Strong (eats on time)</SelectItem><SelectItem value="variable">Variable (skips meals)</SelectItem><SelectItem value="low">Low (no hunger)</SelectItem><SelectItem value="excessive">Excessive (always hungry)</SelectItem></SelectContent></Select></div>
                      <div className="flex items-center justify-between"><span className="text-xs">Digestion Time</span><Select defaultValue="slow"><SelectTrigger className="h-6 w-[130px] text-[10px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="fast">Fast (&lt;2 hrs)</SelectItem><SelectItem value="normal">Normal (3-4 hrs)</SelectItem><SelectItem value="slow">Slow (&gt;5 hrs) ⚠️</SelectItem><SelectItem value="variable">Variable</SelectItem></SelectContent></Select></div>
                      <div className="flex items-center justify-between"><span className="text-xs">Post-meal Feeling</span><Select defaultValue="heavy"><SelectTrigger className="h-6 w-[130px] text-[10px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="light">Light & Energetic ✅</SelectItem><SelectItem value="heavy">Heavy & Drowsy ⚠️</SelectItem><SelectItem value="bloated">Bloated & Gassy</SelectItem><SelectItem value="acidic">Acidic & Burning</SelectItem></SelectContent></Select></div>
                    </div>
                  </div>

                  {/* Ama Index */}
                  <div className="p-3 border rounded-lg bg-red-50/30">
                    <p className="text-xs font-bold text-red-800 mb-2">Ama Index (Toxin Load Score)</p>
                    <p className="text-[10px] text-muted-foreground mb-2">Check all that apply (each = 1 point). Score /10:</p>
                    <div className="grid grid-cols-1 gap-1">
                      {[
                        { sign: "Thick tongue coating (white/yellow)", checked: true },
                        { sign: "Body heaviness / lethargy", checked: true },
                        { sign: "Morning stiffness > 30 min", checked: true },
                        { sign: "Foul-smelling stool/flatulence", checked: false },
                        { sign: "Loss of appetite / taste", checked: true },
                        { sign: "Generalized body ache (Angamarda)", checked: true },
                        { sign: "Sticky/mucoid stool", checked: false },
                        { sign: "Turbid urine", checked: false },
                        { sign: "Feeling of incomplete evacuation", checked: true },
                        { sign: "Fatigue even after sleep", checked: true },
                      ].map((a, i) => (
                        <label key={i} className="flex items-center gap-2 text-[10px]">
                          <input type="checkbox" defaultChecked={a.checked} className="h-3 w-3" />
                          <span className={a.checked ? "font-medium" : "text-muted-foreground"}>{a.sign}</span>
                        </label>
                      ))}
                    </div>
                    <div className="mt-2 p-2 rounded bg-red-100 text-center">
                      <p className="text-xs"><strong>Ama Score: 7/10</strong> — Moderate-Severe</p>
                      <p className="text-[10px] text-red-700">Deepana-Pachana mandatory before Panchakarma</p>
                    </div>
                  </div>

                  {/* Mala Pareeksha (Stool Assessment) */}
                  <div className="p-3 border rounded-lg">
                    <p className="text-xs font-bold mb-2">Mala Pareeksha (Stool Assessment)</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between"><span className="text-xs">Frequency</span><Select defaultValue="irregular"><SelectTrigger className="h-6 w-[120px] text-[10px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1-daily">1x/day (Normal)</SelectItem><SelectItem value="2-daily">2-3x/day (Pitta)</SelectItem><SelectItem value="irregular">Irregular (Vata) ⚠️</SelectItem><SelectItem value="constipated">Constipated (2-3 days)</SelectItem></SelectContent></Select></div>
                      <div className="flex items-center justify-between"><span className="text-xs">Bristol Chart Type</span><Select defaultValue="2"><SelectTrigger className="h-6 w-[120px] text-[10px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">Type 1 (Hard lumps)</SelectItem><SelectItem value="2">Type 2 (Sausage-lumpy)</SelectItem><SelectItem value="3">Type 3 (Sausage-cracks)</SelectItem><SelectItem value="4">Type 4 (Smooth) ✅</SelectItem><SelectItem value="5">Type 5 (Soft blobs)</SelectItem><SelectItem value="6">Type 6 (Mushy)</SelectItem><SelectItem value="7">Type 7 (Watery)</SelectItem></SelectContent></Select></div>
                      <div className="flex items-center justify-between"><span className="text-xs">Floats/Sinks</span><Select defaultValue="sinks"><SelectTrigger className="h-6 w-[120px] text-[10px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="floats">Floats (Ama present)</SelectItem><SelectItem value="sinks">Sinks (Normal)</SelectItem></SelectContent></Select></div>
                      <div className="flex items-center justify-between"><span className="text-xs">Odor</span><Select defaultValue="foul"><SelectTrigger className="h-6 w-[120px] text-[10px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="normal">Normal</SelectItem><SelectItem value="foul">Foul (Ama/Pitta)</SelectItem><SelectItem value="sour">Sour (Pitta)</SelectItem><SelectItem value="odorless">Odorless (Kapha)</SelectItem></SelectContent></Select></div>
                      <div className="flex items-center justify-between"><span className="text-xs">Mucus/Blood</span><Select defaultValue="none"><SelectTrigger className="h-6 w-[120px] text-[10px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">None ✅</SelectItem><SelectItem value="mucus">Mucus (Kapha/Ama)</SelectItem><SelectItem value="blood">Blood (refer GI)</SelectItem></SelectContent></Select></div>
                    </div>
                  </div>

                  {/* Gut Symptom Score */}
                  <div className="p-3 border rounded-lg">
                    <p className="text-xs font-bold mb-2">Gut Symptom Score (0-45)</p>
                    <p className="text-[10px] text-muted-foreground mb-2">Rate 0=Never, 1=Sometimes, 2=Often, 3=Always:</p>
                    <div className="space-y-1">
                      {[
                        { symptom: "Bloating after meals", score: 2 },
                        { symptom: "Gas / Flatulence (Adhmana)", score: 3 },
                        { symptom: "Constipation (Vibandha)", score: 2 },
                        { symptom: "Acid reflux / Heartburn (Amlapitta)", score: 1 },
                        { symptom: "Abdominal pain / cramping", score: 1 },
                        { symptom: "Food intolerance (milk/wheat)", score: 2 },
                        { symptom: "Heaviness after eating (Gaurava)", score: 3 },
                        { symptom: "Incomplete evacuation", score: 2 },
                        { symptom: "Alternating constipation/diarrhea", score: 1 },
                        { symptom: "Nausea / Loss of appetite", score: 2 },
                        { symptom: "Fatigue after eating", score: 2 },
                        { symptom: "Skin issues (acne/eczema)", score: 1 },
                        { symptom: "Bad breath / Coated tongue", score: 2 },
                        { symptom: "Brain fog after meals", score: 1 },
                        { symptom: "Sugar/carb cravings", score: 2 },
                      ].map((g, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-[10px]">{g.symptom}</span>
                          <Select defaultValue={String(g.score)}><SelectTrigger className="h-5 w-10 text-[9px] p-0 justify-center"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="0">0</SelectItem><SelectItem value="1">1</SelectItem><SelectItem value="2">2</SelectItem><SelectItem value="3">3</SelectItem></SelectContent></Select>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 p-2 rounded bg-amber-100 text-center">
                      <p className="text-xs"><strong>Gut Score: 27/45</strong> — Moderate Gut Dysfunction</p>
                      <p className="text-[10px] text-amber-700">Correlates with spine: Weak gut = Vata aggravation = chronic pain</p>
                    </div>
                  </div>
                </div>

                {/* Gut-Spine AI Correlation */}
                <div className="mt-3 p-3 rounded-lg bg-purple-50 border border-purple-200">
                  <p className="text-xs text-purple-700"><Brain className="h-3 w-3 inline mr-1" /><strong>AI Gut-Spine Correlation:</strong> Ama Score 7/10 + Manda Agni + Gut Score 27/45 + Constipation (Krura Koshtha) → This patient's spine pain is 60% GUT-DRIVEN. Strategy: Fix gut FIRST (7-day Deepana-Pachana with Trikatu + Hingvastak), THEN start Kati Basti. Basti will be more effective after Ama reduction. Expected improvement: 30% pain relief just from gut correction alone.</p>
                </div>
              </div>

              <Separator />

              {/* Quick Orthopedic Tests */}
              <p className="text-sm font-bold mb-2 mt-3 flex items-center gap-2">🦴 Modern Orthopedic Tests</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {[
                  { test: "SLR (Straight Leg Raise)", input: "Angle °", left: "30°", right: "70°", normal: "80-90°", significance: "Positive <60° = Sciatic nerve tension (Gridhrasi)" },
                  { test: "Schober's Test", input: "cm", left: "3.5 cm", right: "—", normal: ">5 cm", significance: "Reduced = Lumbar stiffness / Ankylosing Spondylitis" },
                  { test: "Finger-to-Floor Distance", input: "cm", left: "25 cm", right: "—", normal: "0 cm", significance: "Increased = Hamstring tightness + Lumbar restriction" },
                  { test: "FABER/Patrick's Test", input: "+/-", left: "Positive", right: "Negative", normal: "Negative", significance: "Positive = SI joint / Hip involvement" },
                ].map((t, i) => (
                  <div key={i} className="p-3 border rounded-lg">
                    <p className="text-sm font-bold">{t.test}</p>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div><p className="text-[10px] text-muted-foreground">Left</p><Input defaultValue={t.left} className="h-7 text-xs" /></div>
                      <div><p className="text-[10px] text-muted-foreground">Right</p><Input defaultValue={t.right} className="h-7 text-xs" /></div>
                      <div><p className="text-[10px] text-muted-foreground">Normal</p><p className="text-xs mt-1 text-green-600">{t.normal}</p></div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{t.significance}</p>
                  </div>
                ))}
              </div>

              {/* ROM Measurements */}
              <Separator />
              <p className="text-sm font-medium mt-3 mb-2">Range of Motion (ROM)</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {[
                  { movement: "Lumbar Flexion", value: "40°", normal: "60°" },
                  { movement: "Lumbar Extension", value: "15°", normal: "25°" },
                  { movement: "Lumbar Lat. Flexion (L)", value: "20°", normal: "25°" },
                  { movement: "Lumbar Lat. Flexion (R)", value: "22°", normal: "25°" },
                  { movement: "Cervical Flexion", value: "35°", normal: "45°" },
                  { movement: "Cervical Extension", value: "40°", normal: "45°" },
                  { movement: "Cervical Rotation (L)", value: "60°", normal: "80°" },
                  { movement: "Cervical Rotation (R)", value: "65°", normal: "80°" },
                ].map((r, i) => (
                  <div key={i} className="p-2 border rounded text-center">
                    <p className="text-[10px] text-muted-foreground">{r.movement}</p>
                    <Input defaultValue={r.value} className="h-7 text-xs text-center mt-1" />
                    <p className="text-[10px] text-green-600">Normal: {r.normal}</p>
                  </div>
                ))}
              </div>

              {/* Motor Power & Reflexes */}
              <Separator />
              <p className="text-sm font-medium mt-3 mb-2">Motor Power (MRC Scale 0-5) & Reflexes</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="border-b bg-muted/50"><tr><th className="px-2 py-1 text-left">Level</th><th className="px-2 py-1 text-center">Muscle</th><th className="px-2 py-1 text-center">Left</th><th className="px-2 py-1 text-center">Right</th><th className="px-2 py-1 text-center">Reflex</th><th className="px-2 py-1 text-center">Status</th></tr></thead>
                  <tbody>
                    {[
                      { level: "L3-L4", muscle: "Quadriceps", left: "5/5", right: "5/5", reflex: "Knee Jerk", status: "Normal" },
                      { level: "L4-L5", muscle: "Tibialis Anterior", left: "4/5", right: "5/5", reflex: "—", status: "Weak (L)" },
                      { level: "L5-S1", muscle: "EHL / Peronei", left: "3/5", right: "5/5", reflex: "Ankle Jerk", status: "Weak (L)" },
                      { level: "S1-S2", muscle: "Gastrocnemius", left: "4/5", right: "5/5", reflex: "Ankle Jerk", status: "Diminished (L)" },
                    ].map((m, i) => (
                      <tr key={i} className="border-b"><td className="px-2 py-1 font-medium">{m.level}</td><td className="px-2 py-1 text-center">{m.muscle}</td><td className="px-2 py-1 text-center"><Input defaultValue={m.left} className="h-6 text-xs text-center w-12 inline-block" /></td><td className="px-2 py-1 text-center"><Input defaultValue={m.right} className="h-6 text-xs text-center w-12 inline-block" /></td><td className="px-2 py-1 text-center">{m.reflex}</td><td className="px-2 py-1 text-center"><Badge variant={m.status === "Normal" ? "outline" : "destructive"} className={`text-[9px] ${m.status === "Normal" ? "text-green-600" : ""}`}>{m.status}</Badge></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Sensory Dermatome */}
              <Separator />
              <p className="text-sm font-medium mt-3 mb-2">Dermatomal Sensory Map</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {["L1 (Groin)", "L2 (Anterior Thigh)", "L3 (Medial Knee)", "L4 (Medial Leg)", "L5 (Dorsum Foot)", "S1 (Lateral Foot)", "S2 (Posterior Thigh)", "C5-C8 (Upper Limb)"].map((d, i) => (
                  <div key={i} className="p-2 border rounded">
                    <p className="text-[10px] font-medium">{d}</p>
                    <Select defaultValue={i === 4 || i === 5 ? "reduced" : "normal"}><SelectTrigger className="h-6 text-[10px] mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="normal">Normal</SelectItem><SelectItem value="reduced">Reduced</SelectItem><SelectItem value="absent">Absent</SelectItem><SelectItem value="tingling">Tingling</SelectItem></SelectContent></Select>
                  </div>
                ))}
              </div>

              {/* ODI & NDI Scores */}
              <Separator />
              <p className="text-sm font-medium mt-3 mb-2">Disability Scores</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="p-3 border rounded-lg">
                  <p className="text-sm font-bold">ODI (Oswestry Disability Index)</p>
                  <p className="text-[10px] text-muted-foreground">10 questions: Pain, Personal Care, Lifting, Walking, Sitting, Standing, Sleeping, Social Life, Travelling, Employment</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Input defaultValue="42" className="h-8 w-16 text-center" />
                    <span className="text-sm font-bold">/ 100%</span>
                    <Badge variant="destructive" className="text-xs">Severe Disability</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">0-20%: Minimal | 21-40%: Moderate | 41-60%: Severe | 61-80%: Crippled | 81-100%: Bed-bound</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-sm font-bold">NDI (Neck Disability Index)</p>
                  <p className="text-[10px] text-muted-foreground">10 questions: Pain, Personal Care, Lifting, Reading, Headaches, Concentration, Work, Driving, Sleeping, Recreation</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Input defaultValue="28" className="h-8 w-16 text-center" />
                    <span className="text-sm font-bold">/ 100%</span>
                    <Badge className="text-xs bg-amber-500">Moderate Disability</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">0-20%: Minimal | 21-40%: Moderate | 41-60%: Severe | 61-80%: Complete | 81-100%: Bed-bound</p>
                </div>
              </div>

              {/* Document Attachments */}
              <Separator />
              <p className="text-sm font-medium mt-3 mb-2">Attach Supporting Documents</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { type: "X-ray (AP/Lateral)", accept: ".jpg,.png,.pdf,.dcm", icon: "🦴" },
                  { type: "MRI Report / Images", accept: ".jpg,.png,.pdf,.dcm", icon: "🧲" },
                  { type: "Posture Photos (Front/Side/Back)", accept: ".jpg,.png", icon: "📷" },
                ].map((d, i) => (
                  <div key={i} className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/30 cursor-pointer">
                    <p className="text-2xl">{d.icon}</p>
                    <p className="text-xs font-medium mt-1">{d.type}</p>
                    <Input type="file" accept={d.accept} className="mt-2 text-[10px]" onChange={() => toast.success(`${d.type} uploaded`)} />
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 rounded-lg bg-purple-50 border border-purple-200">
                <p className="text-xs text-purple-700"><Brain className="h-3 w-3 inline mr-1" /><strong>AI:</strong> Uploaded X-rays/MRI will be analyzed for disc height, osteophytes, alignment. Posture photos auto-scored. All measurements tracked across visits for progress graphs.</p>
              </div>

              {/* ─── TCM / ACUPUNCTURE SPINE ASSESSMENT ─── */}
              <Separator className="my-4" />
              <div>
                <p className="text-sm font-bold mb-1 flex items-center gap-2">🏮 TCM / Acupuncture Spine Assessment</p>
                <p className="text-[10px] text-muted-foreground mb-3">Palpate Back Shu Points & Huatuojiaji points along spine. Mark tender (T) or normal (N). Cross-validates Ayurvedic findings with Chinese Medicine meridian theory.</p>

                {/* Visual Spine Diagram with Points */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Diagram Side */}
                  <Card className="border-orange-200">
                    <CardHeader className="pb-1"><CardTitle className="text-sm">Spine Point Diagram (Back Shu + Huatuojiaji)</CardTitle></CardHeader>
                    <CardContent className="p-2">
                      <div className="bg-gradient-to-b from-blue-50 to-amber-50 rounded-lg p-3 font-mono text-[10px] leading-relaxed border">
                        <p className="text-center font-bold mb-1">── VERTEBRAL LEVEL ── Back Shu (BL) ── Organ ──</p>
                        <div className="space-y-0.5">
                          {[
                            { v: "C7/T1", point: "GV-14 (Dazhui)", organ: "Immunity Master Point", zone: "cervical" },
                            { v: "T3", point: "BL-13 (Feishu)", organ: "LUNGS 🫁", zone: "thoracic" },
                            { v: "T4", point: "BL-14 (Jueyinshu)", organ: "PERICARDIUM ❤️", zone: "thoracic" },
                            { v: "T5", point: "BL-15 (Xinshu)", organ: "HEART ❤️", zone: "thoracic" },
                            { v: "T9", point: "BL-18 (Ganshu)", organ: "LIVER 🫘", zone: "thoracic" },
                            { v: "T10", point: "BL-19 (Danshu)", organ: "GALLBLADDER", zone: "thoracic" },
                            { v: "T11", point: "BL-20 (Pishu)", organ: "SPLEEN (Immunity)", zone: "thoracic" },
                            { v: "T12", point: "BL-21 (Weishu)", organ: "STOMACH 🍽️", zone: "thoracic" },
                            { v: "L1", point: "BL-22 (Sanjiaoshu)", organ: "TRIPLE HEATER (Metabolism)", zone: "lumbar" },
                            { v: "L2", point: "BL-23 (Shenshu)", organ: "KIDNEY 🫘 (Fertility/Energy)", zone: "lumbar" },
                            { v: "L2", point: "GV-4 (Mingmen)", organ: "LIFE GATE 🔥 (Kidney Yang=Agni)", zone: "lumbar" },
                            { v: "L4", point: "BL-25 (Dachangshu)", organ: "LARGE INTESTINE (IBS)", zone: "lumbar" },
                            { v: "S1", point: "BL-27 (Xiaochangshu)", organ: "SMALL INTESTINE", zone: "sacral" },
                            { v: "S2", point: "BL-28 (Pangguangshu)", organ: "BLADDER (Urinary)", zone: "sacral" },
                          ].map((p, i) => (
                            <div key={i} className={`flex items-center gap-1 px-1 rounded ${p.zone === "cervical" ? "bg-blue-100" : p.zone === "thoracic" ? "bg-green-50" : p.zone === "lumbar" ? "bg-amber-50" : "bg-red-50"}`}>
                              <span className="w-[40px] font-bold">{p.v}</span>
                              <span className="w-[140px]">{p.point}</span>
                              <span className="flex-1">{p.organ}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-center mt-2 text-muted-foreground">🔵 Cervical | 🟢 Thoracic | 🟡 Lumbar | 🔴 Sacral</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Assessment Input Side */}
                  <Card>
                    <CardHeader className="pb-1"><CardTitle className="text-sm">Palpation Findings (Mark Tender Points)</CardTitle></CardHeader>
                    <CardContent className="p-2">
                      <p className="text-[10px] text-muted-foreground mb-2">Press each point firmly (2-3 sec). Record: T=Tender, N=Normal, P=Pain radiating, S=Spasm</p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-[10px]">
                          <thead className="border-b"><tr><th className="px-1 py-0.5 text-left">Point</th><th className="px-1 py-0.5 text-center">Left</th><th className="px-1 py-0.5 text-center">Right</th><th className="px-1 py-0.5 text-left">Organ Link</th><th className="px-1 py-0.5 text-left">If Tender →</th></tr></thead>
                          <tbody>
                            {[
                              { point: "BL-13 (T3)", left: "N", right: "N", organ: "Lungs", meaning: "Respiratory issues, Shwasa" },
                              { point: "BL-15 (T5)", left: "T", right: "N", organ: "Heart", meaning: "Anxiety, palpitations" },
                              { point: "BL-18 (T9)", left: "T", right: "T", organ: "Liver", meaning: "LFT issue, Pitta aggravation" },
                              { point: "BL-20 (T11)", left: "N", right: "N", organ: "Spleen", meaning: "Low immunity, fatigue" },
                              { point: "BL-21 (T12)", left: "T", right: "N", organ: "Stomach", meaning: "Gastric, Mandagni" },
                              { point: "BL-23 (L2)", left: "T", right: "T", organ: "Kidney", meaning: "Low back pain, infertility, Vata" },
                              { point: "GV-4 Mingmen", left: "—", right: "T", organ: "Life Gate", meaning: "Kidney Yang low = weak Agni" },
                              { point: "BL-25 (L4)", left: "T", right: "N", organ: "Large Intestine", meaning: "Constipation, IBS" },
                              { point: "BL-28 (S2)", left: "N", right: "N", organ: "Bladder", meaning: "Urinary frequency" },
                              { point: "GV-14 Dazhui", left: "—", right: "N", organ: "Immunity", meaning: "Frequent illness, low Ojas" },
                            ].map((p, i) => (
                              <tr key={i} className={`border-b ${p.left === "T" || p.right === "T" ? "bg-red-50" : ""}`}>
                                <td className="px-1 py-1 font-medium">{p.point}</td>
                                <td className="px-1 py-1 text-center"><Select defaultValue={p.left}><SelectTrigger className="h-5 w-10 text-[9px] p-0 justify-center"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="N">N</SelectItem><SelectItem value="T">T</SelectItem><SelectItem value="P">P</SelectItem><SelectItem value="S">S</SelectItem></SelectContent></Select></td>
                                <td className="px-1 py-1 text-center"><Select defaultValue={p.right}><SelectTrigger className="h-5 w-10 text-[9px] p-0 justify-center"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="N">N</SelectItem><SelectItem value="T">T</SelectItem><SelectItem value="P">P</SelectItem><SelectItem value="S">S</SelectItem></SelectContent></Select></td>
                                <td className="px-1 py-1">{p.organ}</td>
                                <td className="px-1 py-1 text-muted-foreground">{p.meaning}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-2 p-2 rounded bg-orange-50 border border-orange-200">
                        <p className="text-[10px] text-orange-700"><strong>AI Correlation:</strong> BL-23 (Kidney) + BL-25 (LI) + GV-4 (Mingmen) tender bilaterally → confirms Vata in Lumbar + Mandagni. Correlates with Ayurvedic finding of Gridhrasi + Katishoola. Treatment: Kati Basti at L2-L4 + acupressure on BL-23/GV-4 during therapy.</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Huatuojiaji Points */}
                <Card className="mt-3">
                  <CardHeader className="pb-1"><CardTitle className="text-sm">Huatuojiaji Points (EX-B2) — Paravertebral Tender Points</CardTitle></CardHeader>
                  <CardContent className="p-3">
                    <p className="text-[10px] text-muted-foreground mb-2">0.5 cun lateral to each spinous process. Mark levels that are tender → these are your Agnikarma/Acupuncture treatment points.</p>
                    <div className="flex flex-wrap gap-1">
                      {["C3","C4","C5","C6","C7","T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12","L1","L2","L3","L4","L5","S1","S2"].map((v, i) => (
                        <button key={v} className={`px-2 py-1 rounded border text-[10px] font-medium transition ${["L4","L5","S1","T9","T12"].includes(v) ? "bg-red-100 border-red-400 text-red-700" : "bg-white border-gray-200 hover:bg-blue-50"}`} onClick={() => toast.info(`${v} marked as tender`)}>
                          {v} {["L4","L5","S1","T9","T12"].includes(v) && "🔴"}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">🔴 = Currently marked tender (click to toggle). These levels correlate with treatment zones for Agnikarma, Cupping, and Acupuncture needle placement.</p>
                  </CardContent>
                </Card>
              </div>

              {/* ─── SIDDHA VARMA POINTS (12 Spine Todu Varmam) ─── */}
              <Separator className="my-4" />
              <div>
                <p className="text-sm font-bold mb-1 flex items-center gap-2">🔱 Siddha Varma Points (12 Spine Todu Varmam)</p>
                <p className="text-[10px] text-muted-foreground mb-3">Assess each Varma point by pressure (3-5 sec). Rate: 0=No response, 1=Mild tenderness, 2=Moderate pain, 3=Severe pain/radiation, 4=Spasm/Jump sign</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-[10px]">
                    <thead className="border-b bg-orange-50"><tr><th className="px-2 py-1 text-left">Varma Point</th><th className="px-2 py-1 text-left">Location</th><th className="px-2 py-1 text-center">Rating (0-4)</th><th className="px-2 py-1 text-left">Controls</th><th className="px-2 py-1 text-left">If Painful → Indicates</th></tr></thead>
                    <tbody>
                      {[
                        { name: "Kondai Kaalam", loc: "C1-C2 (Occiput)", rating: "1", controls: "Head, Neck, Balance", indicates: "Cervicogenic headache, Vertigo" },
                        { name: "Pidari Kaalam", loc: "C7 (Base of neck)", rating: "2", controls: "Arms, Shoulders, Thyroid", indicates: "Frozen shoulder, Arm numbness" },
                        { name: "Moodu Varmam", loc: "T4 (Between scapulae)", rating: "0", controls: "Heart, Lungs, Upper back", indicates: "Breathing issues, Upper back pain" },
                        { name: "Saram Varmam", loc: "T7 (Mid-thoracic)", rating: "1", controls: "Digestion, Liver function", indicates: "Gastric reflux, Pitta issues" },
                        { name: "Tharai Kaalam", loc: "T10 (Lower thoracic)", rating: "2", controls: "Kidney, Adrenal, Skin", indicates: "Fatigue, Skin diseases, Stress" },
                        { name: "Kundali Varmam", loc: "L1 (Upper lumbar)", rating: "1", controls: "Reproductive organs", indicates: "Infertility, Menstrual issues" },
                        { name: "Uthara Moolam", loc: "L3 (Mid lumbar)", rating: "3", controls: "Sciatic nerve root", indicates: "Sciatica origin, Leg weakness" },
                        { name: "Moolam Varmam", loc: "L5-S1 (Lumbosacral)", rating: "4", controls: "Main sciatica point", indicates: "Disc herniation, Severe Gridhrasi" },
                        { name: "Kottai Varmam", loc: "S2 (Upper sacrum)", rating: "2", controls: "Bladder, Bowel", indicates: "Urinary issues, Constipation" },
                        { name: "Poigai Varmam", loc: "Coccyx (Tail bone)", rating: "1", controls: "Pelvic floor, Sexual function", indicates: "Coccydynia, Pelvic pain" },
                        { name: "Kattu Varmam (L)", loc: "Bilateral L3-L5 paraspinal", rating: "3", controls: "Leg function, Gait", indicates: "Bilateral sciatica, Walking difficulty" },
                        { name: "Vasi Varmam", loc: "Along full spine (Sushumna)", rating: "1", controls: "Prana/Energy flow", indicates: "General stiffness, Energy blockage" },
                      ].map((v, i) => (
                        <tr key={i} className={`border-b ${parseInt(v.rating) >= 3 ? "bg-red-50" : parseInt(v.rating) >= 2 ? "bg-amber-50" : ""}`}>
                          <td className="px-2 py-1 font-bold">{v.name}</td>
                          <td className="px-2 py-1">{v.loc}</td>
                          <td className="px-2 py-1 text-center"><Select defaultValue={v.rating}><SelectTrigger className="h-5 w-12 text-[9px] p-0 justify-center"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="0">0</SelectItem><SelectItem value="1">1</SelectItem><SelectItem value="2">2</SelectItem><SelectItem value="3">3</SelectItem><SelectItem value="4">4</SelectItem></SelectContent></Select></td>
                          <td className="px-2 py-1">{v.controls}</td>
                          <td className="px-2 py-1 text-muted-foreground">{v.indicates}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-2 p-2 rounded bg-orange-50 border border-orange-200">
                  <p className="text-[10px] text-orange-700"><strong>Scoring:</strong> Total Varma Score = sum of all points. Max 48. Score &gt;24 = Severe involvement. Score 12-24 = Moderate. Score &lt;12 = Mild. Track across visits for improvement.</p>
                </div>
              </div>

              {/* ─── CHAKRA ASSESSMENT (7 Chakras along Spine) ─── */}
              <Separator className="my-4" />
              <div>
                <p className="text-sm font-bold mb-1 flex items-center gap-2">🕉️ Chakra Assessment (Yoga/Energy Medicine)</p>
                <p className="text-[10px] text-muted-foreground mb-3">Assess each chakra's functional status based on physical symptoms, emotional patterns, and area tenderness. Rate: Blocked / Underactive / Balanced / Overactive</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { chakra: "Muladhara (Root)", loc: "Coccyx", color: "🔴", physical: "Legs, bones, feet, immune", emotional: "Safety, grounding, survival", signs: "Leg weakness, fear, instability" },
                    { chakra: "Svadhisthana (Sacral)", loc: "S2-S3", color: "🟠", physical: "Reproductive, bladder, kidneys", emotional: "Creativity, pleasure, relationships", signs: "Infertility, low libido, emotional instability" },
                    { chakra: "Manipura (Solar Plexus)", loc: "T12-L1", color: "🟡", physical: "Digestion, liver, pancreas (Agni)", emotional: "Willpower, confidence, self-esteem", signs: "Digestive issues, low confidence, fatigue" },
                    { chakra: "Anahata (Heart)", loc: "T4-T5", color: "🟢", physical: "Heart, lungs, upper back, arms", emotional: "Love, compassion, forgiveness", signs: "Chest tightness, breathing, grief" },
                    { chakra: "Vishuddha (Throat)", loc: "C7-T1", color: "🔵", physical: "Thyroid, throat, neck, jaw", emotional: "Expression, communication, truth", signs: "Neck stiffness, thyroid, voice issues" },
                    { chakra: "Ajna (Third Eye)", loc: "C1-C2", color: "🟣", physical: "Brain, eyes, pituitary, sinuses", emotional: "Intuition, clarity, wisdom", signs: "Headaches, vision, poor concentration" },
                    { chakra: "Sahasrara (Crown)", loc: "Crown/Above", color: "⚪", physical: "CNS, pineal gland, overall health", emotional: "Consciousness, connection, purpose", signs: "Depression, disconnection, insomnia" },
                  ].map((c, i) => (
                    <div key={i} className="p-2 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-bold">{c.color} {c.chakra}</p>
                        <Badge variant="outline" className="text-[9px]">{c.loc}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Physical: {c.physical}</p>
                      <p className="text-[10px] text-muted-foreground">Emotional: {c.emotional}</p>
                      <p className="text-[10px] text-red-600">If imbalanced: {c.signs}</p>
                      <Select defaultValue={i === 2 || i === 4 ? "underactive" : i === 3 ? "balanced" : "blocked"}>
                        <SelectTrigger className="h-6 text-[10px] mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="blocked">🔒 Blocked</SelectItem><SelectItem value="underactive">⬇️ Underactive</SelectItem><SelectItem value="balanced">✅ Balanced</SelectItem><SelectItem value="overactive">⬆️ Overactive</SelectItem></SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              {/* ─── UNANI HIJAMA/CUPPING POINTS ─── */}
              <Separator className="my-4" />
              <div>
                <p className="text-sm font-bold mb-1 flex items-center gap-2">🫙 Unani Hijama / Cupping Point Assessment</p>
                <p className="text-[10px] text-muted-foreground mb-3">Assess each cupping zone before therapy. Record skin color response after dry cupping (30 sec): None / Pink / Red / Dark Red / Purple (indicates stagnation level)</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-[10px]">
                    <thead className="border-b bg-teal-50"><tr><th className="px-2 py-1 text-left">Cupping Zone</th><th className="px-2 py-1 text-left">Location</th><th className="px-2 py-1 text-center">Pre-Color</th><th className="px-2 py-1 text-center">Post-Color (30s)</th><th className="px-2 py-1 text-left">Organ Connection</th><th className="px-2 py-1 text-left">Indicates</th></tr></thead>
                    <tbody>
                      {[
                        { zone: "Al-Kahil (Master Point)", loc: "C7-T1 (prominent vertebra)", pre: "Normal", post: "Red", organ: "Immunity + Brain + Lungs", indicates: "General toxin load, immune weakness" },
                        { zone: "Inter-Scapular Zone", loc: "T3-T5 (between shoulder blades)", pre: "Normal", post: "Dark Red", organ: "Heart + Lungs", indicates: "Respiratory congestion, cardiac stress" },
                        { zone: "Hepatic Zone", loc: "T9-T10 (right side)", pre: "Normal", post: "Purple", organ: "Liver + Gallbladder", indicates: "Liver congestion, detox needed (Pitta)" },
                        { zone: "Lumbar Zone", loc: "L2-L4 (bilateral)", pre: "Normal", post: "Dark Red", organ: "Kidney + Low Back", indicates: "Kidney Yang deficiency, chronic low back pain" },
                        { zone: "Sacral Zone", loc: "S1-S2 (sacrum center)", pre: "Normal", post: "Red", organ: "Sciatic nerve + Bladder", indicates: "Sciatica, pelvic congestion" },
                      ].map((h, i) => (
                        <tr key={i} className="border-b">
                          <td className="px-2 py-1 font-bold">{h.zone}</td>
                          <td className="px-2 py-1">{h.loc}</td>
                          <td className="px-2 py-1 text-center"><Select defaultValue="normal"><SelectTrigger className="h-5 w-16 text-[9px] p-0 justify-center"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="normal">Normal</SelectItem><SelectItem value="pale">Pale</SelectItem><SelectItem value="pink">Pink</SelectItem></SelectContent></Select></td>
                          <td className="px-2 py-1 text-center"><Select defaultValue={h.post.toLowerCase().replace(" ", "-")}><SelectTrigger className="h-5 w-20 text-[9px] p-0 justify-center"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem><SelectItem value="pink">Pink</SelectItem><SelectItem value="red">Red</SelectItem><SelectItem value="dark-red">Dark Red</SelectItem><SelectItem value="purple">Purple 🟣</SelectItem></SelectContent></Select></td>
                          <td className="px-2 py-1">{h.organ}</td>
                          <td className="px-2 py-1 text-muted-foreground">{h.indicates}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-2 p-2 rounded bg-teal-50 border border-teal-200">
                  <p className="text-[10px] text-teal-700"><strong>Color Guide:</strong> Pink = Mild stagnation (1 session enough). Red = Moderate (3 sessions recommended). Dark Red = Significant (weekly × 4). Purple = Severe stagnation (blood stasis — wet cupping indicated). Track color improvement across sessions.</p>
                </div>
              </div>

              {/* Save */}
              <div className="flex gap-2 mt-4">
                <Button onClick={() => toast.success("Examination saved to patient record")}><CheckCircle className="h-4 w-4 mr-1" /> Save Examination</Button>
                <Button variant="outline" onClick={() => toast.info("Comparing with previous examination...")}><BarChart3 className="h-4 w-4 mr-1" /> Compare with Previous</Button>
                <Button variant="outline" onClick={() => toast.success("Report generated")}><FileText className="h-4 w-4 mr-1" /> Generate Report</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Protocols Tab */}
        <TabsContent value="protocols" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Spine Treatment Protocols (Standardized for Franchise)</CardTitle></CardHeader>
            <CardContent className="p-0"><div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Protocol</th><th className="px-3 py-2 text-center">Duration</th><th className="px-3 py-2 text-right">Price</th><th className="px-3 py-2 text-center">Success</th><th className="px-3 py-2 text-left">Indication</th></tr></thead>
                <tbody>{protocols.map((p, i) => (
                  <tr key={i} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 font-medium">{p.name}</td>
                    <td className="px-3 py-2 text-center text-xs">{p.duration}</td>
                    <td className="px-3 py-2 text-right font-bold">₹{p.price.toLocaleString()}</td>
                    <td className="px-3 py-2 text-center"><Badge variant="outline" className={`text-[10px] ${p.successRate >= 80 ? "text-green-600" : "text-amber-600"}`}>{p.successRate}%</Badge></td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{p.indication}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div></CardContent>
          </Card>
        </TabsContent>

        {/* Disease Connection Map Tab */}
        <TabsContent value="connections" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Brain className="h-4 w-4 text-purple-600" /> Spine-Disease Connection Map (Dermatome Based)</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">Each spinal level connects to specific organs. Treating the spine can improve connected diseases — this is the upsell pathway from MVP (spine) to full body treatment.</p>
              <div className="space-y-2">
                {dermatomeMap.map(d => (
                  <div key={d.level} className="p-3 rounded-lg border hover:bg-muted/30">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="font-bold">{d.level}</Badge>
                      <span className="text-xs text-muted-foreground">{d.organs}</span>
                    </div>
                    <p className="text-sm"><strong>Connected Diseases:</strong> {d.diseases}</p>
                    <p className="text-xs text-green-700 mt-1"><strong>Treatment:</strong> {d.treatment}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-700"><Zap className="h-3 w-3 inline mr-1" /><strong>Upsell Script:</strong> "Mr. Nagaraj, your L1-L3 compression may be connected to your digestive issues. We can address both through a comprehensive spine + digestive protocol. Would you like to know more?"</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Packages Tab */}
        <TabsContent value="packages" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Spine Packages (Franchise Standard Pricing)</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {packages.map((p, i) => (
                  <Card key={i} className={`hover:shadow-md transition ${p.type === "Popular" ? "border-blue-400 ring-1 ring-blue-200" : p.type === "Recommended" ? "border-green-400 ring-1 ring-green-200" : ""}`}>
                    <CardContent className="p-4 text-center">
                      {p.type === "Popular" && <Badge className="bg-blue-600 mb-2">Most Popular</Badge>}
                      {p.type === "Recommended" && <Badge className="bg-green-600 mb-2">Doctor Recommended</Badge>}
                      {p.type === "Entry" && <Badge variant="outline" className="mb-2">Entry Point</Badge>}
                      <h3 className="font-bold text-sm">{p.name}</h3>
                      <p className="text-2xl font-bold mt-2">₹{p.price.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{p.duration}</p>
                      <Separator className="my-2" />
                      <p className="text-xs text-muted-foreground">{p.includes}</p>
                      <Button className="w-full mt-3" size="sm" onClick={() => toast.success(`${p.name} selected`)}>Select Package</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Level 1 — First Treatment (Same Day) */}
        <TabsContent value="level1" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Level 1: First Treatment (OPD — Same Day Relief)</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">Doctor's therapy — patient feels 30-40% relief same day. This builds trust. "See? AYUSH works instantly too!"</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: "Viddha Karma", desc: "Therapeutic puncture at specific Marma/Sira points", time: "10 min", price: "₹500", relief: "30-40%" },
                  { name: "Agnikarma", desc: "Heat cauterization on trigger points using Panchdhatu Shalaka", time: "15 min", price: "₹800", relief: "40-60%" },
                  { name: "Marma Therapy", desc: "Deep pressure on vital energy points (107 Marma)", time: "30 min", price: "₹600", relief: "25-35%" },
                  { name: "Doctor's Therapy", desc: "Manual spine mobilization, traction, manipulation", time: "20 min", price: "₹500", relief: "30-50%" },
                  { name: "Hijama / Cupping", desc: "Wet/Dry cupping on back muscles for pain relief", time: "30 min", price: "₹1000", relief: "35-50%" },
                  { name: "Trigger Point Therapy", desc: "Deep tissue pressure on myofascial trigger points", time: "20 min", price: "₹500", relief: "30-40%" },
                  { name: "Varma Therapy (Siddha)", desc: "Tamil martial point stimulation for nerve release", time: "20 min", price: "₹600", relief: "35-45%" },
                  { name: "Mudra Therapy", desc: "Energy channeling through hand positions + breathwork", time: "15 min", price: "₹300", relief: "15-25%" },
                ].map((t, i) => (
                  <div key={i} className="p-3 rounded-lg border hover:bg-muted/30">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{t.name}</p>
                      <Badge variant="outline" className="text-green-600 text-[10px]">{t.relief} relief</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                      <span>⏱ {t.time}</span><span>💰 {t.price}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200">
                <p className="text-xs text-green-700"><Zap className="h-3 w-3 inline mr-1" /><strong>Conversion Strategy:</strong> After Level 1, patient feels immediate relief → Doctor says: "This was emergency relief. For permanent cure, you need a 7-day Kati Basti protocol. Shall we schedule?" → 62% convert to package.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Follow-up (Video LMS + AI) */}
        <TabsContent value="followup" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Brain className="h-4 w-4 text-purple-600" /> Follow-up: Video LMS + AI Tracking</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">After treatment, patient receives guided video content via WhatsApp. System tracks if they watched & practiced. AI adjusts follow-up based on compliance.</p>
              <div className="space-y-3">
                {[
                  { day: "Day 1", title: "How to Apply Kottamchukkadi Taila", type: "Video (2 min)", status: "Watched ✅", compliance: 95 },
                  { day: "Day 3", title: "5 Morning Exercises for Your Back", type: "Video (5 min)", status: "Watched ✅", compliance: 88 },
                  { day: "Day 5", title: "Self Kizhi (Poultice) Application", type: "Video (3 min)", status: "Watched ✅", compliance: 82 },
                  { day: "Day 7", title: "Video Call with Therapist (live guidance)", type: "Video Call", status: "Completed ✅", compliance: 78 },
                  { day: "Day 10", title: "Self-Marma Points for Sciatica", type: "Video (4 min)", status: "Not watched ⚠️", compliance: 65 },
                  { day: "Day 14", title: "Progress Check — Rate Your Pain", type: "WhatsApp Form", status: "Pending", compliance: 60 },
                  { day: "Day 21", title: "Advanced Yoga for Spine Health", type: "Video (8 min)", status: "Scheduled", compliance: 0 },
                  { day: "Day 30", title: "Monthly In-Person Session Reminder", type: "Appointment", status: "Scheduled", compliance: 0 },
                ].map((v, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs w-[60px] justify-center">{v.day}</Badge>
                      <div><p className="text-sm font-medium">{v.title}</p><p className="text-[10px] text-muted-foreground">{v.type}</p></div>
                    </div>
                    <div className="flex items-center gap-2">
                      {v.compliance > 0 && <Progress value={v.compliance} className="h-2 w-12" />}
                      <Badge variant={v.status.includes("✅") ? "outline" : v.status.includes("⚠️") ? "destructive" : "secondary"} className={`text-[10px] ${v.status.includes("✅") ? "text-green-600" : ""}`}>{v.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => toast.success("Video links sent via WhatsApp")}><Activity className="h-3 w-3 mr-1" /> Send Next Video</Button>
                <Button size="sm" variant="outline" onClick={() => toast.success("Video call scheduled")}><Calendar className="h-3 w-3 mr-1" /> Schedule Video Call</Button>
                <Button size="sm" variant="outline" onClick={() => toast.info("Viewing patient's LMS progress...")}><BarChart3 className="h-3 w-3 mr-1" /> View Full LMS</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rejuvenation */}
        <TabsContent value="rejuvenation" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Level 5: Rejuvenation & Long-term Maintenance</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">After maximum cure achieved → patient enters lifelong wellness maintenance. Revenue continues via subscriptions + seasonal treatments.</p>
              <div className="space-y-3">
                {[
                  { phase: "Detox Resort/Retreat", frequency: "Quarterly (4x/year)", desc: "3-5 day residential Panchakarma detox at wellness center", price: "₹15,000-25,000", ai: "AI schedules at season change (Ritucharya)" },
                  { phase: "Monthly Rasayana Session", frequency: "Monthly", desc: "1 in-person session: Abhyanga + Basti + Rasayana medicines", price: "₹3,500/month", ai: "Auto-scheduled, WhatsApp reminder -7 days" },
                  { phase: "Swarna Bhasma Rejuvenation", frequency: "Bi-monthly", desc: "Gold-based rejuvenation therapy for anti-aging & immunity", price: "₹5,000/course", ai: "Track tissue regeneration markers" },
                  { phase: "Ahara Rasayana (Diet Protocol)", frequency: "Ongoing", desc: "Seasonal diet adjustments per Prakriti. Superfoods integration.", price: "Included in plan", ai: "AI updates diet at each Ritu transition" },
                  { phase: "Achara Rasayana (Behavioral)", frequency: "Ongoing", desc: "Sattvic lifestyle: wake time, meditation, positive speech, charity", price: "Free — guidance via LMS", ai: "Daily tips via WhatsApp at 5 AM" },
                  { phase: "Annual Spine Health Check", frequency: "Yearly", desc: "Full reassessment: posture AI + X-ray + outcome scores + blood work", price: "₹1,999", ai: "Auto-scheduled on registration anniversary" },
                ].map((r, i) => (
                  <div key={i} className="p-3 rounded-lg border hover:bg-muted/30">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{r.phase}</p>
                      <Badge variant="outline" className="text-xs">{r.frequency}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{r.desc}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-bold">{r.price}</span>
                      <span className="text-[10px] text-purple-600"><Brain className="h-3 w-3 inline mr-0.5" />{r.ai}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Community (Gamification + Volunteer + Influencer) */}
        <TabsContent value="community" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Star className="h-4 w-4 text-amber-500" /> Spine Community: Gamification → Volunteer → Influencer</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">Patient journey from "sick person" → "healthy advocate". Each step earns points and builds your referral army.</p>
              <div className="space-y-3">
                {[
                  { level: 1, title: "Beginner", trigger: "Completed first treatment", points: 100, reward: "Welcome badge + health tips access", patients: 450 },
                  { level: 2, title: "Warrior", trigger: "Completed 7-day Panchakarma course", points: 500, reward: "₹500 off next package + certificate", patients: 220 },
                  { level: 3, title: "Champion", trigger: "3 months consistent follow-up", points: 2000, reward: "Free monthly session + priority booking", patients: 85 },
                  { level: 4, title: "Ambassador", trigger: "Referred 3 friends who visited", points: 3000, reward: "₹1500 credit + gold member badge", patients: 45 },
                  { level: 5, title: "Influencer", trigger: "Shared video testimonial on social", points: 5000, reward: "Free annual package + featured on website", patients: 18 },
                  { level: 6, title: "Volunteer", trigger: "Helped at 2+ health camps", points: 10000, reward: "Lifetime 20% discount + VIP status + referral commissions", patients: 8 },
                ].map((l, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className={`h-10 w-10 rounded-full grid place-items-center shrink-0 ${l.level <= 2 ? "bg-green-100 text-green-700" : l.level <= 4 ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                      <span className="text-sm font-bold">L{l.level}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{l.title}</p>
                        <Badge variant="outline" className="text-amber-600 text-[10px]">+{l.points} pts</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Trigger: {l.trigger}</p>
                      <p className="text-xs text-green-600">Reward: {l.reward}</p>
                    </div>
                    <div className="text-center shrink-0"><p className="text-sm font-bold">{l.patients}</p><p className="text-[10px] text-muted-foreground">patients</p></div>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border-amber-200 bg-amber-50/30"><CardContent className="p-3"><p className="text-sm font-medium text-amber-700">Referral Stats</p><p className="text-2xl font-bold">85 referrals</p><p className="text-xs text-muted-foreground">₹6.8L revenue from word-of-mouth</p></CardContent></Card>
                <Card className="border-purple-200 bg-purple-50/30"><CardContent className="p-3"><p className="text-sm font-medium text-purple-700">Active Influencers</p><p className="text-2xl font-bold">18 patients</p><p className="text-xs text-muted-foreground">Sharing spine health content on social media</p></CardContent></Card>
              </div>
              <Button className="mt-3" onClick={() => toast.success("Promotion campaign triggered to Level 3+ patients")}><Star className="h-4 w-4 mr-1" /> Trigger Next-Level Promotions</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── FRANCHISE OPS TAB ─── */}
        <TabsContent value="franchise-ops" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4 text-blue-600" /> Franchise Operations & Standards</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {/* Onboarding Checklist */}
              <div>
                <p className="text-sm font-medium mb-2">New Branch Onboarding Checklist</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {["License & Registration (AYUSH Board)", "Location setup (PK room, OPD, Pharmacy)", "Equipment procurement (Basti Yantra, Agnikarma, Cups)", "Staff hiring (Doctor + 2 Therapists + Reception)", "Staff training (2-week protocol training)", "Software setup (HMS + WhatsApp integration)", "Branding & Signage (Spine AYUSH franchise kit)", "Trial run (5 free patients before launch)", "Marketing launch (Google + Local ads + Camps)", "First month audit (compliance check)"].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 border rounded text-xs"><CheckCircle className="h-3 w-3 text-green-600 shrink-0" />{item}</div>
                  ))}
                </div>
              </div>
              <Separator />
              {/* SOPs */}
              <div>
                <p className="text-sm font-medium mb-2">Standard Operating Procedures (SOPs)</p>
                <div className="space-y-2">
                  {[
                    { sop: "Kati Basti SOP", version: "v3.2", lastUpdate: "Jul 2026", status: "Active" },
                    { sop: "Agnikarma SOP (Safety Protocol)", version: "v2.1", lastUpdate: "Jun 2026", status: "Active" },
                    { sop: "Patient Assessment SOP (₹199 Flow)", version: "v4.0", lastUpdate: "Jul 2026", status: "Active" },
                    { sop: "Hijama/Cupping SOP", version: "v1.5", lastUpdate: "May 2026", status: "Active" },
                    { sop: "Emergency Response SOP", version: "v2.0", lastUpdate: "Apr 2026", status: "Active" },
                    { sop: "Hygiene & Sterilization SOP", version: "v3.0", lastUpdate: "Jul 2026", status: "Active" },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-2 border rounded">
                      <div><p className="text-sm font-medium">{s.sop}</p><p className="text-[10px] text-muted-foreground">{s.version} · Updated: {s.lastUpdate}</p></div>
                      <Badge variant="outline" className="text-green-600 text-[10px]">{s.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              {/* Compliance Audit */}
              <div>
                <p className="text-sm font-medium mb-2">Monthly Compliance Audit</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { branch: "Kadayanallur", score: 95, status: "Pass" },
                    { branch: "Tirunelveli", score: 88, status: "Pass" },
                    { branch: "Rajapalayam", score: 78, status: "Needs Improvement" },
                    { branch: "Theni", score: 82, status: "Pass" },
                    { branch: "Chennai", score: 91, status: "Pass" },
                    { branch: "Tenkasi", score: 72, status: "Action Required" },
                  ].map((b, i) => (
                    <div key={i} className="p-2 border rounded text-center">
                      <p className="text-xs font-medium">{b.branch}</p>
                      <p className={`text-lg font-bold ${b.score >= 85 ? "text-green-600" : b.score >= 75 ? "text-amber-600" : "text-red-600"}`}>{b.score}%</p>
                      <Badge variant={b.score >= 85 ? "outline" : "destructive"} className={`text-[9px] ${b.score >= 85 ? "text-green-600" : ""}`}>{b.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              {/* Therapist Training */}
              <div>
                <p className="text-sm font-medium mb-2">Therapist Training Status</p>
                <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-1 text-left text-xs">Therapist</th><th className="px-3 py-1 text-left text-xs">Branch</th><th className="px-3 py-1 text-center text-xs">Protocols Certified</th><th className="px-3 py-1 text-center text-xs">Status</th></tr></thead><tbody>
                  {[
                    { name: "Mr. Balasubramanian", branch: "KDNL", certified: "8/10", status: "Active" },
                    { name: "Mrs. Rani", branch: "KDNL", certified: "10/10", status: "Master Trainer" },
                    { name: "Mr. John", branch: "KDNL", certified: "7/10", status: "In Training" },
                    { name: "Mr. Syed Sulaiman", branch: "TVLI", certified: "9/10", status: "Active" },
                    { name: "Ms. Manju", branch: "RJPM", certified: "6/10", status: "In Training" },
                  ].map((t, i) => (
                    <tr key={i} className="border-b"><td className="px-3 py-1">{t.name}</td><td className="px-3 py-1 text-xs">{t.branch}</td><td className="px-3 py-1 text-center">{t.certified}</td><td className="px-3 py-1 text-center"><Badge variant="outline" className="text-[10px]">{t.status}</Badge></td></tr>
                  ))}
                </tbody></table></div>
              </div>
              <Separator />
              {/* Staff Training LMS */}
              <div>
                <p className="text-sm font-medium mb-2">Staff Training LMS (Video + Quiz + Certification)</p>
                <div className="space-y-2">
                  {[
                    { protocol: "Kati Basti Technique", videos: 3, duration: "25 min", quiz: "10 MCQs", certified: 8, pending: 2 },
                    { protocol: "Agnikarma Safety & Application", videos: 2, duration: "18 min", quiz: "8 MCQs", certified: 6, pending: 4 },
                    { protocol: "Hijama/Cupping Protocol", videos: 2, duration: "15 min", quiz: "8 MCQs", certified: 7, pending: 3 },
                    { protocol: "Virechana (Full Protocol)", videos: 5, duration: "45 min", quiz: "15 MCQs", certified: 4, pending: 6 },
                    { protocol: "Basti (Yoga/Karma/Matra)", videos: 4, duration: "35 min", quiz: "12 MCQs", certified: 5, pending: 5 },
                    { protocol: "Patient Assessment (₹199 Flow)", videos: 2, duration: "12 min", quiz: "6 MCQs", certified: 10, pending: 0 },
                    { protocol: "Emergency Response", videos: 3, duration: "20 min", quiz: "10 MCQs", certified: 10, pending: 0 },
                    { protocol: "Marma Therapy Points", videos: 4, duration: "30 min", quiz: "12 MCQs", certified: 3, pending: 7 },
                  ].map((t, i) => (
                    <div key={i} className="flex items-center justify-between p-2 border rounded hover:bg-muted/30">
                      <div><p className="text-sm font-medium">{t.protocol}</p><p className="text-[10px] text-muted-foreground">{t.videos} videos · {t.duration} · Quiz: {t.quiz}</p></div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-green-600 text-[10px]">{t.certified} certified</Badge>
                        {t.pending > 0 && <Badge variant="secondary" className="text-[10px]">{t.pending} pending</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={() => toast.success("Training reminder sent to all pending staff")}><Users className="h-3 w-3 mr-1" /> Remind Pending Staff</Button>
                  <Button size="sm" variant="outline" onClick={() => toast.info("Opening video upload...")}><FileText className="h-3 w-3 mr-1" /> Upload New Training</Button>
                </div>
                <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-xs text-blue-700"><strong>Flow:</strong> Staff watches video → takes quiz → passes → gets digital certificate. Therapist cannot perform protocol in HMS until certified. Re-certification annual.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── FUNNEL & MARKETING TAB ─── */}
        <TabsContent value="funnel" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4 text-orange-600" /> Funnel & Marketing Engine</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {/* Landing Page */}
              <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
                <p className="text-sm font-medium text-blue-700 mb-2">₹199 Spine Assessment — Landing Page</p>
                <div className="flex items-center gap-2">
                  <Input value="https://ayuzee.com/spine-assessment" readOnly className="flex-1 h-8 text-xs font-mono" />
                  <Button size="sm" onClick={() => { navigator.clipboard.writeText("https://ayuzee.com/spine-assessment"); toast.success("Link copied!"); }}>Copy</Button>
                </div>
                <p className="text-[10px] text-blue-600 mt-1">Use this link in Google Ads, Facebook Ads, WhatsApp broadcasts, and social media posts.</p>
              </div>
              {/* Lead Pipeline */}
              <div>
                <p className="text-sm font-medium mb-2">Lead Pipeline (This Month)</p>
                <div className="space-y-2">
                  {[
                    { stage: "Raw Leads (from ads/social)", count: 850, conversion: "100%" },
                    { stage: "WhatsApp Engaged (replied)", count: 520, conversion: "61%" },
                    { stage: "Assessment Booked (₹199)", count: 280, conversion: "33%" },
                    { stage: "Showed Up for Assessment", count: 245, conversion: "29%" },
                    { stage: "Converted to Package", count: 152, conversion: "18%" },
                    { stage: "Completed Treatment", count: 118, conversion: "14%" },
                  ].map((l, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs w-[220px]">{l.stage}</span>
                      <Progress value={parseInt(l.conversion)} className="flex-1 h-3" />
                      <span className="text-xs font-bold w-20 text-right">{l.count} ({l.conversion})</span>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              {/* WhatsApp Drip Sequence */}
              <div>
                <p className="text-sm font-medium mb-2">WhatsApp Drip Sequence (Auto — for new leads)</p>
                <div className="space-y-2">
                  {[
                    { day: "Day 0", msg: "Welcome! Here's a quick tip for back pain relief 🙏 [Video: 30-sec exercise]", open: "92%" },
                    { day: "Day 1", msg: "Did you know? 80% of spine problems can be treated without surgery. See how →", open: "78%" },
                    { day: "Day 3", msg: "📹 Patient story: Rajesh had sciatica for 2 years. After 7 days of Kati Basti, 80% relief!", open: "65%" },
                    { day: "Day 5", msg: "Special offer: Book Spine Assessment for just ₹199 (regular ₹500). Valid 48 hrs only.", open: "58%" },
                    { day: "Day 7", msg: "Last reminder: Your spine health score is waiting. Book ₹199 assessment → [Link]", open: "45%" },
                    { day: "Day 14", msg: "Still in pain? We understand. Here's a free video guide for home relief → [Video]", open: "35%" },
                  ].map((d, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 border rounded">
                      <Badge variant="outline" className="text-xs shrink-0 w-[50px] justify-center">{d.day}</Badge>
                      <p className="text-xs flex-1">{d.msg}</p>
                      <Badge variant="secondary" className="text-[10px] shrink-0">Open: {d.open}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              {/* Ad Tracker */}
              <div>
                <p className="text-sm font-medium mb-2">Ad Campaign Performance</p>
                <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-2 py-1 text-left text-xs">Campaign</th><th className="px-2 py-1 text-center text-xs">Spend</th><th className="px-2 py-1 text-center text-xs">Leads</th><th className="px-2 py-1 text-center text-xs">Bookings</th><th className="px-2 py-1 text-center text-xs">Revenue</th><th className="px-2 py-1 text-center text-xs">ROAS</th></tr></thead><tbody>
                  {[
                    { name: "Google — 'Back Pain Ayurveda'", spend: 25000, leads: 320, bookings: 45, revenue: 382500, roas: "15.3x" },
                    { name: "Meta — Video Testimonial", spend: 15000, leads: 280, bookings: 38, revenue: 323000, roas: "21.5x" },
                    { name: "Google — 'Sciatica Treatment'", spend: 18000, leads: 195, bookings: 28, revenue: 238000, roas: "13.2x" },
                    { name: "WhatsApp Broadcast", spend: 2000, leads: 150, bookings: 22, revenue: 187000, roas: "93.5x" },
                  ].map((a, i) => (
                    <tr key={i} className="border-b"><td className="px-2 py-1 text-xs font-medium">{a.name}</td><td className="px-2 py-1 text-center text-xs">₹{(a.spend/1000).toFixed(0)}K</td><td className="px-2 py-1 text-center text-xs">{a.leads}</td><td className="px-2 py-1 text-center text-xs">{a.bookings}</td><td className="px-2 py-1 text-center text-xs font-bold text-green-600">₹{(a.revenue/1000).toFixed(0)}K</td><td className="px-2 py-1 text-center"><Badge variant="outline" className="text-green-600 text-[10px]">{a.roas}</Badge></td></tr>
                  ))}
                </tbody></table></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── COMMUNITY HUB TAB ─── */}
        <TabsContent value="community-hub" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4 text-purple-600" /> Community Hub</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {/* Testimonial Manager */}
              <div>
                <p className="text-sm font-medium mb-2">Testimonial Manager</p>
                <div className="space-y-2">
                  {[
                    { patient: "Rajesh K.", type: "Video", condition: "Sciatica", relief: "80%", status: "Approved", views: 1250 },
                    { patient: "Priya S.", type: "Text + Photo", condition: "Cervical", relief: "90%", status: "Approved", views: 840 },
                    { patient: "Mohammed F.", type: "Video", condition: "Disc L4-L5", relief: "65%", status: "Pending Review", views: 0 },
                    { patient: "Lakshmi N.", type: "Google Review", condition: "Back Pain", relief: "75%", status: "Published", views: 320 },
                  ].map((t, i) => (
                    <div key={i} className="flex items-center justify-between p-2 border rounded">
                      <div><p className="text-sm font-medium">{t.patient}</p><p className="text-[10px] text-muted-foreground">{t.condition} · {t.relief} relief · {t.type}</p></div>
                      <div className="flex items-center gap-2"><span className="text-[10px] text-muted-foreground">{t.views} views</span><Badge variant={t.status === "Approved" || t.status === "Published" ? "outline" : "secondary"} className={`text-[10px] ${t.status === "Approved" || t.status === "Published" ? "text-green-600" : ""}`}>{t.status}</Badge></div>
                    </div>
                  ))}
                </div>
                <Button size="sm" variant="outline" className="mt-2" onClick={() => toast.success("Testimonial request sent to 8 recently cured patients")}><Star className="h-3 w-3 mr-1" /> Request New Testimonials</Button>
              </div>
              <Separator />
              {/* Health Camp Planner */}
              <div>
                <p className="text-sm font-medium mb-2">Health Camp Planner</p>
                <div className="space-y-2">
                  {[
                    { name: "Corporate Spine Camp — TCS Chennai", date: "15/08/2026", target: 100, registered: 78, volunteers: 3, leads: 45 },
                    { name: "Community Camp — Kadayanallur Town Hall", date: "22/08/2026", target: 200, registered: 125, volunteers: 5, leads: 0 },
                    { name: "School Camp — Swarnaprasanam + Parents", date: "01/09/2026", target: 80, registered: 42, volunteers: 2, leads: 0 },
                  ].map((c, i) => (
                    <div key={i} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-1"><p className="text-sm font-medium">{c.name}</p><Badge variant="outline" className="text-xs">{c.date}</Badge></div>
                      <div className="flex gap-4 text-xs text-muted-foreground"><span>Target: {c.target}</span><span>Registered: {c.registered}</span><span>Volunteers: {c.volunteers}</span>{c.leads > 0 && <span className="text-green-600 font-bold">Leads: {c.leads}</span>}</div>
                    </div>
                  ))}
                </div>
                <Button size="sm" className="mt-2" onClick={() => toast.success("New camp created")}><Calendar className="h-3 w-3 mr-1" /> Plan New Camp</Button>
              </div>
              <Separator />
              {/* Influencer Dashboard */}
              <div>
                <p className="text-sm font-medium mb-2">Patient Influencer Dashboard</p>
                <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-2 py-1 text-left text-xs">Patient</th><th className="px-2 py-1 text-center text-xs">Posts</th><th className="px-2 py-1 text-center text-xs">Reach</th><th className="px-2 py-1 text-center text-xs">Referrals</th><th className="px-2 py-1 text-center text-xs">Revenue</th><th className="px-2 py-1 text-center text-xs">Reward</th></tr></thead><tbody>
                  {[
                    { name: "Priya S.", posts: 12, reach: "45K", referrals: 8, revenue: "₹68K", reward: "₹5000 credit" },
                    { name: "Anand M.", posts: 8, reach: "28K", referrals: 5, revenue: "₹42K", reward: "₹3000 credit" },
                    { name: "Kavitha R.", posts: 15, reach: "62K", referrals: 11, revenue: "₹93K", reward: "Free annual pkg" },
                    { name: "Suresh T.", posts: 5, reach: "12K", referrals: 3, revenue: "₹25K", reward: "₹1500 credit" },
                  ].map((inf, i) => (
                    <tr key={i} className="border-b"><td className="px-2 py-1 font-medium">{inf.name}</td><td className="px-2 py-1 text-center">{inf.posts}</td><td className="px-2 py-1 text-center">{inf.reach}</td><td className="px-2 py-1 text-center">{inf.referrals}</td><td className="px-2 py-1 text-center text-green-600 font-bold">{inf.revenue}</td><td className="px-2 py-1 text-center"><Badge variant="outline" className="text-amber-600 text-[10px]">{inf.reward}</Badge></td></tr>
                  ))}
                </tbody></table></div>
              </div>
              <Separator />
              {/* Success Gallery */}
              <div>
                <p className="text-sm font-medium mb-2">Success Stories Gallery (Before → After)</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { patient: "Rajesh K.", condition: "Sciatica 2yr", before: "VAS 8/10, SLR 30°", after: "VAS 2/10, SLR 75°", duration: "7 days Kati Basti" },
                    { patient: "Priya S.", condition: "Cervical 6mo", before: "VAS 7/10, ROM 30%", after: "VAS 1/10, ROM 90%", duration: "7 days Greeva Basti" },
                    { patient: "Mr. Nagaraj", condition: "RA + Back Pain", before: "DAS28: 5.8", after: "DAS28: 3.2", duration: "14 days PK + MTX" },
                  ].map((s, i) => (
                    <Card key={i} className="border-green-200"><CardContent className="p-3 text-center"><p className="text-sm font-bold">{s.patient}</p><p className="text-xs text-muted-foreground">{s.condition}</p><Separator className="my-2" /><p className="text-xs text-red-600">Before: {s.before}</p><p className="text-xs text-green-600 font-bold">After: {s.after}</p><p className="text-[10px] text-muted-foreground mt-1">{s.duration}</p></CardContent></Card>
                  ))}
                </div>
                <Button size="sm" variant="outline" className="mt-2" onClick={() => toast.success("Success story shared to social media")}><TrendingUp className="h-3 w-3 mr-1" /> Share to Social Media</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Franchise KPIs Tab */}
        <TabsContent value="franchise" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Franchise Spine Performance — All Branches</CardTitle></CardHeader>
            <CardContent className="p-0"><div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Branch</th><th className="px-3 py-2 text-center">Patients</th><th className="px-3 py-2 text-right">Revenue</th><th className="px-3 py-2 text-center">Packages</th><th className="px-3 py-2 text-center">Satisfaction</th><th className="px-3 py-2 text-center">Success %</th></tr></thead>
                <tbody>{branchSpineData.map(b => (
                  <tr key={b.branch} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 font-medium">{b.branch}</td>
                    <td className="px-3 py-2 text-center">{b.patients}</td>
                    <td className="px-3 py-2 text-right font-bold">₹{(b.revenue/1000).toFixed(0)}K</td>
                    <td className="px-3 py-2 text-center">{b.packages}</td>
                    <td className="px-3 py-2 text-center"><Badge variant="outline" className="text-amber-600">{b.satisfaction}/5</Badge></td>
                    <td className="px-3 py-2 text-center"><Badge variant={b.successRate >= 85 ? "outline" : "secondary"} className={`text-[10px] ${b.successRate >= 85 ? "text-green-600" : ""}`}>{b.successRate}%</Badge></td>
                  </tr>
                ))}</tbody>
                <tfoot className="border-t font-bold"><tr><td className="px-3 py-2">TOTAL</td><td className="px-3 py-2 text-center">{totalPatients}</td><td className="px-3 py-2 text-right">₹{(totalRevenue/100000).toFixed(1)}L</td><td className="px-3 py-2 text-center">{branchSpineData.reduce((s, b) => s + b.packages, 0)}</td><td></td><td className="px-3 py-2 text-center">{avgSuccess}%</td></tr></tfoot>
              </table>
            </div></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsSpineAyush;
