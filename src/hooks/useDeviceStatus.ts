import { useState, useEffect } from 'react';
import { Device } from '../types/device';
import { wsService } from '../services/websocket';

export function useDeviceStatus(devices: Device[]) {
  const [onlineDevices, setOnlineDevices] = useState<Set<string>>(new Set());

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let mounted = true;

    const checkDeviceStatus = async () => {
      const newOnlineDevices = new Set<string>();

      for (const device of devices) {
        try {
          const isOnline = await wsService.pingDevice(device.ipaddress);
          if (isOnline && mounted) {
            newOnlineDevices.add(device.ipaddress);
          }
        } catch (error) {
          console.log(`Device ${device.ipaddress} appears to be offline`);
        }
      }

      if (mounted) {
        setOnlineDevices(newOnlineDevices);
      }
    };

    // Get refresh rate from localStorage (defaults to 5 seconds)
    const refreshRate = Number(localStorage.getItem('settings.refreshRate') || '5');
    const refreshInterval = refreshRate * 1000; // Convert to milliseconds

    // Initial check
    checkDeviceStatus();

    // Set up periodic checking
    intervalId = setInterval(checkDeviceStatus, refreshInterval);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [devices]);

  return onlineDevices;
}
