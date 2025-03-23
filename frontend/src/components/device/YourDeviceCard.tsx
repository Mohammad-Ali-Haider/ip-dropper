import { useEffect, useState } from "react";
import { DeviceType } from "../../types/device";
import "../../styles/YourDeviceCard.css";
import { API_BASE_URL } from "../../constants/api";
import { detectClientInfo, getDeviceIcon } from "./deviceUtils";
import NetworkInterfacesModal from "./NetworkInterfacesModal";

interface NetworkInterface {
  name: string;
  ipv4?: string;
  ipv6?: string;
  isInternal?: boolean;
}

interface DeviceInfo {
  name: string;
  type: DeviceType;
  interfaces: NetworkInterface[];
}

function YourDeviceCard() {
  const [deviceName, setDeviceName] = useState<string>("Loading...");
  const [deviceType, setDeviceType] = useState<DeviceType | "loading">("loading");
  const [interfaces, setInterfaces] = useState<NetworkInterface[]>([]);
  const [showModal, setShowModal] = useState(false);

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
        setDeviceName(data.name);
        setDeviceType(data.type);
        setInterfaces(data.interfaces || []);
      } catch (error) {
        console.error("Error fetching device info:", error);
        const { deviceType: detectedType, deviceName: detectedName } =
          detectClientInfo();
        setDeviceType(detectedType);
        setDeviceName(detectedName);
      }
    };

    fetchDeviceInfo();
  }, []);

  return (
    <>
      <div 
        className="your-device-card"
        onClick={() => setShowModal(true)}
      >
        <div className="device-icon">
          <i className={`fab ${getDeviceIcon(deviceType)}`}></i>
        </div>
        <div className="device-info">
          <h5 className="device-name">{deviceName}</h5>
        </div>
      </div>

      <NetworkInterfacesModal
        show={showModal}
        onHide={() => setShowModal(false)}
        interfaces={interfaces}
      />
    </>
  );
}

export default YourDeviceCard;
