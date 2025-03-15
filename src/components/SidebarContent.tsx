import ListGroup from "./ListGroup";
import { PAGES } from "../constants/navigation";

interface SidebarContentProps {
  isReceiving: boolean;
  setIsReceiving: (value: boolean) => void;
  activeTab: number;
  setActiveTab: (index: number) => void;
}

function SidebarContent({ 
  isReceiving, 
  setIsReceiving, 
  activeTab, 
  setActiveTab 
}: SidebarContentProps) {
  return (
    <>
      <h1 className="sidebar-title">
        <i className="fas fa-network-wired me-2"></i>
        IP Dropper
      </h1>
      <button
        className={`receiving-btn ${isReceiving ? "active" : ""}`}
        onClick={() => setIsReceiving(!isReceiving)}
      >
        <i className="fas fa-wifi"></i>
        Receiving
      </button>
      <ListGroup
        items={PAGES}
        selectedItem={activeTab}
        onSelectItem={setActiveTab}
      />
    </>
  );
}

export default SidebarContent;