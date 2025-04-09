import { useState, useEffect } from "react";
import DeviceList from "../components/device/DeviceList";
import Button from "../components/common/Button";
import AddDeviceModal from "../components/modals/AddDeviceModal";
import { UploadArea } from "../components/fileupload/UploadArea";
import { useFileSelection } from "../hooks/useFileSelection";
import { Device } from "../types/device";
import { sendFiles } from "../services/deviceService";
// import { websocketService } from "../services/websocketService";
import "../styles/Devices.css";



function Devices() {
  const [devices, setDevices] = useState<Device[]>(() => {
    const savedDevices = localStorage.getItem("devices");
    return savedDevices ? JSON.parse(savedDevices) : [];
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState<Device[]>([]);
  const { selectedFiles, handleFileChange, handleRemoveFile, clearFiles } =
    useFileSelection();

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
    try {
      const timestamp = new Date();

      // Get existing history
      const existingHistory = JSON.parse(
        localStorage.getItem("transfer-history") || "[]"
      );

      // Group devices by IP address
      const deviceGroups = selectedDevices.reduce((acc, device) => {
        const key = device.ipaddress;
        if (!acc[key]) {
          acc[key] = {
            devices: [],
            files: selectedFiles.map((f) => f.name),
          };
        }
        acc[key].devices.push({
          name: device.name,
          ipaddress: device.ipaddress,
        });
        return acc;
      }, {} as Record<string, { devices: { name: string; ipaddress: string }[]; files: string[] }>);

      // Create new history records
      const newHistoryRecords = Object.values(deviceGroups).map((group) => ({
        id: `${timestamp.getTime()}-${Math.random().toString(36).substr(2)}`,
        timestamp,
        files: group.files,
        targetDevices: group.devices,
        status: "completed" as const,
        error: undefined,
      }));

      // Try to merge with recent records (within 5 minutes)
      const MERGE_WINDOW = 5 * 60 * 1000; // 5 minutes in milliseconds
      const mergedHistory = [...existingHistory];

      newHistoryRecords.forEach((newRecord) => {
        const recentRecordIndex = mergedHistory.findIndex((record) => {
          const timeDiff =
            timestamp.getTime() - new Date(record.timestamp).getTime();
          const sameDevices = record.targetDevices.every(
            (device: { name: string; ipaddress: string }) =>
              newRecord.targetDevices.some(
                (newDevice) => newDevice.ipaddress === device.ipaddress
              )
          );
          return timeDiff < MERGE_WINDOW && sameDevices;
        });

        if (recentRecordIndex !== -1) {
          // Merge with existing record
          const existingRecord = mergedHistory[recentRecordIndex];
          mergedHistory[recentRecordIndex] = {
            ...existingRecord,
            files: [...new Set([...existingRecord.files, ...newRecord.files])],
            timestamp: timestamp, // Update timestamp to latest
          };
        } else {
          // Add as new record
          mergedHistory.unshift(newRecord);
        }
      });

      // Save to localStorage
      localStorage.setItem("transfer-history", JSON.stringify(mergedHistory));

      // Proceed with sending files
      await sendFiles(selectedFiles, selectedDevices);
      clearFiles();
    } catch (error) {
      console.error("Failed to send files:", error);

      // Update history with error status
      const existingHistory = JSON.parse(
        localStorage.getItem("transfer-history") || "[]"
      );
      const failedRecord = {
        id: `${new Date().getTime()}-error`,
        timestamp: new Date(),
        files: selectedFiles.map((f) => f.name),
        targetDevices: selectedDevices.map((d) => ({
          name: d.name,
          ipaddress: d.ipaddress,
        })),
        status: "failed" as const,
        error: error instanceof Error ? error.message : "Failed to send files",
      };

      localStorage.setItem(
        "transfer-history",
        JSON.stringify([failedRecord, ...existingHistory])
      );
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
    </div>
  );
}

export default Devices;
