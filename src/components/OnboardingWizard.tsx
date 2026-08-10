import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Stethoscope, User, GraduationCap, Building2, Sparkles,
  CheckCircle, ArrowRight, X, ListChecks, Target, Calendar,
  Brain, Heart, BarChart3, BookOpen,
} from "lucide-react";

type OnboardingStep = {
  title: string;
  description: string;
  icon: any;
  tip: string;
};

type PortalConfig = {
  portalName: string;
  welcomeMessage: string;
  color: string;
  icon: any;
  steps: OnboardingStep[];
};

const PORTAL_CONFIGS: Record<string, PortalConfig> = {
  doctor: {
    portalName: "Doctor Portal",
    welcomeMessage: "Welcome, Doctor! Let's set up your practice dashboard.",
    color: "from-teal-500 to-emerald-600",
    icon: Stethoscope,
    steps: [
      { title: "Complete Your Profile", description: "Add your qualifications, specialties, and clinic details so patients can find you.", icon: User, tip: "Go to My Profile in the sidebar" },
      { title: "Set Up Appointments", description: "Configure your availability slots so patients can book consultations online.", icon: Calendar, tip: "Visit Appointment Calendar to set time slots" },
      { title: "Explore Task Tracker", description: "Manage clinic tasks, follow-ups, and admin work with the All-in-One Task Tracker.", icon: ListChecks, tip: "Click 'My Task Tracker' in sidebar" },
      { title: "Try Pomodoro for Focus", description: "Use 25-minute focused sessions for paperwork, research, or blog writing.", icon: Brain, tip: "Task Tracker → Pomodoro Timer" },
      { title: "Start Your Clinic SOP", description: "Create standard operating procedures for opening/closing and consultation flow.", icon: Target, tip: "Task Tracker → SOP Checklists" },
    ],
  },
  patient: {
    portalName: "Patient Dashboard",
    welcomeMessage: "Welcome! Let's help you stay on top of your health.",
    color: "from-blue-500 to-indigo-600",
    icon: User,
    steps: [
      { title: "Complete Your Profile", description: "Add your health details, allergies, and current medications for better care.", icon: User, tip: "Go to My Profile" },
      { title: "Track Your Medicines", description: "Use the Medicine Diary to log daily medication adherence.", icon: Heart, tip: "Visit Medicine Diary in sidebar" },
      { title: "Set Health Goals", description: "Use the planner to set goals like daily exercise, water intake, or diet targets.", icon: Target, tip: "My Planner → Goals" },
      { title: "Build Healthy Habits", description: "Track habits like meditation, exercise, and medication with streak tracking.", icon: CheckCircle, tip: "My Planner → Habits Tracker" },
      { title: "Book Your First Appointment", description: "Find an AYUSH doctor and book a consultation.", icon: Stethoscope, tip: "Go to Find Doctors from the menu" },
    ],
  },
  student: {
    portalName: "Student Hub",
    welcomeMessage: "Welcome, future Vaidya! Let's ace your studies.",
    color: "from-purple-500 to-violet-600",
    icon: GraduationCap,
    steps: [
      { title: "Take the Daily Quiz", description: "Start building your streak — earn coins and XP with daily AYUSH quizzes.", icon: Brain, tip: "Daily Quiz in the sidebar" },
      { title: "Set Up Study Planner", description: "Plan your week with the Task Tracker — assignments, exams, and revision.", icon: Calendar, tip: "Task Tracker Pro in sidebar" },
      { title: "Join a Study Group", description: "Collaborate with peers on difficult topics and case studies.", icon: BookOpen, tip: "Study Groups in sidebar" },
      { title: "Track Your Progress", description: "See your XP, streaks, and achievements on the Progress page.", icon: BarChart3, tip: "My Progress & XP in sidebar" },
      { title: "Explore Mentorship", description: "Connect with senior doctors and practitioners for guidance.", icon: Sparkles, tip: "Mentorship in sidebar" },
    ],
  },
  hms: {
    portalName: "HMS / Beyond",
    welcomeMessage: "Welcome! Let's configure your hospital management system.",
    color: "from-amber-500 to-orange-600",
    icon: Building2,
    steps: [
      { title: "Set Up Your Branch", description: "Configure hospital profile, departments, and working hours.", icon: Building2, tip: "Dashboard → Hospital Profile" },
      { title: "Add Staff Members", description: "Register doctors, nurses, and support staff with their roles.", icon: User, tip: "Dashboard → User Management" },
      { title: "Configure Appointments", description: "Set up consultation slots, token system, and online booking.", icon: Calendar, tip: "Doctor tab → Appointments" },
      { title: "Organize with Task Tracker", description: "Use SOP Checklists for daily procedures and Kanban for team tasks.", icon: ListChecks, tip: "More → All-in-One Tasks" },
      { title: "Explore MIS Reports", description: "View collection reports, patient analytics, and operational metrics.", icon: BarChart3, tip: "MIS tab for all reports" },
    ],
  },
  beyond: {
    portalName: "Beyond Praxis",
    welcomeMessage: "Welcome to your personal growth platform!",
    color: "from-rose-500 to-pink-600",
    icon: Sparkles,
    steps: [
      { title: "Assess Your Life Balance", description: "Take the Wheel of Life assessment to identify areas that need attention.", icon: Target, tip: "Wheel of Life in sidebar" },
      { title: "Start a Guided Pathway", description: "Choose a learning pathway aligned with your goals.", icon: BookOpen, tip: "Guided Pathways in sidebar" },
      { title: "Set Up Your Planner", description: "Use the All-in-One Task Tracker for goals, habits, and productivity.", icon: ListChecks, tip: "All-in-One Tasks in sidebar" },
      { title: "Join a Coaching Cohort", description: "Group coaching for accountability and growth (Pro feature).", icon: Heart, tip: "Coaching Cohorts in sidebar" },
      { title: "Track Your XP", description: "Earn XP across modules — compete on the leaderboard!", icon: BarChart3, tip: "Leaderboard in sidebar" },
    ],
  },
};

