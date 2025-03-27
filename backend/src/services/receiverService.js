import net from 'net';
import { WebSocket } from 'ws';
import fs from 'fs';
import path from 'path';
import os from 'os';

const TRANSFER_PORT = 3001;
const DOWNLOAD_DIR = path.join(os.homedir(), 'Downloads');
console.log('[DEBUG] Files will be saved to:', DOWNLOAD_DIR);
let server = null;

export function startReceiver(wss) {
  if (server) {
    console.log('[DEBUG] Receiver already running');
    return;
  }

  server = net.createServer((socket) => {
    console.log('[DEBUG] Client connected for file transfer');
    let fileMetadata = null;
    let dataBuffer = '';

    socket.on('data', (data) => {
      try {
        if (!fileMetadata) {
          // Accumulate data until we find a newline
          dataBuffer += data.toString();
          const newlineIndex = dataBuffer.indexOf('\n');
          
          if (newlineIndex !== -1) {
            // Extract metadata from buffer
            const metadataStr = dataBuffer.slice(0, newlineIndex);
            fileMetadata = JSON.parse(metadataStr);
            console.log('[DEBUG] Received file metadata:', fileMetadata);

            // Notify clients about incoming file
            broadcastToClients(wss, {
              type: 'fileReceive',
              status: 'initiating',
              fileName: fileMetadata.name,
              size: fileMetadata.size,
              sourceIp: socket.remoteAddress.replace(/^.*:/, '')
            });

            // Remove metadata from buffer
            dataBuffer = dataBuffer.slice(newlineIndex + 1);
          }
        }

        if (fileMetadata && data.length > 0) {
          console.log('[DEBUG] Received file chunk:', data.length, 'bytes');
          // Get the file extension from the original filename
          const fileExtension = path.extname(fileMetadata.name);
          // Create new filename as "testing" with the original extension
          const newFileName = `testing${fileExtension}`;
          // Save the file to Downloads folder with new name
          const filePath = path.join(DOWNLOAD_DIR, newFileName);
          console.log('[DEBUG] Saving file to:', filePath);
          fs.appendFileSync(filePath, data);
        }
      } catch (error) {
        console.error('[DEBUG] Error processing received data:', error);
      }
    });

    socket.on('end', () => {
      console.log('[DEBUG] Transfer completed');
      if (fileMetadata) {
        broadcastToClients(wss, {
          type: 'fileReceive',
          status: 'completed',
          fileName: fileMetadata.name,
          sourceIp: socket.remoteAddress.replace(/^.*:/, '')
        });
      }
    });

    socket.on('error', (error) => {
      console.error('[DEBUG] Socket error:', error);
      if (fileMetadata) {
        broadcastToClients(wss, {
          type: 'fileReceive',
          status: 'failed',
          fileName: fileMetadata.name,
          sourceIp: socket.remoteAddress.replace(/^.*:/, ''),
          error: error.message
        });
      }
    });
  });

  server.listen(TRANSFER_PORT, () => {
    console.log(`[DEBUG] File receiver service listening on port ${TRANSFER_PORT}`);
    broadcastToClients(wss, {
      type: 'receiver',
      status: 'started'
    });
  });

  server.on('error', (err) => {
    console.error('[DEBUG] Server error:', err);
    if (err.code === 'EADDRINUSE') {
      console.log(`[DEBUG] Port ${TRANSFER_PORT} is already in use`);
    }
    broadcastToClients(wss, {
      type: 'receiver',
      status: 'error',
      error: err.message
    });
  });

  return server;
}

export function stopReceiver() {
  if (server) {
    server.close(() => {
      console.log('[DEBUG] Receiver stopped');
      server = null;
    });
  }
}

function broadcastToClients(wss, data) {
  if (!wss) return;
  
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}
