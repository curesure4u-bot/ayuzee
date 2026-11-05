// Job Fraud Detection — Supabase Edge Function
// Automatically called when a new job is posted (via database webhook/trigger).
// Analyzes the job listing for fraud signals and flags suspicious ones.
//
// Can be invoked:
//   1. Via database webhook on INSERT to job_listings
//   2. Manually by admin from the admin panel
//   3. Via pg_net from a trigger

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-internal-secret",
};

type FraudSignal = {
  signal: string;
  severity: "low" | "medium" | "high";
  details: string;
};

type JobPayload = {
  id: string;
  organization_name: string;
  job_title: string;
  description: string | null;
  requirements: string | null;
  salary_min: number | null;
  salary_max: number | null;
  apply_email: string | null;
  apply_url: string | null;
  is_direct_employer: boolean | null;
  poster_type: string | null;
  experience_years_min: number | null;
  location_city: string | null;
  location_state: string | null;
};

/* ─── Rule-based fraud detection ─── */
function detectFraud(job: JobPayload): FraudSignal[] {
  const signals: FraudSignal[] = [];

  // 1. Unrealistically high salary for AYUSH roles
  if (job.salary_max && job.salary_max > 500000) {
    signals.push({
      signal: "unrealistic_salary",
      severity: "high",
      details: `Salary max ₹${job.salary_max.toLocaleString()} is unusually high for AYUSH roles`,
    });
  }

  // 2. No organization name or generic name
  if (!job.organization_name || job.organization_name.length < 3) {
    signals.push({
      signal: "missing_org_name",
      severity: "high",
      details: "Organization name is missing or too short",
    });
  }

  const genericNames = ["xyz", "abc", "test", "company", "hospital", "clinic"];
  if (genericNames.some((g) => job.organization_name.toLowerCase().trim() === g)) {
    signals.push({
      signal: "generic_org_name",
      severity: "medium",
      details: `Organization name "${job.organization_name}" appears generic`,
    });
  }

  // 3. Suspicious email domains
  if (job.apply_email) {
    const suspiciousDomains = ["tempmail.com", "guerrillamail.com", "throwaway.email", "yopmail.com", "mailinator.com"];
    const domain = job.apply_email.split("@")[1]?.toLowerCase();
    if (domain && suspiciousDomains.some((d) => domain.includes(d))) {
      signals.push({
        signal: "suspicious_email",
        severity: "high",
        details: `Email domain "${domain}" is a known disposable email service`,
      });
    }
  }

  // 4. Suspicious URLs
  if (job.apply_url) {
    const url = job.apply_url.toLowerCase();
    if (url.includes("bit.ly") || url.includes("tinyurl") || url.includes("t.co") || url.includes("goo.gl")) {
      signals.push({
        signal: "shortened_url",
        severity: "medium",
        details: "Apply URL uses a URL shortener which could mask the destination",
      });
    }
    if (!url.startsWith("https://")) {
      signals.push({
        signal: "insecure_url",
        severity: "low",
        details: "Apply URL is not HTTPS",
      });
    }
  }

  // 5. No description or very short description
  if (!job.description || job.description.trim().length < 30) {
    signals.push({
      signal: "missing_description",
      severity: "medium",
      details: "Job description is missing or too brief (less than 30 characters)",
    });
  }

  // 6. Excessive salary range (suspiciously wide)
  if (job.salary_min && job.salary_max && job.salary_max > job.salary_min * 10) {
    signals.push({
      signal: "wide_salary_range",
      severity: "low",
      details: `Salary range is very wide: ₹${job.salary_min.toLocaleString()} - ₹${job.salary_max.toLocaleString()}`,
    });
  }

  // 7. Freshers with high salary
  if (job.experience_years_min === 0 && job.salary_min && job.salary_min > 100000) {
    signals.push({
      signal: "fresher_high_salary",
      severity: "medium",
      details: `₹${job.salary_min.toLocaleString()}+ for 0 experience seems unusual for AYUSH roles`,
    });
  }

  // 8. Spam keywords in title/description
  const spamKeywords = ["earn from home", "no investment", "guaranteed income", "mlm", "network marketing", "part time earning", "work from mobile"];
  const textToCheck = [job.job_title, job.description, job.requirements].filter(Boolean).join(" ").toLowerCase();
  const foundSpam = spamKeywords.filter((kw) => textToCheck.includes(kw));
  if (foundSpam.length > 0) {
    signals.push({
      signal: "spam_keywords",
      severity: "high",
      details: `Contains suspicious keywords: ${foundSpam.join(", ")}`,
    });
  }

  // 9. No location specified (vague posting)
  if (!job.location_city && !job.location_state) {
    signals.push({
      signal: "no_location",
      severity: "low",
      details: "No city or state specified — could be vague or generic",
    });
  }

  // 10. Agency posting with no apply details
  if (job.is_direct_employer === false && !job.apply_email && !job.apply_url) {
    signals.push({
      signal: "agency_no_contact",
      severity: "medium",
      details: "Agency posting with no application email or URL",
    });
  }

  return signals;
}

function calculateRiskScore(signals: FraudSignal[]): number {
  let score = 0;
  for (const s of signals) {
    if (s.severity === "high") score += 30;
    else if (s.severity === "medium") score += 15;
    else score += 5;
  }
  return Math.min(100, score);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Support both direct payload and webhook format (record in body)
    const job: JobPayload = body.record || body;

    if (!job.id) {
      return new Response(JSON.stringify({ error: "Missing job id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Run fraud detection
    const signals = detectFraud(job);
    const riskScore = calculateRiskScore(signals);
    const isFlagged = riskScore >= 30;

    // If flagged, update the job listing in the database
    if (isFlagged) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Add fraud flag data (we can store in ai_match_tags or a separate field)
      await supabase
        .from("job_listings")
        .update({
          ai_match_tags: signals.map((s) => `fraud:${s.signal}`),
          // Keep is_approved false if risk is high
          ...(riskScore >= 60 ? { is_active: false } : {}),
        })
        .eq("id", job.id);

      // Optionally notify admin
      await supabase.from("notifications" as any).insert({
        user_id: null, // system notification
        type: "fraud_alert",
        title: `🚨 Suspicious job posting flagged (Risk: ${riskScore}%)`,
        body: `"${job.job_title}" by ${job.organization_name} — ${signals.length} signals detected`,
        data: { job_id: job.id, risk_score: riskScore, signals },
        is_read: false,
      }).maybeSingle();
    }

    return new Response(
      JSON.stringify({
        job_id: job.id,
        risk_score: riskScore,
        is_flagged: isFlagged,
        signals,
        action: riskScore >= 60 ? "auto_rejected" : riskScore >= 30 ? "flagged_for_review" : "passed",
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
