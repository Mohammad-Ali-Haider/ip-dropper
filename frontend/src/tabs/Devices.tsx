import { useState, useEffect } from "react";
import DeviceList from "../components/device/DeviceList";
import Button from "../components/common/Button";
import AddDeviceModal from "../components/modals/AddDeviceModal";
import { UploadArea } from "../components/fileupload/UploadArea";
import { useFileSelection } from "../hooks/useFileSelection";
import { Device } from "../types/device";
import { sendFiles } from "../services/deviceService";
import { websocketService } from "../services/websocketService";
import "../styles/Devices.css";

interface TransferStatus {
  [key: string]: {
    status: 'initiating' | 'inProgress' | 'completed' | 'failed';
    error?: string;
  };
}

const TransferStatusItem = ({ fileName, targetIp, status, error }: {
  fileName: string;
  targetIp: string;
  status: string;
  error?: string;
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'failed': return '#ffebee';
      case 'completed': return '#e8f5e9';
      case 'initiating': return '#e3f2fd';
      default: return '#fff';
    }
  };

  return (
    <div 
      className={`transfer-item status-${status}`}
      style={{
        padding: '12px',
        margin: '8px 0',
        borderRadius: '6px',
        backgroundColor: getStatusColor(),
        border: '1px solid ' + (status === 'failed' ? '#ffcdd2' : '#e0e0e0')
      }}
    >
      <div style={{ fontWeight: 'bold' }}>{fileName}</div>
      <div style={{ fontSize: '0.9em', color: '#666' }}>Target: {targetIp}</div>
      <div style={{ 
        marginTop: '4px',
        color: status === 'failed' ? '#d32f2f' : 
               status === 'completed' ? '#2e7d32' : 
               '#1976d2'
      }}>
        Status: {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
      {error && (
        <div 
          className="error-message"
          style={{
            color: '#d32f2f',
            fontSize: '0.9em',
            marginTop: '8px',
            padding: '8px',
            backgroundColor: '#ffebee',
            borderRadius: '4px'
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};

function Devices() {
  const [devices, setDevices] = useState<Device[]>(() => {
    const savedDevices = localStorage.getItem("devices");
    return savedDevices ? JSON.parse(savedDevices) : [];
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState<Device[]>([]);
  const { selectedFiles, handleFileChange, handleRemoveFile, clearFiles } =
    useFileSelection();
  const [transferStatus, setTransferStatus] = useState<TransferStatus>({});

  useEffect(() => {
    localStorage.setItem("devices", JSON.stringify(devices));
  }, [devices]);

  useEffect(() => {
    const handleTransferEvent = (event: any) => {
      if (event.type === 'fileTransfer') {
        setTransferStatus(prev => ({
          ...prev,
          [`${event.fileName}-${event.targetIp}`]: {
            status: event.status,
            error: event.error
          }
        }));
      }
    };

    websocketService.addEventListener(handleTransferEvent);

    return () => {
      websocketService.removeEventListener(handleTransferEvent);
    };
  }, []);

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
    try {
      setTransferStatus({}); // Clear previous status
      await sendFiles(selectedFiles, selectedDevices);
      clearFiles();
    } catch (error) {
      console.error('Failed to send files:', error);
      // Error handling is now done through WebSocket events
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
      <div className="transfer-status">
        {Object.entries(transferStatus).map(([key, status]) => {
          const [fileName, targetIp] = key.split('-');
          return (
            <TransferStatusItem
              key={key}
              fileName={fileName}
              targetIp={targetIp}
              status={status.status}
              error={status.error}
            />
          );
        })}
      </div>
    </div>
  );
}

export default Devices;
