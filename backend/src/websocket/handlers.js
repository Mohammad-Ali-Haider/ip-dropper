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
            break;

          case 'updateReceiving':
            deviceManager.updateDeviceReceiving(
              data.name, 
              data.ipaddress, 
              data.isReceiving
            );
            break;

          case 'deviceRemoved':
            const removedDevice = deviceManager.removeDevice(data.name, data.ipaddress);
            if (removedDevice) {
              deviceManager.broadcastDeviceUpdate(removedDevice);
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
