import {  useEffect, useMemo, useState  } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Link } from "react-router-dom";
import { ChevronRight, FileText, ImageIcon, Upload, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

const deliverySchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(10).max(15),
  address: z.string().trim().min(6).max(300),
  pincode: z.string().trim().regex(/^\d{4,10}$/, "Invalid pincode"),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  notes: z.string().trim().max(500).optional(),
});

type DeliveryForm = z.infer<typeof deliverySchema>;

const PrescriptionUpload = () => {
  usePageSEO({ title: "Upload Prescription — Ayuzee" });
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<DeliveryForm>({ name: "", phone: "", address: "", pincode: "", city: "", state: "", notes: "" });

  useEffect(() => { (async () => {
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user.id ?? null;
      setUserId(uid);
      if (!uid) return;
      const { data: profile } = await supabase.from("profiles").select("full_name,phone").eq("user_id", uid).maybeSingle();
      setForm((current) => ({ ...current, name: profile?.full_name ?? "", phone: profile?.phone ?? "" }));
    })();
  }, []);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  const fileSummary = useMemo(() => files.map((file) => file.name).join(", "), [files]);
  const onChange = (key: keyof DeliveryForm) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [key]: event.target.value });

  const onFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []).filter((file) => /^(image\/|application\/pdf)/.test(file.type));
    if (selected.length === 0) return;
    setFiles((current) => [...current, ...selected].slice(0, 6));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (files.length === 0) return toast.error("Upload at least one prescription");
    const parsed = deliverySchema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0]?.message || "Please check delivery details");
    setSubmitting(true);
    try {
      const folder = userId ?? "guest";
      const uploadedPaths: string[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop() || (file.type === "application/pdf" ? "pdf" : "jpg");
        const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from("prescriptions").upload(path, file, { contentType: file.type, upsert: false });
        if (error) throw error;
        uploadedPaths.push(path);
      }

      const { error: insertError } = await (supabase as any).from("prescription_orders").insert({
        user_id: userId,
        guest_name: parsed.data.name,
        guest_phone: parsed.data.phone,
        prescription_urls: uploadedPaths,
        delivery_address: {
          name: parsed.data.name,
          phone: parsed.data.phone,
          address: parsed.data.address,
          pincode: parsed.data.pincode,
          city: parsed.data.city,
          state: parsed.data.state,
        },
        notes: parsed.data.notes || null,
      });
      if (insertError) throw insertError;

      await supabase.functions.invoke("send-whatsapp", {
        body: { to: parsed.data.phone, message: "Your Ayuzee prescription has been received. Our team will review and send you a WhatsApp quote within 2 hours." },
      });
      setSubmitted(true);
      toast.success("Prescription received");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit prescription");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-muted/30">
        <main className="container grid min-h-[70vh] place-items-center py-12">
          <Card className="max-w-xl text-center">
            <CardContent className="p-8">
              <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
              <h1 className="mt-5 font-display text-3xl">Your prescription has been received!</h1>
              <p className="mt-3 text-muted-foreground">Our team will review and send you a WhatsApp quote within 2 hours.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3"><Button asChild variant="hero"><Link to="/shop/track">Track orders</Link></Button><Button asChild variant="outline"><Link to="/shop">Continue shopping</Link></Button></div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <section className="border-b border-border bg-background">
        <div className="container py-10 md:py-14">
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground"><Link to="/" className="text-primary hover:underline">Home</Link><ChevronRight className="h-3.5 w-3.5" /><Link to="/shop" className="text-primary hover:underline">Medicines</Link><ChevronRight className="h-3.5 w-3.5" /><span>Upload Prescription</span></div>
          <h1 className="max-w-4xl font-display text-3xl md:text-5xl">Order medicines with your prescription</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground md:text-lg">Upload your doctor's prescription and our team will prepare your order.</p>
        </div>
      </section>

      <main className="container py-8">
        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Card><CardHeader><CardTitle>Step 1 · Upload prescription</CardTitle></CardHeader><CardContent>
              <Label htmlFor="prescription" className="grid cursor-pointer place-items-center rounded-xl border border-dashed border-border bg-background p-8 text-center transition-smooth hover:bg-accent">
                <Upload className="mb-3 h-8 w-8 text-primary" />
                <span className="font-semibold">Upload images or PDFs</span>
                <span className="mt-1 text-sm text-muted-foreground">Multiple files supported</span>
              </Label>
              <Input id="prescription" type="file" accept="image/*,application/pdf" multiple className="hidden" onChange={onFiles} />
              {files.length > 0 && <p className="mt-3 text-sm text-muted-foreground">Selected: {fileSummary}</p>}
              <div className="mt-4 grid gap-3 sm:grid-cols-3">{files.map((file, index) => <div key={`${file.name}-${index}`} className="grid aspect-video place-items-center overflow-hidden rounded-lg border border-border bg-muted/40">{file.type === "application/pdf" ? <FileText className="h-8 w-8 text-primary" /> : previews[index] ? <img src={previews[index]} alt={file.name} className="h-full w-full object-cover" /> : <ImageIcon className="h-8 w-8 text-primary" />}</div>)}</div>
            </CardContent></Card>

            <Card><CardHeader><CardTitle>Step 2 · Delivery details</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><Label htmlFor="name">Name</Label><Input id="name" value={form.name} onChange={onChange("name")} required /></div>
              <div><Label htmlFor="phone">Phone</Label><Input id="phone" type="tel" value={form.phone} onChange={onChange("phone")} required /></div>
              <div><Label htmlFor="pincode">Pincode</Label><Input id="pincode" value={form.pincode} onChange={onChange("pincode")} required /></div>
              <div className="sm:col-span-2"><Label htmlFor="address">Address</Label><Input id="address" value={form.address} onChange={onChange("address")} required /></div>
              <div><Label htmlFor="city">City</Label><Input id="city" value={form.city} onChange={onChange("city")} required /></div>
              <div><Label htmlFor="state">State</Label><Input id="state" value={form.state} onChange={onChange("state")} required /></div>
            </CardContent></Card>

            <Card><CardHeader><CardTitle>Step 3 · Add notes</CardTitle></CardHeader><CardContent><Label htmlFor="notes">Additional instructions</Label><Textarea id="notes" value={form.notes} onChange={onChange("notes")} placeholder="Preferred brands, substitutions, urgent delivery notes…" /></CardContent></Card>
          </div>

          <aside className="h-fit rounded-xl border border-border bg-background p-6 shadow-soft lg:sticky lg:top-24">
            <h2 className="font-display text-xl">Step 4 · Submit</h2>
            <p className="mt-2 text-sm text-muted-foreground">Our pharmacy team will review your prescription, confirm availability, and send a quote on WhatsApp.</p>
            <Button type="submit" variant="hero" size="lg" className="mt-6 w-full" disabled={submitting}>{submitting ? "Submitting…" : "Submit prescription"}</Button>
          </aside>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default PrescriptionUpload;
