import MasterPage from "../components/MasterPage";

const mockFrames = [
  { id: "1", code: 1, name: "FULL FRAME - METAL", status: "Active" as const },
  { id: "2", code: 2, name: "HALF FRAME - PLASTIC", status: "Active" as const },
  { id: "3", code: 3, name: "RIMLESS - TITANIUM", status: "Active" as const },
  { id: "4", code: 4, name: "SEMI-RIMLESS - STEEL", status: "Active" as const },
  { id: "5", code: 5, name: "AVIATOR FRAME", status: "Active" as const },
  { id: "6", code: 6, name: "ROUND FRAME - ACETATE", status: "Active" as const },
  { id: "7", code: 7, name: "CAT EYE FRAME", status: "Active" as const },
  { id: "8", code: 8, name: "SPORTS FRAME", status: "Active" as const },
];

const FramesMaster = () => {
  return (
    <MasterPage
      title="Frames"
      entityName="Frame"
      initialItems={mockFrames}
      storageKey="hms_master_frames"
    />
  );
};

export default FramesMaster;
