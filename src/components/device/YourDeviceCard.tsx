import { useState, useEffect } from 'react';
import { DeviceType } from '../../types/device';
import '../../styles/YourDeviceCard.css';

function YourDeviceCard() {
  const [ipAddress, setIpAddress] = useState<string>('Loading...');
  const [deviceName, setDeviceName] = useState('Unknown Device');
  const [deviceType, setDeviceType] = useState<DeviceType>('other');

  useEffect(() => {
    // Get device type based on user agent
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('mac')) {
      setDeviceType('mac' as DeviceType);
      setDeviceName('Mac'); // Simplified name
    } else if (userAgent.includes('linux')) {
      setDeviceType('linux' as DeviceType);
      setDeviceName('Linux'); // Simplified name
    } else if (userAgent.includes('win')) {
      setDeviceType('windows' as DeviceType);
      setDeviceName('Windows'); // Simplified name
    }

    // Get IP address using a STUN server
    const getIpAddress = async () => {
      try {
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        pc.createDataChannel(''); // Create a data channel to trigger candidate gathering

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        pc.onicecandidate = (event) => {
          if (!event.candidate) return;

          // Extract IP from candidate string
          const candidateStr = event.candidate.candidate;
          const match = candidateStr.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
          
          if (match && match[1]) {
            const ip = match[1];
            // Only use non-private IPs (not starting with 192.168, 10., etc.)
            if (!ip.startsWith('192.168.') && !ip.startsWith('10.') && !ip.startsWith('172.')) {
              setIpAddress(ip);
              pc.close();
            }
          }
        };
      } catch (error) {
        console.error('Error getting IP:', error);
        setIpAddress('Unable to detect IP');
      }
    };

    getIpAddress();
  }, []);

  const getDeviceIcon = (type: DeviceType): string => {
    switch (type) {
      case 'windows':
        return 'fa-windows';
      case 'mac':
        return 'fa-apple';
      case 'linux':
        return 'fa-linux';
      case 'mobile':
        return 'fa-mobile-alt';
      case 'tablet':
        return 'fa-tablet-alt';
      default:
        return 'fa-desktop';
    }
  };

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
