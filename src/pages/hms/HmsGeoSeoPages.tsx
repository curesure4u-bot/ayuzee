import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Globe, MapPin, Search, TrendingUp, Code, Eye,
  Plus, CheckCircle, RefreshCw, Sparkles, FileText, Copy
} from "lucide-react";

type SeoPage = {
  id: string;
  city: string;
  clinic_name: string;
  slug: string;
  status: "published" | "draft" | "generating";
  page_title: string;
  meta_description: string;
  keywords: string[];
  schema_markup: boolean;
  google_indexed: boolean;
  impressions_30d: number;
  clicks_30d: number;
  last_updated: string;
};

const mockPages: SeoPage[] = [
  { id: "1", city: "Kadayanallur", clinic_name: "Al Shifa AYUSH Hospital", slug: "/clinics/kadayanallur/al-shifa-ayush", status: "published", page_title: "Best Ayurveda Hospital in Kadayanallur | Al Shifa AYUSH", meta_description: "Al Shifa AYUSH Hospital offers Ayurveda, Panchakarma, Siddha & Homeopathy in Kadayanallur. Book online consultation. NABH-ready.", keywords: ["ayurveda kadayanallur", "panchakarma tenkasi", "ayush hospital"], schema_markup: true, google_indexed: true, impressions_30d: 2400, clicks_30d: 180, last_updated: "Jul 25" },
  { id: "2", city: "Tenkasi", clinic_name: "Al Shifa AYUSH Hospital", slug: "/clinics/tenkasi/al-shifa-ayush", status: "published", page_title: "Ayurveda & Panchakarma Treatment in Tenkasi | Al Shifa", meta_description: "Expert Ayurveda and Panchakarma treatments in Tenkasi district. Online booking available on Ayuzee.", keywords: ["ayurveda tenkasi", "panchakarma near me", "ayush clinic tenkasi"], schema_markup: true, google_indexed: true, impressions_30d: 1200, clicks_30d: 95, last_updated: "Jul 22" },
  { id: "3", city: "Tirunelveli", clinic_name: "Ayuzee Wellness Center", slug: "/clinics/tirunelveli/ayuzee-wellness", status: "draft", page_title: "Ayuzee Wellness Center Tirunelveli | Ayurveda & Yoga", meta_description: "Comprehensive AYUSH wellness center in Tirunelveli. Ayurveda, Yoga, Naturopathy. Book on Ayuzee app.", keywords: ["wellness tirunelveli", "yoga therapy", "naturopathy"], schema_markup: false, google_indexed: false, impressions_30d: 0, clicks_30d: 0, last_updated: "Jul 28" },
  { id: "4", city: "Chennai", clinic_name: "Partner Clinic - Vaidya Care", slug: "/clinics/chennai/vaidya-care", status: "generating", page_title: "Generating...", meta_description: "AI generating optimized content...", keywords: [], schema_markup: false, google_indexed: false, impressions_30d: 0, clicks_30d: 0, last_updated: "Today" },
];

