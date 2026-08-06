import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { FileText, Search, CheckCircle2, XCircle, Eye, Clock, BookOpen, Star } from "lucide-react";

interface Article {
  id: string;
  author_id: string;
  title: string;
  summary: string | null;
  content: string;
  category: string;
  tags: string[];
  status: string;
  reading_time_minutes: number;
  is_featured: boolean;
  created_at: string;
}

const AdminArticleApproval = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("submitted");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reviewComments, setReviewComments] = useState("");

  useEffect(() => { loadArticles(); }, [filter]);

  const loadArticles = async () => {
    setLoading(true);
    let query = supabase.from("doctor_articles").select("*").order("created_at", { ascending: false });
    if (filter !== "all") query = query.eq("status", filter);
    const { data } = await query.limit(100);
    if (data) setArticles(data as Article[]);
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    const { error } = await supabase.from("doctor_articles").update({
      status: "published",
      published_at: new Date().toISOString(),
      reviewed_at: new Date().toISOString(),
      review_comments: reviewComments || null,
    }).eq("id", id);
    if (error) toast.error("Failed"); else { toast.success("Article published!"); setSelectedId(null); setReviewComments(""); loadArticles(); }
  };

  const handleReject = async (id: string) => {
    if (!reviewComments) { toast.error("Please provide review comments"); return; }
    const { error } = await supabase.from("doctor_articles").update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
      review_comments: reviewComments,
    }).eq("id", id);
    if (error) toast.error("Failed"); else { toast.success("Article rejected with feedback"); setSelectedId(null); setReviewComments(""); loadArticles(); }
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    const { error } = await supabase.from("doctor_articles").update({ is_featured: !current }).eq("id", id);
    if (error) toast.error("Failed"); else { toast.success(current ? "Unfeatured" : "Featured!"); loadArticles(); }
  };

  const filtered = articles.filter((a) =>
    !search || a.title.toLowerCase().includes(search.toLowerCase())
  );
  const selected = articles.find((a) => a.id === selectedId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Article Approval</h1>
        <p className="text-muted-foreground">Review and approve doctor-authored articles before publishing.</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search articles..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
      ) : filtered.length === 0 ? (
        <Card className="py-12 text-center"><p className="text-muted-foreground">No articles in this category.</p></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((article) => (
            <Card key={article.id} className="cursor-pointer hover:shadow-sm transition" onClick={() => setSelectedId(article.id)}>
              <CardContent className="flex items-center gap-4 p-4">
                <FileText className="h-8 w-8 text-primary/40 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm line-clamp-1">{article.title}</h3>
                    <Badge variant="outline" className="text-[10px]">{article.category}</Badge>
                    <Badge className={article.status === "submitted" ? "bg-blue-100 text-blue-700" : article.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                      {article.status}
                    </Badge>
                    {article.is_featured && <Badge className="bg-amber-100 text-amber-700 text-[10px]"><Star className="mr-0.5 h-2.5 w-2.5" />Featured</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {article.reading_time_minutes} min · {new Date(article.created_at).toLocaleDateString("en-IN")} · {article.tags.slice(0, 3).join(", ")}
                  </p>
                </div>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Article Detail Dialog */}
      <Dialog open={!!selectedId} onOpenChange={() => setSelectedId(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Article Review</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">{selected.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{selected.category}</Badge>
                  <span className="text-xs text-muted-foreground">{selected.reading_time_minutes} min read</span>
                </div>
              </div>
              {selected.summary && <p className="text-sm text-muted-foreground italic">{selected.summary}</p>}
              <div className="rounded-lg border p-4 max-h-[300px] overflow-y-auto">
                <p className="text-sm whitespace-pre-wrap">{selected.content}</p>
              </div>
              {selected.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selected.tags.map((t, i) => <Badge key={i} variant="outline" className="text-[10px]">{t}</Badge>)}
                </div>
              )}

              {selected.status === "submitted" && (
                <div className="space-y-3 border-t pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Review Comments</label>
                    <Textarea value={reviewComments} onChange={(e) => setReviewComments(e.target.value)} placeholder="Feedback for the author..." rows={3} />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleApprove(selected.id)} className="flex-1"><CheckCircle2 className="mr-1 h-4 w-4" /> Approve & Publish</Button>
                    <Button variant="destructive" onClick={() => handleReject(selected.id)} className="flex-1"><XCircle className="mr-1 h-4 w-4" /> Reject</Button>
                  </div>
                </div>
              )}

              {selected.status === "published" && (
                <div className="border-t pt-3">
                  <Button variant="outline" size="sm" onClick={() => toggleFeatured(selected.id, selected.is_featured)}>
                    <Star className="mr-1 h-4 w-4" /> {selected.is_featured ? "Remove Featured" : "Mark as Featured"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminArticleApproval;
