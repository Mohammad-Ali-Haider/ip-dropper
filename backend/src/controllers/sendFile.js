import { WebSocketServer } from 'ws';
import path from 'path';
import fs from 'fs';
import { deviceManager } from '../services/deviceWebSocketManager.js';

export function setupWebSocketServer(server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    const clientIp = req.socket.remoteAddress;
    console.log(`New WebSocket connection from ${clientIp}`);

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        console.log('Received message type:', data.type);
        
        if (data.type === 'device-register') {
          console.log(`Registering device with IP: ${data.ip}`);
          deviceManager.addDevice(data.ip, ws);
          ws.send(JSON.stringify({ type: 'registered', status: 'success' }));
          console.log(`Device ${data.ip} registered successfully`);
          return;
        }
        
        if (data.type === 'file') {
          console.log(`Processing file transfer:
            Name: ${data.name}
            Size: ${data.size} bytes
            Target IP: ${data.targetIp}
          `);
          
          if (!deviceManager.isDeviceConnected(data.targetIp)) {
            console.log(`Target device ${data.targetIp} is offline, storing file`);
            const targetDir = path.join(process.cwd(), 'uploads', data.targetIp);
            await fs.promises.mkdir(targetDir, { recursive: true });
            
            const timestamp = new Date().getTime();
            const fileName = `${timestamp}-${data.name}`;
            const filePath = path.join(targetDir, fileName);
            
            // Fix: Convert ArrayBuffer to Buffer correctly
            const fileBuffer = Buffer.from(new Uint8Array(data.content));
            await fs.promises.writeFile(filePath, fileBuffer);
            
            console.log(`File stored at: ${filePath}`);
            ws.send(JSON.stringify({
              type: 'response',
              status: 'stored',
              message: 'Device offline, file stored for later delivery',
              fileName: data.name,
              targetIp: data.targetIp
            }));
          } else {
            console.log(`Target device ${data.targetIp} is online, forwarding file`);
            await deviceManager.sendToDevice(data.targetIp, {
              type: 'incoming-file',
              name: data.name,
              size: data.size,
              content: data.content
            });
            
            console.log('File forwarded successfully');
            ws.send(JSON.stringify({
              type: 'response',
              status: 'delivered',
              fileName: data.name,
              targetIp: data.targetIp
            }));
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: error.message
        }));
      }
    });

    ws.on('close', () => {
      console.log(`Client ${clientIp} disconnected`);
    });
  });

  return wss;
}

// Keep the existing HTTP endpoint as a fallback
export async function sendFile(req, res) {
  try {
    const { ip } = req.params;
    res.json({
      message: 'Please use WebSocket connection for file transfers',
      timestamp: new Date().toISOString(),
      targetIp: ip,
      status: 'websocket_required'
    });
  } catch (error) {
    console.error('Error in sendFile:', error);
    res.status(500).json({ 
      error: 'Failed to handle request',
      details: error.message 
    });
  }
}
