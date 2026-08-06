import { useState, useEffect } from "react";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  PenLine,
  Eye,
  Heart,
  Bookmark,
  MessageSquare,
  Clock,
  Send,
  FileText,
  Plus,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

const CATEGORIES = [
  "Clinical Practice",
  "Research",
  "Case Report",
  "Review Article",
  "Opinion",
  "Education",
  "Wellness Tips",
  "Drug Review",
  "Treatment Protocol",
];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700" },
  submitted: { label: "Submitted", color: "bg-blue-100 text-blue-700" },
  under_review: { label: "Under Review", color: "bg-amber-100 text-amber-700" },
  published: { label: "Published", color: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700" },
  archived: { label: "Archived", color: "bg-gray-100 text-gray-500" },
};

interface Article {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  category: string;
  tags: string[];
  status: string;
  view_count: number;
  like_count: number;
  bookmark_count: number;
  comment_count: number;
  reading_time_minutes: number;
  published_at: string | null;
  review_comments: string | null;
  created_at: string;
  updated_at: string;
}

const DoctorArticles = () => {
  const { userId } = useDoctor();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tab, setTab] = useState("all");
  const [form, setForm] = useState({
    title: "",
    summary: "",
    content: "",
    category: "Clinical Practice",
    tags: "",
    system_of_medicine: "Ayurveda",
    references_list: "",
  });

  useEffect(() => {
    if (!userId) return;
    loadArticles();
  }, [userId]);

  const loadArticles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("doctor_articles")
      .select("*")
      .eq("author_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) setArticles(data as Article[]);
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ title: "", summary: "", content: "", category: "Clinical Practice", tags: "", system_of_medicine: "Ayurveda", references_list: "" });
    setEditingId(null);
  };

  const openEditor = (article?: Article) => {
    if (article) {
      setEditingId(article.id);
      setForm({
        title: article.title,
        summary: article.summary ?? "",
        content: article.content,
        category: article.category,
        tags: article.tags.join(", "),
        system_of_medicine: "Ayurveda",
        references_list: "",
      });
    } else {
      resetForm();
    }
    setShowEditor(true);
  };

  const handleSave = async (submitForReview = false) => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    setSaving(true);

    const wordCount = form.content.split(/\s+/).length;
    const readingTime = Math.max(1, Math.round(wordCount / 200));

    const payload = {
      author_id: userId,
      title: form.title.trim(),
      summary: form.summary.trim() || null,
      content: form.content,
      category: form.category,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      system_of_medicine: form.system_of_medicine,
      references_list: form.references_list ? JSON.parse(`[${form.references_list.split("\n").map((r) => `"${r.trim()}"`).join(",")}]`) : [],
      reading_time_minutes: readingTime,
      status: submitForReview ? "submitted" : "draft",
      slug: form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    };

    let result;
    if (editingId) {
      result = await supabase.from("doctor_articles").update(payload).eq("id", editingId);
    } else {
      result = await supabase.from("doctor_articles").insert(payload);
    }

    if (result.error) {
      toast.error("Failed to save: " + result.error.message);
    } else {
      toast.success(submitForReview ? "Article submitted for peer review!" : "Draft saved successfully");
      setShowEditor(false);
      resetForm();
      loadArticles();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("doctor_articles").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Draft deleted"); loadArticles(); }
  };

  const filteredArticles = articles.filter((a) => {
    if (tab === "all") return true;
    if (tab === "published") return a.status === "published";
    if (tab === "drafts") return a.status === "draft";
    if (tab === "review") return ["submitted", "under_review"].includes(a.status);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">My Articles</h1>
          <p className="text-muted-foreground">Write, publish, and share your clinical knowledge with the community.</p>
        </div>
        <Button onClick={() => openEditor()} className="gap-1">
          <Plus className="h-4 w-4" /> Write Article
        </Button>
      </div>

      {/* Stats Cards */}
      {articles.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-4">
          <Card className="text-center">
            <CardContent className="pt-5 pb-4">
              <p className="font-display text-2xl font-bold">{articles.filter((a) => a.status === "published").length}</p>
              <p className="text-xs text-muted-foreground">Published</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-5 pb-4">
              <p className="font-display text-2xl font-bold">{articles.reduce((s, a) => s + a.view_count, 0)}</p>
              <p className="text-xs text-muted-foreground">Total Views</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-5 pb-4">
              <p className="font-display text-2xl font-bold">{articles.reduce((s, a) => s + a.like_count, 0)}</p>
              <p className="text-xs text-muted-foreground">Total Likes</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-5 pb-4">
              <p className="font-display text-2xl font-bold">{articles.reduce((s, a) => s + a.comment_count, 0)}</p>
              <p className="text-xs text-muted-foreground">Comments</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All ({articles.length})</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="review">In Review</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Article List */}
      {filteredArticles.length === 0 ? (
        <Card className="py-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-muted-foreground">
            {tab === "all" ? "No articles yet. Start writing to share your expertise!" : `No ${tab} articles.`}
          </p>
          {tab === "all" && (
            <Button className="mt-4" onClick={() => openEditor()}>Write Your First Article</Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredArticles.map((article) => (
            <Card key={article.id} className="transition hover:shadow-sm">
              <CardContent className="flex items-start gap-4 p-5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={STATUS_LABELS[article.status]?.color ?? ""}>{STATUS_LABELS[article.status]?.label}</Badge>
                    <Badge variant="outline" className="text-[10px]">{article.category}</Badge>
                  </div>
                  <h3 className="font-semibold text-sm line-clamp-1">{article.title}</h3>
                  {article.summary && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{article.summary}</p>}
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.reading_time_minutes} min read</span>
                    {article.status === "published" && (
                      <>
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{article.view_count}</span>
                        <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{article.like_count}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{article.comment_count}</span>
                      </>
                    )}
                    <span>{new Date(article.created_at).toLocaleDateString("en-IN")}</span>
                  </div>
                  {article.status === "rejected" && article.review_comments && (
                    <p className="mt-2 text-xs text-red-600 border-l-2 border-red-200 pl-2">
                      Reviewer: {article.review_comments}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  {["draft", "rejected"].includes(article.status) && (
                    <Button size="sm" variant="ghost" onClick={() => openEditor(article)}>
                      <PenLine className="h-4 w-4" />
                    </Button>
                  )}
                  {article.status === "draft" && (
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(article.id)}>
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Article Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Article" : "Write New Article"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Effective Panchakarma Protocol for Chronic Low Back Pain"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tags (comma separated)</Label>
                <Input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="e.g., Panchakarma, Vata, Musculoskeletal"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Summary (short description)</Label>
              <Textarea
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                placeholder="Brief overview of the article (shown in previews)..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Content *</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Write your article content here. You can use markdown formatting..."
                rows={12}
                className="font-mono text-sm"
              />
              <p className="text-[10px] text-muted-foreground">
                {form.content.split(/\s+/).filter(Boolean).length} words · ~{Math.max(1, Math.round(form.content.split(/\s+/).filter(Boolean).length / 200))} min read
              </p>
            </div>

            <div className="space-y-2">
              <Label>References (one per line)</Label>
              <Textarea
                value={form.references_list}
                onChange={(e) => setForm({ ...form, references_list: e.target.value })}
                placeholder="Charaka Samhita, Sutra Sthana, Chapter 12&#10;Journal of Ayurveda, 2023, Vol 5..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowEditor(false)}>Cancel</Button>
              <Button variant="secondary" onClick={() => handleSave(false)} disabled={saving}>
                {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <FileText className="mr-1 h-4 w-4" />}
                Save Draft
              </Button>
              <Button onClick={() => handleSave(true)} disabled={saving}>
                {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Send className="mr-1 h-4 w-4" />}
                Submit for Review
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorArticles;
