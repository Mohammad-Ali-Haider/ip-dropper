import { Device, DeviceStatus, DeviceType } from "../types/device";
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
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
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

export const sendFiles = async (selectedFiles: File[], selectedDevices: Device[]): Promise<void> => {
  console.log("Sending files:", selectedFiles);
  console.log("To devices:", selectedDevices);

  const sendPromises = selectedDevices.flatMap(device => 
    selectedFiles.map(async file => {
      try {
        // For Electron, we can use the File object directly
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(
          `${API_BASE_URL}/api/devices/${encodeURIComponent(device.ipaddress)}/send`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(`Failed to send ${file.name} to ${device.ipaddress}: ${errorData.error || 'Unknown error'}`);
        }

        console.log(`Successfully initiated send of ${file.name} to ${device.ipaddress}`);
      } catch (error) {
        console.error(`Error sending ${file.name} to ${device.ipaddress}:`, error);
        throw error;
      }
    })
  );

  try {
    await Promise.all(sendPromises);
    console.log('All file transfers initiated successfully');
  } catch (error) {
    console.error('Some file transfers failed:', error);
    throw new Error('Failed to send some files');
  }
};

export const getDeviceStatus = async (ipaddress: string): Promise<DeviceStatus> => {
  const response = await fetch(
    `${API_BASE_URL}/api/devices/${encodeURIComponent(ipaddress)}/status`,
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

export const getDeviceType = async (ipaddress: string): Promise<DeviceType> => {
  const response = await fetch(
    `${API_BASE_URL}/api/devices/${encodeURIComponent(ipaddress)}/type`,
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

  const data = await response.json();
  return data.type;
};


