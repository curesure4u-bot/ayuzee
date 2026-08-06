import LabMasterPage from "./LabMasterPage";

const mockSmears = [
  { id: "1", group: "Smear", name: "gram stain" },
  { id: "2", group: "Smear", name: "Acid fast stain" },
];

const SmearMaster = () => (
  <LabMasterPage
    title="Smear"
    entityName="Smear"
    columns={[
      { key: "group", label: "Group" },
      { key: "name", label: "Smear" },
    ]}
    initialItems={mockSmears}
    hasGroupFilter
    groupOptions={[{ value: "Smear", label: "Smear" }]}
  />
);

export default SmearMaster;
