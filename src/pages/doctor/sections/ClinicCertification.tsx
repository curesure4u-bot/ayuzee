import { useState, useEffect } from "react";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Building2,
  Shield,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  Award,
  Loader2,
  Star,
  Calendar,
} from "lucide-react";

const TIER_CONFIG: Record<string, { label: string; color: string; icon: string; minScore: number }> = {
  bronze: { label: "Bronze", color: "bg-orange-100 text-orange-700 border-orange-200", icon: "🥉", minScore: 0 },
  silver: { label: "Silver", color: "bg-gray-100 text-gray-700 border-gray-300", icon: "🥈", minScore: 50 },
  gold: { label: "Gold", color: "bg-amber-100 text-amber-700 border-amber-300", icon: "🥇", minScore: 75 },
  platinum: { label: "Platinum", color: "bg-violet-100 text-violet-700 border-violet-300", icon: "💎", minScore: 90 },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; description: string }> = {
  applied: { label: "Application Submitted", color: "text-blue-600 bg-blue-50", description: "Your application is being processed" },
  documents_pending: { label: "Documents Pending", color: "text-amber-600 bg-amber-50", description: "Please upload missing documents" },
  inspection_scheduled: { label: "Inspection Scheduled", color: "text-indigo-600 bg-indigo-50", description: "An inspector will visit your clinic" },
  inspection_done: { label: "Inspection Complete", color: "text-purple-600 bg-purple-50", description: "Report is being prepared" },
  certified: { label: "Certified", color: "text-green-600 bg-green-50", description: "Your clinic is Ayuzee Certified!" },
  rejected: { label: "Rejected", color: "text-red-600 bg-red-50", description: "Application did not meet requirements" },
  expired: { label: "Expired", color: "text-gray-600 bg-gray-50", description: "Certification has expired, please renew" },
  suspended: { label: "Suspended", color: "text-red-600 bg-red-50", description: "Certification suspended pending review" },
};

interface Certification {
  id: string;
  clinic_name: string;
  address: string;
  city: string;
  state: string;
  pincode: string | null;
  phone: string | null;
  email: string | null;
  registration_number: string | null;
  systems_practiced: string[];
  staff_count: number;
  doctor_count: number;
  has_pharmacy: boolean;
  has_panchakarma: boolean;
  has_lab: boolean;
  tier: string;
  certification_status: string;
  inspection_date: string | null;
  inspection_score: number | null;
  certified_at: string | null;
  certificate_expiry: string | null;
  rejection_reason: string | null;
  applied_at: string;
}

