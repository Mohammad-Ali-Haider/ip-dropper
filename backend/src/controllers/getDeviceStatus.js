import ping from 'ping';
import { deviceManager } from '../services/DeviceManager.js';

export async function getDeviceStatus(req, res) {
  try {
    const { ip } = req.params;
    
    // First check if device exists in our DeviceManager
    const devices = deviceManager.getDevices();
    const device = devices.find(d => d.ipaddress === ip);
    
    if (!device) {
      return res.status(404).json({ 
        error: "Device not found",
        isOnline: false 
      });
    }

    // Ping the device to check if it's online
    const pingResult = await ping.promise.probe(ip, {
      timeout: 2,  // 2 second timeout
      min_reply: 1 // Only need 1 reply
    });

    // Get additional status from DeviceManager if available
    const status = {
      isOnline: pingResult.alive,
      isReceiving: device.isReceiving || false,
      lastSeen: device.lastSeen || null
    };

    res.json(status);
  } catch (error) {
    console.error("Error getting device status:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  }
}



