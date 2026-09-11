import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Tag, Plus, Save, Share2, IndianRupee, Calendar, Ticket,
  Gift, Percent, Package, Users, Sun,
} from "lucide-react";

interface Offer {
  id: string;
  title: string;
  description?: string | null;
  offer_type?: string | null;
  discount_label?: string | null;
  original_price?: number | null;
  offer_price?: number | null;
  valid_from?: string | null;
  valid_until?: string | null;
  promo_code?: string | null;
  terms?: string | null;
  is_active: boolean;
}

const typeMeta: Record<string, { icon: any; color: string; label: string }> = {
  discount: { icon: Percent, color: "green", label: "Discount" },
  package: { icon: Package, color: "blue", label: "Package" },
  referral: { icon: Users, color: "pink", label: "Referral" },
  seasonal: { icon: Sun, color: "amber", label: "Seasonal" },
  camp: { icon: Users, color: "purple", label: "Camp" },
};

const blank = {
  title: "", description: "", offer_type: "discount", discount_label: "",
  original_price: "", offer_price: "", valid_until: "", promo_code: "", terms: "",
};

export default function SpineOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...blank });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await (supabase.from("spine_offers") as any)
        .select("*")
        .order("created_at", { ascending: false });
      setOffers((data as Offer[]) || []);
    } catch { setOffers([]); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.title) { toast.error("Enter an offer title"); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await (supabase.from("spine_offers") as any).insert({
        owner_id: user?.id || null,
        title: form.title,
        description: form.description || null,
        offer_type: form.offer_type,
        discount_label: form.discount_label || null,
        original_price: form.original_price ? Number(form.original_price) : null,
        offer_price: form.offer_price ? Number(form.offer_price) : null,
        valid_until: form.valid_until || null,
        promo_code: form.promo_code || null,
        terms: form.terms || null,
        is_active: true,
      });
      if (error) { toast.error("Save failed: " + error.message); }
      else { toast.success("Offer created!"); setForm({ ...blank }); setShowForm(false); load(); }
    } catch { toast.error("Something went wrong"); }
    setSaving(false);
  };

  const toggleActive = async (o: Offer) => {
    try {
      await (supabase.from("spine_offers") as any).update({ is_active: !o.is_active }).eq("id", o.id);
      load();
    } catch { toast.error("Update failed"); }
  };

  const share = (o: Offer) => {
    const price = o.offer_price != null ? ` Now ₹${o.offer_price}${o.original_price ? ` (was ₹${o.original_price})` : ""}.` : "";
    const code = o.promo_code ? ` Use code ${o.promo_code}.` : "";
    const until = o.valid_until ? ` Valid till ${new Date(o.valid_until).toLocaleDateString()}.` : "";
    const text = `🎁 ${o.title}${o.discount_label ? ` — ${o.discount_label}` : ""}!${price}${code}${until} Book now!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const isExpired = (o: Offer) => o.valid_until && new Date(o.valid_until) < new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Tag className="h-6 w-6 text-rose-500" /> Offers & Promotions</h1>
          <p className="text-muted-foreground mt-1">Time-limited offers to drive bookings — share to WhatsApp in one tap.</p>
        </div>
        <Button size="sm" onClick={() => setShowForm((v) => !v)} className="gap-1"><Plus className="h-4 w-4" /> New Offer</Button>
      </div>

      {showForm && (
        <Card className="border-rose-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><Gift className="h-4 w-4" /> Create Offer</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs font-medium">Title</label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. First Visit Assessment" /></div>
              <div><label className="text-xs font-medium">Type</label>
                <Select value={form.offer_type} onValueChange={(v) => setForm({ ...form, offer_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeMeta).map(([k, m]) => <SelectItem key={k} value={k}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><label className="text-xs font-medium">Description</label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What the offer includes..." className="h-16" /></div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div><label className="text-xs font-medium">Badge Label</label><Input value={form.discount_label} onChange={(e) => setForm({ ...form, discount_label: e.target.value })} placeholder="e.g. 20% OFF" /></div>
              <div><label className="text-xs font-medium">Original ₹</label><Input type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} placeholder="500" /></div>
              <div><label className="text-xs font-medium">Offer ₹</label><Input type="number" value={form.offer_price} onChange={(e) => setForm({ ...form, offer_price: e.target.value })} placeholder="199" /></div>
              <div><label className="text-xs font-medium">Valid Until</label><Input type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs font-medium">Promo Code</label><Input value={form.promo_code} onChange={(e) => setForm({ ...form, promo_code: e.target.value.toUpperCase() })} placeholder="SPINE199" /></div>
              <div><label className="text-xs font-medium">Terms</label><Input value={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.value })} placeholder="New patients only" /></div>
            </div>
            <Button className="w-full gap-1" onClick={save} disabled={saving}><Save className="h-4 w-4" /> {saving ? "Saving..." : "Create Offer"}</Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
      ) : offers.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No offers yet. Create your first promotion above.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((o) => {
            const meta = typeMeta[o.offer_type || "discount"] || typeMeta.discount;
            const Icon = meta.icon;
            const expired = isExpired(o);
            return (
              <Card key={o.id} className={`relative overflow-hidden ${!o.is_active || expired ? "opacity-60" : ""}`}>
                {o.discount_label && (
                  <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">{o.discount_label}</div>
                )}
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-muted grid place-items-center"><Icon className="h-4 w-4 text-muted-foreground" /></div>
                    <Badge variant="secondary" className="text-[9px]">{meta.label}</Badge>
                    {expired && <Badge className="bg-red-100 text-red-700 text-[9px]">Expired</Badge>}
                  </div>
                  <p className="font-semibold text-sm mt-2">{o.title}</p>
                  {o.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{o.description}</p>}

                  {(o.offer_price != null) && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-lg font-bold text-rose-600 flex items-center"><IndianRupee className="h-4 w-4" />{o.offer_price}</span>
                      {o.original_price != null && <span className="text-xs text-muted-foreground line-through">₹{o.original_price}</span>}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                    {o.promo_code && <span className="flex items-center gap-1"><Ticket className="h-3 w-3" /> {o.promo_code}</span>}
                    {o.valid_until && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> till {new Date(o.valid_until).toLocaleDateString()}</span>}
                  </div>
                  {o.terms && <p className="text-[10px] text-muted-foreground mt-1">*{o.terms}</p>}

                  <div className="flex items-center gap-2 mt-3">
                    <Button size="sm" variant="outline" className="gap-1 flex-1" onClick={() => share(o)}><Share2 className="h-3.5 w-3.5" /> Share</Button>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-muted-foreground">{o.is_active ? "Active" : "Off"}</span>
                      <Switch checked={o.is_active} onCheckedChange={() => toggleActive(o)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
