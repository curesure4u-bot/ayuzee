import { useState, useEffect } from "react";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText, Star, Heart, MessageSquare, Users, ShoppingCart,
  Calendar, Award, TrendingUp, Stethoscope, Clock,
} from "lucide-react";

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  icon: React.ElementType;
  color: string;
}

const DoctorActivityFeed = () => {
  const { doctor, userId } = useDoctor();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !doctor?.id) return;
    loadActivities();
  }, [userId, doctor?.id]);

  const loadActivities = async () => {
    setLoading(true);
    const acts: Activity[] = [];

    // Recent appointments completed
    const { data: appts } = await supabase
      .from("appointments").select("id, appointment_date, time_slot")
      .eq("doctor_id", doctor!.id).eq("status", "completed")
      .order("appointment_date", { ascending: false }).limit(5);
    (appts ?? []).forEach((a: any) => {
      acts.push({
        id: `appt-${a.id}`, type: "consultation", title: "Consultation completed",
        description: `${a.appointment_date} at ${a.time_slot}`,
        timestamp: a.appointment_date, icon: Stethoscope, color: "text-blue-600 bg-blue-100",
      });
    });

    // Recent feed posts
    const { data: posts } = await supabase
      .from("feed_posts").select("id, title, created_at, like_count")
      .eq("author_user_id", userId).order("created_at", { ascending: false }).limit(5);
    (posts ?? []).forEach((p: any) => {
      acts.push({
        id: `post-${p.id}`, type: "post", title: p.title || "Published a post",
        description: `${p.like_count ?? 0} likes`,
        timestamp: p.created_at, icon: FileText, color: "text-violet-600 bg-violet-100",
      });
    });

    // Recent reviews received
    const { data: reviews } = await supabase
      .from("patient_reviews").select("id, rating, created_at")
      .eq("doctor_id", userId).eq("status", "published")
      .order("created_at", { ascending: false }).limit(5);
    (reviews ?? []).forEach((r: any) => {
      acts.push({
        id: `review-${r.id}`, type: "review",
        title: `Received ${r.rating}★ patient review`,
        description: new Date(r.created_at).toLocaleDateString("en-IN"),
        timestamp: r.created_at, icon: Star, color: "text-amber-600 bg-amber-100",
      });
    });

    // Recent partner orders
    const { data: orders } = await supabase
      .from("orders").select("id, total, created_at")
      .eq("placed_by_doctor_id", doctor!.id)
      .order("created_at", { ascending: false }).limit(5);
    (orders ?? []).forEach((o: any) => {
      acts.push({
        id: `order-${o.id}`, type: "order",
        title: `Partner order ₹${o.total}`,
        description: new Date(o.created_at).toLocaleDateString("en-IN"),
        timestamp: o.created_at, icon: ShoppingCart, color: "text-emerald-600 bg-emerald-100",
      });
    });

    // Sort all by timestamp descending
    acts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setActivities(acts.slice(0, 20));
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Activity Feed</h1>
        <p className="text-muted-foreground">Your recent actions, achievements, and interactions on Ayuzee.</p>
      </div>

      {activities.length === 0 ? (
        <Card className="py-12 text-center">
          <Clock className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-muted-foreground">No activity yet. Start consulting, posting, and engaging!</p>
        </Card>
      ) : (
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="relative flex items-start gap-4 pl-3">
                <div className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full ${activity.color}`}>
                  <activity.icon className="h-5 w-5" />
                </div>
                <Card className="flex-1">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorActivityFeed;
