import { useState, useEffect, DragEvent } from "react";
import { Device, DeviceStatus, DeviceType } from "../../types/device";
import { getDeviceStatus, getDeviceType, sendFiles } from "../../services/deviceService";
import { useRefreshRate } from "../../hooks/useRefreshRate";
import BaseModal from "../modals/BaseModal";
import DeviceForm from "../forms/DeviceForm";
import ConfirmationModal from "../modals/ConfirmationModal";
import {
  validateIPAddress,
  getUniqueDeviceName,
} from "../../utils/deviceValidation";
import "../../styles/DeviceCard.css";

interface DeviceCardProps extends Device {
  onSelect?: (device: Device) => void;
  onDelete?: (device: Device) => void;
  onEdit?: (oldDevice: Device, newDevice: Device) => void;
  existingDevices: Device[];
  isSelected?: boolean;
}

function DeviceCard({
  name,
  ipaddress,
  isSelected = false,
  onSelect,
  onDelete,
  onEdit,
  existingDevices,
}: DeviceCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editIp, setEditIp] = useState(ipaddress);
  const [error, setError] = useState<string | null>(null);
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>({ isOnline: false });
  const [deviceType, setDeviceType] = useState<DeviceType>("");
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const refreshRate = useRefreshRate();

  useEffect(() => {
    let mounted = true;
    
    const checkStatusAndType = async () => {
      try {
        const [status, type] = await Promise.all([
          getDeviceStatus(ipaddress),
          getDeviceType(ipaddress)
        ]);

        if (mounted) {
          setDeviceStatus(status);
          setDeviceType(type);
        }
      } catch (error) {
        if (mounted) {
          setDeviceStatus({ isOnline: false });
          setDeviceType("");
        }
      }
    };

    checkStatusAndType();
    const intervalId = setInterval(checkStatusAndType, refreshRate);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [ipaddress, refreshRate, name]);

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".device-actions")) {
      return;
    }

    if (deviceStatus.isOnline && onSelect) {
      onSelect({
        name,
        ipaddress,
        // type,
      });
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "windows":
        return "fa-windows";
      case "mac":
        return "fa-apple";
      case "linux":
        return "fa-linux";
      default:
        return "fa-desktop";
    }
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!editName.trim()) {
      setError("Device name is required");
      return;
    }

    if (!validateIPAddress(editIp)) {
      setError("Invalid IP address format");
      return;
    }

    const otherDevices = existingDevices.filter(
      (device) => device.ipaddress !== ipaddress || device.name !== name
    );

    if (otherDevices.some((device) => device.ipaddress === editIp)) {
      setError("IP address already exists");
      return;
    }

    const uniqueName = getUniqueDeviceName(editName.trim(), otherDevices);

    const oldDevice = { name, ipaddress };
    const newDevice = {
      name: uniqueName,
      ipaddress: editIp,
    };

    onEdit?.(oldDevice, newDevice);
    handleCloseEdit();
  };

  const handleDelete = () => {
    onDelete?.({ name, ipaddress });
    setShowDeleteModal(false);
  };

  const handleCloseEdit = () => {
    setEditName(name);
    setEditIp(ipaddress);
    setError(null);
    setShowEditModal(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (deviceStatus.isOnline) {
      setIsDraggingOver(true);
      e.dataTransfer.dropEffect = "copy";
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    if (!deviceStatus.isOnline) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      try {
        await sendFiles(files, [{ name, ipaddress }]);
      } catch (error) {
        console.error("Failed to send files:", error);
      }
    }
  };

  return (
    <>
      <div
        className={`device-card ${
          deviceStatus.isOnline ? "online" : "offline"
        } ${isSelected ? "selected" : ""} ${isDraggingOver ? "dragging-over" : ""}`}
        onClick={handleCardClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        title={!deviceStatus.isOnline ? "Cannot send files to offline devices" : "Drag and drop files here to send"}
      >
        <div className="device-icon">
          <i
            className={`${
              deviceType === "windows" ||
              deviceType === "mac" ||
              deviceType === "linux"
                ? "fab"
                : "fas"
            } ${getDeviceIcon(deviceType)}`}
          ></i>
          <span className="status-indicator"></span>
        </div>
        <div className="device-info">
          <h5 className="device-name">{name}</h5>
          <p className="device-ip">{ipaddress}</p>
        </div>
        <div className="device-actions">
          <button
            className="btn btn-link edit-btn"
            onClick={() => setShowEditModal(true)}
            title="Edit device"
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            className="btn btn-link delete-btn"
            onClick={() => setShowDeleteModal(true)}
            title="Delete device"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </div>

      <ConfirmationModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        itemName={name}
      />

      <BaseModal
        show={showEditModal}
        onHide={handleCloseEdit}
        title="Edit Device"
      >
        <form onSubmit={handleEdit}>
          {/* {error && <StatusAlert variant="danger" message={error} />} */}
          <DeviceForm
            name={editName}
            setName={setEditName}
            ipaddress={editIp}
            setIpaddress={setEditIp}
            error={error}
          />
          <div className="d-flex justify-content-end gap-2 mt-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCloseEdit}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </BaseModal>
    </>
  );
}

export default DeviceCard;
