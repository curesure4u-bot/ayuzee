import { Users } from "lucide-react";
import { GuideLayout, StepCard, TipBox, KeyboardShortcuts } from "./GuideLayout";

const HrmsGuide = () => {
  return (
    <GuideLayout
      title="HRMS Quick Start"
      subtitle="Employee management, attendance, payroll, leave, duty roster, and performance tracking"
      icon={Users}
      color="bg-orange-500/10 text-orange-600"
      estimatedTime="20 min"
      roles={["HR Manager", "Admin"]}
    >
      {/* Section 1 */}
      <h2>1. Accessing HRMS</h2>
      <StepCard number={1} title="Navigate to HRMS">
        <ul>
          <li>From the HMS sidebar, click <strong>HRMS</strong> or navigate to <code>/hms/hrms</code>.</li>
          <li>The HRMS dashboard shows: Total Employees, Today's Attendance, Pending Leaves, and Payroll Status.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Understand the modules">
        <ul>
          <li><strong>Employees:</strong> Staff directory and profiles</li>
          <li><strong>Attendance:</strong> Daily tracking and reports</li>
          <li><strong>Duty Roster:</strong> Shift scheduling</li>
          <li><strong>Leave:</strong> Leave applications and approvals</li>
          <li><strong>Payroll:</strong> Salary processing and payslips</li>
          <li><strong>Performance:</strong> Appraisals and KPIs</li>
          <li><strong>Training:</strong> Staff development programs</li>
        </ul>
      </StepCard>

      {/* Section 2 */}
      <h2>2. Employee Management</h2>
      <StepCard number={1} title="Add a new employee">
        <ul>
          <li>Go to <strong>Employees</strong> and click <strong>+ Add Employee</strong>.</li>
          <li>Fill in: Name, Employee ID, Department, Designation, Joining Date, Phone, Email.</li>
          <li>Upload photo, ID documents, and qualification certificates.</li>
          <li>Set salary structure: Basic, HRA, DA, PF, ESI, and other components.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="View employee profile">
        <ul>
          <li>Click any employee name to view their complete profile.</li>
          <li>Tabs show: Personal Details, Employment History, Documents, Attendance History, Payslips.</li>
          <li>Quick actions: Edit Details, Generate Letter, Process Exit.</li>
        </ul>
      </StepCard>

      <TipBox>
        <p>Use the <strong>Onboarding</strong> module to create a checklist for new joiners — auto-assigns tasks to HR, IT, and the reporting manager.</p>
      </TipBox>

      {/* Section 3 */}
      <h2>3. Attendance & Duty Roster</h2>
      <StepCard number={1} title="Track daily attendance">
        <ul>
          <li>Go to <strong>Attendance</strong> to see today's log.</li>
          <li>Supports multiple input: Biometric, manual entry, or self check-in (ESS).</li>
          <li>Status types: Present, Absent, Half-Day, Late, On Duty, Work From Home.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Create duty roster / shifts">
        <ul>
          <li>Navigate to <strong>Duty Roster</strong>.</li>
          <li>Define shift templates: Morning (6AM-2PM), Evening (2PM-10PM), Night (10PM-6AM).</li>
          <li>Drag-and-drop staff into shifts on the weekly calendar.</li>
          <li>Auto-rotate shifts if configured.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Manage holidays">
        <ul>
          <li>Go to <strong>Holidays</strong> to set the annual holiday calendar.</li>
          <li>Supports national holidays, regional festivals, and restricted holidays.</li>
          <li>Holidays auto-apply to attendance and payroll calculations.</li>
        </ul>
      </StepCard>

      {/* Section 4 */}
      <h2>4. Leave Management</h2>
      <StepCard number={1} title="Configure leave policies">
        <ul>
          <li>In <strong>Settings</strong>, define leave types: Casual, Sick, Earned, Maternity/Paternity, Compensatory.</li>
          <li>Set annual entitlements, carry-forward rules, and encashment policies.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Process leave requests">
        <ul>
          <li>Go to <strong>Leave</strong> to view pending requests.</li>
          <li>Review employee's leave balance, team calendar (clash check), and approve/reject.</li>
          <li>Approved leaves auto-update attendance and payroll.</li>
        </ul>
      </StepCard>

      <TipBox>
        <p>Employees can apply for leave via the Employee Self-Service (ESS) portal — no HR intervention needed for simple requests.</p>
      </TipBox>

      {/* Section 5 */}
      <h2>5. Payroll Processing</h2>
      <StepCard number={1} title="Monthly payroll run">
        <ul>
          <li>Navigate to <strong>Payroll</strong> at month-end.</li>
          <li>The system auto-calculates: Attendance days, Leave deductions, OT hours, Incentives.</li>
          <li>Review the payroll summary — make adjustments if needed (advances, loans, bonuses).</li>
          <li>Click <strong>Process Payroll</strong> to finalize.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Generate payslips">
        <ul>
          <li>After processing, payslips are auto-generated for all employees.</li>
          <li>Employees can download from ESS or receive via email/WhatsApp.</li>
          <li>View individual payslips at <strong>Payroll → Payslip</strong>.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Statutory compliance">
        <ul>
          <li>PF, ESI, Professional Tax, and TDS are auto-calculated per government rules.</li>
          <li>Export statutory reports for filing.</li>
          <li>Year-end Form 16 generation available.</li>
        </ul>
      </StepCard>

      {/* Section 6 */}
      <h2>6. Performance & Training</h2>
      <StepCard number={1} title="Set up appraisals">
        <ul>
          <li>Go to <strong>Performance</strong> to configure KPIs and appraisal cycles.</li>
          <li>Assign department-specific KPIs to each role.</li>
          <li>Run quarterly or annual reviews with self-assessment and manager rating.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Manage training programs">
        <ul>
          <li>Navigate to <strong>Training</strong> to create programs.</li>
          <li>Track: Training name, dates, trainer, attendees, and feedback scores.</li>
          <li>Link mandatory training to employee onboarding checklists.</li>
        </ul>
      </StepCard>

      {/* Section 7 */}
      <h2>7. Reports & Analytics</h2>
      <StepCard number={1} title="HR reports">
        <ul>
          <li><strong>Reports:</strong> Headcount, Attrition, Attendance Summary, Leave Balance, Payroll Cost.</li>
          <li><strong>Analytics:</strong> Turnover trends, department-wise costs, and workforce planning charts.</li>
          <li>Export any report to Excel or PDF.</li>
        </ul>
      </StepCard>

      <KeyboardShortcuts
        shortcuts={[
          { keys: "Ctrl + E", action: "Search employees" },
          { keys: "Ctrl + A", action: "Open attendance" },
          { keys: "Ctrl + L", action: "View leave requests" },
          { keys: "Ctrl + P", action: "Open payroll" },
          { keys: "Ctrl + R", action: "Generate report" },
        ]}
      />
    </GuideLayout>
  );
};

export default HrmsGuide;
