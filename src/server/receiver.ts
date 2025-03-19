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

  let writeStream: fs.WriteStream | null = null;
  let bytesReceived = 0;
  let expectedSize = 0;
  let currentFile = '';

  ws.on('message', (data: WebSocket.Data, isBinary: boolean) => {
    if (!isBinary) {
      try {
        const message = JSON.parse(data.toString());
        console.log('Received message:', message);

        if (message.type === 'ping') {
          // Respond to ping with pong
          ws.send(JSON.stringify({
            type: 'pong',
            deviceId: message.deviceId
          }));
          return;
        }

        if (message.type === 'metadata' && message.filename && message.size) {
          currentFile = path.basename(message.filename);
          const filePath = path.join(UPLOADS_DIR, currentFile);
          console.log(`\nReceiving file: ${currentFile}`);
          console.log(`Expected size: ${message.size} bytes`);
          writeStream = fs.createWriteStream(filePath);
          expectedSize = message.size;
          bytesReceived = 0;
        } else if (message.type === 'end') {
          console.log('\nReceived end signal');
          writeStream?.end();
          console.log(`Transfer complete! Received ${bytesReceived} bytes`);
        }
      } catch (err) {
        console.error('Error processing message:', err);
      }
    } else if (writeStream && Buffer.isBuffer(data)) {
      bytesReceived += data.length;
      writeStream.write(data);
      const progress = Math.round((bytesReceived / expectedSize) * 100);
      process.stdout.write(`\rProgress: ${progress}% (${bytesReceived}/${expectedSize} bytes)`);
    } else {
      console.error('Received binary data before metadata!');
    }
  });

  ws.on('error', (err: Error) => {
    console.error('WebSocket error:', err);
    writeStream?.destroy();
  });

  ws.on('close', () => {
    console.log(`\nConnection from ${clientIP} closed`);
    writeStream?.end();
  });
});

// Handle server errors
wss.on('error', (error: Error) => {
  console.error('Server error:', error);
});




