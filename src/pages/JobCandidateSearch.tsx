import { useEffect, useMemo, useState } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase, Download, FileText, GraduationCap, Loader2, MapPin, Search, UserCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type CandidateProfile = {
  id: string;
  user_id: string;
  full_name: string;
  headline: string | null;
  degree: string;
  department: string | null;
  skills: string[] | null;
  experience_years: number;
  current_designation: string | null;
  current_organization: string | null;
  preferred_states: string[] | null;
  expected_salary_min: number | null;
  expected_salary_max: number | null;
  notice_period: string | null;
  willing_to_relocate: boolean;
  resume_url: string | null;
  profile_completeness: number;
  last_active_at: string | null;
};

const DEPARTMENTS = [
  "Kayachikitsa (General Medicine)", "Shalya Tantra (Surgery)",
  "Shalakya Tantra (ENT & Ophthalmology)", "Prasuti & Stree Roga (OBG)",
  "Kaumarbhritya (Pediatrics)", "Panchakarma", "Dravyaguna (Pharmacology)",
  "Rasashastra & Bhaishajya Kalpana", "Swasthavritta (Preventive Medicine)",
  "Organon of Medicine (Homeopathy)", "Materia Medica (Homeopathy)",
  "Unani Medicine", "Siddha Medicine", "Naturopathy", "Yoga Therapy",
  "Panchakarma Therapist", "AYUSH Nursing", "Pharmacy", "Lab Technician", "Paramedical",
];

const NOTICE_LABELS: Record<string, string> = {
  immediate: "Immediate", "15_days": "15 days", "30_days": "30 days",
  "60_days": "60 days", "90_days": "90 days",
};

