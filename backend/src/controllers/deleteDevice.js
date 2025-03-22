import { deviceManager } from '../services/DeviceManager.js';

export function deleteDevice(req, res) {
  try {
    const { name, ip } = req.params;
    console.log(`DELETE request received for device: ${name} (${ip})`);
    deviceManager.removeDevice(name, ip);
    console.log(`Device deletion processed for: ${name} (${ip})`);
    res.status(204).send();
  } catch (error) {
    console.error('Error in delete device process:', error);
    res.status(204).send();
  }
}