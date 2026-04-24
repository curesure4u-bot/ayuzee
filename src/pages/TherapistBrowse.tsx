import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/site/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AYUSH_THERAPIES } from "@/data/ayushTherapyCatalog";
import { BadgeCheck, CalendarCheck, MapPin, Search, Star } from "lucide-react";

interface Therapist {
  id: string;
  full_name: string;
  photo_url: string | null;
  city: string | null;
  state: string | null;
  gender: string | null;
  years_experience: number;
  allowed_therapies: string[] | null;
  rating: number;
  total_sessions: number;
  created_at?: string | null;
}

const therapyMap = new Map(AYUSH_THERAPIES.map((therapy) => [therapy.code, therapy]));
const therapyGroups = Array.from(new Set(AYUSH_THERAPIES.map((therapy) => therapy.group))).sort();

const TherapistBrowse = () => {
  const navigate = useNavigate();
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [therapyGroup, setTherapyGroup] = useState("all");
  const [gender, setGender] = useState("any");
  const [city, setCity] = useState("");
  const [minExperience, setMinExperience] = useState("0");
  const [rating, setRating] = useState("any");
  const [sort, setSort] = useState("rating");

  useEffect(() => {
    document.title = "Certified Panchakarma Therapists | Ayuzee";
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("therapists")
        .select("id, full_name, photo_url, city, state, gender, years_experience, allowed_therapies, rating, total_sessions, created_at")
        .eq("is_verified", true)
        .order("rating", { ascending: false });
      setTherapists((data as Therapist[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const minimumYears = Number(minExperience);
    return [...therapists]
      .filter((therapist) => {
        if (therapyGroup !== "all") {
          const hasGroup = (therapist.allowed_therapies ?? []).some((code) => therapyMap.get(code)?.group === therapyGroup);
          if (!hasGroup) return false;
        }
        if (gender !== "any" && (therapist.gender ?? "").toLowerCase() !== gender) return false;
        if (city && !(therapist.city ?? "").toLowerCase().includes(city.toLowerCase())) return false;
        if ((therapist.years_experience ?? 0) < minimumYears) return false;
        if (rating === "4" && Number(therapist.rating ?? 0) < 4) return false;
        return true;
      })
      .sort((a, b) => {
        if (sort === "sessions") return (b.total_sessions ?? 0) - (a.total_sessions ?? 0);
        if (sort === "newest") return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
        return Number(b.rating ?? 0) - Number(a.rating ?? 0);
      });
  }, [city, gender, minExperience, rating, sort, therapists, therapyGroup]);

  const bookTherapist = async (therapistId: string) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return navigate("/auth");
    navigate(`/therapy-booking/new?therapist_id=${therapistId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <header className="mb-8 max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Find a Certified Panchakarma Therapist</h1>
          <p className="mt-2 text-muted-foreground">Browse verified therapists by therapy type, city, experience, gender and rating.</p>
        </header>

        <Card className="mb-6">
          <CardContent className="grid gap-4 p-4 md:grid-cols-6">
            <div>
              <Label className="text-xs">Therapy type</Label>
              <Select value={therapyGroup} onValueChange={setTherapyGroup}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All therapies</SelectItem>
                  {therapyGroups.map((group) => <SelectItem key={group} value={group}>{group}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">City</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={city} onChange={(event) => setCity(event.target.value)} className="pl-9" placeholder="Search city" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Min experience</Label>
              <Select value={minExperience} onValueChange={setMinExperience}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0+ years</SelectItem>
                  <SelectItem value="2">2+ years</SelectItem>
                  <SelectItem value="5">5+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Rating</Label>
              <Select value={rating} onValueChange={setRating}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Sort</Label>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Top Rated</SelectItem>
                  <SelectItem value="sessions">Most Sessions</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <Card key={index} className="h-64 animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="p-12 text-center text-muted-foreground">No certified therapists match these filters yet.</CardContent></Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((therapist) => {
              const initials = therapist.full_name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
              const topTherapies = (therapist.allowed_therapies ?? []).slice(0, 3);
              return (
                <Card key={therapist.id} className="h-full transition-shadow hover:shadow-lg">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <Link to={`/therapist/${therapist.id}`}>
                        <Avatar className="h-16 w-16 border">
                          {therapist.photo_url && <AvatarImage src={therapist.photo_url} alt={therapist.full_name} />}
                          <AvatarFallback className="bg-primary/10 font-semibold text-primary">{initials}</AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Link to={`/therapist/${therapist.id}`} className="truncate font-semibold hover:text-primary">{therapist.full_name}</Link>
                          <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          {therapist.gender && <Badge variant="secondary" className="capitalize">{therapist.gender}</Badge>}
                          <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{therapist.city ?? "City not set"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                      <div><div className="font-semibold">{therapist.years_experience} yrs</div><div className="text-xs text-muted-foreground">Experience</div></div>
                      <div><div className="flex items-center gap-1 font-semibold"><Star className="h-4 w-4 fill-current text-primary" />{Number(therapist.rating ?? 0).toFixed(1)}</div><div className="text-xs text-muted-foreground">Rating</div></div>
                      <div><div className="font-semibold">{therapist.total_sessions ?? 0}</div><div className="text-xs text-muted-foreground">Sessions</div></div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {topTherapies.map((code) => <Badge key={code} variant="outline" className="text-[10px]">{therapyMap.get(code)?.name ?? code}</Badge>)}
                    </div>
                    <Button className="mt-5 w-full" onClick={() => bookTherapist(therapist.id)}>
                      <CalendarCheck className="mr-2 h-4 w-4" />Book Session
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default TherapistBrowse;
