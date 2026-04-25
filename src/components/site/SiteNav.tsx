import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, Leaf, LogOut, Menu, Search, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { JoinDropdown, JoinRoleCards } from "@/components/site/JoinDropdown";
import { GlobalSearch } from "@/components/site/GlobalSearch";
import { PincodeWidget } from "@/components/site/PincodeWidget";
import { dashboardPathForRole, labelForRole, useUserRole } from "@/hooks/useUserRole";
import { BULK_BRANDS, CLASSICAL_TYPES, PATENTED_TYPES } from "@/data/bulkCatalog";
import { AyushHelpMenu } from "@/components/site/AyushHelpMenu";

const utilityLinks = ["About Us", "Careers", "Blog", "Contact"];
type MegaLink = { label: string; to: string };
type MegaColumn = { title: string; links?: MegaLink[]; card?: { title: string; body?: string; cta: string; to: string } };
type MegaMenu = { label: string; columns: MegaColumn[] };
type ConditionMenuLink = { icon: string; name: string; slug: string; system_category?: string | null };

const specialty = ["Spine & Joint Care", "Skin & Hair", "Women's Health (Gyno)", "Digestive Health", "Mental Wellness", "Diabetes & Lifestyle", "Child Health", "Eye & ENT"];
const bulkBrandLabels = ["Dabur", "Kottakkal", "Baidyanath", "Himalaya", "Dhootapapeshwar", "Arya Vaidya Pharmacy", "Nagarjuna", "Vaidyaratnam"];
const classicalLabels = ["Bhasma", "Churna", "Kashayam", "Ghrita", "Taila / Oil", "Arishta", "Guggulu", "Avaleha"];
const patentedLabels = ["Tablet", "Capsule", "Syrup", "Oil", "Ointment", "Herbal Tea"];
const fallbackConditions: ConditionMenuLink[] = [
  { icon: "🦴", name: "Arthritis & Joint Pain", slug: "arthritis-joint-pain" },
  { icon: "🔙", name: "Spine & Back Pain", slug: "spine-back-pain" },
  { icon: "🩸", name: "Diabetes", slug: "diabetes-blood-sugar" },
  { icon: "🌸", name: "PCOD / Women's Health", slug: "pcod-womens-health" },
  { icon: "🫁", name: "Digestive Health", slug: "digestive-gut-health" },
  { icon: "✨", name: "Skin Diseases", slug: "skin-diseases" },
  { icon: "💆", name: "Hair & Scalp", slug: "hair-scalp" },
  { icon: "🧠", name: "Mental Health & Stress", slug: "mental-health-stress" },
  { icon: "🛡️", name: "Immunity Boost", slug: "immunity-boost" },
  { icon: "❤️", name: "Heart & Cholesterol", slug: "heart-cholesterol" },
  { icon: "💪", name: "Men's Health", slug: "mens-health" },
  { icon: "👶", name: "Child Health", slug: "child-health" },
];

