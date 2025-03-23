import { Device, DeviceStatus } from "../types/device";
import { API_BASE_URL } from "../constants/api";

export const addDevice = async (newDevice: Device): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/devices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newDevice),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};

export const editDevice = async (oldDevice: Device, newDevice: Device): Promise<void> => {
  const response = await fetch(
    `${API_BASE_URL}/api/devices/${encodeURIComponent(oldDevice.name)}/${encodeURIComponent(oldDevice.ipaddress)}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newDevice),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};

export const deleteDevice = async (deviceToDelete: Device): Promise<void> => {
  const response = await fetch(
    `${API_BASE_URL}/api/devices/${encodeURIComponent(deviceToDelete.name)}/${encodeURIComponent(deviceToDelete.ipaddress)}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};

export const sendFiles = (selectedFiles: File[], selectedDevices: Device[]): void => {
  console.log("Sending files:", selectedFiles);
  console.log("To devices:", selectedDevices);
};

export const getDeviceStatus = async (device: Device): Promise<DeviceStatus> => {
  const response = await fetch(
    `${API_BASE_URL}/api/devices/${encodeURIComponent(device.ipaddress)}/status`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