const HmsGeoSeoPages = () => {
  const [pages] = useState<SeoPage[]>(mockPages);
  const [showGenerator, setShowGenerator] = useState(false);

  const totalImpressions = pages.reduce((s, p) => s + p.impressions_30d, 0);
  const totalClicks = pages.reduce((s, p) => s + p.clicks_30d, 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : "0";

  const handleGeneratePage = () => {
    toast.success("AI generating SEO-optimized landing page for this city/clinic. Ready in ~30 seconds.");
    setShowGenerator(false);
  };

  const handleCopySchema = (page: SeoPage) => {
    const schema = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "MedicalClinic",
      "name": page.clinic_name,
      "address": { "@type": "PostalAddress", "addressLocality": page.city, "addressCountry": "IN" },
      "medicalSpecialty": ["Ayurveda", "Panchakarma", "AYUSH"],
      "url": `https://ayuzee.com${page.slug}`,
    }, null, 2);
    navigator.clipboard.writeText(schema);
    toast.success("Schema.org markup copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" /> Geo-Rich SEO Pages
          </h1>
          <p className="text-sm text-muted-foreground">
            Auto-generate city & branch-specific landing pages for local search ranking
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => window.location.href = "/hms/marketing"}>Marketing</Button>
          <Button size="sm" onClick={() => setShowGenerator(true)}>
            <Plus className="mr-1 h-4 w-4" /> Generate New Page
          </Button>
        </div>
      </div>

      {/* SEO Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{pages.length}</p><p className="text-xs text-muted-foreground">Pages Created</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-blue-600">{totalImpressions.toLocaleString()}</p><p className="text-xs text-muted-foreground">Impressions (30d)</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-green-600">{totalClicks}</p><p className="text-xs text-muted-foreground">Clicks (30d)</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-purple-600">{avgCtr}%</p><p className="text-xs text-muted-foreground">Avg CTR</p></CardContent></Card>
      </div>

      {/* How it works */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-sm">AI-Powered Local SEO for Partner Clinics</p>
              <p className="text-xs text-muted-foreground mt-1">
                Ayuzee auto-generates city-specific landing pages for every partner clinic. Each page includes:
                local keywords, schema.org medical markup, doctor profiles, services, Google Maps embed,
                online booking CTA, and patient testimonials. This drives organic traffic from "ayurveda near me"
                searches directly to partner clinics on the Ayuzee platform.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pages List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" /> Generated Pages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pages.map(page => (
            <div key={page.id} className="rounded-lg border p-4 hover:bg-muted/20">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <p className="font-medium text-sm">{page.clinic_name} — {page.city}</p>
                    <Badge variant={page.status === "published" ? "default" : page.status === "draft" ? "secondary" : "outline"}>
                      {page.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">{page.slug}</p>
                  <p className="text-xs text-muted-foreground mt-1">{page.page_title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 italic">{page.meta_description}</p>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {page.keywords.map(kw => (
                      <Badge key={kw} variant="outline" className="text-[10px]">{kw}</Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0 space-y-1">
                  {page.status === "published" && (
                    <>
                      <p className="text-xs"><span className="text-muted-foreground">Impressions:</span> <strong>{page.impressions_30d.toLocaleString()}</strong></p>
                      <p className="text-xs"><span className="text-muted-foreground">Clicks:</span> <strong>{page.clicks_30d}</strong></p>
                      <div className="flex gap-1 mt-1">
                        {page.schema_markup && <Badge variant="outline" className="text-[10px] text-green-600"><Code className="h-2.5 w-2.5 mr-0.5" /> Schema</Badge>}
                        {page.google_indexed && <Badge variant="outline" className="text-[10px] text-blue-600"><CheckCircle className="h-2.5 w-2.5 mr-0.5" /> Indexed</Badge>}
                      </div>
                      <Button size="sm" variant="ghost" className="text-xs mt-1" onClick={() => handleCopySchema(page)}>
                        <Copy className="h-3 w-3 mr-1" /> Copy Schema
                      </Button>
                    </>
                  )}
                  {page.status === "generating" && (
                    <Badge variant="outline" className="animate-pulse"><Sparkles className="h-3 w-3 mr-1" /> AI Generating...</Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Generator Dialog */}
      {showGenerator && (
        <Card className="border-2 border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Generate New SEO Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">City/Location</Label><Input placeholder="e.g. Chennai, Tirunelveli..." /></div>
              <div><Label className="text-xs">Clinic Name</Label><Input placeholder="Partner clinic name" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Primary Specialties</Label><Input placeholder="Ayurveda, Panchakarma, Yoga..." /></div>
              <div><Label className="text-xs">Target Keywords</Label><Input placeholder="AI will also auto-suggest keywords" /></div>
            </div>
            <div className="flex items-center gap-3">
              <Switch defaultChecked /><Label className="text-xs">Include Schema.org Medical Markup</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch defaultChecked /><Label className="text-xs">Auto-include doctor profiles from HMS</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch defaultChecked /><Label className="text-xs">Google Maps embed</Label>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleGeneratePage}><Sparkles className="mr-1 h-4 w-4" /> AI Generate Page</Button>
              <Button variant="outline" onClick={() => setShowGenerator(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HmsGeoSeoPages;
