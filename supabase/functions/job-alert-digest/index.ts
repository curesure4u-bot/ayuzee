// Job Alert Email Digest — Supabase Edge Function
// Runs on a schedule (daily / weekly) to send matching job notifications.
// Trigger: Call via pg_cron or external scheduler with x-internal-secret header.
//
// Query params:
//   ?frequency=daily   (send to users with daily alerts)
//   ?frequency=weekly  (send to users with weekly alerts)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-internal-secret",
};

type JobAlert = {
  id: string;
  user_id: string;
  name: string;
  filters: {
    specialization?: string;
    department?: string;
    state?: string;
    job_type?: string;
    keywords?: string;
    is_government?: boolean;
  };
  frequency: string;
  last_sent_at: string | null;
};

type JobListing = {
  id: string;
  job_title: string;
  organization_name: string;
  department: string | null;
  specialization: string | null;
  location_state: string | null;
  location_city: string | null;
  job_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  is_government: boolean | null;
  created_at: string;
};

function jobMatchesFilters(job: JobListing, filters: JobAlert["filters"]): boolean {
  if (filters.department && job.department) {
    if (!job.department.toLowerCase().includes(filters.department.toLowerCase())) return false;
  } else if (filters.department && !job.department) {
    return false;
  }

  if (filters.specialization && job.specialization) {
    if (!job.specialization.toLowerCase().includes(filters.specialization.toLowerCase())) return false;
  } else if (filters.specialization && !job.specialization) {
    return false;
  }

  if (filters.state && job.location_state) {
    if (job.location_state.toLowerCase() !== filters.state.toLowerCase()) return false;
  } else if (filters.state && !job.location_state) {
    return false;
  }

  if (filters.job_type && job.job_type !== filters.job_type) return false;

  if (filters.is_government && !job.is_government) return false;

  if (filters.keywords) {
    const kw = filters.keywords.toLowerCase();
    const haystack = [job.job_title, job.organization_name, job.department, job.specialization]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(kw)) return false;
  }

  return true;
}

