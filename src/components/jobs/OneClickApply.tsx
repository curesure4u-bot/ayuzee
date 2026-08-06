import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Loader2, Rocket, UserCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SeekerProfile = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  department: string | null;
  experience_years: number;
  resume_url: string | null;
  profile_completeness: number;
};

type Props = {
  jobId: string;
  jobTitle: string;
  organizationName: string;
  disabled?: boolean;
  onApplied?: () => void;
};

export const OneClickApply = ({ jobId, jobTitle, organizationName, disabled, onApplied }: Props) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<SeekerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    checkProfile();
  }, []);

  const checkProfile = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { setLoading(false); return; }
    const uid = session.session.user.id;
    setUserId(uid);

    // Check if already applied
    const { data: existingApp } = await (supabase as any)
      .from("job_applications")
      .select("id")
      .eq("user_id", uid)
      .eq("job_listing_id", jobId)
      .maybeSingle();

    if (existingApp) { setApplied(true); setLoading(false); return; }

    // Load seeker profile
    const { data } = await (supabase as any)
      .from("job_seeker_profiles")
      .select("id, full_name, email, phone, department, experience_years, resume_url, profile_completeness")
      .eq("user_id", uid)
      .maybeSingle();

    setProfile(data);
    setLoading(false);
  };

  const handleApply = async () => {
    if (!userId) {
      toast.error("Please sign in to apply");
      return;
    }

    if (!profile) {
      setShowPrompt(true);
      return;
    }

    if (profile.profile_completeness < 40) {
      setShowPrompt(true);
      return;
    }

    // One-click apply
    setApplying(true);
    const { error } = await (supabase as any).from("job_applications").insert({
      user_id: userId,
      job_listing_id: jobId,
      seeker_profile_id: profile.id,
      applicant_name: profile.full_name,
      applicant_email: profile.email,
      applicant_phone: profile.phone,
      resume_url: profile.resume_url,
      status: "applied",
    });

    setApplying(false);
    if (error) {
      if (error.code === "23505") {
        toast.error("You've already applied to this job");
        setApplied(true);
      } else {
        toast.error(error.message);
      }
      return;
    }

    setApplied(true);
    toast.success(`Applied to "${jobTitle}" at ${organizationName}!`);
    onApplied?.();
  };

  if (loading) {
    return <Button variant="hero" size="sm" disabled><Loader2 className="h-4 w-4 animate-spin" /></Button>;
  }

  if (applied || disabled) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-1.5 text-green-700 border-green-300 bg-green-50">
        <CheckCircle2 className="h-4 w-4" /> Applied
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="hero"
        onClick={handleApply}
        disabled={applying}
        className="gap-1.5"
      >
        {applying ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Applying...</>
        ) : (
          <><Rocket className="h-4 w-4" /> Quick Apply</>
        )}
      </Button>

      {/* No profile or incomplete profile prompt */}
      <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-primary" />
              {profile ? "Complete Your Profile" : "Create Your Job Profile"}
            </DialogTitle>
            <DialogDescription>
              {profile
                ? `Your profile is ${profile.profile_completeness}% complete. Add more details for a stronger application.`
                : "Create a job seeker profile to apply with one click. Employers will see your qualifications instantly."}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
            <p className="font-medium text-primary mb-2">What's in your profile?</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Your degree, experience & specialization</li>
              <li>• Skills & registration number</li>
              <li>• Expected salary & preferred locations</li>
              <li>• Resume / CV upload</li>
            </ul>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowPrompt(false)}>Later</Button>
            <Button variant="hero" asChild>
              <Link to="/jobs/profile">{profile ? "Complete Profile" : "Create Profile"}</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
