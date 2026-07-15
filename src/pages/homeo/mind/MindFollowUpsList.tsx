import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { homeoTokens as t } from "../lib/ui";
import { Loader2 } from "lucide-react";

const MindFollowUpsList = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) return;
      const { data } = await supabase.from("homeo_mind_followups")
        .select("*, case:homeo_mind_cases(patient_name, suggested_remedy)")
        .eq("doctor_user_id", uid)
        .order("visit_date", { ascending: false }).limit(50);
      setRows(data ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="max-w-5xl space-y-5">
      <div>
        <p className={t.label}>Mind Case</p>
        <h1 className="font-display text-2xl font-semibold text-[hsl(45_85%_78%)]">Follow-ups</h1>
      </div>
      {loading ? <Loader2 className="h-6 w-6 animate-spin text-[hsl(45_85%_60%)]" /> :
        rows.length === 0 ? <div className={`${t.card} p-8 text-center`}><p className={t.mutedText}>No follow-ups recorded yet.</p></div> :
        <div className="space-y-2">
          {rows.map((h) => (
            <Link key={h.id} to={`/homeo/mind/cases/${h.case_id}`} className={`${t.card} p-4 block hover:border-[hsl(45_85%_55%/0.4)]`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="font-semibold text-[hsl(45_85%_78%)]">{h.case?.patient_name || "Patient"} · {new Date(h.visit_date).toLocaleDateString()}</p>
                {h.remedy_given && <span className={t.pill}>{h.remedy_given} {h.potency}</span>}
              </div>
              <p className={`${t.mutedText} text-xs mt-2`}>
                Trigger {h.trigger_response_score}/10 · Resilience {h.emotional_resilience_score}/10 · Sleep {h.sleep_score}/10 · Energy {h.energy_score}/10 · Physical {h.physical_complaint_score}/10
              </p>
            </Link>
          ))}
        </div>
      }
    </div>
  );
};

export default MindFollowUpsList;