const JobCandidateSearch = () => {
  usePageSEO({ title: "Search AYUSH Candidates — Employer | Ayuzee" });
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState("all");
  const [experience, setExperience] = useState("all");
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { navigate("/auth", { replace: true }); return; }

    const { data, error } = await (supabase as any)
      .from("job_seeker_profiles")
      .select("id, user_id, full_name, headline, degree, department, skills, experience_years, current_designation, current_organization, preferred_states, expected_salary_min, expected_salary_max, notice_period, willing_to_relocate, resume_url, profile_completeness, last_active_at")
      .eq("is_actively_looking", true)
      .eq("visibility", "public")
      .order("last_active_at", { ascending: false })
      .limit(200);

    if (error) toast.error(error.message);
    setCandidates(data ?? []);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      if (department !== "all" && c.department !== department) return false;
      if (experience !== "all") {
        const exp = c.experience_years;
        if (experience === "fresher" && exp > 0) return false;
        if (experience === "1-3" && (exp < 1 || exp > 3)) return false;
        if (experience === "3-5" && (exp < 3 || exp > 5)) return false;
        if (experience === "5-10" && (exp < 5 || exp > 10)) return false;
        if (experience === "10+" && exp < 10) return false;
      }
      if (keyword.trim()) {
        const q = keyword.toLowerCase();
        const haystack = [c.full_name, c.headline, c.department, c.degree, c.current_designation, ...(c.skills || [])]
          .filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [candidates, department, experience, keyword]);

  const daysAgo = (iso: string | null) => {
    if (!iso) return "";
    const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
    if (days === 0) return "Active today";
    if (days === 1) return "Active 1 day ago";
    if (days <= 7) return `Active ${days} days ago`;
    return `Active ${Math.floor(days / 7)}w ago`;
  };

  if (loading) return <div className="min-h-[60vh] grid place-items-center"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-muted/30">
      <main>
        {/* Header */}
        <section className="border-b border-border bg-background">
          <div className="container py-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <Badge variant="secondary" className="mb-2">Employer</Badge>
                <h1 className="font-display text-3xl font-semibold">Search AYUSH Candidates</h1>
                <p className="mt-1 text-muted-foreground">Browse profiles of doctors, therapists, and paramedical staff looking for opportunities.</p>
              </div>
              <div className="flex gap-3">
                <Button asChild variant="outline"><Link to="/jobs/employer">My Applicants</Link></Button>
                <Button asChild variant="hero"><Link to="/jobs/post">Post a Job</Link></Button>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-8">
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="grid gap-4 p-4 md:grid-cols-3">
              <div>
                <Label className="text-xs">Department / Specialization</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Experience</Label>
                <Select value={experience} onValueChange={setExperience}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any experience</SelectItem>
                    <SelectItem value="fresher">Fresher (0 yrs)</SelectItem>
                    <SelectItem value="1-3">1–3 years</SelectItem>
                    <SelectItem value="3-5">3–5 years</SelectItem>
                    <SelectItem value="5-10">5–10 years</SelectItem>
                    <SelectItem value="10+">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Search by name, skill, or keyword</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} className="pl-9" placeholder="e.g., Panchakarma, BAMS, Kshar Sutra" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <p className="text-sm text-muted-foreground mb-4">{filtered.length} candidate{filtered.length !== 1 ? "s" : ""} found</p>

          {filtered.length === 0 ? (
            <Card className="p-12 text-center">
              <UserCircle className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 font-medium">No candidates match your filters</p>
              <p className="mt-1 text-sm text-muted-foreground">Try broadening your search criteria.</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filtered.map((c) => (
                <Card key={c.id} className="transition-smooth hover:shadow-lg">
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-display text-lg font-semibold">{c.full_name}</h3>
                          {c.notice_period === "immediate" && (
                            <Badge variant="outline" className="border-green-300 bg-green-50 text-green-700 text-[10px]">Immediate joiner</Badge>
                          )}
                          {c.willing_to_relocate && (
                            <Badge variant="outline" className="text-[10px]">Open to relocate</Badge>
                          )}
                        </div>
                        {c.headline && <p className="text-sm text-muted-foreground">{c.headline}</p>}

                        <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <GraduationCap className="h-3.5 w-3.5" /> {c.degree}
                          </span>
                          {c.department && (
                            <span className="inline-flex items-center gap-1">
                              <Briefcase className="h-3.5 w-3.5" /> {c.department}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1">
                            <Briefcase className="h-3.5 w-3.5" /> {c.experience_years} yrs exp
                          </span>
                          {c.preferred_states && c.preferred_states.length > 0 && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" /> {c.preferred_states.slice(0, 2).join(", ")}{c.preferred_states.length > 2 ? ` +${c.preferred_states.length - 2}` : ""}
                            </span>
                          )}
                        </div>

                        {/* Skills */}
                        {c.skills && c.skills.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {c.skills.slice(0, 6).map((skill) => (
                              <span key={skill} className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{skill}</span>
                            ))}
                            {c.skills.length > 6 && <span className="text-xs text-muted-foreground">+{c.skills.length - 6} more</span>}
                          </div>
                        )}

                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                          {c.current_designation && <span>{c.current_designation}{c.current_organization ? ` at ${c.current_organization}` : ""}</span>}
                          {c.expected_salary_min && <span>Expects ₹{(c.expected_salary_min / 1000).toFixed(0)}k{c.expected_salary_max ? `–${(c.expected_salary_max / 1000).toFixed(0)}k` : "+"}/mo</span>}
                          {c.notice_period && c.notice_period !== "immediate" && <span>Notice: {NOTICE_LABELS[c.notice_period] || c.notice_period}</span>}
                          {c.last_active_at && <span className="text-primary/70">{daysAgo(c.last_active_at)}</span>}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 shrink-0">
                        {c.resume_url && (
                          <Button asChild variant="outline" size="sm" className="gap-1.5">
                            <a href={c.resume_url} target="_blank" rel="noreferrer"><Download className="h-3.5 w-3.5" /> Resume</a>
                          </Button>
                        )}
                        <Badge variant="outline" className="justify-center text-[10px]">
                          Profile {c.profile_completeness}%
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default JobCandidateSearch;
