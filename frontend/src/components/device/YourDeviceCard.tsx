import { useEffect, useState } from "react";
import { DeviceType } from "../../types/device";
import "../../styles/YourDeviceCard.css";
import { API_BASE_URL } from "../../constants/api";
import { detectClientInfo, getDeviceIcon } from "./deviceUtils";

function YourDeviceCard() {
  const [ipAddress, setIpAddress] = useState<string>("Loading...");
  const [deviceName, setDeviceName] = useState<string>("Loading...");
  const [deviceType, setDeviceType] = useState<DeviceType | "loading">("loading");

  useEffect(() => {
    const fetchDeviceInfo = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/devices/current`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setIpAddress(data.ipaddress);
        setDeviceName(data.name);
        setDeviceType(data.type);
      } catch (error) {
        console.error("Error fetching device info:", error);
        // Fallback to client-side detection
        const { deviceType: detectedType, deviceName: detectedName } =
          detectClientInfo();
        setDeviceType(detectedType);
        setDeviceName(detectedName);
      }
    };

    fetchDeviceInfo();
  }, []);

  return (
    <div className="your-device-card">
      <div className="device-icon">
        <i className={`fab ${getDeviceIcon(deviceType)}`}></i>
      </div>
      <div className="device-info">
        <h5 className="device-name">{deviceName}</h5>
        <p className="device-ip">{ipAddress}</p>
      </div>
    </div>
  );
}

export default YourDeviceCard;
