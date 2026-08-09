import { useState } from "react";
import {
  Award,
  BookOpen,
  Briefcase,
  ChevronRight,
  Clock,
  GraduationCap,
  IndianRupee,
  Lightbulb,
  MapPin,
  PieChart,
  Star,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface CareerPath {
  id: string;
  title: string;
  icon: typeof Briefcase;
  color: string;
  tagline: string;
  description: string;
  salaryRange: string;
  timeToTransition: string;
  demandLevel: "High" | "Medium" | "Growing";
  skills: string[];
  certifications: string[];
  dayInLife: string;
  bookRecommendation: string;
  firstStep: string;
  pros: string[];
  cons: string[];
}

const CAREER_PATHS: CareerPath[] = [
  {
    id: "academia",
    title: "Academia & Research",
    icon: GraduationCap,
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    tagline: "Teach, publish, shape the next generation",
    description: "Become a professor, researcher, or academic leader. Publish papers, guide PG students, and build institutional reputation.",
    salaryRange: "₹8L–₹30L/year (Govt) · ₹15L–₹60L (Private)",
    timeToTransition: "3-5 years post-PG",
    demandLevel: "Medium",
    skills: ["Research methodology", "Academic writing", "Grant applications", "Teaching pedagogy", "Mentoring", "Public speaking"],
    certifications: ["PhD (optional but preferred)", "Research fellowships", "ICMR/DST grants"],
    dayInLife: "Morning: OPD + ward rounds. Afternoon: PG student guidance + research supervision. Evening: Writing papers or reviewing journals. Weekends: Conference preparation.",
    bookRecommendation: "So Good They Can't Ignore You — Cal Newport",
    firstStep: "Start by publishing 1 case report or review article in the next 3 months.",
    pros: ["Job security (especially govt)", "Intellectual stimulation", "Shape future doctors", "Sabbaticals and conference travel"],
    cons: ["Lower pay than private practice", "Publish-or-perish pressure", "Academic politics", "Slow career progression"],
  },
  {
    id: "healthtech",
    title: "Health-Tech & Startups",
    icon: TrendingUp,
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    tagline: "Build products that scale healthcare",
    description: "Join or co-found a health-tech startup. Roles: Chief Medical Officer, Medical Advisor, Product Manager, or Clinical Lead.",
    salaryRange: "₹15L–₹80L/year + equity",
    timeToTransition: "2-3 years",
    demandLevel: "High",
    skills: ["Product thinking", "Data analysis", "UI/UX understanding", "Clinical validation", "Regulatory knowledge", "Stakeholder communication"],
    certifications: ["MBA/MPH (helpful not required)", "Product management courses", "Clinical informatics"],
    dayInLife: "Morning: Product sprint meeting. Mid-day: Review clinical workflows for feature design. Afternoon: Stakeholder calls + regulatory review. Evening: Industry networking or content creation.",
    bookRecommendation: "Zero to One — Peter Thiel",
    firstStep: "Shadow a health-tech startup for 2 weeks. Reach out to 3 doctor-founders on LinkedIn.",
    pros: ["High growth potential", "Equity upside", "Impact at scale", "Modern work culture"],
    cons: ["Startup uncertainty", "Long hours initially", "Less patient contact", "Need to learn business fast"],
  },
  {
    id: "medical_writing",
    title: "Medical Writing & Communications",
    icon: BookOpen,
    color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    tagline: "Write, educate, and influence without a clinic",
    description: "Medical writing for pharma, journals, health media, or your own brand. Includes regulatory writing, content creation, and health journalism.",
    salaryRange: "₹8L–₹40L/year (freelance can exceed)",
    timeToTransition: "6 months–1 year",
    demandLevel: "High",
    skills: ["Scientific writing", "Health communication", "SEO basics", "Regulatory documents (CTD, IB)", "Social media content", "Editing"],
    certifications: ["Medical writing certificate (AMWA/EMWA)", "Clinical research courses", "Content marketing courses"],
    dayInLife: "Morning: Write manuscript or regulatory document. Afternoon: Client calls + research. Evening: Personal blog/newsletter or social content. Flexible schedule.",
    bookRecommendation: "Show Your Work — Austin Kleon",
    firstStep: "Write and publish 1 LinkedIn article about a clinical topic this week.",
    pros: ["Location independent", "Flexible hours", "Multiple income streams", "Builds personal brand"],
    cons: ["Inconsistent income initially", "Isolation if fully remote", "Constant skill updating", "Client management"],
  },
  {
    id: "public_health",
    title: "Public Health & Policy",
    icon: MapPin,
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    tagline: "Impact millions through systems and policy",
    description: "Work in WHO, UNICEF, government health departments, NGOs, or think tanks. Shape health policy at population level.",
    salaryRange: "₹10L–₹50L/year (International: $60K–$150K)",
    timeToTransition: "2-4 years (MPH usually needed)",
    demandLevel: "Growing",
    skills: ["Epidemiology", "Biostatistics", "Health economics", "Program management", "Policy analysis", "Grant writing"],
    certifications: ["MPH (strongly recommended)", "DrPH", "Diplomas in tropical medicine/epidemiology"],
    dayInLife: "Morning: Data analysis or field visits. Afternoon: Policy meetings or program review. Evening: Report writing. Travel: frequent (districts/international).",
    bookRecommendation: "Being Mortal — Atul Gawande",
    firstStep: "Apply for a short-term WHO/UNICEF consultancy or volunteer with a district health program.",
    pros: ["Massive population impact", "International opportunities", "Meaningful work", "Good work-life balance"],
    cons: ["Bureaucratic environments", "Slow change pace", "Less clinical work", "MPH investment needed"],
  },
  {
    id: "pharma",
    title: "Pharma & Medical Affairs",
    icon: Briefcase,
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    tagline: "Bridge clinical practice and drug development",
    description: "Roles in pharmaceutical companies: Medical Advisor, MSL (Medical Science Liaison), Pharmacovigilance, Clinical Research, or Medical Affairs Head.",
    salaryRange: "₹12L–₹60L/year",
    timeToTransition: "1-2 years",
    demandLevel: "High",
    skills: ["Clinical trial knowledge", "Regulatory affairs", "KOL engagement", "Medical communication", "Pharmacovigilance", "Data interpretation"],
    certifications: ["PG Diploma in Clinical Research", "GCP certification", "Pharmacovigilance courses"],
    dayInLife: "Morning: Review clinical trial data or adverse event reports. Afternoon: KOL meetings or training sessions. Evening: Medical strategy documents. Travel: moderate.",
    bookRecommendation: "The Checklist Manifesto — Atul Gawande",
    firstStep: "Take a GCP (Good Clinical Practice) online course. Apply for MSL roles in 2 pharma companies.",
    pros: ["High salary", "Structured career growth", "Industry exposure", "Less on-call stress"],
    cons: ["Corporate culture adjustment", "Less patient interaction", "Ethical gray areas sometimes", "Target pressure"],
  },
  {
    id: "medico_legal",
    title: "Medico-Legal & Forensic",
    icon: Target,
    color: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    tagline: "Where medicine meets law and justice",
    description: "Expert witness, medico-legal consultant, insurance advisor, forensic specialist, or medical ethics consultant.",
    salaryRange: "₹10L–₹50L/year (consultancy can exceed)",
    timeToTransition: "1-3 years",
    demandLevel: "Growing",
    skills: ["Medical jurisprudence", "Documentation expertise", "Expert testimony", "Insurance processes", "Ethics frameworks", "Report writing"],
    certifications: ["LLB (optional but powerful)", "Medico-legal diploma", "Insurance medicine certification"],
    dayInLife: "Morning: Review medico-legal cases or provide expert opinions. Afternoon: Court appearances or insurance assessments. Evening: Documentation or teaching. Unpredictable but intellectually stimulating.",
    bookRecommendation: "Black Box Thinking — Matthew Syed",
    firstStep: "Attend a medico-legal workshop. Start documenting your clinical cases with legal awareness.",
    pros: ["Intellectually challenging", "High per-case fees", "Growing demand", "Unique niche"],
    cons: ["Stressful court appearances", "Irregular income if freelance", "Requires legal knowledge investment", "Emotional weight of cases"],
  },
  {
    id: "entrepreneurship",
    title: "Healthcare Entrepreneurship",
    icon: Star,
    color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
    tagline: "Build your own clinic, chain, or healthcare business",
    description: "Own and grow a clinic, hospital chain, wellness center, diagnostic lab, or healthcare franchise. Doctor-as-CEO.",
    salaryRange: "₹0–Unlimited (₹20L–₹2Cr+ once established)",
    timeToTransition: "1-5 years",
    demandLevel: "High",
    skills: ["Business planning", "Financial management", "Marketing", "People management", "Operations", "Branding"],
    certifications: ["MBA/PGDM (optional)", "Clinic management courses", "Digital marketing basics"],
    dayInLife: "Morning: Clinical work (your USP). Afternoon: Business operations — staff, finances, marketing. Evening: Strategic planning or networking. Weekends: Learning business skills.",
    bookRecommendation: "The Lean Startup — Eric Ries",
    firstStep: "Write a 1-page business plan for your ideal practice. Calculate breakeven point.",
    pros: ["Unlimited income potential", "Full autonomy", "Build legacy", "Create jobs"],
    cons: ["Financial risk", "Work-life balance challenge initially", "Management headaches", "Loneliness at the top"],
  },
  {
    id: "digital_health",
    title: "Digital Health & Telemedicine",
    icon: PieChart,
    color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
    tagline: "Practice medicine without walls",
    description: "Build an online practice, telemedicine brand, health app consultancy, or become a digital health influencer with clinical credibility.",
    salaryRange: "₹5L–₹50L/year (scalable with audience)",
    timeToTransition: "3-6 months",
    demandLevel: "High",
    skills: ["Telemedicine platforms", "Digital marketing", "Content creation", "Video communication", "Personal branding", "Community building"],
    certifications: ["Telemedicine practice guidelines", "Digital marketing course", "Certified health coach (optional)"],
    dayInLife: "Morning: Online consultations (video/chat). Afternoon: Content creation — reels, articles, newsletters. Evening: Community engagement or course creation. Location-free lifestyle.",
    bookRecommendation: "Show Your Work — Austin Kleon",
    firstStep: "Set up a profile on one telemedicine platform this week. Post 1 health tip on social media.",
    pros: ["Location freedom", "Scalable income", "Large reach", "Low overhead"],
    cons: ["Building audience takes time", "Platform dependency", "Less physical examination", "Need consistent content"],
  },
];

// ════════════════════════════════════════════════════════════
// CAREER DETAIL DIALOG
// ════════════════════════════════════════════════════════════

function CareerDetail({ path, onClose }: { path: CareerPath; onClose: () => void }) {
  return (
    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <path.icon className="h-5 w-5" />
          {path.title}
        </DialogTitle>
        <DialogDescription>{path.tagline}</DialogDescription>
      </DialogHeader>

      <div className="space-y-5">
        {/* Overview */}
        <p className="text-sm text-muted-foreground">{path.description}</p>

        {/* Key Metrics */}
        <div className="grid gap-3 grid-cols-3">
          <div className="rounded-lg bg-muted/60 p-3 text-center">
            <IndianRupee className="h-4 w-4 mx-auto text-green-600 mb-1" />
            <p className="text-[10px] text-muted-foreground">Salary Range</p>
            <p className="text-xs font-medium">{path.salaryRange}</p>
          </div>
          <div className="rounded-lg bg-muted/60 p-3 text-center">
            <Clock className="h-4 w-4 mx-auto text-blue-600 mb-1" />
            <p className="text-[10px] text-muted-foreground">Time to Transition</p>
            <p className="text-xs font-medium">{path.timeToTransition}</p>
          </div>
          <div className="rounded-lg bg-muted/60 p-3 text-center">
            <TrendingUp className="h-4 w-4 mx-auto text-amber-600 mb-1" />
            <p className="text-[10px] text-muted-foreground">Demand</p>
            <p className="text-xs font-medium">{path.demandLevel}</p>
          </div>
        </div>

        {/* Skills Needed */}
        <div>
          <p className="text-sm font-medium mb-2">Skills You Need</p>
          <div className="flex flex-wrap gap-1.5">
            {path.skills.map((s) => (
              <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div>
          <p className="text-sm font-medium mb-2">Certifications / Courses</p>
          <ul className="space-y-1">
            {path.certifications.map((c) => (
              <li key={c} className="text-xs text-muted-foreground flex gap-2">
                <GraduationCap className="h-3 w-3 shrink-0 mt-0.5 text-primary" />
                {c}
              </li>
            ))}
          </ul>
        </div>

        {/* Day in the Life */}
        <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/30 p-3">
          <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400 mb-1">A Day in This Life</p>
          <p className="text-xs text-indigo-600 dark:text-indigo-300">{path.dayInLife}</p>
        </div>

        {/* Pros & Cons */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-3">
            <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">Pros</p>
            {path.pros.map((p) => (
              <p key={p} className="text-xs text-green-600 dark:text-green-300">✓ {p}</p>
            ))}
          </div>
          <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3">
            <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">Cons</p>
            {path.cons.map((c) => (
              <p key={c} className="text-xs text-red-600 dark:text-red-300">✗ {c}</p>
            ))}
          </div>
        </div>

        {/* First Step */}
        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3">
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1">
            <Lightbulb className="h-3 w-3" /> Your First Step
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-300 mt-1">{path.firstStep}</p>
        </div>

        {/* Book */}
        <div className="flex items-center gap-2 rounded-lg border p-3">
          <BookOpen className="h-4 w-4 text-green-500 shrink-0" />
          <div>
            <p className="text-xs font-medium">Recommended Read</p>
            <p className="text-xs text-muted-foreground">{path.bookRecommendation}</p>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN CAREER NAVIGATOR PAGE
// ════════════════════════════════════════════════════════════

const CareerNavigator = () => {
  const [selectedPath, setSelectedPath] = useState<CareerPath | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl flex items-center gap-2">
          <PieChart className="h-7 w-7 text-indigo-500" />
          Career Navigator
        </h1>
        <p className="text-muted-foreground">Beyond clinical practice — explore 8 career paths for doctors</p>
      </div>

      {/* Intro Card */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            Medical school teaches you ONE path: clinical practice. But doctors are uniquely skilled for many careers.
            Explore each path below — salary benchmarks, skills needed, a typical day, and your first action step.
          </p>
        </CardContent>
      </Card>

      {/* Career Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {CAREER_PATHS.map((path) => (
          <Card key={path.id} className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30" onClick={() => setSelectedPath(path)}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className={`grid h-10 w-10 place-items-center rounded-lg ${path.color}`}>
                  <path.icon className="h-5 w-5" />
                </div>
                <Badge variant="secondary" className="text-[10px]">{path.demandLevel} Demand</Badge>
              </div>
              <CardTitle className="text-sm mt-2">{path.title}</CardTitle>
              <CardDescription className="text-xs">{path.tagline}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <IndianRupee className="h-3 w-3" />
                  <span>{path.salaryRange.split("·")[0]}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Transition: {path.timeToTransition}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {path.skills.slice(0, 3).map((s) => (
                    <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                  ))}
                  {path.skills.length > 3 && (
                    <Badge variant="outline" className="text-[10px]">+{path.skills.length - 3} more</Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-2 text-xs gap-1">
                  Explore <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedPath} onOpenChange={() => setSelectedPath(null)}>
        {selectedPath && <CareerDetail path={selectedPath} onClose={() => setSelectedPath(null)} />}
      </Dialog>
    </div>
  );
};

export default CareerNavigator;
