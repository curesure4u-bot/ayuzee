import { useState, useEffect } from "react";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Star,
  ThumbsUp,
  MessageSquare,
  TrendingUp,
  Clock,
  Stethoscope,
  MessageCircle,
  Shield,
  Filter,
} from "lucide-react";

interface Review {
  id: string;
  patient_id: string;
  rating: number;
  title: string | null;
  review_text: string | null;
  is_anonymous: boolean;
  consultation_type: string | null;
  would_recommend: boolean;
  wait_time_rating: number | null;
  communication_rating: number | null;
  treatment_effectiveness: number | null;
  doctor_response: string | null;
  doctor_responded_at: string | null;
  helpful_count: number;
  status: string;
  created_at: string;
}

interface ReviewStats {
  total: number;
  average: number;
  distribution: number[];
  recommend_pct: number;
  avg_wait: number;
  avg_communication: number;
  avg_effectiveness: number;
}

const StarRating = ({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) => {
  const sizeClass = size === "lg" ? "h-5 w-5" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${sizeClass} ${s <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
};

const PatientReviews = () => {
  const { doctor, userId } = useDoctor();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ total: 0, average: 0, distribution: [0, 0, 0, 0, 0], recommend_pct: 0, avg_wait: 0, avg_communication: 0, avg_effectiveness: 0 });
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "responded">("all");

  useEffect(() => {
    if (!userId) return;
    loadReviews();
  }, [userId]);

  const loadReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("patient_reviews")
      .select("*")
      .eq("doctor_id", userId)
      .in("status", ["published", "pending"])
      .order("created_at", { ascending: false });

    if (!error && data) {
      const r = data as Review[];
      setReviews(r);
      calculateStats(r);
    }
    setLoading(false);
  };

  const calculateStats = (r: Review[]) => {
    if (r.length === 0) {
      setStats({ total: 0, average: 0, distribution: [0, 0, 0, 0, 0], recommend_pct: 0, avg_wait: 0, avg_communication: 0, avg_effectiveness: 0 });
      return;
    }
    const dist = [0, 0, 0, 0, 0];
    let totalRating = 0;
    let recommend = 0;
    let waitSum = 0, waitCount = 0;
    let commSum = 0, commCount = 0;
    let effSum = 0, effCount = 0;

    r.forEach((rev) => {
      dist[rev.rating - 1]++;
      totalRating += rev.rating;
      if (rev.would_recommend) recommend++;
      if (rev.wait_time_rating) { waitSum += rev.wait_time_rating; waitCount++; }
      if (rev.communication_rating) { commSum += rev.communication_rating; commCount++; }
      if (rev.treatment_effectiveness) { effSum += rev.treatment_effectiveness; effCount++; }
    });

    setStats({
      total: r.length,
      average: Math.round((totalRating / r.length) * 10) / 10,
      distribution: dist,
      recommend_pct: Math.round((recommend / r.length) * 100),
      avg_wait: waitCount ? Math.round((waitSum / waitCount) * 10) / 10 : 0,
      avg_communication: commCount ? Math.round((commSum / commCount) * 10) / 10 : 0,
      avg_effectiveness: effCount ? Math.round((effSum / effCount) * 10) / 10 : 0,
    });
  };

  const handleRespond = async (reviewId: string) => {
    if (!responseText.trim()) {
      toast.error("Please write a response");
      return;
    }
    const { error } = await supabase
      .from("patient_reviews")
      .update({ doctor_response: responseText, doctor_responded_at: new Date().toISOString() })
      .eq("id", reviewId);

    if (error) {
      toast.error("Failed to save response");
    } else {
      toast.success("Response posted successfully");
      setRespondingTo(null);
      setResponseText("");
      loadReviews();
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (filter === "pending") return !r.doctor_response;
    if (filter === "responded") return !!r.doctor_response;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Patient Reviews</h1>
        <p className="text-muted-foreground">Monitor and respond to patient feedback to build trust and improve your practice.</p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <p className="font-display text-3xl font-bold text-primary">{stats.average}</p>
            <StarRating rating={Math.round(stats.average)} size="lg" />
            <p className="mt-1 text-xs text-muted-foreground">{stats.total} reviews</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <p className="font-display text-3xl font-bold text-green-600">{stats.recommend_pct}%</p>
            <p className="text-xs text-muted-foreground">Would Recommend</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <p className="font-display text-3xl font-bold text-blue-600">{stats.avg_communication}</p>
            <p className="text-xs text-muted-foreground">Communication</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <p className="font-display text-3xl font-bold text-emerald-600">{stats.avg_effectiveness}</p>
            <p className="text-xs text-muted-foreground">Treatment Effectiveness</p>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      {stats.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.distribution[star - 1];
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="w-6 text-sm font-medium">{star}★</span>
                  <Progress value={pct} className="h-2 flex-1" />
                  <span className="w-8 text-right text-xs text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
          All ({reviews.length})
        </Button>
        <Button variant={filter === "pending" ? "default" : "outline"} size="sm" onClick={() => setFilter("pending")}>
          Needs Response ({reviews.filter((r) => !r.doctor_response).length})
        </Button>
        <Button variant={filter === "responded" ? "default" : "outline"} size="sm" onClick={() => setFilter("responded")}>
          Responded ({reviews.filter((r) => !!r.doctor_response).length})
        </Button>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <Card className="py-12 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-muted-foreground">No reviews yet. They'll appear here once patients leave feedback.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} />
                      {review.title && <span className="font-medium text-sm">{review.title}</span>}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {review.is_anonymous ? "Anonymous Patient" : "Patient"} · {new Date(review.created_at).toLocaleDateString("en-IN")}
                      {review.consultation_type && (
                        <Badge variant="outline" className="ml-2 text-[10px]">{review.consultation_type}</Badge>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ThumbsUp className="h-3.5 w-3.5" /> {review.helpful_count}
                  </div>
                </div>

                {review.review_text && (
                  <p className="mt-3 text-sm leading-relaxed text-foreground/80">{review.review_text}</p>
                )}

                {/* Sub-ratings */}
                {(review.wait_time_rating || review.communication_rating || review.treatment_effectiveness) && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {review.wait_time_rating && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" /> Wait: {review.wait_time_rating}/5
                      </div>
                    )}
                    {review.communication_rating && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageCircle className="h-3.5 w-3.5" /> Communication: {review.communication_rating}/5
                      </div>
                    )}
                    {review.treatment_effectiveness && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Stethoscope className="h-3.5 w-3.5" /> Effectiveness: {review.treatment_effectiveness}/5
                      </div>
                    )}
                  </div>
                )}

                {/* Doctor Response */}
                {review.doctor_response && (
                  <div className="mt-4 rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs font-medium text-primary flex items-center gap-1">
                      <Shield className="h-3.5 w-3.5" /> Doctor's Response
                    </p>
                    <p className="mt-1 text-sm text-foreground/80">{review.doctor_response}</p>
                    {review.doctor_responded_at && (
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {new Date(review.doctor_responded_at).toLocaleDateString("en-IN")}
                      </p>
                    )}
                  </div>
                )}

                {/* Respond Button */}
                {!review.doctor_response && (
                  <>
                    {respondingTo === review.id ? (
                      <div className="mt-4 space-y-3">
                        <Textarea
                          placeholder="Write a professional, empathetic response..."
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleRespond(review.id)}>Post Response</Button>
                          <Button size="sm" variant="ghost" onClick={() => { setRespondingTo(null); setResponseText(""); }}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3"
                        onClick={() => setRespondingTo(review.id)}
                      >
                        <MessageSquare className="mr-1 h-3.5 w-3.5" /> Respond
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientReviews;
