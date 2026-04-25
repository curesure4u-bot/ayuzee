import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { setSEO } from "@/lib/seo";
import { ChevronLeft, MapPin, BedDouble, Tag, ExternalLink } from "lucide-react";

type Hospital = {
  id: string;
  hospital_name: string;
  hospital_type: string | null;
  address: string;
  city: string;
  state: string;
  contact_name: string | null;
  contact_phone: string | null;
  mou_signed_date: string | null;
  discount_percent: number | null;
  beds_reserved_for_atmri: number | null;
  venue_id: string | null;
  notes: string | null;
};

const PartnerHospitals = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSEO(
      "ATMRI Partner Hospitals · Free AYUSH Treatment",
      "Verified hospitals and Ayurveda centres that host ATMRI Trust patients at subsidised rates."
    );
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from("atmri_partner_hospitals")
        .select("*")
        .eq("is_active", true)
        .order("state", { ascending: true })
        .order("city", { ascending: true });
      setHospitals(data ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 py-10">
      <div className="container max-w-7xl">
        <Link to="/atmri-help" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" /> ATMRI Help
        </Link>

        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-5xl mb-3">🏥</div>
          <h1 className="font-display text-3xl md:text-4xl">ATMRI Partner Hospitals — Where We Send Patients</h1>
          <p className="text-muted-foreground mt-3">
            Verified hospitals and Ayurveda centres that host ATMRI Trust patients at subsidised rates.
          </p>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground py-20">Loading partner hospitals…</div>
        ) : hospitals.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-border bg-card">
            <div className="text-4xl mb-3">🏥</div>
            <p className="text-muted-foreground">Partner hospitals will appear here as MOUs are signed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hospitals.map((h) => (
              <div
                key={h.id}
                className="rounded-2xl border border-border bg-card hover:shadow-elegant transition-all p-5 flex flex-col"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-lg leading-tight">{h.hospital_name}</h3>
                  {h.hospital_type && (
                    <span className="shrink-0 text-xs rounded-full bg-accent text-accent-foreground px-2 py-1 capitalize">
                      {h.hospital_type}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{h.city}, {h.state}</span>
                </div>

                {h.contact_name && (
                  <div className="text-sm text-muted-foreground mt-1">Contact: {h.contact_name}</div>
                )}

                <div className="flex flex-wrap gap-1.5 mt-4">
                  {h.mou_signed_date && (
                    <span className="text-xs rounded-full bg-primary/10 text-primary px-2.5 py-1 font-medium">
                      MOU Signed ✓ {new Date(h.mou_signed_date).toLocaleDateString()}
                    </span>
                  )}
                  {h.discount_percent && h.discount_percent > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs rounded-full bg-amber-100 text-amber-800 px-2.5 py-1 font-medium">
                      <Tag className="h-3 w-3" /> {h.discount_percent}% discount for ATMRI
                    </span>
                  )}
                  {h.beds_reserved_for_atmri && h.beds_reserved_for_atmri > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs rounded-full bg-blue-100 text-blue-800 px-2.5 py-1 font-medium">
                      <BedDouble className="h-3 w-3" /> {h.beds_reserved_for_atmri} beds reserved
                    </span>
                  )}
                </div>

                {h.notes && (
                  <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{h.notes}</p>
                )}

                {h.venue_id && (
                  <Link
                    to="/venue/browse"
                    className="text-xs text-primary inline-flex items-center gap-1 mt-3 hover:underline"
                  >
                    Also on Ayuzee <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Become a Partner CTA */}
        <div className="mt-12 rounded-3xl bg-gradient-to-r from-primary/10 to-amber-100 border border-border p-8 md:p-12 text-center">
          <div className="text-4xl mb-3">🤝</div>
          <h3 className="font-display text-2xl md:text-3xl">Want to host ATMRI Trust patients?</h3>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Ayurveda hospitals, clinics, and resorts can partner with ATMRI Trust to provide
            treatment space for underprivileged patients at subsidised rates.
            Benefits: CSR recognition, Ayuzee listing, MOU certificate, community goodwill.
          </p>
          <div className="mt-6">
            <Button asChild size="lg">
              <Link to="/partner/apply?type=hospital_mou">Apply for Partnership</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerHospitals;