const ClinicCertification = () => {
  const { userId } = useDoctor();
  const [certification, setCertification] = useState<Certification | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    clinic_name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    email: "",
    registration_number: "",
    systems_practiced: "Ayurveda",
    staff_count: "1",
    doctor_count: "1",
    has_pharmacy: false,
    has_panchakarma: false,
    has_lab: false,
  });

  useEffect(() => {
    if (!userId) return;
    loadCertification();
  }, [userId]);

  const loadCertification = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("clinic_certifications")
      .select("*")
      .eq("owner_id", userId)
      .order("applied_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) setCertification(data as Certification);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!form.clinic_name || !form.address || !form.city || !form.state) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);

    const payload = {
      owner_id: userId,
      clinic_name: form.clinic_name,
      address: form.address,
      city: form.city,
      state: form.state,
      pincode: form.pincode || null,
      phone: form.phone || null,
      email: form.email || null,
      registration_number: form.registration_number || null,
      systems_practiced: form.systems_practiced.split(",").map((s) => s.trim()),
      staff_count: parseInt(form.staff_count) || 1,
      doctor_count: parseInt(form.doctor_count) || 1,
      has_pharmacy: form.has_pharmacy,
      has_panchakarma: form.has_panchakarma,
      has_lab: form.has_lab,
      certification_status: "applied",
    };

    const { error } = await supabase.from("clinic_certifications").insert(payload);
    if (error) {
      toast.error("Failed to submit: " + error.message);
    } else {
      toast.success("Certification application submitted! We'll contact you within 5 business days.");
      loadCertification();
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const statusConfig = certification ? STATUS_CONFIG[certification.certification_status] : null;
  const tierConfig = certification ? TIER_CONFIG[certification.tier] : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Clinic Certification</h1>
        <p className="text-muted-foreground">Get your clinic certified by Ayuzee to gain premium visibility and patient trust.</p>
      </div>

      {/* Current Status */}
      {certification && statusConfig && (
        <Card className={statusConfig.color}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {certification.certification_status === "certified" ? (
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                ) : (
                  <Clock className="h-10 w-10" />
                )}
                <div>
                  <h3 className="font-semibold">{statusConfig.label}</h3>
                  <p className="text-sm text-muted-foreground">{statusConfig.description}</p>
                  {certification.certification_status === "certified" && certification.certificate_expiry && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Expires: {new Date(certification.certificate_expiry).toLocaleDateString("en-IN")}
                    </p>
                  )}
                </div>
              </div>
              {tierConfig && certification.certification_status === "certified" && (
                <div className={`rounded-lg border px-4 py-2 text-center ${tierConfig.color}`}>
                  <span className="text-2xl">{tierConfig.icon}</span>
                  <p className="text-xs font-semibold mt-1">{tierConfig.label} Tier</p>
                </div>
              )}
            </div>

            {certification.rejection_reason && (
              <div className="mt-4 rounded-md bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-700"><AlertCircle className="inline h-4 w-4 mr-1" />Reason: {certification.rejection_reason}</p>
              </div>
            )}

            {certification.inspection_score !== null && (
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span>Inspection Score</span>
                  <span className="font-semibold">{certification.inspection_score}/100</span>
                </div>
                <Progress value={certification.inspection_score} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Certified Clinic Details */}
      {certification && certification.certification_status === "certified" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" /> {certification.clinic_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div><dt className="text-xs text-muted-foreground">Address</dt><dd className="text-sm">{certification.address}, {certification.city}, {certification.state}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Systems</dt><dd className="text-sm">{certification.systems_practiced.join(", ")}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Doctors</dt><dd className="text-sm">{certification.doctor_count}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Staff</dt><dd className="text-sm">{certification.staff_count}</dd></div>
              <div>
                <dt className="text-xs text-muted-foreground">Facilities</dt>
                <dd className="flex gap-2 mt-1">
                  {certification.has_pharmacy && <Badge variant="outline" className="text-[10px]">Pharmacy</Badge>}
                  {certification.has_panchakarma && <Badge variant="outline" className="text-[10px]">Panchakarma</Badge>}
                  {certification.has_lab && <Badge variant="outline" className="text-[10px]">Lab</Badge>}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Benefits */}
      {!certification && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-primary" /> Certification Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Premium listing in clinic search",
                "Ayuzee Certified badge displayed",
                "Priority patient referrals",
                "Access to bulk medicine procurement",
                "Quality assurance branding kit",
                "Analytics & growth dashboard",
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border p-3">
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3">Tier System</h4>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(TIER_CONFIG).map(([key, config]) => (
                  <div key={key} className={`rounded-lg border p-3 text-center ${config.color}`}>
                    <span className="text-xl">{config.icon}</span>
                    <p className="text-xs font-semibold mt-1">{config.label}</p>
                    <p className="text-[10px] text-muted-foreground">{config.minScore}+ score</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Application Form */}
      {(!certification || ["rejected", "expired"].includes(certification.certification_status)) && (
        <Card>
          <CardHeader>
            <CardTitle>Apply for Certification</CardTitle>
            <CardDescription>Fill in your clinic details. Our team will review and schedule an inspection.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Clinic Name *</Label>
                <Input value={form.clinic_name} onChange={(e) => setForm({ ...form, clinic_name: e.target.value })} placeholder="e.g., Ayush Wellness Clinic" />
              </div>
              <div className="space-y-2">
                <Label>Registration Number</Label>
                <Input value={form.registration_number} onChange={(e) => setForm({ ...form, registration_number: e.target.value })} placeholder="Clinic registration number" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Address *</Label>
              <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Full address" rows={2} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>City *</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" />
              </div>
              <div className="space-y-2">
                <Label>State *</Label>
                <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="State" />
              </div>
              <div className="space-y-2">
                <Label>Pincode</Label>
                <Input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} placeholder="110001" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="clinic@example.com" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Systems Practiced (comma separated)</Label>
              <Input value={form.systems_practiced} onChange={(e) => setForm({ ...form, systems_practiced: e.target.value })} placeholder="Ayurveda, Panchakarma, Yoga" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Number of Doctors</Label>
                <Input type="number" min="1" value={form.doctor_count} onChange={(e) => setForm({ ...form, doctor_count: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Total Staff</Label>
                <Input type="number" min="1" value={form.staff_count} onChange={(e) => setForm({ ...form, staff_count: e.target.value })} />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Facilities Available</Label>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={form.has_pharmacy} onCheckedChange={(v) => setForm({ ...form, has_pharmacy: v })} />
                  <Label className="text-sm">In-house Pharmacy</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.has_panchakarma} onCheckedChange={(v) => setForm({ ...form, has_panchakarma: v })} />
                  <Label className="text-sm">Panchakarma Unit</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.has_lab} onCheckedChange={(v) => setForm({ ...form, has_lab: v })} />
                  <Label className="text-sm">Diagnostic Lab</Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSubmit} disabled={submitting} size="lg">
                {submitting ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Shield className="mr-1 h-4 w-4" />}
                Apply for Certification
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClinicCertification;
