import MasterPage from "../components/MasterPage";

const mockMarketedBy = [
  { id: "4", code: 4, name: "DORPHYLL", status: "Active" as const },
  { id: "5", code: 5, name: "VOLINI", status: "Active" as const },
  { id: "6", code: 6, name: "R.R. PHARMA,NELLORE", status: "Active" as const },
  { id: "7", code: 7, name: "SHREE MURUGAN AGENCIES", status: "Active" as const },
  { id: "8", code: 8, name: "LIVA HEALTHCARE", status: "Active" as const },
  { id: "9", code: 9, name: "APPLE THERAPEUTICS PVT LTD", status: "Active" as const },
  { id: "10", code: 10, name: "TRADEMARK UNDER REGISTRATION", status: "Active" as const },
  { id: "11", code: 11, name: "HIMALAYA DRUG COMPANY", status: "Active" as const },
  { id: "12", code: 12, name: "DABUR INDIA LTD", status: "Active" as const },
  { id: "13", code: 13, name: "KOTTAKKAL ARYA VAIDYA SALA", status: "Active" as const },
];

const MarketedByMaster = () => {
  return (
    <MasterPage
      title="Marketed By"
      entityName="Marketed By"
      initialItems={mockMarketedBy}
      storageKey="hms_master_marketed_by"
    />
  );
};

export default MarketedByMaster;
