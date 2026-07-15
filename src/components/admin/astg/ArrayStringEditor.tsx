import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus, AlertTriangle } from "lucide-react";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  /** Show a red-flag warning strip — used for the bypass-AI-interpretation triggers list. */
  redFlag?: boolean;
};

export function ArrayStringEditor({ value, onChange, placeholder, redFlag }: Props) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...(value ?? []), v]);
    setDraft("");
  };
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      {redFlag && (
        <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/5 border border-destructive/30 rounded p-2">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
          These entries bypass AI interpretation and trigger clinician review platform-wide.
        </div>
      )}
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder ?? "Add item and press Enter"}
        />
        <Button type="button" size="sm" onClick={add}><Plus className="h-4 w-4" /></Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {(value ?? []).map((v, i) => (
          <Badge key={i} variant={redFlag ? "destructive" : "secondary"} className="gap-1">
            {v}
            <button type="button" onClick={() => remove(i)} aria-label={`Remove ${v}`}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {!value?.length && <span className="text-xs text-muted-foreground">No entries yet.</span>}
      </div>
    </div>
  );
}
