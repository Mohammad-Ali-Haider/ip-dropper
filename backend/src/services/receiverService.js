import net from 'net';
import { WebSocket } from 'ws';
import express from 'express';
import { Readable } from 'stream';

const TRANSFER_PORT = 3001;
let server = null;
let expressApp = null;
const downloads = new Map();
let isReceiving = false; // Add receiving state

export function setReceivingState(state) {
  isReceiving = state;
  if (!isReceiving) {
    // Clear all downloads when receiving is disabled
    downloads.clear();
  }
}

export function startReceiver(wss, app) {
  if (!app) {
    console.error('[DEBUG] Express app not provided to startReceiver');
    return;
  }

  expressApp = app;

  if (server) {
    console.log('[DEBUG] Receiver already running');
    return;
  }

  server = net.createServer((socket) => {
    // Check if receiving is enabled before accepting connection
    if (!isReceiving) {
      console.log('[DEBUG] Receiving is disabled, rejecting connection');
      socket.end();
      return;
    }

    console.log('[DEBUG] Client connected for file transfer');
    let fileMetadata = null;
    let dataChunks = [];

    socket.on('data', (data) => {
      try {
        if (!fileMetadata) {
          // Try to parse the metadata from the first chunk
          const metadataStr = data.toString().split('\n')[0];
          try {
            fileMetadata = JSON.parse(metadataStr);
            if (!fileMetadata || !fileMetadata.name) {
              console.error('[DEBUG] Invalid file metadata received');
              return;
            }
          } catch (parseError) {
            console.error('[DEBUG] Error parsing metadata:', parseError);
            return;
          }
          
          // Remove metadata from the first chunk
          const remainingData = Buffer.from(data.slice(metadataStr.length + 1));
          if (remainingData.length > 0) {
            dataChunks.push(remainingData);
          }
        } else {
          dataChunks.push(data);
        }
      } catch (error) {
        console.error('[DEBUG] Error processing received data:', error);
      }
    });

    socket.on('end', () => {
      if (!fileMetadata || !fileMetadata.name || dataChunks.length === 0) {
        console.error('[DEBUG] Missing file metadata or data chunks');
        return;
      }

      try {
        if (!expressApp) {
          throw new Error('Express app not available');
        }

        const completeFileBuffer = Buffer.concat(dataChunks);
        const downloadId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        
        // Store download data
        downloads.set(downloadId, {
          metadata: fileMetadata,
          buffer: completeFileBuffer
        });

        // Set up download route
        expressApp.get(`/download/${downloadId}`, (req, res) => {
          try {
            const downloadData = downloads.get(downloadId);
            if (!downloadData) {
              console.error('[DEBUG] Download data not found for ID:', downloadId);
              return res.status(404).send('Download not found or expired');
            }

            const { metadata, buffer } = downloadData;
            
            res.setHeader('Content-Disposition', `attachment; filename="${metadata.name}"`);
            res.setHeader('Content-Type', metadata.type || 'application/octet-stream');
            res.setHeader('Content-Length', buffer.length);
            
            const stream = new Readable();
            stream.push(buffer);
            stream.push(null);
            stream.pipe(res);
            
            // Clean up after successful download
            setTimeout(() => {
              try {
                // Remove download data
                downloads.delete(downloadId);
                
                // Remove the route
                const routeIndex = expressApp._router.stack.findIndex(
                  (layer) => layer.route && layer.route.path === `/download/${downloadId}`
                );
                if (routeIndex !== -1) {
                  expressApp._router.stack.splice(routeIndex, 1);
                }
              } catch (cleanupError) {
                console.error('[DEBUG] Error cleaning up download:', cleanupError);
              }
            }, 60000); // Clean up after 1 minute
          } catch (responseError) {
            console.error('[DEBUG] Error sending file response:', responseError);
            res.status(500).send('Error processing file download');
          }
        });

        if (wss) {
          const notification = {
            type: 'fileAvailable',
            fileName: fileMetadata.name,
            fileSize: completeFileBuffer.length,
            downloadUrl: `/download/${downloadId}`,
            expiresIn: 60
          };

          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              try {
                client.send(JSON.stringify(notification));
              } catch (wsError) {
                console.error('[DEBUG] Error sending WebSocket notification:', wsError);
              }
            }
          });
        }
      } catch (error) {
        console.error('[DEBUG] Error processing file end:', error);
      } finally {
        dataChunks = [];
        fileMetadata = null;
      }
    });

    socket.on('error', (error) => {
      console.error('[DEBUG] Socket error:', error);
      dataChunks = [];
      fileMetadata = null;
    });
  });

  // Add WebSocket handler for receiving state changes
  if (wss) {
    wss.on('connection', (ws) => {
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          if (data.type === 'receiver') {
            setReceivingState(data.action === 'start');
          }
        } catch (error) {
          console.error('[DEBUG] Error processing WebSocket message:', error);
        }
      });
    });
  }

  server.listen(TRANSFER_PORT, () => {
    console.log(`[DEBUG] File receiver listening on port ${TRANSFER_PORT}`);
  });

  server.on('error', (error) => {
    console.error('[DEBUG] Server error:', error);
  });
}

export function stopReceiver() {
  if (server) {
    server.close();
    server = null;
  }
  downloads.clear();
  expressApp = null;
  isReceiving = false;
}
