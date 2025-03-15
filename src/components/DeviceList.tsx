import DeviceCard from "./DeviceCard";
import { Device } from "../tabs/Devices";
import { useState } from "react";
import "../css/DeviceList.css";

interface Props {
  devices: Device[];
  onDeleteDevice: (device: Device) => void;
  onEditDevice: (oldDevice: Device, newDevice: Device) => void;
  onDeviceSelection: (selectedDevices: Device[]) => void;
}

function DeviceList({ devices, onDeleteDevice, onEditDevice, onDeviceSelection }: Props) {
  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set());

  const handleDeviceSelect = (device: Device) => {
    if (device.status === 'offline') return;

    const deviceKey = `${device.name}-${device.ipaddress}`;
    const newSelected = new Set(selectedDevices);
    
    if (selectedDevices.has(deviceKey)) {
      newSelected.delete(deviceKey);
    } else {
      newSelected.add(deviceKey);
    }
    
    setSelectedDevices(newSelected);

    // Convert Set of keys back to array of devices
    const selectedDevicesList = Array.from(newSelected)
      .map(key => devices.find(d => `${d.name}-${d.ipaddress}` === key))
      .filter((d): d is Device => d !== undefined);
    
    onDeviceSelection(selectedDevicesList);
  };

  return (
    <div className="device-list">
      {devices.map((device) => (
        <DeviceCard
          key={`${device.name}-${device.ipaddress}`}
          {...device}
          isSelected={selectedDevices.has(`${device.name}-${device.ipaddress}`)}
          onSelect={handleDeviceSelect}
          onDelete={onDeleteDevice}
          onEdit={onEditDevice}
          existingDevices={devices}
        />
      ))}
    </div>
  );
}

export default DeviceList;
