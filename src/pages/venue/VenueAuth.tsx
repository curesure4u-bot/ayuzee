import {  useEffect, useState  } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { AYUSH_THERAPIES } from "@/data/ayushTherapyCatalog";
import { Building2, Upload, ShieldCheck, Loader2, MapPin, Plus, Trash2, ImagePlus } from "lucide-react";

type Mode = "auth" | "onboarding" | "review";
type VenueType = "hospital" | "clinic" | "resort" | "wellness_center";
interface RoomDraft { room_name: string; capacity: number; hourly_rate: number }

const VenueAuth = () => {
  usePageSEO({ title: "Venue Owner Portal | Ayuzee", noIndex: true });
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("auth");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const [signup, setSignup] = useState({
    contact_person: "", phone: "", email: "", password: "",
    org_name: "", venue_type: "clinic" as VenueType,
  });
  const [signin, setSignin] = useState({ email: "", password: "" });

  // Onboarding fields
  const [addr, setAddr] = useState({ address_line1: "", city: "", state: "", pincode: "" });
  const [regDocUrl, setRegDocUrl] = useState<string | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [selectedTherapies, setSelectedTherapies] = useState<string[]>([]);
  const [rooms, setRooms] = useState<RoomDraft[]>([{ room_name: "Room 1 - Panchakarma", capacity: 1, hourly_rate: 500 }]);

  useEffect(() => { (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setUserId(session.user.id);
      const { data: existing } = await supabase
        .from("therapy_venues")
        .select("id, is_verified")
        .eq("owner_user_id", session.user.id)
        .maybeSingle();
      if (existing) {
        if (existing.is_verified) navigate("/venue", { replace: true });
        else setMode("review");
      } else {
        setMode("onboarding");
      }
    })();
  }, [navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: signup.email,
      password: signup.password,
      options: {
        emailRedirectTo: `${window.location.origin}/venue/auth`,
        data: { full_name: signup.contact_person, phone: signup.phone },
      },
    });
    setLoading(false);
    if (error) return toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
    if (data.user) {
      setUserId(data.user.id);
      setMode("onboarding");
      toast({ title: "Account created", description: "Complete your venue profile." });
    }
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: signin.email, password: signin.password });
    setLoading(false);
    if (error) return toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
  };

  const uploadFile = async (file: File, subpath: string) => {
    if (!userId) return null;
    const path = `${userId}/${subpath}`;
    const { error } = await supabase.storage.from("venue-docs").upload(path, file, { upsert: true });
    if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); return null; }
    const { data: signed } = await supabase.storage.from("venue-docs").createSignedUrl(path, 60 * 60 * 24 * 365);
    return signed?.signedUrl ?? null;
  };

  const submitVenue = async () => {
    if (!userId) return;
    if (!addr.address_line1 || !addr.city || !addr.state || !addr.pincode) {
      return toast({ title: "Address required", variant: "destructive" });
    }
    if (selectedTherapies.length === 0) return toast({ title: "Select at least one therapy", variant: "destructive" });
    if (rooms.length === 0) return toast({ title: "Add at least one room", variant: "destructive" });

    setLoading(true);
    const { error } = await supabase.from("therapy_venues").insert({
      owner_user_id: userId,
      name: signup.org_name || "My Venue",
      type: signup.venue_type,
      contact_person: signup.contact_person || null,
      phone: signup.phone || null,
      email: signup.email || null,
      address_line1: addr.address_line1,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      registration_doc_url: regDocUrl,
      photo_urls: photoUrls,
      available_therapies: selectedTherapies,
      rooms: rooms as unknown as never,
      is_verified: false,
      is_active: true,
    });
    setLoading(false);
    if (error) return toast({ title: "Could not submit", description: error.message, variant: "destructive" });
    setMode("review");
  };

  // Group therapies by group
  const grouped = AYUSH_THERAPIES.reduce<Record<string, typeof AYUSH_THERAPIES>>((acc, t) => {
    (acc[t.group] ||= []).push(t); return acc;
  }, {});

  if (mode === "review") {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-br from-primary/5 via-background to-background px-4">
        <Card className="max-w-lg w-full text-center">
          <CardContent className="p-10">
            <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center"><ShieldCheck className="h-8 w-8 text-primary" /></div>
            <h1 className="text-2xl font-bold mt-4">Your application is under review</h1>
            <p className="text-muted-foreground mt-2">Our team will verify your venue documents and rooms shortly. You'll get an email when your listing goes live.</p>
            <Button className="mt-6" variant="outline" onClick={async () => { await supabase.auth.signOut(); navigate("/"); }}>Sign out</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mode === "onboarding") {
    const totalSteps = 5;
    return (
      <div className="min-h-screen bg-muted/30 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium">Venue onboarding — Step {step} of {totalSteps}</span>
              <span className="text-muted-foreground">{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <Progress value={(step / totalSteps) * 100} />
          </div>

          <Card>
            <CardContent className="p-6 space-y-6">
              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Address</h2>
                  <div className="grid gap-3">
                    <div><Label>Address line</Label><Input value={addr.address_line1} onChange={e => setAddr({ ...addr, address_line1: e.target.value })} /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>City</Label><Input value={addr.city} onChange={e => setAddr({ ...addr, city: e.target.value })} /></div>
                      <div><Label>State</Label><Input value={addr.state} onChange={e => setAddr({ ...addr, state: e.target.value })} /></div>
                    </div>
                    <div><Label>Pincode</Label><Input value={addr.pincode} onChange={e => setAddr({ ...addr, pincode: e.target.value })} /></div>
                  </div>
                  <div className="rounded-lg border border-dashed bg-muted/40 p-6 text-center">
                    <MapPin className="h-6 w-6 mx-auto text-primary" />
                    <p className="text-sm text-muted-foreground mt-2">Your location will be shown to patients nearby.</p>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Business registration</h2>
                  <p className="text-sm text-muted-foreground">Upload your GSTIN certificate or business registration document (PDF / image).</p>
                  <label className="flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-8 cursor-pointer hover:bg-muted/40">
                    <Upload className="h-5 w-5" />
                    <span>{regDocUrl ? "Replace document" : "Choose file"}</span>
                    <input type="file" accept="application/pdf,image/*" className="hidden" onChange={async e => {
                      const f = e.target.files?.[0]; if (!f) return;
                      const url = await uploadFile(f, "reg.pdf"); if (url) setRegDocUrl(url);
                    }} />
                  </label>
                  {regDocUrl && <Badge variant="secondary">Uploaded ✓</Badge>}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Therapy room photos</h2>
                  <p className="text-sm text-muted-foreground">Upload up to 5 photos of your therapy rooms.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {photoUrls.map((u, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden border">
                        <img src={u} alt={`Room ${i + 1}`} className="w-full h-full object-cover" />
                        <Button size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => setPhotoUrls(photoUrls.filter((_, idx) => idx !== i))}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {photoUrls.length < 5 && (
                      <label className="aspect-square rounded-lg border-2 border-dashed grid place-items-center cursor-pointer hover:bg-muted/40">
                        <div className="text-center text-muted-foreground text-xs">
                          <ImagePlus className="h-5 w-5 mx-auto mb-1" />Add photo
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={async e => {
                          const f = e.target.files?.[0]; if (!f) return;
                          const url = await uploadFile(f, `photos/${Date.now()}-${f.name}`);
                          if (url) setPhotoUrls([...photoUrls, url]);
                        }} />
                      </label>
                    )}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Therapies you can host</h2>
                  <p className="text-sm text-muted-foreground">Selected: {selectedTherapies.length}</p>
                  <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2">
                    {Object.entries(grouped).map(([group, items]) => (
                      <div key={group}>
                        <h3 className="font-medium text-sm mb-2 sticky top-0 bg-background py-1">{group}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {items.map(t => {
                            const checked = selectedTherapies.includes(t.code);
                            return (
                              <label key={t.code} className={`flex items-start gap-2 p-2 rounded border text-sm cursor-pointer ${checked ? "border-primary bg-primary/5" : ""}`}>
                                <Checkbox checked={checked} onCheckedChange={(v) => {
                                  setSelectedTherapies(v ? [...selectedTherapies, t.code] : selectedTherapies.filter(c => c !== t.code));
                                }} />
                                <div className="min-w-0">
                                  <div className="text-xs font-mono text-muted-foreground">{t.code}</div>
                                  <div className="leading-tight">{t.name}</div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Therapy rooms</h2>
                    <Button size="sm" variant="outline" onClick={() => setRooms([...rooms, { room_name: `Room ${rooms.length + 1}`, capacity: 1, hourly_rate: 500 }])}>
                      <Plus className="h-4 w-4 mr-1" />Add room
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {rooms.map((r, i) => (
                      <Card key={i}>
                        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                          <div className="sm:col-span-5">
                            <Label>Room name</Label>
                            <Input value={r.room_name} onChange={e => { const c = [...rooms]; c[i].room_name = e.target.value; setRooms(c); }} />
                          </div>
                          <div className="sm:col-span-3">
                            <Label>Capacity</Label>
                            <Select value={String(r.capacity)} onValueChange={v => { const c = [...rooms]; c[i].capacity = Number(v); setRooms(c); }}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent><SelectItem value="1">1 patient</SelectItem><SelectItem value="2">2 patients</SelectItem></SelectContent>
                            </Select>
                          </div>
                          <div className="sm:col-span-3">
                            <Label>Hourly rate (₹)</Label>
                            <Input type="number" value={r.hourly_rate} onChange={e => { const c = [...rooms]; c[i].hourly_rate = Number(e.target.value); setRooms(c); }} />
                          </div>
                          <div className="sm:col-span-1">
                            <Button size="icon" variant="ghost" onClick={() => setRooms(rooms.filter((_, idx) => idx !== i))}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" disabled={step === 1} onClick={() => setStep(step - 1)}>Back</Button>
                {step < 5
                  ? <Button onClick={() => setStep(step + 1)}>Next</Button>
                  : <Button onClick={submitVenue} disabled={loading}>{loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Submit for review</Button>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-primary/5 via-background to-background px-4 py-10">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="h-14 w-14 mx-auto rounded-2xl bg-primary/10 grid place-items-center"><Building2 className="h-7 w-7 text-primary" /></div>
          <CardTitle className="mt-3">Venue Owner Portal</CardTitle>
          <p className="text-sm text-muted-foreground">List your therapy rooms on Ayuzee</p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signup">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signup">Sign up</TabsTrigger>
              <TabsTrigger value="signin">Sign in</TabsTrigger>
            </TabsList>
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-3 mt-4">
                <div><Label>Contact person name</Label><Input required value={signup.contact_person} onChange={e => setSignup({ ...signup, contact_person: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Phone</Label><Input required value={signup.phone} onChange={e => setSignup({ ...signup, phone: e.target.value })} /></div>
                  <div><Label>Email</Label><Input type="email" required value={signup.email} onChange={e => setSignup({ ...signup, email: e.target.value })} /></div>
                </div>
                <div><Label>Password</Label><Input type="password" required minLength={6} value={signup.password} onChange={e => setSignup({ ...signup, password: e.target.value })} /></div>
                <div><Label>Organization name</Label><Input required value={signup.org_name} onChange={e => setSignup({ ...signup, org_name: e.target.value })} /></div>
                <div>
                  <Label>Venue type</Label>
                  <Select value={signup.venue_type} onValueChange={(v) => setSignup({ ...signup, venue_type: v as VenueType })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hospital">Hospital</SelectItem>
                      <SelectItem value="clinic">Clinic</SelectItem>
                      <SelectItem value="resort">Resort</SelectItem>
                      <SelectItem value="wellness_center">Wellness Center</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>{loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Create account</Button>
              </form>
            </TabsContent>
            <TabsContent value="signin">
              <form onSubmit={handleSignin} className="space-y-3 mt-4">
                <div><Label>Email</Label><Input type="email" required value={signin.email} onChange={e => setSignin({ ...signin, email: e.target.value })} /></div>
                <div><Label>Password</Label><Input type="password" required value={signin.password} onChange={e => setSignin({ ...signin, password: e.target.value })} /></div>
                <Button type="submit" className="w-full" disabled={loading}>{loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Sign in</Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default VenueAuth;
