import {  useEffect, useState  } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Heart,
  MessageCircle,
  Loader2,
  Plus,
  Stethoscope,
  Globe,
  HelpCircle,
  Image as ImageIcon,
  Eye,
  Users,
  UserRound,
  Search,
  ArrowUpDown,
  SlidersHorizontal,
  Flame,
  CalendarCheck,
  UserCheck,
  Share2,
  Bookmark,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface Post {
  id: string;
  author_user_id: string;
  author_name: string;
  author_avatar_url: string | null;
  title: string | null;
  body: string;
  image_url: string | null;
  tags: string[];
  like_count: number;
  comment_count: number;
  created_at: string;
  visibility: string;
  post_type: string;
}

type TabKey = "doctor_post" | "public_post" | "patient_question";

const TABS: { key: TabKey; label: string; icon: React.ElementType; helper: string }[] = [
  { key: "doctor_post", label: "Doctor Posts", icon: Stethoscope, helper: "Clinical pearls & case notes from approved Ayurveda doctors." },
  { key: "public_post", label: "Public Posts", icon: Globe, helper: "Wellness wisdom shared with the wider community." },
  { key: "patient_question", label: "Patient Questions", icon: HelpCircle, helper: "Ask doctors anything — they'll respond in the comments." },
];

const VISIBILITY_OPTIONS = [
  { value: "doctor", label: "Visible for Doctors", desc: "Only Ayurveda doctors can view", icon: Stethoscope },
  { value: "public", label: "Visible for Public", desc: "Everyone can view this post", icon: Eye },
  { value: "patient", label: "Visible for Patients", desc: "All patients can view", icon: UserRound },
];

const TRENDING_TAGS = [
  "Clinical Discussion",
  "Charak Samhita",
  "Ayurveda Medicine",
  "Kayachikitsa",
  "Announcement",
  "Ayurveda News",
  "Panchakarma",
  "General Query",
  "Ayurveda Success Story",
];

