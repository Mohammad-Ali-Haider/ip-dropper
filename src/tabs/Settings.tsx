import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import "../css/Settings.css";

function Settings() {
  const { theme, setTheme } = useTheme();
  const [autoConnect, setAutoConnect] = useState(() => {
    const saved = localStorage.getItem('settings.autoConnect');
    return saved ? JSON.parse(saved) : true;
  });
  
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('settings.notifications');
    return saved ? JSON.parse(saved) : true;
  });
  
  const [deviceLimit, setDeviceLimit] = useState(() => {
    const saved = localStorage.getItem('settings.deviceLimit');
    return saved || "50";
  });
  
  const [refreshRate, setRefreshRate] = useState(() => {
    const saved = localStorage.getItem('settings.refreshRate');
    return saved || "5";
  });

  // Save settings whenever they change
  useEffect(() => {
    localStorage.setItem('settings.autoConnect', JSON.stringify(autoConnect));
  }, [autoConnect]);

  useEffect(() => {
    localStorage.setItem('settings.notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('settings.deviceLimit', deviceLimit);
  }, [deviceLimit]);

  useEffect(() => {
    localStorage.setItem('settings.refreshRate', refreshRate);
  }, [refreshRate]);

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
            <span>Auto-Connect Devices</span>
            <span className="setting-description">Automatically connect to previously paired devices</span>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={autoConnect}
              onChange={(e) => setAutoConnect(e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>

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

      {/* Notification Settings */}
      <div className="settings-section">
        <h3>Notifications</h3>
        <div className="setting-item">
          <div className="setting-label">
            <span>Enable Notifications</span>
            <span className="setting-description">Get notified when devices connect or disconnect</span>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      {/* Device Management */}
      <div className="settings-section">
        <h3>Device Management</h3>
        <div className="setting-item">
          <div className="setting-label">
            <span>Device Limit</span>
            <span className="setting-description">Maximum number of devices to track</span>
          </div>
          <select
            value={deviceLimit}
            onChange={(e) => setDeviceLimit(e.target.value)}
            className="setting-select"
          >
            <option value="10">10 devices</option>
            <option value="25">25 devices</option>
            <option value="50">50 devices</option>
            <option value="100">100 devices</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default Settings;
