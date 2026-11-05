import { useState, useEffect } from "react";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { BadgeCheck, Shield, Clock, AlertCircle, Upload, FileText, CheckCircle2, XCircle } from "lucide-react";

const COUNCILS = [
  "Central Council of Indian Medicine (CCIM)",
  "Board of Ayurveda - Maharashtra",
  "Board of Ayurveda - Karnataka",
  "Board of Ayurveda - Kerala",
  "Board of Ayurveda - Gujarat",
  "Board of Ayurveda - Rajasthan",
  "Board of Ayurveda - Madhya Pradesh",
  "Board of Ayurveda - Uttar Pradesh",
  "Board of Ayurveda - Tamil Nadu",
  "Central Council of Homoeopathy",
  "Other State Board",
];

const SYSTEMS = [
  { value: "Ayurveda", label: "Ayurveda" },
  { value: "Siddha", label: "Siddha" },
  { value: "Unani", label: "Unani" },
  { value: "Homeopathy", label: "Homeopathy" },
  { value: "Yoga", label: "Yoga & Naturopathy" },
  { value: "Naturopathy", label: "Naturopathy" },
  { value: "Modern", label: "Modern Medicine" },
];

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-200", label: "Pending Review" },
  under_review: { icon: Shield, color: "text-blue-600 bg-blue-50 border-blue-200", label: "Under Review" },
  verified: { icon: BadgeCheck, color: "text-green-600 bg-green-50 border-green-200", label: "Verified" },
  rejected: { icon: XCircle, color: "text-red-600 bg-red-50 border-red-200", label: "Rejected" },
  expired: { icon: AlertCircle, color: "text-gray-600 bg-gray-50 border-gray-200", label: "Expired" },
};

interface Verification {
  id: string;
  status: string;
  full_name: string;
  registration_number: string;
  registration_council: string;
  council_state: string | null;
  degree: string;
  university: string | null;
  year_of_passing: number | null;
  system_of_medicine: string;
  badge_level: string;
  rejection_reason: string | null;
  verified_at: string | null;
  created_at: string;
}

