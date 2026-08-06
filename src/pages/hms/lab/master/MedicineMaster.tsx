import LabMasterPage from "./LabMasterPage";

const mockMedicines = [
  { id: "1", group: "Aminoglycosides", name: "Amikacin", extra: "" },
  { id: "2", group: "Penillin/B Lactam Inhibitors", name: "Amoxicillin/clavulanic acid", extra: "" },
  { id: "3", group: "Penicillins", name: "Amoxicillin", extra: "" },
  { id: "4", group: "Penicillins", name: "Ampicillin", extra: "" },
  { id: "5", group: "Penillin/B Lactam Inhibitors", name: "Ampicillin/Sulbactam", extra: "" },
  { id: "6", group: "Macrolide", name: "Azithromycin", extra: "" },
  { id: "7", group: "Cephems", name: "Cefador", extra: "" },
  { id: "8", group: "Cephalosporines", name: "Cefazolin", extra: "" },
  { id: "9", group: "Cephems", name: "Cefixime", extra: "" },
  { id: "10", group: "Cephems", name: "Cefotero", extra: "" },
  { id: "11", group: "Cephems", name: "Cefoperazone", extra: "" },
  { id: "12", group: "Cephalosporines", name: "Cefoperazone/Sulbactam", extra: "" },
  { id: "13", group: "Cephems", name: "Cefotaxime", extra: "" },
  { id: "14", group: "Cephalosporines", name: "Ceftazidine", extra: "" },
  { id: "15", group: "Cephalosporines", name: "Ceftriaxone", extra: "" },
  { id: "16", group: "Cephalosporines", name: "Ceftriaxone/Sulbactam", extra: "" },
  { id: "17", group: "Cephems", name: "Cefuroxime", extra: "" },
  { id: "18", group: "Cephems", name: "Cephalexin", extra: "" },
  { id: "19", group: "Cephalosporines", name: "Cephalothin", extra: "" },
  { id: "20", group: "Fluoroquinolones", name: "Ciprofloxacin", extra: "" },
  { id: "21", group: "Penicillins", name: "Cloxacillin", extra: "" },
  { id: "22", group: "Fluoroquinolones", name: "Co-Trimaxazole", extra: "" },
  { id: "23", group: "Carbapenems", name: "Eratpenem", extra: "" },
  { id: "24", group: "Macrolide", name: "Erythromycin", extra: "" },
  { id: "25", group: "Fluoroquinolones", name: "Gemifloxacin", extra: "" },
  { id: "26", group: "Aminoglycosides", name: "Gentamicin", extra: "" },
  { id: "27", group: "Carbapenems", name: "Imipenem", extra: "" },
  { id: "28", group: "Fluoroquinolones", name: "Levofloxacin", extra: "" },
  { id: "29", group: "Glycopeptide", name: "Lincomycin", extra: "" },
  { id: "30", group: "oxazolidinone", name: "Linezolid", extra: "" },
  { id: "31", group: "Carbapenems", name: "Meropenem", extra: "" },
  { id: "32", group: "Penicillins", name: "Methicillin", extra: "" },
  { id: "33", group: "Fluoroquinolones", name: "Moxifloxacin", extra: "" },
  { id: "34", group: "Nitrofurantoins", name: "Nitrofurantin", extra: "" },
  { id: "35", group: "Fluoroquinolones", name: "Norfloxacin", extra: "" },
  { id: "36", group: "Fluoroquinolones", name: "Ofloxacin", extra: "" },
  { id: "37", group: "Penicillins", name: "Phoracilin", extra: "" },
  { id: "38", group: "Penillin/B Lactam Inhibitors", name: "Piperacillin/ tazobactam", extra: "" },
  { id: "39", group: "Macrolide", name: "Roxithromycin", extra: "" },
  { id: "40", group: "Fluoroquinolones", name: "Sparfloxacin", extra: "" },
  { id: "41", group: "Glycopeptide", name: "Teicoplanin", extra: "" },
  { id: "42", group: "Tetracycline", name: "Tetracycline", extra: "" },
  { id: "43", group: "Penicillins", name: "Ticarcillin", extra: "" },
  { id: "44", group: "Penillin/B Lactam Inhibitors", name: "Ticarcillin/Clavulanic acid", extra: "" },
  { id: "45", group: "Aminoglycosides", name: "Tobramycin", extra: "" },
  { id: "46", group: "Glycopeptide", name: "Vancomycin", extra: "" },
];

const MedicineMaster = () => (
  <LabMasterPage
    title="Medicine"
    entityName="Medicine"
    columns={[
      { key: "group", label: "Group" },
      { key: "name", label: "Medicine" },
      { key: "extra", label: "Disc Content" },
    ]}
    initialItems={mockMedicines}
    extraFieldLabel="Disc Content"
    extraFieldPlaceholder="Disc. Content"
  />
);

export default MedicineMaster;
