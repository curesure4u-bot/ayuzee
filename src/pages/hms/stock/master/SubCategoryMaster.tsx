import MasterPage from "../components/MasterPage";

const mockSubCategories = [
  { id: "1", code: 1, name: "ANALGESIC", status: "Active" as const },
  { id: "2", code: 2, name: "MULTI-SPECIALITY CAPSULES LTD", status: "Active" as const },
  { id: "3", code: 3, name: "FORTIFY IT", status: "Active" as const },
  { id: "4", code: 4, name: "FAIRNESS", status: "Active" as const },
  { id: "5", code: 5, name: "PARASITOLOGY", status: "Active" as const },
  { id: "6", code: 6, name: "GASTRIC CARE", status: "Active" as const },
  { id: "7", code: 7, name: "KABIRAJI AYURVEDIC STORE", status: "Active" as const },
  { id: "8", code: 8, name: "LIVER CARE", status: "Active" as const },
  { id: "9", code: 9, name: "ANTI-INFLAMMATORY", status: "Active" as const },
  { id: "10", code: 10, name: "RESPIRATORY", status: "Active" as const },
  { id: "11", code: 11, name: "CARDIAC", status: "Active" as const },
  { id: "12", code: 12, name: "DIABETES", status: "Active" as const },
  { id: "13", code: 13, name: "SKIN CARE", status: "Active" as const },
  { id: "14", code: 14, name: "HAIR CARE", status: "Active" as const },
  { id: "15", code: 15, name: "JOINT CARE", status: "Active" as const },
  { id: "16", code: 16, name: "IMMUNITY", status: "Active" as const },
  { id: "17", code: 17, name: "WOMEN HEALTH", status: "Active" as const },
  { id: "18", code: 18, name: "PANCHAKARMA OILS", status: "Active" as const },
  { id: "19", code: 19, name: "AYURVEDA GENERAL", status: "Active" as const },
  { id: "20", code: 20, name: "SIDDHA GENERAL", status: "Active" as const },
];

const SubCategoryMaster = () => {
  return (
    <MasterPage
      title="Sub-Category"
      entityName="Sub-Category"
      initialItems={mockSubCategories}
    />
  );
};

export default SubCategoryMaster;
