import WebSocket from 'ws';
import { EventEmitter } from 'events';

class DeviceWebSocketManager extends EventEmitter {
  constructor() {
    super();
    this.connectedDevices = new Map(); // IP -> WebSocket
  }

  addDevice(ip, ws) {
    if (this.connectedDevices.has(ip)) {
      const existingWs = this.connectedDevices.get(ip);
      if (existingWs.readyState === WebSocket.OPEN) {
        existingWs.close();
      }
    }

    this.connectedDevices.set(ip, ws);
    console.log(`Device ${ip} registered and connected`);
    
    ws.on('close', () => {
      this.connectedDevices.delete(ip);
      console.log(`Device ${ip} disconnected`);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for device ${ip}:`, error);
      this.connectedDevices.delete(ip);
    });
  }

  isDeviceConnected(ip) {
    const isConnected = this.connectedDevices.has(ip) && 
                       this.connectedDevices.get(ip).readyState === WebSocket.OPEN;
    console.log(`Checking device ${ip} connection status: ${isConnected}`);
    return isConnected;
  }

  async sendToDevice(targetIp, data) {
    const deviceWs = this.connectedDevices.get(targetIp);
    if (!deviceWs) {
      throw new Error(`No WebSocket connection found for device ${targetIp}`);
    }
    
    if (deviceWs.readyState !== WebSocket.OPEN) {
      this.connectedDevices.delete(targetIp);
      throw new Error(`WebSocket connection is not open for device ${targetIp}`);
    }
    
    return new Promise((resolve, reject) => {
      deviceWs.send(JSON.stringify(data), (error) => {
        if (error) {
          console.error(`Error sending data to device ${targetIp}:`, error);
          reject(error);
        } else {
          console.log(`Successfully sent data to device ${targetIp}`);
          resolve();
        }
      });
    });
  }
}

export const deviceManager = new DeviceWebSocketManager();

