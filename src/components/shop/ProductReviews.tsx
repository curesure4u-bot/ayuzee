import { useEffect, useState } from "react";
import { z } from "zod";
import { Star, Loader2, BadgeCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  is_verified_purchase: boolean;
  created_at: string;
  reviewer_name?: string | null;
}

interface Props {
  productId: string;
  productName: string;
}

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().max(2000).optional(),
});

const ProductReviews = ({ productId, productName }: Props) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("product_reviews")
      .select("id,user_id,rating,title,body,is_verified_purchase,created_at")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    const list = (data as Review[]) ?? [];

    // Best-effort fetch of reviewer names from profiles
    if (list.length) {
      const ids = Array.from(new Set(list.map((r) => r.user_id)));
      const { data: profs } = await supabase.from("profiles").select("user_id,full_name").in("user_id", ids);
      const nameMap = new Map<string, string>();
      ((profs as { user_id: string; full_name: string | null }[]) ?? []).forEach((p) => nameMap.set(p.user_id, p.full_name ?? ""));
      list.forEach((r) => (r.reviewer_name = nameMap.get(r.user_id) || "Verified Customer"));
    }
    setReviews(list);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // Determine if current user can review
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id ?? null;
      setUserId(uid);
      if (!uid) return;

      // Already reviewed?
      const { data: existing } = await supabase
        .from("product_reviews")
        .select("id")
        .eq("product_id", productId)
        .eq("user_id", uid)
        .maybeSingle();
      if (existing) {
        setHasReviewed(true);
        return;
      }

      // Verified purchase check
      const { data: orders } = await supabase
        .from("orders")
        .select("id, payment_status, order_items!inner(product_id)")
        .eq("user_id", uid)
        .eq("payment_status", "paid")
        .eq("order_items.product_id", productId)
        .limit(1);
      setCanReview(!!orders && orders.length > 0);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const summary = (() => {
    if (!reviews.length) return { avg: 0, total: 0, dist: [0, 0, 0, 0, 0] };
    const total = reviews.length;
    const sum = reviews.reduce((s, r) => s + r.rating, 0);
    const dist = [0, 0, 0, 0, 0];
    reviews.forEach((r) => (dist[r.rating - 1] += 1));
    return { avg: sum / total, total, dist };
  })();

  const submit = async () => {
    const parsed = reviewSchema.safeParse({ rating, title: title || undefined, body: body || undefined });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Invalid review");
      return;
    }
    if (!userId) {
      toast.error("Please sign in to write a review");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("product_reviews").insert({
      product_id: productId,
      user_id: userId,
      rating,
      title: parsed.data.title ?? null,
      body: parsed.data.body ?? null,
      is_verified_purchase: true,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message || "Could not submit review");
      return;
    }
    toast.success("Thanks for your review!");
    setTitle("");
    setBody("");
    setRating(5);
    setHasReviewed(true);
    setCanReview(false);
    load();
  };

  return (
    <section className="container pb-16">
      <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
        <h2 className="font-display text-2xl">Customer Reviews</h2>

        <div className="mt-6 grid gap-6 md:grid-cols-[260px_1fr]">
          {/* Summary */}
          <div className="rounded-2xl bg-muted/40 p-5 text-center">
            <div className="font-display text-5xl">{summary.avg.toFixed(1)}</div>
            <div className="mt-2 flex justify-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-5 w-5 ${i < Math.round(summary.avg) ? "fill-secondary text-secondary" : "text-muted-foreground"}`} />
              ))}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Based on {summary.total} review{summary.total === 1 ? "" : "s"}</p>
            <div className="mt-4 space-y-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = summary.dist[star - 1];
                const pct = summary.total ? (count / summary.total) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-6 text-left">{star}★</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-background">
                      <div className="h-full bg-secondary" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-6 text-right text-muted-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Write review or sign-in prompt */}
          <div>
            {!userId ? (
              <div className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                Sign in to write a review for {productName}.
              </div>
            ) : hasReviewed ? (
              <div className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                You've already reviewed this product. Thank you!
              </div>
            ) : !canReview ? (
              <div className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                Only verified purchasers can post a review. Order this product to share your experience.
              </div>
            ) : (
              <div className="rounded-2xl border border-border p-5">
                <h3 className="font-semibold">Write a review</h3>
                <div className="mt-3 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star className={`h-7 w-7 transition ${(hoverRating || rating) >= star ? "fill-secondary text-secondary" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
                <div className="mt-4 space-y-3">
                  <div>
                    <Label htmlFor="rev-title">Title</Label>
                    <Input id="rev-title" maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Loved it!" />
                  </div>
                  <div>
                    <Label htmlFor="rev-body">Your review</Label>
                    <Textarea id="rev-body" maxLength={2000} rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="What did you like or dislike?" />
                  </div>
                  <Button onClick={submit} disabled={submitting} className="w-full sm:w-auto">
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit review
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* List */}
        <div className="mt-8 border-t border-border pt-6">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading reviews…</p>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review {productName}.</p>
          ) : (
            <ul className="space-y-5">
              {reviews.map((r) => (
                <li key={r.id} className="rounded-xl border border-border bg-background p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-secondary text-secondary" : "text-muted-foreground"}`} />
                      ))}
                    </div>
                    <span className="font-semibold">{r.reviewer_name || "Verified Customer"}</span>
                    {r.is_verified_purchase && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        <BadgeCheck className="h-3.5 w-3.5" /> Verified Purchase
                      </span>
                    )}
                    <span className="ml-auto text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  {r.title && <p className="mt-2 font-semibold">{r.title}</p>}
                  {r.body && <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{r.body}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductReviews;
