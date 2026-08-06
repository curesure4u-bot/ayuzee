import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Award, Calendar, Clock, ExternalLink, Download } from "lucide-react";
import { toast } from "sonner";

const cmeStatus = {
  required: 30,
  completed: 22,
  remaining: 8,
  renewalDate: "2025-03-31",
};

const categoryBreakdown = [
  { category: "Ayurveda Clinical", hours: 10, color: "bg-green-500" },
  { category: "Surgery / Para-Surgical", hours: 5, color: "bg-blue-500" },
  { category: "Research Methodology", hours: 4, color: "bg-purple-500" },
  { category: "General Medical", hours: 3, color: "bg-amber-500" },
];

const completedEvents = [
  { id: 1, title: "Advances in Panchakarma - National Conference", date: "2024-01-05", hours: 6, type: "Conference", certificate: true },
  { id: 2, title: "AYUSH Drug Interactions Webinar", date: "2023-12-15", hours: 2, type: "Webinar", certificate: true },
  { id: 3, title: "Ksharasutra Hands-on Workshop", date: "2023-11-20", hours: 4, type: "Workshop", certificate: true },
  { id: 4, title: "Evidence-Based Ayurveda Research Methods", date: "2023-10-10", hours: 3, type: "Online Course", certificate: true },
  { id: 5, title: "Integrative Medicine for Spine Disorders", date: "2023-09-05", hours: 4, type: "Conference", certificate: true },
  { id: 6, title: "Digital Health & Telemedicine in AYUSH", date: "2023-08-18", hours: 3, type: "Webinar", certificate: true },
];

const upcomingEvents = [
  { id: 1, title: "National AYUSH CME - Chennai Chapter", date: "2024-02-15", hours: 6, type: "Conference", registrationOpen: true },
  { id: 2, title: "Agnikarma Advanced Techniques Workshop", date: "2024-02-28", hours: 4, type: "Workshop", registrationOpen: true },
  { id: 3, title: "AI in Ayurveda Practice - CCIM Webinar", date: "2024-03-10", hours: 2, type: "Webinar", registrationOpen: true },
  { id: 4, title: "International Panchakarma Congress 2024", date: "2024-04-05", hours: 12, type: "Conference", registrationOpen: false },
];

export default function CMECredits() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">CME & Continuing Education</h1>
        <p className="text-muted-foreground">Track CME credits, certificates, and upcoming learning events</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Required Hours</span>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold mt-1">{cmeStatus.required}</p>
            <p className="text-xs text-muted-foreground">Per renewal cycle</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Completed</span>
              <Award className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold mt-1 text-green-600">{cmeStatus.completed}</p>
            <p className="text-xs text-muted-foreground">{Math.round((cmeStatus.completed / cmeStatus.required) * 100)}% complete</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Remaining</span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold mt-1 text-amber-600">{cmeStatus.remaining}</p>
            <p className="text-xs text-muted-foreground">Hours needed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Renewal Date</span>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold mt-1">{cmeStatus.renewalDate}</p>
            <p className="text-xs text-muted-foreground">CCIM Registration</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Progress by Category</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {categoryBreakdown.map((c) => (
            <div key={c.category} className="flex items-center gap-3">
              <span className="text-sm w-48">{c.category}</span>
              <div className="flex-1 bg-muted rounded-full h-3">
                <div className={`${c.color} rounded-full h-3`} style={{ width: `${(c.hours / cmeStatus.required) * 100}%` }} />
              </div>
              <span className="text-sm font-medium w-16 text-right">{c.hours} hrs</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Tabs defaultValue="completed">
        <TabsList>
          <TabsTrigger value="completed">Completed ({completedEvents.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcomingEvents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="completed">
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {completedEvents.map((e) => (
                  <div key={e.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{e.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{e.type}</Badge>
                        <span className="text-xs text-muted-foreground">{e.date}</span>
                        <span className="text-xs text-muted-foreground">• {e.hours} hrs</span>
                      </div>
                    </div>
                    {e.certificate && (
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => toast.success("Certificate downloaded.")}><Download className="h-3 w-3" />Certificate</Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming">
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {upcomingEvents.map((e) => (
                  <div key={e.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{e.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{e.type}</Badge>
                        <span className="text-xs text-muted-foreground">{e.date}</span>
                        <span className="text-xs text-muted-foreground">• {e.hours} hrs credit</span>
                      </div>
                    </div>
                    {e.registrationOpen ? (
                      <Button size="sm" className="gap-1" onClick={() => toast.success("Registration confirmed!")}><ExternalLink className="h-3 w-3" />Register</Button>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">Coming Soon</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
