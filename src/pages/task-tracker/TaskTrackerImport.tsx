import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, Download } from "lucide-react";

type ParsedRow = Record<string, string>;

type Props = {
  onImport: (tasks: any[]) => void;
};

const REQUIRED_FIELDS = ["task_name"];
const OPTIONAL_FIELDS = ["description", "status", "priority", "person_in_charge", "start_date", "due_date", "kanban_category", "importance", "urgency", "progress", "notes"];
const ALL_FIELDS = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS];

/**
 * CSV/Excel Import — upload a spreadsheet, map columns, preview, and bulk create tasks.
 */
const TaskTrackerImport = ({ onImport }: Props) => {
  const [rawData, setRawData] = useState<ParsedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [step, setStep] = useState<"upload" | "map" | "preview" | "done">("upload");
  const fileRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): { headers: string[]; rows: ParsedRow[] } => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return { headers: [], rows: [] };
    const delim = lines[0].includes("\t") ? "\t" : ",";
    const hdrs = lines[0].split(delim).map(h => h.trim().replace(/^"|"$/g, ""));
    const rows = lines.slice(1).map(line => {
      const vals = line.split(delim).map(v => v.trim().replace(/^"|"$/g, ""));
      const row: ParsedRow = {};
      hdrs.forEach((h, i) => { row[h] = vals[i] || ""; });
      return row;
    });
    return { headers: hdrs, rows };
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const { headers: hdrs, rows } = parseCSV(text);
      if (hdrs.length === 0) { toast.error("Could not parse file. Ensure it's CSV or tab-separated."); return; }
      setHeaders(hdrs);
      setRawData(rows);
      // Auto-map matching column names
      const autoMap: Record<string, string> = {};
      ALL_FIELDS.forEach(field => {
        const match = hdrs.find(h => h.toLowerCase().replace(/[^a-z]/g, "") === field.replace(/_/g, ""));
        if (match) autoMap[field] = match;
      });
      setMapping(autoMap);
      setStep("map");
      toast.success(`Parsed ${rows.length} rows with ${hdrs.length} columns`);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!mapping.task_name) { toast.error("Task Name column must be mapped"); return; }
    const tasks = rawData.map(row => ({
      task_name: row[mapping.task_name] || "Untitled",
      description: row[mapping.description] || "",
      status: row[mapping.status] || "To do",
      priority: row[mapping.priority] || "Medium",
      person_in_charge: row[mapping.person_in_charge] || "",
      start_date: row[mapping.start_date] || null,
      due_date: row[mapping.due_date] || null,
      kanban_category: row[mapping.kanban_category] || "Backlog",
      importance: row[mapping.importance] || "Not Important",
      urgency: row[mapping.urgency] || "Not Urgent",
      progress: parseInt(row[mapping.progress]) || 0,
      notes: row[mapping.notes] || "",
      is_completed: false,
      completed_at: null,
      gantt_color: "",
      project_name: "",
      role_context: "general",
    })).filter(t => t.task_name && t.task_name !== "Untitled");

    onImport(tasks);
    setStep("done");
    toast.success(`${tasks.length} tasks imported successfully!`);
  };

  const downloadTemplate = () => {
    const csv = "task_name,description,status,priority,person_in_charge,start_date,due_date,kanban_category,importance,urgency,progress,notes\nBudget review,Compare actuals to plan,To do,High,John,2025-06-01,2025-06-15,To-Do,Important,Urgent,0,Monthly review\nWeekly meeting,Monday sync,In progress,Medium,Self,2025-06-01,2025-06-01,In Progress,Important,Not Urgent,50,";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "task_import_template.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Upload className="h-6 w-6 text-teal-600" /> Import Tasks
        </h1>
        <p className="text-sm text-muted-foreground">Upload a CSV or Excel file to bulk-create tasks</p>
      </div>

      {/* Step 1: Upload */}
      {step === "upload" && (
        <Card className="border-dashed border-2 border-teal-300">
          <CardContent className="py-12 text-center space-y-4">
            <FileSpreadsheet className="h-16 w-16 mx-auto text-teal-400" />
            <div>
              <p className="text-lg font-medium">Drop your CSV file here</p>
              <p className="text-sm text-muted-foreground">Or click to browse. Supports CSV and TSV (tab-separated).</p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => fileRef.current?.click()} className="bg-teal-600 hover:bg-teal-700">
                <Upload className="mr-1 h-4 w-4" /> Choose File
              </Button>
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="mr-1 h-4 w-4" /> Download Template
              </Button>
            </div>
            <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" className="hidden" onChange={handleFile} />
            <p className="text-[10px] text-muted-foreground">
              Columns: task_name (required), description, status, priority, person_in_charge, start_date, due_date, kanban_category, importance, urgency, progress, notes
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Map Columns */}
      {step === "map" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Map Your Columns ({headers.length} detected, {rawData.length} rows)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ALL_FIELDS.map(field => (
                <div key={field}>
                  <label className="text-[10px] font-medium text-muted-foreground capitalize">
                    {field.replace(/_/g, " ")} {REQUIRED_FIELDS.includes(field) && <span className="text-red-500">*</span>}
                  </label>
                  <Select value={mapping[field] || ""} onValueChange={v => setMapping(prev => ({ ...prev, [field]: v }))}>
                    <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Select column..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">— Skip —</SelectItem>
                      {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-3">
              <Button variant="outline" onClick={() => setStep("upload")}>Back</Button>
              <Button onClick={() => setStep("preview")} className="bg-teal-600 hover:bg-teal-700">Preview Import</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Preview */}
      {step === "preview" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Preview ({rawData.length} tasks to import)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[300px]">
              <table className="w-full text-xs">
                <thead className="border-b bg-muted/50 sticky top-0">
                  <tr>
                    <th className="px-2 py-1.5 text-left">#</th>
                    <th className="px-2 py-1.5 text-left">Task Name</th>
                    <th className="px-2 py-1.5 text-left">Priority</th>
                    <th className="px-2 py-1.5 text-left">Person</th>
                    <th className="px-2 py-1.5 text-left">Due Date</th>
                    <th className="px-2 py-1.5 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rawData.slice(0, 20).map((row, i) => (
                    <tr key={i} className="border-b">
                      <td className="px-2 py-1">{i + 1}</td>
                      <td className="px-2 py-1 font-medium">{row[mapping.task_name] || "—"}</td>
                      <td className="px-2 py-1">{row[mapping.priority] || "Medium"}</td>
                      <td className="px-2 py-1">{row[mapping.person_in_charge] || "—"}</td>
                      <td className="px-2 py-1">{row[mapping.due_date] || "—"}</td>
                      <td className="px-2 py-1">{row[mapping.status] || "To do"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t flex gap-2">
              <Button variant="outline" onClick={() => setStep("map")}>Back</Button>
              <Button onClick={handleImport} className="bg-teal-600 hover:bg-teal-700">
                <CheckCircle className="mr-1 h-4 w-4" /> Import {rawData.length} Tasks
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Done */}
      {step === "done" && (
        <Card className="border-green-200 bg-green-50/30">
          <CardContent className="py-12 text-center space-y-3">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
            <p className="text-lg font-bold text-green-700">Import Complete!</p>
            <p className="text-sm text-muted-foreground">{rawData.length} tasks have been added to your Variable Tasks.</p>
            <Button onClick={() => { setStep("upload"); setRawData([]); setHeaders([]); setMapping({}); }}>Import More</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TaskTrackerImport;
