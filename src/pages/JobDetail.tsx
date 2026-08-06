import { useEffect, useState } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Link, useParams } from "react-router-dom";
import { Briefcase, Building2, CalendarDays, Clock, ExternalLink, IndianRupee, Landmark, MapPin, Share2, ShieldCheck, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OneClickApply } from "@/components/jobs/OneClickApply";

type JobFull = {
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
  requirements: string | null;
  apply_email: string | null;
  apply_url: string | null;
  created_at: string;
  expires_at: string | null;
  is_direct_employer: boolean | null;
  agency_name: string | null;
  is_verified_employer: boolean | null;
  is_government: boolean | null;
  government_body: string | null;
  source: string | null;
  vacancies: number | null;
  poster_type: string | null;
};

type RelatedJob = {
  id: string;
  job_title: string;
  organization_name: string;
  location_state: string | null;
  job_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
};

const jobTypeLabels: Record<string, string> = {
  full_time: "Full-time", part_time: "Part-time", contractual: "Contractual",
  visiting: "Visiting", internship: "Internship",
};

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

const daysAgo = (iso: string) => {
  const days = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
  if (days === 0) return "Posted today";
  if (days === 1) return "Posted 1 day ago";
  return `Posted ${days} days ago`;
};

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<JobFull | null>(null);
  const [related, setRelated] = useState<RelatedJob[]>([]);
  const [loading, setLoading] = useState(true);

  usePageSEO({
    title: job ? `${job.job_title} at ${job.organization_name} — Ayuzee Jobs` : "Job Detail — Ayuzee",
  });

  useEffect(() => {
    if (!id) return;
    loadJob(id);
  }, [id]);

  const loadJob = async (jobId: string) => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("job_listings")
      .select("*")
      .eq("id", jobId)
      .eq("is_active", true)
      .eq("is_approved", true)
      .maybeSingle();

    if (data) {
      setJob(data);
      loadRelated(data);
    }
    setLoading(false);
  };

  const loadRelated = async (currentJob: JobFull) => {
    const { data } = await (supabase as any)
      .from("job_listings")
      .select("id, job_title, organization_name, location_state, job_type, salary_min, salary_max")
      .eq("is_active", true)
      .eq("is_approved", true)
      .neq("id", currentJob.id)
      .or(`department.eq.${currentJob.department},location_state.eq.${currentJob.location_state}`)
      .limit(5);
    setRelated(data ?? []);
  };

  const shareUrl = job ? `https://ayuzee.com/jobs/${job.id}` : "";
  const linkedInShare = job
    ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    : "#";

  if (loading) {
    return <div className="min-h-[60vh] grid place-items-center text-muted-foreground">Loading job details...</div>;
  }

  if (!job) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="text-center">
          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h2 className="mt-4 font-display text-xl font-semibold">Job not found</h2>
          <p className="mt-2 text-muted-foreground">This job may have been removed or expired.</p>
          <Button asChild variant="hero" className="mt-6"><Link to="/jobs">Browse All Jobs</Link></Button>
        </div>
      </div>
    );
  }

  // Google Jobs JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.job_title,
    description: job.description || `${job.job_title} at ${job.organization_name}`,
    identifier: { "@type": "PropertyValue", name: "Ayuzee", value: job.id },
    datePosted: job.created_at?.split("T")[0],
    ...(job.expires_at && { validThrough: job.expires_at }),
    employmentType: job.job_type === "full_time" ? "FULL_TIME" : job.job_type === "part_time" ? "PART_TIME" : job.job_type === "internship" ? "INTERN" : "CONTRACTOR",
    hiringOrganization: {
      "@type": "Organization",
      name: job.organization_name,
      sameAs: "https://ayuzee.com",
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location_city || "",
        addressRegion: job.location_state || "",
        addressCountry: "IN",
      },
    },
    ...(job.salary_min && {
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: "INR",
        value: {
          "@type": "QuantitativeValue",
          minValue: job.salary_min,
          maxValue: job.salary_max || job.salary_min,
          unitText: "MONTH",
        },
      },
    }),
    industry: "AYUSH Healthcare",
    occupationalCategory: job.department || "Healthcare",
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* JSON-LD for Google Jobs */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main>
        {/* Header */}
        <section className="border-b border-border bg-background">
          <div className="container py-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                {/* Breadcrumb */}
                <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Link to="/jobs" className="hover:text-primary">Jobs</Link>
                  <span>/</span>
                  <span className="truncate">{job.job_title}</span>
                </div>

                {/* Badges */}
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {job.job_type && <Badge variant="secondary">{jobTypeLabels[job.job_type] ?? job.job_type}</Badge>}
                  {job.is_direct_employer === true && <Badge variant="outline" className="border-green-300 bg-green-50 text-green-700">Direct Hire</Badge>}
                  {job.is_direct_employer === false && <Badge variant="outline" className="border-orange-300 bg-orange-50 text-orange-700">Via Agency{job.agency_name ? `: ${job.agency_name}` : ""}</Badge>}
                  {job.is_verified_employer && <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700 gap-1"><ShieldCheck className="h-3 w-3" />Verified Employer</Badge>}
                  {job.is_government && <Badge variant="outline" className="border-purple-300 bg-purple-50 text-purple-700 gap-1"><Landmark className="h-3 w-3" />Government{job.government_body ? ` · ${job.government_body}` : ""}</Badge>}
                  {job.source && job.source !== "direct" && <Badge variant="outline" className="border-slate-300 bg-slate-50 text-slate-600 gap-1"><ExternalLink className="h-3 w-3" />{job.source.replace("_", " ")}</Badge>}
                </div>

                <h1 className="font-display text-3xl font-bold md:text-4xl">{job.job_title}</h1>
                <p className="mt-2 text-lg font-medium text-foreground/80">{job.organization_name}</p>
                {job.department && <p className="mt-1 text-primary/80">{job.department}</p>}

                {/* Meta info */}
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{[job.location_city, job.location_state].filter(Boolean).join(", ") || "India / Remote"}</span>
                  <span className="inline-flex items-center gap-1.5"><Briefcase className="h-4 w-4" />{job.experience_years_min ?? 0}+ years experience</span>
                  {(job.salary_min || job.salary_max) && <span className="inline-flex items-center gap-1.5"><IndianRupee className="h-4 w-4" />{job.salary_min ? formatINR(job.salary_min) : "Open"} – {job.salary_max ? formatINR(job.salary_max) : "Open"} / month</span>}
                  {job.vacancies && job.vacancies > 1 && <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" />{job.vacancies} vacancies</span>}
                  <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{daysAgo(job.created_at)}</span>
                  {job.expires_at && <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" />Apply by {new Date(job.expires_at).toLocaleDateString("en-IN")}</span>}
                </div>
              </div>

              {/* Apply + Share actions */}
              <div className="flex flex-col gap-3 shrink-0 lg:items-end">
                <OneClickApply jobId={job.id} jobTitle={job.job_title} organizationName={job.organization_name} />
                {(job.apply_url || job.apply_email) && (
                  <Button asChild variant="outline" size="sm">
                    <a href={job.apply_url || `mailto:${job.apply_email}`} target="_blank" rel="noreferrer">External Apply</a>
                  </Button>
                )}
                <div className="flex gap-2">
                  <Button asChild variant="ghost" size="sm" className="gap-1.5 text-[#0A66C2]">
                    <a href={linkedInShare} target="_blank" rel="noreferrer"><Share2 className="h-3.5 w-3.5" />LinkedIn</a>
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => { navigator.clipboard.writeText(shareUrl); }}>
                    <Share2 className="h-3.5 w-3.5" />Copy Link
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Body */}
        <section className="container py-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            {/* Main content */}
            <div className="space-y-8">
              {/* Description */}
              {job.description && (
                <Card>
                  <CardHeader><CardTitle>Job Description</CardTitle></CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none text-foreground/80 whitespace-pre-wrap">{job.description}</div>
                  </CardContent>
                </Card>
              )}

              {/* Requirements */}
              {job.requirements && (
                <Card>
                  <CardHeader><CardTitle>Requirements & Qualifications</CardTitle></CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none text-foreground/80 whitespace-pre-wrap">{job.requirements}</div>
                  </CardContent>
                </Card>
              )}

              {/* Related Jobs */}
              {related.length > 0 && (
                <div>
                  <h2 className="font-display text-xl font-semibold mb-4">Similar Jobs</h2>
                  <div className="grid gap-3">
                    {related.map((r) => (
                      <Link key={r.id} to={`/jobs/${r.id}`} className="block">
                        <Card className="transition-smooth hover:shadow-md hover:border-primary/30">
                          <CardContent className="flex items-center justify-between p-4">
                            <div>
                              <p className="font-semibold">{r.job_title}</p>
                              <p className="text-sm text-muted-foreground">{r.organization_name}{r.location_state ? ` · ${r.location_state}` : ""}</p>
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                              {r.job_type && <Badge variant="outline" className="text-[10px]">{jobTypeLabels[r.job_type] ?? r.job_type}</Badge>}
                              {r.salary_min && <p className="mt-1 text-xs">₹{(r.salary_min / 1000).toFixed(0)}k+</p>}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Job summary card */}
              <Card>
                <CardHeader><CardTitle className="text-base">Job Summary</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Organization</span>
                    <span className="font-medium text-right">{job.organization_name}</span>
                  </div>
                  {job.organization_type && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-medium capitalize">{job.organization_type}</span>
                    </div>
                  )}
                  {job.department && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Department</span>
                      <span className="font-medium text-right">{job.department}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Experience</span>
                    <span className="font-medium">{job.experience_years_min ?? 0}+ years</span>
                  </div>
                  {(job.salary_min || job.salary_max) && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Salary</span>
                      <span className="font-medium">{job.salary_min ? `₹${(job.salary_min/1000).toFixed(0)}k` : "Open"} – {job.salary_max ? `₹${(job.salary_max/1000).toFixed(0)}k` : "Open"}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-medium text-right">{[job.location_city, job.location_state].filter(Boolean).join(", ") || "India"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Job Type</span>
                    <span className="font-medium">{jobTypeLabels[job.job_type || ""] || "Full-time"}</span>
                  </div>
                  {job.vacancies && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vacancies</span>
                      <span className="font-medium">{job.vacancies}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Posted</span>
                    <span className="font-medium">{new Date(job.created_at).toLocaleDateString("en-IN")}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick actions */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <OneClickApply jobId={job.id} jobTitle={job.job_title} organizationName={job.organization_name} />
                  <Button asChild variant="outline" className="w-full" size="sm">
                    <Link to="/jobs/profile">Update My Profile</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full" size="sm">
                    <Link to="/jobs/alerts">Set Alert for Similar Jobs</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default JobDetail;
