import { FormEvent, useState } from "react";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().trim().email("Invalid email address").max(255, "Email is too long"),
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject is too long"),
  message: z.string().trim().min(1, "Message is required").max(2000, "Message is too long"),
});

export default function Contact() {
  const [sending, setSending] = useState(false);
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      subject: String(formData.get("subject") ?? ""),
      message: String(formData.get("message") ?? ""),
    };

    const parsed = contactSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      setSending(false);
      return;
    }

    try {
      const { error } = await supabase.from("contact_submissions").insert([parsed.data]);
      if (error) throw error;
      toast.success("Thanks! We'll get back to you within 24 hours.");
      form.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };
  return (
    <>
      <main className="container py-16">
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-semibold md:text-5xl">Contact Us</h1>
          <p className="mt-4 text-lg text-muted-foreground">Questions, partnerships or feedback — we'd love to hear from you.</p>
        </header>

        <section className="mt-12 grid gap-8 md:grid-cols-3">
          <div className="space-y-4 md:col-span-1">
            <div className="rounded-2xl border bg-card p-5"><Mail className="h-5 w-5 text-primary" /><p className="mt-3 text-sm font-medium">Email</p><a className="text-sm text-muted-foreground hover:text-primary" href="mailto:support@ayuzee.com">support@ayuzee.com</a></div>
            <div className="rounded-2xl border bg-card p-5"><Phone className="h-5 w-5 text-primary" /><p className="mt-3 text-sm font-medium">Phone</p><a className="text-sm text-muted-foreground hover:text-primary" href="tel:+911800000000">1800-000-000</a></div>
            <div className="rounded-2xl border bg-card p-5"><MapPin className="h-5 w-5 text-primary" /><p className="mt-3 text-sm font-medium">Office</p><p className="text-sm text-muted-foreground">Chennai, Tamil Nadu, India</p></div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border bg-card p-6 md:col-span-2">
            <div className="grid gap-4 md:grid-cols-2">
              <div><Label htmlFor="name">Name</Label><Input id="name" name="name" required /></div>
              <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required /></div>
            </div>
            <div><Label htmlFor="subject">Subject</Label><Input id="subject" name="subject" required /></div>
            <div><Label htmlFor="msg">Message</Label><Textarea id="msg" name="message" rows={6} required /></div>
            <Button type="submit" disabled={sending}>{sending ? "Sending…" : "Send Message"}</Button>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}
