import express from 'express';
import { deviceManager } from '../services/DeviceManager.js';
import { getDeviceInfo } from '../utils/deviceUtils.js';

const router = express.Router();

// New endpoint for current device info
router.get('/current', async (req, res) => {
  try {
    const deviceInfo = await getDeviceInfo();
    if (!deviceInfo) {
      return res.status(404).json({ error: 'Could not determine current device' });
    }

    const deviceId = `${deviceInfo.name}-${deviceInfo.ipaddress}`;
    let device = deviceManager.devices.get(deviceId);

    if (!device) {
      device = deviceManager.addDevice(deviceInfo);
    }

    res.json(device);
  } catch (error) {
    console.error('Error getting current device:', error);
    res.status(500).json({ error: 'Failed to get current device' });
  }
});

// Get all devices
router.get('/', (req, res) => {
  console.log('GET /api/devices called');
  const devices = deviceManager.getDevices();
  console.log('Returning devices:', devices);
  res.json(devices);
});

// Add new device
router.post('/', (req, res) => {
  try {
    console.log('POST /api/devices received:', {
      body: req.body,
      headers: req.headers
    });
    
    if (!req.body.name || !req.body.ipaddress || !req.body.type) {
      console.log('Invalid device data received');
      return res.status(400).json({ error: 'Missing required device fields' });
    }

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
});

// Delete device
router.delete('/:name/:ip', (req, res) => {
  try {
    const { name, ip } = req.params;
    console.log(`DELETE request received for device: ${name} (${ip})`);
    
    const device = deviceManager.removeDevice(name, ip);
    
    if (!device) {
      console.log(`Device not found: ${name} (${ip})`);
      return res.status(404).json({ error: 'Device not found' });
    }

    // Close any active WebSocket connections for this device
    const deviceId = `${name}-${ip}`;
    const connection = deviceManager.connections.get(deviceId);
    if (connection) {
      connection.close();
      deviceManager.removeConnection(deviceId);
    }

    console.log(`Successfully deleted device: ${name} (${ip})`);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting device:', error);
    res.status(500).json({ error: 'Failed to delete device' });
  }
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

// Update current device receiving status
router.put('/current/receiving', async (req, res) => {
  try {
    const { isReceiving } = req.body;
    console.log(`📡 Receiving status change request: ${isReceiving ? 'ON' : 'OFF'}`);
    
    const deviceInfo = await getDeviceInfo();
    if (!deviceInfo) {
      console.log('❌ Could not determine current device');
      return res.status(404).json({ error: 'Could not determine current device' });
    }

    console.log('📱 Current device info:', deviceInfo);

    const device = deviceManager.updateDeviceReceiving(
      deviceInfo.name,
      deviceInfo.ipaddress,
      isReceiving
    );
    
    if (!device) {
      console.log('❌ Failed to update device receiving status');
      return res.status(500).json({ error: 'Failed to update receiving status' });
    }
    
    console.log('✅ Successfully updated receiving status');
    deviceManager.broadcastDeviceUpdate(device);
    return res.json(device);
  } catch (error) {
    console.error('❌ Error updating receiving status:', error);
    res.status(500).json({ error: 'Failed to update receiving status' });
  }
});

export default router;
