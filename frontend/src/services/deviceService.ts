import { Device, DeviceStatus, DeviceType } from "../types/device";
import { API_BASE_URL } from "../constants/api";
import { websocketService } from "./websocketService";

export const sendFiles = async (selectedFiles: File[], selectedDevices: Device[]): Promise<void> => {
  console.log("Sending files:", selectedFiles);
  console.log("To devices:", selectedDevices);

  const sendPromises = selectedDevices.flatMap(device => 
    selectedFiles.map(async file => {
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
        
        // Success notification is handled by WebSocket events
        console.log(`Successfully sent ${file.name} to ${device.ipaddress}:`, result);
      } catch (error) {
        // Error notification is handled by WebSocket events
        console.error(`Error sending ${file.name} to ${device.ipaddress}:`, error);
        throw error;
      }
    })
  );

  try {
    await Promise.all(sendPromises);
    console.log('All file transfers completed successfully');
  } catch (error) {
    console.error('Some file transfers failed:', error);
    throw error;
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


