import { Stethoscope } from "lucide-react";
import { GuideLayout, StepCard, TipBox, KeyboardShortcuts } from "./GuideLayout";

const DoctorGuide = () => {
  return (
    <GuideLayout
      title="Doctor Quick Start"
      subtitle="Consultations, prescriptions, case sheets, EMR, and clinical decision support"
      icon={Stethoscope}
      color="bg-green-500/10 text-green-600"
      estimatedTime="20 min"
      roles={["Doctor", "Consultant"]}
    >
      {/* Section 1 */}
      <h2>1. Your Doctor Dashboard</h2>
      <StepCard number={1} title="Access the doctor workspace">
        <ul>
          <li>Log in at <code>/hms/auth</code> with your doctor credentials.</li>
          <li>Your dashboard shows: Today's Queue, Pending Prescriptions, Follow-up Reminders, and Clinical Alerts.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="View your patient queue">
        <ul>
          <li>The <strong>OPD Queue</strong> shows patients checked in and waiting for you.</li>
          <li>Click a patient row to open their full record (vitals, history, past visits).</li>
          <li>Status indicators: 🟢 Ready, 🟡 Vitals Pending, 🔵 Follow-up.</li>
        </ul>
      </StepCard>

      {/* Section 2 */}
      <h2>2. Conducting a Consultation</h2>
      <StepCard number={1} title="Start the consultation">
        <ul>
          <li>Click <strong>Start Consult</strong> on the patient in your queue.</li>
          <li>The consultation screen opens with tabs: Vitals, Complaints, Examination, Diagnosis, Prescription.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Record vitals (if not already entered by nurse)">
        <ul>
          <li>Enter: BP, Pulse, Temperature, SpO2, Weight, Height.</li>
          <li>BMI auto-calculates. Prakriti assessment available for AYUSH consultations.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Document complaints & history">
        <ul>
          <li>Use the structured complaint picker or free-text entry.</li>
          <li>The AI-powered suggestion system shows common associated symptoms.</li>
          <li>Past medical history, allergies, and family history auto-populate from the patient record.</li>
        </ul>
      </StepCard>

      <StepCard number={4} title="Record examination findings">
        <ul>
          <li>Use templates for system-wise examination (Musculoskeletal, Respiratory, etc.).</li>
          <li>For Ayurveda: Ashtavidha Pariksha (8-fold examination), Dashavidha Pariksha fields available.</li>
          <li>Attach images or diagrams if needed.</li>
        </ul>
      </StepCard>

      <TipBox>
        <p>The <strong>AI Scribe</strong> (HMS → AI Scribe) can listen to your consultation and auto-generate clinical notes in the correct format.</p>
      </TipBox>

      {/* Section 3 */}
      <h2>3. Diagnosis & CDSS</h2>
      <StepCard number={1} title="Add diagnosis">
        <ul>
          <li>Search by ICD-10 code, disease name, or Ayurvedic Vyadhi name.</li>
          <li>Support for NaMaSTE coding (National AYUSH Morbidity & Standardized Terminologies).</li>
          <li>Multiple diagnoses supported — mark one as primary.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Use Clinical Decision Support (CDSS)">
        <ul>
          <li>The CDSS panel on the right shows drug interaction warnings, allergy alerts, and contraindications.</li>
          <li>For Ayurveda: suggests classical formulations based on diagnosis + prakriti.</li>
          <li>Access detailed CDSS via <strong>HMS → CDSS</strong>.</li>
        </ul>
      </StepCard>

      {/* Section 4 */}
      <h2>4. Writing Prescriptions</h2>
      <StepCard number={1} title="Add medicines">
        <ul>
          <li>Type the medicine name — auto-suggests from the hospital formulary.</li>
          <li>Select: Dosage, Frequency, Duration, Route, and Instructions.</li>
          <li>For Ayurveda: Anupana (adjuvant), Pathya/Apathya (do's/don'ts) fields available.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Add investigations">
        <ul>
          <li>Order lab tests or imaging from the investigation master list.</li>
          <li>The order flows directly to the Lab module for processing.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Add procedures / therapies">
        <ul>
          <li>For Panchakarma or procedures: select the therapy, number of sessions, and instructions.</li>
          <li>The order flows to the Therapist module automatically.</li>
        </ul>
      </StepCard>

      <StepCard number={4} title="Finalize & print">
        <ul>
          <li>Review the complete prescription and click <strong>Sign & Save</strong>.</li>
          <li>Print or send digitally via WhatsApp/email.</li>
          <li>e-Prescription is available at <strong>HMS → e-Prescription</strong>.</li>
        </ul>
      </StepCard>

      <TipBox>
        <p>Save frequently-used prescription templates via <strong>My Templates</strong> for quick reuse.</p>
      </TipBox>

      {/* Section 5 */}
      <h2>5. Case Sheet (Detailed Documentation)</h2>
      <StepCard number={1} title="Access the Ayurveda Case Sheet">
        <ul>
          <li>Go to <strong>Patient → Case Sheet</strong> for structured Ayurvedic documentation.</li>
          <li>Sections include: Prakriti, Vikriti, Dosha analysis, Sapta Dhatu, Srotas assessment.</li>
          <li>Supports both classical Ayurvedic format and integrated modern medicine documentation.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Track treatment progress">
        <ul>
          <li>Use <strong>Treatment Timeline</strong> to visualize all visits, prescriptions, and outcomes over time.</li>
          <li>Outcome Scales (VAS pain scale, ROM, etc.) track patient improvement quantitatively.</li>
        </ul>
      </StepCard>

      {/* Section 6 */}
      <h2>6. Follow-up & Referral</h2>
      <StepCard number={1} title="Schedule follow-up">
        <ul>
          <li>Before closing the consultation, set the follow-up date.</li>
          <li>The patient receives an automated reminder before the scheduled date.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Refer to another department">
        <ul>
          <li>Use <strong>HMS → Referral</strong> to refer the patient to another doctor or department.</li>
          <li>The referral note is attached to the patient's record and visible to the receiving doctor.</li>
        </ul>
      </StepCard>

      <KeyboardShortcuts
        shortcuts={[
          { keys: "Ctrl + P", action: "Open prescription panel" },
          { keys: "Ctrl + D", action: "Add diagnosis" },
          { keys: "Ctrl + L", action: "Order lab investigation" },
          { keys: "Ctrl + S", action: "Save & sign" },
          { keys: "Ctrl + →", action: "Next patient in queue" },
        ]}
      />
    </GuideLayout>
  );
};

export default DoctorGuide;
