import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import ConfirmationModal from "../components/modals/ConfirmationModal";
import "../styles/Settings.css";

function Settings() {
  const { theme, setTheme } = useTheme();
  const [refreshRate, setRefreshRate] = useState(() => {
    const saved = localStorage.getItem('settings.refreshRate');
    return saved || "5";
  });

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteAction, setDeleteAction] = useState<{
    type: 'devices' | 'history' | 'received';
    title: string;
  } | null>(null);

  // Save settings whenever they change
  useEffect(() => {
    localStorage.setItem('settings.refreshRate', refreshRate);
    // Dispatch storage event for other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'settings.refreshRate',
      newValue: refreshRate
    }));
  }, [refreshRate]);

  const handleDelete = () => {
    if (!deleteAction) return;

    switch (deleteAction.type) {
      case 'devices':
        localStorage.removeItem('devices');
        break;
      case 'history':
        localStorage.removeItem('transfer-history');
        break;
      case 'received':
        localStorage.removeItem('received-transfers');
        break;
    }
    
    setShowDeleteModal(false);
    window.location.reload();
  };

  const showDeleteConfirmation = (type: 'devices' | 'history' | 'received', title: string) => {
    setDeleteAction({ type, title });
    setShowDeleteModal(true);
  };

  return (
    <div className="settings-container">
      {/* Theme Settings */}
      <div className="settings-section">
        <h3>Appearance</h3>
        <div className="setting-item">
          <div className="setting-label">
            <span>Theme</span>
            <span className="setting-description">Choose your preferred theme</span>
          </div>
          <div className="theme-buttons">
            {["dark", "light", "system"].map((t) => (
              <button
                key={t}
                className={`theme-button ${theme === t ? "active" : ""}`}
                onClick={() => setTheme(t as "dark" | "light" | "system")}
              >
                <i className={`fas fa-${t === "dark" ? "moon" : t === "light" ? "sun" : "desktop"}`} />
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Connection Settings */}
      <div className="settings-section">
        <h3>Connection</h3>
        <div className="setting-item">
          <div className="setting-label">
            <span>Device Refresh Rate</span>
            <span className="setting-description">How often to check device status (seconds)</span>
          </div>
          <select
            value={refreshRate}
            onChange={(e) => setRefreshRate(e.target.value)}
            className="setting-select"
          >
            <option value="1">1 second</option>
            <option value="5">5 seconds</option>
            <option value="10">10 seconds</option>
            <option value="30">30 seconds</option>
          </select>
        </div>
      </div>

      {/* Memory Management Section */}
      <div className="settings-section">
        <h3>Memory Management</h3>
        <div className="setting-item">
          <div className="setting-label">
            <span>Clear Application Data</span>
            <span className="setting-description">Delete stored data to free up memory</span>
          </div>
          <div className="memory-management-buttons">
            <button 
              className="danger-button" 
              onClick={() => showDeleteConfirmation('devices', 'all devices')}
            >
              <i className="fas fa-trash-alt"></i>
              Delete All Devices
            </button>
            <button 
              className="danger-button" 
              onClick={() => showDeleteConfirmation('history', 'transfer history')}
            >
              <i className="fas fa-history"></i>
              Clear Transfer History
            </button>
            <button 
              className="danger-button" 
              onClick={() => showDeleteConfirmation('received', 'received files history')}
            >
              <i className="fas fa-inbox"></i>
              Clear Received Files
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        itemName={deleteAction?.title || ''}
      />
    </div>
  );
}

export default Settings;
