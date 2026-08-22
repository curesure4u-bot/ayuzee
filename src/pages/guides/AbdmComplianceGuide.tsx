import { Shield } from "lucide-react";
import { GuideLayout, StepCard, TipBox, KeyboardShortcuts } from "./GuideLayout";

const AbdmComplianceGuide = () => {
  return (
    <GuideLayout
      title="ABDM & Compliance Playbook"
      subtitle="ABHA ID, health record sharing, NABH documentation, audit trail, and regulatory requirements"
      icon={Shield}
      color="bg-slate-500/10 text-slate-600"
      estimatedTime="15 min"
      roles={["Admin", "Compliance Officer", "IT"]}
    >
      <h2>1. ABDM Overview</h2>
      <StepCard number={1} title="What is ABDM?">
        <ul>
          <li><strong>Ayushman Bharat Digital Mission</strong> — India's national digital health ecosystem.</li>
          <li>Key components: ABHA (Health Account), Health Information Exchange (HIE), Consent Management.</li>
          <li>HMS integration: <strong>HMS → ABDM</strong> (<code>/hms/abdm</code>) and <strong>HMS → ABDM 2.0 / UHI</strong>.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Why comply?">
        <ul>
          <li>Government-mandated for hospitals above certain size (state-specific).</li>
          <li>Enables: Patient data portability, insurance claim simplification, national health records.</li>
          <li>Benefits: Patients can share records across hospitals, reducing repeat tests and improving care continuity.</li>
        </ul>
      </StepCard>

      <h2>2. ABHA ID Management</h2>
      <StepCard number={1} title="Create ABHA for patients">
        <ul>
          <li>During patient registration, offer ABHA creation.</li>
          <li>Methods: Aadhaar OTP (most common), Driving License, or Self-declared (limited).</li>
          <li>System generates 14-digit ABHA number and optional ABHA address (username@abdm).</li>
          <li>Link ABHA to patient's HMS profile for seamless record sharing.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Verify existing ABHA">
        <ul>
          <li>If patient already has ABHA: Enter number or scan QR → Verify via OTP.</li>
          <li>Fetch basic demographics from ABDM registry to auto-fill registration form.</li>
          <li>Link verified ABHA to patient record in HMS.</li>
        </ul>
      </StepCard>

      <TipBox>
        <p>ABHA creation is <strong>voluntary</strong> for patients. Explain the benefits (record portability, insurance ease) but never force it. Document refusal if patient declines.</p>
      </TipBox>

      <h2>3. Health Record Sharing</h2>
      <StepCard number={1} title="Push health records to ABDM">
        <ul>
          <li>After consultation, system can push care context (prescription, discharge summary, lab report) to ABDM.</li>
          <li>Records follow FHIR R4 format (international healthcare data standard).</li>
          <li>Access via <strong>Admin Panel → P4: ABDM & Govt → FHIR R4 Export</strong>.</li>
          <li>Data types: OPD Visit, Prescription, Diagnostic Report, Discharge Summary, Immunization Record.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Consent management">
        <ul>
          <li>Navigate to <strong>HMS → ABDM → Consent Manager</strong> (or Admin Panel → P4).</li>
          <li>Before accessing a patient's records from another hospital, a consent request is sent.</li>
          <li>Patient approves/denies via ABHA app or PHR app.</li>
          <li>Consent is time-bound and purpose-specific (care, insurance, research).</li>
          <li>Your system logs all consent grants and data access for audit.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Receive records from other hospitals">
        <ul>
          <li>If patient grants consent, you can fetch their records from linked facilities.</li>
          <li>View previous prescriptions, investigation reports, and discharge summaries.</li>
          <li>Helps doctors make informed decisions without repeating investigations.</li>
        </ul>
      </StepCard>

      <h2>4. NABH Documentation</h2>
      <StepCard number={1} title="NABH compliance tracking">
        <ul>
          <li>Navigate to <strong>HMS → NABH</strong> (<code>/hms/nabh</code>).</li>
          <li>NABH (National Accreditation Board for Hospitals) requires extensive documentation.</li>
          <li>System tracks compliance across: Patient rights, Care of patients, Management of medication, Infection control, Quality improvement.</li>
          <li>Checklist view shows: Compliant items, Pending items, Non-compliant items.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Key NABH requirements the HMS supports">
        <ul>
          <li><strong>Patient identification:</strong> Unique ID, wristband generation for IP.</li>
          <li><strong>Informed consent:</strong> Digital consent for all procedures (PK Consent module).</li>
          <li><strong>Medication safety:</strong> Drug interaction alerts (CDSS), prescription audit trail.</li>
          <li><strong>Infection control:</strong> CSSD tracking, sterilization logs, linen management.</li>
          <li><strong>Incident reporting:</strong> Near-miss and adverse event reporting system.</li>
          <li><strong>Clinical audit:</strong> Mortality review, readmission tracking, surgical site infection rates.</li>
        </ul>
      </StepCard>

      <h2>5. Audit Trail & Governance</h2>
      <StepCard number={1} title="Audit trail">
        <ul>
          <li>Navigate to <strong>HMS → Audit Trail</strong> (<code>/hms/audit-trail</code>).</li>
          <li>Logs every action by every user: Who, What, When, From where (IP address).</li>
          <li>Actions tracked: Create, Read, Update, Delete, Print, Export, Login/Logout.</li>
          <li>Immutable — cannot be edited or deleted by any user including admin.</li>
          <li>Filter by: User, Action type, Module, Date range, Patient involved.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Governance dashboard">
        <ul>
          <li>Navigate to <strong>HMS → Governance</strong> (<code>/hms/governance</code>).</li>
          <li>Data retention policies: How long records are kept (legal minimum: 3 years for adults, till age 25 for minors).</li>
          <li>Access control reviews: Periodic review of who has access to what.</li>
          <li>Security controls: Password policies, session timeouts, failed login lockouts.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Security controls">
        <ul>
          <li>Navigate to <strong>HMS → Security Controls</strong>.</li>
          <li><strong>Trusted IP:</strong> Restrict HMS access to hospital network (Masters → Trusted IP).</li>
          <li><strong>Role-based access:</strong> Each role sees only what they need (Masters → Roles).</li>
          <li><strong>Session management:</strong> Auto-logout after inactivity, concurrent session limits.</li>
          <li><strong>Data encryption:</strong> All data encrypted at rest and in transit (handled by Supabase infrastructure).</li>
        </ul>
      </StepCard>

      <TipBox title="Audit Ready">
        <p>During any regulatory audit (NABH, CDSCO, State Health Dept), use the Audit Trail + Governance modules to generate compliance reports instantly. No manual documentation needed.</p>
      </TipBox>

      <h2>6. Regulatory Reporting</h2>
      <StepCard number={1} title="Government reports">
        <ul>
          <li><strong>AYUSH Ministry Reports:</strong> Admin Panel → P4 → AYUSH Ministry Reports.</li>
          <li>Includes: Patient volume by AYUSH system, treatment outcomes, practitioner data.</li>
          <li><strong>State Health Dept:</strong> Birth/death reporting, notifiable disease reporting, drug adverse reaction (ADR) reporting.</li>
          <li><strong>CDSCO:</strong> Drug purchase records, expiry disposal records, controlled substance register.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="NaMaSTE coding">
        <ul>
          <li>Navigate to <strong>HMS → NaMaSTE Coding</strong> (<code>/hms/namaste-coding</code>).</li>
          <li>National AYUSH Morbidity and Standardized Terminologies for Electronic health records.</li>
          <li>Maps AYUSH diagnoses to standardized codes (like ICD for modern medicine).</li>
          <li>Required for: ABDM data exchange, insurance claims for AYUSH treatments, government reporting.</li>
        </ul>
      </StepCard>

      <KeyboardShortcuts
        shortcuts={[
          { keys: "Ctrl + A", action: "Create ABHA ID" },
          { keys: "Ctrl + H", action: "View health records" },
          { keys: "Ctrl + T", action: "Open audit trail" },
          { keys: "Ctrl + N", action: "NABH checklist" },
          { keys: "Ctrl + R", action: "Generate compliance report" },
        ]}
      />
    </GuideLayout>
  );
};

export default AbdmComplianceGuide;
