import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  FolderOpen, Upload, Search, Mail, Download, Tag,
  FileText, FlaskConical, Pill, Heart, Shield, Camera,
  Filter, CheckCircle, Clock, Sparkles, Wifi, WifiOff,
  Star, Share2
} from "lucide-react";

type HealthDocument = {
  id: string;
  file_name: string;
  document_type: string;
  document_date: string;
  source: string;
  source_clinic: string;
  tags: string[];
  ai_summary: string;
  is_starred: boolean;
  is_offline_cached: boolean;
  file_size: string;
};

const typeIcons: Record<string, typeof FileText> = {
  lab_report: FlaskConical,
  prescription: Pill,
  discharge_summary: FileText,
  vaccination: Shield,
  imaging: Camera,
  insurance: Shield,
  other: FileText,
};

const typeColors: Record<string, string> = {
  lab_report: "bg-blue-100 text-blue-700",
  prescription: "bg-green-100 text-green-700",
  discharge_summary: "bg-purple-100 text-purple-700",
  vaccination: "bg-amber-100 text-amber-700",
  imaging: "bg-pink-100 text-pink-700",
  insurance: "bg-orange-100 text-orange-700",
  other: "bg-gray-100 text-gray-700",
};

const mockDocuments: HealthDocument[] = [
  { id: "1", file_name: "CBC_Lipid_Profile_Jul2026.pdf", document_type: "lab_report", document_date: "2026-07-25", source: "hms_lab", source_clinic: "Al Shifa AYUSH Hospital", tags: ["blood_test", "cholesterol", "2026", "routine"], ai_summary: "CBC normal. LDL elevated at 145 mg/dL. Total cholesterol 220.", is_starred: true, is_offline_cached: true, file_size: "1.2 MB" },
  { id: "2", file_name: "Prescription_DrSaleem_Jul28.pdf", document_type: "prescription", document_date: "2026-07-28", source: "hms_prescription", source_clinic: "Al Shifa AYUSH Hospital", tags: ["ayurveda", "dashamool", "ashwagandha", "hypertension"], ai_summary: "Amlodipine 5mg + Dashamoolarishtam + Ashwagandha Churna for hypertension + anxiety.", is_starred: false, is_offline_cached: true, file_size: "450 KB" },
  { id: "3", file_name: "Discharge_Summary_Panchakarma.pdf", document_type: "discharge_summary", document_date: "2026-06-15", source: "hms_discharge", source_clinic: "Al Shifa AYUSH Hospital", tags: ["panchakarma", "14_day", "vamana", "virechana", "discharge"], ai_summary: "14-day PK completed. Vamana + Virechana + Basti. Patient improved significantly. Follow-up in 30 days.", is_starred: true, is_offline_cached: false, file_size: "2.1 MB" },
  { id: "4", file_name: "COVID_Vaccination_Certificate.pdf", document_type: "vaccination", document_date: "2022-03-10", source: "upload", source_clinic: "PHC Kadayanallur", tags: ["covid", "covishield", "dose_2", "vaccination"], ai_summary: "Covishield Dose 2 completed. Certificate from CoWIN.", is_starred: false, is_offline_cached: true, file_size: "320 KB" },
  { id: "5", file_name: "Knee_Xray_Report.pdf", document_type: "imaging", document_date: "2026-05-20", source: "upload", source_clinic: "SRL Diagnostics", tags: ["xray", "knee", "orthopedic", "osteoarthritis"], ai_summary: "Mild osteoarthritic changes in bilateral knees. Joint space narrowing grade 1.", is_starred: false, is_offline_cached: false, file_size: "3.5 MB" },
  { id: "6", file_name: "Star_Health_Insurance_Card.jpg", document_type: "insurance", document_date: "2026-01-01", source: "upload", source_clinic: "Star Health", tags: ["insurance", "star_health", "family_optima", "policy"], ai_summary: "Star Health Family Optima. Policy: SH-2026-00456789. Cover: 5L. Valid till Mar 2027.", is_starred: true, is_offline_cached: true, file_size: "180 KB" },
  { id: "7", file_name: "Thyroid_Report_Apr2026.pdf", document_type: "lab_report", document_date: "2026-04-10", source: "upload", source_clinic: "Thyrocare", tags: ["thyroid", "TSH", "T3", "T4", "endocrine"], ai_summary: "TSH: 4.8 (borderline high). T3/T4 normal. Monitor in 3 months.", is_starred: false, is_offline_cached: false, file_size: "890 KB" },
];

