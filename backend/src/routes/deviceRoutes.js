import express from 'express';
import { deviceManager } from '../services/DeviceManager.js';
import { getDeviceInfo } from '../utils/deviceUtils.js';

const router = express.Router();

// New endpoint for current device info
router.get('/current', async (req, res) => {
  try {
    const deviceInfo = await getDeviceInfo();
    res.json(deviceInfo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get device information' });
  }
});

// Get all devices
router.get('/', (req, res) => {
  const devices = deviceManager.getDevices();
  res.json(devices);
});

// Add new device
router.post('/', (req, res) => {
  const device = deviceManager.addDevice(req.body);
  res.status(201).json(device);
});

// Delete device
router.delete('/:name/:ip', (req, res) => {
  const { name, ip } = req.params;
  deviceManager.removeDevice(name, ip);
  res.status(204).send();
});

// Update device receiving status
router.put('/:name/:ip/receiving', (req, res) => {
  const { name, ip } = req.params;
  const { isReceiving } = req.body;
  
  const device = deviceManager.updateDeviceReceiving(name, ip, isReceiving);
  
  if (!device) {
    return res.status(404).json({ error: 'Device not found' });
  }
  
  deviceManager.broadcastDeviceUpdate(device);
  res.json(device);
});

export default router;
