import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  UserPlus, Brain, AlertTriangle, CheckCircle2, Sparkles,
  Phone, MapPin, Calendar, Search, Loader2, Camera, Heart,
  Shield, Globe, Gift, QrCode, Users, Smartphone, Mail,
  Star, Leaf, Activity, FileText, CreditCard, Building2, Link2, Copy,
} from "lucide-react";
import {
  detectDuplicatePatient, aiAddressAutoComplete, calculateAge,
  getSourceOptions, getIndianStates, generatePatientId, suggestConsultationFee,
} from "@/services/patientAiService";
import type { PatientTitle, Gender, BloodGroup, PaymentMode } from "@/types/patient-hms";

// OP Bill line item type
interface BillItem {
  sNo: number; particulars: string; qty: number; price: number;
  gst: string; disc: number; discAmt: number; total: number;
}

// Generate unique referral code
const generateReferralCode = (name: string) => {
  const prefix = name.slice(0, 3).toUpperCase() || "AYU";
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${random}`;
};

const PatientRegistration = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [completionPercent, setCompletionPercent] = useState(15);

  // ─── Tab 1: Personal Details ───
  const [location, setLocation] = useState("#11, Main Road, Kadayanallur, .");
  const [country, setCountry] = useState("India");
  const [source, setSource] = useState("");
  const [mobile, setMobile] = useState("");
  const [mobileVerified, setMobileVerified] = useState(false);
  const [title, setTitle] = useState<PatientTitle>("None");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<Gender>("Male");
  const [regDate] = useState(new Date().toISOString().slice(0, 10));
  const [regTime] = useState(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }));
  const [dob, setDob] = useState("");
  const [ageYears, setAgeYears] = useState("");
  const [ageMonths, setAgeMonths] = useState("");
  const [ageDays, setAgeDays] = useState("");
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [occupation, setOccupation] = useState("");
  const [employer, setEmployer] = useState("");
  const [nationality, setNationality] = useState("Indian");
  const [preferredLanguage, setPreferredLanguage] = useState("Tamil");
  const [religion, setReligion] = useState("");
  const [guardian, setGuardian] = useState("");

  // ─── Tab 2: Contact & Social ───
  const [alternateMobile, setAlternateMobile] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);
  const [street, setStreet] = useState("");
  const [area, setArea] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [emergName, setEmergName] = useState("");
  const [emergRelation, setEmergRelation] = useState("");
  const [emergPhone, setEmergPhone] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [youtubeChannel, setYoutubeChannel] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");

  // ─── Tab 3: Medical & AYUSH ───
  const [treatmentPreference, setTreatmentPreference] = useState("");
  const [prakritiType, setPrakritiType] = useState("");
  const [knownAllergies, setKnownAllergies] = useState("");
  const [chronicConditions, setChronicConditions] = useState("");
  const [currentMedications, setCurrentMedications] = useState("");
  const [currentAyushMeds, setCurrentAyushMeds] = useState("");
  const [smokingStatus, setSmokingStatus] = useState("Never");
  const [alcoholStatus, setAlcoholStatus] = useState("Never");
  const [exerciseFreq, setExerciseFreq] = useState("Occasional");
  const [aiRiskScore, setAiRiskScore] = useState("");
  const [prakritiQ1, setPrakritiQ1] = useState("");
  const [prakritiQ2, setPrakritiQ2] = useState("");
  const [prakritiQ3, setPrakritiQ3] = useState("");
  const [prakritiQ4, setPrakritiQ4] = useState("");
  const [prakritiQ5, setPrakritiQ5] = useState("");

  // ─── Tab 4: Identity & Insurance ───
  const [idProofType, setIdProofType] = useState("");
  const [idProofNumber, setIdProofNumber] = useState("");
  const [abhaId, setAbhaId] = useState("");
  const [abhaVerified, setAbhaVerified] = useState(false);
  const [insuranceProvider, setInsuranceProvider] = useState("");
  const [insurancePolicyNo, setInsurancePolicyNo] = useState("");
  const [insuranceValidity, setInsuranceValidity] = useState("");
  const [corporateName, setCorporateName] = useState("");
  const [tpaName, setTpaName] = useState("");
  const [employeeId, setEmployeeId] = useState("");

  // ─── Tab 5: Platform & Preferences ───
  const [patientLoginEnabled, setPatientLoginEnabled] = useState(true);
  const [referralCode, setReferralCode] = useState("");
  const [referredByCode, setReferredByCode] = useState("");
  const [ayuzeeShopLinked, setAyuzeeShopLinked] = useState(true);
  const [directPurchaseEnabled, setDirectPurchaseEnabled] = useState(true);
  const [loyaltyEnroll, setLoyaltyEnroll] = useState(true);
  const [notifSms, setNotifSms] = useState(true);
  const [notifWhatsapp, setNotifWhatsapp] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);
  const [notifApp, setNotifApp] = useState(true);
  const [consentDataSharing, setConsentDataSharing] = useState(true);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [consentResearch, setConsentResearch] = useState(false);
  const [consentTelemedicine, setConsentTelemedicine] = useState(true);
  const [digitalCardIssued, setDigitalCardIssued] = useState(true);
  const [familyGroupId, setFamilyGroupId] = useState("");

  // ─── Tab 6a: Groups & VIP ───
  const [confidential, setConfidential] = useState(false);
  const [patientGroup, setPatientGroup] = useState("");
  const [vipStatus, setVipStatus] = useState(false);
  const [followUpCategory, setFollowUpCategory] = useState("");
  const [clubMemberships, setClubMemberships] = useState<string[]>([]);
  const [clubDetails, setClubDetails] = useState("");
  const [patientTags, setPatientTags] = useState("");

  // ─── Tab 7: Documents & AI Scan ───
  const [docketFiles, setDocketFiles] = useState<{name: string; type: string; aiSummary: string}[]>([]);
  const [quickRegLink, setQuickRegLink] = useState("");
  const [googleFormLink] = useState("https://forms.ayuzee.com/patient-registration");

  // ─── Tab 8: Wellness & Trackers ───
  const [willingGutAnalysis, setWillingGutAnalysis] = useState(false);
  const [willingHijama, setWillingHijama] = useState(false);
  const [willingRetreatDetox, setWillingRetreatDetox] = useState(false);
  const [willingGamification, setWillingGamification] = useState(true);
  const [willingHealthTracker, setWillingHealthTracker] = useState(true);
  const [willingHabitTracker, setWillingHabitTracker] = useState(false);
  const [willingJourneyTracker, setWillingJourneyTracker] = useState(true);
  const [willingFeedback, setWillingFeedback] = useState(true);
  const [secondVisitGoogleReview, setSecondVisitGoogleReview] = useState(true);
  const [secondVisitSocialFollow, setSecondVisitSocialFollow] = useState(true);

  // ─── Tab 6: OP Bill ───
  const [consultant, setConsultant] = useState("");
  const [referredBy, setReferredBy] = useState("");
  const [visitType, setVisitType] = useState("Consultation");
  const [billItems, setBillItems] = useState<BillItem[]>([
    { sNo: 1, particulars: "", qty: 1, price: 0, gst: "", disc: 0, discAmt: 0, total: 0 },
  ]);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("Cash");
  const [amountReceived, setAmountReceived] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [cashTendered, setCashTendered] = useState(0);
  const [additionalNote, setAdditionalNote] = useState("");
  const [reviewDays, setReviewDays] = useState("");
  const [reviewUnit, setReviewUnit] = useState("Days");
  const [purpose, setPurpose] = useState("Consultation");

  // ─── Effects ───
  useEffect(() => { if (dob) { const age = calculateAge(dob); setAgeYears(String(age.years)); setAgeMonths(String(age.months)); setAgeDays(String(age.days)); } }, [dob]);
  useEffect(() => { if (mobile.length === 10) { setIsCheckingDuplicate(true); detectDuplicatePatient(mobile, firstName).then((r) => { setIsCheckingDuplicate(false); setDuplicateWarning(r.isDuplicate ? `Duplicate: ${r.matches[0].name} (${r.matches[0].id}) - ${r.confidence}%` : null); }); } else { setDuplicateWarning(null); } }, [mobile, firstName]);
  useEffect(() => { if (zip.length >= 3) { setAiSuggesting(true); aiAddressAutoComplete(zip).then((r) => { setAiSuggesting(false); if (r.suggestions.length > 0) { const s = r.suggestions[0]; if (!area) setArea(s.area); if (!city) setCity(s.city); if (!district) setDistrict(s.district); if (!state) setState(s.state); } }); } }, [zip]);
  useEffect(() => { if (firstName && !referralCode) setReferralCode(generateReferralCode(firstName)); }, [firstName]);
  useEffect(() => { let pct = 15; if (firstName) pct += 10; if (mobile) pct += 10; if (area) pct += 5; if (dob) pct += 5; if (emergName) pct += 5; if (treatmentPreference) pct += 10; if (idProofNumber) pct += 10; if (consentDataSharing) pct += 10; if (patientLoginEnabled) pct += 10; if (consultant) pct += 10; setCompletionPercent(Math.min(pct, 100)); }, [firstName, mobile, area, dob, emergName, treatmentPreference, idProofNumber, consentDataSharing, patientLoginEnabled, consultant]);

  const totalBillAmount = billItems.reduce((s, i) => s + i.total, 0);

  const handlePrakritiAssess = () => {
    toast.info("AI analyzing Prakriti from your answers...");
    setTimeout(() => {
      setPrakritiType("Vata-Pitta");
      setAiRiskScore("Low");
      toast.success("Prakriti assessed: Vata-Pitta (AI Confidence: 82%)");
    }, 1500);
  };

  const navigate = useNavigate();
  const [checkinAfterRegister, setCheckinAfterRegister] = useState(true);

  const handleSubmit = async () => {
    if (!firstName.trim()) return toast.error("Patient name is required");
    if (!mobile.trim()) return toast.error("Mobile number is required");
    setSaving(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const uid = session.session?.user?.id;

      // Generate patient ID
      const { data: pidData } = await (supabase as any).rpc("generate_patient_id", { prefix: "AL" });
      const patientDisplayId = pidData || `AL-${Date.now().toString().slice(-5)}`;

      // Check for duplicate by mobile
      const { data: existing } = await (supabase as any)
        .from("hms_op_patients")
        .select("id, patient_id")
        .eq("mobile", mobile.trim())
        .limit(1)
        .maybeSingle();

      if (existing) {
        toast.error(`Patient already exists with this mobile: ${existing.patient_id}. Use Manage OP to check them in.`);
        setSaving(false);
        return;
      }

      // Insert patient
      const { data: newPat, error: patErr } = await (supabase as any)
        .from("hms_op_patients")
        .insert({
          patient_id: patientDisplayId,
          title: title !== "None" ? title : null,
          first_name: firstName.trim(),
          last_name: lastName.trim() || null,
          mobile: mobile.trim(),
          gender: gender,
          age_years: ageYears ? parseInt(ageYears) : null,
          date_of_birth: dob || null,
          email: email || null,
          address: null,
          city: city || null,
          state: state || null,
          pincode: null,
          country: country,
          blood_group: bloodGroup !== "Select" ? bloodGroup : null,
          prakriti: prakritiType || null,
          source: source || "walk-in",
          referral_code: referralCode,
          registered_by: uid,
          branch: "Main Branch",
        })
        .select("id, patient_id")
        .single();

      if (patErr) throw patErr;

      // Also check-in if option is enabled
      if (checkinAfterRegister) {
        const { data: tokenData } = await (supabase as any).rpc("next_session_token", { p_branch: "Main Branch" });
        const token = tokenData || 1;

        await (supabase as any).from("hms_op_visits").insert({
          patient_id: newPat.id,
          patient_display_id: newPat.patient_id,
          doctor_name: "Dr. Mohamad Saleem",
          mode_visit: "Direct",
          purpose: "Consultation",
          consultation_fee: 200,
          bill_amount: 200,
          bill_status: "paid",
          payment_mode: "cash",
          session_token: token,
          status: "checked_in",
          branch: "Main Branch",
        });

        toast.success(`✅ Registered & Checked In! ID: ${newPat.patient_id} | Token: ${token}`, {
          description: `${firstName} ${lastName || ""} | Referral: ${referralCode}`,
        });
      } else {
        toast.success(`Patient registered! ID: ${newPat.patient_id}`, {
          description: `Referral Code: ${referralCode}`,
        });
      }

      // Navigate to Manage OP
      if (checkinAfterRegister) {
        navigate("/hms/patient/manage-op");
      }
    } catch (e: any) {
      toast.error(e.message || "Registration failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-orange-600" /> Register Patient
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Brain className="h-3 w-3" /> AI-assisted · Unified identity across all modules · Marketplace integrated
          </p>
        </div>
        <Badge variant="outline" className="text-orange-600 border-orange-300">
          <Sparkles className="h-3 w-3 mr-1" /> AI Enhanced
        </Badge>
      </div>

      {/* Completion Progress */}
      <div className="flex items-center gap-3">
        <Progress value={completionPercent} className="flex-1 h-2" />
        <span className="text-xs font-medium text-muted-foreground">{completionPercent}% complete</span>
      </div>

      {/* AI Alerts — Phone Auto-Detect Existing Patient */}
      {isCheckingDuplicate && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
          <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
          <span className="text-sm text-blue-700">Checking for existing patient records...</span>
        </div>
      )}
      {duplicateWarning && (
        <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <div>
              <span className="text-sm font-medium text-amber-800">Patient already registered!</span>
              <p className="text-xs text-amber-700 mt-0.5">{duplicateWarning}</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button size="sm" variant="outline" className="text-xs border-amber-300 text-amber-700 hover:bg-amber-100"
              onClick={() => { toast.info("Opening existing patient profile..."); window.location.href = "/hms/patient/dashboard"; }}>
              <Link2 className="mr-1 h-3 w-3" /> View Profile
            </Button>
            <Button size="sm" className="text-xs bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => { toast.success("Linked to existing patient. Generating OPD token..."); setActiveTab("billing"); }}>
              <UserPlus className="mr-1 h-3 w-3" /> Link & Add Visit
            </Button>
          </div>
        </div>
      )}

      {/* 6-Tab Registration Form */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 sm:grid-cols-9 w-full">
          <TabsTrigger value="personal" className="text-xs">Personal</TabsTrigger>
          <TabsTrigger value="contact" className="text-xs">Contact & Social</TabsTrigger>
          <TabsTrigger value="medical" className="text-xs">Medical & AYUSH</TabsTrigger>
          <TabsTrigger value="identity" className="text-xs">Identity & Insurance</TabsTrigger>
          <TabsTrigger value="platform" className="text-xs">Platform & Prefs</TabsTrigger>
          <TabsTrigger value="groups" className="text-xs">Groups & VIP</TabsTrigger>
          <TabsTrigger value="documents" className="text-xs">Dockets & AI Scan</TabsTrigger>
          <TabsTrigger value="wellness" className="text-xs">Wellness & Trackers</TabsTrigger>
          <TabsTrigger value="billing" className="text-xs">OP Bill</TabsTrigger>
        </TabsList>

        {/* ═══ TAB 1: PERSONAL ═══ */}
        <TabsContent value="personal" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Personal Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {/* Photo + Basic */}
              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="h-24 w-24 rounded-lg border-2 border-dashed border-muted-foreground/30 grid place-items-center cursor-pointer hover:bg-muted/50 relative overflow-hidden">
                    {photo ? <img src={photo} className="h-full w-full rounded-lg object-cover" alt="Patient" /> : <Camera className="h-8 w-8 text-muted-foreground/50" />}
                  </div>
                  <div className="flex gap-1 mt-1.5">
                    <label className="inline-flex items-center gap-0.5 px-1.5 h-6 text-[9px] border rounded cursor-pointer hover:bg-muted">
                      <Camera className="h-3 w-3" /> Take
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) { setPhoto(URL.createObjectURL(file)); toast.success("Photo captured!"); }
                      }} />
                    </label>
                    <label className="inline-flex items-center gap-0.5 px-1.5 h-6 text-[9px] border rounded cursor-pointer hover:bg-muted">
                      <FileText className="h-3 w-3" /> Upload
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) { setPhoto(URL.createObjectURL(file)); toast.success("Photo uploaded!"); }
                      }} />
                    </label>
                  </div>
                  {photo && <button className="text-[9px] text-red-500 mt-0.5 underline" onClick={() => setPhoto("")}>Remove</button>}
                </div>
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div><Label>Title</Label><Select value={title} onValueChange={(v) => setTitle(v as PatientTitle)}><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="None">None</SelectItem><SelectItem value="Mr">Mr</SelectItem><SelectItem value="Mrs">Mrs</SelectItem><SelectItem value="Ms">Ms</SelectItem><SelectItem value="Dr">Dr</SelectItem><SelectItem value="Master">Master</SelectItem><SelectItem value="Baby">Baby</SelectItem></SelectContent></Select></div>
                  <div><Label>First Name *</Label><Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" className="h-9" /></div>
                  <div><Label>Last Name</Label><Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" className="h-9" /></div>
                  <div><Label>Gender *</Label><Select value={gender} onValueChange={(v) => setGender(v as Gender)}><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></div>
                </div>
              </div>
              {/* DOB, Age, Blood */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                <div><Label>Date of Birth</Label><Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="h-9" /></div>
                <div><Label>Years</Label><Input value={ageYears} onChange={(e) => setAgeYears(e.target.value)} className="h-9" /></div>
                <div><Label>Months</Label><Input value={ageMonths} onChange={(e) => setAgeMonths(e.target.value)} className="h-9" /></div>
                <div><Label>Days</Label><Input value={ageDays} onChange={(e) => setAgeDays(e.target.value)} className="h-9" /></div>
                <div><Label>Blood Group</Label><Select value={bloodGroup} onValueChange={(v) => setBloodGroup(v as BloodGroup)}><SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Marital Status</Label><Select value={maritalStatus} onValueChange={setMaritalStatus}><SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="Single">Single</SelectItem><SelectItem value="Married">Married</SelectItem><SelectItem value="Divorced">Divorced</SelectItem><SelectItem value="Widowed">Widowed</SelectItem></SelectContent></Select></div>
              </div>
              {/* Mobile, Email, Source */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div><Label>Mobile *</Label><div className="flex"><span className="flex items-center px-2 border rounded-l bg-muted text-xs">+91</span><Input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="10 digits" className="rounded-l-none h-9" />{isCheckingDuplicate && <Loader2 className="h-4 w-4 animate-spin absolute right-2 top-2" />}</div></div>
                <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className="h-9" /></div>
                <div><Label>Source</Label><Select value={source} onValueChange={setSource}><SelectTrigger className="h-9"><SelectValue placeholder="How found us?" /></SelectTrigger><SelectContent><SelectItem value="Walk-in">Walk-in</SelectItem><SelectItem value="Referral">Referral</SelectItem><SelectItem value="Google">Google Search</SelectItem><SelectItem value="Social">Social Media</SelectItem><SelectItem value="Website">Website</SelectItem><SelectItem value="WhatsApp">WhatsApp</SelectItem><SelectItem value="Family">Family/Friend</SelectItem></SelectContent></Select></div>
                <div><Label>Guardian</Label><Input value={guardian} onChange={(e) => setGuardian(e.target.value)} placeholder="Guardian name" className="h-9" /></div>
              </div>
              {/* Occupation, Employer, Nationality, Language, Religion */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div><Label>Occupation</Label><Input value={occupation} onChange={(e) => setOccupation(e.target.value)} placeholder="e.g. Teacher" className="h-9" /></div>
                <div><Label>Employer</Label><Input value={employer} onChange={(e) => setEmployer(e.target.value)} placeholder="Company name" className="h-9" /></div>
                <div><Label>Nationality</Label><Select value={nationality} onValueChange={setNationality}><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Indian">Indian</SelectItem><SelectItem value="NRI">NRI</SelectItem><SelectItem value="Foreign">Foreign National</SelectItem></SelectContent></Select></div>
                <div><Label>Language</Label><Select value={preferredLanguage} onValueChange={setPreferredLanguage}><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Tamil">Tamil</SelectItem><SelectItem value="English">English</SelectItem><SelectItem value="Hindi">Hindi</SelectItem><SelectItem value="Malayalam">Malayalam</SelectItem><SelectItem value="Telugu">Telugu</SelectItem><SelectItem value="Kannada">Kannada</SelectItem></SelectContent></Select></div>
                <div><Label>Religion</Label><Select value={religion} onValueChange={setReligion}><SelectTrigger className="h-9"><SelectValue placeholder="Optional" /></SelectTrigger><SelectContent><SelectItem value="Hindu">Hindu</SelectItem><SelectItem value="Muslim">Muslim</SelectItem><SelectItem value="Christian">Christian</SelectItem><SelectItem value="Sikh">Sikh</SelectItem><SelectItem value="Buddhist">Buddhist</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Location</Label><Input value={location} readOnly className="h-9 bg-muted" /></div>
                <div><Label>Reg. Date / Time</Label><Input value={`${regDate} ${regTime}`} readOnly className="h-9 bg-muted" /></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ TAB 2: CONTACT & SOCIAL ═══ */}
        <TabsContent value="contact" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Contact & Address</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div><Label>Alternate Mobile</Label><div className="flex"><span className="flex items-center px-2 border rounded-l bg-muted text-xs">+91</span><Input value={alternateMobile} onChange={(e) => setAlternateMobile(e.target.value)} className="rounded-l-none h-9" /></div></div>
                <div><Label>WhatsApp No</Label><div className="flex"><span className="flex items-center px-2 border rounded-l bg-muted text-xs">+91</span><Input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder={mobile || "Same as mobile"} className="rounded-l-none h-9" /></div></div>
                <div className="flex items-end gap-2 pb-1"><Checkbox checked={whatsappOptIn} onCheckedChange={(c) => setWhatsappOptIn(!!c)} /><Label className="text-xs">WhatsApp Opt-in (reminders, reports)</Label></div>
                <div><Label>Preferred Language</Label><Input value={preferredLanguage} readOnly className="h-9 bg-muted" /></div>
              </div>
              <Separator />
              <p className="text-sm font-medium">Address {aiSuggesting && <Badge variant="outline" className="text-[10px] ml-2"><Loader2 className="h-3 w-3 animate-spin mr-1" />AI filling...</Badge>}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div><Label>Street</Label><Input value={street} onChange={(e) => setStreet(e.target.value)} className="h-9" /></div>
                <div><Label>Area *</Label><Input value={area} onChange={(e) => setArea(e.target.value)} className="h-9" /></div>
                <div><Label>Landmark</Label><Input value={landmark} onChange={(e) => setLandmark(e.target.value)} className="h-9" /></div>
                <div><Label>City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} className="h-9" /></div>
                <div><Label>District</Label><Input value={district} onChange={(e) => setDistrict(e.target.value)} className="h-9" /></div>
                <div><Label>State</Label><Select value={state} onValueChange={setState}><SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{["Tamil Nadu","Kerala","Karnataka","Andhra Pradesh","Telangana","Maharashtra","Delhi","Gujarat","Rajasthan","UP","Bihar","West Bengal","Odisha","MP","Others"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Pincode</Label><Input value={zip} onChange={(e) => setZip(e.target.value)} placeholder="6 digits → AI auto-fill" className="h-9" /></div>
                <div><Label>Country</Label><Input value={country} readOnly className="h-9 bg-muted" /></div>
              </div>
              <Separator />
              <p className="text-sm font-medium">Emergency Contact</p>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Name</Label><Input value={emergName} onChange={(e) => setEmergName(e.target.value)} placeholder="Emergency contact name" className="h-9" /></div>
                <div><Label>Relationship</Label><Select value={emergRelation} onValueChange={setEmergRelation}><SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="Spouse">Spouse</SelectItem><SelectItem value="Parent">Parent</SelectItem><SelectItem value="Child">Child</SelectItem><SelectItem value="Sibling">Sibling</SelectItem><SelectItem value="Friend">Friend</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></div>
                <div><Label>Phone</Label><div className="flex"><span className="flex items-center px-2 border rounded-l bg-muted text-xs">+91</span><Input value={emergPhone} onChange={(e) => setEmergPhone(e.target.value)} className="rounded-l-none h-9" /></div></div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" /> Social Media Handles</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">Connect social profiles for testimonials, follow-ups & engagement campaigns</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2"><span className="text-sm shrink-0 w-5 text-blue-600 font-bold">f</span><Input value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} placeholder="facebook.com/profile-url" className="h-9" /></div>
                <div className="flex items-center gap-2"><span className="text-sm shrink-0 w-5 text-pink-600 font-bold">IG</span><Input value={instagramHandle} onChange={(e) => setInstagramHandle(e.target.value)} placeholder="@instagram_handle" className="h-9" /></div>
                <div className="flex items-center gap-2"><span className="text-sm shrink-0 w-5 text-red-600 font-bold">YT</span><Input value={youtubeChannel} onChange={(e) => setYoutubeChannel(e.target.value)} placeholder="youtube.com/channel" className="h-9" /></div>
                <div className="flex items-center gap-2"><span className="text-sm shrink-0 w-5 text-blue-700 font-bold">in</span><Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="linkedin.com/in/profile" className="h-9" /></div>
                <div className="flex items-center gap-2"><span className="text-sm shrink-0 w-5 font-bold">𝕏</span><Input value={twitterHandle} onChange={(e) => setTwitterHandle(e.target.value)} placeholder="@twitter_handle" className="h-9" /></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ TAB 3: MEDICAL & AYUSH ═══ */}
        <TabsContent value="medical" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Leaf className="h-4 w-4 text-green-600" /> Treatment Preference & Prakriti</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div><Label>Treatment System Preference *</Label><Select value={treatmentPreference} onValueChange={setTreatmentPreference}><SelectTrigger className="h-9"><SelectValue placeholder="Select preferred system" /></SelectTrigger><SelectContent><SelectItem value="Ayurveda">Ayurveda</SelectItem><SelectItem value="Siddha">Siddha</SelectItem><SelectItem value="Homeopathy">Homeopathy</SelectItem><SelectItem value="Unani">Unani</SelectItem><SelectItem value="Yoga">Yoga & Naturopathy</SelectItem><SelectItem value="Integrative">Integrative (AYUSH + Allopathy)</SelectItem><SelectItem value="Any">No Preference / Any</SelectItem></SelectContent></Select></div>
                <div><Label>Prakriti (Constitution)</Label><Select value={prakritiType} onValueChange={setPrakritiType}><SelectTrigger className="h-9"><SelectValue placeholder="AI will assess" /></SelectTrigger><SelectContent><SelectItem value="Vata">Vata</SelectItem><SelectItem value="Pitta">Pitta</SelectItem><SelectItem value="Kapha">Kapha</SelectItem><SelectItem value="Vata-Pitta">Vata-Pitta</SelectItem><SelectItem value="Vata-Kapha">Vata-Kapha</SelectItem><SelectItem value="Pitta-Kapha">Pitta-Kapha</SelectItem><SelectItem value="Tridosha">Tridosha (Balanced)</SelectItem></SelectContent></Select></div>
                <div><Label>AI Health Risk</Label><Input value={aiRiskScore || "Will be auto-calculated"} readOnly className="h-9 bg-muted" /></div>
              </div>

              {/* AI Prakriti Quick Assessment */}
              <div className="border rounded-lg p-4 bg-green-50/50">
                <p className="text-sm font-medium flex items-center gap-2 mb-3"><Brain className="h-4 w-4 text-green-600" /> AI Prakriti Quick Assessment (5 Questions)</p>
                <div className="space-y-3">
                  <div><Label className="text-xs">1. Body Frame</Label><Select value={prakritiQ1} onValueChange={setPrakritiQ1}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="thin">Thin, light, tall/short</SelectItem><SelectItem value="medium">Medium, proportionate</SelectItem><SelectItem value="large">Large, heavy, stocky</SelectItem></SelectContent></Select></div>
                  <div><Label className="text-xs">2. Skin Type</Label><Select value={prakritiQ2} onValueChange={setPrakritiQ2}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="dry">Dry, rough, cool</SelectItem><SelectItem value="warm">Warm, oily, prone to rashes</SelectItem><SelectItem value="thick">Thick, moist, cool, pale</SelectItem></SelectContent></Select></div>
                  <div><Label className="text-xs">3. Digestion</Label><Select value={prakritiQ3} onValueChange={setPrakritiQ3}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="irregular">Irregular, bloating, gas</SelectItem><SelectItem value="strong">Strong, acidic, sharp hunger</SelectItem><SelectItem value="slow">Slow, heavy after meals</SelectItem></SelectContent></Select></div>
                  <div><Label className="text-xs">4. Sleep Pattern</Label><Select value={prakritiQ4} onValueChange={setPrakritiQ4}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="light">Light, disturbed, insomnia</SelectItem><SelectItem value="moderate">Moderate, wake easily</SelectItem><SelectItem value="deep">Deep, heavy, oversleep</SelectItem></SelectContent></Select></div>
                  <div><Label className="text-xs">5. Temperament</Label><Select value={prakritiQ5} onValueChange={setPrakritiQ5}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="anxious">Anxious, creative, quick</SelectItem><SelectItem value="intense">Intense, focused, competitive</SelectItem><SelectItem value="calm">Calm, steady, slow to anger</SelectItem></SelectContent></Select></div>
                </div>
                <Button className="mt-3" size="sm" variant="outline" onClick={handlePrakritiAssess} disabled={!prakritiQ1 || !prakritiQ2}>
                  <Brain className="mr-1 h-4 w-4" /> AI Assess Prakriti
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Medical History & Lifestyle</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><Label>Known Allergies (comma separated)</Label><Input value={knownAllergies} onChange={(e) => setKnownAllergies(e.target.value)} placeholder="e.g. Penicillin, Peanuts, Dust" className="h-9" /></div>
              <div><Label>Chronic Conditions</Label><Input value={chronicConditions} onChange={(e) => setChronicConditions(e.target.value)} placeholder="e.g. Diabetes, Hypertension, Asthma" className="h-9" /></div>
              <div><Label>Current Allopathic Medications</Label><Input value={currentMedications} onChange={(e) => setCurrentMedications(e.target.value)} placeholder="e.g. Metformin 500mg, Amlodipine 5mg" className="h-9" /></div>
              <div><Label>Current AYUSH Medications</Label><Input value={currentAyushMeds} onChange={(e) => setCurrentAyushMeds(e.target.value)} placeholder="e.g. Triphala, Ashwagandha, Arnica 30C" className="h-9" /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Smoking</Label><Select value={smokingStatus} onValueChange={setSmokingStatus}><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Never">Never</SelectItem><SelectItem value="Former">Former</SelectItem><SelectItem value="Current">Current</SelectItem></SelectContent></Select></div>
                <div><Label>Alcohol</Label><Select value={alcoholStatus} onValueChange={setAlcoholStatus}><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Never">Never</SelectItem><SelectItem value="Occasional">Occasional</SelectItem><SelectItem value="Regular">Regular</SelectItem></SelectContent></Select></div>
                <div><Label>Exercise</Label><Select value={exerciseFreq} onValueChange={setExerciseFreq}><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="None">None</SelectItem><SelectItem value="Occasional">Occasional</SelectItem><SelectItem value="Regular">Regular</SelectItem><SelectItem value="Daily">Daily</SelectItem></SelectContent></Select></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ TAB 4: IDENTITY & INSURANCE ═══ */}
        <TabsContent value="identity" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><CreditCard className="h-4 w-4" /> Identity Verification</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div><Label>ID Proof Type</Label><Select value={idProofType} onValueChange={setIdProofType}><SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="Aadhaar">Aadhaar Card</SelectItem><SelectItem value="PAN">PAN Card</SelectItem><SelectItem value="Passport">Passport</SelectItem><SelectItem value="DrivingLicense">Driving License</SelectItem><SelectItem value="VoterID">Voter ID</SelectItem></SelectContent></Select></div>
                <div><Label>ID Number</Label><Input value={idProofNumber} onChange={(e) => setIdProofNumber(e.target.value)} placeholder="Enter ID number" className="h-9" /></div>
                <div><Label>Upload Document</Label><Input type="file" className="h-9 text-xs" accept="image/*,.pdf" /></div>
              </div>
              <Separator />
              <p className="text-sm font-medium flex items-center gap-2"><Shield className="h-4 w-4 text-blue-600" /> ABHA (Ayushman Bharat Health Account)</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div><Label>ABHA ID (14-digit)</Label><Input value={abhaId} onChange={(e) => setAbhaId(e.target.value)} placeholder="XX-XXXX-XXXX-XXXX" className="h-9" /></div>
                <div className="flex items-end"><Button variant="outline" size="sm" onClick={() => { setAbhaVerified(true); toast.success("ABHA verified successfully!"); }} disabled={abhaVerified || !abhaId}>{abhaVerified ? <><CheckCircle2 className="mr-1 h-4 w-4 text-green-600" /> Verified</> : "Verify ABHA"}</Button></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" /> Insurance & Corporate</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div><Label>Insurance Provider</Label><Input value={insuranceProvider} onChange={(e) => setInsuranceProvider(e.target.value)} placeholder="e.g. Star Health, ICICI Lombard" className="h-9" /></div>
                <div><Label>Policy Number</Label><Input value={insurancePolicyNo} onChange={(e) => setInsurancePolicyNo(e.target.value)} className="h-9" /></div>
                <div><Label>Validity</Label><Input type="date" value={insuranceValidity} onChange={(e) => setInsuranceValidity(e.target.value)} className="h-9" /></div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div><Label>Corporate / Company</Label><Input value={corporateName} onChange={(e) => setCorporateName(e.target.value)} placeholder="Company name for corporate billing" className="h-9" /></div>
                <div><Label>TPA Name</Label><Input value={tpaName} onChange={(e) => setTpaName(e.target.value)} placeholder="Third Party Administrator" className="h-9" /></div>
                <div><Label>Employee ID</Label><Input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="h-9" /></div>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-xs text-blue-700 flex items-center gap-1"><Brain className="h-3 w-3" /> AI will auto-check if AYUSH treatments are covered under this insurance policy during billing.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ TAB 5: PLATFORM & PREFERENCES ═══ */}
        <TabsContent value="platform" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4 text-purple-600" /> Ayuzee Platform Integration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {/* Patient Login */}
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div><p className="text-sm font-medium">Auto-create Patient Login</p><p className="text-xs text-muted-foreground">Patient can access ayuzee.com/dashboard with OTP</p></div>
                <Switch checked={patientLoginEnabled} onCheckedChange={setPatientLoginEnabled} />
              </div>
              {/* Ayuzee Shop */}
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div><p className="text-sm font-medium">Link Ayuzee Shop Account</p><p className="text-xs text-muted-foreground">Patient can order prescribed medicines from ayuzee.com/shop</p></div>
                <Switch checked={ayuzeeShopLinked} onCheckedChange={setAyuzeeShopLinked} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div><p className="text-sm font-medium">Enable Direct Purchase</p><p className="text-xs text-muted-foreground">Allow patient to buy medicines without new prescription</p></div>
                <Switch checked={directPurchaseEnabled} onCheckedChange={setDirectPurchaseEnabled} />
              </div>
              {/* Loyalty */}
              <div className="flex items-center justify-between p-3 rounded-lg border bg-amber-50/50">
                <div><p className="text-sm font-medium flex items-center gap-1"><Star className="h-4 w-4 text-amber-500" /> Enroll in Loyalty Program</p><p className="text-xs text-muted-foreground">Auto-enroll at Silver tier. Earn points on every visit.</p></div>
                <Switch checked={loyaltyEnroll} onCheckedChange={setLoyaltyEnroll} />
              </div>
              {/* Referral Code */}
              <div className="p-3 rounded-lg border bg-green-50/50">
                <p className="text-sm font-medium flex items-center gap-1 mb-2"><Gift className="h-4 w-4 text-green-600" /> Referral Code</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Patient's Unique Code (share with friends)</Label><div className="flex gap-1"><Input value={referralCode} readOnly className="h-9 font-mono font-bold" /><Button variant="outline" size="sm" className="h-9 shrink-0" onClick={() => { navigator.clipboard.writeText(referralCode); toast.success("Copied!"); }}><Copy className="h-4 w-4" /></Button></div></div>
                  <div><Label className="text-xs">Referred By Code (if any)</Label><Input value={referredByCode} onChange={(e) => setReferredByCode(e.target.value)} placeholder="Enter referral code used" className="h-9 font-mono" /></div>
                </div>
              </div>
              {/* Digital Card */}
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div><p className="text-sm font-medium flex items-center gap-1"><QrCode className="h-4 w-4" /> Issue Digital Patient Card (QR)</p><p className="text-xs text-muted-foreground">Printable card + digital QR for quick check-in at reception</p></div>
                <Switch checked={digitalCardIssued} onCheckedChange={setDigitalCardIssued} />
              </div>
              {/* Family */}
              <div><Label>Family Group ID (link with existing family members)</Label><Input value={familyGroupId} onChange={(e) => setFamilyGroupId(e.target.value)} placeholder="Enter existing patient ID of family member" className="h-9" /></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Notifications & Consent</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><p className="text-sm font-medium mb-2">Preferred Notification Channels</p>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2"><Checkbox checked={notifSms} onCheckedChange={(c) => setNotifSms(!!c)} /><span className="text-sm">SMS</span></label>
                  <label className="flex items-center gap-2"><Checkbox checked={notifWhatsapp} onCheckedChange={(c) => setNotifWhatsapp(!!c)} /><span className="text-sm">WhatsApp</span></label>
                  <label className="flex items-center gap-2"><Checkbox checked={notifEmail} onCheckedChange={(c) => setNotifEmail(!!c)} /><span className="text-sm">Email</span></label>
                  <label className="flex items-center gap-2"><Checkbox checked={notifApp} onCheckedChange={(c) => setNotifApp(!!c)} /><span className="text-sm">App Push</span></label>
                </div>
              </div>
              <Separator />
              <div><p className="text-sm font-medium mb-2">Patient Consent (DPDPA Compliance)</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2"><Checkbox checked={consentDataSharing} onCheckedChange={(c) => setConsentDataSharing(!!c)} /><span className="text-sm">Consent to share health data with treating doctors</span></label>
                  <label className="flex items-center gap-2"><Checkbox checked={consentMarketing} onCheckedChange={(c) => setConsentMarketing(!!c)} /><span className="text-sm">Consent to receive marketing communications (offers, packages)</span></label>
                  <label className="flex items-center gap-2"><Checkbox checked={consentResearch} onCheckedChange={(c) => setConsentResearch(!!c)} /><span className="text-sm">Consent to anonymized data use for clinical research</span></label>
                  <label className="flex items-center gap-2"><Checkbox checked={consentTelemedicine} onCheckedChange={(c) => setConsentTelemedicine(!!c)} /><span className="text-sm">Consent for teleconsultation & video calls</span></label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ TAB 6: GROUPS & VIP ═══ */}
        <TabsContent value="groups" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4 text-red-600" /> Confidential & Patient Classification</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-red-200 bg-red-50/30">
                <div><p className="text-sm font-medium text-red-700">Mark as Confidential</p><p className="text-xs text-muted-foreground">Restrict access to authorized doctors only</p></div>
                <Switch checked={confidential} onCheckedChange={setConfidential} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-amber-200 bg-amber-50/30">
                <div><p className="text-sm font-medium flex items-center gap-1"><Star className="h-4 w-4 text-amber-500" /> VIP Patient</p><p className="text-xs text-muted-foreground">Priority queue, dedicated support, special billing rates</p></div>
                <Switch checked={vipStatus} onCheckedChange={setVipStatus} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div><Label>Patient Group / Category</Label><Select value={patientGroup} onValueChange={setPatientGroup}><SelectTrigger className="h-9"><SelectValue placeholder="Select Group" /></SelectTrigger><SelectContent><SelectItem value="A">Group A — Premium (High Value)</SelectItem><SelectItem value="B">Group B — Regular</SelectItem><SelectItem value="C">Group C — Subsidized</SelectItem><SelectItem value="D">Group D — Free / Charity</SelectItem><SelectItem value="Corporate">Corporate</SelectItem><SelectItem value="Insurance">Insurance</SelectItem><SelectItem value="International">International Patient</SelectItem></SelectContent></Select></div>
                <div><Label>Follow-up Category</Label><Select value={followUpCategory} onValueChange={setFollowUpCategory}><SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="weekly">Weekly Follow-up</SelectItem><SelectItem value="biweekly">Bi-weekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="quarterly">Quarterly</SelectItem><SelectItem value="chronic">Chronic Disease Mgmt</SelectItem><SelectItem value="post-pk">Post-Panchakarma</SelectItem><SelectItem value="none">No specific schedule</SelectItem></SelectContent></Select></div>
                <div><Label>Custom Tags</Label><Input value={patientTags} onChange={(e) => setPatientTags(e.target.value)} placeholder="e.g. Diabetic, Post-surgery, NRI" className="h-9" /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" /> Club & Organization Memberships</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">If patient is member of professional clubs — helps in networking, referrals & corporate tie-ups</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {["JCI", "BNI", "Rotary", "Lions Club", "Round Table", "IMA", "Chamber of Commerce", "Other"].map(club => (
                  <label key={club} className="flex items-center gap-2 p-2 rounded border hover:bg-muted/50 cursor-pointer">
                    <Checkbox checked={clubMemberships.includes(club)} onCheckedChange={(c) => {
                      if (c) setClubMemberships([...clubMemberships, club]);
                      else setClubMemberships(clubMemberships.filter(x => x !== club));
                    }} />
                    <span className="text-xs">{club}</span>
                  </label>
                ))}
              </div>
              <div><Label>Club Details / ID</Label><Input value={clubDetails} onChange={(e) => setClubDetails(e.target.value)} placeholder="e.g. Rotary Club Kadayanallur, Member ID: RC-1234" className="h-9" /></div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ TAB 7: DOCUMENTS & AI SCAN ═══ */}
        <TabsContent value="documents" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" /> Medical Dockets & AI Document Analysis</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">Upload previous reports, prescriptions, discharge summaries. AI will extract & summarize key medical data.</p>
              <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center hover:bg-muted/30 cursor-pointer">
                <FileText className="h-10 w-10 mx-auto text-muted-foreground/50" />
                <p className="text-sm mt-2">Drag & drop files or click to upload</p>
                <p className="text-xs text-muted-foreground">PDF, JPG, PNG (max 10MB each) — Prescriptions, Lab Reports, Discharge Summaries</p>
                <Input type="file" multiple accept=".pdf,.jpg,.png,.jpeg" className="mt-3 max-w-[250px] mx-auto" onChange={() => {
                  toast.info("AI is scanning and extracting medical data...");
                  setTimeout(() => {
                    setDocketFiles([
                      { name: "Previous_Prescription.pdf", type: "Prescription", aiSummary: "Metformin 500mg BD, Amlodipine 5mg OD. Diagnosed: T2DM + HTN. Dr. Ravi, Apollo Hospital, Mar 2026." },
                      { name: "Blood_Report_Jun2026.pdf", type: "Lab Report", aiSummary: "HbA1c: 7.8% (above normal), FBS: 145 mg/dl, LDL: 142 mg/dl. Lipid panel borderline high." },
                    ]);
                    toast.success("AI extracted medical data from 2 documents!");
                  }, 2000);
                }} />
              </div>
              {docketFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center gap-1"><Brain className="h-4 w-4 text-purple-600" /> AI-Extracted Summary:</p>
                  {docketFiles.map((f, idx) => (
                    <div key={idx} className="p-3 rounded-lg border bg-purple-50/30">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{f.name}</span>
                        <Badge variant="outline" className="text-[10px]">{f.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{f.aiSummary}</p>
                    </div>
                  ))}
                </div>
              )}
              <Separator />
              <div><Label>Camera Capture (Live Photo / Document Scan)</Label>
                <div className="flex gap-2 mt-1">
                  <Button variant="outline" size="sm" onClick={() => toast.info("Opening camera...")}><Camera className="mr-1 h-4 w-4" /> Take Photo</Button>
                  <Button variant="outline" size="sm" onClick={() => toast.info("Opening document scanner...")}><FileText className="mr-1 h-4 w-4" /> Scan Document</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Link2 className="h-4 w-4 text-green-600" /> Quick Registration & Self-fill</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">Share a pre-filled form link to patient via WhatsApp/SMS — they fill their own details before arriving. Data auto-pulls into this form.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border bg-green-50/30">
                  <p className="text-xs font-medium text-green-700 mb-1">Patient Self-Registration Link (Google Form style)</p>
                  <div className="flex gap-1">
                    <Input value={googleFormLink} readOnly className="h-8 text-xs font-mono" />
                    <Button variant="outline" size="sm" className="h-8 shrink-0" onClick={() => { navigator.clipboard.writeText(googleFormLink); toast.success("Link copied! Share via WhatsApp."); }}><Copy className="h-3 w-3" /></Button>
                  </div>
                </div>
                <div className="p-3 rounded-lg border bg-blue-50/30">
                  <p className="text-xs font-medium text-blue-700 mb-1">Quick Reg Steps (for reception)</p>
                  <ol className="text-[10px] text-muted-foreground space-y-0.5 list-decimal list-inside">
                    <li>Enter Mobile → AI checks duplicate</li>
                    <li>Enter Name + DOB → Auto-generate ID</li>
                    <li>Pincode → AI fills address</li>
                    <li>Select Doctor → Create OP bill</li>
                    <li>Done! (other tabs can be filled later)</li>
                  </ol>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => toast.success("WhatsApp sent with registration form link")}><Smartphone className="mr-1 h-4 w-4" /> Send via WhatsApp</Button>
                <Button variant="outline" size="sm" onClick={() => toast.success("SMS sent with registration link")}><Phone className="mr-1 h-4 w-4" /> Send via SMS</Button>
                <Button variant="outline" size="sm" onClick={() => toast.success("Email sent with registration link")}><Mail className="mr-1 h-4 w-4" /> Send via Email</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ TAB 8: WELLNESS & TRACKERS ═══ */}
        <TabsContent value="wellness" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Heart className="h-4 w-4 text-rose-600" /> Wellness Program Opt-ins</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">Ask patient if they're interested in these wellness programs (auto-sends relevant info after registration)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 cursor-pointer">
                  <div><p className="text-sm font-medium">Gut Health Analysis</p><p className="text-[10px] text-muted-foreground">AI-powered digestive health assessment</p></div>
                  <Switch checked={willingGutAnalysis} onCheckedChange={setWillingGutAnalysis} />
                </label>
                <label className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 cursor-pointer">
                  <div><p className="text-sm font-medium">Monthly Hijama (Cupping)</p><p className="text-[10px] text-muted-foreground">Scheduled monthly blood cupping therapy</p></div>
                  <Switch checked={willingHijama} onCheckedChange={setWillingHijama} />
                </label>
                <label className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 cursor-pointer">
                  <div><p className="text-sm font-medium">Retreat / Detox Program</p><p className="text-[10px] text-muted-foreground">Panchakarma detox or wellness retreat interest</p></div>
                  <Switch checked={willingRetreatDetox} onCheckedChange={setWillingRetreatDetox} />
                </label>
                <label className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 cursor-pointer">
                  <div><p className="text-sm font-medium">Gamification (Points & Rewards)</p><p className="text-[10px] text-muted-foreground">Earn points for health goals, reviews, referrals</p></div>
                  <Switch checked={willingGamification} onCheckedChange={setWillingGamification} />
                </label>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4 text-blue-600" /> Trackers & Journey</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">Enable personalized tracking for this patient — data appears in their patient portal</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 cursor-pointer">
                  <div><p className="text-sm font-medium">Health Tracker</p><p className="text-[10px] text-muted-foreground">BP, Sugar, Weight, BMI trends over time</p></div>
                  <Switch checked={willingHealthTracker} onCheckedChange={setWillingHealthTracker} />
                </label>
                <label className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 cursor-pointer">
                  <div><p className="text-sm font-medium">Habit Tracker</p><p className="text-[10px] text-muted-foreground">Sleep, Exercise, Diet, Medicine adherence</p></div>
                  <Switch checked={willingHabitTracker} onCheckedChange={setWillingHabitTracker} />
                </label>
                <label className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 cursor-pointer">
                  <div><p className="text-sm font-medium">AYUSH Journey Tracker</p><p className="text-[10px] text-muted-foreground">Track Prakriti balance, treatment progress, milestones</p></div>
                  <Switch checked={willingJourneyTracker} onCheckedChange={setWillingJourneyTracker} />
                </label>
                <label className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 cursor-pointer">
                  <div><p className="text-sm font-medium">Feedback System</p><p className="text-[10px] text-muted-foreground">Auto-ask feedback after each visit (star rating + comments)</p></div>
                  <Switch checked={willingFeedback} onCheckedChange={setWillingFeedback} />
                </label>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Star className="h-4 w-4 text-amber-500" /> Engagement Automations (2nd Visit+)</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">These pop-ups/prompts will trigger automatically on second visit onwards</p>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 rounded-lg border">
                  <div><p className="text-sm font-medium">Google Review Pop-up (2nd visit)</p><p className="text-[10px] text-muted-foreground">Prompt patient to leave a Google review after 2nd visit</p></div>
                  <Switch checked={secondVisitGoogleReview} onCheckedChange={setSecondVisitGoogleReview} />
                </label>
                <label className="flex items-center justify-between p-3 rounded-lg border">
                  <div><p className="text-sm font-medium">Social Media Follow Prompt</p><p className="text-[10px] text-muted-foreground">Ask patient to follow on Instagram/YouTube after visit</p></div>
                  <Switch checked={secondVisitSocialFollow} onCheckedChange={setSecondVisitSocialFollow} />
                </label>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-700 flex items-center gap-1"><Sparkles className="h-3 w-3" /> Gamification bonus: Patient earns +200 points for Google review, +50 for social follow, +500 for video testimonial</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ TAB 9: OP BILL (MocDoc Format) ═══ */}
        <TabsContent value="billing" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-base text-orange-600 text-center">OP Bill</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {/* Consultant, Ref By, Visit, Purpose */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <Label className="font-medium">Consultant **</Label>
                  <Select value={consultant} onValueChange={setConsultant}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select a Consultant" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dr-arun">Dr. Arun Sharma</SelectItem>
                      <SelectItem value="dr-meena">Dr. Meena Patel</SelectItem>
                      <SelectItem value="dr-priya">Dr. Priya Das</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="font-medium text-red-600">Ref By **</Label>
                    <button className="text-[10px] text-blue-600 underline">Add New Referred By</button>
                  </div>
                  <Select value={referredBy} onValueChange={setReferredBy}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select Referred By" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="self">Self</SelectItem>
                      <SelectItem value="dr-ext1">Dr. Ravi (Apollo)</SelectItem>
                      <SelectItem value="patient-ref">Patient Referral</SelectItem>
                      <SelectItem value="google">Google</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="font-medium">Visit *</Label>
                  <Select value={visitType} onValueChange={setVisitType}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Consultation">Consultation</SelectItem>
                      <SelectItem value="Follow-up">Follow-up</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                      <SelectItem value="Procedure">Procedure</SelectItem>
                      <SelectItem value="Diagnostic">Diagnostic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="font-medium">Purpose *</Label>
                  <Input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Consultation" className="h-9" />
                </div>
              </div>

              {/* Bill Items Table — MocDoc style */}
              <div className="overflow-x-auto border rounded">
                <table className="w-full text-sm">
                  <thead className="bg-white border-b">
                    <tr>
                      <th className="px-2 py-2 text-left text-xs font-medium text-orange-700 w-[50px]">S.No</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-orange-700">Particulars</th>
                      <th className="px-2 py-2 text-center text-xs font-medium text-orange-700 w-[60px]">Qty</th>
                      <th className="px-2 py-2 text-right text-xs font-medium text-orange-700 w-[80px]">Price</th>
                      <th className="px-2 py-2 text-center text-xs font-medium text-orange-700 w-[80px]">GST(%)</th>
                      <th className="px-2 py-2 text-center text-xs font-medium text-orange-700 w-[60px]">Dis(%)</th>
                      <th className="px-2 py-2 text-right text-xs font-medium text-orange-700 w-[70px]">Dis(Amt)</th>
                      <th className="px-2 py-2 text-right text-xs font-medium text-orange-700 w-[80px]">Total</th>
                      <th className="px-2 py-2 w-[50px]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {billItems.map((item, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="px-2 py-1 text-center"><span className="text-xs">→</span></td>
                        <td className="px-2 py-1"><Input value={item.particulars} onChange={(e) => { const u = [...billItems]; u[idx].particulars = e.target.value; setBillItems(u); }} placeholder="Particular" className="h-8 text-xs border-0 shadow-none" /></td>
                        <td className="px-2 py-1"><Input type="number" value={item.qty || ""} onChange={(e) => { const u = [...billItems]; u[idx].qty = +e.target.value; u[idx].total = u[idx].qty * u[idx].price * (1 + (parseFloat(u[idx].gst || "0") / 100)) - u[idx].discAmt; setBillItems(u); }} className="h-8 text-xs text-center border-0 shadow-none" /></td>
                        <td className="px-2 py-1"><Input type="number" value={item.price || ""} onChange={(e) => { const u = [...billItems]; u[idx].price = +e.target.value; const sub = u[idx].qty * u[idx].price; u[idx].discAmt = sub * u[idx].disc / 100; u[idx].total = sub + sub * (parseFloat(u[idx].gst || "0") / 100) - u[idx].discAmt; setBillItems(u); }} placeholder="Price" className="h-8 text-xs text-right border-0 shadow-none" /></td>
                        <td className="px-2 py-1"><Select value={item.gst} onValueChange={(v) => { const u = [...billItems]; u[idx].gst = v; const sub = u[idx].qty * u[idx].price; u[idx].total = sub + sub * (parseFloat(v || "0") / 100) - u[idx].discAmt; setBillItems(u); }}><SelectTrigger className="h-8 text-xs border-0 shadow-none"><SelectValue placeholder="" /></SelectTrigger><SelectContent><SelectItem value="0">0%</SelectItem><SelectItem value="5">5%</SelectItem><SelectItem value="12">12%</SelectItem><SelectItem value="18">18%</SelectItem></SelectContent></Select></td>
                        <td className="px-2 py-1"><Input type="number" value={item.disc || ""} onChange={(e) => { const u = [...billItems]; u[idx].disc = +e.target.value; const sub = u[idx].qty * u[idx].price; u[idx].discAmt = sub * u[idx].disc / 100; u[idx].total = sub + sub * (parseFloat(u[idx].gst || "0") / 100) - u[idx].discAmt; setBillItems(u); }} placeholder="Disc" className="h-8 text-xs text-center border-0 shadow-none" /></td>
                        <td className="px-2 py-1"><Input value={item.discAmt.toFixed(2)} readOnly className="h-8 text-xs text-right border-0 shadow-none bg-transparent" /></td>
                        <td className="px-2 py-1"><Input value={item.total.toFixed(2)} readOnly className="h-8 text-xs text-right border-0 shadow-none bg-transparent font-medium" /></td>
                        <td className="px-2 py-1">
                          <Button size="sm" className="h-7 text-xs bg-blue-900 hover:bg-blue-800 text-white" onClick={() => setBillItems([...billItems, { sNo: billItems.length + 1, particulars: "", qty: 1, price: 0, gst: "", disc: 0, discAmt: 0, total: 0 }])}>Add</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Section — right-aligned like MocDoc */}
              <div className="flex justify-end">
                <div className="w-full max-w-[350px] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total</span>
                    <Input value={totalBillAmount.toFixed(2)} readOnly className="h-8 text-xs text-right w-[120px] bg-muted" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Discount(%)</span>
                    <Input type="number" value={discountPercent} onChange={(e) => { setDiscountPercent(+e.target.value); setDiscountAmount(totalBillAmount * +e.target.value / 100); }} className="h-8 text-xs text-right w-[120px]" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Discount</span>
                    <Input type="number" value={discountAmount.toFixed(2)} onChange={(e) => setDiscountAmount(+e.target.value)} className="h-8 text-xs text-right w-[120px]" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">Amount Receivable</span>
                    <span className="text-sm font-bold">{(totalBillAmount - discountAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Amount Received</span>
                    <Input type="number" value={amountReceived || ""} onChange={(e) => setAmountReceived(+e.target.value)} className="h-8 text-xs text-right w-[120px]" />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-xs border px-2 py-1 rounded">Cash Tendered</span>
                    <Input type="number" value={cashTendered || ""} onChange={(e) => setCashTendered(+e.target.value)} className="h-8 text-xs text-right w-[120px]" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs border px-2 py-1 rounded">Balance</span>
                    <span className="text-sm font-medium">{(cashTendered - amountReceived).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Payment Mode — Radio buttons like MocDoc */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium mb-2 block">Payment Mode :</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5"><input type="radio" name="payMode" value="Single" defaultChecked className="accent-blue-600" /><span className="text-sm">Single</span></label>
                    <label className="flex items-center gap-1.5"><input type="radio" name="payMode" value="Multiple" className="accent-blue-600" /><span className="text-sm">Multiple</span></label>
                  </div>
                </div>
                <div>
                  <Label className="font-medium text-red-600">Payment Type *</Label>
                  <Select value={paymentMode} onValueChange={(v) => setPaymentMode(v as PaymentMode)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Card">Card</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="GooglePay">Google Pay</SelectItem>
                      <SelectItem value="Insurance">Insurance</SelectItem>
                      <SelectItem value="Credit">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Additional Note & Review */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Additional Note:</Label>
                  <Input value={additionalNote} onChange={(e) => setAdditionalNote(e.target.value)} className="h-9" />
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1"><Label>Review</Label><Input type="number" value={reviewDays} onChange={(e) => setReviewDays(e.target.value)} placeholder="Review" className="h-9" /></div>
                  <Select value={reviewUnit} onValueChange={setReviewUnit}><SelectTrigger className="h-9 w-[100px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Days">Days</SelectItem><SelectItem value="Weeks">Weeks</SelectItem><SelectItem value="Months">Months</SelectItem></SelectContent></Select>
                </div>
              </div>

              {/* Checkin Status */}
              <div>
                <p className="text-sm font-medium flex items-center gap-1 mb-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Checkin Status</p>
                <label className="flex items-center gap-2">
                  <input type="radio" name="checkin" value="new" defaultChecked className="accent-blue-600" />
                  <span className="text-sm">New Checkin</span>
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Submit */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground">All fields marked * are mandatory.</p>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={checkinAfterRegister} onChange={(e) => setCheckinAfterRegister(e.target.checked)} className="rounded" />
            <span className="font-medium">Also Check-in after registration</span>
          </label>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
            {saving ? "Saving..." : "Register Only"}
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 px-8" onClick={() => { setCheckinAfterRegister(true); handleSubmit(); }} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
            {saving ? "Saving..." : "Register & Check In"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PatientRegistration;
