import MasterPage from "../components/MasterPage";

const mockPharmNames = [
  { id: "1", code: 1, name: "PARACETAMOL", status: "Active" as const },
  { id: "2", code: 2, name: "IBUPROFEN", status: "Active" as const },
  { id: "3", code: 3, name: "AMOXICILLIN", status: "Active" as const },
  { id: "4", code: 4, name: "METFORMIN", status: "Active" as const },
  { id: "5", code: 5, name: "RANITIDINE", status: "Active" as const },
  { id: "6", code: 6, name: "ASHWAGANDHA", status: "Active" as const },
  { id: "7", code: 7, name: "GUGGULU", status: "Active" as const },
  { id: "8", code: 8, name: "TRIPHALA", status: "Active" as const },
  { id: "9", code: 9, name: "BRAHMI", status: "Active" as const },
  { id: "10", code: 10, name: "SHATAVARI", status: "Active" as const },
  { id: "11", code: 11, name: "NEEM", status: "Active" as const },
  { id: "12", code: 12, name: "TURMERIC EXTRACT", status: "Active" as const },
  { id: "13", code: 13, name: "AMALAKI", status: "Active" as const },
  { id: "14", code: 14, name: "BALA", status: "Active" as const },
  { id: "15", code: 15, name: "VIDANGA", status: "Active" as const },
];

const PharmacologicalNameMaster = () => {
  return (
    <MasterPage
      title="Pharmacological Name"
      entityName="Pharmacological Name"
      initialItems={mockPharmNames}
    />
  );
};

export default PharmacologicalNameMaster;
