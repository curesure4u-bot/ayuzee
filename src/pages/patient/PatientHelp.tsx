import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Phone, Mail, MessageCircle } from "lucide-react";

const faqs = [
  {
    q: "How do I book a doctor consultation?",
    a: "Go to Find Doctors, select a doctor, choose a slot, and pay. You'll receive a WhatsApp confirmation.",
  },
  {
    q: "How do I track my medicine order?",
    a: "Go to My Orders or visit /shop/track and enter your order ID.",
  },
  {
    q: "How do I cancel an appointment?",
    a: "Contact support at least 24 hours before your appointment for a full refund.",
  },
  {
    q: "What is the ATMRI Trust free treatment?",
    a: "AYUSH & Traditional Medicine Research Institute Trust sponsors free Ayurvedic treatment for patients who cannot afford it. Apply at /atmri-help/apply.",
  },
  {
    q: "How do I get my 80G donation certificate?",
    a: "After donating via the Ayush Help section, your certificate is emailed and available in My Donations.",
  },
];

const contacts = [
  { icon: Phone, title: "📞 Call Us", body: "Our support team is available 9 AM – 6 PM, Mon–Sat", href: "tel:+919999999999", action: "+91 99999 99999" },
  { icon: Mail, title: "📧 Email Us", body: "Reach out anytime — we respond within 24 hours", href: "mailto:support@ayuzee.com", action: "support@ayuzee.com" },
  { icon: MessageCircle, title: "💬 WhatsApp", body: "Chat with our team on WhatsApp", href: "https://wa.me/919999999999", action: "Open WhatsApp" },
];

const PatientHelp = () => {
  const [name, setName] = useState("");
  const [emailAddr, setEmailAddr] = useState("");
  const [message, setMessage] = useState("");

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Support request from ${name || "Ayuzee user"}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${emailAddr}\n\n${message}`);
    window.location.href = `mailto:support@ayuzee.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-semibold">❓ Help & Support</h1>
        <p className="text-sm text-muted-foreground">Find answers fast or get in touch with our team.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {contacts.map((c) => (
          <Card key={c.title}>
            <CardContent className="space-y-3 p-5">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                <c.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">{c.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{c.body}</p>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full">
                <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                  {c.action}
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-sm font-medium">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Send us a message</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={send} className="grid gap-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="help-name">Name</Label>
                <Input id="help-name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="help-email">Email</Label>
                <Input id="help-email" type="email" value={emailAddr} onChange={(e) => setEmailAddr(e.target.value)} required />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="help-msg">Message</Label>
              <Textarea id="help-msg" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} required />
            </div>
            <Button type="submit" className="w-fit">Send Message</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientHelp;
