import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, GraduationCap, MapPin, Building2 } from "lucide-react";

type College = { name: string; state: string; course: string; type: string };

const AYUSH_COLLEGES: College[] = [
  // Kerala
  { name: "VPSV Ayurveda College, Kottakkal", state: "Kerala", course: "BAMS", type: "Govt" },
  { name: "Govt. Ayurveda College, Thiruvananthapuram", state: "Kerala", course: "BAMS", type: "Govt" },
  { name: "Govt. Ayurveda College, Thrissur", state: "Kerala", course: "BAMS", type: "Govt" },
  { name: "Amrita School of Ayurveda, Kollam", state: "Kerala", course: "BAMS", type: "Private" },
  { name: "Pankajakasthuri Ayurveda College, Trivandrum", state: "Kerala", course: "BAMS", type: "Private" },
  // Karnataka
  { name: "SDM College of Ayurveda, Udupi", state: "Karnataka", course: "BAMS", type: "Private" },
  { name: "SDM College of Ayurveda, Hassan", state: "Karnataka", course: "BAMS", type: "Private" },
  { name: "JSS Ayurveda College, Mysuru", state: "Karnataka", course: "BAMS", type: "Private" },
  { name: "KAHER's KLE Ayurveda College, Belagavi", state: "Karnataka", course: "BAMS", type: "Private" },
  { name: "Govt. Ayurveda Medical College, Bengaluru", state: "Karnataka", course: "BAMS", type: "Govt" },
  // Tamil Nadu
  { name: "Govt. Siddha Medical College, Chennai", state: "Tamil Nadu", course: "BSMS", type: "Govt" },
  { name: "National Institute of Siddha, Chennai", state: "Tamil Nadu", course: "BSMS/MD", type: "Govt" },
  { name: "Sri Sairam Ayurveda College, Chennai", state: "Tamil Nadu", course: "BAMS", type: "Private" },
  { name: "Govt. Yoga & Naturopathy College, Chennai", state: "Tamil Nadu", course: "BNYS", type: "Govt" },
  // Maharashtra
  { name: "Tilak Ayurveda Mahavidyalaya, Pune", state: "Maharashtra", course: "BAMS", type: "Govt" },
  { name: "APM's Ayurveda College, Sion, Mumbai", state: "Maharashtra", course: "BAMS", type: "Govt" },
  { name: "Dr. D.Y. Patil Ayurveda College, Pune", state: "Maharashtra", course: "BAMS", type: "Private" },
  // Gujarat
  { name: "IPGT&RA, Gujarat Ayurved University, Jamnagar", state: "Gujarat", course: "BAMS/MD/PhD", type: "Govt" },
  { name: "JS Ayurveda College, Nadiad", state: "Gujarat", course: "BAMS", type: "Private" },
  // Rajasthan
  { name: "NIA, Jaipur (National Institute of Ayurveda)", state: "Rajasthan", course: "BAMS/MD", type: "Govt" },
  { name: "Dr. Sarvepalli Radhakrishnan Ayurveda University, Jodhpur", state: "Rajasthan", course: "BAMS", type: "Govt" },
  // UP
  { name: "Faculty of Ayurveda, BHU, Varanasi", state: "Uttar Pradesh", course: "BAMS/MD", type: "Govt" },
  { name: "Rishikul Govt. Ayurveda PG College, Haridwar", state: "Uttarakhand", course: "BAMS/MD", type: "Govt" },
  // MP
  { name: "Govt. Ayurveda College, Gwalior", state: "Madhya Pradesh", course: "BAMS", type: "Govt" },
  { name: "Govt. Autonomous Dhanwantari Ayurveda College, Ujjain", state: "Madhya Pradesh", course: "BAMS", type: "Govt" },
  // Delhi
  { name: "All India Institute of Ayurveda (AIIA), New Delhi", state: "Delhi", course: "MD/PhD", type: "Govt" },
  // West Bengal
  { name: "JBNSTS Homeopathy College, Kolkata", state: "West Bengal", course: "BHMS", type: "Govt" },
  { name: "National Institute of Homeopathy, Kolkata", state: "West Bengal", course: "BHMS/MD", type: "Govt" },
  // Andhra Pradesh / Telangana
  { name: "Dr. BRKR Govt. Ayurveda College, Hyderabad", state: "Telangana", course: "BAMS", type: "Govt" },
  { name: "Govt. Ayurveda College, Vijayawada", state: "Andhra Pradesh", course: "BAMS", type: "Govt" },
  // Others
  { name: "Govt. Ayurveda College, Nagpur", state: "Maharashtra", course: "BAMS", type: "Govt" },
  { name: "Ch. Brahm Prakash Ayurveda Charak Sansthan, Delhi", state: "Delhi", course: "BAMS", type: "Govt" },
  { name: "Unani Medical College, AMU, Aligarh", state: "Uttar Pradesh", course: "BUMS", type: "Govt" },
  { name: "Govt. Unani Medical College, Chennai", state: "Tamil Nadu", course: "BUMS", type: "Govt" },
  { name: "SVYASA Yoga University, Bengaluru", state: "Karnataka", course: "BNYS/MSc", type: "Deemed" },
];

const STATES = [...new Set(AYUSH_COLLEGES.map(c => c.state))].sort();
const COURSES = [...new Set(AYUSH_COLLEGES.map(c => c.course.split("/")[0]))].sort();

const CollegeDirectory = () => {
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");

  const filtered = useMemo(() => {
    let list = AYUSH_COLLEGES;
    if (stateFilter !== "all") list = list.filter(c => c.state === stateFilter);
    if (courseFilter !== "all") list = list.filter(c => c.course.includes(courseFilter));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q) || c.course.toLowerCase().includes(q));
    }
    return list;
  }, [search, stateFilter, courseFilter]);

  return (
    <div className="max-w-4xl mx-auto space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" /> AYUSH College Directory
        </h1>
        <p className="text-sm text-muted-foreground">{AYUSH_COLLEGES.length} colleges across India · Ayurveda, Siddha, Unani, Homeopathy, Yoga</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search college, state, course..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="border rounded-md px-3 py-2 text-sm bg-background"
          value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
          <option value="all">All States ({STATES.length})</option>
          {STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="border rounded-md px-3 py-2 text-sm bg-background"
          value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
          <option value="all">All Courses</option>
          {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <Badge variant="outline">{filtered.length} colleges found</Badge>

      {/* College List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No colleges found.</CardContent></Card>
        ) : filtered.map((college, idx) => (
          <Card key={idx} className="hover:border-primary/30 transition-colors">
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{college.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {college.state}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-[10px]">{college.course}</Badge>
                <Badge className={`text-[10px] ${college.type === "Govt" ? "bg-green-100 text-green-800" : college.type === "Deemed" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}>
                  {college.type}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CollegeDirectory;
