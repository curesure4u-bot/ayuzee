import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Stethoscope,
  UserPlus,
  Settings,
  Users,
  HandHeart,
  Pill,
  FlaskConical,
  Heart,
  Activity,
  Printer,
  ArrowLeft,
  Wallet,
  Package,
  BedDouble,
  Sparkles,
  BarChart3,
  Globe,
  Shield,
  Brain,
  ScanLine,
  GraduationCap,
} from "lucide-react";

const guides = [
  {
    title: "Reception",
    description: "Patient registration, appointment scheduling, token management, and front-desk operations.",
    icon: UserPlus,
    color: "bg-blue-500/10 text-blue-600",
    path: "/guides/reception",
    roles: ["Receptionist", "Front Desk"],
    estimatedTime: "15 min",
  },
  {
    title: "Doctor",
    description: "Consultations, prescriptions, case sheets, EMR, and clinical decision support.",
    icon: Stethoscope,
    color: "bg-green-500/10 text-green-600",
    path: "/guides/doctor",
    roles: ["Doctor", "Consultant"],
    estimatedTime: "20 min",
  },
  {
    title: "HMS Admin",
    description: "Hospital setup, masters configuration, billing, MIS reports, and system administration.",
    icon: Settings,
    color: "bg-purple-500/10 text-purple-600",
    path: "/guides/hms-admin",
    roles: ["Admin", "Hospital Manager"],
    estimatedTime: "25 min",
  },
  {
    title: "HRMS",
    description: "Employee management, attendance, payroll, leave, duty roster, and performance tracking.",
    icon: Users,
    color: "bg-orange-500/10 text-orange-600",
    path: "/guides/hrms",
    roles: ["HR Manager", "Admin"],
    estimatedTime: "20 min",
  },
  {
    title: "Therapist",
    description: "Panchakarma scheduling, therapy sessions, patient tracking, and treatment documentation.",
    icon: HandHeart,
    color: "bg-teal-500/10 text-teal-600",
    path: "/guides/therapist",
    roles: ["Therapist", "Panchakarma Staff"],
    estimatedTime: "15 min",
  },
  {
    title: "Pharmacy",
    description: "Stock management, sales, purchase orders, GRN, dispensing, and inventory control.",
    icon: Pill,
    color: "bg-red-500/10 text-red-600",
    path: "/guides/pharmacy",
    roles: ["Pharmacist", "Store Manager"],
    estimatedTime: "20 min",
  },
  {
    title: "Lab & Diagnostics",
    description: "Test orders, sample collection, result entry, report generation, and QC workflows.",
    icon: FlaskConical,
    color: "bg-indigo-500/10 text-indigo-600",
    path: "/guides/lab",
    roles: ["Lab Technician", "Pathologist"],
    estimatedTime: "20 min",
  },
  {
    title: "Patient",
    description: "Booking appointments, viewing prescriptions, ordering medicines, and managing health records.",
    icon: Heart,
    color: "bg-pink-500/10 text-pink-600",
    path: "/guides/patient",
    roles: ["Patient", "Caregiver"],
    estimatedTime: "10 min",
  },
  {
    title: "Spine AYUSH",
    description: "Complete spine care playbook: AI Assessment, 7-System Examination, Protocols, Franchise KPIs, and Outcomes.",
    icon: Activity,
    color: "bg-blue-500/10 text-blue-700",
    path: "/guides/spine-ayush",
    roles: ["Doctor", "Therapist", "Manager"],
    estimatedTime: "25 min",
  },
  {
    title: "Billing & Accounts",
    description: "Day-end reconciliation, insurance claims, GST compliance, advance/refund flow, and financial reporting.",
    icon: Wallet,
    color: "bg-emerald-500/10 text-emerald-600",
    path: "/guides/billing",
    roles: ["Accounts Staff", "Cashier"],
    estimatedTime: "20 min",
  },
  {
    title: "Stock & Purchase",
    description: "Complete procurement cycle: Quotation → PO → GRN → Goods Return, supplier management, inter-store transfers.",
    icon: Package,
    color: "bg-amber-500/10 text-amber-600",
    path: "/guides/stock-purchase",
    roles: ["Purchase Manager", "Store Keeper"],
    estimatedTime: "20 min",
  },
  {
    title: "IPD & Nursing",
    description: "Admission → Ward → Nursing station → Diet orders → OT → Blood bank → Discharge workflow.",
    icon: BedDouble,
    color: "bg-violet-500/10 text-violet-600",
    path: "/guides/ipd-nursing",
    roles: ["Nurse", "Ward In-charge"],
    estimatedTime: "20 min",
  },
  {
    title: "Panchakarma Ops",
    description: "Consent → Scheduling → Multi-day protocols → Room/resource management → Three-stage documentation.",
    icon: Sparkles,
    color: "bg-yellow-500/10 text-yellow-700",
    path: "/guides/panchakarma-ops",
    roles: ["PK Coordinator", "Therapist Lead"],
    estimatedTime: "20 min",
  },
  {
    title: "MIS & Analytics",
    description: "How to read reports, set up scheduled alerts, use AI queries, and configure branch comparisons.",
    icon: BarChart3,
    color: "bg-sky-500/10 text-sky-600",
    path: "/guides/mis-analytics",
    roles: ["Admin", "Hospital Manager"],
    estimatedTime: "18 min",
  },
  {
    title: "Online Booking",
    description: "Patient self-booking, online payments, WhatsApp notifications, teleconsult, and reception handling.",
    icon: Globe,
    color: "bg-cyan-500/10 text-cyan-600",
    path: "/guides/online-booking",
    roles: ["Receptionist", "Marketing"],
    estimatedTime: "12 min",
  },
  {
    title: "ABDM & Compliance",
    description: "ABHA ID, health record sharing, NABH documentation, audit trail, and regulatory requirements.",
    icon: Shield,
    color: "bg-slate-500/10 text-slate-600",
    path: "/guides/abdm-compliance",
    roles: ["Admin", "Compliance Officer"],
    estimatedTime: "15 min",
  },
  {
    title: "AI Tools",
    description: "How to use AI Scribe, CDSS, Copilot, Records Analyser, Voice Interface, and other AI features.",
    icon: Brain,
    color: "bg-purple-500/10 text-purple-600",
    path: "/guides/ai-tools",
    roles: ["Doctor", "All Staff"],
    estimatedTime: "15 min",
  },
  {
    title: "Radiology & Imaging",
    description: "Worklist management, structured reporting, PACS image archive, and clinical integration.",
    icon: ScanLine,
    color: "bg-rose-500/10 text-rose-600",
    path: "/guides/radiology",
    roles: ["Radiologist", "Radiology Tech"],
    estimatedTime: "12 min",
  },
  {
    title: "Student Hub",
    description: "BAMS student platform: quizzes, competitions, study groups, internships, research, and gamification.",
    icon: GraduationCap,
    color: "bg-indigo-500/10 text-indigo-600",
    path: "/guides/student-hub",
    roles: ["Student", "Faculty"],
    estimatedTime: "15 min",
  },
];

