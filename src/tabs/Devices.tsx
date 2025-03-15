import { useState } from "react";
import DeviceList from "../components/DeviceList";
import Button from "../components/Button";
import AddDeviceModal from "../components/AddDeviceModal";
import "../css/Devices.css";

export interface Device {
  name: string;
  ipaddress: string;
  type: "windows" | "mac" | "linux";
  status: "online" | "offline";
}

interface Props {
  devices: Device[];
  setDevices: React.Dispatch<React.SetStateAction<Device[]>>;
}

function Devices({ devices, setDevices }: Props) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState<Device[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

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

  const handleDeviceSelection = (selectedDevices: Device[]) => {
    setSelectedDevices(selectedDevices);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleRemoveFile = (fileToRemove: File) => {
    setSelectedFiles(prev => 
      prev.filter(file => file !== fileToRemove)
    );
  };

  const handleSendFiles = () => {
    // Implement your file sending logic here
    console.log('Sending files:', selectedFiles);
    console.log('To devices:', selectedDevices);
    
    // Clear selected files after sending
    setSelectedFiles([]);
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
          <div className="upload-area">
            <i className="fas fa-cloud-upload-alt upload-icon"></i>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="file-input"
              id="file-input"
            />
            <label htmlFor="file-input" className="upload-label">
              Choose Files
            </label>
            {selectedFiles.length > 0 && (
              <div className="selected-files">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="file-item">
                    <i className="fas fa-file file-icon"></i>
                    <span className="file-name">{file.name}</span>
                    <button 
                      className="remove-file-btn"
                      onClick={() => handleRemoveFile(file)}
                      title="Remove file"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
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
