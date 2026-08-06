import MasterPage from "../components/MasterPage";

const mockIndications = [
  { id: "1", code: 1, name: "FEVER", status: "Active" as const },
  { id: "2", code: 2, name: "PAIN RELIEF", status: "Active" as const },
  { id: "3", code: 3, name: "ARTHRITIS", status: "Active" as const },
  { id: "4", code: 4, name: "DIABETES", status: "Active" as const },
  { id: "5", code: 5, name: "HYPERTENSION", status: "Active" as const },
  { id: "6", code: 6, name: "GASTRIC DISORDERS", status: "Active" as const },
  { id: "7", code: 7, name: "SKIN DISEASES", status: "Active" as const },
  { id: "8", code: 8, name: "RESPIRATORY", status: "Active" as const },
  { id: "9", code: 9, name: "VATA DISORDERS", status: "Active" as const },
  { id: "10", code: 10, name: "PITTA DISORDERS", status: "Active" as const },
  { id: "11", code: 11, name: "KAPHA DISORDERS", status: "Active" as const },
  { id: "12", code: 12, name: "DIGESTIVE", status: "Active" as const },
  { id: "13", code: 13, name: "IMMUNITY BOOSTER", status: "Active" as const },
  { id: "14", code: 14, name: "NEUROLOGICAL", status: "Active" as const },
  { id: "15", code: 15, name: "REPRODUCTIVE", status: "Active" as const },
];

const IndicationMaster = () => {
  return (
    <MasterPage
      title="Indication"
      entityName="Indication"
      initialItems={mockIndications}
    />
  );
};

export default IndicationMaster;
