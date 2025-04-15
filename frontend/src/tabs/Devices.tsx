import { useState, useEffect, useRef } from "react";
import DeviceList from "../components/device/DeviceList";
import Button from "../components/common/Button";
import AddDeviceModal from "../components/modals/AddDeviceModal";
import { UploadArea } from "../components/fileupload/UploadArea";
import { useFileSelection } from "../hooks/useFileSelection";
import { Device } from "../types/device";
import { sendFiles } from "../services/deviceService";
import "../styles/Devices.css";
import { createFileTransferAnimation } from '../utils/animationUtils';

function Devices() {
  const [devices, setDevices] = useState<Device[]>(() => {
    const savedDevices = localStorage.getItem("devices");
    return savedDevices ? JSON.parse(savedDevices) : [];
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState<Device[]>([]);
  const { selectedFiles, handleFileChange, handleRemoveFile, clearFiles } =
    useFileSelection();
  const [isSending, setIsSending] = useState(false);
  const uploadAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("devices", JSON.stringify(devices));
  }, [devices]);


  const handleAddDevice = async (newDevice: Device) => {
    try {
      setDevices((prevDevices) => [...prevDevices, newDevice]);
    } catch (error) {
      console.error("Error adding device:", error);
    }
  };

  const handleEditDevice = async (oldDevice: Device, newDevice: Device) => {
    try {
      setDevices((prevDevices) =>
        prevDevices.map((device) =>
          device.ipaddress === oldDevice.ipaddress ? newDevice : device
        )
      );
    } catch (error) {
      console.error("Error editing device:", error);
    }
  };

  const handleDeleteDevice = async (deviceToDelete: Device) => {
    try {
      setDevices((prevDevices) =>
        prevDevices.filter(
          (device) => device.ipaddress !== deviceToDelete.ipaddress
        )
      );
    } catch (error) {
      console.error("Error deleting device:", error);
    }
  };

  const handleDeviceSelection = (devices: Device[]) => {
    setSelectedDevices(devices);
  };

  const handleSendFiles = async () => {
    if (!uploadAreaRef.current) return;
    
    setIsSending(true);
    
    // Get all selected device elements
    const selectedDeviceElements = document.querySelectorAll('.device-card.selected');
    
    // Trigger animation
    createFileTransferAnimation(
      uploadAreaRef.current,
      Array.from(selectedDeviceElements) as HTMLElement[],
      selectedFiles.length
    );

    try {
      await sendFiles(selectedFiles, selectedDevices);
      clearFiles();
    } catch (error) {
      console.error("Failed to send files:", error);
    } finally {
      setIsSending(false);
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
            ref={uploadAreaRef}
            selectedFiles={selectedFiles}
            onFileChange={handleFileChange}
            onRemoveFile={handleRemoveFile}
          />
          <button
            className={`send-button ${isSending ? 'sending' : ''}`}
            disabled={selectedDevices.length === 0 || selectedFiles.length === 0 || isSending}
            onClick={handleSendFiles}
          >
            {isSending ? 'Sending...' : 'Send Files'}
            {selectedDevices.length > 0 &&
              ` (${selectedDevices.length} devices selected)`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Devices;
