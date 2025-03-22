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

    // Connect to WebSocket
    ws.current = new WebSocket('ws://localhost:3000');

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      // Register device
      if (ws.current) {
        ws.current.send(JSON.stringify({
          type: 'register',
          device: currentDevice
        }));
      }
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'deviceUpdate') {
        updateDeviceStatus(data.device);
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
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