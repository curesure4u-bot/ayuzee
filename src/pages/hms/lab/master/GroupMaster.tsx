import LabMasterPage from "./LabMasterPage";

const mockGroups = [
  { id: "1", name: "Aminoglycosides" },
  { id: "2", name: "Carbapenems" },
  { id: "3", name: "Cephalosporines" },
  { id: "4", name: "Cephems" },
  { id: "5", name: "Fluoroquinolones" },
  { id: "6", name: "Folate Pathway Inhibitor" },
  { id: "7", name: "Glycopeptide" },
  { id: "8", name: "Macrolide" },
  { id: "9", name: "Monobactam" },
  { id: "10", name: "Nitrofurantoins" },
  { id: "11", name: "oxazolidinone" },
  { id: "12", name: "Penicillins" },
  { id: "13", name: "Penillin/B Lactam Inhibitors" },
  { id: "14", name: "Tetracycline" },
];

const GroupMaster = () => (
  <LabMasterPage
    title="Group"
    entityName="Group"
    columns={[{ key: "name", label: "Group" }]}
    initialItems={mockGroups}
  />
);

export default GroupMaster;
