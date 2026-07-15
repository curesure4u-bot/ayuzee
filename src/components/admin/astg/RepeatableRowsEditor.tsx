import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";

export type RowFieldDef<T> = {
  key: keyof T & string;
  label: string;
  type?: "text" | "number" | "select" | "boolean";
  options?: { value: string; label: string }[];
  placeholder?: string;
  widthClass?: string; // tailwind col-span classes
};

type Props<T extends Record<string, any>> = {
  rows: T[];
  onChange: (next: T[]) => void;
  fields: RowFieldDef<T>[];
  newRow: () => T;
  title?: string;
  addLabel?: string;
};

export function RepeatableRowsEditor<T extends Record<string, any>>({
  rows, onChange, fields, newRow, title, addLabel,
}: Props<T>) {
  const update = (i: number, key: string, v: any) => {
    const next = rows.slice();
    next[i] = { ...next[i], [key]: v };
    onChange(next);
  };
  const remove = (i: number) => onChange(rows.filter((_, idx) => idx !== i));
  const add = () => onChange([...(rows ?? []), newRow()]);

  return (
    <div className="space-y-3">
      {title && <Label className="text-sm font-medium">{title}</Label>}
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-end border rounded p-2 bg-muted/20">
            {fields.map((f) => {
              const v = row[f.key];
              const width = f.widthClass ?? "col-span-3";
              if (f.type === "select") {
                return (
                  <div key={f.key} className={width}>
                    <Label className="text-xs text-muted-foreground">{f.label}</Label>
                    <select
                      className="w-full border rounded p-2 bg-background text-sm h-10"
                      value={v ?? ""}
                      onChange={(e) => update(i, f.key, e.target.value)}
                    >
                      <option value="">—</option>
                      {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                );
              }
              if (f.type === "boolean") {
                return (
                  <div key={f.key} className={width}>
                    <Label className="text-xs text-muted-foreground">{f.label}</Label>
                    <select
                      className="w-full border rounded p-2 bg-background text-sm h-10"
                      value={v ? "yes" : "no"}
                      onChange={(e) => update(i, f.key, e.target.value === "yes")}
                    >
                      <option value="yes">Recommended (Pathya)</option>
                      <option value="no">Avoid (Apathya)</option>
                    </select>
                  </div>
                );
              }
              return (
                <div key={f.key} className={width}>
                  <Label className="text-xs text-muted-foreground">{f.label}</Label>
                  <Input
                    type={f.type === "number" ? "number" : "text"}
                    value={v ?? ""}
                    onChange={(e) => update(i, f.key, f.type === "number" ? Number(e.target.value) : e.target.value)}
                    placeholder={f.placeholder}
                  />
                </div>
              );
            })}
            <div className="col-span-1 flex justify-end">
              <Button type="button" size="icon" variant="ghost" onClick={() => remove(i)} aria-label="Remove row">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
        {!rows.length && <p className="text-xs text-muted-foreground">No rows yet.</p>}
      </div>
      <Button type="button" size="sm" variant="outline" onClick={add}>
        <Plus className="h-4 w-4 mr-1" />{addLabel ?? "Add row"}
      </Button>
    </div>
  );
}
