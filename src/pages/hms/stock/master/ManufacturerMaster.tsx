import MasterPage from "../components/MasterPage";

const mockManufacturers = [
  { id: "1", code: 1, name: "APPLE THERAPE", status: "Active" as const },
  { id: "2", code: 2, name: "BIOWARRIOR", status: "Active" as const },
  { id: "3", code: 3, name: "PIONEER", status: "Active" as const },
  { id: "4", code: 4, name: "JAMMIS", status: "Active" as const },
  { id: "5", code: 5, name: "KNOLL", status: "Active" as const },
  { id: "6", code: 6, name: "BEIERSDORF", status: "Active" as const },
  { id: "7", code: 7, name: "CADILA", status: "Active" as const },
  { id: "8", code: 8, name: "HIMALAYA", status: "Active" as const },
  { id: "9", code: 9, name: "DABUR", status: "Active" as const },
  { id: "10", code: 10, name: "KOTTAKKAL", status: "Active" as const },
  { id: "11", code: 11, name: "ALSHIFA", status: "Active" as const },
  { id: "12", code: 12, name: "SANJEEVI", status: "Active" as const },
  { id: "13", code: 13, name: "HAMDARD", status: "Active" as const },
  { id: "14", code: 14, name: "BAIDYANATH", status: "Active" as const },
  { id: "15", code: 15, name: "ZANDU", status: "Active" as const },
];

const ManufacturerMaster = () => {
  return (
    <MasterPage
      title="Manufacturer"
      entityName="Manufacturer"
      initialItems={mockManufacturers}
    />
  );
};

export default ManufacturerMaster;
