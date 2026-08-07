import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText, Search, Copy, Edit, Plus, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuickTemplates } from "@/hooks/useQuickTemplates";

export default function QuickTemplatesPage() {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { templates, loading, error, applyTemplate, duplicateTemplate } = useQuickTemplates(search);

  const handleApply = async (id: string, name: string) => {
    await applyTemplate(id);
    toast.success(`Template "${name}" applied to current consultation.`);
  };

  const handleDuplicate = async (id: string, name: string) => {
    const success = await duplicateTemplate(id);
    if (success) {
      toast.success(`Template "${name}" duplicated. You can now edit the copy.`);
    } else {
      toast.error("Failed to duplicate template.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quick Templates & Macros</h1>
          <p className="text-muted-foreground">One-click auto-fill for common consultation patterns</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" />New Template</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search templates by condition..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading templates...</span>
        </div>
      )}

      {error && !loading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-3 text-xs text-amber-700">
            ⚠ Could not load live data (showing cached/demo). {error}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {templates.map((t) => (
          <Card key={t.id} className="cursor-pointer" onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" />{t.name}</CardTitle>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Badge variant="outline">Used {t.usageCount}x</Badge>
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => handleDuplicate(t.id, t.name)}>
                    <Copy className="h-3 w-3" />Duplicate
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1"><Edit className="h-3 w-3" />Edit</Button>
                  <Button size="sm" className="gap-1" onClick={() => handleApply(t.id, t.name)}>
                    <Check className="h-3 w-3" />Apply
                  </Button>
                </div>
              </div>
            </CardHeader>
            {expandedId === t.id && (
              <CardContent className="space-y-3 border-t pt-3">
                <div><span className="text-xs font-medium uppercase text-muted-foreground">Chief Complaints</span><p className="text-sm mt-1">{t.chiefComplaints}</p></div>
                <div><span className="text-xs font-medium uppercase text-muted-foreground">Examination Findings</span><p className="text-sm mt-1">{t.examination}</p></div>
                <div><span className="text-xs font-medium uppercase text-muted-foreground">Prescription</span><pre className="text-sm mt-1 whitespace-pre-wrap font-sans">{t.prescription}</pre></div>
                <div><span className="text-xs font-medium uppercase text-muted-foreground">Diet Chart</span><p className="text-sm mt-1">{t.diet}</p></div>
                <div><span className="text-xs font-medium uppercase text-muted-foreground">Yoga Prescription</span><p className="text-sm mt-1">{t.yoga}</p></div>
                {t.lifestyle && <div><span className="text-xs font-medium uppercase text-muted-foreground">Lifestyle</span><p className="text-sm mt-1">{t.lifestyle}</p></div>}
                {t.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {t.tags.map((tag) => <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>)}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
