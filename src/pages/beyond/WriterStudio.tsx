import { useState } from "react";
import {
  Award,
  BookOpen,
  ClipboardCopy,
  FileText,
  PenTool,
  Search,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// ════════════════════════════════════════════════════════════
// CASE REPORT BUILDER
// ════════════════════════════════════════════════════════════

function CaseReportBuilder() {
  const [sections, setSections] = useState({
    title: "",
    keywords: "",
    introduction: "",
    patient_info: "",
    history: "",
    examination: "",
    investigations: "",
    diagnosis: "",
    treatment: "",
    outcome: "",
    discussion: "",
    conclusion: "",
  });

  const updateSection = (key: keyof typeof sections, value: string) => {
    setSections((prev) => ({ ...prev, [key]: value }));
  };

  const wordCount = Object.values(sections).join(" ").split(/\s+/).filter(Boolean).length;

  const exportText = () => {
    const output = `CASE REPORT: ${sections.title}
Keywords: ${sections.keywords}

INTRODUCTION
${sections.introduction}

PATIENT INFORMATION
${sections.patient_info}

HISTORY OF PRESENTING ILLNESS
${sections.history}

EXAMINATION FINDINGS
${sections.examination}

INVESTIGATIONS
${sections.investigations}

DIAGNOSIS
${sections.diagnosis}

TREATMENT & MANAGEMENT
${sections.treatment}

OUTCOME & FOLLOW-UP
${sections.outcome}

DISCUSSION
${sections.discussion}

CONCLUSION
${sections.conclusion}
`;
    navigator.clipboard.writeText(output);
    toast.success("Case report copied to clipboard!");
  };

  const CARE_SECTIONS = [
    { key: "title", label: "Title", placeholder: "e.g. Management of chronic low back pain with Panchakarma — a case report", rows: 1 },
    { key: "keywords", label: "Keywords (3-5)", placeholder: "e.g. Panchakarma, low back pain, Ayurveda, case report", rows: 1 },
    { key: "introduction", label: "Introduction", placeholder: "Brief background, why this case is worth reporting, gap in literature...", rows: 3 },
    { key: "patient_info", label: "Patient Information", placeholder: "Age, gender, occupation. No identifying details.", rows: 2 },
    { key: "history", label: "History of Presenting Illness", placeholder: "Chief complaint, duration, onset, progression, previous treatments...", rows: 3 },
    { key: "examination", label: "Examination Findings", placeholder: "Relevant physical examination findings, vital signs...", rows: 3 },
    { key: "investigations", label: "Investigations", placeholder: "Lab results, imaging, special tests relevant to the case...", rows: 2 },
    { key: "diagnosis", label: "Diagnosis", placeholder: "Final diagnosis with reasoning. Include Ayurvedic/AYUSH diagnosis if applicable.", rows: 2 },
    { key: "treatment", label: "Treatment & Management", placeholder: "Detailed treatment protocol: medicines, procedures, duration, dosage...", rows: 4 },
    { key: "outcome", label: "Outcome & Follow-up", placeholder: "Results after treatment, improvement metrics, follow-up duration...", rows: 3 },
    { key: "discussion", label: "Discussion", placeholder: "Compare with existing literature, explain mechanism, limitations...", rows: 4 },
    { key: "conclusion", label: "Conclusion", placeholder: "Key takeaway, clinical implications, future research direction...", rows: 2 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4 text-blue-500" /> Case Report Builder (CARE Guidelines)
        </CardTitle>
        <CardDescription className="text-xs">
          Structured template following CARE case report guidelines. Fill each section and export.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">{wordCount} words</Badge>
          <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={exportText}>
            <ClipboardCopy className="h-3 w-3" /> Copy All
          </Button>
        </div>
        {CARE_SECTIONS.map((section) => (
          <div key={section.key}>
            <label className="text-xs font-medium">{section.label}</label>
            {section.rows === 1 ? (
              <Input
                placeholder={section.placeholder}
                value={sections[section.key as keyof typeof sections]}
                onChange={(e) => updateSection(section.key as keyof typeof sections, e.target.value)}
              />
            ) : (
              <Textarea
                placeholder={section.placeholder}
                value={sections[section.key as keyof typeof sections]}
                onChange={(e) => updateSection(section.key as keyof typeof sections, e.target.value)}
                rows={section.rows}
                className="text-sm"
              />
            )}
          </div>
        ))}
        <Button onClick={exportText} className="w-full gap-2">
          <ClipboardCopy className="h-4 w-4" /> Export Case Report
        </Button>
      </CardContent>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════
// ABSTRACT WRITER
// ════════════════════════════════════════════════════════════

function AbstractWriter() {
  const [background, setBackground] = useState("");
  const [objective, setObjective] = useState("");
  const [methods, setMethods] = useState("");
  const [results, setResults] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [maxWords, setMaxWords] = useState("250");

  const fullAbstract = `Background: ${background}\nObjective: ${objective}\nMethods: ${methods}\nResults: ${results}\nConclusion: ${conclusion}`;
  const wordCount = fullAbstract.split(/\s+/).filter(Boolean).length;
  const overLimit = wordCount > Number(maxWords);

  const copyAbstract = () => {
    navigator.clipboard.writeText(fullAbstract);
    toast.success("Abstract copied!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Sparkles className="h-4 w-4 text-purple-500" /> Structured Abstract Writer
        </CardTitle>
        <CardDescription className="text-xs">
          IMRaD structured abstract with live word count. Most journals require 200-300 words.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant={overLimit ? "destructive" : "outline"} className="text-xs">
            {wordCount}/{maxWords} words {overLimit ? "⚠️ Over limit!" : ""}
          </Badge>
          <Select value={maxWords} onValueChange={setMaxWords}>
            <SelectTrigger className="w-[100px] h-7 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="150">150 words</SelectItem>
              <SelectItem value="200">200 words</SelectItem>
              <SelectItem value="250">250 words</SelectItem>
              <SelectItem value="300">300 words</SelectItem>
              <SelectItem value="350">350 words</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium">Background</label>
          <Textarea placeholder="What is already known? What gap exists?" value={background} onChange={(e) => setBackground(e.target.value)} rows={2} className="text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium">Objective</label>
          <Textarea placeholder="What did this study aim to do?" value={objective} onChange={(e) => setObjective(e.target.value)} rows={1} className="text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium">Methods</label>
          <Textarea placeholder="Study design, sample size, interventions, outcome measures..." value={methods} onChange={(e) => setMethods(e.target.value)} rows={2} className="text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium">Results</label>
          <Textarea placeholder="Key findings with numbers. P-values, confidence intervals if applicable." value={results} onChange={(e) => setResults(e.target.value)} rows={2} className="text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium">Conclusion</label>
          <Textarea placeholder="What does this mean? Clinical implications. One clear takeaway." value={conclusion} onChange={(e) => setConclusion(e.target.value)} rows={2} className="text-sm" />
        </div>
        <Button onClick={copyAbstract} className="w-full gap-2" variant="outline">
          <ClipboardCopy className="h-4 w-4" /> Copy Abstract
        </Button>
      </CardContent>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════
// CITATION FORMATTER
// ════════════════════════════════════════════════════════════

function CitationFormatter() {
  const [authors, setAuthors] = useState("");
  const [title, setTitle] = useState("");
  const [journal, setJournal] = useState("");
  const [year, setYear] = useState("");
  const [volume, setVolume] = useState("");
  const [pages, setPages] = useState("");
  const [doi, setDoi] = useState("");
  const [style, setStyle] = useState("vancouver");

  const formatCitation = (): string => {
    if (!authors || !title) return "";
    if (style === "vancouver") {
      return `${authors}. ${title}. ${journal}. ${year};${volume}:${pages}.${doi ? ` doi: ${doi}` : ""}`;
    }
    if (style === "apa") {
      return `${authors} (${year}). ${title}. ${journal}, ${volume}, ${pages}.${doi ? ` https://doi.org/${doi}` : ""}`;
    }
    // Harvard
    return `${authors} (${year}) '${title}', ${journal}, ${volume}, pp. ${pages}.${doi ? ` doi: ${doi}` : ""}`;
  };

  const formatted = formatCitation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <BookOpen className="h-4 w-4 text-green-500" /> Citation Formatter
        </CardTitle>
        <CardDescription className="text-xs">Format references in Vancouver, APA, or Harvard style.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Select value={style} onValueChange={setStyle}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="vancouver">Vancouver (ICMJE)</SelectItem>
            <SelectItem value="apa">APA 7th Edition</SelectItem>
            <SelectItem value="harvard">Harvard</SelectItem>
          </SelectContent>
        </Select>
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <label className="text-xs text-muted-foreground">Authors</label>
            <Input placeholder="Kumar S, Sharma R" value={authors} onChange={(e) => setAuthors(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Article Title</label>
            <Input placeholder="Effect of..." value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Journal Name</label>
            <Input placeholder="J Ayurveda Integr Med" value={journal} onChange={(e) => setJournal(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Year</label>
            <Input placeholder="2024" value={year} onChange={(e) => setYear(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Volume(Issue)</label>
            <Input placeholder="15(2)" value={volume} onChange={(e) => setVolume(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Pages</label>
            <Input placeholder="45-52" value={pages} onChange={(e) => setPages(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-muted-foreground">DOI (optional)</label>
            <Input placeholder="10.1016/j.jaim.2024.01.001" value={doi} onChange={(e) => setDoi(e.target.value)} />
          </div>
        </div>
        {formatted && (
          <div className="rounded-lg bg-muted/60 p-3">
            <p className="text-xs font-medium mb-1">Formatted ({style.toUpperCase()}):</p>
            <p className="text-sm">{formatted}</p>
            <Button size="sm" variant="ghost" className="mt-2 text-xs gap-1" onClick={() => { navigator.clipboard.writeText(formatted); toast.success("Citation copied!"); }}>
              <ClipboardCopy className="h-3 w-3" /> Copy
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════
// JOURNAL FINDER
// ════════════════════════════════════════════════════════════

const JOURNALS = [
  { name: "Journal of Ayurveda and Integrative Medicine", area: "Ayurveda, Integrative", impactFactor: "1.8", scope: "Clinical, preclinical, and translational research in Ayurveda and integrative medicine" },
  { name: "Ancient Science of Life", area: "AYUSH General", impactFactor: "0.9", scope: "All AYUSH systems — Ayurveda, Yoga, Unani, Siddha, Homeopathy" },
  { name: "AYU Journal", area: "Ayurveda", impactFactor: "0.7", scope: "Fundamental and applied Ayurveda research" },
  { name: "Indian Journal of Traditional Knowledge", area: "Traditional Medicine", impactFactor: "1.0", scope: "Documentation, validation of traditional knowledge systems" },
  { name: "Journal of Evidence-Based Complementary & Alternative Medicine", area: "CAM Research", impactFactor: "2.6", scope: "Evidence-based research in all complementary medicine" },
  { name: "BMC Complementary Medicine and Therapies", area: "CAM", impactFactor: "3.9", scope: "Interventional trials, systematic reviews in complementary therapies" },
  { name: "Homeopathy (Elsevier)", area: "Homeopathy", impactFactor: "1.5", scope: "Basic research, clinical trials, provings in homeopathy" },
  { name: "International Journal of Yoga", area: "Yoga", impactFactor: "1.2", scope: "Yoga therapy research, clinical trials, reviews" },
  { name: "Journal of Alternative and Complementary Medicine", area: "Integrative Medicine", impactFactor: "2.4", scope: "Clinical trials, reviews in alternative and complementary medicine" },
  { name: "Pharmacognosy Research", area: "Herbal/Pharmacognosy", impactFactor: "1.1", scope: "Phytochemistry, pharmacology of medicinal plants" },
  { name: "Indian Journal of Physiology and Pharmacology", area: "Basic Sciences", impactFactor: "0.4", scope: "Physiology and pharmacology research" },
  { name: "Journal of Clinical and Diagnostic Research", area: "General Clinical", impactFactor: "0.5", scope: "All clinical specialties, case reports accepted" },
];

function JournalFinder() {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = JOURNALS.filter((j) =>
    !searchQuery || j.name.toLowerCase().includes(searchQuery.toLowerCase()) || j.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Search className="h-4 w-4 text-indigo-500" /> Journal Finder
        </CardTitle>
        <CardDescription className="text-xs">Find the right journal for your paper. Filtered for AYUSH and medical research.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search by name or area..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filtered.map((journal) => (
            <div key={journal.name} className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium">{journal.name}</p>
                <Badge variant="secondary" className="text-[10px] shrink-0">IF: {journal.impactFactor}</Badge>
              </div>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline" className="text-[10px]">{journal.area}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{journal.scope}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN WRITER'S STUDIO PAGE
// ════════════════════════════════════════════════════════════

const WriterStudio = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl flex items-center gap-2">
            <PenTool className="h-7 w-7 text-cyan-500" />
            Writer's Studio
          </h1>
          <p className="text-muted-foreground">Publish or perish — we make publishing easier</p>
        </div>
        <Badge variant="outline" className="w-fit gap-1">
          <Award className="h-3 w-3" /> Tools for medical authors
        </Badge>
      </div>

      <Tabs defaultValue="case-report" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="case-report" className="gap-1">
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Case Report</span>
          </TabsTrigger>
          <TabsTrigger value="abstract" className="gap-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Abstract</span>
          </TabsTrigger>
          <TabsTrigger value="citation" className="gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Citation</span>
          </TabsTrigger>
          <TabsTrigger value="journals" className="gap-1">
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Journals</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="case-report">
          <CaseReportBuilder />
        </TabsContent>
        <TabsContent value="abstract">
          <AbstractWriter />
        </TabsContent>
        <TabsContent value="citation">
          <CitationFormatter />
        </TabsContent>
        <TabsContent value="journals">
          <JournalFinder />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WriterStudio;
