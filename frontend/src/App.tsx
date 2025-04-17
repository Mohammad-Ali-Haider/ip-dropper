import { useEffect, useState } from "react";
import Sidebar from "./components/sidebar/Sidebar";
import MainLayout from "./layouts/MainLayout";
import SidebarContent from "./components/sidebar/SidebarContent";
import TabContent from "./components/common/TabContent";
import { PAGES } from "./constants/navigation";
import { ThemeProvider } from "./context/ThemeContext";
import { websocketService } from "./services/websocketService";
import useReceiving from "./hooks/useReceiving";
import "./styles/App.css";
import "./styles/markdown.css";
import "./styles/shared.css";
import "./styles/Modal.css";

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
import IncomingFilesModal from "./components/modals/IncomingFilesModal";

function App() {
  const [incomingFiles, setIncomingFiles] = useState<
    { fileName: string; fileSize: number; downloadUrl: string }[]
  >([]);
  const [showIncomingModal, setShowIncomingModal] = useState(false);

  const handleAccept = (file: {
    fileName: string;
    fileSize: number;
    downloadUrl: string;
  }) => {
    const link = document.createElement("a");
    link.href = file.downloadUrl;
    link.download = file.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIncomingFiles((prev) =>
      prev.filter((f) => f.downloadUrl !== file.downloadUrl)
    );
    if (incomingFiles.length === 1) setShowIncomingModal(false);
  };

  const handleReject = (file: {
    fileName: string;
    fileSize: number;
    downloadUrl: string;
  }) => {
    setIncomingFiles((prev) =>
      prev.filter((f) => f.downloadUrl !== file.downloadUrl)
    );
    if (incomingFiles.length === 1) setShowIncomingModal(false);
  };

  const handleAcceptAll = () => {
    incomingFiles.forEach((file) => {
      const link = document.createElement("a");
      link.href = file.downloadUrl;
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
    setIncomingFiles([]);
    setShowIncomingModal(false);
  };

  const handleRejectAll = () => {
    setIncomingFiles([]);
    setShowIncomingModal(false);
  };

  // Initialize active tab from localStorage, defaulting to 0
  const [activeTab, setActiveTab] = useState(() =>
    JSON.parse(localStorage.getItem("app.activeTab") ?? "0")
  );

  // const [activeTab, setActiveTab] = useState(0);

  const [isReceiving, setIsReceiving] = useReceiving();

  // Establish WebSocket connection on mount
  useEffect(() => {
    websocketService.setOnFileAvailable((file) => {
      setIncomingFiles((prev) => [
        ...prev,
        {
          fileName: file.fileName,
          fileSize: file.fileSize,
          downloadUrl: `${import.meta.env.VITE_API_BASE_URL || ""}${
            file.downloadUrl
          }`,
        },
      ]);
      setShowIncomingModal(true);
    });

    websocketService.connect();

    return () => websocketService.disconnect();
  }, []);

  // Persist active tab changes to localStorage
  useEffect(() => {
    localStorage.setItem("app.activeTab", JSON.stringify(activeTab));
  }, [activeTab]);

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
      <IncomingFilesModal
        show={showIncomingModal}
        files={incomingFiles}
        onAccept={handleAccept}
        onReject={handleReject}
        onAcceptAll={handleAcceptAll}
        onRejectAll={handleRejectAll}
        onHide={() => setShowIncomingModal(false)}
      />
    </ThemeProvider>
  );
}

export default App;
