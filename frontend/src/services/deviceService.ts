import { Device, DeviceStatus, DeviceType } from "../types/device";
import { WebSocketService } from "./websocketService";
import { API_BASE_URL } from "../constants/api";

export const sendFiles = async (selectedFiles: File[], selectedDevices: Device[]): Promise<void> => {
  const wsService = WebSocketService.getInstance();
  
  try {
    // Connect to WebSocket server
    await wsService.connect();

    // Send each file to each device
    for (const device of selectedDevices) {
      for (const file of selectedFiles) {
        console.log(`📤 Sending ${file.name} to ${device.ipaddress}...`);
        await wsService.sendFile(file, device.ipaddress);
        console.log(`✅ Sent ${file.name} to ${device.ipaddress}`);
      }
    }

  } catch (error) {
    console.error('Error sending files:', error);
    throw error;
  } finally {
    wsService.disconnect();
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


