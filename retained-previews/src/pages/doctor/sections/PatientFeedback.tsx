import { useEffect, useState } from "react";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Star, Lightbulb, MessageSquareHeart } from "lucide-react";
import { Link } from "react-router-dom";

interface Feedback {
  id: string;
  patient_user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  patient_name?: string;
}

const PatientFeedback = () => {
  const { doctor } = useDoctor();
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!doctor?.id) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("patient_feedback")
        .select("*")
        .eq("doctor_id", doctor.id)
        .order("created_at", { ascending: false });
      const list = (data ?? []) as Feedback[];
      const ids = Array.from(new Set(list.map((l) => l.patient_user_id)));
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles").select("user_id, full_name").in("user_id", ids);
        list.forEach((l) => {
          l.patient_name = profs?.find((p) => p.user_id === l.patient_user_id)?.full_name ?? "Patient";
        });
      }
      setItems(list);
      setLoading(false);
    })();
  }, [doctor?.id]);

  const avg = items.length
    ? (items.reduce((s, i) => s + i.rating, 0) / items.length).toFixed(1)
    : null;

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <Link to="/doctor"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="font-display text-2xl">Patient Feedback</h1>
        </div>
        {avg && (
          <div className="flex items-center gap-2 text-sm">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="font-semibold">{avg}</span>
            <span className="text-muted-foreground">average across {items.length} reviews</span>
          </div>
        )}
      </Card>

      {loading ? (
        <Card className="p-8 text-center text-muted-foreground">Loading…</Card>
      ) : items.length === 0 ? (
        <>
          <Card className="p-10 text-center">
            <MessageSquareHeart className="mx-auto h-12 w-12 text-primary" />
            <h2 className="mt-3 font-display text-xl">No Patient Feedback Yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              It looks like you're missing out on valuable patient feedback!
            </p>
          </Card>
          <Card className="flex items-start gap-3 bg-primary/5 p-4">
            <Lightbulb className="mt-0.5 h-5 w-5 text-primary" />
            <p className="text-sm">
              More reviews lead to better visibility! Encourage all your patients to share their
              feedback to build trust and grow your practice.
            </p>
          </Card>
        </>
      ) : (
        <div className="space-y-3">
          {items.map((f) => (
            <Card key={f.id} className="p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{f.patient_name}</p>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < f.rating ? "fill-primary text-primary" : "text-muted-foreground/40"}`}
                    />
                  ))}
                </div>
              </div>
              {f.comment && <p className="mt-2 text-sm text-muted-foreground">{f.comment}</p>}
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(f.created_at).toLocaleDateString()}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientFeedback;
