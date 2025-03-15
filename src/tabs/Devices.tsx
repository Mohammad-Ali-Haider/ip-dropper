import { useState } from "react";
import DeviceList from "../components/DeviceList";
import Button from "../components/Button";
import AddDeviceModal from "../components/AddDeviceModal";
import { UploadArea } from "../components/FileUpload/UploadArea";
import { useFileSelection } from "../hooks/useFileSelection";
import { Device } from "../types/device";
import "../css/Devices.css";

interface Props {
  devices: Device[];
  setDevices: React.Dispatch<React.SetStateAction<Device[]>>;
}

function Devices({ devices, setDevices }: Props) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState<Device[]>([]);
  const { 
    selectedFiles, 
    handleFileChange, 
    handleRemoveFile, 
    clearFiles 
  } = useFileSelection();

  const handleAddDevice = (newDevice: Device) => {
    setDevices([...devices, newDevice]);
  };

  const handleDeleteDevice = (deviceToDelete: Device) => {
    setDevices(devices.filter(device => 
      device.name !== deviceToDelete.name || 
      device.ipaddress !== deviceToDelete.ipaddress
    ));
  };

  const handleEditDevice = (oldDevice: Device, newDevice: Device) => {
    setDevices(devices.map(device => 
      (device.name === oldDevice.name && device.ipaddress === oldDevice.ipaddress)
        ? newDevice
        : device
    ));
  };

  const handleDeviceSelection = (devices: Device[]) => {
    setSelectedDevices(devices);
  };

  const handleSendFiles = () => {
    console.log('Sending files:', selectedFiles);
    console.log('To devices:', selectedDevices);
    clearFiles();
  };

  return (
    <div className="devices-container">
      <div className="devices-main">
        <div className="devices-list-container">
          <DeviceList 
            devices={devices} 
            onDeleteDevice={handleDeleteDevice}
            onEditDevice={handleEditDevice}
            onDeviceSelection={handleDeviceSelection}
          />
        </div>
        
        <div className="add-device-footer">
          <Button onClick={() => setShowAddModal(true)}>Add Device</Button>
        </div>

        <AddDeviceModal
          show={showAddModal}
          onHide={() => setShowAddModal(false)}
          onAdd={handleAddDevice}
          existingDevices={devices}
        />
      </div>

      <div className="files-sidebar">
        <div className="files-content">
          <UploadArea
            selectedFiles={selectedFiles}
            onFileChange={handleFileChange}
            onRemoveFile={handleRemoveFile}
          />
          <button
            className="send-button"
            disabled={selectedDevices.length === 0 || selectedFiles.length === 0}
            onClick={handleSendFiles}
          >
            Send Files
            {selectedDevices.length > 0 && ` (${selectedDevices.length} devices selected)`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Devices;
