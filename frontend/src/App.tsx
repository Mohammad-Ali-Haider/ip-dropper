import { useEffect, useState } from "react";
import Sidebar from "./components/sidebar/Sidebar";
import MainLayout from "./layouts/MainLayout";
import SidebarContent from "./components/sidebar/SidebarContent";
import TabContent from "./components/common/TabContent";
import { PAGES } from "./constants/navigation";
import { ThemeProvider } from "./context/ThemeContext";
import { websocketService } from "./services/websocketService";
import "./styles/App.css";
import "./styles/markdown.css";
import "./styles/shared.css";

function App() {
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem("app.activeTab");
    return saved ? JSON.parse(saved) : 0;
  });

  const [isReceiving, setIsReceiving] = useState(() => {
    const saved = localStorage.getItem("app.isReceiving");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    websocketService.connect();

    const syncReceivingState = () => {
      websocketService.send({
        type: "receiver",
        action: isReceiving ? "start" : "stop",
      });
    };

    // Add a small delay to ensure WebSocket is connected
    const syncTimeout = setTimeout(syncReceivingState, 1000);

    return () => {
      clearTimeout(syncTimeout);
      websocketService.disconnect();
    };
  }, []); // Initial setup

  useEffect(() => {
    localStorage.setItem("app.activeTab", JSON.stringify(activeTab));
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem("app.isReceiving", JSON.stringify(isReceiving));

    websocketService.send({
      type: "receiver",
      action: isReceiving ? "start" : "stop",
    });
  }, [isReceiving]);

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
        />
      ))}
    </div>
  );

  return (
    <ThemeProvider>
      <MainLayout sidebar={sidebarContent} content={mainContent} />
    </ThemeProvider>
  );
}

export default App;
