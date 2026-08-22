import { BarChart3 } from "lucide-react";
import { GuideLayout, StepCard, TipBox, KeyboardShortcuts } from "./GuideLayout";

const MisAnalyticsGuide = () => {
  return (
    <GuideLayout
      title="MIS & Analytics Playbook"
      subtitle="How to read reports, set up scheduled alerts, use AI queries, and configure branch comparisons"
      icon={BarChart3}
      color="bg-sky-500/10 text-sky-600"
      estimatedTime="18 min"
      roles={["Admin", "Hospital Manager", "Accounts Head"]}
    >
      {/* Section 1 */}
      <h2>1. MIS Module Navigation</h2>
      <StepCard number={1} title="Access MIS">
        <ul>
          <li>From HMS sidebar, navigate to <strong>MIS</strong> (<code>/hms/mis</code>).</li>
          <li>Sub-modules: Main Dashboard, AI Insights, Filters, Collection, Accounts, Test Orders, Stocks, Operational, Org.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="MIS Dashboard overview">
        <ul>
          <li>Top-level KPIs: Revenue (Today/MTD/YTD), Patient Count (OP/IP), Occupancy %, Department Performance.</li>
          <li>Trend charts: Revenue vs target, Patient volume trends, Department-wise split.</li>
          <li>Quick comparison: This month vs last month vs same month last year.</li>
        </ul>
      </StepCard>

      {/* Section 2 */}
      <h2>2. Report Categories</h2>
      <StepCard number={1} title="Collection reports">
        <ul>
          <li><strong>MIS → Collection:</strong> Revenue analysis by any dimension.</li>
          <li>Drill-down by: Department, Doctor, Service type, Payment mode, Date range.</li>
          <li>Views: Daily collection, Doctor-wise earnings, Service-wise revenue, Payment mode split.</li>
          <li>Identify: Top revenue doctors, high-margin services, underperforming departments.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Accounts reports">
        <ul>
          <li><strong>MIS → Accounts:</strong> Financial health indicators.</li>
          <li>Includes: Outstanding AR aging, Insurance claim status, Refund summary, Expense trends.</li>
          <li>AR Aging: Current / 30 days / 60 days / 90 days / 90+ days buckets.</li>
          <li>Helps identify: Slow-paying insurers, chronic defaulters, revenue leakage.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Test orders reports">
        <ul>
          <li><strong>MIS → Test Orders:</strong> Lab and investigation analytics.</li>
          <li>Metrics: Test volume by type, TAT compliance, revenue from investigations, outsource ratio.</li>
          <li>Identify: Most-ordered tests, TAT bottlenecks, tests with low margins.</li>
        </ul>
      </StepCard>

      <StepCard number={4} title="Stocks reports">
        <ul>
          <li><strong>MIS → Stocks:</strong> Pharmacy and inventory analytics.</li>
          <li>Includes: Total stock value, near-expiry inventory, slow-moving items, fast-movers, dead stock.</li>
          <li>ABC analysis: High-value items (A), medium (B), low (C) — focus procurement on A items.</li>
          <li>Stock turnover ratio per category.</li>
        </ul>
      </StepCard>

      <StepCard number={5} title="Operational reports">
        <ul>
          <li><strong>MIS → Operational:</strong> Hospital operations metrics.</li>
          <li>OPD: Footfall, average wait time, no-show rate, consultation duration, new vs follow-up ratio.</li>
          <li>IPD: Bed occupancy, ALOS (Average Length of Stay), readmission rate, discharge timing.</li>
          <li>PK: Session utilization, room occupancy, package completion rate.</li>
          <li>Appointments: Adherence rate, cancellation rate, online vs walk-in ratio.</li>
        </ul>
      </StepCard>

      <StepCard number={6} title="Organization reports">
        <ul>
          <li><strong>MIS → Org:</strong> Multi-branch and organizational metrics.</li>
          <li>Branch comparison: Revenue, patient volume, satisfaction, staff productivity.</li>
          <li>Department P&L: Revenue minus direct costs per department.</li>
          <li>Staff efficiency: Revenue per doctor, patients per nurse, sessions per therapist.</li>
        </ul>
      </StepCard>

      {/* Section 3 */}
      <h2>3. Using MIS Filters</h2>
      <StepCard number={1} title="Apply filters to any report">
        <ul>
          <li>Navigate to <strong>MIS → Filters</strong> for advanced filtering across all reports.</li>
          <li>Common filters: Date Range, Branch, Department, Doctor, Service Type, Payment Mode, Patient Type (New/Follow-up).</li>
          <li>Combine multiple filters for specific insights (e.g., "Panchakarma department revenue from insurance patients in Q3").</li>
          <li>Save filter presets for recurring reports.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Schedule automated reports">
        <ul>
          <li>After configuring filters, click <strong>"Schedule"</strong> button.</li>
          <li>Options: Daily (morning 8 AM), Weekly (Monday morning), Monthly (1st of month).</li>
          <li>Delivery: Email to selected recipients (managers, owners, accounts team).</li>
          <li>Format: PDF summary + Excel detail attachment.</li>
        </ul>
      </StepCard>

      <TipBox>
        <p>Set up a <strong>Daily Morning Report</strong> that auto-emails yesterday's collection, patient count, and any anomalies — so management starts the day informed without logging in.</p>
      </TipBox>

      {/* Section 4 */}
      <h2>4. AI-Powered Insights</h2>
      <StepCard number={1} title="Natural language queries">
        <ul>
          <li>Navigate to <strong>MIS → AI</strong>.</li>
          <li>Type questions in plain English:</li>
          <ul>
            <li>"Show me revenue by department for last month"</li>
            <li>"Which doctors generated the most revenue this quarter?"</li>
            <li>"Compare OPD footfall between branches"</li>
            <li>"What's our pharmacy margin this month vs last month?"</li>
            <li>"Show patients who haven't returned for follow-up in 30 days"</li>
          </ul>
          <li>AI generates charts and tables from the query.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Predictive analytics">
        <ul>
          <li>AI provides forward-looking insights:</li>
          <li><strong>Revenue forecast:</strong> Next month predicted revenue based on trends + booked appointments.</li>
          <li><strong>Demand prediction:</strong> Which services will see increased demand (seasonal patterns).</li>
          <li><strong>Anomaly detection:</strong> Flags unusual patterns (sudden drop in a department, unusual expense spike).</li>
          <li><strong>Recommendations:</strong> "Increase Panchakarma slots on weekends — 30% of requests go unfulfilled."</li>
        </ul>
      </StepCard>

      {/* Section 5 */}
      <h2>5. Reading Reports Effectively</h2>
      <StepCard number={1} title="Key metrics to watch daily">
        <ul>
          <li><strong>Revenue vs Target:</strong> Are we on track? Green (&gt;90%), Yellow (75-90%), Red (&lt;75%).</li>
          <li><strong>OPD Footfall:</strong> Is patient volume stable? Sudden drops need investigation.</li>
          <li><strong>Collection Efficiency:</strong> Bills raised vs actually collected (should be &gt;85%).</li>
          <li><strong>Bed Occupancy:</strong> IPD capacity utilization (target: 70-85% is optimal).</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Key metrics to watch weekly/monthly">
        <ul>
          <li><strong>Doctor Productivity:</strong> Patients seen, revenue generated, satisfaction scores.</li>
          <li><strong>Outstanding AR:</strong> Growing means collection team needs to push harder.</li>
          <li><strong>Stock Turnover:</strong> Slow-moving items tie up capital. Target: 12+ turns/year for fast-movers.</li>
          <li><strong>PK Package Conversion:</strong> Assessment → package conversion rate (target &gt;60%).</li>
          <li><strong>Patient Return Rate:</strong> Follow-up adherence (healthy clinic: &gt;40% return rate).</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Export & share">
        <ul>
          <li>Every report has <strong>Export</strong> options: Excel, PDF, Print.</li>
          <li>Share via: Email (direct from system), WhatsApp (PDF attachment), or Schedule (automated).</li>
          <li>For board meetings: Use the <strong>Data Analytics & BI</strong> dashboard for presentation-ready visuals.</li>
        </ul>
      </StepCard>

      <KeyboardShortcuts
        shortcuts={[
          { keys: "Ctrl + R", action: "Refresh report data" },
          { keys: "Ctrl + F", action: "Open filters panel" },
          { keys: "Ctrl + E", action: "Export current report" },
          { keys: "Ctrl + P", action: "Print report" },
          { keys: "Ctrl + Q", action: "Open AI query" },
        ]}
      />
    </GuideLayout>
  );
};

export default MisAnalyticsGuide;