function buildEmailHtml(alertName: string, jobs: JobListing[]): string {
  const jobRows = jobs
    .map(
      (job) => `
      <tr>
        <td style="padding:12px 8px;border-bottom:1px solid #e5e7eb;">
          <strong style="color:#1a1a1a;font-size:15px;">${job.job_title}</strong><br/>
          <span style="color:#6b7280;font-size:13px;">${job.organization_name}</span>
          ${job.department ? `<br/><span style="color:#059669;font-size:12px;">${job.department}</span>` : ""}
          <br/>
          <span style="color:#9ca3af;font-size:12px;">
            ${[job.location_city, job.location_state].filter(Boolean).join(", ") || "India"}
            ${job.salary_min ? ` · ₹${(job.salary_min / 1000).toFixed(0)}k+` : ""}
          </span>
        </td>
        <td style="padding:12px 8px;border-bottom:1px solid #e5e7eb;text-align:right;vertical-align:middle;">
          <a href="https://ayuzee.com/jobs#job-${job.id}" style="background:#1a8d5f;color:#fff;padding:8px 16px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:600;">View</a>
        </td>
      </tr>`
    )
    .join("");

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#1a8d5f;font-size:24px;margin:0;">🌿 Ayuzee Job Alert</h1>
        <p style="color:#6b7280;font-size:14px;margin:8px 0 0;">${alertName}</p>
      </div>
      <p style="color:#374151;font-size:14px;">We found <strong>${jobs.length} new AYUSH job${jobs.length > 1 ? "s" : ""}</strong> matching your alert:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        ${jobRows}
      </table>
      <div style="text-align:center;margin-top:24px;">
        <a href="https://ayuzee.com/jobs" style="background:#1a8d5f;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">Browse All AYUSH Jobs</a>
      </div>
      <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;text-align:center;">
        <p style="color:#9ca3af;font-size:12px;margin:0;">
          You're receiving this because you set up a job alert on Ayuzee.<br/>
          <a href="https://ayuzee.com/jobs/alerts" style="color:#1a8d5f;">Manage your alerts</a>
        </p>
      </div>
    </div>
  `;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify internal secret or service role
    const internalSecret = Deno.env.get("INTERNAL_WEBHOOK_SECRET");
    const providedSecret = req.headers.get("x-internal-secret");
    const authHeader = req.headers.get("Authorization");

    // Allow either internal secret or service_role key
    const isServiceRole = authHeader?.includes(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "NONE");
    if (!isServiceRole && (!internalSecret || providedSecret !== internalSecret)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse frequency from query params
    const url = new URL(req.url);
    const frequency = url.searchParams.get("frequency") || "daily";

    if (!["daily", "weekly", "instant"].includes(frequency)) {
      return new Response(JSON.stringify({ error: "Invalid frequency. Use: daily, weekly, instant" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch active alerts for this frequency
    const { data: alerts, error: alertsError } = await supabase
      .from("job_alerts")
      .select("*")
      .eq("is_active", true)
      .eq("frequency", frequency);

    if (alertsError) throw alertsError;
    if (!alerts || alerts.length === 0) {
      return new Response(JSON.stringify({ message: "No active alerts for this frequency", sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Determine the time window for "new" jobs
    const now = new Date();
    let since: Date;
    if (frequency === "instant") {
      since = new Date(now.getTime() - 60 * 60 * 1000); // last 1 hour
    } else if (frequency === "daily") {
      since = new Date(now.getTime() - 24 * 60 * 60 * 1000); // last 24h
    } else {
      since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // last 7 days
    }

    // 3. Fetch recently posted jobs
    const { data: recentJobs, error: jobsError } = await supabase
      .from("job_listings")
      .select("id, job_title, organization_name, department, specialization, location_state, location_city, job_type, salary_min, salary_max, is_government, created_at")
      .eq("is_active", true)
      .eq("is_approved", true)
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false });

    if (jobsError) throw jobsError;
    if (!recentJobs || recentJobs.length === 0) {
      return new Response(JSON.stringify({ message: "No new jobs in this period", sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. For each alert, find matching jobs and queue email
    let sentCount = 0;
    const errors: string[] = [];

    for (const alert of alerts as JobAlert[]) {
      const matchingJobs = recentJobs.filter((job) => jobMatchesFilters(job as JobListing, alert.filters));

      if (matchingJobs.length === 0) continue;

      // Get user email
      const { data: userData } = await supabase.auth.admin.getUserById(alert.user_id);
      if (!userData?.user?.email) continue;

      const email = userData.user.email;
      const html = buildEmailHtml(alert.name, matchingJobs as JobListing[]);
      const subject = `${matchingJobs.length} new AYUSH job${matchingJobs.length > 1 ? "s" : ""} for "${alert.name}" — Ayuzee`;

      // Queue the email via pgmq (same pattern as process-email-queue)
      const { error: queueError } = await supabase.rpc("send_email_message" as any, {
        message: {
          to: email,
          from: "Ayuzee Jobs <jobs@ayuzee.com>",
          subject,
          html,
          text: `${matchingJobs.length} new AYUSH jobs matching "${alert.name}". View at https://ayuzee.com/jobs/alerts`,
          purpose: "job_alert_digest",
          label: `job_alert_${frequency}`,
        },
      });

      // Fallback: if the RPC doesn't exist, try direct insert to email queue
      if (queueError) {
        // Try alternative: insert into a notifications or email table
        const { error: insertError } = await supabase
          .from("notifications" as any)
          .insert({
            user_id: alert.user_id,
            type: "job_alert",
            title: subject,
            body: `${matchingJobs.length} new jobs match your "${alert.name}" alert`,
            data: { alert_id: alert.id, job_count: matchingJobs.length, frequency },
            is_read: false,
          });

        if (insertError) {
          errors.push(`Alert ${alert.id}: ${insertError.message}`);
          continue;
        }
      }

      // Update alert metadata
      await supabase
        .from("job_alerts")
        .update({
          last_sent_at: now.toISOString(),
          matched_count: matchingJobs.length,
        })
        .eq("id", alert.id);

      sentCount++;
    }

    return new Response(
      JSON.stringify({
        message: `Job alert digest processed`,
        frequency,
        total_alerts: alerts.length,
        sent: sentCount,
        recent_jobs: recentJobs.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
