import { Device, DeviceStatus, DeviceType } from "../types/device";
import { API_BASE_URL } from "../constants/api";
import { websocketService } from "./websocketService";

export const sendFiles = async (selectedFiles: File[], selectedDevices: Device[]): Promise<void> => {
  console.log("Sending files:", selectedFiles);
  console.log("To devices:", selectedDevices);

  // Create an array of all file-device combinations
  const transfers = selectedDevices.flatMap(device =>
    selectedFiles.map(file => ({ device, file }))
  );

  // Process transfers sequentially to avoid overwhelming the server
  for (const { device, file } of transfers) {
    try {
      // Notify about transfer initiation
      websocketService.send({
        type: 'fileTransfer',
        status: 'initiating',
        fileName: file.name,
        targetIp: device.ipaddress
      });

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
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Unknown error');
      }

      const result = await response.json();
      console.log(`Successfully sent ${file.name} to ${device.ipaddress}:`, result);
    } catch (error) {
      console.error(`Error sending ${file.name} to ${device.ipaddress}:`, error);
      // Don't throw here - continue with next transfer
      websocketService.send({
        type: 'fileTransfer',
        status: 'failed',
        fileName: file.name,
        targetIp: device.ipaddress,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Check if any transfers failed
  const failedTransfers = transfers.filter(({ file, device }) => {
    const status = document.querySelector(`[data-transfer="${file.name}-${device.ipaddress}"]`)?.getAttribute('data-status');
    return status === 'failed';
  });

  if (failedTransfers.length > 0) {
    throw new Error('Some file transfers failed');
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


