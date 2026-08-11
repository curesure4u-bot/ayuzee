import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Megaphone, Link2, Share2, Eye, Plus, QrCode } from "lucide-react";

interface TherapistContext {
  therapist: { id: string; user_id: string; full_name: string; verification_status: string; is_available: boolean };
  reload: () => Promise<void>;
}

interface ContentPost {
  id: string;
  therapist_id: string;
  post_type: string;
  title: string;
  body: string;
  image_url: string;
  therapy_type: string;
  is_published: boolean;
  share_count: number;
  created_at: string;
}

interface ReferralLink {
  id: string;
  therapist_id: string;
  referral_code: string;
  clicks: number;
  bookings_from_referral: number;
}

const POST_TYPES = ["explainer", "education_card", "testimonial", "tip"];

export default function TherapistBranding() {
  const { therapist } = useOutletContext<TherapistContext>();
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [referralLink, setReferralLink] = useState<ReferralLink | null>(null);
  const [loading, setLoading] = useState(true);

  // New post form
  const [showForm, setShowForm] = useState(false);
  const [postType, setPostType] = useState("explainer");
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [postTherapyType, setPostTherapyType] = useState("");
  const [postImageUrl, setPostImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [therapist.id]);

  const fetchData = async () => {
    setLoading(true);
    const [postsRes, referralRes] = await Promise.all([
      (supabase as any)
        .from("therapist_content_posts")
        .select("*")
        .eq("therapist_id", therapist.id)
        .order("created_at", { ascending: false }),
      (supabase as any)
        .from("therapist_referral_links")
        .select("*")
        .eq("therapist_id", therapist.id)
        .maybeSingle(),
    ]);

    if (postsRes.data) setPosts(postsRes.data);
    if (referralRes.data) setReferralLink(referralRes.data);
    setLoading(false);
  };

  const createPost = async () => {
    if (!postTitle || !postBody) {
      toast.error("Title and body are required");
      return;
    }
    setSubmitting(true);
    const { error } = await (supabase as any).from("therapist_content_posts").insert({
      therapist_id: therapist.id,
      post_type: postType,
      title: postTitle,
      body: postBody,
      therapy_type: postTherapyType || null,
      image_url: postImageUrl || null,
      is_published: true,
      share_count: 0,
    });

    if (error) {
      toast.error("Failed to create post");
    } else {
      toast.success("Post created");
      setShowForm(false);
      setPostTitle("");
      setPostBody("");
      setPostTherapyType("");
      setPostImageUrl("");
      fetchData();
    }
    setSubmitting(false);
  };

  const generateReferralCode = async () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    const { data, error } = await (supabase as any).from("therapist_referral_links").insert({
      therapist_id: therapist.id,
      referral_code: code,
      clicks: 0,
      bookings_from_referral: 0,
    }).select().single();

    if (error) {
      toast.error("Failed to generate referral code");
    } else {
      toast.success("Referral code generated");
      setReferralLink(data);
    }
  };

  const getReferralUrl = () => {
    if (!referralLink) return "";
    return `${window.location.origin}/book?ref=${referralLink.referral_code}`;
  };

  if (loading) {
    return <div className="p-6 text-center">Loading branding...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Megaphone className="w-6 h-6" />Content & Branding
        </h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />{showForm ? "Cancel" : "Create Post"}
        </Button>
      </div>

      {/* Create Post Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Post Type</Label>
                <Select value={postType} onValueChange={setPostType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {POST_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Therapy Type (optional)</Label>
                <Input value={postTherapyType} onChange={(e) => setPostTherapyType(e.target.value)} placeholder="e.g. Abhyanga, Shirodhara" />
              </div>
            </div>
            <div>
              <Label>Title</Label>
              <Input value={postTitle} onChange={(e) => setPostTitle(e.target.value)} placeholder="Post title" />
            </div>
            <div>
              <Label>Body</Label>
              <Textarea value={postBody} onChange={(e) => setPostBody(e.target.value)} placeholder="Write your content..." rows={5} />
            </div>
            <div>
              <Label>Image URL (optional)</Label>
              <Input value={postImageUrl} onChange={(e) => setPostImageUrl(e.target.value)} placeholder="https://..." />
            </div>
            <Button onClick={createPost} disabled={submitting}>
              {submitting ? "Publishing..." : "Publish Post"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Referral Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Link2 className="w-5 h-5" />Referral Program</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {referralLink ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-2xl font-bold">{referralLink.referral_code}</p>
                  <p className="text-sm text-muted-foreground">Referral Code</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{referralLink.clicks}</p>
                  <p className="text-sm text-muted-foreground">Link Clicks</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{referralLink.bookings_from_referral}</p>
                  <p className="text-sm text-muted-foreground">Bookings from Referral</p>
                </div>
              </div>

              {/* QR Code Display */}
              <div className="flex flex-col items-center p-4 border rounded-lg bg-muted/50">
                <QrCode className="w-8 h-8 mb-2 text-muted-foreground" />
                <div className="p-4 border-2 border-dashed rounded-lg bg-white text-center">
                  <p className="text-xs font-mono break-all">{getReferralUrl()}</p>
                  <p className="text-xs text-muted-foreground mt-2">Share this URL with patients</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    navigator.clipboard.writeText(getReferralUrl());
                    toast.success("Referral URL copied to clipboard");
                  }}
                >
                  <Share2 className="w-3 h-3 mr-1" />Copy URL
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-3">No referral code yet. Generate one to start earning referral bookings.</p>
              <Button onClick={generateReferralCode}>Generate Referral Code</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Published Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Eye className="w-5 h-5" />Your Posts ({posts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No posts yet. Create your first content post above.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {posts.map((post) => (
                <Card key={post.id} className="overflow-hidden">
                  {post.image_url && (
                    <div className="w-full h-32 bg-muted">
                      <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{post.post_type.replace("_", " ")}</Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Share2 className="w-3 h-3" />{post.share_count} shares
                      </div>
                    </div>
                    <h3 className="font-medium text-sm">{post.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-3">{post.body}</p>
                    <div className="flex items-center justify-between">
                      {post.therapy_type && <Badge variant="secondary" className="text-xs">{post.therapy_type}</Badge>}
                      <span className="text-xs text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
