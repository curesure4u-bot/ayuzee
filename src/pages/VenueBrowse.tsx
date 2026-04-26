import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/site/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AYUSH_THERAPIES } from "@/data/ayushTherapyCatalog";
import { Building2, CalendarCheck, ChevronDown, MapPin, Search, Star } from "lucide-react";

type Room = { room_name?: string; name?: string; capacity?: number; hourly_rate?: number; rate?: number; is_available?: boolean; available?: boolean };

interface Venue {
  id: string;
  name: string;
  type: string | null;
  city: string;
  state: string;
  rating: number | null;
  rooms: unknown;
  available_therapies: string[] | null;
  photo_urls: string[] | null;
  photos: unknown;
  hourly_rate: number;
  latitude: number | null;
  longitude: number | null;
  lat: number | null;
  lng: number | null;
}

const therapyMap = new Map(AYUSH_THERAPIES.map((therapy) => [therapy.code, therapy]));
const therapyOptions = AYUSH_THERAPIES.filter((therapy) => therapy.group === "Panchakarma");

const normalizeRooms = (rooms: unknown): Room[] => Array.isArray(rooms) ? rooms as Room[] : [];
const firstPhoto = (venue: Venue) => {
  if (venue.photo_urls?.[0]) return venue.photo_urls[0];
  if (Array.isArray(venue.photos) && typeof venue.photos[0] === "string") return venue.photos[0];
  return null;
};
const titleCase = (value?: string | null) => (value ?? "Venue").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

