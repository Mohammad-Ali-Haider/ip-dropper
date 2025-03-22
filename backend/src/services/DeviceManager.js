import { promisify } from 'util';
import ping from 'ping';

class DeviceManager {
  constructor() {
    this.devices = new Map();
    this.connections = new Map();
  }

  addDevice(device) {
    const deviceId = `${device.name}-${device.ipaddress}`;
    this.devices.set(deviceId, {
      ...device,
      status: 'offline',
      isReceiving: false
    });
    return this.devices.get(deviceId);
  }

  removeDevice(name, ipaddress) {
    const deviceId = `${name}-${ipaddress}`;
    this.devices.delete(deviceId);
  }

  getDevices() {
    return Array.from(this.devices.values());
  }

  async updateDeviceStatus(name, ipaddress) {
    const deviceId = `${name}-${ipaddress}`;
    const device = this.devices.get(deviceId);
    
    if (!device) return null;

    try {
      const res = await ping.promise.probe(device.ipaddress);
      device.status = res.alive && device.isReceiving ? 'online' : 'offline';
      this.devices.set(deviceId, device);
      return device;
    } catch (error) {
      console.error('Error pinging device:', error);
      device.status = 'offline';
      this.devices.set(deviceId, device);
      return device;
    }
  }

  updateDeviceReceiving(name, ipaddress, isReceiving) {
    const deviceId = `${name}-${ipaddress}`;
    const device = this.devices.get(deviceId);
    
    if (!device) return null;

    device.isReceiving = isReceiving;
    device.status = isReceiving ? 'online' : 'offline';
    this.devices.set(deviceId, device);
    return device;
  }

  addConnection(deviceId, ws) {
    this.connections.set(deviceId, ws);
  }

  removeConnection(deviceId) {
    this.connections.delete(deviceId);
  }

  broadcastDeviceUpdate(device) {
    this.connections.forEach((ws) => {
      if (ws.readyState === 1) { // Check if connection is open
        ws.send(JSON.stringify({
          type: 'deviceUpdate',
          device
        }));
      }
    });
  }
}

export const deviceManager = new DeviceManager();