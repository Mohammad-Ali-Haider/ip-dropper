import { useState } from "react";
import Sidebar from "./components/Sidebar";
import MainLayout from "./layouts/MainLayout";
import SidebarContent from "./components/SidebarContent";
import TabContent from "./components/TabContent";
import { useDevices } from "./hooks/useDevices";
import { PAGES } from "./constants/navigation";
import { ThemeProvider } from "./context/ThemeContext";
import "./css/App.css";
import "./css/markdown.css";

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [isReceiving, setIsReceiving] = useState(false);
  const { devices, setDevices } = useDevices();

  const sidebarContent = (
    <Sidebar>
      <SidebarContent
        isReceiving={isReceiving}
        setIsReceiving={setIsReceiving}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </Sidebar>
  );

  const mainContent = (
    <div className="tab-content">
      {PAGES.map((page, index) => (
        <TabContent
          key={page}
          page={page}
          activeTab={activeTab}
          index={index}
          devices={devices}
          setDevices={setDevices}
        />
      ))}
    </div>
  );

  return (
    <ThemeProvider>
      <MainLayout
        sidebar={sidebarContent}
        content={mainContent}
      />
    </ThemeProvider>
  );
}

export default App;
