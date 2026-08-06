import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Bot, Zap, Code, Terminal, Play, CheckCircle, Clock,
  Globe, Users, Calendar, Pill, FlaskConical, Heart,
  Activity, Search, Copy
} from "lucide-react";
import { ayuzeeMcpTools, executeMcpTool, type McpToolResult } from "@/services/mcpServerService";

const categoryIcons: Record<string, typeof Users> = {
  patient_management: Users,
  appointments: Calendar,
  prescriptions: Pill,
  formulary: Pill,
  medications: Pill,
  vitals: Heart,
  lab: FlaskConical,
  abdm: Globe,
  clinic: Activity,
};

const HmsMcpServer = () => {
  const [selectedTool, setSelectedTool] = useState(ayuzeeMcpTools[0].name);
  const [testInput, setTestInput] = useState('{"query": "Rajesh"}');
  const [testResult, setTestResult] = useState<McpToolResult | null>(null);
  const [testing, setTesting] = useState(false);

  const currentTool = ayuzeeMcpTools.find(t => t.name === selectedTool);

  const handleTest = async () => {
    setTesting(true);
    try {
      const params = JSON.parse(testInput);
      const result = await executeMcpTool(selectedTool, params);
      setTestResult(result);
      toast.success(`Tool executed in ${result.execution_time_ms}ms`);
    } catch (e) {
      toast.error("Invalid JSON input");
    }
    setTesting(false);
  };

  const handleCopyConfig = () => {
    const config = JSON.stringify({
      mcpServers: {
        "ayuzee-health": {
          url: "https://mcp.ayuzee.com/v1",
          apiKey: "ayu_live_YOUR_KEY_HERE",
          tools: ayuzeeMcpTools.map(t => t.name),
        }
      }
    }, null, 2);
    navigator.clipboard.writeText(config);
    toast.success("MCP config copied! Add to your AI client settings.");
  };

  const categories = [...new Set(ayuzeeMcpTools.map(t => t.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" /> MCP Server (AI Agent Protocol)
          </h1>
          <p className="text-sm text-muted-foreground">
            Model Context Protocol — Let AI assistants manage your EMR via structured tools
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => window.location.href = "/hms/open-api"}>REST API</Button>
          <Button size="sm" variant="outline" onClick={handleCopyConfig}><Copy className="mr-1 h-4 w-4" /> Copy MCP Config</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-primary">{ayuzeeMcpTools.length}</p><p className="text-xs text-muted-foreground">Tools Available</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-green-600">{categories.length}</p><p className="text-xs text-muted-foreground">Categories</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-blue-600">1.2K</p><p className="text-xs text-muted-foreground">Invocations Today</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-purple-600">145ms</p><p className="text-xs text-muted-foreground">Avg Latency</p></CardContent></Card>
      </div>

      {/* How it works */}
      <Card className="bg-gradient-to-r from-primary/5 to-purple-50/50 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-sm">What is MCP?</p>
              <p className="text-xs text-muted-foreground mt-1">
                Model Context Protocol (MCP) is an open standard that lets AI assistants like Claude, ChatGPT, or custom agents
                connect directly to your EMR data. Instead of copy-pasting patient info, just ask your AI and it handles booking,
                lookups, prescriptions end-to-end. Ayuzee exposes {ayuzeeMcpTools.length} tools across patients, appointments,
                AYUSH formulary, vitals, lab, and ABDM.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tools" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tools">Available Tools ({ayuzeeMcpTools.length})</TabsTrigger>
          <TabsTrigger value="playground">Playground</TabsTrigger>
          <TabsTrigger value="setup">Setup Guide</TabsTrigger>
        </TabsList>

        {/* Tools List */}
        <TabsContent value="tools">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {categories.map(cat => (
              <Card key={cat}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 capitalize">
                    {(() => { const Icon = categoryIcons[cat] || Code; return <Icon className="h-4 w-4 text-primary" />; })()}
                    {cat.replace("_", " ")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  {ayuzeeMcpTools.filter(t => t.category === cat).map(tool => (
                    <div key={tool.name} className="flex items-center justify-between rounded border px-2.5 py-1.5 hover:bg-muted/30 cursor-pointer text-xs"
                      onClick={() => { setSelectedTool(tool.name); }}>
                      <div>
                        <code className="font-mono font-medium text-primary">{tool.name}</code>
                        <p className="text-muted-foreground mt-0.5">{tool.description}</p>
                      </div>
                      <Play className="h-3 w-3 text-muted-foreground shrink-0" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Playground */}
        <TabsContent value="playground">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Terminal className="h-4 w-4" /> Tool Playground</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium">Select Tool</label>
                    <select className="w-full mt-1 rounded border px-3 py-2 text-sm" value={selectedTool} onChange={(e) => setSelectedTool(e.target.value)}>
                      {ayuzeeMcpTools.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                    </select>
                  </div>
                  {currentTool && (
                    <div className="bg-muted/50 rounded p-3 text-xs">
                      <p className="font-medium">{currentTool.description}</p>
                      <p className="text-muted-foreground mt-1">Category: {currentTool.category}</p>
                      <p className="text-muted-foreground">Schema: {JSON.stringify(currentTool.inputSchema.properties)}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-medium">Input Parameters (JSON)</label>
                    <textarea className="w-full mt-1 rounded border px-3 py-2 text-xs font-mono h-28" value={testInput} onChange={(e) => setTestInput(e.target.value)} />
                  </div>
                  <Button onClick={handleTest} disabled={testing} className="w-full">
                    <Play className="mr-1 h-4 w-4" /> {testing ? "Executing..." : "Execute Tool"}
                  </Button>
                </div>
                <div>
                  <label className="text-xs font-medium">Result</label>
                  <pre className="mt-1 bg-muted rounded p-3 text-xs font-mono h-64 overflow-auto whitespace-pre-wrap">
                    {testResult ? JSON.stringify(testResult, null, 2) : "// Execute a tool to see the result here"}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Setup Guide */}
        <TabsContent value="setup">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Connect Your AI Assistant to Ayuzee MCP</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">1. Add to Claude Desktop (claude_desktop_config.json)</p>
                <pre className="bg-muted rounded p-3 text-xs font-mono overflow-x-auto">
{`{
  "mcpServers": {
    "ayuzee-health": {
      "url": "https://mcp.ayuzee.com/v1",
      "headers": {
        "Authorization": "Bearer ayu_live_YOUR_KEY"
      }
    }
  }
}`}
                </pre>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">2. Add to Kiro IDE (.kiro/settings/mcp.json)</p>
                <pre className="bg-muted rounded p-3 text-xs font-mono overflow-x-auto">
{`{
  "mcpServers": {
    "ayuzee-health": {
      "command": "npx",
      "args": ["@ayuzee/mcp-server@latest"],
      "env": {
        "AYUZEE_API_KEY": "ayu_live_YOUR_KEY"
      }
    }
  }
}`}
                </pre>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">3. Use via any MCP-compatible client</p>
                <pre className="bg-muted rounded p-3 text-xs font-mono overflow-x-auto">
{`// Example: Ask your AI assistant naturally
"Book an appointment for Rajesh Kumar with Dr. Saleem tomorrow at 10 AM"

// The AI will automatically call:
// 1. search_patients({query: "Rajesh Kumar"})
// 2. get_available_slots({doctor_id: "doc_saleem", date: "2026-07-31"})
// 3. book_appointment({patient_id: "pat_001", doctor_id: "doc_saleem", slot_time: "10:00"})
// All without you touching the HMS UI!`}
                </pre>
              </div>
              <div className="bg-green-50 border border-green-200 rounded p-3 text-xs text-green-800">
                <p className="font-medium">Supported AI Clients</p>
                <p className="mt-1">Claude Desktop, Kiro IDE, ChatGPT (with plugin), Custom agents via MCP SDK, any MCP-compatible application</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsMcpServer;
