import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import type { VenueContext } from "./VenueLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface VenueFull {
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address_line1: string;
  city: string;
  state: string;
  pincode: string;
}

const VenueProfile = () => {
  const { venue } = useOutletContext<VenueContext>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<VenueFull>({
    name: "", contact_person: "", phone: "", email: "",
    address_line1: "", city: "", state: "", pincode: "",
  });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("therapy_venues")
        .select("name, contact_person, phone, email, address_line1, city, state, pincode")
        .eq("id", venue.id).maybeSingle();
      if (data) setForm(data as VenueFull);
      setLoading(false);
    })();
  }, [venue.id]);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("therapy_venues").update(form).eq("id", venue.id);
    setSaving(false);
    if (error) return toast({ title: "Save failed", description: error.message, variant: "destructive" });
    toast({ title: "Profile updated" });
  };

  if (loading) return <div className="min-h-[40vh] grid place-items-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Venue profile</h1>
        <p className="text-muted-foreground">Keep your contact and address details up to date.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Basic info</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Venue name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Contact person</Label><Input value={form.contact_person ?? ""} onChange={e => setForm({ ...form, contact_person: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={form.phone ?? ""} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <div><Label>Email</Label><Input type="email" value={form.email ?? ""} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Address</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Address line</Label><Input value={form.address_line1} onChange={e => setForm({ ...form, address_line1: e.target.value })} /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>City</Label><Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
            <div><Label>State</Label><Input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} /></div>
            <div><Label>Pincode</Label><Input value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} /></div>
          </div>
        </CardContent>
      </Card>
      <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}Save changes</Button>
    </div>
  );
};

export default VenueProfile;
