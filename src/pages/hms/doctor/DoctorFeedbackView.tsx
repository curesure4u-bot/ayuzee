import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, TrendingUp, Brain } from "lucide-react";

const reviews = [
  { patient: "Priya S.", rating: 5, date: "20/07/2026", comment: "Excellent doctor. Explained Ayurvedic treatment clearly. Pain reduced significantly after Panchakarma." },
  { patient: "Rahul K.", rating: 4, date: "18/07/2026", comment: "Good consultation. Waiting time was a bit long but treatment is effective." },
  { patient: "Lakshmi N.", rating: 5, date: "15/07/2026", comment: "Very knowledgeable. The diet chart and yoga prescription were very helpful." },
  { patient: "Mohammed F.", rating: 5, date: "12/07/2026", comment: "Best Ayurveda doctor. Integrative approach with allopathy is amazing." },
  { patient: "Ananya S.", rating: 3, date: "10/07/2026", comment: "Treatment is good but needs more time explaining medicines to patient." },
];

const DoctorFeedbackView = () => {
  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  const fiveStars = reviews.filter(r => r.rating === 5).length;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Star className="h-6 w-6 text-amber-500" /> My Patient Feedback & Reviews</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-3xl font-bold text-amber-500">{avgRating}</p><p className="text-xs text-muted-foreground">Average Rating</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{reviews.length}</p><p className="text-xs text-muted-foreground">Total Reviews</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold text-green-600">{fiveStars}</p><p className="text-xs text-muted-foreground">5-Star Reviews</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><TrendingUp className="h-5 w-5 mx-auto text-green-600" /><p className="text-sm font-bold mt-1">+0.3</p><p className="text-xs text-muted-foreground">vs Last Month</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Recent Patient Reviews</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {reviews.map((r, i) => (
            <div key={i} className="p-3 rounded-lg border hover:bg-muted/30">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{r.patient}</span>
                <div className="flex items-center gap-1">{Array.from({length: r.rating}).map((_, j) => <Star key={j} className="h-3 w-3 fill-amber-400 text-amber-400" />)}<span className="text-xs text-muted-foreground ml-1">{r.date}</span></div>
              </div>
              <p className="text-sm text-muted-foreground">{r.comment}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3"><Brain className="h-5 w-5 text-purple-600 mt-0.5" /><div><p className="font-semibold text-purple-800">AI Feedback Analysis</p><p className="text-sm text-purple-700">Strengths: Treatment effectiveness (mentioned 4/5 reviews), Integrative approach praised. Improvement area: Reduce waiting time, spend more time explaining medicines. Suggestion: Use Patient Education handout feature to save explanation time.</p></div></CardContent>
      </Card>
    </div>
  );
};

export default DoctorFeedbackView;
