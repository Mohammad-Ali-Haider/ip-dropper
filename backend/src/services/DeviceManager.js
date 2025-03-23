import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

class DeviceManager {
  constructor() {
    console.log("DeviceManager instance created");
    this.devices = new Map();
    this.storageFile = path.join(process.cwd(), "devices.json");
    this.peers = new Map(); // Track peer connections
    this.loadDevices();
  }

  async loadDevices() {
    try {
      const data = await fs.readFile(this.storageFile, "utf8");
      if (!data.trim()) {
        console.log("Empty devices file, initializing with empty array");
        this.devices = new Map();
        await this.saveDevices();
        return;
      }

      const devices = JSON.parse(data);
      devices.forEach((device) => {
        const deviceId = `${device.name}-${device.ipaddress}`;
        this.devices.set(deviceId, device);
      });
      console.log(`Loaded ${this.devices.size} devices from storage`);
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log("No existing devices file, will create one");
        await this.saveDevices();
      } else {
        console.error("Error loading devices:", error);
        this.devices = new Map();
        await this.saveDevices();
      }
    }
  }

  async saveDevices() {
    try {
      const devices = Array.from(this.devices.values()).map((device) => ({
        name: device.name,
        ipaddress: device.ipaddress,
      }));
      await fs.writeFile(this.storageFile, JSON.stringify(devices, null, 2));
      console.log(`Saved ${devices.length} devices to storage`);
    } catch (error) {
      console.error("Error saving devices:", error);
    }
  }

  addDevice(device) {
    const deviceId = `${device.name}-${device.ipaddress}`;
    console.log(`Adding new device: ${deviceId}`);
    this.devices.set(deviceId, device);

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

  async cleanup() {
    try {
      await this.saveDevices();
      console.log("Device data saved successfully during cleanup");
    } catch (error) {
      console.error("Error during device cleanup:", error);
    }
  }

  // Add method to handle peer connections
  async connectToPeer(deviceInfo) {
    const deviceId = `${deviceInfo.name}-${deviceInfo.ipaddress}`;
    if (!this.peers.has(deviceId)) {
      // Establish peer connection
      // Handle peer communication
      this.peers.set(deviceId, connection);
    }
  }

  updateDeviceReceiving(name, ipaddress, isReceiving) {
    const deviceId = `${name}-${ipaddress}`;
    const device = this.devices.get(deviceId);
    
    if (device) {
      device.isReceiving = isReceiving;
      device.lastSeen = new Date().toISOString();
      this.devices.set(deviceId, device);
      this.saveDevices();
      return device;
    }
    return null;
  }

  // Add a method to update lastSeen timestamp
  updateLastSeen(name, ipaddress) {
    const deviceId = `${name}-${ipaddress}`;
    const device = this.devices.get(deviceId);
    
    if (device) {
      device.lastSeen = new Date().toISOString();
      this.devices.set(deviceId, device);
      return device;
    }
    return null;
  }
}

export const deviceManager = new DeviceManager();
