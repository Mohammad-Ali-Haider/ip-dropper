import { deviceManager } from '../services/DeviceManager.js';

export function addDevice(req, res) {
  try {
    console.log('POST /api/devices received:', {
      body: req.body,
      headers: req.headers
    });
    
    const device = deviceManager.addDevice(req.body);
    console.log('Device added to DeviceManager:', device);
    
    if (!device) {
      console.log('Device was not added successfully');
      return res.status(500).json({ error: 'Failed to add device' });
    }

    console.log('Successfully added device, sending response');
    res.status(201).json(device);
  } catch (error) {
    console.error('Error in POST /api/devices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}