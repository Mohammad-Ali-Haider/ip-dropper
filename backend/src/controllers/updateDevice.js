import { deviceManager } from '../services/DeviceManager.js';

export function updateDevice(req, res) {
  try {
    const { name, ip } = req.params;
    console.log(`PUT request received for device: ${name} (${ip})`, req.body);

    deviceManager.removeDevice(name, ip);
    
    const device = deviceManager.addDevice({
      ...req.body,
      status: 'offline',
      isReceiving: false
    });
    
    if (!device) {
      return res.status(500).json({ error: 'Failed to update device' });
    }

    console.log('Device updated successfully:', device);
    res.json(device);
  } catch (error) {
    console.error('Error updating device:', error);
    res.status(500).json({ 
      error: 'Failed to update device',
      details: error.message 
    });
  }
}