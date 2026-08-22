import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Megaphone, Plus, Pin, Calendar } from "lucide-react";

const MOCK_ANNOUNCEMENTS = [
  { id: "a1", title: "Independence Day Celebration", content: "All staff are invited to the flag hoisting ceremony at 8:30 AM on August 15th at Main Hospital. Refreshments will be served.", category: "event", priority: "high", publishDate: "2026-08-13", isPinned: true, author: "HR Department" },
  { id: "a2", title: "New Leave Policy Update", content: "Effective September 1st, earned leave carry-forward limit increased to 15 days. Please refer to the updated policy document.", category: "policy", priority: "normal", publishDate: "2026-08-20", isPinned: true, author: "HR Admin" },
  { id: "a3", title: "Fire Safety Drill — September 15", content: "Mandatory fire safety drill scheduled for all staff. Please ensure your attendance. Training certificate will be issued.", category: "general", priority: "normal", publishDate: "2026-08-21", isPinned: false, author: "Admin Manager" },
  { id: "a4", title: "Employee of the Month — August", content: "Congratulations to Suresh Therapist for being selected as Employee of the Month for August 2026! Outstanding patient feedback and procedure completion rate.", category: "achievement", priority: "normal", publishDate: "2026-08-20", isPinned: false, author: "Management" },
  { id: "a5", title: "Salary Credit Date", content: "August 2026 salary will be credited on September 1st. Payslips will be available on the HRMS portal.", category: "general", priority: "low", publishDate: "2026-08-25", isPinned: false, author: "Accounts" },
];

const categoryColors: Record<string, string> = {
  general: "bg-gray-100 text-gray-700", policy: "bg-purple-100 text-purple-700",
  event: "bg-blue-100 text-blue-700", holiday: "bg-green-100 text-green-700",
  urgent: "bg-red-100 text-red-700", achievement: "bg-amber-100 text-amber-700",
  birthday: "bg-pink-100 text-pink-700", anniversary: "bg-indigo-100 text-indigo-700",
};

const HrmsAnnouncements = () => {
  const [announcements] = useState(MOCK_ANNOUNCEMENTS);
  const pinned = announcements.filter((a) => a.isPinned);
  const others = announcements.filter((a) => !a.isPinned);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Megaphone className="h-6 w-6 text-amber-600" /> Announcements</h1>
          <p className="text-sm text-muted-foreground">Company-wide announcements & notices</p>
        </div>
        <Button size="sm"><Plus className="h-3.5 w-3.5 mr-1" /> New Announcement</Button>
      </div>

      {/* Pinned */}
      {pinned.length > 0 && (
        <div className="space-y-3">
          {pinned.map((ann) => (
            <Card key={ann.id} className="border-l-4 border-l-amber-400">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Pin className="h-3.5 w-3.5 text-amber-500" />
                      <p className="font-semibold text-sm">{ann.title}</p>
                      <Badge className={`text-[8px] border-0 capitalize ${categoryColors[ann.category]}`}>{ann.category}</Badge>
                      {ann.priority === "high" && <Badge className="text-[8px] bg-red-100 text-red-700 border-0">Important</Badge>}
                    </div>
                    <p className="text-xs mt-2 text-foreground/80">{ann.content}</p>
                    <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-2">
                      <Calendar className="h-3 w-3" /> {new Date(ann.publishDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      &middot; {ann.author}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Rest */}
      <div className="space-y-2">
        {others.map((ann) => (
          <Card key={ann.id}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-sm flex-1">{ann.title}</p>
                <Badge className={`text-[8px] border-0 capitalize ${categoryColors[ann.category]}`}>{ann.category}</Badge>
              </div>
              <p className="text-xs text-foreground/70">{ann.content}</p>
              <p className="text-[10px] text-muted-foreground mt-1.5">
                {new Date(ann.publishDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} &middot; {ann.author}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HrmsAnnouncements;
