import { useState } from "react";
import {
  BookOpen,
  ChevronRight,
  DollarSign,
  ExternalLink,
  Lightbulb,
  Mic,
  Monitor,
  PenTool,
  Rocket,
  Star,
  Video,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface IncomeStream {
  id: string;
  title: string;
  icon: typeof Video;
  earning: string;
  difficulty: "Easy" | "Medium" | "Hard";
  timeToStart: string;
  description: string;
  steps: string[];
  tools: string[];
  example: string;
}

const INCOME_STREAMS: IncomeStream[] = [
  {
    id: "youtube", title: "Medical YouTube Channel", icon: Video,
    earning: "₹10K–₹5L/month (at scale)", difficulty: "Medium", timeToStart: "2-3 months",
    description: "Create educational health content. Doctors with credibility get faster growth than generic creators.",
    steps: ["Pick a niche (e.g. Ayurveda tips, MBBS life, patient education)", "Invest in basic mic + ring light (₹3K total)", "Post 2 videos/week for 3 months consistently", "Monetize at 1K subs + 4K watch hours", "Add sponsorships after 10K subscribers"],
    tools: ["CapCut (editing)", "Canva (thumbnails)", "OBS Studio (recording)", "TubeBuddy (SEO)"],
    example: "Dr. Eric Berg: 12M subs. Started with simple health tips from his clinic.",
  },
  {
    id: "online-course", title: "Online Course / Workshop", icon: Monitor,
    earning: "₹50K–₹5L per launch", difficulty: "Medium", timeToStart: "4-6 weeks",
    description: "Package your expertise into a structured course. Sell to students, patients, or other doctors.",
    steps: ["Choose a topic you explain repeatedly (to patients/students)", "Outline 8-12 modules (30 min total video)", "Record with phone + good audio", "Host on Graphy/Teachable/own site", "Launch to your WhatsApp/Instagram audience"],
    tools: ["Graphy.com (Indian platform)", "Loom (recording)", "Canva (slides)", "Razorpay (payments)"],
    example: "A dermatologist sold a 'Skin Science for Beauty Professionals' course for ₹2999 — 200 students in first month.",
  },
  {
    id: "medical-writing", title: "Freelance Medical Writing", icon: PenTool,
    earning: "₹5K–₹50K per article", difficulty: "Easy", timeToStart: "1-2 weeks",
    description: "Pharma companies, health portals, and journals pay well for medically accurate content.",
    steps: ["Create a portfolio (3 sample articles on Medium/LinkedIn)", "Sign up on Kolabtree, Contently, or approach pharma directly", "Start with ₹5K articles, raise rates after 10 projects", "Specialize in regulatory writing for higher pay", "Build recurring clients for stable income"],
    tools: ["Grammarly (editing)", "Zotero (references)", "LinkedIn (networking)", "Medium (portfolio)"],
    example: "PG residents earning ₹30-50K/month writing pharma content in evenings.",
  },
  {
    id: "telemedicine", title: "Telemedicine Practice", icon: Mic,
    earning: "₹500–₹2000 per consult", difficulty: "Easy", timeToStart: "1 week",
    description: "See patients online in your spare hours. No clinic rent, no commute, flexible timing.",
    steps: ["Register on Practo/MFine/Ayuzee or set up own booking page", "Set available slots (evenings/weekends)", "Start with ₹300-500 per consult, raise with reviews", "Add follow-up packages for recurring income", "Build your own patient base via WhatsApp"],
    tools: ["Practo/Ayuzee (platform)", "Google Meet (video)", "WhatsApp Business (followup)", "Razorpay (own payments)"],
    example: "Ayurveda doctors earning ₹40-80K/month from 2-hour evening teleconsult slots.",
  },
  {
    id: "instagram", title: "Instagram Health Educator", icon: Star,
    earning: "₹20K–₹3L/month (brand deals)", difficulty: "Medium", timeToStart: "3-6 months",
    description: "Build a health education brand. Pharma, supplement, and wellness brands pay doctors for credibility.",
    steps: ["Pick a niche + consistent visual style", "Post 1 reel/day for 90 days (use trending audio)", "Share clinical stories (anonymized), myths, tips", "Reach 10K followers → start brand collaborations", "Add link-in-bio for courses/consults"],
    tools: ["Canva (graphics)", "InShot (reels)", "Later.com (scheduling)", "Linktree (bio links)"],
    example: "Dr. Cuterus (Tanaya Narendra): Built 1M+ following with gynecology education reels.",
  },
  {
    id: "expert-witness", title: "Medico-Legal Consulting", icon: BookOpen,
    earning: "₹5K–₹50K per case", difficulty: "Hard", timeToStart: "2-3 months",
    description: "Provide expert medical opinions for legal cases, insurance claims, and corporate health.",
    steps: ["Take a medico-legal certification course", "Register with legal firms and insurance companies", "Start with insurance claim assessments", "Build reputation for court-ready expert opinions", "Charge per case + retainer for regular clients"],
    tools: ["Medical literature databases", "Legal templates", "Professional network", "Case management system"],
    example: "Senior doctors earning ₹1-2L/month from 4-5 medico-legal opinions alongside practice.",
  },
];

const SideIncomeLaunchpad = () => {
  const [selected, setSelected] = useState<IncomeStream | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl flex items-center gap-2">
          <DollarSign className="h-7 w-7 text-green-500" />
          Side-Income Launchpad
        </h1>
        <p className="text-muted-foreground">Build income streams beyond your clinic — step by step</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            You don't need to quit practice. The best side incomes for doctors leverage your existing expertise
            and fit into gaps in your schedule. Pick one, follow the steps, earn within weeks.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {INCOME_STREAMS.map((stream) => (
          <Card key={stream.id} className="cursor-pointer hover:border-primary/30 transition-all" onClick={() => setSelected(stream)}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                  <stream.icon className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="text-[10px]">{stream.difficulty}</Badge>
              </div>
              <CardTitle className="text-sm mt-2">{stream.title}</CardTitle>
              <CardDescription className="text-xs">{stream.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>💰 {stream.earning}</p>
                <p>⏱️ Start in: {stream.timeToStart}</p>
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-2 text-xs gap-1">
                View Steps <ChevronRight className="h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        {selected && (
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><selected.icon className="h-5 w-5" /> {selected.title}</DialogTitle>
              <DialogDescription>{selected.earning} · {selected.timeToStart} to start</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm">{selected.description}</p>
              <div>
                <p className="text-sm font-medium mb-2">Step-by-Step Guide</p>
                <ol className="space-y-1.5">
                  {selected.steps.map((step, i) => (
                    <li key={i} className="text-xs flex gap-2"><span className="font-bold text-primary shrink-0">{i + 1}.</span> {step}</li>
                  ))}
                </ol>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Tools You Need</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.tools.map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                </div>
              </div>
              <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-3">
                <p className="text-xs font-medium text-green-700 dark:text-green-400 flex items-center gap-1"><Lightbulb className="h-3 w-3" /> Real Example</p>
                <p className="text-xs text-green-600 dark:text-green-300 mt-1">{selected.example}</p>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default SideIncomeLaunchpad;
