import { useState, useEffect } from "react";
import ListGroup from "./components/ListGroup";
import Sidebar from "./components/Sidebar";
import Home from "./tabs/Home";
import Devices from "./tabs/Devices";
import Received from "./tabs/Received";
import History from "./tabs/History";
import Settings from "./tabs/Settings";
import About from "./tabs/About";
import "./css/App.css";
import "./css/markdown.css";
import { Device } from "./tabs/Devices";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  const pages = ["Home", "Devices", "Received", "History", "Settings", "About"];
  const [activeTab, setActiveTab] = useState(0);
  const [devices, setDevices] = useState<Device[]>(() => {
    const savedDevices = localStorage.getItem('devices');
    return savedDevices ? JSON.parse(savedDevices) : [];
  });
  const [isReceiving, setIsReceiving] = useState(false);

  useEffect(() => {
    localStorage.setItem('devices', JSON.stringify(devices));
  }, [devices]);

  return (
    <ThemeProvider>
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <div className="col-lg-2 col-12 p-0 sidebar-container">
            <Sidebar>
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
                items={pages}
                selectedItem={activeTab}
                onSelectItem={setActiveTab}
              />
            </Sidebar>
          </div>

          {/* Main Content */}
          <div className="col-lg-10 col-12 main-content">
            <div className="tab-content">
              {pages.map((page, index) => (
                <div
                  key={page}
                  className={`tab-pane fade ${
                    activeTab === index ? "show active" : ""
                  }`}
                >
                  <h2 className="mb-4">{page}</h2>

                  {page === "Home" && <Home />}
                  {page === "Devices" && (
                    <Devices devices={devices} setDevices={setDevices} />
                  )}
                  {page === "Received" && <Received />}
                  {page === "History" && <History />}
                  {page === "Settings" && <Settings />}
                  {page === "About" && <About />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
