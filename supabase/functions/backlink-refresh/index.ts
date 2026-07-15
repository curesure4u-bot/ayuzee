// Backlink refresh — pulls ayuzee.com backlinks from Semrush, upserts into seo_backlinks,
// marks vanished links as 'lost', and writes a daily snapshot.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const TARGET = "ayuzee.com";
const TARGET_TYPE = "root_domain";
const MAX_ROWS = 5000;
const PAGE_SIZE = 500;

const GATEWAY = "https://connector-gateway.lovable.dev/semrush";

function gatewayHeaders() {
  const lov = Deno.env.get("LOVABLE_API_KEY");
  const sem = Deno.env.get("SEMRUSH_API_KEY");
  if (!lov || !sem) {
    const missing = [!lov && "LOVABLE_API_KEY", !sem && "SEMRUSH_API_KEY"].filter(Boolean).join(", ");
    const err = new Error(`Missing required secret(s): ${missing}`);
    (err as Error & { httpStatus?: number }).httpStatus = 500;
    throw err;
  }
  return {
    Authorization: `Bearer ${lov}`,
    "X-Connection-Api-Key": sem,
    "Allow-Limit-Offset": "true",
  };
}

interface SemrushRow { [k: string]: string }

async function semrushCall(path: string, params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  const url = `${GATEWAY}${path}?${qs}`;
  const res = await fetch(url, { headers: gatewayHeaders() });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Semrush ${path} ${res.status}: ${text.slice(0, 300)}`);
  }
  let json: { data?: { columnNames?: string[]; rows?: string[][] }; error?: string };
  try { json = JSON.parse(text); } catch { throw new Error(`Semrush ${path} bad JSON: ${text.slice(0, 200)}`); }
  if (json.error) throw new Error(`Semrush ${path}: ${json.error}`);
  const cols = json.data?.columnNames ?? [];
  const rows = json.data?.rows ?? [];
  return rows.map((r) => {
    const o: SemrushRow = {};
    cols.forEach((c, i) => { o[c] = r[i]; });
    return o;
  });
}

function toInt(v: string | undefined): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : null;
}
function toTs(v: string | undefined): string | null {
  if (!v) return null;
  // Semrush returns YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss±00
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
function domainOf(u: string): string | null {
  try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return null; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Admin gate
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userRes } = await userClient.auth.getUser();
    if (!userRes?.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { data: isAdmin } = await userClient.rpc("is_admin_or_super", { _user_id: userRes.user.id });
    if (!isAdmin) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Admin DB client
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1) Overview totals
    const overview = await semrushCall("/backlinks/backlinks_overview", {
      target: TARGET,
      target_type: TARGET_TYPE,
    });
    const ov = overview[0] ?? {};
    const total = toInt(ov.total) ?? 0;
    const refDomains = toInt(ov.domains_num) ?? 0;
    const ascore = toInt(ov.ascore);

    // 2) Pull full backlink list, paginated
    const cols = "source_url,source_title,target_url,anchor,page_ascore,first_seen,last_seen,nofollow";
    const all: SemrushRow[] = [];
    for (let offset = 0; offset < MAX_ROWS; offset += PAGE_SIZE) {
      const page = await semrushCall("/backlinks/backlinks", {
        target: TARGET,
        target_type: TARGET_TYPE,
        export_columns: cols,
        display_limit: String(PAGE_SIZE),
        display_offset: String(offset),
      });
      all.push(...page);
      if (page.length < PAGE_SIZE) break;
    }

    // 3) Snapshot of seen source URLs for this run
    const seenUrls = new Set<string>();
    let followCount = 0;
    let nofollowCount = 0;
    const rowsToUpsert = all
      .filter((r) => r.source_url)
      .map((r) => {
        const url = r.source_url;
        seenUrls.add(url);
        const nofollow = String(r.nofollow ?? "").toLowerCase() === "true" || r.nofollow === "1";
        if (nofollow) nofollowCount++; else followCount++;
        return {
          target_domain: TARGET,
          source_url: url,
          source_domain: domainOf(url),
          source_title: r.source_title || null,
          target_url: r.target_url || null,
          anchor: r.anchor || null,
          page_ascore: toInt(r.page_ascore),
          is_nofollow: nofollow,
          first_seen_at: toTs(r.first_seen),
          last_seen_at: toTs(r.last_seen),
          status: "active",
          lost_at: null,
        };
      });

    // Upsert in batches
    let newCount = 0;
    for (let i = 0; i < rowsToUpsert.length; i += 500) {
      const batch = rowsToUpsert.slice(i, i + 500);
      // Count "new" by checking what doesn't exist yet
      const urls = batch.map((b) => b.source_url);
      const { data: existing } = await admin
        .from("seo_backlinks")
        .select("source_url")
        .eq("target_domain", TARGET)
        .in("source_url", urls);
      const existingSet = new Set((existing ?? []).map((e: { source_url: string }) => e.source_url));
      newCount += batch.filter((b) => !existingSet.has(b.source_url)).length;

      const { error } = await admin
        .from("seo_backlinks")
        .upsert(batch, { onConflict: "target_domain,source_url" });
      if (error) throw new Error(`upsert: ${error.message}`);
    }

    // 4) Mark links as lost when not seen this run (only those currently active)
    let lostCount = 0;
    if (seenUrls.size > 0) {
      // Fetch currently active in chunks; mark missing as lost
      const { data: activeRows, error: actErr } = await admin
        .from("seo_backlinks")
        .select("id, source_url")
        .eq("target_domain", TARGET)
        .eq("status", "active");
      if (actErr) throw new Error(`active query: ${actErr.message}`);

      const toLose = (activeRows ?? [])
        .filter((r: { source_url: string }) => !seenUrls.has(r.source_url))
        .map((r: { id: string }) => r.id);

      for (let i = 0; i < toLose.length; i += 500) {
        const batch = toLose.slice(i, i + 500);
        const { error } = await admin
          .from("seo_backlinks")
          .update({ status: "lost", lost_at: new Date().toISOString() })
          .in("id", batch);
        if (error) throw new Error(`mark lost: ${error.message}`);
        lostCount += batch.length;
      }
    }

    // 5) Daily snapshot (upsert today's row)
    const today = new Date().toISOString().slice(0, 10);
    const { error: snapErr } = await admin
      .from("seo_backlink_snapshots")
      .upsert({
        target_domain: TARGET,
        snapshot_date: today,
        total_backlinks: total,
        referring_domains: refDomains,
        follow_count: followCount,
        nofollow_count: nofollowCount,
        new_count: newCount,
        lost_count: lostCount,
        authority_score: ascore,
      }, { onConflict: "target_domain,snapshot_date" });
    if (snapErr) throw new Error(`snapshot: ${snapErr.message}`);

    return new Response(JSON.stringify({
      ok: true,
      target: TARGET,
      pulled: all.length,
      new: newCount,
      lost: lostCount,
      total,
      referring_domains: refDomains,
      authority_score: ascore,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("backlink-refresh error", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
