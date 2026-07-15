import {  useEffect, useState  } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2, Wallet } from "lucide-react";
import type { TherapistContext } from "./TherapistLayout";

interface Bank {
  id?: string;
  account_holder_name: string | null;
  account_number: string | null;
  ifsc_code: string | null;
  bank_name: string | null;
  upi_id: string | null;
}

const TherapistProfile = () => {
  usePageSEO({ title: "Profile | Therapist | Ayuzee", noIndex: true });
  const { therapist } = useOutletContext<TherapistContext>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ full_name: therapist.full_name, phone: "", city: "", state: "", years_experience: 0 });
  const [bank, setBank] = useState<Bank>({ account_holder_name: "", account_number: "", ifsc_code: "", bank_name: "", upi_id: "" });

  useEffect(() => { (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: t } = await supabase.from("therapists").select("full_name, phone, city, state, years_experience").eq("id", therapist.id).maybeSingle();
      if (t) setProfile({ full_name: t.full_name, phone: t.phone ?? "", city: t.city ?? "", state: t.state ?? "", years_experience: t.years_experience ?? 0 });
      const { data: b } = await supabase.from("doctor_bank_details").select("id, account_holder_name, account_number, ifsc_code, bank_name, upi_id").eq("doctor_user_id", session.user.id).eq("type", "bank").maybeSingle();
      if (b) setBank(b as Bank);
      setLoading(false);
    })();
  }, [therapist.id]);

  const saveProfile = async () => {
    setSaving(true);
    const { error } = await supabase.from("therapists").update({
      full_name: profile.full_name, phone: profile.phone,
      city: profile.city || null, state: profile.state || null,
      years_experience: Number(profile.years_experience) || 0,
    }).eq("id", therapist.id);
    setSaving(false);
    if (error) return toast({ title: "Save failed", description: error.message, variant: "destructive" });
    toast({ title: "Profile updated" });
  };

  const saveBank = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    setSaving(true);
    const payload = { ...bank, doctor_user_id: session.user.id, type: "bank", is_default: true };
    const { error } = bank.id
      ? await supabase.from("doctor_bank_details").update(payload).eq("id", bank.id)
      : await supabase.from("doctor_bank_details").insert(payload);
    setSaving(false);
    if (error) return toast({ title: "Save failed", description: error.message, variant: "destructive" });
    toast({ title: "Bank details saved" });
  };

  if (loading) return <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Profile</h1>
      <Card><CardContent className="p-6 space-y-4">
        <h2 className="font-semibold">Personal info</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div><Label>Full name</Label><Input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} /></div>
          <div><Label>Phone</Label><Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
          <div><Label>City</Label><Input value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} /></div>
          <div><Label>State</Label><Input value={profile.state} onChange={(e) => setProfile({ ...profile, state: e.target.value })} /></div>
          <div><Label>Years of experience</Label><Input type="number" value={profile.years_experience} onChange={(e) => setProfile({ ...profile, years_experience: Number(e.target.value) })} /></div>
        </div>
        <Button onClick={saveProfile} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save profile</Button>
      </CardContent></Card>

      <Card><CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2"><Wallet className="h-5 w-5 text-primary" /><h2 className="font-semibold">Bank account for payouts</h2></div>
        <div className="grid md:grid-cols-2 gap-4">
          <div><Label>Account holder</Label><Input value={bank.account_holder_name ?? ""} onChange={(e) => setBank({ ...bank, account_holder_name: e.target.value })} /></div>
          <div><Label>Bank name</Label><Input value={bank.bank_name ?? ""} onChange={(e) => setBank({ ...bank, bank_name: e.target.value })} /></div>
          <div><Label>Account number</Label><Input value={bank.account_number ?? ""} onChange={(e) => setBank({ ...bank, account_number: e.target.value })} /></div>
          <div><Label>IFSC code</Label><Input value={bank.ifsc_code ?? ""} onChange={(e) => setBank({ ...bank, ifsc_code: e.target.value.toUpperCase() })} /></div>
          <div className="md:col-span-2"><Label>UPI ID (optional)</Label><Input value={bank.upi_id ?? ""} onChange={(e) => setBank({ ...bank, upi_id: e.target.value })} placeholder="name@upi" /></div>
        </div>
        <Button onClick={saveBank} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save bank details</Button>
      </CardContent></Card>
    </div>
  );
};

export default TherapistProfile;
