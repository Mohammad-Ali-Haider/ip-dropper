import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import fs from 'fs';
import path from 'path';
import { networkInterfaces } from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @ts-ignore - Will be used in future implementations
interface FileMetadata {
  type: 'metadata' | 'end';
  filename?: string;
  size?: number;
}

// @ts-ignore - Will be used in future implementations
interface PingMessage {
  type: 'ping';
  deviceId: string;
}

const PORT = 8080;
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Debug information
console.log('Debug Info:');
console.log('- Current directory:', process.cwd());
console.log('- Upload directory:', UPLOADS_DIR);

// Create uploads directory if it doesn't exist
if (!fs.existsSync(UPLOADS_DIR)) {
  console.log('Creating uploads directory...');
  fs.mkdirSync(UPLOADS_DIR);
}

const wss = new WebSocketServer({
  port: PORT,
  host: '0.0.0.0' // Listen on all network interfaces
});

// Show all available network interfaces
console.log('\nAvailable network interfaces:');
const nets = networkInterfaces();
Object.keys(nets).forEach((name) => {
  nets[name]?.forEach((net) => {
    if (net.family === 'IPv4' && !net.internal) {
      console.log(`- ${name}: ${net.address}`);
    }
  });
});

console.log(`\nServer listening on port ${PORT}`);

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
  const clientIP = req.socket.remoteAddress;
  console.log(`\nNew connection from ${clientIP}`);

  ws.on('message', (data: WebSocket.Data) => {
    console.log('Raw message received:', data.toString());
    
    try {
      const message = JSON.parse(data.toString());
      console.log('Parsed message:', message);

      if (message.type === 'ping') {
        console.log('Sending pong response to:', message.deviceId);
        ws.send(JSON.stringify({
          type: 'pong',
          deviceId: message.deviceId
        }));
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket connection error:', error);
  });

  ws.on('close', () => {
    console.log('Client disconnected:', clientIP);
  });
});

// Handle server errors
wss.on('error', (error: Error) => {
  console.error('Server error:', error);
});





