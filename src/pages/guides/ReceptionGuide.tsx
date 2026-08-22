import { UserPlus } from "lucide-react";
import { GuideLayout, StepCard, TipBox, KeyboardShortcuts } from "./GuideLayout";

const ReceptionGuide = () => {
  return (
    <GuideLayout
      title="Reception Quick Start"
      subtitle="Front-desk operations: registration, appointments, tokens, and billing"
      icon={UserPlus}
      color="bg-blue-500/10 text-blue-600"
      estimatedTime="15 min"
      roles={["Receptionist", "Front Desk"]}
    >
      {/* Section 1: Getting Started */}
      <h2>1. Logging In & Your Dashboard</h2>
      <StepCard number={1} title="Log in to HMS">
        <ul>
          <li>Navigate to <code>/hms/auth</code> or click "HMS Login" from the main site.</li>
          <li>Enter your staff credentials (username + password) provided by your admin.</li>
          <li>You'll land on the HMS Dashboard showing today's appointments and queue status.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Navigate to your workspace">
        <ul>
          <li>Your sidebar shows: <strong>OPD</strong>, <strong>Appointments</strong>, <strong>Patient Registration</strong>, and <strong>Billing</strong>.</li>
          <li>The dashboard shows live token count, today's appointments, and pending collections.</li>
        </ul>
      </StepCard>

      {/* Section 2: Patient Registration */}
      <h2>2. Registering a New Patient</h2>
      <StepCard number={1} title="Open registration form">
        <ul>
          <li>Click <strong>Patient → Register</strong> from the sidebar or press the shortcut.</li>
          <li>The AI-assisted form opens with auto-fill for pincode and phone lookup.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Fill in patient details">
        <ul>
          <li><strong>Required:</strong> Name, Phone, Gender, Age/DOB</li>
          <li><strong>Optional:</strong> Email, Aadhaar, ABHA ID, Address, Blood Group</li>
          <li>The system auto-generates a unique Patient ID (e.g., AYZ-2024-0001).</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Register with billing (combo flow)">
        <ul>
          <li>Use <strong>Register + Bill</strong> to register and create the consultation bill in one step.</li>
          <li>Select the doctor, consultation type (New/Follow-up), and payment mode.</li>
          <li>Print the token slip with QR code for the patient.</li>
        </ul>
      </StepCard>

      <TipBox>
        <p>Use <strong>Patient → Find</strong> to search returning patients by name, phone, or ID before creating a duplicate record.</p>
      </TipBox>

      {/* Section 3: Appointments */}
      <h2>3. Managing Appointments</h2>
      <StepCard number={1} title="View today's schedule">
        <ul>
          <li>Go to <strong>Appointments</strong> to see a calendar/list view of all booked slots.</li>
          <li>Filter by doctor, department, or appointment status (Confirmed/Pending/Cancelled).</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Book a new appointment">
        <ul>
          <li>Click <strong>+ New Appointment</strong>.</li>
          <li>Select patient (search existing or register new), doctor, date, and time slot.</li>
          <li>Choose visit type: Walk-in, Scheduled, Teleconsult, or Follow-up.</li>
          <li>Confirm — patient receives WhatsApp/SMS notification automatically.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Handle walk-ins">
        <ul>
          <li>For walk-ins, use <strong>OPD → Quick Token</strong> to generate a token immediately.</li>
          <li>The patient enters the queue and their status shows as "Waiting" in the doctor's view.</li>
        </ul>
      </StepCard>

      {/* Section 4: Token & Queue */}
      <h2>4. Token & Queue Management</h2>
      <StepCard number={1} title="Generate tokens">
        <ul>
          <li>Tokens are auto-generated on appointment check-in or walk-in registration.</li>
          <li>Token format: Department prefix + serial number (e.g., AYU-001, ORT-002).</li>
          <li>Print token slips with QR code, patient name, doctor, and estimated wait time.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Monitor the queue display">
        <ul>
          <li>The <strong>Queue Display</strong> screen (for TV monitors) auto-updates in real time.</li>
          <li>Shows current token being served, next in queue, and average wait time.</li>
          <li>Access it via <strong>HMS → Queue Display</strong> (full-screen mode).</li>
        </ul>
      </StepCard>

      <TipBox title="Quick Action">
        <p>Right-click any patient in the queue to: Mark as Arrived, Reassign Doctor, Cancel, or move to Priority.</p>
      </TipBox>

      {/* Section 5: Billing */}
      <h2>5. Front-Desk Billing</h2>
      <StepCard number={1} title="Collect consultation fees">
        <ul>
          <li>When registering with bill, select the fee type (New Consultation / Follow-up / Emergency).</li>
          <li>Accept payment: Cash, Card, UPI, or Online.</li>
          <li>Print/send receipt via WhatsApp.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Handle advance & deposits">
        <ul>
          <li>For IPD admissions, collect advance via <strong>Billing → Advance</strong>.</li>
          <li>The system tracks advance balance and adjusts against final bill.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Process refunds">
        <ul>
          <li>Navigate to <strong>Accounts → Refund & Advance</strong>.</li>
          <li>Enter original receipt number, reason, and approved amount.</li>
          <li>Refunds require admin approval before processing.</li>
        </ul>
      </StepCard>

      {/* Section 6: Daily Tasks */}
      <h2>6. End-of-Day Checklist</h2>
      <StepCard number={1} title="Reconcile cash">
        <ul>
          <li>Go to <strong>Accounts → Day End</strong>.</li>
          <li>Verify cash in hand matches system total.</li>
          <li>Note any discrepancies and submit the day-end report.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Check pending appointments">
        <ul>
          <li>Review next-day appointments in the <strong>Appointments</strong> screen.</li>
          <li>Trigger reminder notifications for unconfirmed slots.</li>
        </ul>
      </StepCard>

      {/* Shortcuts */}
      <KeyboardShortcuts
        shortcuts={[
          { keys: "Ctrl + N", action: "New patient registration" },
          { keys: "Ctrl + B", action: "Quick billing" },
          { keys: "Ctrl + F", action: "Find patient" },
          { keys: "Ctrl + T", action: "Generate token" },
          { keys: "F5", action: "Refresh queue" },
        ]}
      />
    </GuideLayout>
  );
};

export default ReceptionGuide;
