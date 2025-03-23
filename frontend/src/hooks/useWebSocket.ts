import { useEffect, useRef } from 'react';
import { Device } from '../types/device';

export function useWebSocket(
  currentDevice: Device | null,
  isReceiving: boolean,
  updateDeviceStatus: (device: Device) => void
) {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!currentDevice) return;

    // Connect to other devices on the network
    const connectToDevice = async (targetIp: string) => {
      try {
        ws.current = new WebSocket(`ws://${targetIp}:3000`);
        // ... rest of WebSocket setup
      } catch (error) {
        console.error('Failed to connect to device:', error);
      }
    };

    // Discover other devices on network
    const discoverDevices = async () => {
      // Implement network discovery logic
    };

    discoverDevices();
  }, [currentDevice]);

  // Update receiving status
  useEffect(() => {
    if (!currentDevice || !ws.current) return;

    ws.current.send(JSON.stringify({
      type: 'updateReceiving',
      name: currentDevice.name,
      ipaddress: currentDevice.ipaddress,
      isReceiving
    }));
  }, [isReceiving, currentDevice]);

  return ws.current;
}
