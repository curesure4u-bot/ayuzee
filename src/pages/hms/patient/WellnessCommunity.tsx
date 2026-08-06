import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Users, Heart, MessageSquare, Share2, Plus, Trophy, Flame } from "lucide-react";

const posts = [
  { id: 1, type: "Doctor Tip", author: "Dr. Mohamad Saleem", avatar: "🩺", time: "2h ago", content: "Tip: Add Triphala before bed for better Agni. Start with 1/2 tsp warm water. Ideal for Pitta-Kapha types.", likes: 45, comments: 12 },
  { id: 2, type: "Progress", author: "Rajesh K.", avatar: "🧑", time: "5h ago", content: "Day 14 of Panchakarma journey! Feeling 70% better. Pain reduced from 8/10 to 3/10. Lost 2kg too! 🎉", likes: 23, comments: 8 },
  { id: 3, type: "Challenge", author: "Ayuzee Team", avatar: "🏆", time: "1d ago", content: "🔥 30-Day Prakriti Balance Challenge: Follow your prescribed Pathya for 30 consecutive days. Join now!", likes: 89, comments: 34, participants: 156, daysLeft: 12 },
  { id: 4, type: "Success Story", author: "Lakshmi D.", avatar: "👩", time: "1d ago", content: "Reversed my HbA1c from 11.2% to 7.8% in 4 months with AYUSH diet + Nishamalaki + daily yoga! Never thought this was possible without increasing insulin. 🌿", likes: 112, comments: 28 },
  { id: 5, type: "Question", author: "Suresh B.", avatar: "🧑", time: "2d ago", content: "Can I eat curd at night? My doctor said Apathya but my family insists. Any alternatives for Pitta type?", likes: 8, comments: 15 },
];

const challenges = [
  { name: "30-Day Pathya Challenge", participants: 156, daysLeft: 12, icon: "🌿" },
  { name: "Yoga Streak Challenge", participants: 89, daysLeft: 22, icon: "🧘" },
  { name: "Hydration 10-Glass Challenge", participants: 203, daysLeft: 5, icon: "💧" },
];

const WellnessCommunity = () => {
  const getTypeColor = (t: string) => {
    switch (t) { case "Doctor Tip": return "bg-blue-100 text-blue-700"; case "Progress": return "bg-green-100 text-green-700"; case "Challenge": return "bg-orange-100 text-orange-700"; case "Success Story": return "bg-purple-100 text-purple-700"; case "Question": return "bg-amber-100 text-amber-700"; default: return "bg-gray-100"; }
  };
  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6" /> Wellness Community</h1>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Post</Button>
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{post.avatar}</span>
                  <div className="flex-1"><span className="font-medium text-sm">{post.author}</span><span className="text-xs text-muted-foreground ml-2">{post.time}</span></div>
                  <Badge className={`text-[9px] ${getTypeColor(post.type)}`}>{post.type}</Badge>
                </div>
                <p className="text-sm">{post.content}</p>
                {post.participants && <div className="mt-2 p-2 bg-orange-50 rounded border border-orange-200 flex items-center justify-between"><span className="text-xs"><Trophy className="h-3 w-3 inline mr-1" />{post.participants} joined · {post.daysLeft} days left</span><Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => toast.success("Joined challenge!")}>Join</Button></div>}
                <div className="flex items-center gap-4 mt-3 pt-2 border-t">
                  <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => toast.success("Liked!")}><Heart className="h-3 w-3" />{post.likes}</Button>
                  <Button variant="ghost" size="sm" className="text-xs gap-1"><MessageSquare className="h-3 w-3" />{post.comments}</Button>
                  <Button variant="ghost" size="sm" className="text-xs gap-1"><Share2 className="h-3 w-3" />Share</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-3">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Trophy className="h-4 w-4 text-orange-600" /> Active Challenges</CardTitle></CardHeader>
            <CardContent className="space-y-2">{challenges.map((c, i) => (
              <div key={i} className="flex items-center gap-2 p-2 border rounded text-xs">
                <span className="text-lg">{c.icon}</span>
                <div className="flex-1"><p className="font-medium">{c.name}</p><p className="text-muted-foreground">{c.participants} joined · {c.daysLeft}d left</p></div>
              </div>
            ))}</CardContent>
          </Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Flame className="h-4 w-4 text-red-500" /> Top Streaks</CardTitle></CardHeader>
            <CardContent className="space-y-1 text-xs">
              <div className="flex justify-between"><span>1. Priya S.</span><span className="font-bold">28 days 🔥</span></div>
              <div className="flex justify-between"><span>2. Rajesh K.</span><span className="font-bold">14 days 🔥</span></div>
              <div className="flex justify-between"><span>3. Lakshmi D.</span><span className="font-bold">12 days 🔥</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default WellnessCommunity;