const PatientHealthLocker = () => {
  const [documents] = useState<HealthDocument[]>(mockDocuments);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterTag, setFilterTag] = useState("");
  const [isOfflineMode] = useState(false);

  // Smart search: searches file name, tags, AI summary, clinic
  const filtered = documents.filter(doc => {
    const matchType = filterType === "all" || doc.document_type === filterType;
    const matchTag = !filterTag || doc.tags.includes(filterTag);
    const matchSearch = !searchTerm || 
      doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.ai_summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some(t => t.includes(searchTerm.toLowerCase())) ||
      doc.source_clinic.toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchTag && matchSearch;
  });

  // All unique tags from documents
  const allTags = [...new Set(documents.flatMap(d => d.tags))].sort();

  const handleEmailBackup = () => {
    toast.success("All health records sent to your registered email as a secure ZIP attachment. Check your inbox in 2 minutes.");
  };

  const handleEmailSingleDoc = (doc: HealthDocument) => {
    toast.success(`${doc.file_name} sent to your email.`);
  };

  const handleShareWithDoctor = (doc: HealthDocument) => {
    toast.success(`Sharing consent request sent. Doctor will access ${doc.file_name} after your approval.`);
  };

  const handleDownloadAll = () => {
    toast.success("Downloading all records as ZIP (7 files, ~8.6 MB)...");
  };

  const handleMakeOffline = (doc: HealthDocument) => {
    toast.success(`${doc.file_name} cached for offline access. Available without internet.`);
  };

  const handleUpload = () => {
    toast.info("Upload a photo or PDF — AI will auto-classify and tag it.");
  };

  const offlineCachedCount = documents.filter(d => d.is_offline_cached).length;
  const starredCount = documents.filter(d => d.is_starred).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-primary" /> My Health Locker
          </h1>
          <p className="text-sm text-muted-foreground">
            All your medical records in one place · AI-tagged · Searchable · Shareable
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleEmailBackup}>
            <Mail className="mr-1 h-4 w-4" /> Backup to Email
          </Button>
          <Button size="sm" variant="outline" onClick={handleDownloadAll}>
            <Download className="mr-1 h-4 w-4" /> Download All
          </Button>
          <Button size="sm" onClick={handleUpload}>
            <Upload className="mr-1 h-4 w-4" /> Upload Record
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{documents.length}</p><p className="text-xs text-muted-foreground">Total Records</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-amber-600">{starredCount}</p><p className="text-xs text-muted-foreground">Starred</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-green-600">{offlineCachedCount}</p><p className="text-xs text-muted-foreground">Offline Ready</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-blue-600">{allTags.length}</p><p className="text-xs text-muted-foreground">AI Tags</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            {isOfflineMode ? <WifiOff className="h-4 w-4 text-red-500" /> : <Wifi className="h-4 w-4 text-green-500" />}
            <p className="text-sm font-medium">{isOfflineMode ? "Offline" : "Online"}</p>
          </div>
          <p className="text-xs text-muted-foreground">Connection</p>
        </CardContent></Card>
      </div>

      {/* Smart Search + Filters */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search records, tags, summaries, clinic names..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <select className="rounded border px-3 py-2 text-sm" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              <option value="lab_report">Lab Reports</option>
              <option value="prescription">Prescriptions</option>
              <option value="discharge_summary">Discharge Summaries</option>
              <option value="vaccination">Vaccination</option>
              <option value="imaging">Imaging/X-Ray</option>
              <option value="insurance">Insurance</option>
            </select>
          </div>
          {/* Tag Cloud */}
          <div className="flex gap-1.5 flex-wrap">
            <span className="text-xs text-muted-foreground flex items-center gap-1"><Tag className="h-3 w-3" /> Tags:</span>
            {allTags.slice(0, 15).map(tag => (
              <Badge key={tag} variant={filterTag === tag ? "default" : "outline"}
                className="text-xs cursor-pointer" onClick={() => setFilterTag(filterTag === tag ? "" : tag)}>
                {tag.replace(/_/g, " ")}
              </Badge>
            ))}
            {allTags.length > 15 && <Badge variant="outline" className="text-xs">+{allTags.length - 15} more</Badge>}
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No records match your search/filter.</CardContent></Card>
        ) : (
          filtered.map(doc => {
            const Icon = typeIcons[doc.document_type] || FileText;
            const color = typeColors[doc.document_type] || typeColors.other;
            return (
              <Card key={doc.id} className="hover:bg-muted/20 transition">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Type icon */}
                    <div className={`h-10 w-10 rounded-lg grid place-items-center shrink-0 ${color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{doc.file_name}</p>
                        {doc.is_starred && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                        {doc.is_offline_cached && <Wifi className="h-3 w-3 text-green-500 shrink-0" title="Available offline" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {doc.source_clinic} · {doc.document_date} · {doc.file_size}
                      </p>
                      {/* AI Summary */}
                      <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
                        <Sparkles className="h-3 w-3 text-purple-500 shrink-0 mt-0.5" />
                        <span className="italic">{doc.ai_summary}</span>
                      </p>
                      {/* Tags */}
                      <div className="flex gap-1 flex-wrap mt-1.5">
                        {doc.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-[10px] h-4 px-1.5 cursor-pointer"
                            onClick={() => setFilterTag(tag)}>
                            {tag.replace(/_/g, " ")}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex flex-col gap-1 shrink-0">
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleShareWithDoctor(doc)}>
                        <Share2 className="h-3 w-3 mr-1" /> Share
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleEmailSingleDoc(doc)}>
                        <Mail className="h-3 w-3 mr-1" /> Email
                      </Button>
                      {!doc.is_offline_cached && (
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleMakeOffline(doc)}>
                          <Download className="h-3 w-3 mr-1" /> Offline
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Offline mode info */}
      <Card className="bg-blue-50/50 border-blue-200">
        <CardContent className="p-3 flex items-center gap-3 text-xs text-blue-800">
          <Wifi className="h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Offline Access</p>
            <p className="text-blue-600">{offlineCachedCount} of {documents.length} records cached for offline viewing. Star important records and tap "Offline" to make them available without internet.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientHealthLocker;
