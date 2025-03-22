import { promisify } from 'util';
import ping from 'ping';
import fs from 'fs/promises';
import path from 'path';

class DeviceManager {
  constructor() {
    console.log('DeviceManager instance created');
    this.devices = new Map();
    this.connections = new Map();
    this.statusCheckInterval = null;
    this.storageFile = path.join(process.cwd(), 'devices.json');
    this.loadDevices().then(() => {
      this.startStatusChecks();
    });
  }

  async loadDevices() {
    try {
      const data = await fs.readFile(this.storageFile, 'utf8');
      const devices = JSON.parse(data);
      devices.forEach(device => {
        const deviceId = `${device.name}-${device.ipaddress}`;
        this.devices.set(deviceId, {
          ...device,
          // Maintain the isReceiving state from storage
          isReceiving: device.isReceiving || false,
          // Status should be online if device was receiving
          status: device.isReceiving ? 'online' : 'offline'
        });
      });
      console.log(`Loaded ${this.devices.size} devices from storage`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('Error loading devices:', error);
      }
      console.log('No existing devices found in storage');
    }
  }

  async saveDevices() {
    try {
      const devices = Array.from(this.devices.values()).map(device => ({
        name: device.name,
        ipaddress: device.ipaddress,
        type: device.type,
        status: device.status,
        isReceiving: device.isReceiving  // Make sure this is included
      }));
      await fs.writeFile(this.storageFile, JSON.stringify(devices, null, 2));
      console.log(`Saved ${devices.length} devices to storage`);
    } catch (error) {
      console.error('Error saving devices:', error);
    }
  }

  startStatusChecks() {
    console.log('Starting periodic device status checks...');
    // Check status every 30 seconds
    this.statusCheckInterval = setInterval(() => {
      this.checkAllDevicesStatus();
    }, 3000);
  }

  stopStatusChecks() {
    if (this.statusCheckInterval) {
      console.log('Stopping device status checks');
      clearInterval(this.statusCheckInterval);
    }
  }

  async checkAllDevicesStatus() {
    const devices = this.getDevices();
    console.log(`Checking status for ${devices.length} devices...`);
    for (const device of devices) {
      await this.updateDeviceStatus(device.name, device.ipaddress);
    }
  }

  addDevice(device) {
    const deviceId = `${device.name}-${device.ipaddress}`;
    console.log(`Adding new device: ${deviceId}`);
    this.devices.set(deviceId, {
      ...device,
      status: 'offline',
      isReceiving: false
    });
    
    const savedDevice = this.devices.get(deviceId);
    this.saveDevices(); // Save after adding
    
    console.log('All devices after adding:', {
      mapSize: this.devices.size,
      deviceIds: Array.from(this.devices.keys()),
      allDevices: Array.from(this.devices.values())
    });
    
    return savedDevice;
  }

  removeDevice(name, ipaddress) {
    const deviceId = `${name}-${ipaddress}`;
    console.log(`Removing device: ${deviceId}`);
    this.devices.delete(deviceId);
    this.saveDevices(); // Save after removing
  }

  getDevices() {
    const devices = Array.from(this.devices.values());
    console.log('getDevices called - Map state:', {
      mapSize: this.devices.size,
      deviceIds: Array.from(this.devices.keys()),
      devices: devices.map(d => `${d.name} (${d.ipaddress})`)
    });
    return devices;
  }

  async updateDeviceStatus(name, ipaddress) {
    const deviceId = `${name}-${ipaddress}`;
    const device = this.devices.get(deviceId);
    
    if (!device) {
      console.log(`Device not found: ${deviceId}`);
      return null;
    }

    console.log(`Checking status for device: ${name} (${ipaddress})`);
    
    try {
      const res = await ping.promise.probe(device.ipaddress);
      const isReachable = res.alive;
      const previousStatus = device.status;
      
      // Status only depends on reachability
      device.status = isReachable ? 'online' : 'offline';
      
      console.log(`${name} - Reachable: ${isReachable}, Status: ${device.status}`);
      
      // Only broadcast if status changed
      if (previousStatus !== device.status) {
        console.log(`Status changed for ${name}: ${previousStatus} → ${device.status}`);
        this.devices.set(deviceId, device);
        this.broadcastDeviceUpdate(device);
      }
      
      return device;
    } catch (error) {
      console.error(`Error checking status for ${name}:`, error);
      device.status = 'offline';
      this.devices.set(deviceId, device);
      this.broadcastDeviceUpdate(device);
      return device;
    }
  }

  updateDeviceReceiving(name, ipaddress, isReceiving) {
    const deviceId = `${name}-${ipaddress}`;
    let device = this.devices.get(deviceId);
    
    console.log(`🔄 Updating receiving status for device ${deviceId}`);
    console.log(`Previous state: ${device?.isReceiving ? 'ON' : 'OFF'}`);
    console.log(`New state: ${isReceiving ? 'ON' : 'OFF'}`);
    
    if (!device) {
      console.log(`Creating new device: ${deviceId}`);
      device = {
        name,
        ipaddress,
        type: 'unknown',
        status: 'offline',  // Start with offline until ping check
        isReceiving
      };
      this.devices.set(deviceId, device);
    } else {
      device.isReceiving = isReceiving;
      this.devices.set(deviceId, device);
    }

    // Save changes to persistent storage
    this.saveDevices();
    
    console.log(`✅ Device ${deviceId} receiving status updated:`);
    console.log({
      name: device.name,
      ipaddress: device.ipaddress,
      isReceiving: device.isReceiving,
      status: device.status
    });
    
    // Broadcast the update to all connected clients
    this.broadcastDeviceUpdate(device);
    
    return device;
  }

  addConnection(deviceId, ws) {
    console.log(`New WebSocket connection for device: ${deviceId}`);
    this.connections.set(deviceId, ws);
  }

  removeConnection(deviceId) {
    console.log(`Removing WebSocket connection for device: ${deviceId}`);
    this.connections.delete(deviceId);
  }

  broadcastDeviceUpdate(device) {
    console.log(`Broadcasting status update for ${device.name} to all connected clients`);
    this.connections.forEach((ws) => {
      if (ws.readyState === 1) { // Check if connection is open
        ws.send(JSON.stringify({
          type: 'deviceUpdate',
          device
        }));
      }
    });
  }

  cleanup() {
    this.stopStatusChecks();
    this.saveDevices();
  }

  getCurrentDevice() {
    try {
      // You'll need to implement the logic to get the current device info
      // This could be stored in a config file or determined dynamically
      const os = require('os');
      const networkInterfaces = os.networkInterfaces();
      
      // Get the first non-internal IPv4 address
      let currentIp;
      Object.values(networkInterfaces).forEach((interfaces) => {
        interfaces.forEach((iface) => {  // Changed 'interface' to 'iface'
          if (iface.family === 'IPv4' && !iface.internal) {
            currentIp = iface.address;
          }
        });
      });

      if (!currentIp) {
        return null;
      }

      // Find the device in our devices map
      for (const [_, device] of this.devices) {
        if (device.ipaddress === currentIp) {
          return device;
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting current device:', error);
      return null;
    }
  }
}

const deviceManager = new DeviceManager();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down DeviceManager...');
  deviceManager.cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down DeviceManager...');
  deviceManager.cleanup();
  process.exit(0);
});

console.log('DeviceManager singleton created');
export { deviceManager };
