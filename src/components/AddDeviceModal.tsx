import { useState } from "react";
import { Device } from "../tabs/Devices";
import BaseModal from "./modals/BaseModal";
import DeviceForm from "./forms/DeviceForm";
import "../css/AddDeviceModal.css";

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

  const validateIPAddress = (ip: string): boolean => {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) return false;

    const parts = ip.split(".").map(Number);
    return parts.every((part) => part >= 0 && part <= 255);
  };

  const getUniqueDeviceName = (baseName: string): string => {
    let newName = baseName;
    let counter = 1;

    while (existingDevices.some((device) => device.name === newName)) {
      newName = `${baseName} (${counter})`;
      counter++;
    }

    return newName;
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

    const uniqueName = getUniqueDeviceName(name.trim());

    const newDevice: Device = {
      name: uniqueName,
      ipaddress,
      type,
      status: "online",
    };

    onAdd(newDevice);
    handleClose();
  };

  const handleClose = () => {
    setName("");
    setIpaddress("");
    setType("windows");
    setError(null);
    onHide();
  };

  return (
    <BaseModal show={show} onHide={handleClose} title="Add New Device">
      <form onSubmit={handleSubmit}>
        {/* <StatusAlert variant="danger" message={error || ""} /> */}
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