type Props = {
  portal: "doctor" | "patient" | "student" | "hms" | "beyond";
};

/**
 * Onboarding Wizard — shown on first visit to each portal.
 * Stores completion in localStorage so it only shows once.
 */
const OnboardingWizard = ({ portal }: Props) => {
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const storageKey = `ayuzee_onboarding_${portal}`;
  const config = PORTAL_CONFIGS[portal];

  useEffect(() => {
    const done = localStorage.getItem(storageKey);
    if (!done) {
      // Show after a short delay
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(storageKey, "true");
  };

  const nextStep = () => {
    setCompletedSteps(prev => [...prev, currentStep]);
    if (currentStep < config.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      dismiss();
    }
  };

  const skipAll = () => dismiss();

  if (!visible || !config) return null;

  const step = config.steps[currentStep];
  const progress = ((currentStep + 1) / config.steps.length) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <CardContent className="p-0">
          {/* Header */}
          <div className={`bg-gradient-to-r ${config.color} p-6 text-white rounded-t-xl relative`}>
            <Button size="icon" variant="ghost" className="absolute top-3 right-3 text-white/70 hover:text-white hover:bg-white/10" onClick={skipAll}>
              <X className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3 mb-3">
              <config.icon className="h-8 w-8" />
              <div>
                <p className="text-xs font-medium opacity-80">GETTING STARTED</p>
                <h2 className="text-lg font-bold">{config.portalName}</h2>
              </div>
            </div>
            <p className="text-sm opacity-90">{config.welcomeMessage}</p>
            <div className="mt-4">
              <Progress value={progress} className="h-1.5 bg-white/20" />
              <p className="text-[10px] mt-1 opacity-70">Step {currentStep + 1} of {config.steps.length}</p>
            </div>
          </div>

          {/* Step Content */}
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-muted shrink-0">
                <step.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-base">{step.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                <p className="text-xs text-primary mt-2 font-medium">Tip: {step.tip}</p>
              </div>
            </div>

            {/* Step dots */}
            <div className="flex items-center justify-center gap-1.5">
              {config.steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    i === currentStep ? "w-6 bg-primary" :
                    completedSteps.includes(i) ? "w-2 bg-green-500" :
                    "w-2 bg-muted-foreground/20"
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={skipAll}>
                Skip all
              </Button>
              <Button onClick={nextStep} className={`bg-gradient-to-r ${config.color} text-white`}>
                {currentStep === config.steps.length - 1 ? (
                  <><CheckCircle className="mr-1 h-4 w-4" /> Get Started</>
                ) : (
                  <>Next <ArrowRight className="ml-1 h-4 w-4" /></>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingWizard;
