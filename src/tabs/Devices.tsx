import { useState } from "react";
import DeviceList from "../components/device/DeviceList";
import Button from "../components/common/Button";
import AddDeviceModal from "../components/modals/AddDeviceModal";
import { UploadArea } from "../components/fileupload/UploadArea";
import { useFileSelection } from "../hooks/useFileSelection";
import { useDevices } from "../hooks/useDevices";
import { Device } from "../types/device";
import "../styles/Devices.css";
import { FileTransferService } from '../services/FileTransferService';

function Devices() {
  const { devices, setDevices } = useDevices();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState<Device[]>([]);
  const { selectedFiles, handleFileChange, handleRemoveFile, clearFiles } =
    useFileSelection();
  const [transferStatus, setTransferStatus] = useState<Map<string, boolean>>(new Map());
  const fileTransferService = new FileTransferService();

  const handleAddDevice = (newDevice: Device) => {
    setDevices([...devices, newDevice]);
  };

  const handleDeleteDevice = (deviceToDelete: Device) => {
    setDevices(
      devices.filter(
        (device) =>
          device.name !== deviceToDelete.name ||
          device.ipaddress !== deviceToDelete.ipaddress
      )
    );
  };

  const handleEditDevice = (oldDevice: Device, newDevice: Device) => {
    setDevices(
      devices.map((device) =>
        device.name === oldDevice.name &&
        device.ipaddress === oldDevice.ipaddress
          ? newDevice
          : device
      )
    );
  };

  const handleDeviceSelection = (devices: Device[]) => {
    setSelectedDevices(devices);
  };

  const handleSendFiles = async () => {
    setTransferStatus(new Map()); // Reset status
    
    try {
      const results = await fileTransferService.sendFilesToDevices(
        selectedFiles,
        selectedDevices
      );
      
      setTransferStatus(results);
      clearFiles(); // Clear files after successful transfer
      
      // Show success message
      const successCount = Array.from(results.values()).filter(v => v).length;
      alert(`Files sent successfully to ${successCount} out of ${selectedDevices.length} devices`);
    } catch (error) {
      console.error('Error sending files:', error);
      alert('Error sending files. Please check the console for details.');
    }
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
            {selectedDevices.length > 0 &&
              ` (${selectedDevices.length} devices selected)`}
          </button>
          
          {/* Transfer Status */}
          {transferStatus.size > 0 && (
            <div className="transfer-status">
              {Array.from(transferStatus.entries()).map(([ip, success]) => (
                <div key={ip} className={`status-item ${success ? 'success' : 'error'}`}>
                  <span>{ip}</span>
                  <i className={`fas fa-${success ? 'check' : 'times'}`}></i>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Devices;
