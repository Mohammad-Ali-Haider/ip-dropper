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

/**
 * Root component of the application.
 * Manages the application's main layout, theme, and websocket connection.
 * 
 * Features:
 * - Persists active tab and receiving state in localStorage
 * - Manages WebSocket connection for file transfer functionality
 * - Handles theme provider wrapper
 * - Controls main layout with sidebar and content area
 */
function App() {
  // Initialize active tab from localStorage, defaulting to 0
  const [activeTab, setActiveTab] = useState(() => 
    JSON.parse(localStorage.getItem("app.activeTab") ?? "0")
  );

  // Initialize receiving state from localStorage, defaulting to false
  const [isReceiving, setIsReceiving] = useState(() => 
    JSON.parse(localStorage.getItem("app.isReceiving") ?? "false")
  );

  // Establish WebSocket connection on mount
  useEffect(() => {
    websocketService.connect();
    return () => websocketService.disconnect();
  }, []);

  // Persist active tab changes to localStorage
  useEffect(() => {
    localStorage.setItem("app.activeTab", JSON.stringify(activeTab));
  }, [activeTab]);

  // Persist receiving state changes and notify WebSocket server
  useEffect(() => {
    localStorage.setItem("app.isReceiving", JSON.stringify(isReceiving));
    
    if (websocketService.getConnectionStatus()) {
      websocketService.send({
        type: "receiver",
        action: isReceiving ? "start" : "stop",
      });
    }
  }, [isReceiving]);

  return (
    <ThemeProvider>
      <MainLayout 
        sidebar={
          <Sidebar>
            <SidebarContent
              isReceiving={isReceiving}
              setIsReceiving={setIsReceiving}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </Sidebar>
        }
        content={
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
        }
      />
    </ThemeProvider>
  );
}

export default App;
