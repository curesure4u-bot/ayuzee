import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Book, Search, Lock, Eye, Download, X, Globe, GraduationCap, Stethoscope, Star } from "lucide-react";

type AccessLevel = "public" | "student" | "doctor" | "premium" | "hms_staff";
type BookCategory = "Ayurveda" | "Siddha" | "Homeopathy" | "Unani" | "Yoga" | "Acupuncture" | "Spine" | "Research" | "Clinical" | "General";

interface EBook {
  id: string;
  title: string;
  author: string;
  category: BookCategory;
  accessLevel: AccessLevel;
  coverUrl: string;
  driveFileId: string; // Google Drive file ID for embed
  pages: number;
  language: string;
  year: number;
  description: string;
  tags: string[];
  views: number;
}

// Sample e-book catalog (in production, fetched from Supabase)
const EBOOKS: EBook[] = [
  { id: "1", title: "Charaka Samhita (Vol 1-4)", author: "Agnivesha / P.V. Sharma", category: "Ayurveda", accessLevel: "public", coverUrl: "", driveFileId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgDf7", pages: 2400, language: "English + Sanskrit", year: 1981, description: "Complete Charaka Samhita with English translation and commentary", tags: ["classical", "samhita", "foundation"], views: 12450 },
  { id: "2", title: "Sushruta Samhita (Complete)", author: "Sushruta / K.K.L. Bhishagratna", category: "Ayurveda", accessLevel: "public", coverUrl: "", driveFileId: "1CxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgDf8", pages: 1800, language: "English + Sanskrit", year: 1907, description: "Complete Sushruta Samhita - Surgery & Clinical Ayurveda", tags: ["classical", "shalya", "surgery"], views: 8920 },
  { id: "3", title: "Ashtanga Hridayam", author: "Vagbhata / K.R. Srikantha Murthy", category: "Ayurveda", accessLevel: "public", coverUrl: "", driveFileId: "1DxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgDf9", pages: 1200, language: "English + Sanskrit", year: 1991, description: "The Heart of Eight Branches of Ayurveda - most practical samhita", tags: ["classical", "ashtanga", "practice"], views: 15200 },
  { id: "4", title: "Dravyaguna Vijnana (Pharmacology)", author: "J.L.N. Shastry", category: "Ayurveda", accessLevel: "student", coverUrl: "", driveFileId: "1ExiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgDf0", pages: 800, language: "English", year: 2005, description: "Comprehensive AYUSH pharmacology - herbs, minerals, formulations", tags: ["dravyaguna", "herbs", "pharmacology", "BAMS"], views: 6800 },
  { id: "5", title: "Panchakarma Illustrated", author: "Dr. G. Shrinivasa Acharya", category: "Ayurveda", accessLevel: "doctor", coverUrl: "", driveFileId: "1FxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgDf1", pages: 450, language: "English", year: 2018, description: "Step-by-step Panchakarma procedures with photographs", tags: ["panchakarma", "procedures", "clinical"], views: 4200 },
  { id: "6", title: "Acupoints & Their Uses", author: "Ayuzee Clinical Team", category: "Acupuncture", accessLevel: "public", coverUrl: "", driveFileId: "EXISTING_PDF", pages: 120, language: "English", year: 2024, description: "Quick reference for acupuncture points and clinical applications", tags: ["acupuncture", "points", "clinical"], views: 3400 },
  { id: "7", title: "Tung's Acupuncture Points", author: "Master Tung / Wei-Chieh Young", category: "Acupuncture", accessLevel: "public", coverUrl: "", driveFileId: "EXISTING_PDF_TUNG", pages: 180, language: "English", year: 2020, description: "Master Tung's extraordinary acupuncture point system", tags: ["tung", "acupuncture", "extraordinary"], views: 5100 },
  { id: "8", title: "Organon of Medicine (6th Ed)", author: "Samuel Hahnemann", category: "Homeopathy", accessLevel: "public", coverUrl: "", driveFileId: "1GxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgDf2", pages: 320, language: "English", year: 1842, description: "Foundation text of Homeopathy - principles of healing", tags: ["homeopathy", "organon", "classical", "foundation"], views: 7600 },
  { id: "9", title: "Spine AYUSH Clinical Manual", author: "Dr. Mohamad Saleem", category: "Spine", accessLevel: "hms_staff", coverUrl: "", driveFileId: "1HxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgDf3", pages: 200, language: "English", year: 2026, description: "Internal SOP manual for Spine AYUSH franchise - protocols, assessments, treatment plans", tags: ["spine", "SOP", "franchise", "internal"], views: 890 },
  { id: "10", title: "Yoga Therapy for Musculoskeletal Disorders", author: "Dr. Ishwar Basavaraddi", category: "Yoga", accessLevel: "student", coverUrl: "", driveFileId: "1IxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgDf4", pages: 280, language: "English", year: 2019, description: "Evidence-based yoga protocols for spine, joints, and chronic pain", tags: ["yoga", "therapy", "spine", "evidence"], views: 3200 },
  { id: "11", title: "Research Methodology in AYUSH", author: "CCRAS Publication", category: "Research", accessLevel: "doctor", coverUrl: "", driveFileId: "1JxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgDf5", pages: 350, language: "English", year: 2022, description: "How to conduct clinical trials in AYUSH - ICMR/CTRI guidelines", tags: ["research", "methodology", "CTRI", "clinical trial"], views: 2100 },
  { id: "12", title: "Sahasrayogam (Classical Formulations)", author: "Kerala Tradition / Various", category: "Ayurveda", accessLevel: "public", coverUrl: "", driveFileId: "1KxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgDf6", pages: 600, language: "Malayalam + English", year: 2015, description: "1000+ classical Ayurvedic formulations from Kerala tradition", tags: ["classical", "formulations", "kerala", "sahasrayogam"], views: 9800 },
];

const accessLabels: Record<AccessLevel, { label: string; color: string; icon: typeof Globe }> = {
  public: { label: "Free", color: "bg-green-100 text-green-800", icon: Globe },
  student: { label: "Students", color: "bg-blue-100 text-blue-800", icon: GraduationCap },
  doctor: { label: "Doctors", color: "bg-purple-100 text-purple-800", icon: Stethoscope },
  premium: { label: "Premium", color: "bg-amber-100 text-amber-800", icon: Star },
  hms_staff: { label: "HMS Staff", color: "bg-red-100 text-red-800", icon: Lock },
};

const EBookLibrary = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [access, setAccess] = useState<string>("all");
  const [viewingBook, setViewingBook] = useState<EBook | null>(null);
  const [userRole, setUserRole] = useState<string>("public"); // In production: detect from auth

  // Check user auth status
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setUserRole("doctor"); // simplified — in production check actual role
    });
  }, []);

  const canAccess = (book: EBook): boolean => {
    if (book.accessLevel === "public") return true;
    if (userRole === "doctor" || userRole === "owner") return true; // doctors see everything
    if (book.accessLevel === "student" && (userRole === "student" || userRole === "doctor")) return true;
    return false;
  };

  const filtered = EBOOKS.filter(b => {
    if (search && !b.title.toLowerCase().includes(search.toLowerCase()) && !b.author.toLowerCase().includes(search.toLowerCase()) && !b.tags.some(t => t.includes(search.toLowerCase()))) return false;
    if (category !== "all" && b.category !== category) return false;
    if (access !== "all" && b.accessLevel !== access) return false;
    return true;
  });

  const openBook = (book: EBook) => {
    if (!canAccess(book)) {
      toast.error(`This book requires ${accessLabels[book.accessLevel].label} access. Please login or upgrade.`);
      return;
    }
    setViewingBook(book);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Ayuzee E-Book Library</h1>
          <p className="text-muted-foreground">Access 500+ AYUSH e-books — Classical texts, Clinical manuals, Research papers</p>
          <div className="flex items-center justify-center gap-3 text-sm">
            <Badge className="bg-green-100 text-green-800"><Globe className="mr-1 h-3 w-3" />{EBOOKS.filter(b => b.accessLevel === "public").length} Free Books</Badge>
            <Badge className="bg-blue-100 text-blue-800"><GraduationCap className="mr-1 h-3 w-3" />{EBOOKS.filter(b => b.accessLevel === "student").length} Student</Badge>
            <Badge className="bg-purple-100 text-purple-800"><Stethoscope className="mr-1 h-3 w-3" />{EBOOKS.filter(b => b.accessLevel === "doctor").length} Doctor</Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search by title, author, or topic..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
          <Select value={category} onValueChange={setCategory}><SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger><SelectContent><SelectItem value="all">All Categories</SelectItem><SelectItem value="Ayurveda">Ayurveda</SelectItem><SelectItem value="Siddha">Siddha</SelectItem><SelectItem value="Homeopathy">Homeopathy</SelectItem><SelectItem value="Yoga">Yoga</SelectItem><SelectItem value="Acupuncture">Acupuncture</SelectItem><SelectItem value="Spine">Spine</SelectItem><SelectItem value="Research">Research</SelectItem></SelectContent></Select>
          <Select value={access} onValueChange={setAccess}><SelectTrigger className="w-[140px]"><SelectValue placeholder="Access" /></SelectTrigger><SelectContent><SelectItem value="all">All Access</SelectItem><SelectItem value="public">Free</SelectItem><SelectItem value="student">Student</SelectItem><SelectItem value="doctor">Doctor</SelectItem></SelectContent></Select>
        </div>

        {/* Book Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filtered.map(book => (
            <Card key={book.id} className="cursor-pointer hover:shadow-md transition group" onClick={() => openBook(book)}>
              <CardContent className="p-3 space-y-2">
                {/* Cover */}
                <div className="aspect-[3/4] bg-gradient-to-br from-emerald-50 to-teal-100 rounded-md flex items-center justify-center relative overflow-hidden">
                  <Book className="h-10 w-10 text-emerald-600/40" />
                  <div className="absolute top-1 right-1"><Badge className={`text-[9px] ${accessLabels[book.accessLevel].color}`}>{accessLabels[book.accessLevel].label}</Badge></div>
                  {!canAccess(book) && <div className="absolute inset-0 bg-black/20 flex items-center justify-center"><Lock className="h-6 w-6 text-white" /></div>}
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] px-2 py-1 text-center opacity-0 group-hover:opacity-100 transition"><Eye className="inline h-3 w-3 mr-1" />Read Now</div>
                </div>
                {/* Info */}
                <div>
                  <p className="text-xs font-semibold line-clamp-2 leading-tight">{book.title}</p>
                  <p className="text-[10px] text-muted-foreground">{book.author}</p>
                  <div className="flex items-center justify-between mt-1">
                    <Badge variant="outline" className="text-[9px]">{book.category}</Badge>
                    <span className="text-[9px] text-muted-foreground">{book.pages}p</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No books found. Try a different search or category.</p>}

        {/* Google Drive PDF Viewer Dialog */}
        <Dialog open={!!viewingBook} onOpenChange={() => setViewingBook(null)}>
          <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden">
            <DialogHeader className="p-4 pb-2 border-b flex-row items-center justify-between">
              <div>
                <DialogTitle className="text-base">{viewingBook?.title}</DialogTitle>
                <p className="text-xs text-muted-foreground">{viewingBook?.author} • {viewingBook?.pages} pages • {viewingBook?.language}</p>
              </div>
              <div className="flex gap-2">
                <Badge className={viewingBook ? accessLabels[viewingBook.accessLevel].color : ""}>{viewingBook ? accessLabels[viewingBook.accessLevel].label : ""}</Badge>
              </div>
            </DialogHeader>
            <div className="flex-1 h-full">
              {viewingBook && (
                viewingBook.driveFileId === "EXISTING_PDF" ? (
                  <iframe src="/acupoints-and-uses.pdf" className="w-full h-[calc(90vh-80px)] border-0" title={viewingBook.title} />
                ) : viewingBook.driveFileId === "EXISTING_PDF_TUNG" ? (
                  <iframe src="/tung-acupuncture-points.pdf" className="w-full h-[calc(90vh-80px)] border-0" title={viewingBook.title} />
                ) : (
                  <iframe
                    src={`https://drive.google.com/file/d/${viewingBook.driveFileId}/preview`}
                    className="w-full h-[calc(90vh-80px)] border-0"
                    title={viewingBook.title}
                    allow="autoplay"
                    sandbox="allow-scripts allow-same-origin"
                  />
                )
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
export default EBookLibrary;
