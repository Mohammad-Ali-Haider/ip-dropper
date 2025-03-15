import { PageType } from "../constants/navigation";
import { Device } from "../types/device";
import Home from "../tabs/Home";
import Devices from "../tabs/Devices";
import Received from "../tabs/Received";
import History from "../tabs/History";
import Settings from "../tabs/Settings";
import About from "../tabs/About";

interface TabContentProps {
  page: PageType;
  activeTab: number;
  index: number;
  devices: Device[];
  setDevices: React.Dispatch<React.SetStateAction<Device[]>>;
}

function TabContent({ page, activeTab, index, devices, setDevices }: TabContentProps) {
  const renderTabContent = () => {
    switch (page) {
      case "Home":
        return <Home />;
      case "Devices":
        return <Devices devices={devices} setDevices={setDevices} />;
      case "Received":
        return <Received />;
      case "History":
        return <History />;
      case "Settings":
        return <Settings />;
      case "About":
        return <About />;
      default:
        return null;
    }
  };

  return (
    <div
      key={page}
      className={`tab-pane fade ${activeTab === index ? "show active" : ""}`}
    >
      <h2 className="mb-4">{page}</h2>
      {renderTabContent()}
    </div>
  );
}

export default TabContent;