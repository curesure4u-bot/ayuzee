import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Phone, Star, Search, Sparkles } from "lucide-react";

const TYPES = [
  { value: "all", label: "All" },
  { value: "therapist", label: "Therapists" },
  { value: "panchakarma_theater", label: "Panchakarma Theaters" },
  { value: "hospital", label: "Hospitals" },
  { value: "clinic", label: "Clinics" },
];

const PartnerNetwork = () => {
  const [items, setItems] = useState<any[]>([]);
  const [type, setType] = useState("all");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("network_partners_public" as any)
        .select("*")
        .eq("is_approved", true)
        .order("rating", { ascending: false });
      setItems(data ?? []);
    })();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((p) => {
      if (type !== "all" && p.partner_type !== type) return false;
      if (city.trim() && !p.city?.toLowerCase().includes(city.toLowerCase())) return false;
      if (pincode.trim() && !p.pincode?.startsWith(pincode.slice(0, 3))) return false;
      return true;
    });
  }, [items, type, city, pincode]);

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl">Partner Network</h1>
            <p className="text-xs text-muted-foreground">Find nearby therapists, hospitals, clinics & Panchakarma theaters.</p>
          </div>
          <Button variant="outline" asChild><Link to="/partner/apply">Apply to join</Link></Button>
        </div>

        <Tabs value={type} onValueChange={setType} className="mt-4">
          <TabsList className="flex-wrap">
            {TYPES.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
          </TabsList>
        </Tabs>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by city" value={city} onChange={(e) => setCity(e.target.value)} className="pl-9" />
          </div>
          <Input placeholder="Pincode (first 3 digits)" value={pincode} onChange={(e) => setPincode(e.target.value)} />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">No partners match.</Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((p) => (
            <Card key={p.id} className="p-4 transition hover:shadow-elegant">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-display text-base font-semibold">{p.name}</p>
                  <p className="text-xs capitalize text-muted-foreground">{p.partner_type.replace("_", " ")}</p>
                </div>
                <Badge variant="secondary" className="gap-1"><Star className="h-3 w-3 fill-primary text-primary" />{p.rating}</Badge>
              </div>
              {p.about && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.about}</p>}
              <div className="mt-3 space-y-1 text-xs">
                <p className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-3 w-3" />{p.city}{p.pincode && `, ${p.pincode}`}</p>
                {p.phone && <p className="flex items-center gap-1 text-muted-foreground"><Phone className="h-3 w-3" />{p.phone}</p>}
              </div>
              {p.services?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {p.services.slice(0, 4).map((s: string) => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}
                </div>
              )}
              <Button size="sm" variant="outline" className="mt-3 w-full" asChild>
                <Link to={`/vaidya/therapy-plans?partner=${p.id}`}><Sparkles className="mr-1 h-3 w-3" /> Plan a therapy</Link>
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PartnerNetwork;
