import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Globe, Plus, Users, Heart, Calendar, MapPin } from "lucide-react";

const HmsPublicHealth = () => {
  const [campOpen, setCampOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6 text-green-600" /> Public Health & Outreach
          </h1>
          <p className="text-sm text-muted-foreground">
            Health Camps, School Screening, Community Programs & Wellness Campaigns
          </p>
        </div>
        <Button onClick={() => setCampOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> Plan Camp
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><Calendar className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">8</p><p className="text-xs text-muted-foreground">Camps This Year</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Users className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold mt-1">1,245</p><p className="text-xs text-muted-foreground">People Screened</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Heart className="h-5 w-5 mx-auto text-red-600" /><p className="text-xl font-bold mt-1">342</p><p className="text-xs text-muted-foreground">Referrals Generated</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><MapPin className="h-5 w-5 mx-auto text-purple-600" /><p className="text-xl font-bold mt-1">12</p><p className="text-xs text-muted-foreground">Locations Covered</p></CardContent></Card>
      </div>

      <Tabs defaultValue="camps">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 w-full">
          <TabsTrigger value="camps">Health Camps</TabsTrigger>
          <TabsTrigger value="screening">School Screening</TabsTrigger>
          <TabsTrigger value="campaigns">Wellness Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="camps" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Health Camp History</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Free Ayurveda Camp - Panchayat Hall", date: "2026-07-05", location: "Trivandrum Rural", screened: 185, referrals: 42, status: "completed" },
                  { name: "Yoga Day Special Camp", date: "2026-06-21", location: "City Park, Kochi", screened: 320, referrals: 28, status: "completed" },
                  { name: "Diabetes Awareness & Prakruti Check", date: "2026-07-20", location: "Community Center, Calicut", screened: 0, referrals: 0, status: "upcoming" },
                  { name: "Joint Pain & Spine Care Camp", date: "2026-08-10", location: "Temple Ground, Thrissur", screened: 0, referrals: 0, status: "planning" },
                  { name: "Women's Health Camp - PCOS & Fertility", date: "2026-05-12", location: "Govt School, Alappuzha", screened: 145, referrals: 38, status: "completed" },
                ].map((camp) => (
                  <div key={camp.name} className="rounded-lg border p-3 hover:bg-muted/30 transition">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{camp.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          <MapPin className="inline h-3 w-3 mr-1" />{camp.location} · {new Date(camp.date).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      <Badge variant={camp.status === "completed" ? "outline" : camp.status === "upcoming" ? "default" : "secondary"}
                        className={`text-xs capitalize ${camp.status === "completed" ? "text-green-600" : ""}`}>
                        {camp.status}
                      </Badge>
                    </div>
                    {camp.screened > 0 && (
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{camp.screened} screened</span>
                        <span>{camp.referrals} referrals</span>
                        <span>{Math.round((camp.referrals / camp.screened) * 100)}% conversion</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="screening" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">School Health Screening Programs</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { school: "Govt. High School, Trivandrum", students: 320, date: "2026-06-15", findings: "12 vision issues, 8 posture problems, 5 nutritional deficiencies" },
                  { school: "St. Mary's School, Kochi", students: 450, date: "2026-05-20", findings: "18 dental issues, 15 skin conditions, 6 respiratory concerns" },
                  { school: "Kendriya Vidyalaya, Calicut", students: 280, date: "2026-04-10", findings: "10 vision issues, 12 obesity concerns, 4 allergic conditions" },
                ].map((s) => (
                  <div key={s.school} className="rounded-lg border p-3">
                    <div className="flex justify-between">
                      <p className="font-medium text-sm">{s.school}</p>
                      <span className="text-xs text-muted-foreground">{s.date}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{s.students} students screened</p>
                    <p className="text-xs mt-1"><span className="font-medium">Findings:</span> {s.findings}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Wellness Campaigns & Community Programs</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: "Monsoon Wellness Drive", period: "Jul-Aug 2026", reach: "5,000+", desc: "Immunity boosting tips, herbal supplements distribution" },
                  { name: "AYUSH Day Celebration", period: "Nov 2026", reach: "2,500+", desc: "Free consultations, Prakruti assessment, yoga sessions" },
                  { name: "Diabetes Prevention Program", period: "Ongoing", reach: "800+", desc: "Monthly workshops, diet counseling, Panchakarma awareness" },
                  { name: "Mental Health Awareness", period: "Oct 2026", reach: "1,200+", desc: "Yoga for stress, meditation workshops, counseling camps" },
                ].map((c) => (
                  <Card key={c.name} className="border-green-200">
                    <CardContent className="p-3">
                      <p className="font-medium text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{c.period} · Reach: {c.reach}</p>
                      <p className="text-xs mt-1">{c.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Plan Camp Dialog */}
      <Dialog open={campOpen} onOpenChange={setCampOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Plan Health Camp</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Camp Name</Label><Input placeholder="e.g., Free Ayurveda Camp" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date</Label><Input type="date" /></div>
              <div><Label>Location</Label><Input placeholder="Venue" /></div>
            </div>
            <div><Label>Target Audience</Label><Input placeholder="e.g., Senior citizens, Women, School children" /></div>
            <div><Label>Services Offered</Label><Input placeholder="e.g., Prakruti check, BP, Sugar, Free medicines" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCampOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Camp planned"); setCampOpen(false); }}>Create Camp</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsPublicHealth;