const DoctorVerification = () => {
  const { doctor, userId } = useDoctor();
  const [verification, setVerification] = useState<Verification | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    registration_number: "",
    registration_council: "",
    council_state: "",
    degree: "",
    university: "",
    year_of_passing: "",
    system_of_medicine: "Ayurveda",
  });

  useEffect(() => {
    if (!userId) return;
    loadVerification();
  }, [userId]);

  useEffect(() => {
    if (doctor && !verification) {
      setForm((f) => ({
        ...f,
        full_name: doctor.full_name ?? "",
        registration_number: doctor.registration_number ?? "",
      }));
    }
  }, [doctor, verification]);

  const loadVerification = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("doctor_verifications")
      .select("*")
      .eq("doctor_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setVerification(data as Verification);
      setForm({
        full_name: data.full_name,
        registration_number: data.registration_number,
        registration_council: data.registration_council,
        council_state: data.council_state ?? "",
        degree: data.degree,
        university: data.university ?? "",
        year_of_passing: data.year_of_passing?.toString() ?? "",
        system_of_medicine: data.system_of_medicine,
      });
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!form.full_name || !form.registration_number || !form.registration_council || !form.degree) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    const payload = {
      doctor_id: userId,
      full_name: form.full_name,
      registration_number: form.registration_number,
      registration_council: form.registration_council,
      council_state: form.council_state || null,
      degree: form.degree,
      university: form.university || null,
      year_of_passing: form.year_of_passing ? parseInt(form.year_of_passing) : null,
      system_of_medicine: form.system_of_medicine,
      status: "pending",
    };

    let result;
    if (verification && verification.status === "rejected") {
      result = await supabase
        .from("doctor_verifications")
        .update({ ...payload, status: "pending", rejection_reason: null })
        .eq("id", verification.id);
    } else {
      result = await supabase.from("doctor_verifications").insert(payload);
    }

    if (result.error) {
      toast.error("Failed to submit verification: " + result.error.message);
    } else {
      toast.success("Verification submitted successfully! We'll review within 48 hours.");
      loadVerification();
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

  const statusConfig = verification ? STATUS_CONFIG[verification.status] : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Doctor Verification</h1>
        <p className="text-muted-foreground">
          Get your credentials verified to build trust with patients and appear as a verified doctor on the platform.
        </p>
      </div>

      {/* Current Status */}
      {verification && statusConfig && (
        <Card className={`border ${statusConfig.color}`}>
          <CardContent className="flex items-center gap-4 p-6">
            <statusConfig.icon className="h-10 w-10" />
            <div className="flex-1">
              <h3 className="font-semibold">{statusConfig.label}</h3>
              {verification.status === "verified" && (
                <p className="text-sm text-muted-foreground">
                  Verified on {new Date(verification.verified_at!).toLocaleDateString("en-IN")} · Badge: {verification.badge_level}
                </p>
              )}
              {verification.status === "rejected" && verification.rejection_reason && (
                <p className="text-sm text-red-600 mt-1">Reason: {verification.rejection_reason}</p>
              )}
              {verification.status === "pending" && (
                <p className="text-sm text-muted-foreground">Submitted on {new Date(verification.created_at).toLocaleDateString("en-IN")}. Review within 48 hours.</p>
              )}
            </div>
            {verification.status === "verified" && (
              <Badge variant="outline" className="border-green-300 bg-green-50 text-green-700 gap-1">
                <BadgeCheck className="h-3.5 w-3.5" /> Verified
              </Badge>
            )}
          </CardContent>
        </Card>
      )}

      {/* Verification Benefits */}
      {(!verification || verification.status === "rejected") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Why Get Verified?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: BadgeCheck, text: "Verified badge on your profile" },
                { icon: CheckCircle2, text: "Higher visibility in search results" },
                { icon: FileText, text: "Publish articles & case studies" },
                { icon: Shield, text: "Access to premium platform features" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                  <item.icon className="h-5 w-5 text-primary" />
                  <span className="text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification Form */}
      {(!verification || verification.status === "rejected") && (
        <Card>
          <CardHeader>
            <CardTitle>Submit Credentials</CardTitle>
            <CardDescription>
              Provide your registration details. All information is kept confidential and verified against medical council records.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name (as on certificate) *</Label>
                <Input
                  id="full_name"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Dr. Full Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="system">System of Medicine *</Label>
                <Select value={form.system_of_medicine} onValueChange={(v) => setForm({ ...form, system_of_medicine: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SYSTEMS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="reg_number">Registration Number *</Label>
                <Input
                  id="reg_number"
                  value={form.registration_number}
                  onChange={(e) => setForm({ ...form, registration_number: e.target.value })}
                  placeholder="e.g., 12345/A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="council">Registration Council *</Label>
                <Select value={form.registration_council} onValueChange={(v) => setForm({ ...form, registration_council: v })}>
                  <SelectTrigger><SelectValue placeholder="Select council" /></SelectTrigger>
                  <SelectContent>
                    {COUNCILS.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="degree">Degree *</Label>
                <Input
                  id="degree"
                  value={form.degree}
                  onChange={(e) => setForm({ ...form, degree: e.target.value })}
                  placeholder="e.g., BAMS, MD (Kayachikitsa)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="university">University</Label>
                <Input
                  id="university"
                  value={form.university}
                  onChange={(e) => setForm({ ...form, university: e.target.value })}
                  placeholder="e.g., Gujarat Ayurveda University"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="year">Year of Passing</Label>
                <Input
                  id="year"
                  type="number"
                  value={form.year_of_passing}
                  onChange={(e) => setForm({ ...form, year_of_passing: e.target.value })}
                  placeholder="e.g., 2015"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Council State</Label>
                <Input
                  id="state"
                  value={form.council_state}
                  onChange={(e) => setForm({ ...form, council_state: e.target.value })}
                  placeholder="e.g., Maharashtra"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSubmit} disabled={submitting} size="lg">
                {submitting ? "Submitting..." : "Submit for Verification"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Already Verified — Summary */}
      {verification && verification.status === "verified" && (
        <Card>
          <CardHeader>
            <CardTitle>Verification Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div><dt className="text-xs text-muted-foreground">Name</dt><dd className="font-medium">{verification.full_name}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Registration No.</dt><dd className="font-medium">{verification.registration_number}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Council</dt><dd className="font-medium">{verification.registration_council}</dd></div>
              <div><dt className="text-xs text-muted-foreground">System</dt><dd className="font-medium">{verification.system_of_medicine}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Degree</dt><dd className="font-medium">{verification.degree}</dd></div>
              <div><dt className="text-xs text-muted-foreground">University</dt><dd className="font-medium">{verification.university ?? "—"}</dd></div>
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DoctorVerification;
