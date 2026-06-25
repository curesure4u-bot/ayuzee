import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, ShieldCheck, Lock, Tag, Stethoscope, Package, Building2, Lightbulb,
  FileText, Pill, Warehouse, BadgePercent, Receipt, CreditCard, Handshake,
  Building, BedDouble, ClipboardPlus, MapPin, LayoutTemplate, MessageSquare,
  Mail, BarChart2, Monitor, Hash, DollarSign, UserRound, Zap, ArrowRight,
} from "lucide-react";

type CardDef = { title: string; description: string; href: string; icon: any };
type Section = { heading: string; emoji: string; cards: CardDef[] };

const SECTIONS: Section[] = [
  {
    heading: "User & Access",
    emoji: "👥",
    cards: [
      { title: "Users", description: "Manage all user roles and permissions", href: "/admin/users", icon: Users },
      { title: "HMS Access", description: "Grant HMS Tools Ultra access to centers and staff", href: "/admin/hms-access", icon: ShieldCheck },
      { title: "Trusted IP", description: "Restrict HMS access to approved clinic IP addresses", href: "/admin/master-management/trusted-ip", icon: Lock },
      { title: "Label Master", description: "Color-coded tags for patients, documents, orders", href: "/admin/master-management/labels", icon: Tag },
    ],
  },
  {
    heading: "Clinical",
    emoji: "🏥",
    cards: [
      { title: "Treatment Master", description: "AYUSH procedures and therapy types with standard charges", href: "/admin/treatment-systems", icon: Stethoscope },
      { title: "Package Master", description: "Health packages — Panchakarma, Spine Care, Wellness", href: "/admin/master-management/packages", icon: Package },
      { title: "Department Master", description: "OPD, Panchakarma, Yoga, Pharmacy departments", href: "/admin/master-management/departments", icon: Building2 },
      { title: "Suggestion Master", description: "Autocomplete for complaints, diagnosis, diet advice", href: "/admin/master-management/suggestions", icon: Lightbulb },
      { title: "Form Master", description: "Custom forms — consent, intake, discharge, referral", href: "/admin/master-management/forms", icon: FileText },
    ],
  },
  {
    heading: "Pharmacy & Stock",
    emoji: "💊",
    cards: [
      { title: "Product Master", description: "AYUSH medicine catalogue for prescriptions and billing", href: "/admin/essential-drugs", icon: Pill },
      { title: "Store Master", description: "Pharmacy stores, dispensaries, raw material stores", href: "/admin/master-management/stores", icon: Warehouse },
    ],
  },
  {
    heading: "Billing & Finance",
    emoji: "💰",
    cards: [
      { title: "Rate Plans", description: "Standard, corporate, insurance, franchise pricing", href: "/admin/master-management/rate-plans", icon: BadgePercent },
      { title: "Tax Master", description: "GST slabs for consultations, medicines, therapies", href: "/admin/master-management/tax", icon: Receipt },
      { title: "Billing Master", description: "Payment types, discounts, expenses, bill series", href: "/admin/master-management/billing", icon: CreditCard },
      { title: "Settlement", description: "Payment terms for insurance, corporate, franchisee", href: "/admin/master-management/settlement", icon: Handshake },
      { title: "B2B & Insurance", description: "Corporate and insurance partner configuration", href: "/admin/master-management/insurance", icon: Building },
    ],
  },
  {
    heading: "Hospital & Ward",
    emoji: "🏨",
    cards: [
      { title: "Ward Master", description: "15-bed ward layout with real-time bed status map", href: "/admin/master-management/wards", icon: BedDouble },
      { title: "IP Admission", description: "Inpatient admission types, deposits, discharge rules", href: "/admin/master-management/ip-admission-types", icon: ClipboardPlus },
      { title: "Area Master", description: "Service areas and zones for Tamil Nadu operations", href: "/admin/master-management/areas", icon: MapPin },
    ],
  },
  {
    heading: "Content & Templates",
    emoji: "📋",
    cards: [
      { title: "Templates", description: "Prescription, discharge summary, consent form templates", href: "/admin/master-management/templates", icon: LayoutTemplate },
      { title: "WhatsApp", description: "Automated WhatsApp messages for all clinic events", href: "/admin/master-management/whatsapp-templates", icon: MessageSquare },
      { title: "Email", description: "Email templates and End-of-Day report emails", href: "/admin/master-management/email-templates", icon: Mail },
      { title: "EOD Reports", description: "Auto-email daily summary reports per branch", href: "/admin/master-management/reports-config", icon: BarChart2 },
      { title: "Token Display", description: "Waiting room TV display screen configuration", href: "/admin/master-management/token-display", icon: Monitor },
    ],
  },
  {
    heading: "System Config",
    emoji: "🔧",
    cards: [
      { title: "Bill Series", description: "Bill numbering format per branch and financial year", href: "/admin/master-management/billing#bill-series", icon: Hash },
      { title: "Currency", description: "INR, USD, AED, SAR for NRI and international patients", href: "/admin/master-management/currency", icon: DollarSign },
      { title: "Patient Config", description: "Patient sources, ID proofs, membership/loyalty plans", href: "/admin/master-management/patient-config", icon: UserRound },
    ],
  },
];

const AdminMasterManagement = () => {
  return (
    <div className="mx-auto max-w-7xl space-y-8 p-1">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-display text-2xl font-bold">⚙️ HMS Tools Ultra — Master Management</h1>
          <Badge className="bg-primary/10 text-primary border-primary/30">
            <Zap className="mr-1 h-3 w-3" />HMS Tools Ultra
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure all system settings — billing, templates, wards, rates, and more. Settings apply across all branches.
        </p>
      </div>

      {SECTIONS.map((section) => (
        <section key={section.heading} className="space-y-3">
          <h2 className="font-display text-lg font-bold">
            <span className="mr-1">{section.emoji}</span>
            {section.heading}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {section.cards.map((c) => (
              <Card key={c.title} className="group p-4 transition hover:border-primary/40 hover:shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold leading-tight">{c.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{c.description}</p>
                  </div>
                </div>
                <Button asChild size="sm" variant="outline" className="mt-3 w-full">
                  <Link to={c.href}>
                    Manage <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default AdminMasterManagement;
