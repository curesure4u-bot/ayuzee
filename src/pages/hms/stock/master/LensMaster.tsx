import MasterPage from "../components/MasterPage";

const mockLens = [
  { id: "1", code: 1, name: "SINGLE VISION - CR39", status: "Active" as const },
  { id: "2", code: 2, name: "BIFOCAL - ROUND TOP", status: "Active" as const },
  { id: "3", code: 3, name: "PROGRESSIVE - STANDARD", status: "Active" as const },
  { id: "4", code: 4, name: "PROGRESSIVE - PREMIUM", status: "Active" as const },
  { id: "5", code: 5, name: "TORIC - CONTACT LENS", status: "Active" as const },
  { id: "6", code: 6, name: "ANTI-REFLECTIVE COATED", status: "Active" as const },
  { id: "7", code: 7, name: "PHOTOCHROMIC", status: "Active" as const },
  { id: "8", code: 8, name: "BLUE CUT LENS", status: "Active" as const },
];

const LensMaster = () => {
  return (
    <MasterPage
      title="Lens"
      entityName="Lens"
      initialItems={mockLens}
      storageKey="hms_master_lens"
    />
  );
};

export default LensMaster;
