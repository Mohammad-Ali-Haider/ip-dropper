import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

class DeviceManager {
  constructor() {
    console.log('DeviceManager instance created');
    this.devices = new Map();
    this.storageFile = path.join(process.cwd(), 'devices.json');
    this.loadDevices();
  }

  async loadDevices() {
    try {
      const data = await fs.readFile(this.storageFile, 'utf8');
      if (!data.trim()) {
        console.log('Empty devices file, initializing with empty array');
        this.devices = new Map();
        await this.saveDevices();
        return;
      }

      const devices = JSON.parse(data);
      devices.forEach(device => {
        const deviceId = `${device.name}-${device.ipaddress}`;
        this.devices.set(deviceId, {
          ...device,
          isReceiving: device.isReceiving || false,
          status: 'online'
        });
      });
      console.log(`Loaded ${this.devices.size} devices from storage`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('No existing devices file, will create one');
        await this.saveDevices();
      } else {
        console.error('Error loading devices:', error);
        this.devices = new Map();
        await this.saveDevices();
      }
    }
  }

  async saveDevices() {
    try {
      const devices = Array.from(this.devices.values()).map(device => ({
        name: device.name,
        ipaddress: device.ipaddress,
        type: device.type,
        status: device.status,
        isReceiving: device.isReceiving
      }));
      await fs.writeFile(this.storageFile, JSON.stringify(devices, null, 2));
      console.log(`Saved ${devices.length} devices to storage`);
    } catch (error) {
      console.error('Error saving devices:', error);
    }
  }

  addDevice(device) {
    const deviceId = `${device.name}-${device.ipaddress}`;
    console.log(`Adding new device: ${deviceId}`);
    this.devices.set(deviceId, {
      ...device,
      status: 'offline',  // Set to offline by default
      isReceiving: false
    });
    
    const savedDevice = this.devices.get(deviceId);
    this.saveDevices();
    return savedDevice;
  }

  removeDevice(name, ipaddress) {
    const deviceId = `${name}-${ipaddress}`;
    console.log(`Removing device: ${deviceId}`);
    
    const device = this.devices.get(deviceId);
    this.devices.delete(deviceId);
    this.saveDevices();
    return device;
  }

  getDevices() {
    return Array.from(this.devices.values());
  }

  cleanup() {
    this.saveDevices();
  }

  updateDeviceReceiving(name, ipaddress, isReceiving) {
    const deviceId = `${name}-${ipaddress}`;
    console.log(`Updating receiving status for device: ${deviceId} to ${isReceiving}`);
    
    let device = this.devices.get(deviceId);
    
    // If device doesn't exist, create it
    if (!device) {
      device = this.addDevice({
        name,
        ipaddress,
        type: 'unknown', // You might want to detect this
        status: 'online',
        isReceiving: false
      });
    }

    const updatedDevice = {
      ...device,
      isReceiving
    };
    
    this.devices.set(deviceId, updatedDevice);
    this.saveDevices();
    return updatedDevice;
  }
}

export const deviceManager = new DeviceManager();
