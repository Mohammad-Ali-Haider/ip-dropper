import { useState } from "react";
import { Device } from "../../types/device";
import BaseModal from "./BaseModal";
import DeviceForm from "../forms/DeviceForm";
import {
  validateIPAddress,
  getUniqueDeviceName,
} from "../../utils/deviceValidation";
import "../../styles/AddDeviceModal.css";

interface Props {
  show: boolean;
  onHide: () => void;
  onAdd: (device: Device) => void;
  existingDevices: Device[];
}

function AddDeviceModal({ show, onHide, onAdd, existingDevices }: Props) {
  const [name, setName] = useState("");
  const [ipaddress, setIpaddress] = useState("");
  const [type, setType] = useState<Device["type"]>("windows");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!name.trim()) {
        throw new Error("Device name is required");
      }

      if (!validateIPAddress(ipaddress)) {
        throw new Error("Invalid IP address format");
      }

      if (existingDevices.some((device) => device.ipaddress === ipaddress)) {
        throw new Error("IP address already exists");
      }

      const uniqueName = getUniqueDeviceName(name.trim(), existingDevices);

      const newDevice: Device = {
        name: uniqueName,
        ipaddress,
        type,
        status: "offline",  // Set to offline by default
        isReceiving: false
      };

      await onAdd(newDevice);
      handleClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to add device");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName("");
    setIpaddress("");
    setType("windows");
    setError(null);
    setIsSubmitting(false);
    onHide();
  };

  return (
    <BaseModal show={show} onHide={handleClose} title="Add New Device">
      <form onSubmit={handleSubmit}>
        <DeviceForm
          name={name}
          setName={setName}
          ipaddress={ipaddress}
          setIpaddress={setIpaddress}
          type={type}
          setType={setType}
          error={error}
        />
        <div className="d-flex justify-content-end gap-2 mt-3">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Device'}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

export default AddDeviceModal;
