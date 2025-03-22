import { deviceManager } from '../services/DeviceManager.js';

export function setupWebSocketHandlers(wss) {
  wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        
        switch (data.type) {
          case 'register':
            const deviceId = `${data.device.name}-${data.device.ipaddress}`;
            deviceManager.addConnection(deviceId, ws);
            // Check status immediately after registration
            const device = await deviceManager.updateDeviceStatus(data.device.name, data.device.ipaddress);
            if (device) {
              deviceManager.broadcastDeviceUpdate(device);
            }
            break;

          case 'updateReceiving':
            const updatedDevice = deviceManager.updateDeviceReceiving(
              data.name, 
              data.ipaddress, 
              data.isReceiving
            );
            if (updatedDevice) {
              // Trigger an immediate status check when receiving status changes
              await deviceManager.updateDeviceStatus(data.name, data.ipaddress);
            }
            break;

          case 'updateStatus':
            const statusDevice = await deviceManager.updateDeviceStatus(data.name, data.ipaddress);
            if (statusDevice) {
              deviceManager.broadcastDeviceUpdate(statusDevice);
            }
            break;

          case 'deviceRemoved':
            const removedDevice = deviceManager.removeDevice(data.name, data.ipaddress);
            if (removedDevice) {
              deviceManager.broadcastDeviceRemoval(removedDevice);
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
      for (const [deviceId, connection] of deviceManager.connections) {
        if (connection === ws) {
          deviceManager.removeConnection(deviceId);
          break;
        }
      }
    });
  });
}
