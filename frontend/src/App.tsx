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

  const handleAccept = async (file: {
    fileName: string;
    fileSize: number;
    downloadUrl: string;
  }) => {
    try {
      console.log("Accept clicked for file:", file);

      // Get the API base URL from environment or use default localhost
      const apiBaseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
      console.log("API Base URL:", apiBaseUrl);

      // Ensure the download URL starts with a slash if it's a relative path
      const downloadPath = file.downloadUrl.startsWith("/")
        ? file.downloadUrl
        : `/${file.downloadUrl}`;
      console.log("Download path:", downloadPath);

      // Construct the full URL
      let fullUrl = "";
      if (apiBaseUrl.endsWith("/") && downloadPath.startsWith("/")) {
        // Avoid double slashes
        fullUrl = `${apiBaseUrl}${downloadPath.substring(1)}`;
      } else if (!apiBaseUrl.endsWith("/") && !downloadPath.startsWith("/")) {
        // Add slash if missing
        fullUrl = `${apiBaseUrl}/${downloadPath}`;
      } else {
        // Normal case
        fullUrl = `${apiBaseUrl}${downloadPath}`;
      }

      console.log("Full download URL:", fullUrl);

      // Create and click the download link
      const link = document.createElement("a");
      link.href = fullUrl;
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Update state
      setIncomingFiles((prev) =>
        prev.filter((f) => f.downloadUrl !== file.downloadUrl)
      );
      if (incomingFiles.length === 1) setShowIncomingModal(false);
    } catch (error: any) {
      console.error("Error downloading file:", error);
      alert(`Error downloading file: ${error.message || "Unknown error"}`);
    }
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

  const handleAcceptAll = async () => {
    try {
      console.log("Accept All clicked for files:", incomingFiles);

      // Get the API base URL from environment or use default localhost
      const apiBaseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
      console.log("API Base URL:", apiBaseUrl);

      // Log the number of files being downloaded
      const totalFiles = incomingFiles.length;
      if (totalFiles > 1) {
        console.log(`Downloading ${totalFiles} files sequentially`);
      }

      // Create a copy of the files array to avoid issues with state updates during download
      const filesToDownload = [...incomingFiles];

      // Download files with a delay between each to avoid browser blocking
      for (let i = 0; i < filesToDownload.length; i++) {
        const file = filesToDownload[i];

        // Ensure the download URL starts with a slash if it's a relative path
        const downloadPath = file.downloadUrl.startsWith("/")
          ? file.downloadUrl
          : `/${file.downloadUrl}`;
        console.log(
          `Downloading file ${i + 1}/${filesToDownload.length}: ${
            file.fileName
          }`
        );
        console.log("Download path:", downloadPath);

        // Construct the full URL
        let fullUrl = "";
        if (apiBaseUrl.endsWith("/") && downloadPath.startsWith("/")) {
          // Avoid double slashes
          fullUrl = `${apiBaseUrl}${downloadPath.substring(1)}`;
        } else if (!apiBaseUrl.endsWith("/") && !downloadPath.startsWith("/")) {
          // Add slash if missing
          fullUrl = `${apiBaseUrl}/${downloadPath}`;
        } else {
          // Normal case
          fullUrl = `${apiBaseUrl}${downloadPath}`;
        }

        console.log("Full download URL:", fullUrl);

        // Create and click the download link
        const link = document.createElement("a");
        link.href = fullUrl;
        link.download = file.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Add a small delay between downloads to avoid browser blocking
        if (i < filesToDownload.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      // Update state after all downloads have been initiated
      setIncomingFiles([]);
      setShowIncomingModal(false);
    } catch (error: any) {
      console.error("Error downloading files:", error);
      alert(`Error downloading files: ${error.message || "Unknown error"}`);
    }
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
      console.log("File available notification received:", file);
      setIncomingFiles((prev) => [
        ...prev,
        {
          fileName: file.fileName,
          fileSize: file.fileSize,
          downloadUrl: file.downloadUrl, // Store the relative URL, we'll construct the full URL when downloading
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