const pickBulkValue = (items: readonly string[], wanted: string) => items.find((x) => x.toLowerCase().includes(wanted.toLowerCase())) || wanted;
const bulkBrands = bulkBrandLabels.map((label) => ({ label, value: pickBulkValue(BULK_BRANDS, label) }));
const classicalTypes = classicalLabels.map((label) => ({ label, value: pickBulkValue(CLASSICAL_TYPES, label.replace(" / Oil", "")) }));
const patentedTypes = patentedLabels.map((label) => ({ label, value: pickBulkValue(PATENTED_TYPES, label) }));
const megaMenus: MegaMenu[] = [
  { label: "Find Care", columns: [
    { title: "By Doctor Type", links: [
      { label: "🩺 Ayurveda Doctors", to: "/doctors?system=Ayurveda" }, { label: "🧘 Yoga & Naturopathy", to: "/doctors?system=Yoga" }, { label: "🌿 Siddha Doctors", to: "/doctors?system=Siddha" }, { label: "🔵 Unani Doctors", to: "/doctors?system=Unani" }, { label: "💊 Homeopathy", to: "/doctors?system=Homeopathy" }, { label: "🏥 Find Nearby Clinics", to: "/clinics" },
    ] },
    { title: "By Specialty", links: specialty.map((x) => ({ label: x, to: `/doctors?specialization=${encodeURIComponent(x)}` })) },
    { title: "Featured", card: { title: "Free first consultation", body: "Start with a verified AYUSH doctor today.", cta: "Book Now", to: "/doctors" } },
  ] },
  { label: "Therapies", columns: [
    { title: "Panchakarma", links: ["🫙 Abhyanga (Full Body)", "Shirodhara", "Kati Basti", "Janu Basti", "Vamana", "Virechana", "Basti", "Nasya"].map((x) => ({ label: x, to: "/therapies?category=Panchakarma" })) },
    { title: "Specialty Therapies", links: ["Pizhichil", "Navarakizhi", "Udvartana", "Greeva Basti", "Uro Basti", "Pinda Sweda"].map((x) => ({ label: x, to: "/therapies" })) },
    { title: "Book a Therapist", links: [{ label: "Rent Therapy Room", to: "/venue/browse" }], card: { title: "Certified Therapists", body: "Doctor-recommended, certified, GPS-tracked", cta: "Find Therapist", to: "/therapist/browse" } },
  ] },
  { label: "Learn", columns: [
    { title: "For Doctors", links: [{ label: "📚 CME Courses", to: "/learning/courses?for=doctor" }, { label: "🎓 Certification Programs", to: "/learning/courses?type=certification" }, { label: "📝 Quizzes & Assessments", to: "/learning/quiz" }, { label: "🏆 My Certificates", to: "/dashboard?tab=certificates" }] },
    { title: "For Students", links: [{ label: "🎓 BAMS Study Material", to: "/learning/courses?for=student" }, { label: "📖 Research Papers", to: "/learning/blogs?type=research" }, { label: "💼 Ayurveda Jobs", to: "/jobs" }, { label: "🏫 College Directory", to: "/colleges" }] },
    { title: "Live & Events", links: [{ label: "🎙 Upcoming Webinars", to: "/learning/webinars" }, { label: "📹 Recorded Sessions", to: "/learning/courses?type=recorded" }, { label: "🗓 CME Calendar", to: "/learning/webinars" }] },
  ] },
  { label: "Community", columns: [
    { title: "Connect", links: [{ label: "📣 Doctor Feed (Case Studies)", to: "/feed" }, { label: "💬 Discussion Forum", to: "/feed?type=discussion" }, { label: "🤝 Network Partners", to: "/partner" }] },
    { title: "Knowledge", links: [{ label: "📰 Health Blogs", to: "/learning/blogs" }, { label: "🎬 Video Library", to: "/learning/blogs?type=video" }, { label: "📊 Case Studies", to: "/feed?type=case_study" }] },
    { title: "Featured", card: { title: "Clinical insights from AYUSH experts", body: "Explore case studies, wellness explainers and research updates.", cta: "Read Blog", to: "/learning/blogs" } },
  ] },
  { label: "Jobs", columns: [
    { title: "Find Jobs", links: [{ label: "🏥 Hospital Jobs", to: "/jobs?type=hospital" }, { label: "🏢 Clinic Jobs", to: "/jobs?type=clinic" }, { label: "🏨 Resort & Wellness Jobs", to: "/jobs?type=resort" }, { label: "🎓 Teaching Posts", to: "/jobs?type=teaching" }, { label: "💼 Pharma & Research", to: "/jobs?type=pharma" }] },
    { title: "Post a Job", card: { title: "Are you a hospital or clinic?", cta: "Post a Job", to: "/jobs/post" } },
    { title: "Job Alerts", card: { title: "Get AYUSH role alerts", body: "Save searches and stay ahead of new openings.", cta: "Create Alert", to: "/jobs" } },
  ] },
  { label: "Diagnosis", columns: [
    { title: "Assessments", links: [{ label: "🧬 Prakriti Assessment (Dosha Quiz)", to: "/diagnosis/prakriti" }, { label: "🔍 Symptom Checker", to: "/diagnosis/symptoms" }, { label: "📋 Health Risk Assessment", to: "/diagnosis" }] },
    { title: "Reports", links: [{ label: "My Past Assessments", to: "/dashboard?tab=assessments" }, { label: "Share Report with Doctor", to: "/doctors" }] },
  ] },
  { label: "Partner With Us", columns: [
    { title: "Join as", links: [{ label: "🏥 Hospital / Clinic", to: "/venue/auth" }, { label: "💊 Pharma Company", to: "/partner/apply?type=pharma" }, { label: "🌿 Medicine Manufacturer", to: "/partner/apply?type=manufacturer" }, { label: "🎓 Ayurveda College", to: "/partner/apply?type=college" }, { label: "🏨 Resort / Wellness Center", to: "/venue/auth" }] },
    { title: "Already a partner?", links: [{ label: "Partner Dashboard", to: "/venue" }, { label: "Track Performance", to: "/venue/revenue" }] },
  ] },
];

