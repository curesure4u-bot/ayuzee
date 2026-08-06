import LabMasterPage from "./LabMasterPage";

const mockSamples = [
  { id: "1", group: "Sample", name: "BLOOD" },
  { id: "2", group: "Sample", name: "SERUM" },
  { id: "3", group: "Sample", name: "FLUID" },
  { id: "4", group: "Sample", name: "SPUTUM" },
  { id: "5", group: "Sample", name: "URINE" },
  { id: "6", group: "Sample", name: "BLOOD (EDTA)" },
  { id: "7", group: "Sample", name: "SEMEN" },
  { id: "8", group: "Sample", name: "STOOL" },
  { id: "9", group: "Sample", name: "PUS" },
  { id: "10", group: "Sample", name: "PERICARDIAL FLUID" },
  { id: "11", group: "Sample", name: "GASTRIC LAVAGE" },
  { id: "12", group: "Sample", name: "SCRAP" },
  { id: "13", group: "Sample", name: "ASITIC FLUID PANEL" },
  { id: "14", group: "Sample", name: "GAL" },
  { id: "15", group: "Sample", name: "PLEURAL FLUID" },
  { id: "16", group: "Sample", name: "PLEURAL FLUID PANEL" },
  { id: "17", group: "Sample", name: "PUS (PANEL)" },
  { id: "18", group: "Sample", name: "SAMPLE PUS" },
  { id: "19", group: "Sample", name: "PYROTINEAL FLUID" },
  { id: "20", group: "Sample", name: "PERITONEAL FLUID PANEL" },
  { id: "21", group: "Sample", name: "MONTOUX TEST" },
  { id: "22", group: "Sample", name: "CSF" },
  { id: "23", group: "Sample", name: "TISSUE" },
  { id: "24", group: "Sample", name: "SCRAPPING FOR FUNGUS" },
  { id: "25", group: "Sample", name: "ASITIC FLUID" },
  { id: "26", group: "Sample", name: "BRONCHOSCOPY LAVAGE (BAL)" },
  { id: "27", group: "Sample", name: "GASTRIC LAVAGE (GAL)" },
  { id: "28", group: "Sample", name: "KNEE JOINT FLUID" },
  { id: "29", group: "Sample", name: "PERITONIAL FILE" },
  { id: "30", group: "Sample", name: "PLEURAL FLUID" },
  { id: "31", group: "Sample", name: "BODY FLUID" },
  { id: "32", group: "Sample", name: "MONTOUX" },
  { id: "33", group: "Sample", name: "SLITSKIN" },
  { id: "34", group: "Sample", name: "VAGINAL" },
  { id: "35", group: "Sample", name: "BODYFLUID" },
  { id: "36", group: "Sample", name: "VAGINAL FLUID" },
  { id: "37", group: "Sample", name: "SYNOVIAL FLUID" },
  { id: "38", group: "Sample", name: "SLIT SKIN" },
  { id: "39", group: "Sample", name: "OTHER BODY FLUIDS" },
  { id: "40", group: "Sample", name: "OTHER SAMPLES" },
  { id: "41", group: "Sample", name: "SMEAR" },
];

const SampleMaster = () => (
  <LabMasterPage
    title="Sample"
    entityName="Sample"
    columns={[
      { key: "group", label: "Group" },
      { key: "name", label: "Sample" },
    ]}
    initialItems={mockSamples}
    hasGroupFilter
    groupOptions={[{ value: "Sample", label: "Sample" }]}
  />
);

export default SampleMaster;
