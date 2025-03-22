import { deviceManager } from '../services/DeviceManager.js';

export function setupWebSocketHandlers(wss) {
  wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        
        switch (data.type) {
          case 'register':
            const deviceId = `${data.device.name}-${data.device.ipaddress}`;
            deviceManager.addConnection(deviceId, ws);
            break;

          case 'updateStatus':
            deviceManager.updateDeviceStatus(data.name, data.ipaddress)
              .then(device => {
                if (device) {
                  deviceManager.broadcastDeviceUpdate(device);
                }
              });
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
      // Remove connection from connections map
      for (const [deviceId, connection] of deviceManager.connections) {
        if (connection === ws) {
          deviceManager.removeConnection(deviceId);
          break;
        }
      }
    });
  });
}