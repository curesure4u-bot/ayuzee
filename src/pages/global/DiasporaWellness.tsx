import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const tiers = [
  {
    name: "Essential",
    price: "$29/mo",
    features: ["Monthly Prakriti check-in", "5 Teleconsult minutes", "Basic herb recommendations", "Community access", "Weekly wellness tips"],
    highlight: false,
  },
  {
    name: "Premium",
    price: "$79/mo",
    features: ["Weekly Prakriti tracking", "30 Teleconsult minutes", "Personalized diet plan", "Panchakarma guidance", "Priority support", "Family sharing (2)"],
    highlight: true,
  },
  {
    name: "Elite",
    price: "$149/mo",
    features: ["Daily AI coaching", "Unlimited teleconsults", "Custom herb formulations", "Quarterly detox plan", "Dedicated Vaidya", "Family sharing (5)", "Home remedy kit shipped"],
    highlight: false,
  },
];

const testimonials = [
  { name: "Priya S.", location: "London, UK", text: "Being away from India, I missed authentic Ayurvedic guidance. Ayuzee bridges that gap beautifully." },
  { name: "Rajan M.", location: "Toronto, Canada", text: "The Elite plan's dedicated Vaidya has transformed my family's health routine. Worth every penny." },
  { name: "Anita K.", location: "Dubai, UAE", text: "Finally, a platform that understands NRI wellness needs. The herb delivery is a game-changer." },
];

export default function DiasporaWellness() {
  const handleSubscribe = (tier: string) => {
    toast.success(`Subscribed to ${tier} plan! Welcome to Ayuzee Diaspora Wellness.`);
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">NRI Diaspora Wellness</h1>
        <p className="text-muted-foreground">Authentic Ayurvedic care, wherever you are in the world.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <Card key={tier.name} className={tier.highlight ? "ring-2 ring-primary" : ""}>
            <CardHeader className="text-center">
              {tier.highlight && <Badge className="mx-auto mb-2">Most Popular</Badge>}
              <CardTitle>{tier.name}</CardTitle>
              <p className="text-2xl font-bold">{tier.price}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <span className="text-green-500">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Button className="w-full" variant={tier.highlight ? "default" : "outline"} onClick={() => handleSubscribe(tier.name)}>
                Subscribe
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-center">What Our Members Say</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {testimonials.map((t) => (
            <Card key={t.name}>
              <CardContent className="pt-6 space-y-2">
                <p className="text-sm italic">"{t.text}"</p>
                <div className="text-sm font-medium">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.location}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