const QuickStartGuides = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link to="/hms">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to HMS
            </Link>
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Quick Start Guides</h1>
              <p className="text-muted-foreground">
                In-app training documentation for all Ayuzee HMS modules
              </p>
            </div>
          </div>
        </div>

        {/* Print button */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Select a module below to view step-by-step instructions for your role.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="hidden sm:flex"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print All
          </Button>
        </div>

        {/* Guide cards grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {guides.map((guide) => (
            <Link key={guide.path} to={guide.path} className="group">
              <Card className="h-full transition-all hover:shadow-md hover:border-primary/30 group-hover:-translate-y-0.5">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`grid h-10 w-10 place-items-center rounded-lg ${guide.color}`}>
                      <guide.icon className="h-5 w-5" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {guide.estimatedTime}
                    </Badge>
                  </div>
                  <CardTitle className="text-base mt-3">{guide.title}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    {guide.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-1">
                    {guide.roles.map((role) => (
                      <Badge key={role} variant="outline" className="text-[10px] font-normal">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-8 rounded-lg border bg-muted/30 p-4">
          <h3 className="font-medium text-sm mb-1">Need help?</h3>
          <p className="text-xs text-muted-foreground">
            Each guide includes step-by-step workflows, keyboard shortcuts, and tips for your daily tasks.
            For personalized training, contact your hospital admin or reach out to{" "}
            <a href="mailto:support@ayuzee.com" className="text-primary underline">
              support@ayuzee.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuickStartGuides;
