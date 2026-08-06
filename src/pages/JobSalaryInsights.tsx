import { useEffect, useMemo, useState } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Link } from "react-router-dom";
import { BarChart3, IndianRupee, MapPin, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type SalaryData = {
  department: string | null;
  job_type: string | null;
  location_state: string | null;
  salary_min: number | null;
  salary_max: number | null;
  experience_years_min: number | null;
};

type InsightRow = {
  label: string;
  avgMin: number;
  avgMax: number;
  count: number;
};

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

const JobSalaryInsights = () => {
  usePageSEO({ title: "AYUSH Salary Insights & Trends — Ayuzee" });
  const [jobs, setJobs] = useState<SalaryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState<"department" | "state" | "job_type" | "experience">("department");

  useEffect(() => {
    (supabase as any)
      .from("job_listings")
      .select("department, job_type, location_state, salary_min, salary_max, experience_years_min")
      .eq("is_active", true)
      .eq("is_approved", true)
      .not("salary_min", "is", null)
      .order("created_at", { ascending: false })
      .limit(500)
      .then(({ data }: { data: SalaryData[] | null }) => {
        setJobs(data ?? []);
        setLoading(false);
      });
  }, []);

  const insights = useMemo((): InsightRow[] => {
    const groups = new Map<string, { mins: number[]; maxs: number[] }>();

    for (const job of jobs) {
      let key: string;
      if (groupBy === "department") {
        key = job.department || "General / Unspecified";
      } else if (groupBy === "state") {
        key = job.location_state || "Not specified";
      } else if (groupBy === "job_type") {
        key = job.job_type?.replace("_", " ") || "Not specified";
      } else {
        const exp = job.experience_years_min ?? 0;
        if (exp === 0) key = "Freshers (0 yrs)";
        else if (exp <= 2) key = "1-2 years";
        else if (exp <= 5) key = "3-5 years";
        else if (exp <= 10) key = "6-10 years";
        else key = "10+ years";
      }

      if (!groups.has(key)) groups.set(key, { mins: [], maxs: [] });
      const g = groups.get(key)!;
      if (job.salary_min) g.mins.push(job.salary_min);
      if (job.salary_max) g.maxs.push(job.salary_max);
    }

    return Array.from(groups.entries())
      .map(([label, { mins, maxs }]) => ({
        label,
        avgMin: mins.length ? Math.round(mins.reduce((a, b) => a + b, 0) / mins.length) : 0,
        avgMax: maxs.length ? Math.round(maxs.reduce((a, b) => a + b, 0) / maxs.length) : 0,
        count: mins.length,
      }))
      .filter((r) => r.count >= 1)
      .sort((a, b) => b.avgMax - a.avgMax);
  }, [jobs, groupBy]);

  const overallAvgMin = useMemo(() => {
    const valid = jobs.filter((j) => j.salary_min);
    return valid.length ? Math.round(valid.reduce((s, j) => s + (j.salary_min || 0), 0) / valid.length) : 0;
  }, [jobs]);

  const overallAvgMax = useMemo(() => {
    const valid = jobs.filter((j) => j.salary_max);
    return valid.length ? Math.round(valid.reduce((s, j) => s + (j.salary_max || 0), 0) / valid.length) : 0;
  }, [jobs]);

  const maxSalary = useMemo(() => Math.max(...insights.map((i) => i.avgMax), 1), [insights]);

  return (
    <div className="min-h-screen bg-muted/30">
      <main>
        <section className="border-b border-border bg-background">
          <div className="container py-12">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <Badge variant="secondary" className="mb-3 gap-1">
                  <TrendingUp className="h-3 w-3" /> Market Data
                </Badge>
                <h1 className="font-display text-4xl font-semibold md:text-5xl">AYUSH Salary Insights</h1>
                <p className="mt-3 text-lg text-muted-foreground">
                  Average salary ranges across AYUSH departments, states, and experience levels. Based on real job postings.
                </p>
              </div>
              <div className="flex gap-3">
                <Button asChild variant="outline"><Link to="/jobs">Browse Jobs</Link></Button>
                <Button asChild variant="hero"><Link to="/jobs/ai-match">AI Job Match</Link></Button>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-8">
          {/* Summary cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-5 text-center">
                <IndianRupee className="mx-auto h-6 w-6 text-primary mb-2" />
                <p className="text-2xl font-bold">{formatINR(overallAvgMin)}</p>
                <p className="text-xs text-muted-foreground mt-1">Avg. Minimum Salary</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 text-center">
                <TrendingUp className="mx-auto h-6 w-6 text-green-600 mb-2" />
                <p className="text-2xl font-bold">{formatINR(overallAvgMax)}</p>
                <p className="text-xs text-muted-foreground mt-1">Avg. Maximum Salary</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 text-center">
                <BarChart3 className="mx-auto h-6 w-6 text-blue-600 mb-2" />
                <p className="text-2xl font-bold">{jobs.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Jobs with Salary Data</p>
              </CardContent>
            </Card>
          </div>

          {/* Group by selector */}
          <Card className="mb-6">
            <CardContent className="flex flex-wrap items-center gap-4 p-4">
              <Label className="text-sm font-medium">View by:</Label>
              <div className="flex gap-2">
                {(
                  [
                    { value: "department", label: "Department" },
                    { value: "state", label: "State" },
                    { value: "job_type", label: "Job Type" },
                    { value: "experience", label: "Experience" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setGroupBy(opt.value)}
                    className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-smooth ${
                      groupBy === opt.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Salary bars */}
          {loading ? (
            <div className="py-16 text-center text-muted-foreground">Loading salary data...</div>
          ) : insights.length === 0 ? (
            <Card className="p-12 text-center">
              <IndianRupee className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 font-medium">No salary data available yet</p>
              <p className="mt-1 text-sm text-muted-foreground">As more jobs are posted with salary info, insights will appear here.</p>
            </Card>
          ) : (
            <div className="grid gap-3">
              {insights.map((row) => (
                <Card key={row.label} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-sm truncate">{row.label}</span>
                          <Badge variant="outline" className="text-[10px] shrink-0">{row.count} jobs</Badge>
                        </div>
                        {/* Visual bar */}
                        <div className="flex items-center gap-2">
                          <div className="relative h-6 flex-1 rounded-full bg-muted overflow-hidden">
                            <div
                              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary/60 to-primary"
                              style={{ width: `${(row.avgMax / maxSalary) * 100}%` }}
                            />
                            <div
                              className="absolute inset-y-0 left-0 rounded-full bg-primary/30"
                              style={{ width: `${(row.avgMin / maxSalary) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold">{formatINR(row.avgMin)} – {formatINR(row.avgMax)}</p>
                        <p className="text-[10px] text-muted-foreground">avg. range / month</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Disclaimer */}
          <p className="mt-6 text-xs text-muted-foreground text-center">
            Data based on job postings on Ayuzee. Actual salaries may vary by organization, qualifications, and negotiation.
            Figures are monthly unless stated otherwise.
          </p>
        </section>
      </main>
    </div>
  );
};

export default JobSalaryInsights;
