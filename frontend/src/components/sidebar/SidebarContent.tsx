import ListGroup from "../common/ListGroup";
import YourDeviceCard from "../device/YourDeviceCard";
import { PAGES } from "../../constants/navigation";
import { ReceivingButton } from "./components/ReceivingButton";

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
  setActiveTab,
}: SidebarContentProps) {
  const onReceivingToggle = () => {
    setIsReceiving(!isReceiving);
  };

  return (
    <>
      <h1 className="sidebar-title">
        <i className="fas fa-network-wired me-2"></i>
        IP Dropper
      </h1>
      <ReceivingButton
        isReceiving={isReceiving}
        onToggle={onReceivingToggle}
      />
      <ListGroup
        items={PAGES}
        selectedItem={activeTab}
        onSelectItem={setActiveTab}
      />
      <YourDeviceCard />
    </>
  );
}

export default SidebarContent;
