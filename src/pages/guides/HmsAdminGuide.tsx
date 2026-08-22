import { Settings } from "lucide-react";
import { GuideLayout, StepCard, TipBox, KeyboardShortcuts } from "./GuideLayout";

const HmsAdminGuide = () => {
  return (
    <GuideLayout
      title="HMS Admin Quick Start"
      subtitle="Hospital setup, master configuration, billing, MIS reports, and system administration"
      icon={Settings}
      color="bg-purple-500/10 text-purple-600"
      estimatedTime="25 min"
      roles={["Admin", "Hospital Manager"]}
    >
      {/* Section 1 */}
      <h2>1. Initial Hospital Setup</h2>
      <StepCard number={1} title="Access Admin Panel">
        <ul>
          <li>Log in with admin credentials at <code>/hms/auth</code>.</li>
          <li>You have full access to all modules plus <strong>Masters</strong> and <strong>Settings</strong>.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Configure hospital profile">
        <ul>
          <li>Go to <strong>Masters</strong> from the sidebar.</li>
          <li>Set up: Hospital Name, Address, Logo, Contact Details, Registration Number.</li>
          <li>Configure GST details, letterhead template, and prescription header/footer.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Set up departments">
        <ul>
          <li>Navigate to <strong>Masters → Departments</strong>.</li>
          <li>Create departments: OPD, Ayurveda, Panchakarma, Pharmacy, Lab, etc.</li>
          <li>Assign department codes, floor/wing locations, and operational hours.</li>
        </ul>
      </StepCard>

      {/* Section 2 */}
      <h2>2. User & Role Management</h2>
      <StepCard number={1} title="Create staff users">
        <ul>
          <li>Go to <strong>Masters → Users</strong>.</li>
          <li>Add staff members: Name, Phone, Email, Department, and Role.</li>
          <li>Each user receives login credentials via email/SMS.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Configure roles & permissions">
        <ul>
          <li>Navigate to <strong>Masters → Roles</strong>.</li>
          <li>Built-in roles: Doctor, Receptionist, Pharmacist, Lab Tech, Therapist, Nurse, Admin.</li>
          <li>Customize module-level permissions (View/Create/Edit/Delete) for each role.</li>
          <li>Enable or disable specific features per role (e.g., allow receptionist to view bills but not edit).</li>
        </ul>
      </StepCard>

      <TipBox>
        <p>Use <strong>Trusted IP</strong> (Masters → Trusted IP) to restrict HMS access to your hospital's network for added security.</p>
      </TipBox>

      {/* Section 3 */}
      <h2>3. Master Data Configuration</h2>
      <StepCard number={1} title="Investigations & treatments">
        <ul>
          <li><strong>Masters → Investigations:</strong> Define lab tests with reference ranges, sample types, and pricing.</li>
          <li><strong>Masters → Treatments:</strong> Create procedure catalog with charges and duration.</li>
          <li><strong>Masters → Packages:</strong> Bundle services into treatment packages (e.g., 7-day Panchakarma).</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Billing & pricing setup">
        <ul>
          <li><strong>Masters → Billing & Tax:</strong> Configure GST rates, invoice numbering, and receipt templates.</li>
          <li><strong>Masters → Rate Plans:</strong> Create different rate cards (General, VIP, Corporate, Insurance).</li>
          <li><strong>Masters → Currency:</strong> Set default currency and payment modes.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Products & formulary">
        <ul>
          <li><strong>Masters → Products:</strong> Import or add medicines and consumables to the hospital formulary.</li>
          <li>Configure: product name, composition, manufacturer, HSN code, and pricing.</li>
          <li>Use <strong>SNA Formulary</strong> for AYUSH standard formulations.</li>
        </ul>
      </StepCard>

      <StepCard number={4} title="Wards & beds (for IPD)">
        <ul>
          <li><strong>Masters → Wards:</strong> Define wards (General, Semi-Private, Private, ICU, Panchakarma).</li>
          <li>Add bed numbers, charges per day, and amenities for each ward category.</li>
        </ul>
      </StepCard>

      {/* Section 4 */}
      <h2>4. MIS Reports & Analytics</h2>
      <StepCard number={1} title="Access MIS dashboard">
        <ul>
          <li>Navigate to <strong>MIS</strong> from the sidebar.</li>
          <li>Overview dashboard shows: Revenue, Patient Count, Occupancy, and Department-wise performance.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Generate reports">
        <ul>
          <li><strong>MIS → Collection:</strong> Daily/monthly revenue by department, doctor, or service.</li>
          <li><strong>MIS → Accounts:</strong> Outstanding payments, insurance claims, and AR aging.</li>
          <li><strong>MIS → Test Orders:</strong> Lab test volume and turnaround time analysis.</li>
          <li><strong>MIS → Stocks:</strong> Pharmacy inventory value, near-expiry, and slow-moving items.</li>
          <li><strong>MIS → Operational:</strong> OPD/IPD volume, appointment adherence, and no-show rates.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="AI-powered insights">
        <ul>
          <li><strong>MIS → AI</strong> provides predictive analytics: demand forecasting, revenue projections, and anomaly detection.</li>
          <li>Use natural-language queries: "Show me revenue by department for last month."</li>
        </ul>
      </StepCard>

      <TipBox>
        <p>Schedule automated reports via email: go to <strong>MIS → Filters</strong>, set criteria, and click "Schedule Weekly Email."</p>
      </TipBox>

      {/* Section 5 */}
      <h2>5. Accounts & Financial Management</h2>
      <StepCard number={1} title="Daily financial operations">
        <ul>
          <li><strong>Accounts → Revenue Dashboard:</strong> Real-time revenue tracking.</li>
          <li><strong>Accounts → Payment Collection:</strong> Track pending and collected payments.</li>
          <li><strong>Accounts → Day End:</strong> Close daily cash and reconcile collections.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Statutory compliance">
        <ul>
          <li><strong>Accounts → GST:</strong> Auto-generated GST returns data from invoices.</li>
          <li><strong>Accounts → TDS:</strong> TDS deductions and certificates management.</li>
          <li><strong>Accounts → Tally Export:</strong> Export vouchers in Tally-compatible format.</li>
        </ul>
      </StepCard>

      {/* Section 6 */}
      <h2>6. System Administration</h2>
      <StepCard number={1} title="Audit & compliance">
        <ul>
          <li><strong>Audit Trail:</strong> View all actions by all users with timestamps.</li>
          <li><strong>Governance:</strong> Compliance settings, data retention policies, and NABH documentation.</li>
          <li><strong>ABDM:</strong> Configure Ayushman Bharat Digital Mission integration (ABHA, health records sharing).</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Data import & migration">
        <ul>
          <li><strong>Masters → Data Import:</strong> Bulk import patients, products, or doctors from Excel/CSV.</li>
          <li>Templates are provided for each entity type.</li>
          <li>Validation runs before import to catch errors.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Backup & integrations">
        <ul>
          <li><strong>Developer Portal:</strong> Manage API keys and third-party integrations.</li>
          <li><strong>WhatsApp:</strong> Configure automated messaging templates and webhook.</li>
          <li><strong>Online Booking:</strong> Enable/disable patient self-booking and payment settings.</li>
        </ul>
      </StepCard>

      <KeyboardShortcuts
        shortcuts={[
          { keys: "Ctrl + M", action: "Open Masters" },
          { keys: "Ctrl + R", action: "Open MIS Reports" },
          { keys: "Ctrl + U", action: "Manage Users" },
          { keys: "Ctrl + A", action: "Open Accounts" },
          { keys: "F11", action: "Full-screen dashboard" },
        ]}
      />
    </GuideLayout>
  );
};

export default HmsAdminGuide;
