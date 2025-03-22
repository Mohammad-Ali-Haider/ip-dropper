import { useState } from "react";
import DeviceList from "../components/device/DeviceList";
import Button from "../components/common/Button";
import AddDeviceModal from "../components/modals/AddDeviceModal";
import { UploadArea } from "../components/fileupload/UploadArea";
import { useFileSelection } from "../hooks/useFileSelection";
import { useDevices } from "../hooks/useDevices";
import { Device } from "../types/device";
import {
  addDevice,
  editDevice,
  deleteDevice,
  sendFiles,
} from "../services/deviceService";
import "../styles/Devices.css";

function Devices() {
  const { devices, isLoading, error, refreshDevices } = useDevices();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState<Device[]>([]);
  const { selectedFiles, handleFileChange, handleRemoveFile, clearFiles } =
    useFileSelection();

  const handleAddDevice = async (newDevice: Device) => {
    try {
      await addDevice(newDevice);
      await refreshDevices();
    } catch (error) {
      console.error("Error adding device:", error);
    }
  };

  const handleEditDevice = async (oldDevice: Device, newDevice: Device) => {
    try {
      await editDevice(oldDevice, newDevice);
      await refreshDevices();
    } catch (error) {
      console.error("Error editing device:", error);
    }
  };

  const handleDeleteDevice = async (deviceToDelete: Device) => {
    try {
      await deleteDevice(deviceToDelete);
      await refreshDevices();
    } catch (error) {
      console.error("Error deleting device:", error);
    }
  };

  const handleDeviceSelection = (devices: Device[]) => {
    setSelectedDevices(devices);
  };

  const handleSendFiles = () => {
    sendFiles(selectedFiles, selectedDevices);
    clearFiles();
  };

  if (isLoading) {
    return <div className="devices-container">Loading devices...</div>;
  }

  if (error) {
    return <div className="devices-container">Error: {error}</div>;
  }

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
            disabled={
              selectedDevices.length === 0 || selectedFiles.length === 0
            }
            onClick={handleSendFiles}
          >
            Send Files
            {selectedDevices.length > 0 &&
              ` (${selectedDevices.length} devices selected)`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Devices;
