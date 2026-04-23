import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AYUSH_THERAPIES } from "@/data/ayushTherapyCatalog";
import { BadgeCheck, MapPin, Search, Star, Sparkles } from "lucide-react";

interface Therapist {
  id: string;
  full_name: string;
  photo_url: string | null;
  city: string | null;
  state: string | null;
  gender: string | null;
  years_experience: number;
  allowed_therapies: string[] | null;
  is_verified: boolean;
  is_available: boolean;
  rating: number;
  total_sessions: number;
}

const Therapists = () => {
  const [list, setList] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("");
  const [therapyCode, setTherapyCode] = useState<string>("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    document.title = "Find Certified Therapists | Ayuzee";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Browse verified Panchakarma & Ayurveda therapists near you. Filter by city, therapy and availability.");
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("therapists")
        .select("id, full_name, photo_url, city, state, gender, years_experience, allowed_therapies, is_verified, is_available, rating, total_sessions")
        .eq("verification_status", "approved")
        .order("rating", { ascending: false });
      setList((data as Therapist[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const cities = useMemo(() => Array.from(new Set(list.map(t => t.city).filter(Boolean) as string[])).sort(), [list]);

  const filtered = useMemo(() => {
    return list.filter(t => {
      if (verifiedOnly && !t.is_verified) return false;
      if (availableOnly && !t.is_available) return false;
      if (city && (t.city ?? "").toLowerCase() !== city.toLowerCase()) return false;
      if (therapyCode !== "all" && !(t.allowed_therapies ?? []).includes(therapyCode)) return false;
      if (search && !t.full_name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [list, verifiedOnly, availableOnly, city, therapyCode, search]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Verified Panchakarma practitioners
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Find Certified Therapists</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Discover trained therapists for Abhyanga, Basti, Shirodhara and more. Filter by location, therapy type and live availability.
          </p>
        </header>

        <Card className="mb-6">
          <CardContent className="p-4 grid gap-4 md:grid-cols-5">
            <div className="md:col-span-2">
              <Label className="text-xs">Search by name</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" placeholder="e.g. Sneha" />
              </div>
            </div>
            <div>
              <Label className="text-xs">City</Label>
              <Select value={city || "all"} onValueChange={(v) => setCity(v === "all" ? "" : v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="All cities" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All cities</SelectItem>
                  {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Therapy</Label>
              <Select value={therapyCode} onValueChange={setTherapyCode}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Any therapy" /></SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="all">Any therapy</SelectItem>
                  {AYUSH_THERAPIES.filter(t => t.system === "Ayurveda").map(t => (
                    <SelectItem key={t.code} value={t.code}>{t.code} — {t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col justify-end gap-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="verified" className="text-xs">Verified only</Label>
                <Switch id="verified" checked={verifiedOnly} onCheckedChange={setVerifiedOnly} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="available" className="text-xs">Available now</Label>
                <Switch id="available" checked={availableOnly} onCheckedChange={setAvailableOnly} />
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse h-48" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No therapists match your filters yet.</p>
              <Button variant="outline" className="mt-4" onClick={() => { setCity(""); setTherapyCode("all"); setVerifiedOnly(false); setAvailableOnly(false); setSearch(""); }}>
                Clear filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="text-sm text-muted-foreground mb-4">{filtered.length} therapist{filtered.length === 1 ? "" : "s"} found</div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map(t => (
                <TherapistCard key={t.id} t={t} />
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

const TherapistCard = ({ t }: { t: Therapist }) => {
  const initials = t.full_name.split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();
  return (
    <Link to={`/therapists/${t.id}`}>
      <Card className="hover:shadow-lg transition-shadow h-full">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border">
              {t.photo_url && <AvatarImage src={t.photo_url} alt={t.full_name} />}
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold truncate">{t.full_name}</h3>
                {t.is_verified && <BadgeCheck className="h-4 w-4 text-primary shrink-0" />}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <MapPin className="h-3 w-3" />
                {t.city ? `${t.city}${t.state ? `, ${t.state}` : ""}` : "Location not set"}
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />{t.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">{t.total_sessions} sessions</span>
                <span className="text-muted-foreground">{t.years_experience}y exp</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-4">
            {(t.allowed_therapies ?? []).slice(0, 4).map(code => (
              <Badge key={code} variant="secondary" className="text-[10px]">{code}</Badge>
            ))}
            {(t.allowed_therapies ?? []).length > 4 && (
              <Badge variant="outline" className="text-[10px]">+{(t.allowed_therapies ?? []).length - 4}</Badge>
            )}
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <span className={`text-xs flex items-center gap-1.5 ${t.is_available ? "text-green-600" : "text-muted-foreground"}`}>
              <span className={`h-2 w-2 rounded-full ${t.is_available ? "bg-green-500" : "bg-muted-foreground/40"}`} />
              {t.is_available ? "Available now" : "Offline"}
            </span>
            <Button size="sm" variant="outline">View profile</Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default Therapists;
