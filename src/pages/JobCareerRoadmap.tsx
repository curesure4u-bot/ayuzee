import { usePageSEO } from "@/hooks/usePageSEO";
import { Link } from "react-router-dom";
import { Award, BookOpen, Briefcase, GraduationCap, Rocket, Stethoscope, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const CAREER_PATHS = [
  {
    system: "Ayurveda (BAMS)",
    icon: "🌿",
    color: "border-l-green-500",
    stages: [
      { year: "Year 1-5.5", title: "BAMS Degree", desc: "5.5 years including 1 year internship at an AYUSH hospital", type: "education" },
      { year: "Year 6-7", title: "Junior Resident / House Surgeon", desc: "Post-internship clinical practice at hospital, ₹25k-40k/month", type: "job" },
      { year: "Year 7-10", title: "MD/MS (Ayurveda) or Practice", desc: "Specialize in Kayachikitsa, Panchakarma, Shalya, etc. OR start own clinic", type: "education" },
      { year: "Year 8-12", title: "Consultant / Sr. Doctor", desc: "Hospital consultant or private practice. ₹50k-1.5L/month", type: "job" },
      { year: "Year 10-15", title: "HOD / Chief Physician", desc: "Department head at hospital/college. Research publications. ₹1L-3L/month", type: "senior" },
      { year: "Year 15+", title: "Professor / Director / Own Hospital", desc: "Academic leadership, hospital ownership, or advisory roles. ₹2L-5L+/month", type: "leadership" },
    ],
  },
  {
    system: "Homeopathy (BHMS)",
    icon: "💊",
    color: "border-l-blue-500",
    stages: [
      { year: "Year 1-5.5", title: "BHMS Degree", desc: "5.5 years including 1 year compulsory internship", type: "education" },
      { year: "Year 6-7", title: "Junior Doctor / Clinic Assistant", desc: "Practice under senior homeopath or hospital posting. ₹20k-35k/month", type: "job" },
      { year: "Year 7-10", title: "MD (Homeopathy) / Own Practice", desc: "Specialize in Organon, Repertory, or Materia Medica. Build patient base", type: "education" },
      { year: "Year 8-12", title: "Consultant Homeopath", desc: "Established practice with loyal patients. ₹40k-1.2L/month", type: "job" },
      { year: "Year 12+", title: "Professor / Author / Chain Clinics", desc: "Teaching, publishing, or multi-location practice. ₹1L-4L+/month", type: "leadership" },
    ],
  },
  {
    system: "Unani (BUMS)",
    icon: "🌙",
    color: "border-l-purple-500",
    stages: [
      { year: "Year 1-5.5", title: "BUMS Degree", desc: "5.5 years with internship at Unani hospital", type: "education" },
      { year: "Year 6-8", title: "Tabib / Junior Hakeem", desc: "Hospital or CGHS/ECHS posting. ₹25k-40k/month", type: "job" },
      { year: "Year 8-12", title: "MD (Unani) / Senior Practitioner", desc: "Specialize in Moalajat, Jarahat, or Ilaj bil Tadbeer", type: "education" },
      { year: "Year 12+", title: "Senior Hakeem / Professor", desc: "Head of department or private practice. ₹60k-2L/month", type: "leadership" },
    ],
  },
  {
    system: "Naturopathy & Yoga (BNYS)",
    icon: "🧘",
    color: "border-l-amber-500",
    stages: [
      { year: "Year 1-5.5", title: "BNYS Degree", desc: "5.5 years including internship", type: "education" },
      { year: "Year 6-8", title: "Yoga Therapist / Naturopath", desc: "Wellness centers, resorts, or hospitals. ₹20k-40k/month", type: "job" },
      { year: "Year 8-12", title: "Senior Therapist / Center Director", desc: "Lead yoga programs, run wellness retreats. ₹40k-1L/month", type: "job" },
      { year: "Year 12+", title: "Wellness Director / Own Center", desc: "Own naturopathy hospital or corporate wellness leadership. ₹80k-3L+/month", type: "leadership" },
    ],
  },
];

const ALTERNATIVE_CAREERS = [
  { title: "Pharma & Research", desc: "Drug research, clinical trials, quality control at AYUSH pharma companies", icon: "🧪" },
  { title: "Medical Writing", desc: "Write for journals, create content for health platforms, author books", icon: "✍️" },
  { title: "Hospital Administration", desc: "MBA (Hospital Admin) + BAMS = powerful combo for healthcare management", icon: "🏥" },
  { title: "Government Services", desc: "UPSC (Medical Officer), State PSC, CGHS, Railway Medical, Defence AYUSH", icon: "🏛️" },
  { title: "Digital Health & AI", desc: "Build health-tech products, telemedicine, AI diagnosis platforms", icon: "💻" },
  { title: "Wellness Tourism", desc: "Kerala Panchakarma resorts, international wellness retreats, spa chains", icon: "🌴" },
  { title: "Teaching & Academia", desc: "College faculty, research guide, PhD pathway to professor", icon: "🎓" },
  { title: "Entrepreneurship", desc: "Own clinic, product line, D2C brand, franchise model", icon: "🚀" },
];

const stageIcon = (type: string) => {
  if (type === "education") return <GraduationCap className="h-4 w-4 text-blue-600" />;
  if (type === "job") return <Briefcase className="h-4 w-4 text-green-600" />;
  if (type === "senior") return <Stethoscope className="h-4 w-4 text-amber-600" />;
  return <Award className="h-4 w-4 text-purple-600" />;
};

const JobCareerRoadmap = () => {
  usePageSEO({ title: "AYUSH Career Roadmap — Ayuzee" });

  return (
    <div className="min-h-screen bg-muted/30">
      <main>
        {/* Header */}
        <section className="border-b border-border bg-gradient-to-r from-primary/5 to-background">
          <div className="container py-12">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <Badge variant="secondary" className="mb-3 gap-1">
                  <Rocket className="h-3 w-3" /> Career Planning
                </Badge>
                <h1 className="font-display text-4xl font-semibold md:text-5xl">AYUSH Career Roadmap</h1>
                <p className="mt-3 text-lg text-muted-foreground">
                  Plan your AYUSH career from student to senior leader. Explore pathways across Ayurveda, Homeopathy, Unani & Naturopathy.
                </p>
              </div>
              <div className="flex gap-3">
                <Button asChild variant="outline"><Link to="/jobs/salary-insights">Salary Insights</Link></Button>
                <Button asChild variant="hero"><Link to="/jobs">Find Jobs</Link></Button>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-8">
          {/* Career paths */}
          <div className="grid gap-8">
            {CAREER_PATHS.map((path) => (
              <Card key={path.system} className={`border-l-4 ${path.color}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <span className="text-2xl">{path.icon}</span>
                    {path.system}
                  </CardTitle>
                  <CardDescription>Career progression timeline</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-[18px] top-2 bottom-2 w-0.5 bg-border" />
                    <div className="space-y-4">
                      {path.stages.map((stage, i) => (
                        <div key={i} className="relative flex gap-4 pl-1">
                          <div className="relative z-10 mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-border bg-background">
                            {stageIcon(stage.type)}
                          </div>
                          <div className="flex-1 pb-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold text-primary">{stage.year}</span>
                              <span className="font-semibold">{stage.title}</span>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">{stage.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Alternative careers */}
          <div className="mt-12">
            <h2 className="font-display text-2xl font-semibold mb-2">Alternative Career Paths</h2>
            <p className="text-muted-foreground mb-6">Beyond clinical practice — AYUSH opens doors to diverse industries.</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {ALTERNATIVE_CAREERS.map((career) => (
                <Card key={career.title} className="hover:shadow-lg transition-smooth">
                  <CardContent className="p-5">
                    <span className="text-2xl">{career.icon}</span>
                    <h3 className="mt-3 font-semibold">{career.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{career.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Card className="mt-12 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
              <TrendingUp className="h-8 w-8 text-primary" />
              <h2 className="font-display text-2xl font-semibold">Ready to advance your AYUSH career?</h2>
              <p className="text-muted-foreground max-w-lg">
                Browse current openings, get AI-matched recommendations, or set up alerts for your dream role.
              </p>
              <div className="flex gap-3 mt-2">
                <Button asChild variant="hero"><Link to="/jobs/ai-match">AI Job Match</Link></Button>
                <Button asChild variant="outline"><Link to="/jobs/alerts">Set Job Alert</Link></Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default JobCareerRoadmap;
