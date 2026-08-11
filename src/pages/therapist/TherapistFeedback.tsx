import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MessageSquare, ThumbsUp } from "lucide-react";

interface TherapistContext {
  therapist: { id: string; user_id: string; full_name: string; verification_status: string; is_available: boolean };
  reload: () => Promise<void>;
}

interface Review {
  id: string;
  therapist_id: string;
  session_id: string;
  patient_name: string;
  rating: number;
  comment: string;
  compliment_tags: string[];
  therapist_response: string;
  responded_at: string;
  is_public: boolean;
  created_at: string;
}

export default function TherapistFeedback() {
  const { therapist } = useOutletContext<TherapistContext>();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState("all");
  const [editingResponse, setEditingResponse] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");

  useEffect(() => {
    fetchReviews();
  }, [therapist.id]);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("therapist_patient_reviews")
      .select("*")
      .eq("therapist_id", therapist.id)
      .order("created_at", { ascending: false });

    if (data) setReviews(data);
    if (error) toast.error("Failed to load reviews");
    setLoading(false);
  };

  const submitResponse = async (reviewId: string) => {
    const { error } = await (supabase as any)
      .from("therapist_patient_reviews")
      .update({ therapist_response: responseText, responded_at: new Date().toISOString() })
      .eq("id", reviewId);

    if (error) {
      toast.error("Failed to save response");
    } else {
      toast.success("Response saved");
      setEditingResponse(null);
      setResponseText("");
      fetchReviews();
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  // Compliment tag frequency
  const tagCounts: Record<string, number> = {};
  reviews.forEach((r) => {
    (r.compliment_tags || []).forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

  const filteredReviews = reviews.filter((r) => filterRating === "all" || r.rating === parseInt(filterRating));

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="p-6 text-center">Loading feedback...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <MessageSquare className="w-6 h-6" />Patient Feedback
      </h1>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-yellow-500">{avgRating}</div>
            <div className="flex justify-center mt-1">{renderStars(Math.round(parseFloat(avgRating)))}</div>
            <p className="text-sm text-muted-foreground mt-1">{reviews.length} reviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-500">
              {reviews.filter((r) => r.rating >= 4).length}
            </div>
            <p className="text-sm text-muted-foreground">Positive Reviews (4-5★)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-500">
              {reviews.filter((r) => r.therapist_response).length}
            </div>
            <p className="text-sm text-muted-foreground">Responded</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Compliments */}
      {sortedTags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ThumbsUp className="w-5 h-5" />Top Compliments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {sortedTags.map(([tag, count]) => (
                <Badge key={tag} variant="secondary" className="text-sm">
                  {tag} ({count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Select value={filterRating} onValueChange={setFilterRating}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="5">5 Stars</SelectItem>
            <SelectItem value="4">4 Stars</SelectItem>
            <SelectItem value="3">3 Stars</SelectItem>
            <SelectItem value="2">2 Stars</SelectItem>
            <SelectItem value="1">1 Star</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No reviews found
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{review.patient_name || "Anonymous"}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {renderStars(review.rating)}
                    {review.is_public && <Badge variant="outline" className="text-xs">Public</Badge>}
                  </div>
                </div>

                {review.comment && <p className="text-sm">{review.comment}</p>}

                {review.compliment_tags && review.compliment_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {review.compliment_tags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                )}

                {/* Therapist response */}
                {review.therapist_response ? (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs font-medium mb-1">Your Response:</p>
                    <p className="text-sm">{review.therapist_response}</p>
                  </div>
                ) : editingResponse === review.id ? (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Write your response..."
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => submitResponse(review.id)}>Submit</Button>
                      <Button size="sm" variant="outline" onClick={() => { setEditingResponse(null); setResponseText(""); }}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => { setEditingResponse(review.id); setResponseText(""); }}>
                    Respond
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
