import { deviceManager } from '../services/DeviceManager.js';
import { getDeviceInfo } from '../utils/deviceUtils.js';

export async function getCurrentDevice(req, res) {
  try {
    const deviceInfo = await getDeviceInfo();
    
    const existingDevice = deviceManager.getDevices().find(
      device => device.ipaddress === deviceInfo.ipaddress
    );

    if (existingDevice) {
      res.json(existingDevice);
    } else {
      res.json({
        ...deviceInfo,
        status: 'offline',
        isReceiving: false
      });
    }
  } catch (error) {
    console.error('Error getting current device info:', error);
    res.status(500).json({ 
      error: 'Failed to get current device info',
      details: error.message 
    });
  }
}