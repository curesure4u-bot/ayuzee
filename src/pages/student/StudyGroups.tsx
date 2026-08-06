import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Link2,
  Loader2,
  LogIn,
  LogOut,
  Megaphone,
  MessageSquare,
  Plus,
  Search,
  Trash2,
  User,
  Users,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useStudyGroupList, useStudyGroupDetail } from "@/hooks/useStudyGroups";

const SUBJECTS = [
  "All",
  "General",
  "Rachana Sharir",
  "Kriya Sharir",
  "Dravyaguna",
  "Rasa Shastra",
  "Kayachikitsa",
  "Shalya Tantra",
  "Shalakya Tantra",
  "Prasuti & Stree Roga",
  "Kaumarabhritya",
  "Panchakarma",
  "Swasthavritta",
  "Agadatantra",
  "Samhita & Siddhant",
  "Pharmacology",
  "Pathology",
  "Anatomy",
  "Physiology",
];

const postTypeIcon: Record<string, React.ReactNode> = {
  discussion: <MessageSquare className="h-3.5 w-3.5 text-blue-600" />,
  resource: <Link2 className="h-3.5 w-3.5 text-green-600" />,
  question: <HelpCircle className="h-3.5 w-3.5 text-amber-600" />,
  announcement: <Megaphone className="h-3.5 w-3.5 text-purple-600" />,
};

// ---------- Group List View ----------

