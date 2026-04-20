import { Button } from "@/components/ui/button";
import { ShoppingCart, Star } from "lucide-react";
import herbsImg from "@/assets/herbs-flatlay.jpg";

const products = [
  { name: "Ashwagandha Churna", brand: "Classical · 200g", price: 349, was: 499, rating: 4.8 },
  { name: "Triphala Tablets", brand: "Daily Wellness · 60ct", price: 249, was: 320, rating: 4.7 },
  { name: "Brahmi Hair Oil", brand: "Cold Pressed · 200ml", price: 449, was: 599, rating: 4.9 },
  { name: "Chyawanprash Premium", brand: "Immunity · 500g", price: 549, was: 699, rating: 4.9 },
];

export const Products = () => (
  <section className="bg-accent/40 py-24" id="products">
    <div className="container">
      <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
        <div className="relative overflow-hidden rounded-3xl shadow-elegant">
          <img src={herbsImg} alt="Ayurvedic herbs and powders" loading="lazy" width={1200} height={900} className="h-full w-full object-cover" />
          <div className="absolute inset-0 gradient-hero opacity-80" />
          <div className="absolute inset-0 flex flex-col justify-end p-8 text-primary-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-90">Authentic Store</span>
            <h2 className="mt-2 text-3xl md:text-4xl">Lab-tested medicines, delivered to your door</h2>
            <p className="mt-3 text-sm opacity-90">From classical formulations to daily wellness essentials.</p>
            <Button variant="secondary" className="mt-6 w-fit">Shop all products</Button>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {products.map((p) => (
            <article key={p.name} className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-6 transition-smooth hover:shadow-elegant">
              <div>
                <div className="mb-4 grid aspect-square place-items-center rounded-xl gradient-soft">
                  <div className="font-display text-5xl text-primary/30">{p.name[0]}</div>
                </div>
                <p className="text-xs text-muted-foreground">{p.brand}</p>
                <h3 className="mt-1 font-semibold">{p.name}</h3>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-secondary text-secondary" /> {p.rating}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <span className="text-lg font-semibold">₹{p.price}</span>
                  <span className="ml-2 text-sm text-muted-foreground line-through">₹{p.was}</span>
                </div>
                <Button variant="ghost" size="icon" aria-label="Add to cart"><ShoppingCart className="h-4 w-4" /></Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  </section>
);
