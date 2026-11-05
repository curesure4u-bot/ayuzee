import { useEffect, useMemo, useState } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Link, useNavigate } from "react-router-dom";
import { Bot, Briefcase, IndianRupee, MapPin, ShieldCheck, Sparkles, ThumbsDown, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

/* ─── Types ─── */
type JobListing = {
  id: string;
  organization_name: string;
  organization_type: string | null;
  job_title: string;
  specialization: string | null;
  department: string | null;
  location_city: string | null;
  location_state: string | null;
  job_type: string | null;
  experience_years_min: number | null;
  salary_min: number | null;
  salary_max: number | null;
  description: string | null;
  apply_email: string | null;
  apply_url: string | null;
  is_verified_employer: boolean | null;
  is_direct_employer: boolean | null;
  is_government: boolean | null;
  source: string | null;
  created_at: string;
};

type UserProfile = {
  specialization: string | null;
  department: string | null;
  location_state: string | null;
  location_city: string | null;
  experience_years: number | null;
  preferred_job_type: string | null;
};

type ScoredJob = JobListing & {
  match_score: number;
  match_reasons: string[];
};

/* ─── Scoring Logic (client-side AI-lite matching) ─── */
function scoreJob(job: JobListing, profile: UserProfile): ScoredJob {
  let score = 0;
  const reasons: string[] = [];

  // Department/specialization match (strongest signal)
  if (profile.department && job.department) {
    if (job.department.toLowerCase().includes(profile.department.toLowerCase()) ||
        profile.department.toLowerCase().includes(job.department.toLowerCase())) {
      score += 35;
      reasons.push("Department match");
    }
  }

  if (profile.specialization && job.specialization) {
    const profileSpecs = profile.specialization.toLowerCase().split(",").map((s) => s.trim());
    const jobSpecs = job.specialization.toLowerCase().split(",").map((s) => s.trim());
    const overlap = profileSpecs.some((ps) => jobSpecs.some((js) => js.includes(ps) || ps.includes(js)));
    if (overlap) {
      score += 25;
      reasons.push("Specialization match");
    }
  }

  // Location match
  if (profile.location_state && job.location_state) {
    if (job.location_state.toLowerCase() === profile.location_state.toLowerCase()) {
      score += 20;
      reasons.push("Same state");
    }
    if (profile.location_city && job.location_city &&
        job.location_city.toLowerCase() === profile.location_city.toLowerCase()) {
      score += 10;
      reasons.push("Same city");
    }
  }

  // Experience fit
  if (profile.experience_years !== null && job.experience_years_min !== null) {
    if (profile.experience_years >= job.experience_years_min) {
      score += 10;
      reasons.push("Experience fit");
    }
  }

  // Job type preference
  if (profile.preferred_job_type && job.job_type === profile.preferred_job_type) {
    score += 5;
    reasons.push("Preferred job type");
  }

  // Bonus for verified employers
  if (job.is_verified_employer) {
    score += 5;
    reasons.push("Verified employer");
  }

  // Bonus for direct hire
  if (job.is_direct_employer) {
    score += 3;
  }

  // Recency bonus (jobs posted within last 7 days)
  const daysSincePosted = Math.floor((Date.now() - new Date(job.created_at).getTime()) / 86_400_000);
  if (daysSincePosted <= 7) {
    score += 5;
    reasons.push("Recently posted");
  }

  // Cap at 100
  score = Math.min(100, score);

  return { ...job, match_score: score, match_reasons: reasons };
}

/* ─── Component ─── */
const JobAIMatch = () => {
  usePageSEO({ title: "AI Job Match — Ayuzee" });
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [profileMissing, setProfileMissing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      navigate("/auth", { replace: true });
      return;
    }
    const uid = session.session.user.id;
    setUserId(uid);

    // Try to load user profile from multiple sources
    const [profileRes, doctorRes, studentRes, jobsRes, dismissedRes] = await Promise.all([
      (supabase as any).from("profiles").select("specialization, location_state, location_city").eq("user_id", uid).maybeSingle(),
      (supabase as any).from("doctor_profiles").select("specialization, location_state, location_city, experience_years").eq("user_id", uid).maybeSingle(),
      (supabase as any).from("student_profiles").select("specialization, preferred_state").eq("user_id", uid).maybeSingle(),
      (supabase as any).from("job_listings").select("*").eq("is_active", true).eq("is_approved", true).order("created_at", { ascending: false }).limit(100),
      (supabase as any).from("job_ai_recommendations").select("job_listing_id").eq("user_id", uid).eq("is_dismissed", true),
    ]);

    // Build unified profile from available data
    const docData = doctorRes.data;
    const stuData = studentRes.data;
    const profData = profileRes.data;

    const userProfile: UserProfile = {
      specialization: docData?.specialization || stuData?.specialization || profData?.specialization || null,
      department: docData?.specialization || stuData?.specialization || null,
      location_state: docData?.location_state || stuData?.preferred_state || profData?.location_state || null,
      location_city: docData?.location_city || profData?.location_city || null,
      experience_years: docData?.experience_years || null,
      preferred_job_type: null,
    };

    if (!userProfile.specialization && !userProfile.location_state) {
      setProfileMissing(true);
    }

    setProfile(userProfile);
    setJobs(jobsRes.data ?? []);
    setDismissedIds(new Set((dismissedRes.data ?? []).map((d: any) => d.job_listing_id)));
    setLoading(false);
  };

  const scoredJobs = useMemo(() => {
    if (!profile || !jobs.length) return [];
    return jobs
      .filter((j) => !dismissedIds.has(j.id))
      .map((job) => scoreJob(job, profile))
      .filter((j) => j.match_score > 0)
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 20);
  }, [jobs, profile, dismissedIds]);

  const dismissJob = async (jobId: string) => {
    setDismissedIds((prev) => new Set([...prev, jobId]));
    if (userId) {
      await (supabase as any).from("job_ai_recommendations").upsert({
        user_id: userId,
        job_listing_id: jobId,
        match_score: 0,
        is_dismissed: true,
      }, { onConflict: "user_id,job_listing_id" });
    }
    toast.success("Job dismissed from recommendations");
  };

  const applyHref = (job: JobListing) =>
    job.apply_url || (job.apply_email ? `mailto:${job.apply_email}?subject=${encodeURIComponent(`Application for ${job.job_title}`)}` : "#");

  const matchColor = (score: number) => {
    if (score >= 70) return "text-green-700 bg-green-50 border-green-200";
    if (score >= 40) return "text-amber-700 bg-amber-50 border-amber-200";
    return "text-slate-600 bg-slate-50 border-slate-200";
  };

  const progressColor = (score: number) => {
    if (score >= 70) return "[&>div]:bg-green-500";
    if (score >= 40) return "[&>div]:bg-amber-500";
    return "[&>div]:bg-slate-400";
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="text-center">
          <Sparkles className="mx-auto h-8 w-8 animate-pulse text-primary" />
          <p className="mt-3 text-muted-foreground">AI is analyzing jobs for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <main>
        {/* Header */}
        <section className="border-b border-border bg-background">
          <div className="container py-12">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <Badge variant="secondary" className="mb-3 gap-1">
                  <Sparkles className="h-3 w-3" /> AI-Powered
                </Badge>
                <h1 className="font-display text-4xl font-semibold md:text-5xl">Smart Job Match</h1>
                <p className="mt-3 text-lg text-muted-foreground">
                  AI-recommended jobs based on your specialization, location, and experience.
                </p>
              </div>
              <div className="flex gap-3">
                <Button asChild variant="outline"><Link to="/jobs">Browse All Jobs</Link></Button>
                <Button asChild variant="hero"><Link to="/jobs/alerts">Set Alerts</Link></Button>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-8">
          {/* Profile missing notice */}
          {profileMissing && (
            <Card className="mb-6 border-amber-200 bg-amber-50">
              <CardContent className="flex items-start gap-3 p-5">
                <Bot className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900">Complete your profile for better matches</p>
                  <p className="mt-1 text-sm text-amber-800">
                    We couldn't find specialization or location data in your profile. Update your profile to get personalized AI recommendations.
                  </p>
                  <Button asChild variant="outline" size="sm" className="mt-3">
                    <Link to="/dashboard?tab=profile">Update Profile</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Profile summary card */}
          {profile && !profileMissing && (
            <Card className="mb-6 border-primary/20 bg-primary/5">
              <CardContent className="flex flex-wrap items-center gap-4 p-4">
                <Bot className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">Matching based on:</span>
                {profile.department && <Badge variant="outline" className="border-primary/30">{profile.department}</Badge>}
                {profile.location_state && <Badge variant="outline" className="border-primary/30">{profile.location_state}</Badge>}
                {profile.experience_years !== null && <Badge variant="outline" className="border-primary/30">{profile.experience_years}+ yrs exp</Badge>}
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {scoredJobs.length === 0 ? (
            <Card className="p-12 text-center">
              <Sparkles className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h2 className="mt-4 font-display text-xl font-semibold">No AI matches found</h2>
              <p className="mt-2 text-muted-foreground">
                {profileMissing
                  ? "Complete your profile so we can find relevant jobs for you."
                  : "No jobs currently match your profile. Try browsing all jobs or create an alert."}
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button asChild variant="outline"><Link to="/jobs">Browse All Jobs</Link></Button>
                <Button asChild variant="hero"><Link to="/jobs/alerts">Create Alert</Link></Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              <p className="text-sm text-muted-foreground">{scoredJobs.length} jobs matched your profile</p>
              {scoredJobs.map((job) => (
                <Card key={job.id} className="transition-smooth hover:shadow-lg">
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        {/* Match score + badges row */}
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${matchColor(job.match_score)}`}>
                            <Sparkles className="h-3 w-3" />
                            {job.match_score}% match
                          </div>
                          {job.is_verified_employer && (
                            <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700 gap-1">
                              <ShieldCheck className="h-3 w-3" />Verified
                            </Badge>
                          )}
                          {job.is_government && (
                            <Badge variant="outline" className="border-purple-300 bg-purple-50 text-purple-700">Govt</Badge>
                          )}
                          {job.is_direct_employer === true && (
                            <Badge variant="outline" className="border-green-300 bg-green-50 text-green-700">Direct Hire</Badge>
                          )}
                          {job.job_type && (
                            <Badge variant="secondary">{job.job_type.replace("_", "-")}</Badge>
                          )}
                        </div>

                        {/* Job info */}
                        <h2 className="font-display text-xl font-semibold">{job.job_title}</h2>
                        <p className="mt-1 font-medium text-foreground/80">{job.organization_name}</p>
                        {job.department && <p className="mt-1 text-sm text-primary/80">{job.department}</p>}

                        <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {[job.location_city, job.location_state].filter(Boolean).join(", ") || "Flexible"}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Briefcase className="h-3.5 w-3.5" />
                            {job.experience_years_min ?? 0}+ years
                          </span>
                          {(job.salary_min || job.salary_max) && (
                            <span className="inline-flex items-center gap-1">
                              <IndianRupee className="h-3.5 w-3.5" />
                              {job.salary_min ? `${(job.salary_min / 1000).toFixed(0)}k` : "Open"} - {job.salary_max ? `${(job.salary_max / 1000).toFixed(0)}k` : "Open"}
                            </span>
                          )}
                        </div>

                        {/* Match reasons */}
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {job.match_reasons.map((reason) => (
                            <span key={reason} className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                              {reason}
                            </span>
                          ))}
                        </div>

                        {/* Score bar */}
                        <div className="mt-3 max-w-xs">
                          <Progress value={job.match_score} className={`h-1.5 ${progressColor(job.match_score)}`} />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 lg:flex-col">
                        <Button asChild variant="hero" size="sm">
                          <a href={applyHref(job)} target={job.apply_url ? "_blank" : undefined} rel="noreferrer">
                            Apply Now
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => dismissJob(job.id)}
                        >
                          <ThumbsDown className="h-4 w-4 mr-1" /> Not for me
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* How it works */}
          <Card className="mt-8 border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="text-blue-900 text-base">How AI Job Match Works</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3 text-sm text-blue-800">
              <div>
                <p className="font-semibold">1. Profile Analysis</p>
                <p className="text-xs text-blue-700 mt-1">We read your specialization, location, and experience from your Ayuzee profile.</p>
              </div>
              <div>
                <p className="font-semibold">2. Smart Scoring</p>
                <p className="text-xs text-blue-700 mt-1">Each job is scored on department match, location proximity, experience fit, and employer quality.</p>
              </div>
              <div>
                <p className="font-semibold">3. Personalized Feed</p>
                <p className="text-xs text-blue-700 mt-1">Top matches appear first. Dismiss jobs you don't want to improve future recommendations.</p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default JobAIMatch;
