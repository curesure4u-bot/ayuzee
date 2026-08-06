import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, ArrowRight, Sparkles, BadgeCheck } from "lucide-react";

interface Step {
  key: string;
  label: string;
  description: string;
  link: string;
  check: (doctor: any) => boolean;
}

const ONBOARDING_STEPS: Step[] = [
  { key: "profile_photo", label: "Add Profile Photo", description: "Upload a professional photo for your public profile", link: "/doctor/profile", check: (d) => !!d?.avatar_url },
  { key: "bio", label: "Write Bio (50+ chars)", description: "A detailed bio helps patients trust you", link: "/doctor/profile", check: (d) => (d?.bio?.length ?? 0) >= 50 },
  { key: "specialization", label: "Set Specialization", description: "Select your area of expertise", link: "/doctor/profile", check: (d) => !!d?.specialization },
  { key: "registration", label: "Add Registration Number", description: "Medical council registration for verification", link: "/doctor/verification", check: (d) => !!d?.registration_number },
  { key: "education", label: "Add Education Details", description: "Your degree, university, and year of passing", link: "/doctor/profile", check: (d) => !!d?.degree || (d?.bio?.length ?? 0) > 100 },
  { key: "consultation_fee", label: "Set Consultation Fee", description: "Enable patients to book consultations", link: "/doctor/profile", check: (d) => (d?.consultation_fee ?? 0) > 0 },
  { key: "video_consult", label: "Enable Video Consultation", description: "Accept teleconsultation appointments", link: "/doctor/profile", check: (d) => !!d?.video_available },
  { key: "first_post", label: "Create Your First Post", description: "Share a clinical insight or case on the feed", link: "/doctor/feed", check: () => false },
  { key: "complete_verification", label: "Submit for Verification", description: "Get the verified badge on your profile", link: "/doctor/verification", check: (d) => !!d?.is_verified },
];

const DoctorOnboardingChecklist = () => {
  const { doctor } = useDoctor();
  const [hasPost, setHasPost] = useState(false);

  useEffect(() => {
    if (!doctor?.user_id) return;
    supabase.from("feed_posts").select("id", { count: "exact", head: true }).eq("author_user_id", doctor.user_id).then(({ count }) => {
      if ((count ?? 0) > 0) setHasPost(true);
    });
  }, [doctor?.user_id]);

  if (!doctor) return null;

  const steps = ONBOARDING_STEPS.map((step) => ({
    ...step,
    done: step.key === "first_post" ? hasPost : step.check(doctor),
  }));

  const completedCount = steps.filter((s) => s.done).length;
  const totalSteps = steps.length;
  const pct = Math.round((completedCount / totalSteps) * 100);
  const allDone = completedCount === totalSteps;

  return (
    <Card className={allDone ? "border-green-200 bg-green-50/30" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {allDone ? <BadgeCheck className="h-5 w-5 text-green-600" /> : <Sparkles className="h-5 w-5 text-primary" />}
            {allDone ? "Profile Complete!" : "Complete Your Profile to Get Listed"}
          </CardTitle>
          <span className="text-sm font-bold text-primary">{completedCount}/{totalSteps}</span>
        </div>
      </CardHeader>
      <CardContent>
        <Progress value={pct} className="h-2.5 mb-4" />
        <p className="text-xs text-muted-foreground mb-4">
          {allDone
            ? "Your profile is fully set up. You're visible on Find Doctors and eligible for all features."
            : `Complete all steps to appear in patient search results and unlock partner features. ${totalSteps - completedCount} steps remaining.`}
        </p>

        <div className="space-y-2">
          {steps.map((step) => (
            <div
              key={step.key}
              className={`flex items-center gap-3 rounded-lg border p-3 transition ${step.done ? "border-green-200 bg-green-50/50" : "hover:bg-muted/50"}`}
            >
              {step.done ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${step.done ? "text-green-800 line-through" : ""}`}>{step.label}</p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
              {!step.done && (
                <Button asChild size="sm" variant="ghost" className="shrink-0 text-xs">
                  <Link to={step.link}><ArrowRight className="h-3.5 w-3.5" /></Link>
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DoctorOnboardingChecklist;
