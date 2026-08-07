import MasterPage from "../components/MasterPage";

const mockCategories = [
  { id: "1", code: 1, name: "TABLET", status: "Active" as const },
  { id: "2", code: 2, name: "CAPSULE", status: "Active" as const },
  { id: "3", code: 3, name: "SYRUP", status: "Active" as const },
  { id: "4", code: 4, name: "DROPS", status: "Active" as const },
  { id: "5", code: 5, name: "KASHAYAM", status: "Active" as const },
  { id: "6", code: 6, name: "CHURNAM", status: "Active" as const },
  { id: "7", code: 7, name: "THAILAM", status: "Active" as const },
  { id: "8", code: 8, name: "GHRITAM", status: "Active" as const },
  { id: "9", code: 9, name: "GUGGULU", status: "Active" as const },
  { id: "10", code: 10, name: "LEHYAM", status: "Active" as const },
  { id: "11", code: 11, name: "ARISHTAM", status: "Active" as const },
  { id: "12", code: 12, name: "ASAVAM", status: "Active" as const },
  { id: "13", code: 13, name: "BHASMA", status: "Active" as const },
  { id: "14", code: 14, name: "CREAM", status: "Active" as const },
  { id: "15", code: 15, name: "OTC", status: "Active" as const },
  { id: "17", code: 17, name: "INJECTION", status: "Active" as const },
  { id: "19", code: 19, name: "OINTMENT", status: "Active" as const },
  { id: "20", code: 20, name: "SOAP", status: "Active" as const },
  { id: "21", code: 21, name: "POWDER", status: "Active" as const },
  { id: "22", code: 22, name: "KASHAYA POWDER", status: "Active" as const },
  { id: "23", code: 23, name: "HOMEO TABLET", status: "Active" as const },
  { id: "24", code: 24, name: "HOMEO LIQUID", status: "Active" as const },
  { id: "25", code: 25, name: "N-MOVING", status: "Active" as const },
  { id: "26", code: 26, name: "OIL", status: "Active" as const },
  { id: "27", code: 27, name: "VATI", status: "Active" as const },
  { id: "28", code: 28, name: "LEPA", status: "Active" as const },
];

const CategoryMaster = () => {
  return (
    <MasterPage
      title="Category"
      entityName="Category"
      initialItems={mockCategories}
      stockItemColumn="product_category"
      storageKey="hms_master_category"
    />
  );
};

export default CategoryMaster;