const VenueBrowse = () => {
  const navigate = useNavigate();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [venueType, setVenueType] = useState("all");
  const [city, setCity] = useState("");
  const [therapy, setTherapy] = useState("all");
  const [mapView, setMapView] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Panchakarma Therapy Venues | Ayuzee";
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("therapy_venues")
        .select("id, name, type, city, state, rating, rooms, available_therapies, photo_urls, photos, hourly_rate, latitude, longitude, lat, lng")
        .eq("is_verified", true)
        .eq("is_active", true)
        .order("rating", { ascending: false });
      setVenues((data as Venue[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => venues.filter((venue) => {
    if (venueType !== "all" && (venue.type ?? "").toLowerCase() !== venueType) return false;
    if (city && !venue.city.toLowerCase().includes(city.toLowerCase())) return false;
    if (therapy !== "all" && !(venue.available_therapies ?? []).includes(therapy)) return false;
    return true;
  }), [city, therapy, venueType, venues]);

  const bookVenue = async (venueId: string) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return navigate("/auth");
    navigate(`/therapy-booking/new?venue_id=${venueId}`);
  };

  const googleKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const mapPins = filtered
    .map((venue) => ({ lat: venue.latitude ?? venue.lat, lng: venue.longitude ?? venue.lng, name: venue.name }))
    .filter((pin) => pin.lat && pin.lng);
  const mapUrl = googleKey && mapPins.length > 0
    ? `https://maps.googleapis.com/maps/api/staticmap?size=900x320&scale=2&markers=${mapPins.map((pin) => `${pin.lat},${pin.lng}`).join("&markers=")}&key=${googleKey}`
    : null;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Panchakarma Therapy Venues Near You</h1>
            <p className="mt-2 text-muted-foreground">Find verified rooms and wellness venues for AYUSH therapy sessions.</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
            <Label htmlFor="map-view" className="text-sm">Map view</Label>
            <Switch id="map-view" checked={mapView} onCheckedChange={setMapView} />
          </div>
        </header>

        <Card className="mb-6">
          <CardContent className="grid gap-4 p-4 md:grid-cols-3">
            <div>
              <Label className="text-xs">Venue type</Label>
              <Select value={venueType} onValueChange={setVenueType}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All venue types</SelectItem>
                  <SelectItem value="hospital">Hospital</SelectItem>
                  <SelectItem value="clinic">Clinic</SelectItem>
                  <SelectItem value="resort">Resort</SelectItem>
                  <SelectItem value="wellness_center">Wellness Center</SelectItem>
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
              <Label className="text-xs">Therapy type</Label>
              <Select value={therapy} onValueChange={setTherapy}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="all">All therapies</SelectItem>
                  {therapyOptions.map((item) => <SelectItem key={item.code} value={item.code}>{item.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {mapView && (
          <Card className="mb-6 overflow-hidden">
            {mapUrl ? <img src={mapUrl} alt="Map of Panchakarma therapy venues" className="h-80 w-full object-cover" /> : (
              <CardContent className="grid h-80 place-items-center bg-muted/40 text-center">
                <div>
                  <MapPin className="mx-auto mb-3 h-10 w-10 text-primary" />
                  <p className="font-semibold">Interactive map coming soon</p>
                  <p className="text-sm text-muted-foreground">Venue pins will appear here when map access is configured.</p>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }).map((_, index) => <Card key={index} className="h-72 animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
              <div className="text-5xl">🏥</div>
              <h2 className="text-xl font-semibold">No venues listed yet</h2>
              <p className="max-w-md text-sm text-muted-foreground">
                Partner hospitals and wellness centres will appear here soon.
              </p>
              <Button className="mt-2" onClick={() => navigate("/venue/auth")}>Register Your Venue</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((venue) => {
              const rooms = normalizeRooms(venue.rooms);
              const rates = rooms.map((room) => Number(room.hourly_rate ?? room.rate ?? 0)).filter(Boolean);
              const minRate = rates.length ? Math.min(...rates) : venue.hourly_rate;
              const maxRate = rates.length ? Math.max(...rates) : venue.hourly_rate;
              const photo = firstPhoto(venue);
              return (
                <Card key={venue.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                  <div className="grid md:grid-cols-[180px_1fr]">
                    {photo ? <img src={photo} alt={venue.name} className="h-48 w-full object-cover md:h-full" /> : (
                      <div className="grid h-48 place-items-center bg-muted md:h-full"><Building2 className="h-12 w-12 text-muted-foreground" /></div>
                    )}
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-lg font-semibold">{venue.name}</h2>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="secondary">{titleCase(venue.type)}</Badge>
                            <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{venue.city}, {venue.state}</span>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 text-sm font-semibold"><Star className="h-4 w-4 fill-current text-primary" />{Number(venue.rating ?? 0).toFixed(1)}</span>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div><div className="font-semibold">{rooms.length || 1}</div><div className="text-xs text-muted-foreground">Rooms</div></div>
                        <div><div className="font-semibold">₹{minRate.toLocaleString("en-IN")}–₹{maxRate.toLocaleString("en-IN")}</div><div className="text-xs text-muted-foreground">Hourly range</div></div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {(venue.available_therapies ?? []).slice(0, 4).map((code) => <Badge key={code} variant="outline" className="text-[10px]">{therapyMap.get(code)?.name ?? code}</Badge>)}
                      </div>
                      {expanded === venue.id && (
                        <div className="mt-4 rounded-lg border bg-muted/20 p-3">
                          <div className="mb-2 text-sm font-semibold">Rooms</div>
                          {rooms.length === 0 ? <p className="text-sm text-muted-foreground">Room details will be updated soon.</p> : rooms.map((room, index) => (
                            <div key={`${venue.id}-room-${index}`} className="flex items-center justify-between border-t py-2 text-sm first:border-t-0">
                              <span>{room.room_name ?? room.name ?? `Room ${index + 1}`} · Capacity {room.capacity ?? 1}</span>
                              <span className="font-medium">₹{Number(room.hourly_rate ?? room.rate ?? venue.hourly_rate).toLocaleString("en-IN")}/hr · {(room.is_available ?? room.available ?? true) ? "Available" : "Unavailable"}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                        <Button variant="outline" className="flex-1" onClick={() => setExpanded(expanded === venue.id ? null : venue.id)}>
                          <ChevronDown className="mr-2 h-4 w-4" />View Rooms
                        </Button>
                        <Button className="flex-1" onClick={() => bookVenue(venue.id)}>
                          <CalendarCheck className="mr-2 h-4 w-4" />Book This Venue
                        </Button>
                      </div>
                    </CardContent>
                  </div>
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

export default VenueBrowse;
