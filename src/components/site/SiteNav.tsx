import { FormEvent, useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, Leaf, LogOut, Menu, Search, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { JoinDropdown, JoinRoleCards } from "@/components/site/JoinDropdown";

const utilityLinks = ["About Us", "Careers", "Blog", "Contact"];
const searchTabs = [
  { label: "Doctors", path: "/doctors" },
  { label: "Therapies", path: "/therapies" },
  { label: "Medicines", path: "/shop" },
  { label: "Courses", path: "/learning/courses" },
  { label: "Jobs", path: "/jobs" },
];

type MegaLink = { label: string; to: string };
type MegaColumn = { title: string; links?: MegaLink[]; card?: { title: string; body?: string; cta: string; to: string } };
type MegaMenu = { label: string; columns: MegaColumn[] };

const specialty = ["Spine & Joint Care", "Skin & Hair", "Women's Health (Gyno)", "Digestive Health", "Mental Wellness", "Diabetes & Lifestyle", "Child Health", "Eye & ENT"];
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
  { label: "Medicines", columns: [
    { title: "Shop by Brand", links: ["Dabur", "Himalaya", "Baidyanath", "Patanjali", "Kottakkal", "Kerala Ayurveda", "AVP", "SNA"].map((x) => ({ label: x, to: `/shop?brand=${encodeURIComponent(x)}` })) },
    { title: "Shop by Category", links: ["Immunity Boosters", "Pain & Inflammation", "Digestive Health", "Skin & Hair", "Women's Health", "Men's Health", "Classical Medicines", "Oils & Ghee"].map((x) => ({ label: x, to: `/shop?category=${encodeURIComponent(x)}` })) },
    { title: "Special", links: [{ label: "🛒 Bulk Purchase (Doctor Discounts)", to: "/bulk" }, { label: "💊 Upload Prescription", to: "/shop?upload=1" }, { label: "🎁 Offers & Deals", to: "/offers" }] },
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

const SearchBox = ({ mobile = false }: { mobile?: boolean }) => {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const submit = (path = "/doctors") => {
    const q = value.trim();
    navigate(q ? `${path}?q=${encodeURIComponent(q)}` : path);
    setFocused(false);
  };
  return (
    <form onSubmit={(e: FormEvent) => { e.preventDefault(); submit(); }} className="relative w-full">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={value} onChange={(e) => setValue(e.target.value)} onFocus={() => setFocused(true)} className="h-11 rounded-full border-border bg-background pl-11 pr-4 shadow-soft md:w-80 lg:w-[420px]" placeholder="Search doctors, therapies, medicines, colleges..." />
      {focused && (
        <div className="absolute left-0 right-0 top-12 z-[70] rounded-2xl border border-border bg-popover p-3 text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {searchTabs.map((tab) => <button key={tab.label} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => submit(tab.path)} className="rounded-full border border-border px-3 py-2 text-xs font-semibold hover:border-primary hover:bg-primary/10">{tab.label}</button>)}
          </div>
        </div>
      )}
    </form>
  );
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

export const SiteNav = ({ appLevel = false }: { appLevel?: boolean }) => {
  const { count } = useCart();
  const navigate = useNavigate();
  const navRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [dashboardPath, setDashboardPath] = useState("/dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const resolveRole = async (userId?: string) => {
      if (!userId) return setDashboardPath("/dashboard");
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
      const roles = (data ?? []).map((r) => r.role as string);
      if (roles.includes("admin")) setDashboardPath("/admin");
      else if (roles.includes("doctor")) setDashboardPath("/doctor");
      else if (roles.includes("therapist")) setDashboardPath("/therapist");
      else if (roles.includes("venue_owner")) setDashboardPath("/venue");
      else setDashboardPath("/dashboard");
    };
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user.email ?? null);
      resolveRole(data.session?.user.id);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setEmail(s?.user.email ?? null);
      resolveRole(s?.user.id);
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
          <div className="flex items-center gap-3">{utilityLinks.map((x) => <Link key={x} to={`/${x.toLowerCase().replace(/\s+/g, "-")}`} className="hover:text-primary">{x}</Link>)}<span>EN | हिं | தமிழ்</span></div>
        </div>
      </div>

      <div className="border-b border-border bg-background">
        <div className="container flex h-16 items-center gap-4">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild><Button variant="ghost" size="icon" className="md:hidden"><Menu className="h-5 w-5" /><span className="sr-only">Menu</span></Button></SheetTrigger>
            <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto p-0">
              <SheetHeader className="border-b border-border p-4 text-left"><SheetTitle className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-full gradient-leaf"><Leaf className="h-5 w-5 text-primary-foreground" /></span>Ayuzee</SheetTitle></SheetHeader>
              <div className="space-y-5 p-4"><SearchBox mobile /><div className="flex items-center gap-2"><Button variant="outline" size="icon" asChild><Link to="/cart"><ShoppingCart className="h-4 w-4" /></Link></Button><Button variant="outline" size="icon"><Bell className="h-4 w-4" /></Button></div>
                <div className="space-y-2">{megaMenus.map((menu) => <Collapsible key={menu.label}><CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-3 py-3 text-sm font-semibold">{menu.label}<ChevronDown className="h-4 w-4" /></CollapsibleTrigger><CollapsibleContent className="space-y-3 px-2 py-3">{menu.columns.flatMap((c) => c.links ?? []).map((l) => <Link key={`${menu.label}-${l.label}`} to={l.to} className="block rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary">{l.label}</Link>)}</CollapsibleContent></Collapsible>)}</div>
                <div className="space-y-2"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Join Ayuzee</p><JoinRoleCards onSelect={() => setMobileOpen(false)} /></div>
              </div>
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex shrink-0 items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-full gradient-leaf shadow-soft"><Leaf className="h-5 w-5 text-primary-foreground" /></span><span className="font-display text-2xl font-semibold tracking-tight">Ayuzee</span></Link>
          <div className="mx-auto hidden md:block"><SearchBox /></div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Cart" asChild className="relative"><Link to="/cart"><ShoppingCart className="h-5 w-5" />{count > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-secondary px-1 text-[10px] font-bold text-secondary-foreground">{count}</span>}</Link></Button>
            <Button variant="ghost" size="icon" aria-label="Notifications" className="hidden sm:inline-flex"><Bell className="h-5 w-5" /></Button>
            {email ? <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="icon" className="rounded-full font-bold">{initialsFromEmail(email)}</Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>{email}</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem asChild><Link to={dashboardPath}>My Dashboard</Link></DropdownMenuItem><DropdownMenuItem asChild><Link to="/dashboard/orders">My Orders</Link></DropdownMenuItem><DropdownMenuItem asChild><Link to="/dashboard/appointments">My Appointments</Link></DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onClick={signOut}><LogOut className="mr-2 h-4 w-4" />Logout</DropdownMenuItem></DropdownMenuContent></DropdownMenu> : <JoinDropdown />}
          </div>
        </div>
      </div>

      <div className="relative hidden h-11 border-b border-border bg-background md:block" onMouseLeave={() => setActive(null)}>
        <nav className="container flex h-full items-center justify-center gap-1">
          {megaMenus.map((menu) => <button key={menu.label} onMouseEnter={() => setActive(menu.label)} className="inline-flex h-full items-center gap-1 px-4 text-sm font-semibold text-foreground/80 transition-smooth hover:text-primary">{menu.label}<ChevronDown className="h-3.5 w-3.5" /></button>)}
        </nav>
        {active && <MegaPanel menu={megaMenus.find((m) => m.label === active)!} close={() => setActive(null)} />}
      </div>
    </header>
  );
};
