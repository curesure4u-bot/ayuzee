import { FormEvent, useState } from "react";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function Contact() {
  const [sending, setSending] = useState(false);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => { setSending(false); toast.success("Thanks! We'll get back to you within 24 hours."); (e.target as HTMLFormElement).reset(); }, 600);
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
              <div><Label htmlFor="name">Name</Label><Input id="name" required /></div>
              <div><Label htmlFor="email">Email</Label><Input id="email" type="email" required /></div>
            </div>
            <div><Label htmlFor="subject">Subject</Label><Input id="subject" required /></div>
            <div><Label htmlFor="msg">Message</Label><Textarea id="msg" rows={6} required /></div>
            <Button type="submit" disabled={sending}>{sending ? "Sending…" : "Send Message"}</Button>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}
