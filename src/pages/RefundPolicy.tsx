import { Footer } from "@/components/site/Footer";
import { RefreshCw, Package, Stethoscope, CalendarX, Ban, Clock, Mail, HelpCircle } from "lucide-react";

const RefundPolicy = () => {
  const lastUpdated = "June 2026";

  const policyItems = [
    {
      icon: Package,
      title: "Medicine Orders",
      summary: "7-day return window from date of delivery.",
      details: (
        <ul className="list-disc space-y-1 pl-5">
          <li>Medicines and wellness products can be returned within 7 days of delivery if unopened, unused and in original packaging.</li>
          <li>Products with broken seals, used items, perishables and personalised prescriptions are not eligible for return.</li>
          <li>Once the returned item is received and inspected, the refund is processed to the original payment method within 5–7 business days.</li>
          <li>Shipping charges are non-refundable unless the return is due to a damaged or incorrect item sent by us.</li>
        </ul>
      ),
    },
    {
      icon: Stethoscope,
      title: "Consultations",
      summary: "Cancel within 24 hours of booking for a full refund.",
      details: (
        <ul className="list-disc space-y-1 pl-5">
          <li>Consultation fees are fully refundable if the appointment is cancelled at least 24 hours before the scheduled time.</li>
          <li>Cancellations made less than 24 hours before the appointment may be eligible for a partial refund at Ayuzee&apos;s discretion.</li>
          <li>No refund is issued if the patient does not join the call within 15 minutes of the scheduled start time (no-show).</li>
          <li>If the doctor cancels or fails to join, a full refund is issued automatically.</li>
        </ul>
      ),
    },
    {
      icon: CalendarX,
      title: "Therapy Sessions",
      summary: "Cancellation terms depend on provider policy.",
      details: (
        <ul className="list-disc space-y-1 pl-5">
          <li>Therapy session refunds are governed by the cancellation policy of the therapist or venue hosting the session.</li>
          <li>Most therapy bookings can be cancelled up to 24 hours in advance for a full refund.</li>
          <li>Late cancellations and no-shows may forfeit the session fee or be charged a partial amount.</li>
          <li>Refunds for completed sessions are not provided unless there is a documented quality issue, which will be reviewed case by case.</li>
        </ul>
      ),
    },
    {
      icon: Ban,
      title: "Non-Refundable Items",
      details: (
        <ul className="list-disc space-y-1 pl-5">
          <li>Opened, used or damaged-by-user products.</li>
          <li>Gift cards, promotional credits and wallet top-ups.</li>
          <li>Services already consumed or partially consumed.</li>
          <li>Products purchased during clearance or final-sale promotions.</li>
        </ul>
      ),
    },
  ];

  return (
    <>
      <main className="container py-16">
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-semibold md:text-5xl">Refund & Cancellation Policy</h1>
          <p className="mt-4 text-lg text-muted-foreground">Last updated: {lastUpdated}</p>
        </header>

        <div className="mx-auto mt-12 max-w-3xl space-y-8">
          <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
            This page is maintained by Ayuzee as app-owned content. The policies below describe our current refund and cancellation practices for orders, consultations and therapy sessions.
          </div>

          <section className="rounded-2xl border bg-card p-6">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-semibold">Overview</h2>
            </div>
            <p className="mt-3 text-muted-foreground">
              We want every experience on Ayuzee to be satisfactory. If you are not happy with a product or service, please review the category-specific terms below and contact our support team. Refunds are processed to the original payment method used at the time of purchase.
            </p>
          </section>

          {policyItems.map(({ icon: Icon, title, summary, details }) => (
            <section key={title} className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="font-display text-2xl font-semibold">{title}</h2>
                  {summary && <p className="text-sm font-medium text-primary">{summary}</p>}
                </div>
              </div>
              <div className="pl-12 text-muted-foreground leading-relaxed">{details}</div>
            </section>
          ))}

          <section className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border bg-card p-6">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl font-semibold">Processing Time</h2>
              </div>
              <p className="mt-3 text-muted-foreground">
                Approved refunds are typically credited within 5–7 business days. Depending on your bank or payment provider, it may take additional time to reflect in your account.
              </p>
            </div>
            <div className="rounded-2xl border bg-card p-6">
              <div className="flex items-center gap-3">
                <HelpCircle className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl font-semibold">How to Request a Refund</h2>
              </div>
              <p className="mt-3 text-muted-foreground">
                You can initiate a refund request from your order or booking details page, or by emailing our support team with your order/appointment ID and reason for refund.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-6">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-semibold">Need Help?</h2>
            </div>
            <p className="mt-3 text-muted-foreground">
              For refund status, disputes or questions, contact us at{" "}
              <a href="mailto:support@ayuzee.com" className="text-primary hover:underline">support@ayuzee.com</a>{" "}
              or call{" "}
              <a href="tel:+918610302794" className="text-primary hover:underline">+91 86103 02794</a>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default RefundPolicy;
