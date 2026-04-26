import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { homeoTokens as t } from "./lib/ui";
import { toast } from "sonner";

const NewPatient = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "", age: "", gender: "", occupation: "", phone: "", email: "",
    chief_complaint: "", chronicity: "acute", address: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim()) return toast.error("Patient name is required");
    setSaving(true);
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) { setSaving(false); return toast.error("Not signed in"); }
    const { data, error } = await supabase.from("homeo_patients").insert({
      doctor_user_id: uid,
      full_name: form.full_name.trim(),
      age: form.age ? Number(form.age) : null,
      gender: form.gender || null,
      occupation: form.occupation || null,
      phone: form.phone || null,
      email: form.email || null,
      address: form.address || null,
      chief_complaint: form.chief_complaint || null,
      chronicity: form.chronicity,
    }).select("id").single();
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Patient created");
    navigate(`/homeo/case-taking?patient=${data.id}`);
  };

  const field = (label: string, k: string, type = "text", el: "input" | "textarea" | "select" = "input", options?: string[]) => (
    <div>
      <label className={t.label}>{label}</label>
      {el === "textarea" ? (
        <textarea className={`${t.input} min-h-[90px] mt-1`} value={(form as any)[k]} onChange={(e) => set(k, e.target.value)} />
      ) : el === "select" ? (
        <select className={`${t.input} mt-1`} value={(form as any)[k]} onChange={(e) => set(k, e.target.value)}>
          <option value="">—</option>
          {options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} className={`${t.input} mt-1`} value={(form as any)[k]} onChange={(e) => set(k, e.target.value)} />
      )}
    </div>
  );

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6">
      <div>
        <p className={t.label}>Step 1 of 2</p>
        <h2 className="font-display text-2xl font-semibold text-[hsl(45_85%_78%)]">New Patient</h2>
        <p className={`mt-1 text-sm ${t.mutedText}`}>Demographics and chief complaint. Full case taking comes next.</p>
      </div>
      <div className={`${t.card} p-6 grid gap-4 md:grid-cols-2`}>
        {field("Full name", "full_name")}
        {field("Age", "age", "number")}
        {field("Gender", "gender", "text", "select", ["male", "female", "other"])}
        {field("Occupation", "occupation")}
        {field("Phone", "phone")}
        {field("Email", "email", "email")}
        <div className="md:col-span-2">{field("Address", "address", "text", "textarea")}</div>
        <div className="md:col-span-2">{field("Chief complaint", "chief_complaint", "text", "textarea")}</div>
        {field("Chronicity", "chronicity", "text", "select", ["acute", "sub-acute", "chronic", "recurrent"])}
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className={t.primaryBtn}>{saving ? "Saving…" : "Save & start case taking →"}</button>
        <button type="button" onClick={() => navigate("/homeo")} className={t.ghostBtn}>Cancel</button>
      </div>
    </form>
  );
};

export default NewPatient;
