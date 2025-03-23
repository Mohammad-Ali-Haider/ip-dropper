import { deviceManager } from '../services/DeviceManager.js';

export function getAllDevices(req, res) {
  // console.log('GET /api/devices called');
  const devices = deviceManager.getDevices();
  // console.log('Returning devices:', devices);
  res.json(devices);
}