function GroupListView() {
  const { groups, myGroupIds, loading, joinGroup, leaveGroup, createGroup } = useStudyGroupList();
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSubject, setNewSubject] = useState("General");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    let list = groups;
    if (subjectFilter !== "All") list = list.filter((g) => g.subject === subjectFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (g) => g.name.toLowerCase().includes(q) || g.subject.toLowerCase().includes(q) || (g.description || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [groups, search, subjectFilter]);

  const handleCreate = async () => {
    if (!newName.trim()) { toast.error("Group name is required"); return; }
    setCreating(true);
    const result = await createGroup(newName.trim(), newSubject, newDesc.trim());
    setCreating(false);
    if (result && "error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Study group created!");
      setDialogOpen(false);
      setNewName(""); setNewSubject("General"); setNewDesc("");
    }
  };

  if (loading) {
    return <div className="grid min-h-[40vh] place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Study Groups
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Join subject-wise groups to collaborate and learn together</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Create Group</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create a Study Group</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="text-sm font-medium" htmlFor="grp-name">Group Name *</label>
                <Input id="grp-name" placeholder="e.g. Dravyaguna Study Circle" value={newName} onChange={(e) => setNewName(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="grp-subject">Subject</label>
                <select id="grp-subject" className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={newSubject} onChange={(e) => setNewSubject(e.target.value)}>
                  {SUBJECTS.filter((s) => s !== "All").map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="grp-desc">Description</label>
                <Textarea id="grp-desc" placeholder="What's this group about?" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={3} />
              </div>
              <Button onClick={handleCreate} disabled={creating} className="w-full">
                {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Create Group
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search groups..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="border rounded-md px-3 py-2 text-sm bg-background" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} aria-label="Filter by subject">
          {SUBJECTS.map((s) => <option key={s} value={s}>{s === "All" ? "All Subjects" : s}</option>)}
        </select>
      </div>

      <Badge variant="outline">{filtered.length} group{filtered.length !== 1 ? "s" : ""}</Badge>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No groups found. Create one!</CardContent></Card>
        ) : filtered.map((group) => {
          const isMember = myGroupIds.includes(group.id);
          return (
            <Card key={group.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <Link to={`/student/study-groups/${group.id}`} className="font-semibold text-sm hover:text-primary transition-colors">
                      {group.name}
                    </Link>
                    {group.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{group.description}</p>}
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-[10px]">{group.subject}</Badge>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {group.member_count}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/student/study-groups/${group.id}`}><BookOpen className="h-4 w-4 mr-1" /> View</Link>
                    </Button>
                    {isMember ? (
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={async () => { const ok = await leaveGroup(group.id); if (ok) toast.success("Left group"); }}>
                        <LogOut className="h-4 w-4 mr-1" /> Leave
                      </Button>
                    ) : (
                      <Button size="sm" onClick={async () => { const ok = await joinGroup(group.id); if (ok) toast.success("Joined!"); else toast.error("Could not join"); }}>
                        <LogIn className="h-4 w-4 mr-1" /> Join
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Group Detail View ----------

function GroupDetailView() {
  const { groupId } = useParams<{ groupId: string }>();
  const { group, posts, loading, userId, createPost, deletePost } = useStudyGroupDetail(groupId);
  const [postContent, setPostContent] = useState("");
  const [postType, setPostType] = useState("discussion");
  const [resourceUrl, setResourceUrl] = useState("");
  const [posting, setPosting] = useState(false);

  const handlePost = async () => {
    if (!postContent.trim()) { toast.error("Content is required"); return; }
    setPosting(true);
    const result = await createPost(postContent.trim(), postType, resourceUrl.trim() || undefined);
    setPosting(false);
    if (result) { toast.success("Posted!"); setPostContent(""); setResourceUrl(""); }
    else toast.error("Failed to post");
  };

  if (loading) {
    return <div className="grid min-h-[40vh] place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (!group) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-muted-foreground">Group not found.</p>
        <Button variant="outline" asChild className="mt-4"><Link to="/student/study-groups">Back to Groups</Link></Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild><Link to="/student/study-groups" aria-label="Back"><ArrowLeft className="h-5 w-5" /></Link></Button>
        <div>
          <h1 className="text-xl font-bold">{group.name}</h1>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-[10px]">{group.subject}</Badge>
            <span><Users className="h-3 w-3 inline mr-0.5" />{group.member_count} members</span>
          </div>
        </div>
      </div>

      {group.description && <p className="text-sm text-muted-foreground">{group.description}</p>}

      {/* New Post */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <Textarea placeholder="Share something with the group..." value={postContent} onChange={(e) => setPostContent(e.target.value)} rows={3} />
          <div className="flex flex-wrap gap-2 items-center">
            <select className="border rounded-md px-2 py-1.5 text-sm bg-background" value={postType} onChange={(e) => setPostType(e.target.value)} aria-label="Post type">
              <option value="discussion">Discussion</option>
              <option value="resource">Resource/Link</option>
              <option value="question">Question</option>
              <option value="announcement">Announcement</option>
            </select>
            {postType === "resource" && (
              <Input placeholder="Resource URL (optional)" value={resourceUrl} onChange={(e) => setResourceUrl(e.target.value)} className="flex-1 min-w-[200px] text-sm" />
            )}
            <Button size="sm" onClick={handlePost} disabled={posting} className="ml-auto">
              {posting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null} Post
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      <div className="space-y-3">
        {posts.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No posts yet. Start the conversation!</CardContent></Card>
        ) : posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {postTypeIcon[post.post_type]}
                    <User className="h-3 w-3" />
                    <span className="font-medium text-foreground">{post.author_name || "Anonymous"}</span>
                    <Clock className="h-3 w-3" />
                    <span>{new Date(post.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                    <Badge variant="outline" className="text-[9px]">{post.post_type}</Badge>
                  </div>
                  <p className="text-sm mt-2 whitespace-pre-wrap">{post.content}</p>
                  {post.resource_url && (
                    <a href={post.resource_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-1 inline-flex items-center gap-1">
                      <Link2 className="h-3 w-3" /> {post.resource_url}
                    </a>
                  )}
                </div>
                {userId === post.user_id && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={async () => { const ok = await deletePost(post.id); if (ok) toast.success("Post deleted"); }}
                    aria-label="Delete post">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ---------- Router Wrapper ----------

const StudyGroups = () => {
  const { groupId } = useParams<{ groupId: string }>();

  if (groupId) {
    return <GroupDetailView />;
  }
  return <GroupListView />;
};

export default StudyGroups;
