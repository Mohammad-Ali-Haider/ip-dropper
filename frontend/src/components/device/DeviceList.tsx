import DeviceCard from "./DeviceCard";
import { Device } from "../../types/device";
import { useState } from "react";
import "../../styles/DeviceList.css";

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

    const selectedDevicesList = devices.filter(d => 
      newSelected.has(`${d.name}-${d.ipaddress}`)
    );
    
    onDeviceSelection(selectedDevicesList);
  };

  return (
    <div className="device-list">
      {devices.map((device) => (
        <DeviceCard
          key={`${device.name}-${device.ipaddress}`}
          {...device}
          isSelected={selectedDevices.has(`${device.name}-${device.ipaddress}`)}
          onSelect={() => handleDeviceSelect(device)}
          onDelete={onDeleteDevice}
          onEdit={onEditDevice}
          existingDevices={devices}
        />
      ))}
    </div>
  );
}

export default DeviceList;
