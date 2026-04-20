import { Button } from "@/components/ui/button";

export const CTA = () => (
  <section className="py-24">
    <div className="container">
      <div className="relative overflow-hidden rounded-3xl gradient-leaf p-10 shadow-elegant md:p-16">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary-foreground/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-secondary/30 blur-3xl" />
        <div className="relative grid items-center gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-3xl text-primary-foreground md:text-5xl">Begin your healing journey today.</h2>
            <p className="mt-4 max-w-md text-primary-foreground/85">Join thousands choosing authentic Ayurvedic care. First consultation 20% off.</p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Button variant="secondary" size="lg">Book consultation</Button>
            <Button variant="outline" size="lg" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">For doctors</Button>
          </div>
        </div>
      </div>
    </div>
  </section>
);