const initialsFromEmail = (email?: string | null) => (email?.slice(0, 2) || "AZ").toUpperCase();

const roleBadgeClass = (role: string | null) => {
  if (role === "doctor") return "border-primary/30 bg-primary/10 text-primary";
  if (role === "student") return "border-secondary/30 bg-secondary/10 text-secondary";
  if (role === "therapist") return "border-accent bg-accent text-accent-foreground";
  return "border-primary/30 bg-primary/10 text-primary";
};

const MegaPanel = ({ menu, close }: { menu: MegaMenu; close: () => void }) => (
  <div className="absolute left-0 top-full z-[60] w-screen border-b border-border bg-background shadow-lg animate-in fade-in-0 slide-in-from-top-2" onMouseLeave={close}>
    <div className="container grid gap-8 py-8 md:grid-cols-3">
      {menu.columns.map((column) => (
        <div key={column.title} className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{column.title}</h3>
          {column.card && <div className="rounded-xl border border-primary/20 bg-primary/10 p-5"><p className="font-display text-lg font-semibold text-primary">{column.card.title}</p>{column.card.body && <p className="mt-2 text-sm text-muted-foreground">{column.card.body}</p>}<Button asChild size="sm" variant="hero" className="mt-4"><Link to={column.card.to}>{column.card.cta}</Link></Button></div>}
          <div className="grid gap-1.5">
            {column.links?.map((link) => <Link key={`${column.title}-${link.label}`} to={link.to} className="rounded-lg px-2 py-1.5 text-sm text-foreground/80 transition-smooth hover:bg-primary/10 hover:text-primary">{link.label}</Link>)}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const MedicineSection = ({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) => (
  <section className="space-y-3 border-l-2 border-primary/60 pl-4">
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">{title}</h3>
      {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
    </div>
    {children}
  </section>
);

const MedicineLink = ({ to, children, close, className = "" }: { to: string; children: React.ReactNode; close: () => void; className?: string }) => (
  <Link to={to} onClick={close} className={`block rounded-lg px-2 py-1.5 text-sm text-foreground/80 transition-smooth hover:bg-primary/10 hover:text-primary ${className}`}>
    {children}
  </Link>
);

const MedicinesMegaMenu = ({ conditions, close }: { conditions: ConditionMenuLink[]; close: () => void }) => (
  <div className="fixed left-0 right-0 top-[7.25rem] z-[70] max-h-[75vh] w-screen overflow-y-auto border-b border-border bg-background shadow-lg animate-in fade-in-0 slide-in-from-top-2" onMouseLeave={close}>
    <div className="container grid gap-6 py-7 lg:grid-cols-5">
      <MedicineSection title="🛒 Bulk Purchase" subtitle="Doctor & clinic discounts">
        <div className="space-y-4">
          <div><p className="text-xs font-semibold text-muted-foreground">By Brand</p>{bulkBrands.map((x) => <MedicineLink key={x.label} to={`/bulk?brand=${encodeURIComponent(x.value)}`} close={close}>{x.label}</MedicineLink>)}<MedicineLink to="/bulk?tab=brands" close={close} className="font-semibold text-primary">View all 44 brands →</MedicineLink></div>
          <div><p className="text-xs font-semibold text-muted-foreground">Shastriya / Classical Medicines</p>{classicalTypes.map((x) => <MedicineLink key={x.label} to={`/bulk?classical=${encodeURIComponent(x.value)}`} close={close}>{x.label}</MedicineLink>)}<MedicineLink to="/bulk?tab=classical" close={close} className="font-semibold text-primary">View all classical types →</MedicineLink></div>
          <div><p className="text-xs font-semibold text-muted-foreground">Patented Medicines</p>{patentedTypes.map((x) => <MedicineLink key={x.label} to={`/bulk?patented=${encodeURIComponent(x.value)}`} close={close}>{x.label}</MedicineLink>)}<MedicineLink to="/bulk?tab=patented" close={close} className="font-semibold text-primary">View all patented types →</MedicineLink></div>
          <MedicineLink to="/bulk" close={close} className="font-bold text-primary">All Bulk Medicines →</MedicineLink>
        </div>
      </MedicineSection>
      <MedicineSection title="🩺 By Health Condition" subtitle="Find medicines for your concern">
        <div className="grid gap-1">{conditions.map((c) => <MedicineLink key={c.slug} to={`/shop/conditions/${c.slug}`} close={close}>{c.icon} {c.name}</MedicineLink>)}<MedicineLink to="/shop/conditions" close={close} className="font-semibold text-primary">View all 30 conditions →</MedicineLink></div>
      </MedicineSection>
      <MedicineSection title="🌿 By AYUSH System">
        <div className="space-y-1"><MedicineLink to="/shop?system=Ayurveda" close={close}>🌱 Ayurveda Medicines</MedicineLink><MedicineLink to="/shop?system=Homeopathy" close={close}>💊 Homeopathy</MedicineLink><MedicineLink to="/shop?system=Unani" close={close}>🌙 Unani</MedicineLink><MedicineLink to="/shop?system=Siddha" close={close}>🔵 Siddha</MedicineLink><MedicineLink to="/shop?system=Yoga" close={close}>🧘 Yoga & Naturopathy</MedicineLink></div>
        <div className="my-4 border-t border-border" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">🎁 Special Categories</h3>
        <div className="space-y-1"><MedicineLink to="/shop/treatment-kits" close={close}>📦 Treatment Kits</MedicineLink><MedicineLink to="/shop/panchakarma" close={close}>🫙 Panchakarma Medicines</MedicineLink><MedicineLink to="/shop/surgicals" close={close}>🔪 AYUSH Surgicals</MedicineLink><MedicineLink to="/shop/prescription" close={close}>💊 Upload Prescription</MedicineLink></div>
      </MedicineSection>
      <MedicineSection title="📦 My Orders">
        <div className="space-y-1"><MedicineLink to="/shop/track" close={close}>🚚 Track My Medicine Order</MedicineLink><MedicineLink to="/dashboard?tab=orders" close={close}>📋 My Order History</MedicineLink><MedicineLink to="/dashboard?tab=prescriptions" close={close}>💊 My Prescriptions</MedicineLink><MedicineLink to="/dashboard?tab=notifications" close={close}>🔔 Order Notifications</MedicineLink></div>
        <div className="my-4 border-t border-border" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">🌟 Offers & Deals</h3>
        <div className="space-y-1"><MedicineLink to="/offers" close={close}>⚡ Flash Sale</MedicineLink><MedicineLink to="/offers?type=b2g1" close={close}>🎁 Buy 2 Get 1 Offers</MedicineLink><MedicineLink to="/offers?type=bulk-deal" close={close}>💰 Bulk Deal of the Day</MedicineLink><MedicineLink to="/shop?sort=newest" close={close}>🆕 New Arrivals</MedicineLink></div>
      </MedicineSection>
      <div className="flex min-h-80 flex-col justify-between rounded-2xl bg-gradient-to-br from-primary via-accent to-secondary p-6 text-primary-foreground shadow-soft">
        <div><p className="font-display text-2xl font-semibold">🌿 Ayuzee Medicine Store</p><div className="mt-6 grid grid-cols-2 gap-2 text-xs font-semibold"><span className="rounded-full bg-background/20 px-3 py-2">5000+ Products</span><span className="rounded-full bg-background/20 px-3 py-2">44+ Brands</span><span className="rounded-full bg-background/20 px-3 py-2">Lab Tested</span><span className="rounded-full bg-background/20 px-3 py-2">Free Delivery on ₹999+</span></div></div>
        <div className="space-y-3"><Button asChild variant="secondary" className="w-full"><Link to="/shop" onClick={close}>Shop All Medicines →</Link></Button><Link to="/bulk" onClick={close} className="block text-center text-sm font-semibold underline underline-offset-4">Doctor? Get bulk rates →</Link></div>
      </div>
    </div>
  </div>
);

export const SiteNav = ({ appLevel = false }: { appLevel?: boolean }) => {
  const { count } = useCart();
  const navigate = useNavigate();
  const { role } = useUserRole();
  const navRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [conditions, setConditions] = useState<ConditionMenuLink[]>(fallbackConditions);
  const dashboardPath = dashboardPathForRole(role);
  const roleLabel = labelForRole(role);

  useEffect(() => {
    const loadProfileName = async (userId?: string) => {
      if (!userId) return setDisplayName(null);
      const { data } = await supabase.from("profiles").select("full_name").eq("user_id", userId).maybeSingle();
      setDisplayName(data?.full_name || null);
    };
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user.email ?? null);
      loadProfileName(data.session?.user.id);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setEmail(s?.user.email ?? null);
      loadProfileName(s?.user.id);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onPointer = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) setActive(null);
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, []);

  useEffect(() => {
    supabase
      .from("health_conditions")
      .select("icon,name,slug,system_category")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(12)
      .then(({ data }) => {
        if (data?.length) setConditions(data.map((c) => ({ icon: c.icon || "🌿", name: c.name, slug: c.slug, system_category: c.system_category })));
      });
  }, []);

  if (!appLevel) return null;

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header ref={navRef} className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md">
      <div className="hidden border-b border-border bg-muted/40 md:block">
        <div className="container flex h-7 items-center justify-between text-xs text-muted-foreground">
          <span>🌿 India's #1 AYUSH Aggregator Platform</span>
          <div className="flex items-center gap-3">
            {utilityLinks.map((x) => <Link key={x} to={`/${x.toLowerCase().replace(/\s+/g, "-")}`} className="hover:text-primary">{x}</Link>)}
            <Link to="/atmri-help" className="relative inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 transition-all hover:bg-amber-100">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75"></span><span className="relative inline-flex h-2 w-2 rounded-full bg-amber-600"></span></span>
              ❤️ Ayush Help
            </Link>
            <span>EN | हिं | தமிழ்</span>
          </div>
        </div>
      </div>

      <div className="border-b border-border bg-background">
        <div className="container flex h-16 items-center gap-4">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild><Button variant="ghost" size="icon" className="md:hidden"><Menu className="h-5 w-5" /><span className="sr-only">Menu</span></Button></SheetTrigger>
            <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto p-0">
              <SheetHeader className="border-b border-border p-4 text-left"><SheetTitle className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-full gradient-leaf"><Leaf className="h-5 w-5 text-primary-foreground" /></span>Ayuzee</SheetTitle></SheetHeader>
              <div className="space-y-5 p-4"><GlobalSearch className="md:w-full lg:w-full" /><div className="flex items-center gap-2"><Button variant="outline" size="icon" asChild><Link to="/cart"><ShoppingCart className="h-4 w-4" /></Link></Button><Button variant="outline" size="icon"><Bell className="h-4 w-4" /></Button></div>
                <div className="space-y-2">
                  <Collapsible><CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-3 py-3 text-sm font-semibold">Medicines<ChevronDown className="h-4 w-4" /></CollapsibleTrigger><CollapsibleContent className="space-y-3 px-2 py-3"><MedicineSection title="🛒 Bulk Purchase" subtitle="Doctor & clinic discounts"><div className="grid gap-1"><MedicineLink to="/bulk?tab=brands" close={() => setMobileOpen(false)}>By Brand</MedicineLink><MedicineLink to="/bulk?tab=classical" close={() => setMobileOpen(false)}>Shastriya / Classical Medicines</MedicineLink><MedicineLink to="/bulk?tab=patented" close={() => setMobileOpen(false)}>Patented Medicines</MedicineLink><MedicineLink to="/bulk" close={() => setMobileOpen(false)}>All Bulk Medicines →</MedicineLink></div></MedicineSection><MedicineSection title="🩺 By Health Condition"><div className="grid gap-1">{conditions.map((c) => <MedicineLink key={c.slug} to={`/shop/conditions/${c.slug}`} close={() => setMobileOpen(false)}>{c.icon} {c.name}</MedicineLink>)}<MedicineLink to="/shop/conditions" close={() => setMobileOpen(false)}>View all 30 conditions →</MedicineLink></div></MedicineSection><MedicineSection title="🌿 By AYUSH System"><div className="grid gap-1"><MedicineLink to="/shop?system=Ayurveda" close={() => setMobileOpen(false)}>🌱 Ayurveda Medicines</MedicineLink><MedicineLink to="/shop?system=Homeopathy" close={() => setMobileOpen(false)}>💊 Homeopathy</MedicineLink><MedicineLink to="/shop?system=Unani" close={() => setMobileOpen(false)}>🌙 Unani</MedicineLink><MedicineLink to="/shop?system=Siddha" close={() => setMobileOpen(false)}>🔵 Siddha</MedicineLink></div></MedicineSection><MedicineSection title="🎁 Special Categories"><div className="grid gap-1"><MedicineLink to="/shop/treatment-kits" close={() => setMobileOpen(false)}>📦 Treatment Kits</MedicineLink><MedicineLink to="/shop/panchakarma" close={() => setMobileOpen(false)}>🫙 Panchakarma Medicines</MedicineLink><MedicineLink to="/shop/surgicals" close={() => setMobileOpen(false)}>🔪 AYUSH Surgicals</MedicineLink><MedicineLink to="/shop/prescription" close={() => setMobileOpen(false)}>💊 Upload Prescription</MedicineLink></div></MedicineSection><MedicineSection title="📦 Track & Manage"><div className="grid gap-1"><MedicineLink to="/shop/track" close={() => setMobileOpen(false)}>🚚 Track My Medicine Order</MedicineLink><MedicineLink to="/dashboard?tab=orders" close={() => setMobileOpen(false)}>📋 My Order History</MedicineLink><MedicineLink to="/offers" close={() => setMobileOpen(false)}>⚡ Flash Sale</MedicineLink></div></MedicineSection></CollapsibleContent></Collapsible>
                  {megaMenus.map((menu) => <Collapsible key={menu.label}><CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-3 py-3 text-sm font-semibold">{menu.label}<ChevronDown className="h-4 w-4" /></CollapsibleTrigger><CollapsibleContent className="space-y-3 px-2 py-3">{menu.columns.flatMap((c) => c.links ?? []).map((l) => <Link key={`${menu.label}-${l.label}`} to={l.to} className="block rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary">{l.label}</Link>)}</CollapsibleContent></Collapsible>)}
                </div>
                {email ? (
                  <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
                    <div>
                      <p className="truncate text-sm font-semibold">{displayName || email}</p>
                      <Badge variant="outline" className={roleBadgeClass(role)}>{roleLabel}</Badge>
                    </div>
                    <Button asChild className="w-full" onClick={() => setMobileOpen(false)}><Link to={dashboardPath}>My Dashboard</Link></Button>
                    <Button variant="outline" className="w-full" onClick={() => { setMobileOpen(false); signOut(); }}>Logout</Button>
                  </div>
                ) : (
                  <div className="space-y-2"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Join Ayuzee</p><JoinRoleCards onSelect={() => setMobileOpen(false)} /></div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex shrink-0 items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-full gradient-leaf shadow-soft"><Leaf className="h-5 w-5 text-primary-foreground" /></span><span className="font-display text-2xl font-semibold tracking-tight">Ayuzee</span></Link>
          <div className="mx-auto hidden md:block"><GlobalSearch /></div>
          {mobileSearchOpen && <div className="absolute left-4 right-4 top-[4.5rem] z-[90] md:hidden"><GlobalSearch autoFocus className="md:w-full lg:w-full" /></div>}
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden lg:block"><PincodeWidget variant="mini" /></div>
            <Button variant="ghost" size="icon" aria-label="Search" className="md:hidden" onClick={() => setMobileSearchOpen((v) => !v)}><Search className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" aria-label="Cart" asChild className="relative"><Link to="/cart"><ShoppingCart className="h-5 w-5" />{count > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-secondary px-1 text-[10px] font-bold text-secondary-foreground">{count}</span>}</Link></Button>
            <Button variant="ghost" size="icon" aria-label="Notifications" className="hidden sm:inline-flex"><Bell className="h-5 w-5" /></Button>
            {email ? <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" className="gap-2 rounded-full"><span className="font-bold">{initialsFromEmail(email)}</span><Badge variant="outline" className={roleBadgeClass(role)}>{roleLabel}</Badge></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel><div className="max-w-56"><p className="truncate">{displayName || email}</p><p className="truncate text-xs font-normal text-muted-foreground">{email}</p></div></DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem asChild><Link to={dashboardPath}>My Dashboard</Link></DropdownMenuItem><DropdownMenuItem asChild><Link to="/dashboard/orders">My Orders</Link></DropdownMenuItem><DropdownMenuItem asChild><Link to="/dashboard/appointments">My Appointments</Link></DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onClick={signOut}><LogOut className="mr-2 h-4 w-4" />Logout</DropdownMenuItem></DropdownMenuContent></DropdownMenu> : <JoinDropdown />}
          </div>
        </div>
      </div>

      <div className="relative hidden h-11 border-b border-border bg-background md:block" onMouseLeave={() => setActive(null)}>
        <nav className="container flex h-full items-center justify-center gap-1">
          {megaMenus.slice(0, 2).map((menu) => <button key={menu.label} onMouseEnter={() => setActive(menu.label)} className="inline-flex h-full items-center gap-1 px-4 text-sm font-semibold text-foreground/80 transition-smooth hover:text-primary">{menu.label}<ChevronDown className="h-3.5 w-3.5" /></button>)}
          <button onMouseEnter={() => setActive("Medicines")} className="inline-flex h-full items-center gap-1 px-4 text-sm font-semibold text-foreground/80 transition-smooth hover:text-primary">Medicines<ChevronDown className="h-3.5 w-3.5" /></button>
          {megaMenus.slice(2).map((menu) => <button key={menu.label} onMouseEnter={() => setActive(menu.label)} className="inline-flex h-full items-center gap-1 px-4 text-sm font-semibold text-foreground/80 transition-smooth hover:text-primary">{menu.label}<ChevronDown className="h-3.5 w-3.5" /></button>)}
        </nav>
      <div className="relative hidden h-11 border-b border-border bg-background md:block" onMouseLeave={() => setActive(null)}>
        <nav className="container flex h-full items-center justify-center gap-1">
          {megaMenus.slice(0, 2).map((menu) => <button key={menu.label} onMouseEnter={() => setActive(menu.label)} className="inline-flex h-full items-center gap-1 px-4 text-sm font-semibold text-foreground/80 transition-smooth hover:text-primary">{menu.label}<ChevronDown className="h-3.5 w-3.5" /></button>)}
          <button onMouseEnter={() => setActive("Medicines")} className="inline-flex h-full items-center gap-1 px-4 text-sm font-semibold text-foreground/80 transition-smooth hover:text-primary">Medicines<ChevronDown className="h-3.5 w-3.5" /></button>
          {megaMenus.slice(2).map((menu) => <button key={menu.label} onMouseEnter={() => setActive(menu.label)} className="inline-flex h-full items-center gap-1 px-4 text-sm font-semibold text-foreground/80 transition-smooth hover:text-primary">{menu.label}<ChevronDown className="h-3.5 w-3.5" /></button>)}
          <div onMouseEnter={() => setActive(null)}><AyushHelpMenu /></div>
        </nav>
        {active === "Medicines" ? <MedicinesMegaMenu conditions={conditions} close={() => setActive(null)} /> : active && <MegaPanel menu={megaMenus.find((m) => m.label === active)!} close={() => setActive(null)} />}
      </div>
    </header>
  );
};
