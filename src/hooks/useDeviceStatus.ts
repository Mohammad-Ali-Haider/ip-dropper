import { useState, useEffect } from 'react';
import { Device } from '../types/device';
import { wsService } from '../services/websocket';

export function useDeviceStatus(devices: Device[]) {
  const [onlineDevices, setOnlineDevices] = useState<Set<string>>(new Set());
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let mounted = true;

    const checkDeviceStatus = async () => {
      if (isChecking) return;
      setIsChecking(true);

      const newOnlineDevices = new Set<string>();

      for (const device of devices) {
        try {
          let retryCount = 0;
          const maxRetries = 2;
          
          while (retryCount < maxRetries) {
            try {
              const isOnline = await wsService.pingDevice(device.ipaddress);
              if (isOnline && mounted) {
                newOnlineDevices.add(device.ipaddress);
                break;
              }
              retryCount++;
              if (retryCount === maxRetries) {
                console.log(`Device ${device.ipaddress} appears to be offline after ${maxRetries} attempts`);
              }
              await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
              retryCount++;
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        } catch (error) {
          console.error(`Error checking device ${device.ipaddress}:`, error);
        }
      }

      if (mounted) {
        setOnlineDevices(newOnlineDevices);
        setIsChecking(false);
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
