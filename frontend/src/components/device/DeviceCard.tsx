import { useState, useEffect } from "react";
import { Device } from "../../types/device";
import { API_BASE_URL } from "../../constants/api";
import { getDeviceStatus } from "../../services/deviceService";
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
  type,
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
  const [editType, setEditType] = useState(type);
  const [error, setError] = useState<string | null>(null);
  const [deviceStatus, setDeviceStatus] = useState({ isOnline: false });
  const [deviceIconType, setDeviceIconType] = useState<Device["type"]>(type);

  useEffect(() => {
    const fetchDeviceType = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/devices/${ipaddress}/type`);
        const data = await response.json();
        setDeviceIconType(data.type);
      } catch (error) {
        console.error("Error fetching device type:", error);
        setDeviceIconType(type); // Fallback to prop type
      }
    };

    fetchDeviceType();
  }, [ipaddress, type]);

  useEffect(() => {
    let mounted = true;
    const checkStatus = async () => {
      try {
        const status = await getDeviceStatus({ name, ipaddress, type });
        if (mounted) {
          setDeviceStatus(status);
        }
      } catch (error) {
        console.error("Error checking device status:", error);
        if (mounted) {
          setDeviceStatus({ isOnline: false });
        }
      }
    };

    const intervalId = setInterval(checkStatus, 5000); // Check every 5 seconds
    checkStatus(); // Initial check

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [name, ipaddress, type]);

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent selection when clicking action buttons
    if ((e.target as HTMLElement).closest(".device-actions")) {
      return;
    }

    if (deviceStatus.isOnline && onSelect) {
      onSelect({
        name,
        ipaddress,
        type,
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
        return "fa-computer";
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

    // Get all other devices (excluding the current one being edited)
    const otherDevices = existingDevices.filter(
      (device) => device.ipaddress !== ipaddress || device.name !== name
    );

    // Check if IP address is already in use by another device
    if (otherDevices.some((device) => device.ipaddress === editIp)) {
      setError("IP address already exists");
      return;
    }

    const uniqueName = getUniqueDeviceName(editName.trim(), otherDevices);

    const oldDevice = { name, ipaddress, type };
    const newDevice = {
      name: uniqueName,
      ipaddress: editIp,
      type: editType,
    };

    onEdit?.(oldDevice, newDevice);
    handleCloseEdit();
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/devices/${encodeURIComponent(
          name
        )}/${encodeURIComponent(ipaddress)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete device: ${response.statusText}`);
      }

      onDelete?.({ name, ipaddress, type });
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting device:", error);
      // You might want to add error handling UI here
    }
  };

  const handleCloseEdit = () => {
    setEditName(name);
    setEditIp(ipaddress);
    setEditType(type);
    setError(null);
    setShowEditModal(false);
  };

  return (
    <>
      <div
        className={`device-card ${
          deviceStatus.isOnline ? "online" : "offline"
        } ${isSelected ? "selected" : ""}`}
        onClick={handleCardClick}
        title={!deviceStatus.isOnline ? "Cannot select offline devices" : ""}
      >
        <div className="device-icon">
          <i className={`fab ${getDeviceIcon(deviceIconType)}`}></i>
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
            type={editType}
            setType={setEditType}
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
