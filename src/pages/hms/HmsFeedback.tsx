import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Star, MessageCircle, TrendingUp, ThumbsUp, ThumbsDown,
  Send, AlertTriangle, CheckCircle, Users, BarChart3, Loader2,
} from "lucide-react";
import { useFeedback } from "@/hooks/useFeedback";

const HmsFeedback = () => {
  const { feedback, loading, error, avgRating, npsScore, promoters, detractors, googleReviews, complaints, updateStatus } = useFeedback();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Star className="h-6 w-6 text-amber-500" /> Patient Feedback & NPS
          </h1>
          <p className="text-sm text-muted-foreground">Post-visit feedback, Google reviews, NPS tracking, sentiment analysis & complaint resolution</p>
        </div>
        <Button size="sm" onClick={() => toast.success("Feedback request sent to today's patients via WhatsApp")}>
          <Send className="mr-1 h-4 w-4" /> Send Feedback Requests
        </Button>
      </div>

      {/* Stats */}
      {loading && (
        <div className="flex items-center justify-center py-2 text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Loading feedback...</span>
        </div>
      )}
      {error && !loading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-2 text-xs text-amber-700">⚠ Using demo data. {error}</CardContent>
        </Card>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="border-amber-200">
          <CardContent className="p-3 text-center">
            <div className="flex justify-center gap-0.5 mb-1">{[1,2,3,4,5].map(i => <Star key={i} className={`h-4 w-4 ${i <= Math.round(Number(avgRating)) ? "text-amber-500 fill-amber-500" : "text-gray-300"}`} />)}</div>
            <p className="text-xl font-bold">{avgRating}/5</p>
            <p className="text-xs text-muted-foreground">Avg Rating</p>
          </CardContent>
        </Card>
        <Card className={npsScore >= 50 ? "border-green-200" : "border-amber-200"}>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-green-600">+{npsScore}</p>
            <p className="text-xs text-muted-foreground">NPS Score</p>
          </CardContent>
        </Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{feedback.length}</p><p className="text-xs text-muted-foreground">Total Responses</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold text-blue-600">{googleReviews}</p><p className="text-xs text-muted-foreground">Google Reviews</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold text-red-600">{complaints}</p><p className="text-xs text-muted-foreground">Complaints</p></CardContent></Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
          <TabsTrigger value="all">All Feedback</TabsTrigger>
          <TabsTrigger value="nps">NPS Analysis</TabsTrigger>
          <TabsTrigger value="google">Google Reviews</TabsTrigger>
          <TabsTrigger value="complaints">Complaints</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card><CardContent className="p-0">
            <div className="space-y-0">
              {feedback.map((f) => (
                <div key={f.id} className="p-4 border-b hover:bg-muted/30 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{f.patient}</p>
                        <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} className={`h-3 w-3 ${i <= f.rating ? "text-amber-500 fill-amber-500" : "text-gray-200"}`} />)}</div>
                        <Badge variant={f.sentiment === "positive" ? "outline" : f.sentiment === "negative" ? "destructive" : "secondary"} className={`text-[9px] ${f.sentiment === "positive" ? "text-green-600" : ""}`}>
                          {f.sentiment === "positive" ? <ThumbsUp className="h-2 w-2 mr-0.5" /> : f.sentiment === "negative" ? <ThumbsDown className="h-2 w-2 mr-0.5" /> : null}
                          {f.sentiment}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{f.comment}</p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                        <span>{f.doctor}</span>
                        <span>{f.date}</span>
                        <Badge variant="outline" className="text-[9px]">{f.category}</Badge>
                        {f.googleReview && <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-[9px]">Google Review</Badge>}
                      </div>
                    </div>
                    <div className="text-right ml-3">
                      <Badge variant={f.status === "resolved" ? "outline" : f.status === "acknowledged" ? "default" : "secondary"} className={`text-[10px] capitalize ${f.status === "resolved" ? "text-green-600" : ""}`}>{f.status}</Badge>
                      <p className="text-[10px] text-muted-foreground mt-1">NPS: {f.npsScore}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="nps" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">NPS Breakdown</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                  <p className="text-4xl font-bold text-green-700">+{npsScore}</p>
                  <p className="text-sm text-green-600 mt-1">Net Promoter Score</p>
                </div>
                <div className="space-y-3">
                  <div><div className="flex justify-between text-sm mb-1"><span className="text-green-600 font-medium">Promoters (9-10)</span><span>{promoters} ({Math.round((promoters/feedback.length)*100)}%)</span></div><Progress value={(promoters/feedback.length)*100} className="h-2 [&>div]:bg-green-500" /></div>
                  <div><div className="flex justify-between text-sm mb-1"><span className="text-amber-600 font-medium">Passives (7-8)</span><span>{feedback.filter(f => f.npsScore >= 7 && f.npsScore <= 8).length} ({Math.round((feedback.filter(f => f.npsScore >= 7 && f.npsScore <= 8).length/feedback.length)*100)}%)</span></div><Progress value={(feedback.filter(f => f.npsScore >= 7 && f.npsScore <= 8).length/feedback.length)*100} className="h-2 [&>div]:bg-amber-500" /></div>
                  <div><div className="flex justify-between text-sm mb-1"><span className="text-red-600 font-medium">Detractors (0-6)</span><span>{detractors} ({Math.round((detractors/feedback.length)*100)}%)</span></div><Progress value={(detractors/feedback.length)*100} className="h-2 [&>div]:bg-red-500" /></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Category-wise Ratings</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { cat: "Treatment Quality", score: 4.8 },
                  { cat: "Doctor Communication", score: 4.7 },
                  { cat: "Panchakarma Experience", score: 4.6 },
                  { cat: "Staff Behavior", score: 4.5 },
                  { cat: "Facility Cleanliness", score: 4.4 },
                  { cat: "Pharmacy Service", score: 3.8 },
                  { cat: "Waiting Time", score: 3.5 },
                  { cat: "Food (IP)", score: 3.9 },
                ].map(c => (
                  <div key={c.cat} className="flex items-center justify-between">
                    <span className="text-sm">{c.cat}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2"><div className={`h-2 rounded-full ${c.score >= 4.5 ? "bg-green-500" : c.score >= 4 ? "bg-blue-500" : c.score >= 3.5 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${(c.score/5)*100}%` }} /></div>
                      <span className="text-sm font-medium w-8">{c.score}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="google" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Google Review Management</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-between">
                <div>
                  <p className="font-medium">Google Business Rating</p>
                  <div className="flex items-center gap-1 mt-1">{[1,2,3,4,5].map(i => <Star key={i} className="h-5 w-5 text-amber-500 fill-amber-500" />)}<span className="ml-1 font-bold">4.7</span><span className="text-muted-foreground text-sm">(342 reviews)</span></div>
                </div>
                <Button variant="outline" size="sm">View on Google</Button>
              </div>
              <p className="text-sm text-muted-foreground">Patients who gave 5-star feedback are prompted to leave a Google review. {googleReviews} patients left Google reviews this week.</p>
              <div className="flex items-center justify-between p-3 rounded border">
                <div><p className="text-sm font-medium">Auto-prompt 5-star patients for Google Review</p><p className="text-xs text-muted-foreground">Send Google review link via WhatsApp after 5-star feedback</p></div>
                <Badge className="bg-green-100 text-green-700 border-green-300">Active</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complaints" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-500" /> Complaint Resolution</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {feedback.filter(f => f.sentiment === "negative" || f.rating <= 3).map(f => (
                  <div key={f.id} className="p-3 rounded-lg border border-red-200 bg-red-50/30">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{f.patient} — {f.category}</p>
                      <Badge variant={f.status === "resolved" ? "outline" : "destructive"} className={`text-xs ${f.status === "resolved" ? "text-green-600" : ""}`}>
                        {f.status === "resolved" ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                        {f.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{f.comment}</p>
                    <div className="flex gap-2 mt-2">
                      {f.status !== "resolved" && <Button size="sm" variant="outline" className="text-xs h-6" onClick={() => updateStatus(f.id, "resolved")}>Mark Resolved</Button>}
                      <Button size="sm" variant="ghost" className="text-xs h-6">Call Patient</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsFeedback;
