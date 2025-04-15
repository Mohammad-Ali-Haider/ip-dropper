import { useState, useCallback } from 'react';
import { Device } from '../types/device';

export function useDeviceSelection(onDeviceSelection: (devices: Device[]) => void) {
  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set());

  const handleDeviceSelect = useCallback((device: Device) => {
    if (device.status === 'offline') return;

    const deviceKey = `${device.name}-${device.ipaddress}`;
    const newSelected = new Set(selectedDevices);
    
    if (selectedDevices.has(deviceKey)) {
      newSelected.delete(deviceKey);
    } else {
      newSelected.add(deviceKey);
    }
    
    setSelectedDevices(newSelected);

    const selectedDevicesList = Array.from(newSelected)
      .map(key => {
        const [name, ip] = key.split('-');
        return device.name === name && device.ipaddress === ip ? device : undefined;
      })
      .filter((d): d is Device => d !== undefined);
    
    onDeviceSelection(selectedDevicesList);
  }, [selectedDevices, onDeviceSelection]);

  return {
    selectedDevices,
    handleDeviceSelect,
    setSelectedDevices
  };
}