import LabMasterPage from "./LabMasterPage";

const mockOrganisms = [
  { id: "1", group: "Organism - Growth", name: "Candida sps" },
  { id: "2", group: "Organism - Growth", name: "Candida albicans" },
  { id: "3", group: "Organism - Growth", name: "Enterococcus sps" },
  { id: "4", group: "Organism - Growth", name: "Klebsiella sps" },
  { id: "5", group: "Organism - Growth", name: "Ecoli" },
  { id: "6", group: "Organism - Growth", name: "Pseudomonas aeruginosa" },
  { id: "7", group: "Organism - Growth", name: "Streptococcus sps" },
  { id: "8", group: "Organism - Growth", name: "Staphylococcus sps" },
  { id: "9", group: "Organism - Growth", name: "Staphylococcus aureus" },
  { id: "10", group: "Organism - Growth", name: "Proteus sps" },
  { id: "11", group: "Organism - Growth", name: "Streptococcus pneumoniae" },
  { id: "12", group: "Organism - Growth", name: "Escherichia coli" },
  { id: "13", group: "Organism - Growth", name: "Enterobacter" },
  { id: "14", group: "Organism - Growth", name: "Micro cocci" },
  { id: "15", group: "Organism - Growth", name: "Normal Flora of URT grown in the culture." },
  { id: "16", group: "Organism - Growth", name: "Acinetobacter sps" },
  { id: "17", group: "Organism - Growth", name: "Coagulase Negative staphylococcus" },
  { id: "18", group: "Organism - Growth", name: "Proteus vulgaris" },
  { id: "19", group: "Organism - Growth", name: "Proteus mirrabilis" },
  { id: "20", group: "Organism - No Growth", name: "No growth obtained in culture." },
  { id: "21", group: "Organism - No Growth", name: "No significant growth in culture." },
  { id: "22", group: "Organism - No Growth", name: "No Enteric and Non Enteric organisms grown in culture after 5 days of incubation" },
  { id: "23", group: "Organism - No Growth", name: "No pathogens isolated in culture. Only normal flora of GIT grown in culture" },
  { id: "24", group: "Organism - No Growth", name: "No pathogens isolated in culture. Only normal flora of URT grown in culture" },
  { id: "25", group: "Organism - No Growth", name: "Mixed growth of organisms seen(Contaminants). To rule out infection kindly repeat sample with clean catch midstream Urine sample." },
];

const OrganismMaster = () => (
  <LabMasterPage
    title="Organism"
    entityName="Organism"
    columns={[
      { key: "group", label: "Group" },
      { key: "name", label: "Organism" },
    ]}
    initialItems={mockOrganisms}
    hasGroupFilter
    groupOptions={[
      { value: "Organism - Growth", label: "Organism - Growth" },
      { value: "Organism - No Growth", label: "Organism - No Growth" },
    ]}
  />
);

export default OrganismMaster;