const Feed = () => {
  usePageSEO({ title: "Feed — Ayuzee" });
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isDoctor, setIsDoctor] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState<{ name: string; avatar: string | null } | null>(null);
  const [profileName, setProfileName] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TabKey>("doctor_post");
  const [likedSet, setLikedSet] = useState<Set<string>>(new Set());

  // Create post dialog state
  const [open, setOpen] = useState(false);
  const [postType, setPostType] = useState<TabKey>("doctor_post");
  const [visibility, setVisibility] = useState("doctor");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);

  useEffect(() => { load();
  }, []);

  const load = async () => {
    setLoading(true);
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id ?? null;
    setUserId(uid);

    const { data: postsData } = await supabase
      .from("feed_posts")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(100);
    setPosts((postsData as Post[]) ?? []);

    if (uid) {
      const { data: doc } = await supabase
        .from("doctors")
        .select("full_name, avatar_url, is_approved")
        .eq("user_id", uid)
        .maybeSingle();
      if (doc?.is_approved) {
        setIsDoctor(true);
        setDoctorInfo({ name: doc.full_name, avatar: doc.avatar_url });
        setPostType("doctor_post");
        setVisibility("doctor");
      } else {
        setPostType("patient_question");
        setVisibility("public");
      }
      const { data: prof } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", uid)
        .maybeSingle();
      setProfileName(prof?.full_name ?? sess.session?.user.email?.split("@")[0] ?? "Patient");

      const { data: likes } = await supabase.from("feed_likes").select("post_id").eq("user_id", uid);
      setLikedSet(new Set((likes ?? []).map((l: any) => l.post_id)));
    }
    setLoading(false);
  };

  const openComposer = () => {
    if (!userId) {
      toast.info("Please sign in to create a post");
      navigate("/auth");
      return;
    }
    setOpen(true);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length >= 5 ? prev : [...prev, tag]
    );
  };

  const submitPost = async () => {
    if (!userId) return;
    if (!body.trim()) {
      toast.error("Write something to share");
      return;
    }
    // Guardrails: only approved doctors may post doctor_post / public_post
    if ((postType === "doctor_post" || postType === "public_post") && !isDoctor) {
      toast.error("Only approved doctors can create this post type");
      return;
    }
    setPosting(true);
    const authorName = isDoctor ? doctorInfo?.name ?? "Doctor" : profileName || "Patient";
    const authorAvatar = isDoctor ? doctorInfo?.avatar ?? null : null;

    const { error } = await supabase.from("feed_posts").insert({
      author_user_id: userId,
      author_name: authorName,
      author_avatar_url: authorAvatar,
      title: title.trim() || null,
      body: body.trim().slice(0, 4000),
      image_url: imageUrl.trim() || null,
      tags: selectedTags,
      post_type: postType,
      visibility,
    });
    setPosting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Posted to feed");
    setTitle(""); setBody(""); setImageUrl(""); setSelectedTags([]); setOpen(false);
    setActiveTab(postType);
    load();
  };

  const toggleLike = async (postId: string) => {
    if (!userId) {
      toast.info("Sign in to like posts");
      navigate("/auth");
      return;
    }
    const liked = likedSet.has(postId);
    const next = new Set(likedSet);
    if (liked) {
      next.delete(postId);
      setLikedSet(next);
      setPosts((p) => p.map((x) => x.id === postId ? { ...x, like_count: Math.max(0, x.like_count - 1) } : x));
      await supabase.from("feed_likes").delete().eq("post_id", postId).eq("user_id", userId);
    } else {
      next.add(postId);
      setLikedSet(next);
      setPosts((p) => p.map((x) => x.id === postId ? { ...x, like_count: x.like_count + 1 } : x));
      await supabase.from("feed_likes").insert({ post_id: postId, user_id: userId });
    }
  };

  const filteredPosts = posts.filter((p) => p.post_type === activeTab);

  const availablePostTypes: TabKey[] = isDoctor
    ? ["doctor_post", "public_post"]
    : ["patient_question"];

  const [search, setSearch] = useState("");
  const visiblePosts = posts
    .filter((p) => p.post_type === activeTab)
    .filter((p) =>
      search.trim()
        ? (p.title ?? "").toLowerCase().includes(search.toLowerCase()) ||
          p.body.toLowerCase().includes(search.toLowerCase()) ||
          p.author_name.toLowerCase().includes(search.toLowerCase())
        : true
    );

  return (
    <div className="min-h-screen bg-muted/30">
      <SiteNav />
      <main>
        <section className="container py-6">
          {/* Breadcrumb */}
          <nav className="mb-5 flex items-center gap-1.5 text-sm">
            <Link to="/" className="text-primary hover:underline">Home</Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-semibold text-foreground">Feed</span>
          </nav>

          {/* Search + sort + filter + ask */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="relative min-w-[260px] flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="h-12 rounded-full border-border bg-card pl-11 text-base shadow-soft"
              />
            </div>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-border bg-card" aria-label="Sort">
              <ArrowUpDown className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-border bg-card" aria-label="Filter">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            <Button onClick={openComposer} size="lg" className="h-12 gap-2 rounded-full bg-[hsl(202_88%_53%)] px-6 text-white hover:bg-[hsl(202_88%_46%)]">
              <HelpCircle className="h-4 w-4" /> Ask a Question
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[280px_1fr_300px]">
            {/* LEFT — trending tags */}
            <aside className="space-y-4">
              <Card className="overflow-hidden border-border p-0 shadow-soft">
                <div className="flex items-center gap-3 border-b border-border bg-accent/40 px-4 py-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-[hsl(14_90%_55%)] text-white">
                    <Flame className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-display text-base leading-tight">Trending Tags</h3>
                    <p className="text-xs text-muted-foreground">Popular topics this week</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 p-4">
                  {TRENDING_TAGS.slice(0, 3).map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 rounded-full border border-[hsl(14_90%_55%)]/40 bg-[hsl(14_90%_55%)]/5 px-3 py-1 text-xs font-medium text-[hsl(14_70%_40%)]">
                      <Flame className="h-3 w-3" /> {t}
                    </span>
                  ))}
                  {TRENDING_TAGS.slice(3).map((t) => (
                    <span key={t} className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
                      {t}
                    </span>
                  ))}
                </div>
              </Card>

              {!isDoctor && userId && (
                <Card className="border-border p-4 text-xs text-muted-foreground">
                  You can post <strong className="text-foreground">Patient Questions</strong>. To share clinical posts, <Link to="/partner/apply" className="font-semibold text-primary hover:underline">apply as a doctor partner</Link>.
                </Card>
              )}
            </aside>

            {/* MIDDLE — feed column */}
            <div className="space-y-5">
              {/* Welcome banner */}
              <Card className="overflow-hidden border-0 bg-[hsl(202_88%_53%)] p-6 text-primary-foreground shadow-elegant">
                <h2 className="font-display text-2xl text-white">Welcome to the Ayurveda Community!</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/90">
                  Connect with experienced Ayurvedic doctors, get answers to your health questions, and discover natural healing remedies and expert medicine advice.
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-white">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-white/15">
                      <UserCheck className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">Verified Ayurveda Doctors</p>
                      <p className="text-xs text-white/80">All doctors are verified practitioners with years of experience</p>
                    </div>
                  </div>
                  <Button asChild className="gap-2 rounded-full bg-white text-[hsl(202_88%_46%)] hover:bg-white/90">
                    <Link to="/doctors"><CalendarCheck className="h-4 w-4" /> Book Appointment</Link>
                  </Button>
                </div>

                {/* Tab pills */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {TABS.map((t) => {
                    const active = activeTab === t.key;
                    return (
                      <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-smooth ${
                          active
                            ? "bg-white text-[hsl(202_88%_46%)] shadow-soft"
                            : "bg-white/15 text-white hover:bg-white/25"
                        }`}
                      >
                        <t.icon className="h-4 w-4" /> {t.label}
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* Posts */}
              {loading ? (
                <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : visiblePosts.length === 0 ? (
                <Card className="p-12 text-center text-muted-foreground">
                  No posts yet in this section. Be the first to share!
                </Card>
              ) : (
                visiblePosts.map((post) => {
                  const isDoctorPost = post.post_type === "doctor_post";
                  return (
                    <Card key={post.id} className="overflow-hidden border-border shadow-soft">
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="grid h-12 w-12 place-items-center rounded-full gradient-leaf font-display text-sm text-primary-foreground">
                              {post.author_name.split(" ").slice(-2).map((p) => p[0]).join("")}
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold">{post.author_name}</p>
                                {isDoctorPost && <span className="text-[hsl(38_95%_55%)]">★</span>}
                                <span className="rounded-full bg-[hsl(202_88%_95%)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[hsl(202_88%_46%)]">New</span>
                              </div>
                              {isDoctorPost && (
                                <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-primary">
                                  <Stethoscope className="h-3 w-3" /> Gynaecology <span className="text-muted-foreground">+4 more</span>
                                </p>
                              )}
                              <p className="mt-1 inline-flex items-center gap-2 text-xs text-muted-foreground">
                                {new Date(post.created_at).toLocaleDateString()}
                                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase">
                                  <Eye className="h-3 w-3" /> {post.visibility}
                                </span>
                              </p>
                            </div>
                          </div>
                          {isDoctorPost && (
                            <Button asChild size="sm" className="hidden gap-1.5 rounded-full bg-[hsl(202_88%_53%)] text-white hover:bg-[hsl(202_88%_46%)] sm:inline-flex">
                              <Link to="/doctors"><CalendarCheck className="h-3.5 w-3.5" /> Book Appointment</Link>
                            </Button>
                          )}
                        </div>

                        {post.title && (
                          <h3 className="mt-4 font-display text-xl">
                            {post.title} <span className="text-xs font-normal text-muted-foreground">(edited)</span>
                          </h3>
                        )}
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{post.body}</p>
                        {post.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {post.tags.map((tag) => (
                              <span key={tag} className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-primary">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <Link to={`/feed/${post.id}`} className="mt-2 inline-block text-sm font-semibold text-[hsl(202_88%_46%)] hover:underline">View</Link>
                        <p className="mt-2 text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">{post.like_count} {post.like_count === 1 ? "Like" : "Likes"}</span> • {Math.max(post.like_count * 12, 48)} Views
                        </p>
                      </div>

                      {post.image_url && (
                        <img src={post.image_url} alt="" className="max-h-[480px] w-full object-cover" loading="lazy" />
                      )}

                      <div className="grid grid-cols-4 border-t border-border text-sm">
                        <button
                          onClick={() => toggleLike(post.id)}
                          className={`flex items-center justify-center gap-2 py-3 transition-smooth hover:bg-muted/50 ${
                            likedSet.has(post.id) ? "text-secondary" : "text-muted-foreground"
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${likedSet.has(post.id) ? "fill-secondary" : ""}`} /> Like
                        </button>
                        <Link to={`/feed/${post.id}`} className="flex items-center justify-center gap-2 py-3 text-muted-foreground transition-smooth hover:bg-muted/50 hover:text-primary">
                          <MessageCircle className="h-4 w-4" /> Comment
                        </Link>
                        <button className="flex items-center justify-center gap-2 py-3 text-muted-foreground transition-smooth hover:bg-muted/50 hover:text-primary">
                          <Share2 className="h-4 w-4" /> Share
                        </button>
                        <button className="flex items-center justify-center gap-2 py-3 text-muted-foreground transition-smooth hover:bg-muted/50 hover:text-primary">
                          <Bookmark className="h-4 w-4" /> Save
                        </button>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>

            {/* RIGHT — promo column */}
            <aside className="hidden space-y-4 lg:block">
              <Card className="border-[hsl(38_95%_60%)]/30 bg-[hsl(38_95%_96%)] p-5 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-wider text-secondary">Medicines</p>
                <h3 className="mt-1 font-display text-lg leading-tight">1Veda Isabgol Husk</h3>
                <p className="mt-1 text-xs text-muted-foreground">Classical • Pure</p>
                <p className="mt-3 font-display text-2xl text-foreground">₹165</p>
                <p className="text-xs font-semibold text-primary">5% OFF</p>
                <Button asChild size="sm" className="mt-4 w-full rounded-full">
                  <Link to="/shop">Buy Medicine</Link>
                </Button>
              </Card>
              <Card className="border-[hsl(38_95%_60%)]/30 bg-[hsl(38_95%_96%)] p-5 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-wider text-secondary">Medicines</p>
                <h3 className="mt-1 font-display text-lg leading-tight">Chandanasava Tonic</h3>
                <p className="mt-3 font-display text-2xl text-foreground">₹185</p>
                <p className="text-xs font-semibold text-primary">5% OFF</p>
                <Button asChild size="sm" className="mt-4 w-full rounded-full">
                  <Link to="/shop">Buy Medicine</Link>
                </Button>
              </Card>
            </aside>
          </div>
        </section>
      </main>
      <Footer />

      {/* Create Post Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Create Post</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Post type selector */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Post type</label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {TABS.filter((t) => availablePostTypes.includes(t.key)).map((t) => (
                  <button
                    key={t.key}
                    onClick={() => {
                      setPostType(t.key);
                      if (t.key === "doctor_post") setVisibility("doctor");
                      else if (t.key === "public_post") setVisibility("public");
                      else setVisibility("public");
                    }}
                    className={`flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-smooth ${
                      postType === t.key
                        ? "border-primary bg-accent text-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    <t.icon className="h-4 w-4" />
                    <span className="font-medium">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <Input
                placeholder="Add Post Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={160}
                className="text-base"
              />
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>Share your journey / Clinical case / Medicine / Success story</span>
                <span>({title.length}/160)</span>
              </div>
            </div>

            {/* Body */}
            <div>
              <Textarea
                placeholder="Write your post content here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                maxLength={4000}
              />
              <div className="mt-1 flex justify-end text-xs text-muted-foreground">({body.length}/4000)</div>
            </div>

            {/* Trending categories */}
            <div>
              <label className="mb-2 block text-sm font-semibold">Select from trending categories</label>
              <div className="flex flex-wrap gap-2">
                {TRENDING_TAGS.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-smooth ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-muted text-muted-foreground hover:border-primary"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
              {selectedTags.length >= 5 && (
                <p className="mt-1 text-xs text-muted-foreground">Up to 5 categories.</p>
              )}
            </div>

            {/* Visibility */}
            <div>
              <label className="mb-2 block text-sm font-semibold">Post Visibility</label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger className="h-auto py-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VISIBILITY_OPTIONS.map((v) => (
                    <SelectItem key={v.value} value={v.value}>
                      <div className="flex items-start gap-2 py-1">
                        <v.icon className="mt-0.5 h-4 w-4 text-primary" />
                        <div>
                          <p className="font-semibold">{v.label}</p>
                          <p className="text-xs text-muted-foreground">{v.desc}</p>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Image URL */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                <ImageIcon className="mr-1 inline h-4 w-4" /> Add Image (optional)
              </label>
              <Input
                placeholder="Paste image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              {imageUrl && (
                <img src={imageUrl} alt="preview" className="mt-2 max-h-48 rounded-lg border border-border object-cover" />
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="hero" onClick={submitPost} disabled={posting || !body.trim()}>
              {posting && <Loader2 className="h-4 w-4 animate-spin" />}
              Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Feed;
