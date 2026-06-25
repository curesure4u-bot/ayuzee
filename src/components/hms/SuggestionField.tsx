import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type Suggestion = {
  id: string;
  suggestion_text: string;
  short_code: string | null;
  suggestion_type: string;
  usage_count: number;
};

// Module-level cache so the dropdown opens instantly on every field
const cache = new Map<string, Promise<Suggestion[]>>();

const fetchSuggestions = (type: string) => {
  if (!cache.has(type)) {
    cache.set(
      type,
      supabase
        .from("hms_suggestions" as any)
        .select("id, suggestion_text, short_code, suggestion_type, usage_count")
        .eq("suggestion_type", type)
        .eq("is_active", true)
        .order("usage_count", { ascending: false })
        .limit(500)
        .then(({ data }) => ((data as any) ?? []) as Suggestion[]),
    );
  }
  return cache.get(type)!;
};

export const invalidateSuggestionCache = (type?: string) => {
  if (type) cache.delete(type);
  else cache.clear();
};

type Props = {
  as?: "input" | "textarea";
  type: string; // hms_suggestions.suggestion_type
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  /** Append to existing value (comma-joined) instead of replacing — useful for chips like complaints. */
  appendMode?: boolean;
};

const SuggestionField = ({
  as = "input",
  type,
  value,
  onChange,
  placeholder,
  rows = 2,
  className,
  appendMode = false,
}: Props) => {
  const [pool, setPool] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    fetchSuggestions(type).then((d) => alive && setPool(d));
    return () => { alive = false; };
  }, [type]);

  // Close on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Current "token" being typed = text after last newline/comma
  const token = useMemo(() => {
    const tail = value.split(/[\n,]/).pop() ?? "";
    return tail.trimStart();
  }, [value]);

  const matches = useMemo(() => {
    const q = token.trim().toLowerCase();
    if (!q) return pool.slice(0, 8);
    return pool
      .filter(
        (s) =>
          s.suggestion_text.toLowerCase().includes(q) ||
          (s.short_code || "").toLowerCase().includes(q),
      )
      .slice(0, 10);
  }, [pool, token]);

  const bumpUsage = (id: string) => {
    supabase.rpc("hms_increment_suggestion_usage" as any, { _id: id }).then(() => {
      invalidateSuggestionCache(type);
    });
  };

  const replaceToken = (val: string, s: Suggestion) => {
    // If text contains a final newline or comma, append; else replace from last separator
    const lastSep = Math.max(val.lastIndexOf("\n"), val.lastIndexOf(","));
    const prefix = lastSep >= 0 ? val.slice(0, lastSep + 1) : "";
    if (appendMode) {
      const base = val.trim();
      const sep = base ? (base.endsWith(",") ? " " : ", ") : "";
      return base + sep + s.suggestion_text;
    }
    const leading = prefix && !prefix.endsWith(" ") && !prefix.endsWith("\n") ? prefix + " " : prefix;
    return leading + s.suggestion_text;
  };

  const pick = (s: Suggestion) => {
    onChange(replaceToken(value, s));
    bumpUsage(s.id);
    setOpen(false);
    setActive(0);
  };

  // Expand short_code on space — typing "bkp " replaces with full text
  const maybeExpandShortCode = (next: string) => {
    if (!next.endsWith(" ")) return next;
    const lastTokenMatch = next.match(/(^|[\n,\s])([A-Za-z0-9_-]+)\s$/);
    const code = lastTokenMatch?.[2]?.toLowerCase();
    if (!code) return next;
    const hit = pool.find((s) => (s.short_code || "").toLowerCase() === code);
    if (!hit) return next;
    bumpUsage(hit.id);
    const before = next.slice(0, next.length - (code.length + 1)); // strip code + trailing space
    return before + hit.suggestion_text + " ";
  };

  const handleChange = (raw: string) => {
    const expanded = maybeExpandShortCode(raw);
    onChange(expanded);
    setOpen(true);
    setActive(0);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open || matches.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => (i + 1) % matches.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => (i - 1 + matches.length) % matches.length); }
    else if (e.key === "Enter" && as === "input") { e.preventDefault(); pick(matches[active]); }
    else if (e.key === "Tab") { e.preventDefault(); pick(matches[active]); }
    else if (e.key === "Escape") { setOpen(false); }
  };

  const commonProps = {
    value,
    placeholder,
    className,
    onFocus: () => setOpen(true),
    onChange: (e: any) => handleChange(e.target.value),
    onKeyDown,
  };

  return (
    <div ref={wrapRef} className="relative">
      {as === "textarea" ? (
        <Textarea rows={rows} {...commonProps} />
      ) : (
        <Input {...commonProps} />
      )}
      {open && matches.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-md border border-border bg-popover text-popover-foreground shadow-lg">
          {matches.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); pick(s); }}
              onMouseEnter={() => setActive(i)}
              className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm ${
                i === active ? "bg-accent" : ""
              }`}
            >
              {s.short_code && (
                <Badge variant="outline" className="font-mono text-[10px]">
                  {s.short_code}
                </Badge>
              )}
              <span className="flex-1 truncate">{s.suggestion_text}</span>
              {s.usage_count > 0 && (
                <span className="text-[10px] text-muted-foreground">{s.usage_count}×</span>
              )}
            </button>
          ))}
          <div className="border-t border-border px-3 py-1 text-[10px] text-muted-foreground">
            ↑↓ navigate · Tab/Enter to insert · type a short code + space to expand
          </div>
        </div>
      )}
    </div>
  );
};

export default SuggestionField;
