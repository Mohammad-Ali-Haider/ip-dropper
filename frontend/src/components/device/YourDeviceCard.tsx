import { useEffect, useState } from 'react';
import { DeviceType } from '../../types/device';
import '../../styles/YourDeviceCard.css';
import { API_BASE_URL } from '../../constants/api';

function YourDeviceCard() {
  const [ipAddress, setIpAddress] = useState<string>('Loading...');
  const [deviceName, setDeviceName] = useState<string>('Loading...');
  const [deviceType, setDeviceType] = useState<DeviceType>('windows');

  useEffect(() => {
    const fetchDeviceInfo = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/devices/current`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
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
        console.error('Error fetching device info:', error);
        // Fallback to client-side detection
        detectClientInfo();
      }
    };

    fetchDeviceInfo();
  }, []);

  // Fallback client-side detection
  const detectClientInfo = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('mac')) {
      setDeviceType('mac');
      setDeviceName('Mac');
    } else if (userAgent.includes('linux')) {
      setDeviceType('linux');
      setDeviceName('Linux');
    } else if (userAgent.includes('win')) {
      setDeviceType('windows');
      setDeviceName('Windows');
    }
  };

  const getDeviceIcon = () => {
    switch (deviceType) {
      case "windows":
        return "fa-windows";
      case "mac":
        return "fa-apple";
      case "linux":
        return "fa-linux";
      default:
        return "fa-computer";
    }
  };

  return (
    <div className="your-device-card">
      <div className="device-icon">
        <i className={`fab ${getDeviceIcon()}`}></i>
      </div>
      <div className="device-info">
        <h5 className="device-name">{deviceName}</h5>
        <p className="device-ip">{ipAddress}</p>
      </div>
    </div>
  );
}

export default YourDeviceCard;
