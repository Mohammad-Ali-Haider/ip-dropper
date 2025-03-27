import { Device, DeviceStatus, DeviceType } from "../types/device";
import { API_BASE_URL } from "../constants/api";

export const sendFiles = async (selectedFiles: File[], selectedDevices: Device[]): Promise<void> => {
  // Create history record immediately when sending starts
  const timestamp = new Date();
  const historyRecord = {
    id: `${timestamp.getTime()}-${Math.random()}`,
    timestamp,
    files: selectedFiles.map(f => f.name),
    targetDevices: selectedDevices.map(device => ({
      name: device.name,
      ipaddress: device.ipaddress
    })),
    status: 'completed' as const
  };

  // Add to history immediately
  const existingHistory = JSON.parse(localStorage.getItem('transfer-history') || '[]');
  const updatedHistory = [historyRecord, ...existingHistory];
  localStorage.setItem('transfer-history', JSON.stringify(updatedHistory));

  // Create an array of all file-device combinations
  const transfers = selectedDevices.flatMap(device =>
    selectedFiles.map(file => ({ device, file }))
  );

  // Process transfers
  for (const { device, file } of transfers) {
    try {
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
      
      // Update the history record with error status
      const currentHistory = JSON.parse(localStorage.getItem('transfer-history') || '[]');
      const updatedRecord = {
        ...historyRecord,
        status: 'failed' as const,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      const newHistory = [
        updatedRecord,
        ...currentHistory.filter((record: any) => record.id !== historyRecord.id)
      ];
      
      localStorage.setItem('transfer-history', JSON.stringify(newHistory));
      break; // Stop processing remaining transfers if there's an error
    }
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


