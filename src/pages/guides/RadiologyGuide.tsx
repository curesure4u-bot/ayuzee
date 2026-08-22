import { ScanLine } from "lucide-react";
import { GuideLayout, StepCard, TipBox, KeyboardShortcuts } from "./GuideLayout";

const RadiologyGuide = () => {
  return (
    <GuideLayout
      title="Radiology & Imaging Playbook"
      subtitle="Worklist management, reporting, PACS integration, and imaging workflow"
      icon={ScanLine}
      color="bg-rose-500/10 text-rose-600"
      estimatedTime="12 min"
      roles={["Radiologist", "Radiology Tech", "Admin"]}
    >
      <h2>1. Radiology Module Overview</h2>
      <StepCard number={1} title="Access Radiology">
        <ul>
          <li>From HMS sidebar, navigate to <strong>Radiology</strong> (<code>/hms/radiology</code>).</li>
          <li>Sub-pages: Main overview, <strong>Worklist</strong>, <strong>Reporting</strong>, <strong>PACS</strong>.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Module capabilities">
        <ul>
          <li><strong>Worklist:</strong> Incoming study requests from doctors, scheduling, and tracking.</li>
          <li><strong>Reporting:</strong> Structured report generation with templates and AI assist.</li>
          <li><strong>PACS:</strong> Picture Archiving and Communication System — view, store, and share images.</li>
          <li>Integrated with Lab module for combined diagnostic workflow.</li>
        </ul>
      </StepCard>

      <h2>2. Radiology Worklist</h2>
      <StepCard number={1} title="View incoming requests">
        <ul>
          <li>Navigate to <strong>Radiology → Worklist</strong> (<code>/hms/radiology/worklist</code>).</li>
          <li>Shows all pending imaging requests from doctors.</li>
          <li>Each request shows: Patient, Study type (X-ray/USG/CT/MRI), Priority (Routine/Urgent/STAT), Ordering doctor, Clinical indication.</li>
          <li>Filter by: Modality, Priority, Date, Status.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Schedule and perform study">
        <ul>
          <li>Accept request → Assign time slot and room/equipment.</li>
          <li>Patient arrives → Verify identity and request details.</li>
          <li>Perform imaging → Upload images to PACS.</li>
          <li>Mark study as "Completed" — moves to reporting queue.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Priority handling">
        <ul>
          <li><strong>STAT:</strong> Immediate — emergency cases, intra-operative needs. Report within 1 hour.</li>
          <li><strong>Urgent:</strong> Same day — clinically significant findings expected. Report within 4 hours.</li>
          <li><strong>Routine:</strong> Within 24-48 hours — standard diagnostic workup.</li>
          <li>STAT requests trigger immediate notification to radiology team.</li>
        </ul>
      </StepCard>

      <h2>3. Reporting</h2>
      <StepCard number={1} title="Create radiology report">
        <ul>
          <li>Navigate to <strong>Radiology → Reporting</strong> (<code>/hms/radiology/reporting</code>).</li>
          <li>Select completed study from reporting queue.</li>
          <li>View images in built-in viewer (zoom, window/level, measure tools).</li>
          <li>Choose report template based on study type (Chest X-ray, Lumbar Spine, USG Abdomen, etc.).</li>
          <li>Fill structured findings — or use free-text if preferred.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Report structure">
        <ul>
          <li><strong>Clinical Indication:</strong> Why the study was ordered (auto-filled from request).</li>
          <li><strong>Technique:</strong> How it was performed (modality, contrast, views taken).</li>
          <li><strong>Findings:</strong> What was observed — structured by anatomy/system.</li>
          <li><strong>Impression:</strong> Summary diagnosis/conclusion.</li>
          <li><strong>Recommendation:</strong> Follow-up studies, correlations, or referrals suggested.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Sign and dispatch">
        <ul>
          <li>Radiologist reviews findings and signs digitally.</li>
          <li>Report auto-dispatched to: Ordering doctor (in HMS), Patient portal, and Print queue.</li>
          <li>Critical findings: System triggers immediate phone/WhatsApp alert to ordering doctor.</li>
          <li>Addendum workflow: If report needs correction after sign-off, create addendum (original preserved).</li>
        </ul>
      </StepCard>

      <TipBox>
        <p><strong>Critical finding protocol:</strong> If you detect a life-threatening finding (pneumothorax, aortic dissection, fracture with vessel damage), alert the ordering doctor IMMEDIATELY — before completing the formal report.</p>
      </TipBox>

      <h2>4. PACS (Image Archive)</h2>
      <StepCard number={1} title="Image management">
        <ul>
          <li>Navigate to <strong>Radiology → PACS</strong> (<code>/hms/radiology/pacs</code>).</li>
          <li>All imaging studies stored centrally with patient linkage.</li>
          <li>Search: By patient, date, modality, body part, or study type.</li>
          <li>Viewer tools: Zoom, Pan, Window/Level adjustment, Measurement (ruler, angle), Annotations.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Image sharing">
        <ul>
          <li>Share images with: Referring doctors (within HMS), Patients (via portal/WhatsApp link), External specialists (secure link).</li>
          <li>Comparison: View prior studies side-by-side for progression tracking.</li>
          <li>DICOM compatibility: Import from external CDs/drives, export for referral.</li>
        </ul>
      </StepCard>

      <h2>5. Integration with Clinical Workflow</h2>
      <StepCard number={1} title="Doctor ordering workflow">
        <ul>
          <li>Doctor orders imaging from consultation → Request appears in Radiology Worklist.</li>
          <li>Report auto-links back to patient's consultation record.</li>
          <li>Doctor sees report in their patient timeline without switching modules.</li>
          <li>AI highlights key findings in the report for quick review.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Billing integration">
        <ul>
          <li>Imaging charges auto-added to patient bill when study completed.</li>
          <li>Rate plans apply: Different pricing for General/Insurance/Corporate patients.</li>
          <li>Package patients: Imaging charges included in package — no separate billing.</li>
        </ul>
      </StepCard>

      <KeyboardShortcuts
        shortcuts={[
          { keys: "Ctrl + W", action: "Open worklist" },
          { keys: "Ctrl + R", action: "Start reporting" },
          { keys: "Ctrl + S", action: "Sign report" },
          { keys: "Ctrl + I", action: "Open image viewer" },
          { keys: "Ctrl + P", action: "Print report" },
          { keys: "F5", action: "Refresh worklist" },
        ]}
      />
    </GuideLayout>
  );
};

export default RadiologyGuide;
