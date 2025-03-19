import { useState } from 'react';
import { Device, DeviceType } from '../../types/device';
import BaseModal from "./BaseModal";
import DeviceForm from "../forms/DeviceForm";
import {
  validateIPAddress,
  getUniqueDeviceName,
} from "../../utils/deviceValidation";
import "../../styles/AddDeviceModal.css";

interface AddDeviceModalProps {
  show: boolean;
  onHide: () => void;
  onAdd: (device: Device) => void;
  existingDevices: Device[];
}

function AddDeviceModal({ show, onHide, onAdd, existingDevices }: AddDeviceModalProps) {
  const [name, setName] = useState('');
  const [ipaddress, setIpaddress] = useState('');
  const [type, setType] = useState<DeviceType>('other');
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setIpaddress('');
    setType('other');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Device name is required");
      return;
    }

    if (!validateIPAddress(ipaddress)) {
      setError("Invalid IP address format");
      return;
    }

    if (existingDevices.some((device) => device.ipaddress === ipaddress)) {
      setError("IP address already exists");
      return;
    }

    const uniqueName = getUniqueDeviceName(name.trim(), existingDevices);

    const newDevice: Device = {
      name: uniqueName,
      ipaddress,
      type,
      status: "offline",
    };

    onAdd(newDevice);
    handleClose();
  };

  const handleClose = () => {
    resetForm();
    setError(null);
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
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Add Device
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

export default AddDeviceModal;
