import { useEffect, useState, useCallback } from "react";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Image as ImageIcon, Upload, X, MapPin, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

type Clinic = Tables<"doctor_clinics">;
type Media = Tables<"clinic_media">;
type Service = Tables<"clinic_services">;

const DoctorClinic = () => {
  const navigate = useNavigate();
  const { userId } = useDoctor();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [active, setActive] = useState<Clinic | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [newService, setNewService] = useState("");
  const [openNew, setOpenNew] = useState(false);
  const [newName, setNewName] = useState("");

  const fetchClinics = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase.from("doctor_clinics").select("*").eq("doctor_user_id", userId).order("created_at");
    setClinics(data ?? []);
    if (data && data.length && !active) setActive(data[0]);
  }, [userId, active]);

  useEffect(() => { fetchClinics(); }, [fetchClinics]);

  useEffect(() => {
    if (!active) return;
    (async () => {
      const m = await supabase.from("clinic_media").select("*").eq("clinic_id", active.id).order("sort_order");
      setMedia(m.data ?? []);
      const s = await supabase.from("clinic_services").select("*").eq("clinic_id", active.id);
      setServices(s.data ?? []);
    })();
  }, [active]);

  const createClinic = async () => {
    if (!userId || !newName.trim()) return;
    const { data, error } = await supabase.from("doctor_clinics")
      .insert({ doctor_user_id: userId, clinic_name: newName, address_line1: "", city: "", state: "", pincode: "" })
      .select().single();
    if (error) return toast.error(error.message);
    toast.success("Clinic created");
    setOpenNew(false); setNewName("");
    fetchClinics();
    setActive(data);
  };

  const updateField = (k: keyof Clinic, v: any) => active && setActive({ ...active, [k]: v });

  const saveProfile = async () => {
    if (!active || !userId) return;
    const { error } = await supabase.from("doctor_clinics").update({
      clinic_name: active.clinic_name, address_line1: active.address_line1, locality: active.locality,
      city: active.city, state: active.state, pincode: active.pincode, country: active.country,
      phone: active.phone, about: active.about,
      gst_number: active.gst_number, legal_entity_name: active.legal_entity_name, gst_address: active.gst_address,
      show_legal_entity: active.show_legal_entity, cover_image_url: active.cover_image_url, logo_url: active.logo_url,
    }).eq("id", active.id);
    if (error) toast.error(error.message);
    else toast.success("Saved");
  };

  const uploadFile = async (file: File, type: "cover" | "logo" | "photo") => {
    if (!userId || !active) return;
    const path = `${userId}/${active.id}/${type}-${Date.now()}-${file.name}`;
    const up = await supabase.storage.from("clinic-media").upload(path, file);
    if (up.error) return toast.error(up.error.message);
    const { data: pub } = supabase.storage.from("clinic-media").getPublicUrl(path);
    if (type === "cover") {
      await supabase.from("doctor_clinics").update({ cover_image_url: pub.publicUrl }).eq("id", active.id);
      setActive({ ...active, cover_image_url: pub.publicUrl });
    } else if (type === "logo") {
      await supabase.from("doctor_clinics").update({ logo_url: pub.publicUrl }).eq("id", active.id);
      setActive({ ...active, logo_url: pub.publicUrl });
    } else {
      await supabase.from("clinic_media").insert({ clinic_id: active.id, doctor_user_id: userId, media_type: "photo", url: pub.publicUrl });
      const m = await supabase.from("clinic_media").select("*").eq("clinic_id", active.id).order("sort_order");
      setMedia(m.data ?? []);
    }
    toast.success("Uploaded");
  };

  const removeMedia = async (id: string) => {
    await supabase.from("clinic_media").delete().eq("id", id);
    setMedia(media.filter((m) => m.id !== id));
  };

  const addService = async () => {
    if (!active || !userId || !newService.trim()) return;
    const { error } = await supabase.from("clinic_services").insert({ clinic_id: active.id, doctor_user_id: userId, service_name: newService.trim() });
    if (error) return toast.error(error.message);
    setNewService("");
    const s = await supabase.from("clinic_services").select("*").eq("clinic_id", active.id);
    setServices(s.data ?? []);
  };
  const removeService = async (id: string) => {
    await supabase.from("clinic_services").delete().eq("id", id);
    setServices(services.filter((s) => s.id !== id));
  };

  if (!clinics.length) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card className="p-10 text-center">
          <Building2 className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 font-display text-2xl">My Clinic</h1>
          <p className="mt-2 text-muted-foreground">Add your first clinic to start receiving patient bookings.</p>
          <Dialog open={openNew} onOpenChange={setOpenNew}>
            <DialogTrigger asChild><Button className="mt-5"><Plus className="mr-2 h-4 w-4" /> Add clinic</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New clinic</DialogTitle></DialogHeader>
              <Label>Clinic name</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Al Shifa Ayush Hospital" />
              <Button onClick={createClinic}>Create</Button>
            </DialogContent>
          </Dialog>
        </Card>
      </div>
    );
  }

  if (!active) return null;

  return (
    <div className="mx-auto max-w-5xl">
      <Card>
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
            <h1 className="font-display text-2xl">My Clinic</h1>
          </div>
          {clinics.length > 1 && (
            <select className="rounded-md border bg-background px-2 py-1 text-sm" value={active.id} onChange={(e) => setActive(clinics.find((c) => c.id === e.target.value)!)}>
              {clinics.map((c) => <option key={c.id} value={c.id}>{c.clinic_name}</option>)}
            </select>
          )}
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-4">
            <TabsTrigger value="profile" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">Update Profile</TabsTrigger>
            <TabsTrigger value="consult" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">Consultation Settings</TabsTrigger>
            <TabsTrigger value="video" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">Upload Video</TabsTrigger>
          </TabsList>

          {/* PROFILE */}
          <TabsContent value="profile" className="space-y-6 p-4">
            {/* Cover */}
            <div>
              <Label className="text-base font-semibold">Add/Update Clinic Cover Image</Label>
              <div className="mt-2 grid grid-cols-3 gap-3">
                {[0, 1, 2].map((i) => (
                  <label key={i} className="group relative grid aspect-video cursor-pointer place-items-center overflow-hidden rounded-md border-2 border-dashed bg-muted/30 hover:bg-muted/50">
                    {i === 0 && active.cover_image_url ? (
                      <img src={active.cover_image_url} alt="cover" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-muted-foreground"><ImageIcon className="h-8 w-8" /><span className="mt-1 text-xs">Upload</span></div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], "cover")} />
                  </label>
                ))}
              </div>
            </div>

            {/* Photos & Logo */}
            <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
              <div>
                <Label className="text-base font-semibold">Upload Clinic Photos</Label>
                <label className="mt-2 flex cursor-pointer items-center gap-3 rounded-md border-2 border-dashed p-4 hover:bg-muted/30">
                  <Upload className="h-10 w-10 text-primary" />
                  <div>
                    <p className="font-medium text-primary">Upload Photos</p>
                    <p className="text-xs text-muted-foreground">(Min Size 300x300) Clinic photos help patients differentiate from others.</p>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], "photo")} />
                </label>
                {media.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {media.map((m) => (
                      <div key={m.id} className="relative h-20 w-20 overflow-hidden rounded-md border">
                        <img src={m.url} alt="clinic" className="h-full w-full object-cover" />
                        <button onClick={() => removeMedia(m.id)} className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-background/80 hover:bg-destructive hover:text-destructive-foreground"><X className="h-3 w-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <Label className="text-base font-semibold">Upload Clinic Logo</Label>
                <label className="mt-2 grid aspect-square cursor-pointer place-items-center overflow-hidden rounded-md border-2 border-dashed hover:bg-muted/30">
                  {active.logo_url ? <img src={active.logo_url} alt="logo" className="h-full w-full object-contain" /> : <ImageIcon className="h-10 w-10 text-muted-foreground" />}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], "logo")} />
                </label>
                <p className="mt-1 text-center text-xs text-muted-foreground">Used on invoices generated by your clinic.</p>
              </div>
            </div>

            {/* Personal & Contact */}
            <Card className="p-4">
              <h3 className="font-semibold text-primary">Personal & Contact Details</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="md:col-span-2"><Label>Clinic Name</Label><Input value={active.clinic_name} onChange={(e) => updateField("clinic_name", e.target.value)} /></div>
                <div className="md:col-span-2"><Label>Address / House No.</Label><Input value={active.address_line1} onChange={(e) => updateField("address_line1", e.target.value)} /></div>
                <div className="md:col-span-2"><Label>Locality</Label><Input value={active.locality ?? ""} onChange={(e) => updateField("locality", e.target.value)} /></div>
                <div><Label>Clinic Phone Number</Label><Input value={active.phone ?? ""} onChange={(e) => updateField("phone", e.target.value)} placeholder="+91 - 9000000000" /></div>
                <div><Label>Pincode*</Label><Input value={active.pincode} onChange={(e) => updateField("pincode", e.target.value)} /></div>
                <div><Label>City*</Label><Input value={active.city} onChange={(e) => updateField("city", e.target.value)} /></div>
                <div><Label>State*</Label><Input value={active.state} onChange={(e) => updateField("state", e.target.value)} /></div>
                <div className="md:col-span-2"><Label>Country</Label><Input value={active.country ?? "India"} onChange={(e) => updateField("country", e.target.value)} /></div>
                <div className="md:col-span-2"><Label>About</Label><Textarea rows={3} value={active.about ?? ""} onChange={(e) => updateField("about", e.target.value)} placeholder="We have branches in Chennai, Tirunelveli…" /></div>
              </div>
            </Card>

            {/* GST */}
            <Card className="p-4">
              <h3 className="font-semibold">Fill GST details</h3>
              <div className="mt-3 flex items-center gap-2">
                <Checkbox checked={active.show_legal_entity ?? false} onCheckedChange={(v) => updateField("show_legal_entity", !!v)} id="legal" />
                <label htmlFor="legal" className="text-sm">Show Legal Entity</label>
              </div>
              <div className="mt-3 grid gap-3">
                <div><Label>GST Number</Label><Input value={active.gst_number ?? ""} onChange={(e) => updateField("gst_number", e.target.value)} placeholder="Enter GST Number" /></div>
                <div><Label>Legal Entity Name</Label><Input value={active.legal_entity_name ?? ""} onChange={(e) => updateField("legal_entity_name", e.target.value)} /></div>
                <div><Label>GST City / Address</Label><Input value={active.gst_address ?? ""} onChange={(e) => updateField("gst_address", e.target.value)} /></div>
              </div>
            </Card>

            {/* Services */}
            <Card className="p-4">
              <h3 className="font-semibold text-primary">Services</h3>
              <div className="mt-3 flex gap-2">
                <Input placeholder="Add a service e.g. Panchakarma" value={newService} onChange={(e) => setNewService(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addService())} />
                <Button onClick={addService}>Add</Button>
              </div>
              {services.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {services.map((s) => (
                    <span key={s.id} className="inline-flex items-center gap-1 rounded-md bg-muted px-3 py-1.5 text-sm">
                      {s.service_name}
                      <button onClick={() => removeService(s.id)} className="text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
                    </span>
                  ))}
                </div>
              )}
            </Card>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline">Preview</Button>
              <Button onClick={saveProfile}>Save</Button>
            </div>
          </TabsContent>

          <TabsContent value="consult" className="p-6 text-sm text-muted-foreground">
            <p>Consultation timings, modes, and fee will be configurable here in the next update.</p>
          </TabsContent>
          <TabsContent value="video" className="p-6 text-sm text-muted-foreground">
            <p>Upload an introduction video for your clinic profile in the next update.</p>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default DoctorClinic;
