import { FlaskConical } from "lucide-react";
import { GuideLayout, StepCard, TipBox, KeyboardShortcuts } from "./GuideLayout";

const LabGuide = () => {
  return (
    <GuideLayout
      title="Lab & Diagnostics Quick Start"
      subtitle="Test orders, sample collection, result entry, report generation, and QC workflows"
      icon={FlaskConical}
      color="bg-indigo-500/10 text-indigo-600"
      estimatedTime="20 min"
      roles={["Lab Technician", "Pathologist"]}
    >
      {/* Section 1 */}
      <h2>1. Lab Dashboard & Navigation</h2>
      <StepCard number={1} title="Access the Lab module">
        <ul>
          <li>From HMS sidebar, navigate to <strong>Lab & Diagnostics</strong> (<code>/hms/lab-diagnostics</code>).</li>
          <li>Dashboard shows: Pending Samples, Today's Workload, TAT Status, QC Alerts, and Revenue.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Key areas">
        <ul>
          <li><strong>Orders:</strong> Incoming test orders from doctors</li>
          <li><strong>Accession:</strong> Sample registration and barcode generation</li>
          <li><strong>Worklist:</strong> Tests to be performed today</li>
          <li><strong>Result Entry:</strong> Enter and validate results</li>
          <li><strong>Reports:</strong> Generate and dispatch patient reports</li>
          <li><strong>QC:</strong> Quality control and calibration tracking</li>
          <li><strong>Master:</strong> Test catalog configuration</li>
        </ul>
      </StepCard>

      {/* Section 2 */}
      <h2>2. Test Master Configuration</h2>
      <StepCard number={1} title="Set up test catalog">
        <ul>
          <li>Go to <strong>Master → Group</strong> to create test groups (Hematology, Biochemistry, Microbiology, etc.).</li>
          <li>In <strong>Test Management</strong>, add individual tests with: Name, Code, Sample Type, Container, Reference Ranges.</li>
          <li>Set gender-specific and age-specific normal ranges.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Create test profiles / packages">
        <ul>
          <li><strong>Profile Management:</strong> Bundle tests into profiles (e.g., "Complete Blood Count" = Hb + WBC + RBC + Platelets + ESR).</li>
          <li><strong>Packages:</strong> Create health check-up packages (Basic/Comprehensive/Executive).</li>
          <li>Set package pricing — can differ from sum of individual tests.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Ayurveda-specific diagnostics">
        <ul>
          <li><strong>Nadi Pariksha:</strong> Configure pulse diagnosis parameters for Ayurvedic assessment.</li>
          <li><strong>AYUSH Diagnostics Hub:</strong> Prakriti analysis, Dosha quantification, and Agni assessment tests.</li>
          <li>These integrate with the doctor's Ayurveda case sheet.</li>
        </ul>
      </StepCard>

      {/* Section 3 */}
      <h2>3. Receiving & Processing Orders</h2>
      <StepCard number={1} title="View incoming orders">
        <ul>
          <li>Go to <strong>Order</strong> to see all test requests from doctors.</li>
          <li>Orders show: Patient, Tests Requested, Priority (Normal/Urgent/STAT), and Ordering Doctor.</li>
          <li>Accept orders to move them into your workflow.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Sample accession">
        <ul>
          <li>Navigate to <strong>Accession</strong> when the patient arrives for sample collection.</li>
          <li>The system generates a unique accession number and prints barcode labels.</li>
          <li>Record: Collection time, phlebotomist name, sample condition, and number of tubes.</li>
          <li>Stick barcode on each tube/container.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Sample tracking">
        <ul>
          <li><strong>Sample Tracking</strong> shows real-time status of every sample.</li>
          <li>States: Collected → In Transit → Received at Lab → Processing → Completed.</li>
          <li>For outsourced tests, track send-out and receive-back dates.</li>
        </ul>
      </StepCard>

      <TipBox>
        <p>Use <strong>Barcode</strong> module for barcode-based sample identification — scan to instantly pull up the sample details and associated tests.</p>
      </TipBox>

      {/* Section 4 */}
      <h2>4. Result Entry & Validation</h2>
      <StepCard number={1} title="Enter results">
        <ul>
          <li>Go to <strong>Result Entry</strong> or use the <strong>Worklist</strong> to find pending tests.</li>
          <li>Enter values for each parameter — abnormal values auto-highlight (red for critical, yellow for borderline).</li>
          <li>System shows reference ranges alongside for quick comparison.</li>
          <li>For machine-interfaced analyzers, results auto-populate (see Machine Interface).</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Validate and authorize">
        <ul>
          <li>After entry, results go to the <strong>Pathologist/Senior Tech</strong> for validation.</li>
          <li>Validator reviews, can add comments, and clicks <strong>Authorize</strong>.</li>
          <li>Authorized results become available for report generation.</li>
          <li>Critical values trigger immediate alerts to the ordering doctor.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Handle re-runs and exceptions">
        <ul>
          <li>Use <strong>Exceptions</strong> to flag samples for re-run (hemolyzed, clotted, insufficient volume).</li>
          <li>Request fresh sample collection with reason documented.</li>
          <li>Track all exceptions for quality improvement.</li>
        </ul>
      </StepCard>

      {/* Section 5 */}
      <h2>5. Report Generation & Dispatch</h2>
      <StepCard number={1} title="Generate patient reports">
        <ul>
          <li>Go to <strong>Reports</strong> — authorized results auto-compile into formatted reports.</li>
          <li>Report includes: Patient info, test results with flags, reference ranges, and pathologist signature.</li>
          <li>Use <strong>Report Templates</strong> to customize the layout per test group.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Dispatch reports">
        <ul>
          <li>Reports can be: Printed, emailed, sent via WhatsApp, or made available on Patient Portal.</li>
          <li><strong>Auto Comms:</strong> Configure automatic dispatch when results are authorized.</li>
          <li><strong>Smart Reports:</strong> AI-generated interpretive summaries for patients.</li>
        </ul>
      </StepCard>

      <TipBox>
        <p>The <strong>Doctor Portal</strong> in Lab allows referring doctors to view their patients' results in real time without waiting for formal dispatch.</p>
      </TipBox>

      {/* Section 6 */}
      <h2>6. Quality Control</h2>
      <StepCard number={1} title="Daily QC runs">
        <ul>
          <li>Navigate to <strong>QC</strong> to enter daily quality control results.</li>
          <li>Levey-Jennings charts auto-plot for trend analysis.</li>
          <li>Westgard rules flag QC failures — investigate before reporting patient results.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="NABL compliance">
        <ul>
          <li><strong>NABL Compliance</strong> module tracks all documentation required for accreditation.</li>
          <li>Includes: SOPs, equipment calibration records, proficiency testing, and EQAS reports.</li>
          <li>Checklist view shows compliance percentage and pending items.</li>
        </ul>
      </StepCard>

      {/* Section 7 */}
      <h2>7. Advanced Features</h2>
      <StepCard number={1} title="Machine Interface">
        <ul>
          <li>Configure bi-directional interface with lab analyzers.</li>
          <li>Send worklist to machine → Receive results automatically.</li>
          <li>Reduces manual entry errors and speeds up TAT.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="TAT Monitoring">
        <ul>
          <li>Track turnaround time from sample collection to report dispatch.</li>
          <li>Set TAT targets per test — system alerts when approaching deadline.</li>
          <li>TAT reports help identify bottlenecks in the workflow.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Home Collection & Outsource">
        <ul>
          <li><strong>Home Collection:</strong> Schedule phlebotomist visits, track via GPS, and update sample receipt.</li>
          <li><strong>Outsource:</strong> Route tests to partner labs when not performed in-house. Track send/receive.</li>
          <li><strong>B2B Portal:</strong> Manage corporate and partner lab relationships.</li>
        </ul>
      </StepCard>

      <KeyboardShortcuts
        shortcuts={[
          { keys: "Ctrl + A", action: "New accession" },
          { keys: "Ctrl + R", action: "Enter results" },
          { keys: "Ctrl + V", action: "Validate results" },
          { keys: "Ctrl + P", action: "Print report" },
          { keys: "F2", action: "Scan barcode" },
          { keys: "F5", action: "Refresh worklist" },
        ]}
      />
    </GuideLayout>
  );
};

export default LabGuide;
