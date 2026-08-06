import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Star, Flag, Eye, EyeOff, Search, MessageSquare, ThumbsUp } from "lucide-react";

interface Review {
  id: string;
  doctor_id: string;
  patient_id: string;
  rating: number;
  title: string | null;
  review_text: string | null;
  is_anonymous: boolean;
  consultation_type: string | null;
  status: string;
  helpful_count: number;
  report_count: number;
  doctor_response: string | null;
  created_at: string;
}

const AdminReviewModeration = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("flagged");
  const [search, setSearch] = useState("");

  useEffect(() => { loadReviews(); }, [filter]);

  const loadReviews = async () => {
    setLoading(true);
    let query = supabase.from("patient_reviews").select("*").order("created_at", { ascending: false });
    if (filter === "flagged") query = query.eq("status", "flagged");
    else if (filter === "pending") query = query.eq("status", "pending");
    else if (filter === "published") query = query.eq("status", "published");
    else if (filter === "hidden") query = query.eq("status", "hidden");
    const { data } = await query.limit(100);
    if (data) setReviews(data as Review[]);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("patient_reviews").update({ status }).eq("id", id);
    if (error) toast.error("Failed to update");
    else { toast.success(`Review ${status}`); loadReviews(); }
  };

  const filtered = reviews.filter((r) =>
    !search || (r.review_text ?? "").toLowerCase().includes(search.toLowerCase()) || (r.title ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Review Moderation</h1>
        <p className="text-muted-foreground">Moderate patient reviews — handle flagged, reported, and inappropriate content.</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search reviews..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="flagged">Flagged</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="hidden">Hidden</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
      ) : filtered.length === 0 ? (
        <Card className="py-12 text-center"><p className="text-muted-foreground">No reviews in this category.</p></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`h-4 w-4 ${s <= review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                        ))}
                      </div>
                      {review.title && <span className="text-sm font-medium">{review.title}</span>}
                      <Badge className={review.status === "flagged" ? "bg-red-100 text-red-700" : review.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                        {review.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(review.created_at).toLocaleDateString("en-IN")} · {review.is_anonymous ? "Anonymous" : "Named"} · {review.consultation_type ?? "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-0.5"><ThumbsUp className="h-3 w-3" />{review.helpful_count}</span>
                    <span className="flex items-center gap-0.5"><Flag className="h-3 w-3 text-red-500" />{review.report_count}</span>
                  </div>
                </div>

                {review.review_text && (
                  <p className="mt-2 text-sm text-foreground/80">{review.review_text}</p>
                )}

                {review.doctor_response && (
                  <div className="mt-2 rounded-md bg-muted/50 p-2 text-xs">
                    <span className="font-medium">Doctor response:</span> {review.doctor_response}
                  </div>
                )}

                <div className="mt-3 flex gap-2">
                  {review.status !== "published" && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(review.id, "published")}>
                      <Eye className="mr-1 h-3.5 w-3.5" /> Publish
                    </Button>
                  )}
                  {review.status !== "hidden" && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(review.id, "hidden")}>
                      <EyeOff className="mr-1 h-3.5 w-3.5" /> Hide
                    </Button>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => updateStatus(review.id, "removed")}>
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviewModeration;
