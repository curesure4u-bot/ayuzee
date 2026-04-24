import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, HeartPulse, PackageCheck, ShieldCheck, Stethoscope } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Footer } from "@/components/site/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";

interface KitProduct { id: string; name: string; brand: string; category: string; description: string | null; price: number; discount_price: number | null; image_url: string | null; unit: string | null; health_conditions: string[] | null; }

const groups = [
  { title: "Panchakarma Kits", items: ["Janu Basti Kit", "Kati Basti Kit", "Shirodhara Kit", "Navarakizhi Kit"] },
  { title: "Disease Kits", items: ["Arthritis Kit", "Diabetes Kit", "PCOD Kit", "Liver Detox Kit"] },
  { title: "Wellness Kits", items: ["Immunity Kit", "Stress Relief Kit", "Digestive Health Kit"] },
  { title: "Seasonal Kits", items: ["Monsoon Immunity", "Winter Warmth", "Summer Cooling"] },
];
const placeholders = ["Janu Basti Complete Kit", "Shirodhara Therapy Kit", "Arthritis Relief Kit", "Diabetes Management Kit", "PCOD Balance Kit", "Liver Detox Kit"];
const emailSchema = z.string().trim().email().max(255);
const formatINR = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);

const TreatmentKits = () => {
  const { addItem } = useCart();
  const [kits, setKits] = useState<KitProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState("All Kits");
  const [emails, setEmails] = useState<Record<string, string>>({});

  useEffect(() => {
    document.title = "Ayurvedic Treatment Kits — Ayuzee";
    supabase.from("products").select("id,name,brand,category,description,price,discount_price,image_url,unit,health_conditions").eq("product_type", "treatment_kit").gt("stock", 0).order("created_at", { ascending: false }).then(({ data }) => {
      setKits((data as KitProduct[]) ?? []);
      setLoading(false);
    });
  }, []);

  const filteredKits = useMemo(() => {
    if (activeGroup === "All Kits") return kits;
    const names = groups.find((group) => group.title === activeGroup)?.items ?? [];
    return kits.filter((kit) => names.some((name) => `${kit.name} ${kit.category}`.toLowerCase().includes(name.split(" ")[0].toLowerCase())));
  }, [activeGroup, kits]);

  const kitContents = (kit: KitProduct) => (kit.description ?? "").split(/\n+/).map((line) => line.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);

  const buyKit = (kit: KitProduct) => {
    addItem({ id: kit.id, name: kit.name, brand: kit.brand, unit: kit.unit, price: kit.discount_price ?? kit.price }, 1);
    toast.success(`${kit.name} added to cart`);
  };

  const joinWaitlist = async (kitName: string) => {
    const parsed = emailSchema.safeParse(emails[kitName] ?? "");
    if (!parsed.success) return toast.error("Enter a valid email");
    const { data: session } = await supabase.auth.getSession();
    const { error } = await (supabase as any).from("treatment_kit_waitlist").insert({ email: parsed.data, kit_name: kitName, user_id: session.session?.user.id ?? null });
    if (error && !error.message.toLowerCase().includes("duplicate")) return toast.error(error.message);
    toast.success("We'll notify you when this kit launches");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <section className="border-b border-border bg-background">
        <div className="container py-10 md:py-14">
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground"><Link to="/" className="text-primary hover:underline">Home</Link><ChevronRight className="h-3.5 w-3.5" /><Link to="/shop" className="text-primary hover:underline">Medicines</Link><ChevronRight className="h-3.5 w-3.5" /><span>Treatment Kits</span></div>
          <h1 className="max-w-4xl font-display text-3xl md:text-5xl">Ayurvedic Treatment Kits</h1>
          <p className="mt-3 max-w-3xl text-muted-foreground md:text-lg">Complete medicine packages for specific health conditions, curated by doctors</p>
        </div>
      </section>

      <main className="container py-8">
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="rounded-xl border border-border bg-background p-4 lg:sticky lg:top-24 lg:self-start">
            <Button variant={activeGroup === "All Kits" ? "default" : "ghost"} className="mb-3 w-full justify-start" onClick={() => setActiveGroup("All Kits")}>All Kits</Button>
            {groups.map((group) => <div key={group.title} className="mb-5"><p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{group.title}</p>{group.items.map((item) => <button key={item} onClick={() => setActiveGroup(group.title)} className="block w-full rounded-md px-2 py-1.5 text-left text-sm text-foreground/80 hover:bg-accent">{item}</button>)}</div>)}
          </aside>

          <section>
            {loading ? <p className="text-sm text-muted-foreground">Loading treatment kits…</p> : filteredKits.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredKits.map((kit) => {
                  const contents = kitContents(kit);
                  const kitPrice = kit.discount_price ?? kit.price;
                  const originalValue = Math.round(kit.price * 1.18);
                  return <Card key={kit.id} className="overflow-hidden"><CardContent className="p-4"><Link to={`/shop/${kit.id}`} className="mb-4 grid aspect-video place-items-center overflow-hidden rounded-lg bg-accent">{kit.image_url ? <img src={kit.image_url} alt={kit.name} className="h-full w-full object-contain p-3" loading="lazy" /> : <PackageCheck className="h-12 w-12 text-primary/40" />}</Link><Badge variant="secondary" className="mb-2"><Stethoscope className="mr-1 h-3.5 w-3.5" /> Curated by doctors</Badge><h2 className="font-semibold">{kit.name}</h2><p className="mt-1 text-sm text-muted-foreground">{kit.health_conditions?.[0] || kit.category}</p><div className="mt-3 flex items-baseline gap-2"><span className="text-lg font-bold text-primary">{formatINR(kitPrice)}</span><span className="text-xs text-muted-foreground line-through">{formatINR(originalValue)}</span></div><p className="text-sm font-medium text-secondary">Save {formatINR(originalValue - kitPrice)}</p><Collapsible><CollapsibleTrigger asChild><Button variant="ghost" className="mt-2 px-0">View Contents</Button></CollapsibleTrigger><CollapsibleContent><ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">{(contents.length ? contents : ["Doctor-selected medicines", "Usage guidance", "Support for your treatment plan"]).map((item) => <li key={item}>{item}</li>)}</ul></CollapsibleContent></Collapsible><Button className="w-full rounded-full" onClick={() => buyKit(kit)}>Buy Kit</Button></CardContent></Card>;
                })}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {placeholders.map((kit) => <Card key={kit} className="overflow-hidden"><CardContent className="p-5"><div className="mb-4 grid aspect-video place-items-center rounded-lg bg-gradient-to-br from-accent to-muted"><HeartPulse className="h-12 w-12 text-primary/40" /></div><Badge variant="outline" className="mb-3"><ShieldCheck className="mr-1 h-3.5 w-3.5" /> Coming soon</Badge><h2 className="font-semibold">{kit}</h2><p className="mt-2 text-sm text-muted-foreground">A complete doctor-curated package is being prepared for this condition.</p><div className="mt-4 flex gap-2"><Input type="email" placeholder="Email" value={emails[kit] ?? ""} onChange={(event) => setEmails((current) => ({ ...current, [kit]: event.target.value }))} /><Button onClick={() => joinWaitlist(kit)}>Notify Me</Button></div></CardContent></Card>)}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TreatmentKits;
