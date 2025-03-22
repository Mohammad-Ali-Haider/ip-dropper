import { deviceManager } from '../services/DeviceManager.js';
import { getDeviceInfo } from '../utils/deviceUtils.js';

export async function updateCurrentDeviceReceiving(req, res) {
  try {
    console.log('PUT /api/devices/current/receiving received:', req.body);
    
    const deviceInfo = await getDeviceInfo();

    let currentDevice = deviceManager.getDevices().find(
      device => device.ipaddress === deviceInfo.ipaddress
    );

    if (!currentDevice) {
      currentDevice = deviceManager.addDevice({
        ...deviceInfo,
        status: 'offline',
        isReceiving: false
      });
    }

    const updatedDevice = deviceManager.updateDeviceReceiving(
      currentDevice.name,
      currentDevice.ipaddress,
      req.body.isReceiving
    );

    if (!updatedDevice) {
      throw new Error('Failed to update device receiving status');
    }

    res.json(updatedDevice);
  } catch (error) {
    console.error('Error updating receiving status:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